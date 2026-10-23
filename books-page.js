document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('booksGrid');
  const search = document.getElementById('booksSearch');
  const cat = document.getElementById('booksCategory');
  const noResults = document.getElementById('noBooksResults');
  let allBooks = [];
  let categories = [];
  try {
    const [booksRes, catsRes] = await Promise.all([
      fetchBooks({ published: 1 }),
      fetch('/api/categories').then(r => r.ok ? r.json() : { categories: [] })
    ]);
    allBooks = booksRes.books || [];
    categories = catsRes.categories || [];
    cat.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    render(allBooks);
  } catch (e) {}
  function render(list) {
    grid.innerHTML = list.map(b => `
      <article class="book-card">
        <div class="book-cover">
          <img src="${escapeHtml(b.cover_url || 'medicine-example.svg')}" alt="${escapeHtml(b.title)} book cover">
        </div>
        <div class="book-info">
          <h3>${escapeHtml(b.title)}</h3>
          <p class="book-author">${escapeHtml(b.author || 'Unknown')}</p>
          <p class="book-category">${escapeHtml(b.category_name || '')}</p>
          <p class="book-desc">${escapeHtml(b.short_desc || '')}</p>
          <a class="button button-outline" href="read-book.html?id=${b.id}">Read Book</a>
        </div>
      </article>
    `).join('');
    noResults.hidden = list.length > 0;
  }
  function filter() {
    const q = (search.value || '').toLowerCase();
    const c = cat.value;
    const filtered = allBooks.filter(b => {
      const match = !q || [b.title, b.author, b.short_desc, b.full_desc].join(' ').toLowerCase().includes(q);
      const cm = !c || String(b.category_id) === String(c);
      return match && cm;
    });
    render(filtered);
  }
  search.addEventListener('input', filter);
  cat.addEventListener('change', filter);
});
