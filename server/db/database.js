const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'eletrotech.db');

let db = null;
let SQL = null;

async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initTables();
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_pt TEXT NOT NULL,
      name_en TEXT,
      name_es TEXT,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name_pt TEXT NOT NULL,
      name_en TEXT,
      name_es TEXT,
      description_pt TEXT,
      description_en TEXT,
      description_es TEXT,
      features_pt TEXT,
      features_en TEXT,
      features_es TEXT,
      image TEXT,
      is_featured INTEGER DEFAULT 0,
      discount_percent INTEGER DEFAULT 0,
      whatsapp_message_pt TEXT,
      whatsapp_message_en TEXT,
      whatsapp_message_es TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_pt TEXT NOT NULL,
      title_en TEXT,
      title_es TEXT,
      description_pt TEXT,
      description_en TEXT,
      description_es TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_pt TEXT NOT NULL,
      question_en TEXT,
      question_es TEXT,
      answer_pt TEXT NOT NULL,
      answer_en TEXT,
      answer_es TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS efficiency_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label_pt TEXT NOT NULL,
      label_en TEXT,
      label_es TEXT,
      value TEXT NOT NULL,
      suffix TEXT DEFAULT '%',
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )
  `);
}

module.exports = { getDb, saveDb, DB_PATH };
