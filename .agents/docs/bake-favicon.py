"""Cut static/favicon.svg and static/apple-touch-icon.png from ico-magatama.svg.

    pip install svgelements cairosvg
    python3 .agents/docs/bake-favicon.py static/ico-magatama.svg static

Two outputs, because the two slots want different things:

  favicon.svg          transparent, tight crop, **blush strokes dropped**. The
                       browser tab renders this at 16-32px, where the six little
                       cheek strokes stop being a face and become dirt. Eyes and
                       mouth survive — they are what makes it a character. The
                       ink outline vanishes against a dark tab bar, which is
                       fine: the shape is carried by the bright body, not by the
                       line, so it reads on either chrome.

  apple-touch-icon.png 180px, opaque, the full drawing including the blush, on a
                       cream tile with room around it. iOS composites a
                       transparent icon onto black and rounds the corners
                       itself, so it gets a background and padding rather than
                       a tight transparent crop.

Nothing here is hand-edited: re-run it whenever the drawing changes.
"""
import sys
import os
from svgelements import SVG, Path, Shape

BLUSH_STROKES = 6            # the six smallest ink paths — three per cheek
TILE = '#f4efe4'             # the site's light void, for the iOS tile


def flat_paths(filename):
    """Every filled path with its transforms already applied."""
    out = []
    for element in SVG.parse(filename).elements():
        if isinstance(element, Shape) and element.__class__.__name__ == 'Path':
            fill = element.fill
            if fill is None or fill.value is None:
                continue
            hexv = '#%02x%02x%02x' % (fill.red, fill.green, fill.blue)
            path = Path(element)
            out.append((hexv, path.d(), path.bbox()))
    return out


def emit(paths, out, size=64, pad=0.0, tile=None):
    """Scale the paths to fit a `size` square with `pad` margin, centred."""
    xs = [b[0] for _, _, b in paths] + [b[2] for _, _, b in paths]
    ys = [b[1] for _, _, b in paths] + [b[3] for _, _, b in paths]
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    width, height = maxx - minx, maxy - miny
    scale = size * (1 - 2 * pad) / max(width, height)
    tx = (size - width * scale) / 2 - minx * scale
    ty = (size - height * scale) / 2 - miny * scale

    body = []
    if tile:
        body.append(f'<rect width="{size}" height="{size}" rx="{size / 2}" fill="{tile}"/>')
    body.append(f'<g transform="translate({tx:.3f} {ty:.3f}) scale({scale:.5f})">')
    for hexv, d, _ in paths:
        body.append(f'<path d="{d}" fill="{hexv}"/>')
    body.append('</g>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
           + ''.join(body) + '</svg>')
    with open(out, 'w') as handle:
        handle.write(svg)
    return svg


def main(source, static_dir):
    paths = flat_paths(source)
    smallest = sorted(((b[2] - b[0]) * (b[3] - b[1]), i) for i, (_, _, b) in enumerate(paths))
    blush = {i for _, i in smallest[:BLUSH_STROKES]}
    without_blush = [p for i, p in enumerate(paths) if i not in blush]

    favicon = os.path.join(static_dir, 'favicon.svg')
    emit(without_blush, favicon, size=64, pad=0.02)

    touch_svg = os.path.join(static_dir, '.apple-touch-icon.svg')
    emit(paths, touch_svg, size=180, pad=0.14, tile=TILE)

    import cairosvg
    from PIL import Image
    touch_png = os.path.join(static_dir, 'apple-touch-icon.png')
    cairosvg.svg2png(url=touch_svg, write_to=touch_png, output_width=180, output_height=180)
    Image.open(touch_png).convert('RGB').save(touch_png)   # opaque: iOS wants no alpha
    os.remove(touch_svg)

    print(f'{favicon}: {os.path.getsize(favicon)} bytes')
    print(f'{touch_png}: {os.path.getsize(touch_png)} bytes')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
