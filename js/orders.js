// LOAD ORDER STATUS FILTER
function loadOrderStatusFilter() {
    ORDER_STATUS.forEach((status) => {
        const option = document.createElement("option");

        option.value = status.value;

        option.textContent = status.name;

        window.orderStatusFilter.appendChild(option);
    });
}

loadOrderStatusFilter();
createPokemonOrderRow();
updateOrderFormAvailability();
renderOrdersList();
