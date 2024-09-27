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


//Creating an array of all singleton objects that will be used throughout this project to only read from the JSON files once.
const AppData = {
    spellLookupInfo: null,
    monsterLookupInfo:null,
};


document.getElementById('settings-toggle').addEventListener('click', function() {
    const settingsContainer = document.getElementById('settings-container');
    settingsContainer.classList.toggle('active');
});




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
                    clients.splice(clients.indexOf({ id: client.id, name: name }), 1);
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
    console.log(client)
    TS.clients.isMe(client.id).then((isMe) => {
        if (!isMe) {
            let newPlayerSelect = document.createElement("option");
            newPlayerSelect.value = client.id;
            newPlayerSelect.innerText = client.player.name;
            console.log(newPlayerSelect)
            document.getElementById("recipient-select").appendChild(newPlayerSelect);

            clients.push({ id: client.id, name: client.name });
        }
    });
}

async function onStateChangeEvent(msg) {
    if (msg.kind === "hasInitialized") {
        console.log("hasIntitialized")
        //the TS Symbiote API has initialized and we can begin the setup. think of this as "init".
        onInit()
    }
}

async function logSymbioteEvent(){
    console.log("weee")
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

function parseAndReplaceDice(action, text) {
    const diceRegex = /(\d+d\d+\s*(?:[+-]\s*\d+)?)|([+-]\s*\d+)/g;
    
    // Create a temporary container to parse the HTML and text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;

    const container = document.createElement('span');

    // Iterate over all child nodes in the tempDiv
    Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Process text nodes
            const parts = node.textContent.split(diceRegex).filter(part => part); // Split by dice regex

            for (const part of parts) {
                if (diceRegex.test(part)) {
                    // Create the label
                    const label = document.createElement('label');
                    label.classList.add('actionButtonLabel');
                    const diceName = action.Name !== undefined ? action.Name : (action.name || 'Unnamed Action');
                    const diceRoll = part.replace(/[()\s]/g, '');

                    label.setAttribute('value', part); // Assuming `part` is the modifier value
                    label.setAttribute('data-dice-type', /^\d+d\d+(\s*[+-]\s*\d+)?$/.test(diceRoll) ? diceRoll : `1d20${diceRoll}`);
                    label.setAttribute('data-name', diceName);

                    // Create the button
                    const button = document.createElement('button');
                    button.classList.add('actionButton');
                    button.textContent = part;

                    // Append the label and button to the container
                    container.appendChild(label);
                    container.appendChild(button);
                } else {
                    // Append plain text parts
                    container.appendChild(document.createTextNode(part));
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
    console.log(resultGroups)
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
    
    modalMessage.textContent = errorMessage;
    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 4000);
}





// Delete data from global storage
function removeFromGlobalStorage(dataType, dataId) {
    return TS.localStorage.global.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }

            console.log("Current characters before deletion:", allData[dataType]);

            if (allData[dataType]) {
                if (allData[dataType][dataId]) {
                    console.time('Deletion Time');
                    console.log("Deleting character:", dataId);
                    delete allData[dataType][dataId]; // Attempt to delete
                    console.timeEnd('Deletion Time');
                    console.log("Characters after deletion attempt:", allData[dataType]); // Log after attempt

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
