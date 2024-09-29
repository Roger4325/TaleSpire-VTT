
//Array of level progression and proficiency bonus.
const xpLevels = [
    { xp: 0, level: 1, proficiencyBonus: 2 },
    { xp: 300, level: 2, proficiencyBonus: 2 },
    { xp: 900, level: 3, proficiencyBonus: 2 },
    { xp: 2700, level: 4, proficiencyBonus: 2 },
    { xp: 6500, level: 5, proficiencyBonus: 3 },
    { xp: 14000, level: 6, proficiencyBonus: 3 },
    { xp: 23000, level: 7, proficiencyBonus: 3 },
    { xp: 34000, level: 8, proficiencyBonus: 3 },
    { xp: 48000, level: 9, proficiencyBonus: 4 },
    { xp: 64000, level: 10, proficiencyBonus: 4 },
    { xp: 85000, level: 11, proficiencyBonus: 4 },
    { xp: 100000, level: 12, proficiencyBonus: 4 },
    { xp: 120000, level: 13, proficiencyBonus: 5 },
    { xp: 140000, level: 14, proficiencyBonus: 5 },
    { xp: 165000, level: 15, proficiencyBonus: 5 },
    { xp: 195000, level: 16, proficiencyBonus: 5 },
    { xp: 225000, level: 17, proficiencyBonus: 6 },
    { xp: 265000, level: 18, proficiencyBonus: 6 },
    { xp: 305000, level: 19, proficiencyBonus: 6 },
    { xp: 355000, level: 20, proficiencyBonus: 6 }
  ];

// checkboxes to determine what type of action the ability is and how to filter it. 
const checkboxData = [
{ label: 'Attacks', category: 'attacks' },
{ label: 'Actions', category: 'actions' },
{ label: 'Bonus Actions', category: 'bonus-actions' },
{ label: 'Reactions', category: 'reactions' },
{ label: 'Other', category: 'other' }
];

// Define proficiency levels for skills with 4 options
const skillProficiencyLevels = [
    { class: "notProficient", title: "not proficient", value: "0" },
    { class: "halfProficient", title: "half proficient", value: ".5" },
    { class: "proficient", title: "proficient", value: "1" },
    { class: "expertise", title: "expertise", value: "2" }
];

// Define proficiency levels for saves with 2 options
const savesProficiencyLevels = [
    { class: "notProficient", title: "not proficient", value: "0" },
    { class: "proficient", title: "proficient", value: "1" }
];


//Define all message Types and the functions they should call this should be expanded as I need different types of messages. 
const messageHandlers = {
    'request-info': handleRequestInfo,
    'update-health': handleUpdateHealth,
    'roll-dice': handleRollDice,
    'target-selection': handleTargetSelection,
    // Add more message types as needed
};


//ConditionsMap is the map of conditions that can be set onto the player. This is used for tracking conditions.
const conditionsMap = new Map();

async function playerSetUP(){

    // Adding eventlisteners to the level and xp inputs for character level. 
    const xpTracker = document.querySelectorAll('.levelStat'); 
    xpTracker.forEach(levelStat => {
        levelStat.addEventListener('blur', handleXPChange);
        levelStat.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                this.blur();
            }
        });
    });

    //adding mini image and linking the id to that character sheet. Allows the user to be targeted via combat tracker. 
    document.getElementById("get-selection-button").onclick = async () => {
        console.log("click")
        linkPlayerMini()
    }


    //Allowing the user to edit their initiative and setting the value of the label from the textContent they update it to. 
    document.getElementById("initiativeButton").addEventListener('blur', function(){
        const labelElement = this.closest('.playerStats').querySelector('.actionButtonLabel');
        const inputValue = this.textContent.trim(); // Remove leading and trailing spaces
        console.log(inputValue)
        let extractedNumber = ""
        if (inputValue >= 0){
            extractedNumber = parseButtonText(inputValue);
        }
        else{
            extractedNumber = inputValue
        }
        
        labelElement.setAttribute('value', extractedNumber);
    });
    document.getElementById("initiativeButton").addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            this.blur();
        }
    });


    // Add event listeners for keyup and blur on editable ability scores
    const abilityScores = document.querySelectorAll('.abilityScore');

    abilityScores.forEach(score => {
        score.addEventListener('blur', handleAbilityScoreChange);
        score.addEventListener('keydown', function(e) {
            if (e.key === 'Enter'){
                this.blur();
            }
        });
    });


    // Add event listeners to the "Short Rest" and "Long Rest" buttons
    shortRestButton.addEventListener("click", shortRest);
    longRestButton.addEventListener("click", longRest);

    // Add event listeners to the heal and damage buttons
    healButton.addEventListener("click", function() {
        healCreature(parseInt(healthInput.value));
    });
    damageButton.addEventListener("click", damageCreature);

    // Event listener for checkbox clicks using event delegation
    document.body.addEventListener('click', function (event) {
        if (event.target.classList.contains('category-checkbox')) {

            // Find the closest table row (parent) of the clicked checkbox
            const tableRow = event.target.closest('tr');

            // Get the current data-category value or set it to an empty string if not present
            let currentCategories = tableRow.getAttribute('data-category') || '';

            // Toggle the clicked checkbox's category in the currentCategories list
            const checkboxCategory = event.target.getAttribute('data-category');
            currentCategories = toggleCategory(currentCategories, checkboxCategory);

            // Update the data-category attribute of the table row
            tableRow.setAttribute('data-category', currentCategories);

            // Update displayed rows based on selected categories
            updateDisplayedRows();
            updateContent();
        }
    });


    // Event listener for subtab clicks
    document.querySelectorAll('.actionsubtab').forEach(subtab => {
        subtab.addEventListener('click', function () {
            // Remove 'active' class from all subtabs
            document.querySelectorAll('.actionsubtab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Add 'active' class to the clicked subtab
            this.classList.add('active');

            const selectedCategory = this.getAttribute('data-category');
            updateDisplayedRows([selectedCategory]);
        });
    });



    //Setting up event listeners for the Action Catgories.
    const dropdownBtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    addToggleDropdownListener(dropdownBtn, dropdownContent,);


    const actionTableRows = document.querySelectorAll('.actionTable tbody tr');
    actionTableRows.forEach((row) => {
        row.addEventListener('blur', updateContent);
    });

    // attaching eventlisteners for the Actions Table Ability Select Dropdown.
    attachAbilityDropdownListeners();

    // Call updateAllToHitDice on load
    updateAllToHitDice();
    addProficiencyButtonListener()

    const spellCastingAbility = document.querySelector('.spellcasting-dropdown');

    spellCastingAbility.addEventListener('change', function(event) {
        console.log(event.target.value); // Logs the selected value
        updateSpelltoHitDice(event.target.value);
        updateSpellSaveDC(event.target.value)
        updateAllSpellDCs()
        updateAllSpellDamageDice()
    });



    const dropdown = document.querySelector('.magic-bonus-dropdown');
    // Add the change event listener
    dropdown.addEventListener('change', (event) => {
        // Log the selected value to the console
        updateAllSpellDCs()
        updateAllSpellDamageDice()
        updateAllToHitDice()
        const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
        updateSpelltoHitDice(spellCastingAbility)
        updateSpellDCHeader()
    });



    //Spell Level Dropdown Listener
    document.querySelector('.spell-level-dropdown').addEventListener('change', function() {
        const selectedLevel = parseInt(this.value, 10); // Get the selected level as an integer
        const spellGroups = document.querySelectorAll('.spell-group'); // Get all spell groups
    
        spellGroups.forEach(spellGroup => {
            const spellLevelAttr = spellGroup.getAttribute('spellLevel'); // Get the spellLevel attribute
    
            // Convert spell level attribute to a number for comparison
            let spellLevelNumber;
    
            if (spellLevelAttr === 'Cantrip') {
                spellLevelNumber = 0; // Treat cantrips as level 0
            } else {
                spellLevelNumber = parseInt(spellLevelAttr.split('-')[0], 10);
            }
    
            // Show or hide the spell group based on the selected level
            if (spellLevelNumber <= selectedLevel) {
                spellGroup.style.display = 'block';
            } else {
                spellGroup.style.display = 'none';
            }
        });
        updateContent()
    });

    document.querySelectorAll('.deathSavesButton').forEach(button => {
        button.addEventListener('click', function () {
            // Toggle the active class on click
            console.log("click")
            button.classList.toggle('active');
        });
    });   
    // Add event listener to toggle the inspiration button when clicked
    document.getElementById("inspirationBox").addEventListener("click", toggleInspiration);


    sendDMUpdatedStats()


}  
    
function toggleInspiration() {
    const inspirationButton = document.getElementById("inspirationBox");
    const starContainer = inspirationButton.querySelector('.star-container')

    // Toggle 'active' and 'inactive' class to show/hide the star icon
    if (starContainer.classList.contains("active")) {
        starContainer.classList.remove("active");
        starContainer.classList.add("inactive");
    } else {
        starContainer.classList.remove("inactive");
        starContainer.classList.add("active");
    }
    sendDMUpdatedStats()
}


function handleXPChange(event){
    const inputElement = event.target;
    console.log(inputElement)
    if (inputElement === document.getElementById('playerXP')) {
        console.log("XP Changed")
        const characterXp = document.getElementById('playerXP').textContent
        const { level: characterLevel, proficiencyBonus: characterProficiencyBonus } = calculateLevelFromXp(characterXp);
        document.getElementById('characterLevel').textContent = characterLevel;
        document.getElementById('profBonus').textContent = characterProficiencyBonus;
    } else if (inputElement === document.getElementById('characterLevel')) {
        console.log("Level Changed")
        // Handle changes in level input
        const characterNewLevel = parseInt(document.getElementById('characterLevel').textContent);
        const newXP = calculateXPFromLevel(characterNewLevel)
        const {proficiencyBonus: characterProficiencyBonus } = calculateLevelFromXp(newXP)

        document.getElementById('playerXP').textContent = newXP;
        document.getElementById('profBonus').textContent = characterProficiencyBonus;
    }
    updateSkillModifier()
    updateSaveModifier()
    updateAllToHitDice();
    updateAllSpellDCs();
    updateAllSpellDamageDice();
    updateSpellDCHeader()


    const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
    updateSpelltoHitDice(spellCastingAbility)
}

// function to calculate the level Xp from the level they just changed too and set the xp value to the lowest. 
function calculateXPFromLevel(level) {
    // Find the corresponding XP for the given level in the xpLevels array
    for (const levelData of xpLevels) {
        if (level === levelData.level) {
            return levelData.xp;
        }
    }
    return 0; // Default to 0 XP if the level is not found in the array
}


function calculateLevelFromXp(xp) {
    let level = 1;
    let proficiencyBonus = 2;

    for (const levelData of xpLevels) {
        if (xp >= levelData.xp) {
        level = levelData.level;
        proficiencyBonus = levelData.proficiencyBonus;
        } else {
        break;
        }
    }

    return { level, proficiencyBonus };
}
   



async function linkPlayerMini() {
    let playerMini = await TS.creatures.getSelectedCreatures();
    console.log(playerMini);
    let characterPicture = document.getElementById("characterPicture");
    let positions = {};

    if (playerMini.length > 0) {
        characterPicture.replaceChildren();
        const firstMini = playerMini[0]; // Get the first selected creature
        TS.creatures.getMoreInfo([firstMini]).then((monsterInfos) => {
            for (let monsterInfo of monsterInfos) {
                console.log(monsterInfo);
                positions[monsterInfo.id] = monsterInfo.position;

                const playerCharacterId = monsterInfo.id
                console.log(playerCharacterId)

                TS.contentPacks.findBoardObjectInPacks(monsterInfo.morphs[monsterInfo.activeMorphIndex].boardAssetId, contentPacks).then((foundContent) => {
                    let boardObject = foundContent.boardObject;

                    TS.contentPacks.createThumbnailElementForBoardObject(boardObject, 128).then((thumbnail) => {
                        // Set the display property of the generated span element to "block"
                        thumbnail.style.display = "block";

                        // Append the thumbnail directly to the "characterPicture" div
                        characterPicture.append(thumbnail);
                    });
                });
            }
        });
    }
}



//Function to calculate ability Score based on D&D 5e logic
function calculateAbilityModifier(abilityScore) {
    return Math.floor((abilityScore - 10) / 2);
}



function parseButtonText(text) {
    // Check if the text starts with a '+' or '-'
    if (text.startsWith('+') || text.startsWith('-')) {
        // Extract the number after the '+' or '-'
        const extractedNumber = parseInt(text.substring(1), 10);
        return isNaN(extractedNumber) ? 0 : extractedNumber;
    } else {
        // If no '+' or '-' sign, parse the entire text
        const parsedNumber = parseInt(text, 10);
        return isNaN(parsedNumber) ? 0 : parsedNumber;
    }
}


//Changes the playerCharacters Ability modifier based on their score. 
function handleAbilityScoreChange(event) {
    const scoreElement = event.target;
    const newValue = parseInt(scoreElement.textContent, 10);

    if (!isNaN(newValue)) {
        const abilityModifier = calculateAbilityModifier(newValue);

        // Find the parent container
        const container = scoreElement.parentElement;

        // Find the button and label within the container
        const button = container.querySelector('.actionButton');
        const label = container.querySelector('.actionButtonLabel');

        // Update button text content and label value
        if (abilityModifier > 0) {
            button.textContent = `+${abilityModifier}`;
            label.setAttribute('value', abilityModifier);
        } else {
            button.textContent = `${abilityModifier}`;
            label.setAttribute('value', abilityModifier);
        }

        // Update the ability score if the user entered a valid value
        scoreElement.textContent = newValue;
        updateSkillModifier();
        updateSaveModifier();
        updateAllToHitDice();
        updateAllSpellDCs();
        updateAllSpellDamageDice();
        updateSpellDCHeader()
        sendDMUpdatedStats()


        const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
        updateSpelltoHitDice(spellCastingAbility)
        
    }
}


//This function is updated on init for the currrent character. This allows their ability scores to be updated. 
function updateAbilityScoreModifiers(characterData) {
    // List of ability scores
    const abilityScores = [
        'strengthScore',
        'dexterityScore',
        'constitutionScore',
        'intelligenceScore',
        'wisdomScore',
        'charismaScore'
    ];

    // Iterate through each ability score
    abilityScores.forEach((ability) => {
        const abilityScore = characterData[ability];
        const abilityModifier = calculateAbilityModifier(abilityScore);

        // Update the UI elements for the ability score
        const scoreElement = document.getElementById(ability);
        const container = scoreElement.parentElement;
        const button = container.querySelector('.actionButton');
        const label = container.querySelector('.actionButtonLabel');

        // Update button text content and label value
        if (abilityModifier > 0) {
            button.textContent = `+${abilityModifier}`;
            label.setAttribute('value', abilityModifier);
        } else {
            button.textContent = `${abilityModifier}`;
            label.setAttribute('value', `${abilityModifier}`);
        }
    });
    updateSkillModifier()
    updateSaveModifier()
}



function playerConditions() {
    const conditionSelect = document.getElementById('condition-select');
    let selectedCondition = conditionSelect.value;

    if (selectedCondition) {
        const conditionTrackerDiv = document.getElementById('conditionTracker')

        // Check if the conditionsMap has an entry for this condition
        if (!conditionsMap.has(conditionTrackerDiv)) {
            conditionsMap.set(conditionTrackerDiv, new Set());
        }

        // Get the Set of conditions for this div.
        const conditionsSet = conditionsMap.get(conditionTrackerDiv);

        if (selectedCondition === 'Exhaustion') {
            // Handle exhaustion separately

            // Find the highest exhaustion number and increment it
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
                    removeConditionPill(condition);
                }
            }
            
        } else if (conditionsSet.has(selectedCondition)) {
            // If the selected condition is already in the Set, don't add it again
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
            removeConditionPill(selectedCondition);
        });

        // Add the condition to the Set and the condition pill to the container
        conditionsSet.add(selectedCondition);
        const conditionPillsContainer = document.getElementById('conditionTracker');
        conditionPillsContainer.appendChild(conditionPill);
        updateContent()
    }
}

// Function to remove a condition pill
function removeConditionPill(condition) {
    const conditionPillsContainer = document.getElementById('conditionTracker');
    const conditionPills = conditionPillsContainer.querySelectorAll('.condition-pill');
    for (const pill of conditionPills) {
        if (pill.querySelector('span').textContent === condition) {
            conditionPillsContainer.removeChild(pill);
            break;
        }
    }
    updateContent();
}



function shortRest() {
    // Implement the logic for a short rest here
}

// Function for long rest
function longRest() {
    // Implement the logic for a long rest here
    const maxHPValue = parseInt(maxCharacterHP.textContent);

    // Call the healCreature function with the max HP as the healing amount
    healCreature(maxHPValue);
    resetSpellSlots()
}





//handling damage and healing a character
const healButton = document.getElementById("healButton");
const damageButton = document.getElementById("damageButton");
const currentCharacterHP = document.getElementById("currentCharacterHP");
const maxCharacterHP = document.getElementById("maxCharacterHP");
const tempHP = document.getElementById("tempHP");
const healthInput = document.getElementById("healthInput");

function healCreature(healingAmount) {
    const maxHPValue = parseInt(maxCharacterHP.textContent);
    let currentHPValue = parseInt(currentCharacterHP.textContent);

    if (healingAmount > 0) {
        currentCharacterHP.textContent = currentHPValue + healingAmount;

        currentHPValue = parseInt(currentCharacterHP.textContent)

        if (currentHPValue > maxHPValue){
            currentCharacterHP.textContent = maxHPValue;
        }



        
    }
    updateContent()
    sendDMUpdatedStats()
}

// Function to damage the creature by a specific amount
function damageCreature() {
    const currentHPValue = parseInt(currentCharacterHP.textContent);
    const tempHPValue = parseInt(tempHP.value);
    const damageAmount = parseInt(healthInput.value);
    console.log(damageAmount)

    if (damageAmount > 0) {
        if (tempHPValue > 0) {
            if (tempHPValue >= damageAmount) {
                tempHP.value = tempHPValue - damageAmount;
            } else {
                tempHP.value = 0;
                currentCharacterHP.textContent = Math.max(0, currentHPValue - (damageAmount - tempHPValue));
            }
        } else if (currentHPValue > 0) {
            currentCharacterHP.textContent = Math.max(0, currentHPValue - damageAmount);
        }
    }
    updateContent()
    sendDMUpdatedStats()
}






//Proficiency toggle interaction Add click event listener to each button
function addProficiencyButtonListener() {
    const proficiencyButtons = document.querySelectorAll(".proficiencyButtons button");
    const actionTable = document.querySelector('.actionTable');
    
    proficiencyButtons.forEach(button => {
        if (!button.hasProficiencyButtonListener) {
            button.dataset.currentLevel = button.getAttribute('value'); // Set the initial current level as a data attribute

            button.addEventListener("click", function () {
                let currentLevel = parseInt(button.dataset.currentLevel, 10);
                updateProficiency(button, currentLevel, true);
                updateSkillModifier();
                updateSaveModifier();
                updateContent();
                if (actionTable.contains(button)){
                    updateToHitDice(button);
                }
            });

            button.hasProficiencyButtonListener = true;
        }
    });
}


function updateProficiency(button, currentLevel, isButtonClick) {
    const isSkillRow = button.closest('.skill-row') !== null;
    const isSavesRow = button.closest('.saves-row') !== null;
    const isActionRow = button.closest('.actionTable') !== null;

    let proficiencyLevels = isSkillRow ? skillProficiencyLevels : isSavesRow ? savesProficiencyLevels : [];

    // Handle actions similarly to saves
    if (isActionRow) {
        proficiencyLevels = savesProficiencyLevels; // Use the same proficiency levels as saves
    }
    // Remove the current proficiency class and title
    button.classList.remove(...proficiencyLevels.map(level => level.class));
    button.title = proficiencyLevels[currentLevel].title;
    button.value = proficiencyLevels[currentLevel].value;

    if (isButtonClick) {
        // Move to the next proficiency level only if it's a button click
        const nextLevel = (currentLevel + 1) % proficiencyLevels.length;

        // Update the button's data attribute with the new current level
        button.dataset.currentLevel = nextLevel;
        currentLevel = nextLevel; // Update the current level variable
    }

    // Set the textContent to an empty string
    button.textContent = '';

    // Add the new proficiency class and title
    button.classList.add(proficiencyLevels[currentLevel].class);
    button.title = proficiencyLevels[currentLevel].title;
    button.value = proficiencyLevels[currentLevel].value;
}




// calculate and update the skill modifier based on ability modifier and proficiency level
function updateSkillModifier() {
    const skillRows = document.querySelectorAll('.skill-row');

    skillRows.forEach(skillRow => {
        const abilityModElement = skillRow.querySelector('.abilityMod');
        const proficiencyButton = skillRow.querySelector('.proficiencyButtons button');
        const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent)
        const abilityMod = abilityModElement.textContent.trim();

        // Find the associated ability score label without using :is selector
        const abilityScoreLabel = findAbilityScoreLabel(abilityMod);

        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

        const skillModifier = Math.floor(abilityScoreValue + (proficiencyBonus * parseFloat(proficiencyButton.value)));
        const skillButton = abilityModElement.parentElement.querySelector('.actionButton.skillbuttonstyler');
        const skillLabel = abilityModElement.parentElement.querySelector('.actionButtonLabel');

        skillButton.textContent = skillModifier > 0 ? `+${skillModifier}` : `${skillModifier}`;
        skillLabel.setAttribute('value', skillModifier);
    });
    passives()
}

function updateSaveModifier() {
    const saveRows = document.querySelectorAll('.saves-row');

    saveRows.forEach(saveRow => {
        const saveNameElement = saveRow.querySelector('.saveName');
        const proficiencyButton = saveRow.querySelector('.proficiencyButtons button');
        const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);
        const saveName = saveNameElement.textContent.trim();

        // Map save names to corresponding ability modifiers
        const abilityMod = getAbilityModifierForSave(saveName);

        const abilityScoreLabel = findAbilityScoreLabel(abilityMod);
        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

        const saveModifier = Math.floor(abilityScoreValue + (proficiencyBonus * parseFloat(proficiencyButton.value)));
        const saveButton = saveNameElement.parentElement.querySelector('.actionButton.skillbuttonstyler');
        const saveLabel = saveNameElement.parentElement.querySelector('.actionButtonLabel');

        saveButton.textContent = saveModifier > 0 ? `+${saveModifier}` : `${saveModifier}`;
        saveLabel.setAttribute('value', saveModifier);
    });
}

// Helper function to map save names to corresponding ability modifiers
function getAbilityModifierForSave(saveName) {
    const saveNameToLower = saveName.toLowerCase();

    switch (saveNameToLower) {
        case 'str save':
            return 'STR';
        case 'dex save':
            return 'DEX';
        case 'con save':
            return 'CON';
        case 'int save':
            return 'INT';
        case 'wis save':
            return 'WIS';
        case 'cha save':
            return 'CHA';
        default:
            return '';
    }
}



function findAbilityScoreLabel(abilityMod) {
    // Iterate over ability boxes and find the matching one based on the ability modifier
    const abilityScores = document.getElementById("playerAbilityScores")
    const abilityBoxes = abilityScores.querySelectorAll('.abilitybox');
    for (const abilityBox of abilityBoxes) {
        const abilityScoreLabel = abilityBox.querySelector('.actionButtonLabel');
        const abilityScoreLabelAttribute = abilityScoreLabel.getAttribute('data-ability')
        if (abilityScoreLabelAttribute === abilityMod) {
            return abilityScoreLabel
        }
    }
    return null; // Return null if no match is found
}




//Passsives section 

// Function to get the value of a specific skill
const skillContainer = document.querySelector('.skill-container');
function getSkillValue(skillName) {
    const skillRows = skillContainer.querySelectorAll('.skill-row');

    for (let i = 0; i < skillRows.length; i++) {
        const skillRow = skillRows[i];
        const currentSkillName = skillRow.querySelector('.skillName').textContent.trim();

        if (currentSkillName === skillName) {
            const label = skillRow.querySelector('.actionButtonLabel');
            return label.getAttribute('value');
        }
    }

    // Return null or handle the case when the skill is not found
    return null;
}


function passives(){
    document.getElementById("passivePerception").textContent = parseInt(getSkillValue('Perception')) + 10;
    document.getElementById("passiveInvestigation").textContent = parseInt(getSkillValue('Investigation')) + 10;
    document.getElementById("passiveInsight").textContent = parseInt(getSkillValue('Insight')) +10;

}





// Actions Sections. 

// Function to add toggle dropdown listener
function addToggleDropdownListener(dropdownBtn, dropdownContent) {
    // Check if the element and its properties are valid
    if (dropdownBtn && dropdownContent) {
        // Check if the element already has the event listener
        if (!dropdownBtn.hasEventListener) {
            // Toggle the dropdown content on button click
            dropdownBtn.addEventListener('click', function () {
                dropdownContent.style.display = (dropdownContent.style.display === 'block') ? 'none' : 'block';
                console.log("click")
            });

            // Set a flag indicating that the event listener is added
            dropdownBtn.hasEventListener = true;
        }
    }
}



// Function to attach ability dropdown event listeners
function attachAbilityDropdownListeners() {
    // Add event listener to each ability dropdown to trigger the update

    const abilityDropdowns = document.querySelectorAll('.actionTable .ability-dropdown');
    abilityDropdowns.forEach(dropdown => {
        // Check if the dropdown already has the event listener
        if (!dropdown.hasAttribute('data-dropdown-listener')) {
            // Add the event listener
            dropdown.addEventListener('change', function () {
                updateToHitDice(dropdown);
                updateContent();
                calculateActionDamageDice()
            });

            // Mark the dropdown with a custom attribute to indicate that the event listener is added
            dropdown.setAttribute('data-dropdown-listener', 'added');
        }
    });
}

function toggleAdditionalInfo(containerId) {
    // Get the new container and currently active container
    let newContainer = document.getElementById(containerId);
    let activeContainer = document.querySelector('.additional-info-container.active');

    // If the same container is clicked, hide it and return early
    if (activeContainer && activeContainer === newContainer) {
        activeContainer.classList.remove('active');
        setTimeout(() => {
            activeContainer.classList.add('hidden');
        }, 200);
        return;
    }

    // If another container is open, switch instantly without animation
    if (activeContainer) {
        // Disable the transition for the new container for instant switching
        newContainer.style.transition = 'none'; // Disable transition

        // Hide the active container
        activeContainer.classList.remove('active');
        activeContainer.classList.add('hidden');

        // Immediately show the new container (without animation)
        newContainer.classList.remove('hidden');
        newContainer.classList.add('active');

        // Re-enable the transition after a short delay to ensure it's set back
        setTimeout(() => {
            newContainer.style.transition = ''; // Re-enable transition
        }, 50); // Small delay to ensure the transition doesn't affect the instant switch
    } else {
        // If no container is open, apply the sliding effect
        newContainer.classList.remove('hidden');
        newContainer.classList.add('active');
    }
}









// Function to update toHitDice based on the selected ability stat
function updateToHitDice(proficiencyButton) {

    // Get the associated  row for the proficiency button
    const row = proficiencyButton.closest('tr');

    // Find the toHitDice button in the same row
    const toHitDiceButton = row.querySelector('.actionButton.skillbuttonstyler');
    const magicBonusInput = row.querySelector('.magic-bonus-weapon');

    const magicBonus = parseInt(magicBonusInput.value) || 0;

    if (toHitDiceButton) {
        // Get the selected ability stat from the associated ability dropdown
        const abilityDropdown = row.querySelector('.ability-dropdown');
        const selectedAbility = abilityDropdown.value;

        // Find the associated ability score label without using :is selector
        const abilityScoreLabel = findAbilityScoreLabel(selectedAbility);

        if (abilityScoreLabel) {
            // Calculate the ability score value
            const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

            // Get the current proficiency level and value from the row
            const proficiencyValue = parseInt(row.querySelector('.proficiencyButtons button').value);


            // Add proficiency bonus to toHitDiceValue
            const proficiencyBonus = parseInt(document.getElementById('profBonus').textContent);
            const toHitDiceValue = abilityScoreValue + (proficiencyBonus * proficiencyValue) + magicBonus;

            // Update the toHitDice button text content and value
            if(toHitDiceValue >= 0){
                toHitDiceButton.textContent = "+" + toHitDiceValue;
            }
            else{
                toHitDiceButton.textContent = toHitDiceValue;
            }
            

            // Get the previous sibling label
            const previousLabel = toHitDiceButton.previousElementSibling;

            // Update the value of the previous label
            if (previousLabel && previousLabel.classList.contains('actionButtonLabel')) {
                previousLabel.setAttribute('value', toHitDiceValue);
            }
        }
    }
}


// Function to update all toHitDice values for the entire table
function updateAllToHitDice() {
    const allProficiencyButtons = document.querySelectorAll(".actionTable .proficiencyButtons button");

    allProficiencyButtons.forEach(button => {
        updateToHitDice(button);
    });
}


// Function to generate checkboxes
function generateCheckboxes(storedData, rowElement) {

    // Default to the first row if rowElement is undefined or null
    if (!rowElement) {
        const tableBody = document.querySelector('.actionTable tbody');
        rowElement = tableBody.querySelector('tr:first-child');
    }

    // Get the row index to identify the correct checkbox container
    const rowIndex = Array.from(rowElement.parentElement.children).indexOf(rowElement);
    const checkboxContainerId = 'checkboxContainer' + rowIndex;

    // Select the correct checkbox container using the unique ID
    const correctCheckboxContainer = document.getElementById(checkboxContainerId);

    // If no checkboxes are found, add them
    if (correctCheckboxContainer && correctCheckboxContainer.children.length === 0) {
        checkboxData.forEach((item, index) => {
            const checkboxLabel = document.createElement('label');
            const checkboxInput = document.createElement('input');
            
            // Set the checkbox attributes
            checkboxInput.type = 'checkbox';
            checkboxInput.className = 'category-checkbox';
            checkboxInput.dataset.category = item.category;

            // Retrieve the state from the stored data (storedData)
            const isChecked = storedData && storedData[item.category] ? storedData[item.category] : false;
            checkboxInput.checked = isChecked;

            // Set the label text based on the index
            checkboxLabel.textContent = checkboxData[index].label;

            // Append the checkbox to the label and the label to the correct container
            checkboxLabel.appendChild(checkboxInput);
            correctCheckboxContainer.appendChild(checkboxLabel);
        });
    }
}







// Function to update displayed rows based on selected categories
function updateDisplayedRows(selectedCategories) {

    const allRows = document.querySelectorAll('.actionTable tbody tr');

    allRows.forEach(row => {

        // Get the data-category attribute or set it to an empty string if not present
        const rowCategories = (row.getAttribute('data-category') || '').trim().split(' ');

        // Check if the "all" category is present in selectedCategories
        const showAllCategories = selectedCategories && selectedCategories.includes('all');

        // Check if any of the selected categories match the row categories
        const shouldShowRow = showAllCategories || (selectedCategories ? selectedCategories.some(category => rowCategories.includes(category)) : true);

        if (shouldShowRow) {
            row.style.display = 'table-row';
        } else {
            row.style.display = 'none';
        }
    });
}


// Function to toggle a category in a list of categories
function toggleCategory(categoryList, category) {

    const categories = categoryList.trim().split(' ');
    const index = categories.indexOf(category);

    if (index !== -1) {
        // Category exists, remove it
        categories.splice(index, 1);
    } else {
        // Category doesn't exist, add it
        categories.push(category);
    }

    return categories.join(' ');
}



function newTableRow() {
    // Get the table body

    const tableBody = document.querySelector('.actionTable tbody');

    // Create a new row element by cloning the last row
    const lastRow = tableBody.querySelector('tr:last-child');
    const newRow = lastRow.cloneNode(true);

    const rowIndex = tableBody.children.length + 1; // Current number of rows

    // Update IDs for the new row
    const additionalInfoContainer = newRow.querySelector('.additional-info-container');
    const newContainerId = 'additionalInfoContainer' + rowIndex;
    additionalInfoContainer.id = newContainerId;

    // Update the Action Setting button's onclick attribute
    const actionSettingButton = newRow.querySelector('.rowSetting');
    actionSettingButton.setAttribute('onclick', `toggleAdditionalInfo('${newContainerId}')`)

    // Update the Close button's onclick attribute
    const closeButton = newRow.querySelector('.close-button');
    closeButton.setAttribute('onclick', `toggleAdditionalInfo('${newContainerId}')`);

    // Set the default data-category attribute for the new row (you can adjust this as needed)
    newRow.setAttribute('data-category', '');

    // Set default text for each cell in the new row
    newRow.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
        cell.textContent = 'New Text';
    });

    // Create a new select element for the new row
    const newSelect = document.createElement('select');
    newSelect.classList.add('ability-dropdown');
    const abilities = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

    // Populate options for the select element
    abilities.forEach(ability => {
        const option = document.createElement('option');
        option.value = ability;
        option.text = ability;
        newSelect.appendChild(option);
    });

    // Get the cell where the select element should be placed and append the new select element
    const selectCell = newRow.querySelector('.abilityStatDropdown');
    selectCell.innerHTML = ''; // Clear existing content
    selectCell.appendChild(newSelect);

   // Update the id of the proficiency button in the new row based on the row index

   const proficiencyButtons = newRow.querySelectorAll('.actionProficiencyButton');
   proficiencyButtons.forEach(button => {
       const newProficiencyId = 'proficiencyActionButton' + rowIndex;
       button.id = newProficiencyId;
   });

    // Reset checkboxes to unchecked state
    const checkboxes = newRow.querySelectorAll('.category-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    // Get the dropdown button and content for the new row
    const dropdownBtn = newRow.querySelector('.dropbtn');
    const dropdownContent = newRow.querySelector('.dropdown-content');
    dropdownContent.setAttribute('id','checkboxContainer'+ rowIndex)

    console.log(dropdownContent);

    addToggleDropdownListener(dropdownBtn, dropdownContent, newRow);

    // Add blur event listener
    const inputElement = newRow.querySelector('.actionDamageDice');
    addDamageDiceInputListener(inputElement, newRow);

    // Create the delete button and append it
    const deleteButtonDiv = newRow.querySelector('.removeButton')
    console.log(deleteButtonDiv)
    addDeleteButtonListener(deleteButtonDiv)
    

    // Add the event listener only if it hasn't been added before
    newRow.addEventListener('blur', getAllEditableContent());
    
    attachAbilityDropdownListeners();
    addProficiencyButtonListener()
    rollableButtons()
    addBlurAndEnterListenersToDamageTypes();
    updateAllDamageButtonDataNames()
}



























//Saving and loading Content

// Function to get all editable content including proficiency levels, Temp HP, 
function getAllEditableContent() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    const characterName = document.getElementById("playerCharacterInput");
    const characterTempHp = document.getElementById("tempHP");
    const proficiencyButtons = document.querySelectorAll(".proficiencyButtons button");

    const content = {};

    // Add specific elements to the content object
    content['characterTempHp'] = characterTempHp.value;

    // Add other content-editable elements to the content object
    editableElements.forEach((element) => {
        const id = element.id;
        const value = element.innerText;
        content[id] = value;
    });

    // Add proficiency levels to the content object
    proficiencyButtons.forEach((button) => {
        content[button.id] = button.value;
    });

    // Add conditions into the content to be saved
    const conditionTrackerDiv = document.getElementById('conditionTracker');
    if (conditionsMap.has(conditionTrackerDiv)) {
        const conditionsSet = conditionsMap.get(conditionTrackerDiv);
        content['conditions'] = Array.from(conditionsSet);
    } else {
        content['conditions'] = [];
    }

    // Call the function to process action table rows and update the content object
    const actionTableData = processActionTableRow();
    content['actionTable'] = actionTableData;

    const spellData = processSpellData();
    content['spellData'] = spellData;

    // Save group and trait data
    const groupTraitData = processGroupTraitData();
    content['groupTraitData'] = groupTraitData;
    

    // Assuming you want to use 'characterName' as the unique identifier for the 'character' data type
    saveToGlobalStorage("characters", characterName.textContent, content, true);

    return content;
}







function processActionTableRow(){

    // Add the ActionTable into the content to be saved
    const actionTableRows = document.querySelectorAll('.actionTable tbody tr');
    const actionTableData = [];

    actionTableRows.forEach((row, index) => {
        const rowData = {};
        let proficiencyButtonValue;

        // Get proficiency button value
        const proficiencyButton = row.querySelector('.proficiencyButtons .actionProficiencyButton');
        if (proficiencyButton) {
            proficiencyButtonValue = proficiencyButton.value;

            // Save the proficiency button value as the first object
            rowData['proficiencyButton'] = proficiencyButtonValue;
        }

        const secondColumnCell = row.querySelector('td:nth-child(2)');
        const thirdColumnCell = row.querySelector('td:nth-child(3)');
        const fourthColumnCell = row.querySelector('td:nth-child(4)');
        const fifthColumnCell = row.querySelector('td:nth-child(5) label.actionButtonLabel').getAttribute('data-dice-type');
        const sixthColumnCell = row.querySelector('td:nth-child(6)');
        const seventhColumnCell = row.querySelector('.ability-dropdown');
        const eighthColumnCell = row.querySelector('.magic-bonus-weapon');
        const tenthColumnCell = row.querySelector('.actionDescriptiveText01');
        const elventhColumnCell = row.querySelector('.actionDescriptiveText02');
        const twelvethColumnCell = row.querySelector('.damage-type');

        if (secondColumnCell) {
            rowData['secondColumn'] = secondColumnCell.textContent.trim();
        }

        if (thirdColumnCell) {
            rowData['thirdColumn'] = thirdColumnCell.textContent.trim();
        }

        if (fourthColumnCell) {
            rowData['fourthColumn'] = fourthColumnCell.textContent.trim();
        }

        
        if (fifthColumnCell) {
            rowData['fifthColumn'] = fifthColumnCell;
        }

        if (sixthColumnCell) {
            rowData['sixthColumn'] = "ActionSettings";
        }

        if (seventhColumnCell) {
            rowData['seventhColumn'] = seventhColumnCell.value;
        }
        if (eighthColumnCell) {
            rowData['eighthColumn'] = eighthColumnCell.value;
        }
        if (tenthColumnCell) {
            rowData['tenthColumn'] = tenthColumnCell.textContent;
        }
        if (elventhColumnCell) {
            rowData['elventhColumn'] = elventhColumnCell.textContent;
        }
        if (twelvethColumnCell) {
            rowData['twelvethColumn'] = twelvethColumnCell.value;
        }

        
        // Save the selected options from checkboxes in the ninth column
        const ninthColumnCell = row.querySelector('.dropdown-content');
        if (ninthColumnCell) {
            const checkboxes = ninthColumnCell.querySelectorAll('input[type="checkbox"]');

            const ninthColumnData = {};

            checkboxes.forEach((checkbox, index) => {
                // Get the category from the checkboxData array based on the index
                const category = checkboxData[index].category;
        
                if (category) {
                    // Use the correct category from the checkboxData array
                    ninthColumnData[category] = checkbox.checked;
                }
            });
        

            rowData['ninthColumn'] = ninthColumnData;

        } else {
            console.error('Element with ID "checkboxContainer" not found in row ' + (index + 1));
        }

        // Add the row data to the array
        actionTableData.push({ [index + 1]: rowData });
    });

return actionTableData;
}





// Function to update content whenever a change occurs
function updateContent() {
    const allEditableContent = getAllEditableContent();
}

// Add input and content-editable event listeners
const editableElements = document.querySelectorAll('[contenteditable="true"]');
editableElements.forEach((element) => {
    element.addEventListener('blur', updateContent);
});

const inputElements = document.querySelectorAll('input');
inputElements.forEach((element) => {
    element.addEventListener('blur', updateContent);
});



function updateCharacterUI(characterData, characterName) {
    const characterNameElement = document.getElementById("playerCharacterInput");
    const characterTempHpElement = document.getElementById("tempHP");

    // Update UI elements
    characterNameElement.textContent = characterName; // Adjust based on your actual property names
    characterTempHpElement.value = characterData.characterTempHp;

    const characterInit = document.getElementById("initiativeButton");
    const characterInitLabel = document.querySelector(`.playerStats label[for="initiativeButton"]`);
    characterInit.textContent = characterData.initiativeButton
    characterInitLabel.setAttribute('value', characterData.initiativeButton.replace("+", ""));

    // Update other content-editable elements
    for (const property in characterData) {
        if (characterData.hasOwnProperty(property) && property !== "characterName" && property !== "characterTempHp" && property !== "conditions" && property !== "initiativeButton") {
            const element = document.getElementById(property);
            if (element) {
                element.innerText = characterData[property];
            }
        }
    }

    updateProficiencyButtons(characterData, skillProficiencyLevels, savesProficiencyLevels);
    const characterLevel = parseInt(characterData.characterLevel);
    document.getElementById('characterLevel').textContent = characterLevel;

    // Calculate and set proficiency bonus
    const { proficiencyBonus } = calculateLevelFromXp(calculateXPFromLevel(characterLevel));
    document.getElementById('profBonus').textContent = proficiencyBonus;

    // Update conditions UI
    const conditionTrackerDiv = document.getElementById('conditionTracker');
    const conditionsSet = new Set(characterData.conditions);
    conditionsMap.set(conditionTrackerDiv, conditionsSet);
    updateConditionsUI(conditionsSet);
    updateAbilityScoreModifiers(characterData);
    updateActionTableUI(characterData.actionTable);
    loadSpellData(characterData.spellData);
    loadGroupTraitData(characterData.groupTraitData)

}

//finding the proficency level saved in gloabl storage and calling updateProficiency
function updateProficiencyButtons(characterData, skillProficiencyLevels, savesProficiencyLevels) {
    const proficiencyButtons = document.querySelectorAll(".proficiencyButtons button")
    proficiencyButtons.forEach((button) => {
        const proficiencyLevelKey = button.id;
        const proficiencyLevel = characterData[proficiencyLevelKey];

        if (proficiencyLevel !== undefined) {
            try {
                const isSkillRow = button.closest('.skill-row') !== null;
                const currentLevel = findCurrentLevel(proficiencyLevel, skillProficiencyLevels, savesProficiencyLevels, isSkillRow);
                button.dataset.currentLevel = currentLevel;
                updateProficiency(button, currentLevel, false, skillProficiencyLevels, savesProficiencyLevels);
            } catch (error) {
                console.error(`Error updating proficiency for button ${button.id}:`, error);
            }
        } else {
            console.warn(`Proficiency level not defined for button ${button.id}`);
        }
    });
}

function findCurrentLevel(proficiencyLevel, skillProficiencyLevels, savesProficiencyLevels, isSkillRow) {
    const skillLevelIndex = skillProficiencyLevels.findIndex((level) => parseFloat(level.value) === parseFloat(proficiencyLevel));
    const savesLevelIndex = savesProficiencyLevels.findIndex((level) => parseFloat(level.value) === parseFloat(proficiencyLevel));

    // If it's a skill row, return the skill level index; otherwise, return the saves level index
    return isSkillRow ? skillLevelIndex : savesLevelIndex;
}

function updateConditionsUI(conditionsSet) {
    // Assuming you have elements with IDs corresponding to the condition tracker
    const conditionTrackerDiv = document.getElementById('conditionTracker');

    // Clear existing conditions in the UI
    conditionTrackerDiv.innerHTML = '';

    // Populate conditions based on conditionsSet
    conditionsSet.forEach((condition) => {
        // Check if the condition already exists in the UI
        if (!conditionTrackerDiv.querySelector(`[data-condition="${condition}"]`)) {
            const conditionPill = document.createElement('div');
            conditionPill.classList.add('condition-pill');
            conditionPill.dataset.condition = condition;
            conditionPill.innerHTML = `
                <span>${condition}</span>
                <button class="remove-condition">x</button>
            `;

            // Add a click event listener to the remove button
            const removeButton = conditionPill.querySelector('.remove-condition');
            removeButton.addEventListener('click', () => {
                conditionsSet.delete(condition);
                removeConditionPill(condition);
                updateContent();
            });

            // Add the condition pill to the container
            conditionTrackerDiv.appendChild(conditionPill);
        }
    });
}

async function loadAndPickaCharacter() {
    // Step 1: Load all characters from global storage
    const dataType = "characters";
    const allCharactersData = await loadDataFromGlobalStorage(dataType);

    // Step 2: Create a full-screen overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('character-overlay');
    document.body.appendChild(overlay);

    // Step 3: Create a container for the character list and new character button
    const container = document.createElement('div');
    container.classList.add('character-container');

    // Step 4: Add a title
    const title = document.createElement('h2');
    title.classList.add('character-title');
    title.textContent = 'Select or Create a Character';
    container.appendChild(title);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', () => {
        overlay.removeChild(inputModal); // Close the input modal
    });
    container.appendChild(closeButton);

    // Step 5: List existing characters
    Object.keys(allCharactersData).forEach(characterName => {
        const characterButton = document.createElement('button');
        characterButton.classList.add('character-button');
        characterButton.textContent = characterName;

        // Add click event to load the selected character's data
        characterButton.addEventListener('click', () => {
            console.log(allCharactersData[characterName]); // Access the character data
            loadAndDisplayCharacter(characterName, allCharactersData)
            // Do something with the selected character's data (e.g., load it)
            document.body.removeChild(overlay); // Close the overlay after selection
        });
        container.appendChild(characterButton);
    });

    // Step 6: Add a button to create a new character
    const newCharacterButton = document.createElement('button');
    newCharacterButton.classList.add('new-character-button');
    newCharacterButton.textContent = 'Create New Character';

    newCharacterButton.addEventListener('click', () => {
        // Create a new character name input modal
        const inputModal = document.createElement('div');
        inputModal.classList.add('input-modal');

        const inputTitle = document.createElement('h3');
        inputTitle.textContent = 'Enter Character Name:';
        inputModal.appendChild(inputTitle);

        const characterInput = document.createElement('input');
        characterInput.type = 'text';
        characterInput.classList.add('character-input');
        inputModal.appendChild(characterInput);

        const closeInputModalButton = document.createElement('button');
        closeInputModalButton.textContent = 'X';
        closeInputModalButton.classList.add('close-button');
        closeInputModalButton.addEventListener('click', () => {
            document.body.removeChild(inputModal); // Close the input modal
        });
        inputModal.appendChild(closeInputModalButton);

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Create Character';
        confirmButton.classList.add('confirm-button');

        confirmButton.addEventListener('click', () => {
            const newCharacterName = characterInput.value.trim();
            if (newCharacterName) {
                console.log(`Creating new character: ${newCharacterName}`);
                // Add logic to save new character data
                const characterName = document.getElementById("playerCharacterInput");
                characterName.textContent = newCharacterName
                document.body.removeChild(overlay);
                updateContent();
            }
        });
        inputModal.appendChild(confirmButton);

        // Remove any existing input modal
        const existingModal = document.querySelector('.input-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }

        overlay.appendChild(inputModal);
    });

    container.appendChild(newCharacterButton);

    // Step 7: Append the container to the overlay
    overlay.appendChild(container);
}


// Load and update character data
function loadAndDisplayCharacter(characterName, allCharactersData) {
            const characterData = allCharactersData[characterName];

            if (characterData) {
                updateCharacterUI(characterData, characterName);
            } else {
                console.error("Character data not found.");
                // Handle the case where data is not found, e.g., show a message to the user
            }
}



document.getElementById('deleteCharacter').addEventListener('click', () => {
    loadAndDeleteCharacter();
});

async function loadAndDeleteCharacter() {
    const dataType = "characters";
    const allCharactersData = await loadDataFromGlobalStorage(dataType);

    const overlay = document.createElement('div');
    overlay.classList.add('character-overlay');
    document.body.appendChild(overlay);

    const container = document.createElement('div');
    container.classList.add('character-container');

    const title = document.createElement('h2');
    title.classList.add('character-title');
    title.textContent = 'Select a Character to Delete';
    container.appendChild(title);

    Object.keys(allCharactersData).forEach(characterName => {
        const characterButton = document.createElement('button');
        characterButton.classList.add('character-button');
        characterButton.textContent = characterName;

        characterButton.addEventListener('click', () => {
            confirmDeleteCharacter(characterName, overlay);
        });
        container.appendChild(characterButton);
    });

    overlay.appendChild(container);
}

function confirmDeleteCharacter(characterName, overlay) {
    // Remove existing confirmation modal if it exists
    const existingConfirmModal = document.querySelector('.confirm-modal');
    if (existingConfirmModal) {
        existingConfirmModal.parentNode.removeChild(existingConfirmModal);
    }

    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirm-modal');

    // Close button for confirm modal
    const closeConfirmModalButton = document.createElement('button');
    closeConfirmModalButton.textContent = 'X';
    closeConfirmModalButton.classList.add('close-button');
    closeConfirmModalButton.addEventListener('click', () => {
        document.body.removeChild(overlay); // Close overlay
    });
    confirmModal.appendChild(closeConfirmModalButton);

    const message = document.createElement('p');
    message.textContent = `Are you sure you want to delete "${characterName}"? This action cannot be undone.`;
    confirmModal.appendChild(message);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Yes, Delete';
    confirmButton.classList.add('confirm-button');

    confirmButton.addEventListener('click', () => {
        console.log(`Deleting character: ${characterName}`);
        removeFromGlobalStorage("characters", characterName); // Add your removal logic here
        // document.body.removeChild(confirmModal);
        document.body.removeChild(overlay); // Close overlay after deletion
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(confirmModal);
    });

    confirmModal.appendChild(confirmButton);
    confirmModal.appendChild(cancelButton);
    overlay.appendChild(confirmModal);
}








function magicBonusInputListeners() {
    const magicBonusListeners = document.querySelectorAll('.magic-bonus-weapon');

    magicBonusListeners.forEach((listener) => {
        // Listen for blur and keydown events
        listener.addEventListener('blur', handleBlur);
        listener.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default behavior of Enter key
                listener.blur(); // Trigger blur event manually
            }
        });
    });

    // Handle the blur event
    function handleBlur(event) {
        console.log("Event triggered");
        calculateActionDamageDice();
        updateAllToHitDice();
    }
}



function actionTableEventListenerSetup() {
    // Select all editable cells with the given classes
    const nameCells = document.querySelectorAll('.actionName');
    const rangeCells = document.querySelectorAll('.actionRange');
    
    // Function to handle the blur event
    function handleBlur(event) {
        const cell = event.target;
        const updatedContent = cell.textContent;

        // Find the row containing the cell
        const row = cell.closest('tr');

        if (cell.classList.contains('actionName')) {
            // Update related elements based on the cell's updated content
            const toHitLabel = row.querySelector('.actionButtonLabel');
            if (toHitLabel) {
                toHitLabel.setAttribute('data-name', updatedContent);
            }
            const damageDiceLabel = row.querySelector('.actionButtonLabel.damageDiceButton');
            if (damageDiceLabel) {
                damageDiceLabel.setAttribute('data-name', "Piercing"); // Hardcoded example needs to be changed once I implement damage types. 
            }

        }
        
        console.log("Cell updated:", cell, "New content:", updatedContent);
        getAllEditableContent()
    }

    // Add event listeners to all relevant cells
    [nameCells, rangeCells].forEach(cellList => {
        cellList.forEach(cell => {
            cell.addEventListener('blur', handleBlur);
            cell.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent default Enter behavior
                    cell.blur(); // Trigger blur event manually
                }
            });
        });
    });
}



// Testing Code
function updateActionTableUI(actionTableData) {
    const tableBody = document.getElementById('actionTableBody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Loop through the action table data and create rows
    actionTableData.forEach((rowData) => {
        for (const rowIndex in rowData) {
            const row = rowData[rowIndex];
            const newRow = document.createElement('tr');

            // Set up proficiency button
            const profCell = document.createElement('td');
            const profButtonDiv = createProficiencyButton(row.proficiencyButton);
            profCell.appendChild(profButtonDiv);
            newRow.appendChild(profCell);

            // Set up action name (editable)
            const nameCell = document.createElement('td');
            nameCell.contentEditable = "true";
            nameCell.classList.add('actionName');
            nameCell.textContent = row.secondColumn;
            newRow.appendChild(nameCell);

            // Set up reach/range (editable)
            const reachCell = document.createElement('td');
            reachCell.contentEditable = "true";
            reachCell.classList.add('actionReach');
            reachCell.textContent = row.thirdColumn;
            newRow.appendChild(reachCell);

            // Set up ToHit label and button
            const toHitCell = document.createElement('td');
            const toHitLabel = document.createElement('label');
            toHitLabel.className = "actionButtonLabel";
            toHitLabel.setAttribute('value', row.fourthColumn || "5");
            toHitLabel.setAttribute('data-dice-type', "1d20");
            toHitLabel.setAttribute('data-name', row.secondColumn);

            const toHitButton = document.createElement('button');
            toHitButton.id = "toHitDice";
            toHitButton.className = "actionButton skillbuttonstyler";
            toHitButton.textContent = row.fourthColumn || "5"; // Default value if empty
            toHitCell.appendChild(toHitLabel);
            toHitCell.appendChild(toHitButton);
            newRow.appendChild(toHitCell);

            // Set up Damage label and button
            const damageCell = document.createElement('td');
            const damageLabel = document.createElement('label');
            damageLabel.className = "actionButtonLabel damageDiceButton";
            damageLabel.setAttribute('value', findAbilityScoreLabel(row.seventhColumn).getAttribute('value') || "0");
            damageLabel.setAttribute('data-dice-type', row.fifthColumn);
            damageLabel.setAttribute('data-name', "Piercing default" || "default"); //HardCoded example this needs to be updated once Damage Type is implemented. 
            const damageButton = document.createElement('button');
            damageButton.className = "actionButton damageDiceButton skillbuttonstyler";
            damageButton.textContent = row.fifthColumn & findAbilityScoreLabel(row.seventhColumn).getAttribute('value')|| "2d6+4d4+5"; // Default value if empty
            damageCell.appendChild(damageLabel);
            damageCell.appendChild(damageButton);
            newRow.appendChild(damageCell);
            
            // Create and append the content for the sixth column
            const columnSixCell = createColumnSixContent(row, rowIndex, newRow);
            newRow.appendChild(columnSixCell);

            // Set the data-category attribute based on the selected checkboxes
            const checkboxes = row["ninthColumn"];
            const selectedCategories = Object.keys(checkboxes).filter(key => checkboxes[key]);
            newRow.setAttribute('data-category', selectedCategories.join(' '));

            // Append the row to the table body
            tableBody.appendChild(newRow);


             // Add the toggle dropdown listener to the dropdown button
             const dropdownBtn = newRow.querySelector('.dropbtn');
             const dropdownContent = newRow.querySelector('.dropdown-content');
             dropdownContent.setAttribute('id', 'checkboxContainer' + (rowIndex-1));
             addToggleDropdownListener(dropdownBtn, dropdownContent, newRow);

            generateCheckboxes(checkboxes, newRow);

            
            
        }
    });

    calculateActionDamageDice()
    magicBonusInputListeners()
    actionTableEventListenerSetup()
    attachAbilityDropdownListeners()
    addProficiencyButtonListener()
    rollableButtons()
    addBlurAndEnterListenersToDamageTypes();
    updateAllDamageButtonDataNames()
}

// Helper function to create column six. The settings menu on the Action table.
function createColumnSixContent(rowData,rowIndex, newRow) {

    // Extract the required data
    const ability = rowData["seventhColumn"];  // For the ability dropdown


    // Create the outer td element
    const td = document.createElement('td');

    // Create the 'Action Setting' button
    const button = document.createElement('button');
    button.className = "nonRollButton rowSetting";
    button.setAttribute("onclick", `toggleAdditionalInfo('additionalInfoContainer${rowIndex}')`);
    button.innerText = "Action Setting";

    // Create the additional info container
    const additionalInfoContainer = document.createElement('div');
    additionalInfoContainer.id = `additionalInfoContainer${rowIndex}`;
    additionalInfoContainer.className = "additional-info-container";

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = "close-button";
    closeButton.setAttribute("onclick", `toggleAdditionalInfo('additionalInfoContainer${rowIndex}')`);
    closeButton.innerText = "Close";
    additionalInfoContainer.appendChild(closeButton);

    // Ability dropdown
    const abilityStatsContainer = document.createElement('div');
    abilityStatsContainer.className = "abilityStats-container";
    const abilityStatDropdown = document.createElement('div');
    abilityStatDropdown.className = "abilityStatDropdown";
    const select = document.createElement('select');
    select.className = "ability-dropdown";
    const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

    abilities.forEach(ab => {
        const option = document.createElement('option');
        option.value = ab;
        option.innerText = ab;
        if (ab === ability) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    abilityStatDropdown.appendChild(select);
    abilityStatsContainer.appendChild(abilityStatDropdown);
    additionalInfoContainer.appendChild(abilityStatsContainer);

    // Add contenteditable divs for weapon properties and description
    const propertiesDiv = document.createElement('div');
    propertiesDiv.contentEditable = "true";
    propertiesDiv.classList.add('actionDescriptiveText01')
    propertiesDiv.innerText = rowData["tenthColumn"]
    additionalInfoContainer.appendChild(propertiesDiv);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.contentEditable = "true";
    descriptionDiv.classList.add('actionDescriptiveText02')
    descriptionDiv.innerText = rowData["elventhColumn"]
    additionalInfoContainer.appendChild(descriptionDiv);

    // Dropdown for the checkboxes
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = "dropdown";
    const dropbtn = document.createElement('button');
    dropbtn.className = "dropbtn";
    dropbtn.innerText = "Filter Actions";
    dropdownDiv.appendChild(dropbtn);

    const updatedrowIndex = rowIndex - 1

    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = `checkboxContainer${updatedrowIndex}`;
    checkboxContainer.className = "dropdown-content";



    dropdownDiv.appendChild(checkboxContainer);
    additionalInfoContainer.appendChild(dropdownDiv);

    // Magic Bonus input
    const magicBonusDiv = document.createElement('div');
    const magicBonusInput = document.createElement('input');
    magicBonusInput.placeholder = "Magic Bonus";
    magicBonusInput.classList.add('magic-bonus-weapon')
    magicBonusInput.value = rowData["eighthColumn"]
    magicBonusDiv.appendChild(magicBonusInput);
    additionalInfoContainer.appendChild(magicBonusDiv);

    // Create the damage dice input field
    const damageDiceInput = createDamageDiceInput(rowIndex);
    additionalInfoContainer.appendChild(damageDiceInput);

    const damageTypeDiv = document.createElement('div');
    const damageTypeInput = document.createElement('input');
    damageTypeInput.placeholder = "Damage Type";
    damageTypeInput.classList.add('damage-type')
    damageTypeInput.value = rowData["twelvethColumn"]
    damageTypeDiv.appendChild(damageTypeInput);
    additionalInfoContainer.appendChild(damageTypeDiv);

    // Add blur event listener
    const inputElement = damageDiceInput.querySelector('.actionDamageDice');
    addDamageDiceInputListener(inputElement, newRow);

    // Create the delete button and append it
    const deleteButtonDiv = createDeleteButton(rowIndex);
    additionalInfoContainer.appendChild(deleteButtonDiv);

    // Append the button and the additional info container to the td
    td.appendChild(button);
    td.appendChild(additionalInfoContainer);

    

    return td;
}

function addBlurAndEnterListenersToDamageTypes() {
    // Query all elements with the class 'damage-type'
    const damageTypeInputs = document.querySelectorAll('.damage-type');
    
    // Loop through each element and add event listeners
    damageTypeInputs.forEach(inputElement => {
        // Add blur event listener
        inputElement.addEventListener('blur', function() {
            updateAllDamageButtonDataNames();
            updateContent()
        });

        // Add Enter key listener that triggers blur
        inputElement.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                inputElement.blur(); // Trigger blur when Enter is pressed
            }
        });
    });
}

function updateAllDamageButtonDataNames() {
    // Query all table rows that contain damage-type inputs
    const rows = document.querySelectorAll('#actionTableBody tr');

    rows.forEach(row => {
        // Find the damage-type input in the current row
        const damageTypeInput = row.querySelector('.damage-type');
        
        if (damageTypeInput) {
            const newDamageType = damageTypeInput.value.trim();
            
            // Find the damage button label inside the same row that is not 'toHit'
            const damageButtonLabel = row.querySelector('.damageDiceButton[data-name]');
            if (damageButtonLabel && damageButtonLabel.getAttribute('data-name') !== 'toHitButton') {
                // Update the data-name attribute of the damage button label
                damageButtonLabel.setAttribute('data-name', newDamageType);
                console.log(`Updated damage button data-name to: ${newDamageType}`);
            }
        }
    });
    updateContent()
}





// Helper function to create proficiency buttons
function createProficiencyButton(value) {
    const button = document.createElement('button');
    button.classList.add('actionProficiencyButton');

    // Find the matching proficiency level object based on the value
    const proficiencyLevel = skillProficiencyLevels.find(level => level.value === value);

    if (proficiencyLevel) {
        // Set the button's class and title based on the proficiency level
        button.classList.add(proficiencyLevel.class);
        button.title = proficiencyLevel.title;
    } else {
        // If no match is found, set a default class and title
        button.classList.add('notProficient');
        button.title = 'not proficient';
    }

    button.value = value;

    // Create a div container to match your existing structure
    const proficiencyButtonsDiv = document.createElement('div');
    proficiencyButtonsDiv.classList.add('proficiencyButtons');

    // Add the proficiency button to the div container
    proficiencyButtonsDiv.appendChild(button);
    return proficiencyButtonsDiv;
}

// Helper function to calculate action damage dice based on ability modifier
function calculateActionDamageDice() {
    const allRows = document.querySelectorAll('.actionTable tbody tr');

    allRows.forEach(row => {
        // Select the label with class 'damageDiceButton'
        const damageLabel = row.querySelector('label.damageDiceButton');
        const damageButton = row.querySelector('button.damageDiceButton');
        const abilityDropdown = row.querySelector('.ability-dropdown');

        const magicBonusInput = row.querySelector('.magic-bonus-weapon');

        const magicBonus = parseInt(magicBonusInput.value) || 0;


        if (damageLabel && damageButton && abilityDropdown) {
            // Get the selected ability from the dropdown
            const selectedAbility = abilityDropdown.value;

            // Find the corresponding ability modifier using the provided function
            const abilityScoreLabel = parseInt(findAbilityScoreLabel(selectedAbility).getAttribute('value')) + magicBonus;

            damageLabel.setAttribute ('value', abilityScoreLabel)

            if (abilityScoreLabel > 0){
                damageButton.textContent = damageLabel.getAttribute('data-dice-type') + "+" + abilityScoreLabel
            }
            else if (abilityScoreLabel < 0){
                damageButton.textContent = damageLabel.getAttribute('data-dice-type') + abilityScoreLabel
            }
            else{
                damageButton.textContent = damageLabel.getAttribute('data-dice-type')
            }
            
        }
    });
}


function addDamageDiceInputListener(inputElement, rowElement) {
    const processInput = () => {
        const newValue = inputElement.value.trim(); // Use trim() to remove any leading/trailing spaces

        if (!newValue) {
            return;
        }

        const damageButton = rowElement.querySelector('button.damageDiceButton');
        const damageLabel = rowElement.querySelector('.damageDiceButton');

        // Define the pattern to validate the dice input
        const dicePattern = /^(\d+d(4|6|8|10|12|20))([+/]\d+d(4|6|8|10|12|20))*$/;

        // Check if the input matches the required pattern
        if (!dicePattern.test(newValue)) {
            showErrorModal(`Invalid input: "${newValue}". Please enter a valid dice format like '4d4+5d6'.`);
            return;
        }

        // Calculate the total number of dice
        const totalDice = newValue.split('+').reduce((acc, dice) => {
            const count = parseInt(dice.split('d')[0], 10);
            return acc + count;
        }, 0);

        // Check if the total number of dice exceeds the limit
        if (totalDice > 40) {
            showErrorModal(`Too many dice: "${newValue}". The total number of dice cannot exceed 40.`);
            return;
        }

        // Update the damage button and label if everything is valid
        if (damageButton && damageLabel) {
            const modifier = parseInt(damageLabel.getAttribute('value'), 10);

            if (modifier > 0) {
                damageButton.textContent = newValue + "+" + modifier;
            } else if (modifier < 0) {
                damageButton.textContent = newValue + modifier;
            } else {
                damageButton.textContent = newValue;
            }

            damageLabel.setAttribute('data-dice-type', newValue);
        }
        updateContent()
    };

    // Trigger the process when input loses focus (blur)
    inputElement.addEventListener('blur', processInput);

    // Trigger the process when 'Enter' is pressed
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent the default behavior of Enter key (like form submission)
            inputElement.blur(); // Manually trigger the blur event
        }
    });
}



function createDamageDiceInput(rowIndex) {
    const div = document.createElement('div');
    const input = document.createElement('input');
    input.id = `damageDiceActions${rowIndex}`;
    input.className = 'actionDamageDice';
    input.placeholder = 'Enter damage dice';

    const label = document.createElement('span');
    label.textContent = '';

    div.appendChild(input);
    div.appendChild(label);

    return div;
}

function createDeleteButton(rowIndex) {
    const deleteButtonDiv = document.createElement('div');
    const deleteButton = document.createElement('button');
    deleteButton.id = `deleteRowButton${rowIndex}`;
    deleteButton.className = 'removeButton';
    deleteButton.textContent = 'Delete Current Row';
    deleteButtonDiv.appendChild(deleteButton);

    // Add the event listener
    addDeleteButtonListener(deleteButton);

    return deleteButtonDiv;
}

function addDeleteButtonListener(deleteButton) {
    deleteButton.addEventListener('click', function () {
        const row = deleteButton.closest('tr');
        if (row) {
            row.remove();
            updateContent()
        }
    });
}




function resetSpellSlots(){
    const spellSlots = document.querySelectorAll('.spell-slot');

    spellSlots.forEach(slot =>{
        slot.textContent = '';
        slot.classList.remove('used');
    });
}



//Working on Spell Table
function createSpellSlot() {
    const slot = document.createElement('span');
    slot.classList.add('spell-slot');
    slot.textContent = '';
    slot.addEventListener('click', () => {
        if (slot.textContent === '') {
            slot.textContent = ' ';
            slot.classList.add('used');
        } else {
            slot.textContent = '';
            slot.classList.remove('used');
        }
        updateContent()
    });
    return slot;
}

function addSpellSlot(levelContainer) {
    if (levelContainer) {
        const newSlot = createSpellSlot();
        levelContainer.appendChild(newSlot);
        console.log("Spell slot added:", newSlot); // Debugging log
    } else {
        console.error("Level container not found!"); // Error log if container is not found
    }
    updateContent()
}

// Function to remove the last spell slot
function removeSpellSlot(levelContainer) {
    if (levelContainer) {
        const lastSlot = levelContainer.querySelector('.spell-slot:last-child');
        if (lastSlot) {
            levelContainer.removeChild(lastSlot);
            console.log("Spell slot removed:", lastSlot); // Debugging log
        } else {
            console.log("No spell slot to remove."); // Log if no slots are available to remove
        }
    } else {
        console.error("Level container not found!"); // Error log if container is not found
    }
    updateContent()
}

document.querySelectorAll('.add-spell-slot').forEach(button => {
    button.addEventListener('click', function () {
        // Traverse the DOM to find the nearest .spell-slots container
        const spellSlotsContainer = this.closest('.spell-group').querySelector('.spell-slots');
        
        if (spellSlotsContainer) {
            addSpellSlot(spellSlotsContainer);
        } else {
            console.error("Spell slots container not found!"); // Error log if container is not found
        }
    });
});

// Event listener for removing spell slots
document.querySelectorAll('.remove-spell-slot').forEach(button => {
    button.addEventListener('click', function () {
        const spellSlotsContainer = this.closest('.spell-group').querySelector('.spell-slots');
        
        if (spellSlotsContainer) {
            removeSpellSlot(spellSlotsContainer);
        } else {
            console.error("Spell slots container not found!"); // Error log if container is not found
        }
    });
});

function createSpellTable() {
    // Create the table element
    const table = document.createElement('table');
    table.classList.add('spell-table');

    // Create the header row
    const headerRow = document.createElement('tr');
    headerRow.classList.add('spell-row', 'spell-header');

    const headers = ['Spell Name', 'Time', 'Hit/DC', 'Dice', 'Con', 'Notes','Del'];
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.classList.add('spell-header-cell');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    table.appendChild(headerRow);
    return table;
}

function createSpellRow(spell,spellLevel) {
    const row = document.createElement('tr');
    row.classList.add('spell-row');
    row.title = spell.description;
    row.id = `${spellLevel}`+ row.index;

    // Spell name input field
    const spellNameContainer = document.createElement('td');
    spellNameContainer.classList.add('spell-name');

    const spellNameInput = document.createElement('input');
    spellNameInput.classList.add('spell-name-input');
    spellNameInput.type = 'text';
    spellNameInput.value = spell.name;
    spellNameInput.setAttribute('spell-level', spellLevel); // Use spell.level if it's available
    spellNameInput.placeholder = 'Select Spell...';

    // Create the magnifying glass button
    const magGlassButton = document.createElement('button');
    magGlassButton.classList.add('mag-glass-button');
    magGlassButton.textContent = 'i'; // Magnifying glass symbol
    magGlassButton.addEventListener('click', function() {
    showSpellCardDetails(spellNameInput.value);
   });

    // Create the dice button
    const diceButton = document.createElement('button');
    diceButton.classList.add('dice-button');
    diceButton.textContent = '🎲'; // Dice symbol
    diceButton.addEventListener('click', function() {
        spellGroupDice(spell); // Call the spellGroupDice() function when clicked
    });

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container');
    
    // Create dropdown list
    const dropdownList = document.createElement('ul');
    dropdownList.classList.add('dropdown-list');
    dropdownContainer.appendChild(dropdownList);



    // Add a combined event listener for both 'focus' and 'input'
    spellNameInput.addEventListener('input', function(event) {
        // Get the current input value (empty string for 'focus')
        const searchQuery = event.type === 'input' ? spellNameInput.value.toLowerCase() : '';

        // Get the level to filter by
        const level = spellLevel;

        // Retrieve spell data object and array
        const spellDataObject = AppData.spellLookupInfo;
        const spellDataArray = spellDataObject.spellsData;
        
        // First, filter spells based on level
        const filteredSpells = spellDataArray.filter(spell => spell.level === level);

        // Further filter spells based on the user's input if they are typing
        const filteredSpellNames = filteredSpells
            .map(spell => spell.name)
            .filter(name => name.toLowerCase().includes(searchQuery)); // Filter by user input

        // Populate the dropdown or other UI with the filtered spell names
        populateListWithAllSpells(filteredSpellNames, dropdownList, row, dropdownContainer);

        // Show the dropdown if it has items to display, otherwise hide it
        dropdownContainer.style.display = filteredSpellNames.length > 0 ? 'block' : 'none';
    });

    // Add 'focus' listener to show dropdown when the input is focused
    spellNameInput.addEventListener('focus', function() {
        spellNameInput.dispatchEvent(new Event('input')); // Trigger the 'input' event on focus
    });



    // Hide dropdown on click outside
    document.addEventListener('click', function(event) {
        if (!dropdownContainer.contains(event.target) && event.target !== spellNameInput) {
            dropdownContainer.style.display = 'none'; // Hide dropdown
        }
    });

    spellNameContainer.appendChild(spellNameInput);
    spellNameContainer.appendChild(dropdownContainer);
    spellNameContainer.appendChild(magGlassButton); // Append the magnifying glass button
    // spellNameContainer.appendChild(diceButton); // Append the dice button

    // Other spell details
    const castTime = document.createElement('td');
    castTime.classList.add('spell-cast-time');
    castTime.textContent = spell.castTime;

    const toHitOrDC = document.createElement('td');
    toHitOrDC.classList.add('spell-to-hit-dc');
    toHitOrDC.textContent = spell.toHitOrDC;

    const spellDice = document.createElement('td');
    spellDice.classList.add('spell-dice');
    spellDice.textContent = spell.spellDice

    const concentration = document.createElement('td');
    concentration.classList.add('spell-concentration');
    concentration.textContent = spell.concentration ? 'Yes' : 'No';

    const components = document.createElement('td');
    components.classList.add('spell-components');
    components.textContent = spell.components;

    // Create the remove button
    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');
    removeButton.textContent = 'X'; 
    removeButton.classList.add('remove-row-button');
    removeButton.addEventListener('click', function() {
        removeSpellRow(row);
    });
    removeCell.appendChild(removeButton);


    // Append all elements to the row
    row.appendChild(spellNameContainer);
    row.appendChild(castTime);
    row.appendChild(toHitOrDC);
    row.appendChild(spellDice);
    row.appendChild(concentration);
    row.appendChild(components);
    row.appendChild(removeCell);

    return row;
}

function removeSpellRow(row) {
    row.parentElement.removeChild(row);
}

function addSpellToContainer(spellContainer, spellData = null) {
    // Default spell data if not provided
    if (!spellData) {
        spellData = {
            name: "",
            castTime: "",
            toHitOrDC: "",
            spellDice: "",
            concentration: false,
            components: "",
            description: ""
        };
    }

    let table = spellContainer.querySelector('.spell-table');
    let spellLevel = spellContainer.getAttribute('spellLevel');

    // If table doesn't exist, create it
    if (!table) {
        table = createSpellTable();
        spellContainer.appendChild(table);
    }

    // Add the new spell row
    const spellRow = createSpellRow(spellData, spellLevel);
    table.appendChild(spellRow);
}


document.querySelectorAll('.add-spell-button').forEach(button => {
    button.addEventListener('click', function () {
        const spellContainer = this.nextElementSibling;

        if (spellContainer && spellContainer.classList.contains('spell-container')) {
            addSpellToContainer(spellContainer);
            updateContent()
        } else {
            console.error("Spell container not found!");
        }
    });
});



function populateListWithAllSpells(spellsData, inputRef, row, dropdownContainer) {
    // Sort spell names alphabetically
    spellsData.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const spellList = inputRef;

    // Clear any existing items in the list to prevent duplicates
    spellList.innerHTML = '';

    spellsData.forEach((spellName) => {
        const listItem = document.createElement('li');
        listItem.classList.add('listSelection');
        listItem.textContent = spellName;
        listItem.addEventListener('click', () => {
            // Find the corresponding spell object if needed or update details directly
            const spell = { name: spellName }; // Mock object if needed
            loadSpell(spell, row);
            dropdownContainer.style.display = 'none'; // Hide dropdown
        });
        spellList.appendChild(listItem);
    });
}





function loadSpell(spell,row) {
    // Retrieve the spell data object and array

    const spellDataObject = AppData.spellLookupInfo;
    const spellDataArray = spellDataObject.spellsData;

    const spellmodifier = document.querySelector('.spellcasting-dropdown').value

    // Find the corresponding spell object based on the spell name
    let spellDetails = spellDataArray.find(spellData => spellData.name === spell.name);
    
    if (!spellDetails) {
        console.error(`Spell "${spell.name}" not found.`);
        return;
    }

    if (!row) {
        console.error('Row not found.');
        return;
    }

    // Update each field in the row with the spell details
    const spellNameInput = row.querySelector('.spell-name-input');
    if (spellNameInput) {
        spellNameInput.value = spellDetails.name;
    }

    const castTime = row.querySelector('.spell-cast-time');
    if (castTime) {
        castTime.textContent = spellDetails.casting_time;
    }

    const toHitOrDC = row.querySelector('.spell-to-hit-dc');
    if (toHitOrDC) {
        const toHitOrDCContent = updateSpelltoHitorDC(spellDetails.toHitOrDC);
        if (toHitOrDCContent) {
            toHitOrDC.textContent = ''; // Clear existing content
            toHitOrDC.appendChild(toHitOrDCContent);
            updateSpelltoHitDice(spellmodifier);
            updateSpellSaveDC(spellmodifier)
            updateSpellsDC(spellmodifier, spellDetails.spell_save_dc_type, row)
            updateContent()
        }

    }

    const spellDice = row.querySelector('.spell-dice');
    if (spellDice){

        spellDice.innerHTML = "";

        spellDice.appendChild(updateSpellDamageDice(spellmodifier,spellDetails.damage_dice,spellDetails))
        
    }

    const concentration = row.querySelector('.spell-concentration');
    if (concentration) {
        concentration.textContent = spellDetails.concentration;
    }

    const components = row.querySelector('.spell-components');
    if (components) {
        components.textContent = spellDetails.components + spellDetails.ritual;
    }


    rollableButtons()
    updateContent()
}

function updateSpelltoHitorDC(spellDetails) {
    

    if (spellDetails === "toHit") {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('to-hit-container');

        const label = document.createElement('label');
        label.classList.add('actionButtonLabel');
        label.setAttribute('value', '5');
        label.setAttribute('data-dice-type', '1d20');
        label.setAttribute('data-name', 'Spell Attack');

        const button = document.createElement('button');
        button.classList.add('actionButton', 'skillbuttonstyler', 'spell-attack-button');
        button.textContent = '+5';

        containerDiv.appendChild(label);
        containerDiv.appendChild(button);

        return containerDiv;
    } else if (spellDetails === "DC") {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('dc-container');

        const label = document.createElement('label');
        const span = document.createElement('span');
        span.classList.add('spell-save');

        containerDiv.appendChild(label);
        containerDiv.appendChild(span);

        return containerDiv;
    } else {
        const containerDiv = document.createElement('div');
        return containerDiv;
    }
}

function updateSpellDamageDice(ability, damageDice, spellDetails) {
    if (damageDice) {

        // Get the character's current level
        const characterLevel = parseInt(document.querySelector('#characterLevel').textContent) || 1;

        // Adjust cantrip damage based on character level
        let adjustedDamageDice = damageDice;
        if (spellDetails.level.toLowerCase() === "cantrip") {
            if(spellDetails.damage_dice_upcast){
                adjustedDamageDice = getCantripDamageDice(damageDice, characterLevel, spellDetails);
            }
        }
        
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('to-hit-container');

        const label = document.createElement('label');
        label.classList.add('actionButtonLabel', 'damageDiceButton');
        label.setAttribute('data-dice-type', adjustedDamageDice);
        label.setAttribute('data-name', spellDetails.damage_type_01);

        const button = document.createElement('button');
        button.classList.add('actionButton', 'damageDiceButton', 'spell-damage-button');


        if (spellDetails.ability_modifier === "yes") {
            const spellMod = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));

            if (spellMod >= 0) {
                label.setAttribute('value', spellMod);
                button.textContent = adjustedDamageDice + "+" + spellMod ;
            } else {
                label.setAttribute('value', spellMod);
                button.textContent = adjustedDamageDice + spellMod;
            }

            containerDiv.appendChild(label);
            containerDiv.appendChild(button);
        } else {
            const spellAdditionalDamage = spellDetails.additonal_damage;
            if (spellAdditionalDamage) {
                adjustedDamageDice = adjustedDamageDice + "+" + spellAdditionalDamage;
                label.setAttribute('value', spellAdditionalDamage);
                button.textContent = adjustedDamageDice;
            } else {
                label.setAttribute('value', '0');
                button.textContent = adjustedDamageDice;
            }

            containerDiv.appendChild(label);
            containerDiv.appendChild(button);
        }

        return containerDiv;
    } else {
        const containerDiv = document.createElement('div');
        return containerDiv;
    }
}

// Updated getCantripDamageDice function
function getCantripDamageDice(baseDice, characterLevel, spellDetails) {
    const levels = [5, 11, 17]; // Level thresholds for cantrip damage increases
    const damageDiceUpcast = spellDetails.damage_dice_upcast;

    // Determine the scaling factor based on the character level
    let scaleFactor = 1;
    for (let i = 0; i < levels.length; i++) {
        if (characterLevel >= levels[i]) {
            scaleFactor++;
        } else {
            break;
        }
    }

    // Handle split damage types like "1d8/1d12"
    if (baseDice.includes("/")) {
        const diceParts = baseDice.split("/");
        const scaledDice = diceParts.map(dice => {
            const [num, dieType] = dice.match(/(\d+)d(\d+)/).slice(1, 3);
            return (scaleFactor * parseInt(num)) + "d" + dieType;
        });
        return scaledDice.join("/");
    } else {
        // Handle standard single dice type
        const [num, dieType] = baseDice.match(/(\d+)d(\d+)/).slice(1, 3);
        return (scaleFactor * parseInt(num)) + "d" + dieType;
    }
}


function updateSpellsDC(ability, saveType, row){
    const magicBonus = parseInt(document.querySelector('.magic-bonus-dropdown').value, 10);
    const spellDCSelections = row.querySelector('.spell-save');
    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8 + magicBonus;
    if(saveType){
        spellDCSelections.textContent = saveType + " " + spellSaveDc;
    }

    return spellSaveDc
}


function updateAllSpellDamageDice() {
    const spellDataObject = AppData.spellLookupInfo;
    const spellDataArray = spellDataObject.spellsData;
    const spellModifier = document.querySelector('.spellcasting-dropdown').value;

    // Get the character's current level
    const characterLevel = parseInt(document.querySelector('#characterLevel').textContent) || 1;

    // Get all rows in the spell list table
    const spellRows = document.querySelectorAll('.spell-table .spell-row');

    // Loop through each spell row in the table
    spellRows.forEach(row => {
        const spellNameInput = row.querySelector('.spell-name-input');
        if (spellNameInput) {
            const spellName = spellNameInput.value.trim();

            // Find the corresponding spell object in the JSON data based on the spell name
            const spellDetails = spellDataArray.find(spellData => spellData.name === spellName);

            if (spellDetails) {
                const toHitContainer = row.querySelector('.spell-dice .to-hit-container');

                // Only proceed if toHitContainer exists
                if (toHitContainer) {
                    // Adjust cantrip damage based on character level
                    let adjustedDamageDice = spellDetails.damage_dice;
                    if (spellDetails.level.toLowerCase() === "cantrip") {
                        if (spellDetails.damage_dice_upcast) {
                            adjustedDamageDice = getCantripDamageDice(adjustedDamageDice, characterLevel, spellDetails);
                        }
                    }

                    // Check if the spell uses an ability modifier in its damage calculation
                    if (spellDetails.ability_modifier === "yes") {
                        const spellAbilityScoreModifier = parseInt(findAbilityScoreLabel(spellModifier).getAttribute('value'));
                        let newDamage = "";

                        if (spellAbilityScoreModifier >= 0) {
                            newDamage = adjustedDamageDice + "+" + spellAbilityScoreModifier;
                            if (spellDetails.additonal_damage) {
                                newDamage = newDamage + "+" + spellDetails.additonal_damage;
                            }
                        } else {
                            newDamage = adjustedDamageDice + spellAbilityScoreModifier;
                        }

                        const labelElement = toHitContainer.querySelector('label.damageDiceButton');
                        const buttonElement = toHitContainer.querySelector('button.damageDiceButton');

                        // Only proceed if labelElement and buttonElement exist
                        if (labelElement && buttonElement) {
                            labelElement.setAttribute('value', spellAbilityScoreModifier);
                            labelElement.setAttribute('data-dice-type', adjustedDamageDice);
                            labelElement.setAttribute('data-name', spellDetails.damage_type_01);

                            buttonElement.textContent = newDamage;
                        }
                    } else {
                        // Handle cantrips and other spells without an ability modifier
                        const labelElement = toHitContainer.querySelector('label.damageDiceButton');
                        const buttonElement = toHitContainer.querySelector('button.damageDiceButton');

                        // Only proceed if labelElement and buttonElement exist
                        if (labelElement && buttonElement) {
                            labelElement.setAttribute('value', ""); // No ability modifier
                            labelElement.setAttribute('data-dice-type', adjustedDamageDice);
                            labelElement.setAttribute('data-name', spellDetails.damage_type_01);

                            buttonElement.textContent = adjustedDamageDice;
                        }
                    }
                } else {
                    // console.log("toHitContainer not found in this row for spell: " + spellName);
                }
            } else {
                // console.log("Spell not found in spell data: " + spellName);
            }
        } else {
            // console.log("Spell Name Input not found in this row.");
        }
    });
    updateContent()
}



function updateAllSpellDCs() {
    const magicBonus = parseInt(document.querySelector('.magic-bonus-dropdown').value, 10);
    const spellDataObject = AppData.spellLookupInfo;
    const spellDataArray = spellDataObject.spellsData;
    const spellModifier = document.querySelector('.spellcasting-dropdown').value;

    // Get all rows in the spell list table
    const spellRows = document.querySelectorAll('.spell-table .spell-row');

    // Loop through each spell row in the table
    spellRows.forEach(row => {
        // Try different selectors depending on your structure
        const spellNameInput = row.querySelector('.spell-name-input');

        if (spellNameInput) {
            const spellName = spellNameInput.value.trim();

            // Find the corresponding spell object in the JSON data based on the spell name
            const spellDetails = spellDataArray.find(spellData => spellData.name === spellName);

            if (spellDetails) {
                const saveType = spellDetails.spell_save_dc_type;

                const spellDCSelection = row.querySelector('.spell-save');
                const spellAbilityScoreModifier = parseInt(findAbilityScoreLabel(spellModifier).getAttribute('value'));
                const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

                const spellSaveDC = spellAbilityScoreModifier + proficiencyBonus + 8 + magicBonus;



                if (saveType) {
                    spellDCSelection.textContent = saveType + " " + spellSaveDC;
                }

            }
        } else {
            console.log("Spell Name Input not found in this row.");
        }
    });
    updateContent()
}

function updateSpellDCHeader(){
    const magicBonus = parseInt(document.querySelector('.magic-bonus-dropdown').value, 10);
    const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
    const spellSection = document.getElementById('SpellList');
    const spellDCSelection = spellSection.querySelector('.spell-dc');


    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(spellCastingAbility).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8 + magicBonus;

    spellDCSelection.textContent = spellSaveDc;

    const spellAttackLabel = spellSection.querySelector('.actionButtonLabel');
    const spellAttackButton = spellSection.querySelector('.spell-attack-button');
    
    // Update the label value and button text
    const spellAttackBonus = spellAbilityScoreModifer + proficiencyBonus + magicBonus;
    spellAttackLabel.setAttribute('value', spellAttackBonus);
    spellAttackButton.textContent = `+${spellAttackBonus}`;

    sendDMUpdatedStats()

}


function updateSpellSaveDC(ability){
    const magicBonus = parseInt(document.querySelector('.magic-bonus-dropdown').value, 10);
    const spellSection = document.getElementById('SpellList');
    const spellDCSelections = spellSection.querySelectorAll('.spell-save-dc');
    
    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8 + magicBonus;

    spellDCSelections.forEach((span) =>{
        span.textContent = spellSaveDc;
    });

    return spellSaveDc
}

function updateSpelltoHitDice(ability) {
    const magicBonus = parseInt(document.querySelector('.magic-bonus-dropdown').value, 10);
    const spellSection = document.getElementById('SpellList');
    const spellAttackButtons = spellSection.querySelectorAll(".spell-attack-button")

    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);
    
    const spellAttackBonus = spellAbilityScoreModifer + proficiencyBonus + magicBonus;

    // Loop through each spell attack button
    spellAttackButtons.forEach((button, index) => {
        // Update button text content
        if (spellAttackBonus >= 0 ){
            button.textContent = "+" + spellAttackBonus;
        }
        else{
            button.textContent = spellAttackBonus; 
        }
       

        // Find the associated label
        const label = button.previousElementSibling; // Assuming the label is the sibling before the button
        if (label) {
            // Update label value and data-name
            label.setAttribute('value', spellAttackBonus); // Example, adjust logic as needed
            label.setAttribute('data-name', label.getAttribute('data-name') || 'Spell Attack');

            // Get the row associated with this label
            const row = button.closest('tr');
            
            if (row) {
                // Get the value of the currently selected input in the row
                const spellNameInput = row.querySelector('.spell-name-input');
                const selectedSpellName = spellNameInput ? spellNameInput.value : '';
                
                // Update the label's data-name attribute with the selected spell name
                label.setAttribute('data-name', selectedSpellName);
            } 
        }
    });
    rollableButtons()
}

let currentSelectedSpellName = '';

function showSpellCardDetails(spellName) {

     // Check if the spell card is currently visible
     if (spellCardContainer.classList.contains('visible') && currentSelectedSpellName === spellName) {
        // Hide the card if it's already open
        spellCardContainer.classList.remove('visible');
        spellCardContainer.classList.add('hidden');
        return; // Exit the function early
    }

    const spellDataObject = AppData.spellLookupInfo;
    const spellDataArray = spellDataObject.spellsData;
    const spell = spellDataArray.find(spell => spell.name === spellName);

    if (spell) {

        currentSelectedSpellName = spellName
        // Reusable function to populate data conditionally
        const populateField = (elementId, label, value) => {
            const element = document.getElementById(elementId);
            if (value) {
                element.innerHTML = `<strong>${label}:</strong> ${value}`;
                element.style.display = 'block';
            } else {
                element.style.display = 'none';
            }
        };

        // Populate the spell card with data
        document.getElementById('spellName').textContent = spell.name;
        populateField('spellLevel', 'Level', spell.level);
        populateField('spellSchool', 'School', spell.school);
        populateField('spellCastingTime', 'Casting Time', spell.casting_time);
        populateField('spellRange', 'Range', spell.range);
        populateField('spellComponents', 'Components', spell.components);
        populateField('spellDuration', 'Duration', spell.duration);
        populateField('spellDescription', 'Description', spell.desc);
        populateField('spellMaterials', 'Materials', spell.material)
        populateField('spellHigherLevel', 'Up Cast', spell.higher_level);
        populateField('spellToHitOrDC', spell.toHitOrDC === 'toHit' ? 'Spell Attack' : 'Spell Save DC', spell.toHitOrDC === 'toHit' ? 'Spell Attack' : spell.spell_save_dc_type);
        populateField('spellDamageDice', 'Damage', spell.damage_dice);

        // Show the spell card with the slide-in animation
        const spellCardContainer = document.getElementById('spellCardContainer');
        spellCardContainer.classList.remove('hidden');
        spellCardContainer.classList.add('visible');

        // Add an event listener to the close button
        document.getElementById('closeSpellCard').onclick = function() {
            spellCardContainer.classList.remove('visible');
            spellCardContainer.classList.add('hidden');
            currentSelectedSpellName = '';
        };

        // Make sure the card is visible (in case it was previously hidden)
        spellCardContainer.style.display = 'block';
    }
}


function processSpellData() {
    const spellData = {};

    // Get selected spellcasting modifier
    const spellcastingModifier = document.querySelector('.spellcasting-dropdown').value;
    spellData['spellcastingModifier'] = spellcastingModifier;

    const spellLevelSelected = document.querySelector('.spell-level-dropdown').value
    spellData['spelllevelselected'] = spellLevelSelected;

    const magicBonus = document.querySelector('.magic-bonus-dropdown').value
    spellData['spellmagicbonus'] = magicBonus;

    // Loop through each spell level container
    const spellContainers = document.querySelectorAll('.spell-container');
    spellContainers.forEach(container => {
        const spellLevel = container.getAttribute('spelllevel');
        spellData[spellLevel] = {
            spells: [],
            slots: []
        };

        // Collect spell details
        const spellRows = container.querySelectorAll('.spell-row');
        spellRows.forEach(row => {
            const spellDetails = {};

            // Get spell details
            const spellNameInput = row.querySelector('.spell-name-input');
            const spellName = spellNameInput ? spellNameInput.value.trim() : '';
            
            // Only add spell if the name is not empty
            if (spellName) {
                spellDetails['name'] = spellName;
                spellData[spellLevel].spells.push(spellDetails);
            }
        });
    });

    // Collect spell slots information
    const spellGroups = document.querySelectorAll('.spell-group');
    spellGroups.forEach(group => {
        const spellLevel = group.querySelector('.spell-container').getAttribute('spelllevel');
        if(spellLevel !== "Cantrip"){
            const spellSlotsContainer = group.querySelector('.spell-slots');

            if (spellSlotsContainer) {
                const slots = spellSlotsContainer.querySelectorAll('.spell-slot');
                spellData[spellLevel].slots = Array.from(slots).map(slot => slot.classList.contains('used'));
            } else {
                console.warn(`No spell slots container found for level: ${spellLevel}`);
            }
        }

    });

    return spellData;
}






function loadSpellData(spellData) {
    // Set the selected spellcasting modifier
    const spellcastingDropdown = document.querySelector('.spellcasting-dropdown');
    if (spellcastingDropdown && spellData.spellcastingModifier) {
        spellcastingDropdown.value = spellData.spellcastingModifier;
    }

    const magicBonus = document.querySelector('.magic-bonus-dropdown');
    if(magicBonus && spellData.spellmagicbonus){
        magicBonus.value = spellData.spellmagicbonus;
    }
    

    const spellLevelDropdown = document.querySelector('.spell-level-dropdown');
    if (spellLevelDropdown && spellData.spelllevelselected) {
        spellLevelDropdown.value = spellData.spelllevelselected;

        // Call the filtering function based on the selected spell level
        filterSpellsByLevel(spellData.spelllevelselected);
    }

    // Loop through each spell level in the saved data
    Object.keys(spellData).forEach(spellLevel => {
        if (spellLevel === 'spellcastingModifier' || spellLevel === 'spelllevelselected' || spellLevel === 'spellmagicbonus') return; // Skip the modifier and selected level

        const { spells, slots } = spellData[spellLevel];

        // Find the corresponding spell group by spell level
        const spellGroup = document.querySelector(`.spell-group[spellLevel="${spellLevel}"]`);
        // Handle spell slots only for levels that are not cantrips
        if (spellLevel !== 'Cantrip') {
            const spellSlotsContainer = spellGroup.querySelector('.spell-slots');
            if (spellSlotsContainer) {
                // Clear existing slots
                spellSlotsContainer.innerHTML = '';

                // Add new spell slots based on saved slots
                if (Array.isArray(slots) && slots.length > 0) {
                    slots.forEach(isUsed => {
                        const newSlot = createSpellSlot();
                        if (isUsed) {
                            newSlot.textContent = '';
                            newSlot.classList.add('used');
                        }
                        spellSlotsContainer.appendChild(newSlot);
                    });
                }
            } else {
                console.error(`Spell slots container for level ${spellLevel} not found.`);
            }
        }

        // Handle spell data within the spell container
        const spellContainer = spellGroup ? spellGroup.querySelector(`.spell-container[spelllevel="${spellLevel}"]`) : null;

        if (spellContainer) {
            // Check for existing spell table or create one if it doesn't exist
            let spellTable = spellContainer.querySelector('.spell-table');
            if (!spellTable) {
                spellTable = createSpellTable();  // Assumes this function creates a table element
                spellContainer.appendChild(spellTable);
            }

            // Populate the spell table with saved spells
            spells.forEach(spell => {
                const spellRow = createSpellRow(spell, spellLevel);
                spellTable.appendChild(spellRow);
                loadSpell(spell, spellRow);  // Populates the row with spell details
            });
        } else {
            console.error(`Spell container for level ${spellLevel} not found.`);
        }
    });

    updateAllSpellDCs();
    updateAllSpellDamageDice();
    updateSpellDCHeader();
}


// Function to filter spells by selected level
function filterSpellsByLevel(selectedLevel) {
    const spellGroups = document.querySelectorAll('.spell-group');

    spellGroups.forEach(spellGroup => {
        const spellLevelAttr = spellGroup.getAttribute('spellLevel');

        let spellLevelNumber;

        if (spellLevelAttr === 'Cantrip') {
            spellLevelNumber = 0; // Treat cantrips as level 0
        } else {
            spellLevelNumber = parseInt(spellLevelAttr.split('-')[0], 10);
        }

        if (spellLevelNumber <= selectedLevel) {
            spellGroup.style.display = 'block';
        } else {
            spellGroup.style.display = 'none';
        }
    });
}



















// Working on the feature and traits section
const featuresSection = document.getElementById('features');
const addGroupButton = document.querySelector('.add-group-button');
let groupCounter = 0; // Keep track of the number of groups for unique IDs

// Function to create a new group of traits with optional data for loading
function createNewGroup(groupData = null) {
    groupCounter++;

    // Create group container
    const groupContainer = document.createElement('div');
    groupContainer.classList.add('group-container');
    groupContainer.id = `group${groupCounter}`;

    // Create group header
    const groupHeader = document.createElement('div');
    groupHeader.classList.add('group-header');
    const groupTitle = document.createElement('input');
    groupTitle.classList.add('group-title');
    groupTitle.placeholder = `Feature Group ${groupCounter}`;

    // If groupData is provided, populate the group title
    if (groupData && groupData['group-title']) {
        groupTitle.value = groupData['group-title'];
    }

    const addTraitButton = document.createElement('button');
    addTraitButton.classList.add('add-trait-button');
    addTraitButton.textContent = '+ Add New Trait';

    // Add event listener to add new traits to the group
    addTraitButton.addEventListener('click', function () {
        addNewTrait(groupContainer);
    });

    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(addTraitButton);
    groupContainer.appendChild(groupHeader);

    // Create the trait list (initially empty)
    const traitsList = document.createElement('div');
    traitsList.classList.add('traits-list');
    groupContainer.appendChild(traitsList);

    // If groupData is provided, load its traits
    if (groupData && groupData.traits) {
        groupData.traits.forEach(trait => {
            addNewTrait(groupContainer, trait);  // Pass the trait data
        });
    }

    // Add the group to the features section
    featuresSection.insertBefore(groupContainer, addGroupButton);

    // Automatically show the group if it was hidden
    featuresSection.style.display = 'block';

    // Return the created groupContainer for use in other functions
    updateContent()
    return groupContainer;
}


// Function to add a new trait to a specific group, with optional trait data
function addNewTrait(groupContainer, traitData = null) {
    const traitsList = groupContainer.querySelector('.traits-list');

    // Create the trait item
    const traitItem = document.createElement('div');
    traitItem.classList.add('trait-item');    

    // Trait Name Input
    const traitName = document.createElement('input');
    traitName.classList.add('trait-name');
    traitName.placeholder = 'Trait Name (e.g., Channel Divinity)';
    traitName.addEventListener('blur', function (){
        updateContent()
    });

    // If traitData is provided, populate the trait name
    if (traitData && traitData.traitName) {
        traitName.value = traitData.traitName;
    }

    // Trait Description Textarea
    const traitDescription = document.createElement('textarea');
    traitDescription.classList.add('trait-description');
    traitDescription.placeholder = 'Describe the trait here...';

    traitDescription.addEventListener('blur', function (){
        updateContent()
    });

    // If traitData is provided, populate the description
    if (traitData && traitData.traitDescription) {
        traitDescription.value = traitData.traitDescription;
    }

    // Create the "i" button for displaying the submenu
    const infoButton = document.createElement('button');
    infoButton.innerHTML = '<i>i</i>';
    infoButton.classList.add('info-button');

    // Submenu container (initially hidden)
    const traitSettings = document.createElement('div');
    traitSettings.classList.add('trait-settings');
    traitSettings.style.display = 'none'; // Initially hidden

    // Add event listener to toggle the submenu display
    infoButton.addEventListener('click', function () {
        traitSettings.style.display = traitSettings.style.display === 'none' ? 'block' : 'none';
        updateContent()
    });

    // Trait Usage Section (number input and checkboxes)
    const traitUses = document.createElement('div');
    traitUses.classList.add('trait-uses');
    const usesLabel = document.createElement('label');
    usesLabel.textContent = 'Number of Uses:';
    const usesInput = document.createElement('input');
    usesInput.type = 'number';
    usesInput.classList.add('trait-uses-input');
    usesInput.value = traitData && traitData.numberOfUses ? traitData.numberOfUses : 3;
    usesInput.min = 1;
    usesInput.max = 10;

    // Container for dynamically generated checkboxes (on main page)
    const checkboxesContainerMain = document.createElement('div');
    checkboxesContainerMain.classList.add('trait-checkboxes-main');

    // Function to update the checkboxes on the main section
    function updateCheckboxes() {
        const numberOfUses = parseInt(usesInput.value);
        checkboxesContainerMain.innerHTML = 'Uses: '; // Clear existing checkboxes

        for (let i = 0; i < numberOfUses; i++) {
            const checkboxMain = document.createElement('input');
            checkboxMain.type = 'checkbox';
            checkboxMain.classList.add('trait-checkbox-main');

            // Check if traitData contains saved checkbox states
            if (traitData && traitData.checkboxStates && traitData.checkboxStates[i] !== undefined) {
                checkboxMain.checked = traitData.checkboxStates[i];
            }

            checkboxesContainerMain.appendChild(checkboxMain);
        }
        updateContent()
    }

    // Update checkboxes when the input changes
    usesInput.addEventListener('input', updateCheckboxes);

    // Initially generate checkboxes based on traitData
    updateCheckboxes();

    // Append uses controls to the submenu
    traitUses.appendChild(usesLabel);
    traitUses.appendChild(usesInput);

    // Ability Adjustment Section
    const adjustmentTypeLabel = document.createElement('label');
    adjustmentTypeLabel.textContent = 'Adjust Ability (e.g., add to saves or rolls):';
    const adjustmentType = document.createElement('select');
    adjustmentType.classList.add('adjustment-type');
    const options = ['Saving Throws', 'Attack Rolls', 'Damage Rolls', 'Other'];
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        adjustmentType.appendChild(opt);
    });

    // If traitData is provided, populate the adjustment type
    if (traitData && traitData.adjustmentType) {
        adjustmentType.value = traitData.adjustmentType;
    }

    const adjustmentValueLabel = document.createElement('label');
    adjustmentValueLabel.textContent = 'Adjustment Value (e.g., +5 or CHA modifier):';
    const adjustmentValue = document.createElement('input');
    adjustmentValue.classList.add('adjustment-value');
    adjustmentValue.placeholder = 'Enter value or formula';

    // If traitData is provided, populate the adjustment value
    if (traitData && traitData.adjustmentValue) {
        adjustmentValue.value = traitData.adjustmentValue;
    }

    const adjustmentConditionLabel = document.createElement('label');
    adjustmentConditionLabel.textContent = 'Condition (e.g., while raging):';
    const adjustmentCondition = document.createElement('input');
    adjustmentCondition.classList.add('adjustment-condition');
    adjustmentCondition.placeholder = 'Enter condition (if any)';

    // If traitData is provided, populate the adjustment condition
    if (traitData && traitData.adjustmentCondition) {
        adjustmentCondition.value = traitData.adjustmentCondition;
    }

    // Append ability adjustment fields
    traitSettings.appendChild(adjustmentTypeLabel);
    traitSettings.appendChild(adjustmentType);
    traitSettings.appendChild(adjustmentValueLabel);
    traitSettings.appendChild(adjustmentValue);
    traitSettings.appendChild(adjustmentConditionLabel);
    traitSettings.appendChild(adjustmentCondition);

    // Delete Trait Button
    const deleteTraitButton = document.createElement('button');
    deleteTraitButton.textContent = 'Delete Trait';
    deleteTraitButton.classList.add('delete-trait-button');

    // Event listener for deleting the trait
    deleteTraitButton.addEventListener('click', function () {
        // Remove the trait item from the DOM
        traitItem.remove();

        // Check if there are no more traits in the group, delete the group
        if (traitsList.children.length === 0) {
            groupContainer.remove();
        }
        updateContent()
    });

    // Append the delete button to the submenu
    traitSettings.appendChild(traitUses);
    traitSettings.appendChild(deleteTraitButton);

    // Append trait parts to trait item
    traitItem.appendChild(traitName);
    traitItem.appendChild(traitDescription);
    traitItem.appendChild(checkboxesContainerMain); // Checkboxes for uses (main view)
    traitItem.appendChild(infoButton); // The "i" button for the submenu
    traitItem.appendChild(traitSettings); // Submenu with uses and adjustments

    // Add the trait item to the list of traits in the group
    traitsList.appendChild(traitItem);

    // Automatically show the trait list if hidden
    traitsList.style.display = 'block';
    updateContent()
}


// Event listener for adding a new group
addGroupButton.addEventListener('click', createNewGroup);






// Saving Trait data 
function processGroupTraitData() {
    // Select all group containers

    const groupContainers = document.querySelectorAll('.group-container');
    const groupTraitData = [];
    groupContainers.forEach((group, index) => {
        const groupData = {};
        const groupName = group.querySelector('.group-title').value;
        groupData['group-title'] = groupName;

        // Select all traits within this group
        const traits = group.querySelectorAll('.trait-item');
        const traitData = [];

        traits.forEach((trait) => {
            const traitDataObject = {};
            const traitName = trait.querySelector('.trait-name').value;
            const traitDescription = trait.querySelector('.trait-description').value;

            // Save the trait name and value
            traitDataObject['traitName'] = traitName;
            traitDataObject['traitDescription'] = traitDescription;

            // Save the trait checkbox state if available
            const checkboxes = trait.querySelectorAll('.trait-checkbox-main');
            traitDataObject['checkboxStates'] = Array.from(checkboxes).map(checkbox => checkbox.checked);

            // Save any other trait-specific fields (like dropdowns, etc.)
            const traitSettings = trait.querySelector('.trait-settings');

            if (traitSettings) {
                const adjustmentType = traitSettings.querySelector('.adjustment-type').value;
                const adjustmentValue = traitSettings.querySelector('.adjustment-value').value;
                const adjustmentCondition = traitSettings.querySelector('.adjustment-condition').value;
                const numberOfUses = traitSettings.querySelector('.trait-uses-input').value;

                // Save the trait settings in the traitDataObject
                traitDataObject['adjustmentType'] = adjustmentType;
                traitDataObject['adjustmentValue'] = adjustmentValue;
                traitDataObject['adjustmentCondition'] = adjustmentCondition;
                traitDataObject['numberOfUses'] = numberOfUses;
            }

            // Add the trait data to the list of traits for this group
            traitData.push(traitDataObject);
        });

        // Save the traits for this group
        groupData['traits'] = traitData;

        // Add the group data to the overall groupTraitData array
        groupTraitData.push(groupData);
    });

    return groupTraitData;
}

// Loading features and traits and filling with the correct information.
function loadGroupTraitData(groupTraitData) {
    // Clear any existing groups (if necessary)
    const groupContainerElement = document.querySelector('#feature-groups-container'); // Adjust the selector to the correct container where groups should be appended.
    groupContainerElement.innerHTML = ''; // Clear any previous data.

    // Loop through each group in groupTraitData
    groupTraitData.forEach(group => {
        // Use createNewGroup to create a group container with proper groupData
        const groupContainer = createNewGroup(group);

        // Append the group container to the parent container
        groupContainerElement.appendChild(groupContainer);
    });

}




async function handleSyncEvents(event) {
    //broadcasted sync events go to all clients, also the sender. for this example it's mostly irrelevant,
    //but for others it might be necessary to filter out your own messages (or have different behavior)
    //by checking if the sender is the own client.
    console.log("Getting message")
    let fromClient = event.payload.fromClient.id;
    console.log(fromClient)
    TS.clients.isMe(fromClient).then((isMe) => {
        if (!isMe) {
            console.log(event)
            const parsedMessage = JSON.parse(event.payload.str); // Parse the message payload
            // Route the parsed message to the appropriate handler
            handleIncomingMessage(parsedMessage, fromClient);
        }

    });
}






function getPlayerData() {
    console.log(document.getElementById('spellSaveDc').textContent)
    return {
        characterName: document.getElementById('playerCharacterInput').textContent,
        hp: {
            current: document.getElementById('currentCharacterHP').textContent,
            max: document.getElementById('maxCharacterHP').textContent
        },
        ac: document.getElementById('AC').textContent,
        passivePerception: document.getElementById('passivePerception').textContent,
        spellSave: document.getElementById('spellSaveDc').textContent
    };
}


// Default handler for unknown message types
function defaultHandler(message) {
    console.warn("Unknown message type received:", message.type);
}

// Master function to route incoming messages based on type
function handleIncomingMessage(parsedMessage, FromClient) {
    const handler = messageHandlers[parsedMessage.type] || defaultHandler;
    handler(parsedMessage, FromClient);
}



// Handle a request for player info (e.g., name, HP, AC, etc.)
function handleRequestInfo(message, FromClient) {
    const requestId = message.requestId; // Unique ID to correlate responses
    const requestedFields = message.data.request;

    const playerData = getPlayerData(); // Assume getPlayerData returns player info

    // Build the response data based on requested fields
    const responseData = {};
    requestedFields.forEach(field => {
        responseData[field] = playerData[field];
    });

    // Send the response message back
    const responseMessage = {
        type: 'request-stats',
        requestId,
        data: responseData
    };

    TS.sync.send(JSON.stringify(responseMessage), FromClient).catch(console.error);
    console.log("Responded to request for player info:", responseData);
}



// Handle a request to update health (e.g., from dice roll or effect)
function handleUpdateHealth(message, FromClient) {
    const { change, hpType } = message.data; // hpType could be 'current', 'max', etc.

    // Assume playerData is a globally accessible object representing the player
    if (hpType === 'current') {
        playerData.hp.current = Math.max(0, playerData.hp.current + change);
    } else if (hpType === 'max') {
        playerData.hp.max = Math.max(0, playerData.hp.max + change);
    }

    console.log("Health updated. Current HP:", playerData.hp.current, "Max HP:", playerData.hp.max);
}




// Handle a dice roll request (e.g., to roll for an attack or check)
function handleRollDice(message, FromClient) {
    const { numDice, diceSides } = message.data;
    const diceResults = rollDice(numDice, diceSides); // Assume rollDice is defined elsewhere

    // Send the result back
    const responseMessage = {
        type: 'roll-result',
        requestId: message.requestId,
        data: { diceResults }
    };

    TS.sync.send(JSON.stringify(responseMessage), FromClient).catch(console.error);
    console.log("Rolled dice:", diceResults);
}




// Handle a target selection request (e.g., for combat)
function handleTargetSelection(message, FromClient) {
    const { targetId } = message.data;

    // Set the player's target
    playerData.targetId = targetId;

    console.log("Target set to:", targetId);
}


async function getGMClient(){

    const myFragment = await TS.clients.whoAmI();
    const allClients = await TS.clients.getClientsInThisBoard();

    const otherClients = allClients.filter(player => player.id !== myFragment.id);

    let myGM; // Variable to hold the GM's information

    // Loop through other clients and find the GM
    for (const client of otherClients) {
        // Get more info for the current client
        const clientInfo = await TS.clients.getMoreInfo([client]);
        
        console.log(clientInfo)
        
        if (clientInfo && clientInfo[0].clientMode === "gm") { 
            myGM = clientInfo;
            return  myGM
        }
    }

    if (!myGM) {
        console.error("GM not found.");
        return; // Exit if GM is not found
    }

}

async function sendDMUpdatedStats() {
    // Construct the message object with player stats
    myGM = getGMClient()

    console.log(myGM)
    const playerStats = getPlayerData();

    // Construct the message object with player stats
    const message = {
        type: 'request-stats', // Message type
        data: {
            characterName: playerStats.characterName || playerStats.name, // Use characterName or name
            hp: {
                current: playerStats.hp.current.toString(), // Ensure current HP is a string
                max: playerStats.hp.max.toString() // Ensure max HP is a string
            },
            ac: playerStats.ac.toString(), // Ensure AC is a string
            passivePerception: playerStats.passivePerception.toString(), // Ensure passive perception is a string
            spellSave: playerStats.spellSave.toString() // Ensure spell save is a string
        }
    };

    // Send the message
    TS.sync.send(JSON.stringify(message), myGM[0].id).catch(console.error);
}


async function sendDMInitiativeResults(totalInitiative){

    myGM = getGMClient()

    const message = {
        type: 'update-init', // Message type
        data: {
            Initiative: totalInitiative
        }
    };

    TS.sync.send(JSON.stringify(message), myGM[0].id).catch(console.error);
}




function handleInitiativeResult(resultGroup) {
    console.log("Handling initiative result:", resultGroup);

    // Extract the results from the initiative result group
    const operands = resultGroup.result.operands;

    let totalInitiative = 0;
    
    // Loop through each operand to compute the total initiative value
    for (const operand of operands) {
        if (operand.kind === "d20" && operand.results) {
            // Sum up the d20 results
            totalInitiative += operand.results.reduce((sum, roll) => sum + roll, 0);
        } else if (operand.value) {
            // Add static values
            totalInitiative += operand.value;
        }
    }

    // Output or process the total initiative value
    console.log("Total Initiative Value:", totalInitiative);

    sendDMInitiativeResults(totalInitiative)
}