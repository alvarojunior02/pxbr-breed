const financeSummaryCards = document.getElementById("financeSummaryCards");

const financeTransactionsList = document.getElementById("financeTransactionsList");

// RENDER FINANCE MODULE
function renderFinanceModule() {
    renderFinanceSummary();
    renderFinanceTransactions();
}

// RENDER FINANCE SUMMARY
function renderFinanceSummary() {
    const transactions = loadTransactions();

    const today = new Date();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    const totalRevenue =
        transactions.reduce(
            (total, transaction) =>
                total + transaction.amount,
            0
        );

    const monthlyRevenue =
        transactions
            .filter(transaction => {
                const date =
                    new Date(transaction.createdAt);

                return (
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear
                );
            })
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    const dailyRevenue =
        transactions
            .filter(transaction => {
                const date =
                    new Date(transaction.createdAt);

                return (
                    date.toDateString() ===
                    today.toDateString()
                );
            })
            .reduce(
                (total, transaction) =>
                    total + transaction.amount,
                0
            );

    financeSummaryCards.innerHTML =
        `
        <div class="dashboard-card">
            <strong>
                Receita Total
            </strong>

            <span>
                ${formatMoney(totalRevenue)}
            </span>
        </div>

        <div class="dashboard-card">
            <strong>
                Receita do Mês
            </strong>

            <span>
                ${formatMoney(monthlyRevenue)}
            </span>
        </div>

        <div class="dashboard-card">
            <strong>
                Receita Hoje
            </strong>

            <span>
                ${formatMoney(dailyRevenue)}
            </span>
        </div>

        <div class="dashboard-card">
            <strong>
                Transações
            </strong>

            <span>
                ${transactions.length}
            </span>
        </div>
    `;
}

// RENDER FINANCE TRANSACTIONS
function renderFinanceTransactions() {
    const transactions =
        loadTransactions()
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            );

    financeTransactionsList.innerHTML = "";

    if (transactions.length === 0) {
        financeTransactionsList.innerHTML =
            `
            <p>
                Nenhuma transação registrada.
            </p>
        `;

        return;
    }

    const rows =
        transactions
            .map(transaction => {
                const player =
                    loadPlayers().find(
                        player =>
                            player.id === transaction.playerId
                    );

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

    financeTransactionsList.innerHTML =
        `
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

renderFinanceModule();

window.renderFinanceModule = renderFinanceModule;