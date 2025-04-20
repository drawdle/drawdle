import db from '../../database/db';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const stmt = db.prepare('SELECT data FROM drawing WHERE id = 1');
    const row = stmt.get();
    res.status(200).json({ success: true, data: row ? row.data : "[]" });
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}