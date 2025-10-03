# Talespire VTT

A sparkling new symbiote!

## DM Screen Guide

The DM Screen is a comprehensive tool designed to help Dungeon Masters manage their D&D 5e campaigns within TaleSpire. This guide covers all sections and features available in the DM Screen.

### Table of Contents
- [Initiative Tracker](#initiative-tracker)
- [DM Tables](#dm-tables)
- [Checklists](#checklists)
- [Spell List](#spell-list)
- [Notes](#notes)
- [Google Docs Integration](#google-docs-integration)
- [Settings & Customization](#settings--customization)

---

## Initiative Tracker

The Initiative Tracker is the core combat management tool for DMs.

### Features

#### Monster & Player Management
- **Add Monsters**: Type monster names in the monster input field to search and add creatures from the Monster Manual
- **Add Players**: Type player names to add party members to initiative
- **Auto Roll Initiative**: Automatically rolls initiative for all creatures in the tracker
- **Manual Initiative**: Click on initiative values to edit them manually or roll the monsters initiative by clicking on their initiative value and watch it be updated in real time. 
- **Turn Navigation**: Use "Previous Turn" and "Next Turn" buttons to manage combat flow

![Initiative Tracker Interface - Image placeholder]

#### Combat Controls
- **Round Counter**: Click to edit the current round number
- **Advantage/Disadvantage Toggle**: Set global advantage/disadvantage for rolls
- **Condition Management**: Add conditions to creatures using the dropdown and "Add Condition" button. Bane and Bless will apply automatically to all d20 rolls that monster does when active.
- **Health Tracking**: Modify creature HP directly on their cards
- **Active Monster**: Click on any monster to make that the active monster. 
- **Monster Stat Block**: Click on any monster's Name to open their Stat Block. 

#### Monster Cards
Each monster in initiative displays:
- **Basic Stats**: AC, HP, Speed, and a basic attack are displayed on the front card. 
- **Ability Scores**: All six ability scores with modifiers
- **Saves & Skills**: Proficient saves and skills
- **Damage Resistances/Immunities**: Quick reference for damage types
- **Actions**: All monster actions, reactions, and legendary actions
- **Conditions**: Applied conditions with removal buttons

![Monster Card Example - Image placeholder]

#### Player Cards
Player cards show:
- **Basic Info**: Name, class, level
- **Health**: Current and maximum HP
- **AC & Stats**: Armor class and ability scores
- **Conditions**: Applied conditions
- **Custom Fields**: DM can add custom information
- **Connected Player**: If the players have their character sheets opened then these stats will update in real time as the players change their sheet. 


#### Encounter Management
- **Save Encounter**: Save current monster setup for later use
- **Load Encounter**: Load previously saved encounters
- **Auto-Save**: Automatically saves encounters as "AutoSaveTemporary"

---

## DM Tables

A collection of reference tables and tools for quick access during gameplay.

### Available Tables

#### Conditions Table
- **Reference**: Complete list of D&D 5e conditions with descriptions
- **Search**: Filter conditions by name
- **Quick Access**: Click conditions to copy descriptions

![Conditions Table - Image placeholder]

#### Effects Table
- **Custom Effects**: Add your own custom effects and descriptions
- **Add Rows**: Use "Add Row" button to create new effect entries
- **Editable**: All entries can be edited directly in the table

#### Magic Schools Table
- **School Reference**: All eight schools of magic with descriptions
- **Spell Classification**: Help classify and understand spell schools

#### Shops
- **Pre-built Shops**: Adventuring Supplies, Alchemist/Herbalist, Blacksmith/Armory, General Store, Hunter/Leatherworker, Jeweler, Library/Bookstore
- **Shop Selection**: Dropdown to switch between different shop types
- **Custom Shops**: Create your own shops using the shop creation form
- **Equipment Integration**: Links with the equipment database

![Shop Interface - Image placeholder]

#### Travel Tables
- **Travel Pace**: Different travel speeds and their effects
- **Transportation Costs**: Various travel services and their costs
- **Reference**: Quick lookup for travel-related rules

#### NPC List
- **Random NPCs**: Pre-generated NPCs with names, races, descriptions, and quirks
- **Editable**: Modify existing NPCs or add new ones
- **Quick Reference**: Perfect for improvised NPCs during sessions

#### Jumping Rules
- **Jump Calculator**: Calculate jump distances based on Strength score
- **Height Input**: Enter character height in feet and inches
- **Multiplier**: Apply multipliers for magical effects
- **Results**: Shows both running and standing jump distances
- **Reach Calculation**: Calculates maximum reach for grabbing objects

![Jump Calculator - Image placeholder]

#### Random Tables
- **Encounters**: Random encounter generator with customizable entries
- **Loot**: Random loot table for treasure distribution
- **Miscellaneous**: General random events and discoveries
- **Add Rows**: Create custom random table entries
- **Get Random**: Button to randomly select from table entries

![Random Tables - Image placeholder]

---

## Checklists

A simple task management system for tracking session preparation and in-game tasks.

### Features
- **Add Tasks**: Type task descriptions and click "Add" to create new checklist items
- **Check Off**: Click checkboxes to mark tasks as complete
- **Remove Tasks**: Delete completed or unnecessary tasks
- **Session Planning**: Perfect for tracking session preparation
- **In-Game Tasks**: Track ongoing quests, investigations, or plot threads

![Checklist Interface - Image placeholder]

---

## Spell List

A comprehensive spell lookup.

### Features
- **Spell Search**: Type to search through all available spells
- **Spell Details**: View complete spell information including:
  - Description and effects
  - Casting time and duration
  - Components and materials
  - Spell level and school
  - Classes that can cast the spell

![Spell List Interface - Image placeholder]

### Spell Creation
The spell creation form includes:
- **Basic Info**: Name, description, higher-level effects
- **Mechanics**: Range, components, casting time, duration
- **Classification**: Level, school, classes that can cast
- **Combat Stats**: To-hit bonuses, damage dice, save DCs
- **Customization**: Damage types, ability modifiers, special effects

---

## Notes

A flexible note-taking system for campaign management.

### Features
- **Group Organization**: Organize notes into logical groups
- **Add Groups**: Create new note categories
- **Rich Text**: Format notes with basic HTML
- **Session Notes**: Track what happened in each session
- **Campaign Planning**: Organize plot threads and NPCs
- **World Building**: Store lore and setting information
- **Limited Storage**: The storage is limited and should only be used for shorter notes during session. 

![Notes Interface - Image placeholder]

---

## Google Docs Integration

Embed Google Docs directly into the DM Screen for seamless document access.

### Features
- **Document Embedding**: Enter Google Doc URLs to embed documents
- **Campaign Documents**: Access campaign notes, maps, or reference materials
- **ReadOnly**: The information displayed is in a readonly format. 

![Google Docs Integration - Image placeholder]

### Usage
1. Copy the Google Doc URL
2. Paste it into the "Enter Google Doc URL" field
3. Click "Load Google Doc"
4. The document will appear in an embedded iframe
5. This document can only be viewed and not edited. 


---

## Settings & Customization

Access advanced settings and customization options through the settings dropdown.

### Language Support
- **Multi-language**: Switch between English and Spanish
- **Localized Content**: All interface elements and content adapt to selected language
- **Consistent Experience**: Maintains language preference across sessions

### Theme Options
- **Default Theme**: Standard blue color scheme
- **Purple Theme**: Purple variant
- **Red Theme**: Red variant
- **Custom Theme**: Create your own color scheme
  - HexCode: Use any set of hexcodes you like.
  - Primary Color: Main interface color
  - Secondary Color: Accent color
  - Live Preview: See changes in real-time

![Theme Customization - Image placeholder]

### D&D Version Support
- **2014 Rules**: Standard D&D 5e rules
- **2024 Rules**: Updated D&D 5e rules (marked with 🜁) *Currently only spells*
- **Both Versions**: Display both rule sets for comparison

### Experimental Features
- **Exhaustion Homebrew**: Custom exhaustion rules *This will subtract the levels of exahution present from any d20 rolls*
- **Homebrew Creator**: Access to custom content creation tools

### Homebrew Creator
The Homebrew Creator allows DMs to create custom content:

#### Monster Creation
- **Custom Monsters**: Create unique creatures with full stat blocks
- **Monster Editor**: Edit existing custom monsters
- **Monster Deletion**: Remove custom monsters from the database

#### Spell Creation
- **Custom Spells**: Design unique spells with custom mechanics
- **Spell Import/Export**: Share spells between campaigns
- **Spell Management**: Edit or delete custom spells

#### Item Creation
- **Custom Equipment**: Create weapons, armor, and magical items
- **Item Categories**: Organize items by type (weapon, armor, wondrous item, etc.)
- **Item Import/Export**: Share custom items

#### Shop Creation
- **Custom Shops**: Design unique shops with custom inventory
- **Shop Management**: Edit or delete custom shops

![Homebrew Creator Interface - Image placeholder]

### Storage Management
- **Local Storage**: Personal custom content (5MB limit)
- **Global Storage**: Shared custom content (5MB limit)
- **Usage Tracking**: Monitor storage usage with progress bars
- **Content Management**: Delete unused content to free space

---

## Tips for Effective Use

### Session Preparation
1. **Load Encounters**: Pre-load planned encounters before the session
2. **Prepare NPCs**: Add important NPCs to the NPC list
3. **Create Checklists**: Set up session preparation checklists
4. **Organize Notes**: Structure campaign notes in logical groups

### During Sessions
1. **Quick Reference**: Use DM Tables for quick rule lookups
2. **Initiative Management**: Keep combat flowing with the initiative tracker
3. **Note Taking**: Capture important events in the Notes section
4. **Random Generation**: Use random tables for unexpected situations

### Campaign Management
1. **Save Encounters**: Build a library of reusable encounters
2. **Custom Content**: Create homebrew content for your campaign
3. **Document Integration**: Use Google Docs for complex campaign documents
4. **Theme Customization**: Set up the interface to match your preferences

---

## Troubleshooting

### Common Issues
- **Storage**: Monitor storage usage to avoid hitting limits
- **Custom Content**: Test custom content before using in important sessions
- **Updates**: Keep the symbiote updated for latest features and fixes. Mismatched versions of the symbiote can cause issues.

### Getting Help
- **Documentation**: Refer to this guide for detailed instructions
- **Community**: Check TaleSpire community discord for additional help or reach out to me directly. 