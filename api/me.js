const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret-7d');
    return res.status(200).json({ user: { id: decoded.id, email: decoded.email } });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
