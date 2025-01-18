
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

let isMe;

//Define all message Types and the functions they should call this should be expanded as I need different types of messages. 
const messageHandlers = {
    'request-info': handleRequestInfo,
    'update-health': handleUpdateHealth,
    'roll-dice': handleRollDice,
    'target-selection': handleTargetSelection,
    'player-init-list': createPlayerInit,
    'player-init-turn': handleInitTurn,
    'player-init-round': handleInitRound
};



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

let baseAC = 10; // Default base AC
let equippedArmor = null; // No armor equipped by default
let equippedShield = null; // No shield equipped by default

let playerWeaponProficiency = [];
let playerArmorProficiency = [];
let playerLanguageProficiency = [];
let playerToolsProficiency = [];

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

    // Event listener for the select box for the character alignment. 
    const alignmentSelect = document.getElementById('alignment-select');

    alignmentSelect.addEventListener('change', function() {
        updateContent()
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
    shortRestButton.addEventListener("click", openShortRestModal);
    longRestButton.addEventListener("click", openLongRestModal);
    hitDiceOpenModalButton.addEventListener("click", openHitDiceModal);

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

    // Select the anchor element
    const featuresLink = document.querySelector('a[href="#features"]');
    featuresLink.addEventListener('click', function() {
        resizeAllTextareas()
    });


    const initLink = document.querySelector('a[href="#Init"]');
    initLink.addEventListener('click', function() {
        resizeAllTextareas()
    });




    //adding event listener to the different proficiency types so that we can select different types of proficiency. 
    const proficiencySettings = document.querySelectorAll('.proficiency-settings');
    proficiencySettings.forEach(function(icon) {
        icon.addEventListener('click', function(event) {
            console.log("click");
    
            // Find the corresponding dropdown by navigating from the clicked icon
            const parentGroup = event.target.closest('.proficiency-group'); // Get the closest proficiency group
            const dropdown = parentGroup.querySelector('.proficiency-dropdown'); // Find the dropdown inside the same group
    
            // Close any open dropdowns
            const openDropdowns = document.querySelectorAll('.proficiency-dropdown[style="display: block;"]');
            openDropdowns.forEach(function(openDropdown) {
                // Close the dropdowns except the one we're about to toggle
                if (openDropdown !== dropdown) {
                    openDropdown.style.display = 'none';
                }
            });
    
            // Toggle visibility of the clicked dropdown
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });
    
    // Add an event listener to the document to close the dropdown if clicked outside
    document.addEventListener('click', function(event) {
        const openDropdown = document.querySelector('.proficiency-dropdown[style="display: block;"]'); // Find the dropdown that's open
    
        // If there's an open dropdown and the click is outside the dropdown or its cog icon, close it
        if (openDropdown && !openDropdown.contains(event.target) && !event.target.closest('.proficiency-settings')) {
            openDropdown.style.display = 'none';
        }
    });

    const allCheckboxes = document.querySelectorAll('.proficiency-dropdown input[type="checkbox"]');
    allCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            const parentGroup = checkbox.closest('.proficiency-group'); // Find the closest group to determine the category

            if (parentGroup.querySelector('h3 span').textContent === 'Weapons') {
                updateProficiencyArray(checkbox, playerWeaponProficiency);
            } else if (parentGroup.querySelector('h3 span').textContent === 'Armor') {
                updateProficiencyArray(checkbox, playerArmorProficiency);
            } else if (parentGroup.querySelector('h3 span').textContent === 'Languages') {
                updateProficiencyArray(checkbox, playerLanguageProficiency);
                console.log('Languages Proficiency:', playerLanguageProficiency);
            } else if (parentGroup.querySelector('h3 span').textContent === 'Tools') {
                updateProficiencyArray(checkbox, playerToolsProficiency);
            }
            updateProficiencyContainers();
        });
    });


    document.getElementById('closeItemCard').addEventListener('click', () => {
        hideNotesPanel()
    });


    const currencyInputs = document.querySelectorAll('.currency-input');

    currencyInputs.forEach(input => {
        // Ensure the value is formatted on blur
        input.addEventListener('blur', () => {
            const value = input.value.replace(/,/g, '');
            if (!isNaN(value) && value !== '') {
                input.value = formatWithCommas(value); // Format and update input
                updateContent()
            }
        });
    });    

    isMe = await TS.players.whoAmI()

    sendDMUpdatedStatsDebounced()
}  

// Function to format numbers with commas
function formatWithCommas(number) {
    return Number(number).toLocaleString('en-US');
}


function updateProficiencyArray(checkbox, proficiencyArray) {
    const itemLabel = checkbox.parentNode.textContent.trim(); // Get the label text

    if (checkbox.checked) {
        // Add the item if it's checked and not already in the array
        if (!proficiencyArray.includes(itemLabel)) {
            proficiencyArray.push(itemLabel);
        }
    } else {
        // Remove the item if it's unchecked
        const index = proficiencyArray.indexOf(itemLabel);
        if (index > -1) {
            proficiencyArray.splice(index, 1);
        }
    }
}



function updateProficiencyContainers() {
    // Select the containers
    const weaponsContainer = document.querySelector('#weaponsContainer');
    const armorContainer = document.querySelector('#armorContainer');
    const languageContainer = document.querySelector('#languageContainer');
    const toolsContainer = document.querySelector('#toolsContainer');

    // Helper function to update container content
    function updateContainer(container, array) {
        if (array.length > 0) {
            container.textContent = array.join(', ');
        } else {
            container.textContent = '';
        }
    }

    // Update each container with its respective proficiency array
    updateContainer(weaponsContainer, playerWeaponProficiency);
    updateContainer(armorContainer, playerArmorProficiency);
    updateContainer(languageContainer, playerLanguageProficiency);
    updateContainer(toolsContainer, playerToolsProficiency);
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
}

let initialHitDiceValue = "1d8"; // Default value, adjust as needed

function updateHitDiceLabel() {
    // Get the content from the button and split it to separate the dice count and type
    const hitDiceLabel = document.getElementById("hitDiceLabel");
    const hitDiceText = hitDiceButton.innerText.trim();
    
    // Update regex to match a valid dice pattern with only valid dice types
    const dicePattern = /^(\d+)d(4|6|8|10|12|20)$/;
    const match = hitDiceText.match(dicePattern);

    if (match) {
        const diceCount = parseInt(match[1], 10);  // Extract the number before "d" and convert to integer
        const maxDiceCount = parseInt(hitDiceLabel.getAttribute("max"), 10);  // Retrieve the max attribute from the label
        const currentHitDice = parseInt(hitDiceLabel.textContent.trim(), 10);

        // Check if the dice count exceeds the max allowed
        if (diceCount > maxDiceCount) {
            showErrorModal(`Invalid input: Dice count cannot exceed ${maxDiceCount} (current level).`);
            hitDiceButton.innerText = initialHitDiceValue;  // Restore previous value
        } 
        else if (diceCount > currentHitDice) {
            showErrorModal(`Invalid input: Dice count cannot exceed ${currentHitDice} (remaining hit dice).`);
            hitDiceButton.innerText = initialHitDiceValue;  // Restore previous value
        }
        else {
            // Update label with the valid dice count and type
            hitDiceLabel.setAttribute("data-dice-type", hitDiceText);
        }
    } else {
        // Show error modal and revert to initial value
        showErrorModal("Invalid input: Please enter a valid dice format like '5d6'.");
        hitDiceButton.innerText = initialHitDiceValue;  // Restore previous value
    }
    updateHitDiceValue()
    updateHitDiceMax()
}

function removeRolledHitDice() {
    console.log("remove hit dice")
    const hitDiceLabel = document.getElementById("hitDiceLabel");
    const hitDiceButton = document.getElementById("hitDiceButton");

    // Get the current number of available hit dice from the text content
    let currentHitDice = parseInt(hitDiceLabel.textContent.trim(), 10);

    const diceType = hitDiceLabel.getAttribute("data-dice-type");
    const diceCountMatch = diceType.match(/^(\d+)d/);
    const diceCount = parseInt(diceCountMatch[1], 10);
    console.log(diceCountMatch)

    // Check if currentHitDice is a valid number and greater than 0
    if (!isNaN(currentHitDice) && currentHitDice > 0) {

        currentHitDice -= diceCount;

        // Update the label text content
        hitDiceLabel.textContent = currentHitDice > 0 ? currentHitDice : 0; // Avoid negative numbers

        const diceSuffix = diceType.match(/d\d+/)[0];  // This matches "d8", "d10", etc.

        if (currentHitDice < diceCount) {
            console.log("update button text.")
            hitDiceButton.textContent = `${currentHitDice}${diceSuffix}`;
        }
    }
    updateContent()
}

function addHalfHitDiceOnRest() {
    const hitDiceLabel = document.getElementById("hitDiceLabel");

    // Get the current number of available hit dice from the text content
    let currentHitDice = parseInt(hitDiceLabel.textContent.trim(), 10);
    let maxHitDice = parseInt(hitDiceLabel.getAttribute('max'))
    
    console.log(maxHitDice)

    // Check if currentHitDice is a valid number
    if (!isNaN(currentHitDice)) {
        console.log("here")
        // Add back half of the used hit dice (rounded down) but no less than 1
        let hitDiceToAdd = Math.max(Math.floor(maxHitDice / 2), 1);

        let newHitDice = currentHitDice + hitDiceToAdd

        if (newHitDice > maxHitDice) {
            hitDiceLabel.textContent = maxHitDice
        }
        else{
            hitDiceLabel.textContent = newHitDice
        }
    }
    updateContent()
}

// Function to update max hit dice based on character level
function updateHitDiceMax() {
    console.log("updating hit dice max.")
    const characterLevel = document.getElementById("characterLevel");
    const hitDiceLabel = document.getElementById("hitDiceLabel");
    // Parse the level value from the character level element
    const level = parseInt(characterLevel.innerText.trim(), 10);

    // Check if level is a valid number greater than zero
    if (!isNaN(level) && level > 0) {
        // Set the max attribute on hitDiceLabel to the character level
        hitDiceLabel.setAttribute("max", level);
    } else {
        showErrorModal("Invalid level: Please enter a valid level number.");
    }
}

// Function to update the hit dice value with the Constitution modifier
function updateHitDiceValue() {
    const constitutionScore = document.getElementById("constitutionScore");
    const hitDiceLabel = document.getElementById("hitDiceLabel");

    // Parse the Constitution score and calculate modifier
    const conScore = parseInt(constitutionScore.innerText.trim(), 10);
    if (!isNaN(conScore)) {
        const conModifier = calculateAbilityModifier(conScore);

        // Extract the number of dice (x in xdy) from the data-dice-type attribute
        const diceType = hitDiceLabel.getAttribute("data-dice-type");
        const diceCountMatch = diceType.match(/^(\d+)d/);

        if (diceCountMatch) {
            const diceCount = parseInt(diceCountMatch[1], 10);
            const totalModifier = conModifier * diceCount;

            // Update the value attribute and label text with the calculated modifier
            hitDiceLabel.setAttribute("value", totalModifier);
        } else {
            showErrorModal("Invalid dice format in data-dice-type.");
        }
    } else {
        showErrorModal("Invalid Constitution score: Please enter a valid number.");
    }
}




// Function to update AC
function updateAC() {
    let finalAC;

    const AcDiv = document.getElementById('AC')

    const dexLabel = findAbilityScoreLabel("DEX");
    const dexScore = parseInt(dexLabel.getAttribute("value"), 10);
    let shieldMod = equippedShield ? equippedShield.armor_class.base || 0 : 0;

    if (equippedArmor) {
        // Use equipped armor's base AC and apply Dex mod up to the limit
        let effectiveDexMod = 0;
        if (equippedArmor.armor_class.dex_bonus === true){
            effectiveDexMod = equippedArmor.armor_class.max_bonus || dexScore;
        }
        else{
        }
        finalAC = equippedArmor.armor_class.base + effectiveDexMod + shieldMod;
    } else {
        // Use base AC and full Dex modifier if no armor is equipped
        finalAC = baseAC + dexScore + shieldMod ;
    }

    // Add AC bonuses from characterStatBonuses
    const acBonuses = characterStatBonuses.combatStats.AC.bonuses || [];
    const acBonusTotal = acBonuses.reduce((total, bonus) => total + bonus.value, 0);
    finalAC += acBonusTotal;

    // Update the AC display

    AcDiv.textContent = finalAC

    sendDMUpdatedStatsDebounced()
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
    updateHitDiceMax()
    updateAdjustmentValues()


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
        updateAdjustmentValues()
        updateSkillModifier();
        updateSaveModifier();
        updateAllToHitDice();
        updateAllSpellDCs();
        updateAllSpellDamageDice();
        updateSpellDCHeader()
        updateHitDiceValue()
        updateAC();
        


        const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
        updateSpelltoHitDice(spellCastingAbility)
        
    }
}



function addBonus(category, key, value) {

    console.log(value.value)

    if (typeof value.value === "string") {
        console.log("This is a string:", value.value);
        const abilityScoreLabel = findAbilityScoreLabel(value.value);
        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;
        value.value = abilityScoreValue;

        console.log("Updated value with modifier:", value.value);
    } else {
        console.log("This is not a string, it's a number or something else:", value.value);
    }

    if (characterStatBonuses[category] && characterStatBonuses[category][key]) {
        characterStatBonuses[category][key].bonuses.push(value);
        updateDerivedStats(category); // Call a category-specific update function
        console.log(characterStatBonuses)
    } else {
        console.error(`Invalid category or key: ${category} -> ${key}`);
    }
}

function removeBonus(category, key, value) {

    if (typeof value.value === "string") {
        console.log("This is a string:", value.value);
        const abilityScoreLabel = findAbilityScoreLabel(value.value);
        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;
        value.value = abilityScoreValue;

        console.log("Updated value with modifier:", value.value);
    } else {
        console.log("This is not a string, it's a number or something else:", value.value);
    }
    if (characterStatBonuses[category] && characterStatBonuses[category][key]) {
        const bonuses = characterStatBonuses[category][key].bonuses;

        // Find the index of the bonus object by matching its properties
        const index = bonuses.findIndex(
            (bonus) => bonus.source === value.source && bonus.value === value.value
        );

        if (index !== -1) {
            bonuses.splice(index, 1);
            updateDerivedStats(category); // Call a category-specific update function
        } else {
            console.warn(`Bonus not found for removal:`, value);
        }
    } else {
        console.error(`Invalid category or key: ${category} -> ${key}`);
    }
}

// Helper function to update stats for specific categories
function updateDerivedStats(category) {
    switch (category) {
        case "senses":
            updatePassives(); // Recalculate senses-related stats
            break;
        case "skills":
            updateSkillModifier(); 
            break;
        case "saves":
            updateSaveModifier();
            break;
        case "attributes":
            // updateAttributes();
            break;
        case "combatStats":
            updateCombatStats();
            break;
        case "otherTraits":
            updateTraits(); // Custom function for miscellaneous traits
            break;
        default:
            console.error(`Unknown category: ${category}`);
    }
}

function updateCombatStats(){
    updateAC()
    updateAllSpellDamageDice();
    updateAllToHitDice();
    calculateActionDamageDice();
    updateAllSpellDCs();
    updateSpellDCHeader();
    const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
    updateSpelltoHitDice(spellCastingAbility)
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



function playerConditions(condition) {
    const conditionSelect = document.getElementById('condition-select');
    let selectedCondition
    let selectedConditionText
    if (condition){
        selectedCondition = condition.value;
        selectedConditionText = condition.text;
    }
    else {
        selectedCondition = conditionSelect.value;
    
        // Get the text content of the selected option
        selectedConditionText = conditionSelect.options[conditionSelect.selectedIndex].textContent;
    }

    if (selectedCondition) {
        const conditionTrackerDiv = document.getElementById('conditionTracker');

        // Ensure `conditionsMap` has an entry for this div
        if (!conditionsMap.has(conditionTrackerDiv)) {
            conditionsMap.set(conditionTrackerDiv, new Set());
        }

        // Get the Set of conditions for this div
        const conditionsSet = conditionsMap.get(conditionTrackerDiv);

        // Helper function to extract the text and value of a condition
        const extractConditionText = (conditionElement) => {
            const span = conditionElement.querySelector('span');
            if (span) {
                return {
                    text: span.textContent.trim(), // e.g., "Aid 1"
                    value: span.getAttribute('value') // e.g., "Aid"
                };
            }
            return null;
        };

        // Populate the conditions set with the current conditions in the tracker
        const pills = conditionTrackerDiv.querySelectorAll('.condition-pill');
        conditionsSet.clear(); // Clear any pre-existing conditions

        pills.forEach((pill) => {
            const condition = extractConditionText(pill);
            if (condition) {
                conditionsSet.add(condition); // Add the condition object to the Set
            }
        });

        const levelBasedConditions = ['Exhaustion', 'Aid'];
        let conditionLevel 
        if (levelBasedConditions.includes(selectedCondition)) {
            // Find the highest level number for the selected condition and increment it
            
            const match = selectedConditionText.match(/^(.*?)(\d+)$/); // Match text before and the number at the end
            const baseText = match ? match[1].trim() : selectedConditionText; // First part before the number
            const number = match ? parseInt(match[2]) : 1; // Extracted number (if present)
            conditionLevel = number;

            for (const condition of conditionsSet) {
                if (condition.value === selectedCondition) {
                    // Extract the level from the `text` property
                    const match = condition.text.match(/(\d+)$/); // Match the number at the end
                    const number = match ? parseInt(match[1]) : 0;
                    if (!isNaN(number) && number >= conditionLevel) {
                        conditionLevel = number + 1;
                    }
                }
            }
        
            // Update the condition text to include the level
            selectedConditionText = `${baseText} ${conditionLevel}`;
        
            // Remove all existing conditions of the same type (e.g., "Exhaustion")
            for (const condition of [...conditionsSet]) {
                if (condition.value === selectedCondition) {
                    conditionsSet.delete(condition);
                    removeConditionPill(condition.text); // Use `text` to identify the pill
                }
            }
        

        } else if ([...conditionsSet].some(condition => condition.value === selectedCondition)) {
            // If the selected condition is already in the Set, don't add it again
            return;
        }

        // Create a condition pill
        const conditionPill = document.createElement('div');
        conditionPill.classList.add('condition-pill');
        conditionPill.innerHTML = `
            <span value="${selectedCondition}">${selectedConditionText}</span>
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
        let tooltip
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
            for (const condition of [...conditionsSet]) {
                if (condition.text === selectedConditionText && condition.value === selectedCondition) {
                    conditionsSet.delete(condition);
                    break; // Stop after deleting the matching condition
                }
            }
            removeConditionPill(selectedConditionText);

            if (tooltip) {
                tooltip.style.opacity = 0;
                setTimeout(() => tooltip.remove(), 200);
            }
        });

        // Add the condition to the Set and the condition pill to the container
        conditionsSet.add({ text: selectedConditionText, value: selectedCondition });
        const conditionPillsContainer = document.getElementById('conditionTracker');
        conditionPillsContainer.appendChild(conditionPill);
        calculateActionDamageDice()
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
    calculateActionDamageDice()
    updateContent();
}



function shortRest() {
    // Implement the logic for a short rest here
    gatherAllTraitsToReset("short rest",true)
}

// Function for long rest
function longRest() {
    // Implement the logic for a long rest here
    const maxHPValue = parseInt(maxCharacterHP.textContent);

    // Call the healCreature function with the max HP as the healing amount
    gatherAllTraitsToReset("long rest",true)
    gatherAllTraitsToReset("short rest",true)
    healCreature(maxHPValue);
    resetSpellSlots()
    addHalfHitDiceOnRest()
    document.getElementById("tempHP").value = 0;
    
}

function openLongRestModal() {
    // Calculate changes for the long rest
    const maxHPValue = parseInt(maxCharacterHP.textContent);
    const currentHPValue = parseInt(currentCharacterHP.textContent);
    const tempHP = document.getElementById("tempHP").value

    const healthRestored = maxHPValue - currentHPValue;

    const spellSlotsResetInfo = gatherSpellSlotsToReset(); // Get reset info without resetting yet

    let resetDetails = '';
    for (const [level, count] of Object.entries(spellSlotsResetInfo)) {
        resetDetails += `${level}: ${count} slots reset.<br>`;
    }

    const hitDiceLabel = document.getElementById("hitDiceLabel");

    // Get the current number of available hit dice from the text content
    let currentHitDice = parseInt(hitDiceLabel.textContent.trim(), 10);
    let maxHitDice = parseInt(hitDiceLabel.getAttribute('max'))
    let hitDiceToAdd

    // Check if currentHitDice is a valid number
    if (!isNaN(currentHitDice)) {
        console.log("here")
        // Add back half of the used hit dice (rounded down) but no less than 1
        hitDiceToAdd = Math.max(Math.floor(maxHitDice / 2), 1);
    }

    const longTraitsToReset = gatherAllTraitsToReset("long rest");
    
    let longResetTraitDetails = '';

    // Loop through each group of traits to reset
    longTraitsToReset.forEach(group => {       
        // Loop through each trait in the current group
        group.traitsToReset.forEach(trait => {
            // Add the trait name and the max uses to the reset details
            longResetTraitDetails += `${trait.name} (reseting up to ${trait.maxUses} uses)<br>`;
        });
        // Add a line break after each group for clarity
        longResetTraitDetails += '<br>';
    });

    const shortTraitsToReset = gatherAllTraitsToReset("short rest");
    
    let shortResetTraitDetails = '';

    // Loop through each group of traits to reset
    shortTraitsToReset.forEach(group => {       
        // Loop through each trait in the current group
        group.traitsToReset.forEach(trait => {
            // Add the trait name and the max uses to the reset details
            shortResetTraitDetails += `${trait.name} (reseting up to ${trait.maxUses} uses)<br>`;
        });
        // Add a line break after each group for clarity
        shortResetTraitDetails += '<br>';
    });

    // Populate the modal content
    document.getElementById("longRestHPChange").textContent = `HP Restored: ${healthRestored}`;
    document.getElementById("longRestTempHPChange").textContent =`Removing Temp HP: ${tempHP} `
    document.getElementById("longRestSpellSlots").innerHTML = resetDetails || "No used spell slots to reset.";
    document.getElementById("longRestHitDice").textContent =`Adding up to: ${hitDiceToAdd} Hit Dice`
    document.getElementById("longRestFeatures&Traits").innerHTML =`<strong><br>Traits to reset:</strong><br>${longResetTraitDetails}`;
    document.getElementById("shortRestinLongFeatures&Traits").innerHTML =`<strong><br>Traits to reset:</strong><br>${shortResetTraitDetails}`;



    // Display the modal
    document.getElementById("longRestModal").classList.remove("hidden");
}

function closeLongRestModal() {
    document.getElementById("longRestModal").classList.add("hidden");
}

// Attach event listeners to modal buttons
document.getElementById("confirmLongRestButton").addEventListener("click", () => {
    longRest();
    closeLongRestModal();
});

document.getElementById("cancelLongRestButton").addEventListener("click", closeLongRestModal);


function openShortRestModal() {
    // Calculate changes for the short rest

    const traitsToReset = gatherAllTraitsToReset("short rest");
    
    let resetTraitDetails = '';

    // Loop through each group of traits to reset
    traitsToReset.forEach(group => {       
        // Loop through each trait in the current group
        group.traitsToReset.forEach(trait => {
            // Add the trait name and the max uses to the reset details
            resetTraitDetails += `${trait.name} (reseting up to ${trait.maxUses} uses)<br>`;
        });
        // Add a line break after each group for clarity
        resetTraitDetails += '<br>';
    });

    // Populate the modal content
    document.getElementById("shortRestFeatures&Traits").innerHTML =`<strong><br>Traits to reset:</strong><br>${resetTraitDetails}`;



    // Display the modal
    document.getElementById("shortRestModal").classList.remove("hidden");
}

function closeshortRestModal() {
    document.getElementById("shortRestModal").classList.add("hidden");
}

// Attach event listeners to modal buttons
document.getElementById("confirmshortRestButton").addEventListener("click", () => {
    shortRest();
    closeshortRestModal();
});

document.getElementById("cancelshortRestButton").addEventListener("click", closeshortRestModal);




//Features and Traits reseting checkboxes on long or short rest. 
//This function is used to gather all reset boxes so that you can tell the user what will be reset prior to them confirming. 

// Loop through all groups and gather traits to reset
function gatherAllTraitsToReset(resetType, reset = false) {
    const groups = document.querySelectorAll('.group-container');
    const allResetData = [];

    groups.forEach(group => {
        if (reset === false){
            const resetDataForGroup = gatherTraitsToReset(group, resetType);
            if(resetDataForGroup.length > 0){
                allResetData.push({
                    groupName: group.querySelector('.group-title').value || 'Unnamed Group',
                    traitsToReset: resetDataForGroup,
                });
            }
            else{
                console.log("nothing to reset in this group.")
            }
        }else if (reset === true){
            resetTraits(group, resetType);
        }else{

        }
    });

    return allResetData;
}

// Function to gather traits based on the selected reset type
function gatherTraitsToReset(groupContainer, resetType) {
    const traits = groupContainer.querySelectorAll('.trait-item');
    const resetData = [];

    traits.forEach(trait => {
        const resetDropdown = trait.querySelector('.reset-type-dropdown');
        const traitName = trait.querySelector('.trait-name').value || 'Unnamed Trait';
        const usesInput = trait.querySelector('.trait-uses-input');

        // Only reset for the selected reset type
        if (resetType === resetDropdown.value) {
            // Gather data for long rest reset
            resetData.push({
                name: traitName,
                maxUses: parseInt(usesInput.value, 10) || 0,
            });
        }
    });

    return resetData;
}

// Function to gather traits based on the selected reset type
function resetTraits(groupContainer, resetType) {
    const traits = groupContainer.querySelectorAll('.trait-item');
    const resetData = [];

    traits.forEach(trait => {
        const resetDropdown = trait.querySelector('.reset-type-dropdown');

        // Only reset for the selected reset type
        if (resetType === resetDropdown.value) {
            // Gather data for long rest reset
            const checkboxes = trait.querySelectorAll('.trait-checkbox-main');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false; 
            });
        }
    });

    return resetData;
}






function openHitDiceModal() {

    updateHitDiceMax()

    const hitDiceButton = document.getElementById('hitDiceButton');
    const diceText = hitDiceButton.textContent; // This is in the format "1d8"
    
    // Extract the number of dice and the dice size from the label
    const [diceCount, diceSize] = diceText.split('d');
    
    // Set the number of dice and the dice size input
    const diceCountInput = document.getElementById('diceCountInput');
    const diceSizeInput = document.getElementById('diceSizeInput');
    
    // Set the values of the inputs based on the hitDiceLabel
    diceCountInput.value = parseInt(diceCount, 10); // Set the number of dice
    diceSizeInput.value = diceSize; // Set the dice size


    hitDiceButton.addEventListener("focus", () => {
        initialHitDiceValue = hitDiceButton.innerText.trim();
    });

    // Add an event listener to update the label when the button content is edited
    hitDiceButton.addEventListener("blur", updateHitDiceLabel);

    // Function to update the button content
    function updateHitDiceButton() {
        // Get the current number of dice and dice size
        const diceCount = parseInt(diceCountInput.value, 10);
        const diceSize = diceSizeInput.value;

        // Update the button text (formatted as number of dice + size)
        hitDiceButton.textContent = `${diceCount}d${diceSize}`;
        updateHitDiceLabel()
    }

    // Event listeners for the inputs
    diceCountInput.addEventListener('input', updateHitDiceButton);
    diceSizeInput.addEventListener('change', updateHitDiceButton);

    updateHitDiceButton()


    // Display the modal
    document.getElementById("hitDiceModal").classList.remove("hidden");
}

function closeHitDiceModal() {
    document.getElementById("hitDiceModal").classList.add("hidden");
}

// Attach event listeners to modal buttons
document.getElementById("confirmHitDiceButton").addEventListener("click", () => {
    const hitDiceButton = document.getElementById("hitDiceButton");
    hitDiceButton.click();
    closeHitDiceModal();
});

document.getElementById("cancelHitDiceButton").addEventListener("click", closeHitDiceModal);




//handling damage and healing a character
const healButton = document.getElementById("healButton");
const damageButton = document.getElementById("damageButton");
const currentCharacterHP = document.getElementById("currentCharacterHP");
const maxCharacterHP = document.getElementById("maxCharacterHP");
const tempHP = document.getElementById("tempHP");
const healthInput = document.getElementById("healthInput");

// Function to handle Enter key and blur the input field
function handleEnterBlur(event) {
    if (event.key === "Enter") {
        event.target.blur();
    }
}

// Add event listeners for the Enter key
currentCharacterHP.addEventListener("keydown", handleEnterBlur);
maxCharacterHP.addEventListener("keydown", handleEnterBlur);
tempHP.addEventListener("keydown", handleEnterBlur);

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
    sendDMUpdatedStatsDebounced()
}

// Function to damage the creature by a specific amount
function damageCreature() {
    const currentHPValue = parseInt(currentCharacterHP.textContent);
    const tempHPValue = parseInt(tempHP.value);
    const damageAmount = parseInt(healthInput.value);
    console.log(damageAmount)

    if (damageAmount > 0) {

        let conditionsSet

        conditionTrackerDiv = document.getElementById('conditionTracker');

        const conditionSpans = conditionTrackerDiv.querySelectorAll('.condition-pill span');

        conditionsSet = new Set();
        // Create a map of condition values
        conditionSpans.forEach(span => {
            const value = span.getAttribute('value');
            if (value) {
                conditionsSet.add(value)
            }
        });
        
        if (conditionsSet) {
            if (conditionsSet.has('Concentration')) {
                const dc = Math.max(10, Math.ceil(damageAmount / 2));
                showErrorModal(`Roll a Con save. <br> DC: ${dc}`, 3000);
            }
        }
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
    sendDMUpdatedStatsDebounced()
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


// calculate and update the skill modifier based on ability modifier, proficiency level, and bonuses
function updateSkillModifier() {
    const skillRows = document.querySelectorAll('.skill-row');

    skillRows.forEach(skillRow => {
        const abilityModElement = skillRow.querySelector('.abilityMod');
        const proficiencyButton = skillRow.querySelector('.proficiencyButtons button');
        const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);
        const abilityMod = abilityModElement.textContent.trim();

        // Find the associated ability score label without using :is selector
        const abilityScoreLabel = findAbilityScoreLabel(abilityMod);
        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

        const skillNameElement = skillRow.querySelector('.skillName');
        const skillName = skillNameElement.textContent.trim();

        // Start with the base skill modifier (ability mod + proficiency)
        let skillModifier = Math.floor(abilityScoreValue + (proficiencyBonus * parseFloat(proficiencyButton.value)));

        // Check for individual skill bonuses
        if (characterStatBonuses.skills && characterStatBonuses.skills[skillName]) {
            characterStatBonuses.skills[skillName].bonuses.forEach(bonus => {
                skillModifier += bonus.value;  // Apply each bonus to the skill modifier
            });
        }

        // Check for global 'ALL' bonuses that apply to all skills
        if (characterStatBonuses.skills && characterStatBonuses.skills.All) {
            characterStatBonuses.skills.All.bonuses.forEach(bonus => {
                skillModifier += bonus.value;  // Apply each global bonus to the skill modifier
            });
        }

        // Update the skill button and label with the new skill modifier
        const skillButton = abilityModElement.parentElement.querySelector('.actionButton.skillbuttonstyler');
        const skillLabel = abilityModElement.parentElement.querySelector('.actionButtonLabel');
        
        skillButton.textContent = skillModifier > 0 ? `+${skillModifier}` : `${skillModifier}`;
        skillLabel.setAttribute('value', skillModifier);
    });

    updatePassives();  // Call this function to update any passive abilities if needed
    updateInitiative()
}

function updateInitiative() {
    const initiativeButton = document.getElementById('initiativeButton');
    const initiativeLabel = document.querySelector('.actionButtonLabel[for="initiativeButton"]');
    
    // Get Dexterity modifier
    const dexLabel = findAbilityScoreLabel("DEX");
    const dexScore = parseInt(dexLabel.getAttribute("value"), 10);

    // Get any initiative bonuses (e.g., magical items or abilities)
    let initiativeBonus = 0;

    // Check for individual skill bonuses
    if (characterStatBonuses.skills && characterStatBonuses.skills.Initiative) {
        characterStatBonuses.skills.Initiative.bonuses.forEach(bonus => {
            initiativeBonus += bonus.value;  // Apply each bonus to the skill modifier
        });
    }

    // Check for global 'ALL' bonuses that apply to all skills
    if (characterStatBonuses.skills && characterStatBonuses.skills.All) {
        characterStatBonuses.skills.All.bonuses.forEach(bonus => {
            initiativeBonus += bonus.value;  // Apply each global bonus to the skill modifier
        });
    }
    
    // Calculate total initiative modifier
    const initiativeModifier = dexScore + initiativeBonus;

    // Update the label and button text with the new initiative modifier
    initiativeLabel.setAttribute('value', initiativeModifier);
    initiativeButton.textContent = initiativeModifier > 0 ? `+${initiativeModifier}` : `${initiativeModifier}`;
}



function updateSaveModifier() {
    const saveRows = document.querySelectorAll('.saves-row');

    // Get the "All" saving throw bonus (if any)
    const allSavesBonus = characterStatBonuses.saves.All?.bonuses.reduce((total, bonus) => total + bonus.value, 0) || 0;

    saveRows.forEach(saveRow => {
        const saveNameElement = saveRow.querySelector('.saveName');
        const proficiencyButton = saveRow.querySelector('.proficiencyButtons button');
        const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);
        const abilityMod = saveNameElement.getAttribute('value');;

        const abilityScoreLabel = findAbilityScoreLabel(abilityMod);
        const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

        // Get magical bonuses for this specific saving throw (if any)
        const saveBonuses = characterStatBonuses.saves[abilityMod]?.bonuses || [];
        const magicalBonusTotal = saveBonuses.reduce((total, bonus) => total + bonus.value, 0);

        // Calculate total save modifier, including the global "All" saves bonus
        const saveModifier = Math.floor(
            abilityScoreValue + (proficiencyBonus * parseFloat(proficiencyButton.value)) + magicalBonusTotal + allSavesBonus
        );

        const saveButton = saveNameElement.parentElement.querySelector('.actionButton.skillbuttonstyler');
        const saveLabel = saveNameElement.parentElement.querySelector('.actionButtonLabel');

        // Update the UI
        saveButton.textContent = saveModifier > 0 ? `+${saveModifier}` : `${saveModifier}`;
        saveLabel.setAttribute('value', saveModifier);
    });
}


function findAbilityScoreLabel(abilityMod) {

    // Define a dictionary that maps language-specific abbreviations to the English abbreviation
    const abbreviationMap = {
        "fue": "STR", // Spanish strength
        "des": "DEX", // Spanish dexterity
        "con": "CON", // Spanish constitution
        "int": "INT", // Spanish intelligence
        "sab": "WIS", // Spanish wisdom
        "car": "CHA", // Spanish charisma
        // Add more language-specific abbreviations as necessary
    };

    // Normalize the input to lowercase and lookup in the map to get the English abbreviation
    const englishAbilityMod = abbreviationMap[abilityMod.toLowerCase()] || abilityMod.toUpperCase();

    // Iterate over ability boxes and find the matching one based on the English ability modifier
    const abilityScores = document.getElementById("playerAbilityScores");
    const abilityBoxes = abilityScores.querySelectorAll('.abilitybox');
    for (const abilityBox of abilityBoxes) {
        const abilityScoreLabel = abilityBox.querySelector('.actionButtonLabel');
        const abilityScoreLabelAttribute = abilityScoreLabel.getAttribute('data-ability');
        if (abilityScoreLabelAttribute === englishAbilityMod) {
            return abilityScoreLabel;
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
        const currentSkillName = skillRow.querySelector('.skillName').getAttribute('data-name');

        if (currentSkillName === skillName) {
            const label = skillRow.querySelector('.actionButtonLabel');
            return label.getAttribute('value');
        }
    }

    // Return null or handle the case when the skill is not found
    return null;
}

function updatePassives() {
    const passivePerceptionBase = parseInt(getSkillValue('Perception')) + 10;
    const passivePerceptionBonus = characterStatBonuses.senses.PassivePerception.bonuses
        .reduce((total, bonus) => total + bonus.value, 0);
    document.getElementById("passivePerception").textContent = passivePerceptionBase + passivePerceptionBonus;

    const passiveInvestigationBase = parseInt(getSkillValue('Investigation')) + 10;
    const passiveInvestigationBonus = characterStatBonuses.senses.PassiveInvestigation.bonuses
        .reduce((total, bonus) => total + bonus.value, 0);
    document.getElementById("passiveInvestigation").textContent = passiveInvestigationBase + passiveInvestigationBonus;

    const passiveInsightBase = parseInt(getSkillValue('Insight')) + 10;
    const passiveInsightBonus = characterStatBonuses.senses.PassiveInsight.bonuses
        .reduce((total, bonus) => total + bonus.value, 0);
    document.getElementById("passiveInsight").textContent = passiveInsightBase + passiveInsightBonus;
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

        let rangedAttackRollsBonus = 0;

        const weaponTypeSelect = row.querySelector('.weapon-type-dropdown-select');
        const selectedWeaponType = weaponTypeSelect ? weaponTypeSelect.value : null;

        if (selectedWeaponType === "Ranged"){
            rangedAttackRollsBonus = characterStatBonuses.combatStats.RangedAttackRolls.bonuses.reduce((total, bonus) => total + bonus.value, 0);
        }

        // Find the associated ability score label without using :is selector
        const abilityScoreLabel = findAbilityScoreLabel(selectedAbility);

        if (abilityScoreLabel) {
            // Calculate the ability score value
            const abilityScoreValue = parseInt(abilityScoreLabel.getAttribute('value')) || 0;

            // Get the current proficiency level and value from the row
            const proficiencyValue = parseInt(row.querySelector('.proficiencyButtons button').value);


            // Add proficiency bonus to toHitDiceValue
            const proficiencyBonus = parseInt(document.getElementById('profBonus').textContent);
            const toHitDiceValue = abilityScoreValue + (proficiencyBonus * proficiencyValue) + magicBonus + rangedAttackRollsBonus;

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








//Saving and loading Content

// Function to get all editable content including proficiency levels, Temp HP, 
function getAllEditableContent() {
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    const characterName = document.getElementById("playerCharacterInput");
    const characterTempHp = document.getElementById("tempHP");
    const proficiencyButtons = document.querySelectorAll(".proficiencyButtons button");
    const currentHitDice = document.getElementById("hitDiceLabel");

    const content = {};

    // Add specific elements to the content object
    content['characterTempHp'] = characterTempHp.value;
    content['currentHitDice'] = currentHitDice.textContent;

    content['playerWeaponProficiency'] = [...playerWeaponProficiency];
    content['playerArmorProficiency'] = [...playerArmorProficiency];
    content['playerLanguageProficiency'] = [...playerLanguageProficiency];
    content['playerToolsProficiency'] = [...playerToolsProficiency];

    // Add other content-editable elements to the content object
    editableElements.forEach((element) => {
        const id = element.id;
        const value = element.innerText;
        content[id] = value;
    });

    // Add proficiency levels to the content object
    proficiencyButtons.forEach((button) => {
        content[button.id] = parseFloat(button.value);
    });

    // Add conditions into the content to be saved
    const conditionTrackerDiv = document.getElementById('conditionTracker');
    if (conditionsMap.has(conditionTrackerDiv)) {
        const conditionsSet = conditionsMap.get(conditionTrackerDiv);
        content['conditions'] = Array.from(conditionsSet);
    } else {
        content['conditions'] = [];
    }

    // Add coins to the content object
    const coinTypes = ['cp', 'sp', 'ep', 'gp', 'pp']; // Define coin types
    const coins = {};

    coinTypes.forEach(coin => {
        const coinInput = document.getElementById(`${coin}-input`);
        if (coinInput) {
            coins[coin] = parseInt(coinInput.value.replace(/,/g, ''), 10) || 0; // Save as a number
        }
    });



    content['coins'] = coins; // Add coins object to content

    const characterAlignment = document.getElementById('alignment-select');
    content['alignment'] = characterAlignment.value; // Save the selected alignment

    // Call the function to process action table rows and update the content object
    const actionTableData = processActionTableRow();
    content['actionTable'] = actionTableData;

    const spellData = processSpellData();
    content['spellData'] = spellData;

    const inventoryData = saveInventory()
    content['inventoryData'] = inventoryData

    // Save group and trait data
    const groupTraitData = processGroupTraitData();
    content['groupTraitData'] = groupTraitData;

    const notesData = processNotesGroupData();
    content['groupNotesData'] = notesData;
    

    // Assuming you want to use 'characterName' as the unique identifier for the 'character' data type
    saveToCampaignStorage("characters", characterName.textContent, content, true);

    return content;
}



function updateCoinsInFields(coins) {
    const coinTypes = ['cp', 'sp', 'ep', 'gp', 'pp']; // Define coin types

    coinTypes.forEach(coin => {
        const coinInput = document.getElementById(`${coin}-input`);
        if (coinInput && coins) {
            
                const value = coins[coin] || 0; // Get the value for the coin, default to 0
                coinInput.value = formatWithCommas(value); // Format with commas before displaying
        }
    });
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
        let fifthColumnCell = row.querySelector('td:nth-child(5) label.actionButtonLabel');
        if (fifthColumnCell){
            fifthColumnCell = fifthColumnCell.getAttribute('data-dice-type');
        }
        const sixthColumnCell = row.querySelector('td:nth-child(6)');
        const seventhColumnCell = row.querySelector('.ability-dropdown');
        const weaponTypeCell = row.querySelector('.weapon-type-dropdown-select');
        const eighthColumnCell = row.querySelector('.magic-bonus-weapon');
        const damageBonusCell = row.querySelector('.damage-bonus-weapon');
        const tenthColumnCell = row.querySelector('.actionDescriptiveText01');
        const elventhColumnCell = row.querySelector('.actionDescriptiveText02');
        const twelvethColumnCell = row.querySelector('.damage-type');
        const inventoryId = row.getAttribute('data-item-id')

        if (secondColumnCell) {
            rowData['secondColumn'] = secondColumnCell.textContent.trim();
        }

        if(inventoryId){
            rowData['itemId'] = inventoryId;
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

        if (weaponTypeCell){
            rowData['weaponType'] = weaponTypeCell.value;
        }

        if (eighthColumnCell) {
            rowData['eighthColumn'] = eighthColumnCell.value;
        }
        if (damageBonusCell) {
            rowData['damageBonus'] = damageBonusCell.value;
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



// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Original updateContent function with debounce
const debouncedGetAllEditableContent = debounce(() => {
    const allEditableContent = getAllEditableContent();
}, 1000); // Adjust the debounce delay as necessary (e.g., 300ms)


// Function to update content whenever a change occurs
function updateContent() {
    debouncedGetAllEditableContent();
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
    const characterAlignment = document.getElementById('alignment-select');
    const characterTempHpElement = document.getElementById("tempHP");
    const currentHitDice = document.getElementById("hitDiceLabel");

    // Update UI elements
    characterNameElement.textContent = characterName; 
    characterAlignment.value = characterData.alignment; 
    characterTempHpElement.value = characterData.characterTempHp;
    currentHitDice.textContent = characterData.currentHitDice;

    const characterInit = document.getElementById("initiativeButton");
    const characterInitLabel = document.querySelector(`.playerStats label[for="initiativeButton"]`);
    characterInit.textContent = characterData.initiativeButton
    characterInitLabel.setAttribute('value', characterData.initiativeButton.replace("+", ""));

    // Update other content-editable elements
    for (const property in characterData) {
        if (characterData.hasOwnProperty(property) && property !== "characterName" && property !== "characterTempHp"  && property !== "currentHitDice" && property !== "conditions" && property !== "initiativeButton") {
            const element = document.getElementById(property);
            if (element) {
                element.innerText = characterData[property];
            }
        }
    }

    function loadProficiencies(proficiencyArray, containerSelector, dropdownSelector, characterDataKey) {
        if (characterData[characterDataKey]) {
            const checkboxes = document.querySelectorAll(`${dropdownSelector} input[type="checkbox"]`);
            
            checkboxes.forEach((checkbox) => {
                // Check if the checkbox ID is in the saved data
                checkbox.checked = characterData[characterDataKey].includes(checkbox.id);
                
                if (checkbox.checked) {
                    // Add the checked checkbox's label text to the array
                    const itemLabel = checkbox.parentNode.textContent.trim();
                    if (!proficiencyArray.includes(itemLabel)) {
                        proficiencyArray.push(itemLabel);
                    }
                }
            });
    
            // Update the corresponding container with the loaded proficiencies
            const container = document.querySelector(containerSelector);
            container.textContent = proficiencyArray.join(', ');
        }
    }
    
    

    updateProficiencyButtons(characterData, skillProficiencyLevels, savesProficiencyLevels);
    const characterLevel = parseInt(characterData.characterLevel);
    document.getElementById('characterLevel').textContent = characterLevel;

    // Calculate and set proficiency bonus
    const { proficiencyBonus } = calculateLevelFromXp(calculateXPFromLevel(characterLevel));
    document.getElementById('profBonus').textContent = proficiencyBonus;

    

    loadProficiencies(playerWeaponProficiency, '#weaponsContainer', '#weapons-dropdown', 'playerWeaponProficiency');
    loadProficiencies(playerArmorProficiency, '#armorContainer', '#armor-dropdown', 'playerArmorProficiency');
    loadProficiencies(playerLanguageProficiency, '#languageContainer', '#languages-dropdown', 'playerLanguageProficiency');
    loadProficiencies(playerToolsProficiency, '#toolsContainer', '#tools-dropdown', 'playerToolsProficiency');
    updateCoinsInFields(characterData.coins);
    
    updateAbilityScoreModifiers(characterData);
    
    updateActionTableUI(characterData.actionTable);
    loadInventoryData(characterData.inventoryData);
    loadSpellData(characterData.spellData);
    loadGroupTraitData(characterData.groupTraitData);
    loadNotesGroupData(characterData.groupNotesData);
    
    loadAndSetLanguage()
    updateAdjustmentValues()

    // Update conditions UI
    const conditionsSet = new Set(characterData.conditions);
    // Populate conditions based on conditionsSet
    conditionsSet.forEach((condition) => {
        playerConditions(condition)
    });
}

async function loadAndSetLanguage(){
    setLanguage(savedLanguage);
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


async function loadAndPickaCharacter() {
    // Step 1: Load all characters from global storage
    const dataType = "characters";
    const allCharactersData = await loadDataFromCampaignStorage(dataType);

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
                updateActionTableUI()
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
    const characterKey = document.getElementById("customCharacterSelect").value;
    const overlay = document.createElement('div');
    overlay.classList.add('character-overlay');
    document.body.appendChild(overlay);
    confirmDeleteCharacter(characterKey, overlay)

});

function confirmDeleteCharacter(characterName, overlay) {
    // Remove existing confirmation modal if it exists
    const existingConfirmModal = document.querySelector('.confirm-modal');
    if (existingConfirmModal) {
        existingConfirmModal.parentNode.removeChild(existingConfirmModal);
    }

    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirm-modal');

    const message = document.createElement('p');
    message.innerHTML = `Are you sure you want to delete <strong>${characterName}</strong> ? <br>This action cannot be undone.`;
    confirmModal.appendChild(message);


    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('confirm-modal-button-div');
    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Yes, Delete';
    confirmButton.classList.add('confirm-button');

    confirmButton.addEventListener('click', () => {
        console.log(`Deleting character: ${characterName}`);
        removeFromCampaignStorage("characters", characterName); // Add your removal logic here
        // document.body.removeChild(confirmModal);
        document.body.removeChild(overlay); // Close overlay after deletion
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('cancel-button');

    cancelButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    buttonDiv.appendChild(confirmButton);
    buttonDiv.appendChild(cancelButton);
    confirmModal.appendChild(buttonDiv);
    overlay.appendChild(confirmModal);
}








function magicBonusInputListeners() {
    const magicBonusListeners = document.querySelectorAll('.magic-bonus-weapon');

    const damageBonusListeners = document.querySelectorAll('.damage-bonus-weapon');

    magicBonusListeners.forEach((listener) => {
        // Listen for blur and keydown events
        listener.addEventListener('blur', handletoHitBlur);
        listener.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default behavior of Enter key
                listener.blur(); // Trigger blur event manually
            }
        });
    });

    // Handle the blur event
    function handletoHitBlur(event) {
        console.log("Event triggered");
        calculateActionDamageDice();
        updateAllToHitDice();
        updateContent()
    }

    damageBonusListeners.forEach((listener) => {
        // Listen for blur and keydown events
        listener.addEventListener('blur', handleDamageBlur);
        listener.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent the default behavior of Enter key
                listener.blur(); // Trigger blur event manually
            }
        });
    });

    
    function handleDamageBlur(event) {
        console.log("Event triggered");
        calculateActionDamageDice();
        updateAllToHitDice();
        updateContent()
    }
}

function damageBonusInputListeners() {
    const magicBonusListeners = document.querySelectorAll('.damage-bonus-weapon');

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








//This function creates rows for the action section. If no row data exists it creates a default one otherwise it takes the data and creats the row with that data.
//This can be done when equipping items or when equipping spells. Specifically only cantrips. 
//This is also where the data is converted from the save file on load to create all saved action rows. This will link with a Unique ID from the action list or the spell list. 
function updateActionTableUI(actionTableData, newActionTableData) {
    const tableBody = document.getElementById('actionTableBody');

    if (!actionTableData || actionTableData.length === 0) {
        if (!newActionTableData || newActionTableData.length === 0) {
            // Find the active subtab
            const activeSubtab = document.querySelector('.actionsubtab.active');
            const selectedCategory = activeSubtab ? activeSubtab.getAttribute('data-category') : 'all';
    
            actionTableData = [
                {
                    "1": {
                        "proficiencyButton": "1",
                        "secondColumn": "Maul of Fire",
                        "thirdColumn": "5ft",
                        "fourthColumn": "+5",
                        "fifthColumn": "2d6/1d4",
                        "sixthColumn": "ActionSettings",
                        "seventhColumn": "STR",
                        "eighthColumn": "",
                        "tenthColumn": "Heavy, Two-Handed",
                        "elventhColumn": "A brightly Colored Maul",
                        "twelvethColumn": "",
                        "ninthColumn": {
                            "attacks": selectedCategory === 'attacks',
                            "actions": selectedCategory === 'actions',
                            "bonus-actions": selectedCategory === 'bonus-actions',
                            "reactions": selectedCategory === 'reactions',
                            "other": selectedCategory === 'other'
                        }
                    }
                }
            ];
    
            // Handle 'all' category: reset all flags to false
            if (selectedCategory === 'all') {
                actionTableData[0]["1"].ninthColumn = {
                    "attacks": false,
                    "actions": false,
                    "bonus-actions": false,
                    "reactions": false,
                    "other": false
                };
            }
        } else {
            actionTableData = newActionTableData;
        }   
        
    }
    else{
        tableBody.innerHTML = '';
    }

    // Loop through the action table data and create rows
    actionTableData.forEach((rowData) => {
        for (const rowIndex in rowData) {
            const row = rowData[rowIndex];
            const newRow = document.createElement('tr');

            newRow.setAttribute('data-item-id', row.itemId || ''); // Add item identifier

            const currentRowIndex = tableBody.children.length + 1; // Current number of rows + 1

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
            damageLabel.setAttribute('data-name', "Piercing default" || "default"); 
            
            
            const damageButton = document.createElement('button');
            damageButton.className = "actionButton damageDiceButton skillbuttonstyler";
            damageButton.textContent = row.fifthColumn & findAbilityScoreLabel(row.seventhColumn).getAttribute('value')|| "2d6+4d4+5"; // Default value if empty
            damageCell.appendChild(damageLabel);
            damageCell.appendChild(damageButton);
            newRow.appendChild(damageCell);

            // Create a context menu
            const contextMenu = document.createElement('div');
            contextMenu.className = 'custom-context-menu';
            document.body.appendChild(contextMenu);

            


            // Right-click event on damageButton
            damageButton.addEventListener('contextmenu', (event) => {
                event.preventDefault();

                contextMenu.innerHTML =''

                // Add Crit button to the context menu
                const critButton = document.createElement('button');
                critButton.className = 'crit-button actionButton skillbuttonstyler';

                // Duplicate the label and text from the damageButton with doubled dice
                const damageDiceText = row.fifthColumn;
                const doubledDiceText = damageDiceText.replace(/(\d+)d(\d+)/g, (match, rolls, sides) => `${rolls * 2}d${sides}`);

                // Set the doubled dice text for the Crit button
                critButton.textContent = "crit";

                // Duplicate the label for the Crit button
                const critLabel = document.createElement('label');
                critLabel.className = "actionButtonLabel damageDiceButton";
                critLabel.setAttribute('value', damageLabel.getAttribute('value') || "0");
                critLabel.setAttribute('data-dice-type', doubledDiceText);
                critLabel.setAttribute('data-name', damageLabel.getAttribute('data-name'));

                // Add both the Crit label and button to the context menu
                contextMenu.appendChild(critLabel);
                contextMenu.appendChild(critButton);

                // Position and display the context menu
                contextMenu.style.left = `${event.pageX}px`;
                contextMenu.style.top = `${event.pageY}px`;
                contextMenu.style.display = 'block';
                rollableButtons()
            });

            

            // Hide context menu when the mouse leaves it
            contextMenu.addEventListener('mouseleave', () => {
                contextMenu.style.display = 'none';
            });

            // Hide context menu on clicking elsewhere
            document.addEventListener('click', () => {
                contextMenu.style.display = 'none';
            });
            
            // Create and append the content for the sixth column
            const columnSixCell = createColumnSixContent(row, currentRowIndex, newRow);
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
            dropdownContent.setAttribute('id', 'checkboxContainer' + (currentRowIndex-1));
            addToggleDropdownListener(dropdownBtn, dropdownContent, newRow);

            generateCheckboxes(checkboxes, newRow);

            
            
        }
    });

    calculateActionDamageDice()
    magicBonusInputListeners()
    damageBonusInputListeners()
    actionTableEventListenerSetup()
    attachAbilityDropdownListeners()
    addProficiencyButtonListener()
    rollableButtons()
    addBlurAndEnterListenersToDamageTypes();
    updateAllDamageButtonDataNames()
    updateAllToHitDice()
}

// Helper function to create column six. The settings menu on the Action table.
function createColumnSixContent(rowData, rowIndex, newRow) {

    // Extract the required data
    const ability = rowData["seventhColumn"];  // For the ability dropdown
    const weaponType = rowData["weaponType"];  // For the ability dropdown


    // Create the outer td element
    const td = document.createElement('td');

    // Create the 'Action Setting' button
    const button = document.createElement('button');
    button.className = "nonRollButton rowSetting";
    button.setAttribute("onclick", `toggleAdditionalInfo('additionalInfoContainer${rowIndex}')`);
    button.innerText = "i";

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

    // Ability dropdown
    const weaponTypeContainer = document.createElement('div');
    weaponTypeContainer.className = "weapon-type-container";
    const weaponTypeDropdown = document.createElement('div');
    weaponTypeDropdown.className = "weapon-type-dropdown";
    const weaponTypeSelect = document.createElement('select');
    weaponTypeSelect.className = "weapon-type-dropdown-select";
    const weaponTypeSelectOptions = ["Melee", "Ranged", "Magic"];

    weaponTypeSelectOptions.forEach(ab => {
        const option = document.createElement('option');
        option.value = ab;
        option.innerText = ab;
        if (ab === weaponType) {
            option.selected = true;
        }
        weaponTypeSelect.appendChild(option);
    });

    abilityStatDropdown.appendChild(select);
    abilityStatsContainer.appendChild(abilityStatDropdown);
    additionalInfoContainer.appendChild(abilityStatsContainer);

    weaponTypeDropdown.appendChild(weaponTypeSelect);
    weaponTypeContainer.appendChild(weaponTypeDropdown);
    additionalInfoContainer.appendChild(weaponTypeContainer);


    weaponTypeSelect.addEventListener('change', function () {
        updateContent();
        calculateActionDamageDice()
    });

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
    magicBonusInput.placeholder = "To Hit Bonus";
    magicBonusDiv.textContent = "To Hit Bonus : ";
    magicBonusInput.classList.add('magic-bonus-weapon');
    magicBonusInput.value = rowData["eighthColumn"];
    magicBonusDiv.appendChild(magicBonusInput);
    additionalInfoContainer.appendChild(magicBonusDiv);

    const damageBonusDiv = document.createElement('div');
    const damageBonusInput = document.createElement('input');
    damageBonusInput.placeholder = "Damage Bonus";
    damageBonusDiv.textContent = "Damage Mod : ";
    damageBonusInput.classList.add('damage-bonus-weapon');
    damageBonusInput.value = rowData["damageBonus"] ?? "";
    damageBonusDiv.appendChild(damageBonusInput);
    additionalInfoContainer.appendChild(damageBonusDiv);

    // Create the damage dice input field
    const damageDiceInput = createDamageDiceInput(rowIndex);
    additionalInfoContainer.appendChild(damageDiceInput);

    const damageTypeDiv = document.createElement('div');
    const damageTypeInput = document.createElement('input');
    damageTypeInput.placeholder = "Damage Type";
    damageTypeDiv.textContent = "Damage Type : ";
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
        const damageBonusInput = row.querySelector('.damage-bonus-weapon');

        const weaponTypeSelect = row.querySelector('.weapon-type-dropdown-select');
        const selectedWeaponType = weaponTypeSelect ? weaponTypeSelect.value : null;

        let damageBonus
        if(damageBonusInput){
            damageBonus = parseInt(damageBonusInput.value) || 0;
        } 

        let rageDamageBonus = 0
        let conditionsSet

        conditionTrackerDiv = document.getElementById('conditionTracker');

        const conditionSpans = conditionTrackerDiv.querySelectorAll('.condition-pill span');

        conditionsSet = new Set();
        // Create a map of condition values
        conditionSpans.forEach(span => {
            const value = span.getAttribute('value');
            if (value) {
                conditionsSet.add(value)
            }
        });
        
        if (conditionsSet) {
            if (conditionsSet.has('Raging') && selectedWeaponType === "Melee" && abilityDropdown.value === "STR") {        
                    rageDamageBonus = characterStatBonuses.combatStats.RageDamageBonus.bonuses.reduce((total, bonus) => total + bonus.value, 0);
            }
        }

        let rangedDamageRollsBonus = 0;

        if (selectedWeaponType === "Ranged"){
            rangedDamageRollsBonus = characterStatBonuses.combatStats.RangedDamageRolls.bonuses.reduce((total, bonus) => total + bonus.value, 0);
        }


        if (damageLabel && damageButton && abilityDropdown) {
            // Get the selected ability from the dropdown
            const selectedAbility = abilityDropdown.value;

            // Find the corresponding ability modifier using the provided function
            const abilityScoreLabel = parseInt(findAbilityScoreLabel(selectedAbility).getAttribute('value')) + damageBonus + rageDamageBonus + rangedDamageRollsBonus;

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
    div.textContent ="Damage Dice : "

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
    deleteButton.className = 'removeButton nonRollButton';
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










//Spell Section

function resetSpellSlots(){
    const spellSlots = document.querySelectorAll('.spell-slot');

    spellSlots.forEach(slot =>{
        slot.textContent = '';
        slot.classList.remove('used');
    });
}

function gatherSpellSlotsToReset() {
    const spellGroups = document.querySelectorAll('.spell-group'); // Select all spell groups
    const resetInfo = {}; // Object to store the count of reset slots by level

    // Loop through all spell groups
    spellGroups.forEach(group => {
        const spellLevel = group.getAttribute('spelllevel'); // Get the spell level from the attribute
        const slotContainer = group.querySelector('.spell-slots'); // Locate the spell slots container

        if (slotContainer) {
            const usedSlots = slotContainer.querySelectorAll('.spell-slot.used'); // Find all used slots
            const usedCount = usedSlots.length;

            if (usedCount > 0) {
                resetInfo[spellLevel] = usedCount; // Add to the reset info object
            }
        }
    });

    return resetInfo; // Return the reset information
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

function createSpellTable(spellLevel) {
    const table = document.createElement('table');
    table.classList.add('spell-table');

    const headerRow = document.createElement('tr');
    headerRow.classList.add('spell-row', 'spell-header');
    headerRow.id = `${spellLevel}-spell-header`;

    // Define the headers and assign IDs with the spell level prefix
    const headers = [
        { text: 'Spell Name', id: `${spellLevel}SpellNameHeader` },
        { text: 'Time', id: `${spellLevel}TimeHeader` },
        { text: 'Hit/DC', id: `${spellLevel}HitDCHeader` },
        { text: 'Dice', id: `${spellLevel}DiceHeader` },
        { text: 'Con', id: `${spellLevel}ConcentrationHeader` },
        { text: 'Notes', id: `${spellLevel}NotesHeader` },
        { text: 'Del', id: `${spellLevel}DeleteHeader` }
    ];

    headers.forEach(({ text, id }) => {
        const headerCell = document.createElement('th');
        headerCell.classList.add('spell-header-cell');
        headerCell.textContent = text;
        headerCell.id = id;  // Unique ID with spell level prefix
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

    console.log(spell)

    let spellPreparedButton

    if (parseInt(spellLevel.charAt(0)) >= 1){
        spellPreparedButton = document.createElement('button');
        spellPreparedButton.classList.add('spell-prepared-button')
        const preparedValue = spell.prepared ? spell.prepared : '0';
        spellPreparedButton.setAttribute('value', preparedValue);
    }
    else{
        console.log("no")
        console.log(spellLevel)
    }
    


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

    if(spellPreparedButton){
        spellPreparedButton.addEventListener('click', () => {
            // Get the current value and toggle between '0' and '1'
            const currentValue = spellPreparedButton.getAttribute('value');
            const newValue = currentValue === '0' ? '1' : '0';
            spellPreparedButton.setAttribute('value', newValue);
            updateContent()
        });
        spellNameContainer.appendChild(spellPreparedButton);
    }

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
    updateContent()
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
        table = createSpellTable(spellLevel);
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

        // Create label for spell
        const label = document.createElement('label');
        label.classList.add('actionButtonLabel', 'damageDiceButton');
        label.setAttribute('data-dice-type', adjustedDamageDice);
        label.setAttribute('data-name', spellDetails.damage_type_01);

        // Create button for spell
        const button = document.createElement('button');
        button.classList.add('actionButton', 'damageDiceButton', 'spell-damage-button');
        button.textContent = adjustedDamageDice;

        // Create a context menu
        const contextMenu = document.createElement('div');
        contextMenu.className = 'custom-context-menu';
        document.body.appendChild(contextMenu);

        // Right-click event on spell button
        button.addEventListener('contextmenu', (event) => {
            event.preventDefault();

            // Clear existing context menu content
            contextMenu.innerHTML = '';

            // Add Crit button to the context menu
            const critButton = document.createElement('button');
            critButton.className = 'crit-button actionButton skillbuttonstyler';

            // Duplicate the label and text from the spell button with doubled dice
            const spellDiceText = button.textContent; // Original dice text, e.g., "3d8+4"
            const doubledDiceText = spellDiceText.replace(/(\d+)d(\d+)/g, (match, rolls, sides) => `${rolls * 2}d${sides}`);

            // Set the doubled dice text for the Crit button
            critButton.textContent = 'Crit';

            // Duplicate the label for the Crit button
            const critLabel = document.createElement('label');
            critLabel.className = 'actionButtonLabel damageDiceButton';
            critLabel.setAttribute('value', label.getAttribute('value') || '0');
            critLabel.setAttribute('data-dice-type', doubledDiceText);
            critLabel.setAttribute('data-name', label.getAttribute('data-name'));

            // Add both the Crit label and button to the context menu
            contextMenu.appendChild(critLabel);
            contextMenu.appendChild(critButton);

            // Position and display the context menu
            contextMenu.style.left = `${event.pageX}px`;
            contextMenu.style.top = `${event.pageY}px`;
            contextMenu.style.display = 'block';

            // Call rollableButtons to reinitialize
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
    const spellDCSelections = row.querySelector('.spell-save');
    console.log(row);
    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8;
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

                    // Check if the spell is Eldritch Blast
                    let bonusDamage = 0;
                    if (spellName.toLowerCase() === "eldritch blast") {
                        // Add bonuses from EldritchBlastDamage
                        bonusDamage = characterStatBonuses.combatStats.EldritchBlastDamage.bonuses.reduce((total, bonus) => total + bonus.value, 0);
                    }

                    // Check if the spell uses an ability modifier in its damage calculation
                    if (spellDetails.ability_modifier === "yes") {
                        const spellAbilityScoreModifier = parseInt(findAbilityScoreLabel(spellModifier).getAttribute('value'));
                        let newDamage = "";

                        if (spellAbilityScoreModifier >= 0) {
                            newDamage = adjustedDamageDice + "+" + spellAbilityScoreModifier + (bonusDamage ? "+" + bonusDamage : "");
                            if (spellDetails.additonal_damage) {
                                newDamage = newDamage + "+" + spellDetails.additonal_damage;
                            }
                        } else {
                            newDamage = adjustedDamageDice + spellAbilityScoreModifier + (bonusDamage ? "+" + bonusDamage : "");
                        }

                        const labelElement = toHitContainer.querySelector('label.damageDiceButton');
                        const buttonElement = toHitContainer.querySelector('button.damageDiceButton');

                        // Only proceed if labelElement and buttonElement exist
                        if (labelElement && buttonElement) {
                            labelElement.setAttribute('value', spellAbilityScoreModifier + (bonusDamage ? "+" + bonusDamage : ""));
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
                            labelElement.setAttribute('value', ""+ (bonusDamage ? "+" + bonusDamage : "")); // No ability modifier
                            labelElement.setAttribute('data-dice-type', adjustedDamageDice);
                            labelElement.setAttribute('data-name', spellDetails.damage_type_01);

                            // Add bonus damage if Eldritch Blast
                            const totalDamage = bonusDamage ? `${adjustedDamageDice}+${bonusDamage}` : adjustedDamageDice;
                            buttonElement.textContent = totalDamage;
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
    updateContent();
}




function updateAllSpellDCs() {
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

                let spellSaveDCBonus = 0;
                if (characterStatBonuses.combatStats.SpellSaveDC) {        
                    spellSaveDCBonus = characterStatBonuses.combatStats.SpellSaveDC.bonuses.reduce((total, bonus) => total + bonus.value, 0);
                }

                let characterSpellBonus = 0;
                if (characterStatBonuses.combatStats.SpellAttackandSave) {        
                    characterSpellBonus = characterStatBonuses.combatStats.SpellAttackandSave.bonuses.reduce((total, bonus) => total + bonus.value, 0);
                }

                const spellSaveDC = spellAbilityScoreModifier + proficiencyBonus + 8 + spellSaveDCBonus + characterSpellBonus;

                

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
    const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
    const spellSection = document.getElementById('SpellList');
    const spellDCSelection = spellSection.querySelector('.spell-dc');


    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(spellCastingAbility).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    let spellSaveDCBonus = 0;
    if (characterStatBonuses.combatStats.SpellSaveDC) {        
        spellSaveDCBonus = characterStatBonuses.combatStats.SpellSaveDC.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }

    let characterSpellBonus = 0;
    if (characterStatBonuses.combatStats.SpellAttackandSave) {        
        characterSpellBonus = characterStatBonuses.combatStats.SpellAttackandSave.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8 + spellSaveDCBonus + characterSpellBonus;

    spellDCSelection.textContent = spellSaveDc;

    const spellAttackLabel = spellSection.querySelector('.actionButtonLabel');
    const spellAttackButton = spellSection.querySelector('.spell-attack-button');
    
    // Update the label value and button text
    const spellAttackBonus = spellAbilityScoreModifer + proficiencyBonus;
    spellAttackLabel.setAttribute('value', spellAttackBonus);
    spellAttackButton.textContent = `+${spellAttackBonus}`;

    sendDMUpdatedStatsDebounced()

}


function updateSpellSaveDC(ability){
    const spellSection = document.getElementById('SpellList');
    const spellDCSelections = spellSection.querySelectorAll('.spell-save-dc');

    let spellSaveDCBonus = 0;
    if (characterStatBonuses.combatStats.SpellSaveDC) {        
        spellSaveDCBonus = characterStatBonuses.combatStats.SpellSaveDC.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }

    let characterSpellBonus = 0;
    if (characterStatBonuses.combatStats.SpellAttackandSave) {        
        characterSpellBonus = characterStatBonuses.combatStats.SpellAttackandSave.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }
    
    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    const spellSaveDc = spellAbilityScoreModifer + proficiencyBonus + 8 + spellSaveDCBonus + characterSpellBonus;

    spellDCSelections.forEach((span) =>{
        span.textContent = spellSaveDc;
    });

    return spellSaveDc
}

function updateSpelltoHitDice(ability) {
    const spellSection = document.getElementById('SpellList');
    const spellAttackButtons = spellSection.querySelectorAll(".spell-attack-button")

    const spellAbilityScoreModifer = parseInt(findAbilityScoreLabel(ability).getAttribute('value'));
    const proficiencyBonus = parseInt(document.getElementById("profBonus").textContent);

    let characterSpellAttackBonus = 0;
    if (characterStatBonuses.combatStats.SpellAttackModifier) {        
        characterSpellAttackBonus = characterStatBonuses.combatStats.SpellAttackModifier.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }

    let characterSpellBonus = 0;
    if (characterStatBonuses.combatStats.SpellAttackandSave) {        
        characterSpellBonus = characterStatBonuses.combatStats.SpellAttackandSave.bonuses.reduce((total, bonus) => total + bonus.value, 0);
    }
    
    const spellAttackBonus = spellAbilityScoreModifer + proficiencyBonus + characterSpellAttackBonus + characterSpellBonus;

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
            const spellPreparedButton = row.querySelector('.spell-prepared-button');
            const spellPrepared = spellPreparedButton ? spellPreparedButton.getAttribute('value') || 'false' : 'false';

            
            // Only add spell if the name is not empty
            if (spellName) {
                spellDetails['name'] = spellName;
                spellDetails['prepared'] = spellPrepared;
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
                spellTable = createSpellTable(spellLevel);
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
























// Define item type libraries
const equipableItems = new Set(['weapon', 'armor', 'equipment','shield', 'wondrous-item']); // Can be expanded in the future. This will be used to create checkbox that allow equipping of an item. 
const useableItems = new Set(['potion']); // Can be expanded in the future. This will be used to create use buttons next to the item


//Player character inventory section start
function updateWeight() {
    let totalWeight = 0;

    // Select all inventory groups
    const inventoryGroups = document.querySelectorAll('.inventory-group');

    // Loop through each group
    inventoryGroups.forEach(group => {
        // Select all items within the current group
        const items = group.querySelectorAll('.inventory-item');

        // Loop through each item in the group
        items.forEach(item => {
            // Get the weight and quantity of the item
            const weight = parseFloat(item.querySelector('.item-weight').innerText); // Convert weight from string to float

            // Update total weight
            totalWeight += weight;
        });
    });

    // Update the weight displayed on the page
    document.getElementById('weight-carried').innerText = totalWeight.toFixed(2); // Display to 2 decimal places
}
  
function addItemToInventory(item, group) {
    const list = document.getElementById(`${group}-list`);

    if (!item.uniqueId) {
        item.uniqueId = generateUniqueId();
    }

    let itemDiv = document.createElement('div');
    itemDiv.classList.add('inventory-item');
    itemDiv.setAttribute('data-unique-id', item.uniqueId); // Attach the unique ID to the DOM
    
    

    // Set quantity to the provided value or default to 1
    const itemQuantity = item.quantity > 0 ? item.quantity : 1; // Use provided quantity or default to 1

    let chargesHTML = '<div class="item-charges-container no-charges"></div>';
    if (item.hasCharges && item.chargesOptions) {
        chargesHTML = `
            <div class="item-charges-container" data-charge-reset="${item.chargesOptions.chargeReset || 'unknown'}">
                <input type="number" id="item-charges-${item.uniqueId}" class="item-charges" 
                value="${item.currentCharges || item.chargesOptions.maxCharges}" min="0" max="${item.chargesOptions.maxCharges}">
            </div>`;
    }



    // Check for notes and format appropriately
    let notes = item.properties ? item.properties.map(p => p.name).join(', ') : '';

    // Add Armor Class (AC) to notes if it exists
    if (item.armor_class && item.armor_class.base) {
        notes += (notes ? ', ' : '') + `AC: ${item.armor_class.base}`;
    }

    // Add Stealth disadvantage if applicable
    if (item.stealth_disadvantage) {
        notes += (notes ? ', ' : '') + `Stealth: D`;
    }


    // Determine the interactive element based on item type
    let interactiveElement = '';
    const categoryIndex = item.equipment_category.index; // Access the `equipment_category.index`

    if (equipableItems.has(categoryIndex)) {
        interactiveElement = `<input type="checkbox" class="equip-toggle inventory-type" ${item.equipped ? 'checked' : ''}>`;
    } else if (useableItems.has(categoryIndex)) {
        interactiveElement = `<button class="use-item-button nonRollButton inventory-type">Use</button>`;
    } else {
        interactiveElement = `<span class="non-interactive inventory-type">-</span>`;
    }

    itemDiv.innerHTML = `
    ${interactiveElement}
    <span class="item-name "><button class="item-info-button">${item.name}</button></span>
    <span class="item-weight">${item.weight || 0} lbs.</span>
    <input type="number" class="item-quantity" value="${itemQuantity}" min="1">
    <span class="item-cost">${item.cost.quantity || 0} ${item.cost.unit || 'gp'}</span>
    <span class="item-notes"></span> <!-- Placeholder for notes -->
    ${chargesHTML}
    <span><button class="delete-item-button nonRollButton">X</button></span>
    `;

   

    // Append the itemDiv to the list
    list.appendChild(itemDiv);

    const chargesInput = itemDiv.querySelector('.item-charges');
    if (chargesInput) {
        chargesInput.addEventListener('input', event => {
            updateContent(); // Call your update logic here
        });
    }

    // Access the item-notes div to adjust styling based on charges
    const itemNotes = itemDiv.querySelector('.item-notes');
    const itemChargesContainer = itemDiv.querySelector('.item-charges-container');

    // If there are no charges, expand item-notes into the charges column
    if (itemChargesContainer && !itemChargesContainer.innerHTML) {
        itemNotes.style.gridColumn = '6 / 8';  // Expanding to take up extra space
        itemChargesContainer.style.width = '1px';
    } else {
        // Otherwise, keep the default style
        itemNotes.style.gridColumn = 'auto'; // Default behavior
        itemChargesContainer.style.width = ''
    }



   


    // Call parseAndReplaceDice for item notes
    const notesContainer = itemDiv.querySelector('.item-notes');
    notesContainer.appendChild(parseAndReplaceDice(item, notes)); // Update this line

    const infoButton = itemDiv.querySelector('.item-info-button');

    // Event listener for info button to toggle notes panel
    infoButton.addEventListener('click', () => {
        // Check if the clicked button is already active
        if (activeInfoButton === infoButton) {
            // If it's active, close the panel and reset the active button
            hideNotesPanel();
            activeInfoButton = null;
        } else {
            // If it's a new button, show the panel and set the active button
            showNotesPanel(item);
            activeInfoButton = infoButton;
        }
    });

    function updateItemWeight() {
        const quantity = parseInt(itemDiv.querySelector('.item-quantity').value, 10);
        const totalWeight = (item.weight * quantity).toFixed(1); // Calculate total weight
        const weightDisplay = itemDiv.querySelector('.item-weight');

        if (weightDisplay) { // Ensure the element exists before updating
            weightDisplay.innerText = `${totalWeight} lbs.`; // Update weight display based on quantity
        }
    }

    // Add event listener for quantity change
    itemDiv.querySelector('.item-quantity').addEventListener('input', (e) => {
        item.quantity = parseInt(e.target.value, 10);
        updateItemWeight();
        updateWeight();
        updateContent(); // Save inventory changes
    });

    // Add event listener for equip toggle
    if (equipableItems.has(item.equipment_category.index)) {
        itemDiv.querySelector('.equip-toggle').addEventListener('change', (e) => {
            item.equipped = e.target.checked;
    
            if (e.target.checked) {
                if (item.equipment_category.index === "armor") {
                    equipArmor(item);
                } else if (item.equipment_category.index === "shield") {
                    equipShield(item);
                } else if (item.equipment_category.index === "weapon") {
                    equipWeapon(item);
                } else if (item.equipment_category.index === "wondrous-item") {
                    equipJewelry(item);
                } else {
                    console.log("other item equipped");
                }
            } else {
                if (item.equipment_category.index === "armor") {
                    unequipArmor(item);
                } else if (item.equipment_category.index === "shield") {
                    unequipShield(item);
                }else if (item.equipment_category.index === "wondrous-item") {
                    unequipJewelry(item);
                }
                else if (item.equipment_category.index === "weapon") {
                    unequipWeapon(item);
                }
                // Remove associated row from action table for other items
                const actionTableRow = document.querySelector(
                    `#actionTableBody tr[data-item-id="${item.uniqueId}"]`
                );
                if (actionTableRow) {
                    actionTableRow.remove();
                }
            }
    
            updateContent();
        });
    }    

    // Add event listener for usable items
    if (useableItems.has(item.equipment_category.index)) {
        itemDiv.querySelector('.use-item-button').addEventListener('click', () => {
            console.log("here")
            const actionButton = itemDiv.querySelector('.actionButton'); // Locate the actionButton in the same row
            
            // Simulate clicking the actionButton if it exists
            if (actionButton) {
                actionButton.click();
            }

            // Reduce the quantity of the item by 1
            const quantityInput = itemDiv.querySelector('.item-quantity');
            let currentQuantity = parseInt(quantityInput.value, 10);

            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1; // Decrement the quantity
            } else {
                // Remove the row entirely if quantity is 0
                const list = itemDiv.parentElement; // Get the parent list container
                list.removeChild(itemDiv); // Remove the current item row
            }

            // Update the total weight and save the updated inventory state
            updateWeight();
            updateContent();
        });
    }



    // Add event listener for delete button
    itemDiv.querySelector('.delete-item-button').addEventListener('click', () => {
        const actionTableRow = document.querySelector(
            `#actionTableBody tr[data-item-id="${item.uniqueId}"]`
        )
        if (actionTableRow) {
            actionTableRow.remove();
        }
        console.log(item.equipment_category.index)

        if (item.equipment_category.index === "armor") {
            unequipArmor(item);
        } else if (item.equipment_category.index === "shield") {
            unequipShield(item);
        } else if (item.equipment_category.index === "wondrous-item") {
            unequipJewelry(item);
            console.log("testing")
        } else if (item.equipment_category.index === "weapon") {
            unequipWeapon(item);
        }
        
        updateWeight(); // Update the total weight
        updateContent(); // Save inventory changes
        list.removeChild(itemDiv); // Remove the item from the list
    });

    if (item.equipped) {
        if (item.equipment_category.index === "armor") {
            equipArmor(item);
        } else if (item.equipment_category.index === "shield") {
            equipShield(item);
        } else if (item.equipment_category.index === "wondrous-item") {
            equipJewelry(item);
        } else {
            console.log("other item equipped automatically on load");
        }
    }

    console.log(item)

    if (item.attuned) {
        const attunementToggle = document.querySelector(`#attune-${item.uniqueId}`);
        if (attunementToggle) {
            attunementToggle.checked = true;
            const attunementList = document.getElementById('attunement-list');

            const currentAttuned = attunementList.querySelectorAll('.attunement-item input:checked').length;
            if (currentAttuned > maxAttunements) {
                showErrorModal("Can't attune to more than " + maxAttunements + " items.");
                toggle.checked = false; // Revert the checkbox state
                return; 
            }
            else{
                item.attuned = true;
                if (item.bonus) {
                    // Add each bonus from the item to the appropriate stat
                    item.bonus.forEach((bonus) => {
                        addBonus(bonus.category, bonus.key, {
                            source: item.name,
                            value: bonus.value,
                        });
                    });
                    console.log(`${item.name} equipped: Bonuses applied.`);
                } else {
                    console.warn(`Item ${item.name} has no bonuses to apply.`);
                } 
                updateContent()
            }
            
        }
        updateCombatStats()
    }

    rollableButtons(); // Add Event Listeners to all buttons
    updateContent(); // Save inventory changes
    updateItemWeight(); // Initial weight calculation
    updateWeight();
}

function generateUniqueId() {
    return `item-${Date.now()}-${Math.random().toString(16).substr(2, 8)}`;
}



function getHigherStat(){
    const strengthLabel = findAbilityScoreLabel("STR");
    const dexLabel = findAbilityScoreLabel("DEX");

    // Extract the 'value' attribute and convert to a number
    const strengthScore = parseInt(strengthLabel.getAttribute("value"), 10);
    const dexScore = parseInt(dexLabel.getAttribute("value"), 10);
    if (strengthScore >= dexScore){
        return "STR"
    }
    else{
        return "DEX"
    }
}   


function addActionItemToTable(item) {

    const calculateStat = (item) => {
        const isFinesse = item.properties.some(p => p.index === "finesse");
        const isRanged = item.weapon_range === "Ranged";

        console.log(item)
        
        if (isFinesse) {
            console.log("here")
            // Use the higher of STR or DEX if the weapon has the finesse property
            return getHigherStat("STR", "DEX"); // Assume getHigherStat is a pre-existing function
        } else if (isRanged) {
            // Use DEX for ranged weapons
            return "DEX";
        } else {
            // Default to STR for melee weapons without finesse
            return "STR";
        }
    };

    const primaryStat = calculateStat(item);

    const newActionTableData = [
        {
            [item.index]: {
                itemId: item.uniqueId, // Add a unique identifier to track the item
                
                proficiencyButton: (() => {
                    // Normalize strings: remove spaces and convert to lowercase
                    const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();

                    // Default to "0" (not proficient)
                    let proficient = "0";
                
                    // Create a normalized array of proficiencies
                    const normalizedProficiencies = playerWeaponProficiency.map(normalize);
                
                    // Check if the normalized weapon or category exists in the normalized proficiencies
                    if (normalizedProficiencies.includes(normalize(item.index)) || 
                        (normalizedProficiencies.includes("simpleweapons") && normalize(item.weapon_category) === "simple") || 
                        (normalizedProficiencies.includes("martialweapons") && normalize(item.weapon_category) === "martial")) {
                        proficient = "1";
                    }
                
                    return proficient;
                })(),
                secondColumn: item.name,
                thirdColumn: (() => {
                    // Base range (normal range with "ft" or default to "5ft")
                    let range = `${item.range?.normal ? `${item.range.normal}ft` : "5ft"}`;
                    
                    // Add thrown range if applicable
                    if (item.throw_range) {
                        const thrownNormal = item.throw_range.normal;
                        const thrownLong = item.throw_range.long;
                        range += ` (${thrownNormal}/${thrownLong})`;
                    }
                    
                    return range;
                })(),
                fourthColumn: "+5", // Default or calculated To Hit
                fifthColumn: `${item.damage?.damage_dice || "1d8"}`, // Damage dice
                sixthColumn: "ActionSettings", //name of the button. Needs to be this name so it works correctly
                seventhColumn: primaryStat, //Which stat is used by the weapon eg STR
                eighthColumn: item.toHitBonus || "", //Magic bonus to hit
                weaponType: item.weapon_range || "", //Weapon Type
                damageBonus: item.damageBonus || "", //magic bonus to damage
                tenthColumn: item.properties.map(p => p.name).join(", "), 
                elventhColumn: item.description || "",
                twelvethColumn: item.damage.damage_type.name || "", //Weapon damage types
                ninthColumn: {
                    attacks: true,
                    actions: true,
                    bonusActions: false,
                    reactions: false,
                    other: false,
                },
            },
        },
    ];
    updateActionTableUI(null, newActionTableData);
}


const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();


function equipWeapon(item) {
    if (item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            addToAttunementList(item); // Add to attunement UI
        }
        else{
            if (item.bonus) {
                // Add each bonus from the item to the appropriate stat
                item.bonus.forEach((bonus) => {
                    addBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} equipped: Bonuses applied.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to apply.`);
            }
        }
    }
    addActionItemToTable(item)         
}

function unequipWeapon(item) {
    if(item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            removeFromAttunementList(item); // Remove the item from the attunement UI
        }
        if (item.bonus) {
            // Remove each bonus from the item from the appropriate stat
            item.bonus.forEach((bonus) => {
                removeBonus(bonus.category, bonus.key, {
                    source: item.name,
                    value: bonus.value,
                });
                
            });
            console.log(`${item.name} unequipped: Bonuses removed.`);
        } else {
            console.warn(`Item ${item.name} has no bonuses to remove.`);
        }
    } 
}


function equipArmor(item) {
    // Unequip currently equipped armor if any
    if (equippedArmor) {
        unequipArmor(equippedArmor);
    }

    if (item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            addToAttunementList(item); // Add to attunement UI
        }
        else{
            if (item.bonus) {
                // Add each bonus from the item to the appropriate stat
                item.bonus.forEach((bonus) => {
                    addBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} equipped: Bonuses applied.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to apply.`);
            }
        }
    }       

    // Check proficiency
    const normalizedProficiencies = playerArmorProficiency.map(normalize);
    if (!normalizedProficiencies.includes(normalize(item.armor_category)) && item.armor_category !=="None") {
        showErrorModal(`Warning: Not proficient with ${item.armor_category} Armor`);
    }

    // Ensure the item gets the uniqueId from the row
    const itemDiv = document.querySelector(`[data-unique-id="${item.uniqueId}"]`);
    if (itemDiv) {
        item.uniqueId = itemDiv.getAttribute('data-unique-id');
    }

    // Equip the armor
    equippedArmor = item;
    updateAC(); // Recalculate AC
}

function unequipArmor(item) {
    if (equippedArmor && equippedArmor.index === item.index) {

        if(item.properties){
            if (item.properties.some(property => property.index === "attunement")) {
                removeFromAttunementList(item); // Remove the item from the attunement UI
            }
            if (item.bonus) {
                // Remove each bonus from the item from the appropriate stat
                item.bonus.forEach((bonus) => {
                    removeBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} unequipped: Bonuses removed.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to remove.`);
            }
        }

        equippedArmor = null;
        updateCheckboxState(item, false); // Uncheck the checkbox when armor is unequipped
        updateAC(); // Recalculate AC
    }
}

// Equip Shield Function
function equipShield(item) {
    // Unequip currently equipped shield if any
    if (equippedShield) {
        unequipShield(equippedShield);
    }

    // Check proficiency
    const normalizedProficiencies = playerArmorProficiency.map(normalize);
    if (!normalizedProficiencies.includes("shield")) {
        showErrorModal(`Warning: Not proficient with shields`);
    }

    if (item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            addToAttunementList(item); // Add to attunement UI
        }
        else{
            if (item.bonus) {
                // Add each bonus from the item to the appropriate stat
                item.bonus.forEach((bonus) => {
                    addBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} equipped: Bonuses applied.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to apply.`);
            }
        }
    }     

    // Ensure the item gets the uniqueId from the row
    const itemDiv = document.querySelector(`[data-unique-id="${item.uniqueId}"]`);
    if (itemDiv) {
        item.uniqueId = itemDiv.getAttribute('data-unique-id');
    }

    // Equip the shield
    equippedShield = item;
    updateAC(); // Recalculate AC
}

function unequipShield(item) {
    if (equippedShield && equippedShield.index === item.index) {

        if(item.properties){
            if (item.properties.some(property => property.index === "attunement")) {
                removeFromAttunementList(item); // Remove the item from the attunement UI
            }
            if (item.bonus) {
                // Remove each bonus from the item from the appropriate stat
                item.bonus.forEach((bonus) => {
                    removeBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} unequipped: Bonuses removed.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to remove.`);
            }  
        }

        equippedShield = null;
        updateCheckboxState(item, false); // Uncheck the checkbox when shield is unequipped
        updateAC(); // Recalculate AC
    }
}

function updateCheckboxState(item, isChecked) {
    console.log(item);
    const itemDiv = document.querySelector(`[data-unique-id="${item.uniqueId}"]`);
    const checkbox = itemDiv ? itemDiv.querySelector('.equip-toggle') : null;

    console.log(checkbox);

    if (checkbox) {
        checkbox.checked = isChecked;
    }
}

function equipJewelry(item) {
    if (item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            addToAttunementList(item); // Add to attunement UI
        }
        else{
            if (item.bonus) {
                // Add each bonus from the item to the appropriate stat
                item.bonus.forEach((bonus) => {
                    addBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} equipped: Bonuses applied.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to apply.`);
            }
        }
    }         
}

function unequipJewelry(item) {
    if(item.properties){
        if (item.properties.some(property => property.index === "attunement")) {
            removeFromAttunementList(item); // Remove the item from the attunement UI
        }
        if (item.bonus) {
            // Remove each bonus from the item from the appropriate stat
            item.bonus.forEach((bonus) => {
                removeBonus(bonus.category, bonus.key, {
                    source: item.name,
                    value: bonus.value,
                });
                
            });
            console.log(`${item.name} unequipped: Bonuses removed.`);
        } else {
            console.warn(`Item ${item.name} has no bonuses to remove.`);
        }
    } 
}


let maxAttunements = 3;

function addToAttunementList(item) {
    const attunementList = document.getElementById('attunement-list');

    // Create a container for the item
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('attunement-item');
    itemDiv.dataset.uniqueId = item.uniqueId;

    // Item label
    const itemLabel = document.createElement('span');
    itemLabel.textContent = item.name;

    // Attunement toggle
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.id = `attune-${item.uniqueId}`;
    toggle.classList.add('attunement-toggle');

    // Check the toggle state and apply bonuses
    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            // Check the current number of attuned items
            const currentAttuned = attunementList.querySelectorAll('.attunement-item input:checked').length;
            if (currentAttuned > maxAttunements) {
                showErrorModal("Can't attune to more than " + maxAttunements + " items.");
                toggle.checked = false; // Revert the checkbox state
                return; 
            }
            else{
                item.attuned = true;
                if (item.bonus) {
                    // Add each bonus from the item to the appropriate stat
                    item.bonus.forEach((bonus) => {
                        addBonus(bonus.category, bonus.key, {
                            source: item.name,
                            value: bonus.value,
                        });
                    });
                    console.log(`${item.name} equipped: Bonuses applied.`);
                } else {
                    console.warn(`Item ${item.name} has no bonuses to apply.`);
                } 
                updateContent()
            }
            
        } else {
            item.attuned = false;
            if (item.bonus) {
                // Remove each bonus from the item from the appropriate stat
                item.bonus.forEach((bonus) => {
                    removeBonus(bonus.category, bonus.key, {
                        source: item.name,
                        value: bonus.value,
                    });
                });
                console.log(`${item.name} unequipped: Bonuses removed.`);
            } else {
                console.warn(`Item ${item.name} has no bonuses to remove.`);
            }
            updateContent()
        }
    });

    // Append elements to the itemDiv
    itemDiv.appendChild(itemLabel);
    itemDiv.appendChild(toggle);

    // Add to attunement list
    attunementList.appendChild(itemDiv);
    
}

function removeFromAttunementList(item) {
    const attunementList = document.getElementById("attunement-list");
    
    // Find the corresponding item in the attunement list by uniqueId
    const itemDiv = attunementList.querySelector(`[data-unique-id="${item.uniqueId}"]`);
    
    if (itemDiv) {
        attunementList.removeChild(itemDiv); // Remove the item from the list
    }
}




let activeInfoButton = null; // Keeps track of the currently active button for the inventory notes panel. 

function showNotesPanel(item) {
    // Get the item card container
    const notesPanel = document.querySelector('.item-card-container');
    notesPanel.classList.remove('hidden');
    notesPanel.classList.add('visible');
    
    // Populate the item details with HTML for names
    notesPanel.querySelector('#itemName').innerHTML = item.name 
        ? `<strong>${item.name}</strong>` 
        : '<strong>Unknown Item</strong>';

    notesPanel.querySelector('#itemDesc').innerHTML = item.description || 'No description available.';

    notesPanel.querySelector('#itemProperties').innerHTML = 
    item.properties && item.properties.length > 0
        ? `<strong>Properties:</strong> ${item.properties.map(prop => prop.name).join(', ')}`
        : ``;

    notesPanel.querySelector('#itemEquipmentCategory').innerHTML = 
    item.equipment_category 
        ? `<strong>Equipment Type:</strong> ${item.equipment_category.name}` 
        : ``;

    notesPanel.querySelector('#itemArmorCategory').innerHTML = 
    item.armor_category
        ? `<strong>Armor Type:</strong> ${item.armor_category} Armor` 
        : ``;

    notesPanel.querySelector('#itemArmorAC').innerHTML = 
    item.armor_class
        ? `<strong>Armor Class:</strong> ${item.armor_class.base}` 
        : ``;

    notesPanel.querySelector('#itemArmorStealth').innerHTML = 
    item.stealth_disadvantage
        ? `<strong>Stealth Disadvantage:</strong> ${item.stealth_disadvantage}` 
        : ``;

    notesPanel.querySelector('#itemAttackType').innerHTML = 
    item.weapon_range 
        ? `<strong>Attack Type:</strong> ${item.weapon_range}` 
        : ``;

    notesPanel.querySelector('#itemWeight').innerHTML = 
        `<strong>Weight:</strong> ${item.weight || 0} lbs.`;

    notesPanel.querySelector('#itemCost').innerHTML = 
        item.cost 
        ? `<strong>Cost:</strong> ${item.cost.quantity} ${item.cost.unit}` 
        : '<strong>Cost:</strong> Unknown';

    notesPanel.querySelector('#itemDamage').innerHTML = (() => {
        if (item.damage) {
            const damageText = `<strong>Damage:</strong> ${item.damage.damage_dice} ${item.damage.damage_type.name}`;
            
            // Check if the weapon has the versatile property
            const hasVersatile = item.properties && item.properties.some(prop => prop.index === 'versatile');
            
            if (hasVersatile && item.two_handed_damage) {
                const oneHandedDamage = `${item.damage.damage_dice} ${item.damage.damage_type.name}`;
                const twoHandedDamage = `${item.two_handed_damage.damage_dice} ${item.two_handed_damage.damage_type.name}`;
                return `<strong>Damage:</strong> One-Handed: ${oneHandedDamage} <br> Two-Handed: ${twoHandedDamage}`;
            }
            
            return damageText; // Return normal damage if not versatile
        }
        return ''; // Return empty string if no damage information
    })();

    notesPanel.querySelector('#itemRange').innerHTML = (() => {
        if (item.range && item.throw_range) {
            const meleeRange = item.range.normal || 0;
            const normalThrowRange = item.throw_range.normal || 0;
            const longThrowRange = item.throw_range.long || null;
            return longThrowRange
                ? `<strong>Melee Range:</strong> ${meleeRange} ft., <br><strong>Thrown Range:</strong> ${normalThrowRange} / ${longThrowRange} ft.`
                : `<strong>Melee Range:</strong> ${meleeRange} ft., <br><strong>Thrown Range:</strong> ${normalThrowRange} ft.`;
        } else if (item.range) {
            const normalRange = item.range.normal || 0;
            const longRange = item.range.long || null;
            return longRange
                ? `<strong>Range:</strong> ${normalRange} / ${longRange} ft.`
                : `<strong>Range:</strong> ${normalRange} ft.`;
        } else if (item.throw_range) {
            const normalThrowRange = item.throw_range.normal || 0;
            const longThrowRange = item.throw_range.long || null;
            return longThrowRange
                ? `<strong>Thrown Range:</strong> ${normalThrowRange} / ${longThrowRange} ft.`
                : `<strong>Thrown Range:</strong> ${normalThrowRange} ft.`;
        } else {
            return ``;
        }
    })();
}


function hideNotesPanel() {
    const notesPanel = document.querySelector('.item-card-container');
    notesPanel.classList.add('hidden');
    notesPanel.classList.remove('visible');

    activeInfoButton = null;
}

  
function populateItemDropdown(filter = "") {
    let itemSelect = document.getElementById('item-select');
    itemSelect.innerHTML = ""; // Clear existing items

    // Filter items based on the search
    let filteredItems = AppData.equipmentLookupInfo.equipmentNames
        .filter(name => name.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => a.localeCompare(b)); // Sort alphabetically


    // Populate dropdown with filtered item names
    filteredItems.forEach(name => {
        let option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        itemSelect.appendChild(option);
    });
}

  
// Open modal to add item
document.getElementById('add-item-button').addEventListener('click', function() {
    populateItemDropdown(); // Populate the item list when the modal opens
    document.getElementById('add-item-modal').style.display = 'block';
});

// Close modal
document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('add-item-modal').style.display = 'none';
});

// Filter items as the user types
document.getElementById('item-search').addEventListener('input', function() {
    let filter = document.getElementById('item-search').value;
    populateItemDropdown(filter); // Update dropdown based on the search
});

// Confirm adding the item to inventory
document.getElementById('confirm-add-item').addEventListener('click', function() {
    let selectedItemName = document.getElementById('item-select').value;
    let selectedBag = document.getElementById('bag-select').value;

    // Find the selected item in the equipment lookup info
    let selectedItem = AppData.equipmentLookupInfo.equipmentData.find(item => item.name === selectedItemName);

    if (selectedItem) {
        addItemToInventory(selectedItem, selectedBag);
        document.getElementById('add-item-modal').style.display = 'none'; // Close modal after adding
    }
});


  

const inventoryHeaders = document.querySelectorAll('.inventory-group h3');

// Loop through each header and add a click event listener
inventoryHeaders.forEach(header => {
    header.addEventListener('click', () => {
    // Toggle visibility of the next sibling (the inventory list)
    const content = header.nextElementSibling;

    // Toggle hidden class on the content
    content.classList.toggle('hidden');

    // Toggle active class on the header itself for styling
    header.classList.toggle('active');
    });
});






function saveInventory() {
    const inventoryData = {}; // Initialize an object to hold inventory groups
    const inventoryGroups = document.querySelectorAll('.inventory-group'); // Select all inventory groups

    inventoryGroups.forEach(group => {
        const groupId = group.id; // Get the ID of the current group (e.g., "equipment", "backpack")
        inventoryData[groupId] = []; // Initialize an array for this group

        const items = group.querySelectorAll('.inventory-item'); // Select all items within the current group

        items.forEach(itemDiv => {
            const itemName = itemDiv.querySelector('.item-name').innerText;
            const itemId = itemDiv.getAttribute('data-unique-id')
            const itemQuantity = parseInt(itemDiv.querySelector('.item-quantity').value, 10);
            const itemWeight = parseFloat(itemDiv.querySelector('.item-weight').innerText) || 0;
            const itemCost = itemDiv.querySelector('.item-cost').innerText;

            let itemData = {
                name: itemName,
                uniqueId: itemId,
                quantity: itemQuantity,
                weight: itemWeight,
                cost: itemCost,
            };

            // Check if the item is equipable (has a checkbox)
            const equipToggle = itemDiv.querySelector('.equip-toggle');
            if (equipToggle) {
                itemData.equipped = equipToggle.checked;

                // Check if the item is attuned (in the attunement list and checked)
                const attunementToggle = document.querySelector(`#attune-${itemId}`);
                if (attunementToggle) {
                    itemData.attuned = attunementToggle.checked;
                }
            }

                        

            // Check if the item is useable (has a button)
            const useButton = itemDiv.querySelector('.use-item-button');
            if (useButton) {
                itemData.useable = true; // Mark the item as useable
            }

             // Check if the item has charges
             const chargesInput = itemDiv.querySelector('.item-charges');
             if (chargesInput) {
                 itemData.currentCharges = parseInt(chargesInput.value, 10)
             }

            // Add the item data to the group
            inventoryData[groupId].push(itemData);
        });
    });

    return inventoryData; // Return the structured inventory data
}




function loadInventoryData(characterInventoryData) {
    // Iterate through each inventory group in the characterInventoryData
    for (const group in characterInventoryData) {
        const items = characterInventoryData[group]; // Get items for the current group

        // Check if the group exists and has items
        if (Array.isArray(items) && items.length > 0) {
            items.forEach(item => {
                // Find the item details in the new equipment data
                const foundItem = AppData.equipmentLookupInfo.equipmentData.find(i => i.name === item.name);

                if (foundItem) {
                    // Create a new item object by spreading foundItem and adding quantity and equipped
                    const newItem = {
                        ...foundItem, // Spread the foundItem properties
                        quantity: item.quantity, // Add the quantity from characterInventoryData
                        equipped: item.equipped, // Add the equipped status from characterInventoryData
                        uniqueId: item.uniqueId, // Add the unique Id of the item from characterInventoryData so that it links correctly to the action table items. 
                        attuned: item.attuned, // Add the unique Id of the item from characterInventoryData so that it links correctly to the action table items. 
                        currentCharges: item.currentCharges
                    };

                    // Add each item to the corresponding inventory group
                    addItemToInventory(newItem, group);
                }
            });
        }
    }
}































function updateAdjustmentValues() {
    // Get all group containers
    const groups = document.querySelectorAll('.group-container');

    groups.forEach(group => {
        // Get all traits in the current group
        const traits = group.querySelectorAll('.trait-item');

        traits.forEach(trait => {
            // Get the selected ability for this trait
            const abilitySelect = trait.querySelector('.trait-ability-select');
            const selectedAbility = abilitySelect?.value;
            const adjustmentValueInput = trait.querySelector('.adjustment-value');

            if (selectedAbility !== "NONE" && selectedAbility !== "Proficiency") {
                const abilityScoreLabel = findAbilityScoreLabel(selectedAbility);
                const abilityValue = parseInt(abilityScoreLabel.getAttribute("value"), 10);

                

                if (abilityValue !== null) {
                    adjustmentValueInput.value = abilityValue;
                    // Manually dispatch the blur event
                    const blurEvent = new Event('blur');
                    adjustmentValueInput.dispatchEvent(blurEvent)
                }
            }
            else if(selectedAbility !== "NONE"){
                const profBonus = document.getElementById('profBonus').textContent;
                adjustmentValueInput.value = parseInt(profBonus);
            }
        });
    });

    // Call your update function if needed to reflect changes elsewhere
    updateContent();
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



    // Create the trait list (initially empty)
    const traitsList = document.createElement('div');
    traitsList.classList.add('traits-list');
   

    let collapseButton

    if (groupData && groupData['group-chevron']) {
        collapseButton = document.createElement('button');
        collapseButton.classList.add('collapse-feature-group-button','fa', 'fa-chevron-down', 'chevron-icon', 'collapsed');
        traitsList.style.display = 'none';
    }
    else{
        collapseButton = document.createElement('button');
        collapseButton.classList.add('collapse-feature-group-button','fa', 'fa-chevron-down', 'chevron-icon');
        traitsList.style.display = 'block';
    }

    

     // Event listener for collapsing and expanding
     collapseButton.addEventListener('click', function () {
        // Toggle the visibility of the traitsList
        if (traitsList.style.display === 'none') {
            traitsList.style.display = 'block';
            collapseButton.classList.remove('collapsed');
            resizeAllTextareas()
        } else {
            traitsList.style.display = 'none';
            collapseButton.classList.add('collapsed');
        }
        updateContent()
    });

    groupHeader.appendChild(collapseButton);
    groupHeader.appendChild(groupTitle);
    groupHeader.appendChild(addTraitButton);
    groupContainer.appendChild(groupHeader);

    groupContainer.appendChild(traitsList);

    // If groupData is provided, load its traits
    if (groupData && groupData.traits) {
        groupData.traits.forEach(trait => {
            addNewTrait(groupContainer, trait);  // Pass the trait data
        });
    }

    // Add the group to the features section
    featuresSection.insertBefore(groupContainer, addGroupButton);


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

    const traitHeader = document.createElement('div');
    traitHeader.classList.add('trait-header');
    

    // Trait Name Input
    const traitName = document.createElement('input');
    traitName.classList.add('trait-name');
    traitName.placeholder = 'Trait Name (e.g., Channel Divinity)';
    traitName.addEventListener('blur', function (){
        updateContent();
    });

    // If traitData is provided, populate the trait name
    if (traitData && traitData.traitName) {
        traitName.value = traitData.traitName;
    }

    // Trait Description Textarea
    const traitDescription = document.createElement('textarea');
    traitDescription.classList.add('trait-description');
    traitDescription.placeholder = 'Describe the trait here...';

    // Auto-resize the text area as the user types
    traitDescription.addEventListener('input', function () {
        resizeTextarea(this)
    });

    // Add blur event listener to parse and replace dice
    traitDescription.addEventListener('blur', function (){
        updateContent(); // Call your function to update content as needed
    });

    // If traitData is provided, populate the description
    if (traitData && traitData.traitDescription) {
        traitDescription.value = traitData.traitDescription;
    }

    let chevronIcon;

    if (traitData && traitData.cheveron){
        chevronIcon = document.createElement('i');
        chevronIcon.classList.add('collapse-feature-trait-button','fa', 'fa-chevron-down', 'chevron-icon' , 'rotated');
            // If the chevron is rotated, collapse the description
        traitDescription.style.display = 'none';
    }else{
        chevronIcon = document.createElement('i');
        chevronIcon.classList.add('collapse-feature-trait-button','fa', 'fa-chevron-down', 'chevron-icon');
        traitDescription.style.display = 'block';
    }
    
    // Create event listener for toggling trait details
    chevronIcon.addEventListener('click', function () {
        const isCollapsed = traitDescription.style.display === 'none';
        traitDescription.style.display = isCollapsed ? 'block' : 'none';
        chevronIcon.classList.toggle('rotated');  // Toggle rotation class
        updateContent();
        resizeAllTextareas()
    });

    traitHeader.appendChild(chevronIcon);
    traitHeader.appendChild(traitName);

    // Flex container for the info button and uses section
    const traitControls = document.createElement('div');
    traitControls.classList.add('trait-controls');

    // Create the "i" button for displaying the submenu
    const infoButton = document.createElement('button');
    infoButton.innerHTML = '<i>i</i>';
    infoButton.classList.add('info-button', 'nonRollButton');

    // Submenu container (initially hidden)
    const traitSettings = document.createElement('div');
    traitSettings.classList.add('trait-settings');
    traitSettings.style.display = 'none'; // Initially hidden

    // Add event listener to toggle the submenu display
    infoButton.addEventListener('click', function () {
        traitSettings.style.display = traitSettings.style.display === 'none' ? 'block' : 'none';
        updateContent();
    });

    // Trait Usage Section (number input and checkboxes)
    const traitUses = document.createElement('div');
    traitUses.classList.add('trait-uses');
    const usesLabel = document.createElement('label');
    usesLabel.textContent = 'Number of Uses:';
    const usesInput = document.createElement('input');
    usesInput.type = 'number';
    usesInput.classList.add('trait-uses-input');
    usesInput.value = traitData && traitData.numberOfUses ? traitData.numberOfUses : 0;
    usesInput.min = 0;
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
        updateContent();
    }

    // Update checkboxes when the input changes
    usesInput.addEventListener('input', updateCheckboxes);

    // Initially generate checkboxes based on traitData
    updateCheckboxes();


     // Add Reset Uses Dropdown

    const resetLabel = document.createElement('span');
    resetLabel.classList.add('reset-label');
    resetLabel.textContent = "Reset on: "; 

     const resetDropdown = document.createElement('select');
     resetDropdown.classList.add('reset-type-dropdown');
     resetDropdown.textContent = "Reset on: "
     const resetOptions = ['None', 'Short Rest', 'Long Rest'];
     resetOptions.forEach(option => {
         const opt = document.createElement('option');
         opt.value = option.toLowerCase();
         opt.textContent = option;
         resetDropdown.appendChild(opt);
     });
 
     // Set the dropdown value if traitData is provided
     if (traitData && traitData.resetType) {
         resetDropdown.value = traitData.resetType.toLowerCase();
     }

    // Append uses controls to the submenu
    traitUses.appendChild(usesLabel);
    traitUses.appendChild(usesInput);
    traitUses.appendChild(resetLabel);
    traitUses.appendChild(resetDropdown);

    // Add the input listener to call updateContent when the value changes this will be used to save the content. 
    resetDropdown.addEventListener('change', updateContent);


    // Initialize and handle trait adjustment updates
    const previousState = {
        category: traitData?.adjustmentCategory || null,
        subCategory: traitData?.adjustmentSubCategory || null,
        value: traitData?.adjustmentValue ? parseInt(traitData.adjustmentValue, 10) : null,
    };
    
    // Ability Adjustment Section
    const adjustmentContainer = document.createElement('div');

    // Category Dropdown
    const categoryWrapper = document.createElement('div');
    categoryWrapper.classList.add('select-wrapper')
    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Category:';
    const categorySelect = document.createElement('select');
    categorySelect.classList.add('category-select');
    Object.keys(characterStatBonuses).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        if (traitData?.adjustmentCategory === category) option.selected = true;
        categorySelect.appendChild(option);
    });

    categoryWrapper.appendChild(categoryLabel);
    categoryWrapper.appendChild(categorySelect);

    // Subcategory Dropdown
    const subcategoryWrapper = document.createElement('div');
    subcategoryWrapper.classList.add('select-wrapper')
    const subCategoryLabel = document.createElement('label');
    subCategoryLabel.textContent = 'Subcategory:';
    const subCategorySelect = document.createElement('select');
    subCategorySelect.classList.add('subcategory-select');
    if (traitData?.adjustmentCategory) {
        const subCategories = characterStatBonuses[traitData.adjustmentCategory];
        Object.keys(subCategories).forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory;
            option.textContent = subCategory;
            if (traitData?.adjustmentSubCategory === subCategory) option.selected = true;
            subCategorySelect.appendChild(option);
        });
    }

    subcategoryWrapper.appendChild(subCategoryLabel);
    subcategoryWrapper.appendChild(subCategorySelect);

    // Ability Selection Dropdown
    const abilityWrapper = document.createElement('div');
    abilityWrapper.classList.add('select-wrapper')
    const abilityLabel = document.createElement('label');
    abilityLabel.textContent = 'Ability Score to use for adjustment value';
    const abilitySelect = document.createElement('select');
    abilitySelect.classList.add('trait-ability-select');
    const abilities = ['NONE', 'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'Proficiency'];
    abilities.forEach(ability => {
        const option = document.createElement('option');
        option.textContent = ability;
        if (traitData?.adjustmentAbility === ability) option.selected = true;
        abilitySelect.appendChild(option);
    });

    abilityWrapper.appendChild(abilityLabel);
    abilityWrapper.appendChild(abilitySelect);


    // Adjustment Value
    const adjustmentValueLabel = document.createElement('label');
    adjustmentValueLabel.textContent = 'Adjustment Value: ';
    const adjustmentValueInput = document.createElement('input');
    adjustmentValueInput.classList.add('adjustment-value');
    adjustmentValueInput.placeholder = 'Enter value or formula';
    adjustmentValueInput.value = traitData?.adjustmentValue || 0;


    // Event listener for ability selection
    abilitySelect.addEventListener('change', () => {
        const selectedAbility = abilitySelect.value;
        console.log(selectedAbility)
        if (selectedAbility !== "NONE" && selectedAbility !== "Proficiency"){
            const abilityScoreLabel = findAbilityScoreLabel(selectedAbility);
            const abilityValue = parseInt(abilityScoreLabel.getAttribute("value"), 10);

            if (abilityValue !== null) {
                adjustmentValueInput.value = abilityValue;
            }
        }
        else if (selectedAbility !== "NONE"){
            const profBonus = document.getElementById('profBonus').textContent;
            adjustmentValueInput.value = parseInt(profBonus);
        }
        handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState);
        updateContent();
    });

    // Event listener to update subcategories when category changes
    categorySelect.addEventListener('change', () => {
        subCategorySelect.innerHTML = '';
        const selectedCategory = categorySelect.value;
        const subCategories = characterStatBonuses[selectedCategory];
        Object.keys(subCategories).forEach(subCategory => {
            const option = document.createElement('option');
            option.value = subCategory;
            option.textContent = subCategory;
            subCategorySelect.appendChild(option);
        });
        updateContent();
        handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState);
    });

    subCategorySelect.addEventListener('change', () => {
        handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState);
        updateContent();
    });




    adjustmentContainer.appendChild(categoryWrapper);
    adjustmentContainer.appendChild(subcategoryWrapper);
    adjustmentContainer.appendChild(abilityWrapper);
    adjustmentContainer.appendChild(adjustmentValueLabel);
    adjustmentContainer.appendChild(adjustmentValueInput);

    // Append ability adjustment fields
    traitSettings.appendChild(adjustmentContainer);

    adjustmentValueInput.addEventListener('blur', () => {

        const value = adjustmentValueInput.value.trim();

        // Check if the value is a valid number
        if (isNaN(value) || value === "") {
            // Reset to 0 if invalid
            showErrorModal(`Invalid Input: "${value}". The value must be a number.`)
            adjustmentValueInput.value = 0;
            
        }

        handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState);
    });
    
    // Delete Trait Button
    const deleteTraitButton = document.createElement('button');
    deleteTraitButton.textContent = 'Delete Trait';
    deleteTraitButton.classList.add('delete-trait-button');
    deleteTraitButton.classList.add('nonRollButton');

    // Event listener for deleting the trait
    deleteTraitButton.addEventListener('click', function () {
        // Explicitly remove the bonus tied to this trait before handling adjustments
        const category = categorySelect.value;
        const subCategory = subCategorySelect.value;
        const value = parseInt(adjustmentValueInput.value, 10); // Parse as integer

        if (category && subCategory && !isNaN(value) && value !== 0) {
            removeBonus(category, subCategory, {
                source: "trait", // Add a unique identifier if needed
                value: value,
            });
        }

        // Remove the trait item from the DOM
        traitItem.remove();

        // Check if there are no more traits in the group, delete the group
        if (traitsList.children.length === 0) {
            groupContainer.remove();
        }
        updateContent();
    });

    // Append the delete button to the submenu
    traitSettings.appendChild(traitUses);
    traitSettings.appendChild(deleteTraitButton);

    traitControls.appendChild(checkboxesContainerMain);
    traitControls.appendChild(infoButton);
    

    // Append trait parts to trait item
    traitItem.appendChild(traitHeader);
    traitItem.appendChild(traitDescription);
    traitItem.appendChild(traitControls);
    traitItem.appendChild(traitSettings); // Submenu with uses and adjustments

    // Add the trait item to the list of traits in the group
    traitsList.appendChild(traitItem);

    handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState)
    updateContent();
}


function resizeTextarea(textarea) {
    textarea.style.height = 'auto'; // Reset the height
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to the scroll height
}

// Function to resize all trait-description textareas after they've been appended
function resizeAllTextareas() {
        const textareas = document.querySelectorAll('.trait-description');
        textareas.forEach(textarea => {
            resizeTextarea(textarea);
        });
}


// Event listener for adding a new group
addGroupButton.addEventListener('click', createNewGroup);



function handleTraitAdjustment(categorySelect, subCategorySelect, adjustmentValueInput, previousState) {
    // Function to apply or update the bonus when a field changes
    function applyBonus() {
        const category = categorySelect.value;
        const subCategory = subCategorySelect.value;
        const value = parseInt(adjustmentValueInput.value, 10); // Parse as integer

        // Remove the previous bonus if it exists
        if (previousState.category && previousState.subCategory && previousState.value !== null) {
            removeBonus(previousState.category, previousState.subCategory, {
                source: "trait", // Add a unique identifier if needed
                value: previousState.value,
            });
        }

        // Only add the new bonus if value is valid and non-zero
        if (category && subCategory && !isNaN(value) && value !== 0) {
            addBonus(category, subCategory, {
                source: "trait", // Add a unique identifier if needed
                value: value,
            });

            // Update the previous state
            previousState.category = category;
            previousState.subCategory = subCategory;
            previousState.value = value;
        } else {
            // Reset previous state if no valid bonus
            previousState.category = null;
            previousState.subCategory = null;
            previousState.value = null;
        }
    }

    // Add event listeners to call `applyBonus` on changes
    categorySelect.addEventListener("change", applyBonus);
    subCategorySelect.addEventListener("change", applyBonus);
    adjustmentValueInput.addEventListener("input", applyBonus);

    // Initialize the adjustment with the current state
    applyBonus();
    
    updateAllSpellDamageDice();
    updateAllToHitDice();
    calculateActionDamageDice();
    updateAllSpellDCs();
    updateSpellDCHeader();
    const spellCastingAbility = document.querySelector('.spellcasting-dropdown').value;
    updateSpelltoHitDice(spellCastingAbility)

    updateContent();
}





// Saving Trait data 
function processGroupTraitData() {
    // Select all group containers

    const groupContainers = document.querySelectorAll('.group-container');
    const groupTraitData = [];
    groupContainers.forEach((group, index) => {
        const groupData = {};
        const groupName = group.querySelector('.group-title').value;
        const chevronGroup = group.querySelector('.collapse-feature-group-button');
        const isChevronGroupRotated = chevronGroup.classList.contains('collapsed');
        groupData['group-title'] = groupName;
        groupData['group-chevron'] = isChevronGroupRotated;

        // Select all traits within this group
        const traits = group.querySelectorAll('.trait-item');
        const traitData = [];

        traits.forEach((trait) => {
            const traitDataObject = {};
            const traitName = trait.querySelector('.trait-name').value;
            const chevron = trait.querySelector('.collapse-feature-trait-button')
            const isRotated = chevron.classList.contains('rotated');
            const traitDescription = trait.querySelector('.trait-description').value;

            // Save the trait name and value
            traitDataObject['traitName'] = traitName;
            traitDataObject['cheveron'] = isRotated;
            traitDataObject['traitDescription'] = traitDescription;

            // Save the trait checkbox state if available
            const checkboxes = trait.querySelectorAll('.trait-checkbox-main');
            traitDataObject['checkboxStates'] = Array.from(checkboxes).map(checkbox => checkbox.checked);

            // Save any other trait-specific fields (like dropdowns, etc.)
            const traitSettings = trait.querySelector('.trait-settings');

            if (traitSettings) {
                const adjustmentCategory = traitSettings.querySelector('.category-select').value;
                const adjustmentSubCategory = traitSettings.querySelector('.subcategory-select').value;
                const adjustmentAbility = traitSettings.querySelector('.trait-ability-select').value;
                const adjustmentValue = traitSettings.querySelector('.adjustment-value').value;
                const numberOfUses = traitSettings.querySelector('.trait-uses-input').value;
                const resetType = traitSettings.querySelector('.reset-type-dropdown').value;

                // Save the trait settings in the traitDataObject
                traitDataObject['adjustmentCategory'] = adjustmentCategory;
                traitDataObject['adjustmentSubCategory'] = adjustmentSubCategory;
                traitDataObject['adjustmentAbility'] = adjustmentAbility;
                traitDataObject['adjustmentValue'] = adjustmentValue;
                traitDataObject['numberOfUses'] = numberOfUses;
                traitDataObject['resetType'] = resetType;
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












// Quick Notes Section


//Quick Notes Event Listener
const quickNotesSection = document.getElementById('Docs');
const addNotesGroupButton = quickNotesSection.querySelector('.add-notes-group-button');
// Event listener for adding new groups
addNotesGroupButton.addEventListener('click', function () {
    createNewNotesGroup();
    updateContent()
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
        updateContent()
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
        updateContent()
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
        updateContent()
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
        updateContent()
    });

    noteTitle.addEventListener('blur', function () {
        updateContent()
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
    updateContent()
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
    console.log(notesGroupData)
    if (notesGroupData){
        // Loop through each group in notesGroupData
        notesGroupData.forEach(group => {
            // Use createNewNotesGroup to create a group container with proper groupData
            createNewNotesGroup(group);
        });
    }
    
}













//Player Init list start.

function createInitiativeCard(name, isPlayer, isVisible, isBloodied) {
    // Get the initiative container
    const initCardHolder = document.querySelector('.initCardHolder');

    // Create the card element
    const card = document.createElement('div');
    card.className = `initCard ${isPlayer === 1 ? 'playerCard' : 'enemyCard '}`;
    card.style.display = isVisible === 1 ? 'block' : 'none'; // Hide if not visible

    // Determine the displayed name
    const displayedName = isPlayer === 1 ? name : "Enemy";

    if (isBloodied === 1 && isPlayer === 0) {
        card.classList.add('bloodied');
    }

    // Add content to the card
    const nameElement = document.createElement('div');
    nameElement.textContent = displayedName;
    nameElement.className = 'nameLabel';

    // Append name element to the card
    card.appendChild(nameElement);

    // Add the card to the container
    initCardHolder.appendChild(card);
}









async function handleSyncEvents(event) {
    //broadcasted sync events go to all clients, also the sender. for this example it's mostly irrelevant,
    //but for others it might be necessary to filter out your own messages (or have different behavior)
    //by checking if the sender is the own client.
    console.log("Getting message")
    let fromClient = event.payload.fromClient.id;
    console.log(event.payload)
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
function handleRequestInfo() {
    console.log("here")
    sendDMUpdatedStats()
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


let sendDMUpdatedStatsTimeout = null;

async function sendDMUpdatedStatsDebounced() {
    if (sendDMUpdatedStatsTimeout) {
        clearTimeout(sendDMUpdatedStatsTimeout); // Clear any previous timer
    }

    sendDMUpdatedStatsTimeout = setTimeout(async () => {
        sendDMUpdatedStatsTimeout = null; // Reset the timeout reference
        await sendDMUpdatedStats(); // Call the original function
    }, 1000); // Set the debounce delay to 1 seconds
}


async function sendDMUpdatedStats() {
    // Construct the message object with player stats

    console.log(gmClient)

    if (gmClient !== null) {
        const playerStats = getPlayerData();

        // Construct the message object with player stats
        const message = {
            type: 'request-stats', // Message type
            playerId: isMe,
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
        TS.sync.send(JSON.stringify(message), gmClient.id).catch(console.error);
    }
    
}

async function sendDMInitiativeResults(totalInitiative){

    if (gmClient !== null) {
        const message = {
            type: 'update-init', // Message type
            playerId: isMe,
            data: {
                Initiative: totalInitiative
            }
        };
    
        TS.sync.send(JSON.stringify(message), gmClient.id).catch(console.error);
    }
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
            // Adjust total based on the operator
            totalInitiative += (resultGroup.result.operator === "+") ? operand.value : -operand.value;
        }
    }

    // Output or process the total initiative value
    console.log("Total Initiative Value:", totalInitiative);

    sendDMInitiativeResults(totalInitiative)
}



function createPlayerInit(initList) {
    console.log(initList);

    // Ensure initList has the expected structure
    if (!initList || !Array.isArray(initList.data)) {
        console.error("Invalid initiative list format:", initList);
        return;
    }

    const initCardHolder = document.querySelector('.initCardHolder');
    initCardHolder.innerHTML = ''; // Clear existing cards

    // Loop through the initiative list's data array and create cards
    initList.data.forEach(entry => {
        createInitiativeCard(entry.n, entry.p, entry.v, entry.b);
    });
}

function handleInitTurn(message) {
    const tracker = document.querySelector('.initCardHolder');
    
    // Ensure the message has the correct structure
    if (message && message.data !== undefined) {
        let currentTurnIndex = message.data;

        // Get all the visible cards
        const allCards = tracker.querySelectorAll(".initCard");
        const visibleCards = Array.from(allCards).filter(card => card.style.display !== 'none');
        
        // If currentTurnIndex is marked as 'none', use the last visible card's index
        if (currentTurnIndex === 'none' || currentTurnIndex < 0 || currentTurnIndex >= allCards.length) {
            // Use the last visible card
            currentTurnIndex = visibleCards.length > 0 ? allCards.indexOf(visibleCards[visibleCards.length - 1]) : 0;
        }

        // Remove 'current-turn' from all cards
        allCards.forEach(card => {
            card.classList.remove('current-turn');
        });

        // Add 'current-turn' to the active card
        const currentCard = allCards[currentTurnIndex];
        if (currentCard) {
            currentCard.classList.add('current-turn');
        }
    } else {
        console.error("Invalid message structure:", message);
    }
}

function handleInitRound(message) {
    const roundCounter = document.querySelector('.round-counter');
    
    // Ensure the message has the correct structure
    if (message && message.data !== undefined) {
        const currentRound = message.data;

        // Use template literals for string interpolation
        roundCounter.textContent = `Round: ${currentRound}`;
        
    } else {
        console.error("Invalid message structure:", message);
    }
}



// Function to export data from the character sheet. This will allow DM's to share spells and equipment. Or allow DM's to share character sheets with their players. 
async function exportData(dataType, key) {
    let keyData
    if (dataType === "characters"){
        const allData = await loadDataFromCampaignStorage(dataType);
        keyData = allData[key];
    }
    else{
        const allData = await loadDataFromGlobalStorage(dataType);
        console.log(allData)
        keyData = allData[key];
    }
   
    // Wrap the character data with its key
    const jsonWithKey = { [key]: keyData};

    const jsonString = JSON.stringify(jsonWithKey, null, 2);
    try {
        await navigator.clipboard.writeText(jsonString);
        showErrorModal(`Exported: '${key}' has been copied to clipboard:`,5000);
    } catch (error) {
        console.error("Failed to copy data to clipboard:", error);
    }
}

document.getElementById('exportCharacterData').addEventListener("click", async () => {
    const characterKey = document.getElementById("customCharacterSelect").value;
    exportData("characters",characterKey);
});
document.getElementById('exportCustomSpell').addEventListener("click", async () => {
    const spellKey = document.getElementById("customSpellSelect").value;
    exportData("Custom Spells",spellKey);
});
document.getElementById('exportCustomItem').addEventListener("click", async () => {
    const itemKey = document.getElementById("customItemSelect").value;
    exportData("Custom Equipment",itemKey);
});





function loadAndDisplayCharaceter() {
    loadDataFromCampaignStorage("characters")
        .then((items) => {
            const characterSelect = document.getElementById("customCharacterSelect");
            characterSelect.innerHTML = ""; // Clear existing options

            // Populate dropdown with items names
            for (const itemName in items) {
                const option = document.createElement("option");
                option.value = itemName;
                option.textContent = itemName;
                characterSelect.appendChild(option);
            }

        })
        .catch((error) => {
            console.error("Failed to load custom characters:", error);
        });
}






document.getElementById("importCharacterData").addEventListener("click", () => {
    document.getElementById("importModal").style.display = "flex";
    document.getElementById("importTitle").textContent = "Import Character Data"
    document.getElementById("importTitle").setAttribute("data-type", "characters")
});
document.getElementById("importCustomSpell").addEventListener("click", () => {
    document.getElementById("importModal").style.display = "flex";
    document.getElementById("importTitle").textContent = "Import Spell Data"
    document.getElementById("importTitle").setAttribute('data-type', "Custom Spells")
});

document.getElementById("importCustomItem").addEventListener("click", () => {
    document.getElementById("importModal").style.display = "flex";
    document.getElementById("importTitle").textContent = "Import Item Data"
    document.getElementById("importTitle").setAttribute('data-type', "Custom Equipment")
});



// Close the modal when the cancel button is clicked
document.getElementById("importCancelButton").addEventListener("click", () => {
    document.getElementById("importModal").style.display = "none";
});



// Handle saving the imported data
document.getElementById("importSaveButton").addEventListener("click", async () => {
    const importTextArea = document.getElementById("importTextArea");
    const importDataType = document.getElementById("importTitle").getAttribute('data-type')
    console.log(importDataType)
    const data = importTextArea.value;

    try {
        // Parse the JSON data
        const parsedData = JSON.parse(data);

        // Extract the character key and data
        const key = Object.keys(parsedData)[0];
        const dataInfo = parsedData[key];

        if (importDataType === "character"){
            // Save the character data using the specified function
            saveToCampaignStorage(importDataType, key, dataInfo, true);
        }
        else if (importDataType === "Custom Spells" || importDataType === "Custom Equipment") {
            saveToGlobalStorage(importDataType, key, dataInfo, true);
        }
        else{
            showErrorModal("Invalid dataType. Please check the format and try again.");
        }

        

        // Close the modal and clear the text area
        document.getElementById("importModal").style.display = "none";
        importTextArea.value = "";

        showErrorModal(`'${importDataType}' data for '${key}' successfully imported and saved.`);
    } catch (error) {
        console.error("Failed to import data:", error);
        showErrorModal("Invalid data. Please check the format and try again.");
    }
});