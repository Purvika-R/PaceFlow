function notFound(req, res) { res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` }); }
function errorHandler(err, req, res, next) { console.error(err); if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid resource ID' }); if (err.code === 11000) return res.status(409).json({ success: false, message: 'Email already exists' }); res.status(500).json({ success: false, message: 'Internal server error' }); }
module.exports = { notFound, errorHandler };
