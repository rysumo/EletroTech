const express = require('express');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Memory storage for serverless compatibility
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

// Helper to format product with flattened category info
function formatProduct(p) {
  if (!p) return null;
  return {
    ...p,
    category_name_pt: p.categories?.name_pt || null,
    category_name_en: p.categories?.name_en || null,
    category_name_es: p.categories?.name_es || null,
    category_slug: p.categories?.slug || null,
  };
}

// Upload buffer to Supabase Storage bucket
async function uploadToSupabaseStorage(file) {
  if (!file) return null;
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const fileName = `product-${Date.now()}-${Math.round(Math.random() * 1E6)}${ext}`;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (error) {
    console.warn('Storage upload warning:', error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// GET /api/products — List all active products (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    const { data, error } = await supabase
      .from('products')
      .select('*, categories (name_pt, name_en, name_es, slug)')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error) throw error;

    let products = (data || []).map(formatProduct);

    if (category) {
      products = products.filter(p => p.category_slug === category);
    }

    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/all — List ALL products including inactive (admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories (name_pt, name_en, name_es, slug)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json((data || []).map(formatProduct));
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id — Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories (name_pt, name_en, name_es, slug)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(formatProduct(data));
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /api/products — Create product (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const data = req.body;
    let image = data.image || null;

    if (req.file) {
      const uploadedUrl = await uploadToSupabaseStorage(req.file);
      if (uploadedUrl) image = uploadedUrl;
    }

    const { data: created, error } = await supabase
      .from('products')
      .insert([{
        category_id: parseInt(data.category_id, 10) || null,
        name_pt: data.name_pt || '',
        name_en: data.name_en || '',
        name_es: data.name_es || '',
        description_pt: data.description_pt || '',
        description_en: data.description_en || '',
        description_es: data.description_es || '',
        features_pt: data.features_pt || '',
        features_en: data.features_en || '',
        features_es: data.features_es || '',
        image,
        is_featured: data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true,
        discount_percent: parseInt(data.discount_percent, 10) || 0,
        whatsapp_message_pt: data.whatsapp_message_pt || '',
        whatsapp_message_en: data.whatsapp_message_en || '',
        whatsapp_message_es: data.whatsapp_message_es || '',
        sort_order: parseInt(data.sort_order, 10) || 0,
        is_active: data.is_active === 'false' || data.is_active === '0' || data.is_active === false ? false : true
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Produto criado com sucesso', data: created?.[0] });
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
    let image = data.existing_image || data.image || null;

    if (req.file) {
      const uploadedUrl = await uploadToSupabaseStorage(req.file);
      if (uploadedUrl) image = uploadedUrl;
    }

    const { error } = await supabase
      .from('products')
      .update({
        category_id: parseInt(data.category_id, 10) || null,
        name_pt: data.name_pt || '',
        name_en: data.name_en || '',
        name_es: data.name_es || '',
        description_pt: data.description_pt || '',
        description_en: data.description_en || '',
        description_es: data.description_es || '',
        features_pt: data.features_pt || '',
        features_en: data.features_en || '',
        features_es: data.features_es || '',
        image,
        is_featured: data.is_featured === 'true' || data.is_featured === '1' || data.is_featured === true,
        discount_percent: parseInt(data.discount_percent, 10) || 0,
        whatsapp_message_pt: data.whatsapp_message_pt || '',
        whatsapp_message_en: data.whatsapp_message_en || '',
        whatsapp_message_es: data.whatsapp_message_es || '',
        sort_order: parseInt(data.sort_order, 10) || 0,
        is_active: data.is_active === 'false' || data.is_active === '0' || data.is_active === false ? false : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
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
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Produto removido com sucesso' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Erro ao remover produto' });
  }
});

module.exports = router;
