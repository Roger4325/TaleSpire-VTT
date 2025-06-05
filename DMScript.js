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
    populateConditionsTable();
    populateEffectsTable();
    populateSchoolofMagicTable();
    populateTravelTable()
    populateTravelCostTable()
    
    updateShopTable("adventuringSupplies")
    await loadTableData()

    loadDataFromGlobalStorage('checklists')
        .then((checklistData) => {
            updateChecklistUI(checklistData);
        })
        .catch((error) => {
            console.error('Error loading checklist data:', error);
        });

    await loadDataFromGlobalStorage('Shop Data')
        .then((shopData) => {
            // This function will process the shop data and add it to the categoryGroups
            for (const [shopTitle, shopInfo] of Object.entries(shopData)) {
                addShopToCategoryGroups(shopTitle, shopInfo);
            }
            populateShopSelect()
        })
        .catch((error) => {
            console.error('Error loading shop data:', error);
        });

    // Initialize the event listeners for existing cells
    const existingCells = document.querySelectorAll("[contenteditable='true']");
    existingCells.forEach(cell => {
        tableEditing(cell);
    });

    loadDataFromCampaignStorage('DmNotes')
    .then((groupNotesData) => {
        loadNotesGroupData(groupNotesData.groupNotesData)
        console.log("here")
    })
    .catch((error) => {
        showErrorModal('Error loading DmNotes data:', error);
    });

    populateMonsterDropdown()
    await mergeOtherPlayers(playersInCampaign)

    populatePlayerDropdown()
    
    populateConditionSelect();
    populateEquipmentList();

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
    { name: 'Custom', hp: { current: 40, max: 40 }, ac: 14, initiative: 0 ,passivePerception: 0, spellSave: 12}
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

        // Check for Spellcasting trait and extract spell save DC
    let spellDC = null;
    if (selectedMonsterData.Traits) {
        for (const trait of selectedMonsterData.Traits) {
            if (trait.Name.toLowerCase().includes("spellcasting")) {
                const content = trait.Content;
                const dcMatch = content.match(/spell save DC (\d+)/i);
                if (dcMatch) {
                    spellDC = dcMatch[1];
                    break;
                }
            }
        }
    }

    
    const statsSpan = document.createElement('span');
    statsSpan.classList.add('non-editable');
    const acText = document.createTextNode(`${translations[savedLanguage].monsterStatsLabels.AC}: ${selectedMonsterData.AC.Value} | `);
    const speedText = document.createTextNode(` ${translations[savedLanguage].monsterStatsLabels.Speed}: ${selectedMonsterData.Speed}`);
    statsSpan.appendChild(acText);
    // Add Spell Save DC to the stats section if found
    if (spellDC) {
        const dcSpan = document.createElement('span');
        dcSpan.classList.add('spell-dc');
        dcSpan.textContent = `${translations[savedLanguage].monsterStatsLabels.DC}: ${spellDC} | `;
        statsSpan.appendChild(dcSpan);
    }
    statsSpan.appendChild(initiativeButton);
    statsSpan.appendChild(speedText);
    statsDiv.appendChild(statsSpan);




    // Create context menu once (place this at the top of your script)
    const contextMenu = document.createElement('div');
    contextMenu.className = 'custom-context-menu';
    contextMenu.style.display = 'none';
    document.body.appendChild(contextMenu);

    // Add Quick Actions if available
    if (selectedMonsterData.QuickAction && Array.isArray(selectedMonsterData.QuickAction)) {
        selectedMonsterData.QuickAction.forEach((action) => {
            // Create container for the quick action
            const quickActionContainer = document.createElement('div');
            quickActionContainer.classList.add('quick-action-container');
            quickActionContainer.style.display = 'flex';
            quickActionContainer.style.gap = '5px';
            quickActionContainer.style.alignItems = 'center';

            // Action name label
            const actionLabel = document.createElement('span');
            actionLabel.textContent = (action.Name || 'Quick Action') + ": ";
            quickActionContainer.appendChild(actionLabel);

            // To Hit section
            const toHitLabel = document.createElement('span');
            toHitLabel.classList.add('actionButtonLabel');
            toHitLabel.setAttribute('data-dice-type', "1d20"+action.ToHit);
            toHitLabel.setAttribute('data-name', action.Name);
            quickActionContainer.appendChild(toHitLabel);

            const toHitButton = document.createElement('button');
            toHitButton.classList.add('actionButton');
            toHitButton.textContent = action.ToHit;
            quickActionContainer.appendChild(toHitButton);

            // Damage section
            const damageLabel = document.createElement('span');
            damageLabel.classList.add('actionButtonLabel');
            damageLabel.setAttribute('data-dice-type', action.Damage);
            damageLabel.setAttribute('data-name', action.DamageType);
            quickActionContainer.appendChild(damageLabel);

            const damageButton = document.createElement('button');
            damageButton.classList.add('actionButton');
            damageButton.textContent = action.Damage;
            
            // Add right-click context menu for crit damage
            damageButton.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                contextMenu.innerHTML = '';

                // Double the damage dice
                const doubledDice = action.Damage.replace(/(\d+)d(\d+)/g, 
                    (match, rolls, sides) => `${rolls * 2}d${sides}`);

                // Create crit label
                const critLabel = document.createElement('label');
                critLabel.className = "actionButtonLabel damageDiceButton";
                critLabel.setAttribute('value', "0");
                critLabel.setAttribute('data-dice-type', doubledDice);
                critLabel.setAttribute('data-name', damageLabel.getAttribute('data-name'));

                // Create crit button
                const critButton = document.createElement('button');
                critButton.className = 'crit-button actionButton skillbuttonstyler';
                critButton.textContent = "Crit";

                contextMenu.appendChild(critLabel);
                contextMenu.appendChild(critButton);
                
                // Position and show menu
                contextMenu.style.left = `${event.pageX}px`;
                contextMenu.style.top = `${event.pageY}px`;
                contextMenu.style.display = 'block';
                
                rollableButtons(); // Enable rolling for the new crit button
            });

            quickActionContainer.appendChild(damageButton);
            statsDiv.appendChild(quickActionContainer);
        });
        rollableButtons();
    }

    // Close context menu on click (add this elsewhere in your script)
    document.addEventListener('click', () => {
        contextMenu.style.display = 'none';
    });



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
    maxHPDiv.textContent = monsterMaxHp  

    currentHPDiv.addEventListener('blur', () => {
        // Optionally evaluate the result when the user finishes editing
        try {
            const currentExpression = currentHPDiv.textContent.trim();
            const adjustment = extractAdjustment(currentExpression);
            adjustMonsterHealth(adjustment);
        }
        catch {
            currentHPDiv.textContent = 0;
        }
    });

    // Blur on Enter key press
    currentHPDiv.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent a new line in the contentEditable
            currentHPDiv.blur();
        }
    });

    maxHPDiv.addEventListener('blur', () => {
        // Optionally evaluate the result when the user finishes editing
        try {
            const currentExpression = maxHPDiv.textContent.trim();
            const adjustment = extractAdjustment(currentExpression);
            adjustMonsterHealth(adjustment);
        }
        catch {
            maxHPDiv.textContent = 0;
        }
    });

    // Blur on Enter key press
    maxHPDiv.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent a new line in the contentEditable
            maxHPDiv.blur();
        }
    });

    function extractAdjustment(expression) {
        // Trim the expression and match the last operation with its operand
        const match = expression.trim().match(/([-+*/]\s*-?\d+)$/);
        if (match) {
            const adjustment = match[0].replace(/\s+/g, ''); // Remove spaces
            return adjustment.startsWith('+') ? adjustment.slice(1) : adjustment; // Remove leading '+' if present
        }
        return null; // Return null if no match
    }

    const hpDisplay = document.createElement('div');
    hpDisplay.classList.add('hp-display');
    hpDisplay.appendChild(currentHPDiv);
    hpDisplay.appendChild(document.createTextNode(' / '));
    hpDisplay.appendChild(maxHPDiv);
    
    const hpAdjustInput = document.createElement('input');
    hpAdjustInput.type = 'number';
    hpAdjustInput.classList.add('hp-adjust-input');
    hpAdjustInput.placeholder = 'Math +n or -n';
    
    const tempHPDiv = document.createElement('span');
    tempHPDiv.classList.add('temp-hp');
    tempHPDiv.contentEditable = true;
    tempHPDiv.textContent = monsterTempHP || 0;  // Use tempHp from the object, if available
    
    const tempHPContainer = document.createElement('div');
    tempHPContainer.classList.add('temp-hp-container');
    const tempHPText = document.createElement('span'); // Create a span for the text
    tempHPText.classList.add('non-editable'); // Add the non-editable class to the span
    tempHPText.textContent = 'Temp: '; // Add the text

    tempHPContainer.appendChild(tempHPText); // Append the span to the container

    tempHPDiv.addEventListener('keydown', (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            tempHPDiv.blur();
        }
    });

    tempHPDiv.addEventListener('blur', () => {
        const value = parseFloat(tempHPDiv.textContent.trim());
        if (isNaN(value) || value < 0) {
            tempHPDiv.textContent = 0;
        } 
        else {
            tempHPDiv.textContent = Math.floor(value);
        }
    });

    tempHPContainer.appendChild(tempHPDiv);
    
    // Add event listener for HP adjustment
    hpAdjustInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const adjustment = parseInt(hpAdjustInput.value, 10);
            if (isNaN(adjustment)) return;
            adjustMonsterHealth(adjustment)
            
    
            hpAdjustInput.value = '';  // Clear input
        }
    });


    function adjustMonsterHealth(adjustment){
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
                    monsterConditions("bloodied");
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
    }
    
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
            card.style.opacity = "0.5";
        } else {
            openEyeButton.innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
            card.style.opacity = "1";
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
    populateField('monsterAC', `${translations[savedLanguage].monsterStatsLabels["AC"]}`, monster.AC?.Value, false);
    populateField('monsterHP', `${translations[savedLanguage].monsterStatsLabels["HP"]}`, `${monster.HP?.Value} ${monster.HP?.Notes}`, true);
    populateField('monsterSpeed', `${translations[savedLanguage].monsterStatsLabels["Speed"]}`, monster.Speed);
    populateField('monsterLanguages', `${translations[savedLanguage].monsterStatsLabels["Languages"]}`, monster.Languages, false);
    populateField('monsterDamageVulnerabilities', `${translations[savedLanguage].monsterStatsLabels["Vulnerabilities"]}`, monster.DamageVulnerabilities, false);
    populateField('monsterDamageResistances', `${translations[savedLanguage].monsterStatsLabels["Resistances"]}`, monster.DamageResistances, false);
    populateField('monsterDamageImmunities', `${translations[savedLanguage].monsterStatsLabels["Immunities"]}`, monster.DamageImmunities, false);
    populateField('monsterConditionImmunities', `${translations[savedLanguage].monsterStatsLabels["Condition Immunities"]}`, monster.ConditionImmunities, false);
    populateField('monsterSenses', `${translations[savedLanguage].monsterStatsLabels["Senses"]}`, monster.Senses, false);
    populateField('monsterChallenge', `${translations[savedLanguage].monsterStatsLabels["CR"]}`, monster.Challenge||monster.CR, false);

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
    if (player.name === "Custom" || player.isCustom === true) {
        // Create a container for the player info
        const playerInfoContainer = document.createElement('div');
        playerInfoContainer.classList.add('player-custom-info'); // Add player-info class for styling
    
        // Helper function to create label and content-editable sections for HP and Max HP
        function createHPGroup() {
            const hpGroup = document.createElement('div');
            hpGroup.classList.add('hp-group'); // Class to style the group
    
            // Label
            const label = document.createElement('label');
            label.textContent = 'HP:';
            label.style.userSelect = 'none';
    
            // HP (current) - content editable
            const hpCurrent = document.createElement('div');
            hpCurrent.contentEditable = true;
            hpCurrent.classList.add('hp-current'); // Add a class for styling
            hpCurrent.textContent = player.hp?.current || '10'; // Default to saved or fallback to 10
            hpCurrent.title = 'Editable: You can do math here, e.g., "15-3"';
    
            // Max HP - content editable
            const hpMax = document.createElement('div');
            hpMax.contentEditable = true;
            hpMax.classList.add('hp-max'); // Add a class for styling
            hpMax.textContent = player.hp?.max || '20'; // Default to saved or fallback to 20
            hpMax.title = 'Max HP: Edit as needed';
    
            // Append everything
            hpGroup.appendChild(label);
            hpGroup.appendChild(hpCurrent);
            hpGroup.appendChild(document.createTextNode(' / ')); // Add separator
            hpGroup.appendChild(hpMax);
    
            // Add event listener for HP math calculations
            hpCurrent.addEventListener('blur', () => {
                try {
                    // Retrieve the current Max HP value
                    const maxHP = parseInt(hpMax.textContent, 10) || 0;
    
                    // Evaluate the math inside the content editable
                    const result = eval(hpCurrent.textContent.replace(/[^-()\d/*+.]/g, '')); // Remove invalid characters
    
                    // Clamp the result between 0 and maxHP
                    hpCurrent.textContent = Math.min(Math.max(0, Math.floor(result)), maxHP); // Ensure it's within bounds
                } catch {
                    hpCurrent.textContent = '0'; // Reset on invalid input
                }
            });
            hpCurrent.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent newline in content-editable
                    hpCurrent.blur(); // Trigger blur event
                }
            });
    
            hpMax.addEventListener('blur', () => {
                try {
                    // Evaluate the math inside the content-editable
                    const result = eval(hpMax.textContent.replace(/[^-()\d/*+.]/g, '')); // Remove invalid characters
    
                    // Ensure hpMax is a non-negative number
                    hpMax.textContent = Math.max(0, Math.floor(result)); // Result cannot be less than 0
                } catch {
                    hpMax.textContent = '0'; // Reset to 0 on invalid input
                }
            });
            hpMax.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent newline in content-editable
                    hpMax.blur(); // Trigger blur event
                }
            });
    
            return hpGroup;
        }
    
        // Helper function to create other label-input pairs
        function createLabelInputPair(labelText, inputType, inputId, placeholder, savedValue) {
            const labelInputGroup = document.createElement('div');
            labelInputGroup.classList.add('label-input-group'); // Class to style the group
    
            const label = document.createElement('label');
            label.textContent = labelText;
            label.style.userSelect = 'none';
    
            const input = document.createElement('input');
            input.type = inputType;
            input.id = inputId;
            input.placeholder = placeholder;
            input.value = savedValue || ''; // Use savedValue if available
    
            // Append label and input to the group
            labelInputGroup.appendChild(label);
            labelInputGroup.appendChild(input);
    
            return labelInputGroup;
        }
    
        // Append elements to the container
        playerInfoContainer.appendChild(createLabelInputPair('Name:', 'text', 'customCharacterName', 'Character Name', player.name));
        playerInfoContainer.appendChild(createLabelInputPair('AC:', 'number', 'customAC', 'AC', player.ac));
        playerInfoContainer.appendChild(createHPGroup());
        playerInfoContainer.appendChild(createLabelInputPair('Passive Per:', 'number', 'customPassivePerception', 'Per', player.passivePerception));
        playerInfoContainer.appendChild(createLabelInputPair('Spell Save:', 'number', 'customSpellSaveDC', 'DC', player.spellSave));
    
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

        const conditionContainer = document.createElement('span');
        conditionContainer.classList.add('conditions-trackers');
        conditionContainer.style.display = 'flex';
        conditionContainer.style.flexWrap = 'wrap';
        conditionContainer.style.gap = '3px';
        conditionContainer.style.marginTop = '5px';

        // Add conditions to container
        player.conditions?.forEach(conditionKey => {
            const conditionPill = createConditionPill(conditionKey, player.language);
            conditionContainer.appendChild(conditionPill);
        });

        // Add condition container to card
        if (player.name !== "Custom" && !player.isCustom) {
            playerHeader.appendChild(conditionContainer);
        }



        // Create the player health div
        const playerHealthDiv = document.createElement('div');
        playerHealthDiv.classList.add('player-health');
        
        // HP: current / max
        const hpSpan = document.createElement('span');
        hpSpan.textContent = `HP: ${player.hp.current} / ${player.hp.max}`;
        
        // Temp HP: value (default to 0)
        const tempHpSpan = document.createElement('div');
        tempHpSpan.textContent = `Temp HP: ${player.tempHp ?? 0}`;
        
        playerHealthDiv.appendChild(hpSpan);
        playerHealthDiv.appendChild(tempHpSpan);

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
    debouncedSendInitiativeListToPlayer()
}


function createConditionPill(conditionKey, language) {
    // Get translation data
    const conditionData = translations[savedLanguage]?.conditions?.[conditionKey] || translations[savedLanguage]?.effects?.[conditionKey];
    
    const displayName = conditionData?.name || conditionKey;

    // Create pill element
    const pill = document.createElement('div');
    pill.classList.add('condition-pill-player');
    
    pill.innerHTML = `
        <span>${displayName}</span>
    `;
    return pill;
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

    // currentTurnIndex = 0;
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

        // Retrieve the condition set from the conditions map for this specific monster
        conditionsSet = conditionsMap.get(currentMonsterCard);

        if (conditionsSet) {
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
const monsterExhaustionLevels = new Map();

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

        // Track exhaustion levels for each monster card (initialize this elsewhere in your code)
        
        // Get the Set of conditions for this monster card
        const conditionsSet = conditionsMap.get(activeMonsterCard);
        let displayName;
        let isExhaustion = false;

        // Handle Exhaustion
        if (selectedCondition === 'exhaustion') {
            isExhaustion = true;
            
            // Get/Increment exhaustion level
            console.log(monsterExhaustionLevels)
            const currentLevel = monsterExhaustionLevels.get(activeMonsterCard) || 0;
            const newLevel = currentLevel + 1;
            monsterExhaustionLevels.set(activeMonsterCard, newLevel);

            // Clear previous exhaustion entry (if any)
            console.warn(conditionsSet)
            if (conditionsSet.has('exhaustion')) {
                displayName = `${translations[savedLanguage].conditions.exhaustion.name} ${currentLevel}`;
                removeConditionPill(displayName, conditionTrackerDiv);
                conditionsSet.delete(selectedCondition);
                console.warn(conditionsSet)  
            }

            displayName = `${translations[savedLanguage].conditions.exhaustion.name} ${newLevel}`;

            // Add the internal identifier to the Set
            conditionsSet.add('exhaustion');

        } else if (conditionsSet.has(selectedCondition)) {
            // If the selected condition is already applied, do nothing
            return;
        }

        // Fetch display name for other conditions
        const conditionObj = translations[savedLanguage].conditions;
        const effectObj = translations[savedLanguage].effects;
        if (!isExhaustion) {
            const processedCondition = selectedCondition.replace(/\s\d+$/, '').toLowerCase();
            displayName = conditionObj[processedCondition]?.name || effectObj[processedCondition]?.name || selectedCondition;
        }

        // Create a condition pill
        console.log(selectedCondition)
        if (selectedCondition === 'bloodied'){
            debouncedSendInitiativeListToPlayer()
            console.log("here")
        }
        const conditionPill = document.createElement('div');
        conditionPill.classList.add('condition-pill');
        conditionPill.innerHTML = `
            <span>${displayName}</span>
            <button class="remove-condition">x</button>
        `;

        // Fetch the description from translated conditions or effects
        let conditionDescription = null;
        // Process the selectedCondition to remove trailing space + number and convert to lowercase
        const processedCondition = selectedCondition.replace(/\s\d+$/, '').toLowerCase();

        if (conditionObj[processedCondition]) {
            conditionDescription = conditionObj[processedCondition].description;
        } else if (effectObj[processedCondition]) {
            conditionDescription = effectObj[processedCondition].description;
        }

        // Tooltip logic for hover effect
        let tooltip;
        if (conditionDescription) {
            conditionPill.addEventListener('mouseenter', () => {
                tooltip = document.createElement('div');
                tooltip.classList.add('condition-tooltip');

                // Use the translated name for the tooltip title
                const translatedName = conditionObj[processedCondition]?.name || effectObj[processedCondition]?.name;

                tooltip.innerHTML = `
                    <strong>${translatedName}</strong><br>
                    ${conditionDescription.join('<br>')} <!-- Join description array with <br> -->
                `;
                document.body.appendChild(tooltip);

                // Position tooltip dynamically
                const rect = conditionPill.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom - window.scrollY;
                const tooltipTop = spaceBelow >= tooltip.offsetHeight + 5
                    ? rect.bottom + window.scrollY + 5
                    : rect.top + window.scrollY - tooltip.offsetHeight - 5;

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
            removeConditionPill(displayName, conditionTrackerDiv);
            if (tooltip) {
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.remove(), 200);
            }
        });

        // Add the condition to the Set and the condition pill to the container
        conditionsSet.add(selectedCondition);
        conditionTrackerDiv.appendChild(conditionPill);
    }
    else{
        showErrorModal("No monster currently slected. Please click on the monster you would like to apply a condition to.")
    }
}

// Function to remove a condition pill
function removeConditionPill(condition, conditionTrackerDiv) {
    const conditionPills = conditionTrackerDiv.querySelectorAll('.condition-pill');
    console.log(conditionPills)
    for (const pill of conditionPills) {
        console.warn(pill.querySelector('span').textContent, condition)
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
        const isCustom = card.querySelector('#customCharacterName') !== null;
        const name = card.querySelector('.monster-name')?.textContent 
                  || card.querySelector('#customCharacterName')?.value 
                  || "default";
        const talespireId = card.getAttribute('data-player-id')|| null;
        const hpCurrent = parseInt(card.querySelector('.hp-current')?.textContent) || 0;
        const hpMax = parseInt(card.querySelector('.hp-max')?.textContent) || 0;
        const ac = parseInt(card.querySelector('#customAC')?.value) || 0;
        const initiative = parseInt(card.querySelector('.init-input')?.value) || 0;
        const passivePerception = parseInt(card.querySelector('#customPassivePerception')?.value) || 0;
        const spellSave = parseInt(card.querySelector('#customSpellSaveDC')?.value) || 0;
    
        encounterData.push({
            isMonster,
            isCustom,
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
    debouncedSendInitiativeListToPlayer();
}




// Handle the rolled initiative for active monster
function handleInitiativeResult(resultGroup) {
    // Extract the results from the initiative result group
    const operands = resultGroup.result.operands;
    console.log(resultGroup);

    let totalInitiative = 0;


    if(operands){
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
    }
    else{
        totalInitiative = resultGroup.result.results[0]
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
        const nameElement = card.querySelector('.monster-name')?.textContent 
        || card.querySelector('#customCharacterName')?.value 
        || "default";
        const isPlayer = card.classList.contains("player-card") ? 1 : 0;
        const eyeButton = card.querySelector(".eye-button"); // Assuming the eye button has the class '.eye-button'
        const isVisible = eyeButton && eyeButton.querySelector('i') && eyeButton.querySelector('i').classList.contains('fa-eye-slash') ? 0 : 1;
        const isBloodied = !isPlayer && conditionsMap.has(card) && conditionsMap.get(card).has("bloodied") ? 1 : 0;
        return {
            n: isPlayer ? nameElement : "", // Name only for players
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


function decodeConditionIndices(indices, language) {
    if (!indices || !language) return [];
    
    // Get condition/effect keys for the specified language
    const conditionKeys = [
        ...Object.keys(translations[language]?.conditions || {}),
        ...Object.keys(translations[language]?.effects || {})
    ].sort();

    return indices.map(idx => {
        if (idx >= 0 && idx < conditionKeys.length) {
            return conditionKeys[idx];
        }
        return null;
    }).filter(Boolean);
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

    // Decode condition indices
    playerData.conditions = decodeConditionIndices(
        playerData.conditions, 
        playerData.language
    );
 
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
let quickActionsLabel = 

// Open the form
customMonsterButton.addEventListener('click', () => {
    quickActionsLabel = translations[savedLanguage].dynamicSections.monsterFormQuickActions;
    console.warn(quickActionsLabel)
    monsterForm.reset()
    resetMonsterForm()
    monsterFormModal.style.display = 'block';
    populateCheckboxes("monsterFormVulnerabilities", translations[savedLanguage].resistanceTypesTranslate, "vulnerability");
    populateCheckboxes("monsterFormResistances", translations[savedLanguage].resistanceTypesTranslate, "resistance");
    populateCheckboxes("monsterFormImmunities", translations[savedLanguage].resistanceTypesTranslate, "immunity");
    populateCheckboxes("monsterFormConditionImmunities", translations[savedLanguage].conditionTypesTranslated, "conditionImmunity");
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

    Object.keys(translations[savedLanguage].dynamicSections).forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (!section) return; // Skip if that element ID does not exist

        const sectionName = translations[savedLanguage].dynamicSections[sectionId];

        // Check if this section’s translated name is the “Quick Actions” label
        const isQuick = (sectionName === quickActionsLabel);

        // Only render an “Add” button if it’s not the Quick Actions section
        const addButtonHtml = isQuick
            ? "" 
            : `<button type="button" class="nonRollButton">
                ${translations[savedLanguage].monsterFormAdd}
            </button>`;

        section.innerHTML = `
            <legend>${sectionName}</legend>
            ${addButtonHtml}
        `;

        // If it’s not “Quick Actions,” hook up the Add‐button listener:
        if (!isQuick) {
            section.querySelector("button")
                ?.addEventListener("click", () => addDynamicField(sectionId));
        }

        // Always add one initial empty entry
        addDynamicField(sectionId);
    });
}



document.getElementById("monsterCreationForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Gather form data
    const monsterData = {
        Id: document.getElementById("monsterFormName").value,
        Name: document.getElementById("monsterFormName").value,
        Path: "",
        Source: document.getElementById("monsterFormSource").value || "Homebrew",
        Type: document.getElementById("monsterFormType").value,
        CR: document.getElementById("monsterFormCR").value || "0",
        InitiativeModifier: document.getElementById("monsterFormInitiativeModifier").value || Math.floor((parseInt(document.getElementById("monsterFormDex").value) - 10) / 2) || "0",
        HP: {
            Value: parseInt(document.getElementById("monsterFormHPValue").value) || "10",
            Notes: document.getElementById("monsterFormHPNotes").value
        },
        AC: {
            Value: parseInt(document.getElementById("monsterFormACValue").value) || "10",
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
        QuickAction: collectDynamicFields("monsterFormQuickActions"),
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

    console.warn
    
    if (sectionId === "monsterFormQuickActions") {
        console.warn("Collecting Quick Actions");
        return items.map(item => ({
            Name: item.querySelector(".entry-name").value,
            ToHit: item.querySelector(".entry-tohit").value,
            Damage: item.querySelector(".entry-damage").value,
            DamageType: item.querySelector(".entry-damagetype").value
        }));
    } else {
        console.log
        return items.map(item => ({
            Name: item.querySelector(".entry-name").value,
            Content: item.querySelector(".entry-content").value,
        }));
    }
}

// Add dynamic fields
function addDynamicField(sectionId, entry = null) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    console.warn(`Adding dynamic field to section: ${sectionId}, ${entry ? "with existing data" : "no existing data"}`);

    // Determine if this is the “Quick Actions” section in the current language
    const sectionName = translations[savedLanguage].dynamicSections[sectionId];
    const quickActionsLabel = translations[savedLanguage].dynamicSections.monsterFormQuickActions;
    const isQuick = (sectionName === quickActionsLabel);

    const div = document.createElement("div");
    div.classList.add("dynamic-entry");

    let html;
    if (isQuick) {
        // Quick Actions: no Remove button
        html = `
            <div>
                <input type="text" class="entry-name" placeholder="Action Name" value="${entry?.Name || ""}">
                <input type="text" class="entry-tohit" placeholder="To Hit Bonus" value="${entry?.ToHit || ""}">
                <input type="text" class="entry-damage" placeholder="Damage Dice" value="${entry?.Damage || ""}">
                <input type="text" class="entry-damagetype" placeholder="Damage Type" value="${entry?.DamageType || ""}">
            </div>
        `;
    } else {
        // All other sections: include a Remove button using the translated label
        html = `
            <div>
                <input type="text" class="entry-name" placeholder="Name" value="${entry?.Name || ""}">
                <button type="button" class="removeEntry nonRollButton">
                  ${translations[savedLanguage].monsterFormRemove}
                </button>
            </div>
            <textarea class="entry-content" placeholder="Content">${entry?.Content || ""}</textarea>
        `;
    }

    div.innerHTML = html;
    section.appendChild(div);

    // Only hook up the Remove listener if not “Quick Actions”
    if (!isQuick) {
        div.querySelector(".removeEntry") ?.addEventListener("click", () => div.remove());
    }
}


function populateDynamicFields(sectionId, data) {
    const section = document.getElementById(sectionId);
    if (!section) return; // Safety check

    // Look up the translated title for this sectionId
    const sectionName = translations[savedLanguage].dynamicSections[sectionId] || sectionId.replace("monsterForm", "");
    const quickActionsLabel = translations[savedLanguage].dynamicSections.monsterFormQuickActions;
    const isQuick = (sectionName === quickActionsLabel);

    // If it's not Quick Actions, show an “Add” button
    const addButtonHtml = isQuick ? "" : `<button type='button' class='nonRollButton'> ${translations[savedLanguage].monsterFormAdd}</button>`;

    section.innerHTML = `<legend>${sectionName}</legend>${addButtonHtml}`;

    // Hook up the Add‐button click only if it's not Quick Actions
    if (!isQuick) {section.querySelector("button")?.addEventListener("click", () => addDynamicField(sectionId));}

    // 1) If there are existing entries in data, render each with addDynamicField(...)
    // 2) If data is null/undefined or length === 0, then ALWAYS add one empty entry
    if (Array.isArray(data) && data.length > 0) {data.forEach(entry => addDynamicField(sectionId, entry));
    } else {
        // Guarantee at least one blank field for Quick Actions (and the others too)
        addDynamicField(sectionId);
    }
}


// Buttons to add dynamic entries
document.getElementById("addTraitButton").addEventListener("click", () => addDynamicField("monsterFormTraits"));
document.getElementById("addActionButton").addEventListener("click", () => addDynamicField("monsterFormActions"));
document.getElementById("addReactionButton").addEventListener("click", () => addDynamicField("monsterFormReactions"));
document.getElementById("addLegendaryActionsButton").addEventListener("click", () => addDynamicField("monsterFormLegendaryActions"));

function populateCheckboxes(containerId, typesMap, namePrefix, checkedValues = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear container before populating

  // Iterate over your object’s entries ([typeKey, typeLabel])
  Object.entries(typesMap).forEach(([typeKey, typeLabel]) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const span = document.createElement("span");

    // Configure the checkbox
    checkbox.type = "checkbox";
    checkbox.id = `${namePrefix}${typeKey}`;
    checkbox.name = namePrefix;
    checkbox.value = typeKey;

    // Pre-check if applicable
    if (checkedValues.includes(typeKey)) {
      checkbox.checked = true;
    }

    // Configure the visible label
    span.id = `label${typeKey}`;
    span.textContent = typeLabel;

    // Assemble and attach
    label.appendChild(checkbox);
    label.appendChild(span);
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
                    populateCheckboxes("monsterFormVulnerabilities", translations[savedLanguage].resistanceTypesTranslate, "vulnerability");
                    populateCheckboxes("monsterFormResistances", translations[savedLanguage].resistanceTypesTranslate, "resistance");
                    populateCheckboxes("monsterFormImmunities", translations[savedLanguage].resistanceTypesTranslate, "immunity");
                    populateCheckboxes("monsterFormConditionImmunities", translations[savedLanguage].conditionTypesTranslated, "conditionImmunity");
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

    populateCheckboxes("monsterFormVulnerabilities", translations[savedLanguage].resistanceTypesTranslate, "vulnerability", monster.DamageVulnerabilities || []);
    populateCheckboxes("monsterFormResistances", translations[savedLanguage].resistanceTypesTranslate, "resistance", monster.DamageResistances || []);
    populateCheckboxes("monsterFormImmunities", translations[savedLanguage].resistanceTypesTranslate, "immunity", monster.DamageImmunities || []);
    populateCheckboxes("monsterFormConditionImmunities", translations[savedLanguage].conditionTypesTranslated, "conditionImmunity", monster.ConditionImmunities || []);


    populateDynamicFields("monsterFormTraits", monster.Traits);
    populateDynamicFields("monsterFormActions", monster.Actions);
    populateDynamicFields("monsterFormReactions", monster.Reactions);
    populateDynamicFields("monsterFormLegendaryActions", monster.LegendaryActions);
    populateDynamicFields("monsterFormQuickActions", monster.QuickAction);
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


    // Function to show the selected dropdown content
    function showSelectedShopContent() {
        const shopSelect = document.getElementById('shopSelect');
        const dropdownContents = document.querySelectorAll('.dropdown-content');
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

            if (dataType === "effects") {
                const effectName = rowData.column0?.trim(); // column0: effect name
                const effectDescription = rowData.column1?.trim(); // column1: description
            
                if (effectName) {
                    const currentEffects = translations[savedLanguage].effects;
            
                    // Check for existing effect by name (case-insensitive)
                    const existingEffectEntry = Object.values(currentEffects).find(
                        effect => effect.name.toLowerCase() === effectName.toLowerCase()
                    );
            
                    if (existingEffectEntry) {
                        // Update existing effect's description
                        existingEffectEntry.description = [effectDescription];
                    } else {
                        // Generate a unique key and add new effect
                        const newKey = generateKey(effectName, currentEffects);
                        currentEffects[newKey] = {
                            name: effectName,
                            description: [effectDescription]
                        };
                    }
            
                    populateConditionSelect();
                }
            }

            saveToGlobalStorage(dataType, dataId, rowData);
        }
    });

    cell.addEventListener("keydown", function(event) {
        if (event.key === "Enter" && !event.shiftKey) {
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
    document.getElementById("runningStartLongJump").textContent = runningStartLongJump.toFixed(2);
    document.getElementById("runningStartHighJump").textContent = runningStartHighJump.toFixed(2);
    document.getElementById("runningStartReach").textContent = runningStartReach.toFixed(2);
    document.getElementById("noRunningStartLongJump").textContent = noRunningStartLongJump.toFixed(2);
    document.getElementById("noRunningStartHighJump").textContent = noRunningStartHighJump.toFixed(2);
    document.getElementById("noRunningStartReach").textContent = noRunningStartReach.toFixed(2);
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
        if (itemText === ''){
            showErrorModal("Task input is empty. Please enter the task you would like to create.")
            return;
        }  // Ignore empty items
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


// Generic function to populate a table
function populateTable(tableId, dataKey) {
    const tableBody = document.querySelector(`#${tableId} tbody`);

    tableBody.innerHTML = ""; // Clear existing rows

    // Get the data object and its keys
    const dataObj = translations[savedLanguage][dataKey];
    const dataKeys = Object.keys(dataObj);

    // Sort the keys alphabetically by the name
    dataKeys.sort((a, b) => {
        const nameA = dataObj[a].name.toLowerCase();
        const nameB = dataObj[b].name.toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Populate the table with sorted data
    dataKeys.forEach(key => {
        const item = dataObj[key];
        const row = document.createElement("tr");

        // Name
        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        // Description
        const descCell = document.createElement("td");
        const descList = document.createElement("ul");

        item.description.forEach(desc => {
            const cleanedDesc = desc.replace(/^\s*<br\s*\/?>/, '').trim();
            const listItem = document.createElement("li");
            listItem.textContent = cleanedDesc;
            descList.appendChild(listItem);
        });

        descCell.appendChild(descList);
        row.appendChild(descCell);
        tableBody.appendChild(row);
    });
}

// Functions to populate specific tables
function populateConditionsTable() {
    populateTable("conditionsTable", "conditions");
}

function populateEffectsTable() {
    populateTable("effectsTable", "effects");
}

function populateSchoolofMagicTable() {
    populateTable("schoolsTable", "schools");
}

function populateTravelTable() {
    populateTable("travelTable", "travel");
}

function populateTravelCostTable() {
    populateTable("travelCostTable", "travelCosts");
}




document.getElementById('shopSelect').addEventListener('change', function() {
    updateShopTable();
});

// Function to create the shop table dynamically
function updateShopTable() {
    const shopSelect = document.getElementById('shopSelect');
    const selectedShop = shopSelect.value;

    // Find the parent container where new divs can be appended
    const parentContainer = document.getElementById('dropdownShopsDiv');

    // Check if the div for the selected shop exists, if not create it
    let tableDiv = document.getElementById(selectedShop);
    if (!tableDiv) {
        console.warn(`No element found with ID "${selectedShop}". Creating one dynamically.`);
        tableDiv = document.createElement('div');
        tableDiv.className = 'dropdownShops';
        parentContainer.appendChild(tableDiv);
    }

    // Check if the table exists
    let table = tableDiv.querySelector('table');
    if (table) {
        table.innerHTML = ''; // Clears the table
    } else {
        // Create a new table if it doesn't exist
        const tableContainer = document.createElement('div');
        tableContainer.id = `${selectedShop}`; // Assign an ID to the new table
        tableContainer.className = 'dropdown-content'; // Add the necessary class

        table = document.createElement('table');
        table.id = `${selectedShop}Table`; // Assign an ID to the new table
        table.className = 'shopTables'; // Add the necessary class

        tableDiv.appendChild(tableContainer); // Append the new table to the div
        tableContainer.appendChild(table); // Append the new table to the div
    }

    // Add table header
    const headerRow = document.createElement('tr');
    const headerKeys = ['item', 'cost', 'weight', 'category'];

    headerKeys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = translations[savedLanguage].shopHeadersTranslate[key];
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);
    // Get the items for the selected shop (with categories)
    const categoryGroups = getShopItems(selectedShop);

    // Loop through each category in the shop
    for (const category in categoryGroups) {
        // Add a subheading row for the category
        const subheadingRow = document.createElement('tr');
        subheadingRow.innerHTML = `<td class="tableSpacer" colspan="4">${translations[savedLanguage].categoryLabels.categoryLabels[category] || category}</td>`;
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

            // Create a hoverable item element
            const itemElement = document.createElement('span');
            itemElement.classList.add('item-hover');
            itemElement.style.textDecoration = 'underline';
            itemElement.textContent = itemName;

            // Tooltip logic for equipment hover
            itemElement.addEventListener('mouseenter', () => {
                console.log("entering item");
                const tooltip = document.createElement('div');
                tooltip.classList.add('item-tooltip');
                tooltip.innerHTML = `
                    <h2>${itemData.name}</h2>
                    ${itemData.cost ? `<strong>Cost:</strong> ${itemData.cost.quantity} ${itemData.cost.unit}<br>` : ''}
                    ${itemData.weight !== undefined ? `<strong>Weight:</strong> ${itemData.weight} lbs<br>` : ''}
                    ${itemData.equipment_category ? `<strong>Category:</strong> ${itemData.equipment_category.name}<br>` : ''}
                    ${itemData.weapon_category ? `<strong>Weapon Category:</strong> ${itemData.weapon_category}<br>` : ''}
                    ${itemData.armor_category ? `<strong>Armor Category:</strong> ${itemData.armor_category}<br>` : ''}
                    ${itemData.armor_class ? `<strong>Armor Class:</strong> ${itemData.armor_class.base} ${itemData.armor_class.dex_bonus ? '+ Dex Modifier' : ''}<br>` : ''}
                    ${itemData.str_minimum ? `<strong>Strength Requirement:</strong> ${itemData.str_minimum}<br>` : ''}
                    ${itemData.stealth_disadvantage ? `<strong>Stealth:</strong> Disadvantage<br>` : ''}
                    ${itemData.damage ? `<strong>Damage:</strong> ${itemData.damage.damage_dice} ${itemData.damage.damage_type.name}<br>` : ''}
                    ${itemData.range ? `<strong>Range:</strong> ${itemData.range.normal} ft${itemData.range.long ? `/${itemData.range.long} ft` : ''}<br>` : ''}
                    ${itemData.rarity ? `<strong>Rarity:</strong> ${itemData.rarity.name}<br>` : ''}
                    ${itemData.hasCharges ? `<strong>Charges:</strong> ${itemData.chargesOptions.maxCharges} (${itemData.chargesOptions.chargeReset})<br>` : ''}
                    ${itemData.properties && itemData.properties.length > 0 
                        ? `<strong>Properties:</strong> ${itemData.properties.map(prop => prop.name).join(', ')}<br>` 
                        : ''}
                    ${itemData.description 
                        ? `<strong>Description:</strong> ${Array.isArray(itemData.description) 
                            ? itemData.description.join(' ') 
                            : itemData.description}<br>` 
                        : ''}
                    ${itemData.bonus && itemData.bonus.length > 0 
                        ? itemData.bonus.map(b => `<strong>Bonus:</strong> ${b.description}<br>`).join('') 
                        : ''}
                `;
                document.body.appendChild(tooltip);

                // Position tooltip dynamically
                const rect = itemElement.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom - window.scrollY;
                const tooltipTop = spaceBelow >= tooltip.offsetHeight + 5
                    ? rect.bottom + window.scrollY + 5
                    : rect.top + window.scrollY - tooltip.offsetHeight - 5;

                tooltip.style.position = 'absolute';
                tooltip.style.left = `${rect.left + window.scrollX}px`;
                tooltip.style.top = `${tooltipTop}px`;
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.style.opacity = 1, 0);

                itemElement.tooltip = tooltip;
            });

            itemElement.addEventListener('mouseleave', () => {
                const tooltip = itemElement.tooltip;
                if (tooltip) {
                    tooltip.style.opacity = 0;
                    setTimeout(() => tooltip.remove(), 200);
                }
            });

            // Append the item element to a cell and the row
            const itemCell = document.createElement('td');
            itemCell.appendChild(itemElement);
            row.appendChild(itemCell);

            // Append other item details
            const costCell = document.createElement('td');
            costCell.textContent = `${itemData.cost.quantity} ${itemData.cost.unit}`;
            row.appendChild(costCell);

            const weightCell = document.createElement('td');
            weightCell.textContent = `${itemData.weight} lbs.`;
            row.appendChild(weightCell);

            const categoryCell = document.createElement('td');
            categoryCell.textContent = itemData.equipment_category.name;
            row.appendChild(categoryCell);

            // Append the row to the table
            table.appendChild(row);
        });

    }
}


let categoryGroups = {
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
  
// Function to retrieve items for a specific shop (e.g., Hunter/Leatherworker) with categories
function getShopItems(shopType) {
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

                        console.log(tbody)

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
                                            console.warn(rowData)
                                            if (rowData[`column${i}`]) {
                                                isEmpty = false;
                                                break;
                                            }
                                        }

                                        if (!isEmpty) {
                                            // Populate the table cells with data from the global storage
                                            for (let i = 0; i < numColumns; i++) {
                                                if (rowData[`column${i}`] && row.cells[i]) { // Check if cell exists
                                                    row.cells[i].innerHTML = rowData[`column${i}`];
                                                }
                                            }
                                        } else {
                                            // Hide the row if it's completely empty
                                            row.style.display = "none";
                                        }
                                    } else {
                                        // Check if rowData has at least one non-empty column
                                        const hasData = Object.values(rowData).some(value => {
                                            // Remove all `<br>` tags (case-insensitive) and trim whitespace
                                            const cleanedValue = (value || '').replace(/<br\s*\/?>/gi, '').trim();
                                            return cleanedValue !== '';
                                          });
                                    
                                        if (hasData) {
                                            // Only create a new row if there's data
                                            const newRow = tbody.insertRow(parseInt(rowIndex));
                                            newRow.innerHTML = "<td contenteditable='true'></td>".repeat(numColumns);
                                    
                                            newRow.querySelectorAll("td").forEach((cell) => {
                                                cell.setAttribute("contenteditable", "true");
                                                tableEditing(cell);
                                            });
                                    
                                            // Populate cells with data (if it exists)
                                            for (let i = 0; i < numColumns; i++) {
                                                if (rowData[`column${i}`]) {
                                                    newRow.cells[i].innerHTML = rowData[`column${i}`];
                                                }
                                            }
                                        }
                                    }

                                    // Push data to if dataType is "effects"
                                    if (dataType === "effects") {
                                        const effectName = rowData.column0?.trim(); // column0: effect name
                                        const effectDescription = rowData.column1?.trim(); // column1: description
                                    
                                        if (effectName) {
                                            const currentEffects = translations[savedLanguage].effects;
                                    
                                            // Check for existing effect by name (case-insensitive)
                                            const existingEffectEntry = Object.values(currentEffects).find(
                                                effect => effect.name.toLowerCase() === effectName.toLowerCase()
                                            );
                                    
                                            if (existingEffectEntry) {
                                                // Update existing effect's description
                                                existingEffectEntry.description = [effectDescription];
                                            } else {
                                                // Generate a unique key and add new effect
                                                const newKey = generateKey(effectName, currentEffects);
                                                currentEffects[newKey] = {
                                                    name: effectName,
                                                    description: [effectDescription]
                                                };
                                            }
                                    
                                            populateConditionSelect()
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

// Helper function to generate a unique key
function generateKey(name, effectsObj) {
    let baseKey = name
        .toLowerCase()
        .replace(/\s+/g, '_')    // Replace spaces with underscores
        .replace(/[^\w-]/g, ''); // Remove non-word characters

    let key = baseKey;
    let counter = 1;

    // Ensure the key is unique
    while (effectsObj.hasOwnProperty(key)) {
        key = `${baseKey}_${counter}`;
        counter++;
    }

    return key;
}



// Function to update the spell details in the 'spell-list' ul
function updateSpellDetails(selectedSpell) {
    const spellList = document.getElementById('spellView');

    // Clear the existing spell details
    spellList.innerHTML = '';

    const t = translations[savedLanguage].spellDetailsTranslate;

    // Create list items to display the selected spell's details
    const spellDetails = `
        <h3 class="monsterSubHeadings">${selectedSpell.name}</h3>
        <p>${t.level}: <span class="monsterContent">${selectedSpell.level}</span></p>
        <p>${t.range}: <span class="monsterContent">${selectedSpell.range}</span></p>
        <p>${t.duration}: <span class="monsterContent">${selectedSpell.duration}</span></p>
        <p>${t.concentration}: <span class="monsterContent">${selectedSpell.concentration}</span></p>
        <p>${t.ritual}: <span class="monsterContent">${selectedSpell.ritual}</span></p>
        <p>${t.components}: <span class="monsterContent">${selectedSpell.components}</span></p>
        <p>${t.material}: <span class="monsterContent">${selectedSpell.material}</span></p>
        <p>${t.casting_time}: <span class="monsterContent">${selectedSpell.casting_time}</span></p>
        <p>${t.class}: <span class="monsterContent">${selectedSpell.class}</span></p>
        <p>${t.school}: <span class="monsterContent">${selectedSpell.school}</span></p>
        <p>${t.description}: <span class="monsterContent" id="descriptionSpan">${selectedSpell.desc}</span></p>
        <p>${t.higher_level}: <span class="monsterContent" id="higherLevelSpan">${selectedSpell.higher_level}</span></p>
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
    // Clear existing groups before loading
    const quickNotesSection = document.getElementById('Docs');
    const existingGroups = quickNotesSection.querySelectorAll('.notes-group-container');
    existingGroups.forEach(group => group.remove());
    notesGroupCounter = 0; // Reset counter to maintain consistent IDs

    if (notesGroupData) {
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



//Custom Shops Start
/*Monster Creator Form Section*/
const customShopButton = document.getElementById('createCustomShops');
const shopForm = document.getElementById("shopForm");
const shopFormModal = document.getElementById("shopFormModal");
const closeShopFormButton = document.getElementById('closeShopForm');

// Open the form
customShopButton.addEventListener('click', () => {
    shopForm.reset()
    shopFormModal.style.display = 'block';
    homebrewModal.style.display = 'none';
});

// Close the form
closeShopFormButton.addEventListener('click', () => {
    shopFormModal.style.display = 'none';
});

document.getElementById("addshopItem").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default button behavior
    console.log("Adding a new item input to the group...");
    
    // Find the item container in the current group and append the new item input
    const itemInputsContainer = document.querySelector("#itemInputsContainer");
    if (itemInputsContainer) {
        const newItemInput = createItemInput(); // Call the reusable function to create a new item input
        itemInputsContainer.appendChild(newItemInput);
    } else {
        console.error("Item inputs container not found!");
    }
});


// Function to attach dropdown behavior to an input
function attachDropdownBehavior(input, dropdown) {
    input.addEventListener("focus", () => showDropdown(input, dropdown));
    input.addEventListener("input", () => filterDropdown(input, dropdown));
    input.addEventListener("blur", () => hideDropdown(dropdown));
}



document.getElementById("addShopGroup").addEventListener("click", function () {
    // Get the container for all groups
    const groupsContainer = document.getElementById("groupsContainer");

    // Create a new group container
    const newGroup = document.createElement("div");
    newGroup.classList.add("form-group", "group");

    const divider = document.createElement("hr");

    newGroup.appendChild(divider);

    // Create the "Add Item to Group" button
    const addItemButtonDiv = document.createElement("div");
    const addItemButton = document.createElement("button");
    addItemButton.type = "button";
    addItemButton.classList.add("nonRollButton", "addshopItem");
    addItemButton.textContent = `${translations[savedLanguage].addItemtoGroupButton}`;
    addItemButtonDiv.appendChild(addItemButton);
    newGroup.appendChild(addItemButtonDiv);

    // Create the group name input
    const groupNameLabel = document.createElement("label");
    groupNameLabel.textContent = `${translations[savedLanguage].groupNameLabel}`;
    const groupNameInput = document.createElement("input");
    groupNameInput.type = "text";
    groupNameInput.classList.add("shopGroupName");
    groupNameInput.placeholder = "e.g., Heavy Armor";
    newGroup.appendChild(groupNameLabel);
    newGroup.appendChild(groupNameInput);

    // Create the container for item inputs
    const itemInputsContainer = document.createElement("div");
    itemInputsContainer.classList.add("itemInputsContainer");

    // Create the first item input in the group
    const firstItemInput = createItemInput();
    itemInputsContainer.appendChild(firstItemInput);

    newGroup.appendChild(itemInputsContainer);
    groupsContainer.appendChild(newGroup);

    // Attach event listener to the "Add Item to Group" button
    addItemButton.addEventListener("click", function () {
        const newItemInput = createItemInput();
        itemInputsContainer.appendChild(newItemInput);
    });
});

document.getElementById("createShop").addEventListener("click", function () {
    const shopData = gatherShopData();

    if (shopData) {
        const [shopTitle, restOfShopData] = Object.entries(shopData)[0];

        saveToGlobalStorage("Shop Data", shopTitle, restOfShopData);
        addShopToCategoryGroups(shopTitle, shopData)
        showErrorModal(`Created: ${shopTitle}`)
    }
    
    shopForm.reset()
    shopFormModal.style.display = 'none';

});

async function populateEquipmentList() {
    // Ensure equipment data is loaded
    if (!AppData.equipmentLookupInfo) {
        await readEquipmentJson();
    }

    const input = document.getElementById("shopItemName");
    const dropdown = document.getElementById("customShopDropdown");

    input.addEventListener("focus", showDropdown);
    input.addEventListener("input", filterDropdown);
    input.addEventListener("blur", hideDropdown);

    function showDropdown() {
        dropdown.innerHTML = ""; // Clear previous items
        AppData.equipmentLookupInfo.equipmentNames.forEach(item => {
            const option = document.createElement("div");
            option.classList.add("dropdown-item");
            option.textContent = item;
            option.addEventListener("mousedown", () => {
                input.value = item; // Set the input value
                hideDropdown(); // Hide the dropdown after selection
            });
            dropdown.appendChild(option);
        });
        dropdown.style.display = "block"; // Show the dropdown
    }

    function filterDropdown() {
        const search = input.value.toLowerCase();
        dropdown.innerHTML = ""; // Clear previous items
        AppData.equipmentLookupInfo.equipmentNames
            .filter(item => item.toLowerCase().includes(search))
            .forEach(item => {
                const option = document.createElement("div");
                option.classList.add("dropdown-item");
                option.textContent = item;
                option.addEventListener("mousedown", () => {
                    input.value = item;
                    hideDropdown();
                });
                dropdown.appendChild(option);
            });
    }

    function hideDropdown() {
        setTimeout(() => {
            dropdown.style.display = "none"; // Hide after a small delay
        }, 200); // Delay to allow mousedown to register
    }
}

// Show dropdown
function showDropdown(input, dropdown) {
    dropdown.innerHTML = ""; // Clear previous items
    AppData.equipmentLookupInfo.equipmentNames.forEach(item => {
        const option = document.createElement("div");
        option.classList.add("dropdown-item");
        option.textContent = item;
        option.addEventListener("mousedown", () => {
            input.value = item; // Set the input value
            hideDropdown(dropdown); // Hide the dropdown
        });
        dropdown.appendChild(option);
    });
    dropdown.style.display = "block"; // Show the dropdown
}

// Filter dropdown
function filterDropdown(input, dropdown) {
    const search = input.value.toLowerCase();
    dropdown.innerHTML = ""; // Clear previous items
    AppData.equipmentLookupInfo.equipmentNames
        .filter(item => item.toLowerCase().includes(search))
        .forEach(item => {
            const option = document.createElement("div");
            option.classList.add("dropdown-item");
            option.textContent = item;
            option.addEventListener("mousedown", () => {
                input.value = item;
                hideDropdown(dropdown);
            });
            dropdown.appendChild(option);
        });
}

// Hide dropdown
function hideDropdown(dropdown) {
    setTimeout(() => {
        dropdown.style.display = "none"; // Hide after a small delay
    }, 200); // Delay to allow mousedown to register
}

// Function to create a new item input
function createItemInput() {
    const itemInputGroup = document.createElement("div");
    itemInputGroup.classList.add("item-input");

    const label = document.createElement("label");
    label.textContent = `${translations[savedLanguage].itemNameLabel}`;
    itemInputGroup.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("shop-item-input");
    input.placeholder = "e.g., plate-armor";
    itemInputGroup.appendChild(input);

    const dropdown = document.createElement("div");
    dropdown.classList.add("dropdown");
    itemInputGroup.appendChild(dropdown);

    // Attach dropdown behavior to the input
    attachDropdownBehavior(input, dropdown);

    return itemInputGroup;
}


function gatherShopData() {
    const shopData = {};

    // Get the shop name
    const shopNameInput = document.getElementById("shopName");
    const shopName = shopNameInput.value.trim();
    if (!shopName) {
        showErrorModal("Shop name is required.");
        return null; // Return null if shop name is missing
    }

    // Initialize the shop object
    shopData[shopName] = {};

    // Get all groups in the shop
    const groups = document.querySelectorAll("#groupsContainer .group");

    groups.forEach((group) => {
        // Get the group name
        const groupNameInput = group.querySelector(".shopGroupName");
        const groupName = groupNameInput.value.trim();
        if (!groupName) {
            showErrorModal("Skipping Group without a name");
            return; // Skip this group if no name is provided
        }

        // Initialize the array for this group
        shopData[shopName][groupName] = [];

        // Get all items in the group
        const items = group.querySelectorAll(".item-input .shop-item-input");
        items.forEach((itemInput) => {
            const itemName = itemInput.value.trim();

            if (itemName) {
                // Find the item in AppData.equipmentLookupInfo.equipmentData by name
                const item = AppData.equipmentLookupInfo.equipmentData.find(
                    (data) => data.name.toLowerCase() === itemName.toLowerCase()
                );

                if (item) {
                    shopData[shopName][groupName].push(item.index); // Push the `index` value
                } else {
                    console.warn(`Item "${itemName}" not found in equipment data.`);
                }
            }
        });

        // Warn if a group has no items
        if (shopData[shopName][groupName].length === 0) {
            showErrorModal(`Group "${groupName}" has no items.`);
        }
    });

    for (const [shopTitle, shopInfo] of Object.entries(shopData)) {
        addShopToCategoryGroups(shopTitle, shopInfo);
    }
    populateShopSelect()

    return shopData;
}



function addShopToCategoryGroups(shopTitle, shopData) {
    // Check if the shop title already exists in categoryGroups
    if (!categoryGroups[shopTitle]) {
        categoryGroups[shopTitle] = {};  // Initialize if it doesn't exist
    }

    // Iterate over each group in the shop data and add it to categoryGroups
    for (const [groupName, items] of Object.entries(shopData)) {
        // Ensure items is an array, if it's not, wrap it in an array
        const itemsArray = Array.isArray(items) ? items : [items];

        if (!categoryGroups[shopTitle][groupName]) {
            categoryGroups[shopTitle][groupName] = [];  // Initialize group if it doesn't exist
        }

        // Merge items with the existing ones
        categoryGroups[shopTitle][groupName] = [...categoryGroups[shopTitle][groupName], ...itemsArray];
    }
}


function removeShopFromCategoryGroups(shopTitle) {
    // Check if the shop title exists in categoryGroups
    if (categoryGroups[shopTitle]) {
        delete categoryGroups[shopTitle]; // Remove the shop and its associated data
    } else {
        console.log(`Shop "${shopTitle}" does not exist.`);
    }
}

function populateShopSelect() {
    // Clear any existing options in the dropdown
    const shopSelect = document.getElementById('shopSelect');
    shopSelect.innerHTML = '';

    // Iterate over the shop data and add each shop title as an option
    for (const shopTitle in categoryGroups) {
        if (categoryGroups.hasOwnProperty(shopTitle)) {
            const option = document.createElement('option');
            option.value = shopTitle;
            option.textContent = translations[savedLanguage].categoryLabels.shopNames[shopTitle] || shopTitle; // Need the fallback for custom shops created by the user. 
            // Append the option to the select element
            shopSelect.appendChild(option);
        }
    }
}


document.getElementById("deleteCustomShops").addEventListener("click", async() => {
    const shopSelect = document.getElementById("customShopSelect");
    const selectedShop = shopSelect.value;

    console.log(selectedShop)

    if (selectedShop) {
        await removeFromGlobalStorage("Shop Data", selectedShop)
            .then(() => {
                console.log(`Shop "${selectedShop}" deleted successfully.`);
                loadAndDisplayCustomShops()
                removeShopFromCategoryGroups(selectedShop)
            })
            .catch((error) => {
                errorModal("Failed to delete shop:", error);
            });
            populateShopSelect();
    } else {
        errorModal("No shop selected for deletion.");
    }
});