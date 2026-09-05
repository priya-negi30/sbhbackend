// Sequelize's JSON type is auto-parsed on real MySQL (mysql2 reads the column's
// JSON type flag), but MariaDB stores JSON as a LONGTEXT alias, and SQL Server
// has only minimal native JSON support (stored as NVARCHAR(MAX)), so both can
// return the raw string instead of a parsed value on read. These helpers make
// every JSON-typed field resilient across dialects (and to double-encoded data).
function safeParseJson(raw, fallback) {
  if (raw === null || raw === undefined) return fallback;
  if (typeof raw !== 'string') return raw; // already parsed (real MySQL / driver did it)
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

module.exports = { safeParseJson };
