const pokemonCatalogSearch = document.getElementById("pokemonCatalogSearch");
const pokemonGenerationFilter = document.getElementById("pokemonGenerationFilter");
const pokemonEggGroupFilter = document.getElementById("pokemonEggGroupFilter");
const pokemonCatalogGrid = document.getElementById("pokemonCatalogGrid");

const pokemonDetailsModal = document.getElementById("pokemonDetailsModal");
const pokemonDetailsContent = document.getElementById("pokemonDetailsContent");
const btnClosePokemonDetails = document.getElementById("btnClosePokemonDetails");

let pokedexCatalog = [];
let pokemonDetailsAnimationDirection = "none";

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
    const chain = [];
    let currentPokemon = pokemon;

    while (currentPokemon?.evolution?.prev) {
        const previousPokemonId = currentPokemon.evolution.prev[0];
        currentPokemon = getPokemonById(previousPokemonId);
    }

    while (currentPokemon) {
        chain.push(currentPokemon);

        const nextEvolution = currentPokemon.evolution?.next?.[0];

        if (!nextEvolution) {
            break;
        }

        const nextPokemonId = nextEvolution[0];
        currentPokemon = getPokemonById(nextPokemonId);
    }

    return chain;
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
