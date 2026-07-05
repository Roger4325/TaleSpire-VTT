// ============================================================================
// SavingCharacter.js
// Builds the character save in the exact format the live character sheet
// (PlayerScript.js) expects, supports multiclassing, and writes the save
// directly into TaleSpire campaign storage ("characters").
//
// Non-destructive: when saving over an existing character, everything the
// player manages on the live sheet (inventory, notes, actions, current HP,
// coins, conditions, user-added spells, custom trait groups...) is preserved.
// Only creator-derived fields (classes, level, max HP, proficiencies, traits,
// spell slots) are updated.
// ============================================================================

// Trait group titles owned by the creator. On re-save these groups are
// replaced; any other group in an existing save is left untouched.
const CREATOR_MANAGED_GROUP_SUFFIX = ' Class Traits';
const CREATOR_MANAGED_GROUP_TITLES = ['Racial Traits', 'Background Features', 'Feats'];

// Standard 5e multiclass spell slot table (combined caster level 1-20)
const MULTICLASS_SPELL_SLOTS = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 2, 2, 1, 1, 1],
    [4, 3, 3, 3, 2, 2, 1, 1, 1]
];

const FULL_CASTER_CLASSES = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
const HALF_CASTER_CLASSES = ['paladin', 'ranger'];

const ABILITY_NAME_TO_CODE = {
    'Strength': 'STR', 'Dexterity': 'DEX', 'Constitution': 'CON',
    'Intelligence': 'INT', 'Wisdom': 'WIS', 'Charisma': 'CHA'
};

// Maps proficiency strings used in Classes.json/Races.json to the checkbox ids
// used by the live sheet so loaded saves actually tick the boxes.
const PROFICIENCY_NAME_FIXES = {
    'Shields': 'Shield',
    'Light armor': 'Light',
    'Medium armor': 'Medium',
    'Heavy armor': 'Heavy',
    'Simple weapons': 'Simple Weapons',
    'Martial weapons': 'Martial Weapons',
    'Light Hammer': 'LightHammer',
    'Crossbow, Light': 'CrossbowLight',
    'Crossbow, Hand': 'CrossbowHand',
    'Crossbow, Heavy': 'CrossbowHeavy',
    'War Pick': 'WarPick',
    'Deep Speech': 'DeepSpeech',
    "Thieves' Cant": 'ThievesCant',
    'Sign Language': 'SignLanguage'
};

function normalizeProficiencyName(name) {
    if (typeof name !== 'string') return name;
    const trimmed = name.trim();
    return PROFICIENCY_NAME_FIXES[trimmed] || trimmed;
}

// ---------------------------------------------------------------------------
// Class helpers
// ---------------------------------------------------------------------------

/**
 * Returns the normalized list of classes for the character, always as an
 * array of { className, subclass, level, choices } with at least one entry
 * when a class has been picked.
 */
function getClassEntriesForSave() {
    if (currentCharacter.classes && currentCharacter.classes.length > 0) {
        return currentCharacter.classes;
    }
    if (currentCharacter.class) {
        return [{
            className: currentCharacter.class,
            subclass: currentCharacter.subclass || "",
            level: currentCharacter.level || 1,
            choices: currentCharacter.choices || {}
        }];
    }
    return [];
}

function getTotalCharacterLevel() {
    const entries = getClassEntriesForSave();
    if (entries.length === 0) return 1;
    return entries.reduce((sum, cls) => sum + (cls.level || 0), 0) || 1;
}

function getClassDisplayName(classKey) {
    const info = classesData?.classes?.[classKey];
    return info?.name || (classKey ? classKey.charAt(0).toUpperCase() + classKey.slice(1) : '');
}

function getSubclassDisplayName(classKey, subclassKey) {
    if (!subclassKey) return '';
    const info = classesData?.classes?.[classKey];
    return info?.subclasses?.[subclassKey]?.name || subclassKey;
}

/**
 * Builds the class string the sheet displays, e.g.
 * "Fighter (Champion) 3 / Wizard 2" for multiclass or
 * "Fighter (Champion)" for a single class.
 */
function buildPlayerClassString() {
    const entries = getClassEntriesForSave();
    if (entries.length === 0) return '';

    const isMulti = entries.length > 1;
    return entries.map(cls => {
        const className = getClassDisplayName(cls.className);
        const subclassName = getSubclassDisplayName(cls.className, cls.subclass);
        const base = subclassName ? `${className} (${subclassName})` : className;
        return isMulti ? `${base} ${cls.level}` : base;
    }).join(' / ');
}

/**
 * Hit dice per class, e.g. [{die: "d10", count: 3}, {die: "d6", count: 2}].
 * The sheet UI only displays a single die type, so the primary class die goes
 * into hitDiceButton, but the full breakdown is kept in characterCreatorData.
 */
function buildHitDicePools() {
    return getClassEntriesForSave().map(cls => {
        const info = classesData?.classes?.[cls.className];
        return { die: `d${info?.hitDie || 8}`, count: cls.level || 1 };
    });
}

function getPrimaryHitDie() {
    const pools = buildHitDicePools();
    return pools.length > 0 ? pools[0].die : 'd8';
}

// ---------------------------------------------------------------------------
// Spellcasting
// ---------------------------------------------------------------------------

/**
 * Finds the spellcasting definition for a class entry, looking at the class
 * itself first and then the selected subclass (Eldritch Knight / Arcane
 * Trickster). Returns null for non-casters.
 */
function getSpellcastingForClassEntry(clsEntry) {
    const info = classesData?.classes?.[clsEntry.className];
    if (!info) return null;

    if (info.spellcasting) {
        return { casting: info.spellcasting, fromSubclass: false };
    }

    const subclass = clsEntry.subclass && info.subclasses?.[clsEntry.subclass];
    if (subclass?.spellcasting) {
        return { casting: subclass.spellcasting, fromSubclass: true };
    }

    return null;
}

/**
 * Multiclass caster-level weight per 5e rules:
 * full casters count every level, half casters half, subclass casters a third.
 */
function getCasterLevelContribution(clsEntry, fromSubclass) {
    const level = clsEntry.level || 0;
    if (fromSubclass) return Math.floor(level / 3);
    if (FULL_CASTER_CLASSES.includes(clsEntry.className)) return level;
    if (HALF_CASTER_CLASSES.includes(clsEntry.className)) return Math.floor(level / 2);
    return 0;
}

/**
 * Computes total spell slots per spell level (array of 9 counts).
 * Warlock pact slots are added on top since the sheet has a single slot pool.
 */
function computeSpellSlotTotals() {
    const entries = getClassEntriesForSave();
    const casters = [];
    let warlockEntry = null;

    entries.forEach(clsEntry => {
        if (clsEntry.className === 'warlock') {
            warlockEntry = clsEntry;
            return;
        }
        const castingInfo = getSpellcastingForClassEntry(clsEntry);
        if (castingInfo && castingInfo.casting.spellSlots) {
            casters.push({ clsEntry, ...castingInfo });
        }
    });

    const slots = Array(9).fill(0);

    if (casters.length === 1) {
        // Single casting class: use its own slot table directly.
        const { clsEntry, casting } = casters[0];
        const table = casting.spellSlots[String(clsEntry.level)];
        if (table) {
            Object.entries(table).forEach(([spellLevel, count]) => {
                const idx = parseInt(spellLevel) - 1;
                if (idx >= 0 && idx < 9) slots[idx] = count;
            });
        }
    } else if (casters.length > 1) {
        // Multiclass casters: combined caster level on the shared table.
        let casterLevel = 0;
        casters.forEach(c => {
            casterLevel += getCasterLevelContribution(c.clsEntry, c.fromSubclass);
        });
        if (casterLevel > 0) {
            const row = MULTICLASS_SPELL_SLOTS[Math.min(casterLevel, 20) - 1];
            row.forEach((count, idx) => { slots[idx] = count; });
        }
    }

    // Warlock pact magic stacks on top of any other slots.
    if (warlockEntry) {
        const warlockCasting = classesData?.classes?.warlock?.spellcasting;
        const table = warlockCasting?.spellSlots?.[String(warlockEntry.level)];
        if (table) {
            Object.entries(table).forEach(([spellLevel, count]) => {
                const idx = parseInt(spellLevel) - 1;
                if (idx >= 0 && idx < 9) slots[idx] += count;
            });
        }
    }

    return slots;
}

/**
 * Spellcasting ability code ("INT"/"WIS"/"CHA") of the first casting class.
 */
function getSpellcastingModifierCode() {
    const entries = getClassEntriesForSave();
    for (const clsEntry of entries) {
        const castingInfo = getSpellcastingForClassEntry(clsEntry);
        if (castingInfo?.casting?.ability) {
            return ABILITY_NAME_TO_CODE[castingInfo.casting.ability] || 'CHA';
        }
    }
    return 'CHA';
}

function getOrdinalSuffixForLevel(level) {
    if (level % 100 >= 11 && level % 100 <= 13) return 'th';
    switch (level % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

/**
 * Builds the spellData block the sheet expects: spell slot pools per level
 * (all unused), the casting modifier, and the spells chosen on the Spells tab
 * (plus auto-granted domain/oath spells). The merge logic keeps spells the
 * player adds on the sheet on re-save.
 */
function buildSpellDataForSave() {
    const slotTotals = computeSpellSlotTotals();
    const creatorSpells = typeof collectCreatorSpellsByLevel === 'function'
        ? collectCreatorSpellsByLevel()
        : {};

    const spellData = {
        spellcastingModifier: getSpellcastingModifierCode(),
        spelllevelselected: "9",
        Cantrip: { spells: creatorSpells['Cantrip'] || [], slots: [] }
    };

    for (let level = 1; level <= 9; level++) {
        const key = `${level}${getOrdinalSuffixForLevel(level)}-level`;
        spellData[key] = {
            spells: creatorSpells[key] || [],
            slots: Array(Math.max(0, slotTotals[level - 1])).fill(false)
        };
    }

    return spellData;
}

// ---------------------------------------------------------------------------
// Proficiencies
// ---------------------------------------------------------------------------

/**
 * Equipment proficiencies using 5e multiclass rules: the first class grants
 * its full list, additional classes only grant their multiclassGains.
 * Racial and background proficiencies are merged in.
 */
function buildEquipmentProficienciesForSave() {
    const weapons = new Set();
    const armor = new Set();
    const tools = new Set();

    getClassEntriesForSave().forEach((clsEntry, index) => {
        const info = classesData?.classes?.[clsEntry.className];
        if (!info) return;

        const source = index === 0
            ? info.equipmentProficiencies
            : info.multiclassGains?.equipmentProficiencies;
        if (!source) return;

        (source.weapons || []).forEach(w => weapons.add(normalizeProficiencyName(w)));
        (source.armor || []).forEach(a => armor.add(normalizeProficiencyName(a)));
        (source.tools || []).forEach(t => tools.add(normalizeProficiencyName(t)));
    });

    // Racial proficiencies tracked on the character
    (currentCharacter.weaponProficiencies || []).forEach(w => weapons.add(normalizeProficiencyName(w)));
    (currentCharacter.armorProficiencies || []).forEach(a => armor.add(normalizeProficiencyName(a)));
    (currentCharacter.tools?.proficiencies || []).forEach(t => tools.add(normalizeProficiencyName(t)));
    (currentCharacter.toolProficiencies || []).forEach(t => tools.add(normalizeProficiencyName(t)));

    return {
        weapons: [...weapons],
        armor: [...armor],
        tools: [...tools]
    };
}

function buildLanguageProficienciesForSave() {
    const languages = new Set();
    (currentCharacter.languages?.proficiencies || []).forEach(l => languages.add(normalizeProficiencyName(l)));
    return [...languages];
}

/**
 * Calculates proficiency mappings for pb-1 through pb-24.
 * pb-1..pb-18: skills alphabetically; pb-19..pb-24: saves (STR..CHA).
 * Values: 0, 0.5 (half), 1 (proficient), 2 (expertise).
 */
function calculateProficiencyMappings() {
    const mappings = {};

    const skillsInOrder = [
        'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
        'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
        'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
        'Sleight of Hand', 'Stealth', 'Survival'
    ];

    skillsInOrder.forEach((skill, index) => {
        mappings[`pb-${index + 1}`] = getSkillProficiencyValue(skill);
    });

    const savesInOrder = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    savesInOrder.forEach((save, index) => {
        mappings[`pb-${19 + index}`] = getSavingThrowProficiencyValue(save);
    });

    return mappings;
}

function checkForRemarkableAthlete() {
    return getClassEntriesForSave().some(cls =>
        cls.className === 'fighter' && cls.subclass === 'Champion' && cls.level >= 7
    );
}

function getSkillProficiencyValue(skillName) {
    if (!currentCharacter.skills || !currentCharacter.skills.proficiencies) {
        return 0;
    }

    const isProficient = currentCharacter.skills.proficiencies.includes(skillName);
    const hasExpertise = currentCharacter.skills.expertise && currentCharacter.skills.expertise.includes(skillName);
    const hasHalfProficiency = currentCharacter.skills.halfProficiency && currentCharacter.skills.halfProficiency.includes(skillName);

    const remarkableAthleteSkills = ['Athletics', 'Acrobatics', 'Sleight of Hand', 'Stealth'];
    const hasRemarkableAthleteBonus = checkForRemarkableAthlete() && remarkableAthleteSkills.includes(skillName) && !isProficient;

    if (hasExpertise) return 2;
    if (isProficient) return 1;
    if (hasHalfProficiency || hasRemarkableAthleteBonus) return 0.5;
    return 0;
}

function getSavingThrowProficiencyValue(saveName) {
    if (!currentCharacter.savingThrows) return 0;
    return currentCharacter.savingThrows[saveName] ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Ability scores and derived stats
// ---------------------------------------------------------------------------

// getTotalAbilityScore / getModifier / formatModifier come from AbilityScore.js
function getAbilityModifierFor(ability) {
    return Math.floor((getTotalAbilityScore(ability) - 10) / 2);
}

function getRaceDataForSave() {
    if (typeof saveRacesData === 'undefined' || Object.keys(saveRacesData).length === 0) {
        return null;
    }
    return saveRacesData[Object.keys(saveRacesData)[0]];
}

function getSpeedForSave() {
    const raceData = getRaceDataForSave();
    let speed = raceData?.basicInfo?.effectiveSpeed
        ?? raceData?.effectiveSpeed
        ?? raceData?.basicInfo?.baseSpeed
        ?? 30;

    if (typeof speed === 'number') return `${speed}ft.`;
    return String(speed).includes('ft') ? String(speed) : `${speed}ft.`;
}

// ---------------------------------------------------------------------------
// Trait groups
// ---------------------------------------------------------------------------

/**
 * Collects all trait groups: one per class, racial traits and background
 * features. Group titles for classes follow "<Class> Class Traits" so the
 * merge logic can identify and replace them on re-save.
 */
function collectGroupTraitsData() {
    const groupedTraits = [];

    // One group per class from saveClassesData (built by updateClassesDataForSave)
    if (typeof saveClassesData !== 'undefined') {
        Object.values(saveClassesData).forEach(classData => {
            if (classData && classData.traits && classData.traits.length > 0) {
                const className = classData.basicInfo?.className || 'Class';
                groupedTraits.push({
                    "group-title": `${className}${CREATOR_MANAGED_GROUP_SUFFIX}`,
                    "group-chevron": false,
                    "traits": classData.traits
                });
            }
        });
    }

    // Racial traits from saveRacesData
    const raceData = getRaceDataForSave();
    if (raceData && raceData.traits && raceData.traits.length > 0) {
        groupedTraits.push({
            "group-title": "Racial Traits",
            "group-chevron": false,
            "traits": raceData.traits
        });
    }

    // Background features
    const backgroundGroup = buildBackgroundTraitGroup();
    if (backgroundGroup) {
        groupedTraits.push(backgroundGroup);
    }

    return groupedTraits;
}

function buildBackgroundTraitGroup() {
    const backgroundKey = typeof selectedBackground !== 'undefined' ? selectedBackground : null;
    if (!backgroundKey || typeof backgroundsData === 'undefined' || !backgroundsData[backgroundKey]) {
        return null;
    }

    const bg = backgroundsData[backgroundKey];
    const traits = (bg.features || []).map(feature => ({
        "traitName": `${feature.name} (${bg.name})`,
        "cheveron": false,
        "traitDescription": feature.description || "",
        "checkboxStates": [],
        "numberOfUses": "0",
        "adjustmentCategory": "None",
        "adjustmentSubCategory": "",
        "adjustmentAbility": "NONE",
        "adjustmentValue": "0",
        "resetType": "none"
    }));

    if (traits.length === 0) return null;

    return {
        "group-title": "Background Features",
        "group-chevron": false,
        "traits": traits
    };
}

// ---------------------------------------------------------------------------
// Structured build record (characterCreatorData)
// ---------------------------------------------------------------------------

/**
 * The structured record of HOW the character was built. The live sheet
 * preserves this blob untouched, which is what lets the creator re-open a
 * character later to add levels or edit earlier ones.
 */
function buildCharacterCreatorData() {
    return {
        version: 1,
        savedAt: new Date().toISOString(),
        name: currentCharacter.name || "",
        race: currentCharacter.race || "",
        subrace: currentCharacter.subrace || "",
        background: typeof selectedBackground !== 'undefined' ? (selectedBackground || "") : "",
        alignment: document.getElementById('characterAlignment')?.value || "",

        abilityScoreMethod: currentCharacter.abilityScoreMethod || "manual",
        baseAbilities: { ...currentCharacter.abilities },
        abilityBonuses: { ...currentCharacter.abilityBonuses },
        abilityBonusSources: JSON.parse(JSON.stringify(currentCharacter.abilityBonusSources || {})),
        rolledAbilityScores: currentCharacter.rolledAbilityScores || [],
        individualRolls: currentCharacter.individualRolls || [],
        pointBuyPoints: currentCharacter.pointBuyPoints ?? 27,

        hitPointsCalculationMethod: currentCharacter.hitPointsCalculationMethod || "average",
        rerollOnesHitDice: !!currentCharacter.rerollOnesHitDice,
        rolledHitPoints: { ...(currentCharacter.rolledHitPoints || {}) },
        hitPointsRollCount: currentCharacter.hitPointsRollCount || 0,
        hitDicePools: buildHitDicePools(),

        classes: getClassEntriesForSave().map(cls => ({
            className: cls.className,
            subclass: cls.subclass || "",
            level: cls.level || 1,
            choices: JSON.parse(JSON.stringify(cls.choices || {}))
        })),

        // Character-wide choice store (race/background choices live here)
        choices: JSON.parse(JSON.stringify(currentCharacter.choices || {})),
        // Species trait choices (Half-Elf ability picks, draconic ancestry...)
        traitChoices: JSON.parse(JSON.stringify(currentCharacter.traitChoices || {})),
        selectedFeats: JSON.parse(JSON.stringify(currentCharacter.selectedFeats || {})),
        // Which ability a choose-one half feat increases (e.g. Observant -> wisdom)
        featAbilityChoices: JSON.parse(JSON.stringify(currentCharacter.featAbilityChoices || {})),

        skills: {
            proficiencies: [...(currentCharacter.skills?.proficiencies || [])],
            sources: { ...(currentCharacter.skills?.sources || {}) },
            expertise: [...(currentCharacter.skills?.expertise || [])]
        },
        languages: {
            proficiencies: [...(currentCharacter.languages?.proficiencies || [])],
            sources: { ...(currentCharacter.languages?.sources || {}) }
        },
        savingThrows: { ...(currentCharacter.savingThrows || {}) },

        startingEquipment: getStartingEquipmentRecordForSave(),

        // Spell picks per class, and the flat list of everything the creator
        // put into spellData (so the merge can tell creator spells from spells
        // the player added on the sheet).
        spellSelections: JSON.parse(JSON.stringify(currentCharacter.spellSelections || {})),
        creatorSpellsByLevel: typeof collectCreatorSpellsByLevel === 'function'
            ? collectCreatorSpellsByLevel()
            : {}
    };
}

/**
 * The starting-equipment record carried in characterCreatorData. Once granted
 * (or when editing an existing character) the original record is passed
 * through untouched — equipment is a first-save-only event.
 */
function getStartingEquipmentRecordForSave() {
    if (typeof isStartingEquipmentLocked === 'function' && isStartingEquipmentLocked()) {
        return currentCharacter.startingEquipmentRecord || null;
    }
    if (typeof resolveStartingEquipment !== 'function') return null;
    return buildStartingEquipmentRecord(resolveStartingEquipment(), false);
}

// ---------------------------------------------------------------------------
// Save data generation
// ---------------------------------------------------------------------------

/**
 * Generates the full character save (the value stored under the character's
 * name in campaign storage "characters").
 */
function generateCharacterContent() {
    // Make sure derived class/race data is current before collecting traits
    if (typeof updateClassesDataForSave === 'function') updateClassesDataForSave();

    const totalLevel = getTotalCharacterLevel();
    const proficiencyMappings = calculateProficiencyMappings();
    const equipment = buildEquipmentProficienciesForSave();
    const dexMod = getAbilityModifierFor('dexterity');
    const maxHp = currentCharacter.trueHitPoints || currentCharacter.hitPoints || 1;

    const raceName = currentCharacter.race
        ? `${capitalizeFirst(currentCharacter.race)}${currentCharacter.subrace ? ` (${capitalizeFirst(currentCharacter.subrace)})` : ''}`
        : '';

    return {
        characterTempHp: "0",
        currentHitDice: totalLevel.toString(),
        insp: 0,
        upcastToggle: 1,
        exhaustionToggle: 0,
        playerWeaponProficiency: equipment.weapons,
        playerArmorProficiency: equipment.armor,
        playerLanguageProficiency: buildLanguageProficienciesForSave(),
        playerToolsProficiency: equipment.tools,
        initiativeButton: formatModifier(dexMod),
        AC: String(10 + dexMod),
        speed: getSpeedForSave(),
        characterLevel: totalLevel.toString(),
        playerXP: "0",
        playerClass: buildPlayerClassString(),
        playerSpecies: raceName,
        currentCharacterHP: maxHp.toString(),
        maxCharacterHP: maxHp.toString(),

        strengthScore: getTotalAbilityScore('strength').toString(),
        dexterityScore: getTotalAbilityScore('dexterity').toString(),
        constitutionScore: getTotalAbilityScore('constitution').toString(),
        intelligenceScore: getTotalAbilityScore('intelligence').toString(),
        wisdomScore: getTotalAbilityScore('wisdom').toString(),
        charismaScore: getTotalAbilityScore('charisma').toString(),

        // Skill ability mappings (static)
        acrobaticsMod: "DEX",
        animalHandlingMod: "WIS",
        arcanaMod: "INT",
        athleticsMod: "STR",
        deceptionMod: "CHA",
        historyMod: "INT",
        insightMod: "WIS",
        intimidationMod: "CHA",
        investigationMod: "INT",
        medicineMod: "WIS",
        natureMod: "INT",
        perceptionMod: "WIS",
        performanceMod: "CHA",
        persuasionMod: "CHA",
        religionMod: "INT",
        sleightofHandMod: "DEX",
        stealthMod: "DEX",
        survivalMod: "WIS",

        hitDiceButton: getPrimaryHitDie(),

        ...proficiencyMappings,

        conditions: [],
        coins: currentCharacter.coins || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        alignment: document.getElementById('characterAlignment')?.value || "",
        actionTable: [],
        spellData: buildSpellDataForSave(),
        inventoryData: {
            equipment: [],
            backpack: [],
            "other-possessions": [],
            attunement: []
        },
        groupTraitData: collectGroupTraitsData(),
        groupNotesData: [],
        extrasData: [],

        characterCreatorData: buildCharacterCreatorData()
    };
}

function capitalizeFirst(text) {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Legacy entry point kept for the clipboard button: full save wrapped in
// { "<name>": {...} } like the campaign storage format.
function generateSaveData() {
    const name = currentCharacter.name || "Unnamed Character";
    return { [name]: generateCharacterContent() };
}

// ---------------------------------------------------------------------------
// Non-destructive merge with an existing save
// ---------------------------------------------------------------------------

/**
 * Merges a freshly generated save into an existing character save without
 * destroying anything the player manages on the live sheet.
 */
function mergeWithExistingSave(existing, fresh) {
    const merged = { ...existing };

    // --- Creator-owned scalar fields: always update ---
    [
        'characterLevel', 'currentHitDice', 'playerClass',
        'hitDiceButton', 'maxCharacterHP',
        'strengthScore', 'dexterityScore', 'constitutionScore',
        'intelligenceScore', 'wisdomScore', 'charismaScore',
        'characterCreatorData'
    ].forEach(key => { merged[key] = fresh[key]; });

    // Species: only overwrite when the creator actually knows the race
    // (legacy imports leave race unset to avoid wrong racial re-derivation)
    if (fresh.playerSpecies) {
        merged.playerSpecies = fresh.playerSpecies;
    }

    // --- Current HP: keep damage taken, grow with the new max ---
    const oldMax = parseInt(existing.maxCharacterHP) || 0;
    const newMax = parseInt(fresh.maxCharacterHP) || 0;
    const oldCurrent = parseInt(existing.currentCharacterHP);
    if (!isNaN(oldCurrent) && oldMax > 0) {
        const adjusted = oldCurrent >= oldMax
            ? newMax
            : Math.max(0, Math.min(newMax, oldCurrent + Math.max(0, newMax - oldMax)));
        merged.currentCharacterHP = adjusted.toString();
    } else {
        merged.currentCharacterHP = fresh.currentCharacterHP;
    }

    // --- Proficiency arrays: union so manual additions survive ---
    ['playerWeaponProficiency', 'playerArmorProficiency', 'playerLanguageProficiency', 'playerToolsProficiency']
        .forEach(key => {
            const existingArr = Array.isArray(existing[key]) ? existing[key] : [];
            const freshArr = Array.isArray(fresh[key]) ? fresh[key] : [];
            merged[key] = [...new Set([...existingArr, ...freshArr])];
        });

    // --- pb values: never downgrade a manually set proficiency/expertise ---
    for (let i = 1; i <= 24; i++) {
        const key = `pb-${i}`;
        const existingVal = parseFloat(existing[key]) || 0;
        const freshVal = parseFloat(fresh[key]) || 0;
        merged[key] = Math.max(existingVal, freshVal);
    }

    // --- Spell data: keep the player's spells and used slots, update totals ---
    merged.spellData = mergeSpellData(
        existing.spellData,
        fresh.spellData,
        existing.characterCreatorData?.creatorSpellsByLevel || {},
        fresh.characterCreatorData?.creatorSpellsByLevel || {}
    );

    // --- Trait groups: replace creator-managed groups, keep custom ones ---
    merged.groupTraitData = mergeGroupTraitData(existing.groupTraitData, fresh.groupTraitData);

    // Everything else (AC, speed, coins, inventory, actions, notes, extras,
    // conditions, alignment, XP, temp HP, inspiration, toggles...) stays as it
    // was in the existing save because `merged` started as a copy of it.
    return merged;
}

function mergeSpellData(existingSpellData, freshSpellData, oldCreatorSpells = {}, newCreatorSpells = {}) {
    if (!existingSpellData || Object.keys(existingSpellData).length === 0) {
        return freshSpellData;
    }

    const merged = JSON.parse(JSON.stringify(existingSpellData));

    // Keep the player's chosen casting modifier if one was set
    if (!merged.spellcastingModifier && freshSpellData.spellcastingModifier) {
        merged.spellcastingModifier = freshSpellData.spellcastingModifier;
    }
    if (!merged.spelllevelselected) {
        merged.spelllevelselected = freshSpellData.spelllevelselected;
    }

    // Per level: creator picks come from the fresh save (so deselected ones
    // disappear); everything the PLAYER added on the sheet — any spell that
    // wasn't a creator pick last time — is kept, with its prepared state.
    const mergeSpellsForKey = (key) => {
        const oldCreatorNames = new Set((oldCreatorSpells[key] || []).map(s => s.name));
        const freshSpells = (newCreatorSpells[key] || freshSpellData[key]?.spells || []);
        const existingSpells = merged[key]?.spells || [];

        const result = [];
        const seen = new Set();

        freshSpells.forEach(spell => {
            if (seen.has(spell.name)) return;
            seen.add(spell.name);
            // A spell that already existed keeps its prepared toggle
            const prior = existingSpells.find(s => s.name === spell.name);
            result.push(prior ? prior : spell);
        });

        existingSpells.forEach(spell => {
            if (seen.has(spell.name)) return;
            if (oldCreatorNames.has(spell.name)) return; // creator pick that was deselected
            seen.add(spell.name);
            result.push(spell);
        });

        return result;
    };

    // Update slot pool sizes while preserving which slots were used
    for (let level = 1; level <= 9; level++) {
        const key = `${level}${getOrdinalSuffixForLevel(level)}-level`;
        const freshSlots = freshSpellData[key]?.slots || [];
        const existingLevel = merged[key] || { spells: [], slots: [] };
        const usedCount = (existingLevel.slots || []).filter(Boolean).length;

        const newSlots = Array(freshSlots.length).fill(false);
        for (let i = 0; i < Math.min(usedCount, newSlots.length); i++) {
            newSlots[i] = true;
        }

        merged[key] = {
            spells: mergeSpellsForKey(key),
            slots: newSlots
        };
    }

    merged.Cantrip = {
        spells: mergeSpellsForKey('Cantrip'),
        slots: []
    };

    return merged;
}

function isCreatorManagedGroup(groupTitle) {
    if (!groupTitle) return false;
    if (CREATOR_MANAGED_GROUP_TITLES.includes(groupTitle)) return true;
    if (groupTitle.endsWith(CREATOR_MANAGED_GROUP_SUFFIX)) return true;
    // Older creator versions used "<Class> Class Traits" via basicInfo too,
    // and the very first version used "Class Features".
    if (groupTitle === 'Class Features' || groupTitle === 'Class Traits') return true;
    return false;
}

function mergeGroupTraitData(existingGroups, freshGroups) {
    const existingArr = Array.isArray(existingGroups) ? existingGroups : [];
    const freshArr = Array.isArray(freshGroups) ? freshGroups : [];

    const freshTitles = new Set(freshArr.map(group => group['group-title']));
    const freshHasClassGroups = freshArr.some(group =>
        (group['group-title'] || '').endsWith(CREATOR_MANAGED_GROUP_SUFFIX));

    // Keep all custom (player-made) groups. Drop an old creator-managed group
    // only when the fresh save actually replaces it: class trait groups are
    // always re-derived together, the others must match by title. This keeps
    // e.g. "Racial Traits" on imported characters whose race the creator
    // doesn't know.
    const customGroups = existingArr.filter(group => {
        const title = group['group-title'] || '';
        if (!isCreatorManagedGroup(title)) return true;

        const isClassGroup = title.endsWith(CREATOR_MANAGED_GROUP_SUFFIX) ||
            title === 'Class Features' || title === 'Class Traits';
        if (isClassGroup) return !freshHasClassGroups;

        return !freshTitles.has(title);
    });

    // Preserve per-trait usage state (checkboxes) from the old creator groups
    const oldTraitStates = {};
    existingArr.forEach(group => {
        (group.traits || []).forEach(trait => {
            if (trait.traitName) {
                oldTraitStates[trait.traitName] = {
                    checkboxStates: trait.checkboxStates,
                    cheveron: trait.cheveron
                };
            }
        });
    });

    freshArr.forEach(group => {
        (group.traits || []).forEach(trait => {
            const oldState = oldTraitStates[trait.traitName];
            if (oldState) {
                if (Array.isArray(oldState.checkboxStates) && oldState.checkboxStates.length > 0) {
                    trait.checkboxStates = oldState.checkboxStates;
                }
                if (typeof oldState.cheveron === 'boolean') {
                    trait.cheveron = oldState.cheveron;
                }
            }
        });
    });

    return [...freshArr, ...customGroups];
}

// ---------------------------------------------------------------------------
// Campaign storage access (with a localStorage fallback for browser testing)
// ---------------------------------------------------------------------------

function isTaleSpireAvailable() {
    return typeof TS !== 'undefined' && TS.localStorage && TS.localStorage.campaign;
}

const BROWSER_FALLBACK_KEY = 'tsvtt-campaign-storage';

async function creatorGetCampaignBlob() {
    if (isTaleSpireAvailable()) {
        await waitForTaleSpireReady();
        return await TS.localStorage.campaign.getBlob();
    }
    return window.localStorage.getItem(BROWSER_FALLBACK_KEY) || "";
}

async function creatorSetCampaignBlob(blob) {
    if (isTaleSpireAvailable()) {
        await waitForTaleSpireReady();
        await TS.localStorage.campaign.setBlob(blob);
        return;
    }
    window.localStorage.setItem(BROWSER_FALLBACK_KEY, blob);
}

// ---------------------------------------------------------------------------
// Sheet navigation (the symbiote is one webview: window.open() replaces it)
// ---------------------------------------------------------------------------

const CREATOR_HANDOFF_BROWSER_KEY = 'tsvtt-creator-handoff';
const CREATOR_HANDOFF_MAX_AGE_MS = 5 * 60 * 1000;

// payload = {action: 'edit'|'load', name, time} — or null to clear.
async function creatorWriteHandoff(payload) {
    if (typeof TS === 'undefined' || !TS.localStorage) {
        try {
            if (payload) window.localStorage.setItem(CREATOR_HANDOFF_BROWSER_KEY, JSON.stringify(payload));
            else window.localStorage.removeItem(CREATOR_HANDOFF_BROWSER_KEY);
        } catch (error) { /* ignore */ }
        return;
    }
    try {
        await waitForTaleSpireReady();
        const blob = await TS.localStorage.global.getBlob();
        let allData = {};
        if (blob) {
            try { allData = JSON.parse(blob); } catch (error) { allData = {}; }
        }
        if (payload) allData.creatorHandoff = payload;
        else delete allData.creatorHandoff;
        await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));
    } catch (error) {
        console.error('Failed to write creator handoff:', error);
    }
}

async function creatorReadAndClearHandoff() {
    let payload = null;
    if (typeof TS === 'undefined' || !TS.localStorage) {
        try {
            const raw = window.localStorage.getItem(CREATOR_HANDOFF_BROWSER_KEY);
            if (raw) {
                payload = JSON.parse(raw);
                window.localStorage.removeItem(CREATOR_HANDOFF_BROWSER_KEY);
            }
        } catch (error) { /* ignore */ }
    } else {
        try {
            await waitForTaleSpireReady();
            const blob = await TS.localStorage.global.getBlob();
            if (blob) {
                const allData = JSON.parse(blob);
                if (allData.creatorHandoff) {
                    payload = allData.creatorHandoff;
                    delete allData.creatorHandoff;
                    await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));
                }
            }
        } catch (error) {
            console.error('Failed to read creator handoff:', error);
        }
    }
    if (payload && payload.time && (Date.now() - payload.time) > CREATOR_HANDOFF_MAX_AGE_MS) {
        return null; // stale request from an old session
    }
    return payload;
}

/**
 * Navigates back to the character sheet. When a character name is given, the
 * sheet is asked (via handoff + query string) to load that character directly.
 */
async function openCharacterSheet(characterName = null) {
    if (characterName) {
        await creatorWriteHandoff({ action: 'load', name: characterName, time: Date.now() });
    } else {
        await creatorWriteHandoff(null);
    }

    if (typeof TS !== 'undefined') {
        // Inside TaleSpire this replaces the current webview content. Query
        // strings break TaleSpire's local-file URL resolution ("not
        // available"), so the storage handoff alone carries the request.
        window.open('../PlayerCharacter.html');
    } else {
        const url = characterName
            ? `../PlayerCharacter.html?load=${encodeURIComponent(characterName)}`
            : '../PlayerCharacter.html';
        window.location.href = url;
    }
}

/**
 * Saves the character, then jumps straight to the sheet with it loaded.
 */
async function saveCharacterAndOpenSheet() {
    const saved = await saveCharacter();
    if (saved) {
        await openCharacterSheet(currentCharacter.name);
    }
}

/**
 * Loads the "characters" object from campaign storage.
 */
async function creatorLoadCampaignCharacters() {
    try {
        const data = await creatorGetCampaignBlob();
        if (!data) return {};
        const allData = JSON.parse(data);
        return allData.characters || {};
    } catch (error) {
        console.error('Failed to load campaign characters:', error);
        return {};
    }
}

/**
 * Writes one character into campaign storage, preserving everything else in
 * the campaign blob.
 */
async function creatorSaveCampaignCharacter(characterName, characterData) {
    const blob = await creatorGetCampaignBlob();
    let allData = {};
    if (blob) {
        try {
            allData = JSON.parse(blob);
        } catch (error) {
            console.error('Campaign blob is not valid JSON, refusing to overwrite it:', error);
            throw new Error('Campaign storage is unreadable; character not saved.');
        }
    }

    if (!allData.characters) allData.characters = {};
    allData.characters[characterName] = characterData;

    await creatorSetCampaignBlob(JSON.stringify(allData, null, 4));
}

// ---------------------------------------------------------------------------
// Save entry points
// ---------------------------------------------------------------------------

/**
 * For characters imported without creator data: new max HP = imported max HP
 * plus average hit die + CON mod for every level added per class (negative
 * deltas subtract the same way when levels are removed).
 */
function computeLegacyAdjustedMaxHp(baseline) {
    const conMod = getAbilityModifierFor('constitution');
    let adjusted = baseline.maxHP;

    getClassEntriesForSave().forEach(cls => {
        const info = classesData?.classes?.[cls.className];
        if (!info) return;

        const baselineLevel = baseline.classLevels[cls.className] || 0;
        const delta = (cls.level || 0) - baselineLevel;
        if (delta === 0) return;

        const averageRoll = Math.ceil((info.hitDie + 1) / 2);
        adjusted += delta * (averageRoll + conMod);
    });

    return Math.max(1, adjusted);
}

function copySaveToClipboard() {
    const data = generateSaveData();
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json)
        .then(() => showSuccess('Save copied to clipboard!'))
        .catch(err => showError('Failed to copy save data: ' + err));
}

/**
 * Main save: writes the character into campaign storage so it shows up in the
 * sheet's character picker immediately. If the character already exists the
 * save is merged non-destructively.
 */
async function saveCharacter() {
    if (!currentCharacter.name) {
        showError('Please enter a character name before saving.');
        return false;
    }

    const characterName = currentCharacter.name;

    try {
        // Make sure race-derived data (traits, speed) is up to date first
        if (typeof updateRacesDataForSave === 'function' && currentCharacter.race) {
            await updateRacesDataForSave();
        }

        // The equipment catalog is needed to resolve starting equipment names
        if (typeof loadCreatorEquipmentCatalog === 'function') {
            await loadCreatorEquipmentCatalog();
        }

        const freshContent = generateCharacterContent();
        const existingCharacters = await creatorLoadCampaignCharacters();
        const existing = existingCharacters[characterName];

        // Starting equipment is granted exactly once: on the very first save.
        // Existing characters keep their sheet-managed inventory untouched.
        if (!existing && typeof resolveStartingEquipment === 'function' &&
            !isStartingEquipmentLocked()) {
            const resolved = resolveStartingEquipment();
            if (!resolved.complete) {
                const proceed = await showConfirm(
                    'Some starting equipment choices are not selected yet (Equipment tab). ' +
                    'Save anyway without those items?'
                );
                if (!proceed) return false;
            }
            freshContent.inventoryData = buildStartingInventoryData(resolved);
            if (resolved.gold > 0) {
                freshContent.coins = { cp: 0, sp: 0, ep: 0, gp: resolved.gold, pp: 0 };
            }
            const grantedRecord = buildStartingEquipmentRecord(resolved, true);
            if (freshContent.characterCreatorData) {
                freshContent.characterCreatorData.startingEquipment = grantedRecord;
            }
            // Lock the tab for the rest of this session as well
            currentCharacter.startingEquipmentRecord = grantedRecord;
        }

        // Legacy imports: the creator can't recompute total HP (it doesn't
        // know how the original HP was rolled), so apply a delta for the
        // levels added/removed since the import instead.
        if (existing && !existing.characterCreatorData &&
            typeof legacyImportBaseline !== 'undefined' && legacyImportBaseline) {
            freshContent.maxCharacterHP = String(
                computeLegacyAdjustedMaxHp(legacyImportBaseline)
            );
        }

        let finalContent;
        if (existing) {
            const confirmed = await showConfirm(
                `"${characterName}" already exists. Update it with these class/level changes? ` +
                `Inventory, notes, actions, spells and other sheet edits will be kept.`
            );
            if (!confirmed) return false;
            finalContent = mergeWithExistingSave(existing, freshContent);
        } else {
            finalContent = freshContent;
        }

        await creatorSaveCampaignCharacter(characterName, finalContent);

        // Tell the sheet (if it opened us) so it can refresh immediately
        if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
                type: 'tsvtt-character-saved',
                characterName: characterName
            }, '*');
        }

        showSuccess(`${characterName} saved${existing ? ' (updated)' : ''}! You can now load them on the character sheet.`);
        return true;
    } catch (error) {
        console.error('Error saving character:', error);
        showError('Saving to campaign storage failed. Use "Copy Save" to copy the JSON instead.');
        return false;
    }
}
