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

//The characterStatBonuses will be used to maintain an array of all bonuses effecting each skill, save profiencey, etc. This will then be added into each skill. 
const characterStatBonuses = {
    None: { 

    },
    skills: {
        Acrobatics: { bonuses: [] },
        AnimalHandling: { bonuses: [] },
        Arcana: { bonuses: [] },
        Athletics: { bonuses: [] },
        Deception: { bonuses: [] },
        History: { bonuses: [] },
        Initiative: { bonuses: [] },
        Insight: { bonuses: [] },
        Intimidation: { bonuses: [] },
        Investigation: { bonuses: [] },
        Medicine: { bonuses: [] },
        Nature: { bonuses: [] },
        Perception: { bonuses: [] },
        Performance: { bonuses: [] },
        Persuasion: { bonuses: [] },
        Religion: { bonuses: [] },
        SleightOfHand: { bonuses: [] },
        Stealth: { bonuses: [] },
        Survival: { bonuses: [] },
        All: { bonuses: [] },
    },
    saves: {
        STR: { bonuses: [] },
        DEX: { bonuses: [] },
        CON: { bonuses: [] },
        INT: { bonuses: [] },
        WIS: { bonuses: [] },
        CHA: { bonuses: [] },
        All: { bonuses: [] },
    },
    // attributes: {
    //     STR: { bonuses: [] },
    //     DEX: { bonuses: [] },
    //     CON: { bonuses: [] },
    //     INT: { bonuses: [] },
    //     WIS: { bonuses: [] },
    //     CHA: { bonuses: [] },
    // },

    combatStats: {
        AC: { bonuses: [] },
        // toHitBonus: { bonuses: [] },
        // damageBonus: { bonuses: [] },
        // AttackandDamage: { bonuses: [] },
        // MeleeAttackRolls: { bonuses: [] },
        // MeleeDamageRolls: { bonuses: [] },
        RangedAttackRolls: { bonuses: [] },
        RageDamageBonus: { bonuses: [] },
        RangedDamageRolls: { bonuses: [] },
        // SpellDamageRolls: { bonuses: [] },
        EldritchBlastDamage: { bonuses: [] },
        SpellSaveDC: { bonuses: [] },
        SpellAttackModifier: { bonuses: [] },
        SpellAttackandSave: { bonuses: [] },
        // HitPoints: { bonuses: [] },
        // Speed: { bonuses: [] },
    },
    senses: {
        PassivePerception: { bonuses: [] },
        PassiveInsight: { bonuses: [] },
        PassiveInvestigation: { bonuses: [] },
        // Darkvision: { bonuses: [] }, 
        // Tremorsense: { bonuses: [] },
        // Blindsight: { bonuses: [] },
        // Truesight: { bonuses: [] },
    }
};

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
        spellModSTR: "STR",
        spellModDEX: "DEX",
        spellModCON: "CON",
        spellModINT: "INT",
        spellModWIS: "WIS",
        spellModCHA: "CHA",
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



        //Header
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
        

        //This all needs to be moved to the approriate grouping. Together for translating. 
        playerStatsHeader: "Player Stats",
        actionsHeader: "Actions",
        spellListHeader: "Spell List",
        inventoryHeader: "Inventory",
        featuresHeader: "Features & Traits",
        docsHeader: "Notes",
        extrasHeader: "Extra",
        initHeader: "Init List",
        addItemModalHeader: "Add New Inventory Item",
        addItemModalBagSelect: "Select Bag:",
        addItemModalEquipment: "Equipment",
        addItemModalBackpack: "Backpack",
        addItemModalOtherPossessions: "Other Possessions",
        addItemModalDropdownText: "Select Item:",
        'confirm-add-item': "Add Item",
        'close-modal': "Cancel",

        conditionPlayerAddButton: "Add Condition",
        hitDiceOpenModalButton: "Hit Dice",

        longRestHeader: "Long Rest Summary",
        shortRestHeader: "Short Rest Summary",
        longRestHPChangeTrans: "HP Restored:",
        longRestTempHPChangeTrans: "Removing Temp HP:",
        longRestSpellSlotsTrans: "slots reset",
        longRestSpellSlotDefaultText: "No used spell slots to reset.",
        longRestHitDiceTrans: "Adding up to:",
        longRestHitDice01: "Hit Dice",
        longRestFeatures: "Traits to reset:",
        traitDescriptionTexts0: "reseting up to",
        traitDescriptionTexts1: "uses",
        confirmLongRestButton: "Confirm",
        cancelLongRestButton: "Cancel",

        hitDiceModalHeader: "Spend Hit Dice",
        hitDiceModalText: "Current Hit Dice Available:",

        featuresAddGroupButton:"+ Add New Group",
        featuresAddTraitButton: "+ Add New Trait",
        featuresUsesText: "Uses",
        featuresCategoryText: "Category",
        featuresSubcategoryText: "Subcategory",
        featuresAbilityScoreText: "Ability Score to use for adjustment value",
        featuresAdjustmentText: "Adjustment Value:",
        featuresNumberUsesText: "Number of Uses:",
        featuresResetText: "Reset On:",
        featuresDeleteButton: "Delete Trait",

        docsSectionHeader: "Character Notes",
        docsSectionGroupButton: "+ Add Group",
        docsSectionNoteButton: "+ Add Note",

        characterAbilityScores: {
            str: "Strength (STR)",
            dex: "Dexterity (DEX)",
            con: "Constution (CON)",
            int: "Intelligence (INT)",
            wis: "Wisdom (WIS)",
            cha: "Charisma (CHA)"
        },

        damageTypesTranslate: {
            na: "N/A",
            slashing: "Slashing",
            piercing: "Piercing",
            bludgeoning: "Bludgeoning",
            fire: "Fire",
            cold: "Cold",
            lightning: "Lightning",
            thunder: "Thunder",
            acid: "Acid",
            poison: "Poison",
            psychic: "Psychic",
            radiant: "Radiant",
            necrotic: "Necrotic",
            force: "Force",
            healing: "Healing"
        },
        resistanceTypesTranslate: {
            slashing: "Slashing",
            piercing: "Piercing",
            bludgeoning: "Bludgeoning",
            fire: "Fire",
            cold: "Cold",
            lightning: "Lightning",
            thunder: "Thunder",
            acid: "Acid",
            poison: "Poison",
            psychic: "Psychic",
            radiant: "Radiant",
            necrotic: "Necrotic",
            force: "Force",
            non_magical_damage: "Non-magical damage",
            silvered_weapons: "Silvered weapons",
            magical_weapons: "Magical weapons",
            bludgeoning_non_magical: "Bludgeoning (Non-magical)",
            slashing_non_magical: "Slashing (Non-magical)",
            piercing_non_magical: "Piercing (Non-magical)"
        },

        conditionTypesTranslated: {
            blinded: "Blinded",
            charmed: "Charmed",
            deafened: "Deafened",
            frightened: "Frightened",
            grappled: "Grappled",
            incapacitated: "Incapacitated",
            invisible: "Invisible",
            paralyzed: "Paralyzed",
            petrified: "Petrified",
            poisoned: "Poisoned",
            prone: "Prone",
            restrained: "Restrained",
            stunned: "Stunned",
            unconscious: "Unconscious",
            exhaustion: "Exhaustion"
        },


        conditions: {
            blinded: {
                name: "Blinded",
                description: [
                    "A blinded creature can't see and automatically fails any ability check that requires sight.",
                    "<br>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage."
                ]
            },
            charmed: {
                name: "Charmed",
                description: [
                    "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.",
                    "The charmer has advantage on any ability check to interact socially with the creature."
                ]
            },
            deafened: {
                name: "Deafened",
                description: [
                    "A deafened creature can't hear and automatically fails any ability check that requires hearing."
                ]
            },
            exhaustion: {
                name: "Exhaustion",
                description: [
                    "Level 1: Disadvantage on ability checks",
                    "<br>Level 2: Speed halved",
                    "<br>Level 3: Disadvantage on attack rolls and saving throws",
                    "<br>Level 4: Hit point maximum halved",
                    "<br>Level 5: Speed reduced to 0",
                    "<br>Level 6: Death"
                ]
            },
            frightened: {
                name: "Frightened",
                description: [
                    "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.",
                    "<br>The creature can't willingly move closer to the source of its fear."
                ]
            },
            grappled: {
                name: "Grappled",
                description: [
                    "A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
                    "<br>The condition ends if the grappler is incapacitated (see the condition).",
                    "<br>The condition also ends if an effect removes the grappled creature from the reach of the grappler or grappling effect, such as when a creature is hurled away by the thunderwave spell."
                ]
            },
            incapacitated: {
                name: "Incapacitated",
                description: [
                    "An incapacitated creature can't take actions or reactions."
                ]
            },
            paralyzed: {
                name: "Paralyzed",
                description: [
                    "A paralyzed creature is incapacitated (see the condition) and can't move or speak.",
                    "<br>The creature automatically fails Strength and Dexterity saving throws.",
                    "<br>Attack rolls against the creature have advantage.",
                    "<br>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
                ]
            },
            petrified: {
                name: "Petrified",
                description: [
                    "A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.",
                    "<br>The creature is incapacitated (see the condition), can't move or speak, and is unaware of its surroundings.",
                    "<br>Attack rolls against the creature have advantage.",
                    "<br>The creature automatically fails Strength and Dexterity saving throws.",
                    "<br>The creature has resistance to all damage.",
                    "<br>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized."
                ]
            },
            poisoned: {
                name: "Poisoned",
                description: [
                    "A poisoned creature has disadvantage on attack rolls and ability checks."
                ]
            },
            prone: {
                name: "Prone",
                description: [
                    "A prone creature's only movement option is to crawl, unless it stands up and thereby ends the condition.",
                    "<br>The creature has disadvantage on attack rolls.",
                    "<br>An attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the attack roll has disadvantage."
                ]
            },
            restrained: {
                name: "Restrained",
                description: [
                    "A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.",
                    "<br>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
                    "<br>The creature has disadvantage on Dexterity saving throws."
                ]
            },
            stunned: {
                name: "Stunned",
                description: [
                    "A stunned creature is incapacitated (see the condition), can't move, and can speak only falteringly.",
                    "<br>The creature automatically fails Strength and Dexterity saving throws.",
                    "<br>Attack rolls against the creature have advantage."
                ]
            },
            unconscious: {
                name: "Unconscious",
                description: [
                    "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings.",
                    "<br>The creature drops whatever it's holding and falls prone.",
                    "<br>The creature automatically fails Strength and Dexterity saving throws.",
                    "<br>Attack rolls against the creature have advantage.",
                    "<br>Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature."
                ]
            },
        // ... all conditions
        },
        effects: {
            aid: {
                name: "Aid",
                description: [
                    "The creature gains 5 Max hp per level of aid they have."
                ]
            },
            bane: {
                name: "Bane",
                description: [
                    "The creature must subtract a d4 from attack rolls or saving throws while the effect lasts."
                ]
            },
            bless: {
                name: "Bless",
                description: [
                    "The creature can add a d4 to attack rolls or saving throws while the effect lasts."
                ]
            },
            bloodied: {
                name: "Bloodied",
                description: [
                    "The creature's hit points are at or below half its maximum hit points."
                ]
            },
            concentration: {
                name: "Concentration",
                description: [
                    "The creature is concentrating on a spell. Concentration is broken if the creature takes damage and fails a Constitution saving throw."
                ]
            },
            curse: {
                name: "Curse",
                description: [
                    "The curse applies a specific penalty, such as reduced hit points, disadvantage on certain rolls, or inability to regain hit points."
                ]
            },
            drained: {
                name: "Drained",
                description: [
                    "The creature's maximum hit points are reduced until it finishes a long rest."
                ]
            },
            haste: {
                name: "Haste",
                description: [
                    "The creature's speed is doubled.",
                    "It gains a +2 bonus to AC.",
                    "It has advantage on Dexterity saving throws.",
                    "It gains an additional action each turn (limited to certain actions)."
                ]
            },
            heroism: {
                name: "Heroism",
                description: [
                    "The creature gains temporary hit points at the start of each turn while the effect lasts.",
                    "It is immune to being frightened."
                ]
            },
            hex: {
                name: "Hex",
                description: [
                    "The creature has disadvantage on ability checks of a chosen ability.",
                    "It takes extra necrotic damage from attacks by the caster."
                ]
            },
            inspire: {
                name: "Inspire",
                description: [
                    "The creature can add a Bardic Inspiration die to an ability check, attack roll, or saving throw."
                ]
            },
            invisible: {
                name: "Invisible",
                description: [
                    "The creature can't be seen without magical aid or special senses.",
                    "Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage."
                ]
            },
            raging: {
                name: "Raging",
                description: [
                    "The creature gains advantage on Strength checks and saving throws.",
                    "The creature's melee weapon attacks deal bonus damage based on level.",
                    "The creature has resistance to bludgeoning, piercing, and slashing damage."
                ]
            },
            recharging: {
                name: "Recharging",
                description: [
                    "This monster's ability recharges after use. At the end of its turns, roll a d6.", 
                    "<br>If the result is within the recharge range specified in the ability (e.g., 5–6), the ability becomes available to use again.", 
                    "<br>Otherwise, it remains unavailable until the next successful recharge roll."
                ]
            },
            sanctuary: {
                name: "Sanctuary",
                description: [
                    "Creatures attempting to attack the protected creature must make a Wisdom saving throw or choose a new target."
                ]
            },
            shield: {
                name: "Shield",
                description: [
                    "The creature gains a temporary increase to its AC (e.g., Shield spell adds +5 to AC until the start of the next turn)."
                ]
            },
            slow: {
                name: "Slow",
                description: [
                    "The creature's speed is halved.",
                    "It takes a -2 penalty to AC and Dexterity saving throws.",
                    "It can't use reactions, and it can take only one action or bonus action on its turn."
                ]
            }
        },
        schools: {
            abjuration: {
                name: "Abjuration",
                description: ["The School of Abjuration emphasizes magic that blocks, banishes, or protects."]
                    
            },
            conjuration: {
                name: "Conjuration",
                description: ["The School of Conjuration deals with creating objects and creatures, or making them disappear."]
            },
            divination: {
                name: "Divination",
                description: ["The magical School of Divination is centered around revealing and granting knowledge and information to the caster. Useful for reading ancient scripts, identifying magical items, and seeing invisible enemies."]
            },
            enchantment: {
                name: "Enchantment",
                description: ["Spells within the School of Enchantment are designed to manipulate the mental state of the target. This entire school is very similar to hypnotism, where the affected creature may act completely differently than how they normally behave."]
            },
            evocation: {
                name: "Evocation" ,
                description: ["Casters within the school of evocation unleash a raw magical energy upon their enemies. Whether it be flames, ice, or pure arcane energy."]
            },
            illusion: {
                name: "Illusion" ,
                description: ["The School of Illusion is concerned with manipulating the various senses of people and creatures. This could be vision, hearing, or other various senses such as body temperature."]
            },
            necromancy: {
                name: "Necromancy",
                description:[
                        "In general, think of spells within the School of Necromancy as manipulating the ebb and flow of different creatures life energy, or the balance of energy between life and death. This can come across in the form of helping resurrection, or draining necrotic damage."]
            },
            transmutation: {
                name: "Transmutation",
                description: ["Casters who study within the School of Transmutation are able to manipulate the physical properties of both items and people. This could be something simple such as turning copper into gold or could be an advanced spell that turns you into a newt"]
            }
        },
        travel: {
            fast: {
                name: "Fast",
                description: ["Per Minute - 400 feet","Per Hour - 4 miles","Per Day - 30 miles", " Effect - -5 penalty to passive Wisdom (Perception) scores"]
                    
            },
            normal: {
                name: "Normal",
                description: ["Per Minute - 300 feet","Per Hour - 3 miles","Per Day - 24 miles"," Effect-"]
                    
            },
            slow: {
                name: "Slow",
                description: ["Per Minute - 200 feet","Per Hour - 2 miles","Per Day - 18 miles"," Effect - Able to use stealth"]
                    
            },
        },

        travelCosts: {
            airship: {
                name: "Airship",
                description: ["Cost - 1 gp Per Mile","Speed - 20mph"]
                    
            },
            galleon: {
                name: "Galleon",
                description: ["Cost - 5 sp Per Mile","Speed - 10mph"]
                    
            },
            coach: {
                name: "Coach",
                description: ["Cost - 2 sp Per Mile","Speed - 30mph"]
                    
            },
            teleportationCircle: {
                name: "Teleportation Circle",
                description: ["Cost - 2,500 gp","Speed - Instant"]
                    
            },
        },
        //Player Stats Section
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
        proficiencyGroupHeading: "Proficiencies",
        proficiencyWeapons: "Weapons",
        proficiencyArmor: "Armor",
        proficiencyLanguages: "Languages",
        proficiencyTools: "Tools",
        


        //Action Section
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

        filterActionsButton: "Filter Actions",
        actionTableToHitBonus: "To Hit Bonus : ",
        actionTableDamageMod: "Damage Mod : ",
        actionTableDamageDice: "Damage Dice : ",
        actionTableDamageType: "Damage Type : ",
        actionTableDeleteButton: "Delete Current Row",


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

        proficiencies: {
            weapons: {
                categories: ["Martial Weapons", "Simple Weapons"],
                simpleMelee: ["Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "LightHammer", "Mace", "Quarterstaff", "Sickle", "Spear"],
                simpleRanged: ["CrossbowLight", "Dart", "Shortbow", "Sling"],
                martialMelee: ["Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar", "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "WarPick", "Warhammer", "Whip"],
                martialRanged: ["Blowgun", "CrossbowHand", "CrossbowHeavy", "Longbow", "Net"]
            },
            armor: ["Light", "Medium", "Heavy", "Shield"],
            languages: {
                common: ["Common", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Orc", "Leonin", "Minotaur", "SignLanguage"],
                exotic: ["Abyssal", "Celestial", "Draconic", "DeepSpeech", "Infernal", "Primordial", "Sylvan", "ThievesCant", "Undercommon"]
            },
            tools: {
                artisan: ["Alchemist's Supplies", "Brewer's Supplies", "Calligrapher's Supplies", "Carpenter's Tools", "Cartographer's Tools", "Cobbler's Tools", "Cook's Utensils", "Glassblower's Tools", "Jeweler's Tools", "Leatherworker's Tools", "Mason's Tools", "Painter's Supplies", "Potter's Tools", "Smith's Tools", "Tinker's Tools", "Weaver's Tools", "Woodcarver's Tools"],
                gaming: ["Dice Set", "Dragonchess Set", "Playing Card Set", "Three-Dragon Ante Set"],
                musical: ["Bagpipes", "Drum", "Dulcimer", "Flute", "Lute", "Lyre", "Horn", "PanFlute", "Shawm", "Viol", "Wargong", "BirdPipes"],
                other: ["Disguise Kit", "Forgery Kit", "Herbalism Kit", "Navigator's Tools", "Poisoner's Kit", "Thieves' Tools", "Vehicles (Land)", "Vehicles (Water)"]
            }
        },




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



        //This section is for variables used throughout the sheet needed for the changing of stats. 
        meleeWeapon: "Melee",
        rangedWeapon: "Ranged",
        magicWeapon: "Magic",
        


        //DM Section from here to the buttom.
        DMPageLinkInit: "Initiative Tracker",
        DMTablesLinkInit: "DM Tables",
        checklistsLinkInit: "Checklists",
        SpellListLinkInit: "Spell List",
        DocsLinkInit: "Notes",
        GoogleDocsLinkInit: "Google Docs",


        'add-monster-button': "Add Monster",
        'add-player-button':"Add Player",
        'save-encounter': "Save Encounter",
        'load-encounter':"Load Encounter",
        conditionDMAddButton: "Add Condition",
        rollInitiative: "Auto Roll",
        'previous-turn-btn': "Previous Turn",
        'next-turn-btn': "Next Turn",
        'request-player-stats': "Request Player Stats",



        conditionsSectionLink: "Condition",
        effectsSectionLink: "Effects",
        schoolsOfMagicSectionLink: "Magic Schools",
        shopsSectionLink: "Shops",
        travelSectionLink: "Travel",
        npcListSectionLink: "NPC's",
        skillsTableSectionLink: "Skills",
        jumpingRulesSectionLink: "Jumping",
        RandomSectionLink: "Random Tables",

        ConditionTableRowHeader01: "Condition",
        ConditionTableRowHeader02: "Description",
        EffectTableRowHeader01: "Effects",
        EffectTableRowHeader02: "Description",
        effectsAddRowButton: "Add Button",
        SchoolTableRowHeader01: "School",
        SchoolTableRowHeader02: "Description",
        
        travelTableHeader: "Travel Pace",
        travelTableHeader01: "Pace",
        travelTableHeader02: "Speed / Effects",

        travelCostTableHeader: "Transportation; Travel Services",
        travelCostTableHeader01: "Service",
        travelCostTableHeader02: "Cost / Speed",

        jumpCalculatorTitle: "Jump Calculator",
        strengthLabel: "What is your Strength score?",
        heightLabel: "How tall are you?",
        feetLabel: "feet",
        inchesLabel: "inches",
        multiplierLabel: "Multiply your results by",
        runningHeader: "With a running start (10 feet of movement)",
        runningLongLabel: "Your long jump is ",
        runningLongUnit: "feet",
        runningHighLabel: "Your high jump is ",
        runningHighUnit: "feet",
        runningReachLabel: "You can reach up and grab something ",
        runningReachUnit: "feet away",
        standingHeader: "Without a running start",
        standingLongLabel: "Your long jump is ",
        standingLongUnit: "feet",
        standingHighLabel: "Your high jump is ",
        standingHighUnit: "feet",
        standingReachLabel: "You can reach up and grab something ",
        standingReachUnit: "feet away",
        
        checklistHeader: "Checklists",
        addChecklistbutton: "Add",

        monsterFormTitle: "Create Custom Monster",
        monsterNameLabel: "Name:",
        monsterTypeLabel: "Type:",
        monsterCRLabel: "CR Value:",
        monsterSourceLabel: "Source:",
        monsterHPLabel: "HP Value:",
        monsterHPNotesLabel: "HP Notes:",
        monsterACLabel: "AC Value:",
        monsterACNotesLabel: "AC Notes:",
        monsterInitiativeLabel: "Initiative Value:",
        monsterSpeedLabel: "Speed:",
        monsterSensesLabel: "Senses:",
        monsterLanguagesLabel: "Languages:",
        abilitiesLegend: "Abilities",
        monsterStrLabel: "STR:",
        monsterDexLabel: "DEX:",
        monsterConLabel: "CON:",
        monsterIntLabel: "INT:",
        monsterWisLabel: "WIS:",
        monsterChaLabel: "CHA:",
        savesLegend: "Saves",
        monsterStrSaveLabel: "STR:",
        monsterDexSaveLabel: "DEX:",
        monsterConSaveLabel: "CON:",
        monsterIntSaveLabel: "INT:",
        monsterWisSaveLabel: "WIS:",
        monsterChaSaveLabel: "CHA:",
        skillsLegend: "Skills",
        monsterAcrobaticsLabel: "Acrobatics (DEX):",
        monsterAnimalHandlingLabel: "Animal Handling (WIS):",
        monsterArcanaLabel: "Arcana (INT):",
        monsterAthleticsLabel: "Athletics (STR):",
        monsterDeceptionLabel: "Deception (CHA):",
        monsterHistoryLabel: "History (INT):",
        monsterInsightLabel: "Insight (WIS):",
        monsterIntimidationLabel: "Intimidation (CHA):",
        monsterInvestigationLabel: "Investigation (INT):",
        monsterMedicineLabel: "Medicine (WIS):",
        monsterNatureLabel: "Nature (INT):",
        monsterPerceptionLabel: "Perception (WIS):",
        monsterPerformanceLabel: "Performance (CHA):",
        monsterPersuasionLabel: "Persuasion (CHA):",
        monsterReligionLabel: "Religion (INT):",
        monsterSleightOfHandLabel: "Sleight of Hand (DEX):",
        monsterStealthLabel: "Stealth (DEX):",
        monsterSurvivalLabel: "Survival (WIS):",
        vulnerabilitiesLegend: "Damage Vulnerabilities",
        resistancesLegend: "Damage Resistances",
        immunitiesLegend: "Damage Immunities",
        conditionImmunitiesLegend: "Condition Immunities",
        quickActionsLegend: "Quick Actions",
        traitsLegend: "Traits",
        actionsLegend: "Actions",
        reactionsLegend: "Reactions",
        legendaryActionsLegend: "Legendary Actions",
        saveMonsterButton: "Save Monster",
        addTraitButton: "Add Trait",
        addActionButton: "Add Action",
        addReactionButton: "Add Reaction",
        addLegendaryActionsButton: "Add Legendary Actions",

        dynamicSections: {
            monsterFormTraits: "Traits",
            monsterFormActions: "Actions",
            monsterFormReactions: "Reactions",
            monsterFormLegendaryActions: "Legendary Actions",
            monsterFormQuickActions: "Quick Actions"
        },

        monsterFormAdd: "Add",
        monsterFormRemove: "Remove",

        spellFormTitle: "Create a Spell",
        spellNameLabel: "Spell Name:",
        spellDescLabel: "Spell Description:",
        higherLevelLabel: "Higher Level Casting Description:",
        spellRangeLabel: "Spell Range:",
        spellComponentsLabel: "Spell Components:",
        labelVerbal: "Verbal",
        labelSomatic: "Somatic",
        labelMaterial: "Material",
        spellMaterialsLabel: "Spell Materials:",
        ritualLabel: "Ritual Spell:",
        durationLabel: "Duration:",
        concentrationLabel: "Concentration:",
        castingTimeLabel: "Casting Time:",
        spellLevelLabel: "Spell's Level:",
        schoolLabel: "Spell School:",
        spellClassesLabel: "Spell Classes:",
        labelBarbarian: "Barbarian",
        labelBard: "Bard",
        labelCleric: "Cleric",
        labelDruid: "Druid",
        labelFighter: "Fighter",
        labelMonk: "Monk",
        labelPaladin: "Paladin",
        labelRanger: "Ranger",
        labelRogue: "Rogue",
        labelSorcerer: "Sorcerer",
        labelWarlock: "Warlock",
        labelWizard: "Wizard",
        labelArtificer: "Artificer",
        toHitOrDCLabel: "To Hit or DC:",
        damageDiceLabel: "Damage Dice:",
        damageDiceUpcastLabel: "Damage Dice (Upcast):",
        saveDCTypeLabel: "Spell Save DC:",
        abilityModifierLabel: "Should spell add Ability Modifier:",
        spellDamageTypeLabel: "Damage Type:",
        saveSpell: "Save Spell",
        equipmentCategoryOptionWeapon: "Weapon",
        equipmentCategoryOptionArmor: "Armor",
        equipmentCategoryOptionWonderous: "Wonderous Item",
        equipmentCategoryOptionPotion: "Potion",
        equipmentCategoryOptionAdventuring: "Adventuring Gear",
        equipmentRarityOptionCommon: "Common",
        equipmentRarityOptionUncommon: "Uncommon",
        equipmentRarityOptionRare: "Rare",
        equipmentRarityOptionVery: "Very Rare",
        equipmentRarityOptionLegendary: "Legendary",

        shopFormTitle: "Create Custom Shops",
        shopNameLabel: "Shop Name : ",
        addshopItem: "Add Item to Group",
        shopGroupNameLabel: "Group Name:",
        shopItemNameLabel: "Item Name:",
        addShopGroup: "Add Group to Shop",
        createShop: "Create/Update Shop",

        itemFormTitle: "Create Equipment",
        equipmentNameLabel: "Name:",
        equipmentDescriptionLabel: "Description:",
        equipmentCategoryLabel: "Category:",
        equipmentRarityLabel: "Rarity:",
        equipmentCostLabel: "Cost:",
        equipmentWeightLabel: "Weight:",
        createEquipmentButton: "Create Equipment",
        addItemtoGroupButton: "Add Item to Group",
        groupNameLabel: "Group Name:",
        itemNameLabel: "Item Name:",
        addItemtoGroupButton:    "Add Item to Group",
        groupNameLabel:          "Group Name:",
        itemNameLabel:           "Item Name:",

        addMagicBonusButton:     "Add Magic Bonus",
        magicBonusesLabel:       "Magic Bonuses:",

        weaponTypeLabel:         "Weapon Type:",
        optionSimple:            "Simple",
        optionMartial:           "Martial",

        attackStyleLabel:        "Attack Style:",
        optionMelee:             "Melee",
        optionRanged:            "Ranged",
        optionMeleeThrown:       "Melee and Thrown",
        rangeLabel:              "Range:",

        weaponPropertiesLabel:   "Weapon Properties:",
        labelFinesse:            "Finesse",
        labelVersatile:          "Versatile",
        labelHeavy:              "Heavy",
        labelLight:              "Light",
        labelLoading:            "Loading",
        labelReach:              "Reach",
        labelThrown:             "Thrown",
        labelTwoHanded:          "Two-Handed",
        labelSilvered:           "Silvered",
        labelSpecial:            "Special",
        labelAmmunition:         "Ammunition",
        attunementLabel:         "Attunement",
        hasChargesLabel:         "Has Charges",

        damageDiceLabel:         "Damage Dice:",
        damageTypeLabel:         "Damage Type:",

        chargeResetLabel:        "When does it reset?",
        optionLongRest:          "Long Rest",
        optionShortRest:         "Short Rest",
        optionAtDawn:            "At Dawn",
        maxChargesLabel:         "Maximum Charges:",

        weaponToHitBonusLabel:   "Magical to Hit Bonus:",
        weaponDamageBonusLabel:  "Magical Damage Bonus:",

        armorTypeLabel:          "Armor Type:",
        optionLightArmor:        "Light",
        optionMediumArmor:       "Medium",
        optionHeavyArmor:        "Heavy",
        optionShield:            "Shield",

        armorClassLabel:         "Base Armor Class:",
        strMinimumLabel:         "Strength Requirement:",
        stealthDisadvantageLabel: "Stealth Disadvantage:",
        requiresAttunementLabel: "Requires Attunement:",

        gearCategoryLabel:       "Gear Category:",

        potionEffectTypeLabel:   "Potion Effect Type:",
        optionHealing:           "Healing",
        optionSpell:             "Spell",
        optionOther:             "Other",
        healingFormulaLabel:     "Healing Formula:",
        spellNameLabel:          "Spell Name:",
        spellDurationLabel:      "Duration:",
        noConcentrationLabel:    "No Concentration:",
        


        homebrewModalTitle: "Homebrew Creator",
        localStorageLabel: "Local Storage - ",
        globalStorageLabel: "Global Storage - ",
        customMonsters: "Create Monster",
        customMonsterSelectLabel: "Select Monster to Delete/Edit:",
        deleteCustomMonsters: "Delete Monster",
        editCustomMonsters: "Edit Monster",
        customSpells: "Create Spell",
        importCustomSpell: "Import Spell",
        customSpellSelectLabel: "Select Spell to Delete/Edit:",
        deleteCustomSpells: "Delete Spell",
        editCustomSpells: "Edit Spell",
        exportCustomSpell: "Export Spell",
        customItems: "Create Item",
        importCustomItem: "Import Item",
        customItemSelectLabel: "Select Item to Delete/Edit:",
        deleteCustomItems: "Delete Item",
        editCustomItems: "Edit Item",
        exportCustomItem: "Export Item",
        createCustomShops: "Create Shop",
        customShopSelectLabel: "Select Item to Delete/Edit:",
        deleteCustomShops: "Delete Shop",
        importCharacterData: "Import Character Data",
        customCharacterSelectLabel: "Select a character to Export:",
        exportCharacterData: "Export Character",
        deleteCharacter: "Delete Character",


        shopHeadersTranslate: {
            item: "Item",
            cost: "Cost",
            weight: "Weight",
            category: "Category"
        },
        spellDetailsTranslate: {
            level: "Level",
            range: "Range",
            duration: "Duration",
            concentration: "Concentration",
            ritual: "Ritual",
            components: "Components",
            material: "Material Components",
            casting_time: "Casting Time",
            class: "Classes",
            school: "School",
            description: "Description",
            higher_level: "Higher Level"
        }

    },
    es: {
        //Spell Section
        spellModLabel: "Modificador:",
        spellModSTR: "FUE",
        spellModDEX: "DES",
        spellModCON: "CON",
        spellModINT: "INT",
        spellModWIS: "SAB",
        spellModCHA: "CAR",
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
        skillMedicine: "Medicina",
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
        proficiencyGroupHeading: "Proficiencias",
        proficiencyWeapons: "Armas",
        proficiencyArmor: "Armadura",
        proficiencyLanguages: "Idioma",
        proficiencyTools: "Herramientas",



        //This all needs to be moved to the approriate grouping. Together for translating. 
        playerStatsHeader: "Estadísticas",
        actionsHeader: "Acciones",
        spellListHeader: "List Hechizos",
        inventoryHeader: "Inventario",
        featuresHeader: "Caracteristicas",
        docsHeader: "Notas",
        extrasHeader: "Extras",
        initHeader: "List Inici",
        addItemModalHeader: "Agregar Nuevo Objeto al Inventario",
        addItemModalBagSelect: "Seleccionar Bolsa:",
        addItemModalEquipment: "Equipamiento",
        addItemModalBackpack: "Mochila",
        addItemModalOtherPossessions: "Otras posesiones",
        addItemModalDropdownText: "Seleccionar Objeto:",
        'confirm-add-item': "Agregar Objeto",
        'close-modal': "Cancelar",

        conditionPlayerAddButton: "Añadir Condición",
        hitDiceOpenModalButton: "Dados de Golpe",

        longRestHeader: "Resumen de descanso largo",
        shortRestHeader: "Resumen de descanso corto",
        longRestHPChangeTrans: "PV Restaurados:",
        longRestTempHPChangeTrans: "Eliminación de HP temporal:",  
        longRestSpellSlotsTrans: "espacios recuperados",  
        longRestSpellSlotDefaultText: "No hay conjuros usados que reiniciar.",
        longRestHitDiceTrans: "Añadiendo Hasta:", 
        longRestHitDice01: "Dados de Golpe",
        longRestFeatures: "Rasgos Restablecidos:",
        traitDescriptionTexts0: "restableciendo hasta",
        traitDescriptionTexts1: "usos", 
        confirmLongRestButton: "Confirmar",  
        cancelLongRestButton: "Cancelar",

        hitDiceModalHeader: "Usar Dados de Golp",
        hitDiceModalText: "Dados de Golpe disponibles actuales:",

        featuresAddGroupButton: "+ Añadir Nuevo Grupo",
        featuresAddTraitButton: "+ Añadir Nuevo Rasgo",
        featuresUsesText: "Usos",
        featuresCategoryText: "Categoría:",
        featuresSubcategoryText: "Subcategoría:",
        featuresAbilityScoreText: "Puntuación de habilidad que se utilizará para el valor de ajuste",
        featuresAdjustmentText: "Ajustar Valor:",
        featuresNumberUsesText: "Número de Usos:",
        featuresResetText: "Recuperar Cuando:",
        featuresDeleteButton: "Eliminar Rasgo",


        docsSectionHeader: "Notas del Personaje",
        docsSectionGroupButton: "+ Agregar Grupo",
        docsSectionNoteButton: "+ Añadir Nota",

        characterAbilityScores: {
            str: "Fuerza (FUE)",
            dex: "Destreza (DES)",
            con: "Constitución (CON)",
            int: "Inteligencia (INT)",
            wis: "Sabiduría (SAB)",
            cha: "Carisma (CAR)"
        },

        damageTypesTranslate: {
            na: "N/A",
            slashing: "Cortante",
            piercing: "Perforante",
            bludgeoning: "Contundente",
            fire: "Fuego",
            cold: "Frío",
            lightning: "Relámpago",
            thunder: "Trueno",
            acid: "Ácido",
            poison: "Veneno",
            psychic: "Psíquico",
            radiant: "Radiante",
            necrotic: "Necrótico",
            force: "Fuerza",
            healing: "Curación"
        },

        resistanceTypesTranslate: {
            slashing: "Cortante",
            piercing: "Perforante",
            bludgeoning: "Contundente",
            fire: "Fuego",
            cold: "Frío",
            lightning: "Relámpago",
            thunder: "Trueno",
            acid: "Ácido",
            poison: "Veneno",
            psychic: "Psíquico",
            radiant: "Radiante",
            necrotic: "Necrótico",
            force: "Fuerza",
            non_magical_damage: "Daño no mágico",
            silvered_weapons: "Armas plateadas",
            magical_weapons: "Armas mágicas",
            bludgeoning_non_magical: "Contundente (No mágico)",
            slashing_non_magical: "Cortante (No mágico)",
            piercing_non_magical: "Perforante (No mágico)"
        },
        conditionTypesTranslated: {
            blinded: "Cegado",
            charmed: "Hechizado",
            deafened: "Ensordecido",
            frightened: "Asustado",
            grappled: "Agarrado",
            incapacitated: "Incapacitado",
            invisible: "Invisible",
            paralyzed: "Paralizado",
            petrified: "Petrificado",
            poisoned: "Envenenado",
            prone: "Derribado",
            restrained: "Restringido",
            stunned: "Aturdido",
            unconscious: "Inconsciente",
            exhaustion: "Agotamiento"
        },

        conditions: {
            blinded: {
                name: "Cegado",
                description: [
                    "Una criatura cegada no puede ver y falla automáticamente todas las pruebas de característica que requieran vista.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja y las tiradas de ataque hechas por la criatura tienen desventaja."
                ]
            },
            charmed: {
                name: "Hechizado",
                description: [
                    "Una criatura hechizada no puede atacar ni elegir como objetivo de efectos dañinos o mágicos a quien la hechizó.",
                    "Quien hechizó a la criatura tiene ventaja en las pruebas de característica para interactuar socialmente con ella."
                ]
            },
            deafened: {
                name: "Ensordecido",
                description: [
                    "Una criatura ensordecida no puede oír y falla automáticamente todas las pruebas de característica que requieran el oído."
                ]
            },
            exhaustion: {
                name: "Agotamiento",
                description: [
                    "Nivel 1: Desventaja en las pruebas de habilidad",
                    "<br>Nivel 2: Velocidad reducida a la mitad",
                    "<br>Nivel 3: Desventaja en tiradas de ataque y tiradas de salvación",
                    "<br>Nivel 4: El máximo de puntos de vida se reduce a la mitad",
                    "<br>Nivel 5: Velocidad reducida a 0",
                    "<br>Nivel 6: Muerte"
                ]
            },
            frightened: {
                name: "Asustado",
                description: [
                    "Una criatura asustada tiene desventaja en las pruebas de característica y tiradas de ataque mientras pueda ver a la fuente de su miedo.",
                    "<br>La criatura no puede acercarse a la fuente de su miedo voluntariamente."
                ]
            },
            grappled: {
                name: "Agarrado",
                description: [
                    "La velocidad de una criatura agarrada es 0 y no puede aumentar por encima de ese valor.",
                    "<br>Este estado termina si quien agarra queda incapacitado (consulta Incapacitado).",
                    "<br>Este estado también termina si algún efecto aleja a la criatura de quien (o lo que) la tiene agarrada, como cuando el conjuro ola atronadora hace salir despedida a una criatura."
                ]
            },
            incapacitated: {
                name: "Incapacitado",
                description: [
                    "Una criatura incapacitada no puede llevar a cabo acciones ni reacciones."
                ]
            },
            paralyzed: {
                name: "paralizado",
                description: [
                    "Una criatura paralizada está incapacitada (consulta Incapacitado) y no puede moverse ni hablar.",
                    "<br>La criatura falla automáticamente las tiradas de salvación de Fuerza y Destreza.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja.",
                    "<br>Todos los ataques que impacten a la criatura son críticos si el atacante está a 5 pies o menos de ella."
                ]
            },
            petrified: {
                name: "Petrificado",
                description: [
                    "Una criatura petrificada es transformada, junto con todos los objetos no mágicos que lleve encima o tenga puestos, en una sustancia sólida e inanimada (normalmente piedra). Su peso se multiplica por diez y deja de envejecer.",
                    "<br>La criatura está incapacitada (consulta el estado), no puede moverse o hablar y no es consciente de su entorno.",
                    "<br>La criatura fa lla automáticamente las tiradas de salvación de Fuerza y Destreza.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja.",
                    "<br>La criatura tiene resistencia contra todo el daño.",
                    "<br>La criatura es inmune al veneno y la enfermedad. Sin embargo. cua lquier enfermedad o veneno que ya estuviera presente en su cuerpo queda suspendido, pero no neutralizado."
                ]
            },
            poisoned: {
                name: "Envenenado",
                description: [
                    "Una criatura envenenada tiene desventaja en las tiradas de ataque y las pruebas de característica."
                ]
            },
            prone: {
                name: "Derribado",
                description: [
                    "Una criatura derribada solo podrá moverse arrastrándose, a no ser que se levante, terminando así el estado.",
                    "<br>La criatura tiene desventaja en las tiradas de ataque.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja si el atacante está a 5 pies o menos de ella. Sin embargo, tienen desventaja si el atacante está a más distancia."
                ]
            },
            restrained: {
                name: "Apresado",
                description: [
                    "La velocidad de una criatura apresada es 0 y no puede aumentar por encima de este valor.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja y las tiradas de ataque hechas por la criatura tienen desventaja.",
                    "<br>La criatura tiene desventaja en las tiradas de salvación de Destreza."
                ]
            },
            stunned: {
                name: "Aturdido",
                description: [
                    "Una criatura aturdida está incapacitada (consulta el estado), no puede moverse y solo es capaz de hablar con voz entrecortada.",
                    "<br>La criatura falla automáticamente las tiradas de salvación de Fuerza y Destreza.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja."
                ]
            },
            unconscious: {
                name: "Inconsciente",
                description: [
                    "Una criatura inconsciente está incapacitada (consulta el estado), no puede moverse o hablar y no es consciente de su entorno.",
                    "<br>La criatura deja caer cualquier cosa que esté s ujetando y cae derribada.",
                    "<br>La criatura falla automáticamente las tiradas de salvación de Fuerza y Destreza.",
                    "<br>Las tiradas de ataque contra la criatura tienen ventaja.",
                    "<br>Todos los ataques que impacten a la criatura son críticos si el atacante está a 5 pies o menos de ella."
                ]
            },
        // ... all conditions
        },
        effects: {
            aid: {
                name: "Ayuda",
                description: [
                    "La criatura gana 5 puntos de HP máximos por cada nivel de ayuda que tenga."
                ]
            },
            bane: {
                name: "Perdición",
                description: [
                    "La criatura debe restar 1d4 de las tiradas de ataque o de salvación mientras dure el efecto."
                ]
            },
            bless: {
                name: "Bendecir",
                description: [
                    "La criatura puede añadir un d4 a sus tiradas de ataque o de salvación mientras dure el efecto."
                ]
            },
            bloodied: {
                name: "Desangrandose",
                description: [
                    "Los puntos de golpe de la criatura son iguales o inferiores a la mitad de sus puntos de golpe máximos."
                ]
            },
            concentration: {
                name: "Concentración",
                description: [
                    "La criatura está concentrada en un hechizo. La concentración se interrumpe si la criatura recibe daño y falla una tirada de salvación de Constitución."
                ]
            },
            curse: {
                name: "Maldición",
                description: [
                    "La maldición aplica una penalización específica, como puntos de golpe reducidos, desventaja en ciertas tiradas o incapacidad para recuperar puntos de golpe."
                ]
            },
            drained: {
                name: "consumido",
                description: [
                    "Los puntos de vida máximos de la criatura se reducen hasta que finaliza un descanso prolongado."
                ]
            },
            haste: {
                name: "Prisa",
                description: [
                    "La velocidad de la criatura se duplica.",
                    "Obtiene una bonificación de +2 a la CA.",
                    "Tiene ventaja en las tiradas de salvación de Destreza.",
                    "Obtiene una acción adicional cada turno (limitada a ciertas acciones)."
                ]
            },
            heroism: {
                name: "Heroísmo",
                description: [
                    "La criatura gana puntos de vida temporales al comienzo de cada turno mientras dura el efecto.",
                    "Es inmune a estar asustado."
                ]
            },
            hex: {
                name: "Maleficio",
                description: [
                    "La criatura tiene desventaja en las pruebas de habilidad de una habilidad elegida.",
                    "Recibe daño necrótico adicional de los ataques del lanzador."
                ]
            },
            inspire: {
                name: "Inspirar",
                description: [
                    "La criatura puede añadir un dado de Inspiración Bárdica a una prueba de característica, tirada de ataque o tirada de salvación."
                ]
            },
            invisible: {
                name: "Invisible",
                description: [
                    "Tes imposible ver a una criatura invisible sin la ayuda de magia o sentidos especiales. En lo que a esconderse respecta, se considera que la criatura se encuentra en una zona muy oscura, aunque se puede determinar su ubicación si esta hace algún ruido o deja huellas.",
                    "Las tiradas de ataque contra la criatura tienen desventaja y las tiradas de ataque hechas por la criatura tienen ventaja."
                ]
            },
            raging: {
                name: "Furia",
                description: [
                    "La criatura obtiene ventaja en las pruebas de Fuerza y ​​en las tiradas de salvación.",
                    "Los ataques con armas cuerpo a cuerpo de la criatura infligen daño adicional según el nivel.",
                    "La criatura tiene resistencia al daño contundente, perforante y cortante."
                ]
            },
            recharging: {
                name: "Recargando",
                description: [
                    "La habilidad de este monstruo se recarga después de su uso. Al final de sus turnos, tira un d6.", 
                    "<br>Si el resultado está dentro del rango de recarga especificado en la habilidad (por ejemplo, 5-6), la habilidad vuelve a estar disponible para usarse.", 
                    "<br>De lo contrario, no permanecerá disponible hasta la siguiente tirada de recarga exitosa."
                ]
            },
            sanctuary: {
                name: "Santuario",
                description: [
                    "Las criaturas que intenten atacar a la criatura protegida deben realizar una tirada de salvación de Sabiduría o elegir un nuevo objetivo."
                ]
            },
            shield: {
                name: "Escudo",
                description: [
                    "La criatura obtiene un aumento temporal a su CA (por ejemplo, el hechizo Escudo agrega +5 a la CA hasta el comienzo del siguiente turno)."
                ]
            },
            slow: {
                name: "Ralentizar",
                description: [
                    "La velocidad de la criatura se reduce a la mitad.",
                    "Supone una penalización de -2 a las tiradas de salvación de CA y Destreza.",
                    "No puede usar reacciones y solo puede realizar una acción o acción adicional en su turno."
                ]
            }
        },
        schools: {
            abjuration: {
                name: "Abjuración",
                description: ["La Escuela de Abjuración se centra en magia que bloquea, destierra o protege."]
                    
            },
            conjuration: {
                name: "Conjuración",
                description: ["La Escuela de Conjuración manipula la creación de objetos y criaturas, o su desaparición."]
            },
            divination: {
                name: "Adivinación",
                description: ["La Escuela de Adivinación se enfoca en revelar conocimiento e información,",
                            "<br>útil para leer textos antiguos, identificar objetos mágicos y detectar enemigos invisibles."]
            },
            enchantment: {
                name: "Encantamiento",
                description: ["Los hechizos de Encantamiento manipulan el estado mental del objetivo, alterando su comportamiento habitual."]
            },
            evocation: {
                name: "Evocación" ,
                description: ["La Escuela de Evocación libera energía mágica cruda, como llamas, hielo o energía arcana pura."]
            },
            illusion: {
                name: "Ilusión" ,
                description: ["La Escuela de Ilusión manipula los sentidos (vista, oído, temperatura) para crear percepciones falsas."]
            },
            necromancy: {
                name: "Nigromancia",
                description:[
                        "La Nigromancia manipula la energía vital y el equilibrio entre vida y muerte,",
                        "<br>mediante resurrección o daño necrótico."]
            },
            transmutation: {
                name: "Transmutación",
                description: ["La Transmutación altera propiedades físicas de objetos y seres, desde convertir metales hasta transformar formas."]
            }
        },
        travel: {
            fast: {
                name: "Rápido",
                description: ["Por minuto: 400 pies", "Por hora: 4 millas", "Por día: 30 millas", "Efecto: penalización de -5 a las puntuaciones pasivas de Sabiduría (Percepción)"]

            },
            normal: {
                name: "Normal",
                description: ["Por minuto: 300 pies","Por hora: 3 millas","Por día: 24 millas","Efecto-"]

            },
            slow: {
                name: "Slow",
                description: ["Por minuto: 200 pies", "Por hora: 2 millas", "Por día: 18 millas", "Efecto: Se puede usar sigilo"]

            },
        },
        travelCosts: {
            airship: {
                name: "Aeronave",
                description: ["Costo: 1 po por milla","Velocidad: 20mph"]
                    
            },
            galleon: {
                name: "Galeón",
                description: ["Costo: 5 pc por milla","Velocidad: 10mph"]
                    
            },
            coach: {
                name: "Carruaje",
                description: ["Costo: 2 pc por milla","Velocidad: 30mph"]
                    
            },
            teleportationCircle: {
                name: "Círculo de teletransporte",
                description: ["Costo: 2,500 po","Velocidad: Instantáneo"]
                    
            },
        },



        //Actions Section
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

        filterActionsButton: "Filtrar acciones",
        actionTableToHitBonus: "Bono de ataque : ",
        actionTableDamageMod: "Modificador de daño : ",
        actionTableDamageDice: "Dados de daño : ",
        actionTableDamageType: "Tipo de daño : ",
        actionTableDeleteButton: "Eliminar fila actual",


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



        proficiencies: {
            weapons: {
                categories: ["Arma Marcial", "Arma Simple"],
                simpleMelee: ["Clava", "Daga", "Gran Clava", "Hacha de Mano","Jabalina", "Martillo ligero", "Maza", "Bastón","Hoz", "Lanza"],
                simpleRanged: ["Ballesta Ligera", "Dardo", "Arco corto", "Honda"],
                martialMelee: ["Hacha de batalla", "Mangual", "Gruja", "Gran hacha","Espadón", "Alabarda", "Lanza", "Espada Larga","Mazo de guerra", "Lucero del alba", "Pica", "Estoque","Simitarra", "Espada Corta", "Tridente", "Pico de guerra","Martillo de guerra", "Látigo"],
                martialRanged: ["Cerbatana", "Ballesta de mano", "Ballesta pesada","Arco largo", "Red"]
            },
            armor: ["Liviano", "Media", "Pesada", "Escudo"],
            languages: {
                common: ["Comun", "Enano", "Elfo", "Gigante", "Gnomo","Duende", "Mediano", "Orco", "Leonino", "Minotauro","Lenguaje de Señas"],
                exotic: ["Abysal", "Celestial", "Dracónico", "Profundidades","Infernal", "Primordial", "Sylvano", "Canto de Ladron","Infracomún"]
            },
            tools: {
                artisan: ["Suministros del Alquimista", "Suministros para Cerveceros","Suministros para Calígrafos", "Herramientas de Carpintero","Herramientas del Cartógrafo", "Herramientas de zapatero","Utensilios de cocina", "Herramientas del Soplador de Vidrio","Herramientas de joyero", "Herramientas para Curtidor","Herramientas de Albañil", "Suministros para Pintores","Herramientas de Alfarero", "Herramientas de Herrero","Herramientas de Retoques", "Herramientas del Tejedor","Herramientas del Tallador de Madera"],
                gaming: ["Juego de dados", "Juego de Dragonchess","Juego de Cartas para Jugar", "Juego de Apuesta Inicial de Tres Dragones"],
                musical: ["Gaita", "Tambor", "Dulcimer", "Flauta", "Laúd","Lira", "Cuerno", "Flauta de pan", "Caramillo","Viola", "Gong de Guerra", "Flautas de Pájaros"],
                other: ["Kit de Disfraz", "Kit de Falsificación","Kit de Herbalismo", "Herramientas de Navegación","Kit de Envenenador", "Herramientas de Ladrón","Vehículos (Tierra)", "Vehículos (Agua)"]
            }
        },




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



        //This section is for variables used throughout the sheet needed for the changing of stats. 
        meleeWeapon: "Cuerpo a cuerpo",
        rangedWeapon: "A distancia",
        magicWeapon: "Mágico",


        //DM Section from here to the buttom.
        DMPageLinkInit: "Gestor de Iniciativa",
        DMTablesLinkInit: "Tablas DM",
        checklistsLinkInit: "Pendientes",
        SpellListLinkInit: "Lista de Hechizos",
        DocsLinkInit: "Notas",
        GoogleDocsLinkInit: "Google",

        'add-monster-button': "Añadir Monstruo",
        'add-player-button':"Añadir Jugador",
        'save-encounter': "Guardar Encuentro",
        'load-encounter':"Cargar Encuentro",
        conditionDMAddButton: "Añadir Condición",
        rollInitiative: "Auto Roll",
        'previous-turn-btn': "Turno anterior",
        'next-turn-btn': "Siguiente Turno",
        'request-player-stats': "Pedir Estadistica a Jugador",


        conditionsSectionLink: "Condiciones",
        effectsSectionLink: "Efectos",
        schoolsOfMagicSectionLink: "Magias",
        shopsSectionLink: "Tienda",
        travelSectionLink: "Viaje",
        npcListSectionLink: "PNJs",
        skillsTableSectionLink: "Habilidades",
        jumpingRulesSectionLink: "Saltos",
        RandomSectionLink: "Tabla Aleatoria",

        ConditionTableRowHeader01: "Condiciones",
        ConditionTableRowHeader02: "Descripción",
        EffectTableRowHeader01: "Efectos",
        EffectTableRowHeader02: "Descripción",
        effectsAddRowButton: "Añadir fila",
        SchoolTableRowHeader01: "Escuela",
        SchoolTableRowHeader02: "Descripción",

        travelTableHeader: "Ritmo de viaje",
        travelTableHeader01: "Paso",
        travelTableHeader02: "Velocidad / Efectos",

        travelCostTableHeader: "Transporte; Servicios de viajes",
        travelCostTableHeader01: "Servicio",
        travelCostTableHeader02: "Costo / Velocidad",

        jumpCalculatorTitle: "Calculadora de Salto",
        strengthLabel: "Cuál es tu puntuación de fuerza",
        heightLabel: "Que tan alto eres",
        feetLabel: "pies",
        inchesLabel: "pulgadas",
        multiplierLabel: "Multiplica tus resultados por",
        runningHeader: "Si comenzaste corriendo (10 pies de movimiento)",
        runningLongLabel: "La longitud del salto es",
        runningLongUnit: "pies",
        runningHighLabel: "La altura del salto es ",
        runningHighUnit: "pies",
        runningReachLabel: "Agarrar algo a ",
        runningReachUnit: "pies de distancia",
        standingHeader: "Sin comenzar corriendo ",
        standingLongLabel: "Tu longitud del salto es ",
        standingLongUnit: "pies",
        standingHighLabel: "La altura del salto es ",
        standingHighUnit: "pies",
        standingReachLabel: "Agarrar algo a",
        standingReachUnit: "pies de distancia",

        checklistHeader: "Listas de Verificación",
        addChecklistbutton: "Agregar",

        DocsHeader: "Notas del DM",
        DocsAddButton: "+ Agregar Grupo",




        //Custom things section for both Dm Screen and Player Sheet. 
        monsterFormTitle: "Crear Monstruo Personalizado",
        monsterNameLabel: "Nombre:",
        monsterTypeLabel: "Tipo:",
        monsterCRLabel: "Valor de ND:",
        monsterSourceLabel: "Fuente:",
        monsterHPLabel: "Valor de PV:",
        monsterHPNotesLabel: "Notas de PV:",
        monsterACLabel: "Valor de CA:",
        monsterACNotesLabel: "Notas de CA:",
        monsterInitiativeLabel: "Valor de Iniciativa:",
        monsterSpeedLabel: "Velocidad:",
        monsterSensesLabel: "Sentidos:",
        monsterLanguagesLabel: "Idiomas:",
        abilitiesLegend: "Habilidades",
        monsterStrLabel: "FUE:",
        monsterDexLabel: "DES:",
        monsterConLabel: "CON:",
        monsterIntLabel: "INT:",
        monsterWisLabel: "SAB:",
        monsterChaLabel: "CAR:",
        savesLegend: "Salvaciones",
        monsterStrSaveLabel: "FUE:",
        monsterDexSaveLabel: "DES:",
        monsterConSaveLabel: "CON:",
        monsterIntSaveLabel: "INT:",
        monsterWisSaveLabel: "SAB:",
        monsterChaSaveLabel: "CAR:",
        skillsLegend: "Habilidades",
        monsterAcrobaticsLabel: "Acrobacias (DES):",
        monsterAnimalHandlingLabel: "Manejo de Animales (SAB):",
        monsterArcanaLabel: "Arcanos (INT):",
        monsterAthleticsLabel: "Atletismo (FUE):",
        monsterDeceptionLabel: "Engaño (CAR):",
        monsterHistoryLabel: "Historia (INT):",
        monsterInsightLabel: "Perspicacia (SAB):",
        monsterIntimidationLabel: "Intimidación (CAR):",
        monsterInvestigationLabel: "Investigación (INT):",
        monsterMedicineLabel: "Medicina (SAB):",
        monsterNatureLabel: "Naturaleza (INT):",
        monsterPerceptionLabel: "Percepción (SAB):",
        monsterPerformanceLabel: "Interpretación (CAR):",
        monsterPersuasionLabel: "Persuasión (CAR):",
        monsterReligionLabel: "Religión (INT):",
        monsterSleightOfHandLabel: "Juego de Manos (DES):",
        monsterStealthLabel: "Sigilo (DES):",
        monsterSurvivalLabel: "Supervivencia (SAB):",
        vulnerabilitiesLegend: "Vulnerabilidades al Daño",
        resistancesLegend: "Resistencias al Daño",
        immunitiesLegend: "Inmunidades al Daño",
        conditionImmunitiesLegend: "Inmunidades a Condiciones",
        quickActionsLegend: "Acciones Rápidas",
        traitsLegend: "Rasgos",
        actionsLegend: "Acciones",
        reactionsLegend: "Reacciones",
        legendaryActionsLegend: "Acciones Legendarias",
        saveMonsterButton: "Guardar Monstruo",
        addTraitButton: "Agregar Rasgo",
        addActionButton: "Agregar Acción",
        addReactionButton: "Agregar Reacción",
        addLegendaryActionsButton: "Agregar Acciones Legendarias",

        dynamicSections: {
            monsterFormTraits: "Rasgos",
            monsterFormActions: "Acciones",
            monsterFormReactions: "Reacciones",
            monsterFormLegendaryActions: "Acciones Legendarias",
            monsterFormQuickActions: "Acciones Rápidas"
        },

        monsterFormAdd: "Agregar",
        monsterFormRemove: "Eliminar",



        spellFormTitle: "Crear un Hechizo",
        spellNameLabel: "Nombre del Hechizo:",
        spellDescLabel: "Descripción del Hechizo:",
        higherLevelLabel: "Descripción de Lanzamiento a Nivel Superior:",
        spellRangeLabel: "Alcance del Hechizo:",
        spellComponentsLabel: "Componentes del Hechizo:",
        labelVerbal: "Verbal",
        labelSomatic: "Somático",
        labelMaterial: "Material",
        spellMaterialsLabel: "Materiales del Hechizo:",
        ritualLabel: "Hechizo Ritual:",
        ritualLabelOptionYes: "Sí",
        ritualLabelOptionNo: "No",
        durationLabel: "Duración:",
        durationLabelOptionInst: "Instantáneo",
        durationLabelOption1R: "1 Ronda",
        durationLabelOption1M: "1 Minuto",
        durationLabelOption10M: "10 Minutos",
        durationLabelOption1H: "1 Hora",
        durationLabelOption8H: "8 Horas",
        durationLabelOption12hr: "12 Horas",
        durationLabelOption24H: "24 Horas",
        durationLabelOptionUD: "Duración Indefinida",
        durationLabelOptionUT: "Hasta Destrucción",
        concentrationLabel: "Concentración:",
        concentrationLabelOptionNo: "No",
        concentrationLabelOptionYes: "Sí",
        castingTimeLabel: "Tiempo de Lanzamiento:",
        castingLabelOption1A: "1 Acción",
        castingLabelOption1BA: "1 Bonificación",
        castingLabelOption1R: "1 Reacción",
        castingLabelOption1M: "1 Minuto",
        castingLabelOption10M: "10 Minutos",
        castingLabelOption1H: "1 Hora",
        castingLabelOption8H: "8 Horas",
        castingLabelOption12hr: "12 Horas",
        castingLabelOption24H: "24 Horas",
        spellLevelLabel: "Nivel del Hechizo:",
        spellLevelLabelOptionC: "Truco",
        spellLevelLabelOption1: "Nivel 1",
        spellLevelLabelOption2: "Nivel 2",
        spellLevelLabelOption3: "Nivel 3",
        spellLevelLabelOption4: "Nivel 4",
        spellLevelLabelOption5: "Nivel 5",
        spellLevelLabelOption6: "Nivel 6",
        spellLevelLabelOption7: "Nivel 7",
        spellLevelLabelOption8: "Nivel 8",
        spellLevelLabelOption9: "Nivel 9",
        schoolLabel: "Escuela de Magia:",
        schoolLabelOptionA: "Abjuración",
        schoolLabelOptionC: "Conjuración",
        schoolLabelOptionD: "Adivinación",
        schoolLabelOptionEn: "Encantamiento",
        schoolLabelOptionEv: "Evocación",
        schoolLabelOptionI: "Ilusión",
        schoolLabelOptionN: "Nigromancia",
        schoolLabelOptionT: "Transmutación",
        spellClassesLabel: "Clases que Pueden Usarlo:",
        labelBarbarian: "Bárbaro",
        labelBard: "Bardo",
        labelCleric: "Clérigo",
        labelDruid: "Druida",
        labelFighter: "Guerrero",
        labelMonk: "Monje",
        labelPaladin: "Paladín",
        labelRanger: "Explorador",
        labelRogue: "Pícaro",
        labelSorcerer: "Hechicero",
        labelWarlock: "Brujo",
        labelWizard: "Mago",
        labelArtificer: "Artífice",
        toHitOrDCLabel: "Ataque o CD:",
        toHitOptionTH: "Tirada de Ataque",
        toHitOptionDC: "CD de Salvación",
        damageDiceLabel: "Dados de Daño:",
        damageDiceUpcastLabel: "Dados de Daño (Nivel Superior):",
        saveDCTypeLabel: "CD de Salvación del Hechizo:",
        abilityModifierLabel: "Agregar Modificador de Habilidad:",
        abilityOptionNo: "No",
        abilityOptionYes: "Sí",
        spellDamageTypeLabel: "Tipo de Daño:",
        saveSpell: "Guardar Hechizo",

        shopFormTitle: "Crear Tiendas Personalizadas",
        shopNameLabel: "Nombre de la Tienda: ",
        addshopItem: "Agregar Objeto al Grupo",
        shopGroupNameLabel: "Nombre del Grupo:",
        shopItemNameLabel: "Nombre del Objeto:",
        addShopGroup: "Agregar Grupo a la Tienda",
        createShop: "Crear/Actualizar Tienda",

        itemFormTitle: "Crear Equipamiento",
        equipmentNameLabel: "Nombre:",
        equipmentDescriptionLabel: "Descripción:",
        equipmentCategoryLabel: "Categoría:",
        equipmentRarityLabel: "Rareza:",
        equipmentCostLabel: "Costo:",
        equipmentWeightLabel: "Peso:",
        createEquipmentButton: "Crear Equipamiento",
        addItemtoGroupButton: "Agregar ítem al grupo",
        groupNameLabel: "Nombre del grupo:",
        itemNameLabel: "Nombre del ítem:",
        addItemtoGroupButton:    "Agregar ítem al grupo",
        groupNameLabel:          "Nombre del grupo:",
        itemNameLabel:           "Nombre del ítem:",
        equipmentCategoryOptionWeapon: "Arma",
        equipmentCategoryOptionArmor: "Armadura",
        equipmentCategoryOptionWonderous: "Objeto Maravilloso",
        equipmentCategoryOptionPotion: "Poción",
        equipmentCategoryOptionAdventuring: "Equipo de Aventurero",
        equipmentRarityOptionCommon: "Común",
        equipmentRarityOptionUncommon: "Poco Común",
        equipmentRarityOptionRare: "Raro",
        equipmentRarityOptionVery: "Muy Raro",
        equipmentRarityOptionLegendary: "Legendario",

        addMagicBonusButton:     "Agregar bono mágico",
        magicBonusesLabel:       "Bonos mágicos:",

        weaponTypeLabel:         "Tipo de arma:",
        optionSimple:            "Simple",
        optionMartial:           "Marcial",

        attackStyleLabel:        "Estilo de ataque:",
        optionMelee:             "Cuerpo a cuerpo",
        optionRanged:            "A distancia",
        optionMeleeThrown:       "Cuerpo a cuerpo y Arrojadiza",
        rangeLabel:              "Alcance:",

        weaponPropertiesLabel:   "Propiedades del arma:",
        labelFinesse:            "Finesa",
        labelVersatile:          "Versátil",
        labelHeavy:              "Pesado",
        labelLight:              "Ligero",
        labelLoading:            "Carga",
        labelReach:              "Alcance",
        labelThrown:             "Arrojadiza",
        labelTwoHanded:          "A dos manos",
        labelSilvered:           "Plateado",
        labelSpecial:            "Especial",
        labelAmmunition:         "Munición",
        attunementLabel:         "Afinación",
        hasChargesLabel:         "Tiene cargas",

        damageDiceLabel:         "Dados de daño:",
        damageTypeLabel:         "Tipo de daño:",

        chargeResetLabel:        "¿Cuándo se reinicia?",
        optionLongRest:          "Descanso largo",
        optionShortRest:         "Descanso corto",
        optionAtDawn:            "Al amanecer",
        maxChargesLabel:         "Cargas máximas:",

        weaponToHitBonusLabel:   "Bonificación mágica al ataque:",
        weaponDamageBonusLabel:  "Bonificación mágica de daño:",

        armorTypeLabel:          "Tipo de armadura:",
        optionLightArmor:        "Ligera",
        optionMediumArmor:       "Media",
        optionHeavyArmor:        "Pesada",
        optionShield:            "Escudo",

        armorClassLabel:         "Clase de armadura base:",
        strMinimumLabel:         "Requisito de fuerza:",
        stealthDisadvantageLabel: "Desventaja de sigilo:",
        requiresAttunementLabel: "Requiere afinación:",

        gearCategoryLabel:       "Categoría de equipo:",

        potionEffectTypeLabel:   "Tipo de efecto de poción:",
        optionHealing:           "Curación",
        optionSpell:             "Hechizo",
        optionOther:             "Otro",
        healingFormulaLabel:     "Fórmula de curación:",
        spellNameLabel:          "Nombre del hechizo:",
        spellDurationLabel:      "Duración:",
        noConcentrationLabel:    "Sin concentración:",

        homebrewModalTitle: "Creador de Homebrew",
        localStorageLabel: "Almacenamiento Local - ",
        globalStorageLabel: "Almacenamiento Global - ",
        customMonsters: "Crear Monstruo",
        customMonsterSelectLabel: "Seleccionar Monstruo para Eliminar/Editar:",
        deleteCustomMonsters: "Eliminar Monstruo",
        editCustomMonsters: "Editar Monstruo",
        customSpells: "Crear Hechizo",
        importCustomSpell: "Importar Hechizo",
        customSpellSelectLabel: "Seleccionar Hechizo para Eliminar/Editar:",
        deleteCustomSpells: "Eliminar Hechizo",
        editCustomSpells: "Editar Hechizo",
        exportCustomSpell: "Exportar Hechizo",
        customItems: "Crear Objeto",
        importCustomItem: "Importar Objeto",
        customItemSelectLabel: "Seleccionar Objeto para Eliminar/Editar:",
        deleteCustomItems: "Eliminar Objeto",
        editCustomItems: "Editar Objeto",
        exportCustomItem: "Exportar Objeto",
        createCustomShops: "Crear Tienda",
        customShopSelectLabel: "Seleccionar Objeto para Eliminar/Editar:",
        deleteCustomShops: "Eliminar Tienda",
        importCharacterData: "Importar Datos del Personaje",
        customCharacterSelectLabel: "Selecciona un personaje para Exportar:",
        exportCharacterData: "Exportar Personaje",
        deleteCharacter: "Eliminar Personaje",

        shopHeadersTranslate: {
            item: "Objeto",
            cost: "Costo",
            weight: "Peso",
            category: "Categoría"
        },
        spellDetailsTranslate: {
            level: "Nivel",
            range: "Alcance",
            duration: "Duración",
            concentration: "Concentración",
            ritual: "Ritual",
            components: "Componentes",
            material: "Componentes Materiales",
            casting_time: "Tiempo de lanzamiento",
            class: "Clases",
            school: "Escuela",
            description: "Descripción",
            higher_level: "A Niveles Superiores"
        }
        

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

    checkboxData = [
        { label: translations[savedLanguage].actionFiltersAttacks, category: 'attacks' },
        { label: translations[savedLanguage].actionFiltersActions, category: 'actions' },
        { label: translations[savedLanguage].actionFiltersBonusActions, category: 'bonus-actions' },
        { label: translations[savedLanguage].actionFiltersReactions, category: 'reactions' },
        { label: translations[savedLanguage].actionFiltersOther, category: 'other' }
    ];
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
                                        <h2>${spellData.name}</h2>
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

                            if (conditionsSet.has('exhaustion')) {
                                // Loop through condition pills to find the Exhaustion condition and extract the number
                                const exhaustionHomebrew = document.getElementById("exhaustionHomebrew")
                                if (exhaustionHomebrew.checked) {
                                    conditionSpans.forEach(span => {
                                        const conditionText = span.textContent.trim(); // Get the text of the span, e.g., "Exhaustion 1"
                                        if (conditionText.startsWith(`${translations[savedLanguage].conditions.exhaustion.name}`)) {
                                            // Parse out the number from the text
                                            const exhaustionLevel = parseInt(conditionText.split(' ').pop(), 10); // Extract the number
                                            diceValue = diceValue - exhaustionLevel;
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
                            if (conditionsSet.has('Bless') || conditionsSet.has('Guidance') || conditionsSet.has('bless') || conditionsSet.has('guidance')) {
                                blessRoll = "1d4"; // Store the Bless or Guidance roll separately
                            }
                            if (conditionsSet.has('Bane') || conditionsSet.has('bane')) {
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

        // Combine the data
        const combinedData = {
            ...allCreatureData,
            ...monsterData
        };

        // Extract and sort monster names
        const monsterNames = Object.keys(combinedData).sort((a, b) => {
            // Remove articles for sorting (adjust based on language)
            const cleanA = a.replace(/^(the|a|an) /i, '');
            const cleanB = b.replace(/^(the|a|an) /i, '');
            
            // Case-insensitive comparison with fallback to case-sensitive
            return cleanA.localeCompare(cleanB, undefined, {
                sensitivity: 'base',
                numeric: true
            }) || a.localeCompare(b);
        });

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
    }, 200); // Delay in milliseconds (e.g., 300ms)
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




document.getElementById('exportCustomSpell').addEventListener("click", async () => {
    const spellKey = document.getElementById("customSpellSelect").value;
    exportData("Custom Spells",spellKey);
});
document.getElementById('exportCustomItem').addEventListener("click", async () => {
    const itemKey = document.getElementById("customItemSelect").value;
    exportData("Custom Equipment",itemKey);
});





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
        loadAndDisplayCustomShops()
    }
    if (myClientType === "player"){
        loadAndDisplayCharaceter()
    }

    loadAndDisplayCustomSpells()
    loadAndDisplayCustomItems()
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

function loadAndDisplayCustomShops() {
    loadDataFromGlobalStorage("Shop Data")
        .then((shops) => {
            const shopSelect = document.getElementById("customShopSelect");
            shopSelect.innerHTML = ""; // Clear existing options

            // Populate dropdown with monster names
            for (const monsterName in shops) {
                const option = document.createElement("option");
                option.value = monsterName;
                option.textContent = monsterName;
                shopSelect.appendChild(option);
            }

            // If no monsters exist, disable the dropdown and delete button
            if (Object.keys(shops).length === 0) {
                const placeholderOption = document.createElement("option");
                placeholderOption.value = "";
                placeholderOption.textContent = "No shops available";
                shopSelect.appendChild(placeholderOption);
                shopSelect.disabled = true;
                document.getElementById("deleteCustomShops").disabled = true;
            } else {
                shopSelect.disabled = false;
                document.getElementById("deleteCustomShops").disabled = false;
            }
        })
        .catch((error) => {
            console.error("Failed to load custom shops:", error);
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
        damageSelectElement = document.getElementById("spellDamageType01")
        populateDamageTypeDropdown(damageSelectElement);
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
    const toHitOrDCValue = this.value;
    const saveDCTypeSelect = document.getElementById('saveDCType');
    
    // Clear all options first
    saveDCTypeSelect.innerHTML = '';

    if (toHitOrDCValue === 'DC') {
        // Get the ability scores translations
        const abilityOptions = translations[savedLanguage].characterAbilityScores;

        // Create options for each ability score
        for (const key in abilityOptions) {
            const option = document.createElement("option");
            option.value = key;  // English key (str, dex, etc.)
            option.textContent = abilityOptions[key];  // Translated label
            saveDCTypeSelect.appendChild(option);
        }
        
    } else {
        // Add N/A option using translation
        const naOption = translations[savedLanguage].damageTypesTranslate.na;
        const option = document.createElement("option");
        option.value = "";
        option.textContent = naOption;
        saveDCTypeSelect.appendChild(option);
    }

    // Reset to first option
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
        ritual: document.getElementById('ritualForm').value.trim() ? ", R" : "",
        duration: document.getElementById('spellFormDuration').value.trim(),
        concentration: document.getElementById('concentrationForm').value.trim() ? "yes" : "no",
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
    console.log(document.getElementById('ritualForm').checked); // Log the spells for debugging

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
function populateDamageTypeDropdown(selectElement, savedType) {
    // Clear existing options
    selectElement.innerHTML = "";

    // Get damage types for the CURRENT language
    const damageTypes = translations[savedLanguage].damageTypesTranslate;

    // Populate options dynamically using the damageTypes object
    for (const key in damageTypes) {
        const option = document.createElement("option");
        option.value = key; // Use the damage type key (e.g., 'slashing')
        option.textContent = damageTypes[key]; // Translated name (e.g., 'Slashing')
        selectElement.appendChild(option);

        if (savedType && savedType === key) {
            option.selected = true; // Set the saved type as selected
        }
    }

}



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
    const abilityOptions = translations[savedLanguage].characterAbilityScores; // Common DC attributes
    saveDCTypeSelect.innerHTML = `<option value="">N/A</option>`; // Default option
    for (const key in abilityOptions) {
            const option = document.createElement("option");
            option.value = key;  // English key (str, dex, etc.)
            option.textContent = abilityOptions[key];  // Translated label
            if (key === spell.spell_save_dc_type) {
            option.selected = true;            
        }
        saveDCTypeSelect.appendChild(option);
    }

    // Populate Ability Modifier
    const abilityModifierSelect = document.getElementById('abilityModifier');
    abilityModifierSelect.value = spell.ability_modifier || 'no';

    damageSelectElement = document.getElementById("spellDamageType01")
    savedType = spell.damage_type_01 || "";
    populateDamageTypeDropdown(damageSelectElement, savedType);
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
        resetItemForm();
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
    additionalFields.innerHTML = ""; // Clear existing content

    // Always pull “Add Magic Bonus” and its container from translations:
    const addMagicBonusButtonText = translations[savedLanguage].addMagicBonusButton;
    const magicBonusesLabelText = translations[savedLanguage].magicBonusesLabel;
    let magicBonusSection = `
        <button type="button" id="add-magic-bonus" class="nonRollButton">
          ${addMagicBonusButtonText}
        </button>
        <div>
            <label for="magic-bonuses">${magicBonusesLabelText}</label>
            <div id="magic-bonus-container"></div>
        </div>
    `;

    if (category === "weapon") {
        // Weapon Type dropdown
        const weaponTypeLabel     = translations[savedLanguage].weaponTypeLabel;
        const optionSimpleText    = translations[savedLanguage].optionSimple;
        const optionMartialText   = translations[savedLanguage].optionMartial;

        // Attack Style dropdown
        const attackStyleLabel    = translations[savedLanguage].attackStyleLabel;
        const optionMeleeText     = translations[savedLanguage].optionMelee;
        const optionRangedText    = translations[savedLanguage].optionRanged;
        const optionMeleeThrownText = translations[savedLanguage].optionMeleeThrown;

        // Range label (initially only Melee shown)
        const rangeLabelText      = translations[savedLanguage].rangeLabel;

        // Weapon Properties labels
        const weaponPropertiesLabel = translations[savedLanguage].weaponPropertiesLabel;
        const labelFinesseText      = translations[savedLanguage].labelFinesse;
        const labelVersatileText    = translations[savedLanguage].labelVersatile;
        const labelHeavyText        = translations[savedLanguage].labelHeavy;
        const labelLightText        = translations[savedLanguage].labelLight;
        const labelLoadingText      = translations[savedLanguage].labelLoading;
        const labelReachText        = translations[savedLanguage].labelReach;
        const labelThrownText       = translations[savedLanguage].labelThrown;
        const labelTwoHandedText    = translations[savedLanguage].labelTwoHanded;
        const labelSilveredText     = translations[savedLanguage].labelSilvered;
        const labelSpecialText      = translations[savedLanguage].labelSpecial;
        const labelAmmunitionText   = translations[savedLanguage].labelAmmunition;
        const attunementLabelText   = translations[savedLanguage].attunementLabel;
        const hasChargesLabelText   = translations[savedLanguage].hasChargesLabel;

        // Damage Dice & Type
        const damageDiceLabelText = translations[savedLanguage].damageDiceLabel;
        const damageTypeLabelText = translations[savedLanguage].damageTypeLabel;

        // Charges reset
        const chargeResetLabelText = translations[savedLanguage].chargeResetLabel;
        const optionLongRestText   = translations[savedLanguage].optionLongRest;
        const optionShortRestText  = translations[savedLanguage].optionShortRest;
        const optionAtDawnText     = translations[savedLanguage].optionAtDawn;
        const maxChargesLabelText  = translations[savedLanguage].maxChargesLabel;

        // Magical bonuses
        const toHitLabelText     = translations[savedLanguage].weaponToHitBonusLabel;
        const damageBonusLabelText = translations[savedLanguage].weaponDamageBonusLabel;

        additionalFields.innerHTML = `
            <div class="form-row">
                <label for="weapon-category">${weaponTypeLabel}</label>
                <select id="weapon-category">
                    <option value="simple">${optionSimpleText}</option>
                    <option value="martial">${optionMartialText}</option>
                </select>
            </div>

            <div id="weapon-configurator" class="form-row">
                <label for="attack-style">${attackStyleLabel}</label>
                <select id="attack-style">
                    <option value="Melee">${optionMeleeText}</option>
                    <option value="Ranged">${optionRangedText}</option>
                    <option value="Melee-thrown">${optionMeleeThrownText}</option>
                </select>
                <div id="range-inputs">
                    <label for="melee-range" class="range-label">${rangeLabelText}</label>
                    <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
                </div>
            </div>

            <div class="form-row">
                <label for="weaponProperties">${weaponPropertiesLabel}</label>
                <div id="weaponProperties">
                    <label>
                        <input type="checkbox" id="propertyFinesse" name="property" value="Finesse">
                        <span id="labelFinesse">${labelFinesseText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyVersatile" name="property" value="Versatile">
                        <span id="labelVersatile">${labelVersatileText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyHeavy" name="property" value="Heavy">
                        <span id="labelHeavy">${labelHeavyText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyLight" name="property" value="Light">
                        <span id="labelLight">${labelLightText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyLoading" name="property" value="Loading">
                        <span id="labelLoading">${labelLoadingText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyReach" name="property" value="Reach">
                        <span id="labelReach">${labelReachText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyThrown" name="property" value="Thrown">
                        <span id="labelThrown">${labelThrownText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyTwoHanded" name="property" value="Two-Handed">
                        <span id="labelTwoHanded">${labelTwoHandedText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertySilvered" name="property" value="Silvered">
                        <span id="labelSilvered">${labelSilveredText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertySpecial" name="property" value="Special">
                        <span id="labelSpecial">${labelSpecialText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyAmmunition" name="property" value="Ammunition">
                        <span id="labelAmmunition">${labelAmmunitionText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="propertyImprovised" name="property" value="Improvised">
                        <span id="labelImprovised">Improvised</span>
                    </label>
                    <label>
                        <input type="checkbox" id="itemFormAttunement" name="property" value="attunement">
                        <span id="attunement">${attunementLabelText}</span>
                    </label>
                    <label>
                        <input type="checkbox" id="has-charges" name="property" value="Has Charges">
                        <span id="has-charges">${hasChargesLabelText}</span>
                    </label>
                </div>
            </div>
    
            <div class="form-row">
                <label for="damage-dice">${damageDiceLabelText}</label>
                <input type="text" id="damage-dice" placeholder="e.g., 1d8" />
            </div>
            
            <div class="form-row">
            <label for="damage-type">${damageTypeLabelText}</label>
            <select id="damage-type">
                ${Object.entries(translations[savedLanguage].damageTypesTranslate)
                .map(([key, translated]) => `<option value="${key}">${translated}</option>`)
                .join("")}
            </select>
            </div>
    
            <div id="charges-options" style="display: none; margin-left: 20px;">
                <div class="form-row">
                    <label for="charge-reset">${chargeResetLabelText}</label>
                    <select id="charge-reset">
                        <option value="long-rest">${optionLongRestText}</option>
                        <option value="short-rest">${optionShortRestText}</option>
                        <option value="at-dawn">${optionAtDawnText}</option>
                    </select>
                </div>

                <div class="form-row">
                    <label for="max-charges">${maxChargesLabelText}</label>
                    <input type="number" id="max-charges" placeholder="e.g., 3" min="1"/>
                </div>
            </div>

            <div class="form-row">
                <label for="weapon-to-hit-bonus">${toHitLabelText}</label>
                <input type="number" id="weapon-to-hit-bonus" placeholder="e.g., 1"/>
            </div>

            <div class="form-row">
                <label for="weapon-damage-bonus">${damageBonusLabelText}</label>
                <input type="number" id="weapon-damage-bonus" placeholder="e.g., 1"/>
            </div>

            ${magicBonusSection}
        `;

        // Toggle “Charges” section visibility:
        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");
        hasChargesCheckbox.addEventListener("change", () => {
            chargesOptions.style.display = hasChargesCheckbox.checked ? "block" : "none";
        });

        // Listen for Attack Style changes:
        document.getElementById('attack-style').addEventListener('change', function () {
            const attackStyle = this.value;
            const rangeInputs = document.getElementById('range-inputs');
            rangeInputs.innerHTML = ''; // clear existing

            if (attackStyle === 'Melee') {
              rangeInputs.innerHTML = `
                <label for="melee-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
              `;
            } else if (attackStyle === 'Ranged') {
              rangeInputs.innerHTML = `
                <label for="short-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="short-range" class="range-input" name="short-range" placeholder="e.g., 30" />
                <label for="long-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="long-range" class="range-input" name="long-range" placeholder="e.g., 120" />
              `;
            } else if (attackStyle === 'Melee-thrown') {
              rangeInputs.innerHTML = `
                <label for="melee-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="melee-range" class="range-input" name="melee-range" placeholder="e.g., 5" />
                <label for="short-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="short-range" class="range-input" name="short-range" placeholder="e.g., 20" />
                <label for="long-range" class="range-label">${rangeLabelText}</label>
                <input type="number" id="long-range" class="range-input" name="long-range" placeholder="e.g., 60" />
              `;
            }
        });

        setupMagicBonusSelection();

    } else if (category === "armor") {
        const armorTypeLabelText     = translations[savedLanguage].armorTypeLabel;
        const optionLightArmorText   = translations[savedLanguage].optionLightArmor;
        const optionMediumArmorText  = translations[savedLanguage].optionMediumArmor;
        const optionHeavyArmorText   = translations[savedLanguage].optionHeavyArmor;
        const optionShieldText       = translations[savedLanguage].optionShield;

        const armorClassLabelText        = translations[savedLanguage].armorClassLabel;
        const strMinimumLabelText        = translations[savedLanguage].strMinimumLabel;
        const stealthDisadvantageText    = translations[savedLanguage].stealthDisadvantageLabel;
        const requiresAttunementText     = translations[savedLanguage].requiresAttunementLabel;
        const hasChargesLabelText        = translations[savedLanguage].hasChargesLabel;

        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="armor-category">${armorTypeLabelText}</label>
            <select id="armor-category">
                <option value="Light">${optionLightArmorText}</option>
                <option value="Medium">${optionMediumArmorText}</option>
                <option value="Heavy">${optionHeavyArmorText}</option>
                <option value="Shield">${optionShieldText}</option>
            </select>
        </div>
        
        <div class="form-row">
            <label for="armor-class">${armorClassLabelText}</label>
            <input type="number" id="armor-class" placeholder="e.g., 15" />
        </div>
        
        <div class="form-row">
            <label for="str-minimum">${strMinimumLabelText}</label>
            <input type="number" id="str-minimum" placeholder="e.g., 15" />
        </div>
        
        <div class="form-row">
            <label for="stealth-disadvantage">${stealthDisadvantageText}</label>
            <input type="checkbox" id="stealth-disadvantage" />
            <label for="itemFormAttunement">${requiresAttunementText}</label>
            <input type="checkbox" id="itemFormAttunement" />
            <label for="has-charges">${hasChargesLabelText}</label>
            <input type="checkbox" id="has-charges" />
        </div>
    
        <div id="charges-options" style="display: none; margin-left: 20px;">
            <div class="form-row">
                <label for="charge-reset">${chargeResetLabelText}</label>
                <select id="charge-reset">
                    <option value="long-rest">${optionLongRestText}</option>
                    <option value="short-rest">${optionShortRestText}</option>
                    <option value="at-dawn">${optionAtDawnText}</option>
                </select>
            </div>
            <div class="form-row">
                <label for="max-charges">${maxChargesLabelText}</label>
                <input type="number" id="max-charges" placeholder="e.g., 3" min="1" />
            </div>
        </div>
        ${magicBonusSection}
        `;

        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");
        hasChargesCheckbox.addEventListener("change", () => {
            chargesOptions.style.display = hasChargesCheckbox.checked ? "block" : "none";
        });
        setupMagicBonusSelection();

    } else if (category === "adventuring-gear") {
        const gearCategoryLabelText = translations[savedLanguage].gearCategoryLabel;

        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="gear-category">${gearCategoryLabelText}</label>
            <input type="text" id="gear-category" placeholder="e.g., Standard Gear" />
        </div>
        `;

    } else if (category === "wondrous-item") {
        const requiresAttunementText = translations[savedLanguage].requiresAttunementLabel;
        const hasChargesLabelText   = translations[savedLanguage].hasChargesLabel;

        additionalFields.innerHTML = `
        <div class="form-row">
            <label for="itemFormAttunement">${requiresAttunementText}</label>
            <input type="checkbox" id="itemFormAttunement"/>
            <label for="has-charges">${hasChargesLabelText}</label>
            <input type="checkbox" id="has-charges" />
        </div>
    
        <div id="charges-options" style="display: none; margin-left: 20px;">
            <div class="form-row">
                <label for="charge-reset">${chargeResetLabelText}</label>
                <select id="charge-reset">
                    <option value="long-rest">${optionLongRestText}</option>
                    <option value="short-rest">${optionShortRestText}</option>
                    <option value="at-dawn">${optionAtDawnText}</option>
                </select>
            </div>
            <div class="form-row">
                <label for="max-charges">${maxChargesLabelText}</label>
                <input type="number" id="max-charges" placeholder="e.g., 3" min="1" />
            </div>
        </div>
        ${magicBonusSection}
        `;

        const hasChargesCheckbox = document.getElementById("has-charges");
        const chargesOptions = document.getElementById("charges-options");
        hasChargesCheckbox.addEventListener("change", () => {
            chargesOptions.style.display = hasChargesCheckbox.checked ? "block" : "none";
        });
        setupMagicBonusSelection();

    } else if (category === "potion") {
        const potionEffectTypeLabelText = translations[savedLanguage].potionEffectTypeLabel;
        const optionHealingText         = translations[savedLanguage].optionHealing;
        const optionSpellText           = translations[savedLanguage].optionSpell;
        const optionOtherText           = translations[savedLanguage].optionOther;
        const healingFormulaLabelText   = translations[savedLanguage].healingFormulaLabel;
        const spellNameLabelText        = translations[savedLanguage].spellNameLabel;
        const spellDurationLabelText    = translations[savedLanguage].spellDurationLabel;
        const noConcentrationLabelText  = translations[savedLanguage].noConcentrationLabel;

        additionalFields.innerHTML = `
          <div class="form-row">
            <label>${potionEffectTypeLabelText}</label>
            <label>
              <input type="radio" name="potion-effect" value="healing" checked>
              ${optionHealingText}
            </label>
            <label>
              <input type="radio" name="potion-effect" value="spell">
              ${optionSpellText}
            </label>
            <label>
              <input type="radio" name="potion-effect" value="other">
              ${optionOtherText}
            </label>
          </div>
          <div id="healing-effect" class="potion-effect-section">
            <div class="form-row">
              <label for="healing-dice">${healingFormulaLabelText}</label>
              <input type="text" id="healing-dice" placeholder="e.g., 2d4+2" />
            </div>
          </div>
          <div id="spell-effect" class="potion-effect-section" style="display: none;">
            <div class="form-row">
              <label for="spell-name">${spellNameLabelText}</label>
              <input type="text" id="spell-name" placeholder="e.g., Clairvoyance" />
            </div>
            <div class="form-row">
              <label for="spell-duration">${spellDurationLabelText}</label>
              <input type="text" id="spell-duration" placeholder="e.g., 1 hour" />
            </div>
            <div class="form-row">
              <label for="no-concentration">${noConcentrationLabelText}</label>
              <input type="checkbox" id="no-concentration" />
            </div>
          </div>
        `;
    
        // Toggle between healing and spell sections
        document.querySelectorAll('input[name="potion-effect"]').forEach(radio => {
          radio.addEventListener('change', function() {
            document.querySelectorAll('.potion-effect-section').forEach(div => {
              div.style.display = 'none';
            });
            document.getElementById(`${this.value}-effect`).style.display = 'block';
          });
        });
    }

    // Any additional event listeners for Magic Bonus, etc.
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
    if (equipmentData.equipment_category.index === "potion") {
        equipmentData.gear_category = {
          index: "consumable",
          name: "Consumable"
        };
      }

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
    // Process potion-specific data
    if (equipmentData.equipment_category.index === "potion") {
    const effectType = document.querySelector('input[name="potion-effect"]:checked').value;

    if (effectType === "healing") {
        const healingDice = document.getElementById("healing-dice").value;
        equipmentData.properties.push({
        index: "healing",
        name: `Heals ${healingDice}`
        });
    } else {
        const spellName = document.getElementById("spell-name").value;
        const duration = document.getElementById("spell-duration").value;
        const noConcentration = document.getElementById("no-concentration").checked;
        
        let spellEffect = `${spellName} spell`;
        if (duration) spellEffect += ` for ${duration}`;
        if (noConcentration) spellEffect += " (no Concentration required)";
        
        equipmentData.properties.push({
        index: "Cast Spell",
        name: spellEffect
        });
    }
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





function populateConditionSelect() {
    // Select the target dropdown by its ID
    const conditionSelect = document.getElementById("condition-select");

    // Clear existing options (if needed)
    conditionSelect.innerHTML = "";

    // Get the translated conditions and effects
    const conditionObj = translations[savedLanguage].conditions;
    const effectObj = translations[savedLanguage].effects;

    // Combine conditions and effects into a single array
    const allConditionsAndEffects = [
        ...Object.keys(conditionObj).map(key => ({
            key: key,
            name: conditionObj[key].name,
            type: "condition"
        })),
        ...Object.keys(effectObj).map(key => ({
            key: key,
            name: effectObj[key].name,
            type: "effect"
        }))
    ].sort((a, b) => a.name.localeCompare(b.name));
    
    // Add each sorted option to the dropdown
    allConditionsAndEffects.forEach(entry => {
        const option = document.createElement("option");
        option.value = entry.key;
        option.textContent = entry.name;
        conditionSelect.appendChild(option);
    });
}






// Edit Item Button Handler
document.getElementById("editCustomItems").addEventListener("click", async () => {
    const itemSelect = document.getElementById("customItemSelect");
    const selectedItem = itemSelect.value;

    if (selectedItem) {
        try {
            const items = await loadDataFromGlobalStorage("Custom Equipment");
            const itemData = items[selectedItem];
            if (itemData) {
                populateItemForm(itemData);
                itemFormModal.style.display = 'block';
                homebrewModal.style.display = 'none';
            } else {
                errorModal(`Item "${selectedItem}" not found.`);
            }
        } catch (error) {
            console.error("Error loading item:", error);
        }
    } else {
        errorModal("No item selected for editing.");
    }
});




function populateItemForm(itemData) {
    resetItemForm();
    
    // Set basic fields
    document.getElementById('equipment-name').value = itemData.name;
    document.getElementById('equipment-description').value = itemData.description.join('\n');
    
    // Handle category mapping for shields
    const category = itemData.equipment_category.index === 'shield' 
        ? 'armor' 
        : itemData.equipment_category.index;
    document.getElementById('equipment-category').value = category;
    
    document.getElementById('equipment-rarity').value = itemData.rarity.index;
    document.getElementById('equipment-cost').value = itemData.cost.quantity;
    document.getElementById('equipment-cost-unit').value = itemData.cost.unit;
    document.getElementById('equipment-weight').value = itemData.weight;

    // Force update dynamic fields
    const categorySelect = document.getElementById('equipment-category');
    updateDynamicFields(categorySelect.value);
    
    // Delay population to ensure DOM updates
    setTimeout(() => {
        switch(category) {
            case 'weapon':
                populateWeaponFields(itemData);
                break;
            case 'armor':
                populateArmorFields(itemData);
                break;
            case 'wondrous-item':
                populateWondrousItemFields(itemData);
                break;
            case 'potion':
                populatePotionFields(itemData);
                break;
        }

        // Handle magic bonuses once here
        if (itemData.bonus) {
            itemData.bonus.forEach(bonus => addMagicBonusRow(bonus));
        }
    }, 100);
}

function populateWeaponFields(itemData) {
    // Weapon category and attack style
    document.getElementById('weapon-category').value = itemData.weapon_category;
    document.getElementById('attack-style').value = itemData.weapon_range;
    document.getElementById('attack-style').dispatchEvent(new Event('change'));

    // Range values
    if (itemData.range) {
        if (itemData.weapon_range === 'Melee') {
            document.getElementById('melee-range').value = itemData.range.normal;
        } else if (itemData.weapon_range === 'Ranged') {
            document.getElementById('short-range').value = itemData.range.normal;
            document.getElementById('long-range').value = itemData.range.long;
        } else if (itemData.weapon_range === 'Melee-thrown') {
            document.getElementById('melee-range').value = itemData.range.normal;
            document.getElementById('short-range').value = itemData.throw_range.normal;
            document.getElementById('long-range').value = itemData.throw_range.long;
        }
    }

    // Damage and properties
    document.getElementById('damage-dice').value = itemData.damage?.damage_dice || '';
    document.getElementById('damage-type').value = itemData.damage?.damage_type?.name || '';
    document.getElementById('weapon-to-hit-bonus').value = itemData.toHitBonus || '';
    document.getElementById('weapon-damage-bonus').value = itemData.damageBonus || '';

    // Checkboxes
    const properties = itemData.properties.map(p => p.name);
    document.querySelectorAll('#weaponProperties input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = properties.includes(checkbox.value);
    });
    const hasChargesCheckbox = document.getElementById('has-charges');
    if (itemData.hasCharges) {
        hasChargesCheckbox.checked = true;
        hasChargesCheckbox.dispatchEvent(new Event('change')); // Trigger visibility update
        document.getElementById('charge-reset').value = itemData.chargesOptions?.chargeReset || 'long-rest';
        document.getElementById('max-charges').value = itemData.chargesOptions?.maxCharges || 0;
    }
}

function populateArmorFields(itemData) {
    // Determine if editing a shield (new check)
    const isShield = itemData.equipment_category.index === 'shield' || 
                    itemData.armor_category === 'Shield';

    // Set armor category selector
    const armorCategory = isShield ? 'Shield' : itemData.armor_category;
    document.getElementById('armor-category').value = armorCategory;

    // Handle shield-specific properties
    const stealthCheckbox = document.getElementById('stealth-disadvantage');
    if (isShield) {
        stealthCheckbox.checked = false;
        stealthCheckbox.disabled = true;
        document.getElementById('armor-class').value = itemData.armor_class?.base || 2; // Default shield AC
    } else {
        document.getElementById('armor-class').value = itemData.armor_class?.base || '';
        stealthCheckbox.checked = itemData.stealthDisadvantage || false;
        stealthCheckbox.disabled = false;
    }

    // Set remaining fields
    document.getElementById('str-minimum').value = itemData.strengthRequirement || '';
    document.getElementById('itemFormAttunement').checked = itemData.properties?.some(p => p.index === 'attunement') || false;

    // Handle charges
    const hasChargesCheckbox = document.getElementById('has-charges');
    if (itemData.hasCharges) {
        hasChargesCheckbox.checked = true;
        hasChargesCheckbox.dispatchEvent(new Event('change')); // Trigger visibility update
        document.getElementById('charge-reset').value = itemData.chargesOptions?.chargeReset || 'long-rest';
        document.getElementById('max-charges').value = itemData.chargesOptions?.maxCharges || 0;
    }
}


function populateWondrousItemFields(itemData) {
    // Handle attunement
    const attunementCheckbox = document.getElementById('itemFormAttunement');
    attunementCheckbox.checked = itemData.properties?.some(p => p.index === 'attunement') || false;

    const hasChargesCheckbox = document.getElementById('has-charges');
    if (itemData.hasCharges) {
        hasChargesCheckbox.checked = true;
        hasChargesCheckbox.dispatchEvent(new Event('change')); // Trigger visibility update
        document.getElementById('charge-reset').value = itemData.chargesOptions?.chargeReset || 'long-rest';
        document.getElementById('max-charges').value = itemData.chargesOptions?.maxCharges || 0;
    }
}

function populatePotionFields(itemData) {
    // Determine effect type from properties
    const effectType = itemData.properties?.find(p => p.index === 'healing') ? 'healing' :
                      itemData.properties?.find(p => p.index === 'Cast Spell') ? 'spell' : 'other';

    // Set radio button
    document.querySelector(`input[name="potion-effect"][value="${effectType}"]`).checked = true;
    
    // Trigger visibility update
    document.querySelectorAll('input[name="potion-effect"]').forEach(radio => {
        if (radio.checked) radio.dispatchEvent(new Event('change'));
    });

    // Populate effect-specific fields
    if (effectType === 'healing') {
        const healingValue = itemData.properties.find(p => p.index === 'healing')?.name.match(/\d+d\d+[\+−]\d+|\d+d\d+/)[0];
        document.getElementById('healing-dice').value = healingValue || '';
    } 
    else if (effectType === 'spell') {
        const spellEffect = itemData.properties.find(p => p.index === 'Cast Spell')?.name;
        const spellMatch = spellEffect?.match(/(.*?) spell(?: for (.*?))?( \(no Concentration required\))?$/);
        
        if (spellMatch) {
            document.getElementById('spell-name').value = spellMatch[1] || '';
            document.getElementById('spell-duration').value = spellMatch[2] || '';
            document.getElementById('no-concentration').checked = !!spellMatch[3];
        }
    }
}



function addMagicBonusRow(bonus) {
    const container = document.getElementById('magic-bonus-container');
    if (!container) return;

    // Create new row
    const row = document.createElement('div');
    row.className = 'magic-bonus-row';
    
    // Generate category options
    const categoryOptions = Object.keys(characterStatBonuses)
        .filter(c => c !== 'None') // Exclude None category
        .map(c => `<option value="${c}" ${c === bonus.category ? 'selected' : ''}>${c}</option>`)
        .join('');

    // Generate stat options
    const statOptions = ['STR','DEX','CON','INT','WIS','CHA']
        .map(s => `<option value="${s}" ${s === bonus.value ? 'selected' : ''}>${s}</option>`)
        .join('');

    row.innerHTML = `
        <select class="magic-category-select">
            ${categoryOptions}
        </select>
        <select class="magic-bonus-select"></select>
        <select class="value-or-stat-select">
            <option value="value" ${typeof bonus.value === 'number' ? 'selected' : ''}>Value</option>
            <option value="stat" ${typeof bonus.value === 'string' ? 'selected' : ''}>Stat</option>
        </select>
        <input type="number" class="magic-bonus-value" 
               value="${typeof bonus.value === 'number' ? bonus.value : ''}"
               style="${typeof bonus.value === 'string' ? 'display: none;' : ''}">
        <select class="magic-stat-select" 
                style="${typeof bonus.value === 'number' ? 'display: none;' : ''}">
            ${statOptions}
        </select>
        <button class="remove-magic-bonus nonRollButton">Remove</button>
    `;

    // Initialize bonus select
    const categorySelect = row.querySelector('.magic-category-select');
    const bonusSelect = row.querySelector('.magic-bonus-select');
    
    // Populate bonus options based on initial category
    const populateBonusOptions = () => {
        bonusSelect.innerHTML = '';
        const category = categorySelect.value;
        if (characterStatBonuses[category]) {
            Object.keys(characterStatBonuses[category]).forEach(key => {
                const option = new Option(key, key);
                option.selected = key === bonus.key;
                bonusSelect.add(option);
            });
        }
    };
    
    categorySelect.addEventListener('change', populateBonusOptions);
    populateBonusOptions(); // Initial population

    // Handle value/stat toggle
    const valueTypeSelect = row.querySelector('.value-or-stat-select');
    valueTypeSelect.addEventListener('change', function() {
        const isValue = this.value === 'value';
        row.querySelector('.magic-bonus-value').style.display = isValue ? 'inline-block' : 'none';
        row.querySelector('.magic-stat-select').style.display = isValue ? 'none' : 'inline-block';
    });

    row.querySelector('.remove-magic-bonus').addEventListener('click', () => row.remove());
    
    container.appendChild(row);
}

function resetItemForm() {
    if (itemForm) itemForm.reset();
    
    const additionalFields = document.getElementById('additional-fields');
    if (additionalFields) additionalFields.innerHTML = '';
    
}

