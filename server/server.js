require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const apiRoutes = require('./routes/api');
const { getDb } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists (local development fallback)
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Silent fail in read-only serverless filesystem
}

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cache control headers for local development and non-static requests
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ========================================================
// Canonical Admin Routes (Enterprise Standard Architecture)
// ========================================================

// 1. Permanent redirect for legacy /admin.html -> /admin
app.get('/admin.html', (req, res) => {
  res.redirect(301, '/admin');
});

// 2. Enterprise Admin Route: Clean URL, Strict Security Headers & Anti-Cache
app.get(['/admin', '/admin/*'], (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

// Static assets options
const staticOptions = {
  etag: false,
  lastModified: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
};

app.use(express.static(path.join(__dirname, '..', 'public'), staticOptions));
app.use('/uploads', express.static(uploadsDir, staticOptions));

// API routes — mounted with and without /api prefix for seamless Vercel serverless compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api', apiRoutes);

// Structured JSON 404 for any unhandled API routes
app.use(['/api', '/api/*'], (req, res) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado' });
});

// SPA fallback — serve index.html for non-API routes with strict no-cache
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && !req.path.startsWith('/products')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Initialize database and start server locally when not running inside Vercel serverless
if (!process.env.VERCEL && require.main === module) {
  (async () => {
    try {
      await getDb();
    } catch (err) {
      console.warn('Local database initialization note:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Eletrotech server running at http://localhost:${PORT}`);
      console.log(`📦 API available at http://localhost:${PORT}/api`);
      console.log(`🛡️ Admin panel (Clean URL) at http://localhost:${PORT}/admin\n`);
    });
  })();
}

module.exports = app;
