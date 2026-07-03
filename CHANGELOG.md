# Changelog

Internal build log for floridarealtorcareers.com (Adams, Cameron & Co. careers site). Newest first. All times Eastern. For a clean, date-free version to share with the client, see DELIVERABLES.md.

---

## 2026-07-03

### 14:05 EDT — Batch 4: +10 "Is Real Estate a Good Career" articles (56 -> 66 of 113)
- One honest decide-stage article per market (all ten), answering "is real estate a good career" straight: self-employment reality, the actual day-to-day job, income framed honestly (linked to the income estimator tool instead of a made-up number), why the first year is the hardest, the local market as a real but partial advantage, and what separates agents who stick around.
- Wrote the Daytona Beach piece by hand first to set the exact quality bar (Otto anti-AI-tells doctrine: no em dashes, no filler vocabulary, no throat-clearing openers, no fabricated stats), then had 3 parallel agents localize the remaining 9 off that exemplar, 3 cities per agent to cut subagent overhead versus one agent per page.
- All 10 self-verified (valid JSON, 0 em dashes, 0 banned words) before wiring in. Sitemap now 66 library URLs. Coverage: experienced 23/33, referral 2/5, aspiring 41/75.

### 13:20 EDT — Batch 3: +13 experienced-track comparisons (43 -> 56 of 113)
- Closed out the remaining experienced-agent "best brokerage" comparisons: Deltona, Palm Coast, Flagler Beach, Flagler County (long-form, ~1,500-1,600 words each, matching the Daytona Beach flagship template).
- Shipped 9 "best real estate company to work for" comparisons (shorter AEO format): Ormond Beach, Port Orange, New Smyrna Beach, DeLand, Deltona, Palm Coast, Flagler Beach, Volusia County, Flagler County.
- All grounded in real facts already verified in earlier local guides (no invented statistics): Deltona as Volusia's largest city by population, Palm Coast/Flagler as the 6th-fastest-growing county in FL with a ~$349K median, Flagler Beach as a quiet coastal town, DeLand as the historic county seat/home of Stetson University, Port Orange along the Dunlawton corridor, New Smyrna Beach's second-home/relocation market.
- Generated via 13 parallel Sonnet agents, each self-verified (valid JSON, 0 em dashes) before handoff. Wired into `scripts/seed-manifest.js` BUILT map, reseeded, rebuilt. Site-wide em-dash grep still 0. Sitemap now 65 URLs.
- Coverage by track: experienced 23/33, referral 2/5, aspiring 31/75. Next up per build order: remaining "decide" articles (Is Real Estate a Good Career in [city]) and city/county license guides, then the income-estimator tool pages.

## 2026-06-29

### 18:45 EDT — Search Console ownership cleaned up (commit 9876546)
- The HTML file added at 16:23 to verify Search Console access registered Matt as a verified "owner" of the property, which triggered a "new owner" alert email from Google to John. John flagged it; resolved same hour.
- Clarified to John that "owner" is only Search Console's word for "can view search stats," never any control over the site or domain. Removed the verification file from the repo (so Google drops the owner status), then removed the property from Matt's own account entirely. Matt is fully disconnected from his side.
- Going forward, John grants access the clean way: adds mattgoren@gmail.com as a Full *user* on his property, which he can revoke anytime. Email sent with step-by-step instructions. Restores the indexing/ranking visibility needed to track the new pages, with John in full control.

### 17:30 EDT — Batch 2 shipped: +15 comparison pages (28 -> 43 of 113)
- 10 "best real estate company for new agents in [place]" comparisons (aspiring track): Daytona Beach, Ormond Beach, Port Orange, New Smyrna Beach, DeLand, Deltona, Palm Coast, Flagler Beach, Volusia County, Flagler County. Angled for the brand-new agent (onboarding, training calendar, mentorship, first-deal support) and deliberately distinct from the "best brokerage to join" siblings.
- 5 "best brokerage for experienced agents in [city]" comparisons (experienced/producing-agent track): Daytona Beach, Ormond Beach, Port Orange, New Smyrna Beach, DeLand.
- All honest model-level tables (no fabricated competitor numbers), real AC facts, AEO + FAQ schema, 0 em dashes. Generated via 15 parallel agents, verified rendered clean, pushed direct to main.

### 17:05 EDT — John's original sales pages cleaned (commit d557ad0)
- Removed em dashes from John's 7 original pages (experienced-agents, new-agents, support, about, referral, foundation, join), rewriting to natural punctuation while preserving his wording, voice, and schema. **Entire public site now reads em-dash-free.** Verified live.

### 16:38 EDT — Em-dash retrofit across all engine content + homepage (commit 67a94b9)
- Rewrote em dashes into natural punctuation across all 19 older content specs, the AEO homepage, and the build-script title/llms strings. Engine-generated site greps zero em dashes. Done via 5 parallel generation agents; punctuation-only, no content shortened.

### 16:23 EDT — Google Search Console verification file (commit bd7cf9b)
- Added the Google site-verification file at the site root; serves correctly (200) past the catch-all rewrite. Enabled Search Console verification via site control (no domain/DNS access needed). Sitemap submitted to Google + Bing the same afternoon. Indexing/citation clock now running on all live pages.

### 15:51 EDT — Batch 1: +9 "best brokerage to join" city comparisons (commit 9a53f05)
- Shipped 9 new aspiring-track comparison pages, one per market: Daytona Beach, Ormond Beach, Port Orange, New Smyrna Beach, DeLand, Deltona, Palm Coast, Flagler Beach, Flagler County. Honest model-level comparison tables (no fabricated competitor numbers), real AC facts, AEO + FAQ schema. Site went 19 -> 28 of 113 pages.
- Also stripped em dashes from shared site chrome (nav banner, footer), the renderer's default CTA, track-title labels, and template comments. New pages grep clean.

### 15:14 EDT — Redesign merged to production (PR #3, commit c5f798e)
- Merged "The Listing" hub redesign + the scale engine. Replaced the generic v1 hub that had been live. Now possible because the client granted write access to the repo; pushed direct to main, Netlify auto-deployed, verified live.
