const dashboardRecentOrders = document.getElementById("dashboardRecentOrders");
const dashboardRecentTransactions = document.getElementById("dashboardRecentTransactions");

// GET POKEMON STATUS COUNTS
function getPokemonStatusCounts(pokemons) {
    const counts = {};

    ORDER_STATUS.forEach((status) => {
        counts[status.value] = 0;
    });

    pokemons.forEach((pokemon) => {
        counts[pokemon.status] = (counts[pokemon.status] || 0) + 1;
    });

    return counts;
}

// GET DASHBOARD METRICS
function getDashboardMetrics() {
    const orders = loadOrders();

    const players = loadPlayers();

    const activeOrders = orders.filter((order) => !order.archived);

    const archivedOrders = orders.filter((order) => order.archived);

    const activePokemons = activeOrders.flatMap((order) => order.pokemons);

    const archivedPokemons = archivedOrders.flatMap((order) => order.pokemons);

    const totalReceived = orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);

    const totalPending = activeOrders.reduce(
        (sum, order) => sum + Math.max(order.total - (order.paidAmount || 0), 0),
        0
    );

    const activeOrdersValue = activeOrders.reduce((sum, order) => sum + order.total, 0);

    const archivedOrdersValue = archivedOrders.reduce((sum, order) => sum + order.total, 0);

    return {
        activeOrders: activeOrders.length,

        activePokemons: activePokemons.length,

        players: players.length,

        archivedOrders: archivedOrders.length,

        activeOrdersValue,

        totalReceived,

        totalPending,

        archivedOrdersValue,

        activeStatusCounts: getPokemonStatusCounts(activePokemons),

        archivedStatusCounts: getPokemonStatusCounts(archivedPokemons)
    };
}

// GET DASHBOARD METRICS FROM API
async function getDashboardMetricsFromApi() {
    const [summary, statusReport] = await Promise.all([
        window.PXBRReportsApiService.getDashboardSummary(),
        window.PXBRReportsApiService.getOrdersByStatus()
    ]);

    const activeStatusCounts = {};
    const archivedStatusCounts = {};

    ORDER_STATUS.forEach((status) => {
        activeStatusCounts[status.value] = 0;
        archivedStatusCounts[status.value] = 0;
    });

    statusReport.forEach((item) => {
        activeStatusCounts[item.status] = item.quantity;
    });

    return {
        activeOrders: summary.activeOrders,
        activePokemons: summary.totalPokemons,
        players: summary.totalPlayers,
        archivedOrders: summary.archivedOrders,
        activeOrdersValue: summary.totalRevenue,
        totalReceived: summary.paidRevenue,
        totalPending: summary.pendingRevenue,
        archivedOrdersValue: 0,
        activeStatusCounts,
        archivedStatusCounts
    };
}

// GET DASHBOARD METRICS FROM SOURCE
async function getDashboardMetricsFromSource() {
    if (window.shouldUseApiOrders?.()) {
        return getDashboardMetricsFromApi();
    }

    return getDashboardMetrics();
}

// CREATE DASHBOARD GROUP
function createDashboardGroup(title, content, extraClass = "") {
    return `
        <section class="dashboard-group ${extraClass}">
            <div class="dashboard-group-title">
                <h3>
                    ${title}
                </h3>

                <span></span>
            </div>

            <div class="dashboard-group-grid">
                ${content}
            </div>
        </section>
    `;
}

// RENDER DASHBOARD
async function renderDashboard() {
    const dashboardCards = document.getElementById("dashboardCards");

    dashboardCards.innerHTML = `
        <p class="empty-state">
            Carregando dashboard...
        </p>
    `;

    try {
        const metrics = await getDashboardMetricsFromSource();

        const overviewCards = `
            <div class="dashboard-card">
                <strong>Ativas</strong>
                <span>${metrics.activeOrders}</span>
            </div>

            <div class="dashboard-card">
                <strong>Pokémons em Breed</strong>
                <span>${metrics.activePokemons}</span>
            </div>

            <div class="dashboard-card">
                <strong>Clientes</strong>
                <span>${metrics.players}</span>
            </div>

            <div class="dashboard-card">
                <strong>Arquivadas</strong>
                <span>${metrics.archivedOrders}</span>
            </div>
        `;

        const financeCards = `
            <div class="dashboard-card">
                <strong>Ativas</strong>
                <span>${formatMoney(metrics.activeOrdersValue)}</span>
            </div>

            <div class="dashboard-card">
                <strong>Recebido</strong>
                <span>${formatMoney(metrics.totalReceived)}</span>
            </div>

            <div class="dashboard-card">
                <strong>A Receber</strong>
                <span>${formatMoney(metrics.totalPending)}</span>
            </div>

            <div class="dashboard-card">
                <strong>Arquivadas</strong>
                <span>${formatMoney(metrics.archivedOrdersValue)}</span>
            </div>
        `;

        const statusCards = ORDER_STATUS.map((status) => {
            const activeCount = metrics.activeStatusCounts[status.value] || 0;

            const archivedCount = metrics.archivedStatusCounts[status.value] || 0;

            const archivedHtml =
                status.value === "DELIVERED" && archivedCount > 0
                    ? `
                            <small class="dashboard-archived-count">
                                (+${archivedCount} Arquiv.)
                            </small>
                        `
                    : "";

            const statusLabel = status.value === "NEEDS_FEMALE" ? "Precisa Cap. F" : status.name;

            return `
                <button
                    type="button"
                    class="dashboard-card dashboard-card-button"
                    onclick="filterOrdersByStatus('${status.value}')">

                    <strong class="${status.cssClass}">
                        ${statusLabel}
                    </strong>

                    <span>
                        ${activeCount}
                        ${archivedHtml}
                    </span>

                </button>
            `;
        }).join("");

        dashboardCards.innerHTML =
            createDashboardGroup("Resumo geral", overviewCards) +
            createDashboardGroup("Valores", financeCards) +
            createDashboardGroup("Status das Breeds", statusCards, "dashboard-status-group") +
            createDashboardGroup(
                "Top Compradores",
                await renderTopBuyers(),
                "dashboard-top-buyers-group"
            );

        renderDashboardRecentOrders();
        renderDashboardRecentTransactions();
    } catch (error) {
        dashboardCards.innerHTML = `
            <p class="empty-state">
                Não foi possível carregar o dashboard.
            </p>
        `;

        showToast(error?.data?.message || error?.message || "Erro ao carregar dashboard.", "error");
    }
}

// GET RECENT ORDERS
async function getRecentOrders(limit = 5) {
    if (window.shouldUseApiOrders?.()) {
        const orders = await window.PXBROrdersApiService.getOrders({
            archived: false
        });

        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
    }

    return loadOrders()
        .filter((order) => !order.archived)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

// RENDER DASHBOARD RECENT ORDERS
async function renderDashboardRecentOrders() {
    try {
        const recentOrders = await getRecentOrders();

        dashboardRecentOrders.innerHTML = "";

        if (recentOrders.length === 0) {
            dashboardRecentOrders.innerHTML = `
                <p>
                    Nenhuma encomenda recém cadastrada encontra-se ativa.
                </p>
            `;

            return;
        }

        recentOrders.forEach((order) => {
            const card = document.createElement("div");

            card.classList.add("order-card");

            card.innerHTML = createOrderCard(order);

            dashboardRecentOrders.appendChild(card);
        });
    } catch (error) {
        dashboardRecentOrders.innerHTML = `
            <p>
                Não foi possível carregar as encomendas recentes.
            </p>
        `;

        showToast(
            error?.data?.message || error?.message || "Erro ao carregar encomendas.",
            "error"
        );
    }
}

// FILTER ORDERS BY STATUS
function filterOrdersByStatus(statusValue) {
    const orderStatusFilter = document.getElementById("orderStatusFilter");

    if (!orderStatusFilter) {
        return;
    }

    orderStatusFilter.value = statusValue;

    renderOrdersList();
}

// GET TOP BUYERS
async function getTopBuyers(limit = 5) {
    if (window.shouldUseApiOrders?.()) {
        const payments = await window.PXBRReportsApiService.getPaymentsByPlayer({
            limit
        });

        return payments.map((item) => ({
            player: {
                id: item.playerId,
                nick: item.nick,
                avatarUrl: getMinecraftAvatarUrl(item.nick)
            },
            totalPaid: item.totalPaid
        }));
    }

    const players = loadPlayers();

    const transactions = loadTransactions();

    return players
        .map((player) => {
            const totalPaid = transactions
                .filter((transaction) => transaction.playerId === player.id)
                .reduce((total, transaction) => total + transaction.amount, 0);

            return {
                player,
                totalPaid
            };
        })
        .filter((item) => item.totalPaid > 0)
        .sort((a, b) => b.totalPaid - a.totalPaid)
        .slice(0, limit);
}

// RENDER TOP BUYERS
async function renderTopBuyers() {
    const topBuyers = await getTopBuyers();

    if (topBuyers.length === 0) {
        return `
            <p>
                Nenhum comprador com pagamento registrado ainda.
            </p>
        `;
    }

    return `
        <div class="top-buyers-list">
            ${topBuyers
                .map(
                    (item, index) => `
                        <div class="top-buyer-item">
                             <div class="dashboard-ranking-player">
                                <span class="dashboard-ranking-position">
                                    ${index + 1}º
                                </span>

                                ${renderPlayerInline(item.player, 26)}
                            </div>

                            <span>
                                ${formatMoney(item.totalPaid)}
                            </span>
                        </div>
                    `
                )
                .join("")}
        </div>
    `;
}

// GET RECENT TRANSACTIONS
async function getRecentTransactions(limit = 5) {
    if (window.shouldUseApiOrders?.()) {
        const transactions = await window.PXBRTransactionsApiService.getTransactions();

        return transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    return loadTransactions()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

// RENDER DASHBOARD RECENT TRANSACTIONS
async function renderDashboardRecentTransactions() {
    const transactions = await getRecentTransactions();

    if (transactions.length === 0) {
        dashboardRecentTransactions.innerHTML = `
            <p>
                Nenhuma transação registrada ainda.
            </p>
        `;

        return;
    }

    const rows = transactions
        .map((transaction) => {
            const player =
                transaction.player ||
                loadPlayers().find((player) => player.id === transaction.playerId);

            return `
                    <tr>
                        <td>
                            ${formatDateTime(transaction.createdAt)}
                        </td>

                        <td>
                            ${renderPlayerInline(player, 24)}
                        </td>

                        <td class="finance-value">
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
                `;
        })
        .join("");

    dashboardRecentTransactions.innerHTML = `
        <div class="table-wrapper">
            <table class="finance-table">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Encomenda</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

window.renderDashboard = renderDashboard;
window.filterOrdersByStatus = filterOrdersByStatus;

renderDashboard();
