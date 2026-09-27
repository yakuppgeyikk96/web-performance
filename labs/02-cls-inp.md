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

_(second half, in progress)_
