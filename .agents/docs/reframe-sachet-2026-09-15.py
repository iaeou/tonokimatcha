"""Reframe the landscape bowl photograph into the house packaging format.

The shot Jaume supplied is 1448 x 1086; the vessel frames are 4:5 portrait with
object-fit: cover, and every packaging photo in static/images/packaging is
stored 1086 x 1448 (3:4). Cropping a 4:3 subject into that runs the bowl off
both sides, so the ground is grown instead of the bowl cut.

    python3 .agents/docs/reframe-sachet-2026-09-15.py <source.webp> \
        static/images/packaging/matchatonoki-sachet-2g.webp

deps: pillow numpy
"""

import sys

import numpy as np
from PIL import Image, ImageFilter

# The bowl's bounding box in the source, measured by thresholding for the dark
# stone and the green sticks. Re-measure if the source photograph changes.
SX0, SX1 = 188, 1230

# Air either side of the bowl, in source pixels. 88 is what shipped -- the bowl
# whole, at the same subject scale as the tube and the pouch. 0 gives the
# edge-to-edge crop that was rendered and rejected.
MARGIN = 88

# More of the new space goes above the bowl than below: it already sits low.
TOP_SHARE = 0.62

HOUSE = (1086, 1448)  # 3:4, the size the other three packaging photos use
QUALITY = 72


def extend(img, pad_top, pad_bottom):
    """Grow the canvas by stretching the outermost row of ground.

    Each new row is the edge row eased towards the mean of the nearest 24 rows,
    so the soft shadow streaks at the top dissolve upwards instead of striping.
    The synthetic bands are then blurred under a soft mask that reaches 40 px
    into the real photograph, which buries the seam.
    """
    a = np.asarray(img).astype(np.float32)
    for pad, top in ((pad_top, True), (pad_bottom, False)):
        if not pad:
            continue
        band = (a[0:1] if top else a[-1:]).repeat(pad, axis=0)
        target = (a[0:24] if top else a[-24:]).mean(axis=(0, 1))
        t = np.linspace(0, 1, pad)
        t = (t[::-1] if top else t)[:, None, None] ** 1.4
        band = band * (1 - t) + target[None, None, :] * t
        a = np.concatenate([band, a] if top else [a, band], axis=0)

    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    mask = np.zeros((out.size[1], out.size[0]), np.uint8)
    if pad_top:
        mask[: pad_top + 40, :] = 255
    if pad_bottom:
        mask[-(pad_bottom + 40) :, :] = 255
    mask = Image.fromarray(mask).filter(ImageFilter.GaussianBlur(30))
    return Image.composite(out.filter(ImageFilter.GaussianBlur(9)), out, mask)


def main(src_path, out_path):
    im = Image.open(src_path).convert('RGB')
    w, h = im.size

    x0, x1 = max(0, SX0 - MARGIN), min(w, SX1 + MARGIN)
    span = x1 - x0
    pad = int(round(span * 4 / 3)) - h
    if pad < 0:
        raise SystemExit('source is already tall enough; crop instead of padding')
    pad_top = int(round(pad * TOP_SHARE))

    comp = extend(im.crop((x0, 0, x1, h)), pad_top, pad - pad_top)
    comp.resize(HOUSE, Image.LANCZOS).save(out_path, 'WEBP', quality=QUALITY, method=6)
    print(f'{out_path}: {HOUSE[0]}x{HOUSE[1]}')


if __name__ == '__main__':
    main(*sys.argv[1:3])
