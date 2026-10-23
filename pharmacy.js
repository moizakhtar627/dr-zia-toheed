const MEDICINES_API = '/api/medicines?published=1';

let MEDICINES = [];
const CART_KEY = "zia_pharmacy_cart";
let cart = []; // [{ id, quantity }]

function loadCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    cart = Array.isArray(data)
      ? data
          .filter((item) => item && MEDICINES.some((m) => String(m.id) === String(item.id)))
          .map((item) => ({ id: item.id, quantity: Math.max(1, parseInt(item.quantity, 10) || 1) }))
      : [];
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getMedicine(id) {
  return MEDICINES.find((m) => String(m.id) === String(id));
}

function fulfillmentValue() {
  const el = document.getElementById("fulfillmentType");
  return el && el.value === "takeaway" ? "takeaway" : "delivery";
}

document.addEventListener("DOMContentLoaded", async () => {
  const pharmacyGrid = document.getElementById("pharmacyGrid");
  const medicineSearch = document.getElementById("medicineSearch");
  const medicineCount = document.getElementById("medicineCount");
  const noMedicineResults = document.getElementById("noMedicineResults");

  try {
    const res = await fetch(MEDICINES_API);
    if (res.ok) {
      const data = await res.json();
      MEDICINES = (data.medicines || []).filter(m => m.is_published == 1);
    }
  } catch (e) {
    MEDICINES = [];
  }

  if (pharmacyGrid) {
    pharmacyGrid.innerHTML = "";
    MEDICINES.forEach((med) => {
      const card = document.createElement("article");
      card.className = "medicine-card";
      card.setAttribute("data-name", (med.name||'').toLowerCase());
      card.setAttribute("data-desc", (med.short_desc||'').toLowerCase());
      const orig = Number(med.original_price||0);
      const disc = Number(med.discounted_price||0);
      const takeaway = Number(med.takeaway_price||0);
      const online = Number(med.online_price||0);
      const img = med.image_url || 'medicine-example.svg';
      card.innerHTML = `
        <div class="medicine-image">
          <img src="${escapeHtml(img)}" alt="${escapeHtml(med.name)}">
        </div>
        <div class="medicine-info">
          <h3>${escapeHtml(med.name)}</h3>
          <p>${escapeHtml(med.short_desc||'')}</p>
          <div class="medicine-pricing">
            ${orig > 0 ? `<div class="price-row"><span>Original Price:</span><span class="price-old">${formatRs(orig)}</span></div>` : ''}
            ${disc > 0 ? `<div class="price-row"><span>Discounted Price:</span><span class="price-new">${formatRs(disc)}</span></div>` : ''}
            <div class="price-row"><span>Online Delivery:</span><span class="price-info">Rs. 120 per order</span></div>
            ${takeaway > 0 ? `<div class="price-row price-takeaway"><span>Takeaway Price:</span><span class="price-final">${formatRs(takeaway)}</span></div>` : ''}
            ${online > 0 && online !== disc ? `<div class="price-row"><span>Online Price:</span><span class="price-final">${formatRs(online)}</span></div>` : ''}
          </div>
          <button class="button button-primary add-to-cart" type="button" data-id="${med.id}">Add to Cart</button>
        </div>
      `;
      pharmacyGrid.appendChild(card);
    });

    pharmacyGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      if (getMedicine(id)) addToCart(id);
    });
  }

  if (medicineSearch && pharmacyGrid) {
    medicineSearch.addEventListener("input", () => {
      const query = medicineSearch.value.trim().toLowerCase();
      const cards = pharmacyGrid.querySelectorAll(".medicine-card");
      let visible = 0;
      cards.forEach((card) => {
        const haystack = card.getAttribute("data-name") + " " + card.getAttribute("data-desc");
        const match = haystack.includes(query);
        card.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (medicineCount) {
        medicineCount.textContent = visible + (visible === 1 ? " medicine listing" : " medicine listings");
      }
      if (noMedicineResults) noMedicineResults.hidden = visible !== 0;
    });
  }

  const fulfillmentType = document.getElementById("fulfillmentType");
  if (fulfillmentType) fulfillmentType.addEventListener("change", updateCartTotals);

  const orderBtn = document.getElementById("orderWhatsapp");
  if (orderBtn) orderBtn.addEventListener("click", orderViaWhatsApp);

  loadCart();
  renderCart();
});

function addToCart(id) {
  const existing = cart.find((item) => String(item.id) === String(id));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: id, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function updateQuantity(id, delta) {
  const item = cart.find((i) => String(i.id) === String(id));
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter((i) => String(i.id) !== String(id));
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => String(i.id) !== String(id));
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartEmptyDiv = document.getElementById("cartEmpty");
  const cartSummaryDiv = document.getElementById("cartSummary");
  const cartCountSpan = document.getElementById("cartCount");

  if (!cartItemsDiv || !cartCountSpan) return;

  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.textContent = totalUnits;

  if (cart.length === 0) {
    cartItemsDiv.hidden = true;
    cartEmptyDiv.hidden = false;
    cartSummaryDiv.hidden = true;
    return;
  }

  cartItemsDiv.hidden = false;
  cartEmptyDiv.hidden = true;
  cartSummaryDiv.hidden = false;

  cartItemsDiv.innerHTML = "";
  cart.forEach((item) => {
    const med = getMedicine(item.id);
    if (!med) return;
    const div = document.createElement("div");
    div.className = "cart-item";
    const img = med.image_url || 'medicine-example.svg';
    const orig = Number(med.original_price||0);
    const disc = Number(med.discounted_price||0);
    const takeaway = Number(med.takeaway_price||0);
    div.innerHTML = `
      <img src="${escapeHtml(img)}" alt="${escapeHtml(med.name)}" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-name">${escapeHtml(med.name)}</div>
        <div class="cart-item-meta">${orig>0?'Original: '+formatRs(orig):''} ${disc>0?'| Discounted: '+formatRs(disc):''} ${takeaway>0?'| Takeaway: '+formatRs(takeaway):''}</div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" type="button" data-id="${med.id}" data-delta="-1" aria-label="Decrease quantity">-</button>
          <span aria-live="polite">${item.quantity}</span>
          <button class="cart-qty-btn" type="button" data-id="${med.id}" data-delta="1" aria-label="Increase quantity">+</button>
          <button class="cart-remove" type="button" data-id="${med.id}">Remove</button>
        </div>
      </div>
      <div class="cart-item-total" id="itemTotal_${med.id}"></div>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartItemsDiv.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateQuantity(btn.getAttribute("data-id"), parseInt(btn.getAttribute("data-delta"), 10));
    });
  });

  cartItemsDiv.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-id")));
  });

  updateCartTotals();
}

function calculateTotals(fulfillment) {
  const isTakeaway = fulfillment === "takeaway";
  let subtotal = 0;
  let total = 0;
  const lines = cart.map((item) => {
    const med = getMedicine(item.id);
    if (!med) return { id: item.id, quantity: item.quantity, lineSubtotal: 0, lineTotal: 0 };
    const orig = Number(med.original_price||0);
    const disc = Number(med.discounted_price||0);
    const takeaway = Number(med.takeaway_price||0);
    const online = Number(med.online_price||0);
    const unitForSubtotal = orig > 0 ? orig : (disc > 0 ? disc : 0);
    const lineSubtotal = item.quantity * unitForSubtotal;
    let lineUnit = isTakeaway ? (takeaway > 0 ? takeaway : (disc > 0 ? disc : unitForSubtotal)) : (disc > 0 ? disc : (online > 0 ? online : unitForSubtotal));
    if (lineUnit < 0) lineUnit = 0;
    const lineTotal = item.quantity * lineUnit;
    subtotal += lineSubtotal;
    total += lineTotal;
    return { id: item.id, quantity: item.quantity, lineSubtotal, lineTotal, med };
  });
  let delivery = 0;
  if (!isTakeaway && cart.length > 0) {
    delivery = 120;
  }
  const finalTotal = total + delivery;
  return { subtotal, total: finalTotal, discount: Math.max(0, subtotal - total), lines, delivery, isTakeaway };
}

function updateCartTotals() {
  const cartSubtotalSpan = document.getElementById("cartSubtotal");
  const cartDeliverySpan = document.getElementById("cartDelivery");
  const cartDiscountSpan = document.getElementById("cartDiscount");
  const cartTotalSpan = document.getElementById("cartTotal");
  if (!cartSubtotalSpan) return;

  const totals = calculateTotals(fulfillmentValue());
  cartSubtotalSpan.textContent = formatRs(totals.subtotal);
  cartDeliverySpan.textContent = formatRs(totals.delivery || 0);
  cartDiscountSpan.textContent = formatRs(totals.discount);
  cartTotalSpan.textContent = formatRs(totals.total);

  totals.lines.forEach((line) => {
    const el = document.getElementById("itemTotal_" + line.id);
    if (el) el.textContent = formatRs(line.lineTotal);
  });
}

function orderViaWhatsApp() {
  if (cart.length === 0) return;

  const fulfillment = fulfillmentValue();
  const isTakeaway = fulfillment === "takeaway";
  const totals = calculateTotals(fulfillment);

  const lines = ["Hello Zia Homeopathic Clinic,", "", "I would like to place an order:", ""];
  totals.lines.forEach((line) => {
    const med = getMedicine(line.id);
    if (!med) return;
    lines.push("Medicine: " + med.name);
    lines.push("Quantity: " + line.quantity);
    const orig = Number(med.original_price||0);
    const disc = Number(med.discounted_price||0);
    const takeaway = Number(med.takeaway_price||0);
    if (orig > 0) lines.push("Original unit price: " + formatRs(orig));
    if (disc > 0) lines.push("Discounted unit price: " + formatRs(disc));
    if (isTakeaway && takeaway > 0) lines.push("Takeaway unit price: " + formatRs(takeaway));
    lines.push("Line total: " + formatRs(line.lineTotal));
    lines.push("");
  });

  lines.push("Fulfillment option: " + (isTakeaway ? "Takeaway (No delivery charge)" : "Home Delivery"));
  lines.push("Subtotal: " + formatRs(totals.subtotal));
  lines.push("Total discount: " + formatRs(totals.discount));
  lines.push("Delivery charge: " + formatRs(totals.delivery || 0));
  lines.push("Final payable amount: " + formatRs(totals.total));
  lines.push("");
  lines.push("Please confirm availability.");

  window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener,noreferrer");
}
