// SHOULD USE API ORDERS
function shouldUseApiOrders() {
    return window.getPxbrFeatureFlag?.("useApiOrders") === true;
}

// GET ORDER API FILTERS
function getOrderApiFilters() {
    const searchTerm = orderSearchPlayer.value.trim();
    const selectedStatus = orderStatusFilter.value;
    const paymentFilter = orderPaymentFilter.value;
    const archiveFilter = orderArchiveFilter.value;

    const filters = {};

    if (searchTerm) {
        filters.search = searchTerm;
    }

    if (selectedStatus) {
        filters.status = selectedStatus;
    }

    if (paymentFilter) {
        filters.paymentStatus = paymentFilter;
    }

    if (archiveFilter === "active") {
        filters.archived = false;
    }

    if (archiveFilter === "archived") {
        filters.archived = true;
    }

    return filters;
}

// LOAD ORDERS FROM SOURCE
async function loadOrdersFromSource() {
    if (shouldUseApiOrders()) {
        return window.PXBROrdersApiService.getOrders(getOrderApiFilters());
    }

    return getFilteredOrders();
}

// GET FILTERED ORDERS
function getFilteredOrders() {
    const orders = loadOrders();

    const players = loadPlayers();

    const searchTerm = orderSearchPlayer.value.trim().toLowerCase();

    const selectedStatus = orderStatusFilter.value;

    const paymentFilter = orderPaymentFilter.value;

    const archiveFilter = orderArchiveFilter.value;

    return orders.filter((order) => {
        if (archiveFilter === "active" && order.archived) {
            return false;
        }

        if (archiveFilter === "archived" && !order.archived) {
            return false;
        }

        const player = players.find((player) => player.id === order.playerId);

        const matchesPlayer = !searchTerm || player?.nick.toLowerCase().includes(searchTerm);

        const matchesStatus =
            !selectedStatus || order.pokemons.some((pokemon) => pokemon.status === selectedStatus);

        const paidAmount = order.paidAmount || 0;

        const isPaid = paidAmount >= order.total;

        const isPartiallyPaid = paidAmount > 0 && paidAmount < order.total;

        const isPending = paidAmount === 0;

        const matchesPayment =
            !paymentFilter ||
            (paymentFilter === "paid" && isPaid) ||
            (paymentFilter === "partial" && isPartiallyPaid) ||
            (paymentFilter === "pending" && isPending);

        return matchesPlayer && matchesStatus && matchesPayment;
    });
}

// RENDER ORDERS LIST
async function renderOrdersList() {
    const ordersList = document.getElementById("ordersList");
    const ordersCount = document.getElementById("ordersCount");

    ordersList.innerHTML = `
        <p class="empty-state">
            Carregando encomendas...
        </p>
    `;

    try {
        const orders = (await loadOrdersFromSource()).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        ordersCount.textContent = orders.length;

        ordersList.innerHTML = "";

        if (orders.length === 0) {
            ordersList.innerHTML = `
                <p class="empty-state">
                    Nenhuma encomenda encontrada.
                </p>
            `;

            return;
        }

        orders.forEach((order) => {
            const card = document.createElement("div");

            card.classList.add("order-card");

            card.innerHTML = createOrderCard(order);

            ordersList.appendChild(card);
        });
    } catch (error) {
        ordersCount.textContent = "0";

        ordersList.innerHTML = `
            <p class="empty-state">
                Não foi possível carregar as encomendas.
            </p>
        `;

        showToast(
            error?.data?.message || error?.message || "Erro ao carregar encomendas.",
            "error"
        );
    }
}

// CREATE ORDER CARD
function createOrderCard(order) {
    const player = order.player || loadPlayers().find((player) => player.id === order.playerId);

    const statusSummary = getOrderStatusSummary(order);

    const statusHtml = Object.entries(statusSummary)
        .map(
            ([status, count]) =>
                `
                    <li>
                        ${count}
                        <span
                            class="${getOrderStatusClass(status)}">
                            ${getStatusByValue(status).name}
                        </span>
                    </li>
                    `
        )
        .join("");

    return `
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

        <p class="order-card-client">
            <strong>Cliente:</strong>
            ${renderPlayerInline(player, 28)}
        </p>

        <p>
            Pokémons:
            ${order.pokemons.length}
        </p>

        <p>
            Total:
            ${formatMoney(order.total)}
        </p>

        <br>

        <strong>Pagamento:</strong>

        <p>
            ${getPaymentStatusHtml(order)}
        </p>

        <br>

        <strong>Status de Breeds:</strong>

        <ul>
            ${statusHtml}
        </ul>

        ${getArchiveReadyHtml(order)}

        <div class="order-card-actions">

            <button
                type="button"
                onclick="openOrderDetails('${order.id}')">

                Detalhes

            </button>

            ${
                canRegisterPayment(order)
                    ? `
                        <button
                            type="button"
                            onclick="openPaymentModal('${order.id}')"
                            class="button-success">

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
                            onclick="archiveOrder('${order.id}')"
                            class="button-archive">

                            Arquivar

                        </button>
                    `
                    : ""
            }

        </div>
    `;
}

orderSearchPlayer.addEventListener("input", renderOrdersList);

orderStatusFilter.addEventListener("change", renderOrdersList);

orderArchiveFilter.addEventListener("change", renderOrdersList);

orderPaymentFilter.addEventListener("change", renderOrdersList);

window.renderOrdersList = renderOrdersList;
window.shouldUseApiOrders = shouldUseApiOrders;
window.loadOrdersFromSource = loadOrdersFromSource;
