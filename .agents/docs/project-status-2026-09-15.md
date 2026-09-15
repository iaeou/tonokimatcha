# 2026-09-15 — The Single Serving gets a new photograph

Jaume supplied a new shot for vessel C: a dark stone bowl packed with upright
2 g sticks, the ones carrying the current label (草 + Matcha Tonoki + QR). It
replaces the open-tube-with-four-sticks photograph that had stood there since
the branding pass of 2026-08-24.

`static/images/packaging/matchatonoki-sachet-2g.webp` — same path, so nothing
else in the tree moves. `vessels.ts` only needed its `alt` rewritten.

## The photograph arrived landscape; the frames are portrait

The shot is **1448 × 1086** — the transpose of the house size. Both frames that
show it (`.vessel-card__media` on the shelf and `.vessel-detail__media` in the
hall) are `aspect-ratio: 4 / 5` with `object-fit: cover`, so a straight drop-in
would have centre-cropped to 60 % of the width and run the bowl off both sides.

Three framings were rendered into the real frames, beside the tube and the
pouch, and **Jaume chose the one that keeps the bowl whole with air around it**
— it is the only one whose subject scale matches the other two photographs,
where a small object stands in a wide cream field. (The edge-to-edge crop was
picked first and then reversed; it read heavier than its neighbours.)

## How the canvas was grown

There is no way to fit a 4:3 subject into a 4:5 frame by cropping, so the
ground was extended rather than the bowl cut:

1. Crop to the bowl's bounding box plus 88 px of margin either side
   (x 100 … 1318; the bowl itself spans 188 … 1230, y 80 … 989).
2. Grow the canvas vertically to the house 3:4 — **62 % of the new space above
   the bowl, 38 % below**, because the bowl already sits low in the frame.
3. The new rows are the outermost row stretched, eased towards the mean of the
   nearest 24 rows so the shadow streaks at the top dissolve instead of
   striping, then the synthetic bands (plus 40 px of real photograph either
   side of each seam) are blurred under a soft mask. The ground is a smooth
   cream gradient, so nothing of the seam survives.
4. Resize to **1086 × 1448**, the size the other three packaging photos use,
   and encode WebP q72 → 61 KB.

The script is `.agents/docs/reframe-sachet-2026-09-15.py` (deps: pillow numpy).
`MARGIN` at the top is the knob: 88 is what shipped, 0 gives the edge-to-edge
crop that was rejected.

**Why 3:4 and not 4:5**: the frame is 4:5, but every packaging photograph in
the repo is stored 3:4 and lets the frame take the last 6 % off the top and
bottom. Storing this one at 4:5 would have made it the odd file out for anyone
reusing it later; the visible composition is the same either way.

## Verified

`npm run check` 0 errors (the two standing `dot`/`ring` warnings in
`CursorPointer.svelte`), `npm test` 142 passed / 1 skipped, `npm run build`
clean. Visual acceptance is Jaume's, on `npm run dev`.

---

# Same day, second round — the tube too, and the bowl re-shot

Jaume came back with two more frames from the same session:

- **The Vessel (tube)** — the tube open, its lid set beside it, four sticks laid
  in front. It replaces the closed, sealed tube. Arrived **1086 × 1448**, the
  house size exactly, so it is committed as delivered: no crop, no re-encode,
  no generation loss.
- **The Single Serving** — the same bowl composition as this morning but in a
  **pale ceramic bowl** rather than the dark stone one. Landscape again
  (1448 × 1086), so it went through `reframe-sachet-2026-09-15.py` unchanged.
  Only the measured subject box moved: `SX1` 1230 → **1240**, the new bowl's
  rim reaching a few pixels further right. 57 KB.

Both alt texts follow their photographs: the tube's says open with the lid
beside it, the bowl's says pale ceramic rather than dark stone.

Note for whoever shoots next: **the tube and the bowl share a ground, and the
pouch does not.** A and C now sit on the same warm beige from one session; B is
still the cooler, lighter sample from August. On the shelf the three read as
one set at a glance, but side by side the pouch's ground is visibly a different
paper. Not fixed here — it wants a re-shoot of B, not a colour grade of B.

Verified again after the swap: check 0 errors, 142 tests, build clean.
