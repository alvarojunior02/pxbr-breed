const orderPlayer = document.getElementById("orderPlayer");
const orderPlayerSearch = document.getElementById("orderPlayerSearch");
const orderPlayerResults = document.getElementById("orderPlayerResults");
const selectedPlayerInfo = document.getElementById("selectedPlayerInfo");

const pokemonOrderList = document.getElementById("pokemonOrderList");
const btnAddPokemon = document.getElementById("btnAddPokemon");
const btnCreateOrder =document.getElementById("btnCreateOrder");
const orderModal = document.getElementById("orderModal");
const orderSummary = document.getElementById("orderSummary");
const btnCancelOrder = document.getElementById("btnCancelOrder");
const btnConfirmOrder = document.getElementById("btnConfirmOrder");
const hasDiscount = document.getElementById("hasDiscount");
const orderPaid = document.getElementById("orderPaid");
const orderPaidAmount = document.getElementById("orderPaidAmount");
applyMoneyMask(orderPaidAmount);

const createOrderModal = document.getElementById("createOrderModal");
const btnOpenCreateOrderModal = document.getElementById("btnOpenCreateOrderModal");
const btnCancelCreateOrder = document.getElementById("btnCancelCreateOrder");
const btnClearCreateOrder = document.getElementById("btnClearCreateOrder");

const orderDetailsModal = document.getElementById("orderDetailsModal");
const orderDetailsContent = document.getElementById("orderDetailsContent");
const btnCloseOrderDetails =document.getElementById("btnCloseOrderDetails");

const discountValue = document.getElementById("discountValue");
applyMoneyMask(discountValue);

const orderTotal = document.getElementById("orderTotal");

const statusConfirmModal = document.getElementById("statusConfirmModal");
const statusConfirmContent = document.getElementById("statusConfirmContent");
const btnCancelStatusChange = document.getElementById("btnCancelStatusChange");
const btnConfirmStatusChange = document.getElementById("btnConfirmStatusChange");

const orderSearchPlayer = document.getElementById("orderSearchPlayer");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const orderArchiveFilter = document.getElementById("orderArchiveFilter");

const paymentModal = document.getElementById("paymentModal");
const paymentSummary = document.getElementById("paymentSummary");
const paymentAmount = document.getElementById("paymentAmount");
applyMoneyMask(paymentAmount);
const btnCancelPayment = document.getElementById("btnCancelPayment");
const btnConfirmPayment = document.getElementById("btnConfirmPayment");

const paymentConfirmModal = document.getElementById("paymentConfirmModal");
const paymentConfirmSummary = document.getElementById("paymentConfirmSummary");
const btnCancelPaymentConfirm = document.getElementById("btnCancelPaymentConfirm");
const btnConfirmPaymentRegister = document.getElementById("btnConfirmPaymentRegister");

const archiveConfirmModal = document.getElementById("archiveConfirmModal");
const btnCancelArchive = document.getElementById("btnCancelArchive");
const btnConfirmArchive = document.getElementById("btnConfirmArchive");

let selectedOrderId = null;
let selectedPokemonId = null;
let selectedPaymentOrderId = null;
let pendingPaymentAmount = 0;
let selectedArchiveOrderId = null;

// LOAD ORDER STATUS FILTER
function loadOrderStatusFilter() {
    ORDER_STATUS.forEach(status => {
        const option =
            document.createElement("option");

        option.value =
            status.value;

        option.textContent =
            status.name;

        orderStatusFilter.appendChild(option);
    });
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

orderSearchPlayer.addEventListener(
    "input",
    renderOrdersList
);

orderStatusFilter.addEventListener(
    "change",
    renderOrdersList
);

orderArchiveFilter.addEventListener(
    "change",
    renderOrdersList
);

orderPlayer.addEventListener(
    "change",
    updateOrderFormAvailability
);

loadOrderStatusFilter();
createPokemonOrderRow();
updateOrderFormAvailability();
renderOrdersList();