const financeSummaryCards = document.getElementById("financeSummaryCards");
const financeTransactionsList = document.getElementById("financeTransactionsList");
const financeTransactionsCount = document.getElementById("financeTransactionsCount");
const btnExportFinanceCsv = document.getElementById("btnExportFinanceCsv");

const financeCsvExportConfirmModal = document.getElementById("financeCsvExportConfirmModal");
const financeCsvExportSummary = document.getElementById("financeCsvExportSummary");
const btnCloseFinanceCsvExportModal = document.getElementById("btnCloseFinanceCsvExportModal");
const btnCancelFinanceCsvExport = document.getElementById("btnCancelFinanceCsvExport");
const btnConfirmFinanceCsvExport = document.getElementById("btnConfirmFinanceCsvExport");

let currentFinancePeriod = "7days";
let currentFilteredFinanceTransactions = [];

// RENDER FINANCE MODULE
function renderFinanceModule() {
    const transactions = loadTransactions();
    const filteredTransactions = getFilteredTransactionsByPeriod(
        transactions,
        currentFinancePeriod
    );

    currentFilteredFinanceTransactions = filteredTransactions;

    setupFinancePeriodFilters();
    renderFinanceSummary(filteredTransactions);
    renderFinanceTransactions(filteredTransactions);
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

    financeCsvExportConfirmModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

// CLOSE FINANCE CSV EXPORT CONFIRM MODAL
function closeFinanceCsvExportConfirmModal() {
    financeCsvExportConfirmModal.classList.add("hidden");

    const hasVisibleModal = document.querySelector(".modal:not(.hidden)");

    if (!hasVisibleModal) {
        document.body.classList.remove("modal-open");
    }
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
        const player = players.find((player) => player.id === transaction.playerId);

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

    transactions.forEach((transaction) => {
        if (!transaction.playerId) {
            return;
        }

        if (!totalsByPlayer[transaction.playerId]) {
            totalsByPlayer[transaction.playerId] = 0;
        }

        totalsByPlayer[transaction.playerId] += transaction.amount;
    });

    let topBuyer = null;
    let topBuyerTotal = 0;

    Object.entries(totalsByPlayer).forEach(([playerId, total]) => {
        if (total > topBuyerTotal) {
            topBuyer = players.find((player) => player.id === playerId) || null;
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
            const player = players.find((player) => player.id === transaction.playerId);

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

btnExportFinanceCsv.addEventListener("click", openFinanceCsvExportConfirmModal);

btnCloseFinanceCsvExportModal.addEventListener("click", closeFinanceCsvExportConfirmModal);

btnCancelFinanceCsvExport.addEventListener("click", closeFinanceCsvExportConfirmModal);

btnConfirmFinanceCsvExport.addEventListener("click", () => {
    exportFinanceTransactionsToCsv();
    closeFinanceCsvExportConfirmModal();
});

renderFinanceModule();

window.renderFinanceModule = renderFinanceModule;
