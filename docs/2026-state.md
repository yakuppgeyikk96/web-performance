# State of web performance, September 2026

Research snapshot taken 2026-09-12, cross-checked against primary sources (web.dev, developer.chrome.com,
Google Search Central, HTTP Archive). Revisit at each phase boundary.

## What is true

- **Core Web Vitals thresholds are unchanged**: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, at p75, mobile and desktop
  assessed separately, page-level. Source: web.dev/articles/vitals; Search Central CWV doc (updated 2025-12-10).
- **FID is gone** (replaced by INP on 2024-03-12). **LCP and INP are Baseline** since 2025-12 (Firefox and Safari expose them).
- **INP is the most failed metric** (~43% of sites) and the global "good INP" share is *falling* in 2026
  (87.2% → 85.3% Mar–Aug). Chrome has no confirmed cause. Investigate your own RUM by route/device/browser, not the trend.
- **Soft navigations** ship by default in Chrome 151 (2026-08): SPA route changes get their own LCP/CLS/INP.
  `web-vitals` v6 supports `reportSoftNavs`. Gotcha: the initial load's metrics finalize at the first soft nav.
- **LoAF (Long Animation Frames)** is the standard INP debugging substrate: > 50 ms frames with script attribution
  plus style/layout/render phase breakdown.
- **Lighthouse 13** (2025-10, Chrome 143): audits merged with DevTools Performance Insights; old audits removed from
  the report *and the JSON* (`first-meaningful-paint`, `offscreen-images`, `uses-rel-preload`, `preload-fonts`, ...).
  Legacy navigation mode is gone; user flows only. Pin LHCI versions and re-derive assertions.
- **CrUX Dashboard (Looker Studio) is deprecated**; use the CrUX API or BigQuery. Web Vitals extension deprecated in favor of DevTools.
- **Speculation Rules** (prefetch/prerender) is the largest instant-navigation lever for MPAs. Ray-Ban case: LCP −43%,
  conversion ×2. Does not apply to SPAs. `prerender_until_script` is in TAG review, not shipped.
- **Loading facts (HTTP Archive 2025)**: `fetchpriority="high"` adoption ~16%, `preload` ~2%, 103 Early Hints ~4%;
  LCP images are still 57% JPG / 26% PNG / 11% WebP. AVIF → WebP → JPEG via `<picture>` covers ~99%.
  **JPEG XL is not a viable default** (Chrome 145 re-added behind a flag only).
- **Compression**: Brotli is table stakes; zstd is marginal; the real 2026 story is shared compression dictionaries
  (RFC 9841, Chrome 130+).
- **HTTP/3 adoption** is reported anywhere from 21% to 39% depending on methodology; gains concentrate on lossy/mobile networks.
- **Toolchain**: Vite 8 (2026-03) uses Rolldown + Oxc; Rspack 2.x for webpack migrations; Turbopack default for Next dev.
- **React**: React Compiler 1.0 (2025-10-07), production-ready, works back to React 17. React 19.2 current; no React 20.
- **Next.js 16**: Cache Components complete PPR; everything dynamic by default, opt into caching with `use cache`. `experimental.ppr` removed.
- **`scheduler.yield()`**: Chrome/Edge 129+, not Baseline (Safari missing); keep a `setTimeout` fallback.
- **View Transitions**: same-document broadly available; cross-document is Chromium + Safari 18.2+, Firefox behind a flag. Progressive enhancement only.
- **bfcache**: `notRestoredReasons` (Chrome 123+) tells you why you missed. Pages with an open WebSocket can now enter bfcache (2026-06).
- **RAIL is superseded**: web.dev's own RAIL page now recommends Core Web Vitals. Nielsen's 0.1 s / 1 s / 10 s thresholds still hold and map onto INP's 200 ms good / 500 ms poor.
- **Skeleton screens** only help perceived performance roughly in the 400 ms – 3 s window (NN/g 2026). Below: flicker; above: show progress.
- **Device baseline 2026** (Alex Russell): p75 devices are a Samsung Galaxy A24 4G and an HP 14. Test against roughly that.
- **Median mobile home page**: 2.6 MB (+8.4% YoY).

## What is false (widely repeated in 2026 SEO content)

- "Google lowered the good LCP threshold to 2.0 s in March 2026." No primary source. Still 2.5 s.
- "Core Web Vitals are now assessed site-level / domain-aggregated." Google docs unchanged: page-level.
- "Engagement Reliability (ER) is a new Google metric." Does not exist on web.dev, Chrome docs, or in web-vitals. Do not cite.
- "Sites lost 20–35% traffic from the 2026 CWV update." Unsourced.
- "Smashing Front-End Performance Checklist 2026." Last confirmed edition is 2021.
- "High Performance Browser Networking 2nd edition." Does not exist.
- "Chrome 2026 tightened INP measurement." No Chromium metrics-changelog entry. The authoritative per-metric history is
  `chromium/src/docs/speed/metrics_changelog/`.

## Interview rubric (GreatFrontEnd, 2026-07)

Answer shape that scores: **metric → likely cause → measurement plan → fix.** Field vs lab fluency is explicitly rewarded
("Lighthouse for early diagnosis, field data for final confidence"). Discriminating question: *why Lighthouse misses INP problems*.
Differentiators in 2026: LoAF-based INP debugging, soft-navigation measurement, speculation rules with a cost argument,
"the fix is deleting this dependency" rather than "yield more".

## Sources (primary)

web.dev/articles/vitals · developers.google.com/search/docs/appearance/core-web-vitals ·
web.dev/blog/lcp-and-inp-are-now-baseline-newly-available · developer.chrome.com/docs/web-platform/soft-navigations-experiment ·
developer.chrome.com/docs/web-platform/long-animation-frames · developer.chrome.com/docs/web-platform/implementing-speculation-rules ·
developer.chrome.com/blog/use-scheduler-yield · developer.chrome.com/docs/web-platform/bfcache-notrestoredreasons ·
developer.chrome.com/blog/shared-dictionary-compression · developer.chrome.com/blog/lighthouse-13-0 ·
developer.chrome.com/blog/devtools-realtime-cwv · developer.chrome.com/blog/crux-dashboard-deprecation ·
almanac.httparchive.org/en/2025/performance · react.dev/blog/2025/10/07/react-compiler-1 · nextjs.org/blog/next-16 ·
web.dev/articles/optimize-lcp · web.dev/articles/content-visibility · web.dev/articles/rail ·
infrequently.org/2025/11/performance-inequality-gap-2026/ · infrequently.org/2026/08/notes-on-performance-remediation-strategies/ ·
csswizardry.com/2026/09/web-perf-wednesday-008-good-inp-rates-keep-falling/ · web.dev/case-studies ·
greatfrontend.com/blog/web-performance-interview-questions · perfnow.nl
