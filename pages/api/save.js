import db from '../../database/db';

export default function handler(req, res) {
  const { data } = req.body;
  if (data == null) {
    return res.status(400).json({ success: false, error: 'No drawing data provided.' });
  }
  const stmt = db.prepare('UPDATE drawing SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1');
  try {
    stmt.run(data);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("DB update error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}