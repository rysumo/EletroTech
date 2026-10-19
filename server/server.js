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

// Public directory path
const publicPath = path.join(__dirname, '..', 'public');

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

// Helper para resposta Markdown da Home
function getHomeMarkdown() {
  try {
    const llmsPath = path.join(publicPath, 'llms.txt');
    if (fs.existsSync(llmsPath)) {
      return fs.readFileSync(llmsPath, 'utf-8');
    }
  } catch (e) {}
  return `# Eletrotech Marechal — Automação Elétrica & Piscicultura

Soluções completas em automação industrial e sonda inteligente OXILIFE FISH em Marechal Cândido Rondon e região.

- Sobre: https://eletrotech-marechal.vercel.app/about
- Contato: https://eletrotech-marechal.vercel.app/contact
- Privacidade: https://eletrotech-marechal.vercel.app/privacy
- Documentação: https://eletrotech-marechal.vercel.app/docs
- llms.txt: https://eletrotech-marechal.vercel.app/llms.txt
- MCP: https://eletrotech-marechal.vercel.app/.well-known/mcp
`;
}

// Helper para resposta 404 em Markdown
function getNotFoundMarkdown(requestedPath) {
  return `# 404 — Recurso Não Encontrado (Not Found)

O recurso solicitado \`${requestedPath}\` não foi localizado no servidor da Eletrotech Marechal.

## Recursos e Documentação para Agentes de IA:
- [Guia Oficial para Modelos e Agentes (llms.txt)](https://eletrotech-marechal.vercel.app/llms.txt)
- [Manifesto MCP (Model Context Protocol)](https://eletrotech-marechal.vercel.app/.well-known/mcp)
- [Especificação OpenAPI (JSON)](https://eletrotech-marechal.vercel.app/api/openapi.json)
- [Página Inicial](https://eletrotech-marechal.vercel.app/)
- [Sobre a Eletrotech Marechal](https://eletrotech-marechal.vercel.app/about)
- [Canais de Contato e Suporte](https://eletrotech-marechal.vercel.app/contact)
- [Política de Privacidade](https://eletrotech-marechal.vercel.app/privacy)
- [Documentação Técnica](https://eletrotech-marechal.vercel.app/docs)
- [Mapa do Site (sitemap.xml)](https://eletrotech-marechal.vercel.app/sitemap.xml)
`;
}

// Rotas institucionais de confiança e metadados com suporte a clean URLs
const trustPages = {
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/privacy': 'privacy.html',
  '/docs': 'docs.html',
  '/admin': 'admin.html'
};

for (const [routePath, file] of Object.entries(trustPages)) {
  app.get([routePath, `${routePath}.html`], (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.sendFile(path.join(publicPath, file));
  });
}

// Endpoint para /.well-known/mcp
app.get('/.well-known/mcp', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(publicPath, '.well-known', 'mcp'));
});

// Rota raiz com Content Negotiation para Markdown
app.get('/', (req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/markdown')) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.send(getHomeMarkdown());
  }
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  try {
    const homeFile = path.join(publicPath, 'home.html');
    if (fs.existsSync(homeFile)) {
      return res.sendFile(path.resolve(homeFile));
    }
    const indexFile = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      return res.sendFile(path.resolve(indexFile));
    }
  } catch (e) {
    console.error('Error serving home HTML:', e);
  }
  return res.status(404).send('Not Found');
});

// Handler de rotas não encontradas (404) e Fallback SPA
app.use((req, res) => {
  const accept = req.headers.accept || '';
  
  // Se for requisição da API inexistente
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint da API não encontrado', path: req.path });
  }

  // Se o cliente (agente ou usuário) solicitou text/markdown
  if (accept.includes('text/markdown')) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    return res.status(404).send(getNotFoundMarkdown(req.path));
  }

  // Para probes explícitas de 404 ou páginas inexistentes
  if (req.path.includes('404') || req.path.includes('probe') || req.path.includes('not-found')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).sendFile(path.join(publicPath, '404.html'));
  }

  // Fallback 404 padrão para qualquer outra página não mapeada
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(404).sendFile(path.join(publicPath, '404.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

if (!process.env.VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
