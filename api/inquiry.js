const authToken = require('./_auth');
const { pool } = require('./_db');

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

async function sendInquiryEmail(inquiry) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured');

  const recipient = process.env.INQUIRY_NOTIFY_TO || 'fanshijun@kaiseisg.com';
  const sender = process.env.INQUIRY_FROM_EMAIL || 'JAPANITEM <info@japanitem.com>';
  const rows = [
    ['Name', inquiry.name],
    ['Company', inquiry.company],
    ['Email', inquiry.email],
    ['Country / Region', inquiry.country],
    ['Product', inquiry.product],
    ['Brand', inquiry.brand],
    ['Quantity', inquiry.quantity],
    ['Notes', inquiry.notes],
  ];
  const text = rows.map(([label, value]) => `${label}: ${value || '-'}`).join('\n');
  const html = rows.map(([label, value]) => (
    `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #eee">${label}</th>` +
    `<td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(value || '-')}</td></tr>`
  )).join('');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: inquiry.email,
      subject: `New wholesale inquiry — ${inquiry.company || inquiry.name}`,
      text,
      html: `<h2>New JAPANITEM wholesale inquiry</h2><table style="border-collapse:collapse">${html}</table>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend rejected inquiry email (${response.status}): ${detail.slice(0, 500)}`);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, company, email, country, product, brand, quantity, notes } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'MISSING_FIELDS' });

  let userId = null;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try { userId = authToken.verify(auth.slice(7)).id; } catch {}
  }

  let client;
  try {
    // Older production databases may predate the brand field. The schema
    // bootstrap in _db runs asynchronously, so ensure this migration has
    // completed before accepting the first inquiry on a cold start.
    await pool.query('ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS brand VARCHAR(255)');
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query(
      'INSERT INTO inquiries (user_id, name, company, email, country, product, brand, quantity, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [userId, name, company||null, email.toLowerCase(), country||null, product||null, brand||null, quantity||null, notes||null]
    );
    await sendInquiryEmail({ name, company, email: email.toLowerCase(), country, product, brand, quantity, notes });
    await client.query('COMMIT');
    return res.status(201).json({ ok: true });
  } catch (error) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch {}
    }
    console.error('Inquiry submission failed:', error);
    return res.status(500).json({ error: 'SERVER_ERROR' });
  } finally {
    if (client) client.release();
  }
};
