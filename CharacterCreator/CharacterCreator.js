// Character Creator JavaScript
// This file is the entry point for the character creator.
// It also sets up the event listeners for the character creator.
// It also handles some global tasks like vuplex and scroll to element.


// Global variables
let classesData = {};
let racesData = {};
let featsData = {};
// Dynamic classesData variable that updates based on current selections for saving
let saveClassesData = {};

let currentCharacter = {
    name: "",
    class: "",
    subclass: "",
    race: "",
    level: 1,
    isMulticlassing: false,
    // NEW: Multiclassing support
    classes: [], // Array of { className, subclass, level, features, choices }
    totalLevel: 1, // Sum of all class levels
    abilities: {
        strength: 8,
        dexterity: 8,
        constitution: 8,
        intelligence: 8,
        wisdom: 8,
        charisma: 8
    },
    // Track bonuses separately so base scores aren't overwritten
    abilityBonuses: {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0
    },
    // Store sources for each bonus (array of { value, source })
    abilityBonusSources: {
        strength: [],
        dexterity: [],
        constitution: [],
        intelligence: [],
        wisdom: [],
        charisma: []
    },
    trueAbilities: {
        strength: 15,
        dexterity: 14,
        constitution: 13,
        intelligence: 12,
        wisdom: 10,
        charisma: 8
    },
    abilityScoreMethod: "manual", // "manual", "standard-array", "point-buy"
    rolledAbilityScores: [], // Store rolled scores for manual method
    individualRolls: [], // Store individual 4d6 rolls for display
    pointBuyPoints: 27, // Available points for point buy
    pointBuyCosts: {}, // Track cost of each ability score
    hitPoints: 0,
    trueHitPoints: 0, // Max hit points before any bonuses
    hitPointsCalculationMethod: "average", // "average" or "rolled"
    rolledHitPoints: {}, // Store rolled HP for each level
    hitPointsRollCount: 0, // Track how many times HP was rolled
    hitPointsBonuses: [], // Track bonuses from feats, races, etc.
    rerollOnesHitDice: false, // Whether to reroll 1s on hit dice
    armorClass: 10,
    proficiencyBonus: 2,
    savingThrows: {},
    skills: {
        proficiencies: [],
        sources: {} // Track where each skill came from
    },
    languages: {
        proficiencies: [],
        sources: {} // Track where each language came from
    },
    features: [],
    choices: {},
    equipment: [],
    spells: {
        known: [],
        cantrips: [],
        slots: {}
    },
    notes: "",
    statBonuses: {
        attributes: {
            STR: [], DEX: [], CON: [], INT: [], WIS: [], CHA: []
        }
    }
};


//Creating an array of all singleton objects that will be used throughout this project to only read from the JSON files once.
const AppData = {
    spellLookupInfo: null,
    monsterLookupInfo: null,
    equipmentLookupInfo: null,
};

let savedLanguage = "eng";
let languageData = null;
// Initialize the character creator
async function initializeCharacterCreator() {
    
    try {
        
        await loadClassesData();
        await loadRacesData();
        await loadFeatsData();
        setupEventListeners();
        displayClassSelection();
        displaySpeciesSelection();
        displayAbilityScores(); // Initialize the abilities tab

        await loadLanguageData();
        await loadSpellDataFiles();
        
        
        // Set initial visibility of reroll ones checkbox
        const rerollOnesContainer = document.getElementById('rerollOnesContainer');
        if (rerollOnesContainer) {
            if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
                rerollOnesContainer.classList.remove('hidden');
            } else {
                rerollOnesContainer.classList.add('hidden');
            }
        }
        
    } catch (error) {
        console.error('Error initializing character creator:', error);
        showError('Failed to load character creation data. Please try again.');
    }
}

function getVariableSize(variable) {
    try {
        // Convert the variable to a JSON string and calculate its byte size
        const jsonString = JSON.stringify(variable);
        return new Blob([jsonString]).size; // Get the size in bytes
    } catch (error) {
        console.error("Error calculating size of variable:", error);
        return 0; // Return 0 bytes if there's an error
    }
}
async function loadLanguageData(){
    languageData = await loadDataFromGlobalStorage("language");
    // Extract "Preferred Language" and validate it
    savedLanguage = languageData?.["Preferred Language"];
    if (savedLanguage !== "eng" && savedLanguage !== "es") {
        savedLanguage = "eng"; // Default to "eng" if not valid
    }
    console.log(savedLanguage);
}
let globalFileSize = 0;
// Retrieve data from global storage
function loadDataFromGlobalStorage(dataType) {
    console.log("loading Global Storage")
    return new Promise((resolve, reject) => {
        TS.localStorage.global.getBlob()
            .then((data) => {
                if (data) {
                    globalFileSize = getVariableSize(data) // Blob size in bytes
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




async function loadSpellDataFiles(){
    AppData.spellLookupInfo = await readSpellJson();
    console.log(AppData.spellLookupInfo)
}

// read the JSON file spells.json and save the data and names to variables
async function readSpellJson() {
    try {
        const allSpellData = await loadDataFromGlobalStorage("Custom Spells");
        const isGlobalDataAnObject = typeof allSpellData === 'object';

        const response = await fetch(`../spells-${savedLanguage}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        const spellsData = await response.json();

        let combinedData = isGlobalDataAnObject 
            ? Object.values(allSpellData)
            : allSpellData;
        
        combinedData = [...combinedData, ...spellsData];

        const versionData = await loadDataFromGlobalStorage("D&DVersion");
        const versionSetting = versionData?.Version || '2014';

        console.log(versionSetting);
        
        // Add version filtering
        let filteredData = combinedData.filter(spell => {
            const spellYear = spell.year || '2014';
            if (versionSetting === 'both') return true;
            return spellYear === versionSetting;
        });

        // Modify spell objects when both versions are selected
        if (versionSetting === 'both') {
            // Create a map to track spell name occurrences
            const spellCountMap = {};
            
            filteredData = filteredData.map(spell => {
                // Create a copy of the spell object to avoid mutation
                const modifiedSpell = {...spell};
                
                const year = modifiedSpell.year || '2014';
                const symbol = year === '2014' ? '' : ' 🜁';
                
                // Count occurrences to handle duplicates
                const count = spellCountMap[modifiedSpell.name] || 0;
                spellCountMap[modifiedSpell.name] = count + 1;
                
                // Append symbol to the spell name
                modifiedSpell.name += symbol;
                
                return modifiedSpell;
            });
        }

        // Extract spell names from the modified/filtered data
        const spellNames = filteredData.map(spell => spell.name);

        return {
            spellNames: spellNames,
            spellsData: filteredData
        };
        
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Character name input
    const nameInput = document.getElementById('characterName');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            currentCharacter.name = e.target.value;
        });
    }

    // Level input
    const levelInput = document.getElementById('characterLevel');
    if (levelInput) {
        levelInput.addEventListener('change', (e) => {
            const newLevel = parseInt(e.target.value);
            if (newLevel >= 1 && newLevel <= 20) {
                currentCharacter.level = newLevel;
                updateCharacterForLevel();
            }
        });
    }

    // Ability score inputs are now handled by the dynamic interface
    // Old event listeners removed - they're set up in updateAbilityScoreInterface()

    // Save character button
    const saveButton = document.getElementById('saveCharacter');
    if (saveButton) {
        saveButton.addEventListener('click', saveCharacter);
    }

    // Load character button
    const loadButton = document.getElementById('loadCharacter');
    if (loadButton) {
        loadButton.addEventListener('click', loadCharacter);
    }

    // Hit points calculation method
    const hitPointsMethodSelect = document.getElementById('hitPointsMethod');
    if (hitPointsMethodSelect) {
        hitPointsMethodSelect.addEventListener('change', (e) => {
            currentCharacter.hitPointsCalculationMethod = e.target.value;
            updateHitPoints();
            
            // Show/hide rolled interface based on method
            const rolledContainer = document.getElementById('rolledHitPointsContainer');
            const rerollOnesContainer = document.getElementById('rerollOnesContainer');

            console.log(rerollOnesContainer, e.target.value);
            
            if (e.target.value === 'rolled') {
                // Show reroll ones option
                if (rerollOnesContainer) {
                    rerollOnesContainer.classList.remove('hidden');
                }
                renderRolledHitPointsInterface();
                
            } else {
                // Remove any existing rolled HP containers
                const singleRolledContainer = document.getElementById('rolledHitPointsContainer');
                const multiRolledContainer = document.getElementById('multiclassRolledHitPointsContainer');
                
                if (singleRolledContainer) {
                    singleRolledContainer.remove();
                }
                if (multiRolledContainer) {
                    multiRolledContainer.remove();
                }
                
                // Hide reroll ones option
                if (rerollOnesContainer) {
                    rerollOnesContainer.classList.add('hidden');
                }
            }
        });
        
        // Initialize the visibility based on the current method
        const rerollOnesContainer = document.getElementById('rerollOnesContainer');
        if (rerollOnesContainer) {
            if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
                rerollOnesContainer.classList.remove('hidden');
            } else {
                rerollOnesContainer.classList.add('hidden');
            }
        }
    }
    
    // Reroll ones on hit dice checkbox
    const rerollOnesCheckbox = document.getElementById('rerollOnesHitDice');
    if (rerollOnesCheckbox) {
        rerollOnesCheckbox.checked = currentCharacter.rerollOnesHitDice;
        rerollOnesCheckbox.addEventListener('change', (e) => {
            currentCharacter.rerollOnesHitDice = e.target.checked;
        });
    }

    // Ability score generation method
    const abilityScoreMethodSelect = document.getElementById('abilityScoreMethod');
    if (abilityScoreMethodSelect) {
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        abilityScoreMethodSelect.addEventListener('change', (e) => {
            console.log('=== ABILITY SCORE METHOD CHANGED ===');
            console.log('New method:', e.target.value);
            // Reset all ability scores to 8 when changing methods
            abilities.forEach(ability => {
                currentCharacter.abilities[ability] = 8;
            });
            currentCharacter.abilityScoreMethod = e.target.value;
            updateAbilityScoreInterface();
            updateAbilityTotalsUI();
        });
    }
}




function showConfirm(message) {
    return new Promise(resolve => {
        const modal   = document.getElementById('confirmModal');
        const msg     = document.getElementById('confirmMessage');
        const yesBtn  = document.getElementById('confirmYes');
        const noBtn   = document.getElementById('confirmNo');

        msg.textContent = message;
        modal.classList.remove('hidden');

        function cleanup() {
        yesBtn.removeEventListener('click', onYes);
        noBtn.removeEventListener('click', onNo);
        modal.classList.add('hidden');
        }
        function onYes() { cleanup(); resolve(true); }
        function onNo()  { cleanup(); resolve(false); }

        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    });
}



// Completely clear out a container by ID
function clearElement(elementId) {
    const el = document.getElementById(elementId);
    while (el.firstChild) el.removeChild(el.firstChild);
}







/**
 * Renders a simple collapsible card for any named feature.
 * @param parent    – container to append into
 * @param titleText – feature name (e.g. "Second Wind")
 * @param descText  – feature description
 * @param idBase    – unique base for IDs
 */

/**
 * Renders a simple collapsible card for any feature/choice.
 * Returns { header, body } so callers can append into them directly.
 */
// Helper function to render a simple card with header and body
//This is shared code for both classes and races and will be for backgrounds as well. 
function renderSimpleCard(parent, title, content, id) {
    const card = document.createElement('div');
    card.className = 'feature-card';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = title;
    if (id) {
        header.id = `${id}-title`;
    }
    header.onclick = () => {
        body.classList.toggle('hidden');
        header.classList.toggle('open');
    };
    card.appendChild(header);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'card-body';
    if (id) {
        body.id = `${id}-body`;
    }
    
    // Add content
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        body.appendChild(content);
    }
    
    card.appendChild(body);
    parent.appendChild(card);
    
    return { card, header, body };
}



function renderChoices(parent, level, choiceKey, choiceDef) {
    // Sanitize the choiceKey so generated IDs are always valid CSS selectors
    const safeKey  = choiceKey.replace(/[^a-zA-Z0-9_-]/g, '');
    const idBase   = `choice-${safeKey}-L${level}`;
    const cardId   = `${idBase}-card`;
    const bodyId   = `${idBase}-body`;
    const statusId = `${idBase}-status`;

    // If card exists, clear old inputs/descs and rebuild primary select
    if (document.getElementById(cardId)) {
        const body   = document.getElementById(bodyId);
        const status = document.getElementById(statusId);
        body.querySelectorAll('select, p[id^="' + idBase + '-selectedDesc"]').forEach(n => n.remove());
        status.textContent = '❗';
        buildPrimarySelect(body, status, choiceDef, level, choiceKey, idBase);
        return;
    }

    // Create new card
    const { header, body } = renderSimpleCard(
        parent,
        `${choiceKey} (choose ${choiceDef.choose})`,
        choiceDef.description,
        idBase
    );

    // Status icon - insert before the title
    const status = document.createElement('span');
    status.id = statusId;
    status.classList.add('choice-status', 'incomplete');
    status.textContent = '❗';
    const title = header.querySelector(`#${idBase}-title`);
    header.insertBefore(status, title);

    // Build its primary select
    buildPrimarySelect(body, status, choiceDef, level, choiceKey, idBase);
}


/**
 * Builds the initial single-select for choiceDef.options,
 * then dispatches to ASI or Feat builders or shows a description.
 */
function buildPrimarySelect(body, status, choiceDef, level, choiceKey, idBase) {
    // remove previous primary selects
    body.querySelectorAll(`select[id^="${idBase}-primary"]`).forEach(n => n.remove());

    // Check if this is a multiple choice selection
    if (choiceDef.choose > 1) {
        buildMultipleChoiceSelect(body, status, choiceDef, level, choiceKey, idBase);
    } else {
        buildSingleChoiceSelect(body, status, choiceDef, level, choiceKey, idBase);
    }
}

/**
 * Builds a single choice selection (original behavior)
 */
function buildSingleChoiceSelect(body, status, choiceDef, level, choiceKey, idBase) {
    const select = document.createElement('select');
    select.id = `${idBase}-primary`;
    select.appendChild(new Option('-- select --','', true, true));

    choiceDef.options.forEach((opt, i) => {
        const name = typeof opt === 'string' ? opt : opt.name;
        select.appendChild(new Option(name, name));
    });

    select.onchange = () => {
        // reset status & clear old secondaries/descs
        status.textContent = '❗';
        status.className = 'choice-status incomplete';
        body.querySelectorAll(`select[id^="${idBase}-secondary"]`).forEach(n => n.remove());
        body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());

        const choice = select.value;
        
        // Only proceed if a real choice was made (not the default "-- select --" option)
        if (choice && choice !== '') {
            handleChoiceSelection(level, choiceKey, choice, choiceDef.type);

            if (choice === 'ASI') {
            ['A','B'].forEach((suffix, idx) =>
                buildASI(body, status, level, choiceKey, idBase, suffix, idx)
            );

            } else if (choice === 'Feat') {
            buildFeat(body, status, level, choiceKey, idBase);

            } else {
            // single‑option description
            const optObj = choiceDef.options.find(o => (o.name||o)===choice);
            if (optObj?.description) {
                const p = document.createElement('p');
                p.id = `${idBase}-selectedDesc`;
                p.textContent = optObj.description;
                body.appendChild(p);
            }
            status.textContent = '✔';
            status.className = 'choice-status complete';
            }
        }
    };

    body.appendChild(select);
}

/**
 * Builds a multiple choice selection interface
 */
function buildMultipleChoiceSelect(body, status, choiceDef, level, choiceKey, idBase) {
    const container = document.createElement('div');
    container.id = `${idBase}-multi-container`;
    container.className = 'multi-choice-container';
    
    // Create instruction text
    const instruction = document.createElement('p');
    instruction.textContent = `Choose ${choiceDef.choose} option${choiceDef.choose > 1 ? 's' : ''}:`;
    instruction.className = 'multi-choice-instruction';
    container.appendChild(instruction);
    
    // Create checkboxes for each option
    const selectedChoices = [];
    const checkboxes = [];
    
    choiceDef.options.forEach((opt, i) => {
        const name = typeof opt === 'string' ? opt : opt.name;
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'multi-choice-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${idBase}-option-${i}`;
        checkbox.value = name;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = name;
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        container.appendChild(optionDiv);
        
        checkboxes.push(checkbox);
        
        // Add change listener
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (selectedChoices.length < choiceDef.choose) {
                    selectedChoices.push(name);
                } else {
                    checkbox.checked = false; // Prevent selecting more than allowed
                }
            } else {
                const index = selectedChoices.indexOf(name);
                if (index > -1) {
                    selectedChoices.splice(index, 1);
                }
            }
            
            // Update status and save choices
            if (selectedChoices.length === choiceDef.choose) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
                handleChoiceSelection(level, choiceKey, selectedChoices, choiceDef.type);
                
                // Show descriptions for selected options
                body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());
                selectedChoices.forEach((choice, idx) => {
                    const optObj = choiceDef.options.find(o => (o.name||o)===choice);
                    if (optObj?.description) {
                        const p = document.createElement('p');
                        p.id = `${idBase}-selectedDesc-${idx}`;
                        p.className = 'multi-choice-description';
                        p.textContent = `${choice}: ${optObj.description}`;
                        container.appendChild(p);
                    }
                });
            } else {
                status.textContent = `❗ (${selectedChoices.length}/${choiceDef.choose})`;
                status.className = 'choice-status incomplete';
                // Clear descriptions if not fully selected
                body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());
            }
        });
    });
    
    body.appendChild(container);
}







function buildDropdown(body, idBase, choiceDef, level, choiceKey, status) {
    const select = document.createElement('select');
    select.id = `${idBase}-dropdown`;
    // blank option
    const blank = document.createElement('option');
    blank.value = ''; blank.textContent = '-- select --';
    blank.disabled = true; blank.selected = true;
    select.appendChild(blank);

    choiceDef.options.forEach((opt,i) => {
        const name = typeof opt==='string'? opt: opt.name;
        const o = document.createElement('option');
        o.value = name; o.textContent = name; o.id = `${idBase}-opt-${i}`;
        select.appendChild(o);
    });

    select.onchange = () => {
        handleChoiceSelection(level, choiceKey, select.value, choiceDef.type);
        body.querySelectorAll('#'+idBase+'-selectedDesc').forEach(el=>el.remove());

        const optObj = choiceDef.options.find(o => (o.name||o) === select.value);
        if (optObj?.description) {
        const selP = document.createElement('p');
        selP.id = `${idBase}-selectedDesc`;
        selP.textContent = optObj.description;
        body.appendChild(selP);
        }
        status.textContent = select.value ? '✔' : '❗';
        status.className = select.value ? 'choice-status complete' : 'choice-status incomplete';
    };

    body.appendChild(select);
}


// Update derived stats
function updateDerivedStats() {
    updateHitPoints();
}


// Utility functions
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 3000);
    } else {
        alert(message);
    }
}

function switchTab(tabId) {
    // Remove 'active' class from all tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Add 'active' class to the clicked tab
    const clickedTab = document.querySelector(`.nav-tab[onclick="switchTab('${tabId}')"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    // Hide all tab panes
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.classList.remove('active'));
    
    // Show the requested tab pane
    const activePane = document.getElementById(tabId);
    if (activePane) {
        activePane.classList.add('active');
    }
}

//This is shared code for both classes and races and will be for backgrounds as well. 
// Skill proficiency management functions
function addSkillProficiency(skill, source) {
    if (!currentCharacter.skills.proficiencies.includes(skill)) {
        currentCharacter.skills.proficiencies.push(skill);
        currentCharacter.skills.sources[skill] = source;
        updateSkillOptionDisplays();
    } else {
        // If skill already exists, update the source if it's different
        if (currentCharacter.skills.sources[skill] !== source) {
            currentCharacter.skills.sources[skill] = source;
            updateSkillOptionDisplays();
        }
    }
}

//This is shared code for both classes and races and will be for backgrounds as well. 
// Skill proficiency management functions
function removeSkillProficiency(skill) {
    console.warn('=== REMOVING SKILL PROFICIENCY ===');
    console.warn('Skill to remove:', skill);
    console.warn('Taken skills BEFORE removal:', [...currentCharacter.skills.proficiencies]);
    
    const index = currentCharacter.skills.proficiencies.indexOf(skill);
    if (index > -1) {
        currentCharacter.skills.proficiencies.splice(index, 1);
        delete currentCharacter.skills.sources[skill];
        
        console.warn('Taken skills AFTER removal:', [...currentCharacter.skills.proficiencies]);
        
        // Also remove from any stored choices
        Object.keys(currentCharacter.choices).forEach(choiceKey => {
            if (choiceKey.includes('skill-choice')) {
                if (Array.isArray(currentCharacter.choices[choiceKey])) {
                    const choiceIndex = currentCharacter.choices[choiceKey].indexOf(skill);
                    if (choiceIndex > -1) {
                        currentCharacter.choices[choiceKey].splice(choiceIndex, 1);
                    }
                } else if (currentCharacter.choices[choiceKey] === skill) {
                    delete currentCharacter.choices[choiceKey];
                }
            }
        });
        
        updateSkillOptionDisplays();
    } else {
        console.warn('Skill not found in proficiencies list!');
    }
}

//This is shared code for both classes and races and will be for backgrounds as well. 
function hasSkillProficiency(skill) {
    const hasSkill = currentCharacter.skills.proficiencies.includes(skill);
    return hasSkill;
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function getSkillSource(skill) {
    return currentCharacter.skills.sources[skill] || null;
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function getAvailableSkills(skillList) {
    return skillList.filter(skill => !hasSkillProficiency(skill));
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function getTakenSkills(skillList) {
    return skillList.filter(skill => hasSkillProficiency(skill));
}

//This is shared code for both classes and races and will be for backgrounds as well. 
// Language proficiency management functions
function addLanguageProficiency(language, source) {
    if (!Array.isArray(currentCharacter.languages.proficiencies)) {
        currentCharacter.languages.proficiencies = [];
    }
    if (!currentCharacter.languages.sources) {
        currentCharacter.languages.sources = {};
    }
    if (!currentCharacter.languages.proficiencies.includes(language)) {
        currentCharacter.languages.proficiencies.push(language);
        currentCharacter.languages.sources[language] = source;
    } else {
        // If language already exists, update the source if it's different
        if (currentCharacter.languages.sources[language] !== source) {
            currentCharacter.languages.sources[language] = source;
        }
    }
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function removeLanguageProficiency(language) {
    const index = currentCharacter.languages.proficiencies.indexOf(language);
    if (index > -1) {
        currentCharacter.languages.proficiencies.splice(index, 1);
        delete currentCharacter.languages.sources[language];
    }
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function hasLanguageProficiency(language) {
    return currentCharacter.languages.proficiencies.includes(language);
}
//This is shared code for both classes and races and will be for backgrounds as well. 
function getLanguageSource(language) {
    return currentCharacter.languages.sources[language] || null;
}

//This is shared code for both classes and races and will be for backgrounds as well. 
/**
 * Updates a specific dropdown's options to reflect current skill status
 */
function updateDropdownOptions(select) {
    console.warn('=== UPDATING DROPDOWN OPTIONS ===');
    console.warn('Current taken skills:', [...currentCharacter.skills.proficiencies]);
    
    Array.from(select.options).forEach(option => {
        if (option.value && option.value !== '') {
            const isTaken = hasSkillProficiency(option.value);
            const source = getSkillSource(option.value);
            const isSelected = option.selected;
            
            console.warn(`Option: ${option.value}, isTaken: ${isTaken}, isSelected: ${isSelected}`);
            
            // Don't disable options - allow duplication
            option.disabled = false;
            if (isTaken && !isSelected) {
                option.text = `${option.value} (already taken)`;
                console.warn(`Setting text to: ${option.value} (already taken)`);
            } else {
                option.text = option.value;
                console.warn(`Setting text to: ${option.value}`);
            }
        }
    });
}

//This is shared code for both classes and races and will be for backgrounds as well. 
/**
 * Updates skill option displays without re-rendering entire sections
 * This prevents duplication of class features
 */
function updateSkillOptionDisplays() {
    // Update all skill option displays to reflect current taken status
    const skillOptions = document.querySelectorAll('.skill-option');
    skillOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        const label = option.querySelector('label');
        const skill = checkbox.value;
        
        const isTaken = hasSkillProficiency(skill);
        const source = getSkillSource(skill);
        const isSelected = checkbox.checked;
        
        // Don't disable checkboxes - allow duplication
        checkbox.disabled = false;
        
        if (isTaken && !isSelected) {
            option.classList.add('skill-taken');
            label.innerHTML = `${skill} <span class="skill-source">(from ${source})</span>`;
        } else {
            option.classList.remove('skill-taken');
            label.textContent = skill;
        }
    });
    
    // Update all skill select dropdowns
    const skillSelects = document.querySelectorAll('.choice-select');
    skillSelects.forEach(select => {
        Array.from(select.options).forEach(option => {
            if (option.value && option.value !== '') {
                const isTaken = hasSkillProficiency(option.value);
                const source = getSkillSource(option.value);
                const isSelected = option.selected;
                
                // Only disable if taken by another source, not if it's currently selected
                option.disabled = isTaken && !isSelected;
                if (isTaken && !isSelected) {
                    option.text = `${option.value} (already taken)`;
                } else {
                    option.text = option.value;
                }
            }
        });
    });
    
    // Update taken skills warnings
    const takenWarnings = document.querySelectorAll('.taken-skills-warning');
    takenWarnings.forEach(warning => {
        const parent = warning.closest('.skill-selection-container, .choice-container');
        if (parent) {
            const skillOptions = parent.querySelectorAll('input[type="checkbox"], select');
            const availableSkills = [];
            skillOptions.forEach(option => {
                if (option.value && option.value !== '') {
                    availableSkills.push(option.value);
                }
            });
            
            const takenSkills = getTakenSkills(availableSkills);
            if (takenSkills.length > 0) {
                warning.innerHTML = `<strong>Already taken:</strong> ${takenSkills.map(skill => 
                    `${skill} (${getSkillSource(skill)})`
                ).join(', ')}`;
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }
    });
}

/**
 * Refreshes all skill displays to show current taken skills
 * This should be called whenever skills are added or removed
 */
function refreshSkillDisplays() {
    // Update all skill option displays to reflect current taken status
    const skillOptions = document.querySelectorAll('.skill-option');
    skillOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        const label = option.querySelector('label');
        const skill = checkbox.value;
        
        const isTaken = hasSkillProficiency(skill);
        const source = getSkillSource(skill);
        const isSelected = checkbox.checked;
        
        // Only disable if taken by another source, not if it's currently selected
        checkbox.disabled = isTaken && !isSelected;
        
        if (isTaken && !isSelected) {
            option.classList.add('skill-taken');
            label.innerHTML = `${skill} <span class="skill-source">(from ${source})</span>`;
        } else {
            option.classList.remove('skill-taken');
            label.textContent = skill;
        }
    });
    
    // Update all skill select dropdowns
    const skillSelects = document.querySelectorAll('.choice-select');
    skillSelects.forEach(select => {
        Array.from(select.options).forEach(option => {
            if (option.value && option.value !== '') {
                const isTaken = hasSkillProficiency(option.value);
                const source = getSkillSource(option.value);
                const isSelected = option.selected;
                
                // Only disable if taken by another source, not if it's currently selected
                option.disabled = isTaken && !isSelected;
                if (isTaken && !isSelected) {
                    option.text = `${option.value} (already taken)`;
                } else {
                    option.text = option.value;
                }
            }
        });
    });
    
    // Update taken skills warnings
    const takenWarnings = document.querySelectorAll('.taken-skills-warning');
    takenWarnings.forEach(warning => {
        const parent = warning.closest('.skill-selection-container, .choice-container');
        if (parent) {
            const skillOptions = parent.querySelectorAll('input[type="checkbox"], select');
            const availableSkills = [];
            skillOptions.forEach(option => {
                if (option.value && option.value !== '') {
                    availableSkills.push(option.value);
                }
            });
            
            const takenSkills = getTakenSkills(availableSkills);
            if (takenSkills.length > 0) {
                warning.innerHTML = `<strong>Already taken:</strong> ${takenSkills.map(skill => 
                    `${skill} (${getSkillSource(skill)})`
                ).join(', ')}`;
                warning.style.display = 'block';
            } else {
                warning.style.display = 'none';
            }
        }
    });
}





/**
 * Integrates with SharedScript bonus system for hit points
 * This function can be called to get bonuses from the main system
 */
function getSharedScriptHitPointsBonuses() {
    // This would integrate with the existing bonus system
    // For now, return an empty array
    // In the future, this could check the character's traits and features
    // for any that provide HitPoints bonuses according to SharedScript.js
    
    const bonuses = [];
    
    // Example integration (commented out for now):
    // if (currentCharacter.groupTraitData) {
    //     currentCharacter.groupTraitData.forEach(group => {
    //         group.traits.forEach(trait => {
    //             if (trait.adjustmentCategory === 'HitPoints') {
    //                 bonuses.push({
    //                     source: trait.traitName,
    //                     amount: parseInt(trait.adjustmentValue) || 0,
    //                     description: trait.traitDescription
    //                 });
    //             }
    //         });
    //     });
    // }
    
    return bonuses;
}

/**
 * Plays a dice rolling sound effect
 * This is a placeholder function that can be implemented with actual sound effects later
 */
function playDiceRollSound() {
    // Placeholder for sound effect
    // In the future, this could play an actual sound file
    console.log('Dice roll sound played');
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initializeCharacterCreator);

// Initialize ability score method on page load
document.addEventListener('DOMContentLoaded', () => {
    const abilityScoreMethodSelect = document.getElementById('abilityScoreMethod');
    if (abilityScoreMethodSelect) {
        abilityScoreMethodSelect.value = currentCharacter.abilityScoreMethod;
        // Trigger the change event to update the interface
        abilityScoreMethodSelect.dispatchEvent(new Event('change'));
    }
});





function flipVuplexDropdownIfNeeded() {
    document.querySelectorAll('vuplex-dropdown').forEach(dropdown => {
        // Get dropdown position
        const dropdownRect = dropdown.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // If dropdown goes past the bottom of the viewport, move it up by its own height
        console.log(dropdownRect.bottom, viewportHeight);
        if (dropdownRect.bottom > viewportHeight) {
            const newTop = dropdownRect.top - dropdownRect.height;
            // Only move if it stays within the viewport top boundary
            if (newTop >= 0) {
                dropdown.style.top = `${newTop}px`;
            }
        }
    });
}


// Toggle body scrolling based on presence of vuplex-dropdown
function toggleScrollingForVuplex() {
    const hasDropdown = document.querySelector('vuplex-dropdown');
    if (hasDropdown) {
        // Disable scroll if not already disabled
        if (!document.body.classList.contains('vuplex-no-scroll')) {
            document.body.dataset.prevOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
            document.body.classList.add('vuplex-no-scroll');
        }
    } else {
        // Re-enable scroll if previously disabled
        if (document.body.classList.contains('vuplex-no-scroll')) {
            document.body.style.overflow = document.body.dataset.prevOverflow || '';
            document.body.classList.remove('vuplex-no-scroll');
        }
    }
}

// Updated MutationObserver callback to also handle scrolling toggle
const vuplexObserver = new MutationObserver(() => {
    setTimeout(() => {
        flipVuplexDropdownIfNeeded();
        toggleScrollingForVuplex();
    }, 10);
});
vuplexObserver.observe(document.body, { childList: true, subtree: true });

window.addEventListener('resize', () => {
    flipVuplexDropdownIfNeeded();
    toggleScrollingForVuplex();
});
window.addEventListener('scroll', () => {
    flipVuplexDropdownIfNeeded();
    toggleScrollingForVuplex();
}, true);

