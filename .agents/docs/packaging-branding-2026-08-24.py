import numpy as np, io, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import cairosvg

MARK = 'magatama-mark.svg'
F300 = 'cormorant-300.ttf'
F400 = 'cormorant-400.ttf'


def render_mark(h, mono=None):
    png = cairosvg.svg2png(url=MARK, output_height=h)
    im = Image.open(io.BytesIO(png)).convert('RGBA')
    if mono:
        a = np.array(im)
        alpha = a[..., 3]
        out = np.zeros_like(a)
        out[..., 0], out[..., 1], out[..., 2] = mono
        out[..., 3] = alpha
        im = Image.fromarray(out)
    return im


def text_img(txt, font, tracking, fill):
    f = ImageFont.truetype(font[0], font[1])
    widths = [f.getlength(c) for c in txt]
    W = int(sum(widths) + tracking * (len(txt) - 1)) + 20
    asc, desc = f.getmetrics()
    H = asc + desc + 20
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = 10
    for c, w in zip(txt, widths):
        d.text((x, 10), c, font=f, fill=fill)
        x += w + tracking
    return im.crop(im.getbbox())


def label_stacked(width, ink=(26, 26, 22)):
    """Mark above, MATCHA / TONOKI below. Returns RGBA."""
    mark = render_mark(int(width * 0.62))
    t1 = text_img('MATCHA', (F300, int(width * 0.20)), width * 0.045, ink + (255,))
    t2 = text_img('TONOKI', (F300, int(width * 0.20)), width * 0.045, ink + (255,))
    gap = int(width * 0.14)
    H = mark.height + gap + t1.height + int(width * 0.06) + t2.height
    im = Image.new('RGBA', (width, H), (0, 0, 0, 0))
    im.paste(mark, ((width - mark.width) // 2, 0), mark)
    y = mark.height + gap
    im.paste(t1, ((width - t1.width) // 2, y), t1)
    y += t1.height + int(width * 0.06)
    im.paste(t2, ((width - t2.width) // 2, y), t2)
    return im


def cylinder_apply(photo, label, y0, y1, edges, arc=0.44, opacity=1.0, blur=2.2):
    """edges: fn(y)->(xl,xr). arc: fraction of the visible half-circumference the label covers."""
    ph = np.array(photo.convert('RGB')).astype(np.float32)
    H, W, _ = ph.shape
    lab = np.array(label).astype(np.float32)
    lh, lw, _ = lab.shape

    ink = np.zeros((H, W, 3), np.float32) + 255.0
    alpha = np.zeros((H, W), np.float32)

    for y in range(y0, y1):
        xl, xr = edges(y)
        v = (y - y0) / (y1 - y0)
        sy = min(lh - 1, max(0, int(v * lh)))
        xs = np.arange(int(xl), int(xr) + 1)
        p = (xs - xl) / (xr - xl)
        pc = np.clip(2 * p - 1, -1, 1)
        s = 0.5 + np.arcsin(pc) / math.pi          # arc coordinate 0..1
        u = (s - (0.5 - arc / 2)) / arc            # label coordinate
        ok = (u >= 0) & (u < 1)
        sx = (u * lw).astype(int)
        sx = np.clip(sx, 0, lw - 1)
        px = lab[sy, sx]
        a = px[:, 3] / 255.0 * ok
        # fade toward the silhouette (grazing angle)
        a *= np.clip(1 - pc ** 2, 0, 1) ** 0.30
        ink[y, xs] = px[:, :3]
        alpha[y, xs] = a

    alpha = np.array(Image.fromarray((alpha * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(blur))).astype(np.float32) / 255.0 * opacity
    ink = np.array(Image.fromarray(ink.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(blur))).astype(np.float32)

    # multiply blend: ink darkens the paper, paper texture/shading shows through
    mult = ph * (ink / 255.0)
    out = ph * (1 - alpha[..., None]) + mult * alpha[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def find_coeffs(pa, pb):
    """pa: dest quad (in output), pb: source quad (in input). For Image.transform PERSPECTIVE."""
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)


def quad_apply(photo, label, quad, opacity=1.0, blur=2.0, shade=None):
    """quad: [(tl),(tr),(br),(bl)] in photo coords where the label should land."""
    W, H = photo.size
    lw, lh = label.size
    src = [(0, 0), (lw, 0), (lw, lh), (0, lh)]
    coeffs = find_coeffs(quad, src)
    warped = label.transform((W, H), Image.PERSPECTIVE, coeffs, Image.BICUBIC)
    warped = warped.filter(ImageFilter.GaussianBlur(blur))
    wa = np.array(warped).astype(np.float32)
    ph = np.array(photo.convert('RGB')).astype(np.float32)
    ink = wa[..., :3]
    ink[wa[..., 3] < 1] = 255
    alpha = wa[..., 3] / 255.0 * opacity
    if shade is not None:
        alpha *= shade
    mult = ph * (ink / 255.0)
    out = ph * (1 - alpha[..., None]) + mult * alpha[..., None]
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))


def label_lockup(width, ink=(30, 29, 24)):
    """Header lockup: 'Matcha / Tonoki' left-aligned, two lines at line-height 1,
    magatama mark at the right sized to the full two-line height."""
    # size the type so the finished lockup is `width` wide
    fs = int(width * 0.30)
    t1 = text_img('Matcha', (F400, fs), fs * 0.012, ink + (255,))
    t2 = text_img('Tonoki', (F400, fs), fs * 0.012, ink + (255,))
    tw = max(t1.width, t2.width)
    lead = int(fs * 0.30)                     # gap between the two lines
    th = t1.height + lead + t2.height
    mark = render_mark(th)
    gap = int(th * 0.16)
    W, H = tw + gap + mark.width, th
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    im.paste(t1, (0, 0), t1)
    im.paste(t2, (0, t1.height + lead), t2)
    im.paste(mark, (tw + gap, 0), mark)
    return im


# ---------------------------------------------------------------------------
# Placements for the 2026-08-24 pass (revised: header lockup, after Jaume's own
# edit of sachet-2g set the house style -- "Matcha / Tonoki" in title case,
# left-aligned, two lines at line-height 1, mark to the right at the full
# two-line height, exactly like the site navigation).
#
# Run from a folder holding tube-25.png / pouch-30g.png / pouch-30g-flat.png
# (decoded from static/images/packaging/*.webp), magatama-mark.svg and
# cormorant-400.ttf. Writes out/*.webp at q=80.
#
#   fonts:  npm pack @fontsource/cormorant-garamond  ->  woff2 -> ttf (fontTools)
#           (Google Fonts is not reachable from the sandbox)
#   deps :  pillow numpy cairosvg fonttools brotli
#
# sachet-2g.webp is NOT produced here -- it is Jaume's own edit.
# ---------------------------------------------------------------------------

def run():
    import os, math
    os.makedirs('out', exist_ok=True)

    # --- tube-25: paper cylinder, lockup follows the curvature ---------------
    ph = Image.open('tube-25.png')
    lab = label_lockup(1600)
    def tube_edges(y):
        t = (y - 2100) / 900.0
        return (898 + 153 * t, 1773 - 156 * t)
    arc, y0 = 0.52, 2180
    xl, xr = tube_edges(y0)
    screen_w = math.sin(math.pi * arc / 2) * (xr - xl)
    h = int(screen_w * lab.height / lab.width)
    cylinder_apply(ph, lab, y0, y0 + h, tube_edges, arc=arc, opacity=0.94,
                   blur=2.2).save('out/tube-25.webp', 'WEBP', quality=80, method=6)

    # --- pouch-30g: standing pouch, near-flat panel with taper ---------------
    ph = Image.open('pouch-30g.png')
    lab = label_lockup(1600)
    def pouch_edges(y):
        t = (y - 1792) / 1024.0
        return (855 + 145 * t, 2250 - 175 * t)
    yt = 2180
    xl, xr = pouch_edges(yt)
    LW = 0.62 * (xr - xl)
    ct = (xl + xr) / 2
    yb = yt + LW * lab.height / lab.width
    xl2, xr2 = pouch_edges(yb)
    LWb = LW * (xr2 - xl2) / (xr - xl)
    cb = (xl2 + xr2) / 2
    quad = [(ct - LW / 2, yt), (ct + LW / 2, yt), (cb + LWb / 2, yb), (cb - LWb / 2, yb)]
    quad_apply(ph, lab, quad, opacity=0.92, blur=2.4).save(
        'out/pouch-30g.webp', 'WEBP', quality=80, method=6)

    # --- pouch-30g-flat: lying down, full perspective quad -------------------
    # face corners measured off the photo: short (zipper) edge TL->TR
    ph = Image.open('pouch-30g-flat.png')
    lab = label_lockup(1600)
    TL = np.array([630, 1041.]); TR = np.array([1832, 853.])
    BR = np.array([2793, 2472.]); BL = np.array([1378, 2965.])
    def P(u, v):
        top = TL + (TR - TL) * u
        bot = BL + (BR - BL) * u
        return tuple(top + (bot - top) * v)
    u0, u1, v0 = 0.19, 0.81, 0.36
    v1 = v0 + (u1 - u0) * 1217 / 1882 * lab.height / lab.width   # keep aspect
    quad = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)]
    quad_apply(ph, lab, quad, opacity=0.90, blur=2.6).save(
        'out/pouch-30g-flat.webp', 'WEBP', quality=80, method=6)


if __name__ == '__main__':
    run()
