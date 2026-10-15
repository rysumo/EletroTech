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
  runMigrations();
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    // Graceful fallback for read-only serverless filesystems (e.g. Vercel Lambda)
  }
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
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try {
    const existingAdmin = db.exec("SELECT id FROM admin_users WHERE username = 'admin'");
    if (existingAdmin.length === 0 || existingAdmin[0].values.length === 0) {
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('admin123', 10);
      db.run("INSERT INTO admin_users (username, password) VALUES (?, ?)", ['admin', hash]);
    }
  } catch (e) {
    console.error('Error seeding admin user into SQLite:', e);
  }
}

function columnExists(table, column) {
  try {
    const res = db.exec(`PRAGMA table_info(${table})`);
    if (!res.length) return false;
    return res[0].values.some(row => row[1] === column);
  } catch {
    return false;
  }
}

function addColumnIfMissing(table, column, definition) {
  if (!columnExists(table, column)) {
    try {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (err) {
      console.warn(`Migration addColumnIfMissing ${table}.${column}:`, err.message);
    }
  }
}

function runMigrations() {
  addColumnIfMissing('categories', 'is_active', 'INTEGER DEFAULT 1');
  addColumnIfMissing('categories', 'created_at', 'DATETIME');
  addColumnIfMissing('categories', 'updated_at', 'DATETIME');
  addColumnIfMissing('services', 'created_at', 'DATETIME');
  addColumnIfMissing('services', 'updated_at', 'DATETIME');
  addColumnIfMissing('faq', 'created_at', 'DATETIME');
  addColumnIfMissing('faq', 'updated_at', 'DATETIME');
  addColumnIfMissing('efficiency_stats', 'is_active', 'INTEGER DEFAULT 1');
  addColumnIfMissing('efficiency_stats', 'created_at', 'DATETIME');
  addColumnIfMissing('efficiency_stats', 'updated_at', 'DATETIME');

  try {
    const defaultSettings = {
      whatsapp_number: '45999241306',
      phone_display: '(45) 99924-1306',
      email: 'contato@eletrotech.com.br',
      instagram_handle: '@eletrotechmarechal',
      instagram_url: 'https://instagram.com/eletrotechmarechal',
      founded_year: '2018',
    };
    Object.entries(defaultSettings).forEach(([key, value]) => {
      const existing = db.exec("SELECT key FROM settings WHERE key = ?", [key]);
      if (existing.length === 0 || existing[0].values.length === 0) {
        db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
      }
    });
  } catch (e) {
    console.warn('Error seeding default settings:', e.message);
  }
}

module.exports = { getDb, saveDb, DB_PATH };
