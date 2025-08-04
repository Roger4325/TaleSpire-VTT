// Display species selection
function displaySpeciesSelection() {
    const speciesContainer = document.getElementById('speciesSelection');
    if (!speciesContainer) return;

    const speciesNames = Object.keys(racesData).sort();
    speciesContainer.innerHTML = '<h3>Choose a Species</h3>';

    speciesNames.forEach(speciesName => {
        const speciesInfo = racesData[speciesName];

        const speciesCard = document.createElement('div');
        speciesCard.className = 'species-card';
        speciesCard.id = `speciesCard-${speciesName}`;
        speciesCard.onclick = () => openSpeciesModal(speciesName);

        const nameEl = document.createElement('h4');
        nameEl.textContent = speciesInfo.name;

        const descriptionEl = document.createElement('p');
        const asi = speciesInfo.abilityScoreIncrease;
        let asiText = '';
        if (asi.all) {
            asiText = '+1 to all abilities';
        } else {
            const asiList = Object.entries(asi).map(([ability, value]) => 
                `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
            ).join(', ');
            asiText = asiList;
        }
        descriptionEl.textContent = `${speciesInfo.size} | ${speciesInfo.speed}ft | ${asiText}`;

        speciesCard.appendChild(nameEl);
        speciesCard.appendChild(descriptionEl);
        speciesContainer.appendChild(speciesCard);
    });
}

// Display species info section (similar to class info section)
function displaySpeciesInfoSection(speciesName) {
    const speciesContainer = document.getElementById('speciesSelection');
    if (!speciesContainer) return;

    const speciesInfo = racesData[speciesName];
    
    // Clear the species selection and show info
    speciesContainer.innerHTML = '';
    
    // Header
    const header = document.createElement('h3');
    let headerText = `Species: ${speciesInfo.name}`;
    if (currentCharacter.subrace && speciesInfo.subraces && speciesInfo.subraces[currentCharacter.subrace]) {
        const subraceInfo = speciesInfo.subraces[currentCharacter.subrace];
        headerText += ` (${subraceInfo.name})`;
    }
    header.textContent = headerText;
    header.id = 'currentSpeciesName';
    speciesContainer.appendChild(header);
    
    // Basic info card
    const basicInfoCard = renderSimpleCard(
        speciesContainer,
        "Basic Information",
        `Size: ${speciesInfo.size} | Speed: ${speciesInfo.speed} feet | Base Languages: ${speciesInfo.languages.join(', ')}`,
        "species-basic-info"
    );
    
    // Language Proficiencies
    if (currentCharacter.languages && currentCharacter.languages.proficiencies && currentCharacter.languages.proficiencies.length > 0) {
        const languageDescriptions = currentCharacter.languages.proficiencies.map(lang => {
            const source = currentCharacter.languages.sources?.[lang];
            return `${lang}${source ? ` (${source})` : ''}`;
        });
        const languagesCard = renderSimpleCard(
            speciesContainer,
            "Language Proficiencies",
            `Proficient in: ${languageDescriptions.join(', ')}`,
            "species-languages"
        );
    }
    
    // Ability Score Increases
    const asi = speciesInfo.abilityScoreIncrease;
    let asiText = '';
    if (asi.all) {
        asiText = '+1 to all abilities';
    } else {
        const asiList = Object.entries(asi).map(([ability, value]) => 
            `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
        ).join(', ');
        asiText = asiList;
    }
    
    const asiCard = renderSimpleCard(
        speciesContainer,
        "Ability Score Increases",
        asiText,
        "species-asi"
    );
    
    // Traits - Now using our new trait rendering functions
    if (speciesInfo.traits && speciesInfo.traits.length > 0) {
        renderTraitsSection(speciesContainer, speciesInfo.traits, speciesName);
    }
    
    // Skill Proficiencies
    if (speciesInfo.skillProficiencies && speciesInfo.skillProficiencies.length > 0) {
        const skillsCard = renderSimpleCard(
            speciesContainer,
            "Skill Proficiencies",
            speciesInfo.skillProficiencies.join(', '),
            "species-skills"
        );
    }
    
    // Tool Proficiencies
    if (currentCharacter.tools && currentCharacter.tools.proficiencies && currentCharacter.tools.proficiencies.length > 0) {
        const toolDescriptions = currentCharacter.tools.proficiencies.map(tool => {
            const source = currentCharacter.tools.sources?.[tool];
            return `${tool}${source ? ` (${source})` : ''}`;
        });
        const toolsCard = renderSimpleCard(
            speciesContainer,
            "Tool Proficiencies",
            `Proficient in: ${toolDescriptions.join(', ')}`,
            "species-tools"
        );
    }
    
    // Subraces
    renderSubraceSection(speciesContainer, speciesInfo, speciesName);
    
    // Special Features with interactive choices
    renderSpecialFeaturesSection(speciesContainer, speciesInfo);
    
    // Add change species button and continue note
    const actionButtons = document.createElement('div');
    actionButtons.className = 'species-action-buttons';
    
    const changeSpeciesBtn = document.createElement('button');
    changeSpeciesBtn.className = 'btn btn-secondary';
    changeSpeciesBtn.textContent = 'Change Species';
    changeSpeciesBtn.onclick = () => {
        // Clear species selection
        currentCharacter.race = '';
        currentCharacter.subrace = '';
        
        // Reset ability score bonuses from race
        const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        abilities.forEach(ability => {
            currentCharacter.abilityBonusSources[ability] = currentCharacter.abilityBonusSources[ability].filter(
                source => !source.source.includes(speciesInfo.name)
            );
        });
        
        // Clear languages (reset to empty arrays)
        currentCharacter.languages = {
            proficiencies: [],
            sources: {}
        };
        
        // Clear skills (reset to empty arrays)
        currentCharacter.skills = {
            proficiencies: [],
            sources: {}
        };
        
        // Clear tool proficiencies (reset to empty arrays)
        currentCharacter.tools = {
            proficiencies: [],
            sources: {}
        };
        
        // Clear all racial choices
        currentCharacter.choices = {};
        currentCharacter.traitChoices = {};
        currentCharacter.pendingRacialChoices = {};
        
        // Clear racial cantrips
        currentCharacter.racialCantrips = [];
        
        // Clear other race-specific data
        currentCharacter.damageResistances = [];
        currentCharacter.breathWeapon = {};
        currentCharacter.draconicAncestry = null;
        
        // Recalculate ability bonuses
        updateAbilityBonuses();
        updateAbilityTotalsUI();
        
        // Show species selection
        displaySpeciesSelection();
        
        // Update racesData for save (will clear it)
        updateRacesDataForSave();
    };
    
    actionButtons.appendChild(changeSpeciesBtn);
    speciesContainer.appendChild(actionButtons);
}



/**
 * Renders a language choice interface
 */
function renderLanguageChoice(parent, languageOptions, source) {
    const container = document.createElement('div');
    container.className = 'choice-container';
    
    const title = document.createElement('h4');
    title.textContent = `Language Choice (Choose ${languageOptions.choose})`;
    title.className = 'choice-title';
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = languageOptions.description;
    description.className = 'choice-description';
    container.appendChild(description);
    
    const select = document.createElement('select');
    select.className = 'choice-select';
    select.appendChild(new Option('-- select language --', '', true, true));
    
    languageOptions.options.forEach(lang => {
        select.appendChild(new Option(lang, lang));
    });
    
    // Track the currently selected language for this choice
    const choiceKey = `${source}-language-choice`;
    const currentChoice = currentCharacter.choices[choiceKey] || null;
    
    // If there's a current choice, select it
    if (currentChoice) {
        select.value = currentChoice;
    }
    
            select.onchange = () => {
            // Get the current choice from storage (not from closure)
            const previousChoice = currentCharacter.choices[choiceKey] || null;
            
            // Remove previous choice if it exists and is different
            if (previousChoice && previousChoice !== select.value) {
                removeLanguageProficiency(previousChoice);
            }
            
            if (select.value && select.value !== '') {
                // Add new language
                addLanguageProficiency(select.value, `${source} Choice`);
                
                // Store the choice
                currentCharacter.choices[choiceKey] = select.value;
                
                // Update status
                const status = container.querySelector('.choice-status');
                if (status) {
                    status.textContent = '✔';
                    status.className = 'choice-status complete';
                }
            } else {
                // Clear the choice
                delete currentCharacter.choices[choiceKey];
                
                // Update status
                const status = container.querySelector('.choice-status');
                if (status) {
                    status.textContent = '❗';
                    status.className = 'choice-status incomplete';
                }
            }
            
            // Update racesData for save
            updateRacesDataForSave();
        };
    
    container.appendChild(select);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = currentChoice ? '✔' : '❗';
    title.appendChild(status);
    
    parent.appendChild(container);
}

/**
 * Creates the basic container structure for cantrip choice
 */
function createCantripChoiceContainer(cantripOptions) {
    const container = document.createElement('div');
    container.className = 'choice-container';
    
    const title = document.createElement('h4');
    title.textContent = `Cantrip Choice (Choose ${cantripOptions.choose})`;
    title.className = 'choice-title';
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = cantripOptions.description;
    description.className = 'choice-description';
    container.appendChild(description);
    
    return { container, title };
}

/**
 * Sets up the select element with cantrip options
 */
function setupCantripSelect(cantripOptions) {
    const select = document.createElement('select');
    select.className = 'choice-select';
    select.appendChild(new Option('-- select cantrip --', '', true, true));
    
    cantripOptions.options.forEach(cantrip => {
        select.appendChild(new Option(cantrip, cantrip));
    });
    
    // Set current choice if it exists
    const choiceKey = 'subrace-cantrip-choice';
    const currentChoice = currentCharacter.choices[choiceKey] || null;
    if (currentChoice) {
        select.value = currentChoice;
    }
    
    return { select, choiceKey, currentChoice };
}

/**
 * Handles cantrip choice change events
 */
function handleCantripChoiceChange(select, choiceKey, container) {
    return () => {
        const previousChoice = currentCharacter.choices[choiceKey] || null;
        
        // Remove previous choice if it exists and is different
        if (previousChoice && previousChoice !== select.value) {
            const cantripIndex = currentCharacter.racialCantrips.indexOf(previousChoice);
            if (cantripIndex > -1) {
                currentCharacter.racialCantrips.splice(cantripIndex, 1);
            }
        }
        
        if (select.value && select.value !== '') {
            // Add new cantrip
            currentCharacter.racialCantrips = currentCharacter.racialCantrips || [];
            if (!currentCharacter.racialCantrips.includes(select.value)) {
                currentCharacter.racialCantrips.push(select.value);
            }
            
            // Store the choice
            currentCharacter.choices[choiceKey] = select.value;
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
            }
        } else {
            // Clear the choice
            delete currentCharacter.choices[choiceKey];
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '❗';
                status.className = 'choice-status incomplete';
            }
        }
        
        // Update racesData for save
        updateRacesDataForSave();
    };
}

/**
 * Renders a cantrip choice interface (for High Elf)
 */
function renderCantripChoice(parent, cantripOptions) {
    const { container, title } = createCantripChoiceContainer(cantripOptions);
    const { select, choiceKey, currentChoice } = setupCantripSelect(cantripOptions);
    
    select.onchange = handleCantripChoiceChange(select, choiceKey, container);
    container.appendChild(select);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = currentChoice ? '✔' : '❗';
    title.appendChild(status);
    
    parent.appendChild(container);
}

/**
 * Creates the basic container structure for skill choice
 */
function createSkillChoiceContainer(skillOptions) {
    const container = document.createElement('div');
    container.className = 'choice-container';
    
    const title = document.createElement('h4');
    title.textContent = `Skill Choice (Choose ${skillOptions.choose})`;
    title.className = 'choice-title';
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = skillOptions.description;
    description.className = 'choice-description';
    container.appendChild(description);
    
    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'skill-options';
    
    return { container, title, skillsContainer };
}

/**
 * Initialize selected skills array from character choices
 */
function initializeSkillChoices(source) {
    const selectedSkills = [];
    const choiceKey = `${source}-skill-choice`;
    
    if (currentCharacter.choices && currentCharacter.choices[choiceKey]) {
        if (Array.isArray(currentCharacter.choices[choiceKey])) {
            selectedSkills.push(...currentCharacter.choices[choiceKey]);
        } else {
            selectedSkills.push(currentCharacter.choices[choiceKey]);
        }
    }
    
    return { selectedSkills, choiceKey };
}

/**
 * Creates a checkbox for a skill option
 */
function createSkillCheckbox(skill, source, selectedSkills) {
    const skillOption = document.createElement('div');
    skillOption.className = 'skill-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${source}-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`;
    checkbox.value = skill;
    checkbox.checked = selectedSkills.includes(skill);
    
    // Disable if this skill is already taken from another source
    const isAlreadyProficient = currentCharacter.skills && 
                               currentCharacter.skills.proficiencies && 
                               currentCharacter.skills.proficiencies.includes(skill) &&
                               !selectedSkills.includes(skill);
    
    if (isAlreadyProficient) {
        checkbox.disabled = true;
        skillOption.classList.add('skill-taken');
    }
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = skill;
    
    skillOption.appendChild(checkbox);
    skillOption.appendChild(label);
    
    return { skillOption, checkbox };
}

/**
 * Handles skill choice change events
 */
function handleSkillChoiceChange(skill, source, selectedSkills, skillOptions, choiceKey, container, countDisplay) {
    return (e) => {
        if (e.target.checked) {
            // Check if we've reached the limit
            if (selectedSkills.length < skillOptions.choose) {
                selectedSkills.push(skill);
                addSkillProficiency(skill, `${source} Choice`);
            } else {
                // Uncheck the box if we've reached the limit
                e.target.checked = false;
                return;
            }
        } else {
            // Remove from selected skills
            const index = selectedSkills.indexOf(skill);
            if (index > -1) {
                selectedSkills.splice(index, 1);
                removeSkillProficiency(skill);
            }
        }
        
        // Update the character's choices
        currentCharacter.choices = currentCharacter.choices || {};
        currentCharacter.choices[choiceKey] = [...selectedSkills];
        
        // Update the count display
        countDisplay.textContent = `Selected: ${selectedSkills.length}/${skillOptions.choose}`;
        
        // Update status
        const status = container.querySelector('.choice-status');
        if (status) {
            if (selectedSkills.length === skillOptions.choose) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
            } else {
                status.textContent = '❗';
                status.className = 'choice-status incomplete';
            }
        }
        
        // Update racesData for save
        updateRacesDataForSave();
    };
}

/**
 * Adds status indicator and count display to skill choice
 */
function addSkillChoiceStatus(container, title, selectedSkills, skillOptions) {
    // Add selection count
    const countDisplay = document.createElement('p');
    countDisplay.className = 'choice-count';
    countDisplay.textContent = `Selected: ${selectedSkills.length}/${skillOptions.choose}`;
    container.appendChild(countDisplay);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = selectedSkills.length === skillOptions.choose ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = selectedSkills.length === skillOptions.choose ? '✔' : '❗';
    title.appendChild(status);
    
    return countDisplay;
}

/**
 * Renders a skill choice interface
 */
function renderSkillChoice(parent, skillOptions, source) {
    const { container, title, skillsContainer } = createSkillChoiceContainer(skillOptions);
    const { selectedSkills, choiceKey } = initializeSkillChoices(source);
    
    // Create checkboxes for each option
    skillOptions.options.forEach(skill => {
        const { skillOption, checkbox } = createSkillCheckbox(skill, source, selectedSkills);
        
        // Add change event listener - we need to pass countDisplay, so we'll set it up after
        skillsContainer.appendChild(skillOption);
    });
    
    container.appendChild(skillsContainer);
    
    // Add status and count display
    const countDisplay = addSkillChoiceStatus(container, title, selectedSkills, skillOptions);
    
    // Now add event listeners to checkboxes
    skillOptions.options.forEach(skill => {
        const checkbox = container.querySelector(`#${source}-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`);
        if (checkbox) {
            checkbox.addEventListener('change', 
                handleSkillChoiceChange(skill, source, selectedSkills, skillOptions, choiceKey, container, countDisplay)
            );
        }
    });
    
    parent.appendChild(container);
}

// Render the traits section with individual trait cards
function renderTraitsSection(container, traits, speciesName) {
    const traitsContainer = document.createElement('div');
    traitsContainer.className = 'traits-container';
    container.appendChild(traitsContainer);
    
    const traitsHeader = document.createElement('h3');
    traitsHeader.textContent = 'Species Traits';
    traitsContainer.appendChild(traitsHeader);
    
    // Render each trait as a card
    traits.forEach(trait => {
        renderTraitCard(traitsContainer, trait, speciesName);
    });
}

// Handle trait choice logic
function handleTraitChoice(traitName, choiceValue, speciesName) {
    console.log(`Handling trait choice: ${traitName}, value: ${choiceValue}`);
    
    // Store the choice in the character data
    currentCharacter.traitChoices = currentCharacter.traitChoices || {};
    currentCharacter.traitChoices[traitName] = choiceValue;

    console.log(currentCharacter.traitChoices)
    
    // Check for linked traits in the species data
    const speciesInfo = racesData[speciesName];
    if (speciesInfo && speciesInfo.traits) {
        const linkedTraits = speciesInfo.traits.filter(trait => 
            trait.linkedTo === traitName
        );
        
        // Update any linked traits
        linkedTraits.forEach(linkedTrait => {
            // The linked trait should use the choice value from the source trait
            if (currentCharacter.traitChoices[linkedTrait.name] !== choiceValue) {
                currentCharacter.traitChoices[linkedTrait.name] = choiceValue;
            }
        });
    }
    
    // Apply any effects from the trait choice
    applyTraitEffects(traitName, choiceValue, speciesName);
    
    // Update racesData for save
    updateRacesDataForSave();
}

// Apply effects from trait choices
function applyTraitEffects(traitName, choiceValue, speciesName) {
    const speciesInfo = racesData[speciesName];
    
    // Find the trait in the species data
    const trait = speciesInfo.traits.find(t => t.name === traitName);
    if (!trait || !trait.effects) return;
    
    // Apply the effects defined in the JSON data
    if (Array.isArray(trait.effects)) {
        trait.effects.forEach(effect => {
            applyEffect(effect, choiceValue, speciesName);
        });
    } else if (typeof trait.effects === 'object') {
        // If effects are keyed by choice value
        const effectsForChoice = trait.effects[choiceValue];
        if (effectsForChoice) {
            if (Array.isArray(effectsForChoice)) {
                effectsForChoice.forEach(effect => {
                    applyEffect(effect, choiceValue, speciesName);
                });
            } else {
                applyEffect(effectsForChoice, choiceValue, speciesName);
            }
        }
    }
}

/**
 * Apply resistance effect
 */
function applyResistanceEffect(effect, choiceValue) {
    // Add to damage resistances array
    currentCharacter.damageResistances = currentCharacter.damageResistances || [];
    if (!currentCharacter.damageResistances.includes(effect.value)) {
        currentCharacter.damageResistances.push(effect.value);
    }
    
    // Get the base description from Races.json
    const resistanceTrait = racesData.dragonborn.traits.find(t => t.name === "Damage Resistance");
    if (resistanceTrait) {
        const baseDesc = resistanceTrait.description;
        const lastPeriodIndex = baseDesc.lastIndexOf('.');
        const mainDesc = baseDesc.substring(0, lastPeriodIndex);
        
        // Create the new description
        const newDesc = `${mainDesc} to ${effect.value} damage.`;
        
        // Update the UI - find the trait card by its header text
        const traitCards = document.querySelectorAll('.feature-card');
        const resistanceCard = Array.from(traitCards).find(card => 
            card.querySelector('.card-header').textContent.startsWith("Damage Resistance")
        );
        
        if (resistanceCard) {
            // Update the title
            const headerElement = resistanceCard.querySelector('.card-header');
            if (headerElement) {
                headerElement.textContent = `Damage Resistance (${choiceValue} (${effect.value}))`;
            }
            
            // Update the description
            const descriptionElement = resistanceCard.querySelector('.card-body p');
            if (descriptionElement) {
                descriptionElement.textContent = newDesc;
            }
        }
    }
}

/**
 * Apply ability score effect
 */
function applyAbilityEffect(effect, choiceValue, speciesName) {
    // Handle ability score increases
    if (effect.ability === '$choice') {
        // For effects where the ability is determined by the choice (like Half-Elf)
        if (Array.isArray(choiceValue)) {
            // Multiple ability score choices (Half-Elf)
            
            // First, remove any existing ability bonuses from this source
            const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
            abilities.forEach(ability => {
                if (currentCharacter.abilityBonusSources && currentCharacter.abilityBonusSources[ability]) {
                    currentCharacter.abilityBonusSources[ability] = currentCharacter.abilityBonusSources[ability].filter(
                        source => source.source !== effect.source
                    );
                }
            });
            
            // Then add bonuses for each selected ability
            choiceValue.forEach(ability => {
                addAbilityBonus(ability, effect.value, effect.source);
            });
        } else if (typeof choiceValue === 'string') {
            // Single ability score choice
            addAbilityBonus(choiceValue, effect.value, effect.source);
        }
    } else {
        // Fixed ability score increase
        addAbilityBonus(effect.ability, effect.value, effect.source || `${speciesName} Trait`);
    }
    updateAbilityBonuses();
    updateAbilityTotalsUI();
}

/**
 * Apply proficiency effects (skill, language, tool)
 */
function applyProficiencyEffect(effect, speciesName) {
    switch (effect.type) {
        case 'skill':
            addSkillProficiency(effect.skill, effect.source || `${speciesName} Trait`);
            break;
        case 'language':
            addLanguageProficiency(effect.language, effect.source || `${speciesName} Trait`);
            break;
        case 'tool':
            addToolProficiency(effect.tool, effect.source || `${speciesName} Trait`);
            break;
    }
}

/**
 * Apply breath weapon effect
 */
function applyBreathWeaponEffect(effect, choiceValue) {
    // Store breath weapon details
    currentCharacter.breathWeapon = currentCharacter.breathWeapon || {};
    currentCharacter.breathWeapon.shape = effect.shape;
    currentCharacter.breathWeapon.dimensions = effect.dimensions;
    currentCharacter.breathWeapon.damageType = effect.damageType;
    currentCharacter.breathWeapon.saveType = effect.saveType;
    
    // Get the base description from Races.json
    const breathTrait = racesData.dragonborn.traits.find(t => t.name === "Breath Weapon");
    if (breathTrait) {
        const baseDesc = breathTrait.description;
        const firstPeriodIndex = baseDesc.indexOf('.');
        const firstPart = baseDesc.substring(0, firstPeriodIndex + 1);
        const restOfDesc = baseDesc.substring(firstPeriodIndex + 1);
        
        // Create the new description with specific details
        const newDesc = `${firstPart} Your breath weapon deals ${effect.damageType} damage in a ${effect.shape} (${effect.dimensions}). Each creature in the area must make a ${effect.saveType} saving throw.${restOfDesc}`;
        
        // Update the UI - find the trait card by its header text
        const traitCards = document.querySelectorAll('.feature-card');
        const breathWeaponCard = Array.from(traitCards).find(card => 
            card.querySelector('.card-header').textContent.startsWith("Breath Weapon")
        );
        
        if (breathWeaponCard) {
            // Update the title
            const headerElement = breathWeaponCard.querySelector('.card-header');
            if (headerElement) {
                headerElement.textContent = `Breath Weapon (${choiceValue} (${effect.damageType}))`;
            }
            
            // Update the description
            const descriptionElement = breathWeaponCard.querySelector('.card-body p');
            if (descriptionElement) {
                descriptionElement.textContent = newDesc;
            }
        }
    }
}

// Apply a single effect
function applyEffect(effect, choiceValue, speciesName) {
    switch (effect.type) {
        case 'resistance':
            applyResistanceEffect(effect, choiceValue);
            break;
        case 'ability':
            applyAbilityEffect(effect, choiceValue, speciesName);
            break;
        case 'skill':
        case 'language':
        case 'tool':
            applyProficiencyEffect(effect, speciesName);
            break;
        case 'breath-weapon':
            applyBreathWeaponEffect(effect, choiceValue);
            break;
        // Add more effect types as needed
    }
}

// Update linked traits based on a trait choice
function updateLinkedTraits(sourceTrait, choiceValue, speciesName) {
    // Find traits that are linked to this trait
    const speciesInfo = racesData[speciesName];
    const linkedTraits = speciesInfo.traits.filter(trait => 
        trait.linkedTo === sourceTrait
    );
    
    linkedTraits.forEach(trait => {
        // Update the trait choice in the character data
        currentCharacter.traitChoices = currentCharacter.traitChoices || {};
        currentCharacter.traitChoices[trait.name] = choiceValue;
        
        // Apply any effects from the linked trait
        applyTraitEffects(trait.name, choiceValue, speciesName);
        
        // Update UI elements for the linked trait if needed
        updateTraitUI(trait.name, choiceValue);
    });
}

// Update UI elements for a trait
function updateTraitUI(traitName, choiceValue) {
    // Update select elements
    const select = document.getElementById(`trait-choice-${traitName.toLowerCase().replace(/\s+/g, '-')}`);
    if (select && select.value !== choiceValue) {
        select.value = choiceValue;
    }
    
    // Update checkboxes
    if (Array.isArray(choiceValue)) {
        choiceValue.forEach(value => {
            const checkbox = document.getElementById(`trait-choice-${traitName}-${value}`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
            }
        });
    }
}

// Render a single trait card with description and choices
function renderTraitCard(container, trait, speciesName) {
    const traitCard = document.createElement('div');
    traitCard.className = 'feature-card';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'card-header';
    header.textContent = trait.name;
    header.onclick = () => {
        body.classList.toggle('hidden');
        header.classList.toggle('open');
    };
    traitCard.appendChild(header);
    
    // Create body
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // Add description
    const description = document.createElement('p');
    description.textContent = trait.description;
    body.appendChild(description);
    // Handle trait choices if they exist
    if (trait.choices) {
        renderTraitChoices(body, trait, speciesName);
    }
    
    traitCard.appendChild(body);
    container.appendChild(traitCard);
}

// Render trait choices based on choice type
function renderTraitChoices(container, trait, speciesName) {
    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'trait-choices';
    
    if (trait.choices.type === 'select') {
        renderSelectChoice(choicesContainer, trait, speciesName);
    } else if (trait.choices.type === 'multiple') {
        renderMultipleChoice(choicesContainer, trait, speciesName);
    }
    
    container.appendChild(choicesContainer);
}

// Render a single-select choice (dropdown)
function renderSelectChoice(container, trait, speciesName) {
    const select = document.createElement('select');
    select.className = 'trait-choice-select';
    select.id = `trait-choice-${trait.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `-- Select ${trait.name} --`;
    defaultOption.selected = true;
    defaultOption.disabled = true;
    select.appendChild(defaultOption);
    
    // Add choice options
    trait.choices.options.forEach(choice => {
        const option = document.createElement('option');
        option.value = choice.value;
        option.textContent = choice.label;
        select.appendChild(option);
    });
    
    // Check if there's a saved choice
    if (currentCharacter.traitChoices && currentCharacter.traitChoices[trait.name]) {
        select.value = currentCharacter.traitChoices[trait.name];
    }
    
    // Add change event listener
    select.addEventListener('change', (e) => {
        // Handle the choice
        handleTraitChoice(trait.name, e.target.value, speciesName);
        
        // Handle linked traits
        if (trait.choices.linkedTo) {
            updateLinkedTraits(trait.name, e.target.value, speciesName);
        }
    });
    
    container.appendChild(select);
}

/**
 * Creates the basic container for multiple choice
 */
function createMultipleChoiceContainer(trait, choiceLimit) {
    const choiceLabel = document.createElement('p');
    choiceLabel.textContent = `Choose ${choiceLimit} option${choiceLimit > 1 ? 's' : ''}:`;
    
    // Track selected choices
    const selectedChoices = [];
    if (currentCharacter.traitChoices && currentCharacter.traitChoices[trait.name]) {
        if (Array.isArray(currentCharacter.traitChoices[trait.name])) {
            selectedChoices.push(...currentCharacter.traitChoices[trait.name]);
        } else {
            selectedChoices.push(currentCharacter.traitChoices[trait.name]);
        }
    }
    
    return { choiceLabel, selectedChoices };
}

/**
 * Creates a checkbox for a choice option
 */
function createChoiceCheckbox(trait, choice, selectedChoices) {
    const choiceContainer = document.createElement('div');
    choiceContainer.className = 'trait-choice-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `trait-choice-${trait.name}-${choice.value}`;
    checkbox.value = choice.value;
    checkbox.checked = selectedChoices.includes(choice.value);
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = choice.label;
    
    choiceContainer.appendChild(checkbox);
    choiceContainer.appendChild(label);
    
    return { choiceContainer, checkbox };
}

/**
 * Handles multiple choice change events
 */
function handleMultipleChoiceChange(trait, speciesName, selectedChoices, choiceLimit) {
    return (e) => {
        if (e.target.checked) {
            // Check if we've reached the limit
            if (selectedChoices.length < choiceLimit) {
                selectedChoices.push(e.target.value);
            } else {
                // Uncheck the box if we've reached the limit
                e.target.checked = false;
                return;
            }
        } else {
            // Remove from selected choices
            const index = selectedChoices.indexOf(e.target.value);
            if (index > -1) {
                selectedChoices.splice(index, 1);
            }
        }
        
        // Handle the choice
        handleTraitChoice(trait.name, [...selectedChoices], speciesName);
    };
}

/**
 * Updates the choice count display
 */
function updateChoiceCount(container, selectedChoices, choiceLimit) {
    const countDisplay = document.createElement('p');
    countDisplay.className = 'choice-count';
    countDisplay.textContent = `Selected: ${selectedChoices.length}/${choiceLimit}`;
    container.appendChild(countDisplay);
    
    // Update the count display when checkboxes change
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            countDisplay.textContent = `Selected: ${selectedChoices.length}/${choiceLimit}`;
        });
    });
}

// Render a multiple-choice selection (checkboxes)
function renderMultipleChoice(container, trait, speciesName) {
    const choiceLimit = trait.choices.choose || 1;
    const { choiceLabel, selectedChoices } = createMultipleChoiceContainer(trait, choiceLimit);
    
    container.appendChild(choiceLabel);
    
    // Create checkboxes for each option
    trait.choices.options.forEach(choice => {
        const { choiceContainer, checkbox } = createChoiceCheckbox(trait, choice, selectedChoices);
        
        // Add change event listener
        checkbox.addEventListener('change', 
            handleMultipleChoiceChange(trait, speciesName, selectedChoices, choiceLimit)
        );
        
        container.appendChild(choiceContainer);
    });
    
    // Add selection count
    updateChoiceCount(container, selectedChoices, choiceLimit);
}





// Select a subclass
function selectSubclass(subclassKey) {
    currentCharacter.subclass = subclassKey;
    
    // Add subclass features to the display
    addSubclassFeaturesToDisplay(subclassKey);
}


function openSpeciesModal(speciesName) {
    const speciesInfo = racesData[speciesName];
    const modal = document.getElementById('speciesModal');
    const content = document.getElementById('speciesModalContent');
    content.innerHTML = ''; // Clear safely

    const title = document.createElement('h2');
    title.textContent = speciesInfo.name;
    title.id = 'speciesName';

    // Basic info
    const basicInfo = document.createElement('div');
    basicInfo.className = 'species-basic-info';
    basicInfo.innerHTML = `
        <p><strong>Size:</strong> ${speciesInfo.size}</p>
        <p><strong>Speed:</strong> ${speciesInfo.speed} feet</p>
        <p><strong>Languages:</strong> ${speciesInfo.languages.join(', ')}</p>
    `;

    // Ability Score Increases
    const asi = speciesInfo.abilityScoreIncrease;
    const asiDiv = document.createElement('div');
    asiDiv.className = 'species-asi';
    if (asi.all) {
        asiDiv.innerHTML = `<p><strong>Ability Score Increase:</strong> +1 to all abilities</p>`;
    } else {
        const asiList = Object.entries(asi).map(([ability, value]) => 
            `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
        ).join(', ');
        asiDiv.innerHTML = `<p><strong>Ability Score Increase:</strong> ${asiList}</p>`;
    }

    // Traits
    const traitsDiv = document.createElement('div');
    traitsDiv.className = 'species-traits';
    if (speciesInfo.traits && speciesInfo.traits.length > 0) {
        traitsDiv.innerHTML = `<p><strong>Traits:</strong></p>`;
        const traitsList = document.createElement('ul');
        speciesInfo.traits.forEach(trait => {
            const traitItem = document.createElement('li');
            traitItem.textContent = trait.name;
            traitsList.appendChild(traitItem);
        });
        traitsDiv.appendChild(traitsList);
    }

    // Skill Proficiencies
    const skillsDiv = document.createElement('div');
    skillsDiv.className = 'species-skills';
    if (speciesInfo.skillProficiencies && speciesInfo.skillProficiencies.length > 0) {
        skillsDiv.innerHTML = `<p><strong>Skill Proficiencies:</strong> ${speciesInfo.skillProficiencies.join(', ')}</p>`;
    }

    // Subraces
    let subracesDiv = null;
    if (speciesInfo.subraces) {
        subracesDiv = document.createElement('div');
        subracesDiv.className = 'species-subraces';
        subracesDiv.innerHTML = `<p><strong>Subraces:</strong></p>`;
        
        Object.keys(speciesInfo.subraces).forEach(subraceKey => {
            const subrace = speciesInfo.subraces[subraceKey];
            const subraceInfo = document.createElement('div');
            subraceInfo.className = 'subrace-info';
            
            let subraceHtml = `<h4>${subrace.name}</h4>`;
            
            // Ability Score Increase
            if (subrace.abilityScoreIncrease) {
                const subraceAsiList = Object.entries(subrace.abilityScoreIncrease).map(([ability, value]) => 
                    `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
                ).join(', ');
                subraceHtml += `<p><strong>Ability Score Increase:</strong> ${subraceAsiList}</p>`;
            }
            
            // Traits
            if (subrace.traits && subrace.traits.length > 0) {
                const traitNames = subrace.traits.map(trait => 
                    typeof trait === 'string' ? trait : trait.name
                );
                subraceHtml += `<p><strong>Traits:</strong> ${traitNames.join(', ')}</p>`;
            }
            
            subraceInfo.innerHTML = subraceHtml;
            subracesDiv.appendChild(subraceInfo);
        });
    }

    // Special features
    let specialFeaturesDiv = null;
    if (speciesInfo.languageOptions || speciesInfo.skillOptions || speciesInfo.ancestryOptions) {
        specialFeaturesDiv = document.createElement('div');
        specialFeaturesDiv.className = 'species-special-features';
        specialFeaturesDiv.innerHTML = `<p><strong>Special Features:</strong></p>`;
        
        if (speciesInfo.languageOptions) {
            specialFeaturesDiv.innerHTML += `<p>• ${speciesInfo.languageOptions.description}</p>`;
        }
        if (speciesInfo.skillOptions) {
            specialFeaturesDiv.innerHTML += `<p>• ${speciesInfo.skillOptions.description}</p>`;
        }
        if (speciesInfo.ancestryOptions) {
            specialFeaturesDiv.innerHTML += `<p>• ${speciesInfo.ancestryOptions.description}</p>`;
        }
    }

    const selectBtn = document.createElement('button');
    selectBtn.textContent = 'Select Species';
    selectBtn.id = 'selectSpeciesButton';
    selectBtn.onclick = () => {
        selectSpecies(speciesName);
        modal.classList.add('hidden');
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.id = 'cancelSpeciesButton';
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    const elements = [title, basicInfo, asiDiv];
    if (traitsDiv.innerHTML) elements.push(traitsDiv);
    if (skillsDiv.innerHTML) elements.push(skillsDiv);
    if (subracesDiv) elements.push(subracesDiv);
    if (specialFeaturesDiv) elements.push(specialFeaturesDiv);
    elements.push(selectBtn, cancelBtn);
    
    elements.forEach(el => content.appendChild(el));
    modal.classList.remove('hidden');
}

// Display race selection
// Select a species (from the species tab)
function selectSpecies(speciesName) {
    currentCharacter.race = speciesName;
    const speciesInfo = racesData[speciesName];
    
    // Check if species has subraces
    if (speciesInfo.subraces) {
        displaySubraceSelection(speciesName);
    } else {
        // No subraces, apply racial features directly
        applyRacialFeatures(speciesName, null);
    }
    
    // Display species info section like class selection
    displaySpeciesInfoSection(speciesName);
    
    // Update racesData for save
    updateRacesDataForSave();
}

// Display subrace selection
function displaySubraceSelection(raceName) {
    const raceInfo = racesData[raceName];
    const subraceContainer = document.getElementById('subraceSelection');
    if (!subraceContainer) return;

    // Show the subrace selection container
    subraceContainer.style.display = 'block';
    subraceContainer.innerHTML = `<h3>Choose a ${raceInfo.name} Subrace</h3>`;

    Object.keys(raceInfo.subraces).forEach(subraceKey => {
        const subrace = raceInfo.subraces[subraceKey];
        const subraceCard = document.createElement('div');
        subraceCard.className = 'subrace-card';

        let description = `<h4>${subrace.name}</h4>`;

        // Add ability score increases
        const asi = subrace.abilityScoreIncrease;
        if (asi) {
            const asiList = Object.entries(asi).map(([ability, value]) => 
                `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
            ).join(', ');
            description += `<p><strong>Ability Score Increase:</strong> ${asiList}</p>`;
        }
        
        // Add traits
        if (subrace.traits && subrace.traits.length > 0) {
            const traitNames = subrace.traits.map(trait => 
                typeof trait === 'string' ? trait : trait.name
            );
            description += `<p><strong>Traits:</strong> ${traitNames.join(', ')}</p>`;
        }
        
        // Add weapon proficiencies
        if (subrace.weaponProficiencies && subrace.weaponProficiencies.length > 0) {
            description += `<p><strong>Weapon Proficiencies:</strong> ${subrace.weaponProficiencies.join(', ')}</p>`;
        }
        
        // Add armor proficiencies
        if (subrace.armorProficiencies && subrace.armorProficiencies.length > 0) {
            description += `<p><strong>Armor Proficiencies:</strong> ${subrace.armorProficiencies.join(', ')}</p>`;
        }
        
        // Add speed bonus
        if (subrace.speed) {
            description += `<p><strong>Speed:</strong> ${subrace.speed} feet</p>`;
        }
        
        // Add hit point bonus
        if (subrace.hitPointBonus) {
            description += `<p><strong>Hit Point Bonus:</strong> +${subrace.hitPointBonus} per level</p>`;
        }
        
        description += `<button onclick="selectSubrace('${raceName}', '${subraceKey}')">Select ${subrace.name}</button>`;

        subraceCard.innerHTML = description;
        subraceContainer.appendChild(subraceCard);
    });
}

// Select a subrace
function selectSubrace(raceName, subraceKey) {
    currentCharacter.subrace = subraceKey;
    console.log(raceName, subraceKey)
    applyRacialFeatures(raceName, subraceKey);
    // Hide the subrace selection container
    const subraceContainer = document.getElementById('subraceSelection');
    if (subraceContainer) {
        subraceContainer.style.display = 'none';
    }
    // Display species info section with subrace details
    displaySpeciesInfoSection(raceName);
    
    // Update racesData for save
    updateRacesDataForSave();
}

// Apply all racial features (base race + subrace if applicable)
function applyRacialFeatures(raceName, subraceKey = null) {
    const raceInfo = racesData[raceName];
    // Apply base race features
    applyRacialBonuses(raceName, subraceKey);
    applyRacialSkillProficiencies(raceName);
    applyRacialLanguages(raceName);
    applyRacialToolProficiencies(raceName);
    // Apply subrace features if applicable
    if (subraceKey && raceInfo.subraces && raceInfo.subraces[subraceKey]) {
        const subrace = raceInfo.subraces[subraceKey];
        applySubraceFeatures(raceName, subraceKey, subrace);
    }
    // Handle racial choices (like Human's extra language)
    handleRacialChoices(raceName, subraceKey);
}

// Apply racial skill proficiencies
function applyRacialSkillProficiencies(raceName) {
    const raceInfo = racesData[raceName];
    if (raceInfo.skillProficiencies) {
        raceInfo.skillProficiencies.forEach(skill => {
            // Handle special cases like "Any one skill of your choice"
            if (skill === "Any one skill of your choice") {
                // Don't add this as a proficiency - it will be handled during class selection
                return;
            }
            addSkillProficiency(skill, `${raceInfo.name} Race`);
        });
    }
}

// Apply racial languages
function applyRacialLanguages(raceName) {
    const raceInfo = racesData[raceName];
    if (raceInfo.languages) {
        raceInfo.languages.forEach(language => {
            addLanguageProficiency(language, `${raceInfo.name} Race`);
        });
    }
}

// Apply racial tool proficiencies
function applyRacialToolProficiencies(raceName) {
    const raceInfo = racesData[raceName];
    if (raceInfo.toolProficiencies) {
        raceInfo.toolProficiencies.forEach(tool => {
            addToolProficiency(tool, `${raceInfo.name} Race`);
        });
    }
}

// Apply subrace features
function applySubraceFeatures(raceName, subraceKey, subrace) {
    // Apply subrace ability score increases
    if (subrace.abilityScoreIncrease) {
        Object.entries(subrace.abilityScoreIncrease).forEach(([ability, value]) => {
            addAbilityBonus(ability, value, `${subrace.name} Subrace`);
        });
    }
    
    // Apply subrace skill proficiencies
    if (subrace.skillProficiencies) {
        subrace.skillProficiencies.forEach(skill => {
            addSkillProficiency(skill, `${subrace.name} Subrace`);
        });
    }
    
    // Apply subrace tool proficiencies
    if (subrace.toolProficiencies) {
        subrace.toolProficiencies.forEach(tool => {
            addToolProficiency(tool, `${subrace.name} Subrace`);
        });
    }
    
    // Apply subrace traits
    if (subrace.traits) {
        subrace.traits.forEach(trait => {
            // If the trait is an object with effects, apply them
            if (typeof trait === 'object' && trait.effects) {
                applyTraitEffects(trait.name, null, raceName);
            }
        });
    }
    
    // Store subrace features in character
    currentCharacter.subraceFeatures = subrace;
}

// Handle racial choices (like Human's extra language, High Elf's cantrip, etc.)
function handleRacialChoices(raceName, subraceKey = null) {
    const raceInfo = racesData[raceName];
    
    // Handle base race choices
    if (raceInfo.languageOptions) {
        // This will be handled during character creation process
        currentCharacter.pendingRacialChoices = currentCharacter.pendingRacialChoices || {};
        currentCharacter.pendingRacialChoices.language = raceInfo.languageOptions;
    }
    
    if (raceInfo.skillOptions) {
        currentCharacter.pendingRacialChoices = currentCharacter.pendingRacialChoices || {};
        currentCharacter.pendingRacialChoices.skills = raceInfo.skillOptions;
    }
    
    // Handle subrace choices
    if (subraceKey && raceInfo.subraces && raceInfo.subraces[subraceKey]) {
        const subrace = raceInfo.subraces[subraceKey];
        
        if (subrace.cantripOptions) {
            currentCharacter.pendingRacialChoices = currentCharacter.pendingRacialChoices || {};
            currentCharacter.pendingRacialChoices.cantrip = subrace.cantripOptions;
        }
        
        if (subrace.languageOptions) {
            currentCharacter.pendingRacialChoices = currentCharacter.pendingRacialChoices || {};
            currentCharacter.pendingRacialChoices.subraceLanguage = subrace.languageOptions;
        }
    }
    
    // Handle special cases like Dragonborn ancestry
    if (raceInfo.ancestryOptions) {
        currentCharacter.pendingRacialChoices = currentCharacter.pendingRacialChoices || {};
        currentCharacter.pendingRacialChoices.ancestry = raceInfo.ancestryOptions;
    }
}

// Apply racial bonuses
function applyRacialBonuses(raceName, subraceKey) {
    if (typeof subraceKey === 'undefined') subraceKey = null;
    const raceInfo = racesData[raceName];

    // Reset previous bonuses
    Object.keys(currentCharacter.abilityBonuses).forEach(ab => {
        currentCharacter.abilityBonuses[ab] = 0;
        currentCharacter.abilityBonusSources[ab] = [];
    });
    Object.keys(currentCharacter.statBonuses.attributes).forEach(ab => {
        currentCharacter.statBonuses.attributes[ab] = [];
    });

    // After handling abilityScoreIncrease, apply bonuses from race and subrace
    const allBonuses = [];
    if (raceInfo.bonuses) allBonuses.push(...raceInfo.bonuses);
    if (subraceKey && raceInfo.subraces && raceInfo.subraces[subraceKey] && raceInfo.subraces[subraceKey].bonuses) {
        allBonuses.push(...raceInfo.subraces[subraceKey].bonuses);
    }
    allBonuses.forEach(bonus => {
        if (bonus.category === 'attributes' && currentCharacter.statBonuses.attributes[bonus.key]) {
            currentCharacter.statBonuses.attributes[bonus.key].push({ value: bonus.value, source: bonus.source });
            // Also add to abilityBonuses/abilityBonusSources for display
            const abMap = { STR: 'strength', DEX: 'dexterity', CON: 'constitution', INT: 'intelligence', WIS: 'wisdom', CHA: 'charisma' };
            const ab = abMap[bonus.key];
            if (ab) {
                currentCharacter.abilityBonuses[ab] += bonus.value;
                currentCharacter.abilityBonusSources[ab].push({ value: bonus.value, source: bonus.source });
            }
        }
    });
    updateAbilityModifiers();
    updateAbilityTotalsUI();
}

// Render the subrace section
function renderSubraceSection(container, speciesInfo, speciesName) {
    if (!speciesInfo.subraces) return;
    
    if (currentCharacter.subrace && speciesInfo.subraces[currentCharacter.subrace]) {
        // Show selected subrace details
        const subraceInfo = speciesInfo.subraces[currentCharacter.subrace];
        const subraceCard = renderSimpleCard(
            container,
            `Subrace: ${subraceInfo.name}`,
            `Ability Score Increase: ${Object.entries(subraceInfo.abilityScoreIncrease || {}).map(([ability, value]) => 
                `+${value} ${ability.charAt(0).toUpperCase() + ability.slice(1)}`
            ).join(', ')}`,
            "species-subrace-selected"
        );
        
        // Render subrace traits
        if (subraceInfo.traits && subraceInfo.traits.length > 0) {
            const subraceTraitsContainer = document.createElement('div');
            subraceTraitsContainer.className = 'subrace-traits-container';
            container.appendChild(subraceTraitsContainer);
            
            const subraceTraitsHeader = document.createElement('h4');
            subraceTraitsHeader.textContent = `${subraceInfo.name} Traits`;
            subraceTraitsContainer.appendChild(subraceTraitsHeader);
            
            subraceInfo.traits.forEach(trait => {
                renderTraitCard(subraceTraitsContainer, trait, speciesName);
            });
        }
        
        // Handle subrace-specific choices
        const body = subraceCard.body;
        if (subraceInfo.cantripOptions) {
            renderCantripChoice(body, subraceInfo.cantripOptions);
        }
        if (subraceInfo.languageOptions) {
            renderLanguageChoice(body, subraceInfo.languageOptions, "subrace");
        }
    } else {
        // Show available subraces with interactive buttons
        const subracesCard = renderSimpleCard(
            container,
            "Subraces",
            "Choose one of the following subraces:",
            "species-subraces"
        );
        
        const body = subracesCard.body;
        Object.keys(speciesInfo.subraces).forEach(subraceKey => {
            const subrace = speciesInfo.subraces[subraceKey];
            const button = document.createElement('button');
            button.className = 'subrace-select-button';
            button.textContent = subrace.name;
            button.onclick = () => {
                selectSubrace(speciesName, subraceKey);
            };
            body.appendChild(button);
        });
    }
}

// Render special features section (language, skill options, etc.)
function renderSpecialFeaturesSection(container, speciesInfo) {
    if (speciesInfo.languageOptions || speciesInfo.skillOptions || speciesInfo.ancestryOptions) {
        const specialFeaturesCard = renderSimpleCard(
            container,
            "Special Features",
            "Make your choices below:",
            "species-special-features"
        );
        
        const body = specialFeaturesCard.body;
        
        // Language choices
        if (speciesInfo.languageOptions) {
            renderLanguageChoice(body, speciesInfo.languageOptions, "species");
        }
        
        // Skill choices
        if (speciesInfo.skillOptions) {
            renderSkillChoice(body, speciesInfo.skillOptions, "species");
        }
    }
}

// Helper function to add ability bonus
function addAbilityBonus(ability, value, source) {
    if (!currentCharacter.abilityBonusSources[ability]) {
        currentCharacter.abilityBonusSources[ability] = [];
    }
    
    // Check if this source already exists
    const existingIndex = currentCharacter.abilityBonusSources[ability].findIndex(
        bonus => bonus.source === source
    );
    
    if (existingIndex >= 0) {
        // Update existing bonus
        currentCharacter.abilityBonusSources[ability][existingIndex].value = value;
    } else {
        // Add new bonus
        currentCharacter.abilityBonusSources[ability].push({
            value: value,
            source: source
        });
    }
    
    // Recalculate total bonuses
    updateAbilityBonuses();
}

// Helper function to remove ability bonus
function removeAbilityBonus(ability, source) {
    console.log(`removeAbilityBonus called - Ability: "${ability}", Source: "${source}"`);
    
    if (!currentCharacter.abilityBonusSources[ability]) {
        console.log(`No bonus sources found for ${ability}`);
        return;
    }
    
    console.log(`Current sources for ${ability}:`, currentCharacter.abilityBonusSources[ability]);
    
    const beforeCount = currentCharacter.abilityBonusSources[ability].length;
    
    // Remove the bonus with the specified source
    currentCharacter.abilityBonusSources[ability] = currentCharacter.abilityBonusSources[ability].filter(
        bonus => {
            const matches = bonus.source === source;
            console.log(`Checking bonus source "${bonus.source}" === "${source}": ${matches}`);
            return !matches;
        }
    );
    
    const afterCount = currentCharacter.abilityBonusSources[ability].length;
    console.log(`Removed ${beforeCount - afterCount} bonuses for ${ability}`);
    console.log(`Remaining sources for ${ability}:`, currentCharacter.abilityBonusSources[ability]);
    
    // Recalculate total bonuses
    updateAbilityBonuses();
}

// Update ability bonuses from all sources
function updateAbilityBonuses() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach(ability => {
        // Sum up all bonuses for this ability
        const bonuses = currentCharacter.abilityBonusSources[ability] || [];
        const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.value, 0);
        
        // Update the character's ability bonus
        currentCharacter.abilityBonuses[ability] = totalBonus;
    });
}

// Dynamic racesData variable that updates based on current selections for saving
let saveRacesData = {};

/**
 * Validates if character has a race selected
 */
function validateRaceData() {
    if (!currentCharacter.race) {
        return false;
    }
    return true;
}

/**
 * Fetches race data from JSON file
 */
async function fetchRaceDataFromJSON(raceKey) {
    const response = await fetch('./Races.json');
    const originalRacesData = await response.json();
    const speciesInfo = originalRacesData[raceKey];
    
    if (!speciesInfo) {
        console.error(`Race "${raceKey}" not found in Races.json`);
        return null;
    }
    
    return speciesInfo;
}

/**
 * Builds the initial race data structure
 */
function buildRaceDataStructure(speciesInfo, subraceKey) {
    return {
        "group-title": "Racial Traits",
        "group-chevron": false,
        "traits": [],
        "basicInfo": {
            "raceName": speciesInfo.name,
            "size": speciesInfo.size,
            "baseSpeed": speciesInfo.speed,
            "effectiveSpeed": speciesInfo.speed,
            "subraceName": subraceKey && speciesInfo.subraces && speciesInfo.subraces[subraceKey] ? speciesInfo.subraces[subraceKey].name : null
        },
        "speedBonuses": [],
        "languages": [],
        "skillProficiencies": [],
        "weaponProficiencies": [],
        "armorProficiencies": [],
        "toolProficiencies": []
    };
}

/**
 * Calculates effective speed with bonuses
 */
function calculateRaceSpeed(currentRaceData, speciesInfo, subraceKey) {
    let effectiveSpeed = speciesInfo.speed;
    
    // Check for subrace speed override
    if (subraceKey && speciesInfo.subraces && speciesInfo.subraces[subraceKey]) {
        const subraceInfo = speciesInfo.subraces[subraceKey];
        if (subraceInfo.speed && subraceInfo.speed !== speciesInfo.speed) {
            effectiveSpeed = subraceInfo.speed;
            currentRaceData.speedBonuses.push({
                "source": subraceInfo.name,
                "type": "override", 
                "value": subraceInfo.speed,
                "description": `Base walking speed increases to ${subraceInfo.speed} feet`
            });
        }
    }
    
    currentRaceData.basicInfo.effectiveSpeed = effectiveSpeed;
}

/**
 * Adds base race ability score bonuses
 */
function addRaceAbilityBonuses(currentRaceData, speciesInfo) {
    if (speciesInfo.bonuses) {
        speciesInfo.bonuses.forEach(bonus => {
            if (bonus.category === "attributes") {
                const abilityName = getAbilityNameFromKey(bonus.key);
                currentRaceData.traits.push({
                    "traitName": `${abilityName} Increase`,
                    "cheveron": false,
                    "traitDescription": `Your ${abilityName.toLowerCase()} score increases by ${bonus.value}.`,
                    "checkboxStates": [],
                    "numberOfUses": "0",
                    "adjustmentCategory": "attributes",
                    "adjustmentSubCategory": bonus.key,
                    "adjustmentAbility": "NONE",
                    "adjustmentValue": bonus.value.toString(),
                    "resetType": "none"
                });
            }
        });
    }
}

/**
 * Checks if a trait has a corresponding choice made
 */
function hasCorrespondingChoice(traitName) {
    if (!currentCharacter.choices) return false;
    
    // Check for language choices
    if (traitName === "Extra Language" || traitName.toLowerCase().includes("extra language")) {
        return Object.keys(currentCharacter.choices).some(key => 
            key.includes('language') && currentCharacter.choices[key]
        );
    }
    
    // Check for skill choices  
    if (traitName === "Extra Skill" || traitName.toLowerCase().includes("extra skill")) {
        return Object.keys(currentCharacter.choices).some(key => 
            key.includes('skill') && currentCharacter.choices[key] && 
            (Array.isArray(currentCharacter.choices[key]) ? 
                currentCharacter.choices[key].length > 0 : true)
        );
    }
    
    return false;
}

/**
 * Processes a single race trait
 */
function processRaceTrait(currentRaceData, trait) {
    // Skip generic choice traits if specific choices have been made
    if (hasCorrespondingChoice(trait.name)) {
        return;
    }
    
    let traitDescription = trait.description;
    let traitName = trait.name;
    let adjustmentCategory = "None";
    let adjustmentSubCategory = "";
    let adjustmentValue = "0";
    let adjustmentAbility = "NONE";

    // Try to get the current description from the rendered HTML
    const traitCards = document.querySelectorAll('.feature-card');
    const matchingCard = Array.from(traitCards).find(card => {
        const headerText = card.querySelector('.card-header')?.textContent || '';
        return headerText.includes(trait.name) || headerText.startsWith(trait.name);
    });

    if (matchingCard) {
        const headerElement = matchingCard.querySelector('.card-header');
        if (headerElement) {
            traitName = headerElement.textContent.trim();
        }
        const descriptionElement = matchingCard.querySelector('.card-body p');
        if (descriptionElement) {
            traitDescription = descriptionElement.textContent.trim();
        }
    }

    // Check for bonuses within the trait itself
    if (trait.bonuses && trait.bonuses.length > 0) {
        const bonus = trait.bonuses[0];
        adjustmentCategory = bonus.category || "None";
        adjustmentSubCategory = bonus.key || "";
        adjustmentValue = bonus.value ? bonus.value.toString() : "0";
        if (bonus.adjustmentAbility) {
            adjustmentAbility = bonus.adjustmentAbility;
        }
    }

    // Handle Half-Elf ability score increase choice
    if (trait.name === "Ability Score Increase" && currentCharacter.traitChoices && Array.isArray(currentCharacter.traitChoices[trait.name])) {
        const choiceValue = currentCharacter.traitChoices[trait.name];
        
        choiceValue.forEach(ability => {
            const abilityName = ability.charAt(0).toUpperCase() + ability.slice(1);
            const abilityKey = getAbilityKeyFromName(abilityName);
            
            currentRaceData.traits.push({
                "traitName": `${abilityName} Increase`,
                "cheveron": false,
                "traitDescription": `Your ${abilityName.toLowerCase()} score increases by 1.`,
                "checkboxStates": [],
                "numberOfUses": "0",
                "adjustmentCategory": "attributes",
                "adjustmentSubCategory": abilityKey,
                "adjustmentAbility": "NONE",
                "adjustmentValue": "1",
                "resetType": "none"
            });
        });
        return; // Skip adding the original trait
    }

    currentRaceData.traits.push({
        "traitName": traitName,
        "cheveron": false,
        "traitDescription": traitDescription,
        "checkboxStates": [],
        "numberOfUses": "0",
        "adjustmentCategory": adjustmentCategory,
        "adjustmentSubCategory": adjustmentSubCategory,
        "adjustmentAbility": adjustmentAbility,
        "adjustmentValue": adjustmentValue,
        "resetType": "none"
    });
}

/**
 * Adds base race traits
 */
function addRaceTraits(currentRaceData, speciesInfo) {
    if (speciesInfo.traits) {
        speciesInfo.traits.forEach(trait => {
            processRaceTrait(currentRaceData, trait);
        });
    }
}

/**
 * Adds subrace data (bonuses, traits, proficiencies)
 */
function addSubraceData(currentRaceData, speciesInfo, subraceKey) {
    if (subraceKey && speciesInfo.subraces && speciesInfo.subraces[subraceKey]) {
        const subraceInfo = speciesInfo.subraces[subraceKey];
        
        // Add subrace ability score increases
        if (subraceInfo.bonuses) {
            subraceInfo.bonuses.forEach(bonus => {
                if (bonus.category === "attributes") {
                    const abilityName = getAbilityNameFromKey(bonus.key);
                    currentRaceData.traits.push({
                        "traitName": `${abilityName} Increase (${subraceInfo.name})`,
                        "cheveron": false,
                        "traitDescription": `Your ${abilityName.toLowerCase()} score increases by ${bonus.value}.`,
                        "checkboxStates": [],
                        "numberOfUses": "0",
                        "adjustmentCategory": "attributes",
                        "adjustmentSubCategory": bonus.key,
                        "adjustmentAbility": "NONE",
                        "adjustmentValue": bonus.value.toString(),
                        "resetType": "none"
                    });
                }
            });
        }

        // Add subrace traits
        if (subraceInfo.traits) {
            subraceInfo.traits.forEach(trait => {
                processRaceTrait(currentRaceData, trait);
            });
        }
        
        // Add subrace proficiencies
        if (subraceInfo.weaponProficiencies) {
            currentRaceData.weaponProficiencies = [...subraceInfo.weaponProficiencies];
        }
        if (subraceInfo.armorProficiencies) {
            currentRaceData.armorProficiencies = [...subraceInfo.armorProficiencies];
        }
        if (subraceInfo.toolProficiencies) {
            currentRaceData.toolProficiencies = [...subraceInfo.toolProficiencies];
        }
    }
}

/**
 * Creates a clean trait name with selected choice
 */
function createChoiceTraitName(baseTraitName, choiceValue) {
    // Remove any existing choice indicators and status symbols
    let cleanName = baseTraitName
        .replace(/\(Choose \d+\)/g, '')  // Remove "(Choose 1)", "(Choose 2)", etc.
        .replace(/[✔❗]/g, '')           // Remove status symbols
        .trim();
    
    // Add the selected choice(s)
    if (Array.isArray(choiceValue)) {
        return `${cleanName} (Selected: ${choiceValue.join(', ')})`;
    } else {
        return `${cleanName} (Selected: ${choiceValue})`;
    }
}

/**
 * Adds current character choices as traits
 */
function addRaceChoices(currentRaceData) {
    if (currentCharacter.choices) {
        Object.entries(currentCharacter.choices).forEach(([choiceKey, choiceValue]) => {
            if (choiceKey.includes('language') && choiceValue) {
                let baseTraitName = "Language Choice";
                let traitDescription = `You chose to learn ${choiceValue}.`;
                
                const choiceCards = document.querySelectorAll('.choice-container');
                const matchingCard = Array.from(choiceCards).find(card => {
                    const titleText = card.querySelector('.choice-title')?.textContent || '';
                    return titleText.includes('Language');
                });
                
                if (matchingCard) {
                    const titleElement = matchingCard.querySelector('.choice-title');
                    if (titleElement) {
                        baseTraitName = titleElement.textContent.trim();
                    }
                    const descElement = matchingCard.querySelector('.choice-description');
                    if (descElement) {
                        traitDescription = descElement.textContent.trim() + ` Selected: ${choiceValue}.`;
                    }
                }
                
                const finalTraitName = createChoiceTraitName(baseTraitName, choiceValue);
                
                currentRaceData.traits.push({
                    "traitName": finalTraitName,
                    "cheveron": false,
                    "traitDescription": traitDescription,
                    "checkboxStates": [],
                    "numberOfUses": "0",
                    "adjustmentCategory": "None",
                    "adjustmentSubCategory": "",
                    "adjustmentAbility": "NONE",
                    "adjustmentValue": "0",
                    "resetType": "none"
                });
            } else if (choiceKey.includes('skill') && Array.isArray(choiceValue) && choiceValue.length > 0) {
                let baseTraitName = "Skill Choice";
                let traitDescription = `You chose proficiency in: ${choiceValue.join(', ')}.`;
                
                const choiceCards = document.querySelectorAll('.choice-container');
                const matchingCard = Array.from(choiceCards).find(card => {
                    const titleText = card.querySelector('.choice-title')?.textContent || '';
                    return titleText.includes('Skill');
                });
                
                if (matchingCard) {
                    const titleElement = matchingCard.querySelector('.choice-title');
                    if (titleElement) {
                        baseTraitName = titleElement.textContent.trim();
                    }
                    const descElement = matchingCard.querySelector('.choice-description');
                    if (descElement) {
                        traitDescription = descElement.textContent.trim() + ` Selected: ${choiceValue.join(', ')}.`;
                    }
                }
                
                const finalTraitName = createChoiceTraitName(baseTraitName, choiceValue);
                
                currentRaceData.traits.push({
                    "traitName": finalTraitName,
                    "cheveron": false,
                    "traitDescription": traitDescription,
                    "checkboxStates": [],
                    "numberOfUses": "0",
                    "adjustmentCategory": "None",
                    "adjustmentSubCategory": "",
                    "adjustmentAbility": "NONE",
                    "adjustmentValue": "0",
                    "resetType": "none"
                });
            }
        });
    }
}

/**
 * Populates race lists from character data
 */
function populateRaceLists(currentRaceData, speciesInfo) {
    // Languages
    if (currentCharacter.languages && currentCharacter.languages.proficiencies) {
        currentRaceData.languages = [...currentCharacter.languages.proficiencies];
    }
    
    if (speciesInfo.languages) {
        speciesInfo.languages.forEach(lang => {
            if (!currentRaceData.languages.includes(lang)) {
                currentRaceData.languages.push(lang);
            }
        });
    }
    
    // Skills
    if (currentCharacter.skills && currentCharacter.skills.proficiencies) {
        currentRaceData.skillProficiencies = [...currentCharacter.skills.proficiencies];
    }
    
    if (speciesInfo.skillProficiencies) {
        speciesInfo.skillProficiencies.forEach(skill => {
            if (!currentRaceData.skillProficiencies.includes(skill)) {
                currentRaceData.skillProficiencies.push(skill);
            }
        });
    }
    
    // Tools
    if (speciesInfo.toolProficiencies) {
        currentRaceData.toolProficiencies = [...currentRaceData.toolProficiencies, ...speciesInfo.toolProficiencies];
    }
    
    if (currentCharacter.tools && currentCharacter.tools.proficiencies) {
        currentCharacter.tools.proficiencies.forEach(tool => {
            if (!currentRaceData.toolProficiencies.includes(tool)) {
                currentRaceData.toolProficiencies.push(tool);
            }
        });
    }
}

/**
 * Saves the final race data
 */
function saveRaceDataToGlobal(currentRaceData, raceKey, subraceKey) {
    const saveKey = subraceKey ? `${raceKey}-${subraceKey}` : raceKey;
    saveRacesData = {
        [saveKey]: currentRaceData
    };
    console.log('Updated racesData for save:', saveRacesData);
}

// Function to update racesData based on current character selections  
async function updateRacesDataForSave() {
    // Clear all previous race data first
    saveRacesData = {};
    
    if (!validateRaceData()) {
        return;
    }

    // Get race data from JSON
    const raceKey = currentCharacter.race;
    const subraceKey = currentCharacter.subrace;
    
    try {
        const speciesInfo = await fetchRaceDataFromJSON(raceKey);
        if (!speciesInfo) return;

        // Build the race data structure
        const currentRaceData = buildRaceDataStructure(speciesInfo, subraceKey);
        
        // Process all components
        calculateRaceSpeed(currentRaceData, speciesInfo, subraceKey);
        addRaceAbilityBonuses(currentRaceData, speciesInfo);
        addRaceTraits(currentRaceData, speciesInfo);
        addSubraceData(currentRaceData, speciesInfo, subraceKey);
        addRaceChoices(currentRaceData);
        populateRaceLists(currentRaceData, speciesInfo);
        
        // Save the final data
        saveRaceDataToGlobal(currentRaceData, raceKey, subraceKey);
        
    } catch (error) {
        console.error('Error updating racesData for save:', error);
    }
}



// Helper function to get ability name from key
function getAbilityNameFromKey(key) {
    const abilityMap = {
        'STR': 'Strength',
        'DEX': 'Dexterity',
        'CON': 'Constitution',
        'INT': 'Intelligence',
        'WIS': 'Wisdom',
        'CHA': 'Charisma'
    };
    return abilityMap[key] || key;
}

// Helper function to get ability key from name
function getAbilityKeyFromName(name) {
    const abilityMap = {
        'Strength': 'STR',
        'Dexterity': 'DEX',
        'Constitution': 'CON',
        'Intelligence': 'INT',
        'Wisdom': 'WIS',
        'Charisma': 'CHA'
    };
    return abilityMap[name] || name.toUpperCase().slice(0, 3);
}

// Helper function to add speed bonuses (for future class/feat/item bonuses)
// Example usage: 
//   addSpeedBonus("Monk Level 2", "bonus", 10, "Unarmored Movement increases speed by 10 feet");
//   addSpeedBonus("Boots of Speed", "multiplier", 2, "Your speed is doubled");
function addSpeedBonus(source, type, value, description) {
    if (saveRacesData && Object.keys(saveRacesData).length > 0) {
        const raceKey = Object.keys(saveRacesData)[0];
        const raceData = saveRacesData[raceKey];
        
        // Add the bonus
        raceData.speedBonuses.push({
            "source": source,
            "type": type, // "bonus", "override", "multiplier", etc.
            "value": value,
            "description": description
        });
        
        // Recalculate effective speed
        let newEffectiveSpeed = raceData.basicInfo.baseSpeed;
        raceData.speedBonuses.forEach(bonus => {
            if (bonus.type === "override") {
                newEffectiveSpeed = bonus.value;
            } else if (bonus.type === "bonus") {
                newEffectiveSpeed += bonus.value;
            } else if (bonus.type === "multiplier") {
                newEffectiveSpeed *= bonus.value;
            }
        });
        
        raceData.basicInfo.effectiveSpeed = newEffectiveSpeed;
        console.log('Updated speed:', newEffectiveSpeed, 'from bonuses:', raceData.speedBonuses);
    }
}



// Helper function to add a skill proficiency
function addSkillProficiency(skill, source) {
    // Initialize skills object if needed
    currentCharacter.skills = currentCharacter.skills || {};
    currentCharacter.skills.proficiencies = currentCharacter.skills.proficiencies || [];
    currentCharacter.skills.sources = currentCharacter.skills.sources || {};
    
    // Add the skill if not already proficient
    if (!currentCharacter.skills.proficiencies.includes(skill)) {
        currentCharacter.skills.proficiencies.push(skill);
        currentCharacter.skills.sources[skill] = source;
    }
}

// Helper function to remove a skill proficiency
function removeSkillProficiency(skill) {
    if (!currentCharacter.skills || !currentCharacter.skills.proficiencies) return;
    
    const index = currentCharacter.skills.proficiencies.indexOf(skill);
    if (index > -1) {
        currentCharacter.skills.proficiencies.splice(index, 1);
        delete currentCharacter.skills.sources[skill];
    }
}

// Helper function to add a language proficiency
function addLanguageProficiency(language, source) {
    // Initialize languages object if needed
    currentCharacter.languages = currentCharacter.languages || {};
    currentCharacter.languages.proficiencies = currentCharacter.languages.proficiencies || [];
    currentCharacter.languages.sources = currentCharacter.languages.sources || {};
    
    // Add the language if not already proficient
    if (!currentCharacter.languages.proficiencies.includes(language)) {
        currentCharacter.languages.proficiencies.push(language);
        currentCharacter.languages.sources[language] = source;
    }
}

// Helper function to remove a language proficiency
function removeLanguageProficiency(language) {
    if (!currentCharacter.languages || !currentCharacter.languages.proficiencies) return;
    
    const index = currentCharacter.languages.proficiencies.indexOf(language);
    if (index > -1) {
        currentCharacter.languages.proficiencies.splice(index, 1);
        delete currentCharacter.languages.sources[language];
    }
}

// Helper function to add a tool proficiency
function addToolProficiency(tool, source) {
    // Initialize tools object if needed
    currentCharacter.tools = currentCharacter.tools || {};
    currentCharacter.tools.proficiencies = currentCharacter.tools.proficiencies || [];
    currentCharacter.tools.sources = currentCharacter.tools.sources || {};
    
    // Add the tool if not already proficient
    if (!currentCharacter.tools.proficiencies.includes(tool)) {
        currentCharacter.tools.proficiencies.push(tool);
        currentCharacter.tools.sources[tool] = source;
    }
}

// Helper function to remove a tool proficiency
function removeToolProficiency(tool) {
    if (!currentCharacter.tools || !currentCharacter.tools.proficiencies) return;
    
    const index = currentCharacter.tools.proficiencies.indexOf(tool);
    if (index > -1) {
        currentCharacter.tools.proficiencies.splice(index, 1);
        delete currentCharacter.tools.sources[tool];
    }
}

/**
 * Renders a skill choice interface
 */
function renderSkillChoice(parent, skillOptions, source) {
    const container = document.createElement('div');
    container.className = 'choice-container';
    
    const title = document.createElement('h4');
    title.textContent = `Skill Choice (Choose ${skillOptions.choose})`;
    title.className = 'choice-title';
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = skillOptions.description;
    description.className = 'choice-description';
    container.appendChild(description);
    
    // Show already taken skills as warning, not blocking
    const takenSkills = getTakenSkills(skillOptions.options);
    if (takenSkills.length > 0) {
        const takenDiv = document.createElement('div');
        takenDiv.className = 'taken-skills-warning';
        takenDiv.innerHTML = `<strong>Note:</strong> ${takenSkills.map(skill => 
            `${skill} (${getSkillSource(skill)})`
        ).join(', ')} are already taken. Selecting them again will duplicate the proficiency.`;
        container.appendChild(takenDiv);
    }
    
    const select = document.createElement('select');
    select.className = 'choice-select';
    select.appendChild(new Option('-- select skill --', '', true, true));
    
    skillOptions.options.forEach(skill => {
        const option = new Option(skill, skill);
        // Don't disable options - just show if they're already taken
        if (hasSkillProficiency(skill)) {
            option.text = `${skill} (already taken)`;
        }
        select.appendChild(option);
    });
    
    // Update the dropdown options to reflect current state
    updateDropdownOptions(select);
    
    // Track the currently selected skill for this choice
    const choiceKey = `${source}-skill-choice`;
    const currentChoice = currentCharacter.choices[choiceKey] || null;
    
    // If there's a current choice, select it
    if (currentChoice) {
        select.value = currentChoice;
    }
    
    select.onchange = () => {
        console.warn('=== SPECIES SKILL SELECTION CHANGE ===');
        
        // Get the current choice from storage (not from closure)
        const previousChoice = currentCharacter.choices[choiceKey] || null;
        console.warn('Previous choice from storage:', previousChoice);
        console.warn('New choice:', select.value);
        console.warn('Current choices object:', currentCharacter.choices);
        console.warn('Choice key:', choiceKey);
        console.warn('Taken skills BEFORE change:', [...currentCharacter.skills.proficiencies]);
        
        // Remove previous choice if it exists and is different
        if (previousChoice && previousChoice !== select.value) {
            console.warn('Removing previous choice:', previousChoice);
            removeSkillProficiency(previousChoice);
        } else {
            console.warn('NOT removing previous choice. previousChoice:', previousChoice, 'select.value:', select.value);
        }
        
        if (select.value && select.value !== '') {
            // Add new skill proficiency (allows duplication)
            addSkillProficiency(select.value, `${source} Choice`);
            
            // Store the choice
            currentCharacter.choices[choiceKey] = select.value;
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
            }
        } else {
            // Clear the choice
            delete currentCharacter.choices[choiceKey];
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '❗';
                status.className = 'choice-status incomplete';
            }
        }
        
        console.warn('Taken skills AFTER change:', [...currentCharacter.skills.proficiencies]);
        
        // Update this specific dropdown's options
        updateDropdownOptions(select);
        
        // Update other skill displays without re-rendering
        updateSkillOptionDisplays();
    };
    
    container.appendChild(select);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = currentChoice ? '✔' : '❗';
    title.appendChild(status);
    
    parent.appendChild(container);
}