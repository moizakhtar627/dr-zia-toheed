// Shared utilities
const whatsappNumber = "923005269513";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function encodeWhatsApp(text) {
  return encodeURIComponent(text);
}

// Mobile nav
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

  // Dropdown for About Us
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.getElementById("aboutDropdownToggle");
  const dropdownMenu = document.getElementById("aboutDropdownMenu");

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

  // Hero service rotation - every 1 second
  const heroServiceText = document.getElementById("heroServiceText");
  const services = ["Clinic Consultation", "Video Consultation", "Home Visiting"];
  let serviceIndex = 0;

  if (heroServiceText) {
    heroServiceText.textContent = services[0];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReducedMotion) {
      setInterval(() => {
        heroServiceText.classList.add("fade-out");
        setTimeout(() => {
          serviceIndex = (serviceIndex + 1) % services.length;
          heroServiceText.textContent = services[serviceIndex];
          heroServiceText.classList.remove("fade-out");
          heroServiceText.classList.add("fade-in");
          setTimeout(() => heroServiceText.classList.remove("fade-in"), 450);
        }, 450);
      }, 1000);
    } else {
      // still rotate but no animation
      setInterval(() => {
        serviceIndex = (serviceIndex + 1) % services.length;
        heroServiceText.textContent = services[serviceIndex];
      }, 1000);
    }
  }

  // Contact form to WhatsApp
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

  // Footer year
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
