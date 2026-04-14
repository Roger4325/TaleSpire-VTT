# Homebrew, Imports, and Exports Guide

This guide covers custom content, data import, and data export workflows in the TaleSpire 5e Toolset.

## Overview

The toolset supports both built-in content and custom content. Depending on where you are in the app, you can create, import, export, edit, and delete different types of data.

Common content types include:
- Characters
- Custom spells
- Custom items
- Custom monsters
- Custom shops

## Where To Find Homebrew Tools

### On The DM Screen

Use the `Homebrew` button to manage:
- Monsters
- Spells
- Items
- Shops

### On The Player Sheet

Use the `Homebrew` button to manage:
- Spells
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
