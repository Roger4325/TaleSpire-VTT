# Local Content (DM-provided, not committed)

The symbiote can load extra spells, races, classes, and subclasses from an
optional `local-content/` folder at the repo root. The folder is **gitignored**
so licensed book content you own never lands in the public repository. To share
it with your players, send them the folder directly (zip, Discord, private
drive, etc.) and have them drop it into their copy of the symbiote:

```
TaleSpire/Symbiotes/TaleSpire-VTT/
├── local-content/          <- gitignored, distributed out-of-band
│   ├── spells.json
│   ├── races.json
│   ├── classes.json
│   └── subclasses.json
├── spells-eng.json
└── CharacterCreator/
```

Every file is optional. A missing or invalid file is skipped silently (a
warning is logged to the console) and the app runs on the shipped data alone.

## How each file is merged

| File | Shape | Merge rule |
|---|---|---|
| `spells.json` | Array of spell objects, same fields as `spells-eng.json` | Added to the catalog everywhere spells are listed (sheet, DM screen, creator). A local spell with the same **name + year** as a shipped spell replaces it. |
| `races.json` | Object keyed by race key, same shape as `CharacterCreator/Races.json` | Merged into the creator's race list. Same key replaces the built-in race; new keys add races. |
| `classes.json` | `{ "classes": { "<classKey>": {...} } }`, same shape as `CharacterCreator/Classes.json` | Same key replaces the whole built-in class; new keys add classes (e.g. `artificer`). |
| `subclasses.json` | `{ "<classKey>": { "<Subclass Name>": {...} } }`, each entry shaped like a `Classes.json` subclass | Merged into that class's subclass list and its level-up choice dropdowns. Same name replaces the built-in (useful for completing trimmed entries). |

Notes that apply across files:

- **Edition filtering.** Spells and subclasses honor the D&DVersion setting via
  an optional `"year"` field (`"2014"` or `"2024"`, default `"2014"`). Entries
  tagged `"2024"` are hidden when the campaign is set to 2014 rules and vice
  versa; `both` shows everything (2024 entries get the 🜁 suffix, same as the
  shipped catalog).
- **Local vs. homebrew.** Content here behaves like *built-in* content: unlike
  homebrew subclasses created in the sheet's Homebrew tab, local subclasses may
  replace built-ins, and the homebrew name-collision check treats local names
  as reserved.
- **Restart required.** Files are read when a page loads; reopen the symbiote
  after editing them.

## Authoring tips

The starter files in `local-content/` contain one worked example each — copy
the shape and replace the content. The committed data files are the full
schema reference:

- **Spells** — copy any entry from `spells-eng.json`. Useful conventions:
  `casting_time` uses `1A` / `1BA` / `1R` / `1m` / `1Hr`; `level` is
  `Cantrip` or `1st-level` … `9th-level`; `toHitOrDC` is `toHit`, `DC`, or
  empty. Auto-granted subclass spells are driven by tags **on the spell
  entry**: `domains` (cleric), `oaths` (paladin), `circles` (druid) make the
  spell always-prepared for matching subclasses, and `patrons` (warlock)
  expands the matching patron's options list. So when adding a subclass with
  a spell list, either tag the spells here, or put a `subclassSpells` block on
  the subclass (below).
- **Races** — copy an entry from `CharacterCreator/Races.json`. The `bonuses`
  array (category `attributes`, key `STR`/`DEX`/…) is what actually applies
  the ability score increase; `abilityScoreIncrease` is display data. Keep
  both in sync. `subraces` is optional.
- **Classes** — copy a class from `CharacterCreator/Classes.json`. This is the
  biggest schema (level progression, choices, spellcasting tables, starting
  equipment — item names must match `equipment-eng.json` exactly).
- **Subclasses** — copy a subclass from any class in
  `CharacterCreator/Classes.json`, e.g. cleric → `Life` for a domain with
  `domainSpells`, or fighter → `Eldritch Knight` for a third-caster
  `spellcasting` block. A homebrew-style
  `subclassSpells: { "mode": "prepared"|"expanded", "byLevel": { "3": ["Spell"] } }`
  block also works if you'd rather not tag catalog spells.

## Publishing checklist

`local-content/` is listed in `.gitignore`, so `git status` should never show
it. Before pushing the public repo, `git status --ignored` is a quick way to
confirm the folder is being ignored rather than tracked.
