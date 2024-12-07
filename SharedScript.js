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


const translations = {
    eng: {
        //Spell Section
        spellModLabel: "Spell Mod:",
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
        }, {})

    },
    es: {
        //Spell Section
        spellModLabel: "Modificador:",
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
        CantripHitDCHeader: "Golpe/CD",
        CantripDiceHeader: "Dados",
        CantripConcentrationHeader: "Conc",
        CantripNotesHeader: "Notas",
        CantripDeleteHeader: "Elim",

        '1st-levelSpellNameHeader': "Nombre",
        '1st-levelTimeHeader': "Tiempo",
        '1st-levelHitDCHeader': "Golpe/CD",
        '1st-levelDiceHeader': "Dados",
        '1st-levelConcentrationHeader': "Conc",
        '1st-levelNotesHeader': "Notas",
        '1st-levelDeleteHeader': "Elim",

        '2nd-levelSpellNameHeader': "Nombre",
        '2nd-levelTimeHeader': "Tiempo",
        '2nd-levelHitDCHeader': "Golpe/CD",
        '2nd-levelDiceHeader': "Dados",
        '2nd-levelConcentrationHeader': "Conc",
        '2nd-levelNotesHeader': "Notas",
        '2nd-levelDeleteHeader': "Elim",

        '3rd-levelSpellNameHeader': "Nombre",
        '3rd-levelTimeHeader': "Tiempo",
        '3rd-levelHitDCHeader': "Golpe/CD",
        '3rd-levelDiceHeader': "Dados",
        '3rd-levelConcentrationHeader': "Conc",
        '3rd-levelNotesHeader': "Notas",
        '3rd-levelDeleteHeader': "Elim",

        ...Array.from({ length: 6 }, (_, i) => i + 4).reduce((acc, level) => {
            acc[`${level}th-levelSpellNameHeader`] = "Nombre";
            acc[`${level}th-levelTimeHeader`] = "Tiempo";
            acc[`${level}th-levelHitDCHeader`] = "Golpe/CD";
            acc[`${level}th-levelDiceHeader`] = "Dados";
            acc[`${level}th-levelConcentrationHeader`] = "Conc";
            acc[`${level}th-levelNotesHeader`] = "Notas";
            acc[`${level}th-levelDeleteHeader`] = "Elim";
            return acc;
        }, {})
    }
};



function setLanguage(language) {
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
}

// Event listeners for language buttons
document.getElementById('languageEngButton').addEventListener('click', () => setLanguage('eng'));
document.getElementById('languageEspButton').addEventListener('click', () => setLanguage('es'));

// Default language on load
// setLanguage('eng');

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

function testerforclients(){
    return clients
}


function handleClientEvents(eventResponse) {
    let client = eventResponse.payload.client;
    let name = eventResponse.payload.client.player.name;
    TS.clients.isMe(client.id).then((isMe) => {
        console.log("client event changed")
        switch (eventResponse.kind) {
            case "clientJoinedBoard":
                if (!isMe) {
                    addClient(client);
                }
                break;
            case "clientLeftBoard":
                if (!isMe) {
                    removeClient(client.id);
                }
                break;
            case "clientModeChanged":
                if (isMe) {
                    if (eventResponse.payload.clientMode == "gm") {
                        console.log("swtiched to GM mode")
                        window.open("DMScreen.html")

                    } else {
                        console.log("swtiched to player mode")
                        window.open("PlayerCharacter.html")
                    }
                } else {
                    addClient(client);
                }
                break;
            default:
                break;
        }
    }).catch((response) => {
        console.error("error on trying to see whether client is own client", response);
    });
}

function addClient(client) {
    TS.clients.isMe(client.id).then((isMe) => {
        if (!isMe) {
            clients.push({ id: client.id, name: client.player.name });
            console.log(clients);
        }
    });
}

function removeClient(clientId) {
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        clients.splice(index, 1);
        console.log(`Removed client with id: ${clientId}`);
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


    
    //Initialize spell List
    AppData.spellLookupInfo = await readSpellJson();
    AppData.monsterLookupInfo = await readMonsterJsonList();
    AppData.equipmentLookupInfo = await readEquipmentJson();

    console.log(AppData.equipmentLookupInfo)

    const owner = await TS.clients.whoAmI();  
    const ownerInfoArray = await TS.clients.getMoreInfo([owner.id]);
    const ownerInfo = ownerInfoArray[0];
    
    if (ownerInfo.clientMode === "gm") {
        console.log("GMing is awesome");
        establishMonsterData()
    }
    else{
        await playerSetUP();
        // loadAndDisplayCharacter("Tryn");
        loadAndPickaCharacter()
    }
    rollableButtons();

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
            
                    container.appendChild(label);
                    container.appendChild(button);
                } else {
                    // Check for spell names within the part
                    let remainingText = part;
                    if(spell){
                        AppData.spellLookupInfo?.spellsData.forEach(spell => {
                            const spellName = spell.name;

                            // Create a regex for the spell name with word boundaries
                            const spellRegex = new RegExp(`\\b${spellName}\\b`, 'i');
                            const spellIndex = remainingText.search(spellRegex);
    
                            if (spellIndex !== -1) {
                                // If a spell name is found, split the text and insert the hoverable element for the spell
                                const beforeSpell = remainingText.slice(0, spellIndex);
                                const afterSpell = remainingText.slice(spellIndex + spellName.length);
    
                                // Add the text before the spell name
                                if (beforeSpell) container.appendChild(document.createTextNode(beforeSpell));
    
                                // Create and append the spell element
                                const spellElement = document.createElement('span');
                                spellElement.classList.add('spell-hover');
                                spellElement.style.textDecoration = 'underline';
                                spellElement.textContent = spellName;
    
                                // Store the description in a data attribute for the custom tooltip
                                spellElement.setAttribute('data-desc', spell.desc);
    
                                // Timer to delay showing the tooltip
                                let hoverTimer;
    
                                // Add event listeners for hover
                                spellElement.addEventListener('mouseenter', () => {
                                    hoverTimer = setTimeout(() => {
                                        spellElement.classList.add('show-tooltip');
                                    }, 250); // Adjust the delay time (in milliseconds) as needed
                                });
    
                                spellElement.addEventListener('mouseleave', () => {
                                    clearTimeout(hoverTimer); // Clear the timer when leaving hover
                                    spellElement.classList.remove('show-tooltip');
                                });
    
                                container.appendChild(spellElement);
    
                                // Update the remaining text to process
                                remainingText = afterSpell;
                            }
                        });
                    }
                    // Add the remaining text after the spell name (if any)
                    if (remainingText) {
                        container.appendChild(document.createTextNode(remainingText));
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
                    const diceValue = parseInt(label.getAttribute('value'), 10);
                    const diceType = label.getAttribute('data-dice-type');
                    const diceName = label.getAttribute('data-name');

                    // Check if there are multiple dice types separated by '/'
                    const diceGroups = diceType.split('/');
                    // Split dice names by '/'
                    const diceNames = diceName.split('/');
                    
                    // Check the current advantage/disadvantage state and adjust the dice type accordingly
                    const isAdvantage = toggleContainer.querySelector("#advButton").classList.contains("active");
                    const isDisadvantage = toggleContainer.querySelector("#disadvButton").classList.contains("active");
                    
                    let type = "normal";
                    let diceRolls = []; // Array to hold all dice rolls for this spell
                    let blessRoll = ""; // For Bless or Guidance
                    let baneRoll = ""; // For Bane

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
                        console.log('No active monster selected.');
                        conditionTrackerDiv = document.getElementById('conditionTracker');
                        conditionsSet = conditionsMap.get(conditionTrackerDiv);
                    }

                    // Check for conditions in the conditionsMap
                    // const conditionTrackerDiv = document.getElementById('conditionTracker');
                    // const conditionsSet = conditionsMap.get(conditionTrackerDiv);
                    
                    if (diceGroups.some(group => group.includes('d20'))) {
                        if (isAdvantage) {
                            type = "advantage";
                        } else if (isDisadvantage) {
                            type = "disadvantage";
                        }

                        // Handle Bless, Guidance, and Bane separately
                        if (conditionsSet) {
                            if (conditionsSet.has('Bless') || conditionsSet.has('Guidance')) {
                                blessRoll = "1d4"; // Store the Bless or Guidance roll separately
                            }
                            if (conditionsSet.has('Bane')) {
                                baneRoll = "1d4"; // Store the Bane roll separately
                            }
                        }
                    }

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




function saveToGlobalStorage(dataType, dataId, data, shouldCheck) {
    // Load the existing data from global storage
    TS.localStorage.global.getBlob()
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
                TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));
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
                TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));

                // Display a message
                if (shouldCheck) {
                    //errorModal("Saved " + dataType); // Indicate that the data was saved or updated
                    //onInit(); // Perform any necessary initialization or updates
                }
            }
        });
}







// Retrieve data from global storage
function loadDataFromGlobalStorage(dataType) {
    console.log("loading Global Storage")
    return new Promise((resolve, reject) => {
        TS.localStorage.global.getBlob()
            .then((data) => {
                if (data) {
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
function showErrorModal(errorMessage) {
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

    // Automatically hide modal after 2 seconds
    setTimeout(() => {
        modal.style.display = 'none';
    }, 2000);
}





// Delete data from global storage
function removeFromGlobalStorage(dataType, dataId) {
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
                            errorModal('Data deleted from global storage');
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







let exists = false
function errorModal(modalText){
    const errorModal = document.getElementById('errorModal');
    console.log(errorModal)
    const closeModal = errorModal.querySelector('.close');
    const modalContent = errorModal.querySelector('.modal-content p')

    modalContent.textContent = modalText;

    errorModal.style.display = 'block';

    // Close the error modal
    closeModal.addEventListener('click', function() {
        errorModal.style.display = 'none';
    });
    
    if(exists === true){
        // Show the "Remove Monster" button
        const removeButton = errorModal.querySelector('#removeButton');
        removeButton.style.display = 'block';
    }
    else{
        removeButton.style.display = 'none';
    }

    exists = false; // Reset the global variable
}





// read the JSON file spells.json and save the data and names to variables
async function readSpellJson() {
    try {
        const allSpellData = await loadDataFromGlobalStorage("spells"); // Load data from global storage
        const isGlobalDataAnObject = typeof allSpellData === 'object';

        // Fetch the data from the JSON file
        const response = await fetch('spells.json');
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
        const response = await fetch('Monster_Manual.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const monsterData = await response.json();
        const allCreatureData = (await loadDataFromGlobalStorage("monsters"));

        // Combine the data from global storage and the JSON file
        const combinedData = {
            ...allCreatureData,
            ...monsterData
        };

        // Extract monster names from the combined data
        const monsterNames = Object.keys(combinedData);

        // Log and return the data
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
        const allequipmentData = await loadDataFromGlobalStorage("equipment"); 
        const isGlobalDataAnObject = typeof allequipmentData === 'object';

        // Fetch the data from the JSON file
        const response = await fetch('equipment.json');
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
        console.log('Equipment data loaded successfully:', AppData.equipmentLookupInfo);

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
