"""Character tokens for the Frosthaven classes, which have no token art in the asset repository or in worldhaven.

The GH2E character tokens (images/icons/tokens-<class>.webp, 118x118) are a disc in the class colour with the class icon and a metal
rim. This builds the same kind of token for each Frosthaven class from the owner's token template ring (DEFAULT_RING): the class colour
of the Gloomhaven Secretariat data (data/fh/character/<icon>.json "color") as the face, the ring over it, and the class icon of the attack
modifier cards (images/attack-modifiers/common/class_icons-<class>.webp) in black on top. Stand-ins until real token art is available.

It also cuts the three scanned Frosthaven tokens already in images/icons (hive_mode, geminate_character, geminate_melee) to their
coloured disc: they came on a grey stone background. Done once (the manifest record is marked 'cut').

Writes images/icons/tokens-<slug>.webp and records each new token in tools/images-manifest.json under the address
images/common/mercenary_tokens/<slug> (the address the code asks for, see scripts/campaign/classTokens.js); "generated" names this tool.
Run tools/generate-image-index.py afterwards.

Usage: python -I tools/make-fh-character-tokens.py [path/to/gloomhavensecretariat] [path/to/ring.png]
"""
import json
import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SEC = r'D:\github\gloomhavensecretariat'
# The ring of the owner's character token template (P:/Guido/boardgames/Worldhaven/templates/Character Token/ring.png): a metal rim and a
# glossy, semi-transparent face on a transparent background. Not in the repo; pass another path as the second argument.
DEFAULT_RING = 'P:/Guido/boardgames/Worldhaven/templates/Character Token/ring.png'
MANIFEST = os.path.join(ROOT, 'tools', 'images-manifest.json')
ICONS = os.path.join(ROOT, 'images', 'icons')
OUT = 118
# Secretariat file (icon name) -> class name as gh2_classes.js spells it; slug = the token file name
FH = {'banner-spear': 'Banner Spear', 'blinkblade': 'Blinkblade', 'boneshaper': 'Boneshaper', 'coral': 'Crashing Tide',
      'deathwalker': 'Deathwalker', 'kelp': 'Deepwraith', 'drifter': 'Drifter', 'fist': 'Frozen Fist',
      'prism': 'H.I.V.E.', 'astral': 'Infuser', 'drill': 'Metal Mosaic', 'shackles': 'Pain Conduit', 'meteor': 'Pyroclast',
      'shards': 'Shattersong', 'snowflake': 'Snowdancer', 'trap': 'Trapper'}
# scanned token -> the share of the picture width its coloured disc takes (measured on the pictures)
# (Geminate needs no stand-in: its two form tokens below are real token art.)
SCANNED = {'hive_mode': 0.6, 'geminate_character': 0.6, 'geminate_melee': 0.6}


def slug_of(name):
    return {'H.I.V.E.': 'hive'}.get(name, name.lower().replace(' ', '_'))


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def token(color, icon, ring):
    """A character token: the class colour as the face, the token template's ring over it (metal rim and the gloss of the face), and the
    class icon in black on top."""
    rim = Image.open(ring).convert('RGBA')
    rim = rim.crop(rim.getchannel('A').getbbox())                                       # the token itself (300x300 in the template)
    n = rim.width
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    ImageDraw.Draw(im).ellipse((n * 0.06, n * 0.06, n * 0.94, n * 0.94), fill=color + (255,))   # the face, under the inner edge of the rim
    ic = Image.open(icon).convert('RGBA')
    box = int(n * 0.5)
    ic.thumbnail((box, box), Image.LANCZOS)
    black = Image.new('RGBA', ic.size, (0, 0, 0, 255))
    black.putalpha(ic.getchannel('A'))
    im.alpha_composite(rim)
    im.alpha_composite(black, ((n - ic.width) // 2, (n - ic.height) // 2))                  # the icon on top of the gloss
    return im.resize((OUT, OUT), Image.LANCZOS)


def circle_cut(path, frac):
    """The scanned token as a round token: crop to its coloured disc (frac of the picture width, centred) and make the rest transparent."""
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    d = int(round(min(w, h) * frac))
    x, y = (w - d) // 2, (h - d) // 2
    im = im.crop((x, y, x + d, y + d))
    big = Image.new('L', (d * 4, d * 4), 0)
    ImageDraw.Draw(big).ellipse((0, 0, d * 4 - 1, d * 4 - 1), fill=255)
    im.putalpha(big.resize((d, d), Image.LANCZOS))
    im.save(path, 'WEBP', quality=90, method=6)
    return [d, d]


def main():
    sec = os.path.join(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SEC, 'data', 'fh', 'character')
    ring = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_RING
    with open(MANIFEST, encoding='utf-8') as f:
        man = json.load(f)
    byd = {r.get('dst'): r for r in man['files']}
    for fn, name in FH.items():
        color = hex_rgb(json.load(open(os.path.join(sec, fn + '.json'), encoding='utf-8'))['color'])
        icon = os.path.join(ROOT, 'images', 'attack-modifiers', 'common', f'class_icons-{name}.webp')
        slug = slug_of(name)
        dst = f'icons/tokens-{slug}.webp'
        token(color, icon, ring).save(os.path.join(ROOT, 'images', *dst.split('/')), 'WEBP', quality=90, method=6)
        rec = byd.get(dst) or {}
        rec.update({'group': 'generated tokens', 'src': f'C:/Users/hansen/ai/games/HavenMap/HavenMap/images/common/mercenary_tokens/{slug}.png',
                    'dst': dst, 'status': 'ok', 'bytes': os.path.getsize(os.path.join(ROOT, 'images', *dst.split('/'))), 'size': [OUT, OUT],
                    'generated': 'tools/make-fh-character-tokens.py'})
        if dst not in byd:
            man['files'].append(rec)
        print(f'{name}: {dst}')
    for s, frac in SCANNED.items():
        dst = f'icons/tokens-{s}.webp'
        rec = byd.get(dst)
        if rec and rec.get('cut'):
            continue                                                                     # done in an earlier run
        size = circle_cut(os.path.join(ICONS, f'tokens-{s}.webp'), frac)
        if rec:
            rec.update({'size': size, 'bytes': os.path.getsize(os.path.join(ICONS, f'tokens-{s}.webp')), 'cut': 'tools/make-fh-character-tokens.py'})
        print(f'cut to its disc: {dst} {size[0]}x{size[1]}')
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(man, f, ensure_ascii=False, indent=1)
        f.write('\n')


if __name__ == '__main__':
    main()
