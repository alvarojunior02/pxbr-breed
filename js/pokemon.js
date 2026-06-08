let pokemonData = [];

async function loadPokemonData() {
    try {
        const response =
            await fetch("./data/pokedex.json");

        const data =
            await response.json();

        pokemonData =
            data.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name.english,
                eggGroups: pokemon.profile.egg,
                thumbnail:
                    pokemon.image.thumbnail
            }));

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

pokemonSearch.addEventListener(
    "input",
    e => {

        const results =
            searchPokemon(
                e.target.value
            );

        renderPokemonResults(
            results
        );

    }
);

loadPokemonData();