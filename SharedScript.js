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



//Creating an array of all singleton objects that will be used throughout this project to only read from the JSON files once.
const AppData = {
    spellLookupInfo: null,
};


document.getElementById('settings-toggle').addEventListener('click', function() {
    console.log("click")
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
TS.clients.isMe(client.id).then((isMe) => {
    if (!isMe) {
        let newPlayerSelect = document.createElement("option");
        newPlayerSelect.value = client.id;
        newPlayerSelect.innerText = client.player.name;
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
    let clients = await TS.clients.getClientsInThisBoard();
    if (!clients.cause) {
        //if "cause" is undefined this means our call succeeded
        for (let client of clients) {
            TS.clients.isMe(client.id).then((isMe) => {
                if (isMe) {
                    TS.clients.getMoreInfo([client.id]).then((response) => {
                        if (response[0].clientMode == "gm") {
                            console.log("isGM");
                            //window.open("DMScreen.html")
                        }
                        else{
                            console.log("isPlayer");
                            //window.open("PlayerCharacter.html")
                        }
                    }).catch((response) => {
                        console.error("error on trying to get info", response);
                    });
                } else {
                    addClient(client);
                }
            }).catch((response) => {
                console.error("error on trying to see whether client is own client", response);
            });
        }
    }
}
}

let contentPacks = null;

async function onInit() {
    console.log("onInit")
    setupNav();
    loadAndDisplayCharacter("Tryn");
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
    await playerSetUP();
    rollableButtons();

    //Initialize spell List
    AppData.spellLookupInfo = await readSpellJson();
}

//Function for parsing text and creating a rollable button.
function parseAndReplaceDice(action, text) {
    const diceRegex = /(\d+d\d+\s*(?:[+-]\s*\d+)?)|([+-]\s*\d+)/g;
    const parts = text.split(diceRegex).filter(part => part); // Filter out empty or undefined parts

    const container = document.createElement('span');

    for (const part of parts) {
        if (diceRegex.test(part)) {
            const button = document.createElement('button');
            button.classList.add('action-button');
            const diceName = action.Name !== undefined ? action.Name : (action.name || 'Unnamed Action');
            button.textContent = part;
            let diceRoll = part.replace(/[()\s]/g, '');

            if (!/^\d+d\d+(\s*[+-]\s*\d+)?$/.test(diceRoll)) {
                diceRoll = `1d20${diceRoll}`;
            }

            button.addEventListener('click', function () {
                diceRoller(diceName, diceRoll);
            });

            container.appendChild(button);
        } else {
            const textNode = document.createTextNode(part);
            container.appendChild(textNode);
        }
    }

    return container;
}


function rollableButtons() {
    const actionButtons = document.getElementsByClassName("actionButton");

    // Use a forEach loop to add a click event listener to each button
    Array.from(actionButtons).forEach(button => {
        if (!button.hasRollableButtonListener) {
            button.addEventListener('click', function () {

                const label = button.previousElementSibling;

                if (label && label.classList.contains('actionButtonLabel')) {
                    // Extract the desired attributes from the label
                    const diceValue = parseInt(label.getAttribute('value'), 10);
                    const diceType = label.getAttribute('data-dice-type');
                    const diceName = label.getAttribute('data-name');

                    // Check the current advantage/disadvantage state and adjust the dice type accordingly
                    const isAdvantage = toggleContainer.querySelector("#advButton").classList.contains("active");
                    const isDisadvantage = toggleContainer.querySelector("#disadvButton").classList.contains("active");

                    let type = "normal";
                    if (isAdvantage) {
                        // Rolling with advantage (roll two dice and keep the higher)
                        type = "advantage";
                    } else if (isDisadvantage) {
                        // Rolling with disadvantage (roll two dice and keep the lower)
                        type = "disadvantage";
                    }

                    const diceRoll = dicePacker(diceType, diceValue);

                    console.log(diceRoll);

                    roll(diceName, diceRoll, type);
                } else {
                    console.log("Dice Label not found");
                }
            });

            button.hasRollableButtonListener = true;
        }
    });
}



let trackedIds = {};


//packs dice rolls for diceRoller to roll into talespire.
function dicePacker(diceType,diceModifier){
                
    let sign = "";
    if (diceModifier >= 0) {
        sign = "+";
    }
    
    const diceRoll = diceType + sign + diceModifier;
    return diceRoll
}


function roll(diceName, diceRoll, type) {
    let typeStr = type == "advantage" ? " (Adv)" : type == "disadvantage" ? " (Disadv)" : " (Normal)";

    if (type === "normal") {
        // Roll normally (only one set of dice)
        TS.dice.putDiceInTray([{ name: diceName + typeStr, roll: diceRoll }], true).then((diceSetResponse) => {
            trackedIds[diceSetResponse] = type;
        });
    } else {
        TS.dice.putDiceInTray([{ name: diceName + typeStr, roll: diceRoll }, { name: diceName + typeStr, roll: diceRoll }], true).then((diceSetResponse) => {
            trackedIds[diceSetResponse] = type;
        });
    }
}


async function handleRollResult(rollEvent) {
    if (trackedIds[rollEvent.payload.rollId] == undefined) {
        // If we haven't tracked that roll, ignore it because it's not from us
        return;
    }

    if (rollEvent.kind == "rollResults") {
        // User rolled the dice we tracked and there's a new result for us to look at
        let roll = rollEvent.payload;
        let finalResult = 0;
        let resultGroup = {};
        
        if (roll.resultsGroups != undefined) {
            if (trackedIds[roll.rollId] == "advantage") {
                // The incoming roll was stored as an advantage roll
                let max = 0;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    // If you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum > max) {
                        max = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = max;
            } else if (trackedIds[roll.rollId] == "disadvantage") {
                // The incoming roll was stored as a disadvantage roll
                let min = Number.MAX_SAFE_INTEGER;
                for (let group of roll.resultsGroups) {
                    let groupSum = await TS.dice.evaluateDiceResultsGroup(group);
                    // If you want to check if the result returned here has an error, checking for groupSum.cause != undefined works
                    if (groupSum < min) {
                        min = groupSum;
                        resultGroup = group;
                    }
                }
                finalResult = min == Number.MAX_SAFE_INTEGER ? 0 : min;
            } else if (trackedIds[roll.rollId] == "normal" && roll.resultsGroups.length === 1) {
                // Handle normal rolls with a single result group
                resultGroup = roll.resultsGroups[0];
                finalResult = await TS.dice.evaluateDiceResultsGroup(resultGroup);
            } else {
                return;
            }
        }
        
        console.log(resultGroup, roll.rollId);
        // finalResult remains unused in this example, but could be useful for other applications
        displayResult(resultGroup, roll.rollId);
    } else if (rollEvent.kind == "rollRemoved") {
        // If you want special handling when the user doesn't roll the dice
    }
}


async function displayResult(resultGroup, rollId) {
    if (resultGroup.length < 2) {
        console.log("resultGroup length is less than 2");
    }
    if (resultGroup.length < 1) {
        console.log("resultGroup length is less than 1");
    }

    console.log("displaying Roll");
    TS.dice.sendDiceResult([resultGroup], rollId).catch((response) => console.error("error in sending dice result", response));
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
    // Load the existing data from global storage
    TS.localStorage.global.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }

            // Check if the dataType property exists
            if (allData[dataType]) {
                // Check if the dataId exists for this dataType
                if (allData[dataType][dataId]) {
                    // Data exists, so remove it
                    delete allData[dataType][dataId];

                    // Save the updated data back to global storage
                    TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));

                    // Show a success message
                    errorModal('Data deleted from global storage');
                } else {
                    // DataId doesn't exist, show an error message
                    errorModal('DataId not found in global storage');
                }
            } else {
                // DataType doesn't exist, show an error message
                errorModal('DataType not found in global storage');
            }
        })
        .catch((error) => {
            // Handle any errors that occur during the process
            errorModal('Failed to delete data from global storage: ' + error);
        });
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
