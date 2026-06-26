#!/usr/bin/env node
/*
 * seed-manifest.js — generates content/manifest.js (the site registry).
 *
 * Structured around the THREE recruiting paths Adams Cameron's own homepage
 * defines, weighted the way the business actually converts:
 *   1. EXPERIENCED agents — switch & scale (licensed; the money recruits)   [primary]
 *   2. REFERRAL — keep your license working without selling (licensed/inactive)
 *   3. ASPIRING / NEW agents — launch your career (not yet licensed)        [top-of-funnel volume]
 *
 * Track 3 is seeded from the audited content plan; tracks 1 & 2 are authored
 * here (the audit only covered the aspiring funnel). Re-run to re-seed.
 */
const fs = require('fs');
const path = require('path');

const PLAN = '/Users/mattg/ai-visibility-engine/audits/florida-real-estate-careers/data.json';

const slugify = (s) => s.toLowerCase()
  .replace(/&/g, ' and ').replace(/['’.,?:()"]/g, '').replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '').replace(/-+/g, '-').slice(0, 80);

const TRACKS = [
  { id: 'experienced', title: 'Experienced Agents — Switch & Scale', hub: 'switch-real-estate-brokerage-florida', audience: 'Licensed agents who want a better brokerage', priority: 1 },
  { id: 'referral',    title: 'Referral — Keep Your License Working', hub: 'real-estate-referral-program-florida', audience: 'Licensed but not actively selling', priority: 2 },
  { id: 'aspiring',    title: 'New & Aspiring Agents — Launch Your Career', hub: 'become-a-real-estate-agent-in-florida', audience: 'Not yet licensed / brand new', priority: 3 },
];

// ── TRACK 1: EXPERIENCED (authored — the primary conversion play) ────────────
const EXPERIENCED = {
  'switch': {
    title: 'Switch Your Brokerage', track: 'experienced',
    titles: [
      'Best Real Estate Brokerage for Experienced Agents in Volusia & Flagler County',
      'How to Switch Real Estate Brokerages in Florida: A Step-by-Step Guide',
      'How to Transfer Your Florida Real Estate License to a New Broker',
      '10 Questions to Ask Before Switching Real Estate Brokerages',
      "Signs It's Time to Leave Your Real Estate Brokerage",
      'Switching Brokerages Mid-Transaction: What Happens to Your Pending Deals in Florida',
      "How to Tell Your Broker You're Leaving Without Burning Bridges",
      'What Happens to Your Listings When You Change Brokerages in Florida',
      'Changing Brokerages as a Top Producer: What to Negotiate',
      'Moving to Adams Cameron: What to Expect in Your First 30 Days',
    ],
  },
  'economics': {
    title: 'Commissions, Splits & the Real Math', track: 'experienced',
    titles: [
      'Real Estate Commission Splits Explained for Experienced Florida Agents',
      'Commission Splits vs. Caps: Which Is Better for a Producing Agent?',
      'The Real Cost of Desk Fees, Tech Fees, and Hidden Brokerage Charges',
      '100% Commission vs. Full-Service Brokerage: The Honest Math',
      'What Should a Top-Producing Agent Negotiate With a Brokerage?',
      'How Much Do Experienced Real Estate Agents Make in Volusia County?',
      'Is Your Brokerage Worth Its Split? How to Run the Numbers',
    ],
  },
  'scale': {
    title: 'Tools & Support That Scale You', track: 'experienced',
    titles: [
      'The Marketing Tools That Actually Grow a Real Estate Business',
      'Why a Non-Competing Manager Changes Everything for a Busy Agent',
      'The Best CRM and Transaction Tools for Florida Real Estate Agents',
      'How a Referral Network Like Leading RE Sends You Business',
      'Stop Doing Your Own Marketing: What a Full-Service Brokerage Handles',
      "How Adams Cameron's Support Ecosystem Frees Up Your Selling Hours",
    ],
  },
  'grow': {
    title: 'Teams, Leadership & Advancement', track: 'experienced',
    titles: [
      'How to Start a Real Estate Team in Florida',
      'Solo Agent vs. Real Estate Team: Which Path Fits You?',
      'How to Get Your Florida Real Estate Broker License',
      'Florida Broker Associate License: Is It Worth It for Experienced Agents?',
      'When Should You Upgrade From Sales Associate to Broker in Florida?',
      'Becoming a Mentor or Team Leader at Your Brokerage',
    ],
  },
};

// ── TRACK 2: REFERRAL / INACTIVE LICENSE (authored — was missing entirely) ───
const REFERRAL = {
  'referral': {
    title: 'How the Referral Program Works', track: 'referral',
    titles: [
      'How a Real Estate Referral Company Works in Florida',
      'How to Earn Referral Income Without Actively Selling Real Estate',
      'Real Estate Referral Fees in Florida: How Much Can You Earn?',
      'Joining a Referral Brokerage: What to Look For',
      'How to Refer a Client and Get Paid as a Florida Agent',
    ],
  },
  'park': {
    title: 'Keep Your License Active', track: 'referral',
    titles: [
      'How to Keep Your Florida Real Estate License Active Without Selling',
      "Active vs. Inactive Real Estate License in Florida: What's the Difference?",
      'What to Do With Your Real Estate License If You Stop Selling',
      'How to "Park" Your Real Estate License in Florida',
      'Referral Company vs. Going Inactive: Which Keeps Your License Working?',
    ],
  },
  'life': {
    title: 'Life Changes & Your License', track: 'referral',
    titles: [
      'Keeping Your Real Estate License After You Move Out of the Area',
      'Selling Real Estate Part-Time in Florida: Is It Worth It?',
      'Retiring From Real Estate but Keeping Your License Working',
      'Going Back to Real Estate After Time Away: Reactivating in Florida',
    ],
  },
};

// ── TRACK 3: ASPIRING / NEW (from the audited content plan) ──────────────────
const ASPIRING_PILLARS = {
  'Local Area Pages':                                              { id: 'local',       title: 'Real Estate Careers by City',   hub: 'real-estate-careers-volusia-flagler' },
  'Getting Your Florida Real Estate License':                      { id: 'license',     title: 'Get Your Florida License',       hub: 'florida-real-estate-license' },
  "Is a Real Estate Career Right for You?":                        { id: 'decide',      title: "Decide If It's Right for You",   hub: 'is-real-estate-career-right-for-you' },
  'Choosing the Right Brokerage in Volusia & Flagler County':      { id: 'first-brokerage', title: 'Choosing Your First Brokerage', hub: 'choosing-first-real-estate-brokerage' },
  'Building Your Real Estate Business in Volusia & Flagler County': { id: 'startup',    title: 'Start Your Business',            hub: 'building-your-real-estate-business' },
  'Understanding the Volusia & Flagler County Real Estate Market':  { id: 'market',     title: 'Know the Local Market',          hub: 'volusia-flagler-real-estate-market' },
  'New Agent Training, Tools & Resources':                         { id: 'training',    title: 'New-Agent Training',             hub: 'new-agent-training' },
  'Costs, Income & Financial Reality of Real Estate Careers':      { id: 'income',      title: 'Income, Costs & Tools',          hub: 'real-estate-agent-income-florida' },
  'Local Career Stories, Culture & Community':                     { id: 'stories',     title: 'Stories, Culture & Community',    hub: 'real-estate-agent-stories-daytona' },
  // 'Agent Career Advancement & Licensing Upgrades' is folded into TRACK 1 'grow'
};

const BUILT = {
  'become-a-real-estate-agent-in-florida':    { type: 'hub',     track: 'aspiring', pillar: 'master',  title: 'How to Become a Real Estate Agent in Florida', spec: 'content/become-a-real-estate-agent-in-florida.json' },
  'florida-real-estate-license-guide':        { type: 'article', track: 'aspiring', pillar: 'license', title: 'How to Get Your Florida Real Estate License: Step-by-Step', spec: 'content/florida-real-estate-license-guide.json' },
  'become-a-real-estate-agent-daytona-beach': { type: 'article', track: 'aspiring', pillar: 'local',   title: 'How to Become a Real Estate Agent in Daytona Beach, FL', spec: 'content/become-a-real-estate-agent-daytona-beach.json' },
};

const pillars = [];
const pages = [];
const seen = new Set();

const addPage = (p) => { if (seen.has(p.slug)) return; seen.add(p.slug); pages.push(p); };

// master hubs (one per track)
for (const t of TRACKS) {
  const b = BUILT[t.hub];
  addPage({ slug: t.hub, type: 'hub', track: t.id, pillar: 'master', title: t.title, status: b ? 'built' : 'planned', ...(b ? { spec: b.spec } : {}) });
}

// authored tracks 1 & 2
for (const set of [EXPERIENCED, REFERRAL]) {
  for (const [id, p] of Object.entries(set)) {
    const hub = slugify(p.title);
    pillars.push({ id, track: p.track, title: p.title, hub });
    addPage({ slug: hub, type: 'hub', track: p.track, pillar: id, title: p.title, status: 'planned' });
    for (const title of p.titles) {
      let slug = slugify(title);
      if (seen.has(slug)) slug = `${slug}-${id}`;
      const b = BUILT[slug];
      addPage({ slug, type: b ? b.type : 'article', track: p.track, pillar: id, title, status: b ? 'built' : 'planned', ...(b ? { spec: b.spec } : {}) });
    }
  }
}

// track 3 from the audit plan
const plan = JSON.parse(fs.readFileSync(PLAN, 'utf8')).contentPlan;
for (const u of plan.universes) {
  const p = ASPIRING_PILLARS[u.name];
  if (!p) continue; // advancement universe intentionally skipped (folded into TRACK 1)
  pillars.push({ id: p.id, track: 'aspiring', title: p.title, hub: p.hub, format: u.type, planned: u.count });
  addPage({ slug: p.hub, type: 'hub', track: 'aspiring', pillar: p.id, title: p.title, status: 'planned' });
  for (const title of (u.titles || [])) {
    let slug = slugify(title);
    if (seen.has(slug)) slug = `${slug}-${p.id}`;
    const b = BUILT[slug];
    addPage({ slug, type: b ? b.type : 'article', track: 'aspiring', pillar: p.id, title, status: b ? 'built' : 'planned', ...(b ? { spec: b.spec } : {}) });
  }
}

// guarantee every built page is in the registry, even if its slug didn't match
// an authored/audited title
for (const [slug, b] of Object.entries(BUILT)) {
  if (!seen.has(slug)) addPage({ slug, type: b.type, track: b.track, pillar: b.pillar, title: b.title || slug, status: 'built', spec: b.spec });
}

const out = `/*
 * manifest.js — THE SITE REGISTRY (single source of truth).
 *
 * Organized by the three recruiting paths Adams Cameron's homepage defines —
 * experienced (switch & scale), referral (keep your license working), and
 * aspiring (launch your career) — weighted toward who actually converts.
 * The build reads this to render pages and auto-generate sitemap.xml, llms.txt,
 * navigation, and a coverage report. Add a page = add a row. Flip 'planned' →
 * 'built' as pages ship.
 *
 * Generated by scripts/seed-manifest.js · ${pages.length} pages · ${pillars.length} pillars · ${TRACKS.length} tracks.
 */
module.exports = {
  site: 'https://floridarealtorcareers.com',
  brand: 'Florida Realtor Careers — Adams, Cameron & Co., Realtors',
  tracks: ${JSON.stringify(TRACKS, null, 2)},
  pillars: ${JSON.stringify(pillars, null, 2)},
  pages: ${JSON.stringify(pages, null, 2)},
};
`;
fs.writeFileSync(path.join(__dirname, '..', 'content', 'manifest.js'), out);

const byTrack = (id) => pages.filter((p) => p.track === id);
console.log(`✓ manifest.js: ${pages.length} pages · ${pillars.length} pillars · ${TRACKS.length} tracks`);
for (const t of TRACKS) {
  const tp = byTrack(t.id);
  console.log(`  · ${t.id.padEnd(12)} ${String(tp.length).padStart(3)} pages (${tp.filter((p) => p.status === 'built').length} built)`);
}
