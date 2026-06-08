let pokemonData = [];

async function loadPokemonData() {
    try {
        const response =
            await fetch("./data/pokedex.json");

        const data =
            await response.json();

        pokemonData = data.map(
            pokemon => ({
                id: pokemon.id,

                name: pokemon.name.english,

                eggGroups:
                    pokemon.profile.egg,

                thumbnail:
                    pokemon.image.thumbnail,

                evolution:
                    pokemon.evolution || null
            })
        );

        console.log(
            "Pokémons carregados:",
            pokemonData.length
        );
    } catch (error) {
        console.log( "Erro ao carregar Pokédex:", error);
    }
}

function searchPokemon(searchTerm) {
    if (!searchTerm) {
        return [];
    }

    return pokemonData.filter(
        pokemon =>
            pokemon.name
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
    );
}

const pokemonSearch = document.getElementById("pokemonSearch");
const pokemonResults = document.getElementById("pokemonResults");

function renderPokemonResults(results) {
    pokemonResults.innerHTML = "";

    results.forEach(pokemon => {
        const li =
            document.createElement("li");

        li.textContent =
            `#${pokemon.id} - ${pokemon.name}`;

        pokemonResults.appendChild(li);
    });
}

pokemonSearch.addEventListener(
    "input",
    e => {
        const searchTerm =
            e.target.value.trim();

        if (!searchTerm) {

            pokemonResults.innerHTML = "";

            return;
        }

        const results =
            searchPokemon(searchTerm)
                .slice(0, 10);

        renderPokemonResults(results);
    }
);

function getPokemonById(id) {
    return pokemonData.find(
        pokemon => pokemon.id === Number(id)
    );
}

function getBasePokemon(pokemonId) {
    let pokemon =
        getPokemonById(pokemonId);

    while (
        pokemon &&
        pokemon.evolution &&
        pokemon.evolution.prev
    ) {

        const previousId =
            Number(
                pokemon.evolution.prev[0]
            );

        pokemon =
            getPokemonById(previousId);

    }

    return pokemon;
}

loadPokemonData();