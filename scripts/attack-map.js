#!/usr/bin/env node
/* attack-map.js — renders the full "web of attack" from the manifest. */
const fs = require('fs');
const path = require('path');
const M = require('../content/manifest.js');

const TRACK_COLOR = { experienced: '#c9a84c', referral: '#5aa9e6', aspiring: '#6fcf97' };
const FMT = { guide: '📘 guide', article: '📄 article', comparison: '⚔️ comparison', tool: '🧮 tool', faq: '❓ faq', hub: '🏛 hub' };

// group a track's non-hub pages into query "patterns" (geo pages collapsed to {city})
function patterns(trackId) {
  const out = {};
  for (const p of M.pages.filter((x) => x.track === trackId && x.pillar !== 'master')) {
    const key = p.place ? p.title.replace(p.place, '{city}') : p.title;
    if (!out[key]) out[key] = { title: key, format: p.format, competitor: p.competitor, pillar: p.pillar, geo: !!p.place, n: 0, query: p.query ? (p.place ? p.query.replace(p.place, '{city}') : p.query) : '' };
    out[key].n++;
  }
  return Object.values(out);
}
const pillarTitle = (id) => (M.pillars.find((p) => p.id === id) || {}).title || id;

const competitors = [...new Set(M.pages.flatMap((p) => (p.competitor || '').split(',').map((s) => s.trim()).filter(Boolean)))];

const tracksHtml = M.tracks.map((t) => {
  const pats = patterns(t.id);
  const total = M.pages.filter((p) => p.track === t.id).length;
  const byPillar = {};
  for (const pat of pats) (byPillar[pat.pillar] = byPillar[pat.pillar] || []).push(pat);
  const clusters = Object.entries(byPillar).map(([pid, rows]) => `
    <div class="cluster">
      <div class="cluster-h">${pillarTitle(pid)}</div>
      ${rows.map((r) => `<div class="row">
        <span class="fmt">${FMT[r.format] || r.format}</span>
        <span class="q">${r.title}${r.geo ? `<span class="mult">×${r.n} markets</span>` : ''}</span>
        <span class="beat">beats ${r.competitor || '—'}</span>
      </div>`).join('')}
    </div>`).join('');
  return `<section class="track" style="--c:${TRACK_COLOR[t.id]}">
    <div class="track-h">
      <span class="pri">P${t.priority}</span>
      <div><div class="track-title">${t.title}</div><div class="track-aud">${t.audience}</div></div>
      <span class="track-n">${total}</span>
    </div>
    ${clusters}
  </section>`;
}).join('');

const fmtCounts = M.pages.reduce((a, p) => ((a[p.format] = (a[p.format] || 0) + 1), a), {});

const html = `<!doctype html><html><head><meta charset="utf8"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0f1620;color:#e8edf2;font-family:'DM Sans',system-ui,sans-serif;padding:48px 56px;max-width:1180px;margin:0 auto}
h1{font-family:Georgia,serif;font-size:38px;letter-spacing:-.5px}
.sub{color:#8a99a8;margin:8px 0 28px;font-size:15px;max-width:80ch;line-height:1.6}
.stats{display:flex;gap:14px;margin-bottom:36px;flex-wrap:wrap}
.stat{background:#16202c;border:1px solid #243240;border-radius:8px;padding:14px 20px}
.stat b{font-family:Georgia,serif;font-size:26px;color:#c9a84c;display:block}
.stat span{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#7d8c9b}
.tracks{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.track{background:#13202c;border:1px solid #243240;border-top:3px solid var(--c);border-radius:8px;padding:20px}
.track:first-child{grid-column:1/3}
.track-h{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.pri{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;color:#0f1620;background:var(--c);padding:3px 9px;border-radius:4px}
.track-title{font-family:Georgia,serif;font-size:20px;color:#fff}
.track-aud{font-size:12.5px;color:#8a99a8;margin-top:2px}
.track-n{margin-left:auto;font-family:Georgia,serif;font-size:30px;color:var(--c)}
.cluster{margin:10px 0 14px}
.cluster-h{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--c);border-bottom:1px solid #243240;padding-bottom:5px;margin-bottom:7px}
.row{display:flex;align-items:baseline;gap:12px;padding:5px 0;font-size:13.5px}
.fmt{flex:0 0 116px;font-size:12px;color:#aebccb}
.q{flex:1;color:#e8edf2}
.mult{font-family:'DM Mono',monospace;font-size:11px;color:#c9a84c;margin-left:8px;background:#1d2a36;padding:1px 7px;border-radius:3px}
.beat{flex:0 0 auto;font-size:11.5px;color:#7d8c9b;font-style:italic}
.legend{margin-top:34px;display:flex;gap:26px;flex-wrap:wrap;border-top:1px solid #243240;padding-top:20px;font-size:13px;color:#aebccb}
.geo{margin-top:22px;font-size:13px;color:#8a99a8;line-height:1.8}
.geo b{color:#c9a84c}
.hit{margin-top:20px;font-size:13px;line-height:1.9}
.hit b{color:#e06a5e}
</style></head><body>
<h1>The Web of Attack</h1>
<p class="sub">Florida Realtor Careers · Adams, Cameron &amp; Co. — demand-first. Every page targets a real question a prospect asks <em>before</em> they pick a brokerage, in its highest-citation format, aimed at the competitor it displaces. Scale engine = <b style="color:#c9a84c">geography × decision</b>.</p>
<div class="stats">
  <div class="stat"><b>${M.pages.length}</b><span>pages mapped now</span></div>
  <div class="stat"><b>3</b><span>audience tracks</span></div>
  <div class="stat"><b>${M.markets.length}</b><span>local markets</span></div>
  <div class="stat"><b>5</b><span>content formats</span></div>
  <div class="stat"><b>↑1,500</b><span>expandable</span></div>
</div>
<div class="tracks">${tracksHtml}</div>
<div class="geo"><b>The geography multiplier (×${M.markets.length}):</b> ${M.markets.map((m) => m.place).join(' · ')}</div>
<div class="legend"><b>Formats:</b> ${Object.entries(fmtCounts).filter(([k]) => k !== 'hub').map(([k, v]) => `${FMT[k]} ${v}`).join('&nbsp;&nbsp; ')}</div>
<div class="hit"><b>Competitors we displace:</b> ${competitors.join(' · ')}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, '..', 'attack-map.html'), html);
console.log('✓ attack-map.html written');
