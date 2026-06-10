// CAN REGISTER PAYMENT
function canRegisterPayment(order) {
    return (order.paidAmount || 0) < order.total;
}

// GET PAYMENT STATUS HTML
function getPaymentStatusHtml(order) {
    const paidAmount = order.paidAmount || 0;

    const remaining = order.total - paidAmount;

    if (paidAmount >= order.total) {
        return `
            <span class="payment-paid">
                Totalmente Pago
            </span>
        `;
    }

    if (paidAmount > 0) {
        return `
            <span class="payment-partial">
                Parcialmente Pago:
                ${formatMoney(paidAmount)}
            </span>

            <span class="payment-missing">
                Falta:
                ${formatMoney(remaining)}
            </span>
        `;
    }

    return `
        <span class="payment-pending">
            A Pagar:
            ${formatMoney(order.total)}
        </span>
    `;
}

// CAN ARCHIVE ORDER
function canArchiveOrder(order) {
    const isPaid = (order.paidAmount || 0) >= order.total;

    const allPokemonsDelivered = order.pokemons.every((pokemon) => isLastStatus(pokemon.status));

    return isPaid && allPokemonsDelivered && !order.archived;
}

// GET ARCHIVE READY HTML
function getArchiveReadyHtml(order) {
    if (!canArchiveOrder(order)) {
        return "";
    }

    return `
        <p class="archive-ready">
            Encomenda concluída, pronta para ser arquivada.
        </p>
    `;
}

// VALIDATE PAYMENT AMOUNT
function validatePaymentAmount(order, amount) {
    const currentPaid = order.paidAmount || 0;

    const remaining = order.total - currentPaid;

    if (amount <= 0) {
        alert("Informe um valor maior que zero.");

        return false;
    }

    if (amount > remaining) {
        alert("O valor pago não pode ser maior que o valor restante.");

        return false;
    }

    return true;
}

// GET ORDER STATUS SUMMARY
function getOrderStatusSummary(order) {
    const summary = {};

    order.pokemons.forEach((pokemon) => {
        summary[pokemon.status] = (summary[pokemon.status] || 0) + 1;
    });

    return summary;
}

// GET PLAYER LAST ORDER
function getPlayerLastOrder(playerId) {
    const orders = loadOrders()
        .filter((order) => order.playerId === playerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return orders[0] || null;
}

// GET DAYS SINCE
function getDaysSince(date) {
    const today = new Date();

    const targetDate = new Date(date);

    const diffInMs = today - targetDate;

    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

// RENDER ABILITY TEXT
function renderAbilityText(ability) {
    if (!ability) {
        return "-";
    }

    return `
        ${ability.name}
        ${
            ability.isHA
                ? `
                    <span class="ability-ha">
                        (HA)
                    </span>
                `
                : ""
        }
    `;
}

// RENDER BREEDABLE TEXT
function renderBreedableText(isBreedable) {
    return isBreedable
        ? `
            <span class="breedable-yes">
                Breedável
            </span>
        `
        : `
            <span class="breedable-no">
                Castrado
            </span>
        `;
}

// GET NEXT STATUS BUTTON TEXT
function getNextStatusButtonText(statusValue) {
    const nextStatus = getNextStatus(statusValue);

    if (!nextStatus) {
        return "";
    }

    if (nextStatus.value === "DELIVERED") {
        return "Marcar como Entregue";
    }

    return `Avançar para ${nextStatus.name}`;
}
