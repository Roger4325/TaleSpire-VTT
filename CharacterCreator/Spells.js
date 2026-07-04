// =============================================================================
// Spell selection tab
// -----------------------------------------------------------------------------
// Per 5e (2014) rules, spells known/prepared are determined for each class as
// if the character were single-classed in it:
//   - cantrips known and spells known come from the class tables in
//     Classes.json (`cantripsKnown` / `spellsKnown`, threshold lookup)
//   - wizards fill a spellbook (6 at 1st level, +2 per level after)
//   - prepared casters (cleric, druid, paladin) prepare ability mod + level
//     (half level for paladin), minimum 1
//   - the highest spell level available comes from the class's OWN slot table
//     at its class level (not the shared multiclass table)
//   - cleric domain and paladin oath spells are always prepared and don't
//     count against the budget; warlock patrons expand the options list
//
// Selections live in currentCharacter.spellSelections = {
//   [className]: { cantrips: [names], spells: [names] }
// }, are recorded in characterCreatorData, and flow into the sheet's
// spellData on save (merge keeps spells the player added on the sheet).
// =============================================================================

// ---------------------------------------------------------------------------
// Rules engine
// ---------------------------------------------------------------------------

/** Highest numeric key <= level wins (e.g. cantripsKnown {1:3, 4:4, 10:5}). */
function spellLookupByThreshold(table, level) {
    let value = 0;
    Object.entries(table || {}).forEach(([threshold, v]) => {
        if (level >= parseInt(threshold)) value = v;
    });
    return value;
}

/** Numeric spell level of a catalog entry (0 = cantrip). */
function spellCatalogLevel(spell) {
    if (!spell.level || spell.level === 'Cantrip') return 0;
    const match = spell.level.match(/^(\d)/);
    return match ? parseInt(match[1]) : 99;
}

/** spellData key for a numeric spell level ("Cantrip", "1st-level", ...). */
function spellLevelKey(level) {
    if (level === 0) return 'Cantrip';
    return `${level}${getOrdinalSuffixForLevel(level)}-level`;
}

function getSpellSelectionsStore() {
    if (!currentCharacter.spellSelections) currentCharacter.spellSelections = {};
    return currentCharacter.spellSelections;
}

/**
 * The spell budget for one class entry, or null for non-casters.
 */
function getSpellBudgetForClass(clsEntry) {
    if (typeof getSpellcastingForClassEntry !== 'function') return null;
    const castingInfo = getSpellcastingForClassEntry(clsEntry);
    if (!castingInfo) return null;

    const casting = castingInfo.casting;
    const level = clsEntry.level || 1;

    // Subclass casters (EK/AT) get nothing before their subclass level kicks in
    const cantrips = spellLookupByThreshold(casting.cantripsKnown, level);

    // Highest castable spell level from the class's own slot table
    let maxSpellLevel = 0;
    const slotRow = casting.spellSlots ? casting.spellSlots[String(level)] : null;
    if (slotRow) {
        Object.entries(slotRow).forEach(([spellLevel, count]) => {
            if (count > 0) maxSpellLevel = Math.max(maxSpellLevel, parseInt(spellLevel));
        });
    }

    let mode = 'known';
    let spellCount = 0;
    if (casting.spellbook) {
        mode = 'spellbook';
        spellCount = (casting.spellbookStart || 6) + (casting.spellsPerLevel || 2) * (level - 1);
    } else if (casting.spellsKnown && typeof casting.spellsKnown === 'object') {
        mode = 'known';
        spellCount = spellLookupByThreshold(casting.spellsKnown, level);
    } else if (casting.spellsPrepared || casting.spellsKnown === 'all_prepared') {
        mode = 'prepared';
        const abilityName = (casting.ability || 'Wisdom').toLowerCase();
        const mod = getAbilityModifierFor(abilityName);
        const effectiveLevel = HALF_CASTER_CLASSES.includes(clsEntry.className)
            ? Math.floor(level / 2)
            : level;
        spellCount = Math.max(1, effectiveLevel + mod);
    }

    if (cantrips === 0 && spellCount === 0 && maxSpellLevel === 0) return null;

    return {
        casting: casting,
        fromSubclass: castingInfo.fromSubclass,
        cantrips: cantrips,
        spellCount: spellCount,
        mode: mode,
        maxSpellLevel: maxSpellLevel
    };
}

/**
 * All catalog spells this class may pick from (class list + warlock patron
 * expansions), grouped: { options: [spell], expandedNames: Set }
 */
function getSpellOptionsForClass(clsEntry, budget) {
    const allSpells = AppData?.spellLookupInfo?.spellsData || [];
    const listName = (budget.casting.spellList || clsEntry.className);
    const listNameCap = listName.charAt(0).toUpperCase() + listName.slice(1);

    const subclassDisplay = getSubclassDisplayName(clsEntry);
    const expandedNames = new Set();

    const options = allSpells.filter(spell => {
        const lvl = spellCatalogLevel(spell);
        if (lvl > 9) return false;
        if (lvl > budget.maxSpellLevel && lvl !== 0) return false;
        if (lvl === 0 && budget.cantrips === 0) return false;

        const classList = (spell.class || '').split(',').map(c => c.trim());
        if (classList.includes(listNameCap)) {
            // Patron expansion spells were merged into the warlock class list
            // in the catalog (tagged with `patrons`); only the matching patron
            // actually gets them.
            if (clsEntry.className === 'warlock' && spell.patrons) {
                if (subclassDisplay && subclassMatchesField(subclassDisplay, spell.patrons)) {
                    expandedNames.add(spell.name);
                    return true;
                }
                return false;
            }
            return true;
        }

        // Patron spells the catalog didn't merge into the class list
        if (clsEntry.className === 'warlock' && subclassDisplay && spell.patrons &&
            subclassMatchesField(subclassDisplay, spell.patrons)) {
            expandedNames.add(spell.name);
            return true;
        }
        return false;
    });

    // Homebrew subclasses can expand the pickable list too (patron style)
    getHomebrewSubclassSpells(clsEntry, 'expanded').forEach(spell => {
        const lvl = spellCatalogLevel(spell);
        if (lvl > budget.maxSpellLevel && lvl !== 0) return;
        if (lvl === 0 && budget.cantrips === 0) return;
        expandedNames.add(spell.name);
        if (!options.some(s => s.name === spell.name)) options.push(spell);
    });

    return { options, expandedNames };
}

function getSubclassDisplayName(clsEntry) {
    if (!clsEntry.subclass) return null;
    const info = classesData?.classes?.[clsEntry.className];
    return info?.subclasses?.[clsEntry.subclass]?.name || clsEntry.subclass;
}

/** Loose match between a subclass name and a catalog tag field. */
function subclassMatchesField(subclassDisplay, fieldValue) {
    const tags = String(fieldValue).split(',').map(t => t.trim().toLowerCase());
    const name = subclassDisplay.toLowerCase();
    return tags.some(tag => tag && (name.includes(tag) || tag.includes(name)));
}

/**
 * Spells granted by a homebrew subclass's own spell list (created in the
 * sheet's Homebrew tab). `mode` picks which list: "prepared" (domain/oath
 * style, always prepared) or "expanded" (patron style, added to the class's
 * pickable options). Grants are gated by the class level they unlock at and
 * resolved case-insensitively against the loaded spell catalog.
 */
function getHomebrewSubclassSpells(clsEntry, mode) {
    const subclassInfo = classesData?.classes?.[clsEntry.className]?.subclasses?.[clsEntry.subclass];
    const block = subclassInfo?.subclassSpells;
    if (!block || block.mode !== mode) return [];

    const allSpells = AppData?.spellLookupInfo?.spellsData || [];
    const byName = new Map(allSpells.map(s => [s.name.toLowerCase(), s]));

    const result = [];
    const seen = new Set();
    Object.entries(block.byLevel || {}).forEach(([grantLevel, names]) => {
        if (parseInt(grantLevel) > (clsEntry.level || 1)) return;
        (names || []).forEach(name => {
            const spell = byName.get(String(name).toLowerCase());
            if (spell && !seen.has(spell.name)) {
                seen.add(spell.name);
                result.push(spell);
            }
        });
    });
    return result;
}

/**
 * Subclass spells that are always prepared and don't count against the
 * budget: cleric domains, paladin oaths, druid circles (catalog tags), plus
 * homebrew subclasses' "prepared" spell lists.
 */
function getAutoGrantedSpells(clsEntry, budget) {
    const allSpells = AppData?.spellLookupInfo?.spellsData || [];
    const granted = [];
    const seen = new Set();
    const add = spell => {
        const lvl = spellCatalogLevel(spell);
        if (lvl === 0 || lvl > budget.maxSpellLevel) return;
        if (seen.has(spell.name)) return;
        seen.add(spell.name);
        granted.push(spell);
    };

    // Built-in lists come from catalog tags matched to the subclass name
    const fieldByClass = { cleric: 'domains', paladin: 'oaths', druid: 'circles' };
    const field = fieldByClass[clsEntry.className];
    const subclassDisplay = getSubclassDisplayName(clsEntry);
    if (field && subclassDisplay) {
        allSpells.forEach(spell => {
            if (spell[field] && subclassMatchesField(subclassDisplay, spell[field])) {
                add(spell);
            }
        });
    }

    // Homebrew always-prepared lists live on the subclass itself
    getHomebrewSubclassSpells(clsEntry, 'prepared').forEach(add);

    return granted;
}

/** EK/AT: is this spell within the subclass's allowed schools? */
function isWithinSchoolRestrictions(spell, budget) {
    const allowed = budget.casting.restrictions?.schoolsAllowed;
    if (!allowed || spellCatalogLevel(spell) === 0) return true; // cantrips unrestricted
    return allowed.some(school => (spell.school || '').toLowerCase() === school.toLowerCase());
}

// ---------------------------------------------------------------------------
// Save integration
// ---------------------------------------------------------------------------

/**
 * Everything the creator puts into spellData, grouped by spellData level key:
 * { "Cantrip": [{name, prepared}], "1st-level": [...], ... }
 * Includes picked spells from every casting class plus auto-granted
 * domain/oath spells. Deduped by name.
 */
function collectCreatorSpellsByLevel() {
    const result = {};
    const seen = new Set();
    const allSpells = AppData?.spellLookupInfo?.spellsData || [];
    const byName = {};
    allSpells.forEach(s => { byName[s.name] = s; });

    const add = (name) => {
        if (seen.has(name)) return;
        const spell = byName[name];
        if (!spell) return;
        seen.add(name);
        const key = spellLevelKey(spellCatalogLevel(spell));
        if (!result[key]) result[key] = [];
        result[key].push({ name: name, prepared: 'true' });
    };

    const selections = getSpellSelectionsStore();
    const entries = typeof getClassEntriesForSave === 'function' ? getClassEntriesForSave() : [];

    entries.forEach(clsEntry => {
        const budget = getSpellBudgetForClass(clsEntry);
        if (!budget) return;

        const picks = selections[clsEntry.className] || { cantrips: [], spells: [] };
        (picks.cantrips || []).forEach(add);
        (picks.spells || []).forEach(add);
        getAutoGrantedSpells(clsEntry, budget).forEach(spell => add(spell.name));
    });

    return result;
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const SPELL_CASTING_TIME_LABELS = {
    '1A': '1 action',
    '1BA': '1 bonus action',
    '1R': '1 reaction',
    '1m': '1 minute',
    '10m': '10 minutes',
    '1Hr': '1 hour',
    '12Hr': '12 hours'
};

function formatSpellCastingTime(spell) {
    return SPELL_CASTING_TIME_LABELS[spell.casting_time] || spell.casting_time || '—';
}

function formatSpellComponents(spell) {
    let text = spell.components || '—';
    if (spell.material) {
        text += ` (${spell.material})`;
    }
    return text;
}

function formatSpellDuration(spell) {
    let text = spell.duration || '—';
    if (spell.concentration === 'yes' && !/concentration/i.test(text)) {
        text = `Concentration, ${text}`;
    }
    return text;
}

function isRitualSpell(spell) {
    return /R/i.test(spell.ritual || '');
}

function spellHeaderSubtitle(spell) {
    const levelText = spell.level === 'Cantrip'
        ? `${spell.school} cantrip`
        : `${spell.level.replace('-level', '')} level ${spell.school}`;
    return levelText + (isRitualSpell(spell) ? ' (ritual)' : '');
}

/**
 * One expandable spell card. The header carries the pick checkbox (when the
 * spell is pickable) and toggles the detail body open/closed.
 */
function buildSpellCard(spell, opts = {}) {
    const card = document.createElement('div');
    card.className = 'spell-card';

    // --- Header row ---
    const header = document.createElement('div');
    header.className = 'spell-card-header';

    let checkbox = null;
    if (opts.checkbox) {
        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'spell-card-checkbox';
        checkbox.checked = !!opts.checked;
        checkbox.addEventListener('change', () => {
            if (opts.onToggle) opts.onToggle(checkbox);
            card.classList.toggle('spell-card-selected', checkbox.checked);
        });
        // Padded label = big click target; clicking it toggles the checkbox
        // without also expanding the card
        const checkboxWrap = document.createElement('label');
        checkboxWrap.className = 'spell-card-checkbox-wrap';
        checkboxWrap.addEventListener('click', e => e.stopPropagation());
        checkboxWrap.appendChild(checkbox);
        header.appendChild(checkboxWrap);
        card.classList.toggle('spell-card-selected', !!opts.checked);
    }

    const titleWrap = document.createElement('div');
    titleWrap.className = 'spell-card-title';

    const nameEl = document.createElement('strong');
    nameEl.textContent = spell.name;
    titleWrap.appendChild(nameEl);

    const subEl = document.createElement('span');
    subEl.className = 'spell-card-subtitle';
    subEl.textContent = spellHeaderSubtitle(spell);
    titleWrap.appendChild(subEl);
    header.appendChild(titleWrap);

    // Badges are strings or { text, owned } (owned = spell already granted by
    // another class/subclass, styled green). Owned badges go under the title
    // so long source names don't squeeze the spell name on narrow panels.
    (opts.badges || []).forEach(badgeInfo => {
        const badge = document.createElement('span');
        const owned = typeof badgeInfo === 'object' && badgeInfo.owned;
        badge.className = 'spell-card-badge' + (owned ? ' spell-card-badge-owned' : '');
        badge.textContent = typeof badgeInfo === 'object' ? badgeInfo.text : badgeInfo;
        if (owned) {
            titleWrap.appendChild(badge);
            card.classList.add('spell-card-owned');
        } else {
            header.appendChild(badge);
        }
    });

    const chevron = document.createElement('span');
    chevron.className = 'spell-card-chevron';
    chevron.textContent = '▾';
    header.appendChild(chevron);

    // --- Detail body (built lazily on first expand) ---
    const details = document.createElement('div');
    details.className = 'spell-card-details hidden';
    let detailsBuilt = false;

    const buildDetails = () => {
        const stat = (label, value) => {
            const p = document.createElement('p');
            p.className = 'spell-stat';
            const strong = document.createElement('strong');
            strong.textContent = `${label}: `;
            p.appendChild(strong);
            p.appendChild(document.createTextNode(value));
            details.appendChild(p);
        };

        stat('Casting Time', formatSpellCastingTime(spell));
        stat('Range/Area', spell.range || '—');
        stat('Components', formatSpellComponents(spell));
        stat('Duration', formatSpellDuration(spell));
        if (spell.damage_dice) {
            stat('Damage', `${spell.damage_dice}${spell.damage_type_01 ? ` ${spell.damage_type_01}` : ''}`);
        }
        if (spell.page) stat('Source', spell.page);

        const desc = document.createElement('p');
        desc.className = 'spell-desc';
        desc.textContent = spell.desc || '';
        details.appendChild(desc);

        if (spell.higher_level) {
            const higher = document.createElement('p');
            higher.className = 'spell-desc';
            const em = document.createElement('em');
            em.textContent = 'At Higher Levels. ';
            higher.appendChild(em);
            higher.appendChild(document.createTextNode(spell.higher_level));
            details.appendChild(higher);
        }
    };

    header.addEventListener('click', () => {
        if (!detailsBuilt) {
            buildDetails();
            detailsBuilt = true;
        }
        const isOpen = !details.classList.contains('hidden');
        details.classList.toggle('hidden', isOpen);
        chevron.textContent = isOpen ? '▾' : '▴';
        card.classList.toggle('spell-card-open', !isOpen);
    });

    card.appendChild(header);
    card.appendChild(details);

    card.spellCheckbox = checkbox;
    return card;
}

/**
 * Which spells the character already has from each source: picked spells of
 * every casting class plus always-prepared subclass (domain/oath/circle)
 * spells. { spellName: [{ label, sourceKey }] } — sourceKey lets a class
 * section skip its own picks when badging duplicates.
 */
function buildSpellOwnershipMap(casters) {
    const map = {};
    const add = (name, label, sourceKey) => {
        if (!map[name]) map[name] = [];
        if (!map[name].some(e => e.sourceKey === sourceKey)) {
            map[name].push({ label, sourceKey });
        }
    };

    const selections = getSpellSelectionsStore();
    casters.forEach(({ clsEntry, budget }) => {
        const className = classesData?.classes?.[clsEntry.className]?.name || clsEntry.className;
        const picks = selections[clsEntry.className] || {};
        [...(picks.cantrips || []), ...(picks.spells || [])].forEach(name => {
            add(name, className, `picks:${clsEntry.className}`);
        });

        const subclassDisplay = getSubclassDisplayName(clsEntry);
        getAutoGrantedSpells(clsEntry, budget).forEach(spell => {
            add(spell.name, `${subclassDisplay} (always prepared)`, `auto:${clsEntry.className}`);
        });
    });
    return map;
}

async function displaySpellSelection() {
    const container = document.getElementById('spellsContent');
    if (!container) return;

    // Spell catalog loads during init; wait briefly if it isn't there yet
    for (let i = 0; i < 50 && !AppData?.spellLookupInfo?.spellsData; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const entries = typeof getClassEntriesForSave === 'function' ? getClassEntriesForSave() : [];
    const casters = entries
        .map(clsEntry => ({ clsEntry, budget: getSpellBudgetForClass(clsEntry) }))
        .filter(c => c.budget);

    container.innerHTML = '';

    if (casters.length === 0) {
        container.innerHTML = '<p class="equipment-note">No spellcasting available — pick a casting class ' +
            '(or reach the right level: Eldritch Knights and Arcane Tricksters start casting at level 3).</p>';
        return;
    }

    const ownershipMap = buildSpellOwnershipMap(casters);
    casters.forEach(({ clsEntry, budget }) => {
        container.appendChild(buildClassSpellSection(clsEntry, budget, ownershipMap));
    });
}

function buildClassSpellSection(clsEntry, budget, ownershipMap = {}) {
    const classInfo = classesData.classes[clsEntry.className];
    const className = classInfo?.name || clsEntry.className;
    const selections = getSpellSelectionsStore();
    if (!selections[clsEntry.className]) {
        selections[clsEntry.className] = { cantrips: [], spells: [] };
    }
    const picks = selections[clsEntry.className];

    // Drop picks that are no longer legal (level lowered, class changed)
    const { options, expandedNames } = getSpellOptionsForClass(clsEntry, budget);
    const legalNames = new Set(options.map(s => s.name));
    picks.cantrips = (picks.cantrips || []).filter(n => legalNames.has(n)).slice(0, budget.cantrips);
    picks.spells = (picks.spells || []).filter(n => legalNames.has(n)).slice(0, budget.spellCount);

    const section = document.createElement('div');
    section.className = 'spell-class-section';

    const title = document.createElement('h3');
    const subclassDisplay = getSubclassDisplayName(clsEntry);
    title.textContent = `${className}${budget.fromSubclass && subclassDisplay ? ` (${subclassDisplay})` : ''} — level ${clsEntry.level}`;
    section.appendChild(title);

    const modeText = {
        spellbook: 'spells in your spellbook',
        known: 'spells known',
        prepared: 'spells prepared'
    }[budget.mode];

    const counters = document.createElement('p');
    counters.className = 'spell-counters';
    section.appendChild(counters);

    const note = document.createElement('p');
    note.className = 'equipment-note';
    const noteParts = [`Casting ability: ${budget.casting.ability}.`];
    if (budget.maxSpellLevel > 0) noteParts.push(`Highest spell level: ${budget.maxSpellLevel}.`);
    if (budget.casting.restrictions?.schoolsAllowed) {
        noteParts.push(`Most picks must be ${budget.casting.restrictions.schoolsAllowed.join(' or ')} spells; ` +
            `spells marked (any school) use your unrestricted picks.`);
    }
    note.textContent = noteParts.join(' ');
    section.appendChild(note);

    const updateCounters = () => {
        const parts = [];
        if (budget.cantrips > 0) parts.push(`Cantrips: ${picks.cantrips.length}/${budget.cantrips}`);
        if (budget.spellCount > 0) parts.push(`${modeText}: ${picks.spells.length}/${budget.spellCount}`);
        counters.textContent = parts.join('  |  ');
        counters.className = 'spell-counters ' +
            ((picks.cantrips.length >= budget.cantrips && picks.spells.length >= budget.spellCount)
                ? 'spell-counters-complete' : '');
    };

    // Search box
    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'form-control spell-search';
    search.placeholder = 'Search spells...';
    section.appendChild(search);

    // Auto-granted subclass spells (always prepared, free)
    const autoGranted = getAutoGrantedSpells(clsEntry, budget);
    if (autoGranted.length > 0) {
        const autoBlock = document.createElement('details');
        autoBlock.className = 'spell-level-group';
        autoBlock.open = true;
        const summary = document.createElement('summary');
        summary.textContent = `${subclassDisplay} spells — always prepared, don't count against your total (${autoGranted.length})`;
        autoBlock.appendChild(summary);
        autoGranted
            .sort((a, b) => spellCatalogLevel(a) - spellCatalogLevel(b) || a.name.localeCompare(b.name))
            .forEach(spell => {
                autoBlock.appendChild(buildSpellCard(spell, { badges: ['always prepared'] }));
            });
        section.appendChild(autoBlock);
    }

    // Pickable spells grouped by level
    const checkboxRefs = [];
    const maxGroupLevel = budget.spellCount > 0 ? budget.maxSpellLevel : 0;
    for (let lvl = 0; lvl <= maxGroupLevel; lvl++) {
        if (lvl === 0 && budget.cantrips === 0) continue;

        const groupSpells = options
            .filter(s => spellCatalogLevel(s) === lvl)
            .sort((a, b) => a.name.localeCompare(b.name));
        if (groupSpells.length === 0) continue;

        const group = document.createElement('details');
        group.className = 'spell-level-group';
        group.open = (lvl === 0 || lvl === 1);
        const summary = document.createElement('summary');
        summary.textContent = lvl === 0 ? `Cantrips (${groupSpells.length})` : `Level ${lvl} (${groupSpells.length})`;
        group.appendChild(summary);

        groupSpells.forEach(spell => {
            const isCantrip = lvl === 0;
            const pool = isCantrip ? picks.cantrips : picks.spells;
            const limit = isCantrip ? budget.cantrips : budget.spellCount;

            const badges = [];
            if (expandedNames.has(spell.name)) badges.push('subclass list');
            if (!isWithinSchoolRestrictions(spell, budget)) badges.push('any school');

            // Flag spells the character already has from elsewhere (another
            // class's picks, or an always-prepared subclass list). Still
            // selectable — just make the duplicate obvious.
            const otherSources = (ownershipMap[spell.name] || [])
                .filter(e => e.sourceKey !== `picks:${clsEntry.className}`);
            otherSources.forEach(e => {
                badges.push({ text: `already have: ${e.label}`, owned: true });
            });

            const card = buildSpellCard(spell, {
                checkbox: true,
                checked: pool.includes(spell.name),
                badges: badges,
                onToggle: (checkbox) => {
                    const currentPool = isCantrip ? picks.cantrips : picks.spells;
                    if (checkbox.checked) {
                        if (currentPool.length >= limit) {
                            checkbox.checked = false;
                            showError(`You can only pick ${limit} ${isCantrip ? 'cantrips' : modeText} for ${className}.`);
                            return;
                        }
                        currentPool.push(spell.name);
                    } else {
                        const idx = currentPool.indexOf(spell.name);
                        if (idx > -1) currentPool.splice(idx, 1);
                    }
                    updateCounters();
                }
            });

            group.appendChild(card);
            checkboxRefs.push({ row: card, group, name: spell.name.toLowerCase() });
        });

        section.appendChild(group);
    }

    // Search filtering
    search.addEventListener('input', () => {
        const term = search.value.trim().toLowerCase();
        const openGroups = new Set();
        checkboxRefs.forEach(ref => {
            const match = !term || ref.name.includes(term);
            ref.row.style.display = match ? '' : 'none';
            if (match && term) openGroups.add(ref.group);
        });
        if (term) {
            checkboxRefs.forEach(ref => { ref.group.open = openGroups.has(ref.group); });
        }
    });

    updateCounters();
    return section;
}
