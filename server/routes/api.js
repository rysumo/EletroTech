const express = require('express');
const { supabase } = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ============================
// CATEGORIES
// ============================

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// ============================
// SERVICES
// ============================

// GET /api/services — public
router.get('/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// GET /api/services/all — admin
router.get('/services/all', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching all services:', err);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/services — admin
router.post('/services', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
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
        is_active: d.is_active === false || d.is_active === '0' ? false : true
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'Serviço criado com sucesso', data: data?.[0] });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /api/services/:id — admin
router.put('/services/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const id = parseInt(req.params.id, 10);
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
        is_active: d.is_active === false || d.is_active === '0' ? false : true
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Serviço atualizado com sucesso' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// DELETE /api/services/:id — admin
router.delete('/services/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Erro ao remover serviço' });
  }
});

// ============================
// FAQ
// ============================

// GET /api/faq — public
router.get('/faq', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching FAQ:', err);
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// GET /api/faq/all — admin
router.get('/faq/all', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching all FAQ:', err);
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// POST /api/faq — admin
router.post('/faq', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
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
        is_active: d.is_active === false || d.is_active === '0' ? false : true
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: 'FAQ criada com sucesso', data: data?.[0] });
  } catch (err) {
    console.error('Error creating FAQ:', err);
    res.status(500).json({ error: 'Erro ao criar FAQ' });
  }
});

// PUT /api/faq/:id — admin
router.put('/faq/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const id = parseInt(req.params.id, 10);
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
        is_active: d.is_active === false || d.is_active === '0' ? false : true
      })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'FAQ atualizada com sucesso' });
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ error: 'Erro ao atualizar FAQ' });
  }
});

// DELETE /api/faq/:id — admin
router.delete('/faq/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'FAQ removida com sucesso' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ error: 'Erro ao remover FAQ' });
  }
});

// ============================
// EFFICIENCY STATS
// ============================

// GET /api/stats — public
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('efficiency_stats')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
