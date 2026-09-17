const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb, saveDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for product image uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (JPEG, PNG, WebP, GIF) são permitidas'));
    }
  }
});

// Helper to convert sql.js result to array of objects
function resultToObjects(result) {
  if (!result || result.length === 0 || result[0].values.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// GET /api/products — List all active products (public)
router.get('/', async (req, res) => {
  try {
    const db = await getDb();
    const { category } = req.query;

    let query = `
      SELECT p.*, c.name_pt as category_name_pt, c.name_en as category_name_en, c.name_es as category_name_es, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    query += ' ORDER BY p.is_featured DESC, p.sort_order ASC';

    const result = db.exec(query, params);
    const products = resultToObjects(result);

    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/all — List ALL products including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.*, c.name_pt as category_name_pt, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.sort_order ASC
    `);
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id — Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.*, c.name_pt as category_name_pt, c.name_en as category_name_en, c.name_es as category_name_es, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [parseInt(req.params.id)]);

    const products = resultToObjects(result);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(products[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /api/products — Create product (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const db = await getDb();
    const data = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : null;

    db.run(`INSERT INTO products 
      (category_id, name_pt, name_en, name_es, description_pt, description_en, description_es, features_pt, features_en, features_es, image, is_featured, discount_percent, whatsapp_message_pt, whatsapp_message_en, whatsapp_message_es, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(data.category_id) || null,
        data.name_pt || '', data.name_en || '', data.name_es || '',
        data.description_pt || '', data.description_en || '', data.description_es || '',
        data.features_pt || '', data.features_en || '', data.features_es || '',
        image,
        data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0,
        parseInt(data.discount_percent) || 0,
        data.whatsapp_message_pt || '', data.whatsapp_message_en || '', data.whatsapp_message_es || '',
        parseInt(data.sort_order) || 0
      ]
    );
    saveDb();

    res.status(201).json({ message: 'Produto criado com sucesso' });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// PUT /api/products/:id — Update product (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const db = await getDb();
    const data = req.body;
    const id = parseInt(req.params.id);

    let image = data.existing_image || null;
    if (req.file) {
      image = '/uploads/' + req.file.filename;
    }

    db.run(`UPDATE products SET
      category_id = ?, name_pt = ?, name_en = ?, name_es = ?,
      description_pt = ?, description_en = ?, description_es = ?,
      features_pt = ?, features_en = ?, features_es = ?,
      image = ?, is_featured = ?, discount_percent = ?,
      whatsapp_message_pt = ?, whatsapp_message_en = ?, whatsapp_message_es = ?,
      sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        parseInt(data.category_id) || null,
        data.name_pt || '', data.name_en || '', data.name_es || '',
        data.description_pt || '', data.description_en || '', data.description_es || '',
        data.features_pt || '', data.features_en || '', data.features_es || '',
        image,
        data.is_featured === 'true' || data.is_featured === '1' ? 1 : 0,
        parseInt(data.discount_percent) || 0,
        data.whatsapp_message_pt || '', data.whatsapp_message_en || '', data.whatsapp_message_es || '',
        parseInt(data.sort_order) || 0,
        data.is_active === 'false' || data.is_active === '0' ? 0 : 1,
        id
      ]
    );
    saveDb();

    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// DELETE /api/products/:id — Delete product (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    db.run("DELETE FROM products WHERE id = ?", [parseInt(req.params.id)]);
    saveDb();
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

module.exports = router;
