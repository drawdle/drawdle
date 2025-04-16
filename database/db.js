const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(process.cwd(), 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.resolve(dbDir, 'drawings.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS drawing (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);

// insert the initial row if it doesn't exist (only one row)
db.prepare("INSERT OR IGNORE INTO drawing (id, data) VALUES (1, '[]')").run();

module.exports = db;