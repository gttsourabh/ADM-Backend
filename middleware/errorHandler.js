const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || (err.name === 'ValidationError' || err.code === 11000 ? 400 : 500);

  console.error(`\n\x1b[31m[UNHANDLED ERROR]\x1b[0m \x1b[1m${req.method} ${req.originalUrl}\x1b[0m`);
  console.error(`  \x1b[31mError Name:\x1b[0m ${err.name || 'Error'}`);
  console.error(`  \x1b[31mMessage:\x1b[0m    ${err.message}`);

  if (err.stack) {
    const stackLines = err.stack.split('\n').slice(1, 4).map(l => '   ' + l.trim()).join('\n');
    console.error(`  \x1b[90mStack trace:\x1b[0m\n${stackLines}`);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const label = field === 'username' ? 'Employee ID' : field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({ message: `${label} already exists` });
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  const message = status === 500 ? (err.message || 'Internal Server Error') : err.message;
  res.status(status).json({ message });
};

module.exports = errorHandler;
