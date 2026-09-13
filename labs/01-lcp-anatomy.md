# Lab 01: LCP anatomy

Catalog page of the slow shop. Profile as in `docs/baseline.md` (incognito, CPU 4.4×, Slow 4G, cache off).
Each run: record and reload, no interaction, stop after the hero painted. One run per step.

## Hypothesis

LCP = TTFB + resource load delay + resource load duration + element render delay. The hero image should be the
LCP element. `loading="lazy"` inflates load delay; `fetchpriority="high"` should shave a little more; the 1.9 MB
file dominates load duration and is out of scope here (lab 06).

## Numbers

| Step | Change | LCP | Element | TTFB | Load delay | Load duration | Render delay | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | lab 00 recording, with clicks | 1.70 s | 1.svg | 421 | 171 | 573 | 533 | 0.41 |
| 1 | honest baseline, no interaction | 15.07 s | hero.png | 416 | 1 206 | 13 425 | 28 | 0.53 |
| 2 | remove `loading="lazy"` | 14.12 s | hero.png | 442 | 153 | 13 495 | 31 | 0.09 |
| 3 | add `fetchpriority="high"` | 14.11 s | hero.png | 439 | 149 | 13 496 | 26 | 0.08 |
| 4 | hero as CSS `background-image` (experiment) | 1.62 s* | 1.svg | 415 | 173 | 570 | 464 | 0.06 |

\* Recording stopped at ~12 s before the hero painted, so LCP fell back to the first card. The measurement that
matters for step 4 is the hero request start: **~1.57 s** vs ~0.59 s as an `<img>` (queuing 226 ms, waiting 593 ms,
priority Low → High).

## Reading

- Step 0 → 1: the same page, 1.70 s vs 15.07 s. The only difference is a click. LCP stops at first input; a
  recording (or a real user) that interacts early reports a smaller element. Method decides the number.
- Step 1 → 2: removing `loading="lazy"` cut load delay from 1 206 ms to 153 ms. A lazy image waits for layout before
  the browser checks whether it is in the viewport; layout waited for two synchronous scripts in `<head>`. The
  preload scanner discovers a plain `<img>` while the HTML is still streaming.
- Same step, CLS 0.53 → 0.09 for free. A PNG carries its dimensions in the first bytes; an early request reveals
  the size before first paint and the browser reserves the space. The late request revealed it after paint.
- Step 2 → 3: `fetchpriority="high"` changed nothing measurable. The image was already requested as soon as it was
  discovered, and its 1.9 MB dwarfs the fonts and CSS it competes with. A fix only moves the phase that is the
  bottleneck. Kept anyway: zero cost, correct intent, matters on pages with many images.
- Step 4: moving the hero into CSS pushed the request start by ~1 s. A CSS URL is discovered only after the
  stylesheet downloads, parses, and the element reaches layout. The preload scanner reads HTML, not CSS.
  Same rule applies to images injected by JavaScript. Reverted after measuring.
- What remains: 13.5 s of load duration is bandwidth (1.9 MB at 1.4 Mbit/s ≈ 11 s plus sharing). Lab 06.
  TTFB ~440 ms is the fixture's fake 400 ms query. Phase 3.
- Side observation for lab 03: product SVGs load in a staircase of six because HTTP/1.1 allows six connections per
  origin; each stair pays Slow 4G's 562 ms round trip again.

Reference for all four phases (causes, diagnosis, fixes, model interview answer): `docs/lcp-phases.md`.

## Method lessons

- Record LCP with no interaction and keep recording until the intended element has painted; otherwise the
  fallback element hides the real number.
- Change one attribute per recording. Two of the four phases moved in this lab and each has a single cause.
- Read the request's own timings (click the bar in the Network track): queuing, waiting, download and priority
  explain a phase better than the phase total does.
