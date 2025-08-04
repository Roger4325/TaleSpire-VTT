// Load classes data from JSON file
async function loadClassesData() {
    try {
        const response = await fetch('Classes.json');
        if (!response.ok) {
            throw new Error('Failed to load classes data');
        }
        classesData = await response.json();
    } catch (error) {
        console.error('Error loading classes data:', error);
        throw error;
    }
}

// Load feats data (placeholder)
async function loadFeatsData() {
    try {
        const response = await fetch('Feats.json');
        if (!response.ok) {
            featsData = {};
            return;
        }
        featsData = await response.json();
    } catch (error) {
        console.error('Error loading feats data:', error);
        featsData = {};
    }
}

// Load races data from JSON file
async function loadRacesData() {
    try {
        const response = await fetch('Races.json');
        if (!response.ok) {
            throw new Error('Failed to load races data');
        }
        racesData = await response.json();
    } catch (error) {
        console.error('Error loading races data:', error);
        throw error;
    }
}



// Load character
function loadCharacter() {
    const characterName = prompt('Enter the name of the character to load:');
    if (!characterName) return;
    
    try {
        const savedData = localStorage.getItem(`character_${characterName}`);
        if (!savedData) {
            showError('Character not found.');
            return;
        }
        
        const characterData = JSON.parse(savedData);
        loadCharacterFromData(characterData);
        showSuccess('Character loaded successfully!');
    } catch (error) {
        console.error('Error loading character:', error);
        showError('Failed to load character. Please try again.');
    }
}

// Load character from data
function loadCharacterFromData(data) {
    if (data.extrasData) {
        currentCharacter.name = data.playerCharacterInput || '';
        currentCharacter.class = data.extrasData.class || '';
        currentCharacter.subclass = data.extrasData.subclass || '';
        currentCharacter.race = data.extrasData.race || '';
        currentCharacter.level = data.extrasData.level || 1;
        currentCharacter.abilities = data.extrasData.abilities || currentCharacter.abilities;
        currentCharacter.hitPoints = data.extrasData.hitPoints || 0;
        currentCharacter.armorClass = data.extrasData.armorClass || 10;
        currentCharacter.proficiencyBonus = data.extrasData.proficiencyBonus || 2;
        currentCharacter.features = data.extrasData.features || [];
        currentCharacter.choices = data.extrasData.choices || {};
        
        // Load ability score generation data
        currentCharacter.abilityScoreMethod = data.extrasData.abilityScoreMethod || "manual";
        currentCharacter.rolledAbilityScores = data.extrasData.rolledAbilityScores || [];
        currentCharacter.individualRolls = data.extrasData.individualRolls || [];
        currentCharacter.pointBuyPoints = data.extrasData.pointBuyPoints || 27;
        
        // Load hit points data
        currentCharacter.hitPointsRollCount = data.extrasData.hitPointsRollCount || 0;
    }
    
    // Update form fields
    const nameInput = document.getElementById('characterName');
    if (nameInput) nameInput.value = currentCharacter.name;
    
    const levelInput = document.getElementById('characterLevel');
    if (levelInput) levelInput.value = currentCharacter.level;
    
    // Update ability score method
    const abilityScoreMethodSelect = document.getElementById('abilityScoreMethod');
    if (abilityScoreMethodSelect) {
        abilityScoreMethodSelect.value = currentCharacter.abilityScoreMethod;
    }
    
    // Update ability score inputs
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilities.forEach(ability => {
        const input = document.getElementById(ability);
        if (input) input.value = currentCharacter.abilities[ability];
    });
    
    updateAbilityModifiers();
    
    // Restore rolled scores display if they exist
    if (currentCharacter.rolledAbilityScores && currentCharacter.rolledAbilityScores.length > 0) {
        displayRolledScores(currentCharacter.rolledAbilityScores, currentCharacter.individualRolls || []);
    }
    
    displayCurrentCharacter();
}
