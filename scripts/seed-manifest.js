#!/usr/bin/env node
/*
 * seed-manifest.js — generates content/manifest.js, DEMAND-FIRST.
 *
 * Every page = a real, unbranded, decision-stage query a prospect asks BEFORE
 * choosing a brokerage, localized to our markets, scored against the competitor
 * it displaces (audit leaderboard: Gold Coast Schools, US Realty Training,
 * Indeed, FastExpert, daytonarealtors, Yelp…).
 *
 * Scale engine = GEOGRAPHY × DECISION (each query × each market = one localized
 * winnable page). Plus the Otto FORMAT system — each query renders in its
 * highest-citation format:
 *   guide · article · comparison · tool · faq
 * (comparison + tool are the formats that win AI citations; "best/vs" queries
 * become comparisons, "how much/cost" queries become interactive tools.)
 */
const fs = require('fs');
const path = require('path');

const slugify = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/['’.,?:()"]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');

const TRACKS = [
  { id: 'experienced', title: 'Experienced Agents — Switch & Scale', hub: 'best-brokerage-for-experienced-agents-volusia-flagler', audience: 'Licensed agents choosing where to hang their license', priority: 1 },
  { id: 'referral',    title: 'Referral — Keep Your License Working', hub: 'real-estate-referral-program-florida', audience: 'Licensed but not actively selling', priority: 2 },
  { id: 'aspiring',    title: 'New & Aspiring Agents — Launch Your Career', hub: 'become-a-real-estate-agent-in-florida', audience: 'Deciding to get in / getting licensed / picking a first brokerage', priority: 3 },
];

const PILLARS = [
  { id: 'choose-new', track: 'aspiring',    title: 'Which Brokerage to Join', hub: 'best-real-estate-brokerage-to-join-volusia-county' },
  { id: 'license',    track: 'aspiring',    title: 'Get Licensed Locally',    hub: 'florida-real-estate-license' },
  { id: 'decide',     track: 'aspiring',    title: 'Is It Right for You',      hub: 'is-real-estate-a-good-career-florida' },
  { id: 'compare',    track: 'aspiring',    title: 'Compare the Options',      hub: 'best-real-estate-companies-to-work-for-volusia' },
  { id: 'switch-exp', track: 'experienced', title: 'Switch Your Brokerage',    hub: 'best-brokerage-for-experienced-agents-volusia-flagler' },
  { id: 'economics',  track: 'experienced', title: 'Splits & the Real Math',   hub: 'real-estate-commission-splits-florida' },
  { id: 'scale',      track: 'experienced', title: 'Tools That Scale You',     hub: 'real-estate-agent-tools-support-florida' },
  { id: 'grow',       track: 'experienced', title: 'Teams & Advancement',      hub: 'real-estate-broker-license-teams-florida' },
  { id: 'referral',   track: 'referral',    title: 'The Referral Path',        hub: 'real-estate-referral-program-florida' },
  { id: 'park',       track: 'referral',    title: 'Keep Your License Active', hub: 'keep-florida-real-estate-license-active' },
];

const MARKETS = [
  { place: 'Daytona Beach', slug: 'daytona-beach', county: 'Volusia' },
  { place: 'Ormond Beach', slug: 'ormond-beach', county: 'Volusia' },
  { place: 'Port Orange', slug: 'port-orange', county: 'Volusia' },
  { place: 'New Smyrna Beach', slug: 'new-smyrna-beach', county: 'Volusia' },
  { place: 'DeLand', slug: 'deland', county: 'Volusia' },
  { place: 'Deltona', slug: 'deltona', county: 'Volusia' },
  { place: 'Palm Coast', slug: 'palm-coast', county: 'Flagler' },
  { place: 'Flagler Beach', slug: 'flagler-beach', county: 'Flagler' },
  { place: 'Volusia County', slug: 'volusia-county', county: 'Volusia' },
  { place: 'Flagler County', slug: 'flagler-county', county: 'Flagler' },
];

// decision query × {place} → one localized page, in its best Otto format
const TEMPLATES = [
  { pillar: 'choose-new', format: 'comparison', tier: 1, beat: 'FastExpert, Indeed',      title: (p) => `Best Real Estate Brokerage to Join in ${p}`,      slug: (s) => `best-real-estate-brokerage-to-join-${s}`,    query: (p) => `What is the best real estate brokerage to join in ${p}?` },
  { pillar: 'choose-new', format: 'comparison', tier: 1, beat: 'Indeed, daytonarealtors', title: (p) => `Best Real Estate Company for New Agents in ${p}`, slug: (s) => `best-real-estate-company-new-agents-${s}`,   query: (p) => `Which real estate company is best for new agents in ${p}?` },
  { pillar: 'license',    format: 'guide',      tier: 1, beat: 'Gold Coast Schools, US Realty Training', title: (p) => `How to Become a Real Estate Agent in ${p}`, slug: (s) => `become-a-real-estate-agent-${s}`,    query: (p) => `How do I become a real estate agent in ${p}?` },
  { pillar: 'license',    format: 'guide',      tier: 2, beat: 'Gold Coast Schools, myfloridalicense', title: (p) => `How to Get Your Florida Real Estate License in ${p}`, slug: (s) => `florida-real-estate-license-${s}`, query: (p) => `How do I get my Florida real estate license in ${p}?` },
  { pillar: 'decide',     format: 'article',    tier: 2, beat: 'Indeed, Reddit',          title: (p) => `Is Real Estate a Good Career in ${p}?`,          slug: (s) => `is-real-estate-a-good-career-${s}`,          query: (p) => `Is real estate a good career in ${p}?` },
  { pillar: 'decide',     format: 'tool',       tier: 2, beat: 'Indeed, Glassdoor',       title: (p) => `How Much Do Real Estate Agents Make in ${p}?`,    slug: (s) => `how-much-do-real-estate-agents-make-${s}`,   query: (p) => `How much do real estate agents make in ${p}?` },
  { pillar: 'switch-exp', format: 'comparison', tier: 1, beat: 'FastExpert, Glassdoor',   title: (p) => `Best Brokerage for Experienced Agents in ${p}`,  slug: (s) => `best-brokerage-experienced-agents-${s}`,     query: (p) => `What is the best brokerage for experienced agents in ${p}?` },
  { pillar: 'switch-exp', format: 'comparison', tier: 2, beat: 'Indeed, Glassdoor',       title: (p) => `Best Real Estate Company to Work For in ${p}`,   slug: (s) => `best-real-estate-company-to-work-for-${s}`,  query: (p) => `What is the best real estate company to work for in ${p}?` },
  { pillar: 'compare',    format: 'comparison', tier: 2, beat: 'Yelp, Indeed',            title: (p) => `Top Real Estate Companies to Work For in ${p}`,  slug: (s) => `top-real-estate-companies-to-work-for-${s}`, query: (p) => `What are the top real estate companies to work for in ${p}?` },
];

// evergreen "how" pages (non-geo) — each in its best format
const EVERGREEN = [
  { pillar: 'license',    format: 'guide',      title: 'How to Get Your Florida Real Estate License: Step-by-Step', query: 'What are the steps to get a real estate license in Florida and how long does it take?', beat: 'Gold Coast Schools' },
  { pillar: 'decide',     format: 'article',    title: 'Is a Real Estate Career Right for You? An Honest Look',      query: 'Should I become a real estate agent?', beat: 'Indeed, Reddit' },
  { pillar: 'switch-exp', format: 'guide',      title: 'How to Switch Real Estate Brokerages in Florida: Step-by-Step', query: 'How do I switch real estate brokerages in Florida?', beat: 'FastExpert' },
  { pillar: 'switch-exp', format: 'guide',      title: 'How to Transfer Your Florida Real Estate License to a New Broker', query: 'How do I transfer my Florida real estate license to a new broker?', beat: 'myfloridalicense' },
  { pillar: 'switch-exp', format: 'faq',        title: '10 Questions to Ask Before Switching Real Estate Brokerages', query: 'What should I ask before switching real estate brokerages?', beat: 'Reddit' },
  { pillar: 'economics',  format: 'comparison', title: 'Real Estate Commission Splits vs. Caps: Which Is Better?',    query: 'Commission split vs cap — which is better for a real estate agent?', beat: 'Reddit, Inman' },
  { pillar: 'economics',  format: 'article',    title: 'The Real Cost of Desk Fees and Hidden Brokerage Charges',     query: 'What are typical real estate desk fees and hidden brokerage costs?', beat: 'Reddit' },
  { pillar: 'economics',  format: 'comparison', title: '100% Commission vs. Full-Service Brokerage: The Honest Math', query: 'Is a 100% commission brokerage better than full service?', beat: 'Reddit' },
  { pillar: 'scale',      format: 'article',    title: 'Why a Non-Competing Manager Changes Everything for a Busy Agent', query: 'What is a non-competing manager and why does it matter?', beat: 'Inman' },
  { pillar: 'scale',      format: 'article',    title: 'Real Estate Marketing Tools That Actually Grow Your Business', query: 'What marketing tools do real estate agents actually need?', beat: 'Inman' },
  { pillar: 'grow',       format: 'guide',      title: 'How to Get Your Florida Real Estate Broker License',          query: 'How do I get my Florida real estate broker license?', beat: 'Gold Coast Schools' },
  { pillar: 'grow',       format: 'guide',      title: 'How to Start a Real Estate Team in Florida',                  query: 'How do I start a real estate team in Florida?', beat: 'Inman' },
  { pillar: 'referral',   format: 'faq',        title: 'How a Real Estate Referral Company Works in Florida',         query: 'How does a real estate referral company work in Florida?', beat: 'Reddit' },
  { pillar: 'referral',   format: 'article',    title: 'How to Earn Referral Income Without Actively Selling Real Estate', query: 'How can I earn real estate referral income without selling?', beat: 'Reddit' },
  { pillar: 'park',       format: 'guide',      title: 'How to Keep Your Florida Real Estate License Active Without Selling', query: 'How do I keep my Florida real estate license active without selling?', beat: 'myfloridalicense' },
  { pillar: 'park',       format: 'comparison', title: 'Active vs. Inactive Real Estate License in Florida: The Difference', query: "What's the difference between an active and inactive real estate license in Florida?", beat: 'myfloridalicense' },
];

// interactive tools (the Otto "tool" format — high citation value)
const TOOLS = [
  { pillar: 'economics', title: 'Real Estate Commission Split Calculator',            query: 'How much will I actually take home at different commission splits?' },
  { pillar: 'decide',    title: 'Florida Real Estate Agent Income Estimator',          query: 'How much can I make as a real estate agent in Florida?' },
  { pillar: 'license',   title: 'Florida Real Estate License Cost Calculator',         query: 'How much does it cost to get a Florida real estate license?' },
  { pillar: 'economics', title: 'Brokerage Fee Comparison Calculator (Splits, Caps & Desk Fees)', query: 'Which brokerage costs me less — splits vs caps vs desk fees?' },
];

const BUILT = {
  'become-a-real-estate-agent-in-florida':    { spec: 'content/become-a-real-estate-agent-in-florida.json' },
  'florida-real-estate-license-guide':        { spec: 'content/florida-real-estate-license-guide.json' },
  'become-a-real-estate-agent-daytona-beach': { spec: 'content/become-a-real-estate-agent-daytona-beach.json' },
  'best-brokerage-for-experienced-agents-volusia-flagler': { spec: 'content/best-brokerage-for-experienced-agents-volusia-flagler.json' },
  'best-brokerage-experienced-agents-volusia-county':      { spec: 'content/best-brokerage-experienced-agents-volusia-county.json' },
  'best-real-estate-brokerage-to-join-volusia-county':     { spec: 'content/best-real-estate-brokerage-to-join-volusia-county.json' },
  'become-a-real-estate-agent-ormond-beach':               { spec: 'content/become-a-real-estate-agent-ormond-beach.json' },
  'become-a-real-estate-agent-palm-coast':                 { spec: 'content/become-a-real-estate-agent-palm-coast.json' },
  'become-a-real-estate-agent-port-orange':                { spec: 'content/become-a-real-estate-agent-port-orange.json' },
  'become-a-real-estate-agent-new-smyrna-beach':           { spec: 'content/become-a-real-estate-agent-new-smyrna-beach.json' },
  'become-a-real-estate-agent-deland':                     { spec: 'content/become-a-real-estate-agent-deland.json' },
};
const EVERGREEN_SLUG_OVERRIDE = { 'How to Get Your Florida Real Estate License: Step-by-Step': 'florida-real-estate-license-guide' };

const trackOf = (pillarId) => (PILLARS.find((p) => p.id === pillarId) || {}).track;
const pages = [];
const seen = new Set();
const add = (p) => { if (seen.has(p.slug)) return; seen.add(p.slug); const b = BUILT[p.slug]; pages.push({ ...p, status: b ? 'built' : 'planned', ...(b ? { spec: b.spec } : {}) }); };

for (const t of TRACKS) add({ slug: t.hub, type: 'hub', format: 'hub', track: t.id, pillar: 'master', title: t.title });

for (const tpl of TEMPLATES) for (const m of MARKETS)
  add({ slug: tpl.slug(m.slug), type: 'page', format: tpl.format, track: trackOf(tpl.pillar), pillar: tpl.pillar, title: tpl.title(m.place), query: tpl.query(m.place), place: m.place, competitor: tpl.beat, tier: tpl.tier, winnable: true });

for (const e of EVERGREEN)
  add({ slug: EVERGREEN_SLUG_OVERRIDE[e.title] || slugify(e.title), type: 'page', format: e.format, track: trackOf(e.pillar), pillar: e.pillar, title: e.title, query: e.query, competitor: e.beat, evergreen: true, winnable: true });

for (const t of TOOLS)
  add({ slug: slugify(t.title), type: 'page', format: 'tool', track: trackOf(t.pillar), pillar: t.pillar, title: t.title, query: t.query, winnable: true });

const formatCounts = pages.reduce((a, p) => { a[p.format] = (a[p.format] || 0) + 1; return a; }, {});

const out = `/*
 * manifest.js — THE SITE REGISTRY (single source of truth), DEMAND-FIRST.
 *
 * Each page targets a real decision-stage query (.query) scored against the
 * competitor it displaces (.competitor), rendered in its best Otto format
 * (.format: guide | article | comparison | tool | faq). Geography × decision is
 * the scale engine. The build renders pages and auto-generates sitemap.xml,
 * llms.txt, nav, and a coverage report. Add a page = add a row.
 *
 * Generated by scripts/seed-manifest.js · ${pages.length} pages.
 */
module.exports = {
  site: 'https://floridarealtorcareers.com',
  brand: 'Florida Realtor Careers — Adams, Cameron & Co., Realtors',
  tracks: ${JSON.stringify(TRACKS, null, 2)},
  pillars: ${JSON.stringify(PILLARS, null, 2)},
  markets: ${JSON.stringify(MARKETS, null, 2)},
  pages: ${JSON.stringify(pages, null, 2)},
};
`;
fs.writeFileSync(path.join(__dirname, '..', 'content', 'manifest.js'), out);

console.log(`✓ manifest.js: ${pages.length} pages · ${MARKETS.length} markets · ${TEMPLATES.length} templates + ${EVERGREEN.length} evergreen + ${TOOLS.length} tools`);
console.log('  by track:  ' + TRACKS.map((t) => `${t.id} ${pages.filter((p) => p.track === t.id).length}`).join(' · '));
console.log('  by format: ' + Object.entries(formatCounts).map(([k, v]) => `${k} ${v}`).join(' · '));