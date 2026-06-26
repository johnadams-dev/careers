#!/usr/bin/env node
/*
 * build-page.js — Otto hub-and-spoke page engine.
 *
 * Renders full, static, AI-readable pages from content specs in /content:
 *   • type "hub"     → pillar page: journey stepper + spoke-card grid + FAQ.
 *                      Schema: CollectionPage + ItemList + FAQPage + Breadcrumb.
 *   • type "article" → spoke page: answer-first body + FAQ, links UP to its hub.
 *                      Schema: Article + FAQPage + Breadcrumb.
 *
 * Hub→spoke links are LINK-AWARE: a spoke renders as a live card only if its
 * page exists on disk; not-yet-built spokes render as styled "in the library"
 * rows (no dead hrefs). Re-run as the library grows to wire new spokes in.
 *
 * Usage: node scripts/build-page.js [slug ...]   (omit = build all specs)
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://floridarealtorcareers.com';
const ROOT = path.join(__dirname, '..');
const CONTENT = path.join(ROOT, 'content');

const ORG = {
  '@type': ['RealEstateAgent', 'Organization'],
  '@id': `${SITE}/#organization`,
  name: 'Adams, Cameron & Co., Realtors',
  alternateName: 'Florida Realtor Careers',
  url: `${SITE}/`,
  logo: `${SITE}/images/ac-logo.png`,
  telephone: '+1-386-243-9504',
  foundingDate: '1963',
  address: { '@type': 'PostalAddress', streetAddress: '600 S. Atlantic Ave', addressLocality: 'Daytona Beach', addressRegion: 'FL', postalCode: '32118', addressCountry: 'US' },
  areaServed: [{ '@type': 'AdministrativeArea', name: 'Volusia County, Florida' }, { '@type': 'AdministrativeArea', name: 'Flagler County, Florida' }],
  sameAs: ['https://www.adamscameron.com', 'https://www.facebook.com/adamscameron', 'https://www.instagram.com/adamscameronrealtors/', 'https://www.linkedin.com/company/adams-cameron'],
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Florida Realtor Careers', publisher: { '@id': `${SITE}/#organization` } };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com" />\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />';

const slugExists = (slug) => fs.existsSync(path.join(ROOT, `${slug}.html`));

function head(spec, graph) {
  const url = `${SITE}/${spec.slug}`;
  const ld = { '@context': 'https://schema.org', '@graph': graph };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(spec.title)}</title>
<meta name="description" content="${esc(spec.metaDesc)}" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="${spec.type === 'article' ? 'article' : 'website'}" />
<meta property="og:site_name" content="Florida Realtor Careers" />
<meta property="og:title" content="${esc(spec.title)}" />
<meta property="og:description" content="${esc(spec.metaDesc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${spec.heroImg || SITE + '/images/ac-logo.png'}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(spec.title)}" />
<meta name="twitter:description" content="${esc(spec.metaDesc)}" />
<meta name="twitter:image" content="${spec.heroImg || SITE + '/images/ac-logo.png'}" />
${FONTS}
<link rel="stylesheet" href="css/styles.css" />
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>`;
}

const faqSchema = (faq) => faq && faq.length ? {
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
} : null;

const breadcrumb = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
});

const faqHtml = (faq) => !faq || !faq.length ? '' : `
<section class="section hub-faq" id="faq">
  <div class="container container-narrow">
    <p class="section-label">Common Questions</p>
    <h2 class="section-title">Frequently Asked Questions</h2>
    ${faq.map((f) => `<details class="faq-item"><summary>${esc(f.q)}</summary><div class="faq-a"><p>${f.a}</p></div></details>`).join('\n    ')}
  </div>
</section>`;

const ctaHtml = (spec) => `
<div class="cta-banner">
  <h2>${esc(spec.ctaHeading || 'Ready to Start Your Real Estate Career?')}</h2>
  <p>${spec.ctaSub || 'Join the family that&rsquo;s been building careers&mdash;and community&mdash;across Volusia and Flagler County since 1963.'}</p>
  <div class="cta-banner-actions">
    <a href="join.html" class="btn-primary">Start the Conversation &rarr;</a>
    <a href="new-agents.html" class="btn-ghost">Explore New-Agent Support</a>
  </div>
</div>`;

const SCRIPTS = '\n<script src="js/shared.js"></script>\n</body>\n</html>\n';

// ── HUB ──────────────────────────────────────────────────────────────────
const HUB_STYLE = `
<style>
/* ── OTTO HUB (pillar) ── */
.hub-hero{position:relative;background:linear-gradient(120deg,var(--charcoal) 0%,var(--navy-dk) 100%);color:var(--white);padding:6.5rem 2rem 5rem;overflow:hidden}
.hub-hero::before{content:'';position:absolute;right:-120px;top:-120px;width:460px;height:460px;border:2px solid rgba(201,168,76,.18);border-radius:50%}
.hub-hero::after{content:'';position:absolute;right:-40px;bottom:-160px;width:340px;height:340px;border:2px solid rgba(201,168,76,.12);border-radius:50%}
.hub-hero-inner{max-width:880px;margin:0 auto;position:relative;z-index:2}
.hub-eyebrow{font-family:var(--ff-body);font-size:.74rem;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--gold-lt);display:flex;align-items:center;gap:.7rem;margin-bottom:1.4rem}
.hub-eyebrow::before{content:'';width:34px;height:2px;background:var(--gold)}
.hub-hero h1{font-family:var(--ff-head);font-weight:700;font-size:clamp(2.3rem,5vw,4rem);line-height:1.05;margin-bottom:1.5rem;max-width:18ch}
.hub-hero h1 em{color:var(--gold-lt);font-style:italic}
.hub-lede{font-size:clamp(1.05rem,1.6vw,1.32rem);line-height:1.6;color:rgba(255,255,255,.82);max-width:60ch}
.hub-hero-meta{display:flex;flex-wrap:wrap;gap:2.4rem;margin-top:2.6rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.14)}
.hub-hero-meta div span{display:block}
.hub-hero-meta .m-num{font-family:var(--ff-head);font-size:1.9rem;font-weight:700;color:var(--gold-lt)}
.hub-hero-meta .m-lbl{font-size:.78rem;letter-spacing:.04em;color:rgba(255,255,255,.6);margin-top:.2rem}
/* journey stepper */
.hub-journey{background:var(--cream);padding:4.5rem 2rem}
.hub-journey-grid{max-width:1100px;margin:2.6rem auto 0;display:grid;grid-template-columns:repeat(4,1fr);gap:1.4rem;position:relative}
.j-step{background:var(--white);border:1px solid var(--light);border-radius:var(--radius);padding:2rem 1.5rem;position:relative;transition:transform .4s var(--ease),box-shadow .4s var(--ease)}
.j-step:hover{transform:translateY(-6px);box-shadow:var(--shadow-lg)}
.j-num{font-family:var(--ff-head);font-size:.9rem;font-weight:700;color:var(--white);background:var(--gold);width:2.1rem;height:2.1rem;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:1.1rem}
.j-step h3{font-family:var(--ff-head);font-size:1.28rem;color:var(--charcoal);margin-bottom:.6rem}
.j-step p{font-size:.92rem;color:var(--mid);line-height:1.55}
/* cluster + spokes */
.hub-cluster{padding:4.5rem 2rem}
.hub-cluster + .hub-cluster{padding-top:0}
.cluster-head{max-width:1100px;margin:0 auto 1.8rem;display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap;border-bottom:2px solid var(--gold);padding-bottom:1rem}
.cluster-head h2{font-family:var(--ff-head);font-size:clamp(1.5rem,2.6vw,2.1rem);color:var(--charcoal)}
.cluster-head .c-count{font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:var(--gold);font-weight:700;white-space:nowrap}
.spoke-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1.2rem}
.spoke-card{display:block;background:var(--white);border:1px solid var(--light);border-left:3px solid var(--gold);border-radius:var(--radius);padding:1.5rem 1.6rem;text-decoration:none;transition:transform .35s var(--ease),box-shadow .35s var(--ease),border-color .35s}
.spoke-card:hover{transform:translateY(-4px);box-shadow:var(--shadow);border-left-color:var(--navy)}
.spoke-card h3{font-family:var(--ff-head);font-size:1.12rem;color:var(--charcoal);line-height:1.3;margin-bottom:.5rem}
.spoke-card p{font-size:.88rem;color:var(--mid);line-height:1.5}
.spoke-card .read{display:inline-block;margin-top:.9rem;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--navy)}
.spoke-soon{background:transparent;border-left:3px solid var(--light)}
.spoke-soon h3{color:var(--mid)}
.spoke-soon .read{color:var(--gold)}
.hub-faq .faq-item{border-bottom:1px solid var(--light)}
.faq-item summary{font-family:var(--ff-head);font-size:1.12rem;color:var(--charcoal);padding:1.2rem 0;cursor:pointer;list-style:none;display:flex;justify-content:space-between;gap:1rem}
.faq-item summary::after{content:'+';color:var(--gold);font-size:1.5rem;line-height:1}
.faq-item[open] summary::after{content:'\\2212'}
.faq-a{padding:0 0 1.3rem;color:var(--mid);line-height:1.65}
.container-narrow{max-width:780px}
.article-body{max-width:760px;margin:0 auto;padding:3.5rem 2rem}
.article-body h2{font-family:var(--ff-head);font-size:clamp(1.5rem,2.4vw,2rem);color:var(--charcoal);margin:2.6rem 0 1rem}
.article-body h3{font-family:var(--ff-head);font-size:1.25rem;color:var(--charcoal);margin:1.8rem 0 .7rem}
.article-body p{color:var(--mid);line-height:1.75;margin-bottom:1.1rem;font-size:1.02rem}
.article-body ul,.article-body ol{margin:0 0 1.3rem 1.2rem;color:var(--mid);line-height:1.7}
.article-body li{margin-bottom:.5rem}
.article-tldr{background:var(--navy-lt);border-left:4px solid var(--navy);padding:1.4rem 1.6rem;border-radius:var(--radius);margin-bottom:2.2rem}
.article-tldr strong{color:var(--charcoal)}
.hub-back{display:inline-block;margin-top:2.4rem;font-size:.82rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--navy);text-decoration:none}
@media(max-width:880px){.hub-journey-grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.hub-journey-grid{grid-template-columns:1fr}.hub-hero{padding:4.5rem 1.4rem 3.5rem}}
</style>`;

function renderHub(spec) {
  const url = `${SITE}/${spec.slug}`;
  const crumbs = [{ name: 'Home', url: `${SITE}/` }, { name: spec.crumb || spec.h1, url }];
  const itemList = { '@type': 'ItemList', itemListElement: [] };
  let pos = 0;

  const clustersHtml = spec.clusters.map((cl) => {
    const cards = cl.spokes.map((sp) => {
      const live = slugExists(sp.slug);
      if (live) itemList.itemListElement.push({ '@type': 'ListItem', position: ++pos, url: `${SITE}/${sp.slug}`, name: sp.title });
      const href = live ? ` href="${sp.slug}.html"` : '';
      const tag = live ? 'a' : 'div';
      const cls = live ? 'spoke-card' : 'spoke-card spoke-soon';
      const read = live ? 'Read the guide &rarr;' : 'In the library &middot; expanding';
      return `<${tag}${href} class="${cls}"><h3>${esc(sp.title)}</h3><p>${esc(sp.blurb)}</p><span class="read">${read}</span></${tag}>`;
    }).join('\n      ');
    return `<section class="hub-cluster">
  <div class="cluster-head"><h2>${esc(cl.name)}</h2><span class="c-count">${esc(cl.label)}</span></div>
  <div class="spoke-grid">
      ${cards}
  </div>
</section>`;
  }).join('\n');

  const collectionPage = { '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: spec.title, description: spec.metaDesc, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#organization` }, inLanguage: 'en-US', mainEntity: itemList };
  const graph = [ORG, WEBSITE, collectionPage, breadcrumb(crumbs)];
  const fq = faqSchema(spec.faq); if (fq) graph.push(fq);

  const meta = (spec.heroMeta || []).map((m) => `<div><span class="m-num">${esc(m.num)}</span><span class="m-lbl">${esc(m.lbl)}</span></div>`).join('');
  const steps = (spec.journey || []).map((s, i) => `<div class="j-step"><div class="j-num">${i + 1}</div><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join('\n    ');

  const body = `${HUB_STYLE}
<body data-page="${spec.slug}">

<section class="hub-hero">
  <div class="hub-hero-inner">
    <p class="hub-eyebrow">${esc(spec.eyebrow)}</p>
    <h1>${spec.h1}</h1>
    <p class="hub-lede">${spec.lede}</p>
    ${meta ? `<div class="hub-hero-meta">${meta}</div>` : ''}
  </div>
</section>

<div class="breadcrumb"><div class="container"><a href="index.html">Home</a><span>&rsaquo;</span>${esc(spec.crumb || spec.h1)}</div></div>

${spec.journey ? `<section class="hub-journey">
  <div class="container" style="text-align:center;max-width:720px">
    <p class="section-label">${esc(spec.journeyLabel || 'The Path')}</p>
    <h2 class="section-title">${esc(spec.journeyTitle || 'Your Path Into Real Estate')}</h2>
  </div>
  <div class="hub-journey-grid">
    ${steps}
  </div>
</section>` : ''}

${clustersHtml}

${faqHtml(spec.faq)}
${ctaHtml(spec)}`;

  return head(spec, graph) + body + SCRIPTS;
}

// ── ARTICLE (spoke) ──────────────────────────────────────────────────────
function renderArticle(spec) {
  const url = `${SITE}/${spec.slug}`;
  const crumbs = [{ name: 'Home', url: `${SITE}/` }];
  if (spec.hub) crumbs.push({ name: spec.hub.name, url: `${SITE}/${spec.hub.slug}` });
  crumbs.push({ name: spec.crumb || spec.h1, url });

  const article = { '@type': 'Article', '@id': `${url}#article`, headline: spec.h1, description: spec.metaDesc, url, inLanguage: 'en-US', author: { '@id': `${SITE}/#organization` }, publisher: { '@id': `${SITE}/#organization` }, mainEntityOfPage: url, about: spec.about || 'Real estate careers in Volusia and Flagler County, Florida' };
  const graph = [ORG, WEBSITE, article, breadcrumb(crumbs)];
  const fq = faqSchema(spec.faq); if (fq) graph.push(fq);

  const bc = `<div class="breadcrumb"><div class="container"><a href="index.html">Home</a><span>&rsaquo;</span>${spec.hub ? `<a href="${spec.hub.slug}.html">${esc(spec.hub.name)}</a><span>&rsaquo;</span>` : ''}${esc(spec.crumb || spec.h1)}</div></div>`;

  const body = `${HUB_STYLE}
<body data-page="${spec.slug}">

<section class="page-hero">
  <img class="page-hero-bg" src="${spec.heroImg}" alt="" />
  <div class="page-hero-overlay"></div>
  <div class="page-hero-content">
    <p class="page-hero-eyebrow">${esc(spec.eyebrow)}</p>
    <h1>${spec.h1}</h1>
  </div>
</section>
${bc}

<article class="article-body">
  ${spec.tldr ? `<div class="article-tldr"><strong>Short answer:</strong> ${spec.tldr}</div>` : ''}
  ${spec.body}
  ${spec.hub ? `<a class="hub-back" href="${spec.hub.slug}.html">&larr; Back to ${esc(spec.hub.name)}</a>` : ''}
</article>

${faqHtml(spec.faq)}
${ctaHtml(spec)}`;

  return head(spec, graph) + body + SCRIPTS;
}

// ── run ──────────────────────────────────────────────────────────────────
const only = process.argv.slice(2);
const specs = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.json'));
let n = 0;
for (const file of specs) {
  const spec = JSON.parse(fs.readFileSync(path.join(CONTENT, file), 'utf8'));
  if (only.length && !only.includes(spec.slug)) continue;
  const html = spec.type === 'hub' ? renderHub(spec) : renderArticle(spec);
  fs.writeFileSync(path.join(ROOT, `${spec.slug}.html`), html);
  console.log(`✓ ${spec.type.padEnd(7)} ${spec.slug}.html`);
  n++;
}
console.log(`\nBuilt ${n} page(s).`);
