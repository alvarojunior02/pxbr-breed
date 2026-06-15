// GET API PLAYERS
async function getApiPlayers(search = "") {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";

    const result = await window.PXBRApiClient.get(`/players${query}`);

    return unwrapPxbrApiData(result);
}

// GET API PLAYER BY ID
async function getApiPlayerById(playerId) {
    const result = await window.PXBRApiClient.get(`/players/${playerId}`);

    return unwrapPxbrApiData(result);
}

// CREATE API PLAYER
async function createApiPlayer({ nick, notes }) {
    const result = await window.PXBRApiClient.post("/players", {
        nick,
        notes
    });

    return unwrapPxbrApiData(result);
}

// UPDATE API PLAYER
async function updateApiPlayer(playerId, { nick, notes }) {
    const result = await window.PXBRApiClient.patch(`/players/${playerId}`, {
        nick,
        notes
    });

    return unwrapPxbrApiData(result);
}

// DELETE API PLAYER
async function deleteApiPlayer(playerId) {
    const result = await window.PXBRApiClient.delete(`/players/${playerId}`);

    return unwrapPxbrApiData(result);
}

// UNWRAP API DATA
function unwrapPxbrApiData(result) {
    return result?.data ?? result;
}

// SHOULD USE API PLAYERS
function shouldUseApiPlayers() {
    return window.getPxbrFeatureFlag?.("useApiPlayers") === true;
}

// LOAD PLAYERS FROM SOURCE
async function loadPlayersFromSource(search = "") {
    if (shouldUseApiPlayers()) {
        return window.PXBRPlayersApiService.getPlayers(search);
    }

    const players = loadPlayers();

    if (!search) {
        return players;
    }

    const normalizedSearch = search.trim().toLowerCase();

    return players.filter((player) => player.nick.toLowerCase().includes(normalizedSearch));
}

// SAVE PLAYER TO SOURCE
async function savePlayerToSource({ playerId, nick, notes }) {
    if (shouldUseApiPlayers()) {
        if (playerId) {
            return window.PXBRPlayersApiService.update(playerId, {
                nick,
                notes
            });
        }

        return window.PXBRPlayersApiService.create({
            nick,
            notes
        });
    }

    const players = loadPlayers();

    if (playerId) {
        updatePlayer(playerId, {
            nick,
            notes
        });

        return loadPlayers().find((player) => player.id === playerId);
    }

    const player = {
        ...createPlayer(nick),
        avatarUrl: getMinecraftAvatarUrl(nick),
        notes
    };

    savePlayers([...players, player]);

    return player;
}

window.shouldUseApiPlayers = shouldUseApiPlayers;
window.loadPlayersFromSource = loadPlayersFromSource;
window.savePlayerToSource = savePlayerToSource;

window.PXBRPlayersApiService = {
    getPlayers: getApiPlayers,
    getById: getApiPlayerById,
    create: createApiPlayer,
    update: updateApiPlayer,
    delete: deleteApiPlayer
};
