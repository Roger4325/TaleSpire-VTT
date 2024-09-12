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


let monsters = [
    { id: 1, name: 'Aarakocra', ac: 12, hp: { current: 13, max: 13 }, initiative: 20 },
    { id: 2, name: 'Goblin', ac: 15, hp: { current: 7, max: 7 }, initiative: 15 },
    // More monsters can be added here
];



function renderMonsterCards() {
    const container = document.getElementById('monster-cards-container');
    container.innerHTML = ''; // Clear the current cards

    // Sort monsters by initiative in descending order
    const sortedMonsters = monsters.sort((a, b) => b.initiative - a.initiative);

    sortedMonsters.forEach(monster => {
        const card = document.createElement('div');
        card.classList.add('monster-card');

        // Initiative display with editable input
        const initDiv = document.createElement('div');
        initDiv.classList.add('monster-init');

        const initInput = document.createElement('input');
        initInput.type = 'number';
        initInput.value = monster.initiative;
        initInput.addEventListener('change', (e) => {
            monster.initiative = parseInt(e.target.value, 10);
            renderMonsterCards(); // Reorder the cards based on new initiative
        });

        initDiv.appendChild(initInput);

        // Monster image placeholder
        const img = document.createElement('img');
        img.src = ''; // Placeholder for monster image

        // Monster info section (Name, CR, AC, HP, Init Bonus)
        const monsterInfo = document.createElement('div');
        monsterInfo.classList.add('monster-info');

        const monsterName = document.createElement('div');
        monsterName.classList.add('monster-name');
        monsterName.textContent = `${monster.name} (D)`; // Add "(D)" for DM-controlled

        const statsDiv = document.createElement('div');
        statsDiv.classList.add('monster-stats');
        statsDiv.innerHTML = `
            <span>AC ${monster.ac}</span>
            <span>HP ${monster.hp.max} </span>
        `;

        // HP section with editable current HP input
        const hpDiv = document.createElement('div');
        hpDiv.classList.add('monster-hp');

        const hpCurrentInput = document.createElement('input');
        hpCurrentInput.type = 'number';
        hpCurrentInput.value = monster.hp.current;
        hpCurrentInput.addEventListener('change', (e) => {
            monster.hp.current = parseInt(e.target.value, 10);
            renderMonsterCards(); // Optionally re-render to update HP display
        });

        const hpMax = document.createElement('span');
        hpMax.textContent = ` / ${monster.hp.max}`;

        hpDiv.appendChild(hpCurrentInput);
        hpDiv.appendChild(hpMax);

        // Append the info
        monsterInfo.appendChild(monsterName);
        monsterInfo.appendChild(statsDiv);

        // Append everything together
        card.appendChild(initDiv);
        card.appendChild(img);
        card.appendChild(monsterInfo);
        card.appendChild(hpDiv);

        container.appendChild(card);
    });
}

// Initialize the tracker
renderMonsterCards();


function createCharacterCard(client) {
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.setAttribute('data-client-id', client.id);

    const playerName = document.createElement('div');
    playerName.classList.add('character-name');
    playerName.innerText = client.player.name;

    const acDiv = document.createElement('div');
    acDiv.classList.add('character-ac');
    acDiv.innerHTML = `AC: <input type="number" class="ac-input" value="10">`;

    const hpDiv = document.createElement('div');
    hpDiv.classList.add('character-hp');
    hpDiv.innerHTML = `HP: <input type="number" class="hp-input" value="10"> / 10`;

    const initDiv = document.createElement('div');
    initDiv.classList.add('character-initiative');
    const initInput = document.createElement('input');
    initInput.type = 'number';
    initInput.value = '10'; // Default initiative value
    initInput.classList.add('init-input');

    // Event listener for initiative changes
    initInput.addEventListener('change', () => {
        reorderCards();
    });

    initDiv.innerHTML = `Initiative: `;
    initDiv.appendChild(initInput);

    card.appendChild(playerName);
    card.appendChild(acDiv);
    card.appendChild(hpDiv);
    card.appendChild(initDiv);

    document.getElementById("initiative-tracker").appendChild(card);

    reorderCards(); // Ensure correct order on card creation
}

function reorderCards() {
    const tracker = document.getElementById("initiative-tracker");
    const cards = Array.from(tracker.getElementsByClassName("character-card"));

    // Sort the cards based on initiative
    cards.sort((a, b) => {
        const aInit = parseInt(a.querySelector(".init-input").value, 10);
        const bInit = parseInt(b.querySelector(".init-input").value, 10);
        return bInit - aInit; // Higher initiative first
    });

    // Remove existing cards and append them back in the correct order
    cards.forEach(card => {
        tracker.appendChild(card);
    });
}

