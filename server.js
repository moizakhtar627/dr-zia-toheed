require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const { supabase, supabaseAdmin } = require('./supabase-client');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
const PUBLIC_DIR = process.env.VERCEL ? path.join(__dirname, '..') : __dirname;
app.use(express.static(PUBLIC_DIR));

const DB_PATH = path.join(PUBLIC_DIR, "data.db");
const UPLOADS_DIR = path.join(PUBLIC_DIR, "uploads");
const COVERS_DIR = path.join(PUBLIC_DIR, "covers");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);


db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE)`);
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    short_desc TEXT,
    full_desc TEXT,
    category_id INTEGER,
    cover_url TEXT,
    cover_filename TEXT,
    book_type TEXT NOT NULL CHECK(book_type IN ('pdf','online','external')),
    pdf_filename TEXT,
    reading_url TEXT,
    reading_content TEXT,
    is_popular INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    short_desc TEXT,
    image_url TEXT,
    image_filename TEXT,
    original_price REAL DEFAULT 0,
    discounted_price REAL DEFAULT 0,
    takeaway_price REAL DEFAULT 0,
    online_price REAL DEFAULT 0,
    stock_available INTEGER DEFAULT 1,
    is_published INTEGER NOT NULL DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT, expires_at INTEGER)`);
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password_hash TEXT)`);
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPassHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminUser && adminPassHash) {
    db.run('INSERT OR IGNORE INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)', [uuidv4(), adminUser, adminPassHash]);
  }
});

function seedSamples() {
  db.get('SELECT COUNT(*) as c FROM books', (err, row) => {
    if (err || (row && row.c > 0)) return;
    const samples = [
      { title: 'A Study in Scarlet', author: 'Arthur Conan Doyle', short_desc: 'Sample: the first Sherlock Holmes story.', full_desc: 'Public-domain classic detective fiction.', category: 'Classic Literature', book_type: 'external', reading_url: 'https://www.gutenberg.org/files/244/244-h/244-h.htm', is_popular: 1, display_order: 1 },
      { title: 'Pride and Prejudice', author: 'Jane Austen', short_desc: 'Sample: a classic novel of manners.', full_desc: 'Public-domain romantic novel.', category: 'Classic Literature', book_type: 'external', reading_url: 'https://www.gutenberg.org/files/1342/1342-h/1342-h.htm', is_popular: 1, display_order: 2 },
      { title: 'The Adventures of Tom Sawyer', author: 'Mark Twain', short_desc: 'Sample: classic American adventure.', full_desc: 'Public-domain classic.', category: 'Classic Literature', book_type: 'external', reading_url: 'https://www.gutenberg.org/files/74/74-h/74-h.htm', is_popular: 1, display_order: 3 }
    ];
    samples.forEach(s => {
      db.get('INSERT OR IGNORE INTO categories (name) VALUES (?)', [s.category], () => {
        db.get('SELECT id FROM categories WHERE name=?', [s.category], (e, r) => {
          const catId = r ? r.id : null;
          db.run('INSERT INTO books (title, author, short_desc, full_desc, category_id, cover_url, book_type, reading_url, is_popular, is_published, display_order) VALUES (?,?,?,?,?,?,?,?,?,1,?)',
            [s.title, s.author, s.short_desc, s.full_desc, catId, 'medicine-example.svg', s.book_type, s.reading_url, s.is_popular, s.display_order]);
        });
      });
    });
  });
}
seedSamples();

function authRequired(req, res, next) {
  const sid = req.cookies.sid;
  if (sid) {
    db.get('SELECT * FROM sessions WHERE id=? AND expires_at > ?', [sid, Date.now()], (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'Unauthorized' });
      req.user = { id: row.user_id };
      return next();
    });
    return;
  }
  const sb = req.cookies.sb_session;
  if (sb && supabase) {
    supabase.auth.getUser(sb).then(({ data, error }) => {
      if (error || !data?.user) return res.status(401).json({ error: 'Unauthorized' });
      const adminEmail = process.env.SUPABASE_ADMIN_EMAIL;
      if (adminEmail && data.user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      req.user = { id: data.user.id, email: data.user.email };
      next();
    }).catch(() => res.status(401).json({ error: 'Unauthorized' }));
    return;
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

app.post('/api/admin/supabase-login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password || '';
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
  const adminEmail = (process.env.SUPABASE_ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && email !== adminEmail) {
    return res.status(403).json({ error: 'Unauthorized admin account' });
  }
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session) {
      // Log error type/message safely without tokens/passwords
      console.error('Supabase login error:', error?.message || 'no session');
      return res.status(401).json({ error: error?.message || 'Invalid credentials' });
    }
    res.cookie('sb_session', data.session.access_token, { httpOnly: true, sameSite: 'lax', path: '/' });
    res.json({ success: true });
  } catch (e) {
    console.error('Supabase login exception');
    res.status(500).json({ error: 'Login failed' });
  }
});
app.get('/api/admin/me', authRequired, (req, res) => res.json({ user: req.user }));
app.post('/api/admin/logout', (req, res) => {
  const sid = req.cookies.sid;
  if (sid) db.run('DELETE FROM sessions WHERE id=?', [sid]);
  res.clearCookie('sid');
  res.json({ success: true });
});

app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ categories: rows });
  });
});

app.get('/api/books', (req, res) => {
  const { popular, published, category, search, limit, offset } = req.query;
  let sql = 'SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE 1=1';
  const params = [];
  if (popular === '1') { sql += ' AND b.is_popular=1'; }
  if (published === '1') { sql += ' AND b.is_published=1'; }
  if (category) { sql += ' AND b.category_id=?'; params.push(category); }
  if (search) {
    const s = '%' + search + '%';
    sql += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.short_desc LIKE ? OR b.full_desc LIKE ?)';
    params.push(s, s, s, s);
  }
  sql += ' ORDER BY b.display_order ASC, b.created_at DESC';
  if (limit) { sql += ' LIMIT ?'; params.push(parseInt(limit)); }
  if (offset) { sql += ' OFFSET ?'; params.push(parseInt(offset)); }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ books: rows });
  });
});

app.get('/api/books/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total, SUM(CASE WHEN is_published=1 THEN 1 ELSE 0 END) as published, SUM(CASE WHEN is_published=0 THEN 1 ELSE 0 END) as unpublished, SUM(CASE WHEN is_popular=1 THEN 1 ELSE 0 END) as popular FROM books', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { total: 0, published: 0, unpublished: 0, popular: 0 });
  });
});

app.get('/api/admin/stats', authRequired, (req, res) => {
  db.get('SELECT COUNT(*) as total_books, SUM(CASE WHEN is_published=1 THEN 1 ELSE 0 END) as pub_books FROM books', (err, bookRow) => {
    if (err) bookRow = { total_books: 0, pub_books: 0 };
    db.get('SELECT COUNT(*) as total_meds, SUM(CASE WHEN is_published=1 THEN 1 ELSE 0 END) as pub_meds FROM medicines', (err2, medRow) => {
      if (err2) medRow = { total_meds: 0, pub_meds: 0 };
      res.json({ books: { total: bookRow.total_books||0, published: bookRow.pub_books||0 }, medicines: { total: medRow.total_meds||0, published: medRow.pub_meds||0 } });
    });
  });
});

app.get('/api/medicines', (req, res) => {
  const { published } = req.query;
  let sql = 'SELECT * FROM medicines WHERE 1=1';
  const params = [];
  if (published === '1') { sql += ' AND is_published=1'; }
  sql += ' ORDER BY display_order ASC, created_at DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ medicines: rows });
  });
});

const medicineUploadFields = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, COVERS_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname || '.jpg'))
}), limits: { fileSize: 25 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files allowed'));
} }).single('image');

app.post('/api/admin/medicines', authRequired, medicineUploadFields, (req, res) => {
  const { name, short_desc, original_price, discounted_price, takeaway_price, online_price, stock_available, is_published, display_order } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const parseNum = (v) => {
    if (v === undefined || v === null || v === '') return 0;
    const n = Number(v);
    if (isNaN(n) || n < 0) return 0;
    return n;
  };
  let image_url = '';
  let image_filename = null;
  if (req.file) {
    image_filename = req.file.filename;
    image_url = '/covers/' + image_filename;
  }
  db.run('INSERT INTO medicines (name, short_desc, image_url, image_filename, original_price, discounted_price, takeaway_price, online_price, stock_available, is_published, display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [name, short_desc||'', image_url, image_filename, parseNum(original_price), parseNum(discounted_price), parseNum(takeaway_price), parseNum(online_price), stock_available==='0'?0:1, is_published==='0'?0:1, parseNum(display_order)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.put('/api/admin/medicines/:id', authRequired, medicineUploadFields, (req, res) => {
  db.get('SELECT * FROM medicines WHERE id=?', [req.params.id], (err, med) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!med) return res.status(404).json({ error: 'Not found' });
    const { name, short_desc, original_price, discounted_price, takeaway_price, online_price, stock_available, is_published, display_order } = req.body;
    const parseNum = (v, def) => {
      if (v === undefined || v === null || v === '') return def;
      const n = Number(v);
      if (isNaN(n) || n < 0) return def;
      return n;
    };
    let image_url = med.image_url || '';
    let image_filename = med.image_filename || null;
    if (req.file) {
      image_filename = req.file.filename;
      image_url = '/covers/' + image_filename;
    }
    db.run('UPDATE medicines SET name=?, short_desc=?, image_url=?, image_filename=?, original_price=?, discounted_price=?, takeaway_price=?, online_price=?, stock_available=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [name||med.name, short_desc||med.short_desc, image_url, image_filename, parseNum(original_price, med.original_price), parseNum(discounted_price, med.discounted_price), parseNum(takeaway_price, med.takeaway_price), parseNum(online_price, med.online_price), stock_available==='0'?0:(stock_available==='1'?1:med.stock_available), is_published==='0'?0:(is_published==='1'?1:med.is_published), parseNum(display_order, med.display_order), req.params.id],
      function(e) {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ success: true });
      });
  });
});

app.delete('/api/admin/medicines/:id', authRequired, (req, res) => {
  db.run('DELETE FROM medicines WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/admin/medicines/:id/publish', authRequired, (req, res) => {
  const { publish } = req.body;
  db.run('UPDATE medicines SET is_published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [publish?1:0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.get('/api/books/:id', (req, res) => {
  db.get('SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON c.id=b.category_id WHERE b.id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});
const uploadFields = multer({ storage: multer.diskStorage({
  destination: (req, file, cb) => cb(null, file.fieldname === 'pdf' ? UPLOADS_DIR : COVERS_DIR),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname || (file.fieldname === 'pdf' ? '.pdf' : '.jpg')))
}), limits: { fileSize: 25 * 1024 * 1024 } }).fields([{ name: 'cover', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]);

app.post('/api/admin/books', authRequired, uploadFields, (req, res) => {
  const { title, author, short_desc, full_desc, category_id, cover_url, book_type, reading_url, reading_content, is_popular, is_published, display_order } = req.body;
  if (!title || !book_type) return res.status(400).json({ error: 'Title and book_type required' });
  let finalCover = cover_url || '';
  let coverFilename = null;
  if (req.files && req.files.cover && req.files.cover[0]) {
    coverFilename = req.files.cover[0].filename;
    finalCover = '/covers/' + coverFilename;
  }
  let pdfFilename = null;
  if (req.files && req.files.pdf && req.files.pdf[0]) {
    pdfFilename = req.files.pdf[0].filename;
  }
  db.run('INSERT INTO books (title, author, short_desc, full_desc, category_id, cover_url, cover_filename, book_type, pdf_filename, reading_url, reading_content, is_popular, is_published, display_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [title, author||'', short_desc||'', full_desc||'', category_id||null, finalCover, coverFilename, book_type, pdfFilename, reading_url||'', reading_content||'', is_popular==='1'||is_popular===1?1:0, is_published==='1'||is_published===1?1:0, display_order||0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
});

app.put('/api/admin/books/:id', authRequired, uploadFields, (req, res) => {
  db.get('SELECT * FROM books WHERE id=?', [req.params.id], (err, book) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!book) return res.status(404).json({ error: 'Not found' });
    const { title, author, short_desc, full_desc, category_id, cover_url, book_type, reading_url, reading_content, is_popular, is_published, display_order } = req.body;
    let finalCover = cover_url || book.cover_url || '';
    let coverFilename = book.cover_filename || null;
    if (req.files && req.files.cover && req.files.cover[0]) {
      coverFilename = req.files.cover[0].filename;
      finalCover = '/covers/' + coverFilename;
    }
    let pdfFilename = book.pdf_filename || null;
    if (req.files && req.files.pdf && req.files.pdf[0]) {
      pdfFilename = req.files.pdf[0].filename;
    }
    db.run('UPDATE books SET title=?, author=?, short_desc=?, full_desc=?, category_id=?, cover_url=?, cover_filename=?, book_type=?, pdf_filename=?, reading_url=?, reading_content=?, is_popular=?, is_published=?, display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [title||book.title, author||book.author, short_desc||book.short_desc, full_desc||book.full_desc, category_id||book.category_id, finalCover, coverFilename, book_type||book.book_type, pdfFilename, reading_url||book.reading_url, reading_content||book.reading_content, (is_popular==='1'||is_popular===1)?1:0, (is_published==='1'||is_published===1)?1:0, display_order||book.display_order, req.params.id],
      function(e) {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ success: true });
      });
  });
});
app.delete('/api/admin/books/:id', authRequired, (req, res) => {
  db.run('DELETE FROM books WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.post('/api/admin/books/:id/publish', authRequired, (req, res) => {
  const { publish } = req.body;
  db.run('UPDATE books SET is_published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [publish?1:0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.post('/api/admin/books/:id/popular', authRequired, (req, res) => {
  const { popular } = req.body;
  db.run('UPDATE books SET is_popular=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [popular?1:0, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});
app.post('/api/admin/books/:id/order', authRequired, (req, res) => {
  const { delta } = req.body;
  db.get('SELECT display_order FROM books WHERE id=?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(500).json({ error: err.message || 'not found' });
    const newOrder = (row.display_order||0) + (delta||0);
    db.run('UPDATE books SET display_order=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [newOrder, req.params.id], function(e) {
      if (e) return res.status(500).json({ error: e.message });
      res.json({ success: true });
    });
  });
});
app.post('/api/admin/categories', authRequired, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});
app.delete('/api/admin/categories/:id', authRequired, (req, res) => {
  db.run('DELETE FROM categories WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

const isVercel = !!process.env.VERCEL;

if (isVercel) {
  console.log('Running in Vercel serverless mode: app exported, no listen()');
}

module.exports = app;
if (require.main === module && !isVercel) {
  app.listen(PORT, () => {
    console.log('Server running on port', PORT);
  });
} else if (require.main === module && isVercel) {
  console.warn('app.listen() skipped in Vercel serverless environment');
}
