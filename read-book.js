document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const titleEl = document.getElementById('rbTitle');
  const authorEl = document.getElementById('rbAuthor');
  const metaEl = document.getElementById('rbMeta');
  const contentEl = document.getElementById('rbContent');
  const font = document.getElementById('fontRange');
  if (!id) { contentEl.textContent = 'Book not found.'; return; }
  try {
    const res = await fetch('/api/books/' + id);
    if (!res.ok) throw new Error('not found');
    const b = await res.json();
    titleEl.textContent = b.title;
    authorEl.textContent = b.author || '';
    metaEl.textContent = b.category_name || '';
    if (font && contentEl) {
      font.addEventListener('input', () => { contentEl.style.fontSize = font.value + 'px'; });
      contentEl.style.fontSize = font.value + 'px';
    }
    if (b.book_type === 'external' && b.reading_url) {
      const link = document.createElement('a');
      link.href = b.reading_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'button button-primary';
      link.textContent = 'Open Reading Source';
      contentEl.appendChild(link);
    } else if (b.book_type === 'pdf' && b.pdf_filename) {
      const frame = document.createElement('iframe');
      frame.src = '/uploads/' + b.pdf_filename;
      frame.width = '100%';
      frame.height = '800px';
      frame.style.border = '0';
      contentEl.appendChild(frame);
    } else if (b.book_type === 'online') {
      contentEl.innerHTML = (b.reading_content || '<p>Reading content not available.</p>').replace(/\n/g, '<br>');
    } else {
      contentEl.textContent = 'Reading content not available for this book.';
    }
  } catch (e) {
    contentEl.textContent = 'Book not found or not available.';
  }
});
