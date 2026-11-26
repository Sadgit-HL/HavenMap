#!/usr/bin/env python3
"""Renders class icon SVGs to PNG for upload to BGG: 20 px high (tools/bgg-icons-upload/<name>.png, the size of the forum icons) and a 96 px square
original (tools/bgg-icons-upload/large/<name>.png) (the image IDs then go into the BGG codes list).

Source: images/icons/sources/<svg>. Output: the folder of lost, persistent, removed, round, named like the
card word the Turn post still writes as plain text (scripts/games/turn_templates.js, scripts/turnTemplate.js). Needs ImageMagick (magick).
After the upload: add the [ImageID=...] codes to the BGG codes list in campaign/mockups/merc-6-playmat-v2.html and run tools/extract-bgg-icons.py.

Usage: python -I tools/make-bgg-upload-icons.py
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'images', 'icons', 'sources')
OUT = os.path.join(ROOT, 'tools', 'bgg-icons-upload')
SIZE = 96
HEIGHT = 20
ICONS = {                                  # output name: source svg
    'augment': 'gh2e-augment', 'bear-summon': 'gh2e-bear-summon', 'command': 'gh2e-command', 'doom': 'gh2e-doom',
    'high-note': 'gh2e-high-note', 'low-note': 'gh2e-low-note', 'prescription': 'gh2e-prescription', 'song': 'gh2e-song',
    'supplies': 'gh2e-supplies', 'tear': 'gh2e-tear', 'infusion': 'Infusion', 'fh-tides': 'Tide', 'fh-resonance': 'Wave',
    'hive-mode': 'Hive0x', 'hive-transfer': 'Hive2x',                 # hive-mode is the icon of both prism-mode and fh-mode
    'gain_pressure': 'SteamPlus', 'lose_pressure': 'SteamMinus', 'blinkblade-1': 'blinkblade_fast', 'blinkblade-0': 'blinkblade_slow',
}
# The Metal Mosaic pressure gauge, drawn for 20 px (the photo-like token is unreadable that small): a disc in the colour of the state, a thick dark needle
# whose angle also tells the state (low: left, regular: upper left, high: upper right, over: right), a dark outline. Colour and angle together, so it
# does not rely on colour alone. Written to images/icons/sources/<name>.svg, then rendered like the others.
PRESSURE = {'low_pressure': (0, '#2f6bff'), 'regular_pressure': (1, '#22c55e'), 'high_pressure': (2, '#ffd21f'), 'over_pressure': (3, '#ff3b30')}


def pressure_svg(active, colour):
    import math
    nx, ny = 50 + 32 * math.cos(math.radians(180 + 60 * active)), 50 + 32 * math.sin(math.radians(180 + 60 * active))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="{colour}" stroke="#111111" stroke-width="8"/>'
            f'<line x1="50" y1="50" x2="{nx:.1f}" y2="{ny:.1f}" stroke="#111111" stroke-width="14" stroke-linecap="round"/><circle cx="50" cy="50" r="13" fill="#111111"/></svg>')


def main():
    only = set(sys.argv[1:])                                                        # names to make; none given: all (this rewrites the files of the others as well)
    os.makedirs(os.path.join(OUT, 'large'), exist_ok=True)
    for name, (active, colour) in PRESSURE.items():
        with open(os.path.join(SRC, name + '.svg'), 'w', encoding='utf-8', newline=chr(10)) as f:
            f.write(pressure_svg(active, colour))
    for name, svg in {**ICONS, **{n: n for n in PRESSURE}}.items():
        if only and name not in only:
            continue
        out = os.path.join(OUT, 'large', name + '.png')
        subprocess.run(['magick', '-background', 'none', '-density', '600', os.path.join(SRC, svg + '.svg'), '-trim', '+repage', '-resize', f'{SIZE}x{SIZE}',
                        '-gravity', 'center', '-extent', f'{SIZE}x{SIZE}', out], check=True)
        small = os.path.join(OUT, name + '.png')                                       # 20 px high, the width follows the picture
        subprocess.run(['magick', '-background', 'none', '-density', '600', os.path.join(SRC, svg + '.svg'), '-trim', '+repage', '-resize', f'x{HEIGHT}', small], check=True)
        print(small)


if __name__ == '__main__':
    main()
