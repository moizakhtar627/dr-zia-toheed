const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');
db.all("SELECT sql FROM sqlite_master WHERE type='table'", (e,r)=>{
  if(r){ r.forEach(x=>{ if(x.sql) console.log(x.sql + ';'); }); }
  process.exit(0);
});
