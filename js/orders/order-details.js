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

        ${pokemonHtml}
    `;
}

// CREATE POKEMON DETAILS CARD
function createPokemonDetailsCard(
    pokemon
) {
    const nature = getNatureByName(pokemon.nature);

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
                ${nature.name}
            </p>

            <p>
                Ability:
                ${renderAbilityText(pokemon.ability)}
            </p>

            <p>
                Status:
                <span class="${getOrderStatusClass(pokemon.status)}">
                    ${getStatusByValue(pokemon.status).name}
                </span>
            </p>

            <p>
                Valor:
                ${formatMoney(
                    pokemon.value
                )}
            </p>

            <p>
                Breedável:
                ${
                    pokemon.breedable
                        ? "Sim"
                        : "Não"
                }
            </p>

        </div>

        ${
            canAdvanceStatus
                ? `
                <button
                    type="button"
                    onclick="openStatusConfirmModal(window.currentOrderId, '${pokemon.id}')">
                    Avançar Status
                </button>
                `
                : ""
        }
    `;
}

window.openOrderDetails = openOrderDetails;