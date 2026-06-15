// OPEN PAYMENT MODAL
async function openPaymentModal(orderId) {
    const order = await getOrderByIdFromSource(orderId);

    if (!order) {
        return;
    }

    const player = order.player || loadPlayers().find((player) => player.id === order.playerId);

    const paidAmount = order.paidAmount || 0;

    const remaining = order.total - paidAmount;

    selectedPaymentOrderId = orderId;

    paymentSummary.innerHTML = `
        <h3>
            Cliente:
            ${player?.nick ?? "Player"}
        </h3>

        <p>
            <strong>Total:</strong>
            ${formatMoney(order.total)}
        </p>

        <p>
            <strong>Já pago:</strong>
            ${formatMoney(paidAmount)}
        </p>

        <p>
            <strong>Restante:</strong>
            ${formatMoney(remaining)}
        </p>
    `;

    paymentAmount.value = formatMoney(remaining);

    openModal(window.paymentModal);
}

// CLOSE PLAYMENT MODAL
function closePaymentModal() {
    closeModal(window.paymentModal);

    window.paymentOrderId = null;

    paymentAmount.value = formatMoney(0);
}

btnConfirmPayment.addEventListener("click", async () => {
    const order = await getOrderByIdFromSource(selectedPaymentOrderId);

    if (!order) {
        return;
    }

    const player = order.player || loadPlayers().find((player) => player.id === order.playerId);

    const amount = unformatMoney(paymentAmount.value);

    if (!validatePaymentAmount(order, amount)) {
        return;
    }

    const currentPaid = order.paidAmount || 0;

    const remaining = order.total - currentPaid;

    pendingPaymentAmount = amount;

    paymentConfirmSummary.innerHTML = `
        <h3>
            Cliente:
            ${player?.nick ?? "Player"}
        </h3>

        <p>
            <strong>Total:</strong>
            ${formatMoney(order.total)}
        </p>

        <p>
            <strong>Já pago:</strong>
            ${formatMoney(currentPaid)}
        </p>

        <p>
            <strong>Restante antes do pagamento:</strong>
            ${formatMoney(remaining)}
        </p>

        <p>
            <strong>Valor a registrar agora:</strong>
            ${formatMoney(amount)}
        </p>

        <p>
            <strong>Restante após pagamento:</strong>
            ${formatMoney(remaining - amount)}
        </p>
    `;

    openModal(window.paymentConfirmModal);
});

btnConfirmPaymentRegister.addEventListener("click", async () => {
    const order = await getOrderByIdFromSource(selectedPaymentOrderId);

    if (!order) {
        return;
    }

    if (!validatePaymentAmount(order, pendingPaymentAmount)) {
        return;
    }

    try {
        if (shouldUseApiOrders()) {
            await window.PXBRTransactionsApiService.create({
                amount: pendingPaymentAmount,
                playerId: order.playerId,
                orderId: order.id,
                type: "ORDER_PAYMENT",
                notes: "Pagamento registrado pela tela de encomenda."
            });
        } else {
            const orders = loadOrders();

            const localOrder = orders.find((item) => item.id === selectedPaymentOrderId);

            if (!localOrder) {
                return;
            }

            localOrder.paidAmount = (localOrder.paidAmount || 0) + pendingPaymentAmount;

            localOrder.paid = localOrder.paidAmount >= localOrder.total;

            saveOrders(orders);

            const transaction = createOrderPaymentTransaction({
                amount: pendingPaymentAmount,
                playerId: localOrder.playerId,
                orderId: localOrder.id
            });

            saveTransaction(transaction);
        }

        closeModal(window.paymentConfirmModal);

        paymentModal.classList.add("hidden");

        pendingPaymentAmount = 0;

        renderDashboard();
        renderOrdersList();
        renderPlayersModule();
        renderFinanceModule();

        openOrderDetails(selectedPaymentOrderId);
    } catch (error) {
        showToast(
            error?.data?.message || error?.message || "Erro ao registrar pagamento.",
            "error"
        );
    }
});
window.openPaymentModal = openPaymentModal;
