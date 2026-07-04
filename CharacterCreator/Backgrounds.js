// Backgrounds.js - Handles background selection and application of bonuses

// Load background data
let backgroundsData = {};

// Current selected background
let selectedBackground = null;

// "One type of ..." tool proficiency entries expand into a pick from these lists
const BACKGROUND_TOOL_CATEGORIES = {
    "One type of artisan's tools": [
        "Alchemist's supplies", "Brewer's supplies", "Calligrapher's supplies",
        "Carpenter's tools", "Cartographer's tools", "Cobbler's tools",
        "Cook's utensils", "Glassblower's tools", "Jeweler's tools",
        "Leatherworker's tools", "Mason's tools", "Painter's supplies",
        "Potter's tools", "Smith's tools", "Tinker's tools",
        "Weaver's tools", "Woodcarver's tools"
    ],
    "One type of gaming set": [
        "Dice set", "Dragonchess set", "Playing card set", "Three-Dragon Ante set"
    ],
    "One type of musical instrument": [
        "Bagpipes", "Drum", "Dulcimer", "Flute", "Horn",
        "Lute", "Lyre", "Pan flute", "Shawm", "Viol"
    ]
};

const BACKGROUND_ALL_SKILLS = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival'
];

// Choices made for a background are stored under keys prefixed with its name;
// fixed grants use source `bg.name`, chosen ones use `${bg.name} Choice`
function backgroundChoiceKey(bg, kind, item) {
    return `${bg.name}-${kind}-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

// Initialize backgrounds
async function loadBackgroundsData() {
    try {
        const response = await fetch('Backgrounds.json');
        backgroundsData = await response.json();
        console.log("Backgrounds data loaded:", backgroundsData);
    } catch (error) {
        console.error('Error loading backgrounds data:', error);
    }
}

// Display background selection cards
function displayBackgroundSelection() {
    const container = document.getElementById('features'); // Using features tab container
    container.innerHTML = '<h2>Choose Your Background</h2>';
    
    const grid = document.createElement('div');
    grid.className = 'species-selection';
    grid.id = 'backgroundSelection';
    grid.style.maxHeight = 'calc(100vh - 250px)';
    grid.style.overflowY = 'auto';
    
    for (const [key, bg] of Object.entries(backgroundsData)) {
        const card = document.createElement('div');
        card.className = 'species-card';
        card.dataset.backgroundKey = key;
        
        if (selectedBackground === key) {
            card.classList.add('selected');
        }
        
        card.innerHTML = `
            <h4>${bg.name}</h4>
            <p>${bg.skillProficiencies.join(', ')}</p>
        `;
        
        card.addEventListener('click', () => openBackgroundModal(key));
        grid.appendChild(card);
    }
    
    container.appendChild(grid);
}

// Open background details modal
function openBackgroundModal(backgroundKey) {
    const bg = backgroundsData[backgroundKey];
    if (!bg) {
        console.error(`Background ${backgroundKey} not found`);
        return;
    }
    
    // Create a modal if it doesn't exist
    let modal = document.getElementById('backgroundModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'backgroundModal';
        modal.className = 'modalCharacterCreator hidden';
        
        const modalContent = document.createElement('div');
        modalContent.id = 'backgroundModalContent';
        modalContent.className = 'modalCreatorContent';
        modalContent.style.maxHeight = '80vh';
        modalContent.style.overflowY = 'auto';
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }
    
    const content = document.getElementById('backgroundModalContent');
    
    content.innerHTML = `
        <div class="species-basic-info">
            <h2>${bg.name}</h2>
            <p><strong>Skill Proficiencies:</strong> ${bg.skillProficiencies.join(', ')}</p>
            ${bg.toolProficiencies.length > 0 ? `<p><strong>Tool Proficiencies:</strong> ${bg.toolProficiencies.join(', ')}</p>` : ''}
            ${bg.languages.length > 0 ? `<p><strong>Languages:</strong> ${bg.languages.join(', ')}</p>` : ''}
        </div>
        
        <div class="species-equipment">
            <h3>Equipment</h3>
            <ul class="equipment-list">
                ${bg.equipment.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        
        <div class="species-traits">
            <h3>Features</h3>
            ${bg.features.map(f => `
                <div class="feature-item">
                    <h5>${f.name}</h5>
                    <p>${f.description}</p>
                </div>
            `).join('')}
        </div>
        
        <div class="species-action-buttons">
            <button id="selectBackgroundButton" class="btn btn-primary">Select Background</button>
            <button id="cancelBackgroundButton" class="btn btn-secondary">Cancel</button>
        </div>
    `;
    
    document.getElementById('selectBackgroundButton').addEventListener('click', () => {
        selectBackground(backgroundKey);
        modal.classList.add('hidden');
    });
    
    document.getElementById('cancelBackgroundButton').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    modal.classList.remove('hidden');
}

// Select a background and apply its features
function selectBackground(backgroundKey) {
    const bg = backgroundsData[backgroundKey];
    if (!bg) {
        console.error(`Background ${backgroundKey} not found`);
        return;
    }
    
    // Clear previous background if any
    if (selectedBackground) {
        clearBackgroundBonuses(selectedBackground);
    }
    
    selectedBackground = backgroundKey;
    
    // Apply background features
    applyBackgroundFeatures(bg);
    
    // Update character background dropdown in basics tab
    const backgroundDropdown = document.getElementById('characterBackground');
    if (backgroundDropdown) {
        backgroundDropdown.value = backgroundKey;
    }
    
    // Update UI
    displayBackgroundInfoSection(backgroundKey);
    
    showSuccess(`${bg.name} background selected!`);
}

// Clear previous background bonuses
function clearBackgroundBonuses(backgroundKey) {
    const bg = backgroundsData[backgroundKey];
    if (!bg) return;

    // Everything this background granted carries one of these two sources
    const fromBackground = source => source === bg.name || source === `${bg.name} Choice`;

    [...(currentCharacter.skills?.proficiencies || [])].forEach(skill => {
        if (fromBackground(getSkillSource(skill))) {
            removeSkillProficiency(skill);
        }
    });

    [...(currentCharacter.tools?.proficiencies || [])].forEach(tool => {
        if (fromBackground(getToolSource(tool))) {
            removeToolProficiency(tool);
        }
    });

    [...(currentCharacter.languages?.proficiencies || [])].forEach(lang => {
        if (fromBackground(getLanguageSource(lang))) {
            removeLanguageProficiency(lang);
        }
    });

    // Clear all stored choices for this background (languages, tools, skill replacements)
    if (currentCharacter && currentCharacter.choices) {
        Object.keys(currentCharacter.choices).forEach(key => {
            if (key.startsWith(`${bg.name}-`)) {
                delete currentCharacter.choices[key];
            }
        });
    }

    // Update UI
    updateSkillOptionDisplays();
}

// Apply background features
function applyBackgroundFeatures(bg) {
    // Apply skill proficiencies. Skills already granted by another source stay
    // with that source; the info section then offers a replacement pick
    // (5e rule: duplicate proficiencies let you choose a different one).
    bg.skillProficiencies.forEach(skill => {
        if (!hasSkillProficiency(skill)) {
            addSkillProficiency(skill, bg.name);
        }
    });

    // Apply fixed tool proficiencies ("One type of ..." entries are picked in the UI)
    (bg.toolProficiencies || []).forEach(tool => {
        if (!BACKGROUND_TOOL_CATEGORIES[tool] && !hasToolProficiency(tool)) {
            addToolProficiency(tool, bg.name);
        }
    });

    // Apply language proficiencies
    if (bg.languageOptions) {
        // Picked in the UI; saved picks are re-applied below
    } else if (bg.languages.length > 0) {
        bg.languages.forEach(lang => {
            if (!lang.includes('of your choice') && !hasLanguageProficiency(lang)) {
                addLanguageProficiency(lang, bg.name);
            }
        });
    }

    // Re-apply saved choices (relevant when a saved character is loaded)
    const choices = currentCharacter.choices || {};
    Object.entries(choices).forEach(([key, value]) => {
        if (!value || !key.startsWith(`${bg.name}-`)) return;
        const values = Array.isArray(value) ? value : [value];
        if (key.startsWith(`${bg.name}-tool-choice-`)) {
            values.forEach(tool => addToolProficiency(tool, `${bg.name} Choice`));
        } else if (key.startsWith(`${bg.name}-skill-replacement-`)) {
            values.forEach(skill => addSkillProficiency(skill, `${bg.name} Choice`));
        } else if (key.startsWith(`${bg.name}-language-choice`)) {
            values.forEach(lang => addLanguageProficiency(lang, `${bg.name} Choice`));
        }
    });

    // Update UI
    updateSkillOptionDisplays();
}

// Display selected background info section
function displayBackgroundInfoSection(backgroundKey) {
    const bg = backgroundsData[backgroundKey];
    const container = document.getElementById('features');
    
    container.innerHTML = `
        <h2>Selected Background: ${bg.name}</h2>
    `;
    
    // Create a scrollable container for the rest of the content
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'background-scroll-container';
    container.appendChild(scrollContainer);
    
    // Add equipment section
    const equipmentSection = document.createElement('div');
    equipmentSection.className = 'background-equipment-section';
    equipmentSection.innerHTML = `
        <h3>Equipment</h3>
        <ul class="background-equipment-list">
            ${bg.equipment.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    scrollContainer.appendChild(equipmentSection);
    
    // Add features section
    const featuresSection = document.createElement('div');
    featuresSection.className = 'feature-list';
    featuresSection.innerHTML = `
        <h3>Background Features</h3>
        ${bg.features.map(f => `
            <div class="feature-item">
                <h5>${f.name}</h5>
                <p>${f.description}</p>
            </div>
        `).join('')}
        <div class="summary-section">
            <h3>Background Details</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Skill Proficiencies:</strong> ${bg.skillProficiencies.join(', ')}
                </div>
                ${bg.toolProficiencies.length > 0 ? `
                <div class="summary-item">
                    <strong>Tool Proficiencies:</strong> ${bg.toolProficiencies.join(', ')}
                </div>` : ''}
            </div>
        </div>
    `;
    scrollContainer.appendChild(featuresSection);
    
    // Add choices section (languages, tool picks, duplicate-skill replacements)
    const choicesContainer = document.createElement('div');
    choicesContainer.id = 'backgroundChoices';
    choicesContainer.className = 'choice-group';
    scrollContainer.appendChild(choicesContainer);

    renderBackgroundChoices(choicesContainer, bg);
    
    // Add change background button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'navigation-buttons';
    buttonContainer.innerHTML = `
        <button class="btn btn-secondary" onclick="displayBackgroundSelection()">Change Background</button>
    `;
    container.appendChild(buttonContainer);
}

// Render background choices (languages, tools, duplicate-skill replacements)
function renderBackgroundChoices(parent, bg) {
    if (!bg) return;

    // Replacement picks for skills another source already granted
    renderBackgroundSkillReplacements(parent, bg);

    // Tool proficiency picks ("One type of artisan's tools", ...)
    (bg.toolProficiencies || []).forEach(tool => {
        if (BACKGROUND_TOOL_CATEGORIES[tool]) {
            renderBackgroundToolChoice(parent, bg, tool);
        }
    });

    // Add language choices
    if (bg.languageOptions) {
        renderLanguageChoices(parent, bg.languageOptions, bg.name);
    }
}

// A skill this background grants is already covered by class/race: per the 5e
// duplicate-proficiency rule the player picks a different skill instead.
function renderBackgroundSkillReplacements(parent, bg) {
    const duplicated = bg.skillProficiencies.filter(skill => {
        const source = getSkillSource(skill);
        return hasSkillProficiency(skill) && source !== bg.name && source !== `${bg.name} Choice`;
    });
    if (duplicated.length === 0) return;

    duplicated.forEach(skill => {
        const container = document.createElement('div');
        container.className = 'choice-container';

        const choiceKey = backgroundChoiceKey(bg, 'skill-replacement', skill);
        const currentChoice = currentCharacter.choices?.[choiceKey] || '';

        const title = document.createElement('h4');
        title.textContent = `Replacement Skill for ${skill}`;
        title.className = 'choice-title';
        container.appendChild(title);

        const status = document.createElement('span');
        status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
        status.textContent = currentChoice ? '✔' : '❗';
        title.appendChild(status);

        const description = document.createElement('p');
        description.className = 'choice-description';
        description.textContent = `${bg.name} grants ${skill}, but you already have it from ` +
            `${getSkillSource(skill)}. Choose a different skill proficiency instead.`;
        container.appendChild(description);

        const select = document.createElement('select');
        select.className = 'choice-select';
        select.appendChild(new Option('-- select skill --', '', true, true));
        BACKGROUND_ALL_SKILLS
            .filter(s => !hasSkillProficiency(s) || s === currentChoice)
            .forEach(s => select.appendChild(new Option(s, s)));
        if (currentChoice) select.value = currentChoice;

        select.onchange = () => {
            const previous = currentCharacter.choices?.[choiceKey];
            if (previous && previous !== select.value &&
                getSkillSource(previous) === `${bg.name} Choice`) {
                removeSkillProficiency(previous);
            }

            if (!currentCharacter.choices) currentCharacter.choices = {};
            if (select.value) {
                addSkillProficiency(select.value, `${bg.name} Choice`);
                currentCharacter.choices[choiceKey] = select.value;
                status.textContent = '✔';
                status.className = 'choice-status complete';
            } else {
                delete currentCharacter.choices[choiceKey];
                status.textContent = '❗';
                status.className = 'choice-status incomplete';
            }
            updateSkillOptionDisplays();
        };

        container.appendChild(select);
        parent.appendChild(container);
    });
}

// Dropdown for a "One type of ..." tool proficiency
function renderBackgroundToolChoice(parent, bg, category) {
    const options = BACKGROUND_TOOL_CATEGORIES[category];
    const container = document.createElement('div');
    container.className = 'choice-container';

    const choiceKey = backgroundChoiceKey(bg, 'tool-choice', category);
    const currentChoice = currentCharacter.choices?.[choiceKey] || '';

    const title = document.createElement('h4');
    title.textContent = `Tool Proficiency (${category})`;
    title.className = 'choice-title';
    container.appendChild(title);

    const status = document.createElement('span');
    status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = currentChoice ? '✔' : '❗';
    title.appendChild(status);

    const select = document.createElement('select');
    select.className = 'choice-select';
    select.appendChild(new Option('-- select tool --', '', true, true));
    options.forEach(tool => {
        const option = new Option(tool, tool);
        if (hasToolProficiency(tool) && tool !== currentChoice) {
            option.text = `${tool} (already taken)`;
        }
        select.appendChild(option);
    });
    if (currentChoice) select.value = currentChoice;

    select.onchange = () => {
        const previous = currentCharacter.choices?.[choiceKey];
        if (previous && previous !== select.value &&
            getToolSource(previous) === `${bg.name} Choice`) {
            removeToolProficiency(previous);
        }

        if (!currentCharacter.choices) currentCharacter.choices = {};
        if (select.value) {
            addToolProficiency(select.value, `${bg.name} Choice`);
            currentCharacter.choices[choiceKey] = select.value;
            status.textContent = '✔';
            status.className = 'choice-status complete';
        } else {
            delete currentCharacter.choices[choiceKey];
            status.textContent = '❗';
            status.className = 'choice-status incomplete';
        }
    };

    container.appendChild(select);
    parent.appendChild(container);
}

// Render language choices
function renderLanguageChoices(parent, languageOptions, source) {
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
    
    // Create a div for the skill options
    const skillOptionsDiv = document.createElement('div');
    skillOptionsDiv.className = 'skill-options';
    
    if (languageOptions.choose > 1) {
        renderMultipleLanguageChoices(skillOptionsDiv, languageOptions, source, title);
    } else {
        renderSingleLanguageChoice(skillOptionsDiv, languageOptions, source);
    }
    
    // Append the skill options directly to the container
    container.appendChild(skillOptionsDiv);
    
    parent.appendChild(container);
}

// Render a single language choice dropdown
function renderSingleLanguageChoice(container, languageOptions, source) {
    const select = document.createElement('select');
    select.className = 'choice-select';
    select.appendChild(new Option('-- select language --', '', true, true));

    // Track the currently selected language for this choice
    const choiceKey = `${source}-language-choice`;
    const currentChoice = currentCharacter.choices && currentCharacter.choices[choiceKey] ?
                          currentCharacter.choices[choiceKey] : null;

    // Filter out languages the character already knows (keep the saved pick,
    // which is already applied as a proficiency)
    const availableLanguages = languageOptions.options.filter(lang =>
        !hasLanguageProficiency(lang) || lang === currentChoice
    );

    availableLanguages.forEach(lang => {
        select.appendChild(new Option(lang, lang));
    });
    
    // If there's a current choice, select it
    if (currentChoice) {
        select.value = currentChoice;
    }
    
    select.onchange = () => {
        // Get the current choice from storage (not from closure)
        const previousChoice = currentCharacter.choices && currentCharacter.choices[choiceKey] ? 
                               currentCharacter.choices[choiceKey] : null;
        
        // Remove previous choice if it exists and is different
        if (previousChoice && previousChoice !== select.value) {
            removeLanguageProficiency(previousChoice);
        }
        
        if (select.value && select.value !== '') {
            // Add new language
            addLanguageProficiency(select.value, `${source} Choice`);
            
            // Store the choice
            if (!currentCharacter.choices) currentCharacter.choices = {};
            currentCharacter.choices[choiceKey] = select.value;
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
            }
        } else {
            // Clear the choice
            if (currentCharacter.choices) {
                delete currentCharacter.choices[choiceKey];
            }
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                status.textContent = '❗';
                status.className = 'choice-status incomplete';
            }
        }
    };
    
    container.appendChild(select);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = currentChoice ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = currentChoice ? '✔' : '❗';
}

// Render multiple language choices with checkboxes
function renderMultipleLanguageChoices(container, languageOptions, source, title) {
    // Create checkboxes for each language option
    const langContainer = document.createElement('div');
    langContainer.className = 'skill-options';
    
    // Track selected languages
    const selectedLanguages = [];
    const choiceKey = `${source}-language-choice`;
    
    // Get previously selected languages
    if (currentCharacter.choices && currentCharacter.choices[choiceKey]) {
        if (Array.isArray(currentCharacter.choices[choiceKey])) {
            selectedLanguages.push(...currentCharacter.choices[choiceKey]);
        } else {
            selectedLanguages.push(currentCharacter.choices[choiceKey]);
        }
    }
    
    // Filter out languages the character already knows
    const availableLanguages = languageOptions.options.filter(lang => 
        !hasLanguageProficiency(lang) || selectedLanguages.includes(lang)
    );
    
    // Create checkboxes for each option
    availableLanguages.forEach(lang => {
        const langOption = document.createElement('div');
        langOption.className = 'skill-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${source}-lang-${lang.toLowerCase().replace(/\s+/g, '-')}`;
        checkbox.value = lang;
        checkbox.checked = selectedLanguages.includes(lang);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = lang;
        
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                // Check if we've reached the limit
                if (selectedLanguages.length < languageOptions.choose) {
                    selectedLanguages.push(lang);
                    addLanguageProficiency(lang, `${source} Choice`);
                } else {
                    // Uncheck the box if we've reached the limit
                    e.target.checked = false;
                    return;
                }
            } else {
                // Remove from selected languages
                const index = selectedLanguages.indexOf(lang);
                if (index > -1) {
                    selectedLanguages.splice(index, 1);
                    removeLanguageProficiency(lang);
                }
            }
            
            // Update the character's choices
            if (!currentCharacter.choices) currentCharacter.choices = {};
            currentCharacter.choices[choiceKey] = [...selectedLanguages];
            
            // Update status
            const status = container.querySelector('.choice-status');
            if (status) {
                if (selectedLanguages.length === languageOptions.choose) {
                    status.textContent = '✔';
                    status.className = 'choice-status complete';
                } else {
                    status.textContent = '❗';
                    status.className = 'choice-status incomplete';
                }
            }
        });
        
        langOption.appendChild(checkbox);
        langOption.appendChild(label);
        langContainer.appendChild(langOption);
    });
    
    container.appendChild(langContainer);
    
    // Add selection count
    const countDisplay = document.createElement('p');
    countDisplay.className = 'choice-count';
    countDisplay.textContent = `Selected: ${selectedLanguages.length}/${languageOptions.choose}`;
    container.appendChild(countDisplay);
    
    // Add status indicator
    const status = document.createElement('span');
    status.className = selectedLanguages.length === languageOptions.choose ? 'choice-status complete' : 'choice-status incomplete';
    status.textContent = selectedLanguages.length === languageOptions.choose ? '✔' : '❗';

}

// Helper function to show success message
function showSuccess(message) {
    // Check if we have a success message element
    let successEl = document.getElementById('successMessage');
    if (!successEl) {
        successEl = document.createElement('div');
        successEl.id = 'successMessage';
        successEl.className = 'success-message';
        document.querySelector('.tab-content').prepend(successEl);
    }
    
    successEl.textContent = message;
    successEl.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        successEl.style.display = 'none';
    }, 3000);
}

// Initialize backgrounds system
async function initializeBackgrounds() {
    await loadBackgroundsData();
    
    // Set up event listener for tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.textContent === 'Backgrounds') {
                if (selectedBackground) {
                    displayBackgroundInfoSection(selectedBackground);
                } else {
                    displayBackgroundSelection();
                }
            }
        });
    });
    
    // Check if we're on the backgrounds tab
    if (document.querySelector('.nav-tab.active').textContent === 'Backgrounds') {
        if (selectedBackground) {
            displayBackgroundInfoSection(selectedBackground);
        } else {
            displayBackgroundSelection();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeBackgrounds);
