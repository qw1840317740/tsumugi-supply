const authToken = require('./_auth');
const { pool } = require('./_db');

module.exports = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = authToken.verify(auth.slice(7));
    const r = await pool.query('SELECT id, email, company, customer_code FROM users WHERE id = $1', [decoded.id]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid or expired token' });
    const u = r.rows[0];
    return res.status(200).json({ user: { id: u.id, email: u.email, company: u.company, customer_code: u.customer_code } });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
