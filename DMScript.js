// TS.realtime.onSyncMessage((message, source) => {
//     // Check if the message is from the PlayerScript
//     if (source === "PlayerScript") {
//         // Process the message, e.g., extract the roll result and update the UI
//         const rollResult = extractRollResult(message);
//         // Update the DMScript UI with the roll result
//     }
// });

function extractRollResult(message) {
    console.log(message)
    // Implement a function to extract the roll result from the message
    // You might need to parse the message to get the roll result.
    // For example, you can use regular expressions or string manipulation.
    // The message might be something like "Player rolled a 4 on the dice".
    // Extract the number (4) and return it as the roll result.
    // This will depend on the format of your messages.
}


const monsters = [
    {
        "Ancient Black Dragon": {
            "Id": "Ancient Black Dragon",
            "Name": "Ancient Black Dragon",
            "Path": "",
            "Source": "Monster Manual",
            "Type": "Gargantuan dragon, chaotic evil",
            "HP": {
                "Value": 367,
                "Notes": "(21d20+147)"
            },
            "AC": {
                "Value": 22,
                "Notes": "(natural armor)"
            },
            "InitiativeModifier": 2,
            "InitiativeAdvantage": false,
            "Speed": [
                "40 ft.",
                "fly 80 ft.",
                "swim 40 ft."
            ],
            "Abilities": {
                "Str": 27,
                "Dex": 14,
                "Con": 25,
                "Int": 16,
                "Wis": 15,
                "Cha": 19
            },
            "DamageVulnerabilities": [],
            "DamageResistances": [],
            "DamageImmunities": [
                "acid"
            ],
            "ConditionImmunities": [],
            "Saves": [
                {
                    "Name": "Dex",
                    "Modifier": 9
                },
                {
                    "Name": "Con",
                    "Modifier": 14
                },
                {
                    "Name": "Wis",
                    "Modifier": 9
                },
                {
                    "Name": "Cha",
                    "Modifier": 11
                }
            ],
            "Skills": [
                {
                    "Name": "Perception",
                    "Modifier": 16
                },
                {
                    "Name": "Stealth",
                    "Modifier": 9
                }
            ],
            "Senses": [
                "blindsight 60 ft.",
                "darkvision 120 ft."
            ],
            "Languages": [
                "Common",
                "Draconic"
            ],
            "Challenge": "21",
            "Traits": [
                {
                    "Name": "Amphibious",
                    "Content": "The dragon can breathe air and water.",
                    "Usage": ""
                },
                {
                    "Name": "Legendary Resistance (3/Day)",
                    "Content": "If the dragon fails a saving throw, it can choose to succeed instead.",
                    "Usage": ""
                }
            ],
            "Actions": [
                {
                    "Name": "Multiattack",
                    "Content": "The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.",
                    "Usage": ""
                },
                {
                    "Name": "Bite",
                    "Content": "Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) acid damage.",
                    "Usage": ""
                },
                {
                    "Name": "Claw",
                    "Content": "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage.",
                    "Usage": ""
                },
                {
                    "Name": "Tail",
                    "Content": "Melee Weapon Attack: +15 to hit, reach 20 ft ., one target. Hit: 17 (2d8 + 8) bludgeoning damage.",
                    "Usage": ""
                },
                {
                    "Name": "Frightful Presence",
                    "Content": "Each creature of the dragon's choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to the dragon's Frightful Presence for the next 24 hours.",
                    "Usage": ""
                },
                {
                    "Name": "Acid Breath (Recharge 5-6)",
                    "Content": "The dragon exhales acid in a 90-foot line that is 10 feet wide. Each creature in that line must make a DC 22 Dexterity saving throw, taking 67 (15d8) acid damage on a failed save, or half as much damage on a successful one.",
                    "Usage": ""
                }
            ],
            "Reactions": [],
            "LegendaryActions": [
                {
                    "Name": "Detect",
                    "Content": "The dragon makes a Wisdom (Perception) check.",
                    "Usage": ""
                },
                {
                    "Name": "Tail Attack",
                    "Content": "The dragon makes a tail attack.",
                    "Usage": ""
                },
                {
                    "Name": "Wing Attack (Costs 2 Actions)",
                    "Content": "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
                    "Usage": ""
                }
            ],
            "Description": "",
            "Player": "",
            "Version": "1.8.0",
            "ImageURL": ""
        },
        "Aboleth": {
            "Id": "Aboleth",
            "Name": "Aboleth",
            "Path": "",
            "Source": "Monster Manual",
            "Type": "Large aberration, lawful evil",
            "HP": {
                "Value": 135,
                "Notes": "(18d10+36)"
            },
            "AC": {
                "Value": 17,
                "Notes": "(natural armor)"
            },
            "InitiativeModifier": -1,
            "InitiativeAdvantage": false,
            "Speed": [
                "10 ft.",
                "swim 40 ft."
            ],
            "Abilities": {
                "Str": 21,
                "Dex": 9,
                "Con": 15,
                "Int": 18,
                "Wis": 15,
                "Cha": 18
            },
            "DamageVulnerabilities": [],
            "DamageResistances": [],
            "DamageImmunities": [],
            "ConditionImmunities": [],
            "Saves": [
                {
                    "Name": "Con",
                    "Modifier": 6
                },
                {
                    "Name": "Int",
                    "Modifier": 8
                },
                {
                    "Name": "Wis",
                    "Modifier": 6
                }
            ],
            "Skills": [
                {
                    "Name": "History",
                    "Modifier": 12
                },
                {
                    "Name": "Perception",
                    "Modifier": 10
                }
            ],
            "Senses": [
                "darkvision 120 ft."
            ],
            "Languages": [
                "Deep Speech",
                "telepathy 120 ft."
            ],
            "Challenge": "10",
            "Traits": [
                {
                    "Name": "Amphibious",
                    "Content": "The aboleth can breathe air and water.",
                    "Usage": ""
                },
                {
                    "Name": "Mucous Cloud",
                    "Content": "While underwater, the aboleth is surrounded by transformative mucus. A creature that touches the aboleth or that hits it with a melee attack while within 5 ft. of it must make a DC 14 Constitution saving throw. On a failure, the creature is diseased for 1d4 hours. The diseased creature can breathe only underwater.",
                    "Usage": ""
                },
                {
                    "Name": "Probing Telepathy",
                    "Content": "If a creature communicates telepathically with the aboleth, the aboleth learns the creature's greatest desires if the aboleth can see the creature.",
                    "Usage": ""
                }
            ],
            "Actions": [
                {
                    "Name": "Multiattack",
                    "Content": "The aboleth makes three tentacle attacks.",
                    "Usage": ""
                },
                {
                    "Name": "Tentacle",
                    "Content": "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 12 (2d6 + 5) bludgeoning damage. If the target is a creature, it must succeed on a DC 14 Constitution saving throw or become diseased. The disease has no effect for 1 minute and can be removed by any magic that cures disease. After 1 minute, the diseased creature's skin becomes translucent and slimy, the creature can't regain hit points unless it is underwater, and the disease can be removed only by heal or another disease-curing spell of 6th level or higher. When the creature is outside a body of water, it takes 6 (1d12) acid damage every 10 minutes unless moisture is applied to the skin before 10 minutes have passed.",
                    "Usage": ""
                },
                {
                    "Name": "Tail",
                    "Content": "Melee Weapon Attack: +9 to hit, reach 10 ft. one target. Hit: 15 (3d6 + 5) bludgeoning damage.",
                    "Usage": ""
                },
                {
                    "Name": "Enslave (3/day)",
                    "Content": "The aboleth targets one creature it can see within 30 ft. of it. The target must succeed on a DC 14 Wisdom saving throw or be magically charmed by the aboleth until the aboleth dies or until it is on a different plane of existence from the target. The charmed target is under the aboleth's control and can't take reactions, and the aboleth and the target can communicate telepathically with each other over any distance.\nWhenever the charmed target takes damage, the target can repeat the saving throw. On a success, the effect ends. No more than once every 24 hours, the target can also repeat the saving throw when it is at least 1 mile away from the aboleth.",
                    "Usage": ""
                }
            ],
            "Reactions": [],
            "LegendaryActions": [
                {
                    "Name": "Detect",
                    "Content": "The aboleth makes a Wisdom (Perception) check.",
                    "Usage": ""
                },
                {
                    "Name": "Tail Swipe",
                    "Content": "The aboleth makes one tail attack.",
                    "Usage": ""
                },
                {
                    "Name": "Psychic Drain (Costs 2 Actions)",
                    "Content": "One creature charmed by the aboleth takes 10 (3d6) psychic damage, and the aboleth regains hit points equal to the damage the creature takes.",
                    "Usage": ""
                }
            ],
            "Description": "",
            "Player": "",
            "Version": "1.8.0",
            "ImageURL": ""
        },
        "Djinni": {
            "Id": "Djinni",
            "Name": "Djinni",
            "Path": "",
            "Source": "Monster Manual",
            "Type": "Large elemental, chaotic good",
            "HP": {
                "Value": 161,
                "Notes": "(14d10+84)"
            },
            "AC": {
                "Value": 17,
                "Notes": "(natural armor)"
            },
            "InitiativeModifier": 2,
            "InitiativeAdvantage": false,
            "Speed": [
                "30 ft.",
                "fly 90 ft."
            ],
            "Abilities": {
                "Str": 21,
                "Dex": 15,
                "Con": 22,
                "Int": 15,
                "Wis": 16,
                "Cha": 20
            },
            "DamageVulnerabilities": [],
            "DamageResistances": [],
            "DamageImmunities": [
                "lightning",
                "thunder"
            ],
            "ConditionImmunities": [],
            "Saves": [
                {
                    "Name": "Dex",
                    "Modifier": 6
                },
                {
                    "Name": "Wis",
                    "Modifier": 7
                },
                {
                    "Name": "Cha",
                    "Modifier": 9
                }
            ],
            "Skills": [],
            "Senses": [
                "darkvision 120 ft."
            ],
            "Languages": [
                "Auran"
            ],
            "Challenge": "11",
            "Traits": [
                {
                    "Name": "Elemental Demise",
                    "Content": "If the djinni dies, its body disintegrates into a warm breeze, leaving behind only equipment the djinni was wearing or carrying.",
                    "Usage": ""
                },
                {
                    "Name": "Innate Spellcasting",
                    "Content": "The djinni's innate spellcasting ability is Charisma (spell save DC 17, +9 to hit with spell attacks). It can innately cast the following spells, requiring no material components: \n\nAt will: detect evil and good, detect magic, thunderwave 3/day each: create food and water (can create wine instead of water), tongues, wind walk\n1/day each: conjure elemental (air elemental only), creation, gaseous form, invisibility, major image, plane shift",
                    "Usage": ""
                },
                {
                    "Name": "Variant: Genie Powers",
                    "Content": "Genies have a variety of magical capabilities, including spells. A few have even greater powers that allow them to alter their appearance or the nature of reality.\n\nDisguises.\nSome genies can veil themselves in illusion to pass as other similarly shaped creatures. Such genies can innately cast the disguise self spell at will, often with a longer duration than is normal for that spell. Mightier genies can cast the true polymorph spell one to three times per day, possibly with a longer duration than normal. Such genies can change only their own shape, but a rare few can use the spell on other creatures and objects as well.\nWishes.\nThe genie power to grant wishes is legendary among mortals. Only the most potent genies, such as those among the nobility, can do so. A particular genie that has this power can grant one to three wishes to a creature that isn't a genie. Once a genie has granted its limit of wishes, it can't grant wishes again for some amount of time (usually 1 year). and cosmic law dictates that the same genie can expend its limit of wishes on a specific creature only once in that creature's existence.\nTo be granted a wish, a creature within 60 feet of the genie states a desired effect to it. The genie can then cast the wish spell on the creature's behalf to bring about the effect. Depending on the genie's nature, the genie might try to pervert the intent of the wish by exploiting the wish's poor wording. The perversion of the wording is usually crafted to be to the genie's benefit.",
                    "Usage": ""
                }
            ],
            "Actions": [
                {
                    "Name": "Multiattack",
                    "Content": "The djinni makes three scimitar attacks.",
                    "Usage": ""
                },
                {
                    "Name": "Scimitar",
                    "Content": "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage plus 3 (1d6) lightning or thunder damage (djinni's choice).",
                    "Usage": ""
                },
                {
                    "Name": "Create Whirlwind",
                    "Content": "A 5-foot-radius, 30-foot-tall cylinder of swirling air magically forms on a point the djinni can see within 120 feet of it. The whirlwind lasts as long as the djinni maintains concentration (as if concentrating on a spell). Any creature but the djinni that enters the whirlwind must succeed on a DC 18 Strength saving throw or be restrained by it. The djinni can move the whirlwind up to 60 feet as an action, and creatures restrained by the whirlwind move with it. The whirlwind ends if the djinni loses sight of it.\nA creature can use its action to free a creature restrained by the whirlwind, including itself, by succeeding on a DC 18 Strength check. If the check succeeds, the creature is no longer restrained and moves to the nearest space outside the whirlwind.",
                    "Usage": ""
                }
            ],
            "Reactions": [],
            "LegendaryActions": [],
            "Description": "",
            "Player": "",
            "Version": "1.8.0",
            "ImageURL": ""
        },
        "Zombie": {
            "Id": "Zombie",
            "Name": "Zombie",
            "Path": "",
            "Source": "",
            "Type": "M undead, monster manual, neutral evil",
            "HP": {
                "Value": 22,
                "Notes": "(3d8+9)"
            },
            "AC": {
                "Value": 8,
                "Notes": ""
            },
            "InitiativeModifier": -2,
            "InitiativeAdvantage": false,
            "Speed": [
                "20 ft."
            ],
            "Abilities": {
                "Str": 13,
                "Dex": 6,
                "Con": 16,
                "Int": 3,
                "Wis": 6,
                "Cha": 5
            },
            "DamageVulnerabilities": [],
            "DamageResistances": [],
            "DamageImmunities": [],
            "ConditionImmunities": [
                "poisoned"
            ],
            "Saves": [
                {
                    "Name": "Wis",
                    "Modifier": 0
                }
            ],
            "Skills": [],
            "Senses": [
                "darkvision 60 ft."
            ],
            "Languages": [
                "understands all languages it spoke in life but can't speak"
            ],
            "Challenge": "1/4",
            "Traits": [
                {
                    "Name": "Undead Fortitude",
                    "Content": "If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5+the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.",
                    "Usage": ""
                }
            ],
            "Actions": [
                {
                    "Name": "Slam",
                    "Content": "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.",
                    "Usage": ""
                }
            ],
            "Reactions": [],
            "LegendaryActions": [],
            "Description": "",
            "Player": "",
            "Version": "1.5.6",
            "ImageURL": "https://www.aidedd.org/dnd/images/zombie.jpg"
        }
    }
    // Add more monsters as needed
];


const playerCharacters = [
    { name: 'Mira', hp: { current: 30, max: 30 }, ac: 14, initiative: 0 },
    { name: 'Sterling', hp: { current: 40, max: 40 }, ac: 17, initiative: 0 }
    // Add more player characters as needed
];

// Initialize the tracker (Removed initial call to renderMonsterCards())

// Event listener for adding a new empty monster card
document.getElementById('add-monster-button').addEventListener('click', function() {
    createEmptyMonsterCard(monsters);
});


function createEmptyMonsterCard(monstersJSON) {
    // Create the monster card container
    const card = document.createElement('div');
    card.classList.add('monster-card');

    // Create the dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container');

    // Create the input field for monster names
    const nameInput = document.createElement('input');
    nameInput.classList.add('monster-name-input');
    nameInput.placeholder = 'Select or type a monster name...';

    // Create the dropdown list
    const monsterList = document.createElement('ul');
    monsterList.classList.add('monster-list');

    // Populate the dropdown list with monster names
    monstersJSON.forEach(monster => {
        const listItem = document.createElement('li');
        listItem.textContent = monster.name;
        listItem.addEventListener('click', () => {
            // Find the selected monster
            const selectedMonster = monstersJSON.find(m => m.name === listItem.textContent);

            // Update the monster card with selected monster's details
            updateMonsterCard(card, selectedMonster);

            // Hide the dropdown after selection
            monsterList.style.display = 'none';
        });
        monsterList.appendChild(listItem);
    });

    // Add event listener to show/hide the dropdown list
    nameInput.addEventListener('focus', () => {
        monsterList.style.display = 'block'; // Show dropdown on focus
    });

    // Add event listener to filter the dropdown list
    nameInput.addEventListener('input', () => {
        const filterText = nameInput.value.toLowerCase();
        monsterList.querySelectorAll('li').forEach(li => {
            const monsterName = li.textContent.toLowerCase();
            li.style.display = monsterName.includes(filterText) ? 'block' : 'none';
        });
    });

    // Hide the dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!dropdownContainer.contains(event.target)) {
            monsterList.style.display = 'none';
        }
    });

    // Append elements to the card
    dropdownContainer.appendChild(nameInput);
    dropdownContainer.appendChild(monsterList);
    card.appendChild(dropdownContainer);

    // Append the card to the container
    const tracker = document.getElementById('monster-cards-container');
    if (tracker) {
        tracker.appendChild(card);
    } else {
        console.error('Initiative tracker container not found.');
    }
}




function updateMonsterCard(card, monster) {
    // Clear previous content
    card.innerHTML = '';

    // Create and add monster details
    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');

    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = monster.initiative || 0; // Default initiative value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards(); // Reorder cards when initiative is changed
    });

    initDiv.appendChild(initInput);

    const monsterInfo = document.createElement('div');
    monsterInfo.classList.add('monster-info');

    const monsterName = document.createElement('div');
    monsterName.classList.add('monster-name');

    // Add unique identifier to the monster name
    const existingNames = Array.from(document.getElementsByClassName('monster-name')).map(nameElem => nameElem.textContent.replace(/\s\([A-Z]\)$/, ''));
    const count = existingNames.filter(name => name === monster.name).length;
    monsterName.textContent = `${monster.name} (${String.fromCharCode(65 + count)})`;

    // Add event listener to show details on clicking the monster name
    monsterName.addEventListener('click', function() {
        const monsterNameText = monsterName.textContent.replace(/\s\([A-Z]\)$/, '');
        showMonsterCardDetails(monsterNameText);
    });

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${monster.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${monster.hp.current}"> / ${monster.hp.max}</span>
    `;

    monsterInfo.appendChild(monsterName);
    monsterInfo.appendChild(statsDiv);

    card.appendChild(initDiv);
    card.appendChild(monsterInfo);

    // Re-append the dropdown container to the card
    const dropdownContainer = card.querySelector('.dropdown-container');
    if (dropdownContainer) {
        card.appendChild(dropdownContainer);
    }
}



// Function to populate the monster card with selected monster data
function populateMonsterCard(card, monster) {
    // Clear the existing monster info
    const monsterInfo = card.querySelector('.monster-info');
    monsterInfo.innerHTML = '';

    // Set the monster's initiative to the default or current value
    const initInput = card.querySelector('.init-input');
    initInput.value = monster.initiative || 0;

    // Set up monster information
    const monsterName = document.createElement('div');
    monsterName.classList.add('monster-name');
    monsterName.textContent = monster.name;

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${monster.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${monster.hp.current}"> / ${monster.hp.max}</span>
    `;

    // Append the monster details to the card
    monsterInfo.appendChild(monsterName);
    monsterInfo.appendChild(statsDiv);

    reorderCards(); // Reorder cards after adding the new monster
}




let currentSelectedMonsterName = '';

function showMonsterCardDetails(monsterName) {
    // Check if the monster card is currently visible
    const monsterCardContainer = document.getElementById('monsterCardContainer');

    if (monsterCardContainer.classList.contains('visible') && currentSelectedMonsterName === monsterName) {
        // Hide the card if it's already open
        monsterCardContainer.classList.remove('visible');
        monsterCardContainer.classList.add('hidden');
        return; // Exit the function early
    }

    // Find the monster in the playerCharacters or monsters list
    const allMonsters = [...monsters, ...playerCharacters];
    const monster = allMonsters.find(mon => mon.name === monsterName);

    if (monster) {
        currentSelectedMonsterName = monsterName;

        // Reusable function to populate data conditionally
        const populateField = (elementId, label, value, isRollable = false) => {
            const element = document.getElementById(elementId);
            if (value || value === 0) {
                const labelText = label ? `<strong>${label}:</strong><br>` : ''; // Add colon and break only if label exists
        
                if (isRollable) {
                    // Use parseAndReplaceDice to handle rollable text
                    element.innerHTML = ''; // Clear the element content
                    const parsedContent = parseAndReplaceDice({ name: label }, value);
                    const labelNode = document.createElement('span');
                    labelNode.innerHTML = labelText;
                    element.appendChild(labelNode);
                    element.appendChild(parsedContent);
                } else {
                    element.innerHTML = `${labelText}${value}`;
                }
        
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        };

        // Populating the monster card with data
        document.getElementById('monsterName').textContent = monster.name;
        populateField('monsterType', '', monster.type); // No label needed for monster type
        populateField('monsterAC', 'Armor Class', monster.ac);
        populateField('monsterHP', 'Hit Points', monster.hp ? `${monster.hp.current} / ${monster.hp.max}` : '');
        populateField('monsterSpeed', 'Speed', monster.speed);

        // Check and display monster stats (STR, DEX, CON, INT, WIS, CHA)
        if (monster.stats) {
            const { str, dex, con, int, wis, cha } = monster.stats;
            const statsText = `STR ${str} | DEX ${dex} | CON ${con} | INT ${int} | WIS ${wis} | CHA ${cha}`;
            populateField('monsterStats', '', statsText);
            document.getElementById('monsterStatHR').style.display = 'block';
        } else {
            document.getElementById('monsterStats').style.display = 'none';
            document.getElementById('monsterStatHR').style.display = 'none';
        }

        // Other fields
        populateField('monsterSavingThrows', 'Saving Throws', monster.savingThrows, true);
        populateField('monsterSkills', 'Skills', monster.skills, true);
        populateField('monsterDamageImmunities', 'Damage Immunities', monster.damageImmunities);
        populateField('monsterConditionImmunities', 'Condition Immunities', monster.conditionImmunities);
        populateField('monsterSenses', 'Senses', monster.senses);
        populateField('monsterLanguages', 'Languages', monster.languages);
        populateField('monsterChallenge', 'Challenge', monster.challenge);

        // Special abilities (if any)
        if (monster.specialAbilities && monster.specialAbilities.length > 0) {
            const abilitiesText = monster.specialAbilities.map(ability => `<strong>${ability.name}:</strong> ${ability.desc}`).join('<br>');
            populateField('monsterAbilities', '', abilitiesText, true); // Mark as rollable
            document.getElementById('monsterAbilitiesHR').style.display = 'block';
        } else {
            document.getElementById('monsterAbilities').style.display = 'none';
            document.getElementById('monsterAbilitiesHR').style.display = 'none';
        }

        // Actions (if any)
        if (monster.actions && monster.actions.length > 0) {
            const actionsText = monster.actions.map(action => `<strong>${action.name}:</strong> ${action.desc}`).join('<br>');
            populateField('monsterActions', 'Actions', actionsText, true); // Mark as rollable
            document.getElementById('monsterActionsHR').style.display = 'block';
        } else {
            document.getElementById('monsterActions').style.display = 'none';
            document.getElementById('monsterActionsHR').style.display = 'none';
        }

        // Show the monster card with the slide-in animation
        monsterCardContainer.classList.remove('hidden');
        monsterCardContainer.classList.add('visible');

        // Add an event listener to the close button
        document.getElementById('closeMonsterCard').onclick = function() {
            monsterCardContainer.classList.remove('visible');
            monsterCardContainer.classList.add('hidden');
            currentSelectedMonsterName = '';
        };

        // Make sure the card is visible (in case it was previously hidden)
        monsterCardContainer.style.display = 'block';
    }
    rollableButtons()
}


































// Event listener for adding a new empty player card
document.getElementById('add-player-button').addEventListener('click', function() {
    createEmptyPlayerCard();
});

function createEmptyPlayerCard() {
    // Create the player card container
    const card = document.createElement('div');
    card.classList.add('monster-card'); // Reuse monster-card class for styling

    // Create the dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container');

    // Create the input field for player names
    const nameInput = document.createElement('input');
    nameInput.classList.add('monster-name-input');
    nameInput.placeholder = 'Select or type a player name...';

    // Create the dropdown list
    const playerList = document.createElement('ul');
    playerList.classList.add('monster-list');

    // Populate the dropdown list with player names
    playerCharacters.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = player.name;
        listItem.addEventListener('click', () => {
            // Find the selected player
            const selectedPlayer = playerCharacters.find(p => p.name === listItem.textContent);

            // Update the card with selected player's details
            updatePlayerCard(card, selectedPlayer);

            // Hide the dropdown after selection
            playerList.style.display = 'none';
        });
        playerList.appendChild(listItem);
    });

    // Add event listener to show/hide the dropdown list
    nameInput.addEventListener('focus', () => {
        playerList.style.display = 'block'; // Show dropdown on focus
    });

    // Add event listener to filter the dropdown list
    nameInput.addEventListener('input', () => {
        const filterText = nameInput.value.toLowerCase();
        playerList.querySelectorAll('li').forEach(li => {
            const playerName = li.textContent.toLowerCase();
            li.style.display = playerName.includes(filterText) ? 'block' : 'none';
        });
    });

    // Hide the dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!dropdownContainer.contains(event.target)) {
            playerList.style.display = 'none';
        }
    });

    // Append elements to the card
    dropdownContainer.appendChild(nameInput);
    dropdownContainer.appendChild(playerList);
    card.appendChild(dropdownContainer);

    // Append the card to the container
    const tracker = document.getElementById('initiative-tracker');
    if (tracker) {
        tracker.appendChild(card);
    } else {
        console.error('Initiative tracker container not found.');
    }
}

function updatePlayerCard(card, player) {
    // Clear previous content
    card.innerHTML = '';

    // Create and add player details
    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');

    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = player.initiative || 0; // Default initiative value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards(); // Reorder cards when initiative is changed
    });

    initDiv.appendChild(initInput);

    const playerInfo = document.createElement('div');
    playerInfo.classList.add('monster-info'); // Reuse monster-info class

    const playerName = document.createElement('div');
    playerName.classList.add('monster-name'); // Reuse monster-name class
    playerName.innerText = player.name;

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${player.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${player.hp.current}"> / ${player.hp.max}</span>
    `;

    playerInfo.appendChild(playerName);
    playerInfo.appendChild(statsDiv);

    card.appendChild(initDiv);
    card.appendChild(playerInfo);

    // Re-append the dropdown container to the card
    const dropdownContainer = card.querySelector('.dropdown-container');
    if (dropdownContainer) {
        card.appendChild(dropdownContainer);
    }
}








function reorderCards() {
    const tracker = document.getElementById("initiative-tracker");
    
    // Ensure tracker exists
    if (!tracker) {
        console.error("Initiative tracker element not found.");
        return;
    }
    
    // Retrieve all cards
    const cards = Array.from(tracker.getElementsByClassName("monster-card"));
    
    // Check if cards array is empty
    if (cards.length === 0) {
        console.warn("No monster cards to reorder.");
        return;
    }
    
    // Debugging: Log the initiative values before sorting
    console.log('Before sorting:', cards.map(card => ({
        name: card.querySelector('.monster-name') ? card.querySelector('.monster-name').innerText : 'No name',
        initiative: card.querySelector('.init-input') ? card.querySelector('.init-input').value : 'No initiative'
    })));
    
    // Sort the cards based on initiative
    cards.sort((a, b) => {
        const aInit = parseInt(a.querySelector(".init-input").value, 10) || 0;
        const bInit = parseInt(b.querySelector(".init-input").value, 10) || 0;
        return bInit - aInit; // Higher initiative first
    });
    
    // Debugging: Log the sorted initiative values
    console.log('After sorting:', cards.map(card => ({
        name: card.querySelector('.monster-name') ? card.querySelector('.monster-name').innerText : 'No name',
        initiative: card.querySelector('.init-input') ? card.querySelector('.init-input').value : 'No initiative'
    })));
    
    // Remove existing cards and append them back in the correct order
    cards.forEach(card => {
        tracker.appendChild(card);
    });
}

function monsterConditions(){
    console.log("Grab a monster and add a condition to it")
}

const conditionsMap = new Map();