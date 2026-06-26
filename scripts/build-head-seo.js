#!/usr/bin/env node
/*
 * build-head-seo.js — Month-1 technical foundation injector
 * Adds, idempotently, into every page's STATIC <head> (not via shared.js, so
 * AI crawlers that don't run JavaScript still see it):
 *   • <link rel="canonical">  (clean URLs, matching sitemap.xml)
 *   • Open Graph + Twitter card tags
 *   • JSON-LD: RealEstateAgent/Organization + WebSite + WebPage + BreadcrumbList
 * thank-you.html is marked noindex (it's already Disallowed in robots.txt).
 *
 * Re-run any time — a marker comment makes it safe to run repeatedly, and it
 * will drive the same head-block onto every new page in the 250/mo build.
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://floridarealtorcareers.com';
const ROOT = path.join(__dirname, '..');
const MARKER = '<!-- seo:injected -->';
const ANCHOR = '<link rel="stylesheet" href="css/styles.css" />';

// page slug (clean URL, matches sitemap.xml) + breadcrumb label. "" = homepage.
const PAGES = {
  'index.html':              { slug: '',                    crumb: null },
  'new-agents.html':         { slug: 'new-agents',          crumb: 'New Agents' },
  'experienced-agents.html': { slug: 'experienced-agents',  crumb: 'Experienced Agents' },
  'about.html':              { slug: 'about',               crumb: 'About Us' },
  'support.html':            { slug: 'support',             crumb: 'Support Team' },
  'referral.html':           { slug: 'referral',            crumb: 'Referral Program' },
  'foundation.html':         { slug: 'foundation',          crumb: 'Adams Cameron Foundation' },
  'join.html':               { slug: 'join',                crumb: 'Join Us' },
  'thank-you.html':          { slug: 'thank-you',           crumb: null, noindex: true },
};

// One canonical entity, repeated on every page (search engines dedupe by @id).
// Every field below is grounded in real site content — nothing invented.
const ORG = {
  '@type': ['RealEstateAgent', 'Organization'],
  '@id': `${SITE}/#organization`,
  name: 'Adams, Cameron & Co., Realtors',
  alternateName: 'Florida Realtor Careers',
  url: `${SITE}/`,
  logo: `${SITE}/images/ac-logo.png`,
  image: `${SITE}/images/ac-logo.png`,
  telephone: '+1-386-243-9504',
  foundingDate: '1963',
  slogan: "The Area's Largest Brokerage Since 1963",
  address: {
    '@type': 'PostalAddress',
    streetAddress: '600 S. Atlantic Ave',
    addressLocality: 'Daytona Beach',
    addressRegion: 'FL',
    postalCode: '32118',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Volusia County, Florida' },
    { '@type': 'AdministrativeArea', name: 'Flagler County, Florida' },
  ],
  sameAs: [
    'https://www.adamscameron.com',
    'https://www.facebook.com/adamscameron',
    'https://www.instagram.com/adamscameronrealtors/',
    'https://www.linkedin.com/company/adams-cameron',
  ],
};

const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  url: `${SITE}/`,
  name: 'Florida Realtor Careers',
  publisher: { '@id': `${SITE}/#organization` },
};

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&rsquo;|&#39;/g, "'").replace(/&mdash;/g, '—')
  .replace(/&ndash;/g, '–').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function build(file, meta, title, desc) {
  const url = `${SITE}/${meta.slug}`;
  const lines = [MARKER];

  if (meta.noindex) {
    lines.push('<meta name="robots" content="noindex, follow" />');
  } else {
    lines.push(`<link rel="canonical" href="${url}" />`);
  }

  // Open Graph + Twitter
  lines.push(
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="Florida Realtor Careers" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${desc}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE}/images/ac-logo.png" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${desc}" />`,
    `<meta name="twitter:image" content="${SITE}/images/ac-logo.png" />`,
  );

  if (!meta.noindex) {
    const webpage = {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description: desc,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
      inLanguage: 'en-US',
    };
    const graph = [ORG, WEBSITE, webpage];
    if (meta.crumb) {
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: meta.crumb, item: url },
        ],
      });
    }
    const ld = { '@context': 'https://schema.org', '@graph': graph };
    lines.push('<script type="application/ld+json">');
    lines.push(JSON.stringify(ld, null, 2));
    lines.push('</script>');
  }

  return lines.map((l) => '  ' + l).join('\n');
}

let changed = 0;
for (const [file, meta] of Object.entries(PAGES)) {
  const p = path.join(ROOT, file);
  let html = fs.readFileSync(p, 'utf8');

  // strip a previous injection (everything from MARKER to its closing comment)
  html = html.replace(new RegExp(`\\n?\\s*${MARKER}[\\s\\S]*?<!-- /seo -->`, ''), '');

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [, file])[1]);
  const desc = decode((html.match(/<meta\s+name="description"\s+content="([\s\S]*?)"/) || [, ''])[1]);

  const block = build(file, meta, title, desc) + '\n  <!-- /seo -->';
  if (!html.includes(ANCHOR)) { console.error(`! no anchor in ${file}`); continue; }
  html = html.replace(ANCHOR, `${ANCHOR}\n${block}`);
  fs.writeFileSync(p, html);
  console.log(`✓ ${file}${meta.noindex ? ' (noindex)' : ` → ${SITE}/${meta.slug}`}`);
  changed++;
}
console.log(`\nInjected SEO head block into ${changed} page(s).`);
