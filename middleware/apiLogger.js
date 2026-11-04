/**
 * API Request & Response Console Logger Middleware
 * Logs incoming HTTP method, URL, query, and request body (with masked secrets).
 * Intercepts and logs outgoing response status, latency, response body, and errors.
 */

const c = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const getStatusColor = (status) => {
  if (status >= 500) return c.red;
  if (status >= 400) return c.yellow;
  if (status >= 300) return c.cyan;
  if (status >= 200) return c.green;
  return c.reset;
};

const sanitize = (val, depth = 0) => {
  if (depth > 4) return '[Object]';
  if (val === null || val === undefined) return val;
  if (Buffer.isBuffer(val)) return `<Buffer ${val.length} bytes>`;
  if (typeof val === 'string') {
    // Truncate large Base64 / data strings
    if (val.length > 250) {
      return `${val.slice(0, 60)}... <truncated, total: ${val.length} chars>`;
    }
    return val;
  }
  if (Array.isArray(val)) {
    if (val.length > 5) {
      const sample = val.slice(0, 3).map(item => sanitize(item, depth + 1));
      return [...sample, `... (+${val.length - 3} more items)`];
    }
    return val.map(item => sanitize(item, depth + 1));
  }
  if (typeof val === 'object') {
    const cleaned = {};
    for (const [key, v] of Object.entries(val)) {
      if (/password|secret|token$/i.test(key) && key !== 'fcmToken') {
        cleaned[key] = '******';
      } else {
        cleaned[key] = sanitize(v, depth + 1);
      }
    }
    return cleaned;
  }
  return val;
};

const apiLogger = (req, res, next) => {
  // Skip verbose asset logging for Swagger UI assets & favicon
  if (req.originalUrl.startsWith('/api-docs') || req.originalUrl === '/favicon.ico') {
    return next();
  }

  const startTime = Date.now();
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // 1. Log incoming API hit
  console.log(`\n${c.dim}[${timestamp}]${c.reset} ${c.cyan}${c.bold}→ ${req.method}${c.reset} ${c.bold}${req.originalUrl}${c.reset}`);

  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`  ${c.gray}Query params:${c.reset}`, req.query);
  }

  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = sanitize(req.body);
    console.log(`  ${c.gray}Request body:${c.reset}`, JSON.stringify(sanitizedBody, null, 2).replace(/\n/g, '\n  '));
  }

  // 2. Intercept response body
  const originalSend = res.send;
  let capturedBody;

  res.send = function (body) {
    capturedBody = body;
    return originalSend.apply(this, arguments);
  };

  // 3. Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusColor = getStatusColor(res.statusCode);
    const isError = res.statusCode >= 400;
    const symbol = isError ? '✖' : '✔';
    const tag = isError ? 'ERROR' : 'RESPONSE';
    const userInfo = req.user ? ` ${c.dim}[${req.user.name} | ${req.user.role}]${c.reset}` : '';

    console.log(
      `${c.dim}[${new Date().toISOString().replace('T', ' ').slice(0, 19)}]${c.reset} ${statusColor}${c.bold}${symbol} ${res.statusCode}${c.reset} ${req.method} ${req.originalUrl}${userInfo} ${c.dim}(${duration}ms)${c.reset}`
    );

    let formattedBody;
    if (typeof capturedBody === 'string') {
      try {
        const parsed = JSON.parse(capturedBody);
        formattedBody = sanitize(parsed);
      } catch {
        formattedBody = capturedBody.length > 250
          ? `${capturedBody.slice(0, 80)}... <truncated ${capturedBody.length} chars>`
          : capturedBody;
      }
    } else if (Buffer.isBuffer(capturedBody)) {
      const mime = res.getHeader('content-type') || 'binary';
      formattedBody = `<Binary ${mime}, ${capturedBody.length} bytes>`;
    } else if (typeof capturedBody === 'object') {
      formattedBody = sanitize(capturedBody);
    }

    if (formattedBody !== undefined) {
      const prefix = isError ? `${c.red}  Error Details:${c.reset}` : `${c.green}  Response Body:${c.reset}`;
      if (typeof formattedBody === 'object') {
        console.log(prefix, JSON.stringify(formattedBody, null, 2).replace(/\n/g, '\n  '));
      } else {
        console.log(prefix, formattedBody);
      }
    }
  });

  next();
};

module.exports = apiLogger;
