const jwt = require('jsonwebtoken');
const { pool } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, company, email, country, product, quantity, notes } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'MISSING_FIELDS' });

  let userId = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try { userId = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret-7d').id; } catch {}
  }

  try {
    await pool.query(
      'INSERT INTO inquiries (user_id, name, company, email, country, product, quantity, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [userId, name, company||null, email.toLowerCase(), country||null, product||null, quantity||null, notes||null]
    );
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
};
