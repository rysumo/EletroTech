// In-memory sliding-window rate limiter for sensitive endpoints (Enterprise brute-force prevention)
const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
  // Extract client IP address supporting proxies / load balancers
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
             req.socket?.remoteAddress ||
             req.ip ||
             'unknown-client';

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15-minute sliding window
  const maxAttempts = 15; // Max 15 attempts per IP per 15 min

  let record = loginAttempts.get(ip);
  if (!record || now - record.startTime > windowMs) {
    record = { count: 0, startTime: now };
    loginAttempts.set(ip, record);
  }

  record.count += 1;

  if (record.count > maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: `Muitas tentativas de login a partir deste endereço. Por favor, aguarde ${Math.ceil(retryAfterSeconds / 60)} minuto(s) antes de tentar novamente.`
    });
  }

  next();
}

module.exports = { loginRateLimiter };
