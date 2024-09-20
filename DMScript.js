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

let monsterNames
let monsterData

function establishMonsterData(){
    const monsterDataObject = AppData.monsterLookupInfo;
    monsterNames = monsterDataObject.monsterNames;
    monsterData = monsterDataObject.monsterData;
}







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
    monsterNames.forEach(monsterName => {
        const listItem = document.createElement('li');
        listItem.textContent = monsterName;
        listItem.addEventListener('click', () => {
            // Find the selected monster
            const selectedMonster = monsterName;

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




function updateMonsterCard(card, monsterName) {
    // Clear previous content
    card.innerHTML = '';

    // Fetch the current monster data
    const currentMonsterData = monsterData[monsterName];

    if (!currentMonsterData) {
        console.error(`Monster data not found for: ${monsterName}`);
        return;
    }

    // Create and add the initiative box
    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');

    // Input for the initiative roll
    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = 0; // Default initiative roll value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards(); // Reorder cards when initiative is changed
    });

    initDiv.appendChild(initInput);


    const monsterPictureDiv = document.createElement('div');
    monsterPictureDiv.classList.add('monster-picture-div');
    const monsterPicture = document.createElement('img');
    monsterPicture.classList.add('monster-picture');

   monsterPictureDiv.appendChild(monsterPicture);

    // Create the monster info container
    const monsterInfo = document.createElement('div');
    monsterInfo.classList.add('monster-info');

    // Create the monster name div
    const monsterNameDiv = document.createElement('div');
    monsterNameDiv.classList.add('monster-name');

    // Add a unique identifier to the monster name
    const existingNames = Array.from(document.getElementsByClassName('monster-name')).map(nameElem => nameElem.textContent.replace(/\s\([A-Z]\)$/, ''));
    const count = existingNames.filter(name => name === monsterName).length;
    monsterNameDiv.textContent = `${currentMonsterData.Name} (${String.fromCharCode(65 + count)})`;

    // Add event listener to show details on clicking the monster name
    monsterNameDiv.addEventListener('click', function () {
        const monsterNameText = monsterNameDiv.textContent.replace(/\s\([A-Z]\)$/, '');
        showMonsterCardDetails(monsterNameText);
    });

    // Create the stats div
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-details');

    // Add AC, Speed, and Passive Perception
    statsDiv.innerHTML = `
        <span>AC : ${currentMonsterData.AC.Value} | Init Mod : ${currentMonsterData.InitiativeModifier} <br> Speed : ${currentMonsterData.Speed}</span>
    `;

    console.log(currentMonsterData.InitiativeModifier)

    // Add monster name and stats to the monster info
    monsterInfo.appendChild(monsterNameDiv);
    monsterInfo.appendChild(statsDiv);


    const conditionsDiv = document.createElement('div');
    conditionsDiv.classList.add('conditions-trackers')

    // Create the HP and adjustments container
    const monsterHP = document.createElement('div');
    monsterHP.classList.add('monster-hp');

    // Current HP element
    const currentHPDiv = document.createElement('span');
    currentHPDiv.classList.add('current-hp');
    currentHPDiv.contentEditable = true;
    currentHPDiv.textContent = currentMonsterData.HP.Value;

    // Max HP element
    const maxHPDiv = document.createElement('span');
    maxHPDiv.classList.add('max-hp');
    maxHPDiv.contentEditable = true;
    maxHPDiv.textContent = currentMonsterData.HP.Value;

    // HP display container
    const hpDisplay = document.createElement('div');
    hpDisplay.classList.add('hp-display');
    hpDisplay.appendChild(currentHPDiv);
    hpDisplay.appendChild(document.createTextNode(' / '));
    hpDisplay.appendChild(maxHPDiv);

    // Heal/Damage input (Math)
    const hpAdjustInput = document.createElement('input');
    hpAdjustInput.type = 'number';
    hpAdjustInput.classList.add('hp-adjust-input');
    hpAdjustInput.placeholder = 'Math';

    // Event listener for adjusting HP
    hpAdjustInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const adjustment = parseInt(hpAdjustInput.value, 10);
            if (isNaN(adjustment)) return;

            let tempHP = parseInt(tempHPDiv.textContent, 10) || 0;
            let currentHP = parseInt(currentHPDiv.textContent, 10) || 0;
            const maxHP = parseInt(maxHPDiv.textContent, 10) || currentMonsterData.HP.Value;

            if (adjustment < 0) {
                // Apply damage
                const damage = Math.abs(adjustment);
                if (tempHP > 0) {
                    // Subtract from temp HP first
                    if (damage <= tempHP) {
                        tempHP -= damage;
                    } else {
                        // Subtract remaining damage from current HP
                        currentHP -= (damage - tempHP);
                        tempHP = 0;
                    }
                } else {
                    // Subtract directly from current HP
                    currentHP -= damage;
                }
            } else {
                // Apply healing
                currentHP += adjustment;
                if (currentHP > maxHP) {
                    currentHP = maxHP; // Cap healing at max HP
                }
            }

            // Update the displayed HP values
            tempHPDiv.textContent = tempHP;
            currentHPDiv.textContent = currentHP;

            // Clear the input
            hpAdjustInput.value = '';
        }
    });

    // Temporary HP element
    const tempHPDiv = document.createElement('span');
    tempHPDiv.classList.add('temp-hp');
    tempHPDiv.contentEditable = true;
    tempHPDiv.textContent = 0; // Start with 0 temporary HP

    // Temp HP display container
    const tempHPContainer = document.createElement('div');
    tempHPContainer.classList.add('temp-hp-container');
    tempHPContainer.appendChild(document.createTextNode('Temp: '));
    tempHPContainer.appendChild(tempHPDiv);

    // Add elements to monsterHP container in order: HP display, Math input, Temp HP
    monsterHP.appendChild(hpDisplay);
    monsterHP.appendChild(tempHPContainer);
    monsterHP.appendChild(hpAdjustInput);
    

    // Add all components to the card in a consistent layout
    card.appendChild(initDiv);
    card.appendChild(monsterPictureDiv);
    card.appendChild(monsterInfo);
    card.appendChild(conditionsDiv);
    card.appendChild(monsterHP);

    // Re-append the dropdown container to the card
    const dropdownContainer = card.querySelector('.dropdown-container');
    if (dropdownContainer) {
        card.appendChild(dropdownContainer);
    }

    reorderCards()
}



// Event listener for hdining the monster stat block
document.getElementById('closeMonsterCard').addEventListener('click', function() {
    toggleMonsterCardVisibility(false);
});


let currentSelectedMonsterName = '';

function showMonsterCardDetails(monsterName) {
    // Check if the monster card is currently visible
    const monsterCardContainer = document.getElementById('monsterCardContainer');

    if (monsterCardContainer.classList.contains('visible') && currentSelectedMonsterName === monsterName) {
        // Hide the card if it's already open
        toggleMonsterCardVisibility(false);
        return; // Exit the function early
    }

    // Find the monster in the new data source monsterData
    const monster = monsterData[monsterName];

    if (monster) {
        currentSelectedMonsterName = monsterName;

        // Populate all fields
        populateMonsterFields(monster);

        // Show the monster card container
        toggleMonsterCardVisibility(true);
    } else {
        console.error(`Monster data not found for: ${monsterName}`);
    }
}


// Toggles the visibility of the monster card
function toggleMonsterCardVisibility(isVisible) {
    const monsterCardContainer = document.getElementById('monsterCardContainer');
    if (isVisible) {
        monsterCardContainer.classList.remove('hidden');
        monsterCardContainer.classList.add('visible');
    } else {
        monsterCardContainer.classList.remove('visible');
        monsterCardContainer.classList.add('hidden');
    }
}

// Reusable function to populate data conditionally
function populateField(elementId, label, value, isRollable = false) {
    const element = document.getElementById(elementId);
    if (value || value === 0) {
        const labelText = label ? `<strong>${label}:</strong> ` : ''; // Add colon and break only if label exists

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
}

// Populates monster fields
function populateMonsterFields(monster) {
    // Populate basic monster info
    populateField('monsterName', '', monster.Name);
    populateField('monsterType', '', monster.Type, false);
    populateField('monsterAC', 'AC', monster.AC?.Value, false);
    populateField('monsterHP', 'HP', `${monster.HP?.Value} ${monster.HP?.Notes}`, true);
    populateField('monsterSpeed', 'Speed', monster.Speed);
    populateField('monsterLanguages', 'Languages', monster.Languages, false);
    populateField('monsterChallenge', 'CR', monster.Challenge, false);

    populateMonsterListField('monsterAbilityScores', monster.Abilities, 'abilityScores');

    if (monster.Skills.length > 0){
        populateMonsterListField('monsterSkills', monster.Skills, 'savingThrow');
    }

    if (monster.Saves.length > 0){
        populateMonsterListField('monsterSaves', monster.Saves, 'savingThrow');
    }

    // Populate actions
    if (monster.Actions.length > 0){
        populateMonsterListField('monsterActions', monster.Actions, 'action');
    }

    // Populate traits
    if (monster.Traits.length > 0){
        populateMonsterListField('monsterAbilities', monster.Traits,'traits');
    }

    // Populate legendary actions
    if (monster.LegendaryActions.length > 0){
        populateMonsterListField('monsterLegendaryActions', monster.LegendaryActions, 'legendaryAction');
    }
    
    rollableButtons()
}



// Updated function to populate list fields with various item types
function populateMonsterListField(elementId, items, type) {
    const container = document.getElementById(elementId);
    container.innerHTML = ''; // Clear previous content

    // Check if items exist and are not empty
    if (items) {
        // Handle if items is an array (Actions, Legendary Actions, Skills, Saving Throws)
        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                let itemContent;
                // Determine the item content based on the type
                switch (type) {
                    case 'traits':
                    case 'action':
                    case 'legendaryAction':
                        itemContent = parseAndReplaceDice({ name: item.Name }, `${item.Name}: ${item.Content}`);
                        break;
                    case 'savingThrow':
                    case 'skill':
                        itemContent = parseAndReplaceDice({ name: item.Name }, `${item.Name}: ${item.Modifier}`);
                        break;
                        // itemContent = document.createElement('div');
                        // itemContent.textContent = `${item.Name}: ${item.Modifier}`;
                        // break;
                    default:
                        itemContent = document.createElement('div');
                        itemContent.textContent = item.Name || 'Unknown Item';
                }
                
                if (itemContent) {
                    container.appendChild(itemContent);

                    // Create and append a <br> element after each item
                    const lineBreak = document.createElement('br');
                    container.appendChild(lineBreak);
                }
            });
            container.style.display = '';
        }
        // Handle if items is an object (Ability Scores)
        else if (typeof items === 'object' && !Array.isArray(items)) {
            Object.keys(items).forEach(key => {
                const scoreElement = document.createElement('div');
                scoreElement.innerHTML = `<strong>${key}:</strong> ${items[key]}`;
                container.appendChild(scoreElement);
            });
            container.style.display = '';
        } else {
            container.style.display = 'none';
        }
    } else {
        container.style.display = 'none';
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

function monsterConditions(){
    console.log("Grab a monster and add a condition to it")
}

const conditionsMap = new Map();