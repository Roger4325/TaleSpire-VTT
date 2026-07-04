// =============================================================================
// Starting Equipment tab
// -----------------------------------------------------------------------------
// Starting equipment is granted ONCE: when a brand-new character is first saved
// the chosen items are written into the save's inventoryData (and background
// gold into coins). After that the inventory belongs to the player on the
// sheet — when an existing character is edited this tab only shows what was
// picked and never touches the inventory again.
//
// Item names here and in Classes.json must match equipment-eng.json exactly:
// the sheet resolves inventory items by name and silently drops unknown ones.
// =============================================================================

let creatorEquipmentCatalog = null;   // array from equipment-<lang>.json
let creatorEquipmentCatalogByName = null;

async function loadCreatorEquipmentCatalog() {
    if (creatorEquipmentCatalog) return creatorEquipmentCatalog;
    try {
        const lang = (typeof savedLanguage !== 'undefined' && savedLanguage) ? savedLanguage : 'eng';
        let response = await fetch(`../equipment-${lang}.json`);
        if (!response.ok) response = await fetch('../equipment-eng.json');
        creatorEquipmentCatalog = await response.json();
    } catch (error) {
        console.error('Failed to load equipment catalog:', error);
        creatorEquipmentCatalog = [];
    }
    creatorEquipmentCatalogByName = {};
    creatorEquipmentCatalog.forEach(item => {
        creatorEquipmentCatalogByName[item.name] = item;
    });
    return creatorEquipmentCatalog;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// Picks made on this tab: { [choiceIndex]: { option: <int>, picks: [<name>] } }
function getEquipmentChoiceState() {
    if (!currentCharacter.startingEquipmentChoices) {
        currentCharacter.startingEquipmentChoices = {};
    }
    return currentCharacter.startingEquipmentChoices;
}

// Set when a character is re-opened for editing: the record of what was
// granted on first save (or null for legacy imports that never had one).
function isStartingEquipmentLocked() {
    if (typeof editingExistingCharacter !== 'undefined' && editingExistingCharacter) return true;
    return !!(currentCharacter.startingEquipmentRecord &&
              currentCharacter.startingEquipmentRecord.granted);
}

function getFirstClassEntry() {
    if (Array.isArray(currentCharacter.classes) && currentCharacter.classes.length > 0) {
        return currentCharacter.classes[0];
    }
    if (currentCharacter.class) {
        return { className: currentCharacter.class, level: currentCharacter.level || 1 };
    }
    return null;
}

function getStartingEquipmentDefinition() {
    const first = getFirstClassEntry();
    if (!first || typeof classesData === 'undefined' || !classesData.classes) return null;
    const classInfo = classesData.classes[first.className];
    if (!classInfo || !classInfo.startingEquipment) return null;
    return { classKey: first.className, classInfo, startingEquipment: classInfo.startingEquipment };
}

// ---------------------------------------------------------------------------
// Background equipment parsing
// ---------------------------------------------------------------------------

// Background equipment lines are prose; map the common ones onto catalog names.
const BACKGROUND_ITEM_ALIASES = {
    'common clothes': 'Clothes, Common',
    'set of common clothes': 'Clothes, Common',
    'dark common clothes including a hood': 'Clothes, Common',
    'set of dark common clothes including a hood': 'Clothes, Common',
    'fine clothes': 'Clothes, Fine',
    'set of fine clothes': 'Clothes, Fine',
    "traveler's clothes": "Clothes, Traveler's",
    "set of traveler's clothes": "Clothes, Traveler's",
    'costume': 'Clothes, Costume',
    'iron pot': 'Pot, iron',
    'winter blanket': 'Blanket',
    'holy symbol': 'Holy Symbol',
    'crowbar': 'Crowbar',
    'shovel': 'Shovel',
    'herbalism kit': 'Herbalism Kit',
    'disguise kit': 'Disguise Kit',
    'signet ring': 'Signet Ring',
    'hunting trap': 'Hunting Trap',
    'staff': 'Quarterstaff',
    'small knife': 'Dagger',
    'belaying pin (club)': 'Club',
    '50 feet of silk rope': 'Rope, silk (50 feet)',
    'bottle of black ink': 'Ink (1 ounce bottle)',
    'quill': 'Ink Pen',
    'lucky charm such as a rabbit foot or a small stone with a hole in the center (or you may roll for a random trinket on the trinkets table)': 'Trinket'
};

/**
 * Splits a background's equipment strings into gold, catalog matches and
 * lines the player will have to add by hand on the sheet.
 */
function parseBackgroundEquipment() {
    const result = { gold: 0, items: [], unmatched: [] };
    const backgroundKey = typeof selectedBackground !== 'undefined' ? selectedBackground : null;
    if (!backgroundKey || typeof backgroundsData === 'undefined' || !backgroundsData[backgroundKey]) {
        return result;
    }

    (backgroundsData[backgroundKey].equipment || []).forEach(entry => {
        const goldMatch = entry.match(/^(\d+)\s*gp$/i);
        if (goldMatch) {
            result.gold += parseInt(goldMatch[1], 10);
            return;
        }

        const normalized = entry.replace(/^(a|an)\s+/i, '').trim().toLowerCase();
        const aliased = BACKGROUND_ITEM_ALIASES[normalized];
        const catalogName = aliased && creatorEquipmentCatalogByName?.[aliased]
            ? aliased
            : (creatorEquipmentCatalogByName?.[capitalizeItemName(normalized)] ? capitalizeItemName(normalized) : null);

        if (catalogName) {
            result.items.push({ name: catalogName, quantity: 1 });
        } else {
            result.unmatched.push(entry);
        }
    });

    return result;
}

function capitalizeItemName(name) {
    return name.replace(/\b\w/g, c => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/**
 * Nested list of what's inside an equipment pack (catalog `contents`), or ''
 * for items that aren't packs.
 */
function getPackContentsHtml(itemName) {
    const catalogItem = creatorEquipmentCatalogByName?.[itemName];
    if (!catalogItem || !Array.isArray(catalogItem.contents) || catalogItem.contents.length === 0) {
        return '';
    }
    const lines = catalogItem.contents
        .map(entry => `<li>${entry.quantity > 1 ? entry.quantity + 'x ' : ''}${entry.item?.name || ''}</li>`)
        .join('');
    return `<ul class="pack-contents">${lines}</ul>`;
}

async function displayStartingEquipment() {
    const container = document.getElementById('equipmentContent');
    if (!container) return;

    await loadCreatorEquipmentCatalog();

    if (isStartingEquipmentLocked()) {
        renderLockedEquipment(container);
        return;
    }

    const definition = getStartingEquipmentDefinition();
    if (!definition) {
        container.innerHTML = '<p class="equipment-note">Choose a class first — starting equipment comes from your first class.</p>';
        return;
    }

    const state = getEquipmentChoiceState();
    const se = definition.startingEquipment;
    const className = definition.classInfo.name;
    let html = `<p class="equipment-note">Starting equipment is added to the character's inventory once, when the
        character is first saved. After that, manage equipment on the character sheet.</p>`;

    html += `<h3>${className} Equipment</h3>`;

    if (se.fixed && se.fixed.length > 0) {
        html += '<div class="equipment-fixed"><h4>You start with</h4><ul>';
        se.fixed.forEach(item => {
            html += `<li>${item.quantity > 1 ? item.quantity + 'x ' : ''}${item.name}${getPackContentsHtml(item.name)}</li>`;
        });
        html += '</ul></div>';
    }

    (se.choices || []).forEach((choice, choiceIndex) => {
        const chosen = state[choiceIndex] || {};
        html += `<div class="equipment-choice" data-choice="${choiceIndex}">`;
        html += `<h4>${choice.name}</h4>`;

        choice.options.forEach((option, optionIndex) => {
            const checked = chosen.option === optionIndex ? 'checked' : '';
            html += `<label class="equipment-option">
                <input type="radio" name="equip-choice-${choiceIndex}" value="${optionIndex}" ${checked}
                       onchange="onEquipmentOptionChange(${choiceIndex}, ${optionIndex})">
                ${option.label}
            </label>`;

            // Once an option is picked, show what's inside any pack it contains
            if (chosen.option === optionIndex && option.items) {
                option.items.forEach(item => {
                    const contents = getPackContentsHtml(item.name);
                    if (contents) {
                        html += `<div class="pack-contents-wrap"><em>${item.name} contains:</em>${contents}</div>`;
                    }
                });
            }

            // Dropdown(s) for "any martial weapon" style options
            if (option.select && chosen.option === optionIndex) {
                const pool = getEquipmentSelectPool(option.select);
                for (let i = 0; i < (option.select.count || 1); i++) {
                    const current = (chosen.picks && chosen.picks[i]) || '';
                    html += `<select class="form-control equipment-pick"
                                onchange="onEquipmentPickChange(${choiceIndex}, ${i}, this.value)">`;
                    html += `<option value="">-- choose --</option>`;
                    pool.forEach(name => {
                        html += `<option value="${name.replace(/"/g, '&quot;')}" ${name === current ? 'selected' : ''}>${name}</option>`;
                    });
                    html += '</select>';
                }
            }
        });
        html += '</div>';
    });

    // Background equipment
    const backgroundKey = typeof selectedBackground !== 'undefined' ? selectedBackground : null;
    if (backgroundKey && typeof backgroundsData !== 'undefined' && backgroundsData[backgroundKey]) {
        const bg = backgroundsData[backgroundKey];
        const parsed = parseBackgroundEquipment();
        html += `<h3>Background Equipment (${bg.name})</h3><ul>`;
        (bg.equipment || []).forEach(entry => {
            html += `<li>${entry}</li>`;
        });
        html += '</ul>';
        const notes = [];
        if (parsed.gold > 0) notes.push(`${parsed.gold} gp will be added to your coins`);
        if (parsed.items.length > 0) notes.push(`${parsed.items.length} item(s) will be added to your inventory`);
        if (parsed.unmatched.length > 0) notes.push(`the rest can be added by hand on the sheet`);
        if (notes.length > 0) {
            html += `<p class="equipment-note">${notes.join('; ')}.</p>`;
        }
    } else {
        html += '<p class="equipment-note">Pick a background to see its equipment.</p>';
    }

    container.innerHTML = html;
}

function renderLockedEquipment(container) {
    const record = currentCharacter.startingEquipmentRecord;
    let html = `<p class="equipment-note">This character has already been created — starting equipment was granted
        when they were first saved and no longer changes the inventory. Manage equipment on the character sheet.</p>`;

    if (record && record.granted) {
        if (record.choices && record.choices.length > 0) {
            html += '<h3>Choices made at creation</h3><ul>';
            record.choices.forEach(choice => {
                let line = `<strong>${choice.name}:</strong> ${choice.optionLabel || '—'}`;
                if (choice.picks && choice.picks.length > 0) {
                    line += ` (${choice.picks.join(', ')})`;
                }
                html += `<li>${line}</li>`;
            });
            html += '</ul>';
        }
        if (record.items && record.items.length > 0) {
            html += '<h3>Items granted</h3><ul>';
            record.items.forEach(item => {
                html += `<li>${item.quantity > 1 ? item.quantity + 'x ' : ''}${item.name}${getPackContentsHtml(item.name)}</li>`;
            });
            html += '</ul>';
        }
        if (record.gold) {
            html += `<p class="equipment-note">${record.gold} gp from the background was added to coins.</p>`;
        }
    } else {
        html += '<p class="equipment-note">No starting-equipment record exists for this character (it was created before this feature or imported).</p>';
    }

    container.innerHTML = html;
}

function getEquipmentSelectPool(select) {
    if (select.oneOf) return select.oneOf.slice();
    if (!creatorEquipmentCatalog) return [];

    const category = select.category || '';
    return creatorEquipmentCatalog
        .filter(item => {
            const range = item.category_range || '';
            if (!range) return false;
            if (category === 'Martial' || category === 'Simple') {
                return range.startsWith(category);
            }
            return range === category;
        })
        // Only mundane weapons: magic items in the catalog carry a rarity
        .filter(item => !item.rarity)
        .map(item => item.name)
        .sort();
}

function onEquipmentOptionChange(choiceIndex, optionIndex) {
    const state = getEquipmentChoiceState();
    state[choiceIndex] = { option: optionIndex, picks: [] };
    displayStartingEquipment();
}

function onEquipmentPickChange(choiceIndex, pickIndex, value) {
    const state = getEquipmentChoiceState();
    if (!state[choiceIndex]) state[choiceIndex] = { option: 0, picks: [] };
    state[choiceIndex].picks[pickIndex] = value;
}

// ---------------------------------------------------------------------------
// Resolution (used at save time)
// ---------------------------------------------------------------------------

/**
 * Resolves everything the character should start with.
 * Returns { items: [{name, quantity}], gold, unmatched: [..], choices: [..], complete }
 */
function resolveStartingEquipment() {
    const result = { items: [], gold: 0, unmatched: [], choices: [], complete: true };
    const definition = getStartingEquipmentDefinition();
    const state = getEquipmentChoiceState();

    const addItem = (name, quantity) => {
        const existing = result.items.find(i => i.name === name);
        if (existing) existing.quantity += quantity;
        else result.items.push({ name: name, quantity: quantity });
    };

    if (definition) {
        const se = definition.startingEquipment;
        (se.fixed || []).forEach(item => addItem(item.name, item.quantity || 1));

        (se.choices || []).forEach((choice, choiceIndex) => {
            const chosen = state[choiceIndex];
            if (!chosen || chosen.option === undefined || chosen.option === null) {
                result.complete = false;
                result.choices.push({ name: choice.name, optionLabel: null, picks: [] });
                return;
            }
            const option = choice.options[chosen.option];
            if (!option) {
                result.complete = false;
                return;
            }

            (option.items || []).forEach(item => addItem(item.name, item.quantity || 1));

            const recordedPicks = [];
            if (option.select) {
                const count = option.select.count || 1;
                for (let i = 0; i < count; i++) {
                    const pick = chosen.picks && chosen.picks[i];
                    if (pick) {
                        addItem(pick, 1);
                        recordedPicks.push(pick);
                    } else {
                        result.complete = false;
                    }
                }
            }
            result.choices.push({ name: choice.name, optionLabel: option.label, picks: recordedPicks });
        });
    }

    const background = parseBackgroundEquipment();
    background.items.forEach(item => addItem(item.name, item.quantity));
    result.gold = background.gold;
    result.unmatched = background.unmatched;

    return result;
}

let creatorItemIdCounter = 0;

/**
 * Builds the sheet's inventoryData structure from resolved starting equipment.
 * Weapons/armor/shields go to "equipment"; everything else to "backpack".
 */
function buildStartingInventoryData(resolved) {
    const inventoryData = { 'equipment': [], 'backpack': [], 'other-possessions': [] };

    resolved.items.forEach(item => {
        const catalogItem = creatorEquipmentCatalogByName?.[item.name];
        if (!catalogItem) {
            console.warn(`Starting equipment item not in catalog, skipped: ${item.name}`);
            return;
        }
        const categoryName = (catalogItem.equipment_category?.name || '').toLowerCase();
        const group = (categoryName === 'weapon' || categoryName === 'armor' || categoryName === 'shield')
            ? 'equipment' : 'backpack';

        inventoryData[group].push({
            name: item.name,
            uniqueId: `ccsi-${Date.now()}-${creatorItemIdCounter++}`,
            quantity: item.quantity,
            weight: catalogItem.weight || 0,
            cost: catalogItem.cost ? `${catalogItem.cost.quantity} ${catalogItem.cost.unit}` : '',
            equipped: false
        });
    });

    return inventoryData;
}

/**
 * The record stored in characterCreatorData so the choices can be shown
 * read-only later. `granted` flips to true on the save that adds the items.
 */
function buildStartingEquipmentRecord(resolved, granted) {
    const definition = getStartingEquipmentDefinition();
    return {
        granted: !!granted,
        classKey: definition ? definition.classKey : null,
        choices: resolved.choices,
        items: resolved.items,
        gold: resolved.gold,
        notGranted: resolved.unmatched
    };
}
