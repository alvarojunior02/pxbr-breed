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

const playerOrdersModal = document.getElementById("playerOrdersModal");
const playerOrdersContent = document.getElementById("playerOrdersContent");

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
async function renderPlayersModule() {
    const searchTerm = playerSearchInput.value.trim();

    playersCards.innerHTML = `
        <p class="empty-state">
            Carregando clientes...
        </p>
    `;

    try {
        const players = await loadPlayersFromSource(searchTerm);
        const normalizedSearch = searchTerm.toLowerCase();

        const filteredPlayers = shouldUseApiPlayers()
            ? players
            : players.filter((player) => {
                  return player.nick.toLowerCase().includes(normalizedSearch);
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
    } catch (error) {
        playersCards.innerHTML = `
            <p class="empty-state">
                Não foi possível carregar os clientes.
            </p>
        `;

        showToast(error?.message || "Erro ao carregar clientes.", "error");
    }
}

// OPEN EDIT PLAYER MODAL
async function openEditPlayerModal(playerId) {
    const player = shouldUseApiPlayers()
        ? await window.PXBRPlayersApiService.getById(playerId)
        : loadPlayers().find((item) => item.id === playerId);

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

    openModal(newPlayerModal);

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

    openModal(newPlayerModal);

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
async function savePlayerFromModal() {
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

    const players = shouldUseApiPlayers() ? [] : loadPlayers();

    const nickAlreadyExists =
        !shouldUseApiPlayers() &&
        players.some((player) => {
            return (
                player.nick.toLowerCase() === nick.toLowerCase() && player.id !== editingPlayerId
            );
        });

    if (nickAlreadyExists) {
        showWarningToast("Já existe um cliente cadastrado com esse nick.");
        return;
    }

    try {
        const savedPlayer = await savePlayerToSource({
            playerId: editingPlayerId,
            nick,
            notes: newPlayerNotes.value.trim()
        });

        if (editingPlayerId) {
            showSuccessToast("Cliente atualizado com sucesso!");
        } else {
            showSuccessToast("Cliente cadastrado com sucesso!");

            if (shouldSelectCreatedPlayerOnOrderForm && typeof selectOrderPlayer === "function") {
                selectOrderPlayer(savedPlayer);
            }
        }
    } catch (error) {
        showToast(error?.data?.message || error?.message || "Erro ao salvar cliente.", "error");
        return;
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

// CREATE PLAYER ORDER CARD
function createPlayerOrderCard(order) {
    const statusSummary = getOrderStatusSummary(order);

    const statusHtml = Object.entries(statusSummary)
        .map(
            ([status, count]) =>
                `
                    <li>
                        ${count}
                        <span class="${getOrderStatusClass(status)}">
                            ${getStatusByValue(status).name}
                        </span>
                    </li>
                `
        )
        .join("");

    return `
        <article class="player-order-card order-card">
            ${
                order.archived
                    ? `
                        <p class="archived-label">
                            Arquivada
                        </p>
                    `
                    : ""
            }

            <div class="order-card-header">
                <div>
                    <h3 class="order-card-title">
                        Pedido #${order.id.slice(0, 8)}
                        <span>
                            - ${formatDate(order.createdAt)}
                        </span>
                    </h3>

                    <p class="order-card-created-ago">
                        ${formatRelativeOrderTime(order.createdAt)}
                    </p>
                </div>
            </div>

            <p>
                Pokémons:
                ${order.pokemons.length}
            </p>

            <p>
                Total:
                ${formatMoney(order.total)}
            </p>

            <strong>Pagamento:</strong>

            <p>
                ${getPaymentStatusHtml(order)}
            </p>

            <strong>Status de Breeds:</strong>

            <ul>
                ${statusHtml}
            </ul>

            ${getArchiveReadyHtml(order)}

            <div class="order-card-actions">
                <button
                    type="button"
                    onclick="openOrderDetailsFromPlayerOrders('${order.id}')">
                    Detalhes
                </button>

                ${
                    canRegisterPayment(order)
                        ? `
                            <button
                                type="button"
                                class="button-success"
                                onclick="openPaymentFromPlayerOrders('${order.id}')">
                                Pagamento
                            </button>
                        `
                        : ""
                }

                ${
                    canArchiveOrder(order)
                        ? `
                            <button
                                type="button"
                                class="button-archive"
                                onclick="archiveOrderFromPlayerOrders('${order.id}')">
                                Arquivar
                            </button>
                        `
                        : ""
                }
            </div>
        </article>
    `;
}

// SHOW PLAYER ORDERS
function showPlayerOrders(playerId) {
    const player = loadPlayers().find((player) => player.id === playerId);

    if (!player) {
        showWarningToast("Cliente não encontrado.");
        return;
    }

    const orders = getPlayerOrders(playerId).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const summary = getPlayerFinancialSummary(playerId);

    playerOrdersContent.innerHTML = `
        <div class="player-orders-header">
            <div class="player-card-header">
                ${renderPlayerAvatar(player, 48)}

                <div>
                    <h3>
                        ${player.nick}
                    </h3>

                    <p>
                        ${summary.ordersCount}
                        encomenda${summary.ordersCount === 1 ? "" : "s"} registrada${
                            summary.ordersCount === 1 ? "" : "s"
                        }
                    </p>
                </div>
            </div>

            <div class="player-orders-summary">
                <span>
                    Total vendido:
                    <strong>${formatMoney(summary.total)}</strong>
                </span>

                <span>
                    Recebido:
                    <strong class="payment-paid">${formatMoney(summary.paid)}</strong>
                </span>

                <span>
                    Pendente:
                    <strong class="payment-pending">${formatMoney(summary.pending)}</strong>
                </span>
            </div>
        </div>

        ${
            orders.length === 0
                ? `
                    <p class="empty-state">
                        Nenhuma encomenda registrada para este cliente.
                    </p>
                `
                : `
                    <div class="player-orders-grid">
                        ${orders.map((order) => createPlayerOrderCard(order)).join("")}
                    </div>
                `
        }
    `;

    openModal(playerOrdersModal);
}

// OPEN ORDER DETAILS FROM PLAYER ORDERS
function openOrderDetailsFromPlayerOrders(orderId) {
    closeModal(playerOrdersModal);

    openOrderDetails(orderId);
}

// OPEN PAYMENT FROM PLAYER ORDERS
function openPaymentFromPlayerOrders(orderId) {
    closeModal(playerOrdersModal);

    openPaymentModal(orderId);
}

// ARCHIVE ORDER FROM PLAYER ORDERS
function archiveOrderFromPlayerOrders(orderId) {
    closeModal(playerOrdersModal);

    archiveOrder(orderId);
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

    openModal(playerTransactionsModal);
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

window.openOrderDetailsFromPlayerOrders = openOrderDetailsFromPlayerOrders;
window.openPaymentFromPlayerOrders = openPaymentFromPlayerOrders;
window.archiveOrderFromPlayerOrders = archiveOrderFromPlayerOrders;
