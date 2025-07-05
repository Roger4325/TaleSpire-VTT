    function convertDnDBeyondToMyFormat(parsedData) {
        const input = parsedData;
        // let parsed;
        // try {
        // parsed = JSON.parse(input);
        // } catch (e) {
        // document.getElementById('outputJSON').textContent = 'Invalid JSON input.';
        // return;
        // }

        const output = transformCharacter(parsedData);
        // document.getElementById('outputJSON').textContent = JSON.stringify(output, null, 2);
        return output
    }
    function copyOutput() {
        const outputElement = document.getElementById('outputJSON');
        const range = document.createRange();
        range.selectNodeContents(outputElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Output copied to clipboard!');
        } else {
            alert('Copy failed. Try manually selecting and copying.');
        }
        } catch (err) {
        alert('Copy not supported in this browser.');
        }

        // Clear the selection
        selection.removeAllRanges();
    }

    const scoreLookups = {
            'STR': [0, 'strength-score'],
            'DEX': [1, 'dexterity-score'],
            'CON': [2, 'constitution-score'],
            'INT': [3, 'intelligence-score'],
            'WIS': [4, 'wisdom-score'],
            'CHA': [5, 'charisma-score']
        }


    function getClasses(){
        if (this.character === undefined){
            return [];
        }
        let classes = [];
        for (let charClass of this.character['classes']){
            classes.push([charClass['definition']['name'], charClass['level']]);
        }
        return classes;
    }

    function isClass(className){
        if (this.character === undefined){
            return false;
        }
        let classExists = false;
        for (let charClass of this.classes){
            if (charClass[0] === className){
                classExists = true;
            }
        }
        return classExists;
    }


function getAbilityScore(ability, data) {
    if (!data) return 0;

    const lookup = scoreLookups[ability];
    if (!lookup) return 0;

    const abilityId = lookup[0];

    // Check for override first
    const overrideEntry = data.overrideStats?.[abilityId];
    if (overrideEntry && overrideEntry.value !== null && overrideEntry.value !== undefined) {
        const overrideValue = Number(overrideEntry.value);
        if (!isNaN(overrideValue)) return overrideValue;
    }

    // Extract base score
    const baseValue = data.stats?.[abilityId]?.value;
    const scoreBase = baseValue !== undefined && baseValue !== null ? Number(baseValue) || 0 : 0;

    // Extract bonus
    const bonusValue = data.bonusStats?.[abilityId]?.value;
    let scoreBonus = 0;
    if (bonusValue !== undefined && bonusValue !== null) {
        const num = Number(bonusValue);
        if (Number.isInteger(num)) scoreBonus = num;
    }

    // Extract modifiers
    let scoreModifier = 0;
    let scoreSet = 0;
    let foundSet = false;

    const modifiers = data.modifiers;
    if (modifiers) {
        Object.values(modifiers).forEach(modCategory => {
            if (!Array.isArray(modCategory)) return;

            modCategory.forEach(item => {
                if (!item.subType || !item.type) return;

                const value = Number(item.value ?? item.fixedValue);
                if (isNaN(value)) return;

                if (item.subType === lookup[1]) {
                    if (item.type === 'bonus') {
                        scoreModifier += value;
                    } else if (item.type === 'set') {
                        scoreSet = value;
                        foundSet = true;
                    }
                }
            });
        });
    }

    return foundSet ? scoreSet : scoreBase + scoreBonus + scoreModifier;
}


    function hasFeat(data, featName) {
        return data.feats?.some(feat =>
            feat.definition?.name?.toLowerCase() === featName.toLowerCase()
        );
    }

    function getTotalLevel() {
        if (this.character === undefined){
            return 0;
        }
        let level = 0;
        let classList = this.character['classes'];
        for (let charClass of classList){
            level += charClass['level'];
        }
        return level;
    }

    function getMaxHP(data) {
        if (!data) return 0;
    
        const conScore = getAbilityScore('CON', data);
        const conMod = Math.floor((conScore - 10) / 2);
        const level = data.classes?.reduce((sum, cls) => sum + cls.level, 0) || 1;
    
        let maxHP = 0;
        
        // Check if we need to calculate average hit dice (hitPointType = 1)
        if (data.preferences?.hitPointType === 1) {
            // Calculate HP using average hit dice method
            let totalHP = 0;
            
            // Process each class
            if (data.classes) {
                data.classes.forEach(cls => {
                    const classLevel = cls.level || 0;
                    const hitDice = cls.definition?.hitDice || 6; // Default to d6 if not found
                    
                    if (classLevel > 0) {
                        // First level gets max hit dice + CON mod
                        const firstLevelHP = hitDice + conMod;
                        
                        // Remaining levels get average hit dice + CON mod
                        const avgHitDice = Math.floor((hitDice + 1) / 2) + 1; // Average of die rounded up
                        const remainingLevelsHP = (classLevel - 1) * (avgHitDice + conMod);
                        
                        totalHP += firstLevelHP + remainingLevelsHP;
                    }
                });
            }
            
            maxHP = totalHP;
        } else {
            // Use existing manual/base HP calculation
            const baseMaxHP = parseInt(data.baseHitPoints) || 0;
            maxHP = baseMaxHP + (level * conMod);
        }
        
        // Add Tough feat bonus if present
        if (hasFeat(data, 'Tough')) {
            maxHP += (level * 2);
        }
    
        return maxHP;
    }

    function getCurrentHP(data) {
        if (!data) return 0;
        
        const maxHP = getMaxHP(data);
        const currentHP = parseInt(data.removedHitPoints) || 0;
        
        // D&D Beyond doesn't have separate removedHP or bonusHP fields in its API
        // currentCharacterHP already represents (maxHP - damageTaken)
        return maxHP - currentHP;
    }

    function getInspiration(){
        if (this.character === undefined){
            return 0;
        }
        return this.character['inspiration'];
    }

    function getKiPointsUsedAndMax(){
        if (this.character === undefined){
            return 0;
        }
        if (this.isClass('Monk')){
            let maxKiPoints = 0;
            let spentKiPoints = 0;
            let classActions = this.character.actions.class;
            classActions.forEach(action => {
                if (action.name === 'Ki Points'){
                    maxKiPoints = action.limitedUse.maxUses;
                    spentKiPoints = action.limitedUse.numberUsed;
                }
            });
            return [spentKiPoints, maxKiPoints];
        }
    }

function canCastSpells(classes) {
    return classes?.some(cls => cls.definition?.canCastSpells) || false;
}

function stripHTML(htmlString) {
    const div = document.createElement("div");
    div.innerHTML = htmlString || "";
    let text = div.textContent || div.innerText || "";

    // Step 1: Normalize line breaks
    text = text.replace(/\r\n|\r/g, '\n');

    // Step 2: Remove extra blank lines (keep max one in a row)
    text = text.replace(/\n\s*\n\s*\n+/g, '\n\n');

    // Step 3: Trim each line’s leading/trailing spaces
    text = text.split('\n').map(line => line.trim()).join('\n');

    // Step 4: Trim leading/trailing text
    return text.trim();
}

function getValidClassFeatures(classes) {
    const validFeatures = [];
    classes.forEach(cls => {
        const level = cls.level || 1;
        const features = cls.classFeatures || [];

        features.forEach(feature => {
            if (feature.definition.requiredLevel <= level) {
                // Clean up the feature description
                if (feature.definition?.description) {
                    feature.definition.description = stripHTML(feature.definition.description);
                }
                validFeatures.push(feature);
            }
        });
    });

    return validFeatures;
}

function calculateTotalSpellSlots(classes) {
    if (!classes) return Array(9).fill(0);
    
    let totalEffectiveLevel = 0;
    const nonWarlockCastingClasses = [];
    
    classes.forEach(cls => {
        const def = cls.definition;
        if (def?.canCastSpells && def.name !== 'Warlock') {
            const divisor = def.spellRules?.multiClassSpellSlotDivisor || 1;
            totalEffectiveLevel += Math.floor(cls.level / divisor);
            nonWarlockCastingClasses.push(cls);
        }
    });

    if (nonWarlockCastingClasses.length === 1) {
        const cls = nonWarlockCastingClasses[0];
        const slots = cls.definition.spellRules?.levelSpellSlots;
        return slots?.[cls.level] || Array(9).fill(0);
    } 
    
    // Multiclass spell slot table
    const multiclassSpellSlotsTable = [
        [2, 0, 0, 0, 0, 0, 0, 0, 0], // Level 1
        [3, 0, 0, 0, 0, 0, 0, 0, 0], // Level 2
        [4, 2, 0, 0, 0, 0, 0, 0, 0], // Level 3
        [4, 3, 0, 0, 0, 0, 0, 0, 0], // Level 4
        [4, 3, 2, 0, 0, 0, 0, 0, 0], // Level 5
        [4, 3, 3, 0, 0, 0, 0, 0, 0], // Level 6
        [4, 3, 3, 1, 0, 0, 0, 0, 0], // Level 7
        [4, 3, 3, 2, 0, 0, 0, 0, 0], // Level 8
        [4, 3, 3, 3, 1, 0, 0, 0, 0], // Level 9
        [4, 3, 3, 3, 2, 0, 0, 0, 0], // Level 10
        [4, 3, 3, 3, 2, 1, 0, 0, 0], // Level 11
        [4, 3, 3, 3, 2, 1, 0, 0, 0], // Level 12
        [4, 3, 3, 3, 2, 1, 1, 0, 0], // Level 13
        [4, 3, 3, 3, 2, 1, 1, 0, 0], // Level 14
        [4, 3, 3, 3, 2, 1, 1, 1, 0], // Level 15
        [4, 3, 3, 3, 2, 1, 1, 1, 0], // Level 16
        [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 17
        [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 18
        [4, 3, 3, 3, 2, 2, 1, 1, 1], // Level 19
        [4, 3, 3, 3, 2, 2, 1, 1, 1], // Level 20
    ];

    const levelIndex = Math.min(totalEffectiveLevel, 20) - 1;
    return multiclassSpellSlotsTable[levelIndex] || Array(9).fill(0);
}

function getTotalSpellSlots(classes, slotLevel) {
    const spellSlots = calculateTotalSpellSlots(classes);
    let slots = spellSlots?.[slotLevel - 1] || 0;
    
    // Add Warlock pact slots
    const warlock = classes?.find(cls => cls.definition?.name === 'Warlock');
    if (warlock) {
        const warlockSlots = warlock.definition.spellRules?.levelSpellSlots?.[warlock.level] || [];
        slots += warlockSlots[slotLevel - 1] || 0;
    }
    
    return slots;
}

function getUsedSpellSlots(character, slotLevel) {
    let used = 0;
    
    // Regular spell slots
    character.spellSlots?.forEach(slot => {
        if (slot.level === slotLevel) used += slot.used || 0;
    });
    
    // Warlock pact slots
    character.pactMagic?.forEach(slot => {
        if (slot.level === slotLevel) used += slot.used || 0;
    });
    
    return used;
}

function getSpellSlotsUsedAndMax(character, classes, slotLevel) {
    return [
        getUsedSpellSlots(character, slotLevel),
        getTotalSpellSlots(classes, slotLevel)
    ];
}


function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

function buildSpellData(character, classes) {
    // Map ability IDs to abbreviations
    const abilityMap = {
        1: "STR", 2: "DEX", 3: "CON", 
        4: "INT", 5: "WIS", 6: "CHA"
    };
    
    // Get spellcasting ability (default to CHA)
    const primaryCaster = classes?.find(cls => 
        cls.definition?.canCastSpells
    );
    const abilityId = primaryCaster?.definition?.spellCastingAbilityId || 6;
    const spellcastingModifier = abilityMap[abilityId] || "CHA";
    
    // Initialize spell data structure with all levels
    const spellData = {
        spellcastingModifier,
        spelllevelselected: "9",
        Cantrip: { spells: [], slots: [] }
    };
    
    // Create all spell levels (1st through 9th)
    for (let level = 1; level <= 9; level++) {
        const levelKey = `${level}${getOrdinalSuffix(level)}-level`;
        spellData[levelKey] = spellData[levelKey] || { spells: [], slots: [] };
    }

    // Collect spells from ALL sources
    let spellList = [];
    
    // 1. Race spells 
    if (Array.isArray(character?.spells?.race)) {
        console.warn("Race spells found");
        character.spells.race.forEach(spell => spellList.push(spell));
    }

    // 2. Class spells
    if (Array.isArray(character?.classSpells)) {
        console.warn("Class spells found");
        character.classSpells.forEach(cls => {
            if (Array.isArray(cls?.spells)) {
                cls.spells.forEach(spell => spellList.push(spell));
            }
        });
    }
    
    // 2.6. Subclass-defined spell tables (like Domain Spells)
    classes.forEach(cls => {
        const subclassFeatures = cls.subclassDefinition?.classFeatures || [];
        const currentClassLevel = cls.level || 1;
        const className = cls.definition.name.toLowerCase();

        subclassFeatures.forEach(feature => {
            if (
                typeof feature.description === "string" && 
                feature.name?.toLowerCase().includes("spells")
            ) {
                // Updated regex to handle more complex HTML structures
                const spellRegex = /<td[^>]*>\s*<p[^>]*>(.*?)<\/p>\s*<\/td>\s*<td[^>]*>\s*<p[^>]*>(.*?)<\/p>/gi;
                let match;
                while ((match = spellRegex.exec(feature.description)) !== null) {
                    // Extract class level text and remove HTML tags
                    const classLevelText = match[1].replace(/<[^>]+>/g, '').trim();
                    const grantedAtClassLevel = parseInt(classLevelText);
                    
                    if (isNaN(grantedAtClassLevel) || grantedAtClassLevel > currentClassLevel) continue;

                    // Extract spell names and remove HTML tags
                    let spellNamesText = match[2].replace(/<[^>]+>/g, '').trim();

                    // Determine spell level based on class type
                    let effectiveSpellLevel;
                    if (className === 'paladin' || className === 'ranger' || className === 'artificer') {
                        // Half-caster progression formula
                        effectiveSpellLevel = Math.floor((grantedAtClassLevel - 1) / 4) + 1;
                    } else {
                        // Full-caster progression formula
                        effectiveSpellLevel = Math.ceil(grantedAtClassLevel / 2);
                    }

                    // Handle special case for level 0 (cantrips)
                    const spellLevelKey = effectiveSpellLevel === 0 
                        ? "Cantrip" 
                        : `${effectiveSpellLevel}${getOrdinalSuffix(effectiveSpellLevel)}-level`;

                    spellData[spellLevelKey] = spellData[spellLevelKey] || { spells: [], slots: [] };

                    spellNamesText
                        .split(',')
                        .map(name => name.trim())
                        .forEach(spellName => {
                            spellData[spellLevelKey].spells.push({
                                name: toTitleCase(spellName),
                                prepared: true
                            });
                        });
                }
            }
        });
    });

    // 3. Feat spells 
    if (Array.isArray(character?.spells?.feat)) {
        console.warn("Feat spells found");
        character.spells.feat.forEach(spell => spellList.push(spell));
    }

    // 1. Class spells for Warlock
    if (Array.isArray(character?.spells?.class)) {
        console.warn("Race spells found");
        character.spells.class.forEach(spell => spellList.push(spell));
    }



    // 3. Background spells
    if (character?.background?.spells) {
        console.warn("where")
        character.background.spells.forEach(spell => spellList.push(spell));
    }

    // 4. Item spells
    if (Array.isArray(character?.items)) {
        console.warn("MaybeHere")
        character.items.forEach(item => {
            if (Array.isArray(item?.spells)) {
                item.spells.forEach(spell => spellList.push(spell));
            }
        });
    }

    // 5. Top-level spells (legacy format)
    if (Array.isArray(character?.spells)) {
        console.warn("sure")
        character.spells.forEach(spell => spellList.push(spell));
    }

    // Add spells to their respective levels
    spellList.forEach(spell => {
        const spellDef = spell.definition || {};
        const spellLevel = spellDef.level ?? spell.level ?? 0;
        const spellName = spellDef.name ?? spell.name ?? "Unknown Spell";
        const prepared = spell.prepared ?? spell.isPrepared ?? false;
        
        if (spellLevel === 0) {
            spellData.Cantrip.spells.push({
                name: spellName,
                prepared: prepared ? "1" : "0"
            });
        } else {
            const levelKey = `${spellLevel}${getOrdinalSuffix(spellLevel)}-level`;
            spellData[levelKey] = spellData[levelKey] || { spells: [], slots: [] };
            spellData[levelKey].spells.push({
                name: spellName,
                prepared: prepared ? "1" : "0"
            });
        }
    });

    // Add slot usage for levels 1-9
    for (let level = 1; level <= 9; level++) {
        const levelKey = `${level}${getOrdinalSuffix(level)}-level`;
        const [used, max] = getSpellSlotsUsedAndMax(character, classes, level);
        
        // Ensure the level exists before setting slots
        spellData[levelKey] = spellData[levelKey] || { spells: [], slots: [] };
        
        // Create slots array safely
        spellData[levelKey].slots = Array(Math.max(0, max)).fill(false)
            .fill(true, 0, Math.max(0, used));
    }
    
    return spellData;
}

// Robust ordinal suffix function
function getOrdinalSuffix(level) {
    if (level % 100 >= 11 && level % 100 <= 13) return "th";
    switch (level % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}

    function checkProficiency(skill){
        if (this.character === undefined){
            return 0;
        }
        let modifiers = this.character['modifiers'];
        let profMultiplier = 0
        for (let mod in modifiers){
            for (let item of modifiers[mod]){
                if (item.subType === skill && item.type === 'proficiency' && profMultiplier !== 2){
                    profMultiplier = 1;
                } else if (item.subType === skill && item.type === 'expertise'){
                    profMultiplier = 2;
                }
            }
        }
        return profMultiplier;
    }

    // Returns the total number of hit dice (sum of all class levels)
    function getCurrentHitDiceCount(classes) {
        if (!classes || classes.length === 0) return 0;
        return classes.reduce((total, cls) => total + (cls.level || 0), 0);
    }

    // Returns the hit dice size for the primary class (as a number)
    function getHitDiceSize(classes) {
        if (!classes || classes.length === 0) return 0;
        const primaryClass = classes.find(cls => cls.isStartingClass) || classes[0];
        return primaryClass.definition?.hitDice || 0;
    }





function getWalkingSpeedFromModifiers(character) {
    const modifierSources = [
        ...(character?.modifiers?.race || []),
        ...(character?.modifiers?.class || []),
        ...(character?.modifiers?.background || []),
        ...(character?.modifiers?.feat || [])
    ];

    let baseSpeed = 30; // default fallback
    let bonusSpeed = 0;

    for (const mod of modifierSources) {
        if (!mod.isGranted) continue;

        // If there's a set value for base speed
        if (mod.type === "set" && mod.subType === "innate-speed-walking") {
            baseSpeed = mod.fixedValue || mod.value || baseSpeed;
        }

        // Bonus speed from features, feats, etc.
        if (
            mod.type === "bonus" && (
                mod.subType === "speed" ||
                mod.subType === "unarmored-movement"
            )
        ) {
            bonusSpeed += mod.fixedValue || mod.value || 0;
        }
    }

    return (baseSpeed + bonusSpeed) + "ft.";
}


const proficiencyTransformMap = {
    weapon: {
        simpleMelee: {
            'club': 'Club', 'dagger': 'Dagger', 'greatclub': 'Greatclub',
            'handaxe': 'Handaxe', 'javelin': 'Javelin', 'light-hammer': 'LightHammer',
            'mace': 'Mace', 'quarterstaff': 'Quarterstaff', 'sickle': 'Sickle', 'spear': 'Spear'
        },
        simpleRanged: {
            'crossbow-light': 'CrossbowLight', 'dart': 'Dart', 'shortbow': 'Shortbow', 'sling': 'Sling'
        },
        martialMelee: {
            'battleaxe': 'Battleaxe', 'flail': 'Flail', 'glaive': 'Glaive', 'greataxe': 'Greataxe',
            'greatsword': 'Greatsword', 'halberd': 'Halberd', 'lance': 'Lance',
            'longsword': 'Longsword', 'maul': 'Maul', 'morningstar': 'Morningstar',
            'pike': 'Pike', 'rapier': 'Rapier', 'scimitar': 'Scimitar',
            'shortsword': 'Shortsword', 'trident': 'Trident', 'war-pick': 'WarPick',
            'warhammer': 'Warhammer', 'whip': 'Whip'
        },
        martialRanged: {
            'blowgun': 'Blowgun', 'crossbow-hand': 'CrossbowHand',
            'heavy-crossbow': 'CrossbowHeavy', 'longbow': 'Longbow', 'net': 'Net'
        },
        categories: {
            'simple-weapons': 'Simple Weapons',
            'martial-weapons': 'Martial Weapons'
        }
    },
    armor: {
        'light-armor': 'Light',
        'medium-armor': 'Medium',
        'heavy-armor': 'Heavy',
        'shields': 'Shield'
    },
    language: {
        common: {
            'common': 'Common', 'dwarvish': 'Dwarvish', 'elvish': 'Elvish',
            'giant': 'Giant', 'gnomish': 'Gnomish', 'goblin': 'Goblin',
            'halfling': 'Halfling', 'orc': 'Orc', 'leonin': 'Leonin',
            'minotaur': 'Minotaur', 'sign-language': 'SignLanguage'
        },
        exotic: {
            'abyssal': 'Abyssal', 'celestial': 'Celestial', 'draconic': 'Draconic',
            'deep-speech': 'DeepSpeech', 'infernal': 'Infernal',
            'primordial': 'Primordial', 'sylvan': 'Sylvan',
            'undercommon': 'Undercommon', 'thieves-cant': 'ThievesCant'
        }
    },
    tool: {
        artisan: {
            "alchemists-supplies": "Alchemist's Supplies",
            "brewers-supplies": "Brewer's Supplies",
            "calligraphers-supplies": "Calligrapher's Supplies",
            "carpenters-tools": "Carpenter's Tools",
            "cartographers-tools": "Cartographer's Tools",
            "cobblers-tools": "Cobbler's Tools",
            "cooks-utensils": "Cook's Utensils",
            "glassblowers-tools": "Glassblower's Tools",
            "jewelers-tools": "Jeweler's Tools",
            "leatherworkers-tools": "Leatherworker's Tools",
            "masons-tools": "Mason's Tools",
            "painters-supplies": "Painter's Supplies",
            "potters-tools": "Potter's Tools",
            "smiths-tools": "Smith's Tools",
            "tinkers-tools": "Tinker's Tools",
            "weavers-tools": "Weaver's Tools",
            "woodcarvers-tools": "Woodcarver's Tools"
        },
        gaming: {
            "dice-set": "Dice Set", "dragonchess-set": "Dragonchess Set",
            "playing-card-set": "Playing Card Set", "three-dragon-ante-set": "Three-Dragon Ante Set"
        },
        musical: {
            "bagpipes": "Bagpipes", "drum": "Drum", "dulcimer": "Dulcimer", "flute": "Flute",
            "lute": "Lute", "lyre": "Lyre", "horn": "Horn", "wargong": "Wargong",
            "pan-flute": "PanFlute", "shawm": "Shawm", "viol": "Viol", "birdpipes": "BirdPipes"
        },
        other: {
            "disguise-kit": "Disguise Kit", "forgery-kit": "Forgery Kit", "herbalism-kit": "Herbalism Kit",
            "navigators-tools": "Navigator's Tools", "poisoners-kit": "Poisoner's Kit",
            "thieves-tools": "Thieves' Tools", "vehicles-land": "Vehicles (Land)", "vehicles-water": "Vehicles (Water)"
        }
    }
};

// 2) Recursively flatten it:
function buildFlatMap(nestedMap, flat = {}) {
  for (const [key, val] of Object.entries(nestedMap)) {
    if (typeof val === 'string') {
      // direct slug → display
      flat[key] = val;
    } else if (typeof val === 'object') {
      // dive one level deeper
      buildFlatMap(val, flat);
    }
  }
  return flat;
}

const flatProficiencyMap = buildFlatMap(proficiencyTransformMap);

function injectUsageInfo(trait) {
    const uses = trait.definition.limitedUse;
    if (uses) {
        if (Array.isArray(uses)) {
            trait.numberOfUses = String(
                uses.reduce((sum, entry) => sum + (parseInt(entry.uses) || 0), 0)
            );
        } else if (typeof uses === "object") {
            trait.numberOfUses = String(parseInt(uses.uses) || 0);
            trait.resetType = uses.resetType?.toLowerCase() || "none";
        }
    } else {
        trait.numberOfUses = "0";
        trait.resetType = "none";
    }

    return trait;
}


function convertSlugs(slugs) {
  return slugs.map(s => {
    const lower = s.toLowerCase();

    // 1) Exact match
    if (flatProficiencyMap[lower]) return flatProficiencyMap[lower];

    // 2) Spaces → hyphens
    const hyphened = lower.replace(/\s+/g, '-');
    if (flatProficiencyMap[hyphened]) return flatProficiencyMap[hyphened];

    // 3) Comma cases: try both orders “a-b” and “b-a”
    if (s.includes(',')) {
      const parts = s.split(',').map(p => p.trim().toLowerCase());
      const [first, second] = parts;
      const slug1 = `${first}-${second}`; // e.g. "crossbow-hand"
      const slug2 = `${second}-${first}`; // e.g. "hand-crossbow"
      if (flatProficiencyMap[slug1]) return flatProficiencyMap[slug1];
      if (flatProficiencyMap[slug2]) return flatProficiencyMap[slug2];
    }

    // 4) Fallback
    return s;
  });
}

function convertToInternalProficiencyFormat(categorized) {
    const result = {
        weapons: [],
        armor: [],
        languages: [],
        tools: []
    };

    // Helper to push unique values
    const pushUnique = (arr, value) => {
        if (!arr.includes(value)) {
            arr.push(value);
        }
    };

    // Convert weapon proficiencies
    categorized.weapons.forEach(item => {
        const itemLC = item.toLowerCase();
        
        // Check weapon categories (e.g., "simple-weapons")
        if (proficiencyTransformMap.weapon.categories[itemLC]) {
            pushUnique(result.weapons, proficiencyTransformMap.weapon.categories[itemLC]);
        }
        
        // Check specific weapons
        for (const category in proficiencyTransformMap.weapon) {
            if (category === 'categories') continue;
            if (proficiencyTransformMap.weapon[category][itemLC]) {
                pushUnique(result.weapons, proficiencyTransformMap.weapon[category][itemLC]);
            }
        }
    });

    // Convert armor proficiencies
    categorized.armor.forEach(item => {
        const norm = proficiencyTransformMap.armor[item.toLowerCase()];
        if (norm) pushUnique(result.armor, norm);
    });

    // Convert language proficiencies
    categorized.languages.forEach(item => {
        const itemLC = item.toLowerCase();
        if (proficiencyTransformMap.language.common[itemLC]) {
            pushUnique(result.languages, proficiencyTransformMap.language.common[itemLC]);
        } else if (proficiencyTransformMap.language.exotic[itemLC]) {
            pushUnique(result.languages, proficiencyTransformMap.language.exotic[itemLC]);
        }
    });

    // Convert tool proficiencies
    categorized.tools.forEach(item => {
        const itemLC = item.toLowerCase();
        for (const toolType in proficiencyTransformMap.tool) {
            if (proficiencyTransformMap.tool[toolType][itemLC]) {
                pushUnique(result.tools, proficiencyTransformMap.tool[toolType][itemLC]);
                break;
            }
        }
    });

    return result;
}

const CONTAINER_TYPES = {
    EQUIPMENT: 1581111423,
    BACKPACK: 1439493548,
};


//Left is D&D beyonds right is my Item Name. 
const equipmentNameTranslationMap = {
    "Studded Leather": "Studded Leather Armor",
    "Padded": "Padded Armor",
    "Leather": "Leather Armor",
    "Hide": "Hide Armor",
    "Half Plate": "Half Plate Armor",
    "Plate": "Plate Armor",
    "Splint": "Splint Armor",
    "Potion of Healing (Greater)" : "Potion of Greater Healing",
    "Potion of Healing (Superior)" : "Potion of Superior Healing",
    "Potion of Healing (Supreme)" : "Potion of Supreme Healing",
    // Add more mappings here
};

function transformCharacter(rawData) {
    const data = rawData.data
    
    console.log(data)
    const result = {};
    const name = data.name || 'Unnamed Character';
    
    // Alignment ID to text mapping
    const alignmentMap = {
        1: 'LG', 2: 'NG', 3: 'CG',
        4: 'LN', 5: 'N', 6: 'CN',
        7: 'LE', 8: 'NE', 9: 'CE'
    };

    const untranslatedItems = new Set();
    const mapInventoryItem = (item) => {
        const originalName = item.definition?.name || "Unnamed Item";
        if (!equipmentNameTranslationMap[originalName]) {
            untranslatedItems.add(originalName);
        }

        const translatedName = equipmentNameTranslationMap[originalName] || originalName;

        return {
            name: translatedName,
            uniqueId: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            quantity: item.quantity || 1,
            weight: item.definition?.weight || 0,
            cost: item.definition?.cost ? `${item.definition.cost.value} ${item.definition.cost.denomination}` : "0 gp",
            equipped: item.equipped || false,
            useable: item.definition?.filterType === "Potion" || false
        };
    };

    // Map traits/features
    const mapTrait = (trait) => ({
        traitName: trait.definition?.name || "Unnamed Trait",
        cheveron: true,
        traitDescription: trait.definition?.description || "",
        checkboxStates: [],
        numberOfUses: trait.numberOfUses || "0",
        adjustmentCategory: "None",
        adjustmentSubCategory: "",
        adjustmentAbility: "NONE",
        adjustmentValue: "0",
        resetType: trait.resetType || "none"
    });

    // Extract all proficiency modifiers from the modifiers object
    const allModifiers = [
        ...(data.modifiers?.race || []),
        ...(data.modifiers?.class || []),
        ...(data.modifiers?.item || []),
        ...(data.modifiers?.feat || []),
        ...(data.modifiers?.background || [])
    ];

    const skillMappings = [
        "acrobatics", "animal-handling", "arcana", "athletics", 
        "deception", "history", "insight", "intimidation", 
        "investigation", "medicine", "nature", "perception", 
        "performance", "persuasion", "religion", "sleight-of-hand", 
        "stealth", "survival"
    ];

    const saveMappings = [
        "strength-saving-throws",
        "dexterity-saving-throws",
        "constitution-saving-throws",
        "intelligence-saving-throws",
        "wisdom-saving-throws",
        "charisma-saving-throws"
    ];
    const allProficiencies = [...skillMappings, ...saveMappings];

    // Categorize proficiencies
    const categorizeProficiencies = (modifiers) => {
        const result = {
            weapons: [],
            armor: [],
            languages: [],
            tools: []
        };

        // Define category mappings
        const categoryMappings = {
            weapon: [
            'simple-weapons', 'martial-weapons',
            'club', 'dagger', 'greatclub', 'handaxe', 'javelin',
            'light-hammer', 'mace', 'quarterstaff', 'sickle', 'spear',
            'crossbow-light', 'dart', 'shortbow', 'sling',
            'battleaxe', 'flail', 'glaive', 'greataxe', 'greatsword',
            'halberd', 'lance', 'longsword', 'maul', 'morningstar',
            'pike', 'rapier', 'scimitar', 'shortsword', 'trident',
            'war-pick', 'warhammer', 'whip', 'crossbow-hand', 'heavy-crossbow', 'blowgun',
            'net'
            ],
            armor: [
            'light-armor', 'medium-armor', 'heavy-armor', 'shields'
            ],
            language: [
            'common', 'dwarvish', 'elvish', 'giant', 'gnomish',
            'goblin', 'halfling', 'orc', 'abyssal', 'celestial',
            'draconic', 'deep-speech', 'infernal', 'primordial',
            'sylvan', 'undercommon'
            ],
            tool: [
            'artisan-tools', // umbrella category
            'alchemists-supplies', 'brewers-supplies', 'calligraphers-supplies',
            'carpenters-tools', 'cartographers-tools', 'cobblers-tools',
            'cooks-utensils', 'disguise-kit', 'forgery-kit', 'glassblowers-tools',
            'herbalism-kit', 'jewelers-tools', 'leatherworkers-tools',
            'masons-tools', 'painters-supplies', 'potters-tools', 'smiths-tools',
            'tinkers-tools', 'weavers-tools', 'woodcarvers-tools',
            'poisoners-kit', 'thieves-tools',
            'gaming-sets', // umbrella
            'dice-set', 'dragonchess-set', 'playing-card-set', 'three-dragon-ante-set',
            'musical-instruments', // umbrella
            'bagpipes', 'drum', 'dulcimer', 'flute', 'lyre', 'horn', 'wargong',
            'lute', 'mandolin', 'pan-flute', 'shawm', 'viol',
            'navigators-tools','vehicles-water'
            ]
        };

    // Process all modifiers
        modifiers.forEach(mod => {
            const subType = mod.subType?.toLowerCase() || '';
            
            // Handle language type separately
            if (mod.type === 'language') {
                result.languages.push(mod.friendlySubtypeName);
                return;
            }
            
            // Handle proficiency types
            if (mod.type === 'proficiency') {
                if (categoryMappings.weapon.includes(subType)) {
                    result.weapons.push(mod.friendlySubtypeName);
                } 
                else if (categoryMappings.armor.includes(subType)) {
                    result.armor.push(mod.friendlySubtypeName);
                } 
                else if (categoryMappings.language.includes(subType)) {
                    result.languages.push(mod.friendlySubtypeName);
                } 
                else if (categoryMappings.tool.includes(subType)) {
                    result.tools.push(mod.friendlySubtypeName);
                }
            }
        });

        // Remove duplicates
        result.weapons = [...new Set(result.weapons)];
        result.armor = [...new Set(result.armor)];
        result.languages = [...new Set(result.languages)];
        result.tools = [...new Set(result.tools)];

        return result;
    };

    const categorized = categorizeProficiencies(allModifiers);
    const weaponNames   = convertSlugs(categorized.weapons);
    const armorNames    = convertSlugs(categorized.armor);
    const languageNames = convertSlugs(categorized.languages);
    const toolNames     = convertSlugs(categorized.tools);

    // Function to determine proficiency level
    function getProficiencyLevel(subType, modifiers, saveMappings) {
        const subTypeLower = subType.toLowerCase();
        let proficiencyLevel = 0;
        let hasExpertise = false;
        let hasHalfProficiency = false;
        
        // Check for all relevant modifiers
        modifiers.forEach(mod => {
            const modSubType = mod.subType?.toLowerCase() || '';
            if (modSubType === subTypeLower || 
                (modSubType === 'ability-checks' && subTypeLower !== 'initiative')) {
                
                if (mod.type === 'proficiency') proficiencyLevel = 1;
                if (mod.type === 'expertise') hasExpertise = true;
                if (mod.type === 'half-proficiency') hasHalfProficiency = true;
            }
        });
        
        // Apply expertise (overrides proficiency)
        if (hasExpertise) return 2;
        
        // Apply half-proficiency (only if not proficient or expert)
        if (hasHalfProficiency && proficiencyLevel === 0) return 0.5;
        
        // For saving throws, ensure only 0 or 1 is returned
        if (saveMappings.includes(subTypeLower)) {
            return proficiencyLevel === 2 ? 1 : proficiencyLevel;
        }
        
        return proficiencyLevel;
    }

    // Build proficiency bonus map
    function buildProficiencyBonusMap(allModifiers, saveMappings) {
        const proficiencyBonusMap = {};

        // Precompute global half-proficiency (Jack of All Trades)
        const globalHalfProficiency = allModifiers.some(
            mod => mod.type === 'half-proficiency' && 
                mod.subType?.toLowerCase() === 'ability-checks'
        );

        allProficiencies.forEach((subType, index) => {
            let proficiencyLevel = getProficiencyLevel(subType, allModifiers, saveMappings);
            const isSkill = index < skillMappings.length;

            // Only apply global half-proficiency to skills, not saving throws
            if (isSkill && globalHalfProficiency && proficiencyLevel === 0) {
                proficiencyLevel = 0.5;
            }

            // Ensure saves are never 0.5 — only 0 or 1
            if (!isSkill) {
                proficiencyLevel = proficiencyLevel >= 1 ? 1 : 0;
            }

            proficiencyBonusMap[`pb-${index + 1}`] = proficiencyLevel;
        });

        return proficiencyBonusMap;
    }

    const proficiencyBonusMap = buildProficiencyBonusMap(allModifiers, saveMappings);


    // Organize traits by source
    const groupTraitData = [];
    //Helper Function to get all feats and removing the HTML extra bits. 
    if (data.feats) {
        data.feats.forEach(f => {
            if (f.definition?.description) {
                f.definition.description = stripHTML(f.definition.description);
            }
            injectUsageInfo(f);
        });

        groupTraitData.push({
            "group-title": "Feats",
            "group-chevron": false,
            traits: data.feats.map(mapTrait)
        });
    }
    //Helper Function to get all racial traits and removing the HTML extra bits. 
    if (data.race?.racialTraits) {
        data.race.racialTraits.forEach(trait => {
            if (trait.definition?.description) {
                trait.definition.description = stripHTML(trait.definition.description);
            }
            injectUsageInfo(trait);
        });

        groupTraitData.push({
            "group-title": "Racial Traits",
            "group-chevron": false,
            traits: data.race.racialTraits.map(mapTrait)
        });
    }

    //Helper Function to get all class traits and removing the HTML extra bits. 
    const validClassFeatures = getValidClassFeatures(data.classes|| []);
    console.log(validClassFeatures)
    if (validClassFeatures.length > 0) {
        validClassFeatures.forEach(feature => {
            injectUsageInfo(feature);
            console.warn(injectUsageInfo(feature));
        });

        groupTraitData.push({
            "group-title": "Class Traits",
            "group-chevron": false,
            traits: validClassFeatures.map(mapTrait)
        });
    }

    // Build character object
    result[name] = {
        characterTempHp: String(data.temporaryHitPoints || 0),
        currentHitDice: getCurrentHitDiceCount(data.classes),
        insp: data.inspiration ? 1 : 0,
        upcastToggle: 1,
        exhaustionToggle: 0,
        playerWeaponProficiency: weaponNames,
        playerArmorProficiency:  armorNames,
        playerLanguageProficiency: languageNames,
        playerToolsProficiency:   toolNames,
        initiativeButton: '+' + (data.stats?.dexterity?.modifier || 0),
        AC: String(data.stats?.armorClass || 0), // Added AC property
        speed: getWalkingSpeedFromModifiers(data),
        characterLevel: String(data.classes?.reduce((sum, cls) => sum + cls.level, 0) || 1),
        playerXP: String(data.currentXp || 0),
        playerClass: data.classes?.map(cls => cls.subclassDefinition ? `${cls.definition.name} (${cls.subclassDefinition.name})` : cls.definition.name).join(' / ') || '',
        currentCharacterHP: getCurrentHP(data),
        maxCharacterHP: getMaxHP(data),
        strengthScore: getAbilityScore('STR', data),
        dexterityScore: getAbilityScore('DEX', data),
        constitutionScore: getAbilityScore('CON', data),
        intelligenceScore: getAbilityScore('INT', data),
        wisdomScore: getAbilityScore('WIS', data),
        charismaScore: getAbilityScore('CHA', data),
        // Skill modifiers (static mappings)
        acrobaticsMod: 'DEX',
        animalHandlingMod: 'WIS',
        arcanaMod: 'INT',
        athleticsMod: 'STR',
        deceptionMod: 'CHA',
        historyMod: 'INT',
        insightMod: 'WIS',
        intimidationMod: 'CHA',
        investigationMod: 'INT',
        medicineMod: 'WIS',
        natureMod: 'INT',
        perceptionMod: 'WIS',
        performanceMod: 'CHA',
        persuasionMod: 'CHA',
        religionMod: 'INT',
        sleightofHandMod: 'DEX',
        stealthMod: 'DEX',
        survivalMod: 'WIS',
        hitDiceButton: "d" + getHitDiceSize(data.classes),
        // Spread the proficiency bonus map properties
        ...proficiencyBonusMap,
        // Convert conditions to required format
        conditions: data.conditions?.conditions?.map(c => ({
            text: c.name,
            value: c.name.toLowerCase()
        })) || [],
        coins: {
            cp: data.currencies?.cp || 0,
            sp: data.currencies?.sp || 0,
            ep: data.currencies?.ep || 0,
            gp: data.currencies?.gp || 0,
            pp: data.currencies?.pp || 0
        },
        alignment: alignmentMap[data.alignmentId] || '',
        actionTable: [],
        spellData: buildSpellData(data, data.classes),
        inventoryData: {
            equipment: data.inventory?.filter(item => item.containerEntityTypeId === CONTAINER_TYPES.EQUIPMENT).map(mapInventoryItem) || [],
            backpack: data.inventory?.filter(item => item.containerEntityTypeId === CONTAINER_TYPES.BACKPACK).map(mapInventoryItem) || [],
            "other-possessions": [],
            attunement: data.inventory?.filter(item => item.attuned).map(mapInventoryItem) || []
        },
        groupTraitData,
        extrasData: []
    };

  return result;

  console.log("Untranslated items:", Array.from(untranslatedItems));
}
