const financeSummaryCards = document.getElementById("financeSummaryCards");
const financeTransactionsList = document.getElementById("financeTransactionsList");
const financeTransactionsCount = document.getElementById("financeTransactionsCount");
const btnExportFinanceCsv = document.getElementById("btnExportFinanceCsv");

const financeCsvExportConfirmModal = document.getElementById("financeCsvExportConfirmModal");
const financeCsvExportSummary = document.getElementById("financeCsvExportSummary");
const btnCloseFinanceCsvExportModal = document.getElementById("btnCloseFinanceCsvExportModal");
const btnConfirmFinanceCsvExport = document.getElementById("btnConfirmFinanceCsvExport");

const btnOpenManualTransactionModal = document.getElementById("btnOpenManualTransactionModal");
const manualTransactionModal = document.getElementById("manualTransactionModal");
const manualTransactionPlayer = document.getElementById("manualTransactionPlayer");
const manualTransactionOrder = document.getElementById("manualTransactionOrder");
const manualTransactionType = document.getElementById("manualTransactionType");
const manualTransactionAmount = document.getElementById("manualTransactionAmount");
const manualTransactionNotes = document.getElementById("manualTransactionNotes");
const btnSaveManualTransaction = document.getElementById("btnSaveManualTransaction");

let currentFinancePeriod = "7days";
let currentFilteredFinanceTransactions = [];

// RENDER FINANCE MODULE
async function renderFinanceModule() {
    try {
        const transactions = await loadFinanceTransactionsFromSource();
        const filteredTransactions = getFilteredTransactionsByPeriod(
            transactions,
            currentFinancePeriod
        );

        currentFilteredFinanceTransactions = filteredTransactions;

        setupFinancePeriodFilters();
        renderFinanceSummary(filteredTransactions);
        renderFinanceTransactions(filteredTransactions);
    } catch (error) {
        console.error(error);
        showErrorToast(error.message || "Erro ao carregar dados financeiros.");
    }
}

// GET FINANCE PERIOD LABEL
function getFinancePeriodLabel(period) {
    const labels = {
        today: "Hoje",
        "7days": "Últimos 7 dias",
        "30days": "Últimos 30 dias",
        month: "Mês Atual",
        all: "Tudo"
    };

    return labels[period] || "Período selecionado";
}

// LOAD FINANCE TRANSACTIONS FROM SOURCE
async function loadFinanceTransactionsFromSource() {
    if (window.shouldUseApiOrders?.()) {
        return window.PXBRTransactionsApiService.getTransactions();
    }

    return loadTransactions();
}

// LOAD FINANCE PLAYERS FROM SOURCE
async function loadFinancePlayersFromSource() {
    if (window.shouldUseApiPlayers?.()) {
        return window.PXBRPlayersApiService.getPlayers();
    }

    return loadPlayers();
}

// LOAD FINANCE ORDERS FROM SOURCE
async function loadFinanceOrdersFromSource() {
    if (window.shouldUseApiOrders?.()) {
        return window.PXBROrdersApiService.getOrders({
            archived: false
        });
    }

    return loadOrders().filter((order) => !order.archived);
}

// OPEN MANUAL TRANSACTION MODAL
async function openManualTransactionModal() {
    try {
        manualTransactionPlayer.innerHTML = `
            <option value="">Carregando clientes...</option>
        `;

        manualTransactionOrder.innerHTML = `
            <option value="">Selecione um cliente primeiro</option>
        `;

        manualTransactionType.value = "ORDER_PAYMENT";
        manualTransactionAmount.value = "";
        manualTransactionNotes.value = "";

        openModal(manualTransactionModal);

        const players = await loadFinancePlayersFromSource();

        renderManualTransactionPlayerOptions(players);
    } catch (error) {
        console.error(error);
        closeManualTransactionModal();
        showErrorToast(error.message || "Erro ao carregar clientes.");
    }
}

// CLOSE MANUAL TRANSACTION MODAL
function closeManualTransactionModal() {
    closeModal(manualTransactionModal);
}

// GET FINANCE ORDER DISPLAY NUMBER
function getFinanceOrderDisplayNumber(order) {
    if (order.displayNumber) {
        return order.displayNumber;
    }

    if (order.number) {
        return order.number;
    }

    if (order.orderNumber) {
        return order.orderNumber;
    }

    return String(order.id).slice(0, 8);
}

// RENDER MANUAL TRANSACTION PLAYER OPTIONS
function renderManualTransactionPlayerOptions(players) {
    const sortedPlayers = [...players].sort((a, b) => {
        return a.nick.localeCompare(b.nick);
    });

    manualTransactionPlayer.innerHTML = `
        <option value="">Selecione um cliente</option>
        ${sortedPlayers
            .map((player) => {
                return `
                    <option value="${player.id}">
                        ${player.nick}
                    </option>
                `;
            })
            .join("")}
    `;
}

// RENDER MANUAL TRANSACTION ORDER OPTIONS
async function renderManualTransactionOrderOptions(playerId) {
    if (!playerId) {
        manualTransactionOrder.innerHTML = `
            <option value="">Selecione um cliente primeiro</option>
        `;
        return;
    }

    manualTransactionOrder.innerHTML = `
        <option value="">Carregando encomendas...</option>
    `;

    const orders = await loadFinanceOrdersFromSource();

    const playerOrders = orders
        .filter((order) => order.playerId === playerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (playerOrders.length === 0) {
        manualTransactionOrder.innerHTML = `
            <option value="">Nenhuma encomenda ativa encontrada</option>
        `;
        return;
    }

    manualTransactionOrder.innerHTML = `
        <option value="">Selecione uma encomenda</option>
        ${playerOrders
            .map((order) => {
                const remainingAmount = Math.max(0, (order.total || 0) - (order.paidAmount || 0));

                return `
                    <option value="${order.id}">
                        Pedido #${getFinanceOrderDisplayNumber(order)} - ${formatMoney(remainingAmount)} a pagar
                    </option>
                `;
            })
            .join("")}
    `;
}

// PARSE MANUAL TRANSACTION AMOUNT
function parseManualTransactionAmount() {
    const rawValue = manualTransactionAmount.value.replace(/\D/g, "");

    return Number(rawValue || 0);
}

// SAVE MANUAL TRANSACTION
async function saveManualTransaction() {
    const playerId = manualTransactionPlayer.value;
    const orderId = manualTransactionOrder.value;
    const type = manualTransactionType.value;
    const amount = parseManualTransactionAmount();
    const notes = manualTransactionNotes.value.trim() || null;

    if (!playerId) {
        showWarningToast("Selecione um cliente.");
        return;
    }

    if (!orderId) {
        showWarningToast("Selecione uma encomenda.");
        return;
    }

    if (amount <= 0) {
        showWarningToast("Informe um valor maior que zero.");
        return;
    }

    try {
        btnSaveManualTransaction.disabled = true;

        if (window.shouldUseApiOrders?.()) {
            await window.PXBRTransactionsApiService.create({
                playerId,
                orderId,
                type,
                amount,
                notes
            });
        } else {
            const transaction = createTransaction({
                type,
                amount,
                playerId,
                orderId
            });

            saveTransaction(transaction);
        }

        closeManualTransactionModal();
        await renderFinanceModule();

        if (window.renderDashboard) {
            await window.renderDashboard();
        }

        showSuccessToast("Transação registrada com sucesso!");
    } catch (error) {
        console.error(error);
        showErrorToast(error.message || "Erro ao registrar transação.");
    } finally {
        btnSaveManualTransaction.disabled = false;
    }
}

// GET FINANCE CSV EXPORT SUMMARY
function getFinanceCsvExportSummary() {
    const totalAmount = currentFilteredFinanceTransactions.reduce((total, transaction) => {
        return total + transaction.amount;
    }, 0);

    const uniquePlayers = new Set(
        currentFilteredFinanceTransactions.map((transaction) => transaction.playerId)
    );

    return {
        period: getFinancePeriodLabel(currentFinancePeriod),
        transactions: currentFilteredFinanceTransactions.length,
        totalAmount,
        clients: uniquePlayers.size
    };
}

// RENDER FINANCE CSV EXPORT SUMARRY
function renderFinanceCsvExportSummary() {
    const summary = getFinanceCsvExportSummary();

    financeCsvExportSummary.innerHTML = `
        <div class="backup-summary-grid">
            <div class="backup-summary-item">
                <strong>${summary.period}</strong>
                <span>Período</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.transactions}</strong>
                <span>Transações</span>
            </div>

            <div class="backup-summary-item">
                <strong>${summary.clients}</strong>
                <span>Clientes envolvidos</span>
            </div>

            <div class="backup-summary-item">
                <strong>${formatMoney(summary.totalAmount)}</strong>
                <span>Valor total</span>
            </div>
        </div>
    `;
}

// OPEN FINANCE CSV EXPORT CONFIRM MODAL
function openFinanceCsvExportConfirmModal() {
    if (currentFilteredFinanceTransactions.length === 0) {
        showWarningToast("Não há transações para exportar.");
        return;
    }

    renderFinanceCsvExportSummary();

    openModal(financeCsvExportConfirmModal);
}

// CLOSE FINANCE CSV EXPORT CONFIRM MODAL
function closeFinanceCsvExportConfirmModal() {
    closeModal(financeCsvExportConfirmModal);
}

// EXPORT FINANCE TRANSACTIONS TO CSV
function exportFinanceTransactionsToCsv() {
    if (currentFilteredFinanceTransactions.length === 0) {
        showWarningToast("Não há transações para exportar.");
        return;
    }

    const players = loadPlayers();

    const headers = ["id", "tipo", "data", "cliente_id", "cliente_nick", "valor", "encomenda_id"];

    const rows = currentFilteredFinanceTransactions.map((transaction) => {
        const player =
            transaction.player || players.find((player) => player.id === transaction.playerId);

        return [
            transaction.id,
            transaction.type,
            transaction.createdAt,
            transaction.playerId,
            player?.nick || "",
            transaction.amount,
            transaction.orderId || ""
        ];
    });

    const timestamp = getCsvTimestamp();

    const fileName = `pxbr-finance-transactions-${currentFinancePeriod}-${timestamp}.csv`;

    downloadCsv(fileName, [headers, ...rows]);

    showSuccessToast("Transações exportadas com sucesso!");
}

// GET FINANCE TOP BUYER
function getFinanceTopBuyer(transactions) {
    const players = loadPlayers();

    const totalsByPlayer = {};
    const playersById = {};

    transactions.forEach((transaction) => {
        if (!transaction.playerId) {
            return;
        }

        if (!totalsByPlayer[transaction.playerId]) {
            totalsByPlayer[transaction.playerId] = 0;
        }

        totalsByPlayer[transaction.playerId] += transaction.amount;

        if (transaction.player) {
            playersById[transaction.playerId] = transaction.player;
        }
    });

    let topBuyer = null;
    let topBuyerTotal = 0;

    Object.entries(totalsByPlayer).forEach(([playerId, total]) => {
        if (total > topBuyerTotal) {
            topBuyer =
                playersById[playerId] || players.find((player) => player.id === playerId) || null;

            topBuyerTotal = total;
        }
    });

    return {
        player: topBuyer,
        total: topBuyerTotal
    };
}

// CALCULATE AVERAGE TICKET
function calculateAverageTicket(totalRevenue, transactionsCount) {
    if (transactionsCount === 0) {
        return 0;
    }

    return totalRevenue / transactionsCount;
}

// RENDER FINANCE SUMMARY
function renderFinanceSummary(transactions) {
    const totalRevenue = transactions.reduce((total, transaction) => {
        return total + transaction.amount;
    }, 0);

    const transactionsCount = transactions.length;

    const averageTicket = calculateAverageTicket(totalRevenue, transactionsCount);

    const topBuyer = getFinanceTopBuyer(transactions);

    financeSummaryCards.innerHTML = `
        <div class="dashboard-card">
            <strong>
                Receita no Período
            </strong>

            <span>
                ${formatMoney(totalRevenue)}
            </span>
        </div>

        <div class="dashboard-card">
            <strong>
                Transações no Período
            </strong>

            <span>
                ${transactionsCount}
            </span>
        </div>

        <div class="dashboard-card">
            <strong>
                Ticket Médio
            </strong>

            <span>
                ${formatMoney(averageTicket)}
            </span>
        </div>

        <div class="dashboard-card finance-top-buyer-card">
            <strong>
                Maior Comprador
            </strong>

            ${
                topBuyer.player
                    ? `
                        <div class="finance-top-buyer">
                            ${renderPlayerInline(topBuyer.player, 36)}

                            <span class="finance-top-buyer-total">
                                ${formatMoney(topBuyer.total)}
                            </span>
                        </div>
                    `
                    : `
                        <span>
                            -
                        </span>
                    `
            }
        </div>
    `;
}

// RENDER FINANCE TRANSACTIONS
function renderFinanceTransactions(transactions) {
    financeTransactionsCount.textContent = `Mostrando ${transactions.length} transação${
        transactions.length === 1 ? "" : "ões"
    }`;

    btnExportFinanceCsv.disabled = transactions.length === 0;

    const players = loadPlayers();

    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    financeTransactionsList.innerHTML = "";

    if (sortedTransactions.length === 0) {
        financeTransactionsList.innerHTML = `
            <p>
                Nenhuma transação registrada neste período.
            </p>
        `;

        return;
    }

    const rows = sortedTransactions
        .map((transaction) => {
            const player =
                transaction.player || players.find((player) => player.id === transaction.playerId);

            return `
                <tr>
                    <td>
                        ${formatDateTime(transaction.createdAt)}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="table-link"
                            onclick="openPlayerSummaryModal('${transaction.playerId}')">

                            ${renderPlayerInline(player, 26)}

                        </button>
                    </td>

                    <td class="finance-value">
                        ${formatMoney(transaction.amount)}
                    </td>

                    <td>
                        <button
                            type="button"
                            onclick="openOrderDetails('${transaction.orderId}')">

                            Ver Encomenda

                        </button>
                    </td>
                </tr>
            `;
        })
        .join("");

    financeTransactionsList.innerHTML = `
        <div class="table-wrapper">
            <table class="finance-table">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Cliente</th>
                        <th>Valor</th>
                        <th>Encomenda</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// GET FILTERED TRANSACTIONS BY PERIOD
function getFilteredTransactionsByPeriod(transactions, period) {
    const now = new Date();

    return transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);

        if (period === "today") {
            return transactionDate.toDateString() === now.toDateString();
        }

        if (period === "7days") {
            const limitDate = new Date();
            limitDate.setDate(now.getDate() - 7);
            limitDate.setHours(0, 0, 0, 0);

            return transactionDate >= limitDate;
        }

        if (period === "30days") {
            const limitDate = new Date();
            limitDate.setDate(now.getDate() - 30);
            limitDate.setHours(0, 0, 0, 0);

            return transactionDate >= limitDate;
        }

        if (period === "month") {
            return (
                transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });
}

// SETUP FINANCE PERIOD FILTERS
function setupFinancePeriodFilters() {
    const buttons = document.querySelectorAll(".finance-period-button");

    buttons.forEach((button) => {
        button.classList.toggle("active", button.dataset.period === currentFinancePeriod);

        button.onclick = () => {
            currentFinancePeriod = button.dataset.period;
            renderFinanceModule();
        };
    });
}

btnOpenManualTransactionModal.addEventListener("click", openManualTransactionModal);

manualTransactionPlayer.addEventListener("change", async () => {
    try {
        await renderManualTransactionOrderOptions(manualTransactionPlayer.value);
    } catch (error) {
        console.error(error);
        showErrorToast(error.message || "Erro ao carregar encomendas do cliente.");
    }
});

manualTransactionAmount.addEventListener("input", () => {
    manualTransactionAmount.value = formatMoney(parseManualTransactionAmount());
});

btnSaveManualTransaction.addEventListener("click", saveManualTransaction);

btnExportFinanceCsv.addEventListener("click", openFinanceCsvExportConfirmModal);

btnConfirmFinanceCsvExport.addEventListener("click", () => {
    exportFinanceTransactionsToCsv();
    closeFinanceCsvExportConfirmModal();
});

renderFinanceModule();

window.renderFinanceModule = renderFinanceModule;
window.openManualTransactionModal = openManualTransactionModal;
window.closeManualTransactionModal = closeManualTransactionModal;
