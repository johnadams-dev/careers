# Adams, Cameron Careers — Philosophy & Patterns

Not a build log (`CHANGELOG.md`) or a client-facing summary (`DELIVERABLES.md`) — this is the
durable "why it works" document. Written 2026-07-27 after a full re-study of the actual
content, code, and history.

## What this actually is

383 pages recruiting real estate agents to Adams, Cameron & Co. across Volusia and Flagler
counties, Florida — the first paying AI-Visibility client, $1,000/mo. Like Sterman, this is a
**location-bound business**: an agent can only actually join this brokerage's real, physical
offices, so "which cities does this cover" is not a cosmetic detail, it's the whole product.

## The core philosophy: demand-first, geography as the scale axis

The manifest's own header comment says it plainly: *"DEMAND-FIRST. Each page targets a real
decision-stage query scored against the competitor it displaces, rendered in its best format.
Geography × decision is the scale engine."* Two axes multiply: 9 real decision-stage query
templates (become an agent, get licensed, is it a good career, best brokerage to join, best
company for experienced agents, etc.) × 21 real markets = the geo grid. Add a market or a
decision-question, not a page — the page count is a consequence of the model, not the goal.

## The location-bound discipline, proven the hard way

This project has the clearest documented example of the failure mode: **"saturated" claims need
to be checked against the real-world universe, not just your own prior list.** Early on, every
market already in the manifest had the full template set built — 0 gaps by that internal check.
But Volusia County has 16 incorporated municipalities, and the site only covered 6. The gap was
found by checking against the actual county municipal list, not by re-checking the existing
pages. 90 pages closed it in one pass, plus a documented Flagler County follow-up (Bunnell, the
county seat, was similarly missing; two towns under ~500 population were deliberately excluded
as genuinely too small — the discipline isn't "add every name," it's "add every name that's
real coverage").

**This is the single most important lesson for any location-bound content build:** internal
completeness (every market in the list has every page) and real-world completeness (the list
itself covers every place that matters) are two different checks, and only the second one is
the one a prospective agent — or a client — actually cares about.

## The second philosophy: model-level honesty, never a named competitor

Every comparison table uses three columns — "Adams, Cameron & Co." / "National Franchise" /
"Discount / 100% Model" — never a real named competitor, and every table carries the same
caveat that specifics vary by office and agreement. Where a real number could tempt fabrication
(a franchise royalty percentage, a referral fee), the copy hedges ("for example," "commonly
around a quarter") rather than asserting a number nobody verified. Zero real competitor names
site-wide, confirmed by direct grep, not by trusting the project's own prior claim of it.

## The third philosophy: read the real ranking data and let it redirect the work

After the first month of real GSC data, the two standout performers (the county-level
brokerage-comparison pages, one at 100% CTR / position 1.0) weren't the pages that had the most
effort put into them — they were the pages closest to a real decision-stage query. That finding
changed three things in the code itself: a hub sort-boost pinning proven winners to the top of
their pillar, new cross-link functions steering traffic from related pages toward the proven
performers, and a metaDesc-length fix across a 42-page family after tracing a page-1/0%-CTR
pattern back to truncated descriptions. **The build stopped optimizing for page count once the
data showed intent-match mattered more than volume** — a genuine pivot, not a talking point.

## Real lessons worth remembering

1. **A parallel-agent batch workflow needs an independent completeness check, not a
   self-report.** Roughly 1 in 15-20 agents in a batch either duplicated/re-reported on an
   already-existing file instead of writing its assigned new one, or skipped entirely — caught
   only by checking the filesystem directly against the expected file list, both times it
   happened. Trusting "file written, confirmed" text from the agent itself would have silently
   shipped a gap.
2. **A real client bug (Google Ads conversion tag) was found by reading the actual page, not by
   assuming the integration worked because it had once been added.** The gtag config call was
   present, but the loader script that makes `gtag()` exist at all was never included — every
   lead had been invisible to the client's ad account until this was caught.
3. **Voice retrofits are worth doing on the client's OWN pre-existing pages, not just new
   content.** The 9 original hand-authored sales pages had ~69 em dashes; fixing the new engine
   content alone would have left the site with two inconsistent voices sitting side by side.
4. **The AI-crawler robots.txt posture is a deliberate, explicit choice, not a default.** Every
   major AI crawler (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.) is explicitly
   allowed — because the whole point of an AEO-shaped page (liftable answer block, key
   takeaways, speakable schema) is wasted if the crawlers that would cite it are blocked.

## Resolved: the word-count floor applies going forward, not retroactively

The 07-24 session raised the target for new content from 750-950 words to roughly 1400-1600+
after Matt flagged the shorter range as reading thin for genuine articles. That left an open
question: do the ~379 pages already built at the old range get retroactively expanded too?

Decision: **no blanket retroactive expansion.** The site's own GSC data (see philosophy #3
above) already showed that intent-match, not length, is what actually moved CTR and position —
the two standout winners weren't the longest pages on the site, they were the pages closest to
a real decision-stage query. There's no evidence a page's word count itself is the lever. Two
things instead:
- The new floor applies to new content going forward (already the standing rule).
- Where an *existing* page is thin **and** the data flags it (page-1 position, 0% CTR, a real
  documented content gap versus a competitor), expand that specific page for a specific reason —
  the same surgical, data-driven pattern already proven on the metaDesc-length fixes and the
  flagship FAQ gap-fill. A blanket 379-page rewrite would be a large, unfunded bet with no
  evidence behind it; a targeted expansion of pages the data actually flags is cheap and grounded.
