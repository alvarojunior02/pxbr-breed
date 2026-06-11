const pokemonSearch = document.getElementById("pokemonSearch");
const pokemonResults = document.getElementById("pokemonResults");

let pokemonData = [];
let pokemonLoaded = false;

function formatAbilityName(abilityName) {
    return abilityName.replaceAll("-", " ");
}

async function loadPokemonData() {
    try {
        const response = await fetch("./src/data/pokedex.json");

        const data = await response.json();

        pokemonData = data.map((pokemon) => ({
            id: pokemon.id,
            name: pokemon.name.english,
            eggGroups: pokemon.profile.egg,
            abilities: pokemon.profile.ability.map((ability) => ({
                name: formatAbilityName(ability[0]),
                isHA: ability[1] === "true"
            })),
            sprite: pokemon.image.sprite,
            thumbnail: pokemon.image.thumbnail,
            hires: pokemon.image.hires,
            evolution: pokemon.evolution || null
        }));

        pokemonLoaded = true;
    } catch (error) {
        console.log("Erro ao carregar Pokédex:", error);
    }
}

function searchPokemon(searchTerm) {
    if (!searchTerm) {
        return [];
    }

    const term = searchTerm.toLowerCase();

    return pokemonData.filter(
        (pokemon) =>
            pokemon.name.toLowerCase().includes(term) || pokemon.id.toString().includes(term)
    );
}

function getPokemonById(id) {
    return pokemonData.find((pokemon) => pokemon.id === Number(id));
}

function getPokemonThumbnail(pokemonId) {
    const pokemon = getPokemonById(pokemonId);

    return pokemon ? pokemon.thumbnail : "";
}

function getBasePokemon(pokemonId) {
    let pokemon = getPokemonById(pokemonId);

    while (pokemon && pokemon.evolution && pokemon.evolution.prev) {
        const previousId = Number(pokemon.evolution.prev[0]);

        pokemon = getPokemonById(previousId);
    }

    return pokemon;
}

function isPokemonDataLoaded() {
    return pokemonLoaded;
}

function renderPokemonResults(results) {
    pokemonResults.innerHTML = "";

    results.forEach((pokemon) => {
        const li = document.createElement("li");

        li.textContent = `#${pokemon.id} - ${pokemon.name}`;

        pokemonResults.appendChild(li);
    });
}

if (pokemonSearch && pokemonResults) {
    pokemonSearch.addEventListener("input", (e) => {
        const searchTerm = e.target.value.trim();

        if (!searchTerm) {
            pokemonResults.innerHTML = "";

            return;
        }

        const results = searchPokemon(searchTerm).slice(0, 10);

        renderPokemonResults(results);
    });
}

loadPokemonData();

window.getPokemonThumbnail = getPokemonThumbnail;
