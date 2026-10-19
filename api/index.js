const app = require('../server/server');

module.exports = (req, res) => {
  // Preservar caminho original quando roteado pelo Vercel rewrite
  const originalUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
  if (originalUrl && originalUrl !== '/api' && !originalUrl.startsWith('/api/')) {
    req.url = originalUrl;
  }
  return app(req, res);
};
