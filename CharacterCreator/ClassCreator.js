// ========== MULTICLASSING SYSTEM ==========

/**
 * Adds a new class to the character
 * @param {string} className - The class to add
 */
function addNewClass(className) {
    if (!className) return;
    
    // Check if class already exists
    if (currentCharacter.classes.some(cls => cls.className === className)) {
        alert(`You already have the ${className} class!`);
        return;
    }
    
    // Check total level limit
    if (currentCharacter.totalLevel >= 20) {
        alert("Cannot add class - total level would exceed 20!");
        return;
    }
    
    const classInfo = getClassInfo(className);
    if (!classInfo) return;
    
    // Create new class entry
    const newClass = {
        className: className,
        subclass: "",
        level: 1,
        features: [],
        choices: {},
        hitPoints: {},
        collapsed: false
    };
    
    // Add to character
    currentCharacter.classes.push(newClass);
    currentCharacter.totalLevel += 1;
    currentCharacter.isMulticlassing = currentCharacter.classes.length > 1;
    
    // If this is the first class, set as primary
    if (currentCharacter.classes.length === 1) {
        currentCharacter.class = className;
        currentCharacter.level = 1;
    }
    
    // Update display
    displayAllClasses();
    updateAllClassLevelDropdowns();
    updateMulticlassHitPoints();
    
    // Update rolled hit points interface if using rolled method
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderMulticlassRolledHitPointsInterface();
    }
}

/**
 * Removes a class from the character
 * @param {number} classIndex - Index of the class to remove
 */
async function removeClass(classIndex) {
    if (classIndex < 0 || classIndex >= currentCharacter.classes.length) return;
    
    const classToRemove = currentCharacter.classes[classIndex];
    const className = classToRemove.className;
    
    // Confirm removal
    const confirmed = await showConfirm(`Remove ${className} class? This will delete all progress for this class.`);
    if (!confirmed) return;
    
    // Subtract levels from total
    currentCharacter.totalLevel -= classToRemove.level;
    
    // Remove from array
    currentCharacter.classes.splice(classIndex, 1);
    
    // Update multiclassing status
    currentCharacter.isMulticlassing = currentCharacter.classes.length > 1;
    
    // If no classes left, reset to single class mode
    if (currentCharacter.classes.length === 0) {
        currentCharacter.class = "";
        currentCharacter.subclass = "";
        currentCharacter.level = 1;
        currentCharacter.totalLevel = 1;
        displayClassSelection();
        return;
    }
    
    // Update primary class if needed
    if (currentCharacter.class === className) {
        currentCharacter.class = currentCharacter.classes[0].className;
        currentCharacter.subclass = currentCharacter.classes[0].subclass;
        currentCharacter.level = currentCharacter.classes[0].level;
    }
    
    // Update display
    displayAllClasses();
    updateAllClassLevelDropdowns();
    updateMulticlassHitPoints();
    
    // Update rolled hit points interface if using rolled method
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderMulticlassRolledHitPointsInterface();
    }
}

/**
 * Updates the level of a specific class
 * @param {number} classIndex - Index of the class
 * @param {number} newLevel - New level for the class
 */
async function updateClassLevel(classIndex, newLevel) {
    if (classIndex < 0 || classIndex >= currentCharacter.classes.length) return false;
    
    const classData = currentCharacter.classes[classIndex];
    const oldLevel = classData.level;
    const levelDifference = newLevel - oldLevel;
    
    // Check total level limit
    if (currentCharacter.totalLevel + levelDifference > 20) {
        alert("Cannot increase level - total would exceed 20!");
        return false;
    }
    
    if (newLevel < oldLevel) {
        const confirmed = await showConfirm(
            `Reduce ${classData.className} from level ${oldLevel} to ${newLevel}? This will remove choices above level ${newLevel}.`
        );
        if (!confirmed) return false;
    }
    
    // Update levels
    classData.level = newLevel;
    currentCharacter.totalLevel += levelDifference;
    
    // Update primary class level if this is the primary class
    if (currentCharacter.class === classData.className) {
        currentCharacter.level = newLevel;
    }
    
    // Remove choices for levels above new level
    if (newLevel < oldLevel) {
        Object.keys(classData.choices).forEach(level => {
            if (parseInt(level) > newLevel) {
                delete classData.choices[level];
            }
        });
        
        // Clear subclass if going below level 3
        if (newLevel < 3) {
            classData.subclass = "";
        }
    }
    
    // Update display for this class
    displaySingleClass(classIndex);
    
    // Update level dropdowns for all other classes since their max levels may have changed
    updateAllClassLevelDropdowns();
    
    updateMulticlassHitPoints();
    
    // Update rolled hit points interface if using rolled method
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderMulticlassRolledHitPointsInterface();
    }
    
    return true;
}

/**
 * Toggles the collapsed state of a class
 * @param {number} classIndex - Index of the class to toggle
 */
function toggleClassCollapsed(classIndex) {
    if (classIndex < 0 || classIndex >= currentCharacter.classes.length) return;
    
    currentCharacter.classes[classIndex].collapsed = !currentCharacter.classes[classIndex].collapsed;
    
    // Update the display for this specific class
    const classContainer = document.getElementById(`class-container-${classIndex}`);
    if (classContainer) {
        const detailsContainer = classContainer.querySelector('.class-level-details');
        const chevron = classContainer.querySelector('.class-chevron');
        
        if (currentCharacter.classes[classIndex].collapsed) {
            detailsContainer.style.display = 'none';
            chevron.textContent = '▶';
            chevron.className = 'class-chevron collapsed';
        } else {
            detailsContainer.style.display = 'block';
            chevron.textContent = '▼';
            chevron.className = 'class-chevron expanded';
        }
    }
}

/**
 * Gets the maximum level allowed for a class based on total level limit
 * @param {number} classIndex - Index of the class
 * @returns {number} Maximum allowed level
 */
function getMaxLevelForClass(classIndex) {
    if (classIndex < 0 || classIndex >= currentCharacter.classes.length) return 1;
    
    // Calculate the sum of levels for all OTHER classes
    let otherClassesTotal = 0;
    currentCharacter.classes.forEach((cls, index) => {
        if (index !== classIndex) {
            otherClassesTotal += cls.level;
        }
    });
    
    // Max level for this class is 20 minus levels in other classes
    const maxLevel = 20 - otherClassesTotal;
    
    // Ensure minimum of 1 level and maximum of 20
    return Math.max(1, Math.min(20, maxLevel));
}

/**
 * Updates hit points calculation for multiclass characters
 */
function updateMulticlassHitPoints() {
    if (!currentCharacter.isMulticlassing) {
        updateHitPoints(); // Use single class method
        return;
    }
    
    let totalHitPoints = 0;
    let totalBonuses = 0;
    
    // Calculate hit points for each class
    currentCharacter.classes.forEach((classData, index) => {
        const classInfo = getClassInfo(classData.className);
        if (!classInfo) return;
        
        const hitDie = classInfo.hitDie;
        
        if (currentCharacter.hitPointsCalculationMethod === 'average') {
            // Level 1 of first class gets max, others get average
            if (index === 0) {
                // First class: level 1 gets max, rest get average
                totalHitPoints += hitDie; // Level 1 max
                if (classData.level > 1) {
                    const averageRoll = Math.ceil((hitDie + 1) / 2);
                    totalHitPoints += averageRoll * (classData.level - 1);
                }
            } else {
                // Other classes: all levels get average
                const averageRoll = Math.ceil((hitDie + 1) / 2);
                totalHitPoints += averageRoll * classData.level;
            }
        } else {
            // Use rolled values
            const rolledTotal = getTotalRolledHitPointsForClass(classData, hitDie, index === 0);
            totalHitPoints += rolledTotal;
        }
    });
    
    // Calculate bonuses (CON modifier, feats, etc.)
    const bonuses = calculateHitPointsBonuses();
    totalBonuses = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Set total hit points
    currentCharacter.trueHitPoints = totalHitPoints + totalBonuses;
    currentCharacter.hitPoints = currentCharacter.trueHitPoints;
    currentCharacter.hitPointsBonuses = bonuses;
    
    // Update display
    updateMulticlassHitPointsDisplay();
}

/**
 * Gets rolled hit points for a specific class
 */
function getTotalRolledHitPointsForClass(classData, hitDie, isFirstClass) {
    let total = 0;
    
    if (isFirstClass) {
        // First class: level 1 gets max
        total += hitDie;
        // Add rolled values for levels 2+
        for (let level = 2; level <= classData.level; level++) {
            const classKey = `${classData.className}-${level}`;
            total += currentCharacter.rolledHitPoints[classKey] || 0;
        }
    } else {
        // Other classes: use average or rolled for all levels
        for (let level = 1; level <= classData.level; level++) {
            const classKey = `${classData.className}-${level}`;
            total += currentCharacter.rolledHitPoints[classKey] || Math.ceil((hitDie + 1) / 2);
        }
    }
    
    return total;
}

/**
 * Updates the multiclass hit points display
 */
function updateMulticlassHitPointsDisplay() {
    const hitPointsValue = document.getElementById('totalHitPointsValue');
    const hitPointsBreakdown = document.getElementById('totalHitPointsBreakdown');
    
    if (hitPointsValue) {
        hitPointsValue.textContent = currentCharacter.trueHitPoints;
    }
    
    if (hitPointsBreakdown) {
        let breakdownText = 'Total from all classes';
        if (currentCharacter.hitPointsBonuses.length > 0) {
            const bonusTotal = currentCharacter.hitPointsBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
            breakdownText += ` | Bonuses: +${bonusTotal}`;
        }
        hitPointsBreakdown.textContent = breakdownText;
    }
}

/**
 * Renders the rolled hit points input interface for multiclass characters
 */
function renderMulticlassRolledHitPointsInterface() {
    // Remove existing container if it exists
    let existingContainer = document.getElementById('multiclassRolledHitPointsContainer');
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Create multiclass rolled HP container
    const rolledContainer = document.createElement('div');
    rolledContainer.id = 'multiclassRolledHitPointsContainer';
    rolledContainer.className = 'rolled-hit-points-container';
    
    const title = document.createElement('h4');
    title.textContent = 'Rolled Hit Points';
    title.onclick = toggleRolledHitPointsCollapse;
    rolledContainer.appendChild(title);
    
    // Create collapsible content container
    const contentContainer = document.createElement('div');
    contentContainer.className = 'rolled-hit-points-content';
    contentContainer.id = 'rolledHitPointsContent';
    
    const description = document.createElement('p');
    description.textContent = 'Enter your rolled hit points for each class and level. First class level 1 is always maximum. Empty fields count as 0.';
    contentContainer.appendChild(description);
    
    // Add roll button and roll count display
    const rollControls = document.createElement('div');
    rollControls.className = 'hp-roll-controls';
    
    const rollButton = document.createElement('button');
    rollButton.textContent = 'Roll Next Level';
    rollButton.className = 'btn btn-primary';
    rollButton.onclick = rollMulticlassHitPoints;
    rollControls.appendChild(rollButton);
    
    const rollCountDisplay = document.createElement('div');
    rollCountDisplay.id = 'multiclassHpRollCount';
    rollCountDisplay.className = 'hp-roll-count';
    rollCountDisplay.textContent = `Rolls: ${currentCharacter.hitPointsRollCount}`;
    rollControls.appendChild(rollCountDisplay);
    
    contentContainer.appendChild(rollControls);
    
    // Create inputs container for all classes
    const inputsContainer = document.createElement('div');
    inputsContainer.id = 'multiclassRolledHitPointsInputs';
    inputsContainer.className = 'multiclass-hp-inputs';
    
    // Create inputs for each class
    currentCharacter.classes.forEach((classData, classIndex) => {
        const classInfo = getClassInfo(classData.className);
        if (!classInfo) return;
        
        const classSection = document.createElement('div');
        classSection.className = 'multiclass-hp-class-section';
        
        const classTitle = document.createElement('h5');
        classTitle.textContent = `${classInfo.name} (d${classInfo.hitDie})`;
        classSection.appendChild(classTitle);
        
        const levelsContainer = document.createElement('div');
        levelsContainer.className = 'multiclass-hp-levels';
        
        for (let level = 1; level <= classData.level; level++) {
            const levelGroup = document.createElement('div');
            
            const label = document.createElement('label');
            label.textContent = `L${level}`;
            levelGroup.appendChild(label);
            
            const input = document.createElement('input');
            input.type = 'number';
            input.min = 1;
            input.max = classInfo.hitDie;
            
            const classKey = `${classData.className}-${level}`;
            
            if (level === 1 && classIndex === 0) {
                // First class level 1 is always maximum
                input.value = classInfo.hitDie;
                input.disabled = true;
                input.title = 'First class level 1 is always maximum hit points';
            } else {
                // Other levels can be rolled or manually entered
                input.value = currentCharacter.rolledHitPoints[classKey] || '';
                
                input.addEventListener('change', (e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= classInfo.hitDie) {
                        currentCharacter.rolledHitPoints[classKey] = value;
                        updateMulticlassHitPoints();
                    } else {
                        e.target.value = '';
                        delete currentCharacter.rolledHitPoints[classKey];
                        updateMulticlassHitPoints();
                    }
                });
            }
            
            levelGroup.appendChild(input);
            
            // Add dice display for levels that already have rolls
            if (level > 1 || classIndex > 0) {
                if (currentCharacter.rolledHitPoints[classKey]) {
                    const diceContainer = document.createElement('div');
                    diceContainer.className = 'dice-container';
                    
                    const dieElement = document.createElement('div');
                    dieElement.className = `die d${classInfo.hitDie}`;
                    dieElement.textContent = currentCharacter.rolledHitPoints[classKey];
                    
                    // Use standard die styling, not custom sizes
                    // The CSS will handle the shapes and sizing
                    
                    const dieLabel = document.createElement('div');
                    dieLabel.className = 'score-label';
                    dieLabel.textContent = `d${classInfo.hitDie}`;
                    
                    diceContainer.appendChild(dieElement);
                    diceContainer.appendChild(dieLabel);
                    levelGroup.appendChild(diceContainer);
                }
            }
            
            levelsContainer.appendChild(levelGroup);
        }
        
        classSection.appendChild(levelsContainer);
        inputsContainer.appendChild(classSection);
    });
    
    contentContainer.appendChild(inputsContainer);
    rolledContainer.appendChild(contentContainer);
    
    // Add to the bottom of the multiclass header container
    const multiclassHeaderContainer = document.querySelector('.multiclass-header-container');
    if (multiclassHeaderContainer) {
        // Append directly to the multiclass header container so it's inside
        multiclassHeaderContainer.appendChild(rolledContainer);
    }
}

/**
 * Toggles the collapsed state of the rolled hit points interface
 */
function toggleRolledHitPointsCollapse() {
    const title = document.querySelector('.rolled-hit-points-container h4');
    const content = document.getElementById('rolledHitPointsContent');
    
    if (content && title) {
        const isCollapsed = content.classList.contains('collapsed');
        
        if (isCollapsed) {
            content.classList.remove('collapsed');
            title.classList.remove('collapsed');
        } else {
            content.classList.add('collapsed');
            title.classList.add('collapsed');
        }
    }
}

/**
 * Rolls hit points for a random unrolled level in multiclass mode
 */
function rollMulticlassHitPoints() {
    // Play dice rolling sound
    playDiceRollSound();
    
    // Find all unrolled levels
    const unrolledLevels = [];
    
    currentCharacter.classes.forEach((classData, classIndex) => {
        const classInfo = getClassInfo(classData.className);
        if (!classInfo) return;
        
        for (let level = 1; level <= classData.level; level++) {
            const classKey = `${classData.className}-${level}`;
            
            // Skip first class level 1 (always max) and already rolled levels
            if ((level === 1 && classIndex === 0) || currentCharacter.rolledHitPoints[classKey]) {
                continue;
            }
            
            unrolledLevels.push({
                classKey,
                className: classData.className,
                level,
                hitDie: classInfo.hitDie,
                classIndex
            });
        }
    });
    
    if (unrolledLevels.length === 0) {
        alert('All levels have been rolled!');
        return;
    }
    
    // Pick the next level in order (first class first, then by level within each class)
    // Sort by class index first, then by level within each class
    unrolledLevels.sort((a, b) => {
        if (a.classIndex !== b.classIndex) {
            return a.classIndex - b.classIndex; // First class first
        }
        return a.level - b.level; // Lower levels first within each class
    });
    
    const nextLevel = unrolledLevels[0]; // Take the first (earliest) unrolled level
    
    // Roll the die
    let roll = Math.floor(Math.random() * nextLevel.hitDie) + 1;
    let wasRerolled = false;
    
    // Implement reroll ones if enabled
    if (currentCharacter.rerollOnesHitDice && roll === 1) {
        wasRerolled = true;
        roll = Math.floor(Math.random() * nextLevel.hitDie) + 1;
    }
    
    // Store the roll
    currentCharacter.rolledHitPoints[nextLevel.classKey] = roll;
    
    // Increment roll count
    currentCharacter.hitPointsRollCount++;
    
    // Update the interface and hit points
    renderMulticlassRolledHitPointsInterface();
    updateMulticlassHitPoints();
    
    console.log(`Rolled ${roll} for ${nextLevel.className} level ${nextLevel.level}`);
    
    // Update roll count display
    const rollCountDisplay = document.getElementById('multiclassHpRollCount');
    if (rollCountDisplay) {
        rollCountDisplay.textContent = `Rolls: ${currentCharacter.hitPointsRollCount}`;
    }
}

// ========== END MULTICLASSING SYSTEM ==========

// ========== MULTICLASS DISPLAY FUNCTIONS ==========

/**
 * Displays all classes in multiclass mode
 */
function displayAllClasses() {
    const classInfoDisplay = document.getElementById('classInfoDisplay');
    if (!classInfoDisplay) return;
    
    // Initialize or fix classes array if transitioning from single-class to multiclass
    if (currentCharacter.class) {
        if (currentCharacter.classes.length === 0) {
            currentCharacter.classes = [{
                className: currentCharacter.class,
                subclass: currentCharacter.subclass || "",
                level: currentCharacter.level || 1,
                features: [],
                choices: currentCharacter.choices || {},
                hitPoints: {},
                collapsed: false
            }];
            currentCharacter.totalLevel = currentCharacter.level || 1;
            currentCharacter.isMulticlassing = false;
        } else if (currentCharacter.classes.length === 1) {
            // Fix existing single class data if it's out of sync
            const existingClass = currentCharacter.classes[0];
            
            // Update the class data to match current character state
            existingClass.className = currentCharacter.class;
            existingClass.subclass = currentCharacter.subclass || "";
            existingClass.level = currentCharacter.level || 1;
            
            // Migrate choices from legacy format if they exist
            if (currentCharacter.choices && Object.keys(currentCharacter.choices).length > 0) {
                console.log('Migrating legacy choices to multiclass format');
                console.log('Legacy choices structure:', currentCharacter.choices);
                existingClass.choices = {};
                
                Object.keys(currentCharacter.choices).forEach(level => {
                    const levelNum = parseInt(level);
                    if (!isNaN(levelNum)) {
                        existingClass.choices[levelNum] = {};
                        
                        Object.keys(currentCharacter.choices[level]).forEach(choiceKey => {
                            existingClass.choices[levelNum][choiceKey] = currentCharacter.choices[level][choiceKey];
                            console.log(`Migrated choice: Level ${levelNum}, ${choiceKey} =`, currentCharacter.choices[level][choiceKey]);
                        });
                    } else {
                        console.warn('Invalid level key found:', level);
                    }
                });
                
                console.log('Migrated choices structure:', existingClass.choices);
                
                // Don't clear legacy choices yet - let the interface rebuild first
                // currentCharacter.choices = {};
            } else {
                existingClass.choices = existingClass.choices || {};
            }
            
            currentCharacter.totalLevel = currentCharacter.level || 1;
            currentCharacter.isMulticlassing = false;
        }
    }
    
    // Clear existing content
    classInfoDisplay.innerHTML = '';
    classInfoDisplay.classList.remove('hidden');
    
    // Create header with total level and add class button
    const headerContainer = document.createElement('div');
    headerContainer.className = 'multiclass-header-container';
    
    const headerContent = document.createElement('div');
    headerContent.className = 'multiclass-header-content';
    
    // Left side - Hit points (taking up remaining space)
    const leftSide = document.createElement('div');
    leftSide.className = 'multiclass-header-left';
    
    const hitPointsContainer = document.createElement('div');
    hitPointsContainer.className = 'multiclass-hit-points-container';
    
    const hitPointsLabel = document.createElement('div');
    hitPointsLabel.className = 'hit-points-label';
    hitPointsLabel.textContent = 'Hit Points';
    hitPointsContainer.appendChild(hitPointsLabel);
    
    const hitPointsValue = document.createElement('div');
    hitPointsValue.className = 'hit-points-value';
    hitPointsValue.id = 'totalHitPointsValue';
    hitPointsValue.textContent = currentCharacter.trueHitPoints;
    hitPointsContainer.appendChild(hitPointsValue);
    
    const hitPointsBreakdown = document.createElement('div');
    hitPointsBreakdown.className = 'hit-points-breakdown';
    hitPointsBreakdown.id = 'totalHitPointsBreakdown';
    hitPointsBreakdown.textContent = 'Total from all classes';
    hitPointsContainer.appendChild(hitPointsBreakdown);
    
    leftSide.appendChild(hitPointsContainer);
    headerContent.appendChild(leftSide);
    
    // Right side - Total level and add class button (stacked vertically)
    const rightSide = document.createElement('div');
    rightSide.className = 'multiclass-header-right';
    
    const totalLevelDisplay = document.createElement('div');
    totalLevelDisplay.className = 'total-level-display';
    totalLevelDisplay.innerHTML = `<h3>Total Level: ${currentCharacter.totalLevel}/20</h3>`;
    rightSide.appendChild(totalLevelDisplay);
    
    if (currentCharacter.totalLevel < 20) {
        const addClassButton = document.createElement('button');
        addClassButton.className = 'btn btn-primary add-class-button';
        addClassButton.textContent = '+ Add Class';
        addClassButton.onclick = showAddClassModal;
        rightSide.appendChild(addClassButton);
    }
    
    headerContent.appendChild(rightSide);
    headerContainer.appendChild(headerContent);
    classInfoDisplay.appendChild(headerContainer);
    
    // Create container for all classes
    const classesContainer = document.createElement('div');
    classesContainer.id = 'multiclassContainer';
    classesContainer.className = 'multiclass-container';
    
    // Display each class
    currentCharacter.classes.forEach((classData, index) => {
        displaySingleClass(index, classesContainer);
    });
    
    classInfoDisplay.appendChild(classesContainer);
    
    // Set multiclassing flag based on number of classes
    currentCharacter.isMulticlassing = currentCharacter.classes.length > 1;
    console.log('Multiclassing flag set to:', currentCharacter.isMulticlassing);
    
    // Hide the original class selection
    const classSelection = document.getElementById('classSelection');
    if (classSelection) {
        classSelection.style.display = 'none';
    }
    
    // Update hit points
    updateMulticlassHitPoints();
    
    // Show rolled hit points interface if using rolled method
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderMulticlassRolledHitPointsInterface();
    }
    
    // Clear legacy choices after interface is fully built
    if (currentCharacter.choices && Object.keys(currentCharacter.choices).length > 0) {
        console.log('Clearing legacy choices after interface rebuild');
        currentCharacter.choices = {};
    }
}

/**
 * Displays a single class in the multiclass container
 * @param {number} classIndex - Index of the class to display
 * @param {HTMLElement} parentContainer - Container to append to (optional)
 */
function displaySingleClass(classIndex, parentContainer = null) {
    if (classIndex < 0 || classIndex >= currentCharacter.classes.length) return;
    
    const classData = currentCharacter.classes[classIndex];
    const classInfo = getClassInfo(classData.className);
    if (!classInfo) return;
    
    const container = parentContainer || document.getElementById('multiclassContainer');
    if (!container) return;
    
    // Check if container already exists to maintain position
    const existingContainer = document.getElementById(`class-container-${classIndex}`);
    const insertBeforeElement = existingContainer ? existingContainer.nextSibling : null;
    if (existingContainer) {
        existingContainer.remove();
    }
    
    // Create class container
    const classContainer = document.createElement('div');
    classContainer.id = `class-container-${classIndex}`;
    classContainer.className = 'multiclass-class-container';
    
    // Create class header
    const classHeader = document.createElement('div');
    classHeader.className = 'multiclass-class-header';
    
    // Header left - Chevron and class name
    const headerLeft = document.createElement('div');
    headerLeft.className = 'multiclass-header-left';
    
    const chevron = document.createElement('span');
    chevron.className = `class-chevron ${classData.collapsed ? 'collapsed' : 'expanded'}`;
    chevron.textContent = classData.collapsed ? '▶' : '▼';
    chevron.onclick = () => toggleClassCollapsed(classIndex);
    headerLeft.appendChild(chevron);
    
    const className = document.createElement('h3');
    className.textContent = `${classInfo.name}${classData.subclass ? ` (${classData.subclass})` : ''}`;
    className.onclick = () => toggleClassCollapsed(classIndex);
    headerLeft.appendChild(className);
    
    classHeader.appendChild(headerLeft);
    
    // Header center - Level dropdown
    const headerCenter = document.createElement('div');
    headerCenter.className = 'multiclass-header-center';
    
    const levelLabel = document.createElement('label');
    levelLabel.textContent = 'Level: ';
    headerCenter.appendChild(levelLabel);
    
    const levelDropdown = document.createElement('select');
    levelDropdown.id = `levelDropdown-${classIndex}`;
    levelDropdown.className = 'class-level-dropdown';
    
    const maxLevel = getMaxLevelForClass(classIndex);
    
    for (let i = 1; i <= maxLevel; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Level ${i}`;
        if (i === classData.level) {
            option.selected = true;
        }
        levelDropdown.appendChild(option);
    }
    
    levelDropdown.onchange = async (e) => {
        const newLevel = parseInt(e.target.value);
        const oldLevel = classData.level;
        
        // If reducing level, show confirmation and reset dropdown if cancelled
        if (newLevel < oldLevel) {
            const confirmed = await updateClassLevel(classIndex, newLevel);
            if (!confirmed) {
                // Reset dropdown to original value if user cancelled
                e.target.value = oldLevel;
            }
        } else {
            // For level increases, proceed normally
            updateClassLevel(classIndex, newLevel);
        }
    };
    headerCenter.appendChild(levelDropdown);
    
    // Add remove button to center section with margin
    const removeButton = document.createElement('button');
    removeButton.className = 'btn btn-danger remove-class-button';
    removeButton.textContent = '✕';
    removeButton.title = `Remove ${classInfo.name} class`;
    removeButton.onclick = () => removeClass(classIndex);
    removeButton.style.marginLeft = '30px';
    headerCenter.appendChild(removeButton);
    
    classHeader.appendChild(headerCenter);
    classContainer.appendChild(classHeader);
    
    // Create class details container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'class-level-details';
    detailsContainer.id = `class-details-${classIndex}`;
    detailsContainer.style.display = classData.collapsed ? 'none' : 'block';
    
    // Generate level progression for this class
    renderMulticlassLevels(classData, classInfo, detailsContainer);
    
    classContainer.appendChild(detailsContainer);
    
    // Insert at the same position to maintain order
    if (insertBeforeElement) {
        container.insertBefore(classContainer, insertBeforeElement);
    } else {
        container.appendChild(classContainer);
    }
}

/**
 * Renders level progression for a single class in multiclass mode
 * @param {Object} classData - The class data from currentCharacter.classes
 * @param {Object} classInfo - The class info from classesData
 * @param {HTMLElement} container - Container to render into
 */
function renderMulticlassLevels(classData, classInfo, container) {
    // Clear existing content
    container.innerHTML = '';
    
    // Render each level for this class
    for (let level = 1; level <= classData.level; level++) {
        renderMulticlassLevel(classData, classInfo, level, container);
    }
}

/**
 * Renders a single level for a multiclass
 * @param {Object} classData - The class data
 * @param {Object} classInfo - The class info
 * @param {number} level - The level to render
 * @param {HTMLElement} container - Container to render into
 */
function renderMulticlassLevel(classData, classInfo, level, container) {
    const levelData = classInfo.levelProgression[level.toString()];
    if (!levelData) return;
    
    // Create level wrapper
    const wrapper = document.createElement('div');
    wrapper.id = `multiclass-level-block-${classData.className}-${level}`;
    wrapper.className = 'multiclass-level-block';
    
    // Add level header
    const levelHeader = document.createElement('h4');
    levelHeader.textContent = `Level ${level}`;
    levelHeader.className = 'multiclass-level-header';
    wrapper.appendChild(levelHeader);
    
    // Add features (same logic as single class, but with different IDs)
    const choiceKeys = Object.keys(levelData.choices || {});
    
    // Core features
    (levelData.features || [])
        .filter(featName => {
            const hasChoiceDefinition = choiceKeys.includes(featName);
            const isGenericSubclassPlaceholder = featName.includes("Martial Archetype feature") || 
                                                featName.includes("Archetype feature") ||
                                                featName.includes("feature feature");
            return !hasChoiceDefinition && !isGenericSubclassPlaceholder;
        })
        .forEach((feat, i) => {
            const desc = levelData.automaticFeatures?.[feat]?.description || '';
            renderSimpleCard(
                wrapper,
                feat,
                desc || 'No description.',
                `multiclass-feat-${classData.className}-${level}-${i}`
            );
        });
    
    // Automatic features not in features[]
    Object.entries(levelData.automaticFeatures || {})
        .filter(([name]) => {
            const baseName = getBaseFeatureName(name);
            const featuresBaseNames = (levelData.features || []).map(f => getBaseFeatureName(f));
            return !featuresBaseNames.includes(baseName);
        })
        .forEach(([name, detail], i) => {
            renderSimpleCard(
                wrapper,
                name,
                detail.description,
                `multiclass-auto-${classData.className}-${level}-${i}`
            );
        });
    
    // Level 1 character creation features (only for first class)
    if (level === 1 && container.id === 'class-details-0') {
        renderLevel1CharacterCreation(wrapper, classData.className);
    }
    
    // Choices
    if (levelData.choices) {
        Object.entries(levelData.choices).forEach(([key, def]) => {
            renderMulticlassChoices(wrapper, level, key, def, classData.className);
        });
    }
    
    // Subclass features
    if (level >= 3 && classData.subclass && classInfo.subclasses && classInfo.subclasses[classData.subclass]) {
        const subclassInfo = classInfo.subclasses[classData.subclass];
        const scFeat = subclassInfo.features[level.toString()];
        if (scFeat) {
            const subclassChoiceKeys = Object.keys(scFeat.choices || {});
            
            // Process regular subclass features
            (scFeat.features || []).forEach((feat, i) => {
                if (!subclassChoiceKeys.includes(feat)) {
                    const desc = scFeat.automaticFeatures?.[feat]?.description || '';
                    renderSimpleCard(
                        wrapper,
                        feat,
                        desc || 'No description.',
                        `multiclass-sub-feat-${classData.className}-${level}-${i}`
                    );
                }
            });
            
            // Process automatic subclass features
            Object.entries(scFeat.automaticFeatures || {}).forEach(([name, detail], i) => {
                const baseName = getBaseFeatureName(name);
                const featuresBaseNames = (scFeat.features || []).map(f => getBaseFeatureName(f));
                if (!featuresBaseNames.includes(baseName)) {
                    renderSimpleCard(
                        wrapper,
                        name,
                        detail.description,
                        `multiclass-sub-auto-${classData.className}-${level}-${i}`
                    );
                }
            });
            
            // Process subclass choices
            if (scFeat.choices) {
                Object.entries(scFeat.choices).forEach(([key, def]) => {
                    renderMulticlassChoices(wrapper, level, key, def, classData.className);
                });
            }
        }
    }
    
    container.appendChild(wrapper);
}

/**
 * Renders choices for multiclass (same as regular choices but with class-specific IDs)
 * @param {HTMLElement} parent - Parent container
 * @param {number} level - Level of the choice
 * @param {string} choiceKey - Key for the choice
 * @param {Object} choiceDef - Choice definition
 * @param {string} className - Name of the class (for unique IDs)
 */
function renderMulticlassChoices(parent, level, choiceKey, choiceDef, className) {
    // Create unique IDs that include the class name to avoid conflicts
    const safeKey = choiceKey.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeClassName = className.replace(/[^a-zA-Z0-9_-]/g, '');
    const idBase = `multiclass-choice-${safeClassName}-${safeKey}-L${level}`;
    
    // Use the existing renderChoices logic but with modified IDs
    const { header, body } = renderSimpleCard(
        parent,
        `${choiceKey} (choose ${choiceDef.choose})`,
        choiceDef.description,
        idBase
    );
    
    // Add status icon
    const status = document.createElement('span');
    status.id = `${idBase}-status`;
    status.classList.add('choice-status', 'incomplete');
    status.textContent = '❗';
    const title = header.querySelector(`#${idBase}-title`);
    header.insertBefore(status, title);
    
    // Build the choice interface with class name context
    buildMulticlassChoiceInterface(body, status, choiceDef, level, choiceKey, idBase, className);
}

/**
 * Gets the saved choice value for a specific level and choice key
 * Works for both single-class and multiclass modes
 */
function getSavedChoiceValue(level, choiceKey, className = null) {
    console.log('getSavedChoiceValue called:', {
        level,
        choiceKey,
        className,
        isMulticlassing: currentCharacter.isMulticlassing,
        classesLength: currentCharacter.classes.length
    });
    
    // For multiclass mode, check class-specific choices first
    if (currentCharacter.isMulticlassing && className) {
        const targetClass = currentCharacter.classes.find(cls => cls.className === className);        
        if (targetClass && targetClass.choices && targetClass.choices[level] && targetClass.choices[level][choiceKey]) {
            const value = targetClass.choices[level][choiceKey];
            return value;
        }
    } else if (currentCharacter.isMulticlassing && currentCharacter.classes.length > 0) {
        // If no className specified but in multiclass mode, check the first class
        const targetClass = currentCharacter.classes[0];
        if (targetClass && targetClass.choices && targetClass.choices[level] && targetClass.choices[level][choiceKey]) {
            const value = targetClass.choices[level][choiceKey];
            return value;
        }
    }
    
    if (currentCharacter.choices && currentCharacter.choices[level] && currentCharacter.choices[level][choiceKey]) {
        const value = currentCharacter.choices[level][choiceKey];
        return value;
    }
    return null;
}

/**
 * Builds choice interface for multiclass with class-specific context
 */
function buildMulticlassChoiceInterface(body, status, choiceDef, level, choiceKey, idBase, className) {
    // Filter options for duplicates using universal system
    const filteredOptions = getAvailableChoiceOptions(choiceDef.options || [], choiceKey);
    
    // Check if this is a multiple choice selection
    if (choiceDef.choose > 1) {
        buildMulticlassMultipleChoice(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, className);
    } else {
        buildMulticlassSingleChoice(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, className);
    }
}

/**
 * Builds single choice selection for multiclass
 */
function buildMulticlassSingleChoice(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, className) {
    const select = document.createElement('select');
    select.id = `${idBase}-primary`;
    select.appendChild(new Option('-- select --','', true, true));

    filteredOptions.forEach((opt) => {
        const option = new Option(opt.originalName, opt.originalName);
        select.appendChild(option);
    });

    // Check if there's a saved choice and restore it
    const savedChoice = getSavedChoiceValue(level, choiceKey, className);
    
    if (savedChoice && savedChoice !== '') {      
        // Handle special cases where saved choice is an array or object
        let dropdownValue = savedChoice;
        
        // For ASI choices, if saved choice is an array, dropdown should show "ASI"
        if (Array.isArray(savedChoice) && choiceKey.includes('Ability Score')) {
            dropdownValue = 'ASI';
        }
        // For subclass choices, ensure the subclass name matches exactly
        else if (choiceKey.includes('Archetype') || choiceKey.includes('subclass')) {
            dropdownValue = savedChoice;
        }
        // For other array choices (like multiple selections), use the first element or handle accordingly
        else if (Array.isArray(savedChoice)) {
            console.warn('Unexpected array for multiclass single choice:', savedChoice);
            dropdownValue = savedChoice[0] || '';
        }
        
        // Set the value
        select.value = dropdownValue;
        
        // Verify the value was set correctly
        if (select.value === dropdownValue) {          
            console.log(status);  
            // Update status to complete if choice is restored
            status.textContent = '✔';
            status.className = 'choice-status complete';
            
            // Show description for restored choice (use dropdownValue for lookup)
            const originalOption = choiceDef.options.find(o => (o.name||o)===dropdownValue);
            if (originalOption?.description) {
                const p = document.createElement('p');
                p.id = `${idBase}-selectedDesc`;
                p.textContent = originalOption.description;
                body.appendChild(p);
            }
            
            // If this was an ASI choice, rebuild the ASI interface
            if (dropdownValue === 'ASI' && Array.isArray(savedChoice)) {
                console.log('Rebuilding multiclass ASI interface for restored choice');
                ['A','B'].forEach((suffix, idx) => {
                    buildMulticlassASI(body, status, level, choiceKey, idBase, suffix, idx, className);
                });
            }
            // If this was a Feat choice, rebuild the feat interface
            else if (dropdownValue === 'Feat') {
                console.log('Rebuilding multiclass Feat interface for restored choice');
                buildMulticlassFeat(body, status, level, choiceKey, idBase, className);
            }
        } else {
            
            // Try to find a matching option by checking all options
            const matchingOption = Array.from(select.options).find(opt => opt.value === dropdownValue);
            if (matchingOption) {
                matchingOption.selected = true;
                select.value = dropdownValue; // Force it
                console.log('✅ Fixed multiclass choice by setting selected=true');
            } else {
                console.error('❌ No matching multiclass option found for:', dropdownValue);
            }
        }
    }

    select.onchange = () => {
        // reset status & clear old secondaries/descs
        status.textContent = '❗';
        status.className = 'choice-status incomplete';
        body.querySelectorAll(`select[id^="${idBase}-secondary"]`).forEach(n => n.remove());
        body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());

        const choice = select.value;
        
        if (choice && choice !== '') {
            // Pass className to choice handling
            handleChoiceSelection(level, choiceKey, choice, choiceDef.type, className);

            if (choice === 'ASI') {
                // Handle ASI choices
                ['A','B'].forEach((suffix, idx) => {
                    buildMulticlassASI(body, status, level, choiceKey, idBase, suffix, idx, className);
                });
            } else if (choice === 'Feat') {
                buildMulticlassFeat(body, status, level, choiceKey, idBase, className);
            } else {
                // Single option description
                const originalOption = choiceDef.options.find(o => (o.name||o)===choice);
                if (originalOption?.description) {
                    const p = document.createElement('p');
                    p.id = `${idBase}-selectedDesc`;
                    p.textContent = originalOption.description;
                    body.appendChild(p);
                }
                status.textContent = '✔';
                status.className = 'choice-status complete';
            }
        }
    };

    console.log(status);  

    body.appendChild(select);
}

/**
 * Builds multiple choice selection for multiclass
 */
function buildMulticlassMultipleChoice(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, className) {
    const container = document.createElement('div');
    container.id = `${idBase}-multi-container`;
    container.className = 'multi-choice-container';
    
    const instruction = document.createElement('p');
    instruction.textContent = `Choose ${choiceDef.choose} option${choiceDef.choose > 1 ? 's' : ''}:`;
    instruction.className = 'multi-choice-instruction';
    container.appendChild(instruction);
    
    // Load saved choices if they exist
    const selectedChoices = [];
    const savedChoice = getSavedChoiceValue(level, choiceKey, className);
    if (savedChoice && Array.isArray(savedChoice)) {
        selectedChoices.push(...savedChoice);
    }
    
    filteredOptions.forEach((opt, i) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'multi-choice-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${idBase}-option-${i}`;
        checkbox.value = opt.originalName;
        checkbox.checked = selectedChoices.includes(opt.originalName);
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = opt.originalName;
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        container.appendChild(optionDiv);
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (selectedChoices.length < choiceDef.choose) {
                    selectedChoices.push(opt.originalName);
                } else {
                    checkbox.checked = false;
                }
            } else {
                const index = selectedChoices.indexOf(opt.originalName);
                if (index > -1) {
                    selectedChoices.splice(index, 1);
                }
            }
            
            // Pass className to choice handling
            handleChoiceSelection(level, choiceKey, selectedChoices, choiceDef.type, className);
            
            // Update status
            
            if (selectedChoices.length === choiceDef.choose) {
                status.textContent = '✔';
                status.className = 'choice-status complete';
            } else {
                status.textContent = `❗ (${selectedChoices.length}/${choiceDef.choose})`;
                status.className = 'choice-status incomplete';
            }
        });
    });
    
    body.appendChild(container);
    console.warn(selectedChoices, choiceDef.choose);
    // Update initial status based on saved choices
    if (selectedChoices.length === choiceDef.choose) {
        status.textContent = '✔';
        status.className = 'choice-status complete';
        
        // Show descriptions for saved choices
        selectedChoices.forEach((choice, idx) => {
            const originalOption = choiceDef.options.find(o => (o.name||o)===choice);
            if (originalOption?.description) {
                const p = document.createElement('p');
                p.id = `${idBase}-selectedDesc-${idx}`;
                p.className = 'multi-choice-description';
                p.textContent = originalOption.description;
                container.appendChild(p);
            }
        });
    } else if (selectedChoices.length > 0) {
        status.textContent = `❗ (${selectedChoices.length}/${choiceDef.choose})`;
        status.className = 'choice-status incomplete';
    }
}

/**
 * Builds ASI interface for multiclass
 */
function buildMulticlassASI(body, status, level, choiceKey, idBase, suffix, idx, className) {
    // Reuse existing ASI logic but pass className to handleChoiceSelection
    buildASI(body, status, level, choiceKey, idBase, suffix, idx);
    // Note: The ASI builder needs to be updated to support className parameter
}

/**
 * Builds feat interface for multiclass  
 */
function buildMulticlassFeat(body, status, level, choiceKey, idBase, className) {
    // Reuse existing feat logic but pass className to handleChoiceSelection
    buildFeat(body, status, level, choiceKey, idBase);
    // Note: The feat builder needs to be updated to support className parameter
}

/**
 * Shows modal to add a new class
 */
function showAddClassModal() {
    const classNames = Object.keys(classesData.classes).sort();
    const availableClasses = classNames.filter(className => 
        !currentCharacter.classes.some(cls => cls.className === className)
    );
    
    if (availableClasses.length === 0) {
        alert("You already have all available classes!");
        return;
    }
    
    // Create modal content
    const modal = document.getElementById('classModal');
    const content = document.getElementById('classModalContent');
    content.innerHTML = '';
    
    const title = document.createElement('h2');
    title.textContent = 'Add New Class';
    content.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = 'Choose a class to multiclass into:';
    content.appendChild(description);
    
    // Create class selection grid
    const classGrid = document.createElement('div');
    classGrid.className = 'modal-class-grid';
    
    availableClasses.forEach(className => {
        const classInfo = getClassInfo(className);
        const classCard = document.createElement('div');
        classCard.className = 'modal-class-card';
        classCard.onclick = () => {
            addNewClass(className);
            modal.classList.add('hidden');
        };
        
        const nameEl = document.createElement('h4');
        nameEl.textContent = classInfo.name;
        
        const descEl = document.createElement('p');
        const primaryAbilities = classInfo.primaryAbilities || classInfo.primaryAbility || [];
        const primaryText = Array.isArray(primaryAbilities) ? primaryAbilities.join(', ') : primaryAbilities;
        descEl.textContent = `Hit Die: d${classInfo.hitDie} | Primary: ${primaryText}`;
        
        classCard.appendChild(nameEl);
        classCard.appendChild(descEl);
        classGrid.appendChild(classCard);
    });
    
    content.appendChild(classGrid);
    
    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.onclick = () => modal.classList.add('hidden');
    content.appendChild(cancelBtn);
    
    modal.classList.remove('hidden');
}

// ========== END MULTICLASS DISPLAY FUNCTIONS ==========

// Select a class
function selectClass(className) {
    const classInfo = getClassInfo(className);
    
    // If character has no classes yet, start multiclass system
    if (currentCharacter.classes.length === 0) {
        // Use current level if it exists, otherwise default to 1
        const initialLevel = currentCharacter.level || 1;
        
        currentCharacter.classes = [{
            className: className,
            subclass: "",
            level: initialLevel,
            features: [],
            choices: {},
            hitPoints: {},
            collapsed: false
        }];
        currentCharacter.totalLevel = initialLevel;
        currentCharacter.isMulticlassing = false; // Still false for single class
        
        // Set legacy properties for compatibility
        currentCharacter.class = className;
        currentCharacter.level = initialLevel;
    } else {
        // This is multiclassing - add new class
        addNewClass(className);
        return; // addNewClass handles the display
    }
    
    // Set up proficiencies for first class
    currentCharacter.savingThrows = {};

    if (Array.isArray(classInfo.savingThrowProficiencies)) {
        classInfo.savingThrowProficiencies.forEach(save => {
            currentCharacter.savingThrows[save.toLowerCase()] = true;
        });
    } else {
        console.warn(`Missing savingThrowProficiencies for class: ${className}`);
    }

    // Show subclass selection if available
    if (classInfo.subclasses && Object.keys(classInfo.subclasses).length > 0) {
        displaySubclassSelection(className);
    }

    // Use single class display initially
    displayClassInfoSection(className);
    
    // Apply existing ASI bonuses
    applyExistingASIBonuses();
    
    // Update class data for save
    updateClassesDataForSave();
}


function openClassModal(className) {
    const classInfo = getClassInfo(className);
    const modal = document.getElementById('classModal');
    const content = document.getElementById('classModalContent');
    content.innerHTML = ''; // Clear safely

    const title = document.createElement('h2');
    title.textContent = classInfo.name;
    title.id = 'className';

    const hitDie = document.createElement('p');
    hitDie.textContent = `Hit Die: d${classInfo.hitDie}`;
    hitDie.id = 'classHitDie';

    const primary = document.createElement('p');
    const primaryAbilities = classInfo.primaryAbilities || classInfo.primaryAbility || [];
    const primaryText = Array.isArray(primaryAbilities) ? primaryAbilities.join(', ') : primaryAbilities;
    primary.textContent = `Primary Ability: ${primaryText}`;
    primary.id = 'classPrimaryAbility';

    const saves = document.createElement('p');
    saves.textContent = `Saving Throws: ${classInfo.savingThrowProficiencies.join(', ')}`;
    saves.id = 'classSavingThrows';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Class';
    addBtn.id = 'addClassButton';
    addBtn.onclick = () => {
        selectClass(className);
        modal.classList.add('hidden');
        displayClassInfoSection(className);
    };

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.id = 'cancelClassButton';
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    [title, hitDie, primary, saves, addBtn, cancelBtn].forEach(el => content.appendChild(el));
    modal.classList.remove('hidden');
}


// Update character for level
function updateCharacterForLevel() {
    if (!currentCharacter.class) return;
    
    const classInfo = classesData[currentCharacter.class];
    const levelProgression = classInfo.levelProgression;
    
    // Reset features and choices
    currentCharacter.features = [];
    currentCharacter.choices = {};
    
    // Apply features for each level up to current level
    for (let level = 1; level <= currentCharacter.level; level++) {
        const levelInfo = levelProgression[level.toString()];
        if (levelInfo) {
            if (levelInfo.features) {
                currentCharacter.features.push(...levelInfo.features);
            }
            if (levelInfo.choices) {
                Object.assign(currentCharacter.choices, levelInfo.choices);
            }
        }
    }
    
    // Apply subclass features if applicable
    if (currentCharacter.subclass && classInfo.subclasses && classInfo.subclasses[currentCharacter.subclass]) {
        const subclassInfo = classInfo.subclasses[currentCharacter.subclass];
        for (let level = 1; level <= currentCharacter.level; level++) {
            const subclassLevel = subclassInfo.features[level.toString()];
            if (subclassLevel && subclassLevel.features) {
                currentCharacter.features.push(...subclassLevel.features);
            }
        }
    }
    
    updateDerivedStats();
    displayCurrentCharacter();
    
    // Update class data for save
    updateClassesDataForSave();
}

// Update class display
function updateClassDisplay() {
    const classDisplay = document.getElementById('selectedClass');
    if (classDisplay && currentCharacter.class) {
        const classInfo = classesData[currentCharacter.class];
        classDisplay.innerHTML = `
            <h3>Selected Class: ${classInfo.name}</h3>
            <p>Hit Die: d${classInfo.hitDie}</p>
            <p>Primary Abilities: ${classInfo.primaryAbilities.join(', ')}</p>
        `;
    }
}

// Display current character
function displayCurrentCharacter() {
    const characterDisplay = document.getElementById('characterDisplay');
    if (!characterDisplay) return;

    const classInfo = currentCharacter.class ? classesData[currentCharacter.class] : null;
    const raceInfo = currentCharacter.race ? racesData[currentCharacter.race] : null;
    
    // Get subrace info if applicable
    let subraceInfo = null;
    if (currentCharacter.subrace && raceInfo && raceInfo.subraces) {
        subraceInfo = raceInfo.subraces[currentCharacter.subrace];
    }
    
    characterDisplay.innerHTML = `
        <h3>Character Summary</h3>
        <p><strong>Name:</strong> ${currentCharacter.name || 'Unnamed'}</p>
        <p><strong>Species:</strong> ${raceInfo ? raceInfo.name : 'None'}${subraceInfo ? ` (${subraceInfo.name})` : ''}</p>
        <p><strong>Class:</strong> ${classInfo ? classInfo.name : 'None'}</p>
        <p><strong>Subclass:</strong> ${currentCharacter.subclass || 'None'}</p>
        <p><strong>Level:</strong> ${currentCharacter.level}</p>
        <p><strong>Hit Points:</strong> ${currentCharacter.hitPoints}</p>
        <p><strong>Armor Class:</strong> ${currentCharacter.armorClass}</p>
        <p><strong>Proficiency Bonus:</strong> +${currentCharacter.proficiencyBonus}</p>
        
        <h4>Ability Scores</h4>
        <ul>
            <li>Strength: ${currentCharacter.abilities.strength} (${getModifier(currentCharacter.abilities.strength)})</li>
            <li>Dexterity: ${currentCharacter.abilities.dexterity} (${getModifier(currentCharacter.abilities.dexterity)})</li>
            <li>Constitution: ${currentCharacter.abilities.constitution} (${getModifier(currentCharacter.abilities.constitution)})</li>
            <li>Intelligence: ${currentCharacter.abilities.intelligence} (${getModifier(currentCharacter.abilities.intelligence)})</li>
            <li>Wisdom: ${currentCharacter.abilities.wisdom} (${getModifier(currentCharacter.abilities.wisdom)})</li>
            <li>Charisma: ${currentCharacter.abilities.charisma} (${getModifier(currentCharacter.abilities.charisma)})</li>
        </ul>
        
        <h4>Features</h4>
        <ul>
            ${currentCharacter.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
    `;
}

/**
 * Adds subclass features to a specific level without clearing existing content
 */
function addSubclassFeaturesToLevel(level, subclassKey, scFeat) {
    const levelBlock = document.getElementById(`level-block-${level}`);
    if (!levelBlock) return;
    
    // Remove any existing subclass features for this level to avoid duplicates
    // Check for all possible subclass feature ID patterns
    levelBlock.querySelectorAll(`[id^="subclass-${level}-"]`).forEach(el => el.remove());
    levelBlock.querySelectorAll(`[id^="sub-feat-${level}-"]`).forEach(el => el.remove());
    levelBlock.querySelectorAll(`[id^="sub-auto-${level}-"]`).forEach(el => el.remove());
    
    // Remove any existing subclass choice features for this level
    // This handles choice features like "Maneuvers" from Battle Master
    const classInfo = classesData.classes[currentCharacter.class];
    Object.keys(classInfo.subclasses || {}).forEach(prevSubclassKey => {
        const prevSubclassInfo = classInfo.subclasses[prevSubclassKey];
        if (prevSubclassInfo && prevSubclassInfo.features && prevSubclassInfo.features[level]) {
            const prevScFeat = prevSubclassInfo.features[level];
            Object.keys(prevScFeat.choices || {}).forEach(choiceKey => {
                const choiceIdBase = `choice-${choiceKey.replace(/\s+/g,'')}-L${level}`;
                levelBlock.querySelectorAll(`[id^="${choiceIdBase}"]`).forEach(el => el.remove());
            });
        }
    });
    
    // Remove any empty feature cards that might be left behind
    levelBlock.querySelectorAll('.feature-card').forEach(card => {
        // Check if card is empty or only contains empty header/body divs
        const header = card.querySelector('.card-header');
        const body = card.querySelector('.card-body');
        
        const headerEmpty = !header || !header.textContent.trim();
        const bodyEmpty = !body || !body.textContent.trim();
        
        if (headerEmpty && bodyEmpty) {
            card.remove();
        }
    });
    
    // Get choice keys from subclass features to avoid duplicates
    const subclassChoiceKeys = Object.keys(scFeat.choices || {});
    
    // Process regular features first (skip those that have choices)
    (scFeat.features || []).forEach((feat, i) => {
        if (!subclassChoiceKeys.includes(feat)) {
            const desc = scFeat.automaticFeatures?.[feat]?.description || '';
            renderSimpleCard(
                levelBlock,
                feat,
                desc || 'No description.',
                `subclass-${level}-feat-${i}`
            );
        }
    });
    
    // Process automatic features that aren't already in features[]
    Object.entries(scFeat.automaticFeatures || {}).forEach(([name, detail], i) => {
        if (!(scFeat.features || []).includes(name)) {
            renderSimpleCard(
                levelBlock,
                name,
                detail.description,
                `subclass-${level}-auto-${i}`
            );
        }
    });
    
    // Process choices last
    if (scFeat.choices) {
        Object.entries(scFeat.choices).forEach(([key, def]) => {
            renderChoices(levelBlock, level, key, def);
        });
    }
}

/**
 * Saves the user's choice into currentCharacter,
 * and, for subclass picks, replaces the old subclass card
 * Includes validation to prevent invalid duplicate selections
 */
function handleChoiceSelection(level, choiceKey, choiceValue, choiceType, className = null) {
    // Validate the selection before saving
    if (!validateChoiceSelection(choiceKey, choiceValue, choiceType)) {
        console.warn(`Invalid choice selection blocked: ${choiceKey} = ${choiceValue}`);
        return;
    }
    
    // Determine which class this choice belongs to
    let targetClass = null;
    
    if (currentCharacter.isMulticlassing && className) {
        // Find the class by name
        targetClass = currentCharacter.classes.find(cls => cls.className === className);
    } else if (currentCharacter.classes.length > 0) {
        // Use the first/primary class
        targetClass = currentCharacter.classes[0];
    }
    
    // 1) Update the model
    if (choiceType === 'subclass') {
        if (targetClass) {
            targetClass.subclass = choiceValue;
        }
        // Also update legacy property if this is the primary class
        if (!currentCharacter.isMulticlassing || (targetClass && targetClass.className === currentCharacter.class)) {
            currentCharacter.subclass = choiceValue;
        }
    }
    
    // Store choices in the appropriate location
    if (targetClass) {
        // Store in class-specific choices
        targetClass.choices = targetClass.choices || {};
        targetClass.choices[level] = targetClass.choices[level] || {};
        targetClass.choices[level][choiceKey] = choiceValue;
    } else {
        // Fallback to legacy system for compatibility
        currentCharacter.choices = currentCharacter.choices || {};
        currentCharacter.choices[level] = currentCharacter.choices[level] || {};
        currentCharacter.choices[level][choiceKey] = choiceValue;
    }

    // 2) If this was the subclass dropdown, add subclass features to all relevant levels
    if (choiceType === 'subclass') {
        if (currentCharacter.isMulticlassing) {
            // Find the class index and update its display
            const classIndex = currentCharacter.classes.findIndex(cls => cls.className === (className || currentCharacter.class));
            if (classIndex >= 0) {
                displaySingleClass(classIndex);
            }
        } else {
            addSubclassFeaturesToDisplay(choiceValue);
        }
    }
    
    // Update class data for save
    updateClassesDataForSave();
    
    // For multi-choice selections (like maneuvers), immediately refresh other choice interfaces
    if (choiceKey.includes('Maneuvers') || choiceKey.includes('Fighting Style') || choiceKey.includes('Spell')) {
        setTimeout(() => refreshChoiceInterfaces(), 50);
    }
}

/**
 * Universal validation function for choice selections
 * Prevents invalid duplicates for ANY choice type
 * @param {string} choiceKey - The choice key
 * @param {*} choiceValue - The choice value (string or array)
 * @param {string} choiceType - The choice type
 * @returns {boolean} True if the choice is valid
 */
function validateChoiceSelection(choiceKey, choiceValue, choiceType) {
    // Handle special cases
    if (choiceType === 'subclass') {
        return true; // Subclass changes are always allowed
    }
    
    // Handle ASI array selections (ability score improvements)
    if (Array.isArray(choiceValue) && (choiceKey.includes('ASI') || choiceKey === 'Ability Score Improvement')) {
        // Check for internal duplicates in the selection
        const uniqueValues = [...new Set(choiceValue)];
        if (uniqueValues.length !== choiceValue.length) {
            return false; // Has internal duplicates
        }
        return true; // ASI selections are generally valid
    }
    
    // Handle feat selections (from ASI/feat choices)
    if ((choiceKey.includes('ASI') || choiceKey === 'Ability Score Improvement') && 
        typeof choiceValue === 'string' && 
        choiceValue !== 'Feat' && 
        choiceValue !== '' &&
        featsData.feats && featsData.feats.find(f => f.name === choiceValue)) {
        return canSelectChoice('Feats', choiceValue);
    }
    
    // Handle array selections (like multiple maneuvers)
    if (Array.isArray(choiceValue)) {
        // Check for internal duplicates within the selection
        const uniqueValues = [...new Set(choiceValue)];
        if (uniqueValues.length !== choiceValue.length) {
            return false; // Has internal duplicates
        }
        // Check each individual selection
        return choiceValue.every(value => canSelectChoice(choiceKey, value));
    }
    
    // Handle single string selections
    if (typeof choiceValue === 'string' && choiceValue !== '' && choiceValue !== 'Feat') {
        return canSelectChoice(choiceKey, choiceValue);
    }
    
    // All other choices are valid by default (empty strings, etc.)
    return true;
}

// Display subclass selection
function displaySubclassSelection(className) {
    const subclassContainer = document.getElementById('subclassSelection');
    if (!subclassContainer) return;

    const classInfo = classesData.classes[className];
    const subclasses = classInfo.subclasses;

    subclassContainer.innerHTML = '<h3>Choose a Subclass</h3>';
    
    Object.keys(subclasses).forEach(subclassKey => {
        const subclass = subclasses[subclassKey];
        const subclassCard = document.createElement('div');
        subclassCard.className = 'subclass-card';
        subclassCard.innerHTML = `
            <h4>${subclass.name}</h4>
            <button onclick="selectSubclass('${subclassKey}')">Select ${subclass.name}</button>`
        ;
        subclassContainer.appendChild(subclassCard);
    });
}

// Select a subclass
function selectSubclass(subclassKey) {
    currentCharacter.subclass = subclassKey;
    
    // Add subclass features to the display
    addSubclassFeaturesToDisplay(subclassKey);
    
    // Update class data for save
    updateClassesDataForSave();
}

/**
 * Adds subclass features to all relevant levels without clearing existing content
 * This function preserves all user choices while adding subclass features
 */
function addSubclassFeaturesToDisplay(subclassKey) {
    const classInfo = classesData.classes[currentCharacter.class];
    const subclassInfo = classInfo.subclasses[subclassKey];
    
    if (!subclassInfo) return;
    
    // Add subclass features to each level that has them
    Object.keys(subclassInfo.features || {}).forEach(levelStr => {
        const level = parseInt(levelStr);
        if (level <= currentCharacter.level) {
            addSubclassFeaturesToLevel(level, subclassKey, subclassInfo.features[level]);
        }
    });
}


















/**
 * Renders one of two ASI selects. When both are chosen,
 * stores [selA,selB] into currentCharacter.choices[level][choiceKey]
 * and flips status ✔. Also applies ability score bonuses.
 */
function buildASI(body, status, level, choiceKey, idBase, suffix, idx) {
    const sub = document.createElement('select');
    sub.id = `${idBase}-secondary-${suffix}`;
    sub.appendChild(new Option(`Pick Ability #${idx+1}`,'', true, true));

    // Get abilities and filter based on current totals
    const abilities = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
    const asiSource = `ASI Level ${level} ${suffix}`; // Make source unique for A vs B
    
    abilities.forEach(ability => {
        const baseScore = currentCharacter.abilities[ability] || 8;
        const currentBonus = currentCharacter.abilityBonuses?.[ability] || 0;
        const currentTotal = baseScore + currentBonus;
        
        // For initial display, check if adding +1 would exceed 20
        // But don't disable if this is a current selection being restored
        const currentChoices = currentCharacter.choices[level]?.[choiceKey];
        const isCurrentSelection = currentChoices && Array.isArray(currentChoices) && 
                                  (currentChoices[0] === ability || currentChoices[1] === ability);
        
        const wouldExceed20 = (currentTotal + 1) > 20;
        
        const option = new Option(
            `${ability.charAt(0).toUpperCase() + ability.slice(1)} (${currentTotal}${wouldExceed20 ? ' - Max' : ''})`,
            ability
        );
        
        // Disable if would exceed 20 (but allow current selections)
        if (wouldExceed20 && !isCurrentSelection) {
            option.disabled = true;
            option.style.color = '#999';
            option.style.fontStyle = 'italic';
        }
        
        sub.appendChild(option);
    });

    // Set current selection if it exists
    const currentChoices = currentCharacter.choices[level]?.[choiceKey];
    if (currentChoices && Array.isArray(currentChoices)) {
        if (suffix === 'A' && currentChoices[0]) {
            sub.value = currentChoices[0];
        } else if (suffix === 'B' && currentChoices[1]) {
            sub.value = currentChoices[1];
        }
    }

    sub.onchange = () => {
        const newAbility = sub.value;
        
        // Check if this selection would exceed 20 BEFORE applying it
        if (newAbility) {
            const baseScore = currentCharacter.abilities[newAbility] || 8;
            const currentBonus = currentCharacter.abilityBonuses?.[newAbility] || 0;
            const currentTotal = baseScore + currentBonus;
            
            // Check if adding +1 would exceed 20
            if ((currentTotal + 1) > 20) {
                // Reset the dropdown and show warning
                sub.value = '';
                alert(`Cannot select ${newAbility.charAt(0).toUpperCase() + newAbility.slice(1)} - total would exceed 20.`);
                return;
            }
        }
        
        // Remove existing bonus for this specific selector (A or B)
        const oldChoices = currentCharacter.choices[level]?.[choiceKey];
        
        if (oldChoices && Array.isArray(oldChoices)) {
            const oldAbility = suffix === 'A' ? oldChoices[0] : oldChoices[1];
            
            if (oldAbility && oldAbility !== newAbility) {
                removeAbilityBonus(oldAbility, asiSource);
            }
        }
        
        // Store new choices
        currentCharacter.choices[level] = currentCharacter.choices[level] || {};
        const currentChoices = currentCharacter.choices[level][choiceKey] || ['', ''];
        
        // Update the specific choice (A or B)
        if (suffix === 'A') {
            currentChoices[0] = newAbility;
        } else {
            currentChoices[1] = newAbility;
        }
        currentCharacter.choices[level][choiceKey] = currentChoices;
        
        // Apply new bonus for this specific selector
        if (newAbility) {
            addAbilityBonus(newAbility, 1, asiSource);
        }
        
        // Update UI
        updateAbilityTotalsUI();
        updateAbilityModifiers();
        
        // Update both dropdowns to reflect new totals
        refreshASIDropdowns(idBase, level, choiceKey);
        
        // Update status
        if (currentChoices[0] && currentChoices[1]) {
            status.textContent = '✔';
            status.className = 'choice-status complete';
        } else {
            status.textContent = '❗';
            status.className = 'choice-status incomplete';
        }
        
        // Update class data for save
        updateClassesDataForSave();
    };

    body.appendChild(sub);
}

/**
 * Refreshes ASI dropdown options to show current totals and disable abilities at max
 */
function refreshASIDropdowns(idBase, level, choiceKey) {
    const selA = document.getElementById(`${idBase}-secondary-A`);
    const selB = document.getElementById(`${idBase}-secondary-B`);
    
    if (!selA || !selB) return;
    
    // Store current selections
    const currentSelA = selA.value;
    const currentSelB = selB.value;
    
    // Update both dropdowns
    [{ select: selA, suffix: 'A', currentValue: currentSelA }, 
     { select: selB, suffix: 'B', currentValue: currentSelB }].forEach(({ select, suffix, currentValue }) => {
        
        // Clear existing options except the first placeholder
        while (select.options.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Re-add ability options with updated totals
        const abilities = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
        abilities.forEach(ability => {
            const baseScore = currentCharacter.abilities[ability] || 8;
            const currentBonus = currentCharacter.abilityBonuses?.[ability] || 0;
            const currentTotal = baseScore + currentBonus;
            
            // Check what the total would be if we selected this ability
            // If it's currently selected, the bonus is already included in currentTotal
            // If it's not currently selected, we need to check if adding +1 would exceed 20
            let wouldExceed20 = false;
            
            if (currentValue === ability) {
                // Already selected, so don't disable
                wouldExceed20 = false;
            } else {
                // Not currently selected, check if adding +1 would exceed 20
                wouldExceed20 = (currentTotal + 1) > 20;
            }
            
            const option = new Option(
                `${ability.charAt(0).toUpperCase() + ability.slice(1)} (${currentTotal}${wouldExceed20 ? ' - Max' : ''})`,
                ability
            );
            
            // Disable if would exceed 20 and not currently selected
            if (wouldExceed20) {
                option.disabled = true;
                option.style.color = '#999';
                option.style.fontStyle = 'italic';
            }
            
            select.appendChild(option);
        });
        
        // Always restore the current selection
        if (currentValue) {
            select.value = currentValue;
        }
    });
}

/**
 * Refreshes all ASI dropdowns on the page to reflect current ability score totals
 */
function refreshAllASIDropdowns() {
    // Find all ASI dropdowns by looking for secondary selects with A/B suffixes
    const asiSelects = document.querySelectorAll('select[id*="-secondary-"]');
    const processedPairs = new Set();
    
    asiSelects.forEach(select => {
        const id = select.id;
        // Extract the base id and level info from select ids like "choice-ASI-L4-secondary-A"
        const match = id.match(/choice-(.*)-L(\d+)-secondary-([AB])$/);
        if (match) {
            const safeChoiceKey = match[1];
            const level = match[2];
            const suffix = match[3];
            const idBase = `choice-${safeChoiceKey}-L${level}`;
            
            // Avoid processing the same pair twice
            if (processedPairs.has(idBase)) return;
            
            // Check if this is an ASI choice by looking for the other half
            const otherSuffix = suffix === 'A' ? 'B' : 'A';
            const otherSelect = document.getElementById(`${idBase}-secondary-${otherSuffix}`);
            
            if (otherSelect) {
                // This appears to be an ASI pair, refresh it
                // Convert safe choice key back to actual choice key
                let actualChoiceKey = safeChoiceKey;
                const choiceKeyMappings = {
                    'ASI': 'Ability Score Improvement',
                    'AbilityScoreImprovement': 'Ability Score Improvement'
                };
                if (choiceKeyMappings[safeChoiceKey]) {
                    actualChoiceKey = choiceKeyMappings[safeChoiceKey];
                }
                
                refreshASIDropdowns(idBase, level, actualChoiceKey);
                processedPairs.add(idBase);
            }
        }
    });
}

/**
 * Applies ability score bonuses from existing ASI choices
 * Call this when loading a character or updating class data
 */
function applyExistingASIBonuses() {
    if (!currentCharacter.choices) return;
    
    // First, clear all existing ASI bonuses to avoid double-application
    clearAllASIBonuses();
    
    Object.entries(currentCharacter.choices).forEach(([level, levelChoices]) => {
        if (typeof levelChoices === 'object' && levelChoices !== null && !isNaN(parseInt(level))) {
            Object.entries(levelChoices).forEach(([choiceKey, choiceValue]) => {
                // Check if this is an ASI choice
                if ((choiceKey.includes('ASI') || choiceKey === 'Ability Score Improvement') && 
                    Array.isArray(choiceValue) && choiceValue.length === 2) {
                    
                    // Apply bonuses for both selected abilities with unique sources
                    choiceValue.forEach((ability, index) => {
                        if (ability) {
                            const suffix = index === 0 ? 'A' : 'B';
                            const asiSource = `ASI Level ${level} ${suffix}`;
                            addAbilityBonus(ability, 1, asiSource);
                        }
                    });
                }
            });
        }
    });
    
    // Update the UI to reflect the applied bonuses
    updateAbilityTotalsUI();
}

/**
 * Clears all ASI-related ability bonuses
 */
function clearAllASIBonuses() {
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    abilities.forEach(ability => {
        if (currentCharacter.abilityBonusSources[ability]) {
            // Remove all bonuses that start with "ASI Level"
            currentCharacter.abilityBonusSources[ability] = currentCharacter.abilityBonusSources[ability].filter(
                bonus => !bonus.source.startsWith('ASI Level')
            );
        }
    });
    
    // Recalculate ability bonuses
    updateAbilityBonuses();
}

/**
 * Renders the Feat dropdown using featsData with duplicate prevention
 * @param {boolean} hideUnavailable - If true, removes unavailable feats entirely; if false, shows them grayed out
 */
function buildFeat(body, status, level, choiceKey, idBase, hideUnavailable = true) {
    const featSelect = document.createElement('select');
    featSelect.id = `${idBase}-secondary-feat`;
    featSelect.appendChild(new Option('-- pick a feat --','', true, true));

    // Create feat options array in the expected format
    if (featsData.feats && Array.isArray(featsData.feats)) {
        const featOptions = featsData.feats.map(feat => feat.name);
        const filteredFeats = hideUnavailable ? 
            getAvailableChoiceOptions(featOptions, 'Feats') :
            getAllChoiceOptionsWithStatus(featOptions, 'Feats');

        filteredFeats.forEach(featOption => {
            if (hideUnavailable || featOption.canSelect) {
                // Show available feats normally
                featSelect.appendChild(new Option(featOption.originalName, featOption.originalName));
            } else {
                // Show unavailable feats as disabled with indication
                const option = new Option(featOption.displayName, featOption.originalName);
                option.disabled = true;
                option.style.color = '#999';
                option.style.fontStyle = 'italic';
                featSelect.appendChild(option);
            }
        });
    }

    featSelect.onchange = () => {
        const selectedFeat = featSelect.value;
        
        // Clear any existing feat descriptions
        body.querySelectorAll('.feat-description').forEach(el => el.remove());
        
        // Initialize selectedFeats if it doesn't exist
        currentCharacter.selectedFeats = currentCharacter.selectedFeats || {};
        
        // Get the current choice to see if there was a previous feat selected
        const currentChoice = currentCharacter.choices[level] && currentCharacter.choices[level][choiceKey];
        if (currentChoice && currentChoice !== 'Feat' && currentChoice !== selectedFeat) {
            // Remove the previously selected feat
            delete currentCharacter.selectedFeats[currentChoice];
        }
        
        if (selectedFeat) {
            // Find the selected feat data
            const featData = featsData.feats.find(f => f.name === selectedFeat);
            if (featData) {
                // Store the feat data in the character
                currentCharacter.selectedFeats[selectedFeat] = featData;
            }
            
            // Save the actual feat name instead of just "Feat"
            handleChoiceSelection(level, choiceKey, selectedFeat, 'feat');
            status.textContent = '✔';
            status.className = 'choice-status complete';
            
            // Update class data for save
            updateClassesDataForSave();
            
            // Show feat description
            if (featData && featData.description) {
                const descDiv = document.createElement('div');
                descDiv.className = 'feat-description';
                descDiv.innerHTML = `<strong>${selectedFeat}:</strong> ${featData.description.join(' ')}`;
                body.appendChild(descDiv);
            }
        } else {
            // Remove any previously selected feat for this choice
            const currentChoice = currentCharacter.choices[level] && currentCharacter.choices[level][choiceKey];
            if (currentChoice && currentChoice !== 'Feat' && currentChoice !== '') {
                delete currentCharacter.selectedFeats[currentChoice];
            }
            
            // Clear the choice if no feat is selected
            handleChoiceSelection(level, choiceKey, '', 'feat');
            status.textContent = '❗';
            status.className = 'choice-status incomplete';
            
            // Update class data for save
            updateClassesDataForSave();
        }
    };

    body.appendChild(featSelect);
}

// Add all automatic features, each in its own <div>
function addAutomaticFeatures(parent, autoFeatures = {}, blockId) {
    Object.entries(autoFeatures).forEach(([name, detail], idx) => {
        const div = document.createElement('div');
        div.id = `${blockId}-autoFeature-${idx+1}`;
        div.classList.add('autoFeature');

        const title = document.createElement('strong');
        title.textContent = name + ': ';
        title.id = `${div.id}-title`;
        div.appendChild(title);

        div.appendChild(document.createTextNode(detail.description));
        parent.appendChild(div);
    });
}



// Display class selection
function displayClassSelection() {
    const classContainer = document.getElementById('classSelection');
    if (!classContainer) return;

    const classNames = Object.keys(classesData.classes).sort();
    classContainer.innerHTML = '<h3>Choose a Class</h3>';

    classNames.forEach(className => {
        const classInfo = getClassInfo(className);

        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.id = `classCard-${className}`;
        classCard.onclick = () => openClassModal(className);

        const nameEl = document.createElement('h4');
        nameEl.textContent = classInfo.name;

        const descriptionEl = document.createElement('p');
        const primaryAbilities = classInfo.primaryAbilities || classInfo.primaryAbility || [];
        const primaryText = Array.isArray(primaryAbilities) ? primaryAbilities.join(', ') : primaryAbilities;
        descriptionEl.textContent = `Hit Die: d${classInfo.hitDie} | Primary: ${primaryText}`;

        classCard.appendChild(nameEl);
        classCard.appendChild(descriptionEl);
        classContainer.appendChild(classCard);
    });
}


// —— Main Display Functions ——

// 1) Build the class-info section and level selector
function displayClassInfoSection(className) {
    clearElement('classInfoDisplay');
    document.getElementById('classInfoDisplay').classList.remove('hidden');

    const classInfo = getClassInfo(className);

    // Header with hit points display
    const headerContainer = document.createElement('div');
    headerContainer.className = 'class-header-container';
    
    // Content row - Class name and hit points
    const headerContent = document.createElement('div');
    headerContent.className = 'class-header-content';
    
    // Left side - Class name
    const header = document.createElement('h3');
    header.textContent = `Class: ${classInfo.name}`;
    header.id = 'currentClassName';
    headerContent.appendChild(header);
    
    // Right side - Hit points display
    const hitPointsContainer = document.createElement('div');
    hitPointsContainer.className = 'hit-points-container';
    
    const hitPointsLabel = document.createElement('div');
    hitPointsLabel.textContent = 'Hit Points:';
    hitPointsContainer.appendChild(hitPointsLabel);
    
    const hitPointsValue = document.createElement('div');
    hitPointsValue.id = 'hitPointsValue';
    hitPointsContainer.appendChild(hitPointsValue);
    
    const hitPointsBreakdown = document.createElement('div');
    hitPointsBreakdown.id = 'hitPointsBreakdown';
    hitPointsContainer.appendChild(hitPointsBreakdown);
    
    headerContent.appendChild(hitPointsContainer);
    headerContainer.appendChild(headerContent);

    // Level selector row
    const levelSelectorRow = document.createElement('div');
    levelSelectorRow.className = 'class-header-level-row';

    const levelLabel = document.createElement('label');
    levelLabel.setAttribute('for', 'levelDropdown');
    levelLabel.textContent = 'Choose Level: ';
    levelLabel.id = 'levelLabel';
    levelSelectorRow.appendChild(levelLabel);

    const dropdown = document.createElement('select');
    dropdown.id = 'levelDropdown';
    for (let i = 1; i <= 20; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Level ${i}`;
        opt.id = `option-level-${i}`;
        dropdown.appendChild(opt);
    }
    dropdown.onchange = () => updateLevelsDisplay(className, +dropdown.value);
    levelSelectorRow.appendChild(dropdown);
    
    // Add multiclass button
    const multiclassButton = document.createElement('button');
    multiclassButton.className = 'btn btn-secondary multiclass-button';
    multiclassButton.textContent = 'Add Another Class';
        multiclassButton.onclick = () => {
        // Convert to multiclass mode and immediately show class selection
        showAddClassModal();
    };
    levelSelectorRow.appendChild(multiclassButton);
    
    headerContainer.appendChild(levelSelectorRow);
    document.getElementById('classInfoDisplay').appendChild(headerContainer);

    // Details container
    const details = document.createElement('div');
    details.id = 'classLevelDetails';
    document.getElementById('classInfoDisplay').appendChild(details);

    // Clear out the class-selection list and hide the container
    const classSelection = document.getElementById('classSelection');
    if (classSelection) {
        clearElement('classSelection');
        classSelection.style.display = 'none';
    }

    setupLevelSelector(className);
    // Show level 1 by default: force an append of L1
    appendLevels(className, 1, 1);
    currentCharacter.level = 1;
    
    // Initialize level 1 hit points (always maximum)
    const classInfoForHP = getClassInfo(className);
    currentCharacter.rolledHitPoints[1] = classInfoForHP.hitDie;
    
    // Update hit points and render interface
    updateHitPoints();
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderRolledHitPointsInterface();
    }
    
    // Update class data for save
    updateClassesDataForSave();
}

// 2) Show *all* levels from 1 → selected
function updateLevelsDisplay(className, level) {
    clearElement('classLevelDetails');

    for (let lvl = 1; lvl <= level; lvl++) {
        renderOneLevel(className, lvl);
    }
    
    // Update hit points when levels change
    updateHitPoints();
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderRolledHitPointsInterface();
    }
}

// 3) Render just one level block
function renderOneLevel(className, level) {
    const classInfo = classesData.classes[className];
    const lvlData   = classInfo.levelProgression[level];
    const container = document.getElementById('classLevelDetails');

    // Check if level data exists
    if (!lvlData) {
        console.warn(`No level data found for ${className} level ${level}`);
        return;
    }

    // wrapper
    const wrapper = document.createElement('div');
    wrapper.id = `level-block-${level}`;

    // 1) CORE FEATURES — skip any feature that has a choice definition or is a generic placeholder
    const choiceKeys = Object.keys(lvlData.choices || {});
    (lvlData.features || [])
        .filter(featName => {
            const hasChoiceDefinition = choiceKeys.includes(featName);
            const isGenericSubclassPlaceholder = featName.includes("Martial Archetype feature") || 
                                                featName.includes("Archetype feature") ||
                                                featName.includes("feature feature");
            return !hasChoiceDefinition && !isGenericSubclassPlaceholder;
        })
        .forEach((feat, i) => {
            const desc = lvlData.automaticFeatures?.[feat]?.description || '';
            renderSimpleCard(
                wrapper,
                feat,
                desc || 'No description.',
                `feat-${level}-${i}`
            );
        });

    // 2) AUTOMATIC FEATURES not in features[] (comparing base names to avoid duplicates)
    Object.entries(lvlData.automaticFeatures || {})
        .filter(([name]) => {
            const baseName = getBaseFeatureName(name);
            const featuresBaseNames = (lvlData.features || []).map(f => getBaseFeatureName(f));
            return !featuresBaseNames.includes(baseName);
        })
        .forEach(([name, detail], i) => {
        renderSimpleCard(
            wrapper,
            name,
            detail.description,
            `auto-${level}-${i}`
        );
        });

        // 3) LEVEL 1 CHARACTER CREATION FEATURES (only for first level of first class)
    if (level === 1 && !currentCharacter.isMulticlassing) {
        renderLevel1CharacterCreation(wrapper, className);
    }

    // 4) CHOICES — only these produce their own cards now
    if (lvlData.choices) {
        Object.entries(lvlData.choices).forEach(([key, def]) => {
        renderChoices(wrapper, level, key, def);
        });
    }

     // 4) SUBCLASS FEATURES - FIXED VERSION
    if (level >= 3 && currentCharacter.subclass) {
        const scFeat = classInfo.subclasses[currentCharacter.subclass]?.features?.[level];
        if (scFeat) {
            // Get choice keys from subclass features to avoid duplicates
            const subclassChoiceKeys = Object.keys(scFeat.choices || {});
            
            // Process regular features first (skip those that have choices)
            (scFeat.features || []).forEach((feat, i) => {
                if (!subclassChoiceKeys.includes(feat)) {
                    const desc = scFeat.automaticFeatures?.[feat]?.description || '';
                    renderSimpleCard(
                        wrapper,
                        feat,
                        desc || 'No description.',
                        `sub-feat-${level}-${i}`
                    );
                }
            });
            
            // Process automatic features that aren't already in features[] (comparing base names)
            Object.entries(scFeat.automaticFeatures || {}).forEach(([name, detail], i) => {
                const baseName = getBaseFeatureName(name);
                const featuresBaseNames = (scFeat.features || []).map(f => getBaseFeatureName(f));
                if (!featuresBaseNames.includes(baseName)) {
                    renderSimpleCard(
                        wrapper,
                        name,
                        detail.description,
                        `sub-auto-${level}-${i}`
                    );
                }
            });
            
            // Process choices last
            if (scFeat.choices) {
                Object.entries(scFeat.choices).forEach(([key, def]) => {
                    renderChoices(wrapper, level, key, def);
                });
            }
        }
    }

    container.appendChild(wrapper);
}

/**
 * Renders level 1 character creation features (saving throws, skills, equipment)
 * Only shows for first level of first class (not multiclassing)
 */
function renderLevel1CharacterCreation(parent, className) {
    const classInfo = classesData.classes[className];
    console.log('renderLevel1CharacterCreation', className);
    // 1. Saving Throw Proficiencies
    if (classInfo.savingThrowProficiencies) {
        const { header, body } = renderSimpleCard(
            parent,
            "Saving Throw Proficiencies",
            `You are proficient in the following saving throws: ${classInfo.savingThrowProficiencies.join(', ')}`,
            "level1-saving-throws"
        );
        
        // Add the proficiencies to the character
        classInfo.savingThrowProficiencies.forEach(save => {
            currentCharacter.savingThrows[save.toLowerCase()] = true;
        });
    }
    
    // 2. Skill Proficiencies
    if (classInfo.skillOptions) {
        // Check if character is Human and gets an extra skill
        const isHuman = currentCharacter.race === "human";
        const extraSkillCount = isHuman ? 1 : 0;
        const totalSkillsToChoose = classInfo.skillOptions.choose + extraSkillCount;
        
        const { header, body } = renderSimpleCard(
            parent,
            `Skill Proficiencies (Choose ${totalSkillsToChoose})`,
            `Choose ${totalSkillsToChoose} skill(s) from the following list: ${classInfo.skillOptions.from.join(', ')}${isHuman ? ' (includes 1 extra skill from Human race)' : ''}`,
            "level1-skills"
        );
        
        // Create skill selection interface
        const skillContainer = document.createElement('div');
        skillContainer.className = 'skill-selection-container';
        
        const instruction = document.createElement('p');
        instruction.textContent = `Choose ${totalSkillsToChoose} skill(s):`;
        instruction.className = 'skill-instruction';
        skillContainer.appendChild(instruction);
        
        // Show already taken skills as warning, not blocking
        const takenSkills = getTakenSkills(classInfo.skillOptions.from);
        if (takenSkills.length > 0) {
            const takenDiv = document.createElement('div');
            takenDiv.className = 'taken-skills-warning';
            takenDiv.innerHTML = `<strong>Note:</strong> ${takenSkills.map(skill => 
                `${skill} (${getSkillSource(skill)})`
            ).join(', ')} are already taken. Selecting them again will duplicate the proficiency.`;
            skillContainer.appendChild(takenDiv);
        }
        
        // Get current class skill choices
        const choiceKey = 'class-skill-choice';
        const currentChoices = currentCharacter.choices[choiceKey] || [];
        const selectedSkills = [...currentChoices];
        const checkboxes = [];
        
        classInfo.skillOptions.from.forEach((skill, i) => {
            const skillDiv = document.createElement('div');
            skillDiv.className = 'skill-option';
            
            const isTaken = hasSkillProficiency(skill);
            const source = getSkillSource(skill);
            const isSelected = selectedSkills.includes(skill);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `skill-option-${i}`;
            checkbox.value = skill;
            checkbox.checked = isSelected;
            // Don't disable checkboxes - allow duplication
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = skill;
            
            if (isTaken && !isSelected) {
                skillDiv.classList.add('skill-taken');
                label.innerHTML = `${skill} <span class="skill-source">(from ${source})</span>`;
            }
            
            skillDiv.appendChild(checkbox);
            skillDiv.appendChild(label);
            skillContainer.appendChild(skillDiv);
            
            checkboxes.push(checkbox);
            
            // Add change listener
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (selectedSkills.length < totalSkillsToChoose) {
                        selectedSkills.push(skill);
                        addSkillProficiency(skill, `${classInfo.name} Class`);
                    } else {
                        checkbox.checked = false; // Prevent selecting more than allowed
                    }
                } else {
                    const index = selectedSkills.indexOf(skill);
                    if (index > -1) {
                        selectedSkills.splice(index, 1);
                        removeSkillProficiency(skill);
                    }
                }
                
                // Store the choices
                currentCharacter.choices[choiceKey] = [...selectedSkills];
                
                // Update status
                const status = header.querySelector('.choice-status');
                if (selectedSkills.length === totalSkillsToChoose) {
                    status.textContent = '✔';
                    status.className = 'choice-status complete';
                } else {
                    status.textContent = `❗ (${selectedSkills.length}/${totalSkillsToChoose})`;
                    status.className = 'choice-status incomplete';
                }
                
                // Update taken skills warning for this specific container
                const takenWarning = skillContainer.querySelector('.taken-skills-warning');
                if (takenWarning) {
                    const takenSkills = getTakenSkills(classInfo.skillOptions.from);
                    if (takenSkills.length > 0) {
                        takenWarning.innerHTML = `<strong>Note:</strong> ${takenSkills.map(skill => 
                            `${skill} (${getSkillSource(skill)})`
                        ).join(', ')} are already taken. Selecting them again will duplicate the proficiency.`;
                        takenWarning.style.display = 'block';
                    } else {
                        takenWarning.style.display = 'none';
                    }
                }
                
                // Update other skill displays without re-rendering
                updateSkillOptionDisplays();
            });
        });
        
        body.appendChild(skillContainer);
        
        // Add status indicator to header
        const status = document.createElement('span');
        status.className = 'choice-status incomplete';
        status.textContent = '❗';
        const title = header.querySelector('#level1-skills-title');
        header.insertBefore(status, title);

        // Set initial status based on saved choices
        if (selectedSkills.length === totalSkillsToChoose) {
            status.textContent = '✔';
            status.className = 'choice-status complete';
        } else if (selectedSkills.length > 0) {
            status.textContent = `❗ (${selectedSkills.length}/${totalSkillsToChoose})`;
            status.className = 'choice-status incomplete';
        }
    }
    
    // 3. Equipment Proficiencies
    if (classInfo.equipmentProficiencies) {
        const { header, body } = renderSimpleCard(
            parent,
            "Equipment Proficiencies",
            "You are proficient with the following equipment:",
            "level1-equipment"
        );
        
        const equipmentList = document.createElement('ul');
        equipmentList.className = 'equipment-list';
        
        if (classInfo.equipmentProficiencies.armor && classInfo.equipmentProficiencies.armor.length > 0) {
            const armorItem = document.createElement('li');
            armorItem.innerHTML = `<strong>Armor:</strong> ${classInfo.equipmentProficiencies.armor.join(', ')}`;
            equipmentList.appendChild(armorItem);
        }
        
        if (classInfo.equipmentProficiencies.weapons && classInfo.equipmentProficiencies.weapons.length > 0) {
            const weaponItem = document.createElement('li');
            weaponItem.innerHTML = `<strong>Weapons:</strong> ${classInfo.equipmentProficiencies.weapons.join(', ')}`;
            equipmentList.appendChild(weaponItem);
        }
        
        if (classInfo.equipmentProficiencies.tools && classInfo.equipmentProficiencies.tools.length > 0) {
            const toolItem = document.createElement('li');
            toolItem.innerHTML = `<strong>Tools:</strong> ${classInfo.equipmentProficiencies.tools.join(', ')}`;
            equipmentList.appendChild(toolItem);
        }
        
        if (classInfo.equipmentProficiencies.other && classInfo.equipmentProficiencies.other.length > 0) {
            const otherItem = document.createElement('li');
            otherItem.innerHTML = `<strong>Other:</strong> ${classInfo.equipmentProficiencies.other.join(', ')}`;
            equipmentList.appendChild(otherItem);
        }
        
        body.appendChild(equipmentList);
        
        // Store equipment proficiencies in character
        currentCharacter.equipmentProficiencies = classInfo.equipmentProficiencies;
    }
}

/**
 * Universal function to filter choice options and remove/mark duplicates
 * Works for ANY choice type by using the universal choice tracking system
 * @param {Array} options - Original choice options
 * @param {string} choiceKey - The choice key (e.g., 'Fighting Style', 'Maneuvers', 'Spells', etc.)
 * @param {boolean} removeUnavailable - If true, removes unavailable options entirely; if false, marks them as disabled
 * @returns {Array} Filtered options with unavailable items removed or marked
 */
function filterChoiceOptions(options, choiceKey, removeUnavailable = false) {
    if (!options) return [];
    
    const filteredOptions = options.map(option => {
        const name = typeof option === 'string' ? option : option.name;
        const canSelect = canSelectChoice(choiceKey, name);
        const reason = canSelect ? '' : ' (already taken)';
        
        // Return modified option object with availability info
        if (typeof option === 'string') {
            return {
                name: name,
                originalName: name,
                canSelect: canSelect,
                displayName: name + reason,
                isOriginalString: true,
                originalOption: option
            };
        } else {
            return {
                ...option,
                originalName: option.name,
                canSelect: canSelect,
                displayName: option.name + reason,
                isOriginalString: false,
                originalOption: option
            };
        }
    });
    
    // Filter out unavailable options if requested
    if (removeUnavailable) {
        return filteredOptions.filter(option => option.canSelect);
    }
    
    return filteredOptions;
}

/**
 * Gets available options for a choice (removes already selected items)
 * @param {Array} options - Original choice options
 * @param {string} choiceKey - The choice key
 * @returns {Array} Only the options that can still be selected
 */
function getAvailableChoiceOptions(options, choiceKey) {
    return filterChoiceOptions(options, choiceKey, true);
}

/**
 * Gets all options with unavailable ones marked as disabled
 * @param {Array} options - Original choice options
 * @param {string} choiceKey - The choice key
 * @returns {Array} All options with availability status
 */
function getAllChoiceOptionsWithStatus(options, choiceKey) {
    return filterChoiceOptions(options, choiceKey, false);
}

/**
 * Renders choice interface with universal duplicate prevention
 * Works for ANY choice type (spells, maneuvers, fighting styles, feats, etc.)
 * @param {boolean} hideUnavailable - If true, removes unavailable options; if false, shows them grayed out
 */
function renderChoices(parent, level, choiceKey, choiceDef, hideUnavailable = true) {
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
        buildPrimarySelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, hideUnavailable);
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

    // Build its primary select with universal filtering
    buildPrimarySelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, hideUnavailable);
}

/**
 * Builds the primary select with universal duplicate filtering
 * @param {boolean} hideUnavailable - If true, removes unavailable options; if false, shows them grayed out
 */
function buildPrimarySelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, hideUnavailable = true) {
    // remove previous primary selects
    body.querySelectorAll(`select[id^="${idBase}-primary"]`).forEach(n => n.remove());

    // Filter options for duplicates using universal system
    const filteredOptions = hideUnavailable ? 
        getAvailableChoiceOptions(choiceDef.options || [], choiceKey) :
        getAllChoiceOptionsWithStatus(choiceDef.options || [], choiceKey);

    // Check if this is a multiple choice selection
    if (choiceDef.choose > 1) {
        buildMultipleChoiceSelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, hideUnavailable);
    } else {
        buildSingleChoiceSelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, hideUnavailable);
    }
}

/**
 * Builds a single choice selection with universal filtering and visual feedback
 */
function buildSingleChoiceSelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, hideUnavailable = true) {
    const select = document.createElement('select');
    select.id = `${idBase}-primary`;
    select.appendChild(new Option('-- select --','', true, true));

    filteredOptions.forEach((opt, i) => {
        // For available options or when showing all options
        if (hideUnavailable || opt.canSelect) {
            const displayName = hideUnavailable ? opt.originalName : opt.displayName;
            const option = new Option(displayName, opt.originalName);
            
            if (!opt.canSelect) {
                option.disabled = true;
                option.className = 'disabled-option';
                option.style.textDecoration = 'line-through';
            }
            
            select.appendChild(option);
        }
    });

    // Check if there's a saved choice and restore it
    // Need to determine className for multiclass mode
    let className = null;
    if (currentCharacter.isMulticlassing || currentCharacter.classes.length > 0) {
        // Try to extract className from the idBase
        const classNameMatch = idBase.match(/multiclass-choice-([^-]+)-/);
        if (classNameMatch) {
            className = classNameMatch[1];
        } else {
            // For regular choices in multiclass mode, default to first class
            className = currentCharacter.classes[0]?.className;
        }
    }
    
    const savedChoice = getSavedChoiceValue(level, choiceKey, className);
    if (savedChoice && savedChoice !== '') {
        
        // Handle special cases where saved choice is an array or object
        let dropdownValue = savedChoice;
        
        // For ASI choices, if saved choice is an array, dropdown should show "ASI"
        if (Array.isArray(savedChoice) && choiceKey.includes('Ability Score')) {
            dropdownValue = 'ASI';
            console.log('Converting ASI array to dropdown value:', dropdownValue);
        }
        // For subclass choices, ensure the subclass name matches exactly
        else if (choiceKey.includes('Archetype') || choiceKey.includes('subclass')) {
            // savedChoice should be the subclass name - use it directly
            dropdownValue = savedChoice;
            console.log('Using single subclass choice directly:', dropdownValue);
        }
        // For other array choices (like multiple selections), use the first element or handle accordingly
        else if (Array.isArray(savedChoice)) {
            // For regular array choices, use the array directly (this shouldn't happen for single dropdowns)
            console.warn('Unexpected array for single choice:', savedChoice);
            dropdownValue = savedChoice[0] || '';
        }
        
        // Set the value
        select.value = dropdownValue;
        
        // Verify the value was set correctly
        if (select.value === dropdownValue) {
            console.log('✅ Successfully restored single choice:', dropdownValue, 'from saved:', savedChoice);
            

            status.textContent = '✔';
            status.className = 'choice-status complete';
            
            // Show description for restored choice (use dropdownValue for lookup)
            const originalOption = choiceDef.options.find(o => (o.name||o)===dropdownValue);
            if (originalOption?.description) {
                const p = document.createElement('p');
                p.id = `${idBase}-selectedDesc`;
                p.textContent = originalOption.description;
                body.appendChild(p);
            }
            
            // If this was an ASI choice, rebuild the ASI interface
            if (dropdownValue === 'ASI' && Array.isArray(savedChoice)) {
                console.log('Rebuilding ASI interface for restored choice');
                ['A','B'].forEach((suffix, idx) => {
                    buildASI(body, status, level, choiceKey, idBase, suffix, idx);
                });
            }
            // If this was a Feat choice, rebuild the feat interface
            else if (dropdownValue === 'Feat') {
                console.log('Rebuilding Feat interface for restored choice');
                buildFeat(body, status, level, choiceKey, idBase);
            }
        } else {
            console.error('❌ Failed to restore single choice:', {
                expected: dropdownValue,
                actual: select.value,
                originalSaved: savedChoice,
                availableOptions: Array.from(select.options).map(opt => opt.value)
            });
            
            // Try to find a matching option by checking all options
            const matchingOption = Array.from(select.options).find(opt => opt.value === dropdownValue);
            if (matchingOption) {
                matchingOption.selected = true;
                select.value = dropdownValue; // Force it
                console.log('✅ Fixed single choice by setting selected=true');
            } else {
                console.error('❌ No matching single option found for:', dropdownValue);
            }
        }
    }

    select.onchange = () => {
        // reset status & clear old secondaries/descs
        status.textContent = '❗';
        status.className = 'choice-status incomplete';
        body.querySelectorAll(`select[id^="${idBase}-secondary"]`).forEach(n => n.remove());
        body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());

        const choice = select.value;
        
        // Only proceed if a real choice was made and it's selectable
        if (choice && choice !== '') {
            // Validate that this choice can still be selected (double-check)
            if (!canSelectChoice(choiceKey, choice)) {
                // Reset selection if trying to select unavailable option
                select.value = '';
                alert(`${choice} is no longer available for selection.`);
                return;
            }
            
            handleChoiceSelection(level, choiceKey, choice, choiceDef.type, className);

                    if (choice === 'ASI') {
            // Initialize ASI choice as empty array instead of string
            currentCharacter.choices[level] = currentCharacter.choices[level] || {};
            currentCharacter.choices[level][choiceKey] = ['', ''];
            
            ['A','B'].forEach((suffix, idx) => {
                buildASI(body, status, level, choiceKey, idBase, suffix, idx);
            });

            } else if (choice === 'Feat') {
                buildFeat(body, status, level, choiceKey, idBase);

            } else {
                // single‑option description
                const originalOption = choiceDef.options.find(o => (o.name||o)===choice);
                if (originalOption?.description) {
                    const p = document.createElement('p');
                    p.id = `${idBase}-selectedDesc`;
                    p.textContent = originalOption.description;
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
 * Builds a multiple choice selection with universal filtering and visual feedback
 */
function buildMultipleChoiceSelectWithFiltering(body, status, choiceDef, level, choiceKey, idBase, filteredOptions, hideUnavailable = true) {
    // Check if we're refreshing an existing container and need to preserve current selections
    const existingContainer = document.getElementById(`${idBase}-multi-container`);
    let currentSelections = [];
    
    if (existingContainer) {
        // Extract current selections before rebuilding
        const checkedBoxes = existingContainer.querySelectorAll('input[type="checkbox"]:checked');
        currentSelections = Array.from(checkedBoxes).map(cb => cb.value);
    } else {
        // Load saved choices if no existing container
        // Need to determine className for multiclass mode
        let className = null;
        if (currentCharacter.isMulticlassing || currentCharacter.classes.length > 0) {
            // Try to extract className from the idBase
            const classNameMatch = idBase.match(/multiclass-choice-([^-]+)-/);
            if (classNameMatch) {
                className = classNameMatch[1];
            } else {
                // For regular choices in multiclass mode, default to first class
                className = currentCharacter.classes[0]?.className;
            }
        }
        
        const savedChoice = getSavedChoiceValue(level, choiceKey, className);
        if (savedChoice && Array.isArray(savedChoice)) {
            currentSelections = [...savedChoice];
        }
    }
    
    const container = document.createElement('div');
    container.id = `${idBase}-multi-container`;
    container.className = 'multi-choice-container';
    
    // Create instruction text
    const instruction = document.createElement('p');
    instruction.textContent = `Choose ${choiceDef.choose} option${choiceDef.choose > 1 ? 's' : ''}:`;
    instruction.className = 'multi-choice-instruction';
    container.appendChild(instruction);
    
    // Create checkboxes for each option
    const selectedChoices = [...currentSelections]; // Start with preserved selections
    const checkboxes = [];
    
    filteredOptions.forEach((opt, i) => {
        // Only show options if available or if we're showing all options
        if (hideUnavailable || opt.canSelect) {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-choice-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${idBase}-option-${i}`;
            checkbox.value = opt.originalName;
            checkbox.disabled = !opt.canSelect;
            
            // Restore checkbox state if it was previously selected
            checkbox.checked = currentSelections.includes(opt.originalName);
            
            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = hideUnavailable ? opt.originalName : opt.displayName;
            
            if (!opt.canSelect) {
                optionDiv.className += ' disabled-choice';
                label.className = 'disabled-option';
                label.style.color = '#666';
                label.style.fontStyle = 'italic';
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.5';
                label.style.backgroundColor = 'rgba(100, 100, 100, 0.1)';
                label.style.padding = '2px 4px';
                label.style.borderRadius = '3px';
                label.style.cursor = 'not-allowed';
            }
            
            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            container.appendChild(optionDiv);
            
            checkboxes.push(checkbox);
            
            // Add change listener
            checkbox.addEventListener('change', () => {
                // Double-check that this option can still be selected
                if (checkbox.checked && !canSelectChoice(choiceKey, opt.originalName)) {
                    checkbox.checked = false;
                    alert(`${opt.originalName} is no longer available for selection.`);
                    return;
                }
                
                if (checkbox.checked) {
                    if (selectedChoices.length < choiceDef.choose) {
                        selectedChoices.push(opt.originalName);
                    } else {
                        checkbox.checked = false; // Prevent selecting more than allowed
                    }
                } else {
                    const index = selectedChoices.indexOf(opt.originalName);
                    if (index > -1) {
                        selectedChoices.splice(index, 1);
                    }
                }
                
                // Always save current choices regardless of completion status
                // Need to determine className for multiclass mode (reuse logic from above)
                let choiceClassName = null;
                if (currentCharacter.isMulticlassing || currentCharacter.classes.length > 0) {
                    const classNameMatch = idBase.match(/multiclass-choice-([^-]+)-/);
                    if (classNameMatch) {
                        choiceClassName = classNameMatch[1];
                    } else {
                        choiceClassName = currentCharacter.classes[0]?.className;
                    }
                }
                handleChoiceSelection(level, choiceKey, selectedChoices, choiceDef.type, choiceClassName);
                
                // Update status and UI
                if (selectedChoices.length === choiceDef.choose) {
                    status.textContent = '✔';
                    status.className = 'choice-status complete';
                    
                    // Show descriptions for selected options
                    body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());
                    selectedChoices.forEach((choice, idx) => {
                        const originalOption = choiceDef.options.find(o => (o.name||o)===choice);
                        if (originalOption?.description) {
                            const p = document.createElement('p');
                            p.id = `${idBase}-selectedDesc-${idx}`;
                            p.className = 'multi-choice-description';
                            p.textContent = originalOption.description;
                            container.appendChild(p);
                        }
                    });
                } else {
                    status.textContent = `❗ (${selectedChoices.length}/${choiceDef.choose})`;
                    status.className = 'choice-status incomplete';
                    
                    // Clear descriptions when incomplete
                    body.querySelectorAll(`p[id^="${idBase}-selectedDesc"]`).forEach(n => n.remove());
                }
                
                // Trigger immediate refresh of other choice interfaces
                setTimeout(() => {
                    refreshChoiceInterfaces();
                }, 50);
            });
        }
    });
    
    // Remove existing container if it exists
    if (existingContainer) {
        existingContainer.remove();
    }
    
    body.appendChild(container);
    
    // Update status based on current selections
    // Count actually checked boxes to ensure accuracy
    const actuallyChecked = container.querySelectorAll('input[type="checkbox"]:checked').length;
    
    if (actuallyChecked === choiceDef.choose) {
        status.textContent = '✔';
        status.className = 'choice-status complete';
        
        // Show descriptions for selected options
        selectedChoices.forEach((choice, idx) => {
            const originalOption = choiceDef.options.find(o => (o.name||o)===choice);
            if (originalOption?.description) {
                const p = document.createElement('p');
                p.id = `${idBase}-selectedDesc-${idx}`;
                p.className = 'multi-choice-description';
                p.textContent = originalOption.description;
                container.appendChild(p);
            }
        });
    } else if (actuallyChecked > 0) {
        status.textContent = `❗ (${actuallyChecked}/${choiceDef.choose})`;
        status.className = 'choice-status incomplete';
    } else {
        status.textContent = '❗';
        status.className = 'choice-status incomplete';
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



function setupLevelSelector(className) {
    const dropdown = document.getElementById('levelDropdown');
    dropdown.onchange = () => handleLevelChange(className, +dropdown.value);
}

// Called when the user picks a new level
async function handleLevelChange(className, newLevel) {
    const oldLevel = currentCharacter.level;
    const dropdown = document.getElementById('levelDropdown');

    if (newLevel < oldLevel) {
        const ok = await showConfirm(
        `Drop from level ${oldLevel} down to ${newLevel}? This will remove choices above ${newLevel}.`
        );
        if (!ok) {
        dropdown.value = oldLevel;
        return;
        }
        removeLevelsAbove(oldLevel, newLevel);
    } else if (newLevel > oldLevel) {
        appendLevels(className, oldLevel + 1, newLevel);
    }

    currentCharacter.level = newLevel;
    
    // Keep classes array in sync if it exists (single-class mode)
    if (currentCharacter.classes.length === 1 && !currentCharacter.isMulticlassing) {
        currentCharacter.classes[0].level = newLevel;
        currentCharacter.totalLevel = newLevel;
    }
    
    updateDerivedStats();
    
    // Render rolled hit points interface if using rolled method
    if (currentCharacter.hitPointsCalculationMethod === 'rolled') {
        renderRolledHitPointsInterface();
    }
    
    // Apply existing ASI bonuses for the new level
    applyExistingASIBonuses();
    
    // Update class data for save
    updateClassesDataForSave();
    
    // Refresh choice interfaces to show proper duplicate states
    setTimeout(() => refreshChoiceInterfaces(), 100);
}

// Remove levels > newLevel from DOM and model
function removeLevelsAbove(oldLevel, newLevel) {
    for (let lvl = oldLevel; lvl > newLevel; lvl--) {
        // 1) Remove the entire level block
        const block = document.getElementById(`level-block-${lvl}`);
        if (block) block.remove();

        // 2) Prune stored choices for that level
        delete currentCharacter.choices[lvl];

        // 3) If we're removing level 3, clear subclass entirely
        if (lvl === 3) {
            currentCharacter.subclass = "";
            // Also remove any lingering subclass-card in the DOM
            const lvl3 = document.getElementById(`level-block-3`);
            if (lvl3) {
                const subCard = lvl3.querySelector(`[id^="subclass-3-card"]`);
                if (subCard) subCard.remove();
            }
        }
    }
}

// Append new level blocks one at a time
function appendLevels(className, from, to) {
    for (let lvl = from; lvl <= to; lvl++) {
        renderOneLevel(className, lvl);
    }
}


function getClassInfo(className) {
    return classesData.classes[className];
}











// Hit Points Calculation Functions

/**
 * Calculates the average hit points for a given hit die and level
 * @param {number} hitDie - The hit die size (e.g., 6, 8, 10, 12)
 * @param {number} level - The character level
 * @returns {number} - The average hit points rounded up
 */
function calculateAverageHitPoints(hitDie, level) {
    if (level === 1) {
        return getLevel1HitPoints(hitDie); // Level 1 is always maximum
    }
    
    const averageRoll = Math.ceil((hitDie + 1) / 2); // Average of 1dX rounded up
    return getLevel1HitPoints(hitDie) + (averageRoll * (level - 1)); // Level 1 max + average for levels 2+
}

/**
 * Gets the base hit points for level 1 (always maximum)
 * @param {number} hitDie - The hit die size
 * @returns {number} - Maximum hit points for level 1
 */
function getLevel1HitPoints(hitDie) {
    return hitDie; // Level 1 always gets max HP
}

/**
 * Gets the total hit points from rolled values
 * @param {Object} rolledHitPoints - Object containing rolled HP for each level
 * @param {number} hitDie - The hit die size
 * @returns {number} - Total rolled hit points
 */
function getTotalRolledHitPoints(rolledHitPoints, hitDie) {
    let total = 0;
    
    // Level 1 is always maximum
    total += getLevel1HitPoints(hitDie);
    
    // Add rolled values for levels 2+ (treat missing as 0)
    for (let level = 2; level <= currentCharacter.level; level++) {
        total += rolledHitPoints[level] || 0;
    }
    
    return total;
}

/**
 * Calculates hit points bonuses from various sources
 * @returns {Array} - Array of bonus objects with source and amount
 */
function calculateHitPointsBonuses() {
    const bonuses = [];
    
    // Use total level for multiclass or regular level for single class
    const totalCharacterLevel = currentCharacter.isMulticlassing ? currentCharacter.totalLevel : currentCharacter.level;
    
    // Constitution modifier bonus
    const conModifier = getModifier(getTotalAbilityScore('constitution'));
    if (conModifier !== 0) {
        bonuses.push({
            source: 'Constitution Modifier',
            amount: conModifier * totalCharacterLevel,
            description: `CON ${conModifier >= 0 ? '+' : ''}${conModifier} × ${totalCharacterLevel} levels`
        });
    }
    
    // Tough feat bonus
    if (currentCharacter.selectedFeats && currentCharacter.selectedFeats['Tough']) {
        bonuses.push({
            source: 'Tough Feat',
            amount: 2 * totalCharacterLevel,
            description: `+2 HP per level (${totalCharacterLevel} levels)`
        });
    }
    
    // Racial bonuses (e.g., Hill Dwarf)
    if (currentCharacter.race === 'dwarf' && currentCharacter.subrace === 'hill-dwarf') {
        bonuses.push({
            source: 'Hill Dwarf',
            amount: totalCharacterLevel,
            description: '+1 HP per level'
        });
    }
    
    // Class feature bonuses (e.g., Draconic Bloodline Sorcerer)
    if (currentCharacter.class === 'sorcerer' && currentCharacter.subclass === 'draconic-bloodline') {
        bonuses.push({
            source: 'Draconic Bloodline',
            amount: totalCharacterLevel,
            description: '+1 HP per level'
        });
    }
    
    // Add any other bonuses from traits/features
    // This can be expanded based on other features that grant HP bonuses
    
    // Check for SharedScript type bonuses (HitPoints category)
    const sharedScriptBonuses = getSharedScriptHitPointsBonuses();
    bonuses.push(...sharedScriptBonuses);
    
    return bonuses;
}

/**
 * Updates the hit points display and calculations
 */
function updateHitPoints() {
    if (!currentCharacter.class) return;
    
    const classInfo = getClassInfo(currentCharacter.class);
    const hitDie = classInfo.hitDie;
    const level = currentCharacter.level;
    
    let baseHitPoints = 0;
    
    if (currentCharacter.hitPointsCalculationMethod === 'average') {
        // Calculate average hit points
        baseHitPoints = calculateAverageHitPoints(hitDie, level);
    } else {
        // Use rolled hit points (level 1 is always max, missing levels are 0)
        baseHitPoints = getTotalRolledHitPoints(currentCharacter.rolledHitPoints, hitDie);
    }
    
    // Calculate bonuses
    const bonuses = calculateHitPointsBonuses();
    const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    
    // Set the true hit points (base + bonuses)
    currentCharacter.trueHitPoints = baseHitPoints + totalBonus;
    currentCharacter.hitPoints = currentCharacter.trueHitPoints;
    currentCharacter.hitPointsBonuses = bonuses;
    
    // Update the display
    updateHitPointsDisplay();
}

/**
 * Updates the hit points display in the class section
 */
function updateHitPointsDisplay() {
    const hitPointsValue = document.getElementById('hitPointsValue');
    const hitPointsBreakdown = document.getElementById('hitPointsBreakdown');
    
    if (!hitPointsValue || !hitPointsBreakdown) return;
    
    const classInfo = getClassInfo(currentCharacter.class);
    const hitDie = classInfo.hitDie;
    const level = currentCharacter.level;
    
    // Update the main value
    hitPointsValue.textContent = currentCharacter.trueHitPoints;
    
    // Create breakdown text
    let breakdownText = '';
    
    if (currentCharacter.hitPointsCalculationMethod === 'average') {
        const averageRoll = Math.ceil((hitDie + 1) / 2);
        if (level === 1) {
            breakdownText = `Base: Level 1 max = ${hitDie}`;
        } else {
            breakdownText = `Base: Level 1 max (${hitDie}) + Average (${averageRoll} × ${level - 1}) = ${hitDie + (averageRoll * (level - 1))}`;
        }
    } else {
        const rolledTotal = getTotalRolledHitPoints(currentCharacter.rolledHitPoints, hitDie);
        if (level === 1) {
            breakdownText = `Rolled: Level 1 max = ${hitDie}`;
        } else {
            breakdownText = `Rolled: Level 1 max (${hitDie}) + Levels 2-${level} (${rolledTotal - hitDie}) = ${rolledTotal}`;
        }
    }
    
    // Add bonus information
    if (currentCharacter.hitPointsBonuses.length > 0) {
        const bonusTotal = currentCharacter.hitPointsBonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
        breakdownText += ` | Bonuses: +${bonusTotal}`;
    }
    
    hitPointsBreakdown.textContent = breakdownText;
}

/**
 * Renders the rolled hit points input interface
 * This should be called when the user selects "rolled" method
 */
function renderRolledHitPointsInterface() {
    if (currentCharacter.hitPointsCalculationMethod !== 'rolled') return;
    
    // Use multiclass interface if in multiclass mode
    if (currentCharacter.isMulticlassing) {
        renderMulticlassRolledHitPointsInterface();
        return;
    }
    
    const classInfo = getClassInfo(currentCharacter.class);
    const hitDie = classInfo.hitDie;
    const level = currentCharacter.level;
    
    // Create or update the rolled HP interface
    let rolledContainer = document.getElementById('rolledHitPointsContainer');
    if (!rolledContainer) {
        rolledContainer = document.createElement('div');
        rolledContainer.id = 'rolledHitPointsContainer';
        rolledContainer.className = 'rolled-hit-points-container';
        
        const title = document.createElement('h4');
        title.textContent = 'Rolled Hit Points';
        title.onclick = toggleRolledHitPointsCollapse;
        rolledContainer.appendChild(title);
        
        // Create collapsible content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'rolled-hit-points-content';
        contentContainer.id = 'rolledHitPointsContent';
        
        const description = document.createElement('p');
        description.textContent = `Enter your rolled hit points for each level (d${hitDie}). Level 1 is always maximum (${hitDie}). Empty fields count as 0.`;
        contentContainer.appendChild(description);
        
        // Add roll button and roll count display
        const rollControls = document.createElement('div');
        rollControls.className = 'hp-roll-controls';
        
        const rollButton = document.createElement('button');
        rollButton.textContent = `Roll d${hitDie}`;
        rollButton.className = 'btn btn-primary';
        rollButton.onclick = rollHitPoints;
        rollControls.appendChild(rollButton);
        
        const rollCountDisplay = document.createElement('div');
        rollCountDisplay.id = 'hpRollCount';
        rollCountDisplay.className = 'hp-roll-count';
        rollCountDisplay.textContent = `Rolls: ${currentCharacter.hitPointsRollCount}`;
        rollControls.appendChild(rollCountDisplay);
        
        contentContainer.appendChild(rollControls);
        
        // Create inputs container
        const inputsContainer = document.createElement('div');
        inputsContainer.id = 'rolledHitPointsInputs';
        contentContainer.appendChild(inputsContainer);
        
        rolledContainer.appendChild(contentContainer);
        
        // Add to the appropriate container based on single-class vs multiclass mode
        const classInfoDisplay = document.getElementById('classInfoDisplay');
        
        if (currentCharacter.isMulticlassing) {
            // In multiclass mode, add to the multiclass header container
            const multiclassHeaderContainer = document.querySelector('.multiclass-header-container');
            if (multiclassHeaderContainer) {
                // Insert after the multiclass header
                if (multiclassHeaderContainer.nextSibling) {
                    multiclassHeaderContainer.parentNode.insertBefore(rolledContainer, multiclassHeaderContainer.nextSibling);
                } else {
                    multiclassHeaderContainer.parentNode.appendChild(rolledContainer);
                }
            } else if (classInfoDisplay) {
                // Fallback: add to classInfoDisplay if multiclass header not found
                classInfoDisplay.appendChild(rolledContainer);
            }
        } else {
            // In single-class mode, use the original logic
            const headerContainer = document.querySelector('.class-header-container');
            if (classInfoDisplay && headerContainer) {
                // Insert right after the header container
                if (headerContainer.nextSibling) {
                    classInfoDisplay.insertBefore(rolledContainer, headerContainer.nextSibling);
                } else {
                    classInfoDisplay.appendChild(rolledContainer);
                }
            } else if (classInfoDisplay) {
                // Fallback: add to classInfoDisplay if header not found
                classInfoDisplay.appendChild(rolledContainer);
            }
        }
    }
    
    // Update the inputs
    const inputsContainer = document.getElementById('rolledHitPointsInputs');
    inputsContainer.innerHTML = '';
    
    for (let lvl = 1; lvl <= level; lvl++) {
        const inputGroup = document.createElement('div');
        
        const label = document.createElement('label');
        label.textContent = `Level ${lvl}`;
        inputGroup.appendChild(label);
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 1;
        input.max = hitDie;
        
        if (lvl === 1) {
            // Level 1 is always maximum and read-only
            input.value = hitDie;
            input.disabled = true;
            input.title = 'Level 1 is always maximum hit points';
        } else {
            // Levels 2+ can be rolled
            input.value = currentCharacter.rolledHitPoints[lvl] || '';
            
            input.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= hitDie) {
                    currentCharacter.rolledHitPoints[lvl] = value;
                    updateHitPoints();
                    // Check if all levels are now filled
                    checkAndUpdateRollButton();
                } else {
                    e.target.value = '';
                    delete currentCharacter.rolledHitPoints[lvl];
                    updateHitPoints();
                    // Check if button should be enabled
                    checkAndUpdateRollButton();
                }
            });
        }
        
        inputGroup.appendChild(input);
        
        // Add dice display for levels that already have rolls
        if (lvl > 1 && currentCharacter.rolledHitPoints[lvl]) {
            const diceContainer = document.createElement('div');
            diceContainer.className = 'dice-container';
            
            const dieElement = document.createElement('div');
            dieElement.className = `die d${hitDie}`;
            dieElement.textContent = currentCharacter.rolledHitPoints[lvl];
            
            const dieLabel = document.createElement('div');
            dieLabel.className = 'score-label';
            dieLabel.textContent = `d${hitDie}`;
            
            diceContainer.appendChild(dieElement);
            diceContainer.appendChild(dieLabel);
            inputGroup.appendChild(diceContainer);
        }
        
        inputsContainer.appendChild(inputGroup);
    }
    
    // Update roll count display
    const rollCountDisplay = document.getElementById('hpRollCount');
    if (rollCountDisplay) {
        rollCountDisplay.textContent = `Rolls: ${currentCharacter.hitPointsRollCount}`;
    }
    
    // Check if all levels have been rolled and update button state
    checkAndUpdateRollButton();
}

/**
 * Checks if all hit dice have been rolled and updates the roll button state
 */
function checkAndUpdateRollButton() {
    const level = currentCharacter.level;
    const rollButton = document.querySelector('.hp-roll-controls .btn-primary');
    if (!rollButton) return;
    
    // Check if all levels have rolls (except level 1 which is always max)
    let allRolled = true;
    for (let lvl = 2; lvl <= level; lvl++) {
        if (!currentCharacter.rolledHitPoints[lvl]) {
            allRolled = false;
            break;
        }
    }
    
    // Disable button if all have been rolled
    rollButton.disabled = allRolled;
}

/**
 * Rolls hit points for a random level and tracks the roll count
 */
function rollHitPoints() {
    // Play dice rolling sound
    playDiceRollSound();
    
    const classInfo = getClassInfo(currentCharacter.class);
    const hitDie = classInfo.hitDie;
    const level = currentCharacter.level;
    
    // Find the next level that needs rolling (not level 1 and not already rolled)
    let nextLevelToRoll = null;
    for (let lvl = 2; lvl <= level; lvl++) {
        if (!currentCharacter.rolledHitPoints[lvl]) {
            nextLevelToRoll = lvl;
            break;
        }
    }
    
    if (nextLevelToRoll === null) {
        alert('All levels have been rolled!');
        return;
    }
    
    // Roll the die
    let roll = Math.floor(Math.random() * hitDie) + 1;
    let wasRerolled = false;
    
    // Implement reroll ones if enabled
    if (currentCharacter.rerollOnesHitDice && roll === 1) {
        wasRerolled = true;
        roll = Math.floor(Math.random() * hitDie) + 1;
    }
    
    // Store the roll
    currentCharacter.rolledHitPoints[nextLevelToRoll] = roll;
    
    // Increment roll count
    currentCharacter.hitPointsRollCount++;
    
    // Update the interface
    renderRolledHitPointsInterface();
    updateHitPoints();
    
    // Display animated dice next to the input
    displayDiceAnimation(nextLevelToRoll, roll, hitDie, wasRerolled);
    
    // Check if all levels have been rolled and disable button if needed
    checkAndUpdateRollButton();
}

/**
 * Displays an animated dice with the roll result next to the input box
 * @param {number} level - The character level for this roll
 * @param {number} roll - The dice roll result
 * @param {number} hitDie - The hit die size (e.g., 6, 8, 10, 12)
 * @param {boolean} wasRerolled - Whether this roll was a result of rerolling a 1
 */
function displayDiceAnimation(level, roll, hitDie, wasRerolled = false) {
    // Find the input group for this level
    const inputGroups = document.querySelectorAll('#rolledHitPointsInputs > div');
    const targetGroup = Array.from(inputGroups).find(group => {
        const label = group.querySelector('label');
        return label && label.textContent === `Level ${level}`;
    });
    
    if (!targetGroup) return;
    
    // Create dice container
    let diceContainer = targetGroup.querySelector('.dice-container');
    if (!diceContainer) {
        diceContainer = document.createElement('div');
        diceContainer.className = 'dice-container';
        targetGroup.appendChild(diceContainer);
    } else {
        // Clear existing dice
        diceContainer.innerHTML = '';
    }
    
    // Create animated die
    const dieElement = document.createElement('div');
    dieElement.className = `die d${hitDie}`; // Add class based on die type
    dieElement.textContent = roll;
    
    // Add die type label
    const dieLabel = document.createElement('div');
    dieLabel.className = 'score-label';
    dieLabel.textContent = `d${hitDie}`;
    
    // Add to container
    diceContainer.appendChild(dieElement);
    diceContainer.appendChild(dieLabel);
    
    // Add reroll indicator if rerolled
    if (wasRerolled) {
        const rerollIndicator = document.createElement('div');
        rerollIndicator.className = 'reroll-indicator';
        rerollIndicator.textContent = 'Rerolled';
        diceContainer.appendChild(rerollIndicator);
    }
}














// ========== UNIVERSAL DUPLICATE PREVENTION SYSTEM ==========

/**
 * Gets all currently selected choices across all levels and choice types
 * @param {string} choiceType - Optional filter for specific choice types
 * @returns {Object} Object mapping choice keys to arrays of selected values
 */
function getAllSelectedChoices(choiceType = null) {
    const selectedChoices = {};
    
    if (currentCharacter.choices) {
        Object.values(currentCharacter.choices).forEach(levelChoices => {
            if (typeof levelChoices === 'object' && levelChoices !== null) {
                Object.entries(levelChoices).forEach(([choiceKey, choiceValue]) => {
                    // Filter by choice type if specified
                    if (choiceType && choiceKey !== choiceType && !choiceKey.includes(choiceType)) {
                        return;
                    }
                    
                    if (!selectedChoices[choiceKey]) {
                        selectedChoices[choiceKey] = [];
                    }
                    
                    if (Array.isArray(choiceValue)) {
                        selectedChoices[choiceKey].push(...choiceValue);
                    } else if (choiceValue && choiceValue !== '' && choiceValue !== 'Feat') {
                        selectedChoices[choiceKey].push(choiceValue);
                    }
                });
            }
        });
    }
    
    // Add feat selections from selectedFeats object
    if (currentCharacter.selectedFeats) {
        Object.keys(currentCharacter.selectedFeats).forEach(featName => {
            if (!selectedChoices['Feats']) {
                selectedChoices['Feats'] = [];
            }
            selectedChoices['Feats'].push(featName);
        });
    }
    
    // Remove duplicates from each choice type
    Object.keys(selectedChoices).forEach(key => {
        selectedChoices[key] = [...new Set(selectedChoices[key])];
    });
    
    return selectedChoices;
}

/**
 * Gets all selected values for a specific choice key or type
 * @param {string} choiceKey - The choice key (e.g., 'Fighting Style', 'Maneuvers')
 * @returns {Array} Array of selected values for this choice type
 */
function getSelectedForChoiceType(choiceKey) {
    const allChoices = getAllSelectedChoices();
    const selectedValues = [];
    
    // Look for exact matches and partial matches
    Object.entries(allChoices).forEach(([key, values]) => {
        // Handle specific related choice types
        const isManeuverChoice = (choiceKey.includes('Maneuver') && key.includes('Maneuver')) ||
                                (choiceKey === 'Maneuvers' && key === 'Additional Maneuvers') ||
                                (choiceKey === 'Additional Maneuvers' && key === 'Maneuvers');
        
        const isFightingStyleChoice = (choiceKey.includes('Fighting Style') && key.includes('Fighting Style')) ||
                                     (choiceKey === 'Fighting Style' && key === 'Additional Fighting Style') ||
                                     (choiceKey === 'Additional Fighting Style' && key === 'Fighting Style');
        
        const isFeatChoice = choiceKey === 'Feats' && (key.includes('ASI') || key === 'Ability Score Improvement');
        
        if (key === choiceKey || 
            key.includes(choiceKey) || 
            choiceKey.includes(key) ||
            isManeuverChoice ||
            isFightingStyleChoice ||
            isFeatChoice) {
            selectedValues.push(...values);
        }
    });
    
    // Special handling for feats
    if (choiceKey === 'Feats' || choiceKey.includes('Feat')) {
        if (allChoices['Feats']) {
            selectedValues.push(...allChoices['Feats']);
        }
    }
    
    return [...new Set(selectedValues)]; // Remove duplicates
}

/**
 * Universal function to check if a choice can be selected
 * @param {string} choiceKey - The choice key (e.g., 'Fighting Style', 'Maneuvers', 'Feats')
 * @param {string} optionName - The name of the option to check
 * @returns {boolean} True if the option can be selected
 */
function canSelectChoice(choiceKey, optionName) {
    
    // Special handling for ASI choices - allow multiple selections across different levels
    // ASI choices have their own validation (20-point limit) built into the interface
    if (choiceKey.includes('ASI') || choiceKey === 'Ability Score Improvement') {
        return true; // ASI choices are validated by the 20-point limit, not duplicate prevention
    }
    
    // Special handling for feats that allow multiple selections
    if (choiceKey === 'Feats' || choiceKey.includes('Feat')) {
        const selectedFeats = getSelectedForChoiceType('Feats');
        
        // If not already selected, can select
        if (!selectedFeats.includes(optionName)) {
            return true;
        }
        
        // Check if this feat allows multiple selections
        const featData = featsData.feats && featsData.feats.find(f => f.name === optionName);
        return featData && featData.multiple === true;
    }
    
    // For all other choice types, no duplicates allowed
    const selectedValues = getSelectedForChoiceType(choiceKey);
    const canSelect = !selectedValues.includes(optionName);
    return canSelect;
}

/**
 * Legacy compatibility functions (maintained for existing code)
 */
function getSelectedFeats() {
    return getSelectedForChoiceType('Feats');
}

function getSelectedFightingStyles() {
    return getSelectedForChoiceType('Fighting Style');
}

function getSelectedManeuvers() {
    return getSelectedForChoiceType('Maneuvers');
}

function canSelectFeat(featName) {
    return canSelectChoice('Feats', featName);
}

function canSelectFightingStyle(styleName) {
    return canSelectChoice('Fighting Style', styleName);
}

function canSelectManeuver(maneuverName) {
    return canSelectChoice('Maneuvers', maneuverName);
}

// ========== CLASS DATA SAVING SYSTEM ==========

/**
 * Validates if character has a class selected
 */
function validateClassData() {
    if (!currentCharacter.class) {
        return false;
    }
    return true;
}

/**
 * Fetches class data from the loaded classesData
 */
function getClassDataFromLoaded(classKey) {
    const classInfo = classesData.classes && classesData.classes[classKey];
    
    if (!classInfo) {
        console.error(`Class "${classKey}" not found in loaded classes data`);
        return null;
    }
    
    return classInfo;
}

/**
 * Builds the initial class data structure
 */
function buildClassDataStructure(classInfo, subclassKey) {
    return {
        "group-title": "Class Features",
        "group-chevron": false,
        "traits": [],
        "basicInfo": {
            "className": classInfo.name,
            "hitDie": classInfo.hitDie,
            "level": currentCharacter.level,
            "subclassName": subclassKey && classInfo.subclasses && classInfo.subclasses[subclassKey] ? classInfo.subclasses[subclassKey].name : null,
            "primaryAbilities": classInfo.primaryAbilities || [],
            "savingThrowProficiencies": classInfo.savingThrowProficiencies || []
        },
        "hitPoints": {
            "current": currentCharacter.hitPoints,
            "maximum": currentCharacter.trueHitPoints,
            "calculationMethod": currentCharacter.hitPointsCalculationMethod,
            "rolledValues": currentCharacter.rolledHitPoints || {},
            "bonuses": currentCharacter.hitPointsBonuses || []
        },
        "skillProficiencies": [],
        "equipmentProficiencies": classInfo.equipmentProficiencies || {}
    };
}

/**
 * Adds level progression features to class data with consolidation for scaling features
 */
function addLevelProgressionFeatures(currentClassData, classInfo) {
    const featureTracker = new Map(); // Track features by base name to consolidate scaling versions
    
    for (let level = 1; level <= currentCharacter.level; level++) {
        const levelData = classInfo.levelProgression && classInfo.levelProgression[level.toString()];
        if (!levelData) continue;
        
        // Add automatic features as traits
        if (levelData.automaticFeatures) {
            Object.entries(levelData.automaticFeatures).forEach(([featureName, featureData]) => {
                // Extract base feature name (remove scaling indicators)
                const baseFeatureName = getBaseFeatureName(featureName);
                
                // Extract bonus information if present
                let adjustmentCategory = "None";
                let adjustmentSubCategory = "";
                let adjustmentValue = "0";
                let adjustmentAbility = "NONE";
                
                if (featureData.bonus) {
                    adjustmentCategory = featureData.bonus.adjustmentCategory || "None";
                    adjustmentSubCategory = featureData.bonus.adjustmentSubCategory || "";
                    adjustmentValue = featureData.bonus.adjustmentValue ? featureData.bonus.adjustmentValue.toString() : "0";
                    adjustmentAbility = featureData.bonus.adjustmentAbility || "NONE";
                }
                
                const currentUses = featureData.usesByLevel ? getUsesForLevel(featureData.usesByLevel, level) : "0";
                const resetType = featureData.usesByLevel ? getResetTypeForLevel(featureData.usesByLevel, level) : "none";
                
                // Check if we already have this base feature
                if (featureTracker.has(baseFeatureName)) {
                    const existing = featureTracker.get(baseFeatureName);
                    // Update with higher level version if this has more uses or is a later level
                    if ((currentUses !== "0" && (existing.numberOfUses === "0" || parseInt(currentUses) > parseInt(existing.numberOfUses))) || level > existing.level) {
                        existing.numberOfUses = currentUses;
                        existing.resetType = resetType;
                        existing.level = level;
                        existing.traitDescription = featureData.description || "";
                        // Keep the latest bonus info
                        existing.adjustmentCategory = adjustmentCategory;
                        existing.adjustmentSubCategory = adjustmentSubCategory;
                        existing.adjustmentValue = adjustmentValue;
                        existing.adjustmentAbility = adjustmentAbility;
                    }
                } else {
                    // Add new feature
                    featureTracker.set(baseFeatureName, {
                        "traitName": `${baseFeatureName} (Level ${level})`,
                        "cheveron": false,
                        "traitDescription": featureData.description || "",
                        "checkboxStates": [],
                        "numberOfUses": currentUses,
                        "adjustmentCategory": adjustmentCategory,
                        "adjustmentSubCategory": adjustmentSubCategory,
                        "adjustmentAbility": adjustmentAbility,
                        "adjustmentValue": adjustmentValue,
                        "resetType": resetType,
                        "level": level
                    });
                }
            });
        }
        
        // Add features that don't have automatic descriptions AND don't have choice definitions
        if (levelData.features) {
            levelData.features.forEach(featureName => {
                const hasAutomaticFeature = levelData.automaticFeatures && levelData.automaticFeatures[featureName];
                const hasChoiceDefinition = levelData.choices && levelData.choices[featureName];
                const isGenericSubclassPlaceholder = featureName.includes("Martial Archetype feature") || 
                                                    featureName.includes("Archetype feature") ||
                                                    featureName.includes("feature feature"); // Catch malformed descriptions
                
                if (!hasAutomaticFeature && !hasChoiceDefinition && !isGenericSubclassPlaceholder) {
                    const baseFeatureName = getBaseFeatureName(featureName);
                    
                    if (!featureTracker.has(baseFeatureName)) {
                        featureTracker.set(baseFeatureName, {
                            "traitName": `${featureName} (Level ${level})`,
                            "cheveron": false,
                            "traitDescription": `${featureName} feature gained at level ${level}.`,
                            "checkboxStates": [],
                            "numberOfUses": "0",
                            "adjustmentCategory": "None",
                            "adjustmentSubCategory": "",
                            "adjustmentAbility": "NONE",
                            "adjustmentValue": "0",
                            "resetType": "none",
                            "level": level
                        });
                    }
                }
            });
        }
    }
    
    // Add all consolidated features to traits
    featureTracker.forEach(feature => {
        // Remove the level property before adding to traits
        delete feature.level;
        currentClassData.traits.push(feature);
    });
}

/**
 * Gets the base feature name by removing scaling indicators
 */
function getBaseFeatureName(featureName) {
    return featureName
        .replace(/\s*\(two uses\)/gi, '') // Remove "two uses"
        .replace(/\s*\(three uses\)/gi, '') // Remove "three uses"  
        .replace(/\s*\(\d+\)/g, '') // Remove numbers in parentheses like (2), (3)
        .replace(/\s*\(.*?\susages?\)/gi, '') // Remove usage indicators
        .trim();
}

/**
 * Gets the number of uses for a feature at a specific level
 */
function getUsesForLevel(usesByLevel, level) {
    let uses = "0";
    Object.entries(usesByLevel).forEach(([levelThreshold, data]) => {
        if (level >= parseInt(levelThreshold)) {
            uses = data.maxUses === "unlimited" ? "unlimited" : data.maxUses.toString();
        }
    });
    return uses;
}

/**
 * Gets the reset type for a feature at a specific level
 */
function getResetTypeForLevel(usesByLevel, level) {
    let resetType = "none";
    Object.entries(usesByLevel).forEach(([levelThreshold, data]) => {
        if (level >= parseInt(levelThreshold)) {
            resetType = data.resetType || "none";
        }
    });
    return resetType;
}

/**
 * Adds subclass features to class data with consolidation for scaling features
 */
function addSubclassFeatures(currentClassData, classInfo, subclassKey) {
    if (!subclassKey || !classInfo.subclasses || !classInfo.subclasses[subclassKey]) return;
    
    const subclassInfo = classInfo.subclasses[subclassKey];
    const subclassFeatureTracker = new Map(); // Track subclass features by base name
    
    for (let level = 1; level <= currentCharacter.level; level++) {
        const subclassLevelData = subclassInfo.features && subclassInfo.features[level.toString()];
        if (!subclassLevelData) continue;
        
        // Add subclass automatic features as traits
        if (subclassLevelData.automaticFeatures) {
            Object.entries(subclassLevelData.automaticFeatures).forEach(([featureName, featureData]) => {
                // Extract base feature name (remove scaling indicators)
                const baseFeatureName = getBaseFeatureName(featureName);
                
                // Extract bonus information if present
                let adjustmentCategory = "None";
                let adjustmentSubCategory = "";
                let adjustmentValue = "0";
                let adjustmentAbility = "NONE";
                
                if (featureData.bonus) {
                    adjustmentCategory = featureData.bonus.adjustmentCategory || "None";
                    adjustmentSubCategory = featureData.bonus.adjustmentSubCategory || "";
                    adjustmentValue = featureData.bonus.adjustmentValue ? featureData.bonus.adjustmentValue.toString() : "0";
                    adjustmentAbility = featureData.bonus.adjustmentAbility || "NONE";
                }
                
                const currentUses = featureData.usesByLevel ? getUsesForLevel(featureData.usesByLevel, level) : "0";
                const resetType = featureData.usesByLevel ? getResetTypeForLevel(featureData.usesByLevel, level) : "none";
                
                // Check if we already have this base feature
                if (subclassFeatureTracker.has(baseFeatureName)) {
                    const existing = subclassFeatureTracker.get(baseFeatureName);
                    // Update with higher level version if this has more uses or is a later level
                    if ((currentUses !== "0" && (existing.numberOfUses === "0" || parseInt(currentUses) > parseInt(existing.numberOfUses))) || level > existing.level) {
                        existing.numberOfUses = currentUses;
                        existing.resetType = resetType;
                        existing.level = level;
                        existing.traitDescription = featureData.description || "";
                        // Keep the latest bonus info
                        existing.adjustmentCategory = adjustmentCategory;
                        existing.adjustmentSubCategory = adjustmentSubCategory;
                        existing.adjustmentValue = adjustmentValue;
                        existing.adjustmentAbility = adjustmentAbility;
                    }
                } else {
                    // Add new feature
                    subclassFeatureTracker.set(baseFeatureName, {
                        "traitName": `${baseFeatureName} (${subclassInfo.name}, Level ${level})`,
                        "cheveron": false,
                        "traitDescription": featureData.description || "",
                        "checkboxStates": [],
                        "numberOfUses": currentUses,
                        "adjustmentCategory": adjustmentCategory,
                        "adjustmentSubCategory": adjustmentSubCategory,
                        "adjustmentAbility": adjustmentAbility,
                        "adjustmentValue": adjustmentValue,
                        "resetType": resetType,
                        "level": level
                    });
                }
            });
        }
        
        // Add subclass features that don't have automatic descriptions AND don't have choice definitions
        if (subclassLevelData.features) {
            subclassLevelData.features.forEach(featureName => {
                const hasAutomaticFeature = subclassLevelData.automaticFeatures && subclassLevelData.automaticFeatures[featureName];
                const hasChoiceDefinition = subclassLevelData.choices && subclassLevelData.choices[featureName];
                
                if (!hasAutomaticFeature && !hasChoiceDefinition) {
                    const baseFeatureName = getBaseFeatureName(featureName);
                    
                    if (!subclassFeatureTracker.has(baseFeatureName)) {
                        subclassFeatureTracker.set(baseFeatureName, {
                            "traitName": `${featureName} (${subclassInfo.name}, Level ${level})`,
                            "cheveron": false,
                            "traitDescription": `${featureName} subclass feature gained at level ${level}.`,
                            "checkboxStates": [],
                            "numberOfUses": "0",
                            "adjustmentCategory": "None",
                            "adjustmentSubCategory": "",
                            "adjustmentAbility": "NONE",
                            "adjustmentValue": "0",
                            "resetType": "none",
                            "level": level
                        });
                    }
                }
            });
        }
    }
    
    // Add all consolidated subclass features to traits
    subclassFeatureTracker.forEach(feature => {
        // Remove the level property before adding to traits
        delete feature.level;
        currentClassData.traits.push(feature);
    });
}

/**
 * Finds the choice definition for a given choice key and level
 */
function findChoiceDefinition(classInfo, level, choiceKey) {
    // Check class level progression
    const levelData = classInfo.levelProgression && classInfo.levelProgression[level.toString()];
    if (levelData && levelData.choices && levelData.choices[choiceKey]) {
        return levelData.choices[choiceKey];
    }
    
    // Check subclass features if applicable
    if (currentCharacter.subclass && classInfo.subclasses && classInfo.subclasses[currentCharacter.subclass]) {
        const subclassData = classInfo.subclasses[currentCharacter.subclass];
        const subclassLevelData = subclassData.features && subclassData.features[level.toString()];
        if (subclassLevelData && subclassLevelData.choices && subclassLevelData.choices[choiceKey]) {
            return subclassLevelData.choices[choiceKey];
        }
    }
    
    return null;
}

/**
 * Finds the specific option details for a selected choice
 */
function findSelectedOptionDetails(choiceDefinition, selectedValue) {
    if (!choiceDefinition || !choiceDefinition.options) return null;
    
    // Handle array of choices (multiple selections)
    if (Array.isArray(selectedValue)) {
        return selectedValue.map(value => {
            return choiceDefinition.options.find(option => 
                option.name === value || option === value
            );
        }).filter(Boolean);
    }
    
    // Handle single choice
    return choiceDefinition.options.find(option => 
        option.name === selectedValue || option === selectedValue
    );
}

/**
 * Creates a trait from choice option details
 */
function createChoiceTrait(choiceKey, level, optionDetails, isMultiple = false) {
    if (!optionDetails) return null;
    
    // Handle multiple selections
    if (Array.isArray(optionDetails)) {
        return optionDetails.map((option, index) => {
            return createSingleChoiceTrait(choiceKey, level, option, index);
        });
    }
    
    return createSingleChoiceTrait(choiceKey, level, optionDetails);
}

/**
 * Creates a single trait from one choice option
 */
function createSingleChoiceTrait(choiceKey, level, optionDetails, index = null) {
    let traitName, traitDescription, adjustmentCategory = "None", adjustmentSubCategory = "", adjustmentValue = "0", adjustmentAbility = "NONE";
    
    if (typeof optionDetails === 'object' && optionDetails.name) {
        // Full option object with name and description
        if (choiceKey === 'Fighting Style' || choiceKey === 'Additional Fighting Style') {
            traitName = `${optionDetails.name} Fighting Style`;
        } else if (choiceKey === 'Maneuvers' || choiceKey === 'Additional Maneuvers') {
            traitName = `${optionDetails.name} Maneuver${index !== null ? ` (${index + 1})` : ''}`;
        } else {
            traitName = `${optionDetails.name} (${choiceKey})`;
        }
        
        traitDescription = optionDetails.description || `${optionDetails.name} selected for ${choiceKey}.`;
        
        // Extract bonus information if present
        if (optionDetails.bonus) {
            const bonus = optionDetails.bonus;
            adjustmentCategory = bonus.adjustmentCategory || "None";
            adjustmentSubCategory = bonus.adjustmentSubCategory || "";
            adjustmentValue = bonus.adjustmentValue ? bonus.adjustmentValue.toString() : "0";
            adjustmentAbility = bonus.adjustmentAbility || "NONE";
        }
    } else {
        // Simple string option
        traitName = `${optionDetails} (${choiceKey})`;
        traitDescription = `Selected ${optionDetails} for ${choiceKey}.`;
    }
    
    return {
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
    };
}

/**
 * Adds current character choices to class data with duplicate filtering
 */
function addClassChoices(currentClassData) {
    if (!currentCharacter.choices) return;
    
    const classInfo = getClassDataFromLoaded(currentCharacter.class);
    if (!classInfo) return;
    
    // Track added traits to prevent duplicates in save data
    const addedTraitNames = new Set();
    
    Object.entries(currentCharacter.choices).forEach(([level, levelChoices]) => {
        // Only process numeric levels (actual character levels), skip special choice keys
        if (!isNaN(parseInt(level)) && typeof levelChoices === 'object' && levelChoices !== null) {
            Object.entries(levelChoices).forEach(([choiceKey, choiceValue]) => {
                // Handle special cases first
                if (choiceKey === 'subclass') {
                    const traitName = `Subclass: ${choiceValue}`;
                    if (!addedTraitNames.has(traitName)) {
                        addedTraitNames.add(traitName);
                        currentClassData.traits.push({
                            "traitName": traitName,
                            "cheveron": false,
                            "traitDescription": `Selected ${choiceValue} subclass at level ${level}.`,
                            "checkboxStates": [],
                            "numberOfUses": "0",
                            "adjustmentCategory": "None",
                            "adjustmentSubCategory": "",
                            "adjustmentAbility": "NONE",
                            "adjustmentValue": "0",
                            "resetType": "none"
                        });
                    }
                    return;
                } else if (choiceKey.includes('ASI') || choiceKey === 'Ability Score Improvement') {
                    if (Array.isArray(choiceValue)) {
                        // Handle ability score improvement
                        const traitName = `Ability Score Improvement (Level ${level})`;
                        if (!addedTraitNames.has(traitName)) {
                            addedTraitNames.add(traitName);
                            currentClassData.traits.push({
                                "traitName": traitName,
                                "cheveron": false,
                                "traitDescription": `Ability Score Improvement: +1 to ${choiceValue.join(' and ')}.`,
                                "checkboxStates": [],
                                "numberOfUses": "0",
                                "adjustmentCategory": "attributes",
                                "adjustmentSubCategory": choiceValue.map(ability => ability.toUpperCase().slice(0, 3)).join(","),
                                "adjustmentAbility": "NONE",
                                "adjustmentValue": "1",
                                "resetType": "none"
                            });
                        }
                    } else if (typeof choiceValue === 'string' && choiceValue !== 'Feat' && choiceValue !== '') {
                        // Handle feat selection - choiceValue is now the actual feat name
                        const featData = featsData.feats && featsData.feats.find(f => f.name === choiceValue);
                        if (featData) {
                            // Create base trait name for duplicate checking (without level for feats that can be taken multiple times)
                            const featAllowsMultiple = featData.multiple === true;
                            const traitName = featAllowsMultiple ? 
                                `Feat: ${choiceValue} (Level ${level})` : 
                                `Feat: ${choiceValue}`;
                            
                            if (!addedTraitNames.has(traitName)) {
                                addedTraitNames.add(traitName);
                                currentClassData.traits.push({
                                    "traitName": `Feat: ${choiceValue} (Level ${level})`,
                                    "cheveron": false,
                                    "traitDescription": featData.description ? featData.description.join(' ') : `Feat: ${choiceValue}`,
                                    "checkboxStates": [],
                                    "numberOfUses": "0",
                                    "adjustmentCategory": "None",
                                    "adjustmentSubCategory": "",
                                    "adjustmentAbility": "NONE",
                                    "adjustmentValue": "0",
                                    "resetType": "none"
                                });
                            }
                        }
                    }
                    return;
                }
                
                // Find the choice definition
                const choiceDefinition = findChoiceDefinition(classInfo, level, choiceKey);
                if (!choiceDefinition) {
                    // Fallback to generic choice if no definition found
                    const traitName = `${choiceKey} Choice (Level ${level})`;
                    if (!addedTraitNames.has(traitName)) {
                        addedTraitNames.add(traitName);
                        currentClassData.traits.push({
                            "traitName": traitName,
                            "cheveron": false,
                            "traitDescription": `Selected: ${Array.isArray(choiceValue) ? choiceValue.join(', ') : choiceValue}`,
                            "checkboxStates": [],
                            "numberOfUses": "0",
                            "adjustmentCategory": "None",
                            "adjustmentSubCategory": "",
                            "adjustmentAbility": "NONE",
                            "adjustmentValue": "0",
                            "resetType": "none"
                        });
                    }
                    return;
                }
                
                // Find the selected option details
                const optionDetails = findSelectedOptionDetails(choiceDefinition, choiceValue);
                if (!optionDetails) {
                    // Fallback if option not found
                    const traitName = `${choiceKey} Choice (Level ${level})`;
                    if (!addedTraitNames.has(traitName)) {
                        addedTraitNames.add(traitName);
                        currentClassData.traits.push({
                            "traitName": traitName,
                            "cheveron": false,
                            "traitDescription": `Selected: ${Array.isArray(choiceValue) ? choiceValue.join(', ') : choiceValue}`,
                            "checkboxStates": [],
                            "numberOfUses": "0",
                            "adjustmentCategory": "None",
                            "adjustmentSubCategory": "",
                            "adjustmentAbility": "NONE",
                            "adjustmentValue": "0",
                            "resetType": "none"
                        });
                    }
                    return;
                }
                
                // Create trait(s) from the option details
                const choiceTraits = createChoiceTrait(choiceKey, level, optionDetails);
                if (Array.isArray(choiceTraits)) {
                    choiceTraits.forEach(trait => {
                        if (trait && !addedTraitNames.has(trait.traitName)) {
                            addedTraitNames.add(trait.traitName);
                            currentClassData.traits.push(trait);
                        }
                    });
                } else if (choiceTraits && !addedTraitNames.has(choiceTraits.traitName)) {
                    addedTraitNames.add(choiceTraits.traitName);
                    currentClassData.traits.push(choiceTraits);
                }
            });
        }
    });
    
    // Handle special non-level-based choices (like skill selections)
    Object.entries(currentCharacter.choices).forEach(([choiceKey, choiceValue]) => {
        // Skip numeric levels (already processed above)
        if (isNaN(parseInt(choiceKey))) {
            if (choiceKey === 'class-skill-choice' && Array.isArray(choiceValue)) {
                // Handle class skill choices
                choiceValue.forEach((skill, index) => {
                    const traitName = `Skill Proficiency: ${skill}`;
                    if (!addedTraitNames.has(traitName)) {
                        addedTraitNames.add(traitName);
                        currentClassData.traits.push({
                            "traitName": traitName,
                            "cheveron": false,
                            "traitDescription": `Gained proficiency in ${skill} from class skill selection.`,
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
            } else if (typeof choiceValue === 'string' && choiceValue.trim() !== '') {
                // Handle other single string choices
                const traitName = `${choiceKey}: ${choiceValue}`;
                if (!addedTraitNames.has(traitName)) {
                    addedTraitNames.add(traitName);
                    currentClassData.traits.push({
                        "traitName": traitName,
                        "cheveron": false,
                        "traitDescription": `Selected ${choiceValue} for ${choiceKey}.`,
                        "checkboxStates": [],
                        "numberOfUses": "0",
                        "adjustmentCategory": "None",
                        "adjustmentSubCategory": "",
                        "adjustmentAbility": "NONE",
                        "adjustmentValue": "0",
                        "resetType": "none"
                    });
                }
            }
        }
    });
    
    // Reset refresh flag
    setTimeout(() => { isRefreshing = false; }, 200);
}

/**
 * Adds selected feats to class data (only those not already handled by choice processing)
 */
function addSelectedFeats(currentClassData) {
    if (!currentCharacter.selectedFeats) return;
    
    Object.entries(currentCharacter.selectedFeats).forEach(([featName, featData]) => {
        // Check if this feat is already added by choice processing
        const alreadyAdded = currentClassData.traits.some(trait => 
            trait.traitName.includes(`Feat: ${featName}`)
        );
        
        if (!alreadyAdded) {
            const traitName = `Feat: ${featName}`;
            // Check if we should allow multiple instances of this feat
            const featAllowsMultiple = featData.multiple === true;
            
            // For feats that don't allow multiples, check for any existing instance
            if (!featAllowsMultiple) {
                const existingFeat = currentClassData.traits.some(trait => 
                    trait.traitName.startsWith(`Feat: ${featName}`)
                );
                if (existingFeat) {
                    return; // Skip this feat as it already exists
                }
            }
            
            currentClassData.traits.push({
                "traitName": traitName,
                "cheveron": false,
                "traitDescription": featData.description ? featData.description.join(' ') : `Feat: ${featName}`,
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

/**
 * Populates skill proficiencies from character data
 */
function populateClassSkillProficiencies(currentClassData) {
    if (currentCharacter.skills && currentCharacter.skills.proficiencies) {
        // Filter skills that come from class sources
        const classSkills = currentCharacter.skills.proficiencies.filter(skill => {
            const source = currentCharacter.skills.sources[skill];
            return source && (source.includes('Class') || source.includes(currentCharacter.class));
        });
        currentClassData.skillProficiencies = [...classSkills];
    }
}

/**
 * Saves the final class data
 */
function saveClassDataToGlobal(currentClassData, classKey, subclassKey) {
    const saveKey = subclassKey ? `${classKey}-${subclassKey}` : classKey;
    saveClassesData = {
        [saveKey]: currentClassData
    };
    console.log('Updated classesData for save:', saveClassesData);
}

// Prevent infinite refresh loops
let isRefreshing = false;

/**
 * Refreshes all choice interfaces to reflect current duplicate state
 * Call this after making choices to update availability in other dropdowns
 */
function refreshChoiceInterfaces() {
    if (isRefreshing) return; // Prevent infinite loops
    
    isRefreshing = true;
    
    // Find all choice containers and refresh them - look for the actual IDs that exist
    const allChoiceContainers = document.querySelectorAll('[id^="choice-"][id*="-L"][id$="-multi-container"]');
    
    // Also look for single-choice elements (dropdowns) by finding their titles and getting parent cards
    const choiceTitles = document.querySelectorAll('[id^="choice-"][id*="-L"][id$="-title"]');
    
    // Process multi-choice containers (like maneuvers)
    allChoiceContainers.forEach(container => {
        const containerId = container.id;
        processChoiceFromContainer(container, containerId);
    });
    
    // Process single-choice cards (like fighting styles, ASI)
    choiceTitles.forEach(titleEl => {
        const card = titleEl.closest('.feature-card');
        if (card) {
            processChoiceCard(card, titleEl.id);
        }
    });
    
    // Reset refresh flag
    setTimeout(() => { isRefreshing = false; }, 200);
}

/**
 * Process a multi-choice container for refresh (like maneuver checkboxes)
 */
function processChoiceFromContainer(container, containerId) {
    // Extract choice info from container ID like "choice-Maneuvers-L3-multi-container"
    const match = containerId.match(/choice-(.*)-L(\d+)-multi-container/);
    if (match) {
        const safeKey = match[1];
        const level = parseInt(match[2]);
        
        // Convert safe key back to original choice key
        let choiceKey = safeKey.replace(/([A-Z])/g, ' $1').trim();
        
        // Handle common choice key patterns - map safe keys back to actual choice keys
        const choiceKeyMappings = {
            'FightingStyle': 'Fighting Style',
            'AdditionalFightingStyle': 'Additional Fighting Style',
            'Maneuvers': 'Maneuvers',
            'AdditionalManeuvers': 'Additional Maneuvers',
            'ASI': 'Ability Score Improvement',
            'AbilityScoreImprovement': 'Ability Score Improvement',
            'MartialArchetype': 'Martial Archetype'
        };
        
        // Check if we have a direct mapping for the safe key
        if (choiceKeyMappings[safeKey]) {
            choiceKey = choiceKeyMappings[safeKey];
        }
        
        // Look for the choice definition in class and subclass data
        const classInfo = getClassDataFromLoaded(currentCharacter.class);
        if (classInfo) {
            let choiceDef = null;
            
            // Check main class level progression
            const levelData = classInfo.levelProgression && classInfo.levelProgression[level.toString()];
            if (levelData && levelData.choices) {
                choiceDef = levelData.choices[choiceKey];
            }
            
            // Check subclass features if not found in main class
            if (!choiceDef && currentCharacter.subclass && classInfo.subclasses && classInfo.subclasses[currentCharacter.subclass]) {
                const subclassData = classInfo.subclasses[currentCharacter.subclass];
                const subclassLevelData = subclassData.features && subclassData.features[level.toString()];
                if (subclassLevelData && subclassLevelData.choices) {
                    choiceDef = subclassLevelData.choices[choiceKey];
                }
            }
            
            if (choiceDef) {
                // Just update the existing checkboxes instead of recreating everything
                updateExistingChoiceStates(container, choiceKey);
            }
        }
    }
}

/**
 * Update the states of existing checkboxes without recreating the interface
 * @param {HTMLElement} container - The multi-choice container
 * @param {string} choiceKey - The choice key for duplicate checking
 */
function updateExistingChoiceStates(container, choiceKey) {
    // Find all checkboxes in this container
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        const optionName = checkbox.value;
        const label = container.querySelector(`label[for="${checkbox.id}"]`);
        const optionDiv = checkbox.closest('.multi-choice-option');
        
        // Check if this option can still be selected
        const canSelect = canSelectChoice(choiceKey, optionName);
        
        // Update checkbox and label states
        if (!canSelect && !checkbox.checked) {
            // Option is already selected elsewhere - disable and style it
            checkbox.disabled = true;
            
            if (label) {
                label.style.color = '#666';
                label.style.fontStyle = 'italic';
                label.style.textDecoration = 'line-through';
                label.style.opacity = '0.5';
                label.style.backgroundColor = 'rgba(100, 100, 100, 0.1)';
                label.style.padding = '2px 4px';
                label.style.borderRadius = '3px';
                label.style.cursor = 'not-allowed';
                label.textContent = optionName + ' (already selected)';
            }
            
            if (optionDiv) {
                optionDiv.className = optionDiv.className.replace(' disabled-choice', '') + ' disabled-choice';
            }
        } else if (canSelect || checkbox.checked) {
            // Option is available or currently selected here - enable and restore styling
            checkbox.disabled = false;
            
            if (label) {
                label.style.color = '';
                label.style.fontStyle = '';
                label.style.textDecoration = '';
                label.style.opacity = '';
                label.style.backgroundColor = '';
                label.style.padding = '';
                label.style.borderRadius = '';
                label.style.cursor = '';
                label.textContent = optionName; // Remove "(already selected)" text
            }
            
            if (optionDiv) {
                optionDiv.className = optionDiv.className.replace(' disabled-choice', '');
            }
        }
    });
}

/**
 * Process a single choice card for refresh
 */
function processChoiceCard(card, cardId) {
    // Extract choice info from the card ID or title ID
    let match = cardId.match(/choice-(.*)-L(\d+)-card/);
    if (!match && cardId.includes('-title')) {
        // Handle title element IDs like "choice-Maneuvers-L3-title"
        match = cardId.match(/choice-(.*)-L(\d+)-title/);
    }
    
    if (match) {
            const safeKey = match[1];
            const level = parseInt(match[2]);
            
            // Convert safe key back to original choice key
            let choiceKey = safeKey.replace(/([A-Z])/g, ' $1').trim();
            
            // Handle common choice key patterns - map safe keys back to actual choice keys
            const choiceKeyMappings = {
                'FightingStyle': 'Fighting Style',
                'AdditionalFightingStyle': 'Additional Fighting Style',
                'Maneuvers': 'Maneuvers',
                'AdditionalManeuvers': 'Additional Maneuvers',
                'ASI': 'Ability Score Improvement',
                'AbilityScoreImprovement': 'Ability Score Improvement',
                'MartialArchetype': 'Martial Archetype'
            };
            
            // Check if we have a direct mapping for the safe key
            if (choiceKeyMappings[safeKey]) {
                choiceKey = choiceKeyMappings[safeKey];
            }
            
            // Look for the choice definition in class and subclass data
            const classInfo = getClassDataFromLoaded(currentCharacter.class);
            if (classInfo) {
                let choiceDef = null;
                
                // Check main class level progression
                const levelData = classInfo.levelProgression && classInfo.levelProgression[level.toString()];
                if (levelData && levelData.choices) {
                    choiceDef = levelData.choices[choiceKey];
                }
                
                // Check subclass features if not found in main class
                if (!choiceDef && currentCharacter.subclass && classInfo.subclasses && classInfo.subclasses[currentCharacter.subclass]) {
                    const subclassData = classInfo.subclasses[currentCharacter.subclass];
                    const subclassLevelData = subclassData.features && subclassData.features[level.toString()];
                    if (subclassLevelData && subclassLevelData.choices) {
                        choiceDef = subclassLevelData.choices[choiceKey];
                    }
                }
                
                if (choiceDef) {
                    // For single choices (dropdowns), just update the select options
                    updateExistingSelectOptions(card, choiceKey, choiceDef);
                }
            }
        }
}

/**
 * Update the options in existing select dropdowns without recreating them
 * @param {HTMLElement} card - The feature card containing the select
 * @param {string} choiceKey - The choice key for duplicate checking
 * @param {Object} choiceDef - The choice definition
 */
function updateExistingSelectOptions(card, choiceKey, choiceDef) {
    // Find select elements in this card
    const selects = card.querySelectorAll('select');
    
    selects.forEach(select => {
        if (select.id.includes('primary') || select.id.includes('secondary')) {
            // Skip secondary selects that aren't the main choice (like ASI A/B selects)
            if (select.id.includes('secondary') && !select.id.includes('feat')) {
                return;
            }
            
            // Update option states based on current availability
            Array.from(select.options).forEach(option => {
                if (option.value && option.value !== '') {
                    const canSelect = canSelectChoice(choiceKey, option.value);
                    
                    // Update option state
                    if (!canSelect && !select.value === option.value) {
                        option.disabled = true;
                        option.style.color = '#666';
                        option.style.fontStyle = 'italic';
                        option.style.textDecoration = 'line-through';
                        option.style.backgroundColor = 'rgba(100, 100, 100, 0.2)';
                        option.style.opacity = '0.5';
                        if (!option.text.includes('(already selected)')) {
                            option.text = option.text + ' (already selected)';
                        }
                    } else {
                        option.disabled = false;
                        option.style.color = '';
                        option.style.fontStyle = '';
                        option.style.textDecoration = '';
                        option.style.backgroundColor = '';
                        option.style.opacity = '';
                        option.text = option.text.replace(' (already selected)', '');
                    }
                }
            });
        }
    });
}

/**
 * Main function to update classesData based on current character selections
 */
function updateClassesDataForSave() {
    // Clear all previous class data first
    saveClassesData = {};
    
    if (!validateClassData()) {
        return;
    }

    // Get class data from loaded data
    const classKey = currentCharacter.class;
    const subclassKey = currentCharacter.subclass;
    
    try {
        const classInfo = getClassDataFromLoaded(classKey);
        if (!classInfo) return;

        // Build the class data structure
        const currentClassData = buildClassDataStructure(classInfo, subclassKey);
        
        // Process all components
        addLevelProgressionFeatures(currentClassData, classInfo);
        addSubclassFeatures(currentClassData, classInfo, subclassKey);
        addClassChoices(currentClassData);
        addSelectedFeats(currentClassData);
        populateClassSkillProficiencies(currentClassData);

        saveClassDataToGlobal(currentClassData, classKey, subclassKey);
        
        // Refresh choice interfaces to update duplicate states
        setTimeout(() => refreshChoiceInterfaces(), 100);
        
    } catch (error) {
        console.error('Error updating classesData for save:', error);
    }
}

/**
 * Updates level dropdowns for all classes to reflect current max level constraints
 */
function updateAllClassLevelDropdowns() {
    if (!currentCharacter.isMulticlassing) return;
    
    currentCharacter.classes.forEach((classData, classIndex) => {
        const dropdown = document.getElementById(`levelDropdown-${classIndex}`);
        if (!dropdown) return;
        
        const currentLevel = classData.level;
        const maxLevel = getMaxLevelForClass(classIndex);
        
        // Clear and rebuild dropdown options
        dropdown.innerHTML = '';
        
        for (let i = 1; i <= maxLevel; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            if (i === currentLevel) option.selected = true;
            dropdown.appendChild(option);
        }
        
        // If current level exceeds new max, adjust it down
        if (currentLevel > maxLevel) {
            updateClassLevel(classIndex, maxLevel);
        }
    });
}