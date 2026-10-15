const jwt = require('jsonwebtoken');
const { supabase } = require('../db/supabase');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET || 'eletrotech-secret-key-change-in-production-2024';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Check Supabase Auth
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (user && !error) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.email ? user.email.split('@')[0] : 'admin'
      };
      return next();
    }
  } catch (err) {
    // Proceed to fallback
  }

  // 2. Fallback to local JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
