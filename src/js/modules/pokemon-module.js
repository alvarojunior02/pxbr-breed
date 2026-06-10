const pokemonCatalogSearch = document.getElementById("pokemonCatalogSearch");
const pokemonGenerationFilter = document.getElementById("pokemonGenerationFilter");
const pokemonEggGroupFilter = document.getElementById("pokemonEggGroupFilter");
const pokemonCatalogGrid = document.getElementById("pokemonCatalogGrid");

let pokedexCatalog = [];

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
    const pokemon = pokedexCatalog.find((item) => item.id === pokemonId);

    if (!pokemon) {
        return;
    }

    alert(`Detalhes de ${pokemon.name.english} serão implementados na próxima etapa.`);
}

function setupPokemonCatalogEvents() {
    pokemonCatalogSearch.addEventListener("input", renderPokemonCatalog);
    pokemonGenerationFilter.addEventListener("change", renderPokemonCatalog);
    pokemonEggGroupFilter.addEventListener("change", renderPokemonCatalog);
}

setupPokemonCatalogEvents();
loadPokemonCatalog();

window.renderPokemonCatalog = renderPokemonCatalog;
window.openPokemonDetails = openPokemonDetails;
