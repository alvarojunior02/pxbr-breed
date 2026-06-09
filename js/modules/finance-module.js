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

    const totalReceived =
        transactions.reduce(
            (
                total,
                transaction
            ) =>
                total +
                transaction.amount,
            0
        );

    financeSummaryCards.innerHTML =
        `
        <div class="dashboard-card">
            <strong>
                Total Recebido
            </strong>

            <span>
                ${formatMoney(totalReceived)}
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
                        <th>Player</th>
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