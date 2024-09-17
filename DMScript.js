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
        name: 'Goblin',
        hp: { current: 15, max: 15 },
        ac: 13,
        speed: '30 ft.',
        info: 'Small, green, and cunning.',
        initiative: 0,
        stats: {
            str: 8,
            dex: 14,
            con: 10,
            int: 10,
            wis: 8,
            cha: 8
        },
        savingThrows: 'DEX +2',
        skills: 'Stealth +6, Perception +2',
        damageImmunities: '',
        conditionImmunities: '',
        senses: 'Darkvision 60 ft., Passive Perception 9',
        languages: 'Common, Goblin',
        challenge: '1/4 (50 XP)',
        specialAbilities: [
            {
                name: 'Nimble Escape',
                desc: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.'
            }
        ],
        actions: [
            {
                name: 'Scimitar',
                desc: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'
            },
            {
                name: 'Shortbow',
                desc: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'
            }
        ]
    },
    {
        name: 'Orc',
        hp: { current: 30, max: 30 },
        ac: 16,
        speed: '30 ft.',
        info: 'Big, brutish, and aggressive.',
        initiative: 0,
        stats: {
            str: 16,
            dex: 12,
            con: 16,
            int: 7,
            wis: 11,
            cha: 10
        },
        savingThrows: 'STR +5, CON +3',
        skills: 'Intimidation +2',
        damageImmunities: '',
        conditionImmunities: '',
        senses: 'Darkvision 60 ft., Passive Perception 10',
        languages: 'Common, Orc',
        challenge: '1/2 (100 XP)',
        specialAbilities: [
            {
                name: 'Aggressive',
                desc: 'As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.'
            }
        ],
        actions: [
            {
                name: 'Greataxe',
                desc: 'Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 9 (1d12 + 3) slashing damage.'
            },
            {
                name: 'Javelin',
                desc: 'Melee or Ranged Weapon Attack: +5 to hit, range 30/120 ft., one target. Hit: 7 (1d6 + 3) piercing damage.'
            }
        ]
    },
    {
        name: 'Dragon',
        hp: { current: 200, max: 200 },
        ac: 19,
        speed: '40 ft., fly 80 ft.',
        info: 'A powerful and fearsome creature.',
        initiative: 0,
        stats: {
            str: 27,
            dex: 10,
            con: 25,
            int: 16,
            wis: 13,
            cha: 21
        },
        savingThrows: 'DEX +5, CON +12, WIS +6, CHA +10',
        skills: 'Perception +16, Stealth +5',
        damageImmunities: 'Fire',
        conditionImmunities: '',
        senses: 'Blindsight 60 ft., Darkvision 120 ft., Passive Perception 26',
        languages: 'Common, Draconic',
        challenge: '17 (18,000 XP)',
        specialAbilities: [
            {
                name: 'Legendary Resistance (3/Day)',
                desc: 'If the dragon fails a saving throw, it can choose to succeed instead.'
            },
            {
                name: 'Frightful Presence',
                desc: 'Each creature of the dragon\'s choice that is within 120 feet and aware of it must succeed on a DC 16 Wisdom saving throw or become frightened for 1 minute.'
            }
        ],
        actions: [
            {
                name: 'Multiattack',
                desc: 'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.'
            },
            {
                name: 'Bite',
                desc: 'Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.'
            },
            {
                name: 'Claw',
                desc: 'Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage.'
            },
            {
                name: 'Fire Breath (Recharge 5-6)',
                desc: 'The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 20 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.'
            }
        ]
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
    createEmptyMonsterCard();
});



function createEmptyMonsterCard() {
    // Create the monster card container
    const card = document.createElement('div');
    card.classList.add('monster-card');


    // Add event listener to show details on clicking the monster cards
    card.addEventListener('click', function() {
        const monsterName = card.querySelector('.monster-name').textContent.replace(/\s\([A-Z]\)$/, '');
        showMonsterCardDetails(monsterName);
    });
    

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
    monsters.forEach(monster => {
        const listItem = document.createElement('li');
        listItem.textContent = monster.name;
        listItem.addEventListener('click', () => {
            // Find the selected monster
            const selectedMonster = monsters.find(m => m.name === listItem.textContent);

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
    const existingNames = Array.from(document.getElementsByClassName('monster-name'))
                               .map(nameElem => nameElem.textContent.replace(/\s\([A-Z]\)$/, ''));
    const count = existingNames.filter(name => name === monster.name).length;
    monsterName.textContent = `${monster.name} (${String.fromCharCode(65 + count)})`;

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
        const populateField = (elementId, label, value) => {
            const element = document.getElementById(elementId);
            if (value || value === 0) {
                element.innerHTML = `<strong>${label}:</strong> ${value}`;
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
            document.getElementById('monsterStatsDivider').style.display = 'block';
        } else {
            document.getElementById('monsterStats').style.display = 'none';
            document.getElementById('monsterStatsDivider').style.display = 'none';
        }

        // Other fields
        populateField('monsterSavingThrows', 'Saving Throws', monster.savingThrows);
        populateField('monsterSkills', 'Skills', monster.skills);
        populateField('monsterDamageImmunities', 'Damage Immunities', monster.damageImmunities);
        populateField('monsterConditionImmunities', 'Condition Immunities', monster.conditionImmunities);
        populateField('monsterSenses', 'Senses', monster.senses);
        populateField('monsterLanguages', 'Languages', monster.languages);
        populateField('monsterChallenge', 'Challenge', monster.challenge);

        // Special abilities (if any)
        if (monster.specialAbilities && monster.specialAbilities.length > 0) {
            const abilitiesText = monster.specialAbilities.map(ability => `<strong>${ability.name}:</strong> ${ability.desc}`).join('<br>');
            populateField('monsterAbilities', '', abilitiesText);
            document.getElementById('monsterAbilitiesDivider').style.display = 'block';
        } else {
            document.getElementById('monsterAbilities').style.display = 'none';
            document.getElementById('monsterAbilitiesDivider').style.display = 'none';
        }

        // Actions (if any)
        if (monster.actions && monster.actions.length > 0) {
            const actionsText = monster.actions.map(action => `<strong>${action.name}:</strong> ${action.desc}`).join('<br>');
            populateField('monsterActions', 'Actions', actionsText);
            document.getElementById('monsterActionsDivider').style.display = 'block';
        } else {
            document.getElementById('monsterActions').style.display = 'none';
            document.getElementById('monsterActionsDivider').style.display = 'none';
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


