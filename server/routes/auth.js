const express = require('express');
const { supabase } = require('../db/supabase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }

    // Support both direct email or username (auto-append domain if needed)
    let email = username.trim();
    let authRes = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authRes.error && !email.includes('@')) {
      // Try with default domain if username was entered without @
      authRes = await supabase.auth.signInWithPassword({
        email: `${email}@eletrotech.com`,
        password,
      });
    }

    if (authRes.error || !authRes.data.session) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = authRes.data.user;
    const token = authRes.data.session.access_token;

    res.json({
      token,
      user: {
        id: user.id,
        username: user.email ? user.email.split('@')[0] : 'admin',
        email: user.email
      }
    });
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
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // In Supabase, password updates can be done using updateUser
    const authHeader = req.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Use user-scoped client or service role to update password
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
