const financeSummaryCards = document.getElementById("financeSummaryCards");

const financeTransactionsList = document.getElementById("financeTransactionsList");

let currentFinancePeriod = "today";

// RENDER FINANCE MODULE
function renderFinanceModule() {
    const transactions = loadTransactions();
    const filteredTransactions = getFilteredTransactionsByPeriod(
        transactions,
        currentFinancePeriod
    );

    setupFinancePeriodFilters();
    renderFinanceSummary(filteredTransactions);
    renderFinanceTransactions(filteredTransactions);
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
