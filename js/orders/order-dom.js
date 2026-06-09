// ==============================
// CREATE ORDER FORM
// ==============================

window.orderPlayer = document.getElementById("orderPlayer");

window.orderPlayerSearch = document.getElementById("orderPlayerSearch");

window.orderPlayerResults = document.getElementById("orderPlayerResults");

window.selectedPlayerInfo = document.getElementById("selectedPlayerInfo");

window.pokemonOrderList = document.getElementById("pokemonOrderList");

window.btnAddPokemon = document.getElementById("btnAddPokemon");

window.btnCreateOrder = document.getElementById("btnCreateOrder");

window.hasDiscount = document.getElementById("hasDiscount");

window.discountValue = document.getElementById("discountValue");

window.orderPaid = document.getElementById("orderPaid");

window.orderPaidAmount = document.getElementById("orderPaidAmount");

window.orderPaidAmountWrapper = document.getElementById("orderPaidAmountWrapper");

window.orderTotal = document.getElementById("orderTotal");

window.btnOpenCreateOrderModal = 
    document.querySelectorAll(".btn-open-create-order-modal");

window.createOrderModal = document.getElementById("createOrderModal");

window.btnCancelCreateOrder = document.getElementById("btnCancelCreateOrder");

window.btnClearCreateOrder = document.getElementById("btnClearCreateOrder");

window.btnQuickNewPlayer = document.getElementById("btnQuickNewPlayer");


// ==============================
// ORDER CONFIRMATION MODAL
// ==============================

window.orderModal = document.getElementById("orderModal");

window.orderSummary = document.getElementById("orderSummary");

window.btnCancelOrder = document.getElementById("btnCancelOrder");

window.btnConfirmOrder = document.getElementById("btnConfirmOrder");


// ==============================
// ORDER LIST FILTERS
// ==============================

window.orderSearchPlayer = document.getElementById("orderSearchPlayer");

window.orderStatusFilter = document.getElementById("orderStatusFilter");

window.orderArchiveFilter = document.getElementById("orderArchiveFilter");

window.orderPaymentFilter = document.getElementById("orderPaymentFilter");


// ==============================
// ORDER DETAILS MODAL
// ==============================

window.orderDetailsModal = document.getElementById("orderDetailsModal");

window.orderDetailsContent = document.getElementById("orderDetailsContent");

window.btnCloseOrderDetails = document.getElementById("btnCloseOrderDetails");


// ==============================
// STATUS CONFIRMATION MODAL
// ==============================

window.statusConfirmModal = document.getElementById("statusConfirmModal");

window.statusConfirmContent = document.getElementById("statusConfirmContent");

window.btnCancelStatusChange = document.getElementById("btnCancelStatusChange");

window.btnConfirmStatusChange = document.getElementById("btnConfirmStatusChange");


// ==============================
// PAYMENT MODAL
// ==============================

window.paymentModal = document.getElementById("paymentModal");

window.paymentSummary = document.getElementById("paymentSummary");

window.paymentAmount = document.getElementById("paymentAmount");

window.btnCancelPayment = document.getElementById("btnCancelPayment");

window.btnConfirmPayment = document.getElementById("btnConfirmPayment");


// ==============================
// PAYMENT CONFIRMATION MODAL
// ==============================

window.paymentConfirmModal = document.getElementById("paymentConfirmModal");

window.paymentConfirmSummary = document.getElementById("paymentConfirmSummary");

window.btnCancelPaymentConfirm = document.getElementById("btnCancelPaymentConfirm");

window.btnConfirmPaymentRegister = document.getElementById("btnConfirmPaymentRegister");


// ==============================
// ARCHIVE CONFIRMATION MODAL
// ==============================

window.archiveConfirmModal = document.getElementById("archiveConfirmModal");

window.btnCancelArchive = document.getElementById("btnCancelArchive");

window.btnConfirmArchive = document.getElementById("btnConfirmArchive");


// ==============================
// ORDER STATE
// ==============================

window.selectedOrderId = null;

window.selectedPokemonId = null;

window.selectedPaymentOrderId = null;

window.pendingPaymentAmount = 0;

window.selectedArchiveOrderId = null;