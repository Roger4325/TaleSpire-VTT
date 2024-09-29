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


const messageHandlers = {
    'request-stats': handleRequestedStats,
    'update-health': handleUpdatePlayerHealth,
    'apply-damage': handleApplyMonsterDamage,
    // Add more as needed
};




function handleMessage(message) {
    const parsedMessage = JSON.parse(message);
    const { type, uuid, data, from } = parsedMessage;

    // Check if there's a handler for the message type
    if (messageHandlers[type]) {
        messageHandlers[type](parsedMessage);
    } else {
        console.error(`Unhandled message type: ${type}`);
    }
}






const playerCharacters = [
    { name: 'Mira', hp: { current: 56, max: 56 }, ac: 19, initiative: 0,passivePerception: 0, spellSave: 12 },
    { name: 'Sterling', hp: { current: 74, max: 74 }, ac: 19, initiative: 0,passivePerception: 11, spellSave: 15 },
    { name: 'Alduin', hp: { current: 51, max: 51 }, ac: 15, initiative: 0,passivePerception: 0, spellSave: 12 },
    { name: 'Cralamin', hp: { current: 41, max: 41 }, ac: 10, initiative: 0,passivePerception: 0, spellSave: 12 },
    { name: 'Wallace', hp: { current: 50, max: 50 }, ac: 20, initiative: 0,passivePerception: 0, spellSave: 12 },
    { name: 'Barnibus', hp: { current: 40, max: 40 }, ac: 14, initiative: 0,passivePerception: 0, spellSave: 12 },
    { name: 'Custom', hp: { current: 40, max: 40 }, ac: 14, initiative: 0 ,passivePerception: 0, spellSave: 12}
    
    // Add more player characters as needed
];

// Initialize the tracker (Removed initial call to renderMonsterCards())

// Event listener for adding a new empty monster card
document.getElementById('add-monster-button').addEventListener('click', function() {
    createEmptyMonsterCard();
    closePopup()
});

// Event listener for saving each encounter
document.getElementById('save-encounter').addEventListener('click', function() {
    const savePopup = document.querySelector('.save-popup');
    if (savePopup) {
        closePopup(); // Close the popup if it's open
    } else {
        showSavePopup(); // Show the save popup if it's not open
    }
});

// Event listener for loading each encounter
document.getElementById('load-encounter').addEventListener('click', function() {
    const loadPopup = document.querySelector('.load-popup');
    if (loadPopup) {
        closePopup(); // Close the popup if it's open
    } else {
        loadEncountersAndPopulateCards(); // Show the load popup if it's not open
    }
});


document.getElementById('rollInitiative').addEventListener('click', () => {
    const monsterCards = document.querySelectorAll('.monster-card');

    monsterCards.forEach(card => {
        // Find the element with the data-name="Initiative"
        const initiativeElement = card.querySelector('[data-name="Initiative"]');
        if (initiativeElement) {
            const diceType = initiativeElement.getAttribute('data-dice-type');
            
            // Use regex to extract the modifier part, which could be positive or negative
            const match = diceType.match(/1d20([+-]\d+)/);

            // Default initMod to 0 if no modifier is found
            const initMod = match ? parseInt(match[1], 10) : 0;
            const randomRoll = Math.floor(Math.random() * 20) + 1;
            const totalInitiative = randomRoll + initMod;
            const initInput = card.querySelector('.init-input');

            if (initInput) {
                initInput.value = totalInitiative;
            } else {
                console.log(`Initiative for ${card.id}: ${totalInitiative}`);
            }
        }
    });
    reorderCards()
});



function activateMonsterCard(card){
    if (activeMonsterCard) {
        activeMonsterCard.style.borderColor = ''; // Reset to default border color
    }

    // Set this card as the active card
    activeMonsterCard = card;

    // Change the border color of the active card to red
    card.style.borderColor = 'red';
}

function createEmptyMonsterCard() {
    // Create the monster card container
    const card = document.createElement('div');
    card.classList.add('monster-card');

    // Add click event listener to the card to set it as active
    card.addEventListener('click', () => {
        // If there's an active card, reset its border to the default
        activateMonsterCard(card)
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
    const tracker = document.getElementById('initiative-tracker');
    if (tracker) {
        tracker.appendChild(card);
    } else {
        console.error('Initiative tracker container not found.');
    }

    return card
}



function updateMonsterCard(card, monster) {
    // Clear previous content
    card.innerHTML = '';

    // Check if the monster is a string (name) or an object (full monster data)
    let monsterName, selectedMonsterData, monsterCurrentHp, monsterMaxHp, monsterTempHP, newConditionsMap
    
    if (typeof monster === 'string') {
        // If a string is provided, it's just the monster name, so we fetch the data
        monsterName = monster;
        selectedMonsterData = monsterData[monster]; // Look up monster data by name

        monsterCurrentHp = selectedMonsterData.HP.Value
        monsterMaxHp = selectedMonsterData.HP.Value
        monsterTempHP = 0;

    } else if (typeof monster === 'object') {
        // If an object is provided, use the data from the monster object
        monsterName = monster.name;  // Name from the object
        const rearrangedName = monsterName.replace(/\s\([A-Z]\)$/, ''); // Removes the letter in parentheses
        selectedMonsterData = monsterData[rearrangedName]; // Get the stored monster data based on the name
    
        monsterCurrentHp = monster.currentHp;
        monsterMaxHp = monster.maxHp;
        monsterTempHP = monster.tempHp;
        newConditionsMap = monster.conditions;
    }
    

    // Handle missing monster data
    if (!selectedMonsterData) {
        console.error(`Monster data not found for: ${monsterName}`);
        return;
    }

    // Create the monster initiative box
    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');
    
    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = monster.init || 0; // Use initiative from the object, if available
    initInput.classList.add('init-input');
    initInput.addEventListener('change', () => reorderCards());
    initDiv.appendChild(initInput);

    // Add monster picture
    const monsterPictureDiv = document.createElement('div');
    monsterPictureDiv.classList.add('monster-picture-div');
    const monsterPicture = document.createElement('img');
    monsterPicture.classList.add('monster-picture');
    monsterPictureDiv.appendChild(monsterPicture);

    // Monster info section
    const monsterInfo = document.createElement('div');
    monsterInfo.classList.add('monster-info');
    const monsterNameDiv = document.createElement('div');
    monsterNameDiv.classList.add('monster-name');

    // Determine the monster name to use
    let monsterNameToUse 
    if(monster.name){
        monsterNameDiv.textContent = monster.name
    }
    else{
        monsterNameToUse = selectedMonsterData.Name
        const existingNames = Array.from(document.getElementsByClassName('monster-name')).map(nameElem => nameElem.textContent.replace(/\s\([A-Z]\)$/, ''));
        const count = existingNames.filter(name => name === monsterNameToUse).length;
        monsterNameDiv.textContent = `${monsterNameToUse} (${String.fromCharCode(65 + count)})`;
    }

    // Add a unique identifier to the monster name


    
    monsterNameDiv.addEventListener('click', function () {
        const monsterNameText = monsterNameDiv.textContent.replace(/\s\([A-Z]\)$/, '');
        console.log(monsterNameText)
        showMonsterCardDetails(monsterNameText);
    });

    // Stats section (AC, Initiative, Speed)
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-details');
    let monsterInitiative
    if(selectedMonsterData.InitiativeModifier < 0){
        monsterInitiative = selectedMonsterData.InitiativeModifier;
    }
    else{
        monsterInitiative = "+" + selectedMonsterData.InitiativeModifier;
    }
    
    const initiativeButton = parseAndReplaceDice({ name: 'Initiative' }, `Init Mod: ${monsterInitiative} <br>`);
    
    const statsSpan = document.createElement('span');
    const acText = document.createTextNode(`AC: ${selectedMonsterData.AC.Value} | `);
    const speedText = document.createTextNode(` Speed: ${selectedMonsterData.Speed}`);
    statsSpan.appendChild(acText);
    statsSpan.appendChild(initiativeButton);
    statsSpan.appendChild(speedText);
    statsDiv.appendChild(statsSpan);

    // Add monster name and stats to the monster info
    monsterInfo.appendChild(monsterNameDiv);
    monsterInfo.appendChild(statsDiv);

    const conditionsDiv = document.createElement('div');
    conditionsDiv.classList.add('conditions-trackers');

    card.appendChild(initDiv);
    card.appendChild(monsterPictureDiv);
    card.appendChild(monsterInfo);
    card.appendChild(conditionsDiv);

    // Add conditions from the newConditionsMap back to the card
    if (Array.isArray(newConditionsMap)) {
        newConditionsMap.forEach(conditionName => {
            // Call monsterConditions directly with the condition name
            // This assumes monsterConditions has been modified to accept a condition name
            if (conditionName) {
                activeMonsterCard = card; // Set the active monster card to the current one
                monsterConditions(conditionName); // Call with context and value
            }
        });
    }


    // HP section
    const monsterHP = document.createElement('div');
    monsterHP.classList.add('monster-hp');

    const currentHPDiv = document.createElement('span');
    currentHPDiv.classList.add('current-hp');
    currentHPDiv.contentEditable = true;
    currentHPDiv.textContent = monsterCurrentHp

    const maxHPDiv = document.createElement('span');
    maxHPDiv.classList.add('max-hp');
    maxHPDiv.contentEditable = true;
    maxHPDiv.textContent = monsterMaxHp  // Use maxHp from the object, if available

    const hpDisplay = document.createElement('div');
    hpDisplay.classList.add('hp-display');
    hpDisplay.appendChild(currentHPDiv);
    hpDisplay.appendChild(document.createTextNode(' / '));
    hpDisplay.appendChild(maxHPDiv);
    
    const hpAdjustInput = document.createElement('input');
    hpAdjustInput.type = 'number';
    hpAdjustInput.classList.add('hp-adjust-input');
    hpAdjustInput.placeholder = 'Math';
    
    const tempHPDiv = document.createElement('span');
    tempHPDiv.classList.add('temp-hp');
    tempHPDiv.contentEditable = true;
    tempHPDiv.textContent = monsterTempHP || 0;  // Use tempHp from the object, if available
    
    const tempHPContainer = document.createElement('div');
    tempHPContainer.classList.add('temp-hp-container');
    tempHPContainer.appendChild(document.createTextNode('Temp: '));
    tempHPContainer.appendChild(tempHPDiv);
    
    // Add event listener for HP adjustment
    hpAdjustInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const adjustment = parseInt(hpAdjustInput.value, 10);
            if (isNaN(adjustment)) return;
    
            let currentHP = parseInt(currentHPDiv.textContent, 10) || 0;
            const maxHP = parseInt(maxHPDiv.textContent, 10) || selectedMonsterData.HP.Value;
            let tempHP = parseInt(tempHPDiv.textContent, 10) || 0;  // Get current temp HP
    
            // Subtract from temp HP first, then from current HP if temp HP is depleted
            if (adjustment < 0) { // Damage case
                let damage = Math.abs(adjustment);
    
                // Subtract damage from temp HP first
                if (tempHP > 0) {
                    const tempHPRemainder = tempHP - damage;
                    if (tempHPRemainder >= 0) {
                        tempHP = tempHPRemainder;
                        damage = 0;
                    } else {
                        damage -= tempHP; // Subtract remaining damage after temp HP is depleted
                        tempHP = 0;
                    }
                }
    
                // If there's still damage left, subtract from current HP
                if (damage > 0) {
                    currentHP = Math.max(0, currentHP - damage);
                }
            } else if (adjustment > 0) { // Healing case
                currentHP = Math.min(maxHP, currentHP + adjustment); // Heal current HP, but no effect on temp HP
            }
    
            // Update HP and temp HP displays
            currentHPDiv.textContent = currentHP;
            tempHPDiv.textContent = tempHP;
    
            hpAdjustInput.value = '';  // Clear input
        }
    });
    
    monsterHP.appendChild(hpDisplay);
    monsterHP.appendChild(tempHPContainer);
    monsterHP.appendChild(hpAdjustInput);
    // Delete button
    const deleteButtonDiv = document.createElement('div');
    deleteButtonDiv.classList.add('monster-card-delete-button');
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('nonRollButton');
    deleteButton.textContent = "X";
    deleteButton.addEventListener('click', () => {
        card.remove();
        reorderCards();
    });

    deleteButtonDiv.appendChild(deleteButton);

    // Add all components to the card in a consistent layout
    card.appendChild(monsterHP);
    card.appendChild(deleteButtonDiv);
    
    reorderCards();
    rollableButtons();  // Update rollable buttons after card updates
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

    console.log(monsterName)

    // Find the monster in the new data source monsterData
    const monster = monsterData[monsterName];

    console.log(monster)

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
            if (value.length > 0){
                if (typeof value === 'string') {
                    // Replace commas without spaces with commas followed by a space
                    const formattedValue = value.replace(/,\s*/g, ', ');
                    element.innerHTML = `${labelText}${formattedValue}`;
                } else if (Array.isArray(value)) {
                    // If value is an array, join it into a string separated by commas and spaces
                    const formattedValue = value.join(', ');
                    element.innerHTML = `${labelText}${formattedValue}`;
                } else {
                    // Convert other types to a string if necessary
                    element.innerHTML = `${labelText}${String(value)}`;
                }
            }
            else{

            }
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
    populateField('monsterAC', 'Armor Class', monster.AC?.Value, false);
    populateField('monsterHP', 'HP', `${monster.HP?.Value} ${monster.HP?.Notes}`, true);
    populateField('monsterSpeed', 'Speed', monster.Speed);
    populateField('monsterLanguages', 'Languages', monster.Languages, false);
    populateField('monsterDamageVulnerabilities', 'Vulnerabilities', monster.DamageVulnerabilities, false);
    populateField('monsterDamageResistances', 'Resistances', monster.DamageResistances, false);
    populateField('monsterDamageImmunities', 'Immunities', monster.DamageImmunities, false);
    populateField('monsterSenses', 'Senses', monster.Senses, false);
    populateField('monsterChallenge', 'CR', monster.Challenge, false);

    function checkAndPopulateSection(elementId, data, type) {
        const container = document.getElementById(elementId);
        container.innerHTML = ''; // Always clear previous content
    
        if (data && data.length > 0) {
            populateMonsterListField(elementId, data, type);
        }
    }
    
    populateMonsterListField('monsterAbilityScores', monster.Abilities, 'abilityScores');


    checkAndPopulateSection('monsterSkills', monster.Skills, 'skill');
    checkAndPopulateSection('monsterSaves', monster.Saves, 'savingThrow');
    checkAndPopulateSection('monsterActions', monster.Actions, 'action');
    checkAndPopulateSection('monsterAbilities', monster.Traits, 'traits');
    checkAndPopulateSection('monsterLegendaryActions', monster.LegendaryActions, 'legendaryAction');
    
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
                        itemContent = parseAndReplaceDice({ name: item.Name }, `<strong>${item.Name}: </strong>${item.Content}`);
                        break;
                    case 'savingThrow':
                        const savemodifier = parseInt(item.Modifier) >= 0 ? `+${item.Modifier}` : item.Modifier;
                        itemContent = parseAndReplaceDice({ name: item.Name + " Save"}, `<strong>${item.Name} : </strong> ${savemodifier}`);
                        break;
                    case 'skill':
                        const skillmodifier = parseInt(item.Modifier) >= 0 ? `+${item.Modifier}` : item.Modifier;
                        itemContent = parseAndReplaceDice({ name: item.Name}, `<strong>${item.Name} : </strong> ${skillmodifier}`);
                        break;
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
                const abilityScore = items[key];
                // Calculate the ability modifier
                const modifier = Math.floor((abilityScore - 10) / 2);
                const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`; // Add "+" for positive numbers, no change for negative
        
                // Create a container for the ability score and rollable modifier
                const scoreElement = document.createElement('div');
        
                // Create the static part of the text (ability score)
                const staticText = document.createElement('strong');
                staticText.textContent = `${key} : `;
                scoreElement.appendChild(staticText);
                scoreElement.appendChild(document.createTextNode(`${abilityScore} `));
        
                // Use the parseAndReplaceDice function to make the modifier rollable, and append it
                const rollableModifier = parseAndReplaceDice({ name: key }, modifierText);
                scoreElement.appendChild(rollableModifier); // Appends the actual button or label returned by the function
        
                container.appendChild(scoreElement); // Append the entire scoreElement to the container
            });
            container.style.display = ''; // Ensure the container is displayed
        } else {
            container.style.display = 'none';
        }
        


    } else {
        container.style.display = 'none';
    }
}

































// Event listener for adding a new empty player card
document.getElementById('add-player-button').addEventListener('click', async function() {
    await fetchAndCreatePlayerCards()
    createEmptyPlayerCard();
    closePopup()
    
});

// Function to create player cards
function createEmptyPlayerCard() {
    // Create the player card container
    const card = document.createElement('div');
    card.classList.add('player-card'); // Reuse monster-card class for styling

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

async function updatePlayerCard(card, player) {
    // Clear previous content
    card.innerHTML = '';

    console.log(player)

    if (player.talespireId) {
        card.dataset.playerId = player.talespireId; // Store player ID in dataset
    }

    const selectedPlayer = player.talespireId;
    if (selectedPlayer) {
        await requestPlayerInfo(selectedPlayer);
    }

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
    playerInfo.classList.add('player-info'); // Reuse monster-info class

    // Check if the player name is "Custom"
    if (player.name === "Custom") {
        // Create a container for the player info
        const playerInfoContainer = document.createElement('div');
        playerInfoContainer.classList.add('player-custom-info'); // Add player-info class for styling

        // Helper function to create label-input pairs
        function createLabelInputPair(labelText, inputType, inputId, placeholder) {
            const labelInputGroup = document.createElement('div');
            labelInputGroup.classList.add('label-input-group'); // Class to style the group

            const label = document.createElement('label');
            label.textContent = labelText;

            const input = document.createElement('input');
            input.type = inputType;
            input.id = inputId;
            input.placeholder = placeholder;

            // Append label and input to the group
            labelInputGroup.appendChild(label);
            labelInputGroup.appendChild(input);

            return labelInputGroup;
        }

        // Create and append all label-input pairs
        playerInfoContainer.appendChild(createLabelInputPair('Name:', 'text', 'customCharacterName', 'Character Name'));
        playerInfoContainer.appendChild(createLabelInputPair('HP:', 'number', 'customHP', 'HP'));
        playerInfoContainer.appendChild(createLabelInputPair('AC:', 'number', 'customAC', 'AC'));
        playerInfoContainer.appendChild(createLabelInputPair('Passive Per:', 'number', 'customPassivePerception', 'Per'));
        playerInfoContainer.appendChild(createLabelInputPair('Spell Save:', 'number', 'customSpellSaveDC', 'DC'));

        // Append the container to the playerInfo element
        playerInfo.appendChild(playerInfoContainer);
    }
 else {
        // Display existing player details
        const playerName = document.createElement('div');
        playerName.classList.add('monster-name'); // Reuse monster-name class
        playerName.innerText = player.name || player.characterName;

        // Create a new div to hold the player header (name and health)
        const playerHeader = document.createElement('div');
        playerHeader.classList.add('player-header'); // New class for header

        // Append player name to the header
        playerHeader.appendChild(playerName);

        // Create the player health div
        const playerHealthDiv = document.createElement('div');
        playerHealthDiv.classList.add('player-health');
        playerHealthDiv.innerHTML = `<span>HP: ${player.hp.current} / ${player.hp.max}</span>`;

        // Append player health to the header
        playerHeader.appendChild(playerHealthDiv);

        // Create stats div
        const statsDiv = document.createElement('div');
        statsDiv.classList.add('player-stats');
        statsDiv.innerHTML = `
            <span>AC: ${player.ac}</span>
            <span>Passive Per: ${player.passivePerception}</span>
            <span>Spell Save: ${player.spellSave}</span>
            <div class="player-stats-filler"></div>
        `;

        // Append header and stats div to playerInfo
        playerInfo.appendChild(playerHeader);
        playerInfo.appendChild(statsDiv);

    }

    const deleteButtonDiv = document.createElement('div');
    deleteButtonDiv.classList.add('monster-card-delete-button');
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('nonRollButton');
    deleteButton.textContent = "X";
    deleteButton.addEventListener('click', () => {
        card.remove();
        reorderCards();
    });

    deleteButtonDiv.appendChild(deleteButton);

    card.appendChild(initDiv);
    card.appendChild(playerInfo);
    card.appendChild(deleteButtonDiv);

    // Re-append the dropdown container to the card
    const dropdownContainer = card.querySelector('.dropdown-container');
    if (dropdownContainer) {
        card.appendChild(dropdownContainer);
    }
}





// Fetch players on the board and populate the dropdown
async function fetchAndCreatePlayerCards() {

    try {
        const myFragment = await TS.clients.whoAmI();
        const allPlayers = await TS.clients.getClientsInThisBoard();
        
        console.log(allPlayers)

        // Filter out the current player (yourself)
        const otherPlayers = allPlayers.filter(player => player.id !== myFragment.id);

        console.log(otherPlayers)
        // Merge other players into playerCharacters array
        mergeOtherPlayers(otherPlayers);

        // Create a player card for each player
    } catch (error) {
        console.error("Error getting players:", error);
    }
}


// Function to merge other players into the playerCharacters array
function mergeOtherPlayers(otherPlayers) {
    otherPlayers.forEach(entry => {
        const player = entry.player; // Access the player object inside each entry
        
        // Check if the player already exists in the playerCharacters array
        const playerExists = playerCharacters.some(p => p.name === player.name);

        console.log(playerCharacters);

        // If the player doesn't exist, add them with default stats
        if (!playerExists) {
            playerCharacters.push({
                name: player.name,
                hp: { current: 50, max: 50 }, // Default HP values (you can adjust these)
                ac: 10, // Default AC (can be adjusted)
                initiative: 0,
                talespireId: entry.id // Use entry.id for talespireId
            });
        }
    });
}



function reorderCards() {
    const tracker = document.getElementById("initiative-tracker");
    
    // Ensure tracker exists
    if (!tracker) {
        console.error("Initiative tracker element not found.");
        return;
    }
    
    // Retrieve all cards
    const cards = Array.from(tracker.querySelectorAll(".monster-card, .player-card"));;
    
    // Check if cards array is empty
    if (cards.length === 0) {
        console.warn("No monster cards to reorder.");
        return;
    }
    
    // Sort the cards based on initiative
    cards.sort((a, b) => {
        const aInit = parseInt(a.querySelector(".init-input").value, 10) || 0;
        const bInit = parseInt(b.querySelector(".init-input").value, 10) || 0;
        return bInit - aInit; // Higher initiative first
    });
    
    // Remove existing cards and append them back in the correct order
    cards.forEach(card => {
        tracker.appendChild(card);
    });
}









const conditionsMap = new Map();

// Function to handle adding conditions to the active monster
function monsterConditions(condition) {

    console.log(condition)
    let selectedCondition
    if (condition){
        selectedCondition = condition;
    }
    else{
        const conditionSelect = document.getElementById('condition-select');
        selectedCondition = conditionSelect.value;
    }
    

    // Ensure a condition is selected and there's an active monster
    if (selectedCondition && activeMonsterCard) {
        // Each monster card has its own condition tracker div inside it
        let conditionTrackerDiv = activeMonsterCard.querySelector('.conditions-trackers');

        // Check if this monster's condition map exists, if not, create one
        if (!conditionsMap.has(activeMonsterCard)) {
            conditionsMap.set(activeMonsterCard, new Set());
        }

        // Get the Set of conditions for this monster card
        const conditionsSet = conditionsMap.get(activeMonsterCard);

        // Handle Exhaustion separately (same as your previous logic)
        if (selectedCondition === 'Exhaustion') {
            let exhaustionNumber = 1;
            for (const condition of conditionsSet) {
                if (condition.startsWith('Exhaustion ')) {
                    const number = parseInt(condition.replace('Exhaustion ', ''));
                    if (!isNaN(number) && number >= exhaustionNumber) {
                        exhaustionNumber = number + 1;
                    }
                }
            }
            selectedCondition = `Exhaustion ${exhaustionNumber}`;

            // Clear all previous exhaustion conditions
            for (const condition of conditionsSet) {
                if (condition.startsWith('Exhaustion ')) {
                    conditionsSet.delete(condition);
                    removeConditionPill(condition, conditionTrackerDiv);
                }
            }
        } else if (conditionsSet.has(selectedCondition)) {
            // If the selected condition is already applied, do nothing
            return;
        }

        // Create a condition pill
        const conditionPill = document.createElement('div');
        conditionPill.classList.add('condition-pill');
        conditionPill.innerHTML = `
            <span>${selectedCondition}</span>
            <button class="remove-condition">x</button>
        `;

        // Add a click event listener to the remove button
        const removeButton = conditionPill.querySelector('.remove-condition');
        removeButton.addEventListener('click', () => {
            conditionsSet.delete(selectedCondition);
            removeConditionPill(selectedCondition, conditionTrackerDiv);
        });

        // Add the condition to the Set and the condition pill to the container
        conditionsSet.add(selectedCondition);
        conditionTrackerDiv.appendChild(conditionPill);
    }
}

// Function to remove a condition pill
function removeConditionPill(condition, conditionTrackerDiv) {
    const conditionPills = conditionTrackerDiv.querySelectorAll('.condition-pill');
    for (const pill of conditionPills) {
        if (pill.querySelector('span').textContent === condition) {
            conditionTrackerDiv.removeChild(pill);
            break;
        }
    }
}













// Saving and loading encounters


let allSavedEncounters = [];

function saveMonsterCardsAsEncounter(encounterName) {
    // Get all monster cards on the screen
    const monsterCards = document.querySelectorAll('.monster-card');
    const encounterData = [];

    // Loop through each card to collect data
    monsterCards.forEach(card => {
        const init = card.querySelector('.init-input').value;
        const name = card.querySelector('.monster-name').textContent;
        const currentHp = card.querySelector('.current-hp').textContent;
        const maxHp = card.querySelector('.max-hp').textContent;
        const tempHp = card.querySelector('.temp-hp').textContent;
        const conditions = []; // Changed from Map to array

        const conditionPills = card.querySelectorAll('.condition-pill');
        conditionPills.forEach(pill => {
            const conditionName = pill.querySelector('span').textContent; // Get the condition name
            conditions.push(conditionName); // Add the condition name to the array
        });

        // Push the gathered data for each monster into the encounterData array
        encounterData.push({
            init,
            name,
            currentHp,
            maxHp,
            tempHp,
            conditions
        });
    });

    saveToGlobalStorage("Encounter Data", encounterName, encounterData, false)
}




async function showSavePopup() {
    await loadAndStoreMonsterData()
    // Get saved encounters from passed-in allSavedEncounters object
    const savedEncounters = allSavedEncounters;

    // Create the popup element
    const popup = document.createElement('div');
    popup.classList.add('save-popup');

    // Create title
    const title = document.createElement('h2');
    title.textContent = "Save Encounter";
    popup.appendChild(title);

    // Create input field for new encounter name
    // Create input field for new encounter name
    const newEncounterInput = document.createElement('input');
    newEncounterInput.type = 'text';
    newEncounterInput.classList.add('encounter-save-input');
    newEncounterInput.placeholder = 'Enter new encounter name';
    popup.appendChild(newEncounterInput);

    // Create the dropdown or list for saved encounters
    const encounterList = document.createElement('ul');
    encounterList.style.display = 'none'; // Hide initially
    encounterList.classList.add('encounter-save-list')
    popup.appendChild(encounterList);

    // Populate the list with saved encounter names
    Object.keys(savedEncounters).forEach((encounterName) => {
        const encounterItem = document.createElement('li');
        encounterItem.textContent = encounterName;

        // Add click event to select the encounter and fill the input field
        encounterItem.addEventListener('click', () => {
            newEncounterInput.value = encounterName;
            encounterList.style.display = 'none'; // Hide the list after selecting
        });
        encounterList.appendChild(encounterItem);
    });

    // Show the list when the input is clicked
    newEncounterInput.addEventListener('click', () => {
        encounterList.style.display = 'block'; // Show the list
    });
    newEncounterInput.addEventListener('blur', () => {
        setTimeout(() => {
            encounterList.style.display = 'none'; // Hide the list after a small delay
        }, 20); // Delay of 20 milliseconds (adjust as needed)
    });

    // Filter the list based on user input
    newEncounterInput.addEventListener('input', () => {
        const filterText = newEncounterInput.value.toLowerCase();

        // Loop through all the <li> items and hide those that don't match the input
        Array.from(encounterList.getElementsByTagName('li')).forEach((item) => {
            const text = item.textContent.toLowerCase();
            if (text.includes(filterText)) {
                item.style.display = ''; // Show the item
            } else {
                item.style.display = 'none'; // Hide the item
            }
        });
    });

    // Add a save button or logic to handle saving the encounter
    const saveButton = document.createElement('button');
    saveButton.classList.add('nonRollButton')
    saveButton.textContent = 'Save';
    popup.appendChild(saveButton);

    // Save the content based on the input value
    saveButton.addEventListener('click', () => {
        const encounterName = newEncounterInput.value.trim();
        if (encounterName) {
            if (savedEncounters[encounterName]) {
                // Confirm before overwriting if an encounter with this name exists
                const confirmOverwrite = confirm(`An encounter named "${encounterName}" already exists. Do you want to overwrite it?`);
                if (!confirmOverwrite) return;
            }
            saveMonsterCardsAsEncounter(encounterName); // Call your save function
            closePopup(); // Close the popup after saving
        }
        else {
            alert('Please enter a name for the new encounter.');
        }
    });

    // Append the list and button to the popup
    popup.appendChild(encounterList);

    // Append popup to the body
    document.body.appendChild(popup);
}




function closePopup() {
    const savepopup = document.querySelector('.save-popup');
    const loadpopup = document.querySelector('.load-popup');
    if (savepopup) {
        savepopup.remove();
    }
    if (loadpopup) {
        loadpopup.remove();
    }
}


// Load and update character data
async function loadAndStoreMonsterData() {
    const dataType = "Encounter Data"; // Adjust based on your data structure

    try {
        const allMonsterData = await loadDataFromGlobalStorage(dataType);

        if (allMonsterData) {
            allSavedEncounters = allMonsterData;
        } else {
            console.error("Encounter data not found.");
            // Handle the case where data is not found, e.g., show a message to the user
        }
    } catch (error) {
        console.error("Error loading encounter data:", error);
        // Handle the error appropriately, e.g., show an error message to the user
    }
}








//Loading the monsters cards into the page. 

async function loadEncountersAndPopulateCards() {
    await loadAndStoreMonsterData();

    // Retrieve the saved encounters from storage
    const savedEncounters = allSavedEncounters || {};

    // Create the popup element
    const popup = document.createElement('div');
    popup.classList.add('load-popup');

    // Create title
    const title = document.createElement('h2');
    title.textContent = "Load Encounter";
    popup.appendChild(title);

    // Create input field for filtering encounter names
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filter encounters...';
    filterInput.classList.add('encounter-save-input');
    popup.appendChild(filterInput);

    // Create the dropdown or list for saved encounters
    const encounterList = document.createElement('ul');
    encounterList.classList.add('encounter-save-list');
    popup.appendChild(encounterList);

    // Show the encounter list on filter input click
    filterInput.addEventListener('click', () => {
        encounterList.style.display = 'block'; // Show the list
        // Attach event listeners after the list is populated
        attachLoadEventListeners(encounterList, savedEncounters);
    });
    filterInput.addEventListener('blur', () => {
        setTimeout(() => {
            encounterList.style.display = 'none'; // Hide the list after a small delay
        }, 200); // Delay of 20 milliseconds (adjust as needed)
    });

    // Function to populate the encounter list
    function populateEncounterList(filter = '') {
        encounterList.innerHTML = ''; // Clear previous list

        // Loop through saved encounters and display their titles
        Object.keys(savedEncounters).forEach((encounterName) => {
            if (encounterName.toLowerCase().includes(filter.toLowerCase())) {
                const encounterItem = document.createElement('li');
                encounterItem.classList.add('encounter-item');

                const encounterText = document.createElement('span');
                encounterText.classList.add('encounter-load-text');
                encounterText.textContent = encounterName;
                encounterItem.appendChild(encounterText);

                // Add delete button next to each encounter
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-encounter', 'nonRollButton');
                deleteButton.textContent = 'Delete';
                encounterItem.appendChild(deleteButton);

                encounterList.appendChild(encounterItem);
            }
        });

        // Force reflow
        encounterList.getBoundingClientRect(); // Forces reflow to make sure DOM is updated
    }

    // Initially populate the list with all encounters
    populateEncounterList();

    // Add event listener to filter encounters based on input
    filterInput.addEventListener('input', () => {
        const filterText = filterInput.value;
        populateEncounterList(filterText);
    });

    

    // Append popup to the body
    document.body.appendChild(popup);
}



// Function to attach event listeners
function attachLoadEventListeners(encounterList, savedEncounters) {
    // Event delegation for clicking encounters or delete buttons
    encounterList.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('encounter-load-text')) {
            console.log("click");
            const encounterName = target.textContent;
            updateMonsterCardDataFromLoad(savedEncounters[encounterName]);
            closePopup();
        } else if (target.classList.contains('delete-encounter')) {
            event.stopPropagation(); // Prevent triggering the click event on the encounter
            const encounterName = target.closest('li').querySelector('.encounter-load-text').textContent;
            removeFromGlobalStorage("Encounter Data", encounterName);
            closePopup();
        }
    });
}


function updateMonsterCardDataFromLoad(encounterData) {
    const monsterCardsContainer = document.getElementById('initiative-tracker');
    monsterCardsContainer.innerHTML = ''; // Clear previous monster cards

    // Loop through the monsters in the encounter data and create a new card for each
    encounterData.forEach(monster => {
        // Create an empty monster card
        const newMonsterCard = createEmptyMonsterCard();

        // Populate the monster card with the correct data
        updateMonsterCard(newMonsterCard, monster);

        // Append the new monster card to the container
        monsterCardsContainer.appendChild(newMonsterCard);
    });
}












// Requestion and recieving information from other connected clients. 

async function requestPlayerInfo(player) {
    const requestId = generateUUID(); // Generate unique ID for the request
    
    const message = {
        type: 'request-info',
        requestId, // Include the request ID to track the response
        data: {
            request: ['characterName', 'hp', 'ac', 'passivePerception','spellSave'] // Requesting specific info
        }
    };

    // Send the message to the selected player
    TS.sync.send(JSON.stringify(message), player).catch(console.error);
    console.log("Request for info sent with requestId:", requestId);
}




async function handleSyncEvents(event) {
    console.log("Getting message");

    let fromClient = event.payload.fromClient.id;
    TS.clients.isMe(fromClient).then((isMe) => {
        if (!isMe) {
            const parsedMessage = JSON.parse(event.payload.str);

            // Route the message based on its type using the messageHandlers library
            if (parsedMessage.type && messageHandlers[parsedMessage.type]) {
                messageHandlers[parsedMessage.type](parsedMessage, fromClient);
            } else {
                console.warn("Unhandled message type:", parsedMessage.type);
            }
        }
    });
}






function handlePlayerResponse(parsedMessage, fromClient) {
    const { requestId, data } = parsedMessage;

    // Process the response data (update UI, log, etc.)
    console.log(`Received response for requestId: ${requestId} from player ${fromClient}`, data);

    // Here you can update the GM screen with player data, e.g., show their HP, AC, etc.

}




function handleRequestedStats(parsedMessage, fromClient) {
    console.log("Handling player stats update from:", fromClient);

    // Extract player data from the parsedMessage
    console.log(parsedMessage)
    const playerData = parsedMessage.data; // Assuming data contains stats like HP, AC, etc.
    const playerId = fromClient; // Assume fromClient is the unique player ID (client.id)

    // Get all the player cards from the DOM
    const playerCards = document.querySelectorAll('.player-card');

    // Loop through all the player cards and update the matching one
    playerCards.forEach(card => {
        // Assuming you've stored the player's ID in the card's dataset
        const cardPlayerId = card.dataset.playerId; 

        // If the card's player ID matches the fromClient ID, update the card
        if (cardPlayerId === playerId) {
            updatePlayerCard(card, playerData); // Reuse your existing updatePlayerCard function
        }
    });
}




function handleUpdatePlayerHealth(parsedMessage, fromClient) {
    console.log("Handling player health update from:", fromClient);

    const { change, hpType } = parsedMessage.data;

    // Update the player's health here based on the received data
    // Example: If hpType is 'current', adjust the current health accordingly
}

function handleApplyMonsterDamage(parsedMessage, fromClient) {
    console.log("Applying monster damage to player from:", fromClient);

    const { damage } = parsedMessage.data;

    // Apply damage to the player's character sheet, or whatever logic you need
}