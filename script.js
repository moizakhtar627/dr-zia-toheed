// ============================================================
// Zia Homeopathic Clinic — shared site script
// Loaded by BOTH index.html and pharmacy.html (first in order).
// Single source of truth: nav, About Us dropdown, hero rotation,
// contact form, pricing configuration.
// ============================================================

const whatsappNumber = "923005269513";

// Single reusable pricing configuration (homepage + pharmacy)
const PRICING = Object.freeze({
  original: 1000,
  discounted: 890,
  takeawayPercent: 5
});
PRICING.takeaway = +(PRICING.discounted - PRICING.discounted * PRICING.takeawayPercent / 100).toFixed(2); // 845.50

function formatRs(amount) {
  return "Rs. " + Number(amount).toFixed(2);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function encodeWhatsApp(text) {
  return encodeURIComponent(text);
}

document.addEventListener("DOMContentLoaded", () => {
  // ---------------- Mobile nav ----------------
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");

  const closeNav = () => {
    if (nav && menuToggle) {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("click", (event) => {
      if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeNav();
      }
    });
  }

  // ---------------- About Us dropdown ----------------
  // Hover opening is pure CSS (:hover). Click/touch toggles .open.
  // Tab focus opens it; Enter/Space (native button click) keeps it open
  // when it was opened by focus, otherwise toggles. Escape closes.
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.getElementById("aboutDropdownToggle");

  if (dropdown && dropdownToggle) {
    let openedByFocus = false;
    let suppressFocusOpen = false;

    const setDropdown = (open) => {
      dropdown.classList.toggle("open", open);
      dropdownToggle.setAttribute("aria-expanded", String(open));
      if (!open) openedByFocus = false;
    };

    dropdownToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      // Keyboard click (detail === 0) right after focus-opened: keep it open
      if (e.detail === 0 && openedByFocus) {
        openedByFocus = false;
        return;
      }
      setDropdown(!isOpen);
    });

    dropdownToggle.addEventListener("focus", () => {
      if (suppressFocusOpen) return;
      if (dropdownToggle.matches(":focus-visible")) {
        setDropdown(true);
        openedByFocus = true;
      }
    });

    dropdown.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && dropdown.classList.contains("open")) {
        setDropdown(false);
        suppressFocusOpen = true;
        dropdownToggle.focus();
        setTimeout(() => { suppressFocusOpen = false; }, 150);
      }
    });

    dropdown.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setDropdown(false));
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) setDropdown(false);
    });

    dropdown.addEventListener("focusout", (e) => {
      if (!dropdown.contains(e.relatedTarget)) setDropdown(false);
    });
  }

  // ---------------- Hero service rotation: every 2000 ms ----------------
  const heroServiceText = document.getElementById("heroServiceText");
  const services = ["Clinic Consultation", "Video Consultation", "Home Visiting"];
  const ROTATE_INTERVAL = 2000;

  if (heroServiceText && !heroServiceText.dataset.rotating) {
    heroServiceText.dataset.rotating = "1"; // guard against duplicate timers
    let serviceIndex = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Still rotates, but with no transition at all
      setInterval(() => {
        serviceIndex = (serviceIndex + 1) % services.length;
        heroServiceText.textContent = services[serviceIndex];
      }, ROTATE_INTERVAL);
    } else {
      setInterval(() => {
        heroServiceText.classList.add("fade-out");
        setTimeout(() => {
          serviceIndex = (serviceIndex + 1) % services.length;
          heroServiceText.textContent = services[serviceIndex];
          heroServiceText.classList.remove("fade-out");
          heroServiceText.classList.add("fade-in");
          setTimeout(() => heroServiceText.classList.remove("fade-in"), 420);
        }, 400);
      }, ROTATE_INTERVAL);
    }
  }

  // ---------------- Contact form → prepared WhatsApp message ----------------
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const name = document.getElementById("name").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const service = document.getElementById("service").value;
      const message = document.getElementById("message").value.trim();

      const whatsappMessage = [
        "Hello Zia Homeopathic Clinic,",
        "",
        "I would like to make an enquiry.",
        "",
        "Name: " + name,
        "Phone: " + phone,
        "Enquiry type: " + service,
        "Message: " + (message || "No additional message"),
        "",
        "Please let me know the next steps."
      ].join("\n");

      window.open("https://wa.me/" + whatsappNumber + "?text=" + encodeWhatsApp(whatsappMessage), "_blank", "noopener,noreferrer");
    });
  }

  // ---------------- Footer year ----------------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
