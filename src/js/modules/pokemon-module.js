const pokemonCatalogSearch = document.getElementById("pokemonCatalogSearch");
const pokemonOwnedHAFilter = document.getElementById("pokemonOwnedHAFilter");
const pokemonGenerationFilter = document.getElementById("pokemonGenerationFilter");
const pokemonEggGroupFilter = document.getElementById("pokemonEggGroupFilter");
const pokemonRegionalFormFilter = document.getElementById("pokemonRegionalFormFilter");
const pokemonCatalogGrid = document.getElementById("pokemonCatalogGrid");

const pokemonDetailsModal = document.getElementById("pokemonDetailsModal");
const pokemonDetailsContent = document.getElementById("pokemonDetailsContent");

const pokemonCatalogCounter = document.getElementById("pokemonCatalogCounter");
const pokemonCatalogPageSize = document.getElementById("pokemonCatalogPageSize");
const pokemonCatalogPagination = document.getElementById("pokemonCatalogPagination");
const pokemonCatalogPaginationBottom = document.getElementById("pokemonCatalogPaginationBottom");

const ownedHAModal = document.getElementById("ownedHAModal");
const ownedHAList = document.getElementById("ownedHAList");
const ownedHAListSearch = document.getElementById("ownedHAListSearch");
const ownedHAListNature = document.getElementById("ownedHAListNature");
const ownedHAListRegionalForm = document.getElementById("ownedHAListRegionalForm");

const ownedPokemonsModal = document.getElementById("ownedPokemonsModal");
const ownedPokemonFormModal = document.getElementById("ownedPokemonFormModal");
const ownedPokemonsList = document.getElementById("ownedPokemonsList");
const ownedPokemonListSearch = document.getElementById("ownedPokemonListSearch");
const ownedPokemonListBreedLevel = document.getElementById("ownedPokemonListBreedLevel");
const ownedPokemonListGender = document.getElementById("ownedPokemonListGender");
const ownedPokemonListNature = document.getElementById("ownedPokemonListNature");
const ownedPokemonListRegionalForm = document.getElementById("ownedPokemonListRegionalForm");

const ownedPokemonFormTitle = document.getElementById("ownedPokemonFormTitle");
const ownedPokemonSearch = document.getElementById("ownedPokemonSearch");
const ownedPokemonSearchResults = document.getElementById("ownedPokemonSearchResults");
const ownedPokemonSelectedSummary = document.getElementById("ownedPokemonSelectedSummary");
const ownedPokemonBreedLevel = document.getElementById("ownedPokemonBreedLevel");
const ownedPokemonGender = document.getElementById("ownedPokemonGender");
const ownedPokemonNature = document.getElementById("ownedPokemonNature");
const ownedPokemonRegionalFormWrapper = document.getElementById("ownedPokemonRegionalFormWrapper");
const ownedPokemonRegionalForm = document.getElementById("ownedPokemonRegionalForm");
const ownedPokemonNotes = document.getElementById("ownedPokemonNotes");
const btnSaveOwnedPokemon = document.getElementById("btnSaveOwnedPokemon");
const btnCancelOwnedPokemonEdit = document.getElementById("btnCancelOwnedPokemonEdit");

const addOwnedHAModal = document.getElementById("addOwnedHAModal");
const addOwnedHASummary = document.getElementById("addOwnedHASummary");
const ownedHACastratedPrice = document.getElementById("ownedHACastratedPrice");
const ownedHABreedablePrice = document.getElementById("ownedHABreedablePrice");
const ownedHANature = document.getElementById("ownedHANature");
const ownedHARegionalFormWrapper = document.getElementById("ownedHARegionalFormWrapper");
const ownedHARegionalForm = document.getElementById("ownedHARegionalForm");
const ownedHANotes = document.getElementById("ownedHANotes");

const manualHASelector = document.getElementById("manualHASelector");
const manualHASearch = document.getElementById("manualHASearch");
const manualHASearchResults = document.getElementById("manualHASearchResults");
const btnSaveOwnedHA = document.getElementById("btnSaveOwnedHA");

let pokedexCatalog = [];
let currentPokemonCatalogPage = 1;

let pokemonDetailsAnimationDirection = "none";

let selectedHAPokemonId = null;
let selectedOwnedHAId = null;

let addHAOrigin = "pokemon-details";
let addHAOrderRow = null;

let isManualHAFlow = false;

let selectedOwnedPokemonDexId = null;
let editingOwnedPokemonId = null;

// LOAD POKEMON CATALOG
async function loadPokemonCatalog() {
    const response = await fetch("./src/data/pokedex.json");
    pokedexCatalog = await response.json();

    populateEggGroupFilter();
    renderPokemonCatalog();
}

// NORMALIZE EGG GROUP
function normalizeEggGroup(eggGroup) {
    const normalized = String(eggGroup).trim();

    const map = {
        Water1: "Water 1",
        Water2: "Water 2",
        Water3: "Water 3",
        Humanshape: "Human-Like",
        Indeterminate: "Amorphous",
        "No Eggs": "Undiscovered"
    };

    return map[normalized] || normalized;
}

// GET POKEMON GENERATION
function getPokemonGeneration(pokemonId) {
    if (pokemonId <= 151) return "1";
    if (pokemonId <= 251) return "2";
    if (pokemonId <= 386) return "3";
    if (pokemonId <= 493) return "4";
    if (pokemonId <= 649) return "5";
    if (pokemonId <= 721) return "6";
    if (pokemonId <= 809) return "7";
    if (pokemonId <= 905) return "8";
    return "9";
}

// POPULATE EGG GROUP FILTER
function populateEggGroupFilter() {
    const eggGroups = new Set();

    pokedexCatalog.forEach((pokemon) => {
        pokemon.profile?.egg?.forEach((eggGroup) => {
            eggGroups.add(normalizeEggGroup(eggGroup));
        });
    });

    [...eggGroups].sort().forEach((eggGroup) => {
        const option = document.createElement("option");
        option.value = eggGroup;
        option.textContent = eggGroup;

        pokemonEggGroupFilter.appendChild(option);
    });
}

// GET FILTERED POKEMON CATALOG
function getFilteredPokemonCatalog() {
    const searchTerm = pokemonCatalogSearch.value.toLowerCase().trim();
    const selectedOwnedHAFilter = pokemonOwnedHAFilter.value;
    const selectedGeneration = pokemonGenerationFilter.value;
    const selectedEggGroup = pokemonEggGroupFilter.value;
    const selectedRegionalForm = pokemonRegionalFormFilter.value;

    return pokedexCatalog.filter((pokemon) => {
        const matchesSearch =
            pokemon.name.english.toLowerCase().includes(searchTerm) ||
            String(pokemon.id).includes(searchTerm);

        const matchesGeneration =
            selectedGeneration === "all" || getPokemonGeneration(pokemon.id) === selectedGeneration;

        const matchesEggGroup =
            selectedEggGroup === "all" ||
            pokemon.profile?.egg?.some((eggGroup) => {
                return normalizeEggGroup(eggGroup) === selectedEggGroup;
            });

        const regionalForms = getPokemonRegionalForms(pokemon.id);

        const matchesRegionalForm =
            selectedRegionalForm === "all" ||
            (selectedRegionalForm === "with-regional-form" && regionalForms.length > 0) ||
            regionalForms.some((form) => {
                if (selectedRegionalForm === "PALDEA") {
                    return form.value.startsWith("PALDEA");
                }

                if (selectedRegionalForm === "HISUI") {
                    return form.value.startsWith("HISUI");
                }

                return form.value === selectedRegionalForm;
            });

        const pokemonHasHA = Boolean(getPokemonHiddenAbility(pokemon));
        const hasOwnedHA = hasOwnedHiddenAbility(pokemon);

        const matchesOwnedHA =
            selectedOwnedHAFilter === "all" ||
            (selectedOwnedHAFilter === "owned" && hasOwnedHA) ||
            (selectedOwnedHAFilter === "missing" && pokemonHasHA && !hasOwnedHA);

        return (
            matchesSearch &&
            matchesGeneration &&
            matchesEggGroup &&
            matchesRegionalForm &&
            matchesOwnedHA
        );
    });
}

// RENDER POKEMON CATALOG
function renderPokemonCatalog() {
    const filteredPokemons = getFilteredPokemonCatalog();

    const pageSize = Number(pokemonCatalogPageSize.value);
    const totalPokemons = filteredPokemons.length;
    const totalPages = Math.max(Math.ceil(totalPokemons / pageSize), 1);

    if (currentPokemonCatalogPage > totalPages) {
        currentPokemonCatalogPage = totalPages;
    }

    const startIndex = (currentPokemonCatalogPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalPokemons);
    const paginatedPokemons = filteredPokemons.slice(startIndex, endIndex);

    if (filteredPokemons.length === 0) {
        pokemonCatalogCounter.textContent = "Exibindo pokémons de 0 a 0 de 0 totais";

        pokemonCatalogPagination.innerHTML = "";
        pokemonCatalogPaginationBottom.innerHTML = "";

        pokemonCatalogGrid.innerHTML = `
            <p class="empty-state">
                Nenhum Pokémon encontrado.
            </p>
        `;

        return;
    }

    pokemonCatalogCounter.textContent = `Exibindo pokémons de ${startIndex + 1} a ${endIndex} de ${totalPokemons} totais`;

    const paginationHtml = createPokemonCatalogPagination(totalPages);

    pokemonCatalogPagination.innerHTML = paginationHtml;
    pokemonCatalogPaginationBottom.innerHTML = paginationHtml;

    pokemonCatalogGrid.innerHTML = paginatedPokemons
        .map((pokemon) => createPokemonCatalogCard(pokemon))
        .join("");
}

// RESET POKEMON CATALOG PAGE
function resetPokemonCatalogPage() {
    currentPokemonCatalogPage = 1;

    renderPokemonCatalog();
}

// CHANGE POKEMON CATALOG PAGE
function changePokemonCatalogPage(page) {
    const pageSize = Number(pokemonCatalogPageSize.value);
    const totalPages = Math.max(Math.ceil(getFilteredPokemonCatalog().length / pageSize), 1);

    currentPokemonCatalogPage = Math.min(Math.max(Number(page), 1), totalPages);

    renderPokemonCatalog();
}

// CREATE POKEMON CATALOG PAGINATION
function createPokemonCatalogPagination(totalPages) {
    if (totalPages <= 1) {
        return "";
    }

    const pages = getPokemonCatalogPaginationPages(totalPages);

    return `
        <button
            type="button"
            onclick="changePokemonCatalogPage(1)"
            ${currentPokemonCatalogPage === 1 ? "disabled" : ""}>
            &lt;&lt;&lt;
        </button>

        <button
            type="button"
            onclick="changePokemonCatalogPage(${currentPokemonCatalogPage - 1})"
            ${currentPokemonCatalogPage === 1 ? "disabled" : ""}>
            &lt;
        </button>

        ${pages
            .map(
                (page) => `
                    <button
                        type="button"
                        class="${page === currentPokemonCatalogPage ? "active" : ""}"
                        onclick="changePokemonCatalogPage(${page})">
                        ${page}
                    </button>
                `
            )
            .join("")}

        <button
            type="button"
            onclick="changePokemonCatalogPage(${currentPokemonCatalogPage + 1})"
            ${currentPokemonCatalogPage === totalPages ? "disabled" : ""}>
            &gt;
        </button>

        <button
            type="button"
            onclick="changePokemonCatalogPage(${totalPages})"
            ${currentPokemonCatalogPage === totalPages ? "disabled" : ""}>
            &gt;&gt;&gt;
        </button>
    `;
}

// GET POKEMON CATALOG PAGINATION PAGES
function getPokemonCatalogPaginationPages(totalPages) {
    const pages = new Set();

    pages.add(1);

    for (let page = currentPokemonCatalogPage - 1; page <= currentPokemonCatalogPage + 1; page++) {
        if (page > 1 && page < totalPages) {
            pages.add(page);
        }
    }

    if (totalPages > 1) {
        pages.add(totalPages);
    }

    return [...pages].sort((a, b) => a - b);
}

// CREATE POKEMON REGIONAL FORMS BADGES HTML
function createPokemonRegionalFormsBadgesHtml(pokemon) {
    const regionalForms = getPokemonRegionalForms(pokemon.id);

    if (regionalForms.length === 0) {
        return "";
    }

    return `
        <div class="pokemon-card-info pokemon-regional-forms-info">
            <strong>Formas regionais</strong>

            <div class="pokemon-regional-form-tags">
                ${regionalForms.map((form) => `<span>${form.label}</span>`).join("")}
            </div>
        </div>
    `;
}

// CREATE POKEMON CATALOG CARD
function createPokemonCatalogCard(pokemon) {
    const types = pokemon.type
        .map((type) => `<span class="pokemon-type type-${type.toLowerCase()}">${type}</span>`)
        .join("");

    const eggGroups = pokemon.profile?.egg?.length
        ? pokemon.profile.egg.map((egg) => `<span>${egg}</span>`).join("")
        : "<span>-</span>";

    const abilities = pokemon.profile?.ability?.length
        ? pokemon.profile.ability
              .map((ability) => {
                  const abilityName = Array.isArray(ability) ? ability[0] : ability;
                  const isHA = Array.isArray(ability) && ability[1] === "true";

                  return `
                        <span>
                            ${abilityName}
                            ${isHA ? `<small class="pokemon-ha-label">(<span>HA</span>)</small>` : ""}
                        </span>
                    `;
              })
              .join("")
        : "<span>-</span>";

    return `
        <article class="pokemon-catalog-card">
            <div class="pokemon-catalog-image-wrapper">
                <img
                    src="${getPokemonThumbnail(pokemon.id)}"
                    alt="${pokemon.name.english}"
                    class="pokemon-catalog-image"
                />
            </div>

            <div class="pokemon-catalog-content">
                <span class="pokemon-catalog-id">
                    #${String(pokemon.id).padStart(3, "0")}
                </span>

                <h3>
                    ${pokemon.name.english}
                </h3>

                <div class="pokemon-types">
                    ${types}
                </div>

                <div class="pokemon-card-info">
                    <strong>Egg Groups</strong>
                    <div>${eggGroups}</div>
                </div>

                ${createPokemonRegionalFormsBadgesHtml(pokemon)}

                <div class="pokemon-card-info">
                    <strong>Abilities</strong>
                    <div>${abilities}</div>
                </div>

                <button
                    type="button"
                    class="button-secondary"
                    onclick="openPokemonDetails(${pokemon.id})">
                    Ver Detalhes
                </button>
            </div>
        </article>
    `;
}

// OPEN POKEMON DETAILS
function openPokemonDetails(pokemonId) {
    const pokemon = pokedexCatalog.find((item) => Number(item.id) === Number(pokemonId));

    if (!pokemon) {
        return;
    }

    pokemonDetailsContent.innerHTML = createPokemonDetailsContent(pokemon);

    pokemonDetailsContent.classList.remove("pokemon-slide-from-left", "pokemon-slide-from-right");

    void pokemonDetailsContent.offsetWidth;

    if (pokemonDetailsAnimationDirection === "previous") {
        pokemonDetailsContent.classList.add("pokemon-slide-from-left");
    }

    if (pokemonDetailsAnimationDirection === "next") {
        pokemonDetailsContent.classList.add("pokemon-slide-from-right");
    }

    pokemonDetailsAnimationDirection = "none";

    openModal(pokemonDetailsModal);

    const modalContent = pokemonDetailsModal.querySelector(".modal-content");

    modalContent.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// CLOSE POKEMON DETAILS
function closePokemonDetails() {
    closeModal(pokemonDetailsModal);

    pokemonDetailsContent.innerHTML = "";
}

// SETUP POKEMON CATALOG EVENTS
function setupPokemonCatalogEvents() {
    pokemonCatalogSearch.addEventListener("input", resetPokemonCatalogPage);
    pokemonOwnedHAFilter.addEventListener("change", resetPokemonCatalogPage);
    pokemonGenerationFilter.addEventListener("change", resetPokemonCatalogPage);
    pokemonEggGroupFilter.addEventListener("change", resetPokemonCatalogPage);
    pokemonRegionalFormFilter.addEventListener("change", resetPokemonCatalogPage);
    pokemonCatalogPageSize.addEventListener("change", resetPokemonCatalogPage);
}

// CREATE POKEMON DETAILS EVOLUTION NAV HTML
function createPokemonDetailsSequentialNavHtml(pokemon) {
    const currentIndex = pokedexCatalog.findIndex((item) => {
        return Number(item.id) === Number(pokemon.id);
    });

    const previousPokemon = currentIndex > 0 ? pokedexCatalog[currentIndex - 1] : null;

    const nextPokemon =
        currentIndex < pokedexCatalog.length - 1 ? pokedexCatalog[currentIndex + 1] : null;

    return `
        <div class="pokemon-details-sequential-nav">
            ${
                previousPokemon
                    ? createPokemonSequentialNavCard(previousPokemon, "previous")
                    : `<div class="pokemon-details-sequential-placeholder"></div>`
            }

            ${createPokemonSequentialNavCard(pokemon, "current")}

            ${
                nextPokemon
                    ? createPokemonSequentialNavCard(nextPokemon, "next")
                    : `<div class="pokemon-details-sequential-placeholder"></div>`
            }
        </div>
    `;
}

// CREATE POKEMON SEQUENTIAL NAV CARD
function createPokemonSequentialNavCard(pokemon, position) {
    const isCurrent = position === "current";

    return `
        <button
            type="button"
            class="pokemon-details-sequential-card ${isCurrent ? "active" : ""}"
            ${
                isCurrent
                    ? `disabled`
                    : `onclick="navigatePokemonDetails(${pokemon.id}, '${position}')"`
            }>

            <img
                src="${getPokemonThumbnail(pokemon.id)}"
                alt="${pokemon.name.english}"
            />

            <span>
                #${String(pokemon.id).padStart(3, "0")}
            </span>

            <strong>
                ${pokemon.name.english}
            </strong>
        </button>
    `;
}

// CREATE POKEMON REGIONAL FORMS DETAILS HTML
function createPokemonRegionalFormsDetailsHtml(pokemon) {
    const regionalForms = getPokemonRegionalForms(pokemon.id);

    if (regionalForms.length === 0) {
        return "";
    }

    return `
        <div class="pokemon-details-section pokemon-regional-forms-section">
            <h3>Formas Regionais</h3>

            <div class="pokemon-regional-forms-grid">
                ${regionalForms
                    .map((form) => {
                        return `
                            <article class="pokemon-regional-form-card">
                                <img
                                    src="${form.sprite}"
                                    alt="${form.displayName}">

                                <div>
                                    <strong>${form.displayName}</strong>
                                    <span>${form.label}</span>
                                </div>
                            </article>
                        `;
                    })
                    .join("")}
            </div>
        </div>
    `;
}

// CREATE POKEMON DETAILS CONTENT
function createPokemonDetailsContent(pokemon) {
    const types = pokemon.type
        .map((type) => `<span class="pokemon-type type-${type.toLowerCase()}">${type}</span>`)
        .join("");

    const abilities = createPokemonAbilitiesHtml(pokemon);
    const eggGroups = createPokemonEggGroupsHtml(pokemon);
    const stats = createPokemonStatsHtml(pokemon);

    const evolutionChain = createPokemonEvolutionChainHtml(pokemon);

    const sequentialNav = createPokemonDetailsSequentialNavHtml(pokemon);

    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    const regionalFormsDetails = createPokemonRegionalFormsDetailsHtml(pokemon);

    return `
        ${sequentialNav}

        <div class="pokemon-details-header">
            <div class="pokemon-details-image-wrapper">
                <img
                    src="${getPokemonThumbnail(pokemon.id)}"
                    alt="${pokemon.name.english}"
                    class="pokemon-details-image"
                />
            </div>

            <div class="pokemon-details-main-info">
                <span class="pokemon-catalog-id">
                    #${String(pokemon.id).padStart(3, "0")}
                </span>

                <h2>
                    ${pokemon.name.english}
                </h2>

                <div class="pokemon-types">
                    ${types}
                </div>

                <div class="pokemon-details-action-buttons">
                    <button
                        type="button"
                        class="button-primary"
                        onclick="openAddOwnedPokemonFromDetails(${pokemon.id})">
                        Adicionar aos meus Pokémons
                    </button>

                    ${
                        hiddenAbility && !hasOwnedHiddenAbility(pokemon)
                            ? `
                                <button
                                    type="button"
                                    class="button-ha pokemon-add-ha-button"
                                    onclick="openAddOwnedHAModal(${pokemon.id})">
                                    Adicionar aos meus HAs
                                </button>
                            `
                            : ""
                    }
                </div>

                <p class="pokemon-description">
                    ${pokemon.description || "Sem descrição disponível."}
                </p>
            </div>
        </div>

        ${regionalFormsDetails}

        <div class="pokemon-details-grid">
            <div class="pokemon-details-section pokemon-info-section">
                <h3>Informações</h3>

                <div class="pokemon-info-grid">
                    <div class="pokemon-info-list">
                        <p><strong>Espécie:</strong> ${pokemon.species || "-"}</p>
                        <p><strong>Altura:</strong> ${pokemon.profile?.height || "-"}</p>
                        <p><strong>Peso:</strong> ${pokemon.profile?.weight || "-"}</p>
                        <p><strong>Gênero:</strong> ${formatPokemonGender(pokemon.profile?.gender)}</p>
                    </div>

                    <div class="pokemon-info-side">
                        <div>
                            <h4>Abilities</h4>
                            <div class="pokemon-details-tags">
                                ${abilities}
                            </div>
                        </div>

                        <div>
                            <h4>Egg Groups</h4>
                            <div class="pokemon-details-tags">
                                ${eggGroups}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pokemon-details-section pokemon-stats-section">
                <h3>Base Stats</h3>

                <div class="pokemon-stats-list">
                    ${stats}
                </div>
            </div>

            <div class="pokemon-details-section pokemon-evolution-section">
                <h3>Linha Evolutiva</h3>

                <div class="pokemon-evolution-chain">
                    ${evolutionChain}
                </div>
            </div>
        </div>
    `;
}

// CREATE POKEMON ABILITIES HTML
function createPokemonAbilitiesHtml(pokemon) {
    if (!pokemon.profile?.ability?.length) {
        return "<span>-</span>";
    }

    return pokemon.profile.ability
        .map((ability) => {
            const abilityName = Array.isArray(ability) ? ability[0] : ability;
            const isHA = Array.isArray(ability) && ability[1] === "true";

            return `
                <span>
                    ${abilityName}
                    ${isHA ? `<small class="pokemon-ha-label">(<span>HA</span>)</small>` : ""}
                </span>
            `;
        })
        .join("");
}

// CREATE POKEMON EGG GROUPS HTML
function createPokemonEggGroupsHtml(pokemon) {
    if (!pokemon.profile?.egg?.length) {
        return "<span>-</span>";
    }

    return pokemon.profile.egg.map((eggGroup) => `<span>${eggGroup}</span>`).join("");
}

// CREATE POKEMON STATS HTML
function createPokemonStatsHtml(pokemon) {
    if (!pokemon.base) {
        return "<p>Stats não disponíveis.</p>";
    }

    return Object.entries(pokemon.base)
        .map(([statName, statValue]) => {
            const percentage = Math.min((Number(statValue) / 180) * 100, 100);
            const statClass = getStatBarClass(Number(statValue));

            return `
                <div class="pokemon-stat-row">
                    <span class="pokemon-stat-name">
                        ${formatPokemonStatName(statName)}
                    </span>

                    <span class="pokemon-stat-value">
                        ${statValue}
                    </span>

                    <div class="pokemon-stat-bar">
                        <div
                            class="pokemon-stat-bar-fill ${statClass}"
                            style="width: ${percentage}%;">
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}

// FORMAT POKEMON STAT NAME
function formatPokemonStatName(statName) {
    const statMap = {
        HP: "HP",
        Attack: "Attack",
        Defense: "Defense",
        "Sp. Attack": "Sp. Atk",
        "Sp. Defense": "Sp. Def",
        Speed: "Speed"
    };

    return statMap[statName] || statName;
}

// GET STAT BAR CLASS
function getStatBarClass(statValue) {
    if (statValue < 70) {
        return "stat-low";
    }

    if (statValue < 100) {
        return "stat-medium";
    }

    if (statValue < 130) {
        return "stat-high";
    }

    return "stat-very-high";
}

// GET POKEMON BY ID
function getPokemonById(pokemonId) {
    return pokedexCatalog.find((pokemon) => Number(pokemon.id) === Number(pokemonId));
}

// GET EVOLUTION CHAIN
function getEvolutionChain(pokemon) {
    const basePokemon = getBaseEvolutionPokemon(pokemon);
    const chain = [];

    collectEvolutionBranch(basePokemon, chain);

    pokedexCatalog.forEach((candidatePokemon) => {
        const candidateBasePokemon = getBaseEvolutionPokemon(candidatePokemon);

        if (Number(candidateBasePokemon?.id) === Number(basePokemon?.id)) {
            const alreadyExists = chain.some((item) => {
                return Number(item.id) === Number(candidatePokemon.id);
            });

            if (!alreadyExists) {
                chain.push(candidatePokemon);
            }
        }
    });

    const currentAlreadyExists = chain.some((item) => {
        return Number(item.id) === Number(pokemon.id);
    });

    if (!currentAlreadyExists) {
        chain.push(pokemon);
    }

    return chain.sort((a, b) => Number(a.id) - Number(b.id));
}

// GET BASE EVOLUTION POKEMON
function getBaseEvolutionPokemon(pokemon) {
    let currentPokemon = pokemon;

    while (currentPokemon?.evolution?.prev) {
        const previousPokemonId = currentPokemon.evolution.prev[0];
        currentPokemon = getPokemonById(previousPokemonId);
    }

    return currentPokemon;
}

// COLLECT EVOLUTION BRANCH
function collectEvolutionBranch(pokemon, chain) {
    if (!pokemon) {
        return;
    }

    const alreadyExists = chain.some((item) => Number(item.id) === Number(pokemon.id));

    if (!alreadyExists) {
        chain.push(pokemon);
    }

    const nextEvolutions = pokemon.evolution?.next || [];

    nextEvolutions.forEach((nextEvolution) => {
        const nextPokemonId = nextEvolution[0];
        const nextPokemon = getPokemonById(nextPokemonId);

        collectEvolutionBranch(nextPokemon, chain);
    });
}

// GET EVOLUTION METHOD
function getEvolutionMethod(fromPokemon, toPokemon) {
    const nextEvolution = fromPokemon.evolution?.next?.find((evolution) => {
        return Number(evolution[0]) === Number(toPokemon.id);
    });

    return nextEvolution?.[1] || "";
}

// CREATE POKEMON EVOLUTION CHAIN HTML
function createPokemonEvolutionChainHtml(pokemon) {
    const evolutionChain = getEvolutionChain(pokemon);

    if (evolutionChain.length <= 1) {
        return `
            <p class="empty-state">
                Este Pokémon não possui evolução registrada.
            </p>
        `;
    }

    return evolutionChain
        .map((chainPokemon, index) => {
            const previousPokemon = evolutionChain[index - 1];
            const evolutionMethod = previousPokemon
                ? getEvolutionMethod(previousPokemon, chainPokemon)
                : "";

            return `
                <button
                    type="button"
                    class="pokemon-evolution-card ${
                        Number(chainPokemon.id) === Number(pokemon.id) ? "active" : ""
                    }"
                    onclick="openPokemonDetails(${chainPokemon.id})">

                    <img
                        src="${getPokemonThumbnail(chainPokemon.id)}"
                        alt="${chainPokemon.name.english}"
                    />

                    <span class="pokemon-evolution-id">
                        #${String(chainPokemon.id).padStart(3, "0")}
                    </span>

                    <strong>
                        ${chainPokemon.name.english}
                    </strong>

                    ${
                        evolutionMethod
                            ? `
                                <small class="pokemon-evolution-method">
                                    ${evolutionMethod}
                                </small>
                            `
                            : ""
                    }
                </button>
            `;
        })
        .join("");
}

// FORMAT POKEMON GENDER
function formatPokemonGender(gender) {
    if (!gender || gender === "-" || gender.toLowerCase() === "genderless") {
        return `
            <span class="pokemon-gender pokemon-genderless">
                Genderless
            </span>
        `;
    }

    if (!gender.includes(":")) {
        return gender;
    }

    const [maleValue, femaleValue] = gender.split(":").map((value) => Number(value));

    if (Number.isNaN(maleValue) || Number.isNaN(femaleValue)) {
        return gender;
    }

    if (maleValue === 0 && femaleValue === 100) {
        return `
            <span class="pokemon-gender pokemon-gender-female">
                100% <small>(F)</small>
            </span>
        `;
    }

    if (maleValue === 100 && femaleValue === 0) {
        return `
            <span class="pokemon-gender pokemon-gender-male">
                100% <small>(M)</small>
            </span>
        `;
    }

    return `
        <span class="pokemon-gender pokemon-gender-male">
            ${maleValue}% <small>(M)</small>
        </span>

        <span class="pokemon-gender-separator">/</span>

        <span class="pokemon-gender pokemon-gender-female">
            ${femaleValue}% <small>(F)</small>
        </span>
    `;
}

// GET PREVIOUS POKEMON
function getPreviousPokemon(pokemonId) {
    const currentIndex = pokedexCatalog.findIndex(
        (pokemon) => Number(pokemon.id) === Number(pokemonId)
    );

    if (currentIndex <= 0) {
        return null;
    }

    return pokedexCatalog[currentIndex - 1];
}

// GET NEXT POKEMON
function getNextPokemon(pokemonId) {
    const currentIndex = pokedexCatalog.findIndex(
        (pokemon) => Number(pokemon.id) === Number(pokemonId)
    );

    if (currentIndex >= pokedexCatalog.length - 1) {
        return null;
    }

    return pokedexCatalog[currentIndex + 1];
}

// NAVIGATE POKEMON DETAILS
function navigatePokemonDetails(pokemonId, direction) {
    pokemonDetailsAnimationDirection = direction;
    openPokemonDetails(pokemonId);
}

// OPEN OWNED HA MODAL
function openOwnedHAModal() {
    populateOwnedManagementNatureFilters();
    renderOwnedHAList();

    openModal(ownedHAModal);
}

// CLOSE OWNED HA MODAL
function closeOwnedHAModal() {
    closeModal(ownedHAModal);
}

// FORMAT POKEMON NATURE LABEL
function formatPokemonNatureLabel(natureName) {
    const nature = getNatureByName(natureName);

    if (!nature) {
        return natureName || "Não definida";
    }

    if (nature.neutral) {
        return `${nature.name} (Neutral)`;
    }

    return `${nature.name} (+${nature.positive}, -${nature.negative})`;
}

// POPULATE OWNED MANAGEMENT NATURE FILTERS
function populateOwnedManagementNatureFilters() {
    [ownedPokemonListNature, ownedHAListNature].forEach((select) => {
        if (!select || select.dataset.populated === "true") {
            return;
        }

        POKEMON_NATURES.forEach((nature) => {
            const option = document.createElement("option");

            option.value = nature.name;
            option.textContent = formatPokemonNatureLabel(nature.name);

            select.appendChild(option);
        });

        select.dataset.populated = "true";
    });
}

// OPEN OWNED POKEMONS MODAL
function openOwnedPokemonsModal() {
    populateOwnedManagementNatureFilters();
    renderOwnedPokemonsList();

    openModal(ownedPokemonsModal);
}

// OPEN ADD OWNED POKEMON FROM DETAILS
function openAddOwnedPokemonFromDetails(pokemonId) {
    const pokemon = getPokemonById(pokemonId);

    if (!pokemon) {
        showWarningToast("Pokémon não encontrado.");
        return;
    }

    closePokemonDetails();

    openAddOwnedPokemonModal(pokemonId);
}

// CLOSE OWNED POKEMONS MODAL
function closeOwnedPokemonsModal() {
    closeModal(ownedPokemonsModal);

    resetOwnedPokemonForm();
}

// OPEN ADD OWNED POKEMON MODAL
function openAddOwnedPokemonModal(pokemonId = null) {
    populateOwnedPokemonNatureOptions();
    resetOwnedPokemonForm();

    openModal(ownedPokemonFormModal);

    if (pokemonId) {
        selectOwnedPokemon(pokemonId);
    }
}

// POPULATE OWNED POKEMON NATURE OPTIONS
function populateOwnedPokemonNatureOptions() {
    if (ownedPokemonNature.options.length > 1) {
        return;
    }

    POKEMON_NATURES.forEach((nature) => {
        const option = document.createElement("option");

        option.value = nature.name;
        option.textContent = nature.neutral
            ? `${nature.name} (Neutral)`
            : `${nature.name} (+${nature.positive}, -${nature.negative})`;

        ownedPokemonNature.appendChild(option);
    });
}

// POPULATE OWNED POKEMON REGIONAL FORM OPTIONS
function populateOwnedPokemonRegionalFormOptions(pokemon, selectedRegionalForm = "") {
    const regionalForms = getPokemonRegionalForms(pokemon?.id);

    ownedPokemonRegionalForm.innerHTML = `
        <option value="">Forma padrão</option>
    `;

    ownedPokemonRegionalForm.value = "";
    ownedPokemonRegionalFormWrapper.classList.add("hidden");

    if (!regionalForms.length) {
        return;
    }

    regionalForms.forEach((form) => {
        const option = document.createElement("option");

        option.value = form.value;
        option.textContent = form.label;

        ownedPokemonRegionalForm.appendChild(option);
    });

    ownedPokemonRegionalForm.value = selectedRegionalForm || "";
    ownedPokemonRegionalFormWrapper.classList.remove("hidden");
}

// RESET OWNED POKEMON FORM
function resetOwnedPokemonForm() {
    selectedOwnedPokemonDexId = null;
    editingOwnedPokemonId = null;

    ownedPokemonFormTitle.textContent = "Adicionar Pokémon";

    ownedPokemonSearch.value = "";
    ownedPokemonSearch.disabled = false;
    ownedPokemonSearchResults.innerHTML = "";
    ownedPokemonSelectedSummary.innerHTML = "";

    ownedPokemonBreedLevel.value = "";
    ownedPokemonGender.value = "";
    ownedPokemonNature.value = "";
    ownedPokemonRegionalForm.value = "";
    ownedPokemonRegionalFormWrapper.classList.add("hidden");
    ownedPokemonNotes.value = "";

    btnSaveOwnedPokemon.disabled = true;
    btnCancelOwnedPokemonEdit.classList.add("hidden");
}

// SEARCH OWNED POKEMON
function searchOwnedPokemon() {
    const searchTerm = ownedPokemonSearch.value.trim().toLowerCase();

    ownedPokemonSearchResults.innerHTML = "";

    if (!searchTerm) {
        return;
    }

    const results = pokedexCatalog
        .filter((pokemon) => {
            const name = pokemon.name?.english?.toLowerCase() || "";
            const id = String(pokemon.id);

            return name.includes(searchTerm) || id.includes(searchTerm);
        })
        .slice(0, 10);

    if (results.length === 0) {
        ownedPokemonSearchResults.innerHTML = `
            <p class="empty-state">
                Nenhum Pokémon encontrado.
            </p>
        `;

        return;
    }

    ownedPokemonSearchResults.innerHTML = results
        .map(
            (pokemon) => `
                <button
                    type="button"
                    class="manual-ha-result"
                    onclick="selectOwnedPokemon(${pokemon.id})">

                    <img
                        src="${getPokemonThumbnail(pokemon.id)}"
                        alt="${pokemon.name.english}">

                    <span>
                        #${String(pokemon.id).padStart(3, "0")}
                        ${pokemon.name.english}
                    </span>
                </button>
            `
        )
        .join("");
}

// SELECT OWNED POKEMON
function selectOwnedPokemon(pokemonId) {
    const pokemon = getPokemonById(pokemonId);

    if (!pokemon) {
        showWarningToast("Pokémon não encontrado.");
        return;
    }

    selectedOwnedPokemonDexId = Number(pokemon.id);

    ownedPokemonSearch.value = pokemon.name.english;
    ownedPokemonSearchResults.innerHTML = "";

    populateOwnedPokemonRegionalFormOptions(pokemon);
    renderOwnedPokemonSelectedSummary(pokemon);
    updateOwnedPokemonSaveButtonState();
}

// RENDER OWNED POKEMON SELECTED SUMMARY
function renderOwnedPokemonSelectedSummary(pokemon) {
    const regionalForm = getPokemonRegionalForm(pokemon.id, ownedPokemonRegionalForm.value);

    const displayName = regionalForm?.displayName || pokemon.name.english;
    const displaySprite = regionalForm?.sprite || getPokemonThumbnail(pokemon.id);

    const eggGroups = pokemon.profile?.egg?.length
        ? pokemon.profile.egg
              .map((eggGroup) => `<span>${normalizeEggGroup(eggGroup)}</span>`)
              .join("")
        : "<span>-</span>";

    ownedPokemonSelectedSummary.innerHTML = `
        <div class="owned-pokemon-selected-card">
            <img
                src="${displaySprite}"
                alt="${displayName}">

            <div>
                <strong>
                    #${String(pokemon.id).padStart(3, "0")}
                    ${displayName}
                </strong>

                ${
                    regionalForm
                        ? `
                            <p class="pokemon-regional-form-line">
                                Forma regional:
                                <strong>${regionalForm.label}</strong>
                            </p>
                        `
                        : ""
                }

                <div class="owned-pokemon-tags">
                    ${eggGroups}
                </div>
            </div>
        </div>
    `;
}

// UPDATE OWNED POKEMON SAVE BUTTON STATE
function updateOwnedPokemonSaveButtonState() {
    const hasPokemon = Boolean(selectedOwnedPokemonDexId);
    const hasBreedLevel = Boolean(ownedPokemonBreedLevel.value);
    const hasGender = Boolean(ownedPokemonGender.value);
    const hasNature = Boolean(ownedPokemonNature.value);

    btnSaveOwnedPokemon.disabled = !(hasPokemon && hasBreedLevel && hasGender && hasNature);
}

// FORMAT OWNED POKEMON BREED LEVEL
function formatOwnedPokemonBreedLevel(value) {
    const labels = {
        F6: "F6",
        F5_PFT: "F5 PFT",
        F5: "F5",
        F4: "F4",
        F3: "F3",
        F2: "F2",
        F1: "F1",
        CAPTURED: "Capturado"
    };

    return labels[value] || value;
}

// FORMAT OWNED POKEMON GENDER
function formatOwnedPokemonGender(value) {
    const labels = {
        MALE: "Macho",
        FEMALE: "Fêmea",
        GENDERLESS: "Genderless"
    };

    return labels[value] || value;
}

// SHOULD USE API OWNED POKEMONS
function shouldUseApiOwnedPokemons() {
    return Boolean(
        window.PXBROwnedPokemonsApiService && window.PXBRAuthService?.getAccessToken?.()
    );
}

// MAP OWNED POKEMON FROM API
function mapOwnedPokemonFromApi(item) {
    return {
        id: item.id,
        pokemonId: item.pokemonDexId,
        pokemonName: item.pokemonName,
        sprite: item.pokemonSprite,
        breedBaseDexId: item.breedBaseDexId,
        breedBaseName: item.breedBaseName,
        regionalForm: item.regionalForm || "",
        regionalFormLabel: item.regionalFormLabel || "",
        regionalFormDisplayName: item.regionalFormDisplayName || "",
        eggGroups: item.eggGroups || [],
        evolutionLine: item.evolutionLine || [],
        breedLevel: item.status,
        gender: item.gender,
        nature: item.nature || "",
        notes: item.notes || "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
    };
}

// MAP OWNED POKEMON TO API
function mapOwnedPokemonToApiPayload(payload) {
    return {
        pokemonDexId: Number(payload.pokemonId),
        pokemonName: payload.pokemonName,
        pokemonSprite: payload.sprite || null,
        breedBaseDexId: payload.breedBaseDexId || Number(payload.pokemonId),
        breedBaseName: payload.breedBaseName || payload.pokemonName,
        regionalForm: payload.regionalForm || null,
        regionalFormLabel: payload.regionalFormLabel || null,
        regionalFormDisplayName: payload.regionalFormDisplayName || null,
        eggGroups: payload.eggGroups || [],
        evolutionLine: payload.evolutionLine || [],
        status: payload.breedLevel,
        gender: payload.gender,
        nature: payload.nature || null,
        notes: payload.notes || null
    };
}

// LOAD OWNED POKEMONS FROM SOURCE
async function loadOwnedPokemonsFromSource() {
    if (shouldUseApiOwnedPokemons()) {
        const ownedPokemons = await window.PXBROwnedPokemonsApiService.getOwnedPokemons();

        return ownedPokemons.map(mapOwnedPokemonFromApi);
    }

    return loadOwnedPokemons();
}

// SAVE OWNED POKEMON TO SOURCE
async function saveOwnedPokemonToSource(payload) {
    if (shouldUseApiOwnedPokemons()) {
        if (editingOwnedPokemonId) {
            const updatedPokemon = await window.PXBROwnedPokemonsApiService.update(
                editingOwnedPokemonId,
                mapOwnedPokemonToApiPayload(payload)
            );

            return mapOwnedPokemonFromApi(updatedPokemon);
        }

        const createdPokemon = await window.PXBROwnedPokemonsApiService.create(
            mapOwnedPokemonToApiPayload(payload)
        );

        return mapOwnedPokemonFromApi(createdPokemon);
    }

    const ownedPokemons = loadOwnedPokemons();

    if (editingOwnedPokemonId) {
        const updatedPokemons = ownedPokemons.map((item) => {
            if (item.id !== editingOwnedPokemonId) {
                return item;
            }

            return {
                ...item,
                ...payload
            };
        });

        saveOwnedPokemons(updatedPokemons);

        return updatedPokemons.find((item) => item.id === editingOwnedPokemonId);
    }

    const createdPokemon = {
        id: generateUUID(),
        ...payload,
        createdAt: new Date().toISOString()
    };

    saveOwnedPokemons([createdPokemon, ...ownedPokemons]);

    return createdPokemon;
}

// SAVE OWNED POKEMON FROM MODAL
async function saveOwnedPokemonFromModal() {
    const pokemon = getPokemonById(selectedOwnedPokemonDexId);

    if (!pokemon) {
        showWarningToast("Selecione um Pokémon antes de salvar.");
        return;
    }

    const regionalForm = getPokemonRegionalForm(pokemon.id, ownedPokemonRegionalForm.value);
    const displayName = regionalForm?.displayName || pokemon.name.english;
    const displaySprite = regionalForm?.sprite || getPokemonThumbnail(pokemon.id);

    const evolutionLine = getEvolutionChain(pokemon).map((chainPokemon) => ({
        pokemonId: Number(chainPokemon.id),
        pokemonName: chainPokemon.name.english,
        sprite: getPokemonThumbnail(chainPokemon.id)
    }));

    const payload = {
        pokemonId: Number(pokemon.id),
        pokemonName: displayName,
        sprite: displaySprite,
        regionalForm: regionalForm?.value || "",
        regionalFormLabel: regionalForm?.label || "",
        regionalFormDisplayName: regionalForm?.displayName || "",
        evolutionLine,
        eggGroups: pokemon.profile?.egg?.map((eggGroup) => normalizeEggGroup(eggGroup)) || [],
        breedLevel: ownedPokemonBreedLevel.value,
        gender: ownedPokemonGender.value,
        nature: ownedPokemonNature.value,
        notes: ownedPokemonNotes.value.trim(),
        updatedAt: new Date().toISOString()
    };

    try {
        btnSaveOwnedPokemon.disabled = true;

        await saveOwnedPokemonToSource(payload);

        showSuccessToast(
            editingOwnedPokemonId
                ? "Pokémon atualizado com sucesso!"
                : "Pokémon cadastrado com sucesso!"
        );

        closeModal(ownedPokemonFormModal);

        resetOwnedPokemonForm();
        await renderOwnedPokemonsList();
    } catch (error) {
        console.error(error);
        showErrorToast(error.message || "Erro ao salvar Pokémon.");
    } finally {
        btnSaveOwnedPokemon.disabled = false;
    }
}

// GET FILTERED OWNED POKEMONS
function getFilteredOwnedPokemons(ownedPokemons) {
    const searchTerm = ownedPokemonListSearch.value.trim().toLowerCase();
    const selectedBreedLevel = ownedPokemonListBreedLevel.value;
    const selectedGender = ownedPokemonListGender.value;
    const selectedNature = ownedPokemonListNature.value;
    const selectedRegionalForm = ownedPokemonListRegionalForm.value;

    return ownedPokemons.filter((item) => {
        const searchableText = [
            item.pokemonId,
            item.pokemonName,
            item.breedLevel,
            item.gender,
            item.nature,
            item.notes,
            item.regionalForm,
            item.regionalFormLabel,
            item.regionalFormDisplayName,
            ...(item.eggGroups || [])
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

        const matchesBreedLevel =
            selectedBreedLevel === "all" || item.breedLevel === selectedBreedLevel;

        const matchesGender = selectedGender === "all" || item.gender === selectedGender;

        const matchesNature = selectedNature === "all" || item.nature === selectedNature;

        const matchesRegionalForm =
            selectedRegionalForm === "all" ||
            (selectedRegionalForm === "none" && !item.regionalForm) ||
            (selectedRegionalForm === "with-regional-form" && Boolean(item.regionalForm)) ||
            item.regionalForm === selectedRegionalForm ||
            item.regionalForm?.startsWith(selectedRegionalForm);

        return (
            matchesSearch &&
            matchesBreedLevel &&
            matchesGender &&
            matchesNature &&
            matchesRegionalForm
        );
    });
}

// SORT WIDE OWNED CARDS LAST
function sortWideOwnedCardsLast(items) {
    return [...items].sort((itemA, itemB) => {
        const itemAEvolutionLength = itemA.evolutionLine?.length || 1;
        const itemBEvolutionLength = itemB.evolutionLine?.length || 1;

        const itemAIsWide = itemAEvolutionLength >= 4;
        const itemBIsWide = itemBEvolutionLength >= 4;

        if (itemAIsWide !== itemBIsWide) {
            return itemAIsWide ? 1 : -1;
        }

        return new Date(itemB.createdAt || 0) - new Date(itemA.createdAt || 0);
    });
}

// RENDER OWNED POKEMONS LIST
async function renderOwnedPokemonsList() {
    try {
        const ownedPokemons = await loadOwnedPokemonsFromSource();
        const filteredPokemons = sortWideOwnedCardsLast(getFilteredOwnedPokemons(ownedPokemons));

        if (ownedPokemons.length === 0) {
            ownedPokemonsList.innerHTML = `
                <p class="empty-state">
                    Nenhum Pokémon cadastrado ainda.
                </p>
            `;

            return;
        }

        if (filteredPokemons.length === 0) {
            ownedPokemonsList.innerHTML = `
                <p class="owned-management-counter">
                    Exibindo 0 de ${ownedPokemons.length} Pokémons cadastrados.
                </p>

                <p class="empty-state">
                    Nenhum Pokémon encontrado com os filtros atuais.
                </p>
            `;

            return;
        }

        ownedPokemonsList.innerHTML = `
            <p class="owned-management-counter">
                Exibindo ${filteredPokemons.length} de ${ownedPokemons.length} Pokémons cadastrados.
            </p>

            <div class="owned-pokemons-list">
                ${filteredPokemons.map((item) => createOwnedPokemonCard(item)).join("")}
            </div>
        `;
    } catch (error) {
        console.error(error);
        ownedPokemonsList.innerHTML = `
            <p class="empty-state">
                Erro ao carregar Pokémons cadastrados.
            </p>
        `;
    }
}

// CREATE OWNED POKEMON CARD
function createOwnedPokemonCard(item) {
    const eggGroups = item.eggGroups?.length
        ? item.eggGroups.map((eggGroup) => `<span>${eggGroup}</span>`).join("")
        : "<span>-</span>";

    const evolutionLine = item.evolutionLine?.length
        ? item.evolutionLine
        : [
              {
                  pokemonId: item.pokemonId,
                  pokemonName: item.pokemonName,
                  sprite: item.sprite
              }
          ];

    const hasCompactEvolutionLine = evolutionLine.length >= 3;
    const hasLongEvolutionLine = evolutionLine.length >= 4;

    const evolutionHtml = evolutionLine
        .map((pokemon) => {
            return `
                <div class="owned-pokemon-evolution-item">
                    <img
                        src="${getPokemonThumbnail(pokemon.pokemonId, pokemon.sprite)}"
                        alt="${pokemon.pokemonName}">

                    <span>
                        #${String(pokemon.pokemonId).padStart(3, "0")}
                    </span>

                    <strong>
                        ${pokemon.pokemonName}
                    </strong>
                </div>
            `;
        })
        .join("");

    return `
        <article class="owned-pokemon-card ${
            hasCompactEvolutionLine ? "owned-pokemon-card-compact-evolution" : ""
        } ${hasLongEvolutionLine ? "owned-pokemon-card-wide" : ""}">
            <div class="owned-pokemon-card-header">
                <img
                    src="${getPokemonThumbnail(item.pokemonId, item.sprite)}"
                    alt="${item.pokemonName}">

                <div>
                    <span>
                        #${String(item.pokemonId).padStart(3, "0")}
                    </span>

                    <h3>
                        ${item.pokemonName}
                    </h3>
                </div>
            </div>

            <div class="owned-pokemon-evolution-line">
                ${evolutionHtml}
            </div>

            <div class="owned-pokemon-card-info">
                <p>
                    <strong>Status:</strong>
                    ${formatOwnedPokemonBreedLevel(item.breedLevel)}
                </p>

                <p>
                    <strong>Gênero:</strong>
                    ${formatOwnedPokemonGender(item.gender)}
                </p>

                <p>
                    <strong>Nature:</strong>
                    ${item.nature}
                </p>

                ${
                    item.regionalForm
                        ? `
                            <p>
                                <strong>Forma:</strong>
                                ${item.regionalFormLabel}
                            </p>
                        `
                        : ""
                }
            </div>

            <div class="owned-pokemon-tags">
                ${eggGroups}
            </div>

            ${
                item.notes
                    ? `
                        <p class="owned-pokemon-notes">
                            ${item.notes}
                        </p>
                    `
                    : ""
            }

            <div class="owned-pokemon-card-actions">
                <button
                    type="button"
                    class="button-secondary"
                    onclick="openEditOwnedPokemonModal('${item.id}')">
                    Editar
                </button>

                <button
                    type="button"
                    class="button-danger"
                    onclick="deleteOwnedPokemon('${item.id}')">
                    Excluir
                </button>
            </div>
        </article>
    `;
}

// OPEN EDIT OWNED POKEMON MODAL
async function openEditOwnedPokemonModal(ownedPokemonId) {
    const ownedPokemons = await loadOwnedPokemonsFromSource();
    const item = ownedPokemons.find((pokemon) => pokemon.id === ownedPokemonId);

    if (!item) {
        showWarningToast("Pokémon não encontrado.");
        return;
    }

    const pokemon = getPokemonById(item.pokemonId);

    if (!pokemon) {
        showWarningToast("Pokémon não encontrado na Pokédex.");
        return;
    }

    populateOwnedPokemonNatureOptions();

    openModal(ownedPokemonFormModal);

    selectedOwnedPokemonDexId = Number(item.pokemonId);
    editingOwnedPokemonId = item.id;

    ownedPokemonFormTitle.textContent = "Editar Pokémon";

    ownedPokemonSearch.value = item.pokemonName;
    ownedPokemonSearch.disabled = true;
    ownedPokemonSearchResults.innerHTML = "";

    ownedPokemonBreedLevel.value = item.breedLevel;
    ownedPokemonGender.value = item.gender;
    ownedPokemonNature.value = item.nature;
    populateOwnedPokemonRegionalFormOptions(pokemon, item.regionalForm || "");
    ownedPokemonNotes.value = item.notes || "";

    renderOwnedPokemonSelectedSummary(pokemon);

    btnCancelOwnedPokemonEdit.classList.remove("hidden");
    updateOwnedPokemonSaveButtonState();
}

// DELETE OWNED POKEMON
function deleteOwnedPokemon(ownedPokemonId) {
    const confirmed = confirm("Deseja remover este Pokémon da sua lista?");

    if (!confirmed) {
        return;
    }

    const ownedPokemons = loadOwnedPokemons().filter((pokemon) => pokemon.id !== ownedPokemonId);

    saveOwnedPokemons(ownedPokemons);

    showSuccessToast("Pokémon removido com sucesso!");

    if (editingOwnedPokemonId === ownedPokemonId) {
        resetOwnedPokemonForm();
    }

    renderOwnedPokemonsList();
}

// GET FILTERED OWNED HAS
function getFilteredOwnedHAs() {
    const searchTerm = ownedHAListSearch.value.trim().toLowerCase();
    const selectedNature = ownedHAListNature.value;
    const selectedRegionalForm = ownedHAListRegionalForm.value;

    return loadOwnedHiddenAbilities().filter((item) => {
        const evolutionNames = item.evolutionLine?.map((pokemon) => pokemon.pokemonName) || [];

        const searchableText = [
            item.pokemonName,
            item.abilityName,
            item.nature,
            item.notes,
            item.regionalForm,
            item.regionalFormLabel,
            item.regionalFormDisplayName,
            ...evolutionNames
        ]
            .join(" ")
            .toLowerCase();

        const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

        const matchesNature =
            selectedNature === "all" ||
            (selectedNature === "none" && !item.nature) ||
            item.nature === selectedNature;

        const matchesRegionalForm =
            selectedRegionalForm === "all" ||
            (selectedRegionalForm === "none" && !item.regionalForm) ||
            (selectedRegionalForm === "with-regional-form" && Boolean(item.regionalForm)) ||
            item.regionalForm === selectedRegionalForm ||
            item.regionalForm?.startsWith(selectedRegionalForm);

        return matchesSearch && matchesNature && matchesRegionalForm;
    });
}

// RENDER OWNED HA LIST
function renderOwnedHAList() {
    const hiddenAbilities = loadOwnedHiddenAbilities();
    const filteredHiddenAbilities = sortWideOwnedCardsLast(getFilteredOwnedHAs());

    if (hiddenAbilities.length === 0) {
        ownedHAList.innerHTML = `
            <p class="empty-state">
                Nenhuma Hidden Ability cadastrada.
            </p>
        `;

        return;
    }

    if (filteredHiddenAbilities.length === 0) {
        ownedHAList.innerHTML = `
            <p class="owned-management-counter">
                Exibindo 0 de ${hiddenAbilities.length} HAs cadastradas.
            </p>

            <p class="empty-state">
                Nenhuma HA encontrada com os filtros atuais.
            </p>
        `;

        return;
    }

    ownedHAList.innerHTML = `
        <p class="owned-management-counter">
            Exibindo ${filteredHiddenAbilities.length} de ${hiddenAbilities.length} HAs cadastradas.
        </p>

        <div class="owned-ha-list">
            ${filteredHiddenAbilities.map((item) => createOwnedHACard(item)).join("")}
        </div>
    `;
}

// CREATE OWNED HA CARD
function createOwnedHACard(item) {
    const evolutionLine = item.evolutionLine?.length
        ? item.evolutionLine
        : [
              {
                  pokemonId: item.pokemonId,
                  pokemonName: item.pokemonName,
                  sprite: item.sprite
              }
          ];

    const hasCompactEvolutionLine = evolutionLine.length >= 3;
    const hasLongEvolutionLine = evolutionLine.length >= 4;

    const evolutionHtml = evolutionLine
        .map((pokemon) => {
            return `
                <div class="owned-ha-evolution-pokemon">
                    <img
                        src="${getPokemonThumbnail(pokemon.pokemonId, pokemon.sprite)}"
                        alt="${pokemon.pokemonName}"
                        onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemonId}.png';"
                    />

                    <span>
                        #${String(pokemon.pokemonId).padStart(3, "0")}
                    </span>

                    <strong>
                        ${pokemon.pokemonName}
                    </strong>
                </div>
            `;
        })
        .join("");

    return `
        <article class="owned-ha-card ${hasCompactEvolutionLine ? "owned-ha-card-compact-evolution" : ""} ${hasLongEvolutionLine ? "owned-ha-card-wide" : ""}">
            <div class="owned-ha-card-header">
                <div>
                    <span class="owned-ha-card-label">
                        Hidden Ability
                    </span>

                    <h3>
                        ${item.abilityName}
                        <small class="pokemon-ha-label">(<span>HA</span>)</small>
                    </h3>
                </div>

                <span class="owned-ha-created-at">
                    ${formatDateTime(item.createdAt)}
                </span>
            </div>

            <div class="owned-ha-evolution-line">
                ${evolutionHtml}
            </div>

            <div class="owned-ha-price-grid">
                <div>
                    <strong>Castrado</strong>
                    <span>${formatMoney(item.castratedPrice)}</span>
                </div>

                <div>
                    <strong>Breedável</strong>
                    <span>${formatMoney(item.breedablePrice)}</span>
                </div>

                <div>
                    <strong>Nature</strong>
                    <span>${formatPokemonNatureLabel(item.nature)}</span>
                </div>

                ${
                    item.regionalForm
                        ? `
                            <div>
                                <strong>Forma</strong>
                                <span>${item.regionalFormLabel}</span>
                            </div>
                        `
                        : ""
                }
            </div>

            ${
                item.notes
                    ? `
                        <p class="owned-ha-notes">
                            ${item.notes}
                        </p>
                    `
                    : ""
            }

            <div class="owned-ha-card-actions">
                <button
                    type="button"
                    class="button-secondary"
                    onclick="openEditOwnedHAModal('${item.id}')">
                    Editar
                </button>
            </div>
        </article>
    `;
}

// DELETE OWNED HA
function deleteOwnedHA(hiddenAbilityId) {
    showWarningToast("A remoção de HAs está desabilitada por segurança.");

    return;

    const confirmed = confirm("Deseja remover esta HA da sua lista?");

    if (!confirmed) {
        return;
    }

    removeOwnedHiddenAbility(hiddenAbilityId);

    showSuccessToast("HA removida com sucesso!");

    renderOwnedHAList();
}

// GET POKEMON HIDDEN ABILITY
function getPokemonHiddenAbility(pokemon) {
    if (!pokemon) {
        return null;
    }

    return pokemon.profile?.ability?.find((ability) => {
        return Array.isArray(ability) && ability[1] === "true";
    });
}

// POPULATE OWNED HA NATURE OPTIONS
function populateOwnedHANatureOptions() {
    if (ownedHANature.options.length > 1) {
        return;
    }

    POKEMON_NATURES.forEach((nature) => {
        const option = document.createElement("option");

        option.value = nature.name;
        option.textContent = nature.neutral
            ? `${nature.name} (Neutral)`
            : `${nature.name} (+${nature.positive}, -${nature.negative})`;

        ownedHANature.appendChild(option);
    });
}

// POPULATE OWNED HA REGIONAL FORM OPTIONS
function populateOwnedHARegionalFormOptions(pokemon, selectedRegionalForm = "") {
    if (!ownedHARegionalForm || !ownedHARegionalFormWrapper) {
        return;
    }

    const regionalForms = getPokemonRegionalForms(pokemon?.id);

    ownedHARegionalForm.innerHTML = `
        <option value="">Forma padrão</option>
    `;

    ownedHARegionalForm.value = "";
    ownedHARegionalFormWrapper.classList.add("hidden");

    if (!regionalForms.length) {
        return;
    }

    regionalForms.forEach((form) => {
        const option = document.createElement("option");

        option.value = form.value;
        option.textContent = form.label;

        ownedHARegionalForm.appendChild(option);
    });

    ownedHARegionalForm.value = selectedRegionalForm || "";
    ownedHARegionalFormWrapper.classList.remove("hidden");
}

// OPEN MANUAL ADD OWNED HA MODAL
function openManualAddOwnedHAModal() {
    populateOwnedHANatureOptions();

    isManualHAFlow = true;
    addHAOrigin = "manual";

    selectedHAPokemonId = null;
    selectedOwnedHAId = null;

    addOwnedHAModal.querySelector("h2").textContent = "Adicionar nova HA";

    manualHASelector.classList.remove("hidden");
    manualHASearch.value = "";
    manualHASearchResults.innerHTML = "";

    addOwnedHASummary.innerHTML = `
        <p class="empty-state">
            Busque e selecione um Pokémon com Hidden Ability.
        </p>
    `;

    ownedHACastratedPrice.value = formatMoney(0);
    ownedHABreedablePrice.value = formatMoney(0);
    ownedHANature.value = "";
    ownedHANotes.value = "";
    ownedHARegionalForm.value = "";
    ownedHARegionalFormWrapper.classList.add("hidden");

    setOwnedHAFormFieldsEnabled(false);
    updateSaveOwnedHAButtonState();

    openModal(addOwnedHAModal);
}

// OPEN ADD OWNED HA MODAL
function openAddOwnedHAModal(pokemonId, origin = "pokemon-details", orderRow = null) {
    populateOwnedHANatureOptions();

    addHAOrigin = origin;
    addHAOrderRow = orderRow;

    isManualHAFlow = false;
    manualHASelector.classList.add("hidden");
    manualHASearchResults.innerHTML = "";

    const pokemon = getPokemonById(pokemonId);
    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    if (!pokemon || !hiddenAbility) {
        return;
    }

    selectedHAPokemonId = pokemon.id;
    selectedOwnedHAId = null;

    populateOwnedHARegionalFormOptions(pokemon);

    const evolutionChain = getEvolutionChain(pokemon).map((chainPokemon) => {
        const chainHiddenAbility = getPokemonHiddenAbility(chainPokemon);

        return {
            pokemonId: Number(chainPokemon.id),
            pokemonName: chainPokemon.name.english,
            sprite: getPokemonThumbnail(chainPokemon.id),
            abilityName: chainHiddenAbility?.[0] || hiddenAbility[0]
        };
    });

    addOwnedHASummary.innerHTML = createOwnedHASummary(evolutionChain);

    ownedHACastratedPrice.value = "";
    ownedHABreedablePrice.value = "";
    ownedHANature.value = "";
    ownedHANotes.value = "";

    setOwnedHAFormFieldsEnabled(true);
    updateSaveOwnedHAButtonState();

    applyMoneyMask(ownedHACastratedPrice);
    applyMoneyMask(ownedHABreedablePrice);

    addOwnedHAModal.querySelector("h2").textContent = "Adicionar HA";

    openModal(addOwnedHAModal);
}

// CREATE OWNED HA SUMMARY
function createOwnedHASummary(evolutionLine) {
    return `
        <div class="owned-ha-summary">
            <div class="owned-ha-evolution-line">
                ${evolutionLine
                    .map((pokemon) => {
                        const regionalForm = getPokemonRegionalForm(
                            pokemon.pokemonId,
                            ownedHARegionalForm.value
                        );

                        const displayName = regionalForm?.displayName || pokemon.pokemonName;
                        const displaySprite =
                            regionalForm?.sprite ||
                            getPokemonThumbnail(pokemon.pokemonId, pokemon.sprite);

                        return `
                            <div class="owned-ha-evolution-pokemon">
                                <img
                                    src="${displaySprite}"
                                    alt="${displayName}"
                                    onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemonId}.png';"
                                />

                                <span>
                                    #${String(pokemon.pokemonId).padStart(3, "0")}
                                </span>

                                <strong>
                                    ${displayName}
                                </strong>

                                ${
                                    regionalForm
                                        ? `
                                            <small class="pokemon-regional-form-line">
                                                ${regionalForm.label}
                                            </small>
                                        `
                                        : ""
                                }

                                <small class="owned-ha-ability-name">
                                    ${pokemon.abilityName}
                                    <span>(HA)</span>
                                </small>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        </div>
    `;
}

// SELECT MANUAL HA POKEMON
function selectManualHAPokemon(pokemonId) {
    const pokemon = getPokemonById(pokemonId);
    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    if (!pokemon || !hiddenAbility) {
        showWarningToast("Selecione um Pokémon que possua Hidden Ability.");
        return;
    }

    if (hasOwnedHiddenAbility(pokemon)) {
        showWarningToast("Esta HA já está cadastrada nos seus HAs.");
        return;
    }

    selectedHAPokemonId = pokemon.id;

    populateOwnedHARegionalFormOptions(pokemon);

    const evolutionChain = getEvolutionChain(pokemon).map((chainPokemon) => {
        const chainHiddenAbility = getPokemonHiddenAbility(chainPokemon);

        return {
            pokemonId: Number(chainPokemon.id),
            pokemonName: chainPokemon.name.english,
            sprite: getPokemonThumbnail(chainPokemon.id),
            abilityName: chainHiddenAbility?.[0] || hiddenAbility[0]
        };
    });

    addOwnedHASummary.innerHTML = createOwnedHASummary(evolutionChain);

    setOwnedHAFormFieldsEnabled(true);
    updateSaveOwnedHAButtonState();

    manualHASearch.value = pokemon.name.english;
    manualHASearchResults.innerHTML = "";
}

// SAVE OWNED HA FROM MODAL
function saveOwnedHAFromModal() {
    if (!selectedHAPokemonId && !selectedOwnedHAId) {
        showWarningToast("Selecione um Pokémon antes de salvar a HA.");
        return;
    }

    const castratedPrice = unformatMoney(ownedHACastratedPrice.value);
    const breedablePrice = unformatMoney(ownedHABreedablePrice.value);

    if (castratedPrice <= 0) {
        showWarningToast("Informe um valor castrado maior que zero.");
        return;
    }

    if (breedablePrice <= 0) {
        showWarningToast("Informe um valor breedável maior que zero.");
        return;
    }

    const pokemon = getPokemonById(selectedHAPokemonId);
    const hiddenAbility = getPokemonHiddenAbility(pokemon);
    const regionalForm = getPokemonRegionalForm(pokemon?.id, ownedHARegionalForm.value);

    if (castratedPrice <= 0 || breedablePrice <= 0) {
        showWarningToast("Informe valores maiores que zero para castrado e breedável.");

        return;
    }

    if (selectedOwnedHAId) {
        updateOwnedHiddenAbility(selectedOwnedHAId, {
            castratedPrice,
            breedablePrice,
            nature: ownedHANature.value || null,
            regionalForm: regionalForm?.value || "",
            regionalFormLabel: regionalForm?.label || "",
            regionalFormDisplayName: regionalForm?.displayName || "",
            notes: ownedHANotes.value.trim()
        });

        showSuccessToast("HA atualizada com sucesso!");

        closeAddOwnedHAModal();

        renderOwnedHAList();

        return;
    }

    if (!selectedHAPokemonId) {
        showWarningToast("Selecione um Pokémon antes de salvar a HA.");
        return;
    }

    if (!pokemon || !hiddenAbility) {
        return;
    }

    const evolutionChain = getEvolutionChain(pokemon).map((chainPokemon) => {
        const chainHiddenAbility = getPokemonHiddenAbility(chainPokemon);

        return {
            pokemonId: Number(chainPokemon.id),
            pokemonName:
                Number(chainPokemon.id) === Number(pokemon.id) && regionalForm
                    ? regionalForm.displayName
                    : chainPokemon.name.english,
            sprite:
                Number(chainPokemon.id) === Number(pokemon.id) && regionalForm
                    ? regionalForm.sprite
                    : getPokemonThumbnail(chainPokemon.id),
            regionalForm:
                Number(chainPokemon.id) === Number(pokemon.id) && regionalForm
                    ? regionalForm.value
                    : "",
            regionalFormLabel:
                Number(chainPokemon.id) === Number(pokemon.id) && regionalForm
                    ? regionalForm.label
                    : "",
            abilityName: chainHiddenAbility?.[0] || hiddenAbility[0]
        };
    });

    addOwnedHiddenAbility({
        pokemonId: pokemon.id,
        pokemonName: pokemon.name.english,
        abilityName: hiddenAbility[0],
        sprite: getPokemonThumbnail(pokemon.id),
        evolutionLine: evolutionChain,
        castratedPrice: unformatMoney(ownedHACastratedPrice.value),
        breedablePrice: unformatMoney(ownedHABreedablePrice.value),
        nature: ownedHANature.value || null,
        notes: ownedHANotes.value.trim(),
        regionalForm: regionalForm?.value || "",
        regionalFormLabel: regionalForm?.label || "",
        regionalFormDisplayName: regionalForm?.displayName || ""
    });

    showSuccessToast("HA adicionada com sucesso!");

    const pokemonIdToRefresh = selectedHAPokemonId;
    const orderRowToRefresh = addHAOrderRow;
    const originToRefresh = addHAOrigin;

    closeAddOwnedHAModal();
    renderOwnedHAList();

    if (originToRefresh === "order-form" && orderRowToRefresh && pokemonIdToRefresh) {
        refreshOrderPokemonOwnedHA(orderRowToRefresh, pokemonIdToRefresh);
        return;
    }

    if (originToRefresh === "pokemon-details" && pokemonIdToRefresh) {
        openPokemonDetails(pokemonIdToRefresh);
    }
}

// CLOSE ADD OWNED HA MODAL
function closeAddOwnedHAModal() {
    closeModal(addOwnedHAModal);

    selectedHAPokemonId = null;
    selectedOwnedHAId = null;
    addHAOrigin = "pokemon-details";
    addHAOrderRow = null;

    isManualHAFlow = false;

    manualHASelector.classList.add("hidden");
    manualHASearch.value = "";
    manualHASearchResults.innerHTML = "";

    addOwnedHAModal.querySelector("h2").textContent = "Adicionar HA";

    addOwnedHASummary.innerHTML = "";

    ownedHACastratedPrice.value = "";
    ownedHABreedablePrice.value = "";
    ownedHANature.value = "";
    ownedHANotes.value = "";
    ownedHARegionalForm.value = "";
    ownedHARegionalFormWrapper.classList.add("hidden");
}

// HAS OWNED HIDDEN ABILITY
function hasOwnedHiddenAbility(pokemon) {
    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    if (!pokemon || !hiddenAbility) {
        return false;
    }

    return loadOwnedHiddenAbilities().some((item) => {
        return item.evolutionLine?.some((evolutionPokemon) => {
            return Number(evolutionPokemon.pokemonId) === Number(pokemon.id);
        });
    });
}

// OPEN EDIT OWNED HA MODAL
function openEditOwnedHAModal(hiddenAbilityId) {
    const hiddenAbility = loadOwnedHiddenAbilities().find((item) => {
        return item.id === hiddenAbilityId;
    });

    if (!hiddenAbility) {
        return;
    }

    selectedOwnedHAId = hiddenAbility.id;
    selectedHAPokemonId = hiddenAbility.pokemonId;

    const pokemon = getPokemonById(hiddenAbility.pokemonId);
    populateOwnedHARegionalFormOptions(pokemon, hiddenAbility.regionalForm || "");

    addOwnedHASummary.innerHTML = createEditOwnedHASummary(hiddenAbility);

    ownedHACastratedPrice.value = formatMoney(hiddenAbility.castratedPrice);
    ownedHABreedablePrice.value = formatMoney(hiddenAbility.breedablePrice);
    ownedHANature.value = hiddenAbility.nature || "";
    ownedHANotes.value = hiddenAbility.notes || "";

    setOwnedHAFormFieldsEnabled(true);
    updateSaveOwnedHAButtonState();

    applyMoneyMask(ownedHACastratedPrice);
    applyMoneyMask(ownedHABreedablePrice);

    addOwnedHAModal.querySelector("h2").textContent = "Editar HA";

    openModal(addOwnedHAModal);
}

// CREATE EDIT OWNED HA SUMMARY
function createEditOwnedHASummary(hiddenAbility) {
    const evolutionLine = hiddenAbility.evolutionLine?.length
        ? hiddenAbility.evolutionLine
        : [
              {
                  pokemonId: hiddenAbility.pokemonId,
                  pokemonName: hiddenAbility.pokemonName,
                  sprite: hiddenAbility.sprite,
                  abilityName: hiddenAbility.abilityName
              }
          ];

    return createOwnedHASummary(evolutionLine);
}

// SET OWNED HA FORM FIELDS ENABLED
function setOwnedHAFormFieldsEnabled(enabled) {
    ownedHACastratedPrice.disabled = !enabled;
    ownedHABreedablePrice.disabled = !enabled;
    ownedHANature.disabled = !enabled;
    ownedHARegionalForm.disabled = !enabled;
    ownedHANotes.disabled = !enabled;
}

// IS OWNED HA FORM VALID
function isOwnedHAFormValid() {
    const hasPokemon = Boolean(selectedHAPokemonId || selectedOwnedHAId);
    const castratedPrice = unformatMoney(ownedHACastratedPrice.value);
    const breedablePrice = unformatMoney(ownedHABreedablePrice.value);

    return hasPokemon && castratedPrice > 0 && breedablePrice > 0;
}

// UPDATE SAVE OWNED HA BUTTON STATE
function updateSaveOwnedHAButtonState() {
    btnSaveOwnedHA.disabled = !isOwnedHAFormValid();
}

pokemonDetailsModal.addEventListener("click", (event) => {
    if (event.target === pokemonDetailsModal) {
        closePokemonDetails();
    }
});

manualHASearch.addEventListener("input", () => {
    const searchTerm = manualHASearch.value.trim().toLowerCase();

    manualHASearchResults.innerHTML = "";

    if (!searchTerm) {
        return;
    }

    const results = pokedexCatalog
        .filter((pokemon) => {
            const name = pokemon.name?.english?.toLowerCase() || "";
            const id = String(pokemon.id);

            return name.includes(searchTerm) || id.includes(searchTerm);
        })
        .filter((pokemon) => getPokemonHiddenAbility(pokemon))
        .filter((pokemon) => !hasOwnedHiddenAbility(pokemon))
        .slice(0, 10);

    if (results.length === 0) {
        manualHASearchResults.innerHTML = `
            <p class="empty-state">
                Nenhum Pokémon com HA disponível encontrado.
            </p>
        `;

        return;
    }

    manualHASearchResults.innerHTML = results
        .map((pokemon) => {
            const hiddenAbility = getPokemonHiddenAbility(pokemon);

            return `
                <button
                    type="button"
                    class="manual-ha-result"
                    onclick="selectManualHAPokemon(${pokemon.id})">

                    <img
                        src="${getPokemonThumbnail(pokemon.id)}"
                        alt="${pokemon.name.english}">

                    <span>
                        #${String(pokemon.id).padStart(3, "0")}
                        ${pokemon.name.english}
                    </span>

                    <small>
                        ${hiddenAbility[0]}
                        <span>(HA)</span>
                    </small>
                </button>
            `;
        })
        .join("");
});

applyMoneyMask(ownedHACastratedPrice);
applyMoneyMask(ownedHABreedablePrice);

ownedHACastratedPrice.addEventListener("input", updateSaveOwnedHAButtonState);
ownedHABreedablePrice.addEventListener("input", updateSaveOwnedHAButtonState);
ownedHANature.addEventListener("change", updateSaveOwnedHAButtonState);

ownedHANotes.addEventListener("input", updateSaveOwnedHAButtonState);
ownedHAListSearch.addEventListener("input", renderOwnedHAList);
ownedHAListNature.addEventListener("change", renderOwnedHAList);
ownedHAListRegionalForm.addEventListener("change", renderOwnedHAList);

ownedPokemonSearch.addEventListener("input", searchOwnedPokemon);
ownedPokemonBreedLevel.addEventListener("change", updateOwnedPokemonSaveButtonState);
ownedPokemonGender.addEventListener("change", updateOwnedPokemonSaveButtonState);
ownedPokemonNature.addEventListener("change", updateOwnedPokemonSaveButtonState);
ownedPokemonRegionalForm.addEventListener("change", () => {
    const pokemon = getPokemonById(selectedOwnedPokemonDexId);

    if (pokemon) {
        renderOwnedPokemonSelectedSummary(pokemon);
    }

    updateOwnedPokemonSaveButtonState();
});
ownedPokemonNotes.addEventListener("input", updateOwnedPokemonSaveButtonState);

ownedPokemonListSearch.addEventListener("input", () => {
    renderOwnedPokemonsList();
});

ownedPokemonListBreedLevel.addEventListener("change", () => {
    renderOwnedPokemonsList();
});

ownedPokemonListGender.addEventListener("change", () => {
    renderOwnedPokemonsList();
});

ownedPokemonListNature.addEventListener("change", () => {
    renderOwnedPokemonsList();
});

ownedPokemonListRegionalForm.addEventListener("change", () => {
    renderOwnedPokemonsList();
});

btnSaveOwnedPokemon.addEventListener("click", saveOwnedPokemonFromModal);
btnCancelOwnedPokemonEdit.addEventListener("click", resetOwnedPokemonForm);

setupPokemonCatalogEvents();
loadPokemonCatalog();

window.renderPokemonCatalog = renderPokemonCatalog;
window.openPokemonDetails = openPokemonDetails;
window.navigatePokemonDetails = navigatePokemonDetails;
window.closePokemonDetails = closePokemonDetails;

window.openOwnedHAModal = openOwnedHAModal;
window.closeOwnedHAModal = closeOwnedHAModal;
window.deleteOwnedHA = deleteOwnedHA;

window.openOwnedPokemonsModal = openOwnedPokemonsModal;
window.openAddOwnedPokemonModal = openAddOwnedPokemonModal;
window.closeOwnedPokemonsModal = closeOwnedPokemonsModal;
window.selectOwnedPokemon = selectOwnedPokemon;
window.openEditOwnedPokemonModal = openEditOwnedPokemonModal;
window.deleteOwnedPokemon = deleteOwnedPokemon;

window.openAddOwnedHAModal = openAddOwnedHAModal;
window.closeAddOwnedHAModal = closeAddOwnedHAModal;
window.saveOwnedHAFromModal = saveOwnedHAFromModal;
window.openEditOwnedHAModal = openEditOwnedHAModal;

window.openManualAddOwnedHAModal = openManualAddOwnedHAModal;
window.selectManualHAPokemon = selectManualHAPokemon;

window.changePokemonCatalogPage = changePokemonCatalogPage;

window.renderOwnedPokemonsList = renderOwnedPokemonsList;
