"""Bake static/ico-magatama.svg into src/lib/three/magatama-icon-data.ts.

Enamel-pin construction: one bevelled ink-coloured slab of the silhouette with
the artwork's colours laid flat on its two faces. The unpainted margin around
the colour IS the outline, so the line wraps the bevel instead of stopping dead
at the front edge.

    pip install shapely svgelements
    python3 bake-magatama-icon.py static/ico-magatama.svg \
        src/lib/three/magatama-icon-data.ts

See .agents/docs/project-status-2026-08-26.md for why each number is what it is.
"""
import sys
from svgelements import SVG, Path, Shape
from shapely.geometry import Polygon
from shapely.ops import unary_union

SAMPLES = 64                 # flattening samples per curve segment

INK_ART = '#070605'          # the artwork's outline/detail black
INK_RENDER = '#2e7043'       # what the slab and the redrawn ink are coloured

HEIGHT = 3.9                 # normalised height, same space as the low-poly bake
BEVEL = 0.045                # normalised; this IS the apparent line weight
GROWTH = 0.060               # normalised; band-restricted, so the paint reaches the bevel everywhere
BAND = 0.132                 # normalised; growth is confined to this outer band
SIMPLIFY = 0.15              # artwork units


def rings_of(path):
    rings = []
    for sub in path.as_subpaths():
        p = Path(sub)
        pts = []
        for seg in p:
            n = 1 if seg.__class__.__name__ in ('Line', 'Close', 'Move') else SAMPLES
            for i in range(1, n + 1):
                pt = seg.point(i / n)
                pts.append((pt.x, pt.y))
        if len(pts) >= 3:
            poly = Polygon(pts)
            if not poly.is_valid:
                poly = poly.buffer(0)
            if not poly.is_empty:
                rings.append(poly)
    return rings

def evenodd(rings):
    out = None
    for r in rings:
        out = r if out is None else out.symmetric_difference(r)
    return out if out is not None else Polygon()

def load(fn):
    svg = SVG.parse(fn)
    items = []
    for el in svg.elements():
        if isinstance(el, Shape) and el.__class__.__name__ == 'Path':
            fill = el.fill
            if fill is None or fill.value is None:
                continue
            hexv = '#%02x%02x%02x' % (fill.red, fill.green, fill.blue)
            geom = evenodd(rings_of(Path(el)))
            if geom.is_empty:
                continue
            items.append((hexv, geom))
    return items


def as_polys(geom):
    if geom.is_empty:
        return []
    if geom.geom_type == 'Polygon':
        return [geom]
    return [g for g in geom.geoms if g.geom_type == 'Polygon' and not g.is_empty]


def contours(geom, tx, ty, scale, tol):
    """shapely -> number[][][] in the data file's normalised, y-up space.

    Simplifying moves every boundary by up to `tol` — the slab's included — so
    slab and paint edges agree only to that tolerance, never exactly. Re-
    clipping the paint afterwards was tried and only doubled the point count:
    it re-imports the clip's full vertex set while the slab's own extreme
    points have already walked inward by the same tolerance.
    """
    out = []
    for poly in as_polys(geom.simplify(tol)):
        if poly.area < tol * tol:
            continue
        rings = []
        for ring in [poly.exterior, *poly.interiors]:
            flat = []
            coords = list(ring.coords)[:-1]
            for x, y in coords:
                flat.append(round((x - tx) * scale, 4))
                flat.append(round(-(y - ty) * scale, 4))   # SVG y-down -> y-up
            if len(flat) >= 6:
                rings.append(flat)
        if rings:
            out.append(rings)
    return out


def bake(path):
    items = load(path)
    sil = unary_union([g for _, g in items]).buffer(0)
    minx, miny, maxx, maxy = sil.bounds
    scale = HEIGHT / (maxy - miny)
    tx, ty = (minx + maxx) / 2, (miny + maxy) / 2

    bevel_a = BEVEL / scale
    growth_a = GROWTH / scale
    band_a = BAND / scale

    fills = [(h, g) for h, g in items if h != INK_ART]
    inks = sorted([g for h, g in items if h == INK_ART], key=lambda g: -g.area)
    outline, details = inks[0], inks[1:]

    clip = sil.buffer(-bevel_a)
    band = sil.difference(sil.buffer(-band_a))
    detail_union = unary_union(details).buffer(0) if details else Polygon()
    # Ink that lives in the outer band is structure (the stem, the leaf edges);
    # ink deeper in is the face. The back may punch the first and must not
    # punch the second, or the reverse of the pin grows eyes.
    structural_ink = detail_union.intersection(band)

    def place(geom):
        """Grow toward the silhouette, but only inside the band, then clip."""
        grown = geom.union(geom.buffer(growth_a).intersection(band))
        return grown.intersection(clip)

    layers = []
    layers.append(('base', 0, INK_RENDER, sil))

    front_fills = []
    for hexv, geom in fills:
        placed = place(geom).difference(detail_union)
        if not placed.is_empty:
            front_fills.append((hexv, placed))
            layers.append(('front', 1, hexv, placed))

    for geom in details:
        placed = geom.intersection(clip)
        if not placed.is_empty:
            layers.append(('front', 2, INK_RENDER, placed))

    for hexv, geom in fills:
        if hexv == '#e672a5':          # no mouth on the reverse of a pin
            continue
        placed = place(geom).difference(structural_ink)
        if not placed.is_empty:
            layers.append(('back', 1, hexv, placed))

    emitted = []
    points = 0
    for role, tier, hexv, geom in layers:
        cs = contours(geom, tx, ty, scale, SIMPLIFY)
        points += sum(len(r) // 2 for poly in cs for r in poly)
        emitted.append((role, tier, hexv, cs))
    return emitted, points, sil, scale, tx, ty


HEADER = '''// AUTO-GENERATED from static/ico-magatama.svg (the drawn stone, redrawn by
// Jaume with a single outline). Do not edit by hand — re-run
// .agents/docs/bake-magatama-icon.py and paste the result.
//
// The stone is rebuilt as a bevelled slab with the artwork painted on its two
// faces, the way an enamel pin is made. Five things this bake depends on:
//
//   - The ink outline is NOT a painted layer. The base slab is ink-coloured
//     and the colour fills stop short of the silhouette, so the unpainted
//     margin showing around them IS the outline. One less layer, and the line
//     wraps the bevel instead of stopping dead at the edge.
//   - The colour grows {growth} before being clipped, landing its edge at
//     {bevel} from the silhouette — exactly where the bevel starts. Paint edge
//     and bevel crease then fall on the same line. Leave them apart and the
//     result is two concentric lines with a shading crease between them.
//   - That growth is confined to the outer {band} band. Grown everywhere it
//     would push the mouth out past its own ink and swell the face strokes;
//     the band is the only place the paint needs to move.
//   - Front paint has the ink subtracted from it. Paint and ink are simplified
//     independently, so their shared edges diverge by up to the tolerance and
//     the paint pokes out from under the ink as a bright hairline. Subtracted,
//     the same mismatch shows the slab instead, which is already ink-coloured.
//   - Back paint is punched only by the ink inside the band — the stem and the
//     leaf edges, which are structure. Punching it with the face ink too puts
//     eyes, blush and a mouth on the reverse of the pin.
//
// {layers} layers, {points} contour points.

export interface MagatamaIconLayer {{
  /** `base` is the extruded slab; `front`/`back` are flat paint on its faces. */
  role: 'base' | 'front' | 'back';
  /** Lift step off the face. Nothing within a tier overlaps. */
  tier: number;
  color: string;
  /** Polygons as [exterior, ...holes], each a flat [x, y, x, y, ...] ring. */
  contours: number[][][];
}}

/**
 * Bevel width the paint was clipped against. The geometry builder must extrude
 * with exactly this, or the paint hangs off the rounded edge in mid-air.
 */
export const MAGATAMA_ICON_BEVEL_SIZE = {bevel};

export const MAGATAMA_ICON_LAYERS: MagatamaIconLayer[] = [
'''


def emit(path, out):
    layers, points, *_ = bake(path)
    body = []
    for role, tier, hexv, cs in layers:
        cs_txt = '[' + ', '.join(
            '[' + ', '.join('[' + ','.join(str(v) for v in ring) + ']' for ring in poly) + ']'
            for poly in cs) + ']'
        body.append(f"  {{ role: '{role}', tier: {tier}, color: '{hexv}', contours: {cs_txt} }}")
    text = HEADER.format(growth=GROWTH, bevel=BEVEL, band=BAND,
                         layers=len(layers), points=points)
    text += ',\n'.join(body) + '\n];\n'
    open(out, 'w').write(text)
    print(f'{out}: {len(layers)} layers, {points} points, {len(text)} bytes')


if __name__ == '__main__':
    emit(sys.argv[1], sys.argv[2])
