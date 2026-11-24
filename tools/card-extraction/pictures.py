"""Where the ability card pictures are.

Default: the repo's own folder, images/character-abilities/<gh2|mp>/<class code>-<slug>.webp (for example gh2/bs2-brute-force.webp, mp/hl-withering-stare.webp, fh/me-fh-ancient-drill.webp).
With an `assets` folder (an older clone of Sadgit-HL/Wordhaven_Assets) the old layout is used: wh_character_ability_cards/gh2/<CODE>/<slug>.jpeg and mp/<code>/mp-<slug>.png.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOCAL = os.path.join(ROOT, 'images', 'character-abilities')


def card_picture(src, code, slug, assets=None):
    """src: 'gh2' or 'mp' (the class's source in gh2_classes.js); code: class code (bs2, hl); slug: card slug."""
    slug = re.sub(r'[\u2010-\u2015]', '-', slug)                      # some slugs hold a typographic hyphen, the files do not
    if assets:
        if src == 'mp':
            return '%s/wh_character_ability_cards/mp/%s/mp-%s.png' % (assets, code.lower(), slug)
        return '%s/wh_character_ability_cards/gh2/%s/%s.jpeg' % (assets, code.upper(), slug)
    name = '%s-fh-%s.webp' % (code.lower(), slug) if src == 'fh' else '%s-%s.webp' % (code.lower(), slug)     # Frosthaven pictures: me-fh-ancient-drill.webp
    return os.path.join(LOCAL, src, name).replace(os.sep, '/')
