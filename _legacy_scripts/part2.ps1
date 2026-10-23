$ErrorActionPreference = "Stop"
$Path = "C:\Users\Shami\Downloads\zia.clinic.real\index.html"
$Content = @'
    <section class="section pharmacy-section" id="pharmacy">
      <div class="section-heading">
        <span class="eyebrow">OUR PHARMACY</span>
        <h2>Explore our <span>medicines.</span></h2>
        <p>
          Browse the medicine listings below. Contact the clinic to confirm
          availability, price, and any applicable discount.
        </p>
      </div>

      <div class="pharmacy-toolbar">
        <div>
          <h3>Available listings</h3>
          <p id="medicineCount">Medicine listings</p>
        </div>
        <label class="search-box">
          <span>⌕</span>
          <input id="medicineSearch" type="search"
                 placeholder="Search medicines..." aria-label="Search medicines">
        </label>
      </div>

      <div class="medicine-grid" id="medicineGrid">
        <article class="medicine-card" data-name="Medicine Name One">
          <div class="medicine-image">
            <img src="https://placehold.co/600x450/f0f4ed/174f3b?text=Your+Medicine+Photo"
                 alt="Replace with a photo of your medicine">
            <span class="medicine-badge">Available on enquiry</span>
          </div>
          <div class="medicine-info">
            <span class="medicine-category">Your category</span>
            <h3>Medicine Name One</h3>
            <p>Replace this with the correct product description.</p>
            <div class="medicine-price">
              <span>Price</span>
              <strong>Ask for price</strong>
            </div>
            <a class="button button-primary medicine-enquiry"
               href="https://wa.me/923005269513"
               target="_blank" rel="noopener"
               data-medicine="Medicine Name One">Enquire on WhatsApp ↗</a>
          </div>
        </article>

        <article class="medicine-card" data-name="Medicine Name Two">
          <div class="medicine-image">
            <img src="https://placehold.co/600x450/f0f4ed/174f3b?text=Your+Medicine+Photo"
                 alt="Replace with a photo of your medicine">
            <span class="medicine-badge">Available on enquiry</span>
          </div>
          <div class="medicine-info">
            <span class="medicine-category">Your category</span>
            <h3>Medicine Name Two</h3>
            <p>Replace this with the correct product description.</p>
            <div class="medicine-price">
              <span>Price</span>
              <strong>Ask for price</strong>
            </div>
            <a class="button button-primary medicine-enquiry"
               href="https://wa.me/923005269513"
               target="_blank" rel="noopener"
               data-medicine="Medicine Name Two">Enquire on WhatsApp ↗</a>
          </div>
        </article>

        <article class="medicine-card" data-name="Medicine Name Three">
          <div class="medicine-image">
            <img src="https://placehold.co/600x450/f0f4ed/174f3b?text=Your+Medicine+Photo"
                 alt="Replace with a photo of your medicine">
            <span class="medicine-badge">Available on enquiry</span>
          </div>
          <div class="medicine-info">
            <span class="medicine-category">Your category</span>
            <h3>Medicine Name Three</h3>
            <p>Replace this with the correct product description.</p>
            <div class="medicine-price">
              <span>Price</span>
              <strong>Ask for price</strong>
            </div>
            <a class="button button-primary medicine-enquiry"
               href="https://wa.me/923005269513"
               target="_blank" rel="noopener"
               data-medicine="Medicine Name Three">Enquire on WhatsApp ↗</a>
          </div>
        </article>
      </div>

      <p class="no-results" id="noMedicineResults" hidden>
        No medicines match your search.
      </p>

      <p class="pharmacy-note">
        Product photos, descriptions, prices and availability must be confirmed
        by the clinic. Listing a product does not guarantee that it is in stock.
      </p>
    </section>
'@
Add-Content -LiteralPath $Path -Value $Content -Encoding UTF8
Write-Host "Appended pharmacy section"