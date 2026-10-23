# Books Section + Owner Admin Panel — Setup

This project stays plain HTML/CSS/JS for the public site and adds a small
Node.js + Express + SQLite backend so the Books library and the owner-only
Admin Panel have real, persistent, authenticated storage.

## Requirements
- Node.js 18+ (tested on Node 24)

## Install
```
npm install
```

## Configure (create a `.env` file — copy `.env.example`)
```
ADMIN_USERNAME=your_owner_username
ADMIN_PASSWORD_HASH=<bcrypt hash of your password>
SESSION_SECRET=some_long_random_string
PORT=3000
```

Generate a password hash (never store plain text):
```
node -e "require('bcrypt').hash('YOUR_PASSWORD',12).then(h=>console.log(h))"
```

## Run
```
npm start
```
Then visit:
- Public site:   http://localhost:3000/
- Books page:    http://localhost:3000/books.html
- Reader:        http://localhost:3000/read-book.html?id=1
- Admin panel:   http://localhost:3000/admin.html

## Data
- Stored in `data.db` (SQLite) created on first run.
- Cover uploads -> `covers/`, PDF uploads -> `uploads/`.
- Three public-domain sample books are seeded on first run. Replace them from the admin panel.

## Security
- Passwords stored only as bcrypt hashes.
- Login issues an httpOnly session cookie stored in the `sessions` table.
- All admin write operations require a valid server-side session (`authRequired`).
- Uploads are limited to images (covers) and PDFs up to 25MB.
- `data.db`, `.env`, uploads and covers are git-ignored.
