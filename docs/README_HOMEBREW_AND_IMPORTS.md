# Homebrew, Imports, and Exports Guide

This guide covers custom content, data import, and data export workflows in the TaleSpire 5e Toolset.

## Overview

The toolset supports both built-in content and custom content. Depending on where you are in the app, you can create, import, export, edit, and delete different types of data.

Common content types include:
- Characters
- Custom spells
- Custom subclasses
- Custom races
- Custom feats
- Custom items
- Custom monsters
- Custom shops

## Where To Find Homebrew Tools

### On The DM Screen

Use the `Homebrew` button to manage:
- Monsters
- Spells
- Subclasses
- Races
- Feats
- Items
- Shops

### On The Player Sheet

Use the `Homebrew` button to manage:
- Spells
- Subclasses
- Races
- Feats
- Items
- Character data

## Storage Overview

The Homebrew modal shows storage usage bars for:
- Local storage
- Global storage

These bars help you keep track of how much custom content is being stored.

Best practice:
- Remove old or unused homebrew when it is no longer needed
- Keep very large long-form notes outside the symbiote

## Creating Homebrew Content

Depending on the screen you are using, you can create different types of custom content.

### Custom Spells

Custom spells can be used when:
- A campaign includes homebrew magic
- You want to test a spell design
- You want to share a custom spell between saves

### Custom Subclasses

Custom subclasses can be created from the Homebrew menu on both the DM Screen and the Player Sheet. Each subclass records:
- The class it belongs to
- The edition it targets: 5e (2014) or 5.5e (2024)
- Its features, each tied to a class level

The form is verified against both editions: it shows the levels at which the chosen class gains subclass features for the chosen edition, blocks names that collide with built-in subclasses, and warns when feature levels fall outside the official pattern (you can still save anyway for intentional homebrew).

Subclasses can also grant spells:
- **Spellcasting (third-caster)**: gives the subclass an Eldritch Knight-style progression. Pick the casting ability, which class list it casts from, the cantrip pattern, and optionally restrict spell schools. The known-spells and slot tables are generated automatically.
- **Granted Spells — Always prepared**: domain/oath-style lists. Each entry is a class level plus the spells granted at it; they show as "always prepared" in the Character Creator and don't count against the prepared total.
- **Granted Spells — Added to spell list**: patron-style expansion. The listed spells become pickable class spells for characters with the subclass.

Spell names are verified against the 5e and 5.5e catalogs plus your Custom Spells; unknown names produce a warning, and prepared-list grant levels are checked against the official domain/circle/oath patterns.

Saved subclasses appear in the Character Creator as selectable subclasses for their class, filtered by the D&D Version setting the same way spells are. Import and export work like spells: export copies the subclass JSON to the clipboard, import accepts that same JSON. (Custom base classes are planned to follow the same storage pattern in the future.)

### Custom Races

Custom races can be created from the Homebrew menu on both the DM Screen and the Player Sheet. Each race records:
- The edition it targets: 5e (2014) or 5.5e (2024)
- Size and walking speed
- Ability score increases (each row is a fixed bonus such as +2 Dexterity, +1 Wisdom)
- Languages
- Traits, each with a name and description
- Skill, weapon, armor, and tool proficiencies
- Spells granted (verified against the 5e/5.5e catalogs plus your Custom Spells)

The form blocks names that collide with a built-in or DM-provided race and warns on things like a 0 speed, no ability increase, or an unknown granted spell (you can still save anyway for intentional homebrew). Saved races appear in the Character Creator's Species step, filtered by the D&D Version setting.

### Custom Feats

Custom feats can be created from the Homebrew menu on both the DM Screen and the Player Sheet. Each feat records:
- The edition it targets: 5e (2014) or 5.5e (2024)
- A prerequisite line (free text; leave blank for none)
- A description (one paragraph per line; start a line with a bullet for a bullet point)
- Ability score increase: add one ability for a fixed +N, or add several to let the player pick one of them (half-feat style — the Character Creator renders the picker automatically)
- Spells granted and proficiencies granted
- Whether the feat can be taken more than once

The form blocks names that collide with a built-in or DM-provided feat and warns on an empty description or an unknown granted spell. Saved feats appear in the Character Creator's feat choice lists, filtered by the D&D Version setting.

Both races and feats import and export like spells and subclasses: export copies the JSON to the clipboard, import accepts that same JSON.

### Custom Items

Custom items are useful for:
- Magic items
- Campaign-specific rewards
- Homebrew equipment
- Special rule-driven gear

Items can affect the player sheet in multiple ways, depending on how they are configured.

### Custom Monsters

Custom monsters are primarily managed from the DM side.

Use them for:
- Bosses
- Homebrew creatures
- NPC stat blocks
- Campaign-specific enemies

### Custom Shops

Custom shops are useful when:
- A settlement has unique inventory
- A campaign uses recurring merchants
- You want easy access to themed shop setups

## Importing Character Data

Character import is handled from the Player Sheet homebrew area.

### Standard Character Import

1. Open the Homebrew menu on the Player Sheet.
2. Click `Import Character Data`.
3. Paste the character JSON into the import window.
4. Save the import.

This is useful for:
- Moving a character between setups
- Sharing a character with someone else
- Bringing exported toolset data back into the sheet

## D&D Beyond Import

The player import workflow can also handle supported D&D Beyond character data.

### How It Works

1. Open the Homebrew menu on the Player Sheet.
2. Click `Import Character Data`.
3. Paste the supported D&D Beyond JSON.
4. Save the import.

The toolset detects the format and converts it into the internal character structure.

This helps players get started without rebuilding everything by hand.

## Exporting Data

The toolset can export saved data so it can be shared or stored elsewhere.

### Character Export

From the Player Sheet homebrew area:
1. Choose the character from the export dropdown.
2. Click `Export Character`.

### Spell Export

From the Player Sheet or DM homebrew area:
1. Select the spell you want to export.
2. Use the export control for that spell.

### Item Export

From the Player Sheet or DM homebrew area:
1. Select the item you want to export.
2. Use the export control for that item.

## Editing And Deleting Content

Homebrew menus also support editing and deletion for supported content types.

This is useful when:
- A design changes
- You want to rebalance an item or spell
- A campaign-specific asset is no longer needed

## Character Creator Relationship

The Character Creator and the import workflow are meant to work together.

Recommended flow:
1. Build a character in the Character Creator.
2. Copy the generated character data.
3. Open the Player Sheet import workflow.
4. Paste the data into `Import Character Data`.
5. Save it into the player sheet.

## Recommended Workflow

For most groups, this order works well:

1. Build or import characters first.
2. Create only the homebrew content you actually need for the campaign.
3. Export important custom content if you want a backup or shareable copy.
4. Keep an eye on storage usage over time.

## Tips

- Import is the fastest way to move completed character data into the player sheet.
- Export is useful for backups and sharing.
- Homebrew items and traits can affect many parts of the player sheet, so test them after creation.
- Use the DM side for monster and shop management, and the Player side for character-centered workflows.
