document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('homepageMedicines');
  if (!grid) return;
  function esc(s){ const d=document.createElement('div'); d.textContent=s||''; return d.innerHTML; }
  try {
    const res = await fetch('/api/medicines?published=1');
    if (!res.ok) { grid.innerHTML = '<p>Medicines loading...</p>'; return; }
    const data = await res.json();
    const meds = (data.medicines||[]).slice(0, 3);
    if (meds.length === 0) {
      grid.innerHTML = '<p>No medicines published yet.</p>';
      return;
    }
    grid.innerHTML = meds.map(m => {
      const orig = Number(m.original_price||0);
      const disc = Number(m.discounted_price||0);
      const takeaway = Number(m.takeaway_price||0);
      const img = m.image_url || 'medicine-example.svg';
      const text = encodeURIComponent('Hello Zia Homeopathic Clinic,\n\nI would like to enquire about ' + m.name + '.\n\nPlease confirm availability, price and discounts.');
      return `
        <article class="medicine-card">
          <div class="medicine-image">
            <img src="${esc(img)}" alt="${esc(m.name)}">
          </div>
          <div class="medicine-info">
            <h3>${esc(m.name)}</h3>
            <p>${esc(m.short_desc||'')}</p>
            <div class="medicine-pricing">
              ${orig>0?`<div class="price-row"><span>Original Price:</span><span class="price-old">Rs. ${orig.toFixed(2)}</span></div>`:''}
              ${disc>0?`<div class="price-row"><span>Discounted Price:</span><span class="price-new">Rs. ${disc.toFixed(2)}</span></div>`:''}
              <div class="price-row"><span>Online Delivery:</span><span class="price-info">Rs. 120 per order</span></div>
              ${takeaway>0?`<div class="price-row price-takeaway"><span>Takeaway Price:</span><span class="price-final">Rs. ${takeaway.toFixed(2)}</span></div>`:''}
            </div>
            <a class="button button-outline card-action" href="https://wa.me/923005269513?text=${text}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>
          </div>
        </article>
      `;
    }).join('');
  } catch (e) {
    grid.innerHTML = '<p>Medicines loading...</p>';
  }
});
