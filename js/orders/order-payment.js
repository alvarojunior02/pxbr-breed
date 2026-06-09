// OPEN PAYMENT MODAL
function openPaymentModal(orderId) {
    const order =
        loadOrders().find(
            order =>
                order.id === orderId
        );

    if (!order) {
        return;
    }

    const player =
        loadPlayers().find(
            player =>
                player.id ===
                order.playerId
        );

    const paidAmount =
        order.paidAmount || 0;

    const remaining =
        order.total - paidAmount;

    selectedPaymentOrderId =
        orderId;

    paymentSummary.innerHTML = `
        <h3>
            Player:
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

    paymentAmount.value =
        formatMoney(remaining);

    paymentModal.classList.remove(
        "hidden"
    );
}

btnCancelPayment.addEventListener(
    "click",
    () => {
        paymentModal.classList.add(
            "hidden"
        );
    }
);

btnConfirmPayment.addEventListener(
    "click",
    () => {
        const orders =
            loadOrders();

        const order =
            orders.find(
                order =>
                    order.id === selectedPaymentOrderId
            );

        if (!order) {
            return;
        }

        const player =
            loadPlayers().find(
                player =>
                    player.id ===
                    order.playerId
            );

        const amount =
            unformatMoney(
                paymentAmount.value
            );

        if (!validatePaymentAmount(order, amount)) {
            return;
        }

        const currentPaid =
            order.paidAmount || 0;

        const remaining =
            order.total - currentPaid;

        pendingPaymentAmount =
            amount;

        paymentConfirmSummary.innerHTML = `
            <h3>
                Player:
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
                ${formatMoney(
                    remaining - amount
                )}
            </p>
        `;

        paymentConfirmModal.classList.remove(
            "hidden"
        );
    }
);

btnCancelPaymentConfirm.addEventListener(
    "click",
    () => {
        paymentConfirmModal.classList.add(
            "hidden"
        );
    }
);

btnConfirmPaymentRegister.addEventListener(
    "click",
    () => {
        const orders =
            loadOrders();

        const order =
            orders.find(
                order =>
                    order.id === selectedPaymentOrderId
            );

        if (!order) {
            return;
        }

        if (!validatePaymentAmount(order, pendingPaymentAmount)) {
            return;
        }

        order.paidAmount = (order.paidAmount || 0) + pendingPaymentAmount;

        order.paid = order.paidAmount >= order.total;

        saveOrders(orders);

        const transaction =
            createOrderPaymentTransaction({
                amount: pendingPaymentAmount,
                playerId: order.playerId,
                orderId: order.id
            });

        saveTransaction(transaction);

        paymentConfirmModal.classList.add("hidden");

        paymentModal.classList.add("hidden");

        pendingPaymentAmount = 0;

        renderOrdersList();
        renderDashboard();

        openOrderDetails(selectedPaymentOrderId);
    }
);

window.openPaymentModal = openPaymentModal;