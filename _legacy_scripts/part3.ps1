$ErrorActionPreference = "Stop"
$Path = "C:\Users\Shami\Downloads\zia.clinic.real\index.html"
$Content = @'

    <section class="section about-section" id="about">
      <div class="about-mark">✚</div>

      <div class="about-content">
        <span class="eyebrow">ABOUT OUR CLINIC</span>
        <h2>A welcoming place for your <span>health journey.</span></h2>
        <p>
          Zia Homeopathic Clinic serves the Wah Cantt community.
          Contact us for appointment enquiries, home visit availability
          and medicine information.
        </p>
        <p class="small-note">
          Homeopathy has limited scientific evidence of effectiveness for
          treating health conditions. It should not replace evidence-based
          medical care or urgent treatment.
        </p>
        <a href="#contact" class="button button-primary">Contact the Clinic ↗</a>
      </div>
    </section>

    <section class="section contact-section" id="contact">
      <div class="contact-intro">
        <span class="eyebrow">GET IN TOUCH</span>
        <h2>We are here to hear <span>from you.</span></h2>
        <p>Complete the form to prepare an enquiry message for WhatsApp.</p>

        <div class="contact-list">
          <a href="tel:+923005269513" class="contact-item">
            <span class="contact-icon">☎</span>
            <span><small>Call the clinic</small><strong>0300 5269513</strong></span>
          </a>

          <a href="https://wa.me/923005269513" target="_blank"
             rel="noopener" class="contact-item">
            <span class="contact-icon">◉</span>
            <span><small>WhatsApp</small><strong>0300 5269513</strong></span>
          </a>

          <div class="contact-item">
            <span class="contact-icon">⌖</span>
            <span>
              <small>Clinic address</small>
              <strong>Darbar-e-Kareemi Road, near Taji Hotel, Gulshan-e-Raza, G.T. Road, Wah Cantt</strong>
            </span>
          </div>

          <div class="contact-item">
            <span class="contact-icon">◷</span>
            <span><small>Opening hours</small><strong>4:00 PM – 8:00 PM</strong></span>
          </div>
        </div>

        <a class="map-link"
           href="https://www.google.com/maps/search/?api=1&query=Darbar-e-Kareemi+Road+Taji+Hotel+Wah+Cantt"
           target="_blank" rel="noopener">Get directions on Google Maps ↗</a>
      </div>

      <form class="contact-form" id="contactForm">
        <h3>Send an enquiry</h3>
        <p>Fields marked * are required.</p>

        <label for="name">Your name *</label>
        <input type="text" id="name" name="name"
               placeholder="Enter your name" autocomplete="name" required>

        <label for="phone">Your phone number *</label>
        <input type="tel" id="phone" name="phone"
               placeholder="Enter your phone number"
               autocomplete="tel" required>

        <label for="service">Enquiry type *</label>
        <select id="service" name="service" required>
          <option value="">Choose a service</option>
          <option>Clinic Consultation</option>
          <option>Video Consultation</option>
          <option>Home Visiting</option>
          <option>Discounts on Medicines</option>
          <option>Medicine Availability</option>
          <option>General Question</option>
        </select>

        <label for="message">Your message</label>
        <textarea id="message" name="message" rows="4"
                  placeholder="Write your enquiry here..."></textarea>

        <button class="button button-primary submit-button" type="submit">
          Continue to WhatsApp ↗
        </button>

        <p class="form-note">
          WhatsApp will open with your message prepared. You must press Send
          in WhatsApp. This form does not save data to a database.
        </p>
      </form>
    </section>
  </main>

  <footer class="footer">
    <a href="#home" class="logo footer-logo">
      <span class="logo-icon">✚</span>
      <span>Zia <small>Homeopathic Clinic</small></span>
    </a>
    <p>Wah Cantt, Pakistan · 4:00 PM – 8:00 PM</p>
    <p>© <span id="year"></span> Zia Homeopathic Clinic</p>
  </footer>

  <a class="whatsapp-float" href="https://wa.me/923005269513"
     target="_blank" rel="noopener" aria-label="Chat with clinic on WhatsApp">◉</a>
</body>
</html>
'@
Add-Content -LiteralPath $Path -Value $Content -Encoding UTF8
Write-Host "Appended about, contact, and footer"