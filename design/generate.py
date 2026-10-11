"""Generates app icon / splash PNGs from SVG using headless Chromium.

Usage: python3 design/generate.py   (from repo root)
"""
import math, os, subprocess, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, 'assets')
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium')

RED_TOP, RED_BOTTOM = '#F2674F', '#D63F2A'
LEAF, LEAF_DARK = '#5BC56B', '#3E9E4E'


def arc(cx, cy, r, start_deg, end_deg):
    """SVG arc path, degrees clockwise from 12 o'clock."""
    def pt(d):
        a = math.radians(d - 90)
        return cx + r * math.cos(a), cy + r * math.sin(a)
    (x1, y1), (x2, y2) = pt(start_deg), pt(end_deg)
    large = 1 if (end_deg - start_deg) % 360 > 180 else 0
    return f'M{x1:.2f} {y1:.2f} A{r} {r} 0 {large} 1 {x2:.2f} {y2:.2f}'


def leaf(cx, cy, s, fill, halo=0):
    """Tomato calyx: drooping sepals plus a curved stem, based at (cx, cy).

    halo > 0 draws an outline of that width instead, used to separate the calyx from the ring.
    """
    def sepal(angle_deg, length, width):
        a = math.radians(angle_deg)
        tx, ty = cx + length * math.cos(a), cy + length * math.sin(a)
        nx, ny = -math.sin(a) * width, math.cos(a) * width  # normal
        mx, my = cx + length * 0.45 * math.cos(a), cy + length * 0.45 * math.sin(a)
        return (f'M{cx:.2f} {cy:.2f} Q{mx + nx:.2f} {my + ny:.2f} {tx:.2f} {ty:.2f} '
                f'Q{mx - nx:.2f} {my - ny:.2f} {cx:.2f} {cy:.2f}Z')
    paths = [sepal(a, s * l, s * 0.30) for a, l in
             ((172, 1.0), (128, 0.78), (90, 0.62), (52, 0.78), (8, 1.0))]
    d = ' '.join(paths)
    stem_d = (f'M{cx:.2f} {cy:.2f} C{cx:.2f} {cy - s*0.45:.2f} {cx + s*0.10:.2f} {cy - s*0.70:.2f} '
              f'{cx + s*0.34:.2f} {cy - s*0.82:.2f}')
    sw = s * 0.17
    if halo:
        return (f'<path d="{d}" fill="{fill}" stroke="{fill}" stroke-width="{halo}" stroke-linejoin="round"/>'
                f'<path d="{stem_d}" stroke="{fill}" stroke-width="{sw + halo}" stroke-linecap="round" fill="none"/>')
    return (f'<path d="{d}" fill="{fill}" stroke="{fill}" stroke-width="{s*0.06}" stroke-linejoin="round"/>'
            f'<path d="{stem_d}" stroke="{fill}" stroke-width="{sw}" stroke-linecap="round" fill="none"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{s*0.16}" fill="{fill}"/>')


def mark(cx, cy, r, ring_color='#fff', track='rgba(255,255,255,0.28)', leaf_color=LEAF,
         hand=True, cutout=None):
    """Timer ring with a gap at the top for the tomato calyx."""
    w = r * 0.22
    out = [f'<circle cx="{cx}" cy="{cy}" r="{r}" stroke="{track}" stroke-width="{w}" fill="none"/>'] if track else []
    out.append(f'<path d="{arc(cx, cy, r, 32, 300)}" stroke="{ring_color}" stroke-width="{w}" '
               f'stroke-linecap="round" fill="none"/>')
    if hand:
        out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx + r*0.38}" y2="{cy - r*0.30}" stroke="{ring_color}" '
                   f'stroke-width="{w*0.42}" stroke-linecap="round"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{w*0.42}" fill="{ring_color}"/>')
    if cutout:  # thin halo behind the calyx so it separates from the ring
        out.append(leaf(cx, cy - r, r * 0.46, cutout, halo=r * 0.09))
    out.append(leaf(cx, cy - r, r * 0.46, leaf_color))
    return ''.join(out)


def bg_at(fraction):
    """Background gradient colour at a vertical position (0 = top, 1 = bottom)."""
    a, b = (int(RED_TOP[i:i+2], 16) for i in (1, 3, 5)), (int(RED_BOTTOM[i:i+2], 16) for i in (1, 3, 5))
    return '#' + ''.join(f'{round(x + (y - x) * fraction):02x}' for x, y in zip(a, b))


def bg(size):
    return (f'<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset="0" stop-color="{RED_TOP}"/><stop offset="1" stop-color="{RED_BOTTOM}"/>'
            f'</linearGradient></defs><rect width="{size}" height="{size}" fill="url(#g)"/>')


def svg(size, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{body}</svg>'


def render(svg_text, size, out, opaque=False):
    with tempfile.TemporaryDirectory() as d:
        html = os.path.join(d, 'i.html')
        with open(html, 'w') as f:
            f.write(f'<html><body style="margin:0;background:transparent">{svg_text}</body></html>')
        png = os.path.join(d, 'o.png')
        subprocess.run([CHROME, '--headless', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
                        '--force-device-scale-factor=1', '--default-background-color=00000000',
                        f'--window-size={size},{size + 200}', f'--screenshot={png}', f'file://{html}'],
                       check=True, capture_output=True)
        im = Image.open(png).crop((0, 0, size, size))
        im = im.convert('RGB') if opaque else im.convert('RGBA')
        im.save(out, optimize=True)


def main():
    # iOS / store icon: full bleed, no transparency (App Store rejects alpha).
    s = 1024
    icon = svg(s, bg(s) + mark(512, 548, 300, cutout=bg_at(248 / 1024)))
    with open(os.path.join(ROOT, 'design', 'icon.svg'), 'w') as f:
        f.write(icon)
    render(icon, s, os.path.join(ASSETS, 'icon.png'), opaque=True)

    # Android adaptive icon: mark must fit the inner 66/108 safe zone.
    s = 512
    render(svg(s, bg(s)), s, os.path.join(ASSETS, 'android-icon-background.png'), opaque=True)
    render(svg(s, mark(256, 266, 104, cutout=bg_at(150 / 512))), s, os.path.join(ASSETS, 'android-icon-foreground.png'))
    # Themed (Android 13+) icon: single colour silhouette.
    s = 432
    render(svg(s, mark(216, 224, 86, track=None, leaf_color='#fff')), s,
           os.path.join(ASSETS, 'android-icon-monochrome.png'))

    # Splash: white mark on the red splash background (colour set in app.json).
    s = 1024
    render(svg(s, mark(512, 548, 380, track='rgba(255,255,255,0.28)', cutout=None)), s,
           os.path.join(ASSETS, 'splash-icon.png'))

    # Favicon
    Image.open(os.path.join(ASSETS, 'icon.png')).resize((48, 48), Image.LANCZOS).save(
        os.path.join(ASSETS, 'favicon.png'))


if __name__ == '__main__':
    main()
