// Turns a stored relative path like "/uploads/doctors/x.png" into an absolute URL
function toAbsoluteUrl(req, relativePath) {
  if (!relativePath) return null;
  if (/^https?:\/\//i.test(relativePath)) return relativePath;
  const base = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
}

// Safely parses a field that may arrive as a JSON string (multipart/form-data)
// or already be an array/object (application/json). Falls back to a default.
function parseMaybeJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    // Allow comma-separated strings for convenience, e.g. "English,Hindi"
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
}

module.exports = { toAbsoluteUrl, parseMaybeJson };
