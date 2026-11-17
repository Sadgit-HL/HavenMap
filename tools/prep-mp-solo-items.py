#!/usr/bin/env python3
"""Prepare the Mercenary Pack solo item pictures for tools/extract-solo-items.py: straighten, crop and improve.

Input folder (--src, the owner's Worldhaven folder characters/mp/character_solo_items):
  hail_front.png, hail_back.png   scans of No Nonsense Boots with a transparent rim. The side with the card number (22)
                                  is the front of the card (it is the side the item starts on), so hail_back.png -> HL.png
                                  and hail_front.png -> HLb.png.
  mercenary-character-mats-and-solo-items-less-terrible-v0-*.webp
                                  photographs of the other cards on a dark cloth: found, straightened (perspective) and
                                  cropped; the colours are balanced and the picture sharpened a little.
Output folder (--out): <id>.png (front) and <id>b.png (back, only for cards with a second side), 588x900.

Usage: python -I tools/prep-mp-solo-items.py --src "P:/Guido/boardgames/Worldhaven/characters/mp/character_solo_items" --out <folder>
"""
import argparse
import os

import cv2
import numpy as np

W, H = 588, 900                         # the 196x300 item ratio, three times
PHOTOS = {                              # photograph (file name ending) -> output name
    'cq8cixblhgf1': 'AN',               # Ribbon of Friendship
    'szvumhxblhgf1': 'SA',              # Crest of Frosthaven, front (card number 24)
    'kltfzkxblhgf1': 'SAb',             # Crest of Frosthaven, back
    'hkmhguxblhgf1': 'CS',              # Basin of Prophecy, front (card number 16)
    'wep35uxblhgf1': 'CSb',             # Basin of Prophecy, back
}
SCANS = {'hail_back.png': 'HL', 'hail_front.png': 'HLb'}


def order(pts):
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    return np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], dtype=np.float32)


def card_corners(img):
    """The four corners of the card: the largest region brighter than the dark cloth, reduced to a quadrilateral. The cloth
    level is read from the picture's border (the card never touches it); the dark wood of the card is still well above it."""
    g = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (15, 15), 0)
    border = np.concatenate([g[:20].ravel(), g[-20:].ravel(), g[:, :20].ravel(), g[:, -20:].ravel()])
    b, _, r = cv2.split(cv2.GaussianBlur(img, (15, 15), 0).astype(np.int16))
    red = r - b > 25                                  # the dark red title banner is not brighter than the cloth, but it is red
    m = (((g > np.percentile(border, 90) + 10) | red) * 255).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((41, 41), np.uint8))
    cs, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    hull = cv2.convexHull(max(cs, key=cv2.contourArea))
    peri = cv2.arcLength(hull, True)
    for eps in np.linspace(0.01, 0.1, 40):
        q = cv2.approxPolyDP(hull, eps * peri, True)
        if len(q) == 4:
            return refine(order(q.reshape(4, 2).astype(np.float32)), max(cs, key=cv2.contourArea).reshape(-1, 2).astype(np.float32))
    raise SystemExit('no card outline found')


def refine(q, pts):
    """The rough corners sit inside the rounded corners of the card. Fit a straight line to the outline points along the middle
    of each side (away from the corners) and take the crossings of those lines as the corners."""
    lines = []
    for i in range(4):
        a, b = q[i], q[(i + 1) % 4]
        d = b - a
        n = np.array([-d[1], d[0]]) / np.linalg.norm(d)
        t = (pts - a) @ d / (d @ d)
        near = (np.abs((pts - a) @ n) < 25) & (t > 0.15) & (t < 0.85)
        vx, vy, x0, y0 = cv2.fitLine(pts[near], cv2.DIST_HUBER, 0, 0.01, 0.01).ravel()
        lines.append((np.array([x0, y0]), np.array([vx, vy])))
    out = []
    for i in range(4):
        (p1, d1), (p2, d2) = lines[i - 1], lines[i]
        s = np.linalg.solve(np.array([d1, -d2]).T, p2 - p1)
        out.append(p1 + s[0] * d1)
    return np.array(out, dtype=np.float32)


def improve(img):
    """Grey-world white balance (half strength), local contrast on the lightness, a light unsharp mask."""
    f = img.astype(np.float32)
    mean = f.reshape(-1, 3).mean(0)
    f *= (1 + 0.5 * (mean.mean() / mean - 1))
    img = np.clip(f, 0, 255).astype(np.uint8)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    lab[..., 0] = cv2.createCLAHE(clipLimit=1.6, tileGridSize=(6, 6)).apply(lab[..., 0])
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    blur = cv2.GaussianBlur(img, (0, 0), 1.6)
    return cv2.addWeighted(img, 1.5, blur, -0.5, 0)


def inset(img, f):
    """Cut a rim of f (share of the size) on every side: the rounded corners and the cloth at the edge go."""
    h, w = img.shape[:2]
    dx, dy = round(w * f), round(h * f)
    return cv2.resize(img[dy:h - dy, dx:w - dx], (W, H), interpolation=cv2.INTER_AREA)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--src', required=True)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for f in sorted(os.listdir(a.src)):
        key = next((k for k in PHOTOS if os.path.splitext(f)[0].endswith(k)), None)
        if key:
            img = cv2.imread(os.path.join(a.src, f), cv2.IMREAD_COLOR)
            q = card_corners(img)
            M = cv2.getPerspectiveTransform(q, np.array([[0, 0], [W, 0], [W, H], [0, H]], dtype=np.float32))
            card = cv2.warpPerspective(img, M, (W, H), flags=cv2.INTER_CUBIC)
            cv2.imwrite(os.path.join(a.out, PHOTOS[key] + '.png'), improve(inset(card, 0.012)))
            print(f, '->', PHOTOS[key])
        elif f in SCANS:
            rgba = cv2.imread(os.path.join(a.src, f), cv2.IMREAD_UNCHANGED)
            ys, xs = np.where(rgba[..., 3] > 200)
            card = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1, :3]
            cv2.imwrite(os.path.join(a.out, SCANS[f] + '.png'), inset(cv2.resize(card, (W, H), interpolation=cv2.INTER_AREA), 0.018))
            print(f, '->', SCANS[f])


if __name__ == '__main__':
    main()
