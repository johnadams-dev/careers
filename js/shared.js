/* shared.js — injects nav and footer into every page */

const NAV_HTML = `
<div class="topbar">
  <span>Adams, Cameron &amp; Co., Realtors &middot; The Area&rsquo;s Largest Brokerage Since 1963</span>
  <a href="tel:3862439504">&#128222; (386) 243-9504</a>
</div>
<nav>
  <div class="nav-logo">
    <a href="index.html">
      <img src="images/ac-logo.png" onerror="this.src='https://www.floridarealtorcareers.com/images/layout/adams-cameron-logo-w-outline.png'" alt="Adams Cameron &amp; Co. Realtors" />
    </a>
  </div>
  <div class="nav-links" id="nav-links">
    <a href="new-agents.html" data-page="new-agents">New Agents</a>
    <a href="experienced-agents.html" data-page="experienced-agents">Experienced Agents</a>
    <a href="about.html" data-page="about">About Us</a>
    <a href="support.html" data-page="support">Support Team</a>
    <a href="referral.html" data-page="referral">Referral Program</a>
    <a href="foundation.html" data-page="foundation">Foundation</a>
    <a href="join.html" class="nav-cta" data-page="join">Join Us</a>
  </div>
  <button class="nav-hamburger" onclick="document.getElementById('mobile-nav').classList.toggle('open')">&#9776;</button>
</nav>
<div class="mobile-nav" id="mobile-nav">
  <button class="mobile-nav-close" onclick="document.getElementById('mobile-nav').classList.remove('open')">&times;</button>
  <a href="index.html">Home</a>
  <a href="new-agents.html">New Agents</a>
  <a href="experienced-agents.html">Experienced Agents</a>
  <a href="about.html">About Us</a>
  <a href="support.html">Support Team</a>
  <a href="referral.html">Referral Program</a>
  <a href="foundation.html">Adams Cameron Foundation</a>
  <a href="join.html" style="color:var(--gold-lt);">Join Us &rarr;</a>
</div>`;

const FOOTER_HTML = `
<footer>
  <div class="footer-main">
    <div class="footer-brand">
      <img src="images/ac-logo.png" onerror="this.src='https://www.floridarealtorcareers.com/images/layout/adams-cameron-logo-w-outline.png'" alt="Adams Cameron &amp; Co. Realtors" />
      <p>Empowering real estate professionals with the systems and support they need to deliver the highest value to their clients, with the least amount of stress. Since 1963.</p>
      <div class="footer-brand-socials">
        <a href="https://www.facebook.com/adamscameron" aria-label="Facebook">f</a>
        <a href="https://www.instagram.com/adamscameronrealtors/" aria-label="Instagram">&#9679;</a>
        <a href="https://www.linkedin.com/company/adams-cameron" aria-label="LinkedIn">in</a>
      </div>
      <div style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.08);">
        <div style="font-size:.65rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.75rem;">Proud Member</div>
        <img src="images/leadingre-white.png" alt="Leading Real Estate Companies of the World" style="height:32px;opacity:.75;" />
      </div>
    </div>
    <div class="footer-col">
      <h4>Careers</h4>
      <a href="new-agents.html">New Agents</a>
      <a href="experienced-agents.html">Experienced Agents</a>
      <a href="referral.html">Realty Referral Program</a>
      <a href="join.html">Join Us</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="about.html">About Adams Cameron</a>
      <a href="support.html">Your Support Team</a>
      <a href="foundation.html">AC Foundation</a>
      <a href="https://www.adamscameron.com" target="_blank">Main Website</a>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <p>600 S. Atlantic Ave<br/>Daytona Beach, FL 32118<br/><br/>
      <a href="tel:3862439504">(386) 243-9504</a></p>
    </div>
  </div>
  <div class="footer-bottom">
    <div>&copy; 1963&ndash;2026 Adams, Cameron &amp; Co., Realtors. All rights reserved.</div>
    <div class="footer-bottom-links">
      <a href="#">Disclaimer</a>
      <a href="#">Terms of Use</a>
      <a href="#">ADA Accessibility</a>
    </div>
  </div>
</footer>`;

// Inject nav and footer
document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
document.body.insertAdjacentHTML('beforeend', FOOTER_HTML);

// Highlight active nav link
const page = document.body.dataset.page;
if (page) {
  document.querySelectorAll('[data-page]').forEach(a => {
    if (a.dataset.page === page) a.classList.add('active');
  });
}
