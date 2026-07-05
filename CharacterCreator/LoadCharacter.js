// ============================================================================
// LoadCharacter.js
// Loads the static data files for the creator, and implements the
// edit/level-up flow: opening an existing character from campaign storage,
// restoring its build state (or importing a legacy save), so levels can be
// added or changed and saved back non-destructively.
// ============================================================================

// Load classes data from JSON file
async function loadClassesData() {
    try {
        const response = await fetch('Classes.json');
        if (!response.ok) {
            throw new Error('Failed to load classes data');
        }
        classesData = await response.json();
        await mergeCustomSubclassesIntoClassesData();
    } catch (error) {
        console.error('Error loading classes data:', error);
        throw error;
    }
}

/**
 * Merges homebrew subclasses (created in the sheet's Homebrew tab, stored
 * under "Custom Subclasses") into classesData so they show up and behave like
 * built-in subclasses. Filtered by the D&DVersion setting the same way the
 * spell catalog is: a subclass tagged 2024 is hidden under 2014 rules and
 * vice versa ("both" shows everything).
 */
async function mergeCustomSubclassesIntoClassesData() {
    try {
        const customSubclasses = await loadDataFromGlobalStorage("Custom Subclasses");
        if (!customSubclasses || Object.keys(customSubclasses).length === 0) return;

        const versionData = await loadDataFromGlobalStorage("D&DVersion");
        const versionSetting = versionData?.Version || '2014';

        Object.values(customSubclasses).forEach(sub => {
            if (!sub || !sub.name || !sub.parentClass) return;

            const year = sub.year || '2014';
            if (versionSetting !== 'both' && year !== versionSetting) return;

            const classInfo = classesData.classes?.[sub.parentClass];
            if (!classInfo) return;

            classInfo.subclasses = classInfo.subclasses || {};
            if (classInfo.subclasses[sub.name]) return; // never shadow built-ins

            const merged = {
                name: sub.name,
                description: sub.description || '',
                features: sub.features || {},
                homebrew: true
            };
            // Third-caster spellcasting block (EK/AT style), picked up by
            // getSpellcastingForClassEntry / computeSpellSlotTotals as-is
            if (sub.spellcasting) merged.spellcasting = sub.spellcasting;
            // Granted spell lists; Spells.js reads these for always-prepared
            // ("prepared") and list-expansion ("expanded") handling
            if (sub.subclassSpells) merged.subclassSpells = sub.subclassSpells;
            classInfo.subclasses[sub.name] = merged;

            // Offer it in the level-up subclass choice dropdown too
            Object.values(classInfo.levelProgression || {}).forEach(levelData => {
                Object.values(levelData.choices || {}).forEach(choiceDef => {
                    if (choiceDef?.type === 'subclass' && Array.isArray(choiceDef.options) &&
                        !choiceDef.options.includes(sub.name)) {
                        choiceDef.options.push(sub.name);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Failed to merge custom subclasses:', error);
    }
}

// Load feats data (placeholder)
async function loadFeatsData() {
    try {
        const response = await fetch('Feats.json');
        if (!response.ok) {
            featsData = {};
            return;
        }
        featsData = await response.json();
    } catch (error) {
        console.error('Error loading feats data:', error);
        featsData = {};
    }
}

// Load races data from JSON file
async function loadRacesData() {
    try {
        const response = await fetch('Races.json');
        if (!response.ok) {
            throw new Error('Failed to load races data');
        }
        racesData = await response.json();
    } catch (error) {
        console.error('Error loading races data:', error);
        throw error;
    }
}

// ---------------------------------------------------------------------------
// Edit / level-up flow state
// ---------------------------------------------------------------------------

// Name of the character being edited (null when building a brand-new one)
let editingExistingCharacter = null;

// Baseline captured when importing a save that has no characterCreatorData
// (hand-made or D&D Beyond imports). Used at save time to adjust max HP by
// the levels added instead of recomputing HP the creator can't know.
let legacyImportBaseline = null;

/**
 * Called once the creator's data files are loaded. If the page was opened
 * with ?edit=<name>, load that character from campaign storage.
 */
let editFlowInFlight = false;

async function initializeEditFlowIfRequested() {
    if (editFlowInFlight || editingExistingCharacter) return;
    editFlowInFlight = true;
    try {
        let editName = null;
        try {
            const params = new URLSearchParams(window.location.search);
            editName = params.get('edit');
        } catch (error) { /* ignore */ }

        // The sheet also leaves a handoff record in storage (the only channel
        // that works inside TaleSpire — query strings break its navigation).
        // Consume it so a stale request can't fire later.
        const handoff = await creatorReadAndClearHandoff();
        if (!editName && handoff && handoff.action === 'edit' && handoff.name) {
            editName = handoff.name;
        }

        if (!editName) return;

        await loadCharacterForEditing(editName);
    } finally {
        editFlowInFlight = false;
    }
}

/**
 * Called from CharacterCreator.html when the TS API fires "hasInitialized".
 * On a cold navigation from the sheet, page init can run before the TS API is
 * usable, so the first handoff check comes up empty — re-check once ready.
 */
async function onTaleSpireReady() {
    if (editingExistingCharacter) return;

    // Wait for initializeCharacterCreator to FINISH — not just for the class
    // data. Restoring while init is still rendering the default class/species/
    // abilities tabs gets overwritten by those renders, which left characters
    // half-loaded (basics only) when arriving from the sheet.
    for (let i = 0; i < 200 && !window.__creatorInitComplete; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Belt and braces: the data files the restore depends on.
    for (let i = 0; i < 100 && (typeof classesData === 'undefined' || !classesData.classes ||
                                typeof racesData === 'undefined' || Object.keys(racesData).length === 0); i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    await initializeEditFlowIfRequested();
}

/**
 * Loads a character from campaign storage into the creator.
 */
async function loadCharacterForEditing(characterName) {
    try {
        // Backgrounds load on their own; make sure they're ready before restoring
        if (typeof backgroundsData !== 'undefined' && Object.keys(backgroundsData).length === 0 &&
            typeof loadBackgroundsData === 'function') {
            await loadBackgroundsData();
        }

        const characters = await creatorLoadCampaignCharacters();
        const saved = characters[characterName];

        if (!saved) {
            showError(`Character "${characterName}" was not found in campaign storage.`);
            return;
        }

        if (saved.characterCreatorData) {
            restoreFromCreatorData(saved.characterCreatorData, characterName);
        } else {
            importLegacySave(characterName, saved);
        }

        editingExistingCharacter = characterName;
        showEditingBanner(characterName, !saved.characterCreatorData);
        showSuccess(`Loaded ${characterName}. Make your changes and hit Save Character.`);
    } catch (error) {
        console.error('Error loading character for editing:', error);
        showError('Failed to load the character. See console for details.');
    }
}

// ---------------------------------------------------------------------------
// Restore from a structured creator build record
// ---------------------------------------------------------------------------

function deepCopy(value) {
    return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

function setSelectValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null && value !== '') {
        el.value = value;
    }
}

/**
 * Rebuilds the full creator state from the characterCreatorData block that
 * the creator embedded in the save.
 */
function restoreFromCreatorData(ccd, characterName) {
    // --- Basics ---
    currentCharacter.name = ccd.name || characterName;
    const nameInput = document.getElementById('characterName');
    if (nameInput) nameInput.value = currentCharacter.name;
    setSelectValue('characterAlignment', ccd.alignment);

    // --- Ability scores (base only; bonuses are re-derived below) ---
    currentCharacter.abilityScoreMethod = ccd.abilityScoreMethod || 'manual';
    currentCharacter.abilities = { ...currentCharacter.abilities, ...(ccd.baseAbilities || {}) };
    currentCharacter.rolledAbilityScores = ccd.rolledAbilityScores || [];
    currentCharacter.individualRolls = ccd.individualRolls || [];
    currentCharacter.pointBuyPoints = ccd.pointBuyPoints ?? 27;
    setSelectValue('abilityScoreMethod', currentCharacter.abilityScoreMethod);

    resetAbilityBonuses();

    // --- Skills / languages / saves / feats / character-wide choices ---
    currentCharacter.skills.proficiencies = [...(ccd.skills?.proficiencies || [])];
    currentCharacter.skills.sources = { ...(ccd.skills?.sources || {}) };
    if (ccd.skills?.expertise) currentCharacter.skills.expertise = [...ccd.skills.expertise];
    currentCharacter.languages.proficiencies = [...(ccd.languages?.proficiencies || [])];
    currentCharacter.languages.sources = { ...(ccd.languages?.sources || {}) };
    currentCharacter.savingThrows = { ...(ccd.savingThrows || {}) };
    currentCharacter.selectedFeats = deepCopy(ccd.selectedFeats || {});
    currentCharacter.featAbilityChoices = deepCopy(ccd.featAbilityChoices || {});
    currentCharacter.choices = deepCopy(ccd.choices || {});

    // --- Hit points ---
    currentCharacter.hitPointsCalculationMethod = ccd.hitPointsCalculationMethod || 'average';
    currentCharacter.rerollOnesHitDice = !!ccd.rerollOnesHitDice;
    currentCharacter.rolledHitPoints = { ...(ccd.rolledHitPoints || {}) };
    currentCharacter.hitPointsRollCount = ccd.hitPointsRollCount || 0;
    setSelectValue('hitPointsMethod', currentCharacter.hitPointsCalculationMethod);
    const rerollCheckbox = document.getElementById('rerollOnesHitDice');
    if (rerollCheckbox) rerollCheckbox.checked = currentCharacter.rerollOnesHitDice;
    const rerollContainer = document.getElementById('rerollOnesContainer');
    if (rerollContainer) {
        rerollContainer.classList.toggle('hidden', currentCharacter.hitPointsCalculationMethod !== 'rolled');
    }

    // --- Classes ---
    currentCharacter.classes = (ccd.classes || []).map(cls => ({
        className: cls.className,
        subclass: cls.subclass || "",
        level: cls.level || 1,
        choices: deepCopy(cls.choices || {}),
        features: [],
        hitPoints: {},
        collapsed: false
    }));
    if (currentCharacter.classes.length > 0) {
        const primary = currentCharacter.classes[0];
        currentCharacter.class = primary.className;
        currentCharacter.subclass = primary.subclass;
        currentCharacter.level = primary.level;
    }
    currentCharacter.totalLevel = currentCharacter.classes.reduce((sum, cls) => sum + cls.level, 0) || 1;
    currentCharacter.isMulticlassing = currentCharacter.classes.length > 1;

    // --- Race (re-applies racial bonuses, traits, skills, languages) ---
    if (ccd.race && racesData[ccd.race]) {
        currentCharacter.race = ccd.race;
        currentCharacter.subrace = ccd.subrace || "";

        // Species trait choices (e.g. Half-Elf's two +1 ability picks) must be
        // in place before the species UI renders so they show preselected.
        currentCharacter.traitChoices = deepCopy(ccd.traitChoices || {});

        applyRacialFeatures(ccd.race, ccd.subrace || null);

        // applyRacialFeatures only applies fixed racial features; effects of
        // trait CHOICES normally fire from their change handlers, so re-apply
        // them here (ability +1s, damage resistances, ...).
        if (typeof applyTraitEffects === 'function') {
            Object.entries(currentCharacter.traitChoices).forEach(([traitName, choiceValue]) => {
                try {
                    applyTraitEffects(traitName, choiceValue, ccd.race);
                } catch (error) {
                    console.error(`Failed to re-apply trait choice "${traitName}":`, error);
                }
            });
        }

        displaySpeciesInfoSection(ccd.race);
        updateRacesDataForSave();
    }

    // --- Background ---
    if (ccd.background && typeof backgroundsData !== 'undefined' && backgroundsData[ccd.background]) {
        selectBackground(ccd.background);
    }

    // Racial bonus application reset ability bonuses; put ASI bonuses back.
    applyExistingASIBonuses();

    // --- Render the class UI (multiclass view, saved choices preselect) ---
    if (currentCharacter.classes.length > 0) {
        displayAllClasses();
    }

    // --- Ability tab UI ---
    updateAbilityScoreInterface();
    if (currentCharacter.abilityScoreMethod === 'manual' &&
        currentCharacter.rolledAbilityScores.length > 0 &&
        typeof displayRolledScores === 'function') {
        displayRolledScores(currentCharacter.rolledAbilityScores, currentCharacter.individualRolls || []);
    }
    updateAbilityTotalsUI();
    updateAbilityModifiers();

    // --- Starting equipment record (read-only after first save) ---
    currentCharacter.startingEquipmentRecord = ccd.startingEquipment
        ? deepCopy(ccd.startingEquipment)
        : null;
    currentCharacter.startingEquipmentChoices = {};

    // --- Spell picks (editable again on level-up) ---
    currentCharacter.spellSelections = deepCopy(ccd.spellSelections || {});

    // --- Recompute HP and refresh derived save data ---
    updateMulticlassHitPoints();

    // Show the rolled-HP inputs with the saved per-level rolls so earlier
    // rolls stay visible and editable.
    if (currentCharacter.hitPointsCalculationMethod === 'rolled' &&
        typeof renderRolledHitPointsInterface === 'function') {
        renderRolledHitPointsInterface();
    }

    updateClassesDataForSave();
    if (typeof displayCurrentCharacter === 'function') displayCurrentCharacter();
}

function resetAbilityBonuses() {
    Object.keys(currentCharacter.abilityBonuses).forEach(ability => {
        currentCharacter.abilityBonuses[ability] = 0;
        currentCharacter.abilityBonusSources[ability] = [];
    });
    Object.keys(currentCharacter.statBonuses.attributes).forEach(key => {
        currentCharacter.statBonuses.attributes[key] = [];
    });
}

// ---------------------------------------------------------------------------
// Legacy import (saves without characterCreatorData)
// ---------------------------------------------------------------------------

const SKILLS_ALPHABETICAL = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival'
];
const SAVES_ORDER = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];

/**
 * Finds the class key (e.g. "fighter") for a display name (e.g. "Fighter").
 */
function findClassKeyByName(displayName) {
    if (!displayName || !classesData?.classes) return null;
    const lower = displayName.trim().toLowerCase();
    return Object.keys(classesData.classes).find(key =>
        key.toLowerCase() === lower ||
        (classesData.classes[key].name || '').toLowerCase() === lower
    ) || null;
}

/**
 * Finds the subclass key for a class given the subclass display name.
 */
function findSubclassKeyByName(classKey, subclassDisplayName) {
    const subclasses = classesData?.classes?.[classKey]?.subclasses;
    if (!subclasses || !subclassDisplayName) return "";
    const lower = subclassDisplayName.trim().toLowerCase();
    return Object.keys(subclasses).find(key =>
        key.toLowerCase() === lower ||
        (subclasses[key].name || '').toLowerCase() === lower
    ) || "";
}

/**
 * Parses a sheet class string like "Fighter (Champion) 3 / Wizard 2",
 * "Fighter (Champion)" or "Cleric / Wizard" into class entries.
 */
function parsePlayerClassString(playerClass, totalLevel) {
    const entries = [];
    if (!playerClass) return entries;

    const parts = playerClass.split('/').map(p => p.trim()).filter(Boolean);
    let anyExplicitLevel = false;

    parts.forEach(part => {
        const match = part.match(/^(.+?)(?:\s*\(([^)]+)\))?\s*(\d+)?$/);
        if (!match) return;

        const classKey = findClassKeyByName(match[1]);
        if (!classKey) {
            console.warn(`Could not match class "${match[1]}" to a known class; skipping.`);
            return;
        }

        const hasLevel = match[3] !== undefined;
        if (hasLevel) anyExplicitLevel = true;

        entries.push({
            className: classKey,
            subclass: findSubclassKeyByName(classKey, match[2]),
            level: hasLevel ? parseInt(match[3]) : 1,
            choices: {},
            features: [],
            hitPoints: {},
            collapsed: false
        });
    });

    // Distribute levels when the string didn't include them
    if (entries.length > 0 && !anyExplicitLevel && totalLevel > 0) {
        if (entries.length === 1) {
            entries[0].level = totalLevel;
        } else {
            entries[0].level = Math.max(1, totalLevel - (entries.length - 1));
        }
    }

    return entries;
}

/**
 * Imports a save made outside the creator (hand-built sheet or D&D Beyond
 * conversion). Class levels, ability scores and proficiencies come across;
 * race and per-level choices can't be reconstructed, so ability scores are
 * treated as final values and HP changes are applied as deltas at save time.
 */
function importLegacySave(characterName, saved) {
    currentCharacter.name = characterName;
    const nameInput = document.getElementById('characterName');
    if (nameInput) nameInput.value = characterName;
    setSelectValue('characterAlignment', saved.alignment);

    // Ability scores: the sheet only stores totals, so treat them as base
    // scores with no bonuses. New ASIs taken during level-up add on top.
    currentCharacter.abilityScoreMethod = 'manual';
    const abilityKeys = {
        strength: 'strengthScore', dexterity: 'dexterityScore',
        constitution: 'constitutionScore', intelligence: 'intelligenceScore',
        wisdom: 'wisdomScore', charisma: 'charismaScore'
    };
    Object.entries(abilityKeys).forEach(([ability, key]) => {
        const value = parseInt(saved[key]);
        currentCharacter.abilities[ability] = isNaN(value) ? 10 : value;
    });
    resetAbilityBonuses();
    setSelectValue('abilityScoreMethod', 'manual');

    // Classes from the sheet's class string
    const totalLevel = parseInt(saved.characterLevel) || 1;
    currentCharacter.classes = parsePlayerClassString(saved.playerClass, totalLevel);
    if (currentCharacter.classes.length > 0) {
        const primary = currentCharacter.classes[0];
        currentCharacter.class = primary.className;
        currentCharacter.subclass = primary.subclass;
        currentCharacter.level = primary.level;
    }
    currentCharacter.totalLevel = currentCharacter.classes.reduce((sum, cls) => sum + cls.level, 0) || totalLevel;
    currentCharacter.isMulticlassing = currentCharacter.classes.length > 1;

    // Saving throw proficiencies from pb-19..pb-24
    currentCharacter.savingThrows = {};
    SAVES_ORDER.forEach((save, index) => {
        if ((parseFloat(saved[`pb-${19 + index}`]) || 0) >= 1) {
            currentCharacter.savingThrows[save] = true;
        }
    });

    // Skill proficiencies / expertise from pb-1..pb-18
    currentCharacter.skills.proficiencies = [];
    currentCharacter.skills.sources = {};
    currentCharacter.skills.expertise = [];
    SKILLS_ALPHABETICAL.forEach((skill, index) => {
        const value = parseFloat(saved[`pb-${index + 1}`]) || 0;
        if (value >= 1) {
            currentCharacter.skills.proficiencies.push(skill);
            currentCharacter.skills.sources[skill] = 'Imported';
        }
        if (value >= 2) {
            currentCharacter.skills.expertise.push(skill);
        }
    });

    // HP: keep what the sheet says; deltas are applied at save time
    currentCharacter.hitPointsCalculationMethod = 'average';
    currentCharacter.trueHitPoints = parseInt(saved.maxCharacterHP) || 1;
    currentCharacter.hitPoints = currentCharacter.trueHitPoints;
    setSelectValue('hitPointsMethod', 'average');

    // Baseline so SavingCharacter.js can compute the HP delta for new levels
    const classLevels = {};
    currentCharacter.classes.forEach(cls => { classLevels[cls.className] = cls.level; });
    legacyImportBaseline = {
        maxHP: parseInt(saved.maxCharacterHP) || 0,
        classLevels: classLevels
    };

    // Render the class UI (race/background are left untouched for imports;
    // the merge keeps the existing playerSpecies and traits)
    if (currentCharacter.classes.length > 0) {
        displayAllClasses();
    }
    updateAbilityScoreInterface();
    updateAbilityTotalsUI();
    updateAbilityModifiers();
    updateClassesDataForSave();
    if (typeof displayCurrentCharacter === 'function') displayCurrentCharacter();
}

// ---------------------------------------------------------------------------
// UI helpers: editing banner + character picker
// ---------------------------------------------------------------------------

function showEditingBanner(characterName, isLegacyImport) {
    let banner = document.getElementById('editingBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'editingBanner';
        banner.style.cssText =
            'background:#2c5f8a;color:#fff;padding:10px 16px;border-radius:6px;' +
            'margin:10px 0;font-weight:bold;text-align:center;';
        const container = document.querySelector('.creator-container');
        if (container) {
            container.insertBefore(banner, container.firstChild);
        } else {
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }

    banner.textContent = isLegacyImport
        ? `Editing ${characterName} (imported from sheet - levels and abilities loaded; ` +
          `inventory, spells, notes and traits on the sheet will be kept on save)`
        : `Editing ${characterName} - saving will update the existing character without ` +
          `touching inventory, notes, actions or spells.`;
}

/**
 * Shows an overlay listing all campaign characters to load into the creator.
 */
async function showLoadCharacterPicker() {
    const characters = await creatorLoadCampaignCharacters();
    const names = Object.keys(characters);

    const overlay = document.createElement('div');
    overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:1000;' +
        'display:flex;align-items:center;justify-content:center;';

    const panel = document.createElement('div');
    panel.style.cssText =
        'background:#222;color:#eee;padding:24px;border-radius:8px;' +
        'max-height:70vh;overflow-y:auto;min-width:280px;';

    const title = document.createElement('h3');
    title.textContent = names.length > 0 ? 'Load a character' : 'No characters found';
    panel.appendChild(title);

    names.sort().forEach(name => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.style.cssText = 'display:block;width:100%;margin:6px 0;';
        const hasBuildData = !!characters[name].characterCreatorData;
        btn.textContent = hasBuildData ? name : `${name} (import)`;
        btn.onclick = async () => {
            document.body.removeChild(overlay);
            await loadCharacterForEditing(name);
        };
        panel.appendChild(btn);
    });

    const cancel = document.createElement('button');
    cancel.className = 'btn btn-secondary';
    cancel.style.cssText = 'display:block;width:100%;margin-top:12px;';
    cancel.textContent = 'Cancel';
    cancel.onclick = () => document.body.removeChild(overlay);
    panel.appendChild(cancel);

    overlay.appendChild(panel);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) document.body.removeChild(overlay);
    });
    document.body.appendChild(overlay);
}
