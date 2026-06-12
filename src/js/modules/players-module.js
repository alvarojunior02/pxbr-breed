const playersCards = document.getElementById("playersCards");

const playerSearchInput = document.getElementById("playerSearchInput");
const playerSortSelect = document.getElementById("playerSortSelect");
const playersCounter = document.getElementById("playersCounter");

const btnOpenNewPlayerModal = document.getElementById("btnOpenNewPlayerModal");
const newPlayerModal = document.getElementById("newPlayerModal");
const newPlayerNick = document.getElementById("newPlayerNick");
const newPlayerNotes = document.getElementById("newPlayerNotes");
const btnConfirmNewPlayer = document.getElementById("btnConfirmNewPlayer");

const playerSummaryModal = document.getElementById("playerSummaryModal");
const playerSummaryContent = document.getElementById("playerSummaryContent");

const playerTransactionsModal = document.getElementById("playerTransactionsModal");
const playerTransactionsContent = document.getElementById("playerTransactionsContent");

const btnPreviewPlayerSkin = document.getElementById("btnPreviewPlayerSkin");
const playerSkinPreview = document.getElementById("playerSkinPreview");

let shouldSelectCreatedPlayerOnOrderForm = false;
let editingPlayerId = null;

// GET PLAYER ORDERS
function getPlayerOrders(playerId) {
    return loadOrders().filter((order) => order.playerId === playerId);
}

// GET PLAYER FINANCIAL SUMMARY
function getPlayerFinancialSummary(playerId) {
    const orders = getPlayerOrders(playerId);

    const total = orders.reduce((sum, order) => sum + order.total, 0);

    const paid = orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);

    return {
        ordersCount: orders.length,
        total,
        paid,
        pending: total - paid
    };
}

// SORT PLAYERS
function sortPlayers(players) {
    const sortBy = playerSortSelect.value;

    return [...players].sort((playerA, playerB) => {
        const summaryA = getPlayerFinancialSummary(playerA.id);
        const summaryB = getPlayerFinancialSummary(playerB.id);

        if (sortBy === "az") {
            return playerA.nick.localeCompare(playerB.nick, "pt-BR", {
                sensitivity: "base"
            });
        }

        if (sortBy === "total") {
            return summaryB.total - summaryA.total;
        }

        if (sortBy === "pending") {
            return summaryB.pending - summaryA.pending;
        }

        if (sortBy === "orders") {
            return summaryB.ordersCount - summaryA.ordersCount;
        }

        return new Date(playerB.createdAt || 0) - new Date(playerA.createdAt || 0);
    });
}

// RENDER PLAYERS MODULE
function renderPlayersModule() {
    const players = loadPlayers();

    const searchTerm = playerSearchInput.value.trim().toLowerCase();

    const filteredPlayers = players.filter((player) => {
        return player.nick.toLowerCase().includes(searchTerm);
    });

    const sortedPlayers = sortPlayers(filteredPlayers);

    playersCounter.textContent = `Exibindo ${filteredPlayers.length} de ${players.length} cliente${
        players.length === 1 ? "" : "s"
    }`;

    playersCards.innerHTML = "";

    if (filteredPlayers.length === 0) {
        playersCards.innerHTML = `
            <p class="empty-state">
                Nenhum cliente encontrado.
            </p>
        `;

        return;
    }

    sortedPlayers.forEach((player) => {
        const summary = getPlayerFinancialSummary(player.id);

        const lastOrder = getPlayerLastOrder(player.id);

        const card = document.createElement("div");

        card.classList.add("order-card");

        card.innerHTML = `
            <div class="player-card-header">
                <img
                    src="${player.avatarUrl || getMinecraftAvatarUrl(player.nick)}"
                    alt="${player.nick}"
                    class="player-avatar"
                    onerror="this.src='${getDefaultMinecraftAvatarUrl()}'">

                <h3>
                    ${player.nick}
                </h3>
            </div>

            <p>
                Encomendas:
                ${summary.ordersCount}
            </p>

            <p>
                Última encomenda:
                ${
                    lastOrder
                        ? `
                            ${formatDate(lastOrder.createdAt)}
                            (${getDaysSince(lastOrder.createdAt)} dias atrás)
                        `
                        : "Nenhuma"
                }
            </p>

            <p>
                Total vendido:
                ${formatMoney(summary.total)}
            </p>

            <p>
                Recebido:
                <span class="payment-paid">
                    ${formatMoney(summary.paid)}
                </span>
            </p>

            <p>
                Pendente:
                <span class="payment-pending">
                    ${formatMoney(summary.pending)}
                </span>
            </p>

            ${
                player.notes
                    ? `
                        <p class="player-notes">
                            ${player.notes}
                        </p>
                    `
                    : ""
            }

            <div class="player-card-actions">
                <button
                    type="button"
                    class="button-secondary"
                    onclick="openEditPlayerModal('${player.id}')">
                    Editar
                </button>

                <button
                    type="button"
                    onclick="showPlayerOrders('${player.id}')">

                    Encomendas

                </button>

                <button
                    type="button"
                    onclick="openPlayerTransactionsModal('${player.id}')">

                    Transações

                </button>
            </div>
        `;

        playersCards.appendChild(card);
    });
}

// OPEN EDIT PLAYER MODAL
function openEditPlayerModal(playerId) {
    const player = loadPlayers().find((item) => item.id === playerId);

    if (!player) {
        showWarningToast("Cliente não encontrado.");
        return;
    }

    editingPlayerId = player.id;

    newPlayerModal.querySelector("h2").textContent = "Editar Cliente";

    newPlayerNick.value = player.nick;

    newPlayerNotes.value = player.notes || "";

    renderPlayerSkinPreview(player.nick, player.avatarUrl || getMinecraftAvatarUrl(player.nick));

    updateSavePlayerButtonState();

    newPlayerModal.classList.remove("hidden");

    document.body.classList.add("modal-open");

    newPlayerNick.focus();
}

// OPEN NEW PLAYER MODAL
function openNewPlayerModal(selectOnOrderForm = false) {
    editingPlayerId = null;
    shouldSelectCreatedPlayerOnOrderForm = selectOnOrderForm;

    newPlayerModal.querySelector("h2").textContent = "Novo Cliente";

    newPlayerNick.value = "";

    newPlayerNotes.value = "";

    btnConfirmNewPlayer.disabled = true;

    newPlayerModal.classList.remove("hidden");

    document.body.classList.add("modal-open");

    newPlayerNick.focus();
}

// CLOSE NEW PLAYER MODAL
function closeNewPlayerModal() {
    closeModal(newPlayerModal);

    editingPlayerId = null;
    shouldSelectCreatedPlayerOnOrderForm = false;

    newPlayerNick.value = "";
    newPlayerNotes.value = "";

    playerSkinPreview.classList.add("hidden");
    playerSkinPreview.innerHTML = "";

    btnConfirmNewPlayer.disabled = true;
    btnPreviewPlayerSkin.disabled = true;

    newPlayerModal.querySelector("h2").textContent = "Novo Cliente";
}

// SAVE NEW PLAYER FROM MODAL
function savePlayerFromModal() {
    const nick = newPlayerNick.value.trim();

    if (!nick) {
        showWarningToast("Informe o nick do cliente.");
        return;
    }

    if (nick.length < 3) {
        showWarningToast("O nick do cliente deve ter pelo menos 3 caracteres.");
        return;
    }

    const minecraftNickRegex = /^[A-Za-z0-9_]{3,16}$/;

    if (!minecraftNickRegex.test(nick)) {
        showToast(
            "Nick inválido. Utilize apenas letras, números e underscore (_), entre 3 e 16 caracteres.",
            "warning"
        );

        return;
    }

    const players = loadPlayers();

    const nickAlreadyExists = players.some((player) => {
        return player.nick.toLowerCase() === nick.toLowerCase() && player.id !== editingPlayerId;
    });

    if (nickAlreadyExists) {
        showWarningToast("Já existe um cliente cadastrado com esse nick.");
        return;
    }

    if (editingPlayerId) {
        updatePlayer(editingPlayerId, {
            nick,
            notes: newPlayerNotes.value.trim()
        });

        showSuccessToast("Cliente atualizado com sucesso!");
    } else {
        const player = {
            ...createPlayer(nick),
            avatarUrl: `https://mc-heads.net/avatar/${nick}`,
            notes: newPlayerNotes.value.trim()
        };

        savePlayers([...players, player]);

        showSuccessToast("Cliente cadastrado com sucesso!");

        if (shouldSelectCreatedPlayerOnOrderForm && typeof selectOrderPlayer === "function") {
            selectOrderPlayer(player);
        }
    }

    renderPlayersModule();
    renderDashboard();
    renderOrdersList();

    closeNewPlayerModal();
}

// UPDATE PLAYER
function updatePlayer(playerId, data) {
    const players = loadPlayers();

    const updatedPlayers = players.map((player) => {
        if (player.id !== playerId) {
            return player;
        }

        return {
            ...player,
            nick: data.nick,
            avatarUrl: `https://mc-heads.net/avatar/${data.nick}`,
            notes: data.notes || "",
            updatedAt: new Date().toISOString()
        };
    });

    savePlayers(updatedPlayers);
}

// SHOW PLAYER ORDERS
function showPlayerOrders(playerId) {
    const player = loadPlayers().find((player) => player.id === playerId);

    if (!player) {
        return;
    }

    const orderSearchPlayer = document.getElementById("orderSearchPlayer");

    const orderStatusFilter = document.getElementById("orderStatusFilter");

    const orderArchiveFilter = document.getElementById("orderArchiveFilter");

    orderSearchPlayer.value = player.nick;

    orderStatusFilter.value = "";

    orderArchiveFilter.value = "all";

    showSection("ordersSection");

    renderOrdersList();
}

// OPEN PLAYERS SUMMARY MODAL
function openPlayerSummaryModal(playerId) {
    const player = loadPlayers().find((player) => player.id === playerId);

    if (!player) {
        return;
    }

    const summary = getPlayerFinancialSummary(player.id);

    const lastOrder = getPlayerLastOrder(player.id);

    playerSummaryContent.innerHTML = `
        <div class="player-card-header">
            <img
                src="${player.avatarUrl || getMinecraftAvatarUrl(player.nick)}"
                alt="${player.nick}"
                class="player-avatar"
                onerror="this.src='${getDefaultMinecraftAvatarUrl()}'">

            <h3>
                ${player.nick}
            </h3>
        </div>

        <p>
            Encomendas:
            ${summary.ordersCount}
        </p>

        <p>
            Última encomenda:
            ${
                lastOrder
                    ? `
                        ${formatDate(lastOrder.createdAt)}
                        (${getDaysSince(lastOrder.createdAt)} dias atrás)
                    `
                    : "Nenhuma"
            }
        </p>

        <p>
            Total vendido:
            ${formatMoney(summary.total)}
        </p>

        <p>
            Recebido:
            <span class="payment-paid">
                ${formatMoney(summary.paid)}
            </span>
        </p>

        <p>
            Pendente:
            <span class="payment-pending">
                ${formatMoney(summary.pending)}
            </span>
        </p>

        ${
            player.notes
                ? `
            <p class="player-notes">
                ${player.notes}
            </p>
        `
                : ""
        }
    `;

    openModal(playerSummaryModal);
}

// OPEN PLAYER TRANSACTIONS MODAL
function openPlayerTransactionsModal(playerId) {
    const player = loadPlayers().find((player) => player.id === playerId);

    if (!player) {
        return;
    }

    const transactions = getPlayerTransactions(playerId);

    const rows = transactions
        .map(
            (transaction) => `
                <tr>
                    <td>
                        ${formatDateTime(transaction.createdAt)}
                    </td>

                    <td>
                        ${formatMoney(transaction.amount)}
                    </td>

                    <td>
                        <button
                            type="button"
                            onclick="openOrderDetailsFromPlayerTransactions('${transaction.orderId}')">

                            Ver Encomenda

                        </button>
                    </td>
                </tr>
            `
        )
        .join("");

    playerTransactionsContent.innerHTML = `
        <h3 class="player-transactions-title">
            ${renderPlayerInline(player, 32)}
        </h3>

        ${
            transactions.length === 0
                ? `
                    <p>
                        Nenhuma transação registrada para este cliente.
                    </p>
                `
                : `
                    <div class="table-wrapper">
                        <table class="finance-table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Valor</th>
                                    <th>Encomenda</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                `
        }
    `;

    playerTransactionsModal.classList.remove("hidden");
}

// OPEN ORDER DETAILS FORM PLAYER TRANSACTIONS
function openOrderDetailsFromPlayerTransactions(orderId) {
    playerTransactionsModal.classList.add("hidden");

    openOrderDetails(orderId);
}

// UPDATE SAVE PLAYER BUTTON STATE
function updateSavePlayerButtonState() {
    const nick = newPlayerNick.value.trim();
    const isValid = nick.length >= 3;

    btnConfirmNewPlayer.disabled = !isValid;
    btnPreviewPlayerSkin.disabled = !isValid;
}

// RENDERE PLAYER SKIN PREVIEW
function renderPlayerSkinPreview(nick, avatarUrl) {
    playerSkinPreview.classList.remove("hidden");

    playerSkinPreview.innerHTML = `
        <div class="player-skin-preview-card">
            <img
                src="${avatarUrl}"
                alt="${nick}"
                onerror="this.src='${getDefaultMinecraftAvatarUrl()}'">

            <div>
                <strong>${nick}</strong>
                <span>Prévia da skin Minecraft</span>
            </div>
        </div>
    `;
}

// PREVIEW PLAYER SKIN
function previewPlayerSkin() {
    const nick = newPlayerNick.value.trim();

    if (nick.length < 3) {
        showWarningToast("Digite pelo menos 3 caracteres para buscar a skin.");
        return;
    }

    const avatarUrl = `https://mc-heads.net/avatar/${nick}`;

    btnPreviewPlayerSkin.disabled = true;
    btnPreviewPlayerSkin.textContent = "Buscando...";

    playerSkinPreview.classList.remove("hidden");

    playerSkinPreview.innerHTML = `
        <div class="player-skin-preview-card">
            <div class="player-skin-spinner"></div>

            <div>
                <strong>${nick}</strong>
                <span>Buscando skin...</span>
            </div>
        </div>
    `;

    setTimeout(() => {
        renderPlayerSkinPreview(nick, avatarUrl);

        btnPreviewPlayerSkin.disabled = false;
        btnPreviewPlayerSkin.textContent = "Buscar Skin";
    }, 450);
}

playerSearchInput.addEventListener("input", renderPlayersModule);

playerSortSelect.addEventListener("change", renderPlayersModule);

btnOpenNewPlayerModal.addEventListener("click", openNewPlayerModal);

btnConfirmNewPlayer.addEventListener("click", savePlayerFromModal);

newPlayerNick.addEventListener("input", () => {
    updateSavePlayerButtonState();

    playerSkinPreview.classList.add("hidden");
    playerSkinPreview.innerHTML = "";

    btnPreviewPlayerSkin.textContent = "Buscar Skin";
});

btnPreviewPlayerSkin.addEventListener("click", previewPlayerSkin);

renderPlayersModule();

window.renderPlayersModule = renderPlayersModule;
window.showPlayerOrders = showPlayerOrders;
window.openPlayerSummaryModal = openPlayerSummaryModal;
window.openPlayerTransactionsModal = openPlayerTransactionsModal;
window.openNewPlayerModal = openNewPlayerModal;
window.openOrderDetailsFromPlayerTransactions = openOrderDetailsFromPlayerTransactions;
window.openEditPlayerModal = openEditPlayerModal;
window.savePlayerFromModal = savePlayerFromModal;
