const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with strict no-cache in local development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', apiRoutes);

// SPA fallback — serve index.html for non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
async function start() {
  // Initialize database
  const { getDb } = require('./db/database');
  await getDb();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 Eletrotech server running at http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
    console.log(`🔧 Admin panel at http://localhost:${PORT}/admin.html\n`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
