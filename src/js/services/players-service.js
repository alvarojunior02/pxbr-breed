// CREATE PLAYER
function createPlayer(nick) {
    return {
        id: generateUUID(),
        nick,
        avatarUrl: getMinecraftAvatarUrl(nick),
        createdAt: new Date().toISOString()
    };
}

// PLAYER EXISTS
function playerExists(nick) {
    const players = loadPlayers();

    return players.some((player) => player.nick === nick);
}

// ADD PLAYER
function addPlayer(nick) {
    if (!nick) {
        throw new Error("Informe um nick.");
    }

    if (playerExists(nick)) {
        throw new Error("Já existe um player com esse nick.");
    }

    const players = loadPlayers();

    const player = createPlayer(nick);

    players.push(player);

    savePlayers(players);

    return player;
}

// GET MINECRAFT AVATAR URL
function getMinecraftAvatarUrl(nick) {
    return `https://mc-heads.net/avatar/${encodeURIComponent(nick)}`;
}

// GET DEFAULT MINECRAFT AVATAR URL
function getDefaultMinecraftAvatarUrl() {
    return "https://mc-heads.net/avatar/Steve";
}

window.getMinecraftAvatarUrl = getMinecraftAvatarUrl;
window.getDefaultMinecraftAvatarUrl = getDefaultMinecraftAvatarUrl;
