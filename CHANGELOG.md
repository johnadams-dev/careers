# Changelog

Internal build log for floridarealtorcareers.com (Adams, Cameron & Co. careers site). Newest first. All times Eastern. For a clean, date-free version to share with the client, see DELIVERABLES.md.

---

## 2026-06-29

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
