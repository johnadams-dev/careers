# Adams, Cameron & Co. Careers Site
## Deployment & Maintenance Guide

---

## File Structure

```
acrealtors/
├── index.html            ← Homepage
├── new-agents.html       ← New Agents page
├── experienced-agents.html
├── about.html            ← About Adams Cameron
├── support.html          ← Your Support Team
├── referral.html         ← Realty Referral Program
├── foundation.html       ← Adams Cameron Foundation
├── join.html             ← Join Us (main lead form)
├── thank-you.html        ← Post-form-submission confirmation
├── netlify.toml          ← Netlify configuration
├── css/
│   └── styles.css        ← All shared styles
├── js/
│   └── shared.js         ← Shared nav + footer injected into every page
└── images/
    └── ac-logo.png       ← Place your logo file here
```

---

## Hosting Options (Recommended Order)

### Option 1: Netlify (Recommended)
**Cost:** Free tier is sufficient for this site.
**Difficulty:** Very easy.

1. Go to https://netlify.com and sign up (free).
2. Click "Add new site" → "Deploy manually."
3. ZIP the entire `acrealtors/` folder.
4. Drag and drop the ZIP onto the Netlify deploy screen.
5. The site is live instantly at a random Netlify URL (e.g. `jolly-swan-abc123.netlify.app`).
6. Go to Site Settings → Domain Management → Add custom domain.
7. Point your domain's DNS to Netlify (they provide instructions).
8. Netlify handles SSL automatically.

**Form Handling:** Netlify detects the `data-netlify="true"` attribute on the forms
automatically. Form submissions are captured in your Netlify dashboard and emailed
to you. No backend server needed.

**To update the site:** Just drag and drop a new ZIP. Takes 30 seconds.

### Option 2: GoDaddy / Traditional Web Host
1. Log into GoDaddy (or your existing host).
2. Open File Manager or connect via FTP.
3. Upload all files from the `acrealtors/` folder into your `public_html` directory.
4. Point your domain DNS to the hosting server.
5. **Note:** Forms won't work on static hosting without a backend. Replace the
   form `action` with a Formspree URL (see below) OR use a contact@ email link.

**Formspree (free form handler for GoDaddy hosting):**
1. Sign up at https://formspree.io
2. Create a new form and get your form endpoint URL.
3. In `join.html` and `new-agents.html`, replace `action="thank-you.html"`
   with `action="https://formspree.io/f/YOUR_FORM_ID"`.
4. Remove the `data-netlify="true"` attribute.

### Option 3: Google Cloud Storage
1. Create a Storage bucket named after your domain (e.g. `floridarealtorcareers.com`).
2. Upload all files with `gsutil cp -r acrealtors/* gs://floridarealtorcareers.com/`.
3. Enable "Website configuration" on the bucket.
4. Set up a Load Balancer with SSL (requires additional GCP configuration).
5. **Note:** Same form limitation as GoDaddy — use Formspree.

---

## Adding Your Logo

Place the Adams Cameron logo file at:
```
acrealtors/images/ac-logo.png
```
The `shared.js` file references `images/ac-logo.png` and falls back to the
live Delta Media Group URL if the local file is missing.

---

## Form Notifications (Netlify)

1. In your Netlify dashboard, go to: Site → Forms → Settings.
2. Add your email address under "Form Notifications."
3. Every submission will email you instantly.

---

## Updating Page Content

Each page is a standalone HTML file. To edit content:
1. Open the relevant `.html` file in any text editor (Notepad, VS Code, TextEdit).
2. Find and edit the text between HTML tags.
3. Save and re-upload to Netlify (or your host).

**To edit navigation or footer:**
Edit `js/shared.js`. Changes apply to ALL pages automatically.

**To change brand colors or fonts:**
Edit the `:root` section at the top of `css/styles.css`.

---

## Domain Setup (Netlify)

After deploying:
1. Netlify → Site Settings → Domain Management → Add custom domain.
2. Enter `floridarealtorcareers.com`.
3. Netlify will show you two nameserver addresses.
4. Log into your domain registrar (GoDaddy, etc.) and update nameservers.
5. Allow 24–48 hours for DNS propagation.
6. Netlify provisions a free SSL certificate automatically.

---

## SEO Notes

Each page includes:
- A descriptive `<title>` tag
- A `<meta name="description">` tag
- Semantic heading structure (h1 → h2 → h3)

To add Google Analytics, paste your GA4 script tag into `js/shared.js`
just before the closing of the NAV_HTML string.

---

*Site built May 2026. Contact your web administrator for technical support.*
