# Lab 02: CLS and INP anatomy

Catalog page, profile as in `docs/baseline.md`. CLS half: one recording per change, no interaction, hero painted
before stop. INP half: separate recordings with interactions. Method for naming a shift's cause:
`docs/finding-layout-shift-causes.md`.

## CLS

Hypothesis: three sources, three patterns: late-sized media (hero and card images without dimensions), injected
DOM (promo banner added by `app.js` 1.5 s after script start), font swap (Google Fonts without `font-display`).

### Inventory before any change (CLS 0.04, five shifts)

| Time | Score | Elements shifted | Tool's culprit | Real cause |
| --- | --- | --- | --- | --- |
| 1 698 ms | 0.0024 | one card's h3, meta, price, button | unsized img | card SVG arrived, `<img>` grew from 0 |
| 1 776 ms | 0.0024 | same, another card | unsized img | same |
| 2 703 ms | 0.0024 | h3 | font + unsized img | Inter swap |
| 3 029 ms | 0.0341 | toolbar, grid, headings | unsized img | **promo banner injected** by `app.js:36` |
| 3 185 ms | 0.0009 | h3, grid, toolbar | font | Playfair swap |

The 3 029 ms shift is 85% of the total. The tool blamed an unsized image; Bottom-up on the task at that instant
reads `Timer fired → Function call app.js:36 → Recalculate style → Layout → Paint`. The task told the truth.

### Changes

| Step | Change | CLS | What remained |
| --- | --- | --- | --- |
| 0 | baseline | 0.04 | five shifts above |
| 1 | promo rendered on the server, `setTimeout` removed from `app.js` | 0.01 | card images (2 449, 3 087 ms), Playfair swap (3 551 ms) |
| 2 | `width="1200" height="1200"` on card `<img>` | 0.00 | Playfair swap only (0.0009) |
| 3 | `width="2400" height="1200"` on hero `<img>` | 0.00 | same |

Step 3 measured no difference because `fetchpriority="high"` happened to deliver the PNG header before first paint
in these runs. Lab 01's first recording (lazy hero) scored 0.53 from the same image. One clean run is not proof;
above-the-fold media always carries dimensions.

Font swap stays on purpose; lab 06 handles it with `font-display` and `size-adjust`.

### Reading

- Score = impact fraction × distance fraction. The same push scores high on a visible hero and near zero on a grid
  below the fold; the "Elements shifted" list is the top few by impact, not everything that moved.
- CLS is the sum of the largest 1-second cluster, not of all shifts. Fixing a shift outside the worst cluster does
  not move the number.
- Decision for injected content: known at request time → render on the server; arrives later with a known size →
  reserve the slot; unknown size → outside the flow or below the fold.
- Diamonds move between recordings because network timing changes; read each recording on its own.
- DevTools forgets throttling in a new session; check the gear before every recording. With the cache left on, LCP
  read 2 s instead of 14 s.

## INP

Diagnosis only; the fix belongs to lab 10. Two tools, no code changes, throttled page, console.

### Tool A: Long Animation Frames observer

`PerformanceObserver` on `long-animation-frame`, printing each frame's duration, blocking time and its scripts
(`invoker · file · ms`). Findings:

| Interaction | Frames | Scripts in the frame | Cost |
| --- | --- | --- | --- |
| page load | 951 ms, 277 ms blocking | `analytics.js` top-level, 301 ms | not an interaction; becomes input delay if the user clicks during it |
| click "Add to cart" | ~340 ms, 288 ms blocking | `#document.onclick · analytics.js · 81 ms` then `#document.onclick · app.js · 251 ms` | two listeners on `document`, run in order; the third party taxes every click |
| click into the search box | 84 ms | `analytics.js` 81 ms only | `app.js` returns early, the tax stays |
| each keystroke | 211–227 ms | `#document.oninput · app.js · ~205 ms` | 240 cards × fake fuzzy match |

Pasting the observer twice doubles every line (two observers, `VM198`/`VM202`); reload before re-registering.

### Tool B: web-vitals v6 attribution build

`onINP(cb, { reportAllChanges: true })` after typing "lamp" and one click:

| Field | Value |
| --- | --- |
| value | **560 ms** |
| interactionType / target | keyboard / `#search` |
| inputDelay | 96 ms |
| processingDuration | 422 ms |
| presentationDelay | 41 ms |
| totalScriptDuration / totalStyleAndLayoutDuration | 488 ms / 0 ms |
| longestScript.subpart | `processing-duration` |
| longAnimationFrameEntries | 2 frames: 220 ms (1 script) and 424 ms (2 scripts) |

### Reading

- Input delay is the previous interaction's unfinished handler. A 205 ms keystroke handler means a key pressed
  100 ms later waits 105 ms before its own handler starts. Lab 00's 190 ms input delay was exactly this.
- The reported INP (560) is larger than one keystroke (~250) because two queued keystrokes were processed in the
  same frame (207 + 205 ms). INP reports the worst interaction, and the worst is where events pile up.
- `totalStyleAndLayoutDuration: 0` rules out rendering; the cost is JavaScript, split between the site's own
  handler and a third-party click listener that runs on every click regardless of target.
- LoAF's `invoker` names the listener (`#document.onclick`, `#document.oninput`) and `sourceURL` names the file,
  so the "which script, which listener, how many ms" table comes out without reading the code. This is the table
  lab 10 will attack: delete or scope the third-party listener, index the cards instead of scanning them, yield
  between chunks.

## Method lessons

- Name a shift by evidence (task chain in Bottom-up, request end in Network, filmstrip diff), not by the tool's
  culprit label.
- One recording is one sample; diamonds move between recordings, and a shift that did not happen once can happen
  on a slower network. Size above-the-fold media regardless.
- For INP, read the attribution build in the field and LoAF entries in the lab; the two agree to the millisecond.
