// GET API OWNED POKEMONS
async function getApiOwnedPokemons(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.gender) params.set("gender", filters.gender);
    if (filters.nature) params.set("nature", filters.nature);
    if (filters.pokemonDexId) params.set("pokemonDexId", String(filters.pokemonDexId));
    if (filters.pokemonName) params.set("pokemonName", filters.pokemonName);

    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await window.PXBRApiClient.get(`/owned-pokemons${query}`);

    return unwrapPxbrOwnedPokemonsApiData(result);
}

// GET API OWNED POKEMON BY ID
async function getApiOwnedPokemonById(ownedPokemonId) {
    const result = await window.PXBRApiClient.get(`/owned-pokemons/${ownedPokemonId}`);

    return unwrapPxbrOwnedPokemonsApiData(result);
}

// CREATE API OWNED POKEMON
async function createApiOwnedPokemon(ownedPokemon) {
    const result = await window.PXBRApiClient.post("/owned-pokemons", ownedPokemon);

    return unwrapPxbrOwnedPokemonsApiData(result);
}

// UPDATE API OWNED POKEMON
async function updateApiOwnedPokemon(ownedPokemonId, ownedPokemon) {
    const result = await window.PXBRApiClient.patch(
        `/owned-pokemons/${ownedPokemonId}`,
        ownedPokemon
    );

    return unwrapPxbrOwnedPokemonsApiData(result);
}

// UNWRAP OWNED POKEMONS API DATA
function unwrapPxbrOwnedPokemonsApiData(result) {
    return result?.data ?? result;
}

window.PXBROwnedPokemonsApiService = {
    getOwnedPokemons: getApiOwnedPokemons,
    getById: getApiOwnedPokemonById,
    create: createApiOwnedPokemon,
    update: updateApiOwnedPokemon
};
