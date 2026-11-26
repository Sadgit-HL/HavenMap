#!/usr/bin/env python3
"""Renders class icon SVGs to 96 px transparent PNG for upload to BGG (the image IDs then go into the BGG codes list).

Source: images/icons/sources/<svg>. Output: tools/bgg-icons-upload/large/<name>.png (the folder of lost, persistent, removed, round), named like the
card word the Turn post still writes as plain text (scripts/games/turn_templates.js, scripts/turnTemplate.js). Needs ImageMagick (magick).
After the upload: add the [ImageID=...] codes to the BGG codes list in campaign/mockups/merc-6-playmat-v2.html and run tools/extract-bgg-icons.py.

Usage: python -I tools/make-bgg-upload-icons.py
"""
import os
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'images', 'icons', 'sources')
OUT = os.path.join(ROOT, 'tools', 'bgg-icons-upload', 'large')
SIZE = 96
ICONS = {                                  # output name: source svg
    'augment': 'gh2e-augment', 'bear-summon': 'gh2e-bear-summon', 'command': 'gh2e-command', 'doom': 'gh2e-doom',
    'high-note': 'gh2e-high-note', 'low-note': 'gh2e-low-note', 'prescription': 'gh2e-prescription', 'song': 'gh2e-song',
    'supplies': 'gh2e-supplies', 'tear': 'gh2e-tear', 'infusion': 'Infusion', 'fh-tides': 'Tide', 'fh-resonance': 'Wave',
    'hive-mode': 'Hive0x', 'hive-transfer': 'Hive2x',                 # hive-mode is the icon of both prism-mode and fh-mode
    'gain_pressure': 'SteamPlus', 'lose_pressure': 'SteamMinus', 'blinkblade-1': 'blinkblade_fast', 'blinkblade-0': 'blinkblade_slow',
}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, svg in ICONS.items():
        out = os.path.join(OUT, name + '.png')
        subprocess.run(['magick', '-background', 'none', '-density', '600', os.path.join(SRC, svg + '.svg'), '-trim', '+repage', '-resize', f'{SIZE}x{SIZE}',
                        '-gravity', 'center', '-extent', f'{SIZE}x{SIZE}', out], check=True)
        print(out)


if __name__ == '__main__':
    main()
