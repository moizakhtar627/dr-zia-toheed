let currentUser = null;

async function checkAuth() {
  try {
    const res = await fetch('/api/admin/me');
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      document.getElementById('loginModal').style.display = 'none';
      return true;
    }
  } catch (e) {}
  document.getElementById('loginModal').style.display = 'flex';
  return false;
}

async function initAdmin() {
  const authed = await checkAuth();
  if (!authed) {
    document.getElementById('loginForm').addEventListener('submit', async e => {
      e.preventDefault();
      const user = document.getElementById('loginUser').value;
      const pass = document.getElementById('loginPass').value;
      try {
        const res = await fetch('/api/admin/supabase-login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user, password: pass })
        });
        let data = {};
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          data = { error: text.replace(/<[^>]*>/g, '').trim().substring(0, 200) || 'Login failed' };
        }
        if (res.ok) {
          location.reload();
        } else {
          document.getElementById('loginMsg').textContent = data.error || 'Login failed';
        }
      } catch (err) {
        document.getElementById('loginMsg').textContent = 'Login request failed';
      }
    });
    return;
  }
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    document.cookie = 'sb_session=; Max-Age=0; path=/';
    location.reload();
  });
  setupTabs();
  loadDashboard();
  loadBooksTable();
  loadMedicinesTable();
  loadCategories();
  setupBookForm();
  setupMedicineForm();
}

function setupTabs() {
  document.querySelectorAll('.admin-sidebar a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const tab = a.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab').forEach(t => t.hidden = true);
      document.getElementById('tab-' + tab).hidden = false;
    });
  });
  // Default to dashboard
  document.querySelectorAll('.admin-tab').forEach(t => t.hidden = true);
  document.getElementById('tab-dashboard').hidden = false;
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/books/stats');
    if (res.ok) {
      const s = await res.json();
      document.getElementById('stat-total-books').textContent = s.total ?? 0;
      document.getElementById('stat-pub-books').textContent = s.published ?? 0;
    }
    const mres = await fetch('/api/medicines');
    if (mres.ok) {
      const md = await mres.json();
      const meds = md.medicines || [];
      document.getElementById('stat-total-meds').textContent = meds.length;
      document.getElementById('stat-pub-meds').textContent = meds.filter(x=>x.is_published==1).length;
    }
  } catch(e){}
}

async function loadBooksTable() {
  const res = await fetch('/api/books?limit=1000');
  const data = await res.json();
  const tbody = document.getElementById('booksTable');
  tbody.innerHTML = (data.books||[]).map(b => `
    <tr>
      <td>${escapeHtml(b.title)}</td>
      <td>${escapeHtml(b.author||'')}</td>
      <td>${b.is_published ? 'Published' : 'Draft'}</td>
      <td>${b.is_popular ? 'Yes' : 'No'}</td>
      <td>${b.display_order}</td>
      <td>
        <button class="small" data-edit-book="${b.id}">Edit</button>
        <button class="small" data-toggle-pub-book="${b.id}" data-pub="${b.is_published?0:1}">${b.is_published?'Unpublish':'Publish'}</button>
        <button class="small" data-del-book="${b.id}" style="color:#d33">Delete</button>
      </td>
    </tr>
  `).join('');
  tbody.querySelectorAll('button').forEach(btn => {
    if (btn.dataset.editBook) btn.addEventListener('click', () => editBook(btn.dataset.editBook));
    if (btn.dataset.togglePubBook) btn.addEventListener('click', async () => {
      await fetch('/api/admin/books/' + btn.dataset.togglePubBook + '/publish', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ publish: btn.dataset.pub == '1' }) });
      loadBooksTable(); loadDashboard();
    });
    if (btn.dataset.delBook) btn.addEventListener('click', async () => {
      if (!confirm('Delete this book?')) return;
      await fetch('/api/admin/books/' + btn.dataset.delBook, { method: 'DELETE' });
      loadBooksTable(); loadDashboard();
    });
  });
}

async function loadMedicinesTable() {
  const res = await fetch('/api/medicines');
  const data = await res.json();
  const tbody = document.getElementById('medicinesTable');
  tbody.innerHTML = (data.medicines||[]).map(m => `
    <tr>
      <td>${escapeHtml(m.name)}</td>
      <td>Rs. ${Number(m.original_price||0).toFixed(2)} / ${Number(m.discounted_price||0).toFixed(2)} / ${Number(m.takeaway_price||0).toFixed(2)} / ${Number(m.online_price||0).toFixed(2)}</td>
      <td>${m.stock_available==1?'In Stock':'Out of Stock'}</td>
      <td>${m.is_published==1?'Published':'Unpublished'}</td>
      <td>${m.display_order||0}</td>
      <td>
        <button class="small" data-edit-med="${m.id}">Edit</button>
        <button class="small" data-toggle-pub-med="${m.id}" data-pub="${m.is_published==1?0:1}">${m.is_published==1?'Unpublish':'Publish'}</button>
        <button class="small" data-del-med="${m.id}" style="color:#d33">Delete</button>
      </td>
    </tr>
  `).join('');
  tbody.querySelectorAll('button').forEach(btn => {
    if (btn.dataset.editMed) btn.addEventListener('click', () => editMedicine(btn.dataset.editMed));
    if (btn.dataset.togglePubMed) btn.addEventListener('click', async () => {
      await fetch('/api/admin/medicines/' + btn.dataset.togglePubMed + '/publish', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ publish: btn.dataset.pub == '1' }) });
      loadMedicinesTable(); loadDashboard();
    });
    if (btn.dataset.delMed) btn.addEventListener('click', async () => {
      if (!confirm('Delete this medicine?')) return;
      await fetch('/api/admin/medicines/' + btn.dataset.delMed, { method: 'DELETE' });
      loadMedicinesTable(); loadDashboard();
    });
  });
}

function escapeHtml(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }

async function loadCategories() {
  const res = await fetch('/api/categories');
  const data = await res.json();
  const sel = document.getElementById('category_id');
  sel.innerHTML = '<option value="">None</option>' + (data.categories||[]).map(c=>`<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  const tb = document.getElementById('catsTable');
  tb.innerHTML = (data.categories||[]).map(c=>`
    <tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td><button class="small" data-delcat="${c.id}">Delete</button></td></tr>
  `).join('');
  tb.querySelectorAll('button').forEach(b=>{
    if (b.dataset.delcat) b.addEventListener('click', async ()=>{
      if (!confirm('Delete category?')) return;
      await fetch('/api/admin/categories/'+b.dataset.delcat, {method:'DELETE'});
      loadCategories();
    });
  });
}

document.getElementById('catForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const name = document.getElementById('catName').value;
  await fetch('/api/admin/categories', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name})});
  document.getElementById('catName').value='';
  loadCategories();
});

function setupBookForm() {
  const form = document.getElementById('bookForm');
  const bookType = document.getElementById('book_type');
  const pdfF = document.getElementById('pdfFields');
  const extF = document.getElementById('extFields');
  const onlineF = document.getElementById('onlineFields');
  function toggle() {
    pdfF.hidden = bookType.value !== 'pdf';
    extF.hidden = bookType.value !== 'external';
    onlineF.hidden = bookType.value !== 'online';
  }
  bookType.addEventListener('change', toggle);
  toggle();
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const fd = new FormData();
    fd.append('title', document.getElementById('title').value);
    fd.append('author', document.getElementById('author').value);
    fd.append('short_desc', document.getElementById('short_desc').value);
    fd.append('full_desc', document.getElementById('full_desc').value);
    fd.append('category_id', document.getElementById('category_id').value||'');
    fd.append('cover_url', document.getElementById('cover_url').value);
    fd.append('book_type', bookType.value);
    fd.append('reading_url', document.getElementById('reading_url').value);
    fd.append('reading_content', document.getElementById('reading_content').value);
    fd.append('is_popular', document.getElementById('is_popular').value);
    fd.append('is_published', document.getElementById('is_published').value);
    fd.append('display_order', document.getElementById('display_order').value);
    const cover = document.getElementById('cover_file').files[0];
    if (cover) fd.append('cover', cover);
    const pdf = document.getElementById('pdf_file').files[0];
    if (pdf && bookType.value==='pdf') fd.append('pdf', pdf);
    const url = id ? '/api/admin/books/' + id : '/api/admin/books';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, body: fd });
    const data = await res.json();
    const msg = document.getElementById('formMsg');
    msg.textContent = res.ok ? 'Saved' : (data.error||'Error');
    if (res.ok) {
      setTimeout(()=>{ form.reset(); document.getElementById('bookId').value=''; document.getElementById('deleteBook').hidden=true; msg.textContent=''; loadBooksTable(); loadDashboard(); document.querySelector('a[data-tab="books"]').click(); }, 600);
    }
  });
  document.getElementById('deleteBook').addEventListener('click', async ()=>{
    const id = document.getElementById('bookId').value;
    if (!id || !confirm('Delete this book?')) return;
    await fetch('/api/admin/books/'+id, {method:'DELETE'});
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value='';
    document.getElementById('deleteBook').hidden=true;
    document.getElementById('formMsg').textContent='Deleted';
    loadBooksTable(); loadDashboard();
    document.querySelector('a[data-tab="books"]').click();
  });
}

function setupMedicineForm() {
  const form = document.getElementById('medicineForm');
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const id = document.getElementById('medicineId').value;
    const fd = new FormData();
    fd.append('name', document.getElementById('med_name').value);
    fd.append('short_desc', document.getElementById('med_desc').value);
    fd.append('original_price', document.getElementById('med_orig').value||0);
    fd.append('discounted_price', document.getElementById('med_disc').value||0);
    fd.append('takeaway_price', document.getElementById('med_takeaway').value||0);
    fd.append('online_price', document.getElementById('med_online').value||0);
    fd.append('stock_available', document.getElementById('med_stock').value);
    fd.append('is_published', document.getElementById('med_published').value);
    fd.append('display_order', document.getElementById('med_order').value||0);
    const img = document.getElementById('med_image').files[0];
    if (img) fd.append('image', img);
    const url = id ? '/api/admin/medicines/' + id : '/api/admin/medicines';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, { method, body: fd });
    const data = await res.json();
    const msg = document.getElementById('medFormMsg');
    msg.textContent = res.ok ? 'Saved' : (data.error||'Error');
    if (res.ok) {
      setTimeout(()=>{ form.reset(); document.getElementById('medicineId').value=''; document.getElementById('deleteMedicine').hidden=true; msg.textContent=''; loadMedicinesTable(); loadDashboard(); document.querySelector('a[data-tab="medicines"]').click(); }, 600);
    }
  });
  document.getElementById('deleteMedicine').addEventListener('click', async ()=>{
    const id = document.getElementById('medicineId').value;
    if (!id || !confirm('Delete this medicine?')) return;
    await fetch('/api/admin/medicines/'+id, {method:'DELETE'});
    document.getElementById('medicineForm').reset();
    document.getElementById('medicineId').value='';
    document.getElementById('deleteMedicine').hidden=true;
    document.getElementById('medFormMsg').textContent='Deleted';
    loadMedicinesTable(); loadDashboard();
    document.querySelector('a[data-tab="medicines"]').click();
  });
}

async function editBook(id) {
  const res = await fetch('/api/books/'+id);
  if (!res.ok) return;
  const b = await res.json();
  document.getElementById('bookId').value = b.id;
  document.getElementById('title').value = b.title||'';
  document.getElementById('author').value = b.author||'';
  document.getElementById('short_desc').value = b.short_desc||'';
  document.getElementById('full_desc').value = b.full_desc||'';
  document.getElementById('category_id').value = b.category_id||'';
  document.getElementById('cover_url').value = b.cover_url||'';
  document.getElementById('book_type').value = b.book_type||'pdf';
  document.getElementById('reading_url').value = b.reading_url||'';
  document.getElementById('reading_content').value = b.reading_content||'';
  document.getElementById('is_popular').value = b.is_popular?1:0;
  document.getElementById('is_published').value = b.is_published?1:0;
  document.getElementById('display_order').value = b.display_order||0;
  document.getElementById('deleteBook').hidden = false;
  // trigger toggle
  document.getElementById('book_type').dispatchEvent(new Event('change'));
  document.querySelector('a[data-tab="add-book"]').click();
}

async function editMedicine(id) {
  const res = await fetch('/api/medicines/'+id);
  if (!res.ok) return;
  const m = await res.json();
  document.getElementById('medicineId').value = m.id;
  document.getElementById('med_name').value = m.name||'';
  document.getElementById('med_desc').value = m.short_desc||'';
  document.getElementById('med_orig').value = m.original_price||0;
  document.getElementById('med_disc').value = m.discounted_price||0;
  document.getElementById('med_takeaway').value = m.takeaway_price||0;
  document.getElementById('med_online').value = m.online_price||0;
  document.getElementById('med_stock').value = m.stock_available==1?1:0;
  document.getElementById('med_published').value = m.is_published==1?1:0;
  document.getElementById('med_order').value = m.display_order||0;
  document.getElementById('deleteMedicine').hidden = false;
  document.querySelector('a[data-tab="add-medicine"]').click();
}

document.addEventListener('DOMContentLoaded', initAdmin);
