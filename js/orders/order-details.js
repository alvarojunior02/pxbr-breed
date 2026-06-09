// OPEN ORDER DETAILS
function openOrderDetails(orderId) {
    const order =
        loadOrders().find(
            order =>
                order.id ===
                orderId
        );

    if (!order) {
        return;
    }

    renderOrderDetails(
        order
    );

    orderDetailsModal
        .classList
        .remove(
            "hidden"
        );
}

// RENDER ORDER DETAILS
function renderOrderDetails(order) {
    window.currentOrderId = order.id;

    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const pokemonHtml =
        order.pokemons
            .map(
                pokemon =>
                    createPokemonDetailsCard(
                        pokemon
                    )
            )
            .join("");

    orderDetailsContent.innerHTML =
        `
        <p>
            <strong>ID do Pedido:</strong>
            ${order.id}
        </p>

        <p>
            <strong>Criado em:</strong>
            ${formatDate(
                order.createdAt
            )}
        </p>

        <p>
            <strong>Player:</strong>
            ${player?.nick ?? "-"}
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

        ${getArchiveReadyHtml(order)}

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
function createPokemonDetailsCard(
    pokemon
) {
    const nature = getNatureByName(pokemon.nature);

    const nextStatus = getNextStatus(pokemon.status);

    const thumbnail = getPokemonThumbnail(pokemon.pokemonId);

    const canAdvanceStatus =
        !isLastStatus(
            pokemon.status
        );

    return `
        <div
            class="pokemon-details-card">

            <img
                src="${thumbnail}"
                alt="${pokemon.pokemonName}"
            >

            <h3>
                #${pokemon.pokemonId}
                ${pokemon.pokemonName}
            </h3>

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
                ${formatMoney(
                    pokemon.value
                )}
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

btnCloseOrderDetails.addEventListener(
    "click",
    () => {
        orderDetailsModal
            .classList
            .add(
                "hidden"
            );
    }
);

window.openOrderDetails = openOrderDetails;