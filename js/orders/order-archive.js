// ARCHIVE ORDER
function archiveOrder(orderId) {
    const order = loadOrders().find((order) => order.id === orderId);

    if (!order) {
        return;
    }

    if (!canArchiveOrder(order)) {
        alert("Esta encomenda ainda não pode ser arquivada.");

        return;
    }

    selectedArchiveOrderId = orderId;

    archiveConfirmModal.classList.remove("hidden");
}

btnCancelArchive.addEventListener("click", () => {
    archiveConfirmModal.classList.add("hidden");

    selectedArchiveOrderId = null;
});

btnConfirmArchive.addEventListener("click", () => {
    const orders = loadOrders();

    const order = orders.find((order) => order.id === selectedArchiveOrderId);

    if (!order) {
        return;
    }

    if (!canArchiveOrder(order)) {
        alert("Esta encomenda ainda não pode ser arquivada.");

        return;
    }

    order.archived = true;

    saveOrders(orders);

    archiveConfirmModal.classList.add("hidden");

    orderDetailsModal.classList.add("hidden");

    selectedArchiveOrderId = null;

    renderDashboard();
    renderOrdersList();
    renderFinanceModule();
});

window.archiveOrder = archiveOrder;
