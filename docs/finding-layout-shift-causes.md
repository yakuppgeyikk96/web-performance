# Finding the cause of a layout shift

Insights tells you *where* a shift happened (which elements moved, how much, when). Its "culprit" label is a
heuristic and was wrong in lab 02 (it blamed an unsized image for a banner injected by JavaScript). The cause is
found by correlation and experiment, in this order.

## 1. Time first

Take the shift's start time from the Summary and ask what happened in the ~100 ms before it. Read three tracks at
that instant:

- **Network**: did a request finish? Font (`woff2`), image, stylesheet, API response.
- **Main**: which task ran? A script that touched the DOM, a Recalculate Style, a Layout.
- **Screenshots**: what visibly changed between the frame before and the frame after.

Lab 02: the shift moved from 3 030 ms to 2 269 ms when the fonts were removed. Only one event moves with script
start time: the `setTimeout(…, 1500)` that injected the promo banner.

## 2. Then geometry

Hover the names in "Elements shifted"; the page highlights them. Note the direction. Elements that moved *down*
were pushed by something *before* them in DOM order that grew or appeared. If the shifted element itself changed
size, look inside it (media, text). The topmost shifted element is the boundary; inspect what sits directly above
it in the DOM.

CLS score = impact fraction × distance fraction, both relative to the viewport. The same push scores high on a
visible hero and near zero on a grid below the fold, which is why the list may omit elements that also moved.

## 3. Filmstrip diff

Compare the screenshot just before and just after the shift. The thing that appeared or grew is the cause. On a
complex page this is the fastest route.

## 4. The Layout block on the main thread

Click the purple **Layout** (or Recalculate Style) event at the shift time. Summary shows the invalidation and the
initiator stack, which points at the JavaScript line that mutated the DOM or the stylesheet that arrived.

## 5. Narrow by pattern

Almost every shift is one of five:

| Pattern | Signature | Fix |
| --- | --- | --- |
| Late-sized media | `img`/`video`/`iframe`/ad slot; shift when bytes arrive | `width`/`height` or `aspect-ratio`; reserve the slot |
| Injected DOM | banner, cookie bar, client-rendered component, hydration mismatch; shift at a script task | Render on the server; reserve space; insert outside the flow |
| Font swap | `#text` nodes shift; culprit is a font request | `font-display` choice + `size-adjust`/`ascent-override` fallback |
| Layout-property animation | repeated small shifts on a rhythm | Animate `transform`/`opacity` only |
| Late CSS | shift when a stylesheet finishes | Load critical CSS in `<head>`; avoid late `<link>` |

`transform` and `opacity` changes never produce layout shifts, however dramatic they look.

## 6. Prove it by experiment

Remove the suspect, re-record, compare. If several suspects, bisect. Do not trust the label until the experiment
agrees with it.

## 7. Tools

- Rendering panel → **Layout Shift Regions**: shifts flash blue on the live page.
- Console observer, prints node and rectangles:

```js
new PerformanceObserver((list) => {
  for (const shift of list.getEntries()) {
    if (shift.hadRecentInput) continue;
    console.log(shift.startTime.toFixed(0), shift.value.toFixed(4),
      shift.sources.map((s) => [s.node, s.previousRect, s.currentRect]));
  }
}).observe({ type: "layout-shift", buffered: true });
```

`previousRect` → `currentRect` gives direction and distance; `node` is the element.

- Field: `web-vitals` attribution build → `largestShiftTarget`, `largestShiftTime`, `largestShiftSource`,
  `loadState`. Shifts with `loadState: "complete"` are usually interaction-driven content or late ads.

## Reporting format

One line per shift: **time · score · elements · cause · evidence**. Example from lab 02:
`3 030 ms · 0.0415 · section.hero · promo banner injected by app.js setTimeout · moved to 2 269 ms when fonts removed, i.e. tracks script start + 1.5 s`.
