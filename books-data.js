const BOOKS_API = '/api/books';

async function fetchBooks(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? BOOKS_API + '?' + qs : BOOKS_API;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}
