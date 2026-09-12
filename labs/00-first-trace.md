# Lab 00: first trace of the slow shop

Fixture: `shop/api` at its first commit (deliberately slow catalog page). Chrome 152, Apple M4.

## Setup

- Incognito window, so no extensions. The first attempt in the normal profile showed Phantom, MetaMask,
  Bitwarden, Google Translate and React DevTools eating ~1.2 s of main-thread time that the page never asked for.
- Performance panel: CPU "Mid-tier mobile device" (calibrated, 4.4×), Network "Slow 4G", network cache disabled.
  Without throttling the M4 hides every problem; the point is to approximate the p75 user's phone, not this laptop.
- Record and reload, then three "Add to cart" clicks and typing "lamp" into search, all in one recording.

## Numbers

| Metric | Value | Status |
| --- | --- | --- |
| LCP | 1.70 s | good (misleading, see below) |
| INP | 647 ms | poor |
| CLS | 0.41 | poor |

LCP phases: TTFB 421 ms · resource load delay 171 ms · resource load duration 573 ms · element render delay 533 ms.
LCP element: `/img/product/1.svg` (547 B), the first product card. `hero.png` (1.9 MB) finished loading at ~14 s.

INP interaction: keyboard (typing in search). Input delay 190 ms · processing 426 ms · presentation delay 31 ms.

CLS worst cluster at 1.74 s; top culprits: three unsized `img` elements.

Insights with estimated savings: render-blocking requests 2.41 s · image delivery 1.9 MB · font display 1.51 s ·
document request latency 64 kB · cache lifetimes 97 kB.

## Reading

- LCP measures the paint time of the largest content element. Here the hero image is the intended LCP element,
  but LCP stops updating at the first user input. The click at ~7 s froze it while the hero was still downloading,
  so the metric picked a tiny SVG card and reported "good" for a page whose hero was blank for 14 s.
  Real users click early too, so field LCP can look green on a page that feels broken.
- Because of that, LCP and INP need separate recordings: one untouched load for LCP/CLS, one for interactions.
- Element render delay (533 ms) is main-thread time: two synchronous scripts in `<head>` ran before anything painted.
- The "add fetchpriority=high" suggestion targets the SVG card. The tool optimises the element it measured,
  not the element we meant. Always check the LCP element name before acting on the advice.
- INP processing is the search handler: 240 cards × a fake fuzzy match per keystroke under 4.4× CPU. The 190 ms
  input delay is the previous keystroke's task still running when the next key arrived.

## Method lessons

- Measure in a clean profile (incognito or a dedicated extension-free profile).
- Always use the calibrated CPU preset and a throttled network; note the profile in every lab.
- Record LCP/CLS and INP separately; do not interact before the load settles.
- Read the tool's advice against the intent of the page; the LCP element it names may not be the one that matters.
