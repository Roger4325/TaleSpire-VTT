// TS.realtime.onSyncMessage((message, source) => {
//     // Check if the message is from the PlayerScript
//     if (source === "PlayerScript") {
//         // Process the message, e.g., extract the roll result and update the UI
//         const rollResult = extractRollResult(message);
//         // Update the DMScript UI with the roll result
//     }
// });

function extractRollResult(message) {
    console.log(message)
    // Implement a function to extract the roll result from the message
    // You might need to parse the message to get the roll result.
    // For example, you can use regular expressions or string manipulation.
    // The message might be something like "Player rolled a 4 on the dice".
    // Extract the number (4) and return it as the roll result.
    // This will depend on the format of your messages.
}


const monsters = [
    { name: 'Goblin', hp: { current: 15, max: 15 }, ac: 13, info: 'Small, green, and cunning.', initiative: 0 },
    { name: 'Orc', hp: { current: 30, max: 30 }, ac: 16, info: 'Big, brutish, and aggressive.', initiative: 0 },
    { name: 'Dragon', hp: { current: 200, max: 200 }, ac: 19, info: 'A powerful and fearsome creature.', initiative: 0 }
    // Add more monsters as needed
];

const playerCharacters = [
    { name: 'Mira', hp: { current: 30, max: 30 }, ac: 14, initiative: 0 },
    { name: 'Sterling', hp: { current: 40, max: 40 }, ac: 17, initiative: 0 }
    // Add more player characters as needed
];

// Initialize the tracker (Removed initial call to renderMonsterCards())

// Event listener for adding a new empty monster card
document.getElementById('add-monster-button').addEventListener('click', function() {
    createEmptyMonsterCard();
});



function createEmptyMonsterCard() {
    // Create the monster card container
    const card = document.createElement('div');
    card.classList.add('monster-card');

    // Create the dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('dropdown-container');

    // Create the input field for monster names
    const nameInput = document.createElement('input');
    nameInput.classList.add('monster-name-input');
    nameInput.placeholder = 'Select or type a monster name...';

    // Create the dropdown list
    const monsterList = document.createElement('ul');
    monsterList.classList.add('monster-list');
    
    // Populate the dropdown list with monster names
    monsters.forEach(monster => {
        const listItem = document.createElement('li');
        listItem.textContent = monster.name;
        listItem.addEventListener('click', () => {
            // Find the selected monster
            const selectedMonster = monsters.find(m => m.name === listItem.textContent);

            // Update the monster card with selected monster's details
            updateMonsterCard(card, selectedMonster);

            // Hide the dropdown after selection
            monsterList.style.display = 'none';
        });
        monsterList.appendChild(listItem);
    });

    // Add event listener to show/hide the dropdown list
    nameInput.addEventListener('focus', () => {
        monsterList.style.display = 'block'; // Show dropdown on focus
    });

    // Add event listener to filter the dropdown list
    nameInput.addEventListener('input', () => {
        const filterText = nameInput.value.toLowerCase();
        monsterList.querySelectorAll('li').forEach(li => {
            const monsterName = li.textContent.toLowerCase();
            li.style.display = monsterName.includes(filterText) ? 'block' : 'none';
        });
    });

    // Hide the dropdown when clicking outside of it
    document.addEventListener('click', (event) => {
        if (!dropdownContainer.contains(event.target)) {
            monsterList.style.display = 'none';
        }
    });

    // Append elements to the card
    dropdownContainer.appendChild(nameInput);
    dropdownContainer.appendChild(monsterList);
    card.appendChild(dropdownContainer);

    // Append the card to the container
    const tracker = document.getElementById('monster-cards-container');
    if (tracker) {
        tracker.appendChild(card);
        console.log('Card appended to tracker:', card);
    } else {
        console.error('Initiative tracker container not found.');
    }
}





function updateMonsterCard(card, monster) {
    // Clear previous content
    card.innerHTML = '';

    // Create and add monster details
    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');

    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = monster.initiative || 0; // Default initiative value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards(); // Reorder cards when initiative is changed
    });

    initDiv.appendChild(initInput);

    const monsterInfo = document.createElement('div');
    monsterInfo.classList.add('monster-info');

    const monsterName = document.createElement('div');
    monsterName.classList.add('monster-name');
    
    // Add unique identifier to the monster name
    const existingNames = Array.from(document.getElementsByClassName('monster-name'))
                               .map(nameElem => nameElem.textContent.replace(/\s\([A-Z]\)$/, ''));
    const count = existingNames.filter(name => name === monster.name).length;
    monsterName.textContent = `${monster.name} (${String.fromCharCode(65 + count)})`;

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${monster.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${monster.hp.current}"> / ${monster.hp.max}</span>
    `;

    monsterInfo.appendChild(monsterName);
    monsterInfo.appendChild(statsDiv);

    card.appendChild(initDiv);
    card.appendChild(monsterInfo);

    // Re-append the dropdown container to the card
    const dropdownContainer = card.querySelector('.dropdown-container');
    if (dropdownContainer) {
        card.appendChild(dropdownContainer);
    }
}


// Function to populate the monster card with selected monster data
function populateMonsterCard(card, monster) {
    // Clear the existing monster info
    const monsterInfo = card.querySelector('.monster-info');
    monsterInfo.innerHTML = '';

    // Set the monster's initiative to the default or current value
    const initInput = card.querySelector('.init-input');
    initInput.value = monster.initiative || 0;

    // Set up monster information
    const monsterName = document.createElement('div');
    monsterName.classList.add('monster-name');
    monsterName.textContent = monster.name;

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${monster.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${monster.hp.current}"> / ${monster.hp.max}</span>
    `;

    // Append the monster details to the card
    monsterInfo.appendChild(monsterName);
    monsterInfo.appendChild(statsDiv);

    reorderCards(); // Reorder cards after adding the new monster
}










































// Function to create a character card (styled like monster cards)
function createCharacterCard(client) {
    const card = document.createElement('div');
    card.classList.add('monster-card'); // Reuse monster-card class for styling
    card.setAttribute('data-client-id', client.id);

    const initDiv = document.createElement('div');
    initDiv.classList.add('monster-init');

    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = client.player.initiative || 0; // Default initiative value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards();
    });

    initDiv.appendChild(initInput);

    const characterInfo = document.createElement('div');
    characterInfo.classList.add('monster-info'); // Reuse monster-info class

    const characterName = document.createElement('div');
    characterName.classList.add('monster-name'); // Reuse monster-name class
    characterName.innerText = client.player.name;

    const statsDiv = document.createElement('div');
    statsDiv.classList.add('monster-stats');
    statsDiv.innerHTML = `
        <span>AC ${client.player.ac}</span>
        <span>HP <input type="number" class="hp-input" value="${client.player.hp.current}"> / ${client.player.hp.max}</span>
    `;

    characterInfo.appendChild(characterName);
    characterInfo.appendChild(statsDiv);

    // Append the info
    card.appendChild(initDiv);
    card.appendChild(characterInfo);

    document.getElementById("initiative-tracker").appendChild(card);

    reorderCards(); // Ensure correct order on card creation
}

function reorderCards() {
    const tracker = document.getElementById("initiative-tracker");
    
    // Ensure tracker exists
    if (!tracker) {
        console.error("Initiative tracker element not found.");
        return;
    }
    
    // Retrieve all cards
    const cards = Array.from(tracker.getElementsByClassName("monster-card"));
    
    // Debugging: Log the number of cards found
    console.log(`Number of cards found: ${cards.length}`);
    
    // Check if cards array is empty
    if (cards.length === 0) {
        console.warn("No monster cards to reorder.");
        return;
    }
    
    // Debugging: Log the initiative values before sorting
    console.log('Before sorting:', cards.map(card => ({
        name: card.querySelector('.monster-name') ? card.querySelector('.monster-name').innerText : 'No name',
        initiative: card.querySelector('.init-input') ? card.querySelector('.init-input').value : 'No initiative'
    })));
    
    // Sort the cards based on initiative
    cards.sort((a, b) => {
        const aInit = parseInt(a.querySelector(".init-input").value, 10) || 0;
        const bInit = parseInt(b.querySelector(".init-input").value, 10) || 0;
        return bInit - aInit; // Higher initiative first
    });
    
    // Debugging: Log the sorted initiative values
    console.log('After sorting:', cards.map(card => ({
        name: card.querySelector('.monster-name') ? card.querySelector('.monster-name').innerText : 'No name',
        initiative: card.querySelector('.init-input') ? card.querySelector('.init-input').value : 'No initiative'
    })));
    
    // Remove existing cards and append them back in the correct order
    cards.forEach(card => {
        tracker.appendChild(card);
    });
}


