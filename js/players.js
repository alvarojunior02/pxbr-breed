function createPlayer(nick) {
    return {
        id: generateUUID(),
        nick,
        createdAt: new Date().toISOString()
    };
}

function playerExists(nick) {
    const players =
        loadPlayers();

    return players.some(
        player =>
            player.nick === nick
    );
}

function addPlayer(nick) {
    if (!nick) {
        throw new Error(
            "Informe um nick."
        );
    }

    if (playerExists(nick)) {
        throw new Error(
            "Já existe um player com esse nick."
        );
    }

    const players =
        loadPlayers();

    const player =
        createPlayer(nick);

    players.push(player);

    savePlayers(players);

    return player;
}