document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('booksHomeGrid');
  if (!grid) return;
  try {
    const data = await fetchBooks({ popular: 1, limit: 3 });
    const books = Array.isArray(data.books) ? data.books.slice(0, 3) : [];
    grid.innerHTML = books.map(b => `
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
  } catch (e) {
    grid.innerHTML = '<p>Books loading...</p>';
  }
});
