# Measurement baseline

Every number in `labs/` is taken under this profile unless the note says otherwise. Lab numbers are for
diagnosis and before/after comparison; field (RUM) numbers are the only ones that count as "good" or "poor".

## Host machine (2026-09-12)

- macOS (Darwin 25.6), Chrome 152.0.7977.83, Node 24.18.0, pnpm 12.3.4, Docker 29.7.2
- Apple M4

## Target device: 2026 p75 user

Per Alex Russell's "Performance Inequality Gap, 2026": the 75th-percentile device is a **Samsung Galaxy A24 4G**
class Android phone (Helio G99, ~5–6× slower single-core than a recent MacBook) on a **4G connection with real latency**.

## Browser profile

Incognito window or a dedicated extension-free Chrome profile. Extensions show up as third-party main-thread
time in the trace and distort every metric (lab 00 saw ~1.2 s from five extensions).

## DevTools profile

Performance panel → gear icon (Capture settings):

- **CPU**: "Mid-tier mobile device" calibrated preset = **4.4× slowdown** on this M4 (calibrated 2026-09-12).
  "Low-tier mobile device" = 16.8×, used only when a lab says "low-end check".
- **Network**: "Slow 4G" preset (1.4 Mbit/s down, 675 kbit/s up, 562.5 ms latency) for loading labs;
  "Fast 4G" (8.1 Mbit/s, 1.4 Mbit/s, 165 ms) for interaction labs where the network is not the variable.
- **Cache**: disabled for first-visit labs, enabled for repeat-visit labs; the note says which.
- **Viewport**: device toolbar, Galaxy A24-like 360 × 800, DPR 2.

## Lighthouse profile

Lighthouse 13 mobile defaults: 150 ms RTT, 1.6 Mbps down, 4× CPU. Used for the "simulated" numbers; DevTools
trace is used for diagnosis. Never report a single Lighthouse run: 3–5 runs, report median and spread.

## Repetition rule

- Loading metrics (LCP, CLS, TTFB): 5 runs, cold cache, median + min–max.
- Interaction metrics (INP): 5 interactions of the same kind, report the worst and the median.
- Server metrics (autocannon/k6): 30 s warm-up excluded, report p50 / p95 / p99.
