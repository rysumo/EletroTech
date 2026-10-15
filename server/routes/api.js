const express = require('express');
const { supabase, isSupabaseConfigured } = require('../db/supabase');
const { getDb, saveDb } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

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

// ============================
// CATEGORIES
// ============================

const DEFAULT_CATEGORIES = [
  { id: 1, name_pt: 'Sondas e Monitoramento', name_en: 'Probes & Monitoring', name_es: 'Sondas y Monitoreo', slug: 'sondas', icon: '📡', sort_order: 1, is_active: 1 },
  { id: 2, name_pt: 'Painéis e Automação', name_en: 'Panels & Automation', name_es: 'Paneles y Automatización', slug: 'automacao', icon: '⚡', sort_order: 2, is_active: 1 },
  { id: 3, name_pt: 'Motores e Bombas', name_en: 'Motors & Pumps', name_es: 'Motores y Bombas', slug: 'motores', icon: '🔄', sort_order: 3, is_active: 1 },
  { id: 4, name_pt: 'Material Elétrico', name_en: 'Electrical Supplies', name_es: 'Material Eléctrico', slug: 'material-eletrico', icon: '🔌', sort_order: 4, is_active: 1 },
  { id: 5, name_pt: 'Linha Residencial', name_en: 'Residential Line', name_es: 'Línea Residencial', slug: 'residencial', icon: '🏠', sort_order: 5, is_active: 1 },
  { id: 6, name_pt: 'Alarmes e Segurança', name_en: 'Alarms & Security', name_es: 'Alarmas y Seguridad', slug: 'alarmes', icon: '🔔', sort_order: 6, is_active: 1 },
];

// GET /api/categories — active only (public, used for catalog filter tabs)
router.get('/categories', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      let { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      // Fallback 1: If is_active column does not exist in Supabase schema
      if (error) {
        const retry = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      // Fallback 2: If sort_order also fails, select all
      if (error) {
        const retry2 = await supabase
          .from('categories')
          .select('*');
        if (!retry2.error && retry2.data) {
          data = retry2.data;
          error = null;
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        const filtered = data.filter(c => c.is_active !== false && c.is_active !== 0 && c.is_active !== '0');
        return res.json(filtered.length > 0 ? filtered : data);
      }
    } catch (err) {
      console.warn('Supabase categories fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC");
    const rows = resultToObjects(result);
    if (rows && rows.length > 0) return res.json(rows);
  } catch (err) {
    console.warn('SQLite categories fallback error (e.g. serverless without wasm):', err.message);
  }

  res.json(DEFAULT_CATEGORIES);
});

// GET /api/categories/all — including inactive (admin)
router.get('/categories/all', authMiddleware, async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      let { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        const retry = await supabase.from('categories').select('*');
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    } catch (err) {
      console.warn('Supabase all categories fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM categories ORDER BY sort_order ASC");
    const rows = resultToObjects(result);
    if (rows && rows.length > 0) return res.json(rows);
  } catch (err) {
    console.warn('SQLite all categories fallback error:', err.message);
  }

  res.json(DEFAULT_CATEGORIES);
});

// POST /api/categories — admin
router.post('/categories', authMiddleware, async (req, res) => {
  const d = req.body;
  if (!d.name_pt || !d.slug) {
    return res.status(400).json({ error: 'Nome (PT) e slug são obrigatórios' });
  }

  const slug = String(d.slug).trim().toLowerCase();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name_pt: d.name_pt,
          name_en: d.name_en || '',
          name_es: d.name_es || '',
          slug,
          icon: d.icon || '📦',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        }])
        .select();

      if (!error && data) {
        return res.status(201).json({ message: 'Categoria criada com sucesso', data: data[0] });
      }
    } catch (err) {
      console.warn('Supabase create category failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `INSERT INTO categories (name_pt, name_en, name_es, slug, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        d.name_pt,
        d.name_en || '',
        d.name_es || '',
        slug,
        d.icon || '📦',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1
      ]
    );
    saveDb();
    res.status(201).json({ message: 'Categoria criada com sucesso' });
  } catch (err) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Já existe uma categoria com esse slug' });
    }
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// PUT /api/categories/:id — admin
router.put('/categories/:id', authMiddleware, async (req, res) => {
  const d = req.body;
  const id = parseInt(req.params.id, 10);
  const slug = d.slug ? String(d.slug).trim().toLowerCase() : '';

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name_pt: d.name_pt || '',
          name_en: d.name_en || '',
          name_es: d.name_es || '',
          slug,
          icon: d.icon || '📦',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        })
        .eq('id', id);

      if (!error) return res.json({ message: 'Categoria atualizada com sucesso' });
    } catch (err) {
      console.warn('Supabase update category failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `UPDATE categories SET name_pt = ?, name_en = ?, name_es = ?, slug = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        d.name_pt || '',
        d.name_en || '',
        d.name_es || '',
        slug,
        d.icon || '📦',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1,
        id
      ]
    );
    saveDb();
    res.json({ message: 'Categoria atualizada com sucesso' });
  } catch (err) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Já existe uma categoria com esse slug' });
    }
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// DELETE /api/categories/:id — admin
router.delete('/categories/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const db = await getDb();
    const inUse = db.exec("SELECT COUNT(*) as c FROM products WHERE category_id = ?", [id]);
    if (inUse.length > 0 && inUse[0].values.length > 0 && inUse[0].values[0][0] > 0) {
      return res.status(400).json({ error: 'Esta categoria não pode ser excluída pois possui produtos vinculados' });
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (!error) return res.json({ message: 'Categoria removida com sucesso' });
      } catch (err) {
        console.warn('Supabase delete category failed, falling back to SQLite:', err.message);
      }
    }

    db.run("DELETE FROM categories WHERE id = ?", [id]);
    saveDb();
    res.json({ message: 'Categoria removida com sucesso' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Erro ao remover categoria' });
  }
});

// ============================
// SERVICES
// ============================

// GET /api/services — public (active only)
router.get('/services', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('Supabase services fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// GET /api/services/all — admin
router.get('/services/all', authMiddleware, async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('Supabase all services fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM services ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Error fetching all services:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/services — admin
router.post('/services', authMiddleware, async (req, res) => {
  const d = req.body;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          title_pt: d.title_pt || '',
          title_en: d.title_en || '',
          title_es: d.title_es || '',
          description_pt: d.description_pt || '',
          description_en: d.description_en || '',
          description_es: d.description_es || '',
          icon: d.icon || '⚡',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        }])
        .select();

      if (!error && data) {
        return res.status(201).json({ message: 'Serviço criado com sucesso', data: data[0] });
      }
    } catch (err) {
      console.warn('Supabase create service failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `INSERT INTO services (title_pt, title_en, title_es, description_pt, description_en, description_es, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.title_pt || '',
        d.title_en || '',
        d.title_es || '',
        d.description_pt || '',
        d.description_en || '',
        d.description_es || '',
        d.icon || '⚡',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1
      ]
    );
    saveDb();
    res.status(201).json({ message: 'Serviço criado com sucesso' });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /api/services/:id — admin
router.put('/services/:id', authMiddleware, async (req, res) => {
  const d = req.body;
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('services')
        .update({
          title_pt: d.title_pt || '',
          title_en: d.title_en || '',
          title_es: d.title_es || '',
          description_pt: d.description_pt || '',
          description_en: d.description_en || '',
          description_es: d.description_es || '',
          icon: d.icon || '⚡',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        })
        .eq('id', id);

      if (!error) return res.json({ message: 'Serviço atualizado com sucesso' });
    } catch (err) {
      console.warn('Supabase update service failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `UPDATE services SET title_pt = ?, title_en = ?, title_es = ?, description_pt = ?, description_en = ?, description_es = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        d.title_pt || '',
        d.title_en || '',
        d.title_es || '',
        d.description_pt || '',
        d.description_en || '',
        d.description_es || '',
        d.icon || '⚡',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1,
        id
      ]
    );
    saveDb();
    res.json({ message: 'Serviço atualizado com sucesso' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// DELETE /api/services/:id — admin
router.delete('/services/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) return res.json({ message: 'Serviço removido com sucesso' });
    } catch (err) {
      console.warn('Supabase delete service failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run("DELETE FROM services WHERE id = ?", [id]);
    saveDb();
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Erro ao remover serviço' });
  }
});

// ============================
// FAQ
// ============================

// GET /api/faq — public (active only)
router.get('/faq', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('Supabase FAQ fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM faq WHERE is_active = 1 ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Error fetching FAQ:', err);
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// GET /api/faq/all — admin
router.get('/faq/all', authMiddleware, async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data) return res.json(data);
    } catch (err) {
      console.warn('Supabase all FAQ fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM faq ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    console.error('Error fetching all FAQ:', err);
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// POST /api/faq — admin
router.post('/faq', authMiddleware, async (req, res) => {
  const d = req.body;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('faq')
        .insert([{
          question_pt: d.question_pt || '',
          question_en: d.question_en || '',
          question_es: d.question_es || '',
          answer_pt: d.answer_pt || '',
          answer_en: d.answer_en || '',
          answer_es: d.answer_es || '',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        }])
        .select();

      if (!error && data) {
        return res.status(201).json({ message: 'FAQ criada com sucesso', data: data[0] });
      }
    } catch (err) {
      console.warn('Supabase create FAQ failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `INSERT INTO faq (question_pt, question_en, question_es, answer_pt, answer_en, answer_es, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.question_pt || '',
        d.question_en || '',
        d.question_es || '',
        d.answer_pt || '',
        d.answer_en || '',
        d.answer_es || '',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1
      ]
    );
    saveDb();
    res.status(201).json({ message: 'FAQ criada com sucesso' });
  } catch (err) {
    console.error('Error creating FAQ:', err);
    res.status(500).json({ error: 'Erro ao criar FAQ' });
  }
});

// PUT /api/faq/:id — admin
router.put('/faq/:id', authMiddleware, async (req, res) => {
  const d = req.body;
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('faq')
        .update({
          question_pt: d.question_pt || '',
          question_en: d.question_en || '',
          question_es: d.question_es || '',
          answer_pt: d.answer_pt || '',
          answer_en: d.answer_en || '',
          answer_es: d.answer_es || '',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        })
        .eq('id', id);

      if (!error) return res.json({ message: 'FAQ atualizada com sucesso' });
    } catch (err) {
      console.warn('Supabase update FAQ failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `UPDATE faq SET question_pt = ?, question_en = ?, question_es = ?, answer_pt = ?, answer_en = ?, answer_es = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        d.question_pt || '',
        d.question_en || '',
        d.question_es || '',
        d.answer_pt || '',
        d.answer_en || '',
        d.answer_es || '',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1,
        id
      ]
    );
    saveDb();
    res.json({ message: 'FAQ atualizada com sucesso' });
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ error: 'Erro ao atualizar FAQ' });
  }
});

// DELETE /api/faq/:id — admin
router.delete('/faq/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('faq').delete().eq('id', id);
      if (!error) return res.json({ message: 'FAQ removida com sucesso' });
    } catch (err) {
      console.warn('Supabase delete FAQ failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run("DELETE FROM faq WHERE id = ?", [id]);
    saveDb();
    res.json({ message: 'FAQ removida com sucesso' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ error: 'Erro ao remover FAQ' });
  }
});

// ============================
// EFFICIENCY STATS
// ============================

const DEFAULT_STATS = [
  { id: 1, label_pt: 'Economia de Energia', label_en: 'Energy Savings', label_es: 'Ahorro de Energía', value: '40', suffix: '%', icon: '⚡', sort_order: 1, is_active: 1 },
  { id: 2, label_pt: 'Redução na Mortalidade', label_en: 'Mortality Reduction', label_es: 'Reducción de Mortalidad', value: '90', suffix: '%', icon: '🐟', sort_order: 2, is_active: 1 },
  { id: 3, label_pt: 'Clientes Atendidos', label_en: 'Clients Served', label_es: 'Clientes Atendidos', value: '200', suffix: '+', icon: '👥', sort_order: 3, is_active: 1 },
  { id: 4, label_pt: 'Anos de Experiência', label_en: 'Years of Experience', label_es: 'Años de Experiencia', value: '8', suffix: '+', icon: '🏆', sort_order: 4, is_active: 1 },
];

// GET /api/stats — public (active only)
router.get('/stats', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      let { data, error } = await supabase
        .from('efficiency_stats')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        const retry = await supabase
          .from('efficiency_stats')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        const retry2 = await supabase.from('efficiency_stats').select('*');
        if (!retry2.error && retry2.data) {
          data = retry2.data;
          error = null;
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        const filtered = data.filter(s => s.is_active !== false && s.is_active !== 0 && s.is_active !== '0');
        return res.json(filtered.length > 0 ? filtered : data);
      }
    } catch (err) {
      console.warn('Supabase stats fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM efficiency_stats WHERE is_active = 1 ORDER BY sort_order ASC");
    const rows = resultToObjects(result);
    if (rows && rows.length > 0) return res.json(rows);
  } catch (err) {
    console.warn('SQLite stats fallback error:', err.message);
  }

  res.json(DEFAULT_STATS);
});

// GET /api/stats/all — admin
router.get('/stats/all', authMiddleware, async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      let { data, error } = await supabase
        .from('efficiency_stats')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        const retry = await supabase.from('efficiency_stats').select('*');
        if (!retry.error && retry.data) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        return res.json(data);
      }
    } catch (err) {
      console.warn('Supabase all stats fetch failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM efficiency_stats ORDER BY sort_order ASC");
    const rows = resultToObjects(result);
    if (rows && rows.length > 0) return res.json(rows);
  } catch (err) {
    console.warn('SQLite all stats fallback error:', err.message);
  }

  res.json(DEFAULT_STATS);
});

// POST /api/stats — admin
router.post('/stats', authMiddleware, async (req, res) => {
  const d = req.body;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('efficiency_stats')
        .insert([{
          label_pt: d.label_pt || '',
          label_en: d.label_en || '',
          label_es: d.label_es || '',
          value: d.value || '0',
          suffix: d.suffix || '%',
          icon: d.icon || '📊',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        }])
        .select();

      if (!error && data) {
        return res.status(201).json({ message: 'Estatística criada com sucesso', data: data[0] });
      }
    } catch (err) {
      console.warn('Supabase create stat failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `INSERT INTO efficiency_stats (label_pt, label_en, label_es, value, suffix, icon, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.label_pt || '',
        d.label_en || '',
        d.label_es || '',
        d.value || '0',
        d.suffix || '%',
        d.icon || '📊',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1
      ]
    );
    saveDb();
    res.status(201).json({ message: 'Estatística criada com sucesso' });
  } catch (err) {
    console.error('Error creating stat:', err);
    res.status(500).json({ error: 'Erro ao criar estatística' });
  }
});

// PUT /api/stats/:id — admin
router.put('/stats/:id', authMiddleware, async (req, res) => {
  const d = req.body;
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('efficiency_stats')
        .update({
          label_pt: d.label_pt || '',
          label_en: d.label_en || '',
          label_es: d.label_es || '',
          value: d.value || '0',
          suffix: d.suffix || '%',
          icon: d.icon || '📊',
          sort_order: parseInt(d.sort_order, 10) || 0,
          is_active: d.is_active === false || d.is_active === '0' || d.is_active === 0 ? false : true
        })
        .eq('id', id);

      if (!error) return res.json({ message: 'Estatística atualizada com sucesso' });
    } catch (err) {
      console.warn('Supabase update stat failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run(
      `UPDATE efficiency_stats SET label_pt = ?, label_en = ?, label_es = ?, value = ?, suffix = ?, icon = ?, sort_order = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        d.label_pt || '',
        d.label_en || '',
        d.label_es || '',
        d.value || '0',
        d.suffix || '%',
        d.icon || '📊',
        parseInt(d.sort_order, 10) || 0,
        d.is_active === false || d.is_active === '0' || d.is_active === 0 ? 0 : 1,
        id
      ]
    );
    saveDb();
    res.json({ message: 'Estatística atualizada com sucesso' });
  } catch (err) {
    console.error('Error updating stat:', err);
    res.status(500).json({ error: 'Erro ao atualizar estatística' });
  }
});

// DELETE /api/stats/:id — admin
router.delete('/stats/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('efficiency_stats').delete().eq('id', id);
      if (!error) return res.json({ message: 'Estatística removida com sucesso' });
    } catch (err) {
      console.warn('Supabase delete stat failed, falling back to SQLite:', err.message);
    }
  }

  try {
    const db = await getDb();
    db.run("DELETE FROM efficiency_stats WHERE id = ?", [id]);
    saveDb();
    res.json({ message: 'Estatística removida com sucesso' });
  } catch (err) {
    console.error('Error deleting stat:', err);
    res.status(500).json({ error: 'Erro ao remover estatística' });
  }
});

// ============================
// SITE SETTINGS
// ============================

const SETTINGS_DEFAULTS = {
  whatsapp_number: '45999241306',
  phone_display: '(45) 99924-1306',
  email: 'contato@eletrotech.com.br',
  instagram_handle: '@eletrotechmarechal',
  instagram_url: 'https://instagram.com/eletrotechmarechal',
  founded_year: '2018',
};

// GET /api/settings — public (site needs these values to render contact links)
router.get('/settings', async (req, res) => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (!error && Array.isArray(data) && data.length > 0) {
        const settings = { ...SETTINGS_DEFAULTS };
        data.forEach(item => {
          if (item.key) settings[item.key] = item.value;
        });
        return res.json(settings);
      }
    } catch (err) {
      console.warn('Supabase settings fetch failed, falling back:', err.message);
    }
  }

  try {
    const db = await getDb();
    const result = db.exec("SELECT key, value FROM settings");
    const settings = { ...SETTINGS_DEFAULTS };
    if (result.length > 0 && result[0].values.length > 0) {
      result[0].values.forEach(([key, value]) => { settings[key] = value; });
    }
    return res.json(settings);
  } catch (err) {
    console.warn('Get settings SQLite fallback (e.g. serverless without wasm):', err.message);
  }

  res.json(SETTINGS_DEFAULTS);
});

// PUT /api/settings — admin (bulk upsert; body is a { key: value, ... } object)
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const entries = Object.entries(req.body || {});

    for (const [key, value] of entries) {
      db.run(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
    saveDb();
    res.json({ message: 'Configurações atualizadas com sucesso' });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
});

module.exports = router;
