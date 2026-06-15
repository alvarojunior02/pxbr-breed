// OPEN ORDER DETAILS
function openOrderDetails(orderId) {
    const order = loadOrders().find((order) => order.id === orderId);

    if (!order) {
        showWarningToast("Encomenda não encontrada.");
        return;
    }

    renderOrderDetails(order);

    openModal(window.orderDetailsModal);
}

// RENDER ORDER DETAILS
function renderOrderDetails(order) {
    window.currentOrderId = order.id;

    const player = loadPlayers().find((player) => player.id === order.playerId);

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

        ${renderOrderTransactionsTable(order.id)}

        ${renderOrderStatusHistoryTable(order.id)}

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
                ${renderAbilityText(pokemon.ability)}
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

// RENDER ORDER TRANSACTIONS TABLE
function renderOrderTransactionsTable(orderId) {
    const transactions = getOrderTransactions(orderId);

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

// RENDER ORDER STATUS HISTORY TABLE
function renderOrderStatusHistoryTable(orderId) {
    const history = loadOrderStatusHistory()
        .filter((entry) => entry.orderId === orderId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (history.length === 0) {
        return "";
    }

    const rows = history
        .map((entry) => {
            const previousStatus = getStatusByValue(entry.previousStatus);
            const newStatus = getStatusByValue(entry.newStatus);

            return `
                <tr>
                    <td>
                        ${formatDateTime(entry.createdAt)}
                    </td>

                    <td>
                        ${entry.pokemonName}
                    </td>

                    <td>
                        <span class="${getOrderStatusClass(entry.previousStatus)}">
                            ${previousStatus?.name || entry.previousStatus}
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
