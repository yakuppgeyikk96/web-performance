# LCP by phase: causes, diagnosis, fixes

Reference note distilled from labs 00–01. LCP = **TTFB + resource load delay + resource load duration + element
render delay** (for a text LCP the middle two are zero). Optimise the largest phase first; a fix that targets a phase
that is not the bottleneck measures as zero (lab 01, step 3).

Before the phases, two checks that come first:

1. **Where is the number from?** Field (CrUX, RUM p75, segmented by page / device / country) is the verdict; a lab
   trace reproduces one scenario. A lab LCP can be "good" while users see a blank hero (lab 00).
2. **Which element?** Insights → "LCP request discovery" names it. Confirm it is the element you intend (hero, not a
   card, not a cookie banner). LCP freezes at the first input or scroll, so early interaction changes the element.

## 1. Time to first byte

What it is: navigation start → first byte of the HTML response.

Common causes: slow origin (uncached query, template render, cold serverless start), redirects (http→https,
www→apex, trailing slash), no CDN or CDN miss, far origin, TLS/DNS overhead on a cold connection, blocking
middleware (auth, geo lookup, A/B assignment), large HTML sent only after full render.

How to see it: Insights "Document request latency"; Network → document row → timing tab; `curl -w` with
`time_namelookup/connect/appconnect/starttransfer`; `Server-Timing` header from the origin.

Fixes: cache the page or its data (CDN, `stale-while-revalidate`, Redis), kill redirects, stream the HTML so the
`<head>` leaves before the slow data, move to edge/CDN, 103 Early Hints for the assets, fix the query (phase 3).
Budget: ~200 ms with edge cache, 800 ms is the "good" ceiling.

## 2. Resource load delay

What it is: TTFB → the moment the LCP resource request starts. Pure discoverability.

Common causes: `loading="lazy"` on the hero (waits for layout); image defined in CSS `background-image`
(discovered after CSS download + parse + layout); image injected by JavaScript or a framework after hydration;
`<img>` behind a client-side data fetch; late `<picture>`/`srcset` resolution; render-blocking scripts delaying
layout, which delays every lazy or CSS image.

How to see it: Insights "LCP request discovery" (three checks: fetchpriority, discoverable in HTML, not lazy);
Network track → click the request → "Queued at / Started at"; the gap between document finish and request start.

Fixes: plain `<img>` in the HTML, no lazy on above-the-fold images, `fetchpriority="high"`, `<link rel="preload"
as="image">` when the image must stay in CSS/JS, server-render the hero markup instead of fetching it.
Lab 01: lazy → 1 206 ms delay; plain img → 153 ms; CSS background → request start +1 s.

## 3. Resource load duration

What it is: request start → response end for the LCP resource. Bytes over the wire.

Common causes: oversized image (wrong dimensions for the slot, PNG for a photo, no modern format), no
`srcset`/`sizes` so the phone downloads the desktop file, uncompressed or badly compressed, third-party image host
with its own DNS/TLS, HTTP/1.1 connection limit contention with many small requests, priority too low so fonts
and scripts share the bandwidth.

How to see it: Insights "Improve image delivery" (estimated savings); Network → size vs rendered size; the
Priority column; the staircase pattern in the Network track for connection limits.

Fixes: AVIF/WebP via `<picture>`, responsive `srcset`/`sizes`, resize to the slot (at most 2× DPR), quality
tuning, CDN image transforms, self-host or `preconnect` to the image origin, HTTP/2+, `fetchpriority="high"`
when there is contention. Lab 01: 1.9 MB at Slow 4G = 13.5 s regardless of everything else.

## 4. Element render delay

What it is: resource loaded → element painted. Main thread and rendering work.

Common causes: render-blocking CSS/JS still running when the image arrives, long tasks from synchronous scripts or
hydration, image decode of a huge bitmap, the element not yet in the DOM (client-side rendered after data fetch),
`content-visibility`/`display:none` toggles, for text LCP: web font not loaded and `font-display: block`.

How to see it: Insights "Render-blocking requests", "Font display", "Long tasks"; the Main track between the
network bar end and the LCP marker; Timings track LCP flag.

Fixes: `defer`/`async`/`type="module"` scripts, inline critical CSS and defer the rest, split long tasks, avoid
client-side rendering of the hero, `decoding="async"` and appropriately sized images, `font-display: swap` or
`optional` with `size-adjust`, preload the hero font. Lab 00: 533 ms of render delay came from two sync scripts in
`<head>`; once the hero arrived late (lab 01) the main thread was idle and render delay fell to ~30 ms.

## Model interview answer

Question: *"A page's LCP is 4 seconds. What are your first three steps?"*

> First I ask where the 4 seconds comes from. If it is field data, CrUX or our RUM at p75, I segment it by page
> template, device class and country to find the worst slice, because the aggregate hides the problem. If it is a
> Lighthouse number, I treat it as one simulated run and go find the field number. Then I check which element is
> the LCP element on that page and whether it is the one we intend; a cookie banner or a small card being the LCP
> element is a different bug than a slow hero.
>
> Second, I record a trace under throttling that matches our users and read the LCP breakdown: TTFB, resource load
> delay, load duration, render delay. Each phase has its own cause. A big TTFB is origin, cache or redirects. A big
> load delay means the browser discovered the image late: lazy loading, a CSS background, or JavaScript injecting
> it. A big load duration is bytes: format, size, srcset. A big render delay is the main thread: blocking scripts,
> long tasks, or a font holding text.
>
> Third, I fix the largest phase with one change at a time and re-measure the same trace after each. For example,
> removing `loading="lazy"` from a hero cut its load delay from 1.2 s to 150 ms in a test I ran, while adding
> `fetchpriority` on the same page changed nothing because the bottleneck was the 1.9 MB file. Once the lab number
> moves, I confirm in RUM over the next release, because lab improvements that do not show up at p75 in the field
> did not happen.

Why it scores: field before lab, element identity before phases, phase → cause → fix mapping, one variable at a
time, and closing the loop with field data. Each claim carries a number.
