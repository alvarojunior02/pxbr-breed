let players = loadPlayers();

const playerNickInput = document.getElementById("playerNick");

const playersList = document.getElementById("playersList");

const btnSavePlayer = document.getElementById("btnSavePlayer");

const playersCount = document.getElementById("playersCount");

const searchPlayer = document.getElementById("searchPlayer");

function renderPlayers(search = "") {
    playersList.innerHTML = "";

    const filteredPlayers =
        players.filter(player =>
            player.nick
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    playersCount.textContent = players.length;

    filteredPlayers.forEach(player => {

        const li =
            document.createElement("li");

        li.textContent = player.nick;

        playersList.appendChild(li);

    });
}

function createPlayer(nick) {
    return {
        id: generateUUID(),
        nick,
        createdAt: new Date().toISOString()

    };
}

btnSavePlayer.addEventListener(
    "click",
    () => {

        const nick =
            playerNickInput.value.trim();

        if (!nick) {
            alert("Informe um nick.");
            return;
        }

        const playerExists = players.some(
            player => player.nick === nick
        );

        if (playerExists) {
            alert("Já existe um player com esse nick.");
            return;
        }

        const player =
            createPlayer(nick);

        players.push(player);

        savePlayers(players);

        renderPlayers();

        playerNickInput.value = "";
    }
);

searchPlayer.addEventListener(
    "input",
    e => {
        renderPlayers(e.target.value);
    }
);

renderPlayers();