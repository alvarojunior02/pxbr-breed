// GET API OWNED HAS
async function getApiOwnedHAs(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.abilityName) params.set("abilityName", filters.abilityName);
    if (filters.nature) params.set("nature", filters.nature);
    if (filters.pokemonDexId) params.set("pokemonDexId", String(filters.pokemonDexId));
    if (filters.pokemonName) params.set("pokemonName", filters.pokemonName);

    const query = params.toString() ? `?${params.toString()}` : "";
    const result = await window.PXBRApiClient.get(`/owned-has${query}`);

    return unwrapPxbrOwnedHAsApiData(result);
}

// GET API OWNED HA BY ID
async function getApiOwnedHAById(ownedHaId) {
    const result = await window.PXBRApiClient.get(`/owned-has/${ownedHaId}`);

    return unwrapPxbrOwnedHAsApiData(result);
}

// CREATE API OWNED HA
async function createApiOwnedHA(ownedHa) {
    const result = await window.PXBRApiClient.post("/owned-has", ownedHa);

    return unwrapPxbrOwnedHAsApiData(result);
}

// UPDATE API OWNED HA
async function updateApiOwnedHA(ownedHaId, ownedHa) {
    const result = await window.PXBRApiClient.patch(`/owned-has/${ownedHaId}`, ownedHa);

    return unwrapPxbrOwnedHAsApiData(result);
}

// UNWRAP OWNED HAS API DATA
function unwrapPxbrOwnedHAsApiData(result) {
    return result?.data ?? result;
}

window.PXBROwnedHAsApiService = {
    getOwnedHAs: getApiOwnedHAs,
    getById: getApiOwnedHAById,
    create: createApiOwnedHA,
    update: updateApiOwnedHA
};
