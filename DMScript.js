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



//This function is the first function that is called on load and I have been using as if it is an INIT() function. 
async function establishMonsterData(){
    const monsterDataObject = AppData.monsterLookupInfo;
    monsterNames = monsterDataObject.monsterNames;
    monsterData = monsterDataObject.monsterData;
    loadAndSetLanguage();
    loadDataFromCampaignStorage();
    populateConditionSelect();
    updateShopTable("adventuringSupplies")
    loadTableData()

    loadDataFromGlobalStorage('checklists')
    .then((checklistData) => {
        updateChecklistUI(checklistData);
    })
    .catch((error) => {
        console.error('Error loading checklist data:', error);
    });

    // Initialize the event listeners for existing cells
    const existingCells = document.querySelectorAll("[contenteditable='true']");
    existingCells.forEach(cell => {
        tableEditing(cell);
    });

    loadDataFromCampaignStorage('DmNotes')
    .then((groupNotesData) => {
        loadNotesGroupData(groupNotesData.groupNotesData)
    })
    .catch((error) => {
        showErrorModal('Error loading DmNotes data:', error);
    });

    populateMonsterDropdown()
    await mergeOtherPlayers(playersInCampaign)

    populatePlayerDropdown()

}

async function loadAndSetLanguage(){
    setLanguage(savedLanguage);
}

const messageHandlers = {
    'request-stats': handleRequestedStats,
    'update-health': handleUpdatePlayerHealth,
    'apply-damage': handleApplyMonsterDamage,
    'update-init' : handleUpdatePlayerInitiative,
    'request-init-list' : handleRequestInitList,
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
    // { name: 'Custom', hp: { current: 40, max: 40 }, ac: 14, initiative: 0 ,passivePerception: 0, spellSave: 12}
];

function populateMonsterDropdown() {
    // Populate the dropdown list with monster names
    const monsterList = document.getElementById("monster-list");
    const nameInput = document.getElementById("monster-name-input");
    const dropdownContainer = document.getElementById("monster-dropdown-container");

    monsterList.style.display = 'none'; // Initially hide the dropdown

    // Clear the existing list
    monsterList.innerHTML = '';

    // Populate the dropdown
    monsterNames.forEach(monsterName => {
        const listItem = document.createElement('li');
        listItem.textContent = monsterName;
        listItem.addEventListener('click', () => {
            nameInput.value = monsterName; // Set the input value to selected monster
            createEmptyMonsterCard(monsterName);
            monsterList.style.display = 'none'; // Hide the dropdown
        });
        monsterList.appendChild(listItem);
    });

    // Show dropdown on focus
    nameInput.addEventListener('focus', () => {
        monsterList.style.display = 'block';
    });

    // Filter dropdown items based on input
    nameInput.addEventListener('input', () => {
        const filterText = nameInput.value.toLowerCase();
        monsterList.querySelectorAll('li').forEach(li => {
            const monsterName = li.textContent.toLowerCase();
            li.style.display = monsterName.includes(filterText) ? 'block' : 'none';
        });
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdownContainer.contains(event.target) && event.target !== nameInput) {
            monsterList.style.display = 'none';
        }
    });
}

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



let currentTurnIndex = 0; // Track the current turn
let roundCounter = 1; // Track rounds
document.getElementById('next-turn-btn').addEventListener('click', nextTurn);
document.getElementById('previous-turn-btn').addEventListener('click', previousTurn);
makeRoundEditable() //Adding an event listener to the round counter to allow editing the round. 


function activateMonsterCard(card){
    if (activeMonsterCard) {
        activeMonsterCard.style.borderColor = ''; // Reset to default border color
    }

    // Set this card as the active card
    activeMonsterCard = card;

    // Change the border color of the active card to red
    card.style.borderColor = 'red';
}


function createEmptyMonsterCard(monster) {
    // Create the monster card container
    const card = document.createElement('div');
    card.classList.add('monster-card');

    card.addEventListener('click', () => {
        activateMonsterCard(card)
    });

    const tracker = document.getElementById('initiative-tracker');
    if (tracker) {
        tracker.appendChild(card);
    } else {
        console.error('Initiative tracker container not found.');
    }

    if (monster){
        updateMonsterCard(card, monster)
    }

    return card
}



function updateMonsterCard(card, monster) {
    // Clear previous content
    card.innerHTML = '';

    // Check if the monster is a string (name) or an object (full monster data)
    let monsterName, selectedMonsterData, monsterCurrentHp, monsterMaxHp, monsterTempHP, newConditionsMap, monsterVisable
    
    if (typeof monster === 'string') {
        // If a string is provided, it's just the monster name, so we fetch the data
        monsterName = monster;
        selectedMonsterData = monsterData[monster]; // Look up monster data by name

        monsterCurrentHp = selectedMonsterData.HP.Value
        monsterMaxHp = selectedMonsterData.HP.Value
        monsterTempHP = 0;
        monsterVisable = 0;

    } else if (typeof monster === 'object') {
        // If an object is provided, use the data from the monster object that we loaded
        monsterName = monster.name;  // Name from the object
        const rearrangedName = monsterName.replace(/\s\([A-Z]\)$/, ''); // Removes the letter in parentheses
        selectedMonsterData = monsterData[rearrangedName]; // Get the stored monster data based on the name
    
        monsterCurrentHp = monster.currentHp;
        monsterMaxHp = monster.maxHp;
        monsterTempHP = monster.tempHp;
        newConditionsMap = monster.conditions;
        monsterVisable = monster.isClosed;
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

                if (currentHP < maxHP / 2) {
                    monsterConditions("Bloodied");
                }
                   
                    
                if (activeMonsterCard) {
                    // Find the condition tracker div inside the active monster card
                    conditionTrackerDiv = activeMonsterCard.querySelector('.condition-tracker');

                    // Retrieve the condition set from the conditions map for this specific monster
                    conditionsSet = conditionsMap.get(activeMonsterCard);

                    if (!conditionsSet) {
                        console.log('No conditions set for this monster yet.');
                    } else {
                        if (conditionsSet.has('Concentration')) {
                            const dc = Math.max(10, Math.ceil(damage / 2));
                            showErrorModal(`Roll a Con save. <br> DC: ${dc}`,1000);
                        }
                    }
                } else {
                    console.log('No active monster selected.');
                    conditionTrackerDiv = document.getElementById('conditionTracker');
                    conditionsSet = conditionsMap.get(conditionTrackerDiv);
                }
            } else if (adjustment > 0) { // Healing case
                currentHP = Math.min(maxHP, currentHP + adjustment); // Heal current HP, but no effect on temp HP
                if (currentHP > maxHP / 2) {
                    console.log(`Monster is at less than half HP. Current HP: ${currentHP}, Max HP: ${maxHP}`);
                    removeMonsterCondition("Bloodied");
                }
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

    const eyeAndCloseDiv = document.createElement('div');
    eyeAndCloseDiv.classList.add('eye-and-close-buttons');

    // Open Eye Button
    const openEyeButton = document.createElement('button');
    openEyeButton.classList.add('eye-button');
    openEyeButton.classList.add('nonRollButton');
    if (monsterVisable === 0){
        openEyeButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    }
    else{
        openEyeButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }

    
    
    openEyeButton.addEventListener('click', () => {
        // Toggle between open and closed eye
        if (openEyeButton.querySelector('i').classList.contains('fa-eye')) {
            openEyeButton.innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
        } else {
            openEyeButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
        }
        debouncedSendInitiativeListToPlayer();
    });



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

    eyeAndCloseDiv.appendChild(openEyeButton);
    eyeAndCloseDiv.appendChild(deleteButtonDiv);

    // Add all components to the card in a consistent layout
    card.appendChild(monsterHP);
    card.appendChild(eyeAndCloseDiv);
    
    reorderCards();
    rollableButtons();  // Update rollable buttons after card updates
}




// Event listener for hiding the monster stat block
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
            const parsedContent = parseAndReplaceDice({ name: label }, value, true);
            const labelNode = document.createElement('span');
            labelNode.innerHTML = labelText;
            element.appendChild(labelNode);
            element.appendChild(parsedContent);
        } else {
            if (value || value === 0) {
                // Only add colon if label is non-empty
                const labelText = label ? `<strong>${label}:</strong> ` : '';
                if (isRollable) {
                    element.innerHTML = ''; // Clear content
                    const parsedContent = parseAndReplaceDice({ name: label }, value, true);
                    element.appendChild(document.createTextNode(labelText));
                    element.appendChild(parsedContent);
                } else {
                    const formattedValue = typeof value === 'string'
                        ? value.replace(/,\s*/g, ', ')
                        : Array.isArray(value) ? value.join(', ') : String(value);
                    element.innerHTML = `${labelText}${formattedValue}`;
                }
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
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
    console.log(monster.AC?.Value)
    populateField('monsterHP', 'HP', `${monster.HP?.Value} ${monster.HP?.Notes}`, true);
    populateField('monsterSpeed', 'Speed', monster.Speed);
    populateField('monsterLanguages', 'Languages', monster.Languages, false);
    populateField('monsterDamageVulnerabilities', 'Vulnerabilities', monster.DamageVulnerabilities, false);
    populateField('monsterDamageResistances', 'Resistances', monster.DamageResistances, false);
    populateField('monsterDamageImmunities', 'Immunities', monster.DamageImmunities, false);
    populateField('monsterConditionImmunities', 'Condition Immunities', monster.ConditionImmunities, false);
    populateField('monsterSenses', 'Senses', monster.Senses, false);
    populateField('monsterChallenge', 'CR', monster.Challenge||monster.CR, false);

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
    checkAndPopulateSection('monsterReactions', monster.Reactions, 'action');
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
                    case 'reaction':
                    case 'legendaryAction':
                        itemContent = parseAndReplaceDice({ name: item.Name }, `<strong>${item.Name}: </strong>${item.Content}`, true);
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
                const rollableModifier = parseAndReplaceDice({ name: key }, modifierText, true);
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


function populatePlayerDropdown() {
    const playerList = document.getElementById("player-list");
    const nameInput = document.getElementById("player-name-input");
    const dropdownContainer = document.getElementById("player-dropdown-container");

    playerList.style.display = 'none'; // Initially hide the dropdown

    // Clear the existing list
    playerList.innerHTML = '';

    // Populate the dropdown
    playerCharacters.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = player.name;
        listItem.addEventListener('click', () => {
            // Find the selected player
            const selectedPlayer = playerCharacters.find(p => p.name === listItem.textContent);

            console.log(selectedPlayer)

            createEmptyPlayerCard(selectedPlayer)
            // updatePlayerCard(card, selectedPlayer);

            // Hide the dropdown after selection
            playerList.style.display = 'none';
        });
        playerList.appendChild(listItem);
    });

    // Show dropdown on focus
    nameInput.addEventListener('focus', () => {
        playerList.style.display = 'block';
    });

    // Filter dropdown items based on input
    nameInput.addEventListener('input', () => {
        const filterText = nameInput.value.toLowerCase();
        playerList.querySelectorAll('li').forEach(li => {
            const monsterName = li.textContent.toLowerCase();
            li.style.display = monsterName.includes(filterText) ? 'block' : 'none';
        });
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (event) => {
        if (!dropdownContainer.contains(event.target) && event.target !== nameInput) {
            playerList.style.display = 'none';
        }
    });
}

// Function to create player cards
function createEmptyPlayerCard(player) {
    // Create the player card container
    const card = document.createElement('div');
    card.classList.add('player-card'); 

    // Append the card to the container
    const tracker = document.getElementById('initiative-tracker');
    if (tracker) {
        tracker.appendChild(card);
    } else {
        console.error('Initiative tracker container not found.');
    }

    if (player){
        updatePlayerCard(card, player);
        debouncedRequestPlayerInfo();
    }

    return card
}

async function updatePlayerCard(card, player) {
     // Get current initiative value before clearing
     const currentInitInput = card.querySelector('.init-input');
     const currentInitiative = currentInitInput ? parseInt(currentInitInput.value) : 0;
 
     // Clear previous content
     card.innerHTML = '';
 
     console.log(player);
 
     if (player.talespireId) {
         card.dataset.playerId = player.talespireId; // Store player ID in dataset
     }
 
     // Create and add player details
     const initDiv = document.createElement('div');
     initDiv.classList.add('monster-init');
 
     const initInput = document.createElement('input');
     initInput.type = 'number';
     // Set the initiative input value to the stored value or player data
     initInput.value = player.initiative !== undefined ? player.initiative : currentInitiative; 
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

// Function to merge other players into the playerCharacters array
async function mergeOtherPlayers(otherPlayers) {
    try {
        // Flatten the array of arrays into a single array of player objects
        const flattenedPlayers = otherPlayers.flat();

        // Iterate over each player object in the flattened array
        flattenedPlayers.forEach(entry => {
            const player = entry; // Access the player object inside each entry

            console.log(player.id)

            // Check if the player already exists in the playerCharacters array
            const playerExists = playerCharacters.some(p => p.name === player.name);

            // If the player doesn't exist, add them with default stats
            if (!playerExists) {
                playerCharacters.push({
                    name: player.name,
                    hp: { current: 50, max: 50 }, // Default HP values (adjust as needed)
                    ac: 10, // Default AC (adjust as needed)
                    initiative: 0,
                    talespireId: player.id // Use clientId for talespireId
                });
            }
        });
        console.log("Players merged successfully:", playerCharacters);
    } catch (error) {
        console.error("Error merging other players:", error);

        // Fallback: Safely continue without adding players
        console.warn("No players were merged due to an error.");
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
    const cards = Array.from(tracker.querySelectorAll(".monster-card, .player-card"));;
    
    // Check if cards array is empty
    if (cards.length === 0) {
        console.warn("No monster cards to reorder.");
        return;
    }
    
    // Sort the cards based on initiative
    cards.sort((a, b) => {
        const aInit = parseInt(a.querySelector(".init-input")?.value, 10) || 0;
        const bInit = parseInt(b.querySelector(".init-input")?.value, 10) || 0;
        return bInit - aInit; // Higher initiative first
    });
    
    // Remove existing cards and append them back in the correct order
    cards.forEach(card => {
        tracker.appendChild(card);
    });

    currentTurnIndex = 0;
    highlightCurrentTurn();

    debouncedSendInitiativeListToPlayer();
}

const debouncedSendInitiativeListToPlayer = debounce(sendInitiativeListToPlayer, 1000);
const debouncedRequestPlayerInfo = debounce(requestPlayerInfo, 1000); 

//Event listener for the request player stats button. Should broadcast to all players for stats. 
document.getElementById("request-player-stats").addEventListener("click", debouncedRequestPlayerInfo);


function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

let currentMonsterCard

// Function to highlight the current card
function highlightCurrentTurn() {
    const tracker = document.getElementById("initiative-tracker");

    // Remove 'current-turn' from all cards
    const allCards = tracker.querySelectorAll(".monster-card, .player-card");
    allCards.forEach(card => {
        card.classList.remove('current-turn');
    });

    // Add 'current-turn' to the active card
    const currentCard = tracker.querySelectorAll(".monster-card, .player-card")[currentTurnIndex];
    if (currentCard) {
        currentCard.classList.add('current-turn');
        currentMonsterCard = currentCard
    }

    debounce(sendInitiativeTurn(currentTurnIndex), 1000);
}

// Function to update the round display
function updateRoundDisplay() {
    const roundDisplay = document.getElementById('round-counter');
    roundDisplay.textContent = `Round: ${roundCounter}`;
    sendInitiativeRound()
}


// Function to advance to the next turn
function nextTurn() {
    const tracker = document.getElementById("initiative-tracker");
    const cards = tracker.querySelectorAll(".monster-card, .player-card");

 

    if (currentMonsterCard) {
        // Find the condition tracker div inside the active monster card
        conditionTrackerDiv = currentMonsterCard.querySelector('.condition-tracker');
        console.log(conditionTrackerDiv)

        // Retrieve the condition set from the conditions map for this specific monster
        conditionsSet = conditionsMap.get(currentMonsterCard);
        console.log(conditionsSet)

        if (!conditionsSet) {
            console.log('No conditions set for this monster yet.');
        } else {
            if (conditionsSet.has('Recharging')) {
                showErrorModal(`Roll Recharge`,1000);
            }
        }
    } else {
        console.log('No active monster selected.');
        conditionTrackerDiv = document.getElementById('conditionTracker');
        conditionsSet = conditionsMap.get(conditionTrackerDiv);
    }

    // Increment the turn index
    currentTurnIndex++;

    // If the index goes beyond the last card, reset to the first card and increment the round counter
    if (currentTurnIndex >= cards.length) {
        currentTurnIndex = 0; // Reset to the first card
        roundCounter++; // Increment the round
        updateRoundDisplay(); // Update the round counter
    }

    highlightCurrentTurn(); // Highlight the current card
}

function previousTurn() {
    const tracker = document.getElementById("initiative-tracker");
    const cards = tracker.querySelectorAll(".monster-card, .player-card");

    // Increment the turn index
    currentTurnIndex--;

    if (currentTurnIndex < 0) {
        currentTurnIndex = 0; // Reset to the first card
    }
    else{
        highlightCurrentTurn(); // Highlight the current card
    }

    
}

function makeRoundEditable() {
    const roundElement = document.getElementById('round-counter');

    roundElement.addEventListener('blur', function (event) {
        let currentText = roundElement.textContent;

        // Remove non-numeric characters (except for the "Round: " text)
        const numericValue = currentText.replace(/[^0-9]/g, '');

        // Only update if the value is a valid positive number or empty (to avoid invalid input)
        if (numericValue !== '' && !isNaN(numericValue)) {
            roundElement.textContent = `Round: ${numericValue}`;
            roundCounter = parseInt(numericValue, 10); // Update the round counter variable
        } else {
            // Restore the last valid round number if invalid input
            roundElement.textContent = `Round: ${roundCounter}`;
        }
    });

    

    // Ensure the round starts with a valid value
    roundElement.textContent = `Round: ${roundCounter}`;

    roundElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            roundElement.blur(); // Blur the element when Enter is pressed
        }
    });
}





const conditionsMap = new Map();

// Function to handle adding conditions to the active monster
function monsterConditions(condition) {

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
        if (selectedCondition === 'Bloodied'){
            debouncedSendInitiativeListToPlayer()
        }
        const conditionPill = document.createElement('div');
        conditionPill.classList.add('condition-pill');
        conditionPill.innerHTML = `
            <span>${selectedCondition}</span>
            <button class="remove-condition">x</button>
        `;

         // Fetch the description from CONDITIONS or EFFECTS
         let conditionDescription = null;
         const allConditions = [...CONDITIONS, ...EFFECTS];
         const matchingCondition = allConditions.find(
             (entry) => entry.condition === selectedCondition || entry.effect === selectedCondition
         );
 
         if (matchingCondition) {
             conditionDescription = matchingCondition.description;
         }

        // Tooltip logic for hover effect
        let tooltip;
        if (conditionDescription) {
            conditionPill.addEventListener('mouseenter', () => {
                tooltip = document.createElement('div');
                tooltip.classList.add('condition-tooltip');
                tooltip.innerHTML = `
                    <strong>${selectedCondition}</strong><br>
                    ${conditionDescription}
                `;
                document.body.appendChild(tooltip);

                // Position tooltip dynamically
                const rect = conditionPill.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom - window.scrollY;
                const tooltipTop = spaceBelow >= tooltip.offsetHeight + 5
                    ? rect.bottom + window.scrollY + 5
                    : rect.top + window.scrollY - tooltip.offsetHeight - 5;
                const tooltipLeft = rect.left + window.scrollX;

                tooltip.style.position = 'absolute';
                tooltip.style.top = `${tooltipTop}px`;
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.style.opacity = 1, 0);

                conditionPill.tooltip = tooltip;
            });

            conditionPill.addEventListener('mouseleave', () => {
                const tooltip = conditionPill.tooltip;
                if (tooltip) {
                    tooltip.style.opacity = 0;
                    setTimeout(() => tooltip.remove(), 200);
                }
            });
        }

        // Add a click event listener to the remove button
        const removeButton = conditionPill.querySelector('.remove-condition');
        removeButton.addEventListener('click', () => {
            conditionsSet.delete(selectedCondition);
            removeConditionPill(selectedCondition, conditionTrackerDiv);
            if (tooltip) {
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.remove(), 200);
            }
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


function removeMonsterCondition(condition) {
    if (activeMonsterCard) {
        // Ensure the monster's condition map exists
        if (!conditionsMap.has(activeMonsterCard)) return;

        // Get the Set of conditions for this monster card
        const conditionsSet = conditionsMap.get(activeMonsterCard);

        if (conditionsSet.has(condition)) {
            // Remove the condition from the Set
            conditionsSet.delete(condition);

            // Remove the condition pill from the DOM
            const conditionTrackerDiv = activeMonsterCard.querySelector('.conditions-trackers');
            removeConditionPill(condition, conditionTrackerDiv);
        }
    }
    debouncedSendInitiativeListToPlayer()
}










// Saving and loading encounters


let allSavedEncounters = [];

function saveMonsterCardsAsEncounter(encounterName) {

    console.log("Trying to Save Encounter: ", encounterName)
    // Get all monster cards on the screen
    const monsterCards = document.querySelectorAll('.monster-card');
    const playerCards = document.querySelectorAll('.player-card');
    const encounterData = [];

    // Loop through each card to collect data
    monsterCards.forEach(card => {
        const isMonster = 1;
        const init = card.querySelector('.init-input').value;
        const name = card.querySelector('.monster-name').textContent;
        const currentHp = card.querySelector('.current-hp').textContent;
        const maxHp = card.querySelector('.max-hp').textContent;
        const tempHp = card.querySelector('.temp-hp').textContent;
        const conditions = []; // Changed from Map to array
        const isClosed = card.querySelector('.eye-button i').classList.contains('fa-eye-slash') ? 1 : 0;

        const conditionPills = card.querySelectorAll('.condition-pill');
        conditionPills.forEach(pill => {
            const conditionName = pill.querySelector('span').textContent; // Get the condition name
            conditions.push(conditionName); // Add the condition name to the array
        });

        // Push the gathered data for each monster into the encounterData array
        encounterData.push({
            isMonster,
            init,
            name,
            currentHp,
            maxHp,
            tempHp,
            conditions,
            isClosed // Save the state (0 for open, 1 for closed)
        });
    });
    playerCards.forEach(card => {
        const isMonster = 0;
        const name = card.querySelector('.monster-name')?.textContent || "default"; 
        const talespireId = card.getAttribute('data-player-id');
        const hpCurrent = 0; 
        const hpMax = 0; 
        const ac = 0; 
        const initiative = parseInt(card.querySelector('.init-input')?.value) || 0; 
        const passivePerception = 0; 
        const spellSave = 0; 
    
        // Push the gathered data for each player character into the encounterData array
        encounterData.push({
            isMonster,
            name,
            talespireId,
            hp: { current: hpCurrent, max: hpMax },
            ac,
            initiative,
            passivePerception,
            spellSave
        });
    });

    saveToCampaignStorage("Encounter Data", encounterName, encounterData, false)
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
            encounterList.style.display = 'none'; // Hide the list after selecting
            saveMonsterCardsAsEncounter(encounterName)
            showErrorModal(`Saved Encounter - ${encounterName}`)
            // Add a delay before closing the popup (e.g., 500 milliseconds)
            setTimeout(() => {
                closePopup();
            }, 500); // Adjust the 500ms delay as needed
            
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
        }, 1000);
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
        const allMonsterData = await loadDataFromCampaignStorage(dataType);

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
            removeFromCampaignStorage("Encounter Data", encounterName);
            closePopup();
        }
    });
}


function updateMonsterCardDataFromLoad(encounterData) {
    const monsterCardsContainer = document.getElementById('initiative-tracker');
    monsterCardsContainer.innerHTML = ''; // Clear previous monster cards

    // Loop through the monsters in the encounter data and create a new card for each
    encounterData.forEach(monster => {

        console.log(monster)

        if (monster.isMonster === 0){
            mergeOtherPlayers(playersInCampaign) ;
            const card = createEmptyPlayerCard();
            updatePlayerCard(card, monster)
            closePopup();
        }
        else{
            // Create an empty monster card
            const newMonsterCard = createEmptyMonsterCard();

            // Populate the monster card with the correct data
            updateMonsterCard(newMonsterCard, monster);

            // Append the new monster card to the container
            monsterCardsContainer.appendChild(newMonsterCard);
        }
        
    });
    debouncedRequestPlayerInfo();
}




// Handle the rolled initiative for active monster
function handleInitiativeResult(resultGroup) {
    // Extract the results from the initiative result group
    const operands = resultGroup.result.operands;
    console.log(resultGroup);

    let totalInitiative = 0;

    // Loop through each operand to compute the total initiative value
    for (const operand of operands) {
        if (operand.kind === "d20" && operand.results) {
            // Sum up the d20 results
            totalInitiative += operand.results.reduce((sum, roll) => sum + roll, 0);
        } else if (operand.value) {
            // Adjust total based on the operator
            totalInitiative += (resultGroup.result.operator === "+") ? operand.value : -operand.value;
        }
    }

    if (activeMonsterCard) {
        const initInput = activeMonsterCard.querySelector('.init-input');

        if (initInput) {
            console.log(resultGroup);
            initInput.value = totalInitiative; 
            reorderCards();
        } else {
            console.error('Initiative input not found in the active monster card.');
        }
    } else {
        console.warn('No active monster card to update initiative for.');
    }
}


let playersInCampaign;

async function getPlayersInCampaign() {
    // Get the array of player fragments from the campaign
    let tester = await TS.players.getPlayersInThisCampaign();
    console.log("Player Fragments:", tester);  // Log the player fragments array for reference

    // Create an array of promises to process each player
    const playerPromises = tester.map(async (playerFragment) => {
        try {
            // Check if this player is 'me' using the isMe function
            const isPlayerMe = await TS.players.isMe(playerFragment);

            if (isPlayerMe) {
                console.log("Skipping player (it's you):", playerFragment);  // Log that it's you
                return null;  // Skip this player by returning null
            }

            // Call getMoreInfo to get additional information about the player
            const playerInfo = await TS.players.getMoreInfo([playerFragment]);
            console.log("Player Info:", playerInfo);  // Log the player info to console
            return playerInfo;  // Return the player info

        } catch (error) {
            console.error("Error fetching info for player:", playerFragment, error);
            return null;  // In case of error, return null
        }
    });

    // Wait for all the promises to resolve and handle them in parallel
    const playerInfos = await Promise.all(playerPromises);

    // Filter out null values (the ones that were skipped or had errors)
    const validPlayerInfos = playerInfos.filter(info => info !== null);
    playersInCampaign = validPlayerInfos
}


// Subscribe to the event for player joining
function handlePlayerPermissionEvents() {
        getPlayersInCampaign();
};




// Requestion and recieving information from other connected clients. 

async function requestPlayerInfo() {

    console.log("here")

    const message = {
        type: 'request-info',
        data: {
            request: [] // Requesting specific info
        }
    };

    // Send the message to all players on the board
    try {
        console.log("sending message request")
        await TS.sync.send(JSON.stringify(message), "board");
    } catch (error) {
        console.error(`Error sending initiative list to client :`, error);
    }
}


async function sendInitiativeListToPlayer() {
    const tracker = document.getElementById("initiative-tracker");

    // Ensure tracker exists
    if (!tracker) {
        console.error("Initiative tracker element not found.");
        return;
    }

    console.log("sending")

    // Retrieve all cards
    const cards = Array.from(tracker.querySelectorAll(".monster-card, .player-card"));

    // Check if cards array is empty
    if (cards.length === 0) {
        console.warn("No cards to send.");
        return;
    }

    // Prepare the initiative list with compact data
    const initiativeList = cards.map(card => {
        const nameElement = card.querySelector(".monster-name");
        const isPlayer = card.classList.contains("player-card") ? 1 : 0;
        const eyeButton = card.querySelector(".eye-button"); // Assuming the eye button has the class '.eye-button'
        const isVisible = eyeButton && eyeButton.querySelector('i') && eyeButton.querySelector('i').classList.contains('fa-eye-slash') ? 0 : 1;
        const isBloodied = !isPlayer && conditionsMap.has(card) && conditionsMap.get(card).has("Bloodied") ? 1 : 0;

        return {
            n: isPlayer ? nameElement.textContent.trim() : "", // Name only for players
            p: isPlayer, // 1 for player, 0 for enemy
            v: isVisible, // 1 for visible, 0 for hidden
            b: isBloodied // 1 for bloodied, 0 otherwise (only for monsters)
        };
    });

    // Send the initiative list to each client
    const message = {
        type: 'player-init-list',
        data: initiativeList
    };

    try {
        await TS.sync.send(JSON.stringify(message), "board");
    } catch (error) {
        console.error(`Error sending initiative list to client :`, error);
    }
    
    highlightCurrentTurn()
    sendInitiativeRound()
}

async function sendInitiativeTurn(initiativeIndex) {
    // Send the initiative list to each client
    const message = {
        type: 'player-init-turn',
        data: initiativeIndex
    };

    try {
        await TS.sync.send(JSON.stringify(message), "board");
    } catch (error) {
        console.error(`Error sending initiative list to client :`, error);
    }
}

async function sendInitiativeRound() {
    const message = {
        type: 'player-init-round',
        data: roundCounter
    };

    try {
        await TS.sync.send(JSON.stringify(message), "board");
    } catch (error) {
        console.error(`Error sending initiative list to client :`, error);
    }
}





async function handleSyncEvents(event) {

    let fromClient = event.payload.fromClient.id;
    TS.clients.isMe(fromClient).then((isMe) => {
        if (!isMe) {
            console.log("Getting message");
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

}

function handleRequestedStats(parsedMessage, fromClient) {
    console.log("Handling player stats update from:", fromClient);

    // Extract player data from the parsedMessage
    console.log(parsedMessage)
    const playerData = parsedMessage.data; // Assuming data contains stats like HP, AC, etc.
    const playerId = parsedMessage.playerId.id; // Assume fromClient is the unique player ID (client.id)
 
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

function handleUpdatePlayerInitiative(parsedMessage){
    const playerInit = parseInt(parsedMessage.data.Initiative); 
    const playerId = parsedMessage.playerId.id;

    // Get all the player cards from the DOM
    const playerCards = document.querySelectorAll('.player-card');

    // Loop through all the player cards and update the matching one
    playerCards.forEach(card => {
        // Assuming you've stored the player's ID in the card's dataset
        const cardPlayerId = card.dataset.playerId; 

        // If the card's player ID matches the fromClient ID, update the card
        if (cardPlayerId === playerId) {
            const initInput = card.querySelector('.init-input')
            console.log(playerInit)
            initInput.value = playerInit
        }
    });
}


function handleRequestInitList(){
    debouncedSendInitiativeListToPlayer()
}


/*Monster Creator Form Section*/
const customMonsterButton = document.getElementById('customMonsters');
const monsterForm = document.getElementById("monsterCreationForm");
const monsterFormModal = document.getElementById("monsterFormModal");
const closeMonsterFormButton = document.getElementById('closeMonsterForm');

// Open the form
customMonsterButton.addEventListener('click', () => {
    monsterForm.reset()
    resetMonsterForm()
    monsterFormModal.style.display = 'block';
    populateCheckboxes("monsterFormVulnerabilities", resistanceTypes, "vulnerability");
    populateCheckboxes("monsterFormResistances", resistanceTypes, "resistance");
    populateCheckboxes("monsterFormImmunities", resistanceTypes, "immunity");
    populateCheckboxes("monsterFormConditionImmunities", conditionTypes, "conditionImmunity");
    homebrewModal.style.display = 'none';
});

// Close the form
closeMonsterFormButton.addEventListener('click', () => {
    monsterFormModal.style.display = 'none';
});



function resetMonsterForm() {
    // Clear all input fields
    const inputs = monsterForm.querySelectorAll("input");
    inputs.forEach(input => {
        if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false; // Uncheck checkboxes and radio buttons
        } else {
            input.value = ""; // Clear text fields
        }
    });

    // Clear all textareas
    const textareas = monsterForm.querySelectorAll("textarea");
    textareas.forEach(textarea => {
        textarea.value = ""; // Clear text areas
    });

    // Reset all dropdowns (select elements)
    const selects = monsterForm.querySelectorAll("select");
    selects.forEach(select => {
        select.selectedIndex = 0; // Reset to the first option
    });

    // Clear dynamically created checkboxes
    const dynamicCheckboxContainers = [
        "monsterFormVulnerabilities",
        "monsterFormResistances",
        "monsterFormImmunities",
        "monsterFormConditionImmunities"
    ];
    dynamicCheckboxContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = ""; // Clear any dynamically populated checkboxes
        }
    });
}



document.getElementById("monsterCreationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Gather form data
    const monsterData = {
        Id: document.getElementById("monsterFormName").value,
        Name: document.getElementById("monsterFormName").value,
        Path: "",
        Source: document.getElementById("monsterFormSource").value,
        Type: document.getElementById("monsterFormType").value,
        CR: document.getElementById("monsterFormCR").value,
        InitiativeModifier: document.getElementById("monsterFormInitiativeModifier").value,
        HP: {
            Value: parseInt(document.getElementById("monsterFormHPValue").value),
            Notes: document.getElementById("monsterFormHPNotes").value
        },
        AC: {
            Value: parseInt(document.getElementById("monsterFormACValue").value),
            Notes: document.getElementById("monsterFormACNotes").value
        },
        Speed: document.getElementById("monsterFormSpeed").value.split(",") ,
        Senses: document.getElementById("monsterFormSenses").value.split(",") ,
        Languages: document.getElementById("monsterFormLanguages").value.split(",") ,
        Abilities: {
            Str: parseInt(document.getElementById("monsterFormStr").value),
            Dex: parseInt(document.getElementById("monsterFormDex").value),
            Con: parseInt(document.getElementById("monsterFormCon").value),
            Int: parseInt(document.getElementById("monsterFormInt").value),
            Wis: parseInt(document.getElementById("monsterFormWis").value),
            Cha: parseInt(document.getElementById("monsterFormCha").value)
        },
        Saves: saveSaves(),
        Skills: saveSkills(),
        DamageVulnerabilities: getCheckedValues("monsterFormVulnerabilities"),
        DamageResistances: getCheckedValues("monsterFormResistances"),
        DamageImmunities: getCheckedValues("monsterFormImmunities"),
        ConditionImmunities: getCheckedValues("monsterFormConditionImmunities"),
        Traits: collectDynamicFields("monsterFormTraits"),
        Actions: collectDynamicFields("monsterFormActions"),
        Reactions: collectDynamicFields("monsterFormReactions"),
        LegendaryActions: collectDynamicFields("monsterFormLegendaryActions")
    };

    console.log(monsterData); // Save or use this data in your application
    saveMonsterData(monsterData)

    
});

async function saveMonsterData(monsterData){
    try {
        // Save and wait for completion
        await saveToGlobalStorage("Custom Monsters", monsterData.Name, monsterData, true);
        console.log("Save completed.");
        await loadMonsterDataFiles(); // Ensure this runs after save completes
    } catch (error) {
        console.error("Error during save or load:", error);
    }

    monsterFormModal.style.display = 'none'; // Close the form
    monsterForm.reset(); // Reset the form
}

function collectDynamicFields(sectionId) {
    const section = document.getElementById(sectionId);
    const items = [...section.querySelectorAll(".dynamic-entry")];
    return items.map(item => ({
        Name: item.querySelector(".entry-name").value,
        Content: item.querySelector(".entry-content").value,
    }));
}

// Add dynamic fields
function addDynamicField(sectionId, entry = null) {
    const section = document.getElementById(sectionId);
    const div = document.createElement("div");
    div.classList.add("dynamic-entry");

    // Populate fields with entry data if available
    div.innerHTML = `
        <div>
            <input type="text" class="entry-name" placeholder="Name" value="${entry?.Name || ""}">
            <button type="button" class="removeEntry nonRollButton">Remove</button>
        </div>
        <textarea class="entry-content" placeholder="Content">${entry?.Content || ""}</textarea>  
    `;

    // Append the dynamic entry to the section
    section.appendChild(div);

    // Add event listener to the remove button
    div.querySelector(".removeEntry").addEventListener("click", () => {
        div.remove();
    });
}

function populateDynamicFields(sectionId, data) {
    const section = document.getElementById(sectionId);
    section.innerHTML = 
        `<h3>${sectionId.replace("monsterForm", "")}</h3>
        <button type="button" class="nonRollButton">Add</button>`;

    const addButton = section.querySelector("button");
    addButton.addEventListener("click", () => addDynamicField(sectionId));

    // Populate existing data
    data?.forEach(entry => addDynamicField(sectionId, entry));
}


// Buttons to add dynamic entries
document.getElementById("addTraitButton").addEventListener("click", () => addDynamicField("monsterFormTraits"));
document.getElementById("addActionButton").addEventListener("click", () => addDynamicField("monsterFormActions"));
document.getElementById("addReactionButton").addEventListener("click", () => addDynamicField("monsterFormReactions"));
document.getElementById("addLegendaryActionsButton").addEventListener("click", () => addDynamicField("monsterFormLegendaryActions"));

function populateCheckboxes(containerId, types, namePrefix, checkedValues = []) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // Clear container before populating (if re-used)

    types.forEach(type => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const span = document.createElement("span");

        // Configure the checkbox
        checkbox.type = "checkbox";
        checkbox.id = `${namePrefix}${type}`;
        checkbox.name = namePrefix;
        checkbox.value = type;

        // Check the box if the type exists in the checkedValues array
        if (checkedValues.includes(type)) {
            checkbox.checked = true;
        }

        // Configure the span label
        span.id = `label${type}`;
        span.textContent = type;

        // Append the checkbox and span to the label
        label.appendChild(checkbox);
        label.appendChild(span);

        // Add the label to the container
        container.appendChild(label);
    });
}


function getCheckedValues(containerId) {
    const container = document.getElementById(containerId);
    const checkboxes = container.querySelectorAll("input[type='checkbox']");
    const checkedValues = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
    return checkedValues;
}

function saveSaves() {
    const saves = [];
    const saveIds = ["Str", "Dex", "Con", "Int", "Wis", "Cha"];

    saveIds.forEach(saveId => {
        const saveValue = parseInt(document.getElementById(`monsterForm${saveId}Save`).value);
        if (!isNaN(saveValue) && saveValue !== 0) {
            saves.push({
                Name: saveId,
                Modifier: saveValue
            });
        }
    });

    return saves;
}


function saveSkills() {
    const skills = [];
    const skillInputs = [
        { id: "monsterAcrobatics", name: "Acrobatics" },
        { id: "monsterAnimalHandling", name: "Animal Handling" },
        { id: "monsterArcana", name: "Arcana" },
        { id: "monsterAthletics", name: "Athletics" },
        { id: "monsterDeception", name: "Deception" },
        { id: "monsterHistory", name: "History" },
        { id: "monsterInsight", name: "Insight" },
        { id: "monsterIntimidation", name: "Intimidation" },
        { id: "monsterInvestigation", name: "Investigation" },
        { id: "monsterMedicine", name: "Medicine" },
        { id: "monsterNature", name: "Nature" },
        { id: "monsterPerception", name: "Perception" },
        { id: "monsterPerformance", name: "Performance" },
        { id: "monsterPersuasion", name: "Persuasion" },
        { id: "monsterReligion", name: "Religion" },
        { id: "monsterSleightOfHand", name: "Sleight of Hand" },
        { id: "monsterStealth", name: "Stealth" },
        { id: "monsterSurvival", name: "Survival" }
    ];

    skillInputs.forEach(skill => {
        const skillValue = parseInt(document.getElementById(skill.id).value);
        if (!isNaN(skillValue) && skillValue !== 0) {
            skills.push({
                Name: skill.name,
                Modifier: skillValue
            });
        }
    });

    return skills;
}



document.getElementById("editCustomMonsters").addEventListener("click", async() => {
    const monsterSelect = document.getElementById("customMonsterSelect");
    const selectedMonster = monsterSelect.value;
    if (selectedMonster) {
        // Fetch monster data from global storage
        loadDataFromGlobalStorage("Custom Monsters")
            .then((monsters) => {
                const monsterData = monsters[selectedMonster];
                if (monsterData) {
                    // Populate the edit form or interface with the monster's data
                    monsterFormModal.style.display = 'block';
                    populateCheckboxes("monsterFormVulnerabilities", damageTypes, "vulnerability");
                    populateCheckboxes("monsterFormResistances", damageTypes, "resistance");
                    populateCheckboxes("monsterFormImmunities", damageTypes, "immunity");
                    populateCheckboxes("monsterFormConditionImmunities", conditionTypes, "conditionImmunity");
                    homebrewModal.style.display = 'none';
                    populateMonsterForm(monsterData);
                } else {
                    errorModal(`Monster "${selectedMonster}" data not found.`);
                }
            })
            .catch((error) => {
                console.error("Failed to load monster data for editing:", error);
            });
    } else {
        errorModal("No monster selected for editing.");
    }
});




document.getElementById("deleteCustomMonsters").addEventListener("click", async() => {
    const monsterSelect = document.getElementById("customMonsterSelect");
    const selectedMonster = monsterSelect.value;

    if (selectedMonster) {
        removeFromGlobalStorage("Custom Monsters", selectedMonster)
            .then(() => {
                console.log(`Monster "${selectedMonster}" deleted successfully.`);
                loadAndDisplayCustomMonsters(); // Reload the list of monsters
            })
            .catch((error) => {
                console.error("Failed to delete monster:", error);
            });
            await loadMonsterDataFiles()
    } else {
        errorModal("No monster selected for deletion.");
    }
});


function populateMonsterForm(monster) {
    console.log(monster)
    document.getElementById("monsterFormName").value = monster.Name || "";
    document.getElementById("monsterFormType").value = monster.Type || "";
    document.getElementById("monsterFormCR").value = monster.CR || "";
    document.getElementById("monsterFormSource").value = monster.Source || "";
  
    document.getElementById("monsterFormHPValue").value = monster.HP?.Value || "";
    document.getElementById("monsterFormHPNotes").value = monster.HP?.Notes || "";
    document.getElementById("monsterFormACValue").value = monster.AC?.Value || "";
    document.getElementById("monsterFormACNotes").value = monster.AC?.Notes || "";
    document.getElementById("monsterFormInitiativeModifier").value = monster.InitiativeModifier || "";
  
    document.getElementById("monsterFormSpeed").value = monster.Speed || "";
    document.getElementById("monsterFormSenses").value = monster.Senses || "";
    document.getElementById("monsterFormLanguages").value = monster.Languages || "";
  
    // Populate ability scores
    document.getElementById("monsterFormStr").value = monster.Abilities?.Str || "";
    document.getElementById("monsterFormDex").value = monster.Abilities?.Dex || "";
    document.getElementById("monsterFormCon").value = monster.Abilities?.Con || "";
    document.getElementById("monsterFormInt").value = monster.Abilities?.Int || "";
    document.getElementById("monsterFormWis").value = monster.Abilities?.Wis || "";
    document.getElementById("monsterFormCha").value = monster.Abilities?.Cha || "";
  
    // Define the saves mapping
    const saveElements = [
        { id: "monsterFormStrSave", name: "Str" },
        { id: "monsterFormDexSave", name: "Dex" },
        { id: "monsterFormConSave", name: "Con" },
        { id: "monsterFormIntSave", name: "Int" },
        { id: "monsterFormWisSave", name: "Wis" },
        { id: "monsterFormChaSave", name: "Cha" }
    ];
    
    // Populate saves
    saveElements.forEach(saveElement => {
        const save = monster.Saves?.find(s => s.Name === saveElement.name);
        document.getElementById(saveElement.id).value = save ? save.Modifier : "";
    });
  
    // Populate skills
    const skillElements = [
        { id: "monsterAcrobatics", name: "Acrobatics" },
        { id: "monsterAnimalHandling", name: "Animal Handling" },
        { id: "monsterArcana", name: "Arcana" },
        { id: "monsterAthletics", name: "Athletics" },
        { id: "monsterDeception", name: "Deception" },
        { id: "monsterHistory", name: "History" },
        { id: "monsterInsight", name: "Insight" },
        { id: "monsterIntimidation", name: "Intimidation" },
        { id: "monsterInvestigation", name: "Investigation" },
        { id: "monsterMedicine", name: "Medicine" },
        { id: "monsterNature", name: "Nature" },
        { id: "monsterPerception", name: "Perception" },
        { id: "monsterPerformance", name: "Performance" },
        { id: "monsterPersuasion", name: "Persuasion" },
        { id: "monsterReligion", name: "Religion" },
        { id: "monsterSleightOfHand", name: "Sleight of Hand" },
        { id: "monsterStealth", name: "Stealth" },
        { id: "monsterSurvival", name: "Survival" }
    ];

    skillElements.forEach(skillElement => {
        const skill = monster.Skills?.find(s => s.Name === skillElement.name);
        document.getElementById(skillElement.id).value = skill ? skill.Modifier : "";
    });

    populateCheckboxes("monsterFormVulnerabilities", damageTypes, "vulnerability", monster.DamageVulnerabilities || []);
    populateCheckboxes("monsterFormResistances", damageTypes, "resistance", monster.DamageResistances || []);
    populateCheckboxes("monsterFormImmunities", damageTypes, "immunity", monster.DamageImmunities || []);
    populateCheckboxes("monsterFormConditionImmunities", conditionTypes, "conditionImmunity", monster.ConditionImmunities || []);


    populateDynamicFields("monsterFormTraits", monster.Traits);
    populateDynamicFields("monsterFormActions", monster.Actions);
    populateDynamicFields("monsterFormReactions", monster.Reactions);
    populateDynamicFields("monsterFormLegendaryActions", monster.LegendaryActions);
}







document.addEventListener('DOMContentLoaded', async function () {
    // Tab switching code
    const tabs = document.querySelectorAll('.tabs a');
    const sections = document.querySelectorAll('main section');

    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
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

    // Filter elements within .table-tab that have the class .dmTable
    const tableDivs = [...document.querySelectorAll('.dmTable')];
    // Sub-tab switching code
    const subTabs = document.querySelectorAll('.table-tab ul li a');

    subTabs.forEach(subTab => {
        subTab.addEventListener('click', function (e) {
            e.preventDefault();

            subTabs.forEach(st => {
                st.style.border = '';
            });

            // Get the data-target value from the clicked sub-tab
            const targetId = subTab.getAttribute('data-target');
            const targetDiv = document.getElementById(targetId);

            if (targetDiv) {
                // Hide all dmTable elements
                tableDivs.forEach(tableDiv => {
                    tableDiv.style.display = 'none';
                    tableDiv.classList.remove('active');
                });

                // Show the selected dmTable and its nested divs (if any)
                displayTargetDivAndNestedDivs(targetDiv);

                subTab.style.border = '1px solid rgb(151, 151, 151)';
            } else {
                console.log(`Target sub-tab content with data-target '${targetId}' not found.`);
            }
        });
    });

    function displayTargetDivAndNestedDivs(div) {
        // Show the current div
        div.style.display = 'block';
        div.classList.add('active');

        // Recursively check for nested divs and show them
        const nestedDivs = div.querySelectorAll('.dmTable');
        nestedDivs.forEach(nestedDiv => {
            displayTargetDivAndNestedDivs(nestedDiv);
        });
    }





    // Display the initial sub-tab (e.g., Conditions)
    const initialSubTab = subTabs[0];
    initialSubTab.click();



    // Get references to the select element for the shops dropdown list
    const shopSelect = document.getElementById('shopSelect');
    const dropdownContents = document.querySelectorAll('.dropdown-content');

    // Function to show the selected dropdown content
    function showSelectedShopContent() {
        // Hide all dropdown content divs in the shops
        dropdownContents.forEach(function (content) {
            content.style.display = 'none';
        });

        // Show the selected dropdown content div in the shops
        const selectedShop = shopSelect.value;
        const selectedShopContent = document.getElementById(selectedShop);
        if (selectedShopContent) {
            selectedShopContent.style.display = 'block';
        }
    }

    // Add a change event listener to the select element in the shops
    shopSelect.addEventListener('change', showSelectedShopContent);

    // Trigger the change event on page load to show the default shop
    showSelectedShopContent();



});


//DM Tables Section Start

// Function to handle table cell editing
function tableEditing(cell) {
    cell.addEventListener("blur", function() {
        const row = this.closest("tr");
        const table = this.closest(".dmTable, .shopTables");

        if (table) {
            const activeTableId = table.id;
            const rowIndex = Array.from(row.parentNode.children).indexOf(row);

            const dataType = activeTableId;
            const dataId = rowIndex;
            const rowData = {};

            for (let i = 0; i < row.cells.length; i++) {
                rowData[`column${i}`] = row.cells[i].innerHTML;
            }

            saveToGlobalStorage(dataType, dataId, rowData);
        }
    });

    cell.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            this.blur();
            event.preventDefault();
        }
    });
}

// Function to add a new row to the table
function addNewRow(table) {
    const newRow = table.rows[1].cloneNode(true);

    // Clear the content in each cell and set contenteditable="true"
    newRow.querySelectorAll("td").forEach(cell => {
        cell.textContent = ""; // Clear the content
        cell.setAttribute("contenteditable", "true"); // Make the cell editable

        // Call tableEditing function for the new cell
        tableEditing(cell);
    }); 

    // Append the new row to the table
    table.querySelector("tbody").appendChild(newRow);
}

// Use event delegation to handle the click event for "table-row-button"
const addButtonElements = document.querySelectorAll(".table-row-button");
addButtonElements.forEach(button => {
    button.addEventListener("click", function() {
        // Get the table associated with the button (closest table within the same dmTable)
        const table = this.closest(".dmTable, .shopTables").querySelector("table");

        if (table) {
            // Add a new row to the table
            addNewRow(table);
        }
    });
});




const jumpInputs = document.querySelectorAll('.jumpInput');
            
            // Attach event listeners to all elements with the "jumpInput" class
            jumpInputs.forEach(function(input) {
                input.addEventListener('input', calculateJump);
                calculateJump();
            });


function calculateJump() {
    const strength = parseInt(document.getElementById("strength").value);
    const feet = parseInt(document.getElementById("feet").value);
    const inches = parseInt(document.getElementById("inches").value);
    const jumpMultiplier = parseInt(document.getElementById("jumpMultiplier").value);
    const heightInInches = (feet * 12) + inches;

    // Calculate jump distances
    const runningStartLongJump = strength * jumpMultiplier;
    const runningStartHighJump = (3 + ((strength - 10) / 2)) * jumpMultiplier;
    const runningStartReach = (3 + ((strength - 10) / 2) * jumpMultiplier) + 1.5  * (heightInInches/12);
    const noRunningStartLongJump = strength / 2 * jumpMultiplier;
    const noRunningStartHighJump = ((3 + ((strength - 10) / 2)) /2)* jumpMultiplier;
    const noRunningStartReach = ((3 + ((strength - 10) / 2)) /2 * jumpMultiplier) + 1.5 * (heightInInches/12);

    // Update the paragraph texts
    document.getElementById("runningStartLongJump").textContent = runningStartLongJump.toFixed(2) + " feet horizontally.";
    document.getElementById("runningStartHighJump").textContent = runningStartHighJump.toFixed(2) + " feet off the ground.";
    document.getElementById("runningStartReach").textContent = runningStartReach.toFixed(2) + " feet off the ground.";
    document.getElementById("noRunningStartLongJump").textContent = noRunningStartLongJump.toFixed(2) + " feet horizontally.";
    document.getElementById("noRunningStartHighJump").textContent = noRunningStartHighJump.toFixed(2) + " feet off the ground.";
    document.getElementById("noRunningStartReach").textContent = noRunningStartReach.toFixed(2) + " feet off the ground.";
}

document.querySelectorAll("tbody tr").forEach(row => {
    row.addEventListener("contextmenu", function(e) {
        e.preventDefault(); // Prevent the default context menu
        const contextMenu = document.createElement("div");
        contextMenu.classList.add("context-menu");
        contextMenu.innerHTML = '<div class="menu-item">Delete</div>';
        document.body.appendChild(contextMenu);

        contextMenu.style.left = e.clientX + "px";
        contextMenu.style.top = e.clientY + "px";

        contextMenu.querySelector(".menu-item").addEventListener("click", function() {
            row.remove(); // Remove the row
            contextMenu.remove(); // Remove the context menu
        });

        document.addEventListener("click", function() {
            contextMenu.remove(); // Remove the context menu on a click outside
        });
    });
});


    // Random Encounter Generators Start


    // Function to pick a random row from the table
    function pickRandomRow(tableId) {
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) {
            alert('The table is empty. Add rows to pick a random one.');
            return;
        }

        const randomIndex = Math.floor(Math.random() * rows.length);
        const randomRow = rows[randomIndex];
        const rowNumber = randomRow.cells[0].textContent.trim();
        const rowDetails = randomRow.cells[1].textContent.trim();

        errorModal(`#${rowNumber}: ${rowDetails}`);
    }

    // Add event listeners for picking random rows
    const dmTables = document.querySelectorAll('.dmTable');

    dmTables.forEach(table => {
        const button = table.querySelector('.randomButton');
        
        if (button) {
            button.addEventListener('click', function() {
                pickRandomRow(table.id);
            });
        }
    });


    // Random Encounter Generator End





//DM Tables Section End


  
// Function to get the unique ID from a checklist item
function getItemId(element) {
    // Check if the element is null or undefined
    if (!element || !(element instanceof HTMLElement)) {
        console.error('Invalid element:', element);
        return null;
    }

    // Check if the input element is present
    const input = element.querySelector('input');
    if (!input) {
        console.error('Input element not found in the checklist item:', element);
        return null;
    }

    return input.getAttribute('data-id');
}


// Function to add an item to the checklist
function addItem(itemId = null, itemText = '') {
    // If itemId and itemText are not passed, fetch them from input
    if (!itemId || !itemText) {
        itemText = document.getElementById('checklistItem').value.trim();
        if (itemText === '') return; // Ignore empty items
        itemId = generateUniqueId(); // Generate a unique ID
    }

    addItemToUI(itemId, itemText, false);

    // Clear the input field if item is added through input
    if (!itemId || !itemText) {
        document.getElementById('checklistItem').value = '';
    }

    // Save the checklist item to global storage
    saveToGlobalStorage('checklists', itemId, {
        text: itemText,
        checked: false, // Assuming a new item is initially unchecked
    });
}

// Helper function to add a checklist item to the UI
function addItemToUI(itemId, itemText, checked) {
    const checklist = document.getElementById('items');

    // Create a new checklist item
    const newItem = document.createElement('li');
    newItem.innerHTML = `
        <div class="checklist-item-container">
            <div class="checklist-item">
                <div class="checklist-text">
                    <input type="checkbox" onchange="toggleItem(this)" data-id="${itemId}" ${checked ? 'checked' : ''}>
                    <span style="text-decoration: ${checked ? 'line-through' : 'none'}">${itemText}</span>
                </div>

                <div class="remove-button">
                    <button onclick="removeItem(this)">X</button>
                </div>
            
            </div>
            <hr>
        </div> 
        
    `;

    // Append the new item to the checklist
    checklist.appendChild(newItem);
}

// Function to generate a unique ID for checklist items
function generateUniqueId() {
    // Use a timestamp to ensure uniqueness
    return 'item-' + Date.now();
}

// Function to toggle the completion status of an item
function toggleItem(checkbox) {
    const item = checkbox.parentElement;

    // Get the unique identifier for the checklist item
    const itemId = getItemId(item);

    if (itemId !== null) {
        const itemText = item.querySelector('span');
        itemText.style.textDecoration = checkbox.checked ? 'line-through' : 'none';

        // Save the checklist item status to global storage
        saveToGlobalStorage('checklists', itemId, {
            text: itemText.textContent,
            checked: checkbox.checked,
        });
    }
}

// Function to remove an item from the checklist
function removeItem(button) {
    // Target the parent <div> of the button, which is the checklist-item container
    const item = button.closest('.checklist-item-container'); // Ensure we're targeting the correct list item
    
    // Get the unique identifier for the checklist item
    const itemId = item.querySelector('input').getAttribute('data-id'); // Get itemId from the checkbox

    // Remove the item and the <hr> element
    item.remove();  // Remove the checklist item container
    const hrElement = item.nextElementSibling; // The <hr> element that follows
    if (hrElement && hrElement.tagName.toLowerCase() === 'hr') {
        hrElement.remove(); // Remove the <hr> element
    }

    // Save the removal of the checklist item to global storage
    removeFromGlobalStorage('checklists', itemId, true);
}



// Function to update the checklist UI based on the loaded data
function updateChecklistUI(checklistData) {
    const checklist = document.getElementById('items');

    // Clear existing items in the UI
    checklist.innerHTML = '';

    // Iterate through the loaded checklist data and create UI elements
    Object.entries(checklistData).forEach(([itemId, item]) => {
        addItemToUI(itemId, item.text, item.checked);
    });
}


  // Function to populate the conditions table
function populateConditionsTable() {
    const tableBody = document.querySelector("#conditions tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    CONDITIONS.forEach(condition => {
        const row = document.createElement("tr");

        // Condition name
        const conditionCell = document.createElement("td");
        conditionCell.textContent = condition.condition;
        row.appendChild(conditionCell);

        // Description
        const descriptionCell = document.createElement("td");
        const descriptionList = document.createElement("ul");

        condition.description.forEach(desc => {
            // Remove any leading <br> tags or whitespace at the beginning of the description
            const cleanedDesc = desc.replace(/^\s*<br\s*\/?>/, '').trim();
        
            // Create a list item and append the cleaned description
            const listItem = document.createElement("li");
            listItem.textContent = cleanedDesc; // Use the cleaned description
            descriptionList.appendChild(listItem);
        });

        descriptionCell.appendChild(descriptionList);
        row.appendChild(descriptionCell);

        tableBody.appendChild(row);
    });
}

function populateEffectsTable() {
    const tableBody = document.querySelector("#effects tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    EFFECTS.forEach(effect => {
        const row = document.createElement("tr");

        // Condition name
        const conditionCell = document.createElement("td");
        conditionCell.textContent = effect.effect;
        row.appendChild(conditionCell);

        // Description
        const descriptionCell = document.createElement("td");
        const descriptionList = document.createElement("ul");

        effect.description.forEach(desc => {
            // Remove any leading <br> tags or whitespace at the beginning of the description
            const cleanedDesc = desc.replace(/^\s*<br\s*\/?>/, '').trim();
        
            // Create a list item and append the cleaned description
            const listItem = document.createElement("li");
            listItem.textContent = cleanedDesc; // Use the cleaned description
            descriptionList.appendChild(listItem);
        });

        descriptionCell.appendChild(descriptionList);
        row.appendChild(descriptionCell);

        tableBody.appendChild(row);
    });
}




function populateConditionSelect() {
    // Select the target dropdown by its ID
    const conditionSelect = document.getElementById("condition-select");

    // Clear existing options (if needed)
    conditionSelect.innerHTML = "";

    // Combine CONDITIONS and EFFECTS, then sort alphabetically
    const allConditionsAndEffects = [
        ...CONDITIONS.map(condition => ({
            id: `conditionOption${condition.condition}`,
            value: condition.condition
        })),
        ...EFFECTS.map(effect => ({
            id: `conditionOption${effect.effect}`,
            value: effect.effect
        }))
    ].sort((a, b) => a.value.localeCompare(b.value));

    // Add each sorted option to the dropdown
    allConditionsAndEffects.forEach(entry => {
        const option = document.createElement("option");
        option.id = entry.id;
        option.value = entry.value;
        option.textContent = entry.value;
        conditionSelect.appendChild(option);
    });
}

  
// Add an event listener to call the function when the page loads
document.addEventListener("DOMContentLoaded", populateConditionsTable);
document.addEventListener("DOMContentLoaded", populateEffectsTable);


document.getElementById('shopSelect').addEventListener('change', function() {
    updateShopTable(this.value);
});

// Function to create the shop table dynamically
function updateShopTable() {
    const shopSelect = document.getElementById('shopSelect');
    const selectedShop = shopSelect.value;
    const tableDiv = document.getElementById(selectedShop);

    // Clear any existing table content
    const table = tableDiv.querySelector('table');
    table.innerHTML = ''; // Clears the table

    // Add table header
    const headerRow = document.createElement('tr');
    const headers = ['Item', 'Cost', 'Weight', 'Category'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Get the items for the selected shop (with categories)
    const categoryGroups = getShopItems(selectedShop);

    // Loop through each category in the shop
    for (const category in categoryGroups) {
        // Add a subheading row for the category
        const subheadingRow = document.createElement('tr');
        subheadingRow.innerHTML = `<td class="tableSpacer" colspan="4">${category}</td>`;
        table.appendChild(subheadingRow);

        // Loop through the items in this category and create rows
        categoryGroups[category].forEach(item => {

            // Try to find the item data in the equipment data
            const itemData = AppData.equipmentLookupInfo.equipmentData.find(data => data.index === item);

            // If itemData is undefined, log a warning and continue to the next item
            if (!itemData) {
                console.warn(`Item with index "${item}" not found in the equipment data.`);
                return; // Skip the rest of the loop and move to the next item
            }

            let itemName = itemData.name;
            // If quantity exists and is greater than 1, add it in parentheses
            if (itemData.quantity > 1) {
                itemName += ` (${itemData.quantity})`;
            }

            // Create row for the item
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${itemData.cost.quantity} ${itemData.cost.unit}</td>
                <td>${itemData.weight} lbs.</td>
                <td>${itemData.equipment_category.name}</td>
            `;
            table.appendChild(row);
        });
    }
}

  
// Function to retrieve items for a specific shop (e.g., Hunter/Leatherworker) with categories
function getShopItems(shopType) {
    // Define categories and items directly within this function
    const categoryGroups = {
        "hunterLeatherworker": {
            "Light Armor": [
                "padded-armor", "leather-armor", "studded-leather-armor"
            ],
            "Medium Armor": [
                "hide-armor"
            ],
            "Simple Melee Weapons": [
                "club", "dagger", "greatclub", "handaxe", "javelin", "spear"
            ],
            "Simple Ranged Weapons": [
                "shortbow", "sling",
            ],
            "Martial Melee Weapons": [
                "longsword", "shortsword", "whip"
            ],
            "Martial Ranged Weapons": [
                "blowgun", "longbow", "net"
            ],
            "Ammunition": [
                "arrow", "sling-bullet", "blowgun-needle"
            ],
            "Tools": [
                "hunting-trap", "quiver", "leatherworkers-tools", "woodcarvers-tools"
            ]
        },
        // You can add more shops and their categories here
        "blacksmithArmory": {
            "Medium Armor": [
                "chain-shirt", "scale-mail", "breastplate", "half-plate-armor", "shield"
            ],
            "Heavy Armor": [
                "ring-mail", "chain-mail", "splint-armor", "plate-armor"
            ],
            "Simple Melee Weapons": [
                "dagger", "handaxe", "javelin", "light-hammer", "mace", "sickle", "spear"
            ],
            "Simple Ranged Weapons": [
                "crossbow-light", "dart", "javelin", "light-hammer", "mace", "sickle", "spear"
            ],
            "Martial Melee Weapons": [
                "battleaxe", "flail", "glaive", "greataxe", "greatsword", "halberd", "lance", "longsword", "maul", "morningstar", "pike", "rapier", "scimitar", "shortsword", "trident", "war-pick", "warhammer"
            ],
            "Martial Ranged Weapons": [
                "crossbow-hand", "crossbow-heavy"
            ],
            "Ammunition": [
                "crossbow-bolt", "case-crossbow-bolt"
            ],
            "Artisan's Tools": [
                "smiths-tools", "tinkers-tools"
            ],
            "Other": [
                "chain-10-feet", "hammer", "hammer-sledge", "lock", "manacles", "whetstone"
            ]
        },
        "generalStore": {
            "Adventuring Gear": [
                "backpack", "bedroll", "candle", "chain-10-feet", "chalk", "crowbar", "flint-and-steel", "grappling-hook", "hammer", "lantern-hooded", "lantern-bullseye", "oil-flask", "piton", "rope-hempen-50-feet", "rope-silk-50-feet", "shovel", "tent", "torch", "waterskin"
            ],
            "Food and Drink": [
                "rations-1-day"
            ],
            "Clothing": [
                "clothes-common", "clothes-travelers", "clothes-fine", "clothes-costume"
            ],
            "Basic Tools": [
                "healers-kit", "fishing-tackle", "mess-kit", "sealing-wax", "writing-pen", "ink-bottle", "paper-sheet", "parchment", "soap", "vial-empty"
            ],
            "Other": [
                "bag-of-sand", "mirror-steel", "signal-whistle", "bell", "iron-pot", "spoon", "cup-metal"
            ]
        },
        "adventuringSupplies": {
            "Light Armor": [
                "padded-armor"
            ],
            "Medium Armor": [
                "chain-shirt", "shield"
            ],
            "Heavy Armor": [
                "ring-mail"
            ],
            "Simple Melee Weapons": [
                "dagger", "handaxe", "quarterstaff", "spear"
            ],
            "Simple Ranged Weapons": [
                "shortbow"
            ],
            "Martial Melee Weapons": [
                "longsword", "shortsword"
            ],
            "Martial Ranged Weapons": [
                "longbow", "net"
            ],
            "Ammunition": [
                "arrow", "sling-bullet", "blowgun-needle"
            ],
            "Miscellaneous": [
                "backpack", "bedroll", "case-map-or-scroll", "climbers-kit", "clothes-travelers", "crowbar", "fishing-tackle", "flask-or-tankard", "grappling-hook", "hammer", "hammock", "healers-kit", "hunting-trap", "lamp", "lantern-bullseye", "lantern-hooded", "mess-kit", "pick-miners", "piton", "pole-10-foot", "potion-of-healing", "pouch", "quiver", "rations-1-day", "rope-hempen-50-feet", "rope-silk-50-feet", "sack", "shovel", "signal-whistle", "torch", "spyglass", "tent-two-person", "tinderbox", "waterskin", "whetstone"
            ],
            "Tools": [
                "cartographers-tools", "navigators-tools", "bit-and-bridle"
            ],
            "Saddle": [
                "saddle-riding", "saddlebags"
            ],
            "Other": [
                "bag-of-sand", "mirror-steel", "signal-whistle", "bell", "iron-pot", "spoon", "cup-metal"
            ]
        },
        "alchemistHerbalist": {
            "Alchemical": [
                "acid-vial", "alchemists-fire-flask", "antitoxin-vial", "bottle-glass", "component-pouch", "flask-or-tankard", "healers-kit", "oil-flask", "jug-or-pitcher", "healers-kit", "perfume-vial", "poison-basic-vial", "potion-of-healing", "vial"
            ],
            "Artisan's Tools": [
                "alchemists-supplies", "herbalism-kit"
            ]
        },
        "jeweler": {
            "Adventuring Gear": [
                "signet-ring"
            ],
            "Artisan's Tools": [
                "jewelers-tools"
            ]
        },
        "libraryBookstore": {
            "Other Items": [
                "candle", "case-map-or-scroll", "dictionary", "ink-1-ounce-bottle", "ink-pen",
                "paper-one-sheet", "parchment-one-sheet", "portal-scroll", "spellbook"
            ]
        }
        // Add more cases for other shop types...
    };

    // Return the category groups for the specific shop type
    return categoryGroups[shopType] || {}; // Return an empty object if no matching shopType is found
}


// Function to load data into the tables
async function loadTableData() {
    TS.localStorage.global.getBlob().then((existingData) => {
        if (existingData) {
            const allData = JSON.parse(existingData);

            // Loop through all possible data types
            for (const dataType in allData) {
                if (allData.hasOwnProperty(dataType)) {
                    // Find the table with the matching ID
                    const table = document.getElementById(dataType);

                    if (table) {
                        const tbody = table.querySelector("tbody");

                        if (tbody !== null) {
                            const numColumns = tbody.querySelector("tr").cells.length;

                            // Loop through all possible row indices for each data type
                            for (const rowIndex in allData[dataType]) {
                                if (allData[dataType].hasOwnProperty(rowIndex)) {
                                    const rowData = allData[dataType][rowIndex];
                                    const row = tbody.querySelector(`tr:nth-child(${parseInt(rowIndex) + 1})`);

                                    if (row) {
                                        let isEmpty = true; // Flag to track if the row is empty
                                        // Check if all cells in the row are empty
                                        for (let i = 0; i < numColumns; i++) {
                                            if (rowData[`column${i}`]) {
                                                isEmpty = false;
                                                break;
                                            }
                                        }

                                        if (!isEmpty) {
                                            // Populate the table cells with data from the global storage
                                            for (let i = 0; i < numColumns; i++) {
                                                if (rowData[`column${i}`]) {
                                                    row.cells[i].innerHTML = rowData[`column${i}`];
                                                }
                                            }
                                        } else {
                                            // Hide the row if it's completely empty
                                            row.style.display = 'none';
                                        }
                                    } else {
                                        // If the row doesn't exist, create a new row and populate it
                                        const newRow = tbody.insertRow(parseInt(rowIndex));
                                        newRow.innerHTML = "<td contenteditable='true'></td>".repeat(numColumns);

                                        // Call tableEditing function for the new cells
                                        newRow.querySelectorAll("td").forEach(cell => {
                                            cell.setAttribute("contenteditable", "true");
                                            tableEditing(cell);
                                        });

                                        for (let i = 0; i < numColumns; i++) {
                                            if (rowData[`column${i}`]) {
                                                newRow.cells[i].innerHTML = rowData[`column${i}`];
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}


// Function to update the spell details in the 'spell-list' ul
function updateSpellDetails(selectedSpell) {
    const spellList = document.getElementById('spellView');

    // Clear the existing spell details
    spellList.innerHTML = '';

    // Create list items to display the selected spell's details
    const spellDetails = `
        <h3 class="monsterSubHeadings">${selectedSpell.name}</h3>
        <p>Level: <span class="monsterContent">${selectedSpell.level}</span></p>
        <p>Range: <span class="monsterContent">${selectedSpell.range}</span></p>
        <p>Duration: <span class="monsterContent">${selectedSpell.duration}</span></p>
        <p>Concentration: <span class="monsterContent"> ${selectedSpell.concentration}</span></p>
        <p>Ritual: <span class="monsterContent"> ${selectedSpell.ritual}</span></p>
        <p>Components: <span class="monsterContent">${selectedSpell.components}</span></p>
        <p>Material Components: <span class="monsterContent">${selectedSpell.material}</span></p>
        <p>Casting Time: <span class="monsterContent">${selectedSpell.casting_time}</span></p>
        <p>Classes: <span class="monsterContent">${selectedSpell.class}</span></p>
        <p>School: <span class="monsterContent"> ${selectedSpell.school}</span></p>
        <p>Description: <span class="monsterContent" id="descriptionSpan">${selectedSpell.desc}</span></p>
        <p>Higher Level: <span class="monsterContent" id="higherLevelSpan">${selectedSpell.higher_level}</span></p>
    `;

    // Append the selected spell details to the 'spell-list' ul
    spellList.innerHTML = spellDetails;
}



// populates a fake dropdown with all of the spell names. And sets clicking the spell name to UpdateSpellDetails()
function populateListWithAllSpells(spellsData) {

    console.log(spellsData)

    spellsData.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const spellList = document.getElementById('spell-list');
    spellList.innerHTML = '';

    spellsData.forEach((spell) => {
        const listItem = document.createElement('li');
        listItem.classList.add('listSelection')
        listItem.textContent = spell.name;
        listItem.addEventListener('click', () => {
            // Update the spell details when a spell is selected
            updateSpellDetails(spell);
        });
        spellList.appendChild(listItem);
        
    });
    loadSpells(spellsData)
}


// Function to display the list of spells and parse through the text box to get a fitered search. 
function loadSpells(spellsData) {
    const searchInput = document.getElementById('search-input');
    const spellList = document.getElementById('spell-list');

    let listItem = null;
    let selectedSpell = null;

    // Event listener for search input focus
    searchInput.addEventListener('focus', () => {
        spellList.classList.add('show')                
    });
    searchInput.addEventListener('blur',()=> {
        setTimeout(()=>{
            spellList.classList.remove('show');
        }, 200);
    });

    // Event listener for search input changes
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const matchingSpells = spellsData.filter((spell) =>
            spell.name.toLowerCase().includes(filter)
        );
    
        // Clear the existing spell list
        const spellList = document.getElementById('spell-list');
        spellList.innerHTML = '';

        // Populate the list with matching spell names
        matchingSpells.forEach((spell) => {
            listItem = document.createElement('li');
            listItem.textContent = spell.name;
            listItem.addEventListener('click', () => {
                // Update the spell details when a spell is selected
                updateSpellDetails(spell);
            });
            spellList.appendChild(listItem);
        });
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const visibleOptions = Array.from(spellList.getElementsByTagName('li')).filter(option => option.style.display !== 'none');
            if (visibleOptions.length > 0) {
                searchInput.value = visibleOptions[0].textContent;
                listItem = visibleOptions[0].textContent;

                selectedSpell = spellsData.find(spell => spell.name ===listItem);


                if(selectedSpell){
                    updateSpellDetails(selectedSpell)
                }
                searchInput.blur();
            }
        }
    });
}











//Quick Notes Event Listener
const quickNotesSection = document.getElementById('Docs');
const addNotesGroupButton = quickNotesSection.querySelector('.add-notes-group-button');
// Event listener for adding new groups
addNotesGroupButton.addEventListener('click', function () {
    createNewNotesGroup();
    saveNotes()
});

let notesGroupCounter = 0; // Track unique group IDs

// Function to create a new notes group
function createNewNotesGroup(groupData = null) {
    notesGroupCounter++;
    // Create group container
    const groupContainer = document.createElement('div');
    groupContainer.classList.add('notes-group-container');
    groupContainer.id = `notesGroup${notesGroupCounter}`;

    // Create group header
    const groupHeader = document.createElement('div');
    groupHeader.classList.add('notes-group-header');

    const groupTitle = document.createElement('input');
    groupTitle.classList.add('notes-group-title');
    groupTitle.placeholder = `Notes Group ${notesGroupCounter}`;

    // Populate group title if data is provided
    if (groupData && groupData['group-title']) {
        groupTitle.value = groupData['group-title'];
    }

    const addNoteButton = document.createElement('button');
    addNoteButton.classList.add('add-note-button');
    addNoteButton.classList.add('nonRollButton');
    addNoteButton.textContent = '+ Add Note';

    // Add event listener to create new notes
    addNoteButton.addEventListener('click', function () {
        addNewNote(groupContainer);
        saveNotes()
    });

    // Create the notes list container
    const notesList = document.createElement('div');
    notesList.classList.add('notes-list');

    // Add collapse/expand functionality
    const collapseButton = document.createElement('button');
    collapseButton.classList.add('collapse-notes-group-button', 'fa', 'fa-chevron-down');
    collapseButton.addEventListener('click', function () {
        const isCollapsed = notesList.style.display === 'none';
        notesList.style.display = isCollapsed ? 'block' : 'none';
        collapseButton.classList.toggle('collapsed');
        saveNotes()
    });

    groupHeader.appendChild(collapseButton);
    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(addNoteButton);
    groupContainer.appendChild(groupHeader);
    groupContainer.appendChild(notesList);

    // Load existing notes if groupData is provided
    if (groupData && groupData.notes) {
        groupData.notes.forEach(note => addNewNote(groupContainer, note));
    }

    // Add group to the Quick Notes section
    quickNotesSection.insertBefore(groupContainer, addNotesGroupButton);
    return groupContainer;
}






// Function to add a new note
function addNewNote(groupContainer, noteData = null) {
    const notesList = groupContainer.querySelector('.notes-list');
    
    // Create note container
    const noteItem = document.createElement('div');
    noteItem.classList.add('note-item');

    // Create a container for the title and delete button
    const noteHeader = document.createElement('div');
    noteHeader.classList.add('note-header');

    // Note title input
    const noteTitle = document.createElement('input');
    noteTitle.classList.add('note-title');
    noteTitle.placeholder = 'Note Title';
    if (noteData && noteData.noteTitle) {
        noteTitle.value = noteData.noteTitle;
    }

    // Delete button
    const deleteNoteButton = document.createElement('button');
    deleteNoteButton.classList.add('delete-note-button');
    deleteNoteButton.classList.add('nonRollButton');
    deleteNoteButton.textContent = 'X';

    // Delete note event
    deleteNoteButton.addEventListener('click', function () {
        noteItem.remove(); // Remove the note item
        checkAndDeleteGroup(groupContainer); // Check if the group should be deleted
        saveNotes()
    });

    // Add title and delete button to the header
    noteHeader.appendChild(noteTitle);
    noteHeader.appendChild(deleteNoteButton);

    // Note description textarea
    const noteDescription = document.createElement('textarea');
    noteDescription.classList.add('note-description');
    noteDescription.placeholder = 'Write your note here...';
    if (noteData && noteData.noteContent) {
        noteDescription.value = noteData.noteContent;
    }

    // Auto-resize description textarea
    noteDescription.addEventListener('input', function () {
        noteDescription.style.height = 'auto';
        noteDescription.style.height = `${noteDescription.scrollHeight}px`;
    });

    //Saving everything when a note has been changed. 
    noteDescription.addEventListener('blur', function () {
        saveNotes()
    });

    noteTitle.addEventListener('blur', function () {
        saveNotes()
    });


    // Add elements to the note item
    noteItem.appendChild(noteHeader);
    noteItem.appendChild(noteDescription);
    notesList.appendChild(noteItem);
}


function checkAndDeleteGroup(groupContainer) {
    const notesList = groupContainer.querySelector('.notes-list');
    if (notesList.children.length === 0) {
        groupContainer.remove(); // Remove the group container
    }
    saveNotes()
}


//Gathering information from the notes to save it in the local storage file. 
function processNotesGroupData() {
    // Select all notes group containers
    const notesGroupContainers = document.querySelectorAll('.notes-group-container');
    const notesGroupData = [];

    notesGroupContainers.forEach((group, index) => {
        const groupData = {};

        // Get the group's title
        const groupName = group.querySelector('.notes-group-title').value;
        const chevronGroup = group.querySelector('.collapse-notes-group-button');
        const isChevronGroupCollapsed = chevronGroup.classList.contains('collapsed');
        groupData['group-title'] = groupName;
        groupData['group-chevron'] = isChevronGroupCollapsed;

        // Select all notes within this group
        const notes = group.querySelectorAll('.note-item');
        const notesData = [];

        notes.forEach((note) => {
            const noteDataObject = {};
            
            // Get the note title and content
            const noteTitle = note.querySelector('.note-title').value;
            const noteContent = note.querySelector('.note-description').value;

            // Save the note title and content
            noteDataObject['noteTitle'] = noteTitle;
            noteDataObject['noteContent'] = noteContent;

            // Save any additional fields related to the note
            const tagsInput = note.querySelector('.note-tags');
            if (tagsInput) {
                noteDataObject['tags'] = tagsInput.value.split(',').map(tag => tag.trim());
            }

            // Add the note data to the list of notes for this group
            notesData.push(noteDataObject);
        });

        // Save the notes for this group
        groupData['notes'] = notesData;

        // Add the group data to the overall notesGroupData array
        notesGroupData.push(groupData);
    });

    return notesGroupData;
}

//Loading and updating the notes section with the saved notes. 
function loadNotesGroupData(notesGroupData) {    
    if (notesGroupData){
        // Loop through each group in notesGroupData
        notesGroupData.forEach(group => {
            // Use createNewNotesGroup to create a group container with proper groupData
            createNewNotesGroup(group);
        });
    }
    
}


function saveNotes(){
    const groupNotes = processNotesGroupData();
    saveToCampaignStorage("DmNotes", "groupNotesData", groupNotes)
}



// Get references to the input field, button, iframe, and the error modal
const docUrlInput = document.getElementById('docUrlInput');
const googleDocsButton = document.getElementById('googleDocsButton');
const googleDocIframe = document.getElementById('googleDocIframe');

googleDocsButton.addEventListener('click', function() {
    const docUrl = docUrlInput.value.trim(); // Get the URL from the input field

    if (isValidGoogleDocUrl(docUrl)) {
        // Set the source of the iframe to the URL from the input field
        const editableUrl = convertToEditableUrl(docUrl);
        googleDocIframe.src = editableUrl; // Set the iframe source to the editable URL
        docUrlInput.value = ''; // Clear the input field's content
    } else {
        // Display the error modal
        errorModal("Please enter a valid Google Doc URL")
        docUrlInput.value = '';
    }
});


// Function to check if the URL is a valid Google Doc URL
function isValidGoogleDocUrl(url) {
    return url.includes('docs.google.com');
}

// Function to convert the URL to an editable version
function convertToEditableUrl(url) {
    if (url.includes('/view') || url.includes('/pub')) {
        return url.replace(/\/(view|pub).*/, '/edit'); // Replace '/view' or '/pub' with '/edit'
    }
    return url; // If it's already an editable link, return as-is
}

//Google Docs End