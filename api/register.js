const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, company } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });
  if (password.length < 6) return res.status(400).json({ error: 'SHORT_PASSWORD' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: 'EMAIL_TAKEN' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, company) VALUES ($1, $2, $3) RETURNING id, email, company',
      [email.toLowerCase(), hash, company || null]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret-7d', { expiresIn: '7d' });
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
};
