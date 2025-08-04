function copySaveToClipboard() {
	const data = generateSaveData();
	const json = JSON.stringify(data, null, 2);
	navigator.clipboard.writeText(json)
		.then(() => alert('Save copied to clipboard!'))
		.catch(err => alert('Failed to copy save data: ' + err));
}

// Save character
function saveCharacter() {
    if (!currentCharacter.name) {
        showError('Please enter a character name before saving.');
        return;
    }
    copySaveToClipboard();
}

// Generate character save data in the format expected by your system
function generateSaveData() {
	const name = currentCharacter.name || "Unnamed Character";
	const save = {};

	// Calculate proficiency mappings
	const proficiencyMappings = calculateProficiencyMappings();

	save[name] = {
		characterTempHp: "0",
		currentHitDice: currentCharacter.level.toString(),
		insp: 0,
		upcastToggle: 1,
		exhaustionToggle: 0,
		playerWeaponProficiency: getWeaponProficiencies(),
		playerArmorProficiency: getArmorProficiencies(),
		playerLanguageProficiency: (currentCharacter.languages && currentCharacter.languages.proficiencies) || [],
		playerToolsProficiency: getToolProficiencies(),
		initiativeButton: "0",
		AC: currentCharacter.armorClass.toString(),
		speed: currentCharacter.speed || "30ft.",
		characterLevel: currentCharacter.level.toString(),
		playerXP: currentCharacter.xp?.toString() || "0",
		playerClass: `${currentCharacter.class}${currentCharacter.subclass ? ` (${currentCharacter.subclass})` : ''}`,
		playerSpecies: `${currentCharacter.race}${currentCharacter.subrace ? ` (${currentCharacter.subrace})` : ''}`,
		currentCharacterHP: currentCharacter.trueHitPoints.toString(),
		maxCharacterHP: currentCharacter.trueHitPoints.toString(),

		// True Ability Scores - base scores from inputs (rolled numbers)
		trueStrengthScore: (currentCharacter.abilities?.strength || 10).toString(),
		trueDexterityScore: (currentCharacter.abilities?.dexterity || 10).toString(),
		trueConstitutionScore: (currentCharacter.abilities?.constitution || 10).toString(),
		trueIntelligenceScore: (currentCharacter.abilities?.intelligence || 10).toString(),
		trueWisdomScore: (currentCharacter.abilities?.wisdom || 10).toString(),
		trueCharismaScore: (currentCharacter.abilities?.charisma || 10).toString(),

		// Ability Scores - total scores including bonuses
		strengthScore: getTotalAbilityScore('strength').toString(),
		dexterityScore: getTotalAbilityScore('dexterity').toString(),
		constitutionScore: getTotalAbilityScore('constitution').toString(),
		intelligenceScore: getTotalAbilityScore('intelligence').toString(),
		wisdomScore: getTotalAbilityScore('wisdom').toString(),
		charismaScore: getTotalAbilityScore('charisma').toString(),

		// Ability score generation method and data
		abilityScoreMethod: currentCharacter.abilityScoreMethod || "manual",
		rolledAbilityScores: currentCharacter.rolledAbilityScores || [],
		individualRolls: currentCharacter.individualRolls || [],
		pointBuyPoints: currentCharacter.pointBuyPoints || 27,
		
		// Hit points data
		hitPointsRollCount: currentCharacter.hitPointsRollCount || 0,

		// Skill modifiers mapping
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

		hitDiceButton: `d${classesData?.classes?.[currentCharacter.class]?.hitDie || 10}`,

		// Skill and Save proficiencies (pb-1 through pb-24)
		...proficiencyMappings,

		conditions: [],
		coins: currentCharacter.coins || { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
		actionTable: currentCharacter.actionTable || [],
		spellData: currentCharacter.spellData || {},
		inventoryData: currentCharacter.inventoryData || {
			equipment: [],
			backpack: [],
			"other-possessions": [],
			attunement: []
		},
		groupTraitData: collectGroupTraitsData() || [],
		groupNotesData: [],
		extrasData: []
	};

	return save;
}

/**
 * Calculates proficiency mappings for pb-1 through pb-24
 * pb-1 to pb-18: Skills in alphabetical order
 * pb-19 to pb-24: Saving throws (str, dex, con, int, wis, cha)
 * Values: 0 = not proficient, 0.5 = half proficient, 1 = proficient, 2 = expertise
 */
function calculateProficiencyMappings() {
	const mappings = {};
	
	console.warn('=== SKILL AND SAVE PROFICIENCIES MAPPING ===');
	
	// Skills in alphabetical order (pb-1 to pb-18)
	const skillsInOrder = [
		'Acrobatics',      // pb-1
		'Animal Handling', // pb-2
		'Arcana',          // pb-3
		'Athletics',       // pb-4
		'Deception',       // pb-5
		'History',         // pb-6
		'Insight',         // pb-7
		'Intimidation',    // pb-8
		'Investigation',   // pb-9
		'Medicine',        // pb-10
		'Nature',          // pb-11
		'Perception',      // pb-12
		'Performance',     // pb-13
		'Persuasion',      // pb-14
		'Religion',        // pb-15
		'Sleight of Hand', // pb-16
		'Stealth',         // pb-17
		'Survival'         // pb-18
	];
	
	// Check skill proficiencies
	console.warn('SKILL PROFICIENCIES:');
	skillsInOrder.forEach((skill, index) => {
		const pbKey = `pb-${index + 1}`;
		const profValue = getSkillProficiencyValue(skill);
		mappings[pbKey] = profValue;
		console.warn(`${pbKey}: ${skill} = ${profValue} (${getProficiencyLevelName(profValue)})`);
	});
	
	// Saving throws (pb-19 to pb-24)
	console.warn('SAVING THROW PROFICIENCIES:');
	const savesInOrder = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
	savesInOrder.forEach((save, index) => {
		const pbKey = `pb-${19 + index}`;
		const profValue = getSavingThrowProficiencyValue(save);
		mappings[pbKey] = profValue;
		console.warn(`${pbKey}: ${save.toUpperCase()} Save = ${profValue} (${getProficiencyLevelName(profValue)})`);
	});
	
	console.warn('=== END PROFICIENCIES MAPPING ===');
	
	return mappings;
}

/**
 * Helper function to get proficiency level name for console output
 */
function getProficiencyLevelName(value) {
	switch(value) {
		case 0: return 'Not Proficient';
		case 0.5: return 'Half Proficient';
		case 1: return 'Proficient';
		case 2: return 'Expertise';
		default: return 'Unknown';
	}
}

/**
 * Checks if the character has the Remarkable Athlete feature
 * (Fighter Champion subclass, level 7+)
 */
function checkForRemarkableAthlete() {
	return currentCharacter.class === 'fighter' && 
	       currentCharacter.subclass === 'Champion' && 
	       currentCharacter.level >= 7;
}

/**
 * Gets proficiency value for a skill
 */
function getSkillProficiencyValue(skillName) {
	if (!currentCharacter.skills || !currentCharacter.skills.proficiencies) {
		return 0;
	}
	
	// Check if proficient in this skill
	const isProficient = currentCharacter.skills.proficiencies.includes(skillName);
	
	// Check for expertise (if you have an expertise system)
	const hasExpertise = currentCharacter.skills.expertise && currentCharacter.skills.expertise.includes(skillName);
	
	// Check for half proficiency (if you have a half proficiency system)
	const hasHalfProficiency = currentCharacter.skills.halfProficiency && currentCharacter.skills.halfProficiency.includes(skillName);
	
	// Check for Remarkable Athlete (Fighter Champion level 7+)
	const hasRemarkableAthlete = checkForRemarkableAthlete();
	const remarkableAthleteSkills = ['Athletics', 'Acrobatics', 'Sleight of Hand', 'Stealth'];
	const hasRemarkableAthleteBonus = hasRemarkableAthlete && remarkableAthleteSkills.includes(skillName) && !isProficient;
	
	if (hasExpertise) {
		return 2; // Expertise
	} else if (isProficient) {
		return 1; // Proficient
	} else if (hasHalfProficiency || hasRemarkableAthleteBonus) {
		return 0.5; // Half proficient (includes Remarkable Athlete)
	} else {
		return 0; // Not proficient
	}
}

/**
 * Gets proficiency value for a saving throw
 */
function getSavingThrowProficiencyValue(saveName) {
	if (!currentCharacter.savingThrows) {
		return 0;
	}
	
	return currentCharacter.savingThrows[saveName] ? 1 : 0;
}

/**
 * Gets weapon proficiencies from character data
 */
function getWeaponProficiencies() {
	const weapons = [];
	
	// From equipment proficiencies (class-based)
	if (currentCharacter.equipmentProficiencies && currentCharacter.equipmentProficiencies.weapons) {
		weapons.push(...currentCharacter.equipmentProficiencies.weapons);
	}
	
	// From racial proficiencies (if any)
	if (currentCharacter.weaponProficiencies) {
		weapons.push(...currentCharacter.weaponProficiencies);
	}
	
	// Remove duplicates and return
	return [...new Set(weapons)];
}

/**
 * Gets armor proficiencies from character data
 */
function getArmorProficiencies() {
	const armor = [];
	
	// From equipment proficiencies (class-based)
	if (currentCharacter.equipmentProficiencies && currentCharacter.equipmentProficiencies.armor) {
		armor.push(...currentCharacter.equipmentProficiencies.armor);
	}
	
	// From racial proficiencies (if any)
	if (currentCharacter.armorProficiencies) {
		armor.push(...currentCharacter.armorProficiencies);
	}
	
	// Remove duplicates and return
	return [...new Set(armor)];
}

/**
 * Gets tool proficiencies from character data
 */
function getToolProficiencies() {
	const tools = [];
	
	// From equipment proficiencies (class-based)
	if (currentCharacter.equipmentProficiencies && currentCharacter.equipmentProficiencies.tools) {
		tools.push(...currentCharacter.equipmentProficiencies.tools);
	}
	
	// From racial proficiencies
	if (currentCharacter.tools && currentCharacter.tools.proficiencies) {
		tools.push(...currentCharacter.tools.proficiencies);
	}
	
	// From individual tool proficiencies (if stored differently)
	if (currentCharacter.toolProficiencies) {
		tools.push(...currentCharacter.toolProficiencies);
	}
	
	// Remove duplicates and return
	return [...new Set(tools)];
}

/**
 * Collects all trait data from the new class and species data objects
 */
function collectGroupTraitsData() {
	const groupedTraits = [];

	// Add Class Traits from saveClassesData
	if (typeof saveClassesData !== 'undefined' && Object.keys(saveClassesData).length > 0) {
		const classKey = Object.keys(saveClassesData)[0];
		const classData = saveClassesData[classKey];
		
		if (classData && classData.traits && classData.traits.length > 0) {
			// Get class name for the title
			const className = classData.basicInfo?.className || currentCharacter.class || 'Unknown';
			
			groupedTraits.push({
				"group-title": `${className} Class Traits`,
				"group-chevron": false,
				"traits": classData.traits
			});
		}
	}

	// Add Racial Traits from saveRacesData
	if (typeof saveRacesData !== 'undefined' && Object.keys(saveRacesData).length > 0) {
		const raceKey = Object.keys(saveRacesData)[0];
		const raceData = saveRacesData[raceKey];
		
		if (raceData && raceData.traits && raceData.traits.length > 0) {
			groupedTraits.push({
				"group-title": "Racial Traits",
				"group-chevron": false,
				"traits": raceData.traits
			});
		}
	}

	return groupedTraits;
}

/**
 * Helper function to get total ability score (base + bonuses)
 */
function getTotalAbilityScore(ability) {
	return (currentCharacter.abilities[ability] || 0) + (currentCharacter.abilityBonuses?.[ability] || 0);
}

