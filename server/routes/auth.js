const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('../db/database');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const db = await getDb();
    const result = db.exec("SELECT * FROM admin_users WHERE username = ?", [username]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/auth/verify
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = await getDb();

    const result = db.exec("SELECT * FROM admin_users WHERE id = ?", [req.user.id]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE admin_users SET password = ? WHERE id = ?", [hash, req.user.id]);
    saveDb();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
