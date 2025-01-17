function setupNav(){
    const tabs = document.querySelectorAll('.tabs a');
    const sections = document.querySelectorAll('main section');

    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            if (tab.getAttribute('href').substring(1) === "Docs"){
                autoResizeTextareas()
            }
            
            tabs.forEach(t => {
                t.style.border = '';
            });

            // Show the selected section
            const targetId = tab.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                tab.style.border = '1px solid rgb(151, 151, 151)';
            } else {
                console.log(`Target section with ID '${targetId}' not found.`);
            }
        });
    });

        // Display the initial section (e.g., Player Stats)
        const initialTab = tabs[0];
        initialTab.click();

}

    //Adding event listeners to the toggle buttons for Adv and Disadv
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });


function generateUUID() {
    return 'xxx-xx-4xxx-yxxx-xx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const damageTypes = [
    "N/A",
    "Slashing",
    "Piercing",
    "Bludgeoning",
    "Fire",
    "Cold",
    "Lightning",
    "Thunder",
    "Acid",
    "Poison",
    "Psychic",
    "Radiant",
    "Necrotic",
    "Force",
    "Healing"
];

const resistanceTypes = [
    "Slashing",
    "Piercing",
    "Bludgeoning",
    "Fire",
    "Cold",
    "Lightning",
    "Thunder",
    "Acid",
    "Poison",
    "Psychic",
    "Radiant",
    "Necrotic",
    "Force",
    "Non-magical damage",
    "Silvered weapons",
    "Magical weapons",
    "Bludgeoning (Non-magical)",
    "Slashing (Non-magical)",
    "Piercing (Non-magical)",
];

const conditionTypes = [
    "Blinded",
    "Charmed",
    "Deafened",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
    "Exhaustion"
];

// Define the global variable with conditions and their descriptions
const CONDITIONS = [
    {
      condition: "Blinded",
      description: [
        "A blinded creature can't see and automatically fails any ability check that requires sight.",
        "<br>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage."
      ]
    },
    {
      condition: "Charmed",
      description: [
        "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
        "The charmer has advantage on any ability check to interact socially with the creature."
      ]
    },
    {
      condition: "Deafened",
      description: [
        "A deafened creature can't hear and automatically fails any ability check that requires hearing."
      ]
    },
    {
      condition: "Exhaustion",
      description: [
        "Level 1: Disadvantage on ability checks",
        "<br>Level 2: Speed halved",
        "<br>Level 3: Disadvantage on attack rolls and saving throws",
        "<br>Level 4: Hit point maximum halved",
        "<br>Level 5: Speed reduced to 0",
        "<br>Level 6: Death"
      ]
    },
    {
      condition: "Frightened",
      description: [
        "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.",
        "<br>The creature can't willingly move closer to the source of its fear."
      ]
    },
    {
      condition: "Grappled",
      description: [
        "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
        "<br>The condition ends if the grappler is incapacitated (see the condition).",
        "<br>The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the thunderwave spell."
      ]
    },
    {
      condition: "Incapacitated",
      description: [
        "An incapacitated creature can't take actions or reactions."
      ]
    },
    {
      condition: "Invisible",
      description: [
        "An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.",
        "<br>Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage."
      ]
    },
    {
      condition: "Paralyzed",
      description: [
        "A paralyzed creature is incapacitated (see the condition) and can't move or speak.",
        "<br>The creature automatically fails Strength and Dexterity saving throws.",
        "<br>Attack rolls against the creature have advantage.",
        "<br>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
      ]
    },
    {
      condition: "Petrified",
      description: [
        "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.",
        "<br>The creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.",
        "<br>Attack rolls against the creature have advantage.",
        "<br>The creature automatically fails Strength and Dexterity saving throws.",
        "<br>The creature has resistance to all damage.",
        "<br>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized."
      ]
    },
    {
      condition: "Poisoned",
      description: [
        "A poisoned creature has disadvantage on attack rolls and ability checks."
      ]
    },
    {
      condition: "Prone",
      description: [
        "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.",
        "<br>The creature has disadvantage on attack rolls.",
        "<br>An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage."
      ]
    },
    {
      condition: "Restrained",
      description: [
        "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
        "<br>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
        "<br>The creature has disadvantage on Dexterity saving throws."
      ]
    },
    {
      condition: "Stunned",
      description: [
        "A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.",
        "<br>The creature automatically fails Strength and Dexterity saving throws.",
        "<br>Attack rolls against the creature have advantage."
      ]
    },
    {
      condition: "Unconscious",
      description: [
        "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
        "<br>The creature drops whatever it's holding and falls prone.",
        "<br>The creature automatically fails Strength and Dexterity saving throws.",
        "<br>Attack rolls against the creature have advantage.",
        "<br>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
      ]
    }
];

const EFFECTS = [
    {
        effect: "Aid",
        description: [
            "The creature gains 5 Max hp per level of aid they have."
        ]
    },
    {
        effect: "Bane",
        description: [
            "The creature must subtract a d4 from attack rolls or saving throws while the effect lasts."
        ]
    },
    {
        effect: "Bless",
        description: [
            "The creature can add a d4 to attack rolls or saving throws while the effect lasts."
        ]
    },
    {
        effect: "Bloodied",
        description: [
            "The creature's hit points are at or below half its maximum hit points."
        ]
    },
    {
        effect: "Concentration",
        description: [
            "The creature is concentrating on a spell. Concentration is broken if the creature takes damage and fails a Constitution saving throw."
        ]
    },
    {
        effect: "Curse",
        description: [
            "The curse applies a specific penalty, such as reduced hit points, disadvantage on certain rolls, or inability to regain hit points."
        ]
    },
    {
        effect: "Drained",
        description: [
            "The creature's maximum hit points are reduced until it finishes a long rest."
        ]
    },
    {
        effect: "Haste",
        description: [
            "The creature's speed is doubled.",
            "It gains a +2 bonus to AC.",
            "It has advantage on Dexterity saving throws.",
            "It gains an additional action each turn (limited to certain actions)."
        ]
    },
    {
        effect: "Heroism",
        description: [
            "The creature gains temporary hit points at the start of each turn while the effect lasts.",
            "It is immune to being frightened."
        ]
    },
    {
        effect: "Hex",
        description: [
            "The creature has disadvantage on ability checks of a chosen ability.",
            "It takes extra necrotic damage from attacks by the caster."
        ]
    },
    {
        effect: "Inspire",
        description: [
            "The creature can add a Bardic Inspiration die to an ability check, attack roll, or saving throw."
        ]
    },
    {
        effect: "Invisible",
        description: [
            "The creature can't be seen without magical aid or special senses.",
            "Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage."
        ]
    },
    {
        effect: "Raging",
        description: [
            "The creature gains advantage on Strength checks and saving throws.",
            "The creature's melee weapon attacks deal bonus damage based on level.",
            "The creature has resistance to bludgeoning, piercing, and slashing damage."
        ]
    },
    {
        effect: "Recharging",
        "description": [
            "This monster's ability recharges after use. At the end of its turns, roll a d6.", 
            "<br>If the result is within the recharge range specified in the ability (e.g., 5–6), the ability becomes available to use again.", 
            "<br>Otherwise, it remains unavailable until the next successful recharge roll."
        ]
    },
    {
        effect: "Sanctuary",
        description: [
            "Creatures attempting to attack the protected creature must make a Wisdom saving throw or choose a new target."
        ]
    },
    {
        effect: "Shield",
        description: [
            "The creature gains a temporary increase to its AC (e.g., Shield spell adds +5 to AC until the start of the next turn)."
        ]
    },
    {
        effect: "Slow",
        description: [
            "The creature's speed is halved.",
            "It takes a -2 penalty to AC and Dexterity saving throws.",
            "It can't use reactions, and it can take only one action or bonus action on its turn."
        ]
    }
];

let savedLanguage = 'eng';

//This is the translation library that changes the textcontent of the id listed as a key below.
//It looks through the active DOM elements and switchs textcontent to the language based on what the user has selcted. 
const translations = {
    eng: {
        //Spell Section
        spellModLabel: "Spell Mod:",
        toHitLabel: "To Hit:",
        saveDcLabel: "Save DC:",
        spellLevelLabel: "Spell Level",
        bonusLabel: "Bonus",
        cantripsLabel: "Cantrips",
        level1Label: "Level 1",
        level2Label: "Level 2",
        level3Label: "Level 3",
        level4Label: "Level 4",
        level5Label: "Level 5",
        level6Label: "Level 6",
        level7Label: "Level 7",
        level8Label: "Level 8",
        level9Label: "Level 9",
        CantripSpellNameHeader: "Spell Name",
        CantripTimeHeader: "Time",
        CantripHitDCHeader: "Hit/DC",
        CantripDiceHeader: "Dice",
        CantripConcentrationHeader: "Con",
        CantripNotesHeader: "Notes",
        CantripDeleteHeader: "Del",
        inspiration: "Inspiration",
        shortRestButton: "Short Rest",
        longRestButton: "Long Rest",
        deleteCharacter: "Delete a Character",
        customSpells: "Create Spell",
        'get-selection-button': "Link mini",
        disadvButton: "DisAdv",
        normalButton: "Flat",
        advButton: "Adv",
        characterInit: "Init",
        armorClass: "AC",
        walkingSpeed: "Speed",
        prof: "Prof",
        levelTextSpan: "Level",
        deathSaves: "Death Saves",
        deathSavesSuccess: "Success :",
        deathSavesFailures: "Failure :",
        healButton: "Heal",
        damageButton: "Damage",
        currentHP: "Current",
        maxHP: "Max",
        hpButtomText: "Player Hit Points",
        tempHPText: "Temp Health",
        characterAbilityStr: "STR",
        characterAbilityDex: "DEX",
        characterAbilityCon: "CON",
        characterAbilityInt: "INT",
        characterAbilityWis: "WIS",
        characterAbilityCha: "CHA",
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
        skillAcrobatics: "Acrobatics",
        skillAnimalHandling: "Animal Handling",
        skillArcana: "Arcana",
        skillAthletics: "Athletics",
        skillDeception: "Deception",
        skillHistory: "History",
        skillInsight: "Insight",
        skillIntimidation: "Intimidation",
        skillInvestigation: "Investigation",
        skillMedicine: "Medicine",
        skillNature: "Nature",
        skillPerception: "Perception",
        skillPerformance: "Performance",
        skillPersuasion: "Persuasion",
        skillReligion: "Religion",
        skillSleightofHand: "Sleight of Hand",
        skillStealth: "Stealth",
        skillSurvival: "Survival",
        strSave: "Str Save",
        dexSave: "Dex Save",
        conSave: "Con Save",
        intSave: "Int Save",
        wisSave: "Wis Save",
        chaSave: "Cha Save",
        passivePerceptionTitle: "Passive WIS (Perception)",
        passiveInvestigationTitle: "Passive INT (Investigation)",
        passiveInsightTitle: "Passive WIS (Insight)",
        proficiencyWeapons: "Weapons",
        proficiencyArmor: "Armor",
        proficiencyLanguages: "Languages",
        proficiencyTools: "Tools",
        actionFiltersAll: "All",
        actionFiltersAttacks: "Attacks",
        actionFiltersActions: "Actions",
        actionFiltersBonusActions: "Bonus Actions",
        actionFiltersReactions: "Reactions",
        actionFiltersOther: "Other",
        actionTableHeader1: "Prof",
        actionTableHeader2: "Name",
        actionTableHeader3: "Reach",
        actionTableHeader4: "ToHit",
        actionTableHeader5: "Damage",
        actionTableHeader6: "Info",


        //Alignment Options
        alignmentOptionLG: "Lawful Good",
        alignmentOptionNG: "Neutral Good",
        alignmentOptionCG: "Chaotic Good",
        alignmentOptionLN: "Lawful Neutral",
        alignmentOptionTN: "True Neutral",
        alignmentOptionCN: "Chaotic Neutral",
        alignmentOptionLE: "Lawful Evil",
        alignmentOptionNE: "Neutral Evil",
        alignmentOptionCE: "Chaotic Evil",


        //character Conditions
        conditionOptionAid: "Aid",
        conditionOptionBane: "Bane",
        conditionOptionBlinded: "Blinded",
        conditionOptionBless: "Bless",
        conditionOptionConcentration: "Concentration",
        conditionOptionCharmed: "Charmed",
        conditionOptionDeafened: "Deafened",
        conditionOptionExhaustion: "Exhaustion",
        conditionOptionFrightened: "Frightened",
        conditionOptionGrappled: "Grappled",
        conditionOptionGuidance: "Guidance",
        conditionOptionHeroism: "Heroism",
        conditionOptionIncapacitated: "Incapacitated",
        conditionOptionInvisible: "Invisible",
        conditionOptionParalyzed: "Paralyzed",
        conditionOptionPetrified: "Petrified",
        conditionOptionPoisoned: "Poisoned",
        conditionOptionProne: "Prone",
        conditionOptionRestrained: "Restrained",
        conditionOptionSanctuary: "Sanctuary",
        conditionOptionStunned: "Stunned",
        conditionOptionUnconscious: "Unconscious",
        conditionOptionSlow: "Slow",
        conditionOptionRaging: "Raging",


        //Proficiency Sections
        // 'Martial Weapons': "Testing",
        // "Simple Weapons": "Simple Weapons",
        
        //Simple Melee Weapons

        // "Club": "Club",
        // "Dagger": "Dagger",
        // "Greatclub": "Greatclub",
        // "Handaxe": "Handaxe",
        // "Javelin": "Javelin",
        // "LightHammer": "Light Hammer",
        // "Mace": "Mace",
        // "Quarterstaff": "Quarterstaff",
        // "Sickle": "Sickle",
        // "Spear": "Spear",


        //Simple Ranged Weapons

        // "CrossbowLight": "Light Crossbow",
        // "Dart": "Dart",
        // "Shortbow": "Shortbow",
        // "Sling": "Sling",

        //Martial Melee Weapons

        // "Battleaxe": "Battleaxe",
        // "Flail": "Flail",
        // "Glaive": "Glaive",
        // "Greataxe": "Greataxe",
        // "Greatsword": "Greatsword",
        // "Halberd": "Halberd",
        // "Lance": "Lance",
        // "Longsword": "Longsword",
        // "Maul": "Maul",
        // "Morningstar": "Morningstar",
        // "Pike": "Pike",
        // "Rapier": "Rapier",
        // "Scimitar": "Scimitar",
        // "Shortsword": "Shortsword",
        // "Trident": "Trident",
        // "WarPick": "War Pick",
        // "Warhammer": "Warhammer",
        // "Whip": "Whip",

        //Martial Ranged Weapons

        // "Blowgun": "Blowgun",
        // "CrossbowHand": "Hand Crossbow",
        // "CrossbowHeavy": "Heavy Crossbow",
        // "Longbow": "Longbow",
        // "Net": "Net",

        //Armor

        // "Light": "Light",
        // "Medium": "Medium",
        // "Heavy": "Heavy",
        // "Shield": "Shield",


        //Languages

        // "Common": "Common",
        // "Dwarvish": "Dwarvish",
        // "Elvish": "Elvish",
        // "Giant": "Giant",
        // "Gnomish": "Gnomish",
        // "Goblin": "Goblin",
        // "Halfling": "Halfling",
        // "Orc": "Orc",
        // "Leonin": "Leonin",
        // "Minotaur": "Minotaur",

        //Exotic Languages

        // "Abyssal": "Abyssal",
        // "Celestial": "Celestial",
        // "Draconic": "Draconic",
        // "DeepSpeech": "Deep Speech",
        // "Infernal": "Infernal",
        // "Primordial": "Primordial",
        // "Sylvan": "Sylvan",
        // "ThievesCant": "Thieves Cant",
        // "Undercommon": "Undercommon",


        //Tools
        //Artisan's Tools

        // "Alchemist's Supplies": "Alchemist's Supplies",
        // "Brewer's Supplies": "Brewer's Supplies",
        // "Calligrapher's Supplies": "Calligrapher's Supplies",
        // "Carpenter's Tools": "Carpenter's Tools",
        // "Cartographer's Tools": "Cartographer's Tools",
        // "Cobbler's Tools": "Cobbler's Tools",
        // "Cook's Utensils": "Cook's Utensils",
        // "Glassblower's Tools": "Glassblower's Tools",
        // "Jeweler's Tools": "Jeweler's Tools",
        // "Leatherworker's Tools": "Leatherworker's Tools",
        // "Mason's Tools": "Mason's Tools",
        // "Painter's Supplies": "Painter's Supplies",
        // "Potter's Tools": "Potter's Tools",
        // "Smith's Tools": "Smith's Tools",
        // "Tinker's Tools": "Tinker's Tools",
        // "Weaver's Tools": "Weaver's Tools",
        // "Woodcarver's Tools": "Woodcarver's Tools",

        //Gaming Set

        // "Dice Set": "Dice Set",
        // "Dragonchess Set": "Dragonchess Set",
        // "Playing Card Set": "Playing Card Set",
        // "Three-Dragon Ante Set": "Three-Dragon Ante Set",

        //Musical Instruments

        // "Bagpipes": "Bagpipes",
        // "Drum": "Drum",
        // "Dulcimer": "Dulcimer",
        // "Flute": "Flute",
        // "Lute": "Lute",
        // "Lyre": "Lyre",
        // "Horn": "Horn",
        // "PanFlute": "Pan Flute",
        // "Shawm": "Shawm",
        // "Viol": "Viol",
        // "Wargong": "Wargong",

        //Other Tools

        // "Disguise Kit" : "Disguise Kit",
        // "Forgery Kit" : "Forgery Kit",
        // "Herbalism Kit" : "Herbalism Kit",
        // "Navigator's Tools" : "Navigator's Tools",
        // "Poisoner's Kit" : "Poisoner's Kit",
        // "Thieves' Tools" : "Thieves' Tools",
        // "Vehicles (Land)" : "Vehicles (Land)",
        // "Vehicles (Water)" : "Vehicles (Water)",




        // Level 1 headers
        '1st-levelSpellNameHeader': "Spell Name",
        '1st-levelTimeHeader': "Time",
        '1st-levelHitDCHeader': "Hit/DC",
        '1st-levelDiceHeader': "Dice",
        '1st-levelConcentrationHeader': "Con",
        '1st-levelNotesHeader': "Notes",
        '1st-levelDeleteHeader': "Del",

        '2nd-levelSpellNameHeader': "Spell Name",
        '2nd-levelTimeHeader': "Time",
        '2nd-levelHitDCHeader': "Hit/DC",
        '2nd-levelDiceHeader': "Dice",
        '2nd-levelConcentrationHeader': "Con",
        '2nd-levelNotesHeader': "Notes",
        '2nd-levelDeleteHeader': "Del",

        // Level 3 headers
        '3rd-levelSpellNameHeader': "Spell Name",
        '3rd-levelTimeHeader': "Time",
        '3rd-levelHitDCHeader': "Hit/DC",
        '3rd-levelDiceHeader': "Dice",
        '3rd-levelConcentrationHeader': "Con",
        '3rd-levelNotesHeader': "Notes",
        '3rd-levelDeleteHeader': "Del",

        // Levels 4 through 9 headers
        ...Array.from({ length: 6 }, (_, i) => i + 4).reduce((acc, level) => {
            acc[`${level}th-levelSpellNameHeader`] = "Spell Name";
            acc[`${level}th-levelTimeHeader`] = "Time";
            acc[`${level}th-levelHitDCHeader`] = "Hit/DC";
            acc[`${level}th-levelDiceHeader`] = "Dice";
            acc[`${level}th-levelConcentrationHeader`] = "Con";
            acc[`${level}th-levelNotesHeader`] = "Notes";
            acc[`${level}th-levelDeleteHeader`] = "Del";
            return acc;
        }, {}),


        //Player Character Inventory Section 
        'add-item-button':"Add New Item",
        currencyLabelPlat: "Platinum (pp):",
        currencyLabelGold: "Gold (gp):",
        currencyLabelEP: "Electrum (ep):",
        currencyLabelSilver: "Silver (sp):",
        currencyLabelCopper: "Copper (cp):",
        inventoryHeaderTitle: "Inventory",
        inventoryGroupEquipment: "Equipment",
        inventoryGroupBackpack: "Backpack",
        inventoryGroupOtherPossessions: "Other Possessions",
        inventoryGroupAttunement: "Attunement",
        


        //DM Section from here to the buttom.
        DMPageLinkInit: "Initiative Tracker",
        'add-monster-button': "Add Monster",
        'add-player-button':"Add Player",
        'save-encounter': "Save Encounter",
        'load-encounter':"Load Encounter",
        conditionDMAddButton: "Add Condition",
        rollInitiative: "Auto Roll",
        'previous-turn-btn': "Previous Turn",
        'next-turn-btn': "Next Turn",
        'request-player-stats': "Request Player Stats",

    },
    es: {
        //Spell Section
        spellModLabel: "Modificador:",
        toHitLabel: "Para Golpear:",
        saveDcLabel: "CD:",
        spellLevelLabel: "Nivel",
        bonusLabel: "Bono",
        cantripsLabel: "Trucos",
        level1Label: "Nivel 1",
        level2Label: "Nivel 2",
        level3Label: "Nivel 3",
        level4Label: "Nivel 4",
        level5Label: "Nivel 5",
        level6Label: "Nivel 6",
        level7Label: "Nivel 7",
        level8Label: "Nivel 8",
        level9Label: "Nivel 9",
        CantripSpellNameHeader: "Nombre",
        CantripTimeHeader: "Tiempo",
        CantripHitDCHeader: "Ataq/CD",
        CantripDiceHeader: "Dados",
        CantripConcentrationHeader: "Conc",
        CantripNotesHeader: "Comp",
        CantripDeleteHeader: "Elim",
        inspiration: "Inspiración",
        shortRestButton: "Descanso Corto",
        longRestButton: "Descanso Largo",
        deleteCharacter: "Eliminar Personaje",
        customSpells: "Crear Hechizo",
        'get-selection-button': "Anexar Mini",
        disadvButton: "DesVent",
        normalButton: "Plano",
        advButton: "Vent",
        characterInit: "Inic",
        armorClass: "CA",
        walkingSpeed: "Velocidad",
        prof: "Comp",
        levelTextSpan: "Nivel",
        deathSaves: "Salvación de Muer",
        deathSavesSuccess: "Éxito :",
        deathSavesFailures: "Fracaso :",
        healButton: "Curar",
        damageButton: "Daño",
        currentHP: "Actual",
        maxHP: "Max",
        hpButtomText: "Puntos de golpe",
        tempHPText: "P.G Temp",
        characterAbilityStr: "FUE",
        characterAbilityDex: "DES",
        characterAbilityCon: "CON",
        characterAbilityInt: "INT",
        characterAbilityWis: "SAB",
        characterAbilityCha: "CAR",
        acrobaticsMod: "DES",
        animalHandlingMod: "SAB",
        arcanaMod: "INT",
        athleticsMod: "FUE",
        deceptionMod: "CAR",
        historyMod: "INT",
        insightMod: "SAB",
        intimidationMod: "CAR",
        investigationMod: "INT",
        medicineMod: "SAB",
        natureMod: "INT",
        perceptionMod: "SAB",
        performanceMod: "CAR",
        persuasionMod: "CAR",
        religionMod: "INT",
        sleightofHandMod: "DES",
        stealthMod: "DES",
        survivalMod: "SAB",
        skillAcrobatics: "Acrobacias",
        skillAnimalHandling: "T. con animales",
        skillArcana: "C. arcano",
        skillAthletics: "Atletismo",
        skillDeception: "Engaño",
        skillHistory: "Historia",
        skillInsight: "Perspicacia",
        skillIntimidation: "Intimidación",
        skillInvestigation: "Investigación",
        skillMedicine: "Medicine",
        skillNature: "Naturaleza",
        skillPerception: "Percepción",
        skillPerformance: "Interpretación",
        skillPersuasion: "Persuasión",
        skillReligion: "Religión",
        skillSleightofHand: "Juego de manos",
        skillStealth: "Sigilo",
        skillSurvival: "Supervivencia",
        strSave: "Salvación Fue",
        dexSave: "Salvación Des",
        conSave: "Salvación Con",
        intSave: "Salvación Int",
        wisSave: "Salvación Sab",
        chaSave: "Salvación Car",
        passivePerceptionTitle: "SAB Pasiva (Percepción)",
        passiveInvestigationTitle: "INT Pasiva (Investigación)",
        passiveInsightTitle: "SAB Pasiva (Perspicacia)",
        proficiencyWeapons: "Armas",
        proficiencyArmor: "Armadura",
        proficiencyLanguages: "Idioma",
        proficiencyTools: "Herramientas",
        actionFiltersAll: "Todo",
        actionFiltersAttacks: "Ataques",
        actionFiltersActions: "Acciones",
        actionFiltersBonusActions: "Acciones adicionales",
        actionFiltersReactions: "Reacciones",
        actionFiltersOther: "Otro",
        actionTableHeader1: "Comp",
        actionTableHeader2: "Nombre",
        actionTableHeader3: "Alcance",
        actionTableHeader4: "Ataque",
        actionTableHeader5: "Daño",
        actionTableHeader6: "Info",


        //Alignment Options
        alignmentOptionLG: "Legal Bueno",
        alignmentOptionNG: "Neutral Bueno",
        alignmentOptionCG: "Caótico Bueno",
        alignmentOptionLN: "Legal Neutral",
        alignmentOptionTN: "Neutral Verdadero",
        alignmentOptionCN: "Caótico Neutral",
        alignmentOptionLE: "Legal Malévolo",
        alignmentOptionNE: "Neutral Malévolo",
        alignmentOptionCE: "Caótico Malévolo",

        //character Conditions
        conditionOptionAid: "Ayuda",
        conditionOptionBane: "Maldición",
        conditionOptionBlinded: "Cegado",
        conditionOptionBless: "Bendición",
        conditionOptionConcentration: "Concentración",
        conditionOptionCharmed: "Encantado",
        conditionOptionDeafened: "Sordo",
        conditionOptionExhaustion: "Agotamiento",
        conditionOptionFrightened: "Asustado",
        conditionOptionGrappled: "Sujeto",
        conditionOptionGuidance: "Orientación",
        conditionOptionHeroism: "Heroísmo",
        conditionOptionIncapacitated: "Incapacitado",
        conditionOptionInvisible: "Invisible",
        conditionOptionParalyzed: "Paralizado",
        conditionOptionPetrified: "Petrificado",
        conditionOptionPoisoned: "Envenenado",
        conditionOptionProne: "Postrado",
        conditionOptionRestrained: "Restringido",
        conditionOptionSanctuary: "Santidad",
        conditionOptionStunned: "Atónito",
        conditionOptionUnconscious: "Inconsciente",
        conditionOptionSlow: "Lento",
        conditionOptionRaging: "Enfurecido",



        //Proficiency Sections
        // 'Martial Weapons': "Testing",
        // "Simple Weapons": "Simple Weapons",
        
        //Simple Melee Weapons

        // "Club": "Club",
        // "Dagger": "Dagger",
        // "Greatclub": "Greatclub",
        // "Handaxe": "Handaxe",
        // "Javelin": "Javelin",
        // "LightHammer": "Light Hammer",
        // "Mace": "Mace",
        // "Quarterstaff": "Quarterstaff",
        // "Sickle": "Sickle",
        // "Spear": "Spear",


        //Simple Ranged Weapons

        // "CrossbowLight": "Light Crossbow",
        // "Dart": "Dart",
        // "Shortbow": "Shortbow",
        // "Sling": "Sling",

        //Martial Melee Weapons

        // "Battleaxe": "Battleaxe",
        // "Flail": "Flail",
        // "Glaive": "Glaive",
        // "Greataxe": "Greataxe",
        // "Greatsword": "Greatsword",
        // "Halberd": "Halberd",
        // "Lance": "Lance",
        // "Longsword": "Longsword",
        // "Maul": "Maul",
        // "Morningstar": "Morningstar",
        // "Pike": "Pike",
        // "Rapier": "Rapier",
        // "Scimitar": "Scimitar",
        // "Shortsword": "Shortsword",
        // "Trident": "Trident",
        // "WarPick": "War Pick",
        // "Warhammer": "Warhammer",
        // "Whip": "Whip",

        //Martial Ranged Weapons

        // "Blowgun": "Blowgun",
        // "CrossbowHand": "Hand Crossbow",
        // "CrossbowHeavy": "Heavy Crossbow",
        // "Longbow": "Longbow",
        // "Net": "Net",

        //Armor

        // "Light": "Light",
        // "Medium": "Medium",
        // "Heavy": "Heavy",
        // "Shield": "Shield",


        //Languages

        // "Common": "Common",
        // "Dwarvish": "Dwarvish",
        // "Elvish": "Elvish",
        // "Giant": "Giant",
        // "Gnomish": "Gnomish",
        // "Goblin": "Goblin",
        // "Halfling": "Halfling",
        // "Orc": "Orc",
        // "Leonin": "Leonin",
        // "Minotaur": "Minotaur",

        //Exotic Languages

        // "Abyssal": "Abyssal",
        // "Celestial": "Celestial",
        // "Draconic": "Draconic",
        // "DeepSpeech": "Deep Speech",
        // "Infernal": "Infernal",
        // "Primordial": "Primordial",
        // "Sylvan": "Sylvan",
        // "ThievesCant": "Thieves Cant",
        // "Undercommon": "Undercommon",


        //Tools
        //Artisan's Tools

        // "Alchemist's Supplies": "Alchemist's Supplies",
        // "Brewer's Supplies": "Brewer's Supplies",
        // "Calligrapher's Supplies": "Calligrapher's Supplies",
        // "Carpenter's Tools": "Carpenter's Tools",
        // "Cartographer's Tools": "Cartographer's Tools",
        // "Cobbler's Tools": "Cobbler's Tools",
        // "Cook's Utensils": "Cook's Utensils",
        // "Glassblower's Tools": "Glassblower's Tools",
        // "Jeweler's Tools": "Jeweler's Tools",
        // "Leatherworker's Tools": "Leatherworker's Tools",
        // "Mason's Tools": "Mason's Tools",
        // "Painter's Supplies": "Painter's Supplies",
        // "Potter's Tools": "Potter's Tools",
        // "Smith's Tools": "Smith's Tools",
        // "Tinker's Tools": "Tinker's Tools",
        // "Weaver's Tools": "Weaver's Tools",
        // "Woodcarver's Tools": "Woodcarver's Tools",

        //Gaming Set

        // "Dice Set": "Dice Set",
        // "Dragonchess Set": "Dragonchess Set",
        // "Playing Card Set": "Playing Card Set",
        // "Three-Dragon Ante Set": "Three-Dragon Ante Set",

        //Musical Instruments

        // "Bagpipes": "Bagpipes",
        // "Drum": "Drum",
        // "Dulcimer": "Dulcimer",
        // "Flute": "Flute",
        // "Lute": "Lute",
        // "Lyre": "Lyre",
        // "Horn": "Horn",
        // "PanFlute": "Pan Flute",
        // "Shawm": "Shawm",
        // "Viol": "Viol",
        // "Wargong": "Wargong",

        //Other Tools

        // "Disguise Kit" : "Disguise Kit",
        // "Forgery Kit" : "Forgery Kit",
        // "Herbalism Kit" : "Herbalism Kit",
        // "Navigator's Tools" : "Navigator's Tools",
        // "Poisoner's Kit" : "Poisoner's Kit",
        // "Thieves' Tools" : "Thieves' Tools",
        // "Vehicles (Land)" : "Vehicles (Land)",
        // "Vehicles (Water)" : "Vehicles (Water)",




        '1st-levelSpellNameHeader': "Nombre",
        '1st-levelTimeHeader': "Tiempo",
        '1st-levelHitDCHeader': "Ataq/CD",
        '1st-levelDiceHeader': "Dados",
        '1st-levelConcentrationHeader': "Conc",
        '1st-levelNotesHeader': "Comp",
        '1st-levelDeleteHeader': "Elim",

        '2nd-levelSpellNameHeader': "Nombre",
        '2nd-levelTimeHeader': "Tiempo",
        '2nd-levelHitDCHeader': "Ataq/CD",
        '2nd-levelDiceHeader': "Dados",
        '2nd-levelConcentrationHeader': "Conc",
        '2nd-levelNotesHeader': "Comp",
        '2nd-levelDeleteHeader': "Elim",

        '3rd-levelSpellNameHeader': "Nombre",
        '3rd-levelTimeHeader': "Tiempo",
        '3rd-levelHitDCHeader': "Ataq/CD",
        '3rd-levelDiceHeader': "Dados",
        '3rd-levelConcentrationHeader': "Conc",
        '3rd-levelNotesHeader': "Comp",
        '3rd-levelDeleteHeader': "Elim",

        ...Array.from({ length: 6 }, (_, i) => i + 4).reduce((acc, level) => {
            acc[`${level}th-levelSpellNameHeader`] = "Nombre";
            acc[`${level}th-levelTimeHeader`] = "Tiempo";
            acc[`${level}th-levelHitDCHeader`] = "Ataq/CD";
            acc[`${level}th-levelDiceHeader`] = "Dados";
            acc[`${level}th-levelConcentrationHeader`] = "Conc";
            acc[`${level}th-levelNotesHeader`] = "Comp";
            acc[`${level}th-levelDeleteHeader`] = "Elim";
            return acc;
        }, {}),

        //Player Character Inventory Section 
        'add-item-button':"Añadir Nuevo Objeto",
        currencyLabelPlat: "Platino (ppt):",
        currencyLabelGold: "Oro (po):",
        currencyLabelEP: "Electrum (pe):",
        currencyLabelSilver: "Plata (pp):",
        currencyLabelCopper: "Cobre (pc):",
        inventoryHeaderTitle: "Inventario",
        inventoryGroupEquipment: "Equipamiento",
        inventoryGroupBackpack: "Mochila",
        inventoryGroupOtherPossessions: "Otras Posesiones ",
        inventoryGroupAttunement: " Sintonización",


        //DM Section from here to the buttom.
        DMPageLinkInit: " Seguimiento de iniciativa",
        'add-monster-button': "Añadir Monstruo",
        'add-player-button':"Añadir Jugador",
        'save-encounter': "Guardar Encuentro",
        'load-encounter':"Cargar Encuentro",
        conditionDMAddButton: "Añadir Condición",
        rollInitiative: "Auto Roll",
        'previous-turn-btn': "Turno anterior",
        'next-turn-btn': "Siguiente Turno",
        'request-player-stats': "Pedir Estadistica a Jugador",
    }
};



async function setLanguage(language) {
    for (const id in translations[language]) {
        const element = document.getElementById(id);
        if (element) {
            const translationText = translations[language][id];

            // Check if the first child is a text node
            if (element.firstChild.nodeType === Node.TEXT_NODE) {
                element.firstChild.textContent = translationText; // Update only the text content
            } else {
                // If no text node, add a new text node at the beginning
                element.insertBefore(document.createTextNode(translationText), element.firstChild);
            }
        }
    }
    await saveToGlobalStorage("language", "Preferred Language", language, false);
}

// Event listeners for language buttons
const languageEngButton = document.getElementById('languageEngButton');
const languageEspButton = document.getElementById('languageEspButton');

if (languageEngButton) {
    languageEngButton.addEventListener('click', async () => {
        await setLanguage('eng');
        location.reload();
    });
}

if (languageEspButton) {
    languageEspButton.addEventListener('click', async () => {
        await setLanguage('es');
        location.reload();
    });
}

//Creating an array of all singleton objects that will be used throughout this project to only read from the JSON files once.
const AppData = {
    spellLookupInfo: null,
    monsterLookupInfo:null,
    equipmentLookupInfo:null,
};



const settingsToggle = document.getElementById('settings-toggle');
const settingsContainer = document.getElementById('settings-container');

// Function to toggle settings
function toggleSettings() {
    settingsContainer.classList.toggle('active');
}

// Toggle settings on click
settingsToggle.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent click from propagating to the document
    toggleSettings();
});

// Close settings if clicked outside
document.addEventListener('click', function (e) {
    if (!settingsContainer.contains(e.target) && e.target !== settingsToggle) {
        settingsContainer.classList.remove('active');
    }
});




let clients = [];
let gmClient = null;

// Fetch GM client and store it in a global variable
async function getGMClient() {
    try {
        const myFragment = await TS.clients.whoAmI();
        const allClients = await TS.clients.getClientsInThisBoard();

        const otherClients = allClients.filter(player => player.id !== myFragment.id);

        for (const client of otherClients) {
            const clientInfo = await TS.clients.getMoreInfo([client]);

            // Check if this client is in GM mode
            if (clientInfo && clientInfo[0].clientMode === "gm") {
                gmClient = clientInfo[0]; // Store GM client in the global variable
                console.log("GM Client Found:", gmClient);
                return gmClient;
            }
        }

        // If no GM is found, reset `gmClient` to null
        gmClient = null;
        console.error("GM not found.");
        return null;
    } catch (error) {
        console.error("Error getting GM client:", error);
        gmClient = null;
        return null;
    }
}

// Fetch all clients on the board and populate the list, including GM
async function initializeClients() {
    try {
        const myFragment = await TS.clients.whoAmI();
        const allClients = await TS.clients.getClientsInThisBoard();

        // Exclude the current client
        const otherClients = allClients.filter(player => player.id !== myFragment.id);

        // Add unique clients to the global list
        otherClients.forEach(addClient);

        // Fetch the GM client
        await getGMClient();
    } catch (error) {
        console.error("Error initializing clients:", error);
    }
}


let myClientType;
// Handle events related to clients joining, leaving, or changing modes
function handleClientEvents(eventResponse) {
    let client = eventResponse.payload.client;

    TS.clients.isMe(client.id).then((isMe) => {
        switch (eventResponse.kind) {
            case "clientJoinedBoard":
                if (!isMe) {
                    addClient(client);
                }
                break;
            case "clientLeftBoard":
                if (!isMe) {
                    removeClient(client.id);
                    // If the GM client left, reset gmClient to null and re-fetch
                    if (gmClient && gmClient.id === client.id) {
                        gmClient = null;
                        console.log("GM left the board. Resetting GM client.");
                        getGMClient(); // Re-fetch GM
                    }
                }
                break;
            case "clientModeChanged":
                if (isMe) {
                    if (eventResponse.payload.clientMode === "gm") {
                        console.log("Switched to GM mode");
                        myClientType = "gm"
                        window.open("DMScreen.html");
                    } else {
                        myClientType = "player"
                        console.log("Switched to player mode");
                        window.open("PlayerCharacter.html");
                    }
                } else {
                    addClient(client);

                    // If the GM client changed mode, reset and re-fetch
                    if (gmClient && gmClient.id === client.id && eventResponse.payload.clientMode !== "gm") {
                        gmClient = null;
                        console.log("GM switched out of GM mode. Resetting GM client.");
                        getGMClient(); // Re-fetch GM
                    }
                    else{
                        getGMClient(); // Re-fetch GM
                    }
                }
                break;
            default:
                break;
        }
    }).catch((response) => {
        console.error("Error checking client identity:", response);
    });
}

// Add a client to the global list
async function addClient(client) {
    const clientExists = clients.some(existingClient => existingClient.id === client.id);
    
    if (!clientExists) {
        clients.push({ id: client.id, name: client.player.name });
        console.log(`Added client: ${client.player.name} (${client.id})`);
        console.log("Current clients:", clients);

        // Check if the new client is in GM mode
        try {
            const clientInfo = await TS.clients.getMoreInfo([client]);
            if (clientInfo && clientInfo[0].clientMode === "gm") {
                gmClient = client; // Set gmClient to the new GM
                console.log(`GM client set: ${client.player.name} (${client.id})`);
            }
        } catch (error) {
            console.error("Error checking client mode:", error);
        }
    } else {
        console.log(`Client ${client.player.name} (${client.id}) is already in the list.`);
    }
}


// Remove a client from the global list by ID
function removeClient(clientId) {
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        const removedClient = clients.splice(index, 1);
        console.log(`Removed client: ${removedClient[0].name} (${clientId})`);
        console.log("Current clients:", clients);
    } else {
        console.log(`Client with id ${clientId} not found.`);
    }
}


async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        console.log("hasIntitialized")
        //the TS Symbiote API has initialized and we can begin the setup. think of this as "init".
        onInit()
    }
}

function handleSyncClientEvents(event){
    console.log(event)
}

let contentPacks = null;

async function loadSpellDataFiles(){
    AppData.spellLookupInfo = await readSpellJson();
    console.log(AppData.spellLookupInfo)
}

async function loadEquipmentDataFiles(){
    AppData.equipmentLookupInfo = await readEquipmentJson();
    console.log(AppData.equipmentLookupInfo)
}

async function loadMonsterDataFiles(){
    AppData.monsterLookupInfo = await readMonsterJsonList();
    console.log(AppData.monsterLookupInfo)
    establishMonsterData()
}



async function onInit() {
    console.log("onInit")
    setupNav();
    
    let contentPacksFragments = await TS.contentPacks.getContentPacks();
    if (contentPacksFragments.cause != undefined) {
        console.error("error in getting asset packs", contentPacksFragments);
        return;
    }
    contentPacks = await TS.contentPacks.getMoreInfo(contentPacksFragments);
    if (contentPacks.cause !== undefined) {
        console.error("error in getting more info on asset data", contentPacks);
        return;
    }

    const languageData = await loadDataFromGlobalStorage("language");
    // Extract "Preferred Language" and validate it
    savedLanguage = languageData?.["Preferred Language"];
    if (savedLanguage !== "eng" && savedLanguage !== "es") {
        savedLanguage = "eng"; // Default to "eng" if not valid
    }

    //Initialize spell List
    await loadSpellDataFiles();
    AppData.monsterLookupInfo = await readMonsterJsonList();
    AppData.equipmentLookupInfo = await readEquipmentJson();
    await initializeClients();

    const owner = await TS.clients.whoAmI();  
    const ownerInfoArray = await TS.clients.getMoreInfo([owner.id]);
    const ownerInfo = ownerInfoArray[0];
    
    if (ownerInfo.clientMode === "gm") {
        myClientType = "gm"
        console.log("GMing is awesome");
        await getPlayersInCampaign()
        establishMonsterData()
        populateListWithAllSpells(AppData.spellLookupInfo.spellsData)
    }
    else{
        myClientType = "player"
        await playerSetUP();
        loadAndPickaCharacter()
    }
    rollableButtons();
    loadThemeSettings()
}

function parseAndReplaceDice(action, text, spell) {
    const diceRegex = /(\d+d\d+\s*(?:[+-]\s*\d+)?)|([+-]\s*\d+)/g;

    // Create a temporary container to parse the HTML and text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const container = document.createElement('span');

    // Function to find spell details by name
    function findSpellByName(spellName) {
        const spellDataArray = AppData.spellLookupInfo?.spellsData;
        if (!spellDataArray) return null;  // Handle cases where spell data is not loaded
        return spellDataArray.find(spell => spell.name.toLowerCase() === spellName.toLowerCase());
    }

    // Iterate over all child nodes in the tempDiv
    Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Process text nodes
            const parts = node.textContent.split(diceRegex).filter(part => part); // Split by dice regex

            for (const part of parts) {
                if (diceRegex.test(part)) {
                    // Handle dice replacement
                    const label = document.createElement('label');
                    label.classList.add('actionButtonLabel');
                    const diceName = action.Name !== undefined ? action.Name : (action.name || 'Unnamed Action');
                    const diceRoll = part.replace(/[()\s]/g, '');
            
                    // Extract the modifier part (+ or - with number)
                    const modifierMatch = part.match(/([+-]\s*\d+)$/);
                    const modifier = modifierMatch ? modifierMatch[0].replace(/\s+/g, '') : ''; // Remove any spaces
            
                    // Set the label value to the modifier part
                    label.setAttribute('value', modifier);
                    label.setAttribute('data-dice-type', /^\d+d\d+(\s*[+-]\s*\d+)?$/.test(diceRoll) ? diceRoll : `1d20${diceRoll}`);
                    label.setAttribute('data-name', diceName);
            
                    // Underline dice
                    const button = document.createElement('button');
                    button.classList.add('actionButton');
                    button.textContent = part;

                    // Only add context menu for non-d20 rolls
                    if (!/^\d*d20(\s*[+-]\s*\d+)?$/.test(diceRoll) && !/^[+-]\d+$/.test(diceRoll)) {
                        const contextMenu = document.createElement('div');
                        contextMenu.className = 'custom-context-menu';
                        document.body.appendChild(contextMenu);

                        button.addEventListener('contextmenu', (event) => {
                            event.preventDefault();

                            // Clear existing context menu content
                            contextMenu.innerHTML = '';

                            // Add Crit button to the context menu
                            const critButton = document.createElement('button');
                            critButton.className = 'crit-button actionButton skillbuttonstyler';

                            // Duplicate the label and text with doubled dice
                            const doubledDiceText = diceRoll.replace(/(\d+)d(\d+)/g, (match, rolls, sides) => `${rolls * 2}d${sides}`);
                            critButton.textContent = 'Crit';

                            // Duplicate the label for the Crit button
                            const critLabel = document.createElement('label');
                            critLabel.className = 'actionButtonLabel damageDiceButton';
                            critLabel.setAttribute('value', modifier);
                            critLabel.setAttribute('data-dice-type', doubledDiceText);
                            critLabel.setAttribute('data-name', diceName);

                            // Add both the Crit label and button to the context menu
                            contextMenu.appendChild(critLabel);
                            contextMenu.appendChild(critButton);

                            // Position and display the context menu
                            contextMenu.style.left = `${event.pageX}px`;
                            contextMenu.style.top = `${event.pageY}px`;
                            contextMenu.style.display = 'block';

                            rollableButtons();
                        });

                        // Hide context menu when the mouse leaves it
                        contextMenu.addEventListener('mouseleave', () => {
                            contextMenu.style.display = 'none';
                        });

                        // Hide context menu on clicking elsewhere
                        document.addEventListener('click', () => {
                            contextMenu.style.display = 'none';
                        });
                    }
            
                    container.appendChild(label);
                    container.appendChild(button);
                } else {
                    // Check for spell names within the part
                    // let remainingText = part;
                    if (spell) {
                        // Combine all spell names into a single regex pattern
                        const spellNames = AppData.spellLookupInfo?.spellsData.map(spell => spell.name).join('|');
                        const spellRegex = new RegExp(`\\b(${spellNames})\\b[.,]?`, 'gi');
                    
                        // Find all matches in the text
                        const matches = [...part.matchAll(spellRegex)];
                        let lastIndex = 0;
                    
                        // Iterate through each match
                        matches.forEach(match => {
                            const [spellName] = match; // Matched spell name
                            const spellIndex = match.index;
                    
                            // Append the text before the spell match
                            if (spellIndex > lastIndex) {
                                const beforeSpell = part.slice(lastIndex, spellIndex);
                                container.appendChild(document.createTextNode(beforeSpell));
                            }
                    
                            // Clean the matched spell name by removing trailing punctuation (e.g., commas, periods)
                            const cleanedSpellName = spellName.replace(/[.,]$/, '').toLowerCase().trim();

                            // Find the spell object by name (normalize both strings)
                            const spellData = AppData.spellLookupInfo?.spellsData.find(
                                s => s.name.toLowerCase().trim() === cleanedSpellName
                            );
                    
                            if (spellData) {
                                // Create and append the spell element
                                const spellElement = document.createElement('span');
                                spellElement.classList.add('spell-hover');
                                spellElement.style.textDecoration = 'underline';
                                spellElement.textContent = spellName;
                    
                                // Tooltip logic for spell hover
                                spellElement.addEventListener('mouseenter', () => {
                                    const tooltip = document.createElement('div');
                                    tooltip.classList.add('spell-tooltip');
                                    tooltip.setAttribute('data-desc', spellData.desc);
                                    tooltip.innerHTML = `
                                        <strong>${spellData.name}</strong><br>
                                        <strong>Level:</strong> ${spellData.level}<br>
                                        <strong>School:</strong> ${spellData.school}<br>
                                        <strong>Casting Time:</strong> ${spellData.casting_time}<br>
                                        <strong>Range:</strong> ${spellData.range}<br>
                                        <strong>Components:</strong> ${spellData.components}<br>
                                        <strong>Duration:</strong> ${spellData.duration}<br>
                                        <strong>Description:</strong> ${spellData.desc}
                                    `;
                                    document.body.appendChild(tooltip);
                    
                                    // Position tooltip dynamically
                                    const rect = spellElement.getBoundingClientRect();
                                    const spaceBelow = window.innerHeight - rect.bottom - window.scrollY;
                                    const tooltipTop = spaceBelow >= tooltip.offsetHeight + 5
                                        ? rect.bottom + window.scrollY + 5
                                        : rect.top + window.scrollY - tooltip.offsetHeight - 5;
                    
                                    tooltip.style.position = 'absolute';
                                    tooltip.style.top = `${tooltipTop}px`;
                                    tooltip.style.opacity = 0;
                                    setTimeout(() => tooltip.style.opacity = 1, 0);
                    
                                    spellElement.tooltip = tooltip;
                                });
                    
                                spellElement.addEventListener('mouseleave', () => {
                                    const tooltip = spellElement.tooltip;
                                    if (tooltip) {
                                        tooltip.style.opacity = 0;
                                        setTimeout(() => tooltip.remove(), 200);
                                    }
                                });
                    
                                container.appendChild(spellElement);
                            }
                    
                            // Update the last index to the end of the current match
                            lastIndex = spellIndex + spellName.length;
                        });
                    
                        // Append any remaining text after the last match
                        if (lastIndex < part.length) {
                            container.appendChild(document.createTextNode(part.slice(lastIndex)));
                        }
                    }
                    
                }
            }
        } else {
            // If the node is an HTML element, clone it directly
            container.appendChild(node.cloneNode(true));
        }
    });

    return container;
}




let trackedIds = {};
// Global variable to keep track of the active monster card this is used in the DM screen
let activeMonsterCard = null;

function rollableButtons() {
    const actionButtons = document.getElementsByClassName("actionButton");

    Array.from(actionButtons).forEach(button => {
        if (!button.hasRollableButtonListener) {
            button.addEventListener('click', function () {
                const label = button.previousElementSibling;

                if (label && label.classList.contains('actionButtonLabel')) {
                    let diceValue = parseInt(label.getAttribute('value'), 10);
                    const diceType = label.getAttribute('data-dice-type');
                    const diceName = label.getAttribute('data-name');

                    // Check if there are multiple dice types separated by '/'
                    const diceGroups = diceType.split('/');
                    // Split dice names by '/'
                    let diceNames = diceName.split('/');
                    
                    // Check the current advantage/disadvantage state and adjust the dice type accordingly
                    const isAdvantage = toggleContainer.querySelector("#advButton").classList.contains("active");
                    const isDisadvantage = toggleContainer.querySelector("#disadvButton").classList.contains("active");
                    
                    let type = "normal";
                    let diceExtras = [];
                    let diceRolls = []; // Array to hold all dice rolls for this spell
                    let blessRoll = ""; // For Bless or Guidance
                    let baneRoll = ""; // For Bane

                    let conditionTrackerDiv
                    let conditionsSet

                    // Get the condition map for the active monster
                    if (activeMonsterCard) {
                        // Find the condition tracker div inside the active monster card
                        conditionTrackerDiv = activeMonsterCard.querySelector('.condition-tracker');

                        // Retrieve the condition set from the conditions map for this specific monster
                        conditionsSet = conditionsMap.get(activeMonsterCard);

                        // If no conditions set exists for this monster, create an empty Set
                        if (!conditionsSet) {
                            console.log('No conditions set for this monster yet.');
                        } else {
                            console.log('Conditions for the active monster:', Array.from(conditionsSet));
                        }
                    } else {
                        const conditionTrackerDiv = document.getElementById('conditionTracker');
                        
                        if (conditionTrackerDiv) {
                            // Select all the spans inside condition pills
                            const conditionSpans = conditionTrackerDiv.querySelectorAll('.condition-pill span');

                            conditionsSet = new Set();
                            // Create a map of condition values
                            conditionSpans.forEach(span => {
                                const value = span.getAttribute('value');
                                if (value) {
                                    conditionsSet.add(value)
                                }
                            });
                            
                            if (conditionsSet.has('Exhaustion')) {
                                // Loop through condition pills to find the Exhaustion condition and extract the number
                                const exhaustionHomebrew = document.getElementById("exhaustionHomebrew")
                                if (exhaustionHomebrew.checked) {
                                    conditionSpans.forEach(span => {
                                        const conditionText = span.textContent.trim(); // Get the text of the span, e.g., "Exhaustion 1"
                                        if (conditionText.startsWith('Exhaustion')) {
                                            // Parse out the number from the text
                                            const exhaustionLevel = parseInt(conditionText.split(' ').pop(), 10); // Extract the number
                                            console.log(`Exhaustion level: ${exhaustionLevel}`);
                                    
                                            diceValue = diceValue - exhaustionLevel;

                                            console.log()
                                        }
                                    });
                                }
                            }

                        } else {
                            console.error('conditionTrackerDiv not found');
                        }
                    }
                    
                    if (diceGroups.some(group => group.includes('d20'))) {
                        if (isAdvantage) {
                            type = "advantage";
                        } else if (isDisadvantage) {
                            type = "disadvantage";
                        }

                        // Handle Bless, Guidance, and Bane separately
                        if (conditionsSet) {
                            console.log(conditionsSet)
                            if (conditionsSet.has('Bless') || conditionsSet.has('Guidance')) {
                                blessRoll = "1d4"; // Store the Bless or Guidance roll separately
                            }
                            if (conditionsSet.has('Bane')) {
                                baneRoll = "1d4"; // Store the Bane roll separately
                            }
                            
                        }
                    }

                    // Iterate through each dice group
                    diceGroups.forEach((diceGroup, index) => {
                        // Only apply the modifier to the first group
                        const modifier = (index === 0) ? diceValue : 0;
                        const diceRoll = dicePacker(diceGroup, modifier);
                        diceRolls.push({
                            name: diceNames[index] || diceName, // Use split name if available, fallback to original name
                            roll: diceRoll
                        });
                    });

                    // Pass the array of dice rolls to the roll function
                    roll(diceRolls, blessRoll, baneRoll, type);
                } else {
                    console.log("Dice Label not found");
                }
            });

            button.hasRollableButtonListener = true;
        }
    });
}

//packs dice rolls for diceRoller to roll into talespire.
function dicePacker(diceType, diceModifier) {
    let sign = "";
    if (diceModifier >= 0) {
        sign = "+";
    }
    
    const diceRoll = diceType + sign + diceModifier;
    return diceRoll;
}



function roll(diceRolls, blessRoll, baneRoll, type) {
    let typeStr = type === "advantage" ? " (Adv)" : type === "disadvantage" ? " (Disadv)" : "";
    let rolls = [];

    // Iterate over each dice roll group
    diceRolls.forEach((diceRoll) => {
        let rollName = diceRoll.name + typeStr;
        if (type === "normal") {
            rolls.push({ name: rollName, roll: diceRoll.roll });
        } else {
            rolls.push({ name: rollName, roll: diceRoll.roll }, { name: rollName, roll: diceRoll.roll });
        }
    });

    let suffix = combineBlessBane(rolls, blessRoll, baneRoll);

    // Add the suffix to the main roll names
    rolls.forEach(roll => {
        if (roll.name == "Bless" || roll.name == "Bane"){
        }
        else{
            roll.name += suffix;
        }
        
    });



    TS.dice.putDiceInTray(rolls, true).then((diceSetResponse) => {
        trackedIds[diceSetResponse] = type;
    });
}


function onRollResults(rollResults){
    console.log("rollResults")
    console.log(rollResults)
}

async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] === undefined) {
        console.log("undefined roll");
        return;
    }

    if (rollEvent.kind === "rollResults") {
        let roll = rollEvent.payload;
        let resultGroups = []; // Store all the result groups here

        let blessRollGroup = roll.resultsGroups.find(group => group.name.trim().toLowerCase() === "bless");
        let baneRollGroup = roll.resultsGroups.find(group => group.name.trim().toLowerCase() === "bane");
        
        if (roll.resultsGroups !== undefined) {
            // Determine if it's advantage or disadvantage
            let isAdvantage = trackedIds[roll.rollId] === "advantage";
            let isDisadvantage = trackedIds[roll.rollId] === "disadvantage";

            // Iterate over each group, skipping "Bless" and "Bane"
            for (let group of roll.resultsGroups) {
                // Skip "Bless" and "Bane" groups
                if (group.name.trim().toLowerCase() === "bless" || group.name.trim().toLowerCase() === "bane") continue;

                // Combine with Bless and Bane
                let combinedGroup = combineWithBlessBane({
                    name: group.name,
                    result: group.result
                }, blessRollGroup, baneRollGroup);

                resultGroups.push(combinedGroup);
            }

            // For advantage or disadvantage
            if (isAdvantage || isDisadvantage) {
                let finalResultGroup = null;
                let finalResult = isAdvantage ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;

                for (let group of resultGroups) {
                
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                
                    if (isAdvantage && groupSum > finalResult) {
                        console.log("advantage")
                        finalResult = groupSum;
                        finalResultGroup = group;
                    } else if (isDisadvantage && groupSum < finalResult) {
                        console.log("disadvantage")
                        finalResult = groupSum;
                        finalResultGroup = group;
                    }
                }
                
                // Display the best/worst roll based on advantage/disadvantage
                if (finalResultGroup) {
                    await displayResult([finalResultGroup], roll.rollId); // Send the group in an array
                }
            } 
            
            else {
                // Normal roll - check the original roll results for "Bless" and "Bane"
                if (roll.resultsGroups.length > 1 && 
                    !roll.resultsGroups.some(group => {
                        // Convert group name to lower case for case-insensitive comparison
                        let groupName = group.name.trim().toLowerCase();
                        return groupName.includes('bane') || groupName.includes('bless');
                    })) {
                    // Proceed if neither Bless nor Bane are present
                    console.log("Neither Bless nor Bane found in resultsGroups");


                    let totalValue = 0; // To accumulate the sum of all dice results
                    resultGroups.forEach((diceGroup) => {
                        // Check if the result has operands (complex operation)
                        if (diceGroup.result.operands) {
                            // Loop through each operand in the current result group
                            diceGroup.result.operands.forEach(operand => {
                                if (operand.kind && operand.results) {
                                    // It's a dice roll, sum up the results
                                    totalValue += operand.results.reduce((sum, roll) => sum + roll, 0);
                                } else if (operand.value) {
                                    // It's a static value
                                    totalValue += operand.value;
                                }
                            });
                        } else if (diceGroup.result.kind && diceGroup.result.results) {
                            // Direct dice results (simple dice rolls like d6)
                            totalValue += diceGroup.result.results.reduce((sum, roll) => sum + roll, 0);
                        }
                    });
            
                    // Create a simple result group to hold only the total value
                    let combinedResultGroup = {
                        name: 'Combined Total',
                        result: {
                            value: totalValue // Store just the total value
                        }
                    };
                    

                    resultGroups.push(combinedResultGroup)

                    await displayResult(resultGroups, roll.rollId);
                }
                
                else {
                    // Normal roll
                    console.log(resultGroups)

                    let normalGroup = resultGroups[0]; // Assuming the first group is the main roll group
                    let normalResult = await TS.dice.evaluateDiceResultsGroup(normalGroup); //This code give the total rolled value of the dice group. 

                    console.log(normalResult)
            
                    // Display the normal roll result
                    await displayResult([normalGroup], roll.rollId);
                }
                
                    
            }
            
        }
    } else if (rollEvent.kind === "rollRemoved") {
        // Handle the case when the user removes the roll
    }
}



async function displayResult(resultGroups, rollId) {

    for (const resultGroup of resultGroups) {
        console.log(resultGroup.name)
        if (resultGroup.name.trim().toLowerCase() === "initiative") {
            handleInitiativeResult(resultGroup); // Call the function for initiative results
        }
        if (resultGroup.name.trim().toLowerCase() === "hit dice") {
            
            let normalGroup = resultGroups[0]; // Assuming the first group is the main roll group
            let totalRolled = await TS.dice.evaluateDiceResultsGroup(normalGroup); //This code give the total rolled value of the dice group. 

            console.log("Total rolled amount:", totalRolled);

            removeRolledHitDice();
            healCreature(totalRolled);
        }
    }
    try {
        // Send all result groups together in one call
        await TS.dice.sendDiceResult(resultGroups, rollId);
    } catch (error) {
        console.error("Error in sending dice result:", error);
    }
}





// Helper function to add "Bless" and "Bane" rolls
function combineBlessBane(rolls, blessRoll, baneRoll) {
    let rollNames = [];

    if (blessRoll) {
        rolls.push({ name: "Bless", roll: blessRoll });
        rollNames.push("Bless");
    }

    if (baneRoll) {
        rolls.push({ name: "Bane", roll: baneRoll });
        rollNames.push("Bane");
    }

    return rollNames.length > 0 ? ` with ${rollNames.join(" and ")}` : "";
}

// Helper function to combine "Bless" and "Bane" into the result group
function combineWithBlessBane(resultGroup, blessRollGroup, baneRollGroup) {
    if (blessRollGroup) {
        resultGroup.result = {
            operator: "+",
            operands: [
                resultGroup.result,
                blessRollGroup.result
            ]
        };
    }
        

    if (baneRollGroup) {
        resultGroup.result = {
            operator: "-",
            operands: [
                resultGroup.result,
                baneRollGroup.result
            ]
        };
    }

    return resultGroup;
}




function saveToCampaignStorage(dataType, dataId, data, shouldCheck) {
    // Load the existing data from global storage
    TS.localStorage.campaign.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }

            if (dataType === "characters") {
                if (!allData[dataType]) {
                    allData[dataType] = {};
                }

                // Data doesn't exist or should not be checked, proceed to add or update
                allData[dataType][dataId] = data;

                // Save the updated data back to global storage
                TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4));
                return; // Exit the function to avoid further execution
            }

            // Check if the dataType property exists, if not, create it
            if (!allData[dataType]) {
                allData[dataType] = {};
            }

            if (shouldCheck && allData[dataType][dataId]) {
                // Data already exists, show error modal
                exists = true;
                errorModal("This already exists");
                const removeButton = document.querySelector('#removeButton');
                // Handle the button click to remove the data
                removeButton.addEventListener('click', function() {
                    removeFromGlobalStorage(dataType, dataId); // Call the remove function
                });
            } else {
                // Data doesn't exist or should not be checked, proceed to add or update
                allData[dataType][dataId] = data;

                // Save the updated data back to global storage
                TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4));

                // Display a message
                if (shouldCheck) {
                    //errorModal("Saved " + dataType); // Indicate that the data was saved or updated
                    //onInit(); // Perform any necessary initialization or updates
                }
            }
        });
}

async function saveToGlobalStorage(dataType, dataId, data, shouldCheck) {
    try {
        // Load the existing data from global storage
        const existingData = await TS.localStorage.global.getBlob();
        let allData = {};

        if (existingData) {
            allData = JSON.parse(existingData);
        }

        // Check and initialize the dataType property if not present
        if (!allData[dataType]) {
            allData[dataType] = {};
        }

        if (shouldCheck && allData[dataType][dataId]) {
            // Data already exists, show error modal
            const errorModal = document.getElementById("errorModal");
            const errorModalMessage = document.getElementById("errorModalMessage");
            const removeButton = document.getElementById("removeButton");
            const overWriteButton = document.getElementById("overWriteButton");

            // Set up the modal message and display buttons
            errorModalMessage.textContent = "This already exists. Would you like to overwrite or delete it?";
            removeButton.style.display = "inline-block";
            overWriteButton.style.display = "inline-block";

            // Show the modal
            errorModal.style.display = "block";

            // Handle the overwrite functionality
            overWriteButton.onclick = async function () {
                allData[dataType][dataId] = data;

                // Save the updated data back to global storage
                await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));

                // Optional: Indicate success
                console.log(`Overwritten data of type: ${dataType}`);

                if (dataType === "Custom Monsters"){
                    console.log("load completed.");
                    await loadMonsterDataFiles(); // Ensure this runs after save completes
                    
                }

                // Close the modal
                errorModal.style.display = "none";
               
                
            };

            // Handle the delete functionality
            removeButton.onclick = async function () {
                removeFromGlobalStorage(dataType, dataId);

                // Optional: Indicate success
                console.log(`Deleted data of type: ${dataType}`);

                // Close the modal
                errorModal.style.display = "none";
            };

            // Handle closing the modal
            const closeButton = errorModal.querySelector(".close");
            closeButton.onclick = function () {
                errorModal.style.display = "none";
            };

            // Return early to prevent saving without user confirmation
            return;
        }
        else{
            // Add or update the data if it doesn't already exist or `shouldCheck` is false
            allData[dataType][dataId] = data;

            // Save the updated data back to global storage
            await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));

            // Optional: Indicate that the data was saved successfully
            console.log(`Saved data of type: ${dataType}`);
        }

        
    } catch (error) {
        console.error("Error saving to global storage:", error);
    }
}


function getVariableSize(variable) {
    try {
        // Convert the variable to a JSON string and calculate its byte size
        const jsonString = JSON.stringify(variable);
        return new Blob([jsonString]).size; // Get the size in bytes
    } catch (error) {
        console.error("Error calculating size of variable:", error);
        return 0; // Return 0 bytes if there's an error
    }
}

let globalFileSize = 0;
// Retrieve data from global storage
function loadDataFromGlobalStorage(dataType) {
    console.log("loading Global Storage")
    return new Promise((resolve, reject) => {
        TS.localStorage.global.getBlob()
            .then((data) => {
                if (data) {
                    globalFileSize = getVariableSize(data) // Blob size in bytes
                    const allData = JSON.parse(data);
                    if (allData[dataType]) {
                        resolve(allData[dataType]);
                    } else {
                        resolve({});
                    }
                } else {
                    resolve({});
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}





let localFileSize = 0
// Retrieve data from global storage
function loadDataFromCampaignStorage(dataType) {
    console.log("loading Campaign Storage")
    return new Promise((resolve, reject) => {
        TS.localStorage.campaign.getBlob()
            .then((data) => {
                if (data) {
                    localFileSize = getVariableSize(data); // Blob size in bytes
                    console.log(`Campaign file size: ${localFileSize} bytes`);
                    const allData = JSON.parse(data);
                    if (allData[dataType]) {
                        resolve(allData[dataType]);
                    } else {
                        resolve({});
                    }
                } else {
                    resolve({});
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

//Error Modal that will display any and all errors that happen when the user does something that they shouldn't like putting incorrect dice into a dice only input.
function showErrorModal(errorMessage, delayTimer = 2000) {
    const modal = document.getElementById('errorModal');
    const modalMessage = document.getElementById('errorModalMessage');
    const closeButton = document.querySelector('#errorModal .close');

    // Set the error message
    modalMessage.innerHTML = errorMessage;
    modal.style.display = 'block';

    // Add click listener to close button
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Automatically hide modal after the specified delay
    setTimeout(() => {
        modal.style.display = 'none';
    }, delayTimer);
}






// Delete data from global storage
function removeFromGlobalStorage(dataType, dataId, showError = false) {
    return TS.localStorage.global.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }
            if (allData[dataType]) {
                if (allData[dataType][dataId]) {
                    delete allData[dataType][dataId]; // Attempt to delete

                    // Save the updated data back to global storage
                    return TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4))
                        .then(() => {
                            console.log("Updated data saved to global storage:", allData);
                            if(!showError === true){
                                errorModal('Data deleted from global storage');
                            }
                        })
                        .catch((error) => {
                            errorModal('Failed to save data to global storage: ' + error);
                        });
                } else {
                    errorModal('DataId not found in global storage: ' + dataId);
                }
            } else {
                errorModal('DataType not found in global storage');
            }
        })
        .catch((error) => {
            errorModal('Failed to delete data from global storage: ' + error);
        });
}


function removeFromCampaignStorage(dataType, dataId) {
    return TS.localStorage.campaign.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }
            if (allData[dataType]) {
                if (allData[dataType][dataId]) {
                    delete allData[dataType][dataId]; // Attempt to delete

                    // Save the updated data back to global storage
                    return TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4))
                        .then(() => {
                            console.log("Updated data saved to campaign storage:", allData);
                            errorModal('Data deleted from campaign storage');
                        })
                        .catch((error) => {
                            errorModal('Failed to save data to campaign storage: ' + error);
                        });
                } else {
                    errorModal('DataId not found in campaign storage: ' + dataId);
                }
            } else {
                errorModal('DataType not found in campaign storage');
            }
        })
        .catch((error) => {
            errorModal('Failed to delete data from campaign storage: ' + error);
        });
}







let exists = false
function errorModal(modalText){
    const errorModal = document.getElementById('errorModal');
    const closeModal = errorModal.querySelector('.close');
    const overWriteButton = errorModal.querySelector('#overWriteButton');
    const removeButton = errorModal.querySelector('#removeButton');
    const modalContent = errorModal.querySelector('.modal-content p')

    modalContent.textContent = modalText;

    errorModal.style.display = 'block';

    // Close the error modal
    closeModal.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });
    
    if(exists === true){
        // Show the "Remove Monster" button
        removeButton.style.display = 'block';
        overWriteButton.style.display = 'block';
    }
    else{
        removeButton.style.display = 'none';
        overWriteButton.style.display = 'none';
    }

    exists = false; // Reset the global variable
}





// read the JSON file spells.json and save the data and names to variables
async function readSpellJson() {
    try {
        const allSpellData = await loadDataFromGlobalStorage("Custom Spells"); // Load data from global storage
        console.log(allSpellData)
        const isGlobalDataAnObject = typeof allSpellData === 'object';

        

        // Fetch the data from the JSON file
        const response = await fetch(`spells-${savedLanguage}.json`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const spellsData = await response.json();

        let combinedData;

        if (isGlobalDataAnObject) {
            // If global data is an object, convert it into an array
            combinedData = Object.values(allSpellData);
        } else {
            // If global data is already an array, use it as is
            combinedData = allSpellData;
        }

        // Combine the data from global storage and the JSON file
        combinedData = [...combinedData, ...spellsData];

        // Extract spell names from the combined data
        const spellNames = combinedData.map(spell => spell.name);
        console.log('returning from readSpellJSON');

        return {
            spellNames: spellNames,
            spellsData: combinedData
        };
        
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

async function readMonsterJsonList() {
    try {

        // Fetch the data from the JSON file
        const response = await fetch(`Monster_Manual-${savedLanguage}.json`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const monsterData = await response.json();
        const allCreatureData = (await loadDataFromGlobalStorage("Custom Monsters"));

        // Combine the data from global storage and the JSON file
        const combinedData = {
            ...allCreatureData,
            ...monsterData
        };

        // Extract monster names from the combined data
        const monsterNames = Object.keys(combinedData);

        // Log and return the data
        return {
            monsterNames: monsterNames,
            monsterData: combinedData
        };
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }     
}


// read the JSON file equipment.json and save the data and names to variables
// this function also get's all equipment saved to the global storage and creates one object out of both set's of information. 
// this is done to allow the system to quickly access all the data in one place rather than fetching it everytime. 
// any time new equipment is called this will need to be updated to include all the new items. 
async function readEquipmentJson() {
    try {
        // Load data from global storage
        const allequipmentData = await loadDataFromGlobalStorage("Custom Equipment"); 
        const isGlobalDataAnObject = typeof allequipmentData === 'object';

        // Fetch the data from the JSON file
        const response = await fetch(`equipment-${savedLanguage}.json`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const equipmentData = await response.json();

        let combinedData;

        // If global data is an object, convert it into an array
        if (isGlobalDataAnObject) {
            combinedData = Object.values(allequipmentData);
        } else {
            combinedData = allequipmentData || [];
        }

        // Combine the data from global storage and the JSON file
        combinedData = [...combinedData, ...equipmentData];

        // Set the combined data to AppData.equipmentLookupInfo
        AppData.equipmentLookupInfo = combinedData;

        // Extract equipment names (if needed)
        const equipmentNames = combinedData.map(item => item.name);

        // Optionally return combined data and equipment names
        return {
            equipmentNames: equipmentNames,
            equipmentData: combinedData
        };

    } catch (error) {
        console.error('Error loading equipment data:', error);
        return null;
    }
}

document.getElementById('settings-button').addEventListener('click', function () {
    const dropdown = document.getElementById('settings-option-dropdown');
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
});

document.getElementById('settings-button').addEventListener('blur', function () {
    const dropdown = document.getElementById('settings-option-dropdown');
    hideDropdownTimeout = setTimeout(function () {
        if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
        }
    }, 300); // Delay in milliseconds (e.g., 300ms)
});






// Element references
const themeModal = document.getElementById("themeModal");
const openModalBtn = document.getElementById("openModal");
const closeModalBtn = document.getElementById("closeModal");
const themeButtons = document.querySelectorAll(".theme-button");
const customThemeSettings = document.getElementById("customThemeSettings");
const primaryColorPicker = document.getElementById("primaryColor");
const secondaryColorPicker = document.getElementById("secondaryColor");
const applyCustomThemeBtn = document.getElementById("applyCustomTheme");

// Open and close modal
openModalBtn.addEventListener("click", () => {
  themeModal.classList.add("show");
});

closeModalBtn.addEventListener("click", () => {
  themeModal.classList.remove("show");
});

// Apply theme
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const theme = button.dataset.theme;

    // Toggle custom theme settings
    if (theme === "custom-theme") {
      customThemeSettings.style.display = "flex";
    } else {
      customThemeSettings.style.display = "none";
      document.documentElement.className = theme; // Apply theme by class name
      saveThemeSettings(theme, null, null); // Save the settings
    }
  });
});



// Apply custom theme
// Add event listeners to the HEX input fields
document.querySelectorAll('.hex-input').forEach((input) => {
    input.addEventListener('input', (event) => {
        const value = event.target.value.trim();
        const previewId = event.target.id + "Preview";
        const previewElement = document.getElementById(previewId);

        // Validate HEX color code
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            previewElement.style.backgroundColor = value; // Update preview color
        } else {
            previewElement.style.backgroundColor = "transparent"; // Invalid HEX
        }
    });
});

// Apply custom theme button
applyCustomThemeBtn.addEventListener("click", () => {
    const primaryColor = primaryColorPicker.value.trim();
    const secondaryColor = secondaryColorPicker.value.trim();
  
    if (/^#[0-9A-Fa-f]{6}$/.test(primaryColor) && /^#[0-9A-Fa-f]{6}$/.test(secondaryColor)) {
      // Find the custom theme's CSS rule
        const stylesheet = Array.from(document.styleSheets).find(sheet =>
            sheet.href && sheet.href.includes("styleShared.css")
        );

        console.log("Targeted Stylesheet:", stylesheet);
  
        if (stylesheet) {
            const rules = Array.from(stylesheet.cssRules).find(rule =>
            rule.selectorText === ".alternate-theme-custom"
            );
    
            if (rules) {
            rules.style.setProperty("--border-outline-color", primaryColor);
            rules.style.setProperty("--button-color-hover", lightenHexColor(primaryColor, 20));
            rules.style.setProperty("--action-button-color", secondaryColor);
            rules.style.setProperty("--action-button-color-hover", lightenHexColor(secondaryColor, 20));
            }
        }
    
        alert("Custom theme applied!");
        document.documentElement.className = "alternate-theme-custom"; // Apply custom theme class
        saveThemeSettings("alternate-theme-custom", primaryColor, secondaryColor); // Save the settings
    } else {
      errorModal("Please enter valid HEX color codes for both fields.");
    }
    
});

// Function to lighten a HEX color
function lightenHexColor(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const r = Math.min(255, (num >> 16) + amt);
    const g = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const b = Math.min(255, (num & 0x0000ff) + amt);
    return `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}


async function saveThemeSettings(theme, primaryColor, secondaryColor) {
    const themeData = {
        selectedTheme: theme,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
    };

    try {
        // Replace with your global storage function
        await saveToGlobalStorage("ThemeSettings", "UserTheme", themeData, false);
        console.log("Theme settings saved:", themeData);
    } catch (error) {
        console.error("Error saving theme settings:", error);
    }
}



async function loadThemeSettings() {
    try {
        // Replace with your global storage retrieval function
        const themeData = await loadDataFromGlobalStorage("ThemeSettings");

        console.log(themeData)

        if (themeData) {
            const { selectedTheme, primaryColor, secondaryColor } = themeData.UserTheme;

            if (selectedTheme === "alternate-theme-custom" && primaryColor && secondaryColor) {
                // Apply custom theme
                const stylesheet = Array.from(document.styleSheets).find(sheet =>
                    sheet.href && sheet.href.includes("styleShared.css")
                );

                if (stylesheet) {
                    const rules = Array.from(stylesheet.cssRules).find(rule =>
                        rule.selectorText === ".alternate-theme-custom"
                    );

                    if (rules) {
                        rules.style.setProperty("--border-outline-color", primaryColor);
                        rules.style.setProperty("--button-color-hover", lightenHexColor(primaryColor, 20));
                        rules.style.setProperty("--action-button-color", secondaryColor);
                        rules.style.setProperty("--action-button-color-hover", lightenHexColor(secondaryColor, 20));
                    }
                }

                document.documentElement.className = "alternate-theme-custom";
                primaryColorPicker.value = primaryColor; // Update input field
                secondaryColorPicker.value = secondaryColor;
            } else if (selectedTheme) {
                // Apply preset theme
                document.documentElement.className = selectedTheme;
            }
        }
    } catch (error) {
        console.error("Error loading theme settings:", error);
    }
}








const openHomebrewButton = document.getElementById('openHomebrew');
const homebrewModal = document.getElementById("homebrewModal");
const closehomebrewModalButton = document.getElementById('close-homebrew-modal-button');
  
// Open the form
openHomebrewButton.addEventListener('click', () => {
    homebrewModal.style.display = 'block';
    updateStorageUsage()
    console.log(myClientType)
    if (myClientType === "gm"){
        loadAndDisplayCustomMonsters()
    }
    if (myClientType === "player"){
        loadAndDisplayCustomSpells()
        loadAndDisplayCustomItems()
        loadAndDisplayCharaceter()
    }
    
});

// Close the form
closehomebrewModalButton.addEventListener('click', () => {
    homebrewModal.style.display = 'none';
});

async function updateStorageUsage() {
    const totalQuotaKB = 5120; // 5MB in KB

    // Fetch local storage usage (Assuming localFileSize is already defined elsewhere)
    const localStorageSize = localFileSize;
    const localStorageUsageKB = (localStorageSize / 1024).toFixed(2);

    // Fetch global storage usage (Assuming globalFileSize is already defined elsewhere)
    const globalStorageSize = globalFileSize;
    const globalStorageUsageKB = (globalStorageSize / 1024).toFixed(2);

    // Update Local Storage progress bar and text
    const localStorageProgress = document.getElementById("localStorageProgress");
    const localStorageUsageText = document.getElementById("localStorageUsageText");
    const localStoragePercentage = ((localStorageUsageKB / totalQuotaKB) * 100).toFixed(2);
    localStorageProgress.style.width = `${localStoragePercentage}%`; // Update the width to reflect the usage
    localStorageUsageText.textContent = `${localStorageUsageKB} KB / ${totalQuotaKB} KB`;

    // Update Global Storage progress bar and text
    const globalStorageProgress = document.getElementById("globalStorageProgress");
    const globalStorageUsageText = document.getElementById("globalStorageUsageText");
    const globalStoragePercentage = ((globalStorageUsageKB / totalQuotaKB) * 100).toFixed(2);
    globalStorageProgress.style.width = `${globalStoragePercentage}%`; // Update the width to reflect the usage
    globalStorageUsageText.textContent = `${globalStorageUsageKB} KB / ${totalQuotaKB} KB`;
}





function loadAndDisplayCustomSpells() {
    loadDataFromGlobalStorage("Custom Spells")
        .then((spells) => {
            const spellSelect = document.getElementById("customSpellSelect");
            spellSelect.innerHTML = ""; // Clear existing options

            // Populate dropdown with monster names
            for (const monsterName in spells) {
                const option = document.createElement("option");
                option.value = monsterName;
                option.textContent = monsterName;
                spellSelect.appendChild(option);
            }

            // If no monsters exist, disable the dropdown and delete button
            if (Object.keys(spells).length === 0) {
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.textContent = "No spells available";
                spellSelect.appendChild(placeholderOption);
                spellSelect.disabled = true;
                document.getElementById("deleteCustomSpells").disabled = true;
            } else {
                spellSelect.disabled = false;
                document.getElementById("deleteCustomSpells").disabled = false;
            }
        })
        .catch((error) => {
            console.error("Failed to load custom spells:", error);
        });
}


function loadAndDisplayCustomMonsters() {
    loadDataFromGlobalStorage("Custom Monsters")
        .then((monsters) => {
            const monsterSelect = document.getElementById("customMonsterSelect");
            monsterSelect.innerHTML = ""; // Clear existing options

            // Populate dropdown with monster names
            for (const monsterName in monsters) {
                const option = document.createElement("option");
                option.value = monsterName;
                option.textContent = monsterName;
                monsterSelect.appendChild(option);
            }

            // If no monsters exist, disable the dropdown and delete button
            if (Object.keys(monsters).length === 0) {
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.textContent = "No monsters available";
                monsterSelect.appendChild(placeholderOption);
                monsterSelect.disabled = true;
                document.getElementById("deleteCustomMonsters").disabled = true;
            } else {
                monsterSelect.disabled = false;
                document.getElementById("deleteCustomMonsters").disabled = false;
            }
        })
        .catch((error) => {
            console.error("Failed to load custom monsters:", error);
        });
}

function loadAndDisplayCustomItems() {
    loadDataFromGlobalStorage("Custom Equipment")
        .then((items) => {
            const itemSelect = document.getElementById("customItemSelect");
            itemSelect.innerHTML = ""; // Clear existing options

            // Populate dropdown with items names
            for (const itemName in items) {
                const option = document.createElement("option");
                option.value = itemName;
                option.textContent = itemName;
                itemSelect.appendChild(option);
            }

            // If no items exist, disable the dropdown and delete button
            if (Object.keys(items).length === 0) {
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.textContent = "No items available";
                itemSelect.appendChild(placeholderOption);
                itemSelect.disabled = true;
                document.getElementById("deleteCustomItems").disabled = true;
            } else {
                itemSelect.disabled = false;
                document.getElementById("deleteCustomItems").disabled = false;
            }
        })
        .catch((error) => {
            console.error("Failed to load custom items:", error);
        });
}





const customSpellsButton = document.getElementById('customSpells');
const spellFormModal = document.getElementById('spellFormModal');
const spellForm = document.getElementById('spellForm');
const saveSpellButton = document.getElementById('saveSpell');
const closeSpellFormButton = document.getElementById('closeSpellForm');
let spells = []; // Store created spells

//This if stops the whole sheet from erroring out when hidden for the DM side of things. 
if(customSpellsButton){
    // Open the form
    customSpellsButton.addEventListener('click', () => {
        loadAndDisplayCustomSpells()
        resetSpellForm()
        spellFormModal.style.display = 'block';
        homebrewModal.style.display = 'none';
    });
    
    // Close the form
    closeSpellFormButton.addEventListener('click', () => {
        spellFormModal.style.display = 'none';
    });

    document.getElementById("deleteCustomSpells").addEventListener("click", async() => {
        const spellSelect = document.getElementById("customSpellSelect");
        const selectedSpell = spellSelect.value;
    
        console.log(selectedSpell)
    
        if (selectedSpell) {
            removeFromGlobalStorage("Custom Spells", selectedSpell)
                .then(() => {
                    console.log(`Spell "${selectedSpell}" deleted successfully.`);
                    loadAndDisplayCustomSpells(); // Reload the list of spells
                })
                .catch((error) => {
                    console.error("Failed to delete spell:", error);
                });
                await loadSpellDataFiles()
        } else {
            errorModal("No spell selected for deletion.");
        }
    });
    
    
    document.getElementById("editCustomSpells").addEventListener("click", async() => {
        const spellSelect = document.getElementById("customSpellSelect");
        const selectedSpell = spellSelect.value;
    
        if (selectedSpell) {
            // Fetch spell data from global storage
            loadDataFromGlobalStorage("Custom Spells")
                .then((spells) => {
                    const spellData = spells[selectedSpell];
                    if (spellData) {
                        // Populate the edit form or interface with the spell's data
                        spellFormModal.style.display = 'block';
                        homebrewModal.style.display = 'none';
                        populateSpellForm(spellData);
                    } else {
                        errorModal(`Spell "${selectedSpell}" data not found.`);
                    }
                })
                .catch((error) => {
                    console.error("Failed to load spell data for editing:", error);
                });
        } else {
            errorModal("No spell selected for editing.");
        }
    });
}


// Attach event listeners to specific elements
document.getElementById('damageDiceForm').addEventListener('blur', validateDiceInput);
document.getElementById('damageDiceUpcastForm').addEventListener('blur', validateDiceInput);

document.getElementById('toHitOrDC').addEventListener('change', function () {
    const toHitOrDCValue = this.value; // Get the value of the first dropdown
    const saveDCTypeSelect = document.getElementById('saveDCType');

    // Clear all options first
    saveDCTypeSelect.innerHTML = '';

    if (toHitOrDCValue === 'DC') {
        // Add all options for DC
        saveDCTypeSelect.innerHTML = `
            <option value="str">Strength (STR)</option>
            <option value="dex">Dexterity (DEX)</option>
            <option value="con">Constitution (CON)</option>
            <option value="int">Intelligence (INT)</option>
            <option value="wis">Wisdom (WIS)</option>
            <option value="cha">Charisma (CHA)</option>
        `;
    } else {
        // Add only the N/A option if not DC
        saveDCTypeSelect.innerHTML = `<option value="">N/A</option>`;
    }

    // Reset to N/A as default
    saveDCTypeSelect.selectedIndex = 0;
});


// Save the spell
saveSpellButton.addEventListener('click', async () => {
    const spellForm = document.getElementById('spellForm');
    const selectedClasses = Array.from(document.querySelectorAll('#spellFormClass input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value)
        .join(', ');

    const selectedComponents = Array.from(document.querySelectorAll('#spellFormComponents input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value)
        .join(', ');

    const spell = {
        name: document.getElementById('spellFormName').value.trim() || 'Unnamed Spell',
        desc: document.getElementById('spellFormDesc').value.trim() || 'No description provided.',
        higher_level: document.getElementById('higherLevelForm').value.trim(),
        material: document.getElementById("spellFormMaterials").value.trim(),
        range: document.getElementById('spellFormRange').value.trim(),
        components: selectedComponents,
        ritual: document.getElementById('ritualForm').checked ? ", R" : "",
        duration: document.getElementById('spellFormDuration').value.trim(),
        concentration: document.getElementById('concentrationForm').checked ? "yes" : "no",
        casting_time: document.getElementById('castingTimeForm').value.trim(),
        level: document.getElementById('spellFormLevel').value,
        school: document.getElementById('schoolForm').value.trim(),
        class: selectedClasses,
        toHitOrDC: document.getElementById('toHitOrDC').value.trim(),
        damage_dice: document.getElementById('damageDiceForm').value.trim(),
        damage_dice_upcast: document.getElementById('damageDiceUpcastForm').value.trim(),
        spell_save_dc_type: document.getElementById('saveDCType').value.trim(),
        ability_modifier: document.getElementById('abilityModifier').value.trim(),
        damage_type_01: document.getElementById('spellDamageType01').value.trim()
    };

    spells.push(spell); // Add spell to the array
    console.log(spells); // Log the spells for debugging

    try {
        // Save and wait for completion
        await saveToGlobalStorage("Custom Spells", spell.name, spell, true);
        console.log("Save completed.");
        await loadSpellDataFiles(); // Ensure this runs after save completes
    } catch (error) {
        console.error("Error during save or load:", error);
    }

    spellFormModal.style.display = 'none'; // Close the form
    spellForm.reset(); // Reset the form
});

// Function to populate a dropdown with damage types
function populateDamageTypeDropdown(selectElement) {
    // Clear existing options
    selectElement.innerHTML = "";

    // Populate options dynamically from the damageTypes array
    damageTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        selectElement.appendChild(option);
    });
}

document.querySelectorAll('select[id^="spellDamageType01"]').forEach(selectElement => {
    populateDamageTypeDropdown(selectElement);
});

function validateDiceInput(event) {
    const newValue = event.target.value.trim();

    const dicePattern = /^(\d+d(4|6|8|10|12|20))([+/]\d+d(4|6|8|10|12|20))*$/;

    if (newValue && !dicePattern.test(newValue)) {
        showErrorModal(`Invalid input: "${newValue}". Please enter a valid dice format like '4d4+5d6'.`);
        event.target.value = ''; // Clear invalid input
    }
}


function populateSpellForm(spell) {
    // Spell Name
    document.getElementById("spellFormName").value = spell.name || "";

    // Spell Description
    document.getElementById("spellFormDesc").value = spell.desc || "";

    // Higher Level Casting Description
    document.getElementById("higherLevelForm").value = spell.higher_level || "";

    // Spell Range
    document.getElementById("spellFormRange").value = spell.range || "";

    // Spell Components
    document.getElementById("componentVerbal").checked = spell.components.includes("V");
    document.getElementById("componentSomatic").checked = spell.components.includes("S");
    document.getElementById("componentMaterial").checked = spell.components.includes("M");

    // Spell Materials
    document.getElementById("spellFormMaterials").value = spell.material || "";

    // Ritual
    document.getElementById("ritualForm").value = spell.ritual || "";

    // Duration
    document.getElementById("spellFormDuration").value = spell.duration || "Instantaneous";

    // Concentration
    document.getElementById("concentrationForm").value = spell.concentration || "no";

    // Casting Time
    document.getElementById("castingTimeForm").value = spell.casting_time || "1A";

    // Spell Level
    document.getElementById("spellFormLevel").value = spell.level || "Cantrip";

    // Spell School
    document.getElementById("schoolForm").value = spell.school || "Abjuration";

    // Spell Classes
    const spellClasses = spell.class ? spell.class.split(", ").map(cls => cls.trim()) : [];
    const allClassCheckboxes = document.querySelectorAll("#spellFormClass input[type=checkbox]");
    allClassCheckboxes.forEach(checkbox => {
        checkbox.checked = spellClasses.includes(checkbox.value);
    });

    // Populate To Hit or DC
    document.getElementById('toHitOrDC').value = spell.toHitOrDC || '';
    console.log(document.getElementById('toHitOrDC'))

    // Populate Damage Dice
    document.getElementById('damageDiceForm').value = spell.damage_dice || '';

    // Populate Damage Dice (Upcast)
    document.getElementById('damageDiceUpcastForm').value = spell.damage_dice_upcast || '';

    // Populate Save DC Type
    const saveDCTypeSelect = document.getElementById('saveDCType');
    const dcTypes = ['str', 'dex', 'con', 'int', 'wis', 'cha']; // Common DC attributes
    saveDCTypeSelect.innerHTML = `<option value="">N/A</option>`; // Default option
    dcTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.toUpperCase();
        if (type === spell.spell_save_dc_type) {
            option.selected = true;
        }
        saveDCTypeSelect.appendChild(option);
    });

    // Populate Ability Modifier
    const abilityModifierSelect = document.getElementById('abilityModifier');
    abilityModifierSelect.value = spell.ability_modifier || 'no';
}


function resetSpellForm() {
    // Clear all input fields
    const inputs = spellForm.querySelectorAll("input");
    inputs.forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false; // Uncheck checkboxes and radio buttons
        } else {
            input.value = ""; // Clear text fields
        }
    });

    // Clear all textareas
    const textareas = spellForm.querySelectorAll("textarea");
    textareas.forEach(textarea => {
        textarea.value = ""; // Clear text areas
    });

    // Reset all dropdowns (select elements)
    const selects = spellForm.querySelectorAll("select");
    selects.forEach(select => {
        select.selectedIndex = 0; // Reset to the first option
    });
}







const customItemsButton = document.getElementById('customItems');
const itemForm = document.getElementById("itemForm");
const itemFormModal = document.getElementById('itemFormModal');
const closeItemFormButton = document.getElementById('closeItemForm');
let items = []; // Store created spells

// Open the form


//This if stops the whole sheet from erroring out when hidden for the DM side of things. 
if(customItemsButton){
    customItemsButton.addEventListener('click', () => {
        updateDynamicFields("weapon")
        loadAndDisplayCustomItems()
        homebrewModal.style.display = 'none';
        itemFormModal.style.display = 'block';
    });
    
    // Close the form
    closeItemFormButton.addEventListener('click', () => {
        itemFormModal.style.display = 'none';
    });

    const categorySelect = document.getElementById("equipment-category");
    const additionalFields = document.getElementById("additional-fields");
    
    // Update dynamic fields based on category
    categorySelect.addEventListener("change", () => {
        const category = categorySelect.value;
        updateDynamicFields(category);
    });

    // Form submission handler
    itemForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const equipmentData = gatherFormData();
        console.log("%cGenerated Equipment:", "color: red; font-weight: bold;");
        console.log(equipmentData);
        saveCustomEquipment(equipmentData)
    });

    //Event listener for the delete button
    document.getElementById("deleteCustomItems").addEventListener("click", async() => {
        const itemSelect = document.getElementById("customItemSelect");
        const selectedItem = itemSelect.value;

        console.log(selectedItem)

        if (selectedItem) {
            removeFromGlobalStorage("Custom Equipment", selectedItem)
                .then(() => {
                    console.log(`Item: "${selectedItem}" deleted successfully.`);
                    loadAndDisplayCustomItems(); // Reload the list of items
                })
                .catch((error) => {
                    console.error("Failed to delete item:", error);
                });
                await loadEquipmentDataFiles()
        } else {
            errorModal("No item selected for deletion.");
        }
    });
}






async function saveCustomEquipment(equipmentData){
    try {
        // Save and wait for completion
        await saveToGlobalStorage("Custom Equipment", equipmentData.name, equipmentData, true);
        console.log("Save completed.");
        await loadEquipmentDataFiles(); // Ensure this runs after save completes
    } catch (error) {
        console.error("Error during save or load:", error);
    }

    itemFormModal.style.display = 'none'; // Close the form
    itemForm.reset(); // Reset the form
}


// Function to update dynamic fields
function updateDynamicFields(category) {
const additionalFields = document.getElementById("additional-fields");
additionalFields.innerHTML = ""; // Clear existing fields

let magicBonusSection = `
        <button type="button" id="add-magic-bonus" class="nonRollButton">Add Magic Bonus</button>
        <div>
            <label for="magic-bonuses">Magic Bonuses:</label>
            <div id="magic-bonus-container"></div>
        </div>
    `;

    if (category === "weapon") {
        additionalFields.innerHTML = `
            <div class="form-row">
                <label for="weapon-category">Weapon Type:</label>
                <select id="weapon-category">
                    <option value="simple">Simple</option>
                    <option value="martial">Martial</option>
                </select>
            </div>

            <div id="weapon-configurator" class="form-row">
                <label for="attack-style">Attack Style:</label>
                <select id="attack-style">
                    <option value="Melee">Melee</option>
                    <option value="Ranged">Ranged</option>
                    <option value="Melee-thrown">Melee and Thrown</option>
                </select>
                <div id="range-inputs">
                    <label for="melee-range" class="range-label">Range:</label>
                    <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
                </div>
            </div>

            <div class="form-row">
                <label for="weaponProperties">Weapon Properties:</label>
                <div id="weaponProperties">
                    <label>
                        <input type="checkbox" id="propertyFinesse" name="property" value="Finesse">
                        <span id="labelFinesse">Finesse</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyVersatile" name="property" value="Versatile">
                        <span id="labelVersatile">Versatile</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyHeavy" name="property" value="Heavy">
                        <span id="labelHeavy">Heavy</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyLight" name="property" value="Light">
                        <span id="labelLight">Light</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyLoading" name="property" value="Loading">
                        <span id="labelLoading">Loading</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyReach" name="property" value="Reach">
                        <span id="labelReach">Reach</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyThrown" name="property" value="Thrown">
                        <span id="labelThrown">Thrown</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyTwoHanded" name="property" value="Two-Handed">
                        <span id="labelTwoHanded">Two-Handed</span>
                    </label>
                     <label>
                        <input type="checkbox" id="propertySilvered" name="property" value="Silvered">
                        <span id="labelSilvered">Silvered</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertySpecial" name="property" value="Special">
                        <span id="labelSpecial">Special</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyAmmunition" name="property" value="Ammunition">
                        <span id="labelAmmunition">Ammunition</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyImprovised" name="property" value="Improvised">
                        <span id="labelImprovised">Improvised</span>
                    </label>
                    <label>
                        <input type="checkbox" id="itemFormAttunement" name="property" value="attunement">
                        <span id="attunement">Attunement</span>
                    </label>
                    <label>
                        <input type="checkbox" id="has-charges" name="property" value="Has Charges">
                        <span id="has-charges">Has Charges</span>
                    </label>
                </div>
            </div>
    
            <div class="form-row">
                <label for="damage-dice">Damage Dice:</label>
                <input type="text" id="damage-dice" placeholder="e.g., 1d8" />
            </div>
            
            <div class="form-row">
                <label for="damage-type">Damage Type:</label>
                <select id="damage-type">
                    ${damageTypes.map(type => `<option value="${type}">${type}</option>`).join("")}
                </select>
            </div>
    
            <div id="charges-options" style="display: none; margin-left: 20px;">
                <div class="form-row">
                    <label for="charge-reset">When does it reset?</label>
                    <select id="charge-reset">
                        <option value="long-rest">Long Rest</option>
                        <option value="short-rest">Short Rest</option>
                        <option value="at-dawn">At Dawn</option>
                    </select>
                </div>

                <div class="form-row">
                    <label for="max-charges">Maximum Charges:</label>
                    <input type="number" id="max-charges" placeholder="e.g., 3" min="1"/>
                </div>
            </div>

            <div class="form-row">
                <label for="weapon-to-hit-bonus">Magical to Hit Bonus:</label>
                <input type="number" id="weapon-to-hit-bonus" placeholder="e.g., 1"/>
            </div>

            <div class="form-row">
                <label for="weapon-damage-bonus">Magical Damage Bonus</label>
                <input type="number" id="weapon-damage-bonus" placeholder="e.g., 1"/>
            </div>

            ${magicBonusSection}
        `;
        // JavaScript logic to toggle visibility
        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");

        hasChargesCheckbox.addEventListener("change", () => {
            if (hasChargesCheckbox.checked) {
                chargesOptions.style.display = "block";
            } else {
                chargesOptions.style.display = "none";
            }
        });

        document.getElementById('attack-style').addEventListener('change', function () {
            const attackStyle = this.value;
            const rangeInputs = document.getElementById('range-inputs');
          
            // Clear existing inputs
            rangeInputs.innerHTML = '';
          
            // Generate inputs based on the selected attack style
            if (attackStyle === 'Melee') {
              rangeInputs.innerHTML = `
                <label for="melee-range" class="range-label">Range:</label>
                <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
              `;
            } else if (attackStyle === 'Ranged') {
              rangeInputs.innerHTML = `
                <label for="short-range" class="range-label">Short Range:</label>
                <input type="number" id="short-range" class="range-input" name="short-range" placeholder="e.g., 30" />
                <label for="long-range" class="range-label">Long Range:</label>
                <input type="number" id="long-range" class="range-input" name="long-range" placeholder="e.g., 120" />
              `;
            } else if (attackStyle === 'Melee-thrown') {
              rangeInputs.innerHTML = `
                <label for="melee-range" class="range-label">Melee Range:</label>
                <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
                <label for="short-range" class="range-label">Short Range:</label>
                <input type="number" id="short-range" class="range-input" name="short-range" placeholder="e.g., 20" />
                <label for="long-range" class="range-label">Long Range:</label>
                <input type="number" id="long-range" class="range-input" name="long-range" placeholder="e.g., 60" />
              `;
            }
          });
          setupMagicBonusSelection();
    } else if (category === "armor") {
        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="armor-category">Armor Type:</label>
            <select id="armor-category">
                <option value="Light">Light</option>
                <option value="Medium">Medium</option>
                <option value="Heavy">Heavy</option>
                <option value="Shield">Shield</option>
            </select>
        </div>
        
        <div class="form-row">
            <label for="armor-class">Base Armor Class:</label>
            <input type="number" id="armor-class" placeholder="e.g., 15" />
        </div>
        
        <div class="form-row">
            <label for="str-minimum">Strength Requirement:</label>
            <input type="number" id="str-minimum" placeholder="e.g., 15" />
        </div>
        
        <div class="form-row">
            <label for="stealth-disadvantage">Stealth Disadvantage:</label>
            <input type="checkbox" id="stealth-disadvantage" />
            <label for="itemFormAttunement">Requires Attunement:</label>
            <input type="checkbox" id="itemFormAttunement" />
            <label for="has-charges">Has Charges</label>
            <input type="checkbox" id="has-charges" />
        </div>
    
        <div id="charges-options" style="display: none; margin-left: 20px;">
            <div class="form-row">
                <label for="charge-reset">When does it reset?</label>
                <select id="charge-reset">
                    <option value="long-rest">Long Rest</option>
                    <option value="short-rest">Short Rest</option>
                    <option value="at-dawn">At Dawn</option>
                </select>
            </div>
            <div class="form-row">
                <label for="max-charges">Maximum Charges:</label>
                <input type="number" id="max-charges" placeholder="e.g., 3" min="1" />
            </div>
        </div>
        ${magicBonusSection}
        `;
        // JavaScript logic to toggle visibility
        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");

        hasChargesCheckbox.addEventListener("change", () => {
            if (hasChargesCheckbox.checked) {
                chargesOptions.style.display = "block";
            } else {
                chargesOptions.style.display = "none";
            }
        });
        setupMagicBonusSelection();
    } else if (category === "adventuring-gear") {
        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="gear-category">Gear Category:</label>
            <input type="text" id="gear-category" placeholder="e.g., Standard Gear" />
        </div>
        `;
    } else if (category === "wondrous-item") {
        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="itemFormAttunement">Requires Attunement:</label>
            <input type="checkbox" id="itemFormAttunement"/>
            <label for="has-charges">Has Charges</label>
            <input type="checkbox" id="has-charges" />
        </div>
    
        <div id="charges-options" style="display: none; margin-left: 20px;">
            <div class="form-row">
                <label for="charge-reset">When does it reset?</label>
                <select id="charge-reset">
                    <option value="long-rest">Long Rest</option>
                    <option value="short-rest">Short Rest</option>
                    <option value="at-dawn">At Dawn</option>
                </select>
            </div>
            <div class="form-row">
                <label for="max-charges">Maximum Charges:</label>
                <input type="number" id="max-charges" placeholder="e.g., 3" min="1" />
            </div>
        </div>
        ${magicBonusSection}
        `;
        // JavaScript logic to toggle visibility
        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");

        hasChargesCheckbox.addEventListener("change", () => {
            if (hasChargesCheckbox.checked) {
                chargesOptions.style.display = "block";
            } else {
                chargesOptions.style.display = "none";
            }
        });
        setupMagicBonusSelection();
    }
    // Attach event listeners to the Magic Bonus section
    
}

// Function to gather form data
function gatherFormData() {
    const equipmentData = {
        index: document.getElementById("equipment-name").value.toLowerCase().replace(/\s+/g, "-"),
        name: document.getElementById("equipment-name").value,
        equipment_category: {
            index: document.getElementById("equipment-category").value,
            name: document.getElementById("equipment-category").value,
        },
        description: document.getElementById("equipment-description").value.split("\n").filter(line => line.trim() !== ""),
        properties: document.getElementById("itemFormAttunement")?.checked
            ? [{
                  index: "attunement",
                  name: "Requires Attunement",
              }]
            : [],
        
        cost: {
            quantity: parseFloat(document.getElementById("equipment-cost").value) || 0,
            unit: document.getElementById("equipment-cost-unit").value
        },
        weight: parseFloat(document.getElementById("equipment-weight").value) || 0,
        rarity: {
            index: document.getElementById("equipment-rarity").value.toLowerCase(),
            name: document.getElementById("equipment-rarity").value,
        },
    };

    // Collect dynamic fields based on the category
    const category = equipmentData.equipment_category.index;

    if (category === "weapon") {
        equipmentData.weapon_category = document.getElementById("weapon-category").value;
    
        const damageDice = document.getElementById("damage-dice").value;
        const damageType = document.getElementById("damage-type").value;
    
        equipmentData.damage = {
            damage_dice: damageDice,
            damage_type: {
                index: damageType.toLowerCase(),
                name: damageType,
            }
        };

        // Collect selected weapon properties
        const selectedProperties = Array.from(document.querySelectorAll("#weaponProperties input:checked"))
        .map(checkbox => ({
            index: checkbox.value.toLowerCase().replace(/\s+/g, "-"),
            name: checkbox.value
        }));

        equipmentData.properties = selectedProperties;

        // Get the weapon range based on the selected attack style
        const attackStyle = document.getElementById("attack-style").value;
        equipmentData.weapon_range = document.getElementById("attack-style").value;

        if (attackStyle === "melee") {
            equipmentData.range = {
                normal: parseInt(document.getElementById("melee-range").value) || 5
            };
        } else if (attackStyle === "ranged") {
            equipmentData.range = {
                normal: parseInt(document.getElementById("short-range").value) || 30,
                long: parseInt(document.getElementById("long-range").value) || 120
            };
        } else if (attackStyle === "melee-thrown") {
            equipmentData.range = {
                normal: parseInt(document.getElementById("melee-range").value) || 5,
            };
            equipmentData.throw_range = {
                normal: parseInt(document.getElementById("short-range").value) || 20,
                long: parseInt(document.getElementById("long-range").value) || 60
            }
        }

        equipmentData.toHitBonus = document.getElementById("weapon-to-hit-bonus").value;
        equipmentData.damageBonus = document.getElementById("weapon-damage-bonus").value;
        equipmentData.hasCharges = document.getElementById("has-charges").checked;
    
        equipmentData.chargesOptions = document.getElementById("has-charges").checked ? {
            chargeReset: document.getElementById("charge-reset").value,
            maxCharges: parseInt(document.getElementById("max-charges").value) || 0
        } : null;    
        collectMagicBonuses()
    } else if (category === "armor") {
            // Get the selected armor category and base armor class from the form
            let armorClassData = {};

            // Get the selected armor category and base armor class from the form
            const armorCategory = document.getElementById("armor-category").value;
            const baseArmorClass = parseInt(document.getElementById("armor-class").value);
            
            // Set default values for the armor class
            armorClassData.base = baseArmorClass;
            armorClassData.dex_bonus = false; // Default value for dex_bonus
            armorClassData.max_bonus = 0;     // Default value for max_bonus

            
            
            // Adjust values based on the armor category
            if (armorCategory === "Light") {
                armorClassData.dex_bonus = true; // Light armor allows dex bonus
            } else if (armorCategory === "Medium") {
                armorClassData.dex_bonus = true; // Medium armor allows dex bonus
                armorClassData.max_bonus = 2;   // Medium armor has a max dex bonus of 2
            } else if (armorCategory === "Heavy") {
                armorClassData.dex_bonus = false; // Heavy armor doesn't allow dex bonus
                armorClassData.max_bonus = 0;    // Heavy armor doesn't have a max dex bonus (no bonus)
            }else if (armorCategory === "Shield") {
                armorClassData.dex_bonus = false; // Heavy armor doesn't allow dex bonus
                equipmentData.equipment_category = {
                    index: "shield",   // Update the category to 'shield'
                    name: "Shield",    // Update the name to "Shield"
                };
            }
            
            // Save armor class data to the equipmentData object (assuming equipmentData is already initialized)
            equipmentData.armor_class = armorClassData; // Push the generated object into equipmentData
            
            // Now you can push other related data to equipmentData
            equipmentData.armor_category = armorCategory;


            equipmentData.strengthRequirement = parseInt(document.getElementById("str-minimum").value);
            equipmentData.stealthDisadvantage = document.getElementById("stealth-disadvantage").checked;
            equipmentData.hasCharges = document.getElementById("has-charges").checked;
            equipmentData.chargesOptions = document.getElementById("has-charges").checked ? {
                chargeReset: document.getElementById("charge-reset").value,
                maxCharges: parseInt(document.getElementById("max-charges").value)
            } : null
            collectMagicBonuses()
    } else if (category === "adventuring-gear") {
            equipmentData.gearCategory = document.getElementById("gear-category").value;
    } else if (category === "wondrous-item") {
            equipmentData.hasCharges = document.getElementById("has-charges").checked;
            equipmentData.chargesOptions = document.getElementById("has-charges").checked ? {
                chargeReset: document.getElementById("charge-reset").value,
                maxCharges: parseInt(document.getElementById("max-charges").value)
            } : null
            collectMagicBonuses()
    }

    // Collect magic bonus data
    function collectMagicBonuses(){
        const magicBonusRows = document.querySelectorAll(".magic-bonus-row");

        const bonuses = [];

        magicBonusRows.forEach(row => {
            const magicStatSelect = row.querySelector(".magic-stat-select");
            const magicBonusValue = row.querySelector(".magic-bonus-value");
    
            // Check if magic-stat-select is visible
            const isMagicStatSelectVisible = window.getComputedStyle(magicStatSelect).display !== "none";
            const category = row.querySelector(".magic-category-select").value;
            const key = row.querySelector(".magic-bonus-select").value;
            const value = isMagicStatSelectVisible? magicStatSelect.value : parseInt(magicBonusValue.value) || 0;
            const description = row.querySelector(".magic-description-input")?.value || "";

            bonuses.push({
                category,
                key,
                value,
                description
            });
        });

        equipmentData.bonus = bonuses;
    }
    

    return equipmentData;
}


function setupMagicBonusSelection() {
    const magicBonusContainer = document.getElementById("magic-bonus-container");
    const addBonusButton = document.getElementById("add-magic-bonus");

    addBonusButton.addEventListener("click", () => {
        // Create a container div for each bonus selection
        const bonusRow = document.createElement("div");
        bonusRow.className = "magic-bonus-row";

        // Create the first dropdown for category selection
        const categorySelect = document.createElement("select");
        categorySelect.className = "magic-category-select";
        categorySelect.innerHTML = `<option>Select Category</option>`;

        Object.keys(characterStatBonuses).forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Create the second dropdown for specific bonus options (initially empty)
        const bonusSelect = document.createElement("select");
        bonusSelect.className = "magic-bonus-select";
        bonusSelect.disabled = true; // Disabled until a category is selected

        // Populate the second dropdown based on the selected category
        categorySelect.addEventListener("change", () => {
            const selectedCategory = categorySelect.value;

            // Clear previous options
            bonusSelect.innerHTML = `<option value="None">Select Bonus</option>`;
            bonusSelect.disabled = selectedCategory === "None";

            // Populate with options from the selected category
            if (characterStatBonuses[selectedCategory]) {
                Object.keys(characterStatBonuses[selectedCategory]).forEach(bonus => {
                    const option = document.createElement("option");
                    option.value = bonus;
                    option.textContent = bonus;
                    bonusSelect.appendChild(option);
                });
            }
        });

        // Create a dropdown to toggle between value or ability score
        const valueOrStatSelect = document.createElement("select");
        valueOrStatSelect.className = "value-or-stat-select";
        valueOrStatSelect.innerHTML = `
            <option value="value">Value</option>
            <option value="stat">Ability Score</option>
        `;

        // Create a numeric input for the bonus value (default)
        const bonusValueInput = document.createElement("input");
        bonusValueInput.type = "number";
        bonusValueInput.className = "magic-bonus-value";
        bonusValueInput.placeholder = "0";

        // Create an ability score dropdown (hidden by default)
        const statSelect = document.createElement("select");
        statSelect.className = "magic-stat-select";
        statSelect.style.display = "none"; // Hidden initially
        ["STR", "DEX", "CON", "INT", "WIS", "CHA"].forEach(stat => {
            const option = document.createElement("option");
            option.value = stat;
            option.textContent = stat;
            statSelect.appendChild(option);
        });

        // Toggle between value input and ability score dropdown
        valueOrStatSelect.addEventListener("change", () => {
            if (valueOrStatSelect.value === "value") {
                bonusValueInput.style.display = "inline-block";
                statSelect.style.display = "none";
            } else {
                bonusValueInput.style.display = "none";
                statSelect.style.display = "inline-block";
            }
        });

        // Create a remove button to delete the bonus row
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.className = "remove-magic-bonus nonRollButton";

        removeButton.addEventListener("click", () => {
            magicBonusContainer.removeChild(bonusRow);
        });

        // Append all elements to the bonus row
        bonusRow.appendChild(categorySelect);
        bonusRow.appendChild(bonusSelect);
        bonusRow.appendChild(valueOrStatSelect);
        bonusRow.appendChild(bonusValueInput);
        bonusRow.appendChild(statSelect);
        bonusRow.appendChild(removeButton);

        // Append the bonus row to the container
        magicBonusContainer.appendChild(bonusRow);
    });
}




// Function to auto-resize textareas
function autoResizeTextareas() {
    const textareas = document.querySelectorAll('.note-description');
    textareas.forEach((textarea) => {
        setTimeout(() => {
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = `${textarea.scrollHeight}px`; // Adjust to content
        }, 10); // Delay allows the browser to calculate scrollHeight
    });
}
