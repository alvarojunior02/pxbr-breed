// ARCHIVE ORDER
async function archiveOrder(orderId) {
    const order = await getOrderByIdFromSource(orderId);

    if (!order) {
        return;
    }

    if (!canArchiveOrder(order)) {
        showWarningToast("Esta encomenda ainda não pode ser arquivada.");

        return;
    }

    selectedArchiveOrderId = orderId;

    openModal(window.archiveConfirmModal);
}

// CONFIRM ARCHIVE ORDER
async function confirmArchiveOrder() {
    const order = await getOrderByIdFromSource(selectedArchiveOrderId);

    if (!order) {
        return;
    }

    if (!canArchiveOrder(order)) {
        showWarningToast("Esta encomenda ainda não pode ser arquivada.");

        return;
    }

    try {
        if (shouldUseApiOrders()) {
            await window.PXBROrdersApiService.update(selectedArchiveOrderId, {
                archived: true
            });
        } else {
            const orders = loadOrders();

            const localOrder = orders.find((item) => item.id === selectedArchiveOrderId);

            if (!localOrder) {
                return;
            }

            localOrder.archived = true;

            saveOrders(orders);
        }

        showSuccessToast("Encomenda arquivada com sucesso!");

        closeModal(window.archiveConfirmModal);

        orderDetailsModal.classList.add("hidden");

        selectedArchiveOrderId = null;

        renderDashboard();
        renderOrdersList();
        renderFinanceModule();
    } catch (error) {
        showToast(error?.data?.message || error?.message || "Erro ao arquivar encomenda.", "error");
    }
}

btnConfirmArchive.addEventListener("click", confirmArchiveOrder);

window.archiveOrder = archiveOrder;
window.confirmArchiveOrder = confirmArchiveOrder;
