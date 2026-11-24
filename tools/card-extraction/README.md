# Card extraction: ability card pictures to card code

For the classes that have no Secretariat data (the Gloomhaven 2e classes without a deck file, and the Mercenary Pack classes). A reader (a Claude agent or a person) looks at the card picture and writes the card code, the structured text the owner writes cards with (`import/card_code_*.md`). `tools/convert-card-code.py` turns card code into JSON actions.

What the first two classes (Hail, Cassandra; 57 cards written by the owner) taught, and what the tool now builds in:

- The target is the owner's card code, not free-form JSON: a dashed pill is `optional:` (with a resolve or element cost), a dark `!` row is `mandatory:`, flags (`xp`, `lost`, `remove`, `duration`, `infuse`) sit on the half, areas are `hex:` patterns, summons are `summon:` blocks.
- Icons are read against a reference sheet built from the app's own icons (`make-icon-sheet.py`). Without one, readers named most diamonds wrongly (green heart as regenerate, a tower as an unknown icon); with it they match.
- Worked examples (a picture with the owner's card code) in every brief: the strongest help for a new reader.
- An icon that cannot be named is written `%?description%`, never guessed. `check.py` lists them for the owner.
- The result is checked: every card must parse, keys, tokens and hex letters must be known, level and initiative must be cards of the class, and where card code is known it is compared half by half.

## The format

The card code is the syntax of the Card Creator of the Gloomhaven and Frosthaven Enhanced Tabletop Simulator mod (the web tool the owner pastes it into, https://gloomhaven-party-tracker.herokuapp.com/). Its documentation, the authority for keys, conditions, elements, hex letters, tokens, summons and flags: https://gloomhaven-tts-enhanced.github.io/public-scripts/creator/card_creator.html (source of the pages: github.com/gloomhaven-tts-enhanced/public-scripts, folder docs; the creator itself is not in that repository). `brief.md` follows it; `check.py` knows its vocabulary.

## Use

```
python tools/card-extraction/prepare.py <class code, name or index> [--batch 7] [--only slug,slug] [--out DIR]
```

writes `DIR/<class>/batch<N>.md` (default `tools/card-extraction/work/`, not committed): instructions, icon sheet, worked examples and 7 cards each. Give each batch to a reader (a Claude agent: "read the task file and do it"). The reader writes `batch<N>.card.md`. Then:

```
python tools/card-extraction/review.py DIR/<class>/batch*.card.md --class <code>     # picture next to code, to compare in the card creator
python tools/card-extraction/check.py DIR/<class>/batch*.card.md --class <code>
python tools/card-extraction/check.py extracted.md --truth import/card_code_hail.md
```

The checker lists unreadable cards, unknown keys and tokens, unidentified icons, empty halves, cards that are not in the class, missing cards, and with `--truth` the share of halves whose actions agree. The owner then looks at the `%?...%` icons and `# check:` comments, completes the class tokens, and the card code joins `import/`.

Needs PyYAML and Pillow (tools only; the app has no dependencies).

## First blind test (2026-11-24)

28 cards (14 Hail, 14 Cassandra) read by four Claude agents from the pictures only, with the brief, the icon sheet and four worked examples (none of them in the test); compared with the owner's card code:

- Same actions in 20 of 26 Hail halves (77%) and 20 of 28 Cassandra halves (71%); text similarity 0.98 and 0.94. One Hail card (Leave Me Alone) was not valid YAML. One icon was left unidentified (correctly, the token-circle row), none was guessed wrong into a new token.
- The errors: hex areas (3 of 4 area cards wrong), a banner with one element read as `infuse` instead of `mandatory` (3 halves), a missing range or target (6 pills), persistent against round. The brief now says: single element banner is `mandatory`, quote every text, read every pill, known hex shapes, `tokens:`. The checker also stopped counting a pill written as text (`+3 %teleport%`) against the same action written out as a difference.
- Not repeated since the brief changed. Cost of the test: about 230,000 tokens for 28 cards (a class of 30 cards is about 5 batches).

## Second blind test (same 28 cards, enlarged halves and the improved brief)

- Same actions in 20 of 26 Hail halves and 21 of 28 Cassandra halves (before: 20 and 20); text similarity 0.993 and 0.960 (before: 0.984 and 0.937). The differing facts fell from 29 to 18; without hex areas, from 22 to 16.
- The banner, infuse and flag mistakes of the first run are gone. What is left: a missing range or target in a pill (4), a cost written after its action (3, now stated in the brief), `infuse` written as an action once, a missing persistent flag, and one wrong hex shape.
- Not independent for hex areas: the brief now lists known shapes, and three of them belong to test cards (Withering Stare, Careful Attunement, Ethereal Vortex). Two of those three came out right, which proves nothing. Judge areas on a class the brief has not seen.
- More tuning on these 28 cards would only fit them. The next measure is a real class, checked by the owner.

Treat the output as a first draft for the owner to correct: area patterns and `# check:` comments first.

## Files

| File | What |
|---|---|
| `brief.md` | the instructions for a reader: format, actions, flags, icons, quality rules |
| `prepare.py` | builds the batches for a class |
| `make-icon-sheet.py` | builds `icons.png`, the reference sheet |
| `review.py` | builds a page with each card picture next to its extracted card code, the checker's notes, a copy button and a frame for a screenshot of the rendered card |
| `check.py` | validates extracted card code (also `unusual:` notes from the priors and `word:` notes from `vocab.txt`), compares with known card code |
| `gh2e-patterns.md` | what 205 Gloomhaven 2e cards look like: structures, marker shapes, values, flags, texts |
| `build-vocab.py`, `vocab.txt` | the word list (885 words of printed card texts) behind the `word:` notes |
| `../convert-card-code.py` | card code to JSON actions (also used by the checker) |
