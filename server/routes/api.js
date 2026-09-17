const express = require('express');
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

// GET /api/categories
router.get('/categories', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM categories ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// ============================
// SERVICES
// ============================

// GET /api/services — public
router.get('/services', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM services WHERE is_active = 1 ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// GET /api/services/all — admin
router.get('/services/all', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM services ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/services — admin
router.post('/services', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    db.run(`INSERT INTO services (title_pt, title_en, title_es, description_pt, description_en, description_es, icon, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.title_pt || '', d.title_en || '', d.title_es || '', d.description_pt || '', d.description_en || '', d.description_es || '', d.icon || '⚡', parseInt(d.sort_order) || 0]
    );
    saveDb();
    res.status(201).json({ message: 'Serviço criado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar serviço' });
  }
});

// PUT /api/services/:id — admin
router.put('/services/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    db.run(`UPDATE services SET title_pt = ?, title_en = ?, title_es = ?, description_pt = ?, description_en = ?, description_es = ?, icon = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [d.title_pt || '', d.title_en || '', d.title_es || '', d.description_pt || '', d.description_en || '', d.description_es || '', d.icon || '⚡', parseInt(d.sort_order) || 0, d.is_active === false || d.is_active === '0' ? 0 : 1, parseInt(req.params.id)]
    );
    saveDb();
    res.json({ message: 'Serviço atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// DELETE /api/services/:id — admin
router.delete('/services/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    db.run("DELETE FROM services WHERE id = ?", [parseInt(req.params.id)]);
    saveDb();
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover serviço' });
  }
});

// ============================
// FAQ
// ============================

// GET /api/faq — public
router.get('/faq', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM faq WHERE is_active = 1 ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// GET /api/faq/all — admin
router.get('/faq/all', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM faq ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar FAQ' });
  }
});

// POST /api/faq — admin
router.post('/faq', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    db.run(`INSERT INTO faq (question_pt, question_en, question_es, answer_pt, answer_en, answer_es, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [d.question_pt || '', d.question_en || '', d.question_es || '', d.answer_pt || '', d.answer_en || '', d.answer_es || '', parseInt(d.sort_order) || 0]
    );
    saveDb();
    res.status(201).json({ message: 'FAQ criada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar FAQ' });
  }
});

// PUT /api/faq/:id — admin
router.put('/faq/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    db.run(`UPDATE faq SET question_pt = ?, question_en = ?, question_es = ?, answer_pt = ?, answer_en = ?, answer_es = ?, sort_order = ?, is_active = ? WHERE id = ?`,
      [d.question_pt || '', d.question_en || '', d.question_es || '', d.answer_pt || '', d.answer_en || '', d.answer_es || '', parseInt(d.sort_order) || 0, d.is_active === false || d.is_active === '0' ? 0 : 1, parseInt(req.params.id)]
    );
    saveDb();
    res.json({ message: 'FAQ atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar FAQ' });
  }
});

// DELETE /api/faq/:id — admin
router.delete('/faq/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    db.run("DELETE FROM faq WHERE id = ?", [parseInt(req.params.id)]);
    saveDb();
    res.json({ message: 'FAQ removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover FAQ' });
  }
});

// ============================
// EFFICIENCY STATS
// ============================

// GET /api/stats — public
router.get('/stats', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM efficiency_stats ORDER BY sort_order ASC");
    res.json(resultToObjects(result));
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router;
