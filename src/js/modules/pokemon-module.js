const pokemonCatalogSearch = document.getElementById("pokemonCatalogSearch");
const pokemonGenerationFilter = document.getElementById("pokemonGenerationFilter");
const pokemonEggGroupFilter = document.getElementById("pokemonEggGroupFilter");
const pokemonCatalogGrid = document.getElementById("pokemonCatalogGrid");

const pokemonDetailsModal = document.getElementById("pokemonDetailsModal");
const pokemonDetailsContent = document.getElementById("pokemonDetailsContent");
const btnClosePokemonDetails = document.getElementById("btnClosePokemonDetails");

const pokemonCatalogCounter = document.getElementById("pokemonCatalogCounter");

const ownedHAModal = document.getElementById("ownedHAModal");
const ownedHAList = document.getElementById("ownedHAList");

const addOwnedHAModal = document.getElementById("addOwnedHAModal");
const addOwnedHASummary = document.getElementById("addOwnedHASummary");
const ownedHACastratedPrice = document.getElementById("ownedHACastratedPrice");
const ownedHABreedablePrice = document.getElementById("ownedHABreedablePrice");
const ownedHANotes = document.getElementById("ownedHANotes");

let pokedexCatalog = [];

let pokemonDetailsAnimationDirection = "none";

let selectedHAPokemonId = null;
let selectedOwnedHAId = null;

let addHAOrigin = "pokemon-details";

async function loadPokemonCatalog() {
    const response = await fetch("./src/data/pokedex.json");
    pokedexCatalog = await response.json();

    populateEggGroupFilter();
    renderPokemonCatalog();
}

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

function populateEggGroupFilter() {
    const eggGroups = new Set();

    pokedexCatalog.forEach((pokemon) => {
        pokemon.profile?.egg?.forEach((eggGroup) => {
            eggGroups.add(eggGroup);
        });
    });

    [...eggGroups].sort().forEach((eggGroup) => {
        const option = document.createElement("option");
        option.value = eggGroup;
        option.textContent = eggGroup;

        pokemonEggGroupFilter.appendChild(option);
    });
}

function getFilteredPokemonCatalog() {
    const searchTerm = pokemonCatalogSearch.value.toLowerCase().trim();
    const selectedGeneration = pokemonGenerationFilter.value;
    const selectedEggGroup = pokemonEggGroupFilter.value;

    return pokedexCatalog.filter((pokemon) => {
        const pokemonName = pokemon.name?.english?.toLowerCase() || "";
        const pokemonId = String(pokemon.id);

        const matchesSearch = pokemonName.includes(searchTerm) || pokemonId.includes(searchTerm);

        const matchesGeneration =
            selectedGeneration === "all" || getPokemonGeneration(pokemon.id) === selectedGeneration;

        const matchesEggGroup =
            selectedEggGroup === "all" || pokemon.profile?.egg?.includes(selectedEggGroup);

        return matchesSearch && matchesGeneration && matchesEggGroup;
    });
}

// RENDER POKEMON CATALOG
function renderPokemonCatalog() {
    const filteredPokemons = getFilteredPokemonCatalog();

    if (filteredPokemons.length === 0) {
        pokemonCatalogGrid.innerHTML = `
            <p class="empty-state">
                Nenhum Pokémon encontrado.
            </p>
        `;

        return;
    }

    pokemonCatalogCounter.textContent = `Exibindo ${filteredPokemons.length} de ${pokedexCatalog.length} Pokémon`;

    pokemonCatalogGrid.innerHTML = filteredPokemons
        .map((pokemon) => createPokemonCatalogCard(pokemon))
        .join("");
}

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
                    src="${pokemon.image?.thumbnail || pokemon.image?.sprite || ""}"
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

function openPokemonDetails(pokemonId) {
    const pokemon = pokedexCatalog.find((item) => Number(item.id) === Number(pokemonId));

    if (!pokemon) {
        return;
    }

    pokemonDetailsContent.innerHTML = createPokemonDetailsContent(pokemon);

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

    pokemonDetailsModal.classList.remove("hidden");

    document.body.classList.add("modal-open");

    const modalContent = pokemonDetailsModal.querySelector(".modal-content");

    modalContent.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function closePokemonDetails() {
    pokemonDetailsModal.classList.add("hidden");

    pokemonDetailsContent.innerHTML = "";

    document.body.classList.remove("modal-open");
}

function setupPokemonCatalogEvents() {
    pokemonCatalogSearch.addEventListener("input", renderPokemonCatalog);
    pokemonGenerationFilter.addEventListener("change", renderPokemonCatalog);
    pokemonEggGroupFilter.addEventListener("change", renderPokemonCatalog);
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

    const previousPokemon = getPreviousPokemon(pokemon.id);
    const nextPokemon = getNextPokemon(pokemon.id);

    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    return `
        <div class="pokemon-navigation">
            ${
                previousPokemon
                    ? `
                        <button
                            type="button"
                            class="pokemon-navigation-card"
                            onclick="navigatePokemonDetails(${previousPokemon.id}, 'previous')">

                            <img
                                src="${previousPokemon.image.thumbnail}"
                                alt="${previousPokemon.name.english}"
                            />

                            <span>
                                #${String(previousPokemon.id).padStart(3, "0")}
                            </span>

                            <strong>
                                ${previousPokemon.name.english}
                            </strong>
                        </button>
                    `
                    : "<div></div>"
            }

            ${
                nextPokemon
                    ? `
                        <button
                            type="button"
                            class="pokemon-navigation-card"
                            onclick="navigatePokemonDetails(${nextPokemon.id}, 'next')">

                            <img
                                src="${nextPokemon.image.thumbnail}"
                                alt="${nextPokemon.name.english}"
                            />

                            <span>
                                #${String(nextPokemon.id).padStart(3, "0")}
                            </span>

                            <strong>
                                ${nextPokemon.name.english}
                            </strong>
                        </button>
                    `
                    : "<div></div>"
            }
        </div>
        <div class="pokemon-details-header">
            <div class="pokemon-details-image-wrapper">
                <img
                    src="${pokemon.image?.hires || pokemon.image?.thumbnail || pokemon.image?.sprite || ""}"
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

                <p class="pokemon-description">
                    ${pokemon.description || "Sem descrição disponível."}
                </p>
            </div>
        </div>

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

function createPokemonEggGroupsHtml(pokemon) {
    if (!pokemon.profile?.egg?.length) {
        return "<span>-</span>";
    }

    return pokemon.profile.egg.map((eggGroup) => `<span>${eggGroup}</span>`).join("");
}

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

function getPokemonById(pokemonId) {
    return pokedexCatalog.find((pokemon) => Number(pokemon.id) === Number(pokemonId));
}

function getEvolutionChain(pokemon) {
    const basePokemon = getBaseEvolutionPokemon(pokemon);
    const chain = [];

    collectEvolutionBranch(basePokemon, chain);

    return chain;
}

function getBaseEvolutionPokemon(pokemon) {
    let currentPokemon = pokemon;

    while (currentPokemon?.evolution?.prev) {
        const previousPokemonId = currentPokemon.evolution.prev[0];
        currentPokemon = getPokemonById(previousPokemonId);
    }

    return currentPokemon;
}

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

function getEvolutionMethod(fromPokemon, toPokemon) {
    const nextEvolution = fromPokemon.evolution?.next?.find((evolution) => {
        return Number(evolution[0]) === Number(toPokemon.id);
    });

    return nextEvolution?.[1] || "";
}

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
                        src="${chainPokemon.image?.thumbnail || chainPokemon.image?.sprite || ""}"
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

function getPreviousPokemon(pokemonId) {
    const currentIndex = pokedexCatalog.findIndex(
        (pokemon) => Number(pokemon.id) === Number(pokemonId)
    );

    if (currentIndex <= 0) {
        return null;
    }

    return pokedexCatalog[currentIndex - 1];
}

function getNextPokemon(pokemonId) {
    const currentIndex = pokedexCatalog.findIndex(
        (pokemon) => Number(pokemon.id) === Number(pokemonId)
    );

    if (currentIndex >= pokedexCatalog.length - 1) {
        return null;
    }

    return pokedexCatalog[currentIndex + 1];
}

function navigatePokemonDetails(pokemonId, direction) {
    pokemonDetailsAnimationDirection = direction;
    openPokemonDetails(pokemonId);
}

function openOwnedHAModal() {
    renderOwnedHAList();
    ownedHAModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function closeOwnedHAModal() {
    ownedHAModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

function renderOwnedHAList() {
    const hiddenAbilities = loadOwnedHiddenAbilities();

    if (hiddenAbilities.length === 0) {
        ownedHAList.innerHTML = `
            <p class="empty-state">
                Nenhuma Hidden Ability cadastrada.
            </p>
        `;

        return;
    }

    ownedHAList.innerHTML = `
        <div class="owned-ha-list">
            ${hiddenAbilities.map((item) => createOwnedHACard(item)).join("")}
        </div>
    `;
}

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

    const evolutionHtml = evolutionLine
        .map((pokemon) => {
            return `
                <div class="owned-ha-evolution-pokemon">
                    <img
                        src="${pokemon.sprite || ""}"
                        alt="${pokemon.pokemonName}"
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
        <article class="owned-ha-card">
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

                <button
                    type="button"
                    class="button-danger"
                    onclick="deleteOwnedHA('${item.id}')">
                    Remover
                </button>
            </div>
        </article>
    `;
}

function deleteOwnedHA(hiddenAbilityId) {
    const confirmed = confirm("Deseja remover esta HA da sua lista?");

    if (!confirmed) {
        return;
    }

    removeOwnedHiddenAbility(hiddenAbilityId);

    showSuccessToast("HA removida com sucesso!");

    renderOwnedHAList();
}

function getPokemonHiddenAbility(pokemon) {
    return pokemon.profile?.ability?.find((ability) => {
        return Array.isArray(ability) && ability[1] === "true";
    });
}

function openAddOwnedHAModal(pokemonId, origin = "pokemon-details") {
    addHAOrigin = origin;

    const pokemon = getPokemonById(pokemonId);
    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    if (!pokemon || !hiddenAbility) {
        return;
    }

    selectedHAPokemonId = pokemon.id;
    selectedOwnedHAId = null;

    const evolutionChain = getEvolutionChain(pokemon).map((chainPokemon) => {
        const chainHiddenAbility = getPokemonHiddenAbility(chainPokemon);

        return {
            pokemonId: Number(chainPokemon.id),
            pokemonName: chainPokemon.name.english,
            sprite: chainPokemon.image?.thumbnail || chainPokemon.image?.sprite || "",
            abilityName: chainHiddenAbility?.[0] || hiddenAbility[0]
        };
    });

    addOwnedHASummary.innerHTML = createOwnedHASummary(evolutionChain);

    ownedHACastratedPrice.value = "";
    ownedHABreedablePrice.value = "";
    ownedHANotes.value = "";

    applyMoneyMask(ownedHACastratedPrice);
    applyMoneyMask(ownedHABreedablePrice);

    addOwnedHAModal.querySelector("h2").textContent = "Adicionar HA";
    addOwnedHAModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

function createOwnedHASummary(evolutionLine) {
    return `
        <div class="owned-ha-summary">
            <div class="owned-ha-evolution-line">
                ${evolutionLine
                    .map((pokemon) => {
                        return `
                            <div class="owned-ha-evolution-pokemon">
                                <img
                                    src="${pokemon.sprite || ""}"
                                    alt="${pokemon.pokemonName}"
                                />

                                <span>
                                    #${String(pokemon.pokemonId).padStart(3, "0")}
                                </span>

                                <strong>
                                    ${pokemon.pokemonName}
                                </strong>

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

// SAVE OWNED HA FROM MODAL
function saveOwnedHAFromModal() {
    const pokemon = getPokemonById(selectedHAPokemonId);
    const hiddenAbility = getPokemonHiddenAbility(pokemon);

    const castratedPrice = unformatMoney(ownedHACastratedPrice.value);
    const breedablePrice = unformatMoney(ownedHABreedablePrice.value);

    if (castratedPrice <= 0 || breedablePrice <= 0) {
        showWarningToast("Informe valores maiores que zero para castrado e breedável.");

        return;
    }

    if (selectedOwnedHAId) {
        updateOwnedHiddenAbility(selectedOwnedHAId, {
            castratedPrice,
            breedablePrice,
            notes: ownedHANotes.value.trim()
        });

        showSuccessToast("HA atualizada com sucesso!");

        closeAddOwnedHAModal();

        renderOwnedHAList();

        return;
    }

    if (!pokemon || !hiddenAbility) {
        return;
    }

    const evolutionChain = getEvolutionChain(pokemon).map((chainPokemon) => {
        const chainHiddenAbility = getPokemonHiddenAbility(chainPokemon);

        return {
            pokemonId: Number(chainPokemon.id),
            pokemonName: chainPokemon.name.english,
            sprite: chainPokemon.image?.thumbnail || chainPokemon.image?.sprite || "",
            abilityName: chainHiddenAbility?.[0] || hiddenAbility[0]
        };
    });

    addOwnedHiddenAbility({
        pokemonId: pokemon.id,
        pokemonName: pokemon.name.english,
        abilityName: hiddenAbility[0],
        sprite: pokemon.image?.thumbnail || pokemon.image?.sprite || "",
        evolutionLine: evolutionChain,
        castratedPrice: unformatMoney(ownedHACastratedPrice.value),
        breedablePrice: unformatMoney(ownedHABreedablePrice.value),
        notes: ownedHANotes.value.trim()
    });

    showSuccessToast("HA adicionada com sucesso!");

    const pokemonIdToRefresh = selectedHAPokemonId;

    closeAddOwnedHAModal();
    renderOwnedHAList();

    if (addHAOrigin === "pokemon-details" && pokemonIdToRefresh) {
        openPokemonDetails(pokemonIdToRefresh);
    }
}

function closeAddOwnedHAModal() {
    addOwnedHAModal.classList.add("hidden");

    selectedHAPokemonId = null;
    selectedOwnedHAId = null;

    addOwnedHAModal.querySelector("h2").textContent = "Adicionar HA";
}

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

function openEditOwnedHAModal(hiddenAbilityId) {
    const hiddenAbility = loadOwnedHiddenAbilities().find((item) => {
        return item.id === hiddenAbilityId;
    });

    if (!hiddenAbility) {
        return;
    }

    selectedOwnedHAId = hiddenAbility.id;
    selectedHAPokemonId = hiddenAbility.pokemonId;

    addOwnedHASummary.innerHTML = createEditOwnedHASummary(hiddenAbility);

    ownedHACastratedPrice.value = formatMoney(hiddenAbility.castratedPrice);
    ownedHABreedablePrice.value = formatMoney(hiddenAbility.breedablePrice);
    ownedHANotes.value = hiddenAbility.notes || "";

    applyMoneyMask(ownedHACastratedPrice);
    applyMoneyMask(ownedHABreedablePrice);

    addOwnedHAModal.querySelector("h2").textContent = "Editar HA";
    addOwnedHAModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

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

btnClosePokemonDetails.addEventListener("click", closePokemonDetails);

pokemonDetailsModal.addEventListener("click", (event) => {
    if (event.target === pokemonDetailsModal) {
        closePokemonDetails();
    }
});

setupPokemonCatalogEvents();
loadPokemonCatalog();

window.renderPokemonCatalog = renderPokemonCatalog;
window.openPokemonDetails = openPokemonDetails;
window.navigatePokemonDetails = navigatePokemonDetails;

window.openOwnedHAModal = openOwnedHAModal;
window.closeOwnedHAModal = closeOwnedHAModal;
window.deleteOwnedHA = deleteOwnedHA;

window.openAddOwnedHAModal = openAddOwnedHAModal;
window.closeAddOwnedHAModal = closeAddOwnedHAModal;
window.saveOwnedHAFromModal = saveOwnedHAFromModal;
window.openEditOwnedHAModal = openEditOwnedHAModal;
