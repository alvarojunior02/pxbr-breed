const playersCards = document.getElementById("playersCards");
const btnOpenNewPlayerModal = document.getElementById("btnOpenNewPlayerModal");
const newPlayerModal = document.getElementById("newPlayerModal");
const newPlayerNick = document.getElementById("newPlayerNick");
const btnCancelNewPlayer = document.getElementById("btnCancelNewPlayer");
const btnConfirmNewPlayer = document.getElementById("btnConfirmNewPlayer");

const playerSummaryModal = document.getElementById("playerSummaryModal");
const playerSummaryContent = document.getElementById("playerSummaryContent");
const btnClosePlayerSummary = document.getElementById("btnClosePlayerSummary");

const playerTransactionsModal = document.getElementById("playerTransactionsModal");
const playerTransactionsContent = document.getElementById("playerTransactionsContent");
const btnClosePlayerTransactions = document.getElementById("btnClosePlayerTransactions");

function getPlayerOrders(playerId) {
    return loadOrders()
        .filter(order =>
            order.playerId === playerId
        );
}

function getPlayerFinancialSummary(playerId) {
    const orders =
        getPlayerOrders(playerId);

    const total =
        orders.reduce(
            (sum, order) =>
                sum + order.total,
            0
        );

    const paid =
        orders.reduce(
            (sum, order) =>
                sum + (order.paidAmount || 0),
            0
        );

    return {
        ordersCount: orders.length,
        total,
        paid,
        pending: total - paid
    };
}

function renderPlayersModule() {
    const players = loadPlayers();

    playersCards.innerHTML = "";

    players.forEach(player => {
        const summary = getPlayerFinancialSummary(player.id);

        const lastOrder = getPlayerLastOrder(player.id);

        const card = document.createElement("div");

        card.classList.add("order-card");

        card.innerHTML =
            `
            <h3>${player.nick}</h3>

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

            <div class="player-card-actions">
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

function openNewPlayerModal() {
    newPlayerNick.value = "";

    newPlayerModal.classList.remove("hidden");

    newPlayerNick.focus();
}

function closeNewPlayerModal() {
    newPlayerModal.classList.add("hidden");
}

function saveNewPlayerFromModal() {
    const nick =
        newPlayerNick.value.trim();

    try {
        addPlayer(nick);

        closeNewPlayerModal();

        renderPlayersModule();

        if (typeof renderDashboard === "function") {
            renderDashboard();
        }
    } catch (error) {
        alert(error.message);
    }
}

function showPlayerOrders(playerId) {
    const player =
        loadPlayers().find(player =>
            player.id === playerId
        );

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

function openPlayerSummaryModal(playerId) {
    const player =
        loadPlayers().find(
            player =>
                player.id === playerId
        );

    if (!player) {
        return;
    }

    const summary =
        getPlayerFinancialSummary(player.id);

    const lastOrder =
        getPlayerLastOrder(player.id);

    playerSummaryContent.innerHTML =
        `
        <h3>
            ${player.nick}
        </h3>

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
    `;

    playerSummaryModal.classList.remove(
        "hidden"
    );
}

function openPlayerTransactionsModal(playerId) {
    const player =
        loadPlayers().find(
            player =>
                player.id === playerId
        );

    if (!player) {
        return;
    }

    const transactions = getPlayerTransactions(playerId);

    const rows =
        transactions
            .map(transaction => `
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
                            onclick="openOrderDetails('${transaction.orderId}')">

                            Ver Encomenda

                        </button>
                    </td>
                </tr>
            `)
            .join("");

    playerTransactionsContent.innerHTML =
        `
        <h3>
            ${player.nick}
        </h3>

        ${
            transactions.length === 0
                ? `
                    <p>
                        Nenhuma transação registrada para este player.
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

    playerTransactionsModal.classList.remove(
        "hidden"
    );
}

btnOpenNewPlayerModal.addEventListener(
    "click",
    openNewPlayerModal
);

btnCancelNewPlayer.addEventListener(
    "click",
    closeNewPlayerModal
);

btnConfirmNewPlayer.addEventListener(
    "click",
    saveNewPlayerFromModal
);

btnClosePlayerSummary.addEventListener(
    "click",
    () => {
        playerSummaryModal.classList.add(
            "hidden"
        );
    }
);

btnClosePlayerTransactions.addEventListener(
    "click",
    () => {
        playerTransactionsModal.classList.add(
            "hidden"
        );
    }
);

renderPlayersModule();

window.renderPlayersModule = renderPlayersModule;
window.showPlayerOrders = showPlayerOrders;
window.openPlayerSummaryModal = openPlayerSummaryModal;
window.openPlayerTransactionsModal = openPlayerTransactionsModal;