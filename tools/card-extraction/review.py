"""Builds a review page for extracted card code: for each card the original picture next to the card code, the notes of the checker, a copy button, and a place to drop
the screenshot of the card as the card creator renders it, so that the two can be compared by eye.

Usage: python tools/card-extraction/review.py <card code .md> [more .md ...] --class <class code or name> [--out review.html] [--assets PATH]
The page reads the pictures from the asset folder on this machine (file:// addresses) and keeps everything in the browser: nothing is uploaded. Open it with a browser
on the same machine. Needs PyYAML (a tool only)."""
import html
import importlib.util
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, 'tools', file) if name == 'ccc' else os.path.join(HERE, file))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


ccc = load('ccc', 'convert-card-code.py')
chk = load('chk', 'check.py')


def main():
    args = sys.argv[1:]
    files, cls, out, assets = [], None, os.path.join(HERE, 'work', 'review.html'), 'D:/github/Wordhaven_Assets'
    while args:
        a = args.pop(0)
        if a == '--class':
            cls = args.pop(0)
        elif a == '--out':
            out = args.pop(0)
        elif a == '--assets':
            assets = args.pop(0)
        else:
            files.append(a)
    if not files or not cls:
        print(__doc__)
        return 2
    classes = [json.loads(m) for m in re.findall(r'\{"i":\d+,"code":[^}]*\}', open(os.path.join(ROOT, 'scripts/games/gh2_classes.js'), encoding='utf-8').read())]
    match = [c for c in classes if cls.lower() in (c['code'].lower(), c['name'].lower(), str(c['i']))]
    if not match:
        raise SystemExit('unknown class ' + cls)
    c = match[0]
    known = {}
    for m in re.findall(r'\{"id":\d+,"cls":%d,[^}]*\}' % c['i'], open(os.path.join(ROOT, 'scripts/games/gh2_cards.js'), encoding='utf-8').read()):
        k = json.loads(m)
        known[(k['ini'], str(k['lv']))] = k

    def picture(k):
        slug = re.sub(r'[\u2010-\u2015]', '-', k['slug'])
        if c['src'] == 'mp':
            return 'file:///%s/wh_character_ability_cards/mp/%s/mp-%s.png' % (assets, c['code'].lower(), slug)
        return 'file:///%s/wh_character_ability_cards/gh2/%s/%s.jpeg' % (assets, c['code'].upper(), slug)

    text = '\n\n'.join(open(f, encoding='utf-8').read().replace('\r\n', '\n') for f in files)
    cards, errors = ccc.parse_text(text)
    problems = chk.vocabulary(text)
    notes = {}
    for n in chk.plausible(cards, unique_initiative=True):
        notes.setdefault(n.split(':')[0], []).append(n.split(': ', 1)[1] if ': ' in n else n)
    for n in chk.odd_words(cards):
        notes.setdefault(n.split(':')[0], []).append(n.split(': ', 1)[1])
    for name, ps in problems.items():
        for p in sorted(set(ps)):
            notes.setdefault(name, []).append(p)
    chunks = ccc.split_cards(text)
    parsed = {first: card for (first, _), card in zip(chunks, cards)} if len(chunks) == len(cards) else {}
    sections = []
    for first, chunk in chunks:
        name = first.replace('name:', '').strip()
        card = parsed.get(first)
        k = known.get((card['initiative'], str(card['level']))) if card else None
        if card and not k:                                    # the level on the picture may differ from the card list: an initiative used once in the class is enough
            same = [v for key, v in known.items() if key[0] == card['initiative']]
            k = same[0] if len(same) == 1 else None
        pic = '<img class="card" src="%s" alt="%s">' % (picture(k), html.escape(name)) if k else '<div class="card missing">no picture: level and initiative are not a card of %s</div>' % html.escape(c['name'])
        body = []
        for line in chunk.split('\n'):
            esc = html.escape(line)
            body.append('<span class="hl">%s</span>' % esc if '# check' in line or '%?' in line else esc)
        flags = ''.join('<li>%s</li>' % html.escape(n) for n in notes.get(name, []))
        head = '%s <small>level %s, initiative %s%s</small>' % (html.escape(name), card['level'] if card else '?', card['initiative'] if card else '?', ' | card %d' % k['id'] if k else '')
        sections.append('<section><div>%s</div><div class="tx"><h3>%s</h3><button type="button" class="cp">Copy card code</button>'
                        '<pre>%s</pre>%s<div class="drop" tabindex="0">Drop or paste a screenshot of the rendered card here<br><input type="file" accept="image/*"></div></div></section>'
                        % (pic, head, '\n'.join(body), '<ul class="notes">%s</ul>' % flags if flags else ''))
    for first, msg in errors:
        sections.append('<section><div class="tx"><h3>%s</h3><p class="bad">Not readable: %s</p></div></section>' % (html.escape(first), html.escape(msg)))
    page = PAGE % {'title': html.escape(c['name']) + ' cards: picture next to extracted card code', 'count': len(cards), 'sections': '\n'.join(sections)}
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    open(out, 'w', encoding='utf-8').write(page)
    print('%d cards -> %s' % (len(cards), out))
    return 0


PAGE = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>%(title)s</title><style>
:root{--bg:#1b1717;--fg:#e8ddd6;--mut:#b9a79c;--panel:#2b2323;--line:#4a3c3c;--acc:#e0b86a;--bad:#c0504d}
body{background:var(--bg);color:var(--fg);font:14px system-ui,sans-serif;margin:16px}
h1{font-size:18px;margin:0 0 4px}p.lead{color:var(--mut);margin:0 0 12px}
section{display:flex;gap:18px;border-top:1px solid var(--line);padding:16px 0;align-items:flex-start;flex-wrap:wrap}
.card{width:433px;max-width:100%%;border-radius:8px;display:block}.card.missing{height:120px;display:flex;align-items:center;padding:12px;background:var(--panel);color:var(--mut)}
.tx{flex:1;min-width:320px;max-width:760px}h3{margin:0 0 8px}small{color:var(--mut);font-weight:400}
pre{background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:10px;margin:8px 0;overflow:auto;max-height:560px;font:12.5px/1.45 ui-monospace,Consolas,monospace;white-space:pre}
.hl{background:#5a4a1f;display:inline-block;width:100%%}
button{background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:4px 10px;cursor:pointer}button:hover{border-color:var(--acc)}
.notes{margin:6px 0;padding-left:18px;color:var(--acc);font-size:13px}.bad{color:var(--bad)}
.drop{border:2px dashed var(--line);border-radius:8px;padding:10px;color:var(--mut);text-align:center;margin-top:8px}.drop img{max-width:100%%;display:block;margin:8px auto 0;border-radius:6px}
</style></head><body><h1>%(title)s</h1><p class="lead">%(count)d cards. Left: the card picture. Right: the extracted card code (lines the reader was unsure about are marked). Paste the code into the card creator, then drop its screenshot into the frame under the code to compare. Everything stays in this browser.</p>
%(sections)s
<script>
document.querySelectorAll('.cp').forEach(function(b){b.addEventListener('click',function(){var t=b.parentNode.querySelector('pre').innerText;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy card code'},1200)}).catch(function(){var r=document.createRange();r.selectNodeContents(b.parentNode.querySelector('pre'));getSelection().removeAllRanges();getSelection().addRange(r)})})});
document.querySelectorAll('.drop').forEach(function(d){function show(f){if(!f||!/^image\\//.test(f.type))return;var r=new FileReader();r.onload=function(){var i=d.querySelector('img')||d.appendChild(document.createElement('img'));i.src=r.result};r.readAsDataURL(f)}
d.querySelector('input').addEventListener('change',function(e){show(e.target.files[0])});d.addEventListener('dragover',function(e){e.preventDefault()});d.addEventListener('drop',function(e){e.preventDefault();show(e.dataTransfer.files[0])});d.addEventListener('paste',function(e){var it=[].slice.call(e.clipboardData.items).filter(function(x){return/^image\\//.test(x.type)})[0];if(it)show(it.getAsFile())})});
</script></body></html>
"""

if __name__ == '__main__':
    sys.exit(main())
