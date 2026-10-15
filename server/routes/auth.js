const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase, isSupabaseConfigured } = require('../db/supabase');
const { getDb, saveDb } = require('../db/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/login — Enterprise login with brute-force rate limiting
router.post('/login', loginRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    const cleanUsername = String(username).trim();

    // 1. Check Supabase Auth if online & configured
    if (isSupabaseConfigured) {
      try {
        let email = cleanUsername;
        let authRes = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authRes.error && !email.includes('@')) {
          authRes = await supabase.auth.signInWithPassword({
            email: `${email}@eletrotech.com`,
            password,
          });
        }

        if (!authRes.error && authRes.data?.session && authRes.data?.user) {
          const user = authRes.data.user;
          const token = authRes.data.session.access_token;

          return res.json({
            token,
            user: {
              id: user.id,
              username: user.email ? user.email.split('@')[0] : cleanUsername,
              email: user.email
            }
          });
        }
      } catch (sbErr) {
        console.warn('Supabase auth attempt failed, testing local database fallback:', sbErr.message);
      }
    }

    // 2. Resilient Fallback: Local SQLite database
    const db = await getDb();
    const result = db.exec("SELECT * FROM admin_users WHERE username = ?", [cleanUsername]);

    if (result.length > 0 && result[0].values.length > 0) {
      const row = result[0].values[0];
      const columns = result[0].columns;
      const user = {};
      columns.forEach((col, i) => { user[col] = row[i]; });

      const isValid = bcrypt.compareSync(password, user.password);
      if (isValid) {
        const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return res.json({
          token,
          user: {
            id: user.id,
            username: user.username,
            email: `${user.username}@eletrotech.com`
          }
        });
      }
    }

    // Uniform opaque security error to prevent account enumeration
    return res.status(401).json({ error: 'Credenciais inválidas' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno ao realizar login' });
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
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // Try Supabase Auth password update if configured
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (!error) {
          return res.json({ message: 'Senha alterada com sucesso' });
        }
      } catch (err) {
        // Fallback to local
      }
    }

    // Local SQLite update
    const db = await getDb();
    const result = db.exec("SELECT * FROM admin_users WHERE id = ? OR username = ?", [req.user.id, req.user.username || 'admin']);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const row = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = row[i]; });

    if (currentPassword && !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.run("UPDATE admin_users SET password = ? WHERE id = ?", [hash, user.id]);
    saveDb();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
