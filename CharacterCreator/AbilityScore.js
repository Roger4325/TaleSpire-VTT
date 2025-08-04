// Ability Score Generation System
function displayAbilityScores() {
    const abilityContainer = document.getElementById('abilities');
    if (!abilityContainer) return;

    // Clear existing content and add header
    abilityContainer.innerHTML = '<h3>Set Ability Scores</h3>';
    
    // Create the ability score interface based on the selected method
    updateAbilityScoreInterface();
}

//Standard array values for ability scores & Point buy costs for ability scores
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const POINT_BUY_COSTS = {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

//Updates the ability score interface based on the selected generation method
function updateAbilityScoreInterface() {
    console.log('=== UPDATING ABILITY SCORE INTERFACE ===');
    console.log('Current method:', currentCharacter.abilityScoreMethod);
    
    const abilityContainer = document.getElementById('abilities');
    if (!abilityContainer) {
        console.error('Ability scores container not found!');
        return;
    }

    // Clear existing content except the header
    const header = abilityContainer.querySelector('h3');
    if (!header) {
        // If no header exists, create one
        const newHeader = document.createElement('h3');
        newHeader.textContent = 'Set Ability Scores';
        abilityContainer.appendChild(newHeader);
    }
    
    // Clear all content except the header
    const headerToKeep = abilityContainer.querySelector('h3');
    abilityContainer.innerHTML = '';
    if (headerToKeep) abilityContainer.appendChild(headerToKeep);

    // Add method-specific interface
    switch (currentCharacter.abilityScoreMethod) {
        case 'manual':
            console.log('Rendering manual interface');
            renderManualAbilityInterface(abilityContainer);
            break;
        case 'standard-array':
            console.log('Rendering standard array interface');
            renderStandardArrayInterface(abilityContainer);
            break;
        case 'point-buy':
            console.log('Rendering point buy interface');
            renderPointBuyInterface(abilityContainer);
            break;
        default:
            console.log('Rendering default manual interface');
            renderManualAbilityInterface(abilityContainer);
    }
}

//Renders the manual/rolled ability score interface
function renderManualAbilityInterface(container) {
    console.log('=== RENDERING MANUAL INTERFACE ===');
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    // Add roll button
    const rollButton = document.createElement('button');
    rollButton.textContent = 'Roll 4d6 (Drop Lowest)';
    rollButton.className = 'btn btn-primary';
    rollButton.style.marginBottom = '20px';
    rollButton.onclick = rollAbilityScores;
    container.appendChild(rollButton);
    console.log('Roll button created and added to container');
    
    // Add rolled scores display
    const rolledScoresDiv = document.createElement('div');
    rolledScoresDiv.id = 'rolledScoresDisplay';
    rolledScoresDiv.className = 'rolled-scores-display';
    container.appendChild(rolledScoresDiv);
    
    // Create ability score inputs in 2x3 grid layout
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'abilities-grid';
    
    abilities.forEach(ability => {
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-score-card';
        
        const label = document.createElement('div');
        label.className = 'ability-label';
        label.textContent = ability.charAt(0).toUpperCase() + ability.slice(1);
        abilityDiv.appendChild(label);

        // Total score (base + bonuses) - move above input
        const totalSpan = document.createElement('div');
        totalSpan.id = `${ability}Total`;
        totalSpan.className = 'ability-total-score';
        totalSpan.textContent = "Total: " + getTotalAbilityScore(ability);
        abilityDiv.appendChild(totalSpan);
        
        const scoreInput = document.createElement('input');
        scoreInput.type = 'number';
        scoreInput.id = ability;
        scoreInput.className = 'ability-score-input';
        scoreInput.min = '3';
        scoreInput.max = '20';
        // Initialize at 8 for manual method (same as point buy baseline)
        if (!currentCharacter.abilities[ability]) {
            currentCharacter.abilities[ability] = 8;
        }
        scoreInput.value = currentCharacter.abilities[ability];
        abilityDiv.appendChild(scoreInput);
        
        const modifierSpan = document.createElement('div');
        modifierSpan.id = `${ability}Modifier`;
        modifierSpan.className = 'ability-modifier';
        modifierSpan.textContent = formatModifier(getModifier(currentCharacter.abilities[ability]));
        abilityDiv.appendChild(modifierSpan);
        
        // Add change listener
        scoreInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            const racialBonus = currentCharacter.abilityBonuses?.[ability] || 0;
            const potentialTotal = value + racialBonus;
            
            if (value >= 3 && potentialTotal <= 20) {
                currentCharacter.abilities[ability] = value;
                updateAbilityTotalsUI();
                updateAbilityModifiers();
                
                // Refresh ASI dropdowns to reflect updated totals
                if (typeof refreshAllASIDropdowns === 'function') {
                    refreshAllASIDropdowns();
                }
            } else {
                // Reset the input to the last valid value
                e.target.value = currentCharacter.abilities[ability];
                // Optional: Show feedback to the user about why the change was rejected
                const totalSpan = document.getElementById(`${ability}Total`);
                if (totalSpan) {
                    totalSpan.style.color = 'red';
                    setTimeout(() => {
                        totalSpan.style.color = ''; // Reset to default color
                    }, 1000);
                }
            }
        });
        
        
        
        // Bonus display
        const bonusSpan = document.createElement('div');
        bonusSpan.id = `${ability}Bonus`;
        bonusSpan.className = 'ability-bonus-display';
        abilityDiv.appendChild(bonusSpan);
        
        abilitiesGrid.appendChild(abilityDiv);
    });
    
    container.appendChild(abilitiesGrid);
    
    updateAbilityModifiers();
}

//Renders the standard array interface
function renderStandardArrayInterface(container) {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const standardArrayScores = [15, 14, 13, 12, 10, 8];
    const availableScores = [...standardArrayScores];
    
    // Create ability score grid
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'abilities-grid';
    
    abilities.forEach(ability => {
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-score-card';
        
        const label = document.createElement('div');
        label.className = 'ability-label';
        label.textContent = ability.charAt(0).toUpperCase() + ability.slice(1);
        abilityDiv.appendChild(label);

        // Add total score display
        const totalDiv = document.createElement('div');
        totalDiv.className = 'ability-total-score';
        totalDiv.id = `${ability}TotalScore`;
        totalDiv.textContent = 'Total: 8';  // Initialize to base score
        abilityDiv.appendChild(totalDiv);
        
        const select = document.createElement('select');
        select.id = `${ability}Select`;
        select.className = 'ability-score-select';
        
        // Add placeholder option
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = '-- Select Score --';
        placeholder.disabled = true;
        placeholder.selected = true;
        select.appendChild(placeholder);
        
        // Add available scores
        availableScores.forEach(score => {
            const option = document.createElement('option');
            option.value = score;
            option.textContent = score;
            select.appendChild(option);
        });
        
        // In renderStandardArrayInterface, update the select change handler
        select.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            const racialBonus = currentCharacter.abilityBonuses?.[ability] || 0;
            const potentialTotal = value + racialBonus;
            
            if (value) {
                // Check if this score is already used by another ability
                const conflictingAbility = abilities.find(otherAbility => 
                    otherAbility !== ability && currentCharacter.abilities[otherAbility] === value
                );
                
                if (conflictingAbility) {
                    // Reset the conflicting ability's score and dropdown
                    currentCharacter.abilities[conflictingAbility] = 0;
                    const conflictingSelect = document.getElementById(`${conflictingAbility}Select`);
                    if (conflictingSelect) {
                        conflictingSelect.value = '';
                    }
                }
                
                // Check if the total would exceed 20
                if (potentialTotal <= 20) {
                    currentCharacter.abilities[ability] = value;
                    updateAbilityTotalsUI();
                    updateAbilityModifiers();
                    updateStandardArrayAvailability();
                    
                    // Refresh ASI dropdowns to reflect updated totals
                    if (typeof refreshAllASIDropdowns === 'function') {
                        refreshAllASIDropdowns();
                    }
                } else {
                    // Reset to previous value if would exceed 20
                    e.target.value = '';
                    const totalSpan = document.getElementById(`${ability}Total`);
                    if (totalSpan) {
                        totalSpan.style.color = 'red';
                        setTimeout(() => {
                            totalSpan.style.color = '';
                        }, 1000);
                    }
                }
            } else {
                // Clear the ability score
                currentCharacter.abilities[ability] = 0;
                updateAbilityTotalsUI();
                updateAbilityModifiers();
                updateStandardArrayAvailability();
                
                // Refresh ASI dropdowns to reflect updated totals
                if (typeof refreshAllASIDropdowns === 'function') {
                    refreshAllASIDropdowns();
                }
            }
        });
        
        abilityDiv.appendChild(select);
        
        const modifierSpan = document.createElement('div');
        modifierSpan.id = `${ability}Modifier`;
        modifierSpan.className = 'ability-modifier';
        modifierSpan.textContent = formatModifier(getModifier(currentCharacter.abilities[ability]));
        abilityDiv.appendChild(modifierSpan);
        
        // Bonus display
        const bonusSpan = document.createElement('div');
        bonusSpan.id = `${ability}Bonus`;
        bonusSpan.className = 'ability-bonus-display';
        abilityDiv.appendChild(bonusSpan);
        
        abilitiesGrid.appendChild(abilityDiv);
    });
    
    container.appendChild(abilitiesGrid);
    
    updateAbilityModifiers();
    updateStandardArrayAvailability();
}

//Renders the point buy interface
function renderPointBuyInterface(container) {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    // Add points display
    const pointsDisplay = document.createElement('div');
    pointsDisplay.className = 'points-display';
    pointsDisplay.innerHTML = `
        <h4>Point Buy System</h4>
        <p>Available Points: <span id="availablePoints">${currentCharacter.pointBuyPoints}</span></p>
        <p>Costs: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9</p>
    `;
    container.appendChild(pointsDisplay);
    
    // Create ability score controls in 2x3 grid layout
    const abilitiesGrid = document.createElement('div');
    abilitiesGrid.className = 'abilities-grid';
    
    abilities.forEach(ability => {
        const abilityDiv = document.createElement('div');
        abilityDiv.className = 'ability-score-card point-buy-card';
        
        const label = document.createElement('div');
        label.className = 'ability-label';
        label.textContent = ability.charAt(0).toUpperCase() + ability.slice(1);
        abilityDiv.appendChild(label);
        
        // Add total score display
        const totalDiv = document.createElement('div');
        totalDiv.className = 'ability-total-score';
        totalDiv.id = `${ability}TotalScore`;
        totalDiv.textContent = 'Total: 8';  // Initialize to base score
        abilityDiv.appendChild(totalDiv);
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'point-buy-controls';
        
        const decreaseBtn = document.createElement('button');
        decreaseBtn.textContent = '-';
        decreaseBtn.className = 'point-buy-btn';
        decreaseBtn.onclick = () => adjustPointBuyScore(ability, -1);
        controlsDiv.appendChild(decreaseBtn);
        
        const scoreSpan = document.createElement('div');
        scoreSpan.id = `${ability}Score`;
        scoreSpan.className = 'point-buy-score-value';
        // Initialize at 8 if not set (costs 0 points)
        if (!currentCharacter.abilities[ability]) {
            currentCharacter.abilities[ability] = 8;
        }
        scoreSpan.textContent = currentCharacter.abilities[ability];
        controlsDiv.appendChild(scoreSpan);
        
        const increaseBtn = document.createElement('button');
        increaseBtn.textContent = '+';
        increaseBtn.className = 'point-buy-btn';
        increaseBtn.onclick = () => adjustPointBuyScore(ability, 1);
        controlsDiv.appendChild(increaseBtn);
        
        abilityDiv.appendChild(controlsDiv);
        
        const costSpan = document.createElement('div');
        costSpan.id = `${ability}Cost`;
        costSpan.className = 'point-buy-cost';
        costSpan.textContent = `(${getPointBuyCost(currentCharacter.abilities[ability])} pts)`;
        abilityDiv.appendChild(costSpan);
        
        const modifierSpan = document.createElement('div');
        modifierSpan.id = `${ability}Modifier`;
        modifierSpan.className = 'ability-modifier';
        modifierSpan.textContent = formatModifier(getModifier(currentCharacter.abilities[ability]));
        abilityDiv.appendChild(modifierSpan);
        
        // Bonus display
        const bonusSpan = document.createElement('div');
        bonusSpan.id = `${ability}Bonus`;
        bonusSpan.className = 'ability-bonus-display';
        abilityDiv.appendChild(bonusSpan);
        
        abilitiesGrid.appendChild(abilityDiv);
    });
    
    container.appendChild(abilitiesGrid);
    
    updateAbilityTotalsUI();
    updatePointBuyDisplay();
    
}

//Plays a realistic dice rolling sound effect
function playDiceRollSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const startTime = audioContext.currentTime;
        let lastStopTime = startTime;
        
        // Create multiple "clicks" for dice hitting each other
        for (let i = 0; i < 8; i++) {
            const clickTime = startTime + (i * 0.05) + (Math.random() * 0.03);
            
            // Create click oscillator
            const clickOsc = audioContext.createOscillator();
            const clickGain = audioContext.createGain();
            
            clickOsc.connect(clickGain);
            clickGain.connect(audioContext.destination);
            
            // Random click frequency (higher frequencies for sharper clicks)
            const clickFreq = 800 + (Math.random() * 400);
            clickOsc.frequency.setValueAtTime(clickFreq, clickTime);
            clickOsc.frequency.exponentialRampToValueAtTime(clickFreq * 0.3, clickTime + 0.02);
            
            // Click envelope
            clickGain.gain.setValueAtTime(0, clickTime);
            clickGain.gain.linearRampToValueAtTime(0.08, clickTime + 0.001);
            clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.02);
            
            clickOsc.start(clickTime);
            const stopTime = clickTime + 0.02;
            clickOsc.stop(stopTime);
            lastStopTime = Math.max(lastStopTime, stopTime);
        }
        
        // Add some lower frequency "clacks" for dice hitting the surface
        for (let i = 0; i < 4; i++) {
            const clackTime = startTime + 0.2 + (i * 0.08) + (Math.random() * 0.05);
            
            const clackOsc = audioContext.createOscillator();
            const clackGain = audioContext.createGain();
            
            clackOsc.connect(clackGain);
            clackGain.connect(audioContext.destination);
            
            // Lower frequency for surface impact
            const clackFreq = 150 + (Math.random() * 100);
            clackOsc.frequency.setValueAtTime(clackFreq, clackTime);
            clackOsc.frequency.exponentialRampToValueAtTime(clackFreq * 0.2, clackTime + 0.05);
            
            // Clack envelope
            clackGain.gain.setValueAtTime(0, clackTime);
            clackGain.gain.linearRampToValueAtTime(0.06, clackTime + 0.002);
            clackGain.gain.exponentialRampToValueAtTime(0.001, clackTime + 0.05);
            
            clackOsc.start(clackTime);
            const stopTime = clackTime + 0.05;
            clackOsc.stop(stopTime);
            lastStopTime = Math.max(lastStopTime, stopTime);
        }
        
        // Close the audio context after all sounds have finished
        setTimeout(() => {
            audioContext.close();
        }, (lastStopTime - startTime) * 1000 + 100); // Add 100ms buffer
        
    } catch (error) {
        console.log('Audio not supported or blocked by browser');
    }
}

//Rolls 4d6 and drops the lowest die
function rollAbilityScores() {
    // Play dice rolling sound
    playDiceRollSound();
    
    const scores = [];
    const allRolls = [];
    let rollCount = 0;
    
    for (let i = 0; i < 6; i++) {
        const rolls = [];
        for (let j = 0; j < 4; j++) {
            rolls.push(Math.floor(Math.random() * 6) + 1);
        }
        
        // Sort and drop lowest
        rolls.sort((a, b) => b - a);
        const finalScore = rolls[0] + rolls[1] + rolls[2];
        scores.push(finalScore);
        allRolls.push({
            rolls: rolls,
            dropped: rolls[3],
            final: finalScore
        });
    }
    rollCount++;
    
    // Store rolled scores and individual rolls in roll order (not sorted)
    currentCharacter.rolledAbilityScores = [...scores];
    currentCharacter.individualRolls = rollCount;
    
    // Display rolled scores with animation
    displayRolledScores(scores, allRolls);
}

//Displays rolled scores with individual dice animation
function displayRolledScores(scores, allRolls) {
    const display = document.getElementById('rolledScoresDisplay');
    if (!display) return;
    
    display.innerHTML = '<h4>Rolled Scores:</h4>';
    
    const scoresContainer = document.createElement('div');
    scoresContainer.className = 'rolled-scores-container';
    
    // Display scores in roll order (not sorted)
    scores.forEach((score, index) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'rolled-score-item';
        
        // Get the individual rolls for this score (in roll order)
        const rollData = allRolls[index];
        
        // Create dice display
        const diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        
        if (rollData) {
            rollData.rolls.forEach((die, dieIndex) => {
                const dieElement = document.createElement('div');
                dieElement.className = `die ${dieIndex === 3 ? 'dropped' : ''}`;
                dieElement.textContent = die;
                dieElement.style.animationDelay = `${dieIndex * 0.1}s`;
                diceContainer.appendChild(dieElement);
            });
        }
        
        // Create total score display
        const totalDiv = document.createElement('div');
        totalDiv.className = 'score-total';
        totalDiv.textContent = score;
        
        scoreDiv.appendChild(diceContainer);
        scoreDiv.appendChild(totalDiv);
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'score-label';
        labelDiv.textContent = `Roll ${index + 1}`;
        scoreDiv.appendChild(labelDiv);
        
        scoresContainer.appendChild(scoreDiv);
    });
    
    display.appendChild(scoresContainer);
    
    // Add instructions
    const instructions = document.createElement('p');
    instructions.textContent = 'Assign these scores to your abilities.';
    instructions.className = 'rolled-scores-instructions';
    display.appendChild(instructions);
}

//Updates standard array availability (disables used scores)
function updateStandardArrayAvailability() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const usedScores = abilities.map(ability => currentCharacter.abilities[ability]).filter(score => score > 0);
    
    abilities.forEach(ability => {
        const select = document.getElementById(`${ability}Select`);
        if (!select) return;
        
        Array.from(select.options).forEach(option => {
            if (option.value && option.value !== '') {
                const score = parseInt(option.value);
                const isUsed = usedScores.includes(score);
                const isCurrent = currentCharacter.abilities[ability] === score;
                
                // Disable if used by another ability, but not if it's the current selection
                option.disabled = isUsed && !isCurrent;
                option.textContent = isUsed && !isCurrent ? `${score} (Used)` : score;
            }
        });
    });
    
    // Update status indicators
    updateStandardArrayStatus();
}

//Updates the status display for standard array
function updateStandardArrayStatus() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    // Get all current ability scores and filter out unassigned ones (0 or undefined)
    const selectedScores = abilities.map(ability => currentCharacter.abilities[ability]).filter(score => score && score > 0);
    const totalSelected = selectedScores.length;
    const totalAvailable = STANDARD_ARRAY.length;
    
    // Check if all scores are unique (only if we have scores to check)
    let hasDuplicates = false;
    if (selectedScores.length > 0) {
        const uniqueScores = [...new Set(selectedScores)];
        hasDuplicates = selectedScores.length !== uniqueScores.length;
    }
    
    // Update status display
    const statusDisplay = document.getElementById('standardArrayStatus');
    if (statusDisplay) {
        if (hasDuplicates) {
            statusDisplay.textContent = '❌ Duplicate scores detected!';
            statusDisplay.className = 'standard-array-status error';
        } else if (totalSelected === totalAvailable) {
            statusDisplay.textContent = '✅ All scores assigned!';
            statusDisplay.className = 'standard-array-status complete';
        } else {
            statusDisplay.textContent = `❗ ${totalSelected}/${totalAvailable} scores assigned`;
            statusDisplay.className = 'standard-array-status incomplete';
        }
    }
}

//Gets the point buy cost for a given score
function getPointBuyCost(score) {
    return POINT_BUY_COSTS[score] || 0;
}

//Updates the point buy display
function updatePointBuyDisplay() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    // Update available points
    const availablePointsSpan = document.getElementById('availablePoints');
    if (availablePointsSpan) {
        availablePointsSpan.textContent = currentCharacter.pointBuyPoints;
    }
    
    // Update individual scores and costs
    abilities.forEach(ability => {
        const scoreSpan = document.getElementById(`${ability}Score`);
        const costSpan = document.getElementById(`${ability}Cost`);
        
        if (scoreSpan) {
            scoreSpan.textContent = currentCharacter.abilities[ability];
        }
        
        if (costSpan) {
            const cost = getPointBuyCost(currentCharacter.abilities[ability]);
            costSpan.textContent = `(${cost} pts)`;
        }
    });
}

//Updates ability modifiers based on current scores
function updateAbilityModifiers() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilities.forEach(ability => {
        const modifierSpan = document.getElementById(`${ability}Modifier`);
        if (modifierSpan) {
            modifierSpan.textContent = formatModifier(getModifier(getTotalAbilityScore(ability)));
        }
    });
    updateDerivedStats();
}

// Get total ability score including bonuses
function getTotalAbilityScore(ability) {
    return (currentCharacter.abilities[ability] || 0) + (currentCharacter.abilityBonuses?.[ability] || 0);
}

//Adjusts a point buy score up or down
function adjustPointBuyScore(ability, delta) {
    const currentScore = currentCharacter.abilities[ability];
    const newScore = currentScore + delta;
    const racialBonus = currentCharacter.abilityBonuses?.[ability] || 0;
    const potentialTotal = newScore + racialBonus;
    
    // Check if the new score is within valid range (8-15) and total won't exceed 20
    if (newScore < 8 || newScore > 15 || potentialTotal > 20) return;
    
    // Calculate point cost difference
    const currentCost = getPointBuyCost(currentScore);
    const newCost = getPointBuyCost(newScore);
    const costDiff = newCost - currentCost;
    
    // Check if we have enough points
    if (currentCharacter.pointBuyPoints - costDiff < 0) return;
    
    // Update score and points
    currentCharacter.abilities[ability] = newScore;
    currentCharacter.pointBuyPoints -= costDiff;
    
    // Update displays
    const scoreSpan = document.getElementById(`${ability}Score`);
    if (scoreSpan) scoreSpan.textContent = newScore;
    
    const costSpan = document.getElementById(`${ability}Cost`);
    if (costSpan) costSpan.textContent = `(${newCost} pts)`;
    
    const modifierSpan = document.getElementById(`${ability}Modifier`);
    updatePointBuyDisplay();
    updateAbilityTotalsUI();
    updateAbilityModifiers();
    
    // Refresh ASI dropdowns to reflect updated totals
    if (typeof refreshAllASIDropdowns === 'function') {
        refreshAllASIDropdowns();
    }
}

//Gets the point cost for a score in point buy
function getPointBuyCost(score) {
    const costs = {
        8: 0,
        9: 1,
        10: 2,
        11: 3,
        12: 4,
        13: 5,
        14: 7,
        15: 9
    };
    return costs[score] || 0;
}

//Updates the point buy points display
function updatePointBuyDisplay() {
    const pointsSpan = document.getElementById('availablePoints');
    if (pointsSpan) pointsSpan.textContent = currentCharacter.pointBuyPoints;
}


/********************* Ability helpers *************************/

function getTotalAbilityScore(ability) {
    return (currentCharacter.abilities[ability] || 0) + (currentCharacter.abilityBonuses?.[ability] || 0);
}

// Update ability score totals in the UI
function updateAbilityTotalsUI() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    abilities.forEach(ability => {
        const totalEl = document.getElementById(`${ability}Total`);
        const totalScoreEl = document.getElementById(`${ability}TotalScore`);
        const bonusEl = document.getElementById(`${ability}Bonus`);
        const baseScore = currentCharacter.abilities[ability] || 0;
        const bonusVal = currentCharacter.abilityBonuses?.[ability] || 0;
        const totalScore = baseScore + bonusVal;
        
        // Update total display
        if (totalEl) totalEl.textContent = `Total: ${totalScore}`;
        if (totalScoreEl) totalScoreEl.textContent = `Total: ${totalScore}`;
        
        // Update bonus display
        if (bonusEl) {
            if (bonusVal !== 0) {
                const sources = currentCharacter.abilityBonusSources?.[ability] || [];
                const srcText = sources.map(s => `${s.value > 0 ? '+' : ''}${s.value} (${s.source})`).join(', ');
                bonusEl.textContent = `${bonusVal > 0 ? '+' : ''}${bonusVal}: ${srcText}`;
            } else {
                bonusEl.textContent = '';
            }
        }
        
        // Visual feedback if total exceeds 20
        if (totalScore > 20) {
            if (totalEl) totalEl.style.color = 'red';
            if (totalScoreEl) totalScoreEl.style.color = 'red';
        } else {
            if (totalEl) totalEl.style.color = '';
            if (totalScoreEl) totalScoreEl.style.color = '';
        }
    });
    
    // Refresh ASI dropdowns to reflect updated totals
    if (typeof refreshAllASIDropdowns === 'function') {
        refreshAllASIDropdowns();
    }
}

// Get ability modifier
function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Format modifier with + or - sign
function formatModifier(modifier) {
    if (modifier >= 0) {
        return `+${modifier}`;
    } else {
        return `${modifier}`;
    }
}
