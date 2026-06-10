const CSV_SEPARATOR = ";";

const financeSummaryCards = document.getElementById("financeSummaryCards");
const financeTransactionsList = document.getElementById("financeTransactionsList");
const financeTransactionsCount = document.getElementById("financeTransactionsCount");
const btnExportFinanceCsv = document.getElementById("btnExportFinanceCsv");

let currentFinancePeriod = "today";
let currentFilteredFinanceTransactions = [];

btnExportFinanceCsv.addEventListener("click", exportFinanceTransactionsToCsv);

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

// ESCAPE CSV VALUE
function escapeCsvValue(value) {
    const stringValue = String(value ?? "");

    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
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

    const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(CSV_SEPARATOR))
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    const link = document.createElement("a");

    link.href = url;
    link.download = `pxbr-finance-transactions-${currentFinancePeriod}-${timestamp}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showSuccessToast("Transações exportadas com sucesso!");
}

// RENDER FINANCE SUMMARY
function renderFinanceSummary(transactions) {
    const totalRevenue = transactions.reduce((total, transaction) => total + transaction.amount, 0);

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
                ${transactions.length}
            </span>
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

                            ${player?.nick || "-"}

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

renderFinanceModule();

window.renderFinanceModule = renderFinanceModule;
