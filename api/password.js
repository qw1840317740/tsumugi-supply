const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./_db');

module.exports = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'NOT_AUTHENTICATED' });
  let uid;
  try { uid = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret-7d').id; }
  catch { return res.status(401).json({ error: 'NOT_AUTHENTICATED' }); }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'MISSING_FIELDS' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'SHORT_PASSWORD' });

  try {
    const r = await pool.query('SELECT password_hash FROM users WHERE id = $1', [uid]);
    if (!r.rows.length) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const valid = await bcrypt.compare(currentPassword, r.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'WRONG_PASSWORD' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, uid]);
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'SERVER_ERROR' });
  }
};
