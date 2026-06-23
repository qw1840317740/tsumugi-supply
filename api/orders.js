const jwt = require('jsonwebtoken');
const { pool } = require('./_db');

function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret-7d').id; }
  catch { return null; }
}

module.exports = async (req, res) => {
  const uid = getUserId(req);
  if (!uid) return res.status(401).json({ error: 'NOT_AUTHENTICATED' });

  if (req.method === 'GET') {
    try {
      const r = await pool.query('SELECT id, items, total_jpy, currency, status, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50', [uid]);
      return res.status(200).json({ orders: r.rows });
    } catch { return res.status(500).json({ error: 'SERVER_ERROR' }); }
  }

  if (req.method === 'POST') {
    const { items, total_jpy, currency } = req.body || {};
    if (!items || !Array.isArray(items) || !items.length) return res.status(400).json({ error: 'EMPTY_CART' });
    try {
      const r = await pool.query(
        'INSERT INTO orders (user_id, items, total_jpy, currency) VALUES ($1, $2, $3, $4) RETURNING id, created_at',
        [uid, JSON.stringify(items), total_jpy || 0, currency || 'JPY']
      );
      return res.status(201).json({ order: r.rows[0] });
    } catch { return res.status(500).json({ error: 'SERVER_ERROR' }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
