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
      const r = await pool.query('SELECT product_id FROM wishlist WHERE user_id = $1 ORDER BY created_at DESC', [uid]);
      return res.status(200).json({ items: r.rows.map(r => r.product_id) });
    } catch { return res.status(500).json({ error: 'SERVER_ERROR' }); }
  }

  if (req.method === 'POST') {
    const { productId, action } = req.body || {};
    if (!productId) return res.status(400).json({ error: 'MISSING_FIELDS' });
    try {
      if (action === 'remove') {
        await pool.query('DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2', [uid, productId]);
      } else {
        await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [uid, productId]);
      }
      return res.status(200).json({ ok: true });
    } catch { return res.status(500).json({ error: 'SERVER_ERROR' }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
