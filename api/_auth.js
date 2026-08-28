const jwt = require('jsonwebtoken');

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET is not configured');
  return value;
}

function sign(payload, options = { expiresIn: '7d' }) {
  return jwt.sign(payload, secret(), options);
}

function verify(token) {
  return jwt.verify(token, secret());
}

module.exports = { sign, verify };
