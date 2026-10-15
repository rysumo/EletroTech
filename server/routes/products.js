const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { supabase, isSupabaseConfigured } = require('../db/supabase');
const { getDb, saveDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Memory storage for serverless compatibility, fallback disk storage for local uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Silent fail in read-only serverless filesystem
}

const upload = multer({
  storage: multer.memoryStorage(),
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

// Helper to format product with flattened category info
function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    category_name_pt: p.categories?.name_pt || p.category_name_pt || null,
    category_name_en: p.categories?.name_en || p.category_name_en || null,
    category_name_es: p.categories?.name_es || p.category_name_es || null,
    category_slug: p.categories?.slug || p.category_slug || null,
  };
}

// Upload buffer to Supabase Storage bucket or local file fallback
async function handleImageUpload(file) {
  if (!file) return null;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
        return urlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase storage upload error:', err.message);
    }
  }

  // Local fallback: save to disk
  try {
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, file.buffer);
    return `/uploads/${fileName}`;
  } catch (err) {
    console.warn('Local disk write error:', err.message);
    return null;
  }
}

// GET /api/products — List all active products (public)
router.get('/', async (req, res) => {
  const { category } = req.query;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories (name_pt, name_en, name_es, slug)')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('sort_order', { ascending: true });

      if (!error && data) {
        let products = data.map(formatProduct);
        if (category) {
          products = products.filter(p => p.category_slug === category);
        }
        return res.json(products);
      }
    } catch (err) {
      console.warn('Supabase products fetch failed, using local SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
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
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/all — List ALL products including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories (name_pt, name_en, name_es, slug)')
        .order('sort_order', { ascending: true });

      if (!error && data) {
        return res.json(data.map(formatProduct));
      }
    } catch (err) {
      console.warn('Supabase admin products fetch failed, using local SQLite:', err.message);
    }
  }

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
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories (name_pt, name_en, name_es, slug)')
        .eq('id', id)
        .single();

      if (!error && data) {
        return res.json(formatProduct(data));
      }
    } catch (err) {
      console.warn('Supabase product single fetch failed, using local SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT p.*, c.name_pt as category_name_pt, c.name_en as category_name_en, c.name_es as category_name_es, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);

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
    const data = req.body;
    let imageUrl = data.image_url || null;

    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    }

    if (isSupabaseConfigured) {
      try {
        const { data: newProd, error } = await supabase
          .from('products')
          .insert([{
            category_id: data.category_id ? parseInt(data.category_id, 10) : null,
            name_pt: data.name_pt || '',
            name_en: data.name_en || '',
            name_es: data.name_es || '',
            description_pt: data.description_pt || '',
            description_en: data.description_en || '',
            description_es: data.description_es || '',
            features_pt: data.features_pt || '',
            features_en: data.features_en || '',
            features_es: data.features_es || '',
            image: imageUrl,
            is_featured: data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true,
            discount_percent: parseInt(data.discount_percent, 10) || 0,
            whatsapp_message_pt: data.whatsapp_message_pt || '',
            whatsapp_message_en: data.whatsapp_message_en || '',
            whatsapp_message_es: data.whatsapp_message_es || '',
            sort_order: parseInt(data.sort_order, 10) || 0,
            is_active: data.is_active === 'false' || data.is_active === '0' || data.is_active === false ? false : true,
          }])
          .select();

        if (!error && newProd) {
          return res.status(201).json({ message: 'Produto criado com sucesso', data: newProd[0] });
        }
      } catch (err) {
        console.warn('Supabase product insert failed, using local SQLite:', err.message);
      }
    }

    // Local SQLite fallback
    const db = await getDb();
    db.run(`INSERT INTO products 
      (category_id, name_pt, name_en, name_es, description_pt, description_en, description_es, features_pt, features_en, features_es, image, is_featured, discount_percent, whatsapp_message_pt, whatsapp_message_en, whatsapp_message_es, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parseInt(data.category_id, 10) || null,
        data.name_pt || '', data.name_en || '', data.name_es || '',
        data.description_pt || '', data.description_en || '', data.description_es || '',
        data.features_pt || '', data.features_en || '', data.features_es || '',
        imageUrl,
        data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true ? 1 : 0,
        parseInt(data.discount_percent, 10) || 0,
        data.whatsapp_message_pt || '', data.whatsapp_message_en || '', data.whatsapp_message_es || '',
        parseInt(data.sort_order, 10) || 0
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
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    let imageUrl = data.existing_image || null;

    if (req.file) {
      imageUrl = await handleImageUpload(req.file);
    }

    if (isSupabaseConfigured) {
      try {
        const updatePayload = {
          category_id: data.category_id ? parseInt(data.category_id, 10) : null,
          name_pt: data.name_pt || '',
          name_en: data.name_en || '',
          name_es: data.name_es || '',
          description_pt: data.description_pt || '',
          description_en: data.description_en || '',
          description_es: data.description_es || '',
          features_pt: data.features_pt || '',
          features_en: data.features_en || '',
          features_es: data.features_es || '',
          is_featured: data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true,
          discount_percent: parseInt(data.discount_percent, 10) || 0,
          whatsapp_message_pt: data.whatsapp_message_pt || '',
          whatsapp_message_en: data.whatsapp_message_en || '',
          whatsapp_message_es: data.whatsapp_message_es || '',
          sort_order: parseInt(data.sort_order, 10) || 0,
          is_active: data.is_active === 'false' || data.is_active === '0' || data.is_active === false ? false : true,
          updated_at: new Date().toISOString()
        };
        if (imageUrl) updatePayload.image = imageUrl;

        const { error } = await supabase.from('products').update(updatePayload).eq('id', id);
        if (!error) {
          return res.json({ message: 'Produto atualizado com sucesso' });
        }
      } catch (err) {
        console.warn('Supabase product update failed, using local SQLite:', err.message);
      }
    }

    // Local SQLite fallback
    const db = await getDb();
    db.run(`UPDATE products SET
      category_id = ?, name_pt = ?, name_en = ?, name_es = ?,
      description_pt = ?, description_en = ?, description_es = ?,
      features_pt = ?, features_en = ?, features_es = ?,
      image = COALESCE(?, image), is_featured = ?, discount_percent = ?,
      whatsapp_message_pt = ?, whatsapp_message_en = ?, whatsapp_message_es = ?,
      sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        parseInt(data.category_id, 10) || null,
        data.name_pt || '', data.name_en || '', data.name_es || '',
        data.description_pt || '', data.description_en || '', data.description_es || '',
        data.features_pt || '', data.features_en || '', data.features_es || '',
        imageUrl,
        data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true ? 1 : 0,
        parseInt(data.discount_percent, 10) || 0,
        data.whatsapp_message_pt || '', data.whatsapp_message_en || '', data.whatsapp_message_es || '',
        parseInt(data.sort_order, 10) || 0,
        data.is_active === 'false' || data.is_active === '0' || data.is_active === false ? 0 : 1,
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
    const id = parseInt(req.params.id, 10);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
          return res.json({ message: 'Produto removido com sucesso' });
        }
      } catch (err) {
        console.warn('Supabase product delete failed, using local SQLite:', err.message);
      }
    }

    const db = await getDb();
    db.run("DELETE FROM products WHERE id = ?", [id]);
    saveDb();
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

module.exports = router;
