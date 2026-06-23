const { pool } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'MISSING_FIELDS' });

  try {
    await pool.query(
      'INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT DO NOTHING',
      [email.toLowerCase()]
    );
    return res.status(201).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
};
