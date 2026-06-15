// OPEN ORDER DETAILS
async function openOrderDetails(orderId) {
    try {
        const order = await getOrderByIdFromSource(orderId);

        if (!order) {
            showWarningToast("Encomenda não encontrada.");
            return;
        }

        renderOrderDetails(order);

        openModal(window.orderDetailsModal);
    } catch (error) {
        showToast(
            error?.data?.message || error?.message || "Erro ao carregar detalhes da encomenda.",
            "error"
        );
    }
}

// RENDER ORDER DETAILS
function renderOrderDetails(order) {
    window.currentOrderId = order.id;

    const player = order.player || loadPlayers().find((player) => player.id === order.playerId);

    const pokemonHtml = order.pokemons.map((pokemon) => createPokemonDetailsCard(pokemon)).join("");

    window.orderDetailsContent.innerHTML = `
        <p>
            <strong>ID do Pedido:</strong>
            ${order.id}
        </p>

        <p>
            <strong>Criado em:</strong>
            ${formatDate(order.createdAt)}
        </p>

        <p class="order-details-player-line">
            <strong>Cliente:</strong>

            ${renderPlayerInline(player, 28)}
        </p>

        ${
            order.discount > 0
                ? `
                    <p>
                        <strong>Subtotal:</strong>
                        ${formatMoney(order.subtotal ?? order.total + order.discount)}
                    </p>

                    <p>
                        <strong>Desconto:</strong>
                        ${formatMoney(order.discount)}
                    </p>

                    <p>
                        <strong>Total:</strong>
                        ${formatMoney(order.total)}
                    </p>
                `
                : `
                    <p>
                        <strong>Total:</strong>
                        ${formatMoney(order.total)}
                    </p>
                `
        }

        <p>
            ${getPaymentStatusHtml(order)}
        </p>

        <div id="orderTransactionsDetails"></div>

        <div id="orderStatusHistoryDetails"></div>

        ${getArchiveReadyHtml(order)}

        ${
            canArchiveOrder(order)
                ? `
                    <button
                        type="button"
                        class="button-archive"
                        onclick="archiveOrder('${order.id}')">

                        Arquivar Encomenda

                    </button>
                `
                : ""
        }

        ${
            canRegisterPayment(order)
                ? `
                    <button
                        type="button"
                        class="button-success"
                        onclick="openPaymentModal('${order.id}')">

                        Registrar Pagamento

                    </button>
                `
                : ""
        }

        ${
            order.observations?.trim()
                ? `
                    <p>
                        <strong>
                            Observações:
                        </strong>

                        ${order.observations}
                    </p>
                `
                : ""
        }

        <hr>

        <h3 class="order-details-section-title">
            Pokémons
        </h3>

        <div class="order-details-pokemon-grid">
            ${pokemonHtml}
        </div>
    `;

    renderOrderTransactionsDetails(order.id);
    renderOrderStatusHistoryDetails(order.id);
}

// RENDER ORDER POKEMON ABILITY TEXT
function renderOrderPokemonAbilityText(pokemon) {
    if (pokemon.ability) {
        return renderAbilityText(pokemon.ability);
    }

    if (!pokemon.abilityName) {
        return "-";
    }

    return `
        ${pokemon.abilityName}
        ${
            pokemon.abilityIsHa
                ? `
                    <span class="ability-ha">
                        (HA)
                    </span>
                `
                : ""
        }
    `;
}

// CREATE POKEMON DETAILS CARD
function createPokemonDetailsCard(pokemon) {
    const nature = getNatureByName(pokemon.nature);

    const nextStatus = getNextStatus(pokemon.status);

    const thumbnail = getPokemonThumbnail(pokemon.pokemonId, getOrderPokemonDisplaySprite(pokemon));

    const canAdvanceStatus = !isLastStatus(pokemon.status);

    return `
        <div
            class="pokemon-details-card">

            <img
                src="${thumbnail}"
                alt="${getOrderPokemonDisplayName(pokemon)}"
            >

            <h3>
                <strong>
                    ${getOrderPokemonDisplayName(pokemon)}
                </strong>

                <span class="pokemon-summary-id">
                    (#${String(pokemon.pokemonId).padStart(3, "0")})
                </span>
            </h3>

            ${renderOrderPokemonRegionalForm(pokemon)}

            <p>
                Nature:
                <strong>${nature.name}</strong>

                ${
                    nature.neutral
                        ? `
                            <span class="nature-neutral">
                                (Neutral)
                            </span>
                        `
                        : `
                            <span class="nature-positive">
                                (+${nature.positive})
                            </span>

                            <span class="nature-negative">
                                (-${nature.negative})
                            </span>
                        `
                }
            </p>

            <p>
                Ability:
                ${renderOrderPokemonAbilityText(pokemon)}
            </p>

            <p>
                Valor:
                ${formatMoney(pokemon.value)}
            </p>

            <p>
                ${renderBreedableText(pokemon.breedable)}
            </p>

            <div class="pokemon-details-status">
                <p>
                    Status:
                    <span class="${getOrderStatusClass(pokemon.status)}">
                        ${getStatusByValue(pokemon.status).name}
                    </span>
                </p>

                ${
                    canAdvanceStatus
                        ? `
                            <button
                                type="button"
                                class="status-action-button ${nextStatus.cssClass}"
                                onclick="openStatusConfirmModal(window.currentOrderId, '${pokemon.id}')">

                                ${getNextStatusButtonText(pokemon.status)}

                            </button>
                        `
                        : ""
                }
            </div>
        </div>
    `;
}

// RENDER ORDER TRANSACTIONS DETAILS
async function renderOrderTransactionsDetails(orderId) {
    const container = document.getElementById("orderTransactionsDetails");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    try {
        const transactions = await getOrderTransactionsFromSource(orderId);

        container.innerHTML = createOrderTransactionsTable(transactions);
    } catch (error) {
        container.innerHTML = `
            <p class="empty-state">
                Não foi possível carregar as transações desta encomenda.
            </p>
        `;
    }
}

// CREATE ORDER TRANSACTIONS TABLE
function createOrderTransactionsTable(transactions) {
    if (transactions.length === 0) {
        return "";
    }

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
                </tr>
            `
        )
        .join("");

    return `
        <div class="order-transactions">
            <h3>
                Transações
            </h3>

            <div class="table-wrapper">
                <table class="finance-table">
                    <thead>
                        <tr>
                            <th>
                                Data/Hora
                            </th>

                            <th>
                                Valor
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// RENDER ORDER STATUS HISTORY DETAILS
async function renderOrderStatusHistoryDetails(orderId) {
    const container = document.getElementById("orderStatusHistoryDetails");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    try {
        const history = await getOrderStatusHistoryFromSource(orderId);

        container.innerHTML = createOrderStatusHistoryTable(history);
    } catch (error) {
        container.innerHTML = `
            <p class="empty-state">
                Não foi possível carregar o histórico de status desta encomenda.
            </p>
        `;
    }
}

// CREATE ORDER STATUS HISTORY TABLE
function createOrderStatusHistoryTable(history) {
    if (history.length === 0) {
        return "";
    }

    const rows = history
        .map((entry) => {
            const previousStatus = getStatusByValue(entry.previousStatus || entry.oldStatus);
            const newStatus = getStatusByValue(entry.newStatus);

            return `
                <tr>
                    <td>
                        ${formatDateTime(entry.createdAt)}
                    </td>

                    <td>
                        ${entry.pokemonName || "-"}
                    </td>

                    <td>
                        <span class="${getOrderStatusClass(entry.previousStatus || entry.oldStatus)}">
                            ${previousStatus?.name || entry.previousStatus || entry.oldStatus || "-"}
                        </span>
                    </td>

                    <td>
                        <span class="${getOrderStatusClass(entry.newStatus)}">
                            ${newStatus?.name || entry.newStatus}
                        </span>
                    </td>
                </tr>
            `;
        })
        .join("");

    return `
        <div class="order-status-history">
            <h3>
                Histórico de Status
            </h3>

            <div class="table-wrapper">
                <table class="finance-table">
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Pokémon</th>
                            <th>Status anterior</th>
                            <th>Novo status</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

window.openOrderDetails = openOrderDetails;
window.renderOrderTransactionsDetails = renderOrderTransactionsDetails;
window.renderOrderStatusHistoryDetails = renderOrderStatusHistoryDetails;
