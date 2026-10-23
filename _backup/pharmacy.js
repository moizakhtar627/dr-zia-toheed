const whatsappNumber = "923005269513";
const ORIGINAL_PRICE = 1000;
const DISCOUNTED_PRICE = 890;
const TAKEAWAY_DISCOUNT_PCT = 5;

const MEDICINES = [
  { id: 1, name: "Arnica Montana", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&auto=format&fit=crop" },
  { id: 2, name: "Belladonna", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800&q=80&auto=format&fit=crop" },
  { id: 3, name: "Nux Vomica", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1518976024611-28bf4b48222e?w=800&q=80&auto=format&fit=crop" },
  { id: 4, name: "Chamomilla", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1550572017-4fcdbb59cc32?w=800&q=80&auto=format&fit=crop" },
  { id: 5, name: "Rhus Toxicodendron", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&q=80&auto=format&fit=crop" },
  { id: 6, name: "Pulsatilla", description: "Homeopathic medicine - example product", image: "https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=800&q=80&auto=format&fit=crop" }
];

let cart = [];
const CART_KEY = "zia_pharmacy_cart";

function loadCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    if (data) cart = JSON.parse(data);
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getTakeawayPrice(unitPrice) {
  return unitPrice - (unitPrice * TAKEAWAY_DISCOUNT_PCT / 100);
}

function formatRs(amount) {
  return "Rs. " + amount.toFixed(2);
}

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (event) => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.getElementById("aboutDropdownToggle");
  if (dropdown && dropdownToggle) {
    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      dropdownToggle.setAttribute("aria-expanded", String(isOpen));
    });
    dropdown.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        dropdown.classList.remove("open");
        dropdownToggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", () => {
      dropdown.classList.remove("open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    });
  }

  const pharmacyGrid = document.getElementById("pharmacyGrid");
  const medicineSearch = document.getElementById("medicineSearch");
  const medicineCount = document.getElementById("medicineCount");
  const noMedicineResults = document.getElementById("noMedicineResults");

  if (pharmacyGrid) {
    MEDICINES.forEach((med) => {
      const card = document.createElement("article");
      card.className = "medicine-card";
      card.setAttribute("data-name", med.name.toLowerCase());
      card.innerHTML = `
        <div class="medicine-image">
          <img src="${med.image}" alt="${escapeHtml(med.name)}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22160%22 viewBox=%220 0 200 160%22%3E%3Crect width=%22200%22 height=%22160%22 fill=%22%23eaf2ed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23103b2d%22%3EMedicine%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="medicine-info">
          <h3>${escapeHtml(med.name)}</h3>
          <p>${escapeHtml(med.description)}</p>
          <div class="medicine-pricing">
            <div class="price-row"><span>Original Price:</span><span class="price-old">Rs. 1,000</span></div>
            <div class="price-row"><span>Discounted Price:</span><span class="price-new">Rs. 890</span></div>
            <div class="price-row"><span>Home Delivery:</span><span class="price-free">FREE</span></div>
            <div class="price-row"><span>Takeaway:</span><span class="price-info">EXTRA 5% OFF</span></div>
            <div class="price-row price-takeaway"><span>Takeaway Price:</span><span class="price-final">Rs. 845.50 per medicine</span></div>
          </div>
          <button class="button button-primary add-to-cart" data-id="${med.id}">Add to Cart</button>
        </div>
      `;
      pharmacyGrid.appendChild(card);
    });

    pharmacyGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (btn) {
        const id = parseInt(btn.getAttribute("data-id"));
        const med = MEDICINES.find((m) => m.id === id);
        if (med) {
          addToCart(med);
        }
      }
    });
  }

  if (medicineSearch) {
    medicineSearch.addEventListener("input", () => {
      if (!pharmacyGrid) return;
      const query = medicineSearch.value.trim().toLowerCase();
      const cards = pharmacyGrid.querySelectorAll(".medicine-card");
      let visible = 0;
      cards.forEach((card) => {
        const name = card.getAttribute("data-name");
        if (name.includes(query)) {
          card.style.display = "block";
          visible++;
        } else {
          card.style.display = "none";
        }
      });
      if (medicineCount) {
        medicineCount.textContent = visible + (visible === 1 ? " medicine listing" : " medicine listings");
      }
      if (noMedicineResults) {
        noMedicineResults.hidden = visible !== 0;
      }
    });
  }

  loadCart();
  renderCart();

  const orderBtn = document.getElementById("orderWhatsapp");
  if (orderBtn) {
    orderBtn.addEventListener("click", orderViaWhatsApp);
  }

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});

function addToCart(med) {
  const existing = cart.find((item) => item.id === med.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: med.id, name: med.name, image: med.image, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cartItems");
  const cartEmptyDiv = document.getElementById("cartEmpty");
  const cartSummaryDiv = document.getElementById("cartSummary");
  const cartCountSpan = document.getElementById("cartCount");
  const cartSubtotalSpan = document.getElementById("cartSubtotal");
  const cartDeliverySpan = document.getElementById("cartDelivery");
  const cartDiscountSpan = document.getElementById("cartDiscount");
  const cartTotalSpan = document.getElementById("cartTotal");
  const fulfillmentType = document.getElementById("fulfillmentType");

  if (!cartItemsDiv) return;

  cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22160%22 viewBox=%220 0 200 160%22%3E%3Crect width=%22200%22 height=%22160%22 fill=%22%23eaf2ed%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23103b2d%22%3EMedicine%3C/text%3E%3C/svg%3E'">
      <div class="cart-item-details">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-meta">Original: Rs. 1,000 | Discounted: Rs. 890</div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" data-id="${item.id}" data-action="decrease">-</button>
          <span>${item.quantity}</span>
          <button class="cart-qty-btn" data-id="${item.id}" data-action="increase">+</button>
          <button class="cart-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
      <div class="cart-item-total" id="itemTotal_${item.id}"></div>
    `;
    cartItemsDiv.appendChild(div);
  });

  cartItemsDiv.querySelectorAll(".cart-qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      updateQuantity(id, action);
    });
  });

  cartItemsDiv.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-id"));
      removeFromCart(id);
    });
  });

  updateCartTotals();
  if (fulfillmentType) {
    fulfillmentType.onchange = updateCartTotals;
  }
}

function updateQuantity(id, action) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  if (action === "increase") {
    item.quantity += 1;
  } else if (action === "decrease") {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function updateCartTotals() {
  const cartSubtotalSpan = document.getElementById("cartSubtotal");
  const cartDeliverySpan = document.getElementById("cartDelivery");
  const cartDiscountSpan = document.getElementById("cartDiscount");
  const cartTotalSpan = document.getElementById("cartTotal");
  const fulfillmentType = document.getElementById("fulfillmentType");

  let subtotal = 0;
  cart.forEach((item) => {
    subtotal += item.quantity * DISCOUNTED_PRICE;
  });
  cartSubtotalSpan.textContent = formatRs(subtotal);

  if (fulfillmentType && fulfillmentType.value === "takeaway") {
    const takeawayUnit = getTakeawayPrice(DISCOUNTED_PRICE);
    let total = 0;
    cart.forEach((item) => {
      total += item.quantity * takeawayUnit;
    });
    const discount = subtotal - total;
    cartDeliverySpan.textContent = formatRs(0);
    cartDiscountSpan.textContent = formatRs(discount);
    cartTotalSpan.textContent = formatRs(total);
    cart.forEach((item) => {
      const el = document.getElementById("itemTotal_" + item.id);
      if (el) el.textContent = formatRs(item.quantity * takeawayUnit);
    });
  } else {
    const total = subtotal;
    cartDeliverySpan.textContent = formatRs(0);
    cartDiscountSpan.textContent = formatRs(0);
    cartTotalSpan.textContent = formatRs(total);
    cart.forEach((item) => {
      const el = document.getElementById("itemTotal_" + item.id);
      if (el) el.textContent = formatRs(item.quantity * DISCOUNTED_PRICE);
    });
  }
}

function orderViaWhatsApp() {
  if (cart.length === 0) return;
  const fulfillmentType = document.getElementById("fulfillmentType");
  const fulfillment = fulfillmentType && fulfillmentType.value === "takeaway" ? "Takeaway (Extra 5% OFF)" : "Home Delivery (FREE)";

  let lines = ["Hello Zia Homeopathic Clinic,", "", "I would like to place an order:", ""];
  let subtotal = 0;
  cart.forEach((item) => {
    const unit = DISCOUNTED_PRICE;
    const takeawayUnit = getTakeawayPrice(unit);
    const lineTotal = fulfillment === "Takeaway (Extra 5% OFF)" ? item.quantity * takeawayUnit : item.quantity * unit;
    subtotal += (fulfillment === "Takeaway (Extra 5% OFF)" ? item.quantity * takeawayUnit : item.quantity * unit);
    lines.push("Medicine: " + item.name);
    lines.push("Quantity: " + item.quantity);
    lines.push("Original unit price: Rs. " + ORIGINAL_PRICE);
    lines.push("Discounted unit price: Rs. " + DISCOUNTED_PRICE);
    if (fulfillment === "Takeaway (Extra 5% OFF)") {
      lines.push("Extra takeaway discount: 5% (Rs. " + takeawayUnit.toFixed(2) + " per item)");
    }
    lines.push("Line total: Rs. " + lineTotal.toFixed(2));
    lines.push("");
  });

  const msg = lines.concat([
    "Fulfillment option: " + fulfillment,
    "Subtotal: Rs. " + subtotal.toFixed(2),
    "Delivery charge: Rs. 0",
    "Final payable amount: Rs. " + subtotal.toFixed(2),
    "",
    "Please let me know the next steps."
  ]).join("\n");

  window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
