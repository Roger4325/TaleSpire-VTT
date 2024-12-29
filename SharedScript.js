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

const damageTypes = [
    "N/A",
    "Slashing",
    "Piercing",
    "Bludgeoning",
    "Fire",
    "Cold",
    "Lightning",
    "Thunder",
    "Acid",
    "Poison",
    "Psychic",
    "Radiant",
    "Necrotic",
    "Force"
];

const conditionTypes = [
    "Blinded",
    "Charmed",
    "Deafened",
    "Frightened",
    "Grappled",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Poisoned",
    "Prone",
    "Restrained",
    "Stunned",
    "Unconscious",
    "Exhaustion"
];

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
        inspiration: "Inspiration",
        shortRestButton: "Short Rest",
        longRestButton: "Long Rest",
        deleteCharacter: "Delete a Character",
        customSpells: "Create Spell",
        'get-selection-button': "Link mini",
        disadvButton: "DisAdv",
        normalButton: "Flat",
        advButton: "Adv",
        characterInit: "Init",
        armorClass: "AC",
        walkingSpeed: "Speed",
        prof: "Prof",
        levelTextSpan: "Level",
        deathSaves: "Death Saves",
        deathSavesSuccess: "Success :",
        deathSavesFailures: "Failure :",
        healButton: "Heal",
        damageButton: "Damage",
        currentHP: "Current",
        maxHP: "Max",
        hpButtomText: "Player HitPoints",
        tempHPText: "Temp Health",
        characterAbilityStr: "STR",
        characterAbilityDex: "DEX",
        characterAbilityCon: "CON",
        characterAbilityInt: "INT",
        characterAbilityWis: "WIS",
        characterAbilityCha: "CHA",
        acrobaticsMod: "DEX",
        animalHandlingMod: "WIS",
        arcanaMod: "INT",
        athleticsMod: "STR",
        deceptionMod: "CHA",
        historyMod: "INT",
        insightMod: "WIS",
        intimidationMod: "CHA",
        investigationMod: "INT",
        medicineMod: "WIS",
        natureMod: "INT",
        perceptionMod: "WIS",
        performanceMod: "CHA",
        persuasionMod: "CHA",
        religionMod: "INT",
        sleightofHandMod: "DEX",
        stealthMod: "DEX",
        survivalMod: "WIS",
        skillAcrobatics: "Acrobatics",
        skillAnimalHandling: "Animal Handling",
        skillArcana: "Arcana",
        skillAthletics: "Athletics",
        skillDeception: "Deception",
        skillHistory: "History",
        skillInsight: "Insight",
        skillIntimidation: "Intimidation",
        skillInvestigation: "Investigation",
        skillMedicine: "Medicine",
        skillNature: "Nature",
        skillPerception: "Perception",
        skillPerformance: "Performance",
        skillPersuasion: "Persuasion",
        skillReligion: "Religion",
        skillSleightofHand: "Sleight of Hand",
        skillStealth: "Stealth",
        skillSurvival: "Survival",
        strSave: "Str Save",
        dexSave: "Dex Save",
        conSave: "Con Save",
        intSave: "Int Save",
        wisSave: "Wis Save",
        chaSave: "Cha Save",
        passivePerceptionTitle: "Passive WIS (Perception)",
        passiveInvestigationTitle: "Passive INT (Investigation)",
        passiveInsightTitle: "Passive WIS (Insight)",
        proficiencyWeapons: "Weapons",
        proficiencyArmor: "Armor",
        proficiencyLanguages: "Languages",
        proficiencyTools: "Tools",
        actionFiltersAll: "All",
        actionFiltersAttacks: "Attacks",
        actionFiltersActions: "Actions",
        actionFiltersBonusActions: "Bonus Actions",
        actionFiltersReactions: "Reactions",
        actionFiltersOther: "Other",
        actionTableHeader1: "Prof",
        actionTableHeader2: "Name",
        actionTableHeader3: "Reach",
        actionTableHeader4: "ToHit",
        actionTableHeader5: "Damage",
        actionTableHeader6: "Info",


        //Alignment Options
        alignmentOptionLG: "Lawful Good",
        alignmentOptionNG: "Neutral Good",
        alignmentOptionCG: "Chaotic Good",
        alignmentOptionLN: "Lawful Neutral",
        alignmentOptionTN: "True Neutral",
        alignmentOptionCN: "Chaotic Neutral",
        alignmentOptionLE: "Lawful Evil",
        alignmentOptionNE: "Neutral Evil",
        alignmentOptionCE: "Chaotic Evil",


        //character Conditions
        conditionOptionAid: "Aid",
        conditionOptionBane: "Bane",
        conditionOptionBlinded: "Blinded",
        conditionOptionBless: "Bless",
        conditionOptionConcentration: "Concentration",
        conditionOptionCharmed: "Charmed",
        conditionOptionDeafened: "Deafened",
        conditionOptionExhaustion: "Exhaustion",
        conditionOptionFrightened: "Frightened",
        conditionOptionGrappled: "Grappled",
        conditionOptionGuidance: "Guidance",
        conditionOptionHeroism: "Heroism",
        conditionOptionIncapacitated: "Incapacitated",
        conditionOptionInvisible: "Invisible",
        conditionOptionParalyzed: "Paralyzed",
        conditionOptionPetrified: "Petrified",
        conditionOptionPoisoned: "Poisoned",
        conditionOptionProne: "Prone",
        conditionOptionRestrained: "Restrained",
        conditionOptionSanctuary: "Sanctuary",
        conditionOptionStunned: "Stunned",
        conditionOptionUnconscious: "Unconscious",
        conditionOptionSlow: "Slow",
        conditionOptionRaging: "Raging",




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
        CantripHitDCHeader: "Ataq/CD",
        CantripDiceHeader: "Dados",
        CantripConcentrationHeader: "Conc",
        CantripNotesHeader: "Comp",
        CantripDeleteHeader: "Elim",
        inspiration: "Inspiración",
        shortRestButton: "Descanso Corto",
        longRestButton: "Descanso Largo",
        deleteCharacter: "Eliminar Personaje",
        customSpells: "Crear Hechizo",
        'get-selection-button': "Anexar Mini",
        disadvButton: "DesVent",
        normalButton: "Plano",
        advButton: "Vent",
        characterInit: "Inic",
        armorClass: "CA",
        walkingSpeed: "Velocidad",
        prof: "Comp",
        levelTextSpan: "Nivel",
        deathSaves: "Salvación de Muer",
        deathSavesSuccess: "Éxito :",
        deathSavesFailures: "Fracaso :",
        healButton: "Curar",
        damageButton: "Daño",
        currentHP: "Actual",
        maxHP: "Max",
        hpButtomText: "Puntos de golpe",
        tempHPText: "P.G Temp",
        characterAbilityStr: "FUE",
        characterAbilityDex: "DES",
        characterAbilityCon: "CON",
        characterAbilityInt: "INT",
        characterAbilityWis: "SAB",
        characterAbilityCha: "CAR",
        acrobaticsMod: "DES",
        animalHandlingMod: "SAB",
        arcanaMod: "INT",
        athleticsMod: "FUE",
        deceptionMod: "CAR",
        historyMod: "INT",
        insightMod: "SAB",
        intimidationMod: "CAR",
        investigationMod: "INT",
        medicineMod: "SAB",
        natureMod: "INT",
        perceptionMod: "SAB",
        performanceMod: "CAR",
        persuasionMod: "CAR",
        religionMod: "INT",
        sleightofHandMod: "DES",
        stealthMod: "DES",
        survivalMod: "SAB",
        skillAcrobatics: "Acrobacias",
        skillAnimalHandling: "T. con animales",
        skillArcana: "C. arcano",
        skillAthletics: "Atletismo",
        skillDeception: "Engaño",
        skillHistory: "Historia",
        skillInsight: "Perspicacia",
        skillIntimidation: "Intimidación",
        skillInvestigation: "Investigación",
        skillMedicine: "Medicine",
        skillNature: "Naturaleza",
        skillPerception: "Percepción",
        skillPerformance: "Interpretación",
        skillPersuasion: "Persuasión",
        skillReligion: "Religión",
        skillSleightofHand: "Juego de manos",
        skillStealth: "Sigilo",
        skillSurvival: "Supervivencia",
        strSave: "Salvación Fue",
        dexSave: "Salvación Des",
        conSave: "Salvación Con",
        intSave: "Salvación Int",
        wisSave: "Salvación Sab",
        chaSave: "Salvación Car",
        passivePerceptionTitle: "SAB Pasiva (Percepción)",
        passiveInvestigationTitle: "INT Pasiva (Investigación)",
        passiveInsightTitle: "SAB Pasiva (Perspicacia)",
        proficiencyWeapons: "Armas",
        proficiencyArmor: "Armadura",
        proficiencyLanguages: "Idioma",
        proficiencyTools: "Herramientas",
        actionFiltersAll: "Todo",
        actionFiltersAttacks: "Ataques",
        actionFiltersActions: "Acciones",
        actionFiltersBonusActions: "Acciones adicionales",
        actionFiltersReactions: "Reacciones",
        actionFiltersOther: "Otro",
        actionTableHeader1: "Comp",
        actionTableHeader2: "Nombre",
        actionTableHeader3: "Alcance",
        actionTableHeader4: "Ataque",
        actionTableHeader5: "Daño",
        actionTableHeader6: "Info",


        //Alignment Options
        alignmentOptionLG: "Legal Bueno",
        alignmentOptionNG: "Neutral Bueno",
        alignmentOptionCG: "Caótico Bueno",
        alignmentOptionLN: "Legal Neutral",
        alignmentOptionTN: "Neutral Verdadero",
        alignmentOptionCN: "Caótico Neutral",
        alignmentOptionLE: "Legal Malévolo",
        alignmentOptionNE: "Neutral Malévolo",
        alignmentOptionCE: "Caótico Malévolo",

        //character Conditions
        conditionOptionAid: "Ayuda",
        conditionOptionBane: "Maldición",
        conditionOptionBlinded: "Cegado",
        conditionOptionBless: "Bendición",
        conditionOptionConcentration: "Concentración",
        conditionOptionCharmed: "Encantado",
        conditionOptionDeafened: "Sordo",
        conditionOptionExhaustion: "Agotamiento",
        conditionOptionFrightened: "Asustado",
        conditionOptionGrappled: "Sujeto",
        conditionOptionGuidance: "Orientación",
        conditionOptionHeroism: "Heroísmo",
        conditionOptionIncapacitated: "Incapacitado",
        conditionOptionInvisible: "Invisible",
        conditionOptionParalyzed: "Paralizado",
        conditionOptionPetrified: "Petrificado",
        conditionOptionPoisoned: "Envenenado",
        conditionOptionProne: "Postrado",
        conditionOptionRestrained: "Restringido",
        conditionOptionSanctuary: "Santidad",
        conditionOptionStunned: "Atónito",
        conditionOptionUnconscious: "Inconsciente",
        conditionOptionSlow: "Lento",
        conditionOptionRaging: "Enfurecido",




        '1st-levelSpellNameHeader': "Nombre",
        '1st-levelTimeHeader': "Tiempo",
        '1st-levelHitDCHeader': "Ataq/CD",
        '1st-levelDiceHeader': "Dados",
        '1st-levelConcentrationHeader': "Conc",
        '1st-levelNotesHeader': "Comp",
        '1st-levelDeleteHeader': "Elim",

        '2nd-levelSpellNameHeader': "Nombre",
        '2nd-levelTimeHeader': "Tiempo",
        '2nd-levelHitDCHeader': "Ataq/CD",
        '2nd-levelDiceHeader': "Dados",
        '2nd-levelConcentrationHeader': "Conc",
        '2nd-levelNotesHeader': "Comp",
        '2nd-levelDeleteHeader': "Elim",

        '3rd-levelSpellNameHeader': "Nombre",
        '3rd-levelTimeHeader': "Tiempo",
        '3rd-levelHitDCHeader': "Ataq/CD",
        '3rd-levelDiceHeader': "Dados",
        '3rd-levelConcentrationHeader': "Conc",
        '3rd-levelNotesHeader': "Comp",
        '3rd-levelDeleteHeader': "Elim",

        ...Array.from({ length: 6 }, (_, i) => i + 4).reduce((acc, level) => {
            acc[`${level}th-levelSpellNameHeader`] = "Nombre";
            acc[`${level}th-levelTimeHeader`] = "Tiempo";
            acc[`${level}th-levelHitDCHeader`] = "Ataq/CD";
            acc[`${level}th-levelDiceHeader`] = "Dados";
            acc[`${level}th-levelConcentrationHeader`] = "Conc";
            acc[`${level}th-levelNotesHeader`] = "Comp";
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
const languageEngButton = document.getElementById('languageEngButton');
const languageEspButton = document.getElementById('languageEspButton');

if (languageEngButton) {
    languageEngButton.addEventListener('click', () => setLanguage('eng'));
}

if (languageEspButton) {
    languageEspButton.addEventListener('click', () => setLanguage('es'));
}

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
let gmClient = null;

// Fetch GM client and store it in a global variable
async function getGMClient() {
    try {
        const myFragment = await TS.clients.whoAmI();
        const allClients = await TS.clients.getClientsInThisBoard();

        const otherClients = allClients.filter(player => player.id !== myFragment.id);

        for (const client of otherClients) {
            const clientInfo = await TS.clients.getMoreInfo([client]);

            // Check if this client is in GM mode
            if (clientInfo && clientInfo[0].clientMode === "gm") {
                gmClient = clientInfo[0]; // Store GM client in the global variable
                console.log("GM Client Found:", gmClient);
                return gmClient;
            }
        }

        // If no GM is found, reset `gmClient` to null
        gmClient = null;
        console.error("GM not found.");
        return null;
    } catch (error) {
        console.error("Error getting GM client:", error);
        gmClient = null;
        return null;
    }
}

// Fetch all clients on the board and populate the list, including GM
async function initializeClients() {
    try {
        const myFragment = await TS.clients.whoAmI();
        const allClients = await TS.clients.getClientsInThisBoard();

        // Exclude the current client
        const otherClients = allClients.filter(player => player.id !== myFragment.id);

        // Add unique clients to the global list
        otherClients.forEach(addClient);

        // Fetch the GM client
        await getGMClient();
    } catch (error) {
        console.error("Error initializing clients:", error);
    }
}

// Handle events related to clients joining, leaving, or changing modes
function handleClientEvents(eventResponse) {
    let client = eventResponse.payload.client;

    TS.clients.isMe(client.id).then((isMe) => {
        switch (eventResponse.kind) {
            case "clientJoinedBoard":
                if (!isMe) {
                    addClient(client);
                }
                break;
            case "clientLeftBoard":
                if (!isMe) {
                    removeClient(client.id);
                    // If the GM client left, reset gmClient to null and re-fetch
                    if (gmClient && gmClient.id === client.id) {
                        gmClient = null;
                        console.log("GM left the board. Resetting GM client.");
                        getGMClient(); // Re-fetch GM
                    }
                }
                break;
            case "clientModeChanged":
                if (isMe) {
                    if (eventResponse.payload.clientMode === "gm") {
                        console.log("Switched to GM mode");
                        window.open("DMScreen.html");
                    } else {
                        console.log("Switched to player mode");
                        window.open("PlayerCharacter.html");
                    }
                } else {
                    addClient(client);

                    // If the GM client changed mode, reset and re-fetch
                    if (gmClient && gmClient.id === client.id && eventResponse.payload.clientMode !== "gm") {
                        gmClient = null;
                        console.log("GM switched out of GM mode. Resetting GM client.");
                        getGMClient(); // Re-fetch GM
                    }
                    else{
                        getGMClient(); // Re-fetch GM
                    }
                }
                break;
            default:
                break;
        }
    }).catch((response) => {
        console.error("Error checking client identity:", response);
    });
}

// Add a client to the global list
async function addClient(client) {
    const clientExists = clients.some(existingClient => existingClient.id === client.id);
    
    if (!clientExists) {
        clients.push({ id: client.id, name: client.player.name });
        console.log(`Added client: ${client.player.name} (${client.id})`);
        console.log("Current clients:", clients);

        // Check if the new client is in GM mode
        try {
            const clientInfo = await TS.clients.getMoreInfo([client]);
            if (clientInfo && clientInfo[0].clientMode === "gm") {
                gmClient = client; // Set gmClient to the new GM
                console.log(`GM client set: ${client.player.name} (${client.id})`);
            }
        } catch (error) {
            console.error("Error checking client mode:", error);
        }
    } else {
        console.log(`Client ${client.player.name} (${client.id}) is already in the list.`);
    }
}


// Remove a client from the global list by ID
function removeClient(clientId) {
    const index = clients.findIndex(c => c.id === clientId);
    if (index !== -1) {
        const removedClient = clients.splice(index, 1);
        console.log(`Removed client: ${removedClient[0].name} (${clientId})`);
        console.log("Current clients:", clients);
    } else {
        console.log(`Client with id ${clientId} not found.`);
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

async function loadSpellDataFiles(){
    AppData.spellLookupInfo = await readSpellJson();
    console.log(AppData.spellLookupInfo)
}

async function loadEquipmentDataFiles(){
    AppData.equipmentLookupInfo = await readEquipmentJson();
    console.log(AppData.equipmentLookupInfo)
}

async function loadMonsterDataFiles(){
    AppData.monsterLookupInfo = await readMonsterJsonList();
    console.log(AppData.monsterLookupInfo)
    establishMonsterData()
}



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
    await loadSpellDataFiles();
    AppData.monsterLookupInfo = await readMonsterJsonList();
    AppData.equipmentLookupInfo = await readEquipmentJson();
    await initializeClients();

    const owner = await TS.clients.whoAmI();  
    const ownerInfoArray = await TS.clients.getMoreInfo([owner.id]);
    const ownerInfo = ownerInfoArray[0];
    
    if (ownerInfo.clientMode === "gm") {
        console.log("GMing is awesome");
        await getPlayersInCampaign()
        establishMonsterData()
    }
    else{
        await playerSetUP();
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

                    console.log(diceRoll);
            
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

                    // Only add context menu for non-d20 rolls
                    if (!/^\d*d20(\s*[+-]\s*\d+)?$/.test(diceRoll) && !/^[+-]\d+$/.test(diceRoll)) {
                        const contextMenu = document.createElement('div');
                        contextMenu.className = 'custom-context-menu';
                        document.body.appendChild(contextMenu);

                        button.addEventListener('contextmenu', (event) => {
                            event.preventDefault();

                            // Clear existing context menu content
                            contextMenu.innerHTML = '';

                            // Add Crit button to the context menu
                            const critButton = document.createElement('button');
                            critButton.className = 'crit-button actionButton skillbuttonstyler';

                            // Duplicate the label and text with doubled dice
                            const doubledDiceText = diceRoll.replace(/(\d+)d(\d+)/g, (match, rolls, sides) => `${rolls * 2}d${sides}`);
                            critButton.textContent = 'Crit';

                            // Duplicate the label for the Crit button
                            const critLabel = document.createElement('label');
                            critLabel.className = 'actionButtonLabel damageDiceButton';
                            critLabel.setAttribute('value', modifier);
                            critLabel.setAttribute('data-dice-type', doubledDiceText);
                            critLabel.setAttribute('data-name', diceName);

                            // Add both the Crit label and button to the context menu
                            contextMenu.appendChild(critLabel);
                            contextMenu.appendChild(critButton);

                            // Position and display the context menu
                            contextMenu.style.left = `${event.pageX}px`;
                            contextMenu.style.top = `${event.pageY}px`;
                            contextMenu.style.display = 'block';

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
                    }
            
                    container.appendChild(label);
                    container.appendChild(button);
                } else {
                    // Check for spell names within the part
                    let remainingText = part;
                    if (spell) {
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
                    
                                // Show the spell card as a tooltip on hover
                                spellElement.addEventListener('mouseenter', (event) => {
                                    // Create the tooltip (spell card)
                                    const tooltip = document.createElement('div');
                                    tooltip.classList.add('spell-tooltip');
                                    tooltip.setAttribute('data-desc', spell.desc);
                    
                                    // Populate the tooltip with spell details
                                    tooltip.innerHTML = `
                                        <strong>${spell.name}</strong><br>
                                        <strong>Level:</strong> ${spell.level}<br>
                                        <strong>School:</strong> ${spell.school}<br>
                                        <strong>Casting Time:</strong> ${spell.casting_time}<br>
                                        <strong>Range:</strong> ${spell.range}<br>
                                        <strong>Components:</strong> ${spell.components}<br>
                                        <strong>Duration:</strong> ${spell.duration}<br>
                                        <strong>Description:</strong> ${spell.desc}
                                    `;
                    
                                    // Append the tooltip to the body (or container)
                                    document.body.appendChild(tooltip);
                    
                                    // Position the tooltip under the hovered spell
                                    // Get the bounding rect of the spell element
                                    const rect = spellElement.getBoundingClientRect();

                                    // Calculate space available at the bottom of the screen
                                    const spaceBelow = window.innerHeight - rect.bottom - window.scrollY;

                                    // Decide whether to place the tooltip above or below
                                    let tooltipPositionTop;
                                    if (spaceBelow >= tooltip.offsetHeight + 5) {
                                        // Enough space below, place tooltip below the spell
                                        tooltipPositionTop = rect.bottom + window.scrollY + 5; // Slightly below
                                    } else {
                                        // Not enough space below, place tooltip above the spell
                                        tooltipPositionTop = rect.top + window.scrollY - tooltip.offsetHeight - 5; // Slightly above
                                    }

                                    // Set the position of the tooltip
                                    tooltip.style.position = 'absolute';
                                    tooltip.style.top = `${tooltipPositionTop}px`; // Set dynamic top position
                    
                                    // Show the tooltip (fade-in effect via opacity)
                                    tooltip.style.opacity = 0;
                                    setTimeout(() => tooltip.style.opacity = 1, 0);
                    
                                    // Store the tooltip reference for later removal
                                    spellElement.tooltip = tooltip;
                                });
                    
                                // Remove the tooltip when mouse leaves
                                spellElement.addEventListener('mouseleave', () => {
                                    const tooltip = spellElement.tooltip;
                                    if (tooltip) {
                                        tooltip.style.opacity = 0;
                                        setTimeout(() => tooltip.remove(), 200); // Remove tooltip after fade-out
                                    }
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




function saveToCampaignStorage(dataType, dataId, data, shouldCheck) {
    // Load the existing data from global storage
    TS.localStorage.campaign.getBlob()
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
                TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4));
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
                TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4));

                // Display a message
                if (shouldCheck) {
                    //errorModal("Saved " + dataType); // Indicate that the data was saved or updated
                    //onInit(); // Perform any necessary initialization or updates
                }
            }
        });
}

async function saveToGlobalStorage(dataType, dataId, data, shouldCheck) {
    try {
        // Load the existing data from global storage
        const existingData = await TS.localStorage.global.getBlob();
        let allData = {};

        if (existingData) {
            allData = JSON.parse(existingData);
        }

        // Check and initialize the dataType property if not present
        if (!allData[dataType]) {
            allData[dataType] = {};
        }

        if (shouldCheck && allData[dataType][dataId]) {
            // Data already exists, show error modal
            exists = true;
            errorModal("This already exists");
            const removeButton = document.querySelector('#removeButton');
            // Handle the button click to remove the data
            removeButton.addEventListener('click', function () {
                removeFromGlobalStorage(dataType, dataId); // Call the remove function
            });

            // Return early to prevent saving duplicate data
            return;
        }

        // Add or update the data
        allData[dataType][dataId] = data;

        // Save the updated data back to global storage
        await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));

        // Optional: Indicate that the data was saved successfully
        if (shouldCheck) {
            console.log(`Saved data of type: ${dataType}`);
        }
    } catch (error) {
        console.error("Error saving to global storage:", error);
    }
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






// Retrieve data from global storage
function loadDataFromCampaignStorage(dataType) {
    console.log("loading Global Storage")
    return new Promise((resolve, reject) => {
        TS.localStorage.campaign.getBlob()
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
function showErrorModal(errorMessage, delayTimer = 2000) {
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

    // Automatically hide modal after the specified delay
    setTimeout(() => {
        modal.style.display = 'none';
    }, delayTimer);
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


function removeFromCampaignStorage(dataType, dataId) {
    return TS.localStorage.campaign.getBlob()
        .then((existingData) => {
            let allData = {};
            if (existingData) {
                allData = JSON.parse(existingData);
            }
            if (allData[dataType]) {
                if (allData[dataType][dataId]) {
                    delete allData[dataType][dataId]; // Attempt to delete

                    // Save the updated data back to global storage
                    return TS.localStorage.campaign.setBlob(JSON.stringify(allData, null, 4))
                        .then(() => {
                            console.log("Updated data saved to campaign storage:", allData);
                            errorModal('Data deleted from campaign storage');
                        })
                        .catch((error) => {
                            errorModal('Failed to save data to campaign storage: ' + error);
                        });
                } else {
                    errorModal('DataId not found in campaign storage: ' + dataId);
                }
            } else {
                errorModal('DataType not found in campaign storage');
            }
        })
        .catch((error) => {
            errorModal('Failed to delete data from campaign storage: ' + error);
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
        const allSpellData = await loadDataFromGlobalStorage("Custom Spells"); // Load data from global storage
        console.log(allSpellData)
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
        const allCreatureData = (await loadDataFromGlobalStorage("Custom Monsters"));

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
        const allequipmentData = await loadDataFromGlobalStorage("Custom Equipment"); 
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
