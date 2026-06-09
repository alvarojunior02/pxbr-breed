// GET FILTERED ORDERS
function getFilteredOrders() {
    const orders = loadOrders();

    const players = loadPlayers();

    const searchTerm =
        orderSearchPlayer.value
            .trim()
            .toLowerCase();

    const selectedStatus = orderStatusFilter.value;

    const archiveFilter = orderArchiveFilter.value;

    return orders.filter(order => {
        if (archiveFilter === "active" && order.archived) {
            return false;
        }

        if (archiveFilter === "archived" && !order.archived) {
            return false;
        }

        const player =
            players.find(
                player =>
                    player.id === order.playerId
            );

        const matchesPlayer =
            !searchTerm ||
            player?.nick
                .toLowerCase()
                .includes(searchTerm);

        const matchesStatus =
            !selectedStatus ||
            order.pokemons.some(
                pokemon =>
                    pokemon.status === selectedStatus
            );

        return matchesPlayer && matchesStatus;
    });
}

// RENDER ORDERS LIST
function renderOrdersList() {

    const orders =
        getFilteredOrders()
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

    const ordersList = document.getElementById("ordersList");
    const ordersCount = document.getElementById("ordersCount");

    ordersCount.textContent = orders.length;

    ordersList.innerHTML = "";

    orders.forEach(order => {
        const card =
            document.createElement("div");

        card.classList.add(
            "order-card"
        );

        card.innerHTML =
            createOrderCard(order);

        ordersList.appendChild(card);
    });
}

// CREATE ORDER CARD
function createOrderCard(order) {
    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const statusSummary =
        getOrderStatusSummary(
            order
        );

    const statusHtml =
        Object.entries(
            statusSummary
        )
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
        
        <h3>
            Pedido #${order.id.slice(0, 8)}
            <span style="font-weight: normal;">
                - ${formatDate(order.createdAt)}
            </span>
        </h3>

        <p>
            Player:
            ${player?.nick ?? "-"}
        </p>

        <p>
            Pokémons:
            ${order.pokemons.length}
        </p>

        <p>
            Total:
            ${formatMoney(
                order.total
            )}
        </p>

        <p>
            ${getPaymentStatusHtml(order)}
        </p>

        <strong>Status de Breeds</strong>

        <ul>
            ${statusHtml}
        </ul>

        ${getArchiveReadyHtml(order)}

        <button
            type="button"
            onclick="openOrderDetails('${order.id}')">

            Ver Detalhes

        </button>
        
        ${
            canRegisterPayment(order)
                ? `
                    <button
                        type="button"
                        onclick="openPaymentModal('${order.id}')">

                        Registrar Pagamento

                    </button>
                `
                : ""
        }

        ${
            canArchiveOrder(order)
                ? `
                    <button
                        type="button"
                        onclick="archiveOrder('${order.id}')">

                        Arquivar Encomenda

                    </button>
                `
                : ""
        }
    `;
}