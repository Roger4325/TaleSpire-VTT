
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


//ConditionsMap is the map of conditions that can be set onto the player. This is used for tracking conditions.
const conditionsMap = new Map();


async function playerSetUP(){

    //Adding event listeners to the toggle buttons for Adv and Disadv
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });


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
        const extractedNumber = parseButtonText(inputValue);
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
        }
        updateContent();
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
    addToggleDropdownListener(dropdownBtn, dropdownContent);


    // const actionTableRows = document.querySelectorAll('.actionTable tbody tr');
    // actionTableRows.forEach((row) => {
    //     // row.addEventListener('blur', updateContent());
    // });

    // attaching eventlisteners for the Actions Table Ability Select Dropdown.
    attachAbilityDropdownListeners();

    // Call updateAllToHitDice on load
    updateAllToHitDice();
    addProficiencyButtonListener()
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
        updateSkillModifier()
        updateSaveModifier()
        updateAllToHitDice();
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
}





//handling damage and healing a character
const healButton = document.getElementById("healButton");
const damageButton = document.getElementById("damageButton");
const currentCharacterHP = document.getElementById("currentCharacterHP");
const maxCharacterHP = document.getElementById("maxCharacterHP");
const tempHP = document.getElementById("tempHP");
const healthInput = document.getElementById("healthInput");

function healCreature(healingAmount) {
    const currentHPValue = parseInt(currentCharacterHP.textContent);

    if (healingAmount > 0) {
        currentCharacterHP.textContent = currentHPValue + healingAmount;
    }
    updateContent()
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
}






//Proficiency toggle interaction Add click event listener to each button
function addProficiencyButtonListener() {
    const proficiencyButtons = document.querySelectorAll(".proficiencyButtons button");
    
    proficiencyButtons.forEach(button => {
        if (!button.hasProficiencyButtonListener) {
            button.dataset.currentLevel = 0; // Set the initial current level as a data attribute

            button.addEventListener("click", function () {
                let currentLevel = parseInt(button.dataset.currentLevel, 10);
                updateProficiency(button, currentLevel, true);
                updateSkillModifier();
                updateSaveModifier();
                updateToHitDice(button);
                updateContent();
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
    document.getElementById("passivePerception").textContent = getSkillValue('Perception');
    document.getElementById("passiveInvestigation").textContent = getSkillValue('Investigation');
    document.getElementById("passiveInsight").textContent = getSkillValue('Insight');

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
            });

            // Set a flag indicating that the event listener is added
            dropdownBtn.hasEventListener = true;

            // Call the function to generate checkboxes
            generateCheckboxes(dropdownContent, checkboxData);

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

function toggleAdditionalInfo() {
    let container = document.getElementById("additionalInfoContainer");


    // Toggle the 'active' class to trigger the transition effect
    container.classList.toggle("active");

    if (container.classList.contains("active")) {
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
}




// Function to update toHitDice based on the selected ability stat
function updateToHitDice(proficiencyButton) {

    
    // Get the associated  row for the proficiency button
    const row = proficiencyButton.closest('tr');

    // Find the toHitDice button in the same row
    const toHitDiceButton = row.querySelector('.actionButton.skillbuttonstyler');

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
            const toHitDiceValue = abilityScoreValue + (proficiencyBonus * proficiencyValue);

            // Update the toHitDice button text content and value
            toHitDiceButton.textContent = "+" + toHitDiceValue;

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
function generateCheckboxes(checkboxContainer, checkboxData, tyrnData) {
    // Check if checkboxes are already present in the container

    const existingCheckboxes = checkboxContainer.getElementsByClassName('category-checkbox');

    if (existingCheckboxes.length === 0) {
        // If no checkboxes are found, add them
        checkboxData.forEach(item => {
            const checkboxLabel = document.createElement('label');
            const checkboxInput = document.createElement('input');
            
            // Set the checkbox attributes
            checkboxInput.type = 'checkbox';
            checkboxInput.className = 'category-checkbox';
            checkboxInput.dataset.category = item.category;
            
            const ninthColumnData = tyrnData?.actionTable?.[0]?.[1]?.ninthColumn;

            if (ninthColumnData && ninthColumnData[item.category]) {
                checkboxInput.checked = true;
            }

            // Set the label text
            checkboxLabel.textContent = item.label;
            
            // Append the checkbox to the container
            checkboxLabel.appendChild(checkboxInput);
            checkboxContainer.appendChild(checkboxLabel);
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
   const rowIndex = tableBody.children.length; // Current number of rows
   const proficiencyButtons = newRow.querySelectorAll('.actionProficiencyButton');
   proficiencyButtons.forEach(button => {
       const newProficiencyId = 'proficiencyActionButton' + rowIndex;
       button.id = newProficiencyId;
   });

    // Append the new row to the table body
    tableBody.appendChild(newRow);

    // Get the dropdown button and content for the new row
    const dropdownBtn = newRow.querySelector('.dropbtn');
    const dropdownContent = newRow.querySelector('.dropdown-content');

    // Add the event listener only if it hasn't been added before
    newRow.addEventListener('blur', getAllEditableContent());
    addToggleDropdownListener(dropdownBtn, dropdownContent);
    attachAbilityDropdownListeners();
    addProficiencyButtonListener()
    rollableButtons()
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
    proficiencyButtons.forEach((button, index) => {
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


    // Assuming you want to use 'characterName' as the unique identifier for the 'character' data type
    saveToGlobalStorage("characters", characterName.value, content, true);

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
        const eighthColumnCell = row.querySelector('td:nth-child(8)');

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
            rowData['eighthColumn'] = eighthColumnCell.textContent.trim();
        }

        
        // Save the selected options from checkboxes in the ninth column
        const ninthColumnCell = row.querySelector('.dropdown-content');
        if (ninthColumnCell) {
            const checkboxes = ninthColumnCell.querySelectorAll('input[type="checkbox"]');

            console.log('%cChecking checkboxes for row ' + (index + 1), 'color: red'); // Log that we are checking checkboxes for the current row

            const ninthColumnData = {};

            checkboxes.forEach(checkbox => {
                const category = checkbox.dataset.category;
                if (category) {
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
    characterNameElement.value = characterName; // Adjust based on your actual property names
    characterTempHpElement.value = characterData.characterTempHp;

    // Update other content-editable elements
    for (const property in characterData) {
        if (characterData.hasOwnProperty(property) && property !== "characterName" && property !== "characterTempHp" && property !== "conditions") {
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

// Load and update character data
function loadAndDisplayCharacter(characterName) {
    const dataType = "characters"; // Adjust based on your data structure

    console.log(characterName)
    loadDataFromGlobalStorage(dataType)
        .then((allCharactersData) => {
            const tyrnData = allCharactersData[characterName];

            if (tyrnData) {
                updateCharacterUI(tyrnData, characterName);
                // generateCheckboxes(checkboxContainer, checkboxData, tyrnData)
            } else {
                console.error("Tyrn's data not found.");
                // Handle the case where Tyrn's data is not found, e.g., show a message to the user
            }
        })
        .catch((error) => {
            console.error("Error loading character data:", error);
            // Handle the error appropriately, e.g., show an error message to the user
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
            nameCell.textContent = row.secondColumn;
            newRow.appendChild(nameCell);

            // Set up reach/range (editable)
            const reachCell = document.createElement('td');
            reachCell.contentEditable = "true";
            reachCell.textContent = row.thirdColumn;
            newRow.appendChild(reachCell);

            // Set up ToHit label and button
            const toHitCell = document.createElement('td');
            const toHitLabel = document.createElement('label');
            toHitLabel.className = "actionButtonLabel";
            toHitLabel.setAttribute('value', row.fourthColumn || "5");
            toHitLabel.setAttribute('data-dice-type', "1d20");
            toHitLabel.setAttribute('data-name', "toHitButton");

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
            damageLabel.setAttribute('data-name', row.secondColumn || "default"); // Use action name as data-name attribute

            const damageButton = document.createElement('button');
            damageButton.className = "actionButton damageDiceButton skillbuttonstyler";
            damageButton.textContent = row.fifthColumn & findAbilityScoreLabel(row.seventhColumn).getAttribute('value')|| "2d6+4d4+5"; // Default value if empty
            damageCell.appendChild(damageLabel);
            damageCell.appendChild(damageButton);
            newRow.appendChild(damageCell);
            
            // Create and append the content for the sixth column
            const columnSixCell = createColumnSixContent(row);
            newRow.appendChild(columnSixCell);


            // Set the data-category attribute based on the selected checkboxes
            const checkboxes = row["ninthColumn"];
            const selectedCategories = Object.keys(checkboxes).filter(key => checkboxes[key]);
            newRow.setAttribute('data-category', selectedCategories.join(' '));

            // Append the row to the table body
            tableBody.appendChild(newRow);
        }
    });

    calculateActionDamageDice()
}

// Helper function to create column six. The settings menu on the Action table.
function createColumnSixContent(rowData) {
    // Extract the required data
    const ability = rowData["seventhColumn"];  // For the ability dropdown
    const checkboxes = rowData["ninthColumn"]; // For the checkboxes

    // Create the outer td element
    const td = document.createElement('td');

    // Create the 'Action Setting' button
    const button = document.createElement('button');
    button.className = "nonRollButton rowSetting";
    button.setAttribute("onclick", "toggleAdditionalInfo()");
    button.innerText = "Action Setting";

    // Create the additional info container
    const additionalInfoContainer = document.createElement('div');
    additionalInfoContainer.id = "additionalInfoContainer";
    additionalInfoContainer.className = "additional-info-container";

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = "close-button";
    closeButton.setAttribute("onclick", "toggleAdditionalInfo()");
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
    propertiesDiv.innerText = "Heavy, Two-Handed"; // Hardcoded example, replace as needed
    additionalInfoContainer.appendChild(propertiesDiv);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.contentEditable = "true";
    descriptionDiv.innerText = "A brightly Colored Maul"; // Hardcoded example, replace as needed
    additionalInfoContainer.appendChild(descriptionDiv);

    // Dropdown for the checkboxes
    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = "dropdown";
    const dropbtn = document.createElement('button');
    dropbtn.className = "dropbtn";
    dropbtn.innerText = "Set";
    dropdownDiv.appendChild(dropbtn);

    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = "checkboxContainer";
    checkboxContainer.className = "dropdown-content";

    generateCheckboxes(checkboxContainer, checkboxData, { actionTable: [{ 1: { ninthColumn: checkboxes } }] });

    dropdownDiv.appendChild(checkboxContainer);
    additionalInfoContainer.appendChild(dropdownDiv);

    // Magic Bonus input
    const magicBonusDiv = document.createElement('div');
    const magicBonusInput = document.createElement('input');
    magicBonusInput.placeholder = "Magic Bonus";
    magicBonusDiv.appendChild(magicBonusInput);
    additionalInfoContainer.appendChild(magicBonusDiv);

    // Append the button and the additional info container to the td
    td.appendChild(button);
    td.appendChild(additionalInfoContainer);

    return td;
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


        if (damageLabel && damageButton && abilityDropdown) {
            // Get the selected ability from the dropdown
            const selectedAbility = abilityDropdown.value;

            // Find the corresponding ability modifier using the provided function
            const abilityScoreLabel = findAbilityScoreLabel(selectedAbility).getAttribute('value');

            damageLabel.setAttribute ('value', abilityScoreLabel)

            console.log(abilityScoreLabel)
            console.log(damageLabel.getAttribute('data-dice-type'))

            if (abilityScoreLabel > 0){
                damageButton.textContent = damageLabel.getAttribute('data-dice-type') + "+" + abilityScoreLabel
            }
            else if (abilityScoreLabel < 0){
                damageButton.textContent = damageLabel.getAttribute('data-dice-type') + abilityScoreLabel
            }
            else{
                damageButton.textContent = damageLabel.getAttribute('data-dice-type')
            }

            

            console.log(damageButton.textContent)
            
        }
    });
}
