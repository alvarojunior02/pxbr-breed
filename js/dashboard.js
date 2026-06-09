function getPokemonStatusCounts(
    pokemons
) {
    const counts = {};

    ORDER_STATUS.forEach(
        status => {
            counts[
                status.value
            ] = 0;
        }
    );

    pokemons.forEach(
        pokemon => {
            counts[
                pokemon.status
            ] =
                (
                    counts[
                        pokemon.status
                    ] || 0
                ) + 1;
        }
    );

    return counts;
}

function getDashboardMetrics() {
    const orders =
        loadOrders();

    const activeOrders =
        orders.filter(
            order =>
                !order.archived
        );

    const archivedOrders =
        orders.filter(
            order =>
                order.archived
        );

    const allActivePokemons =
        activeOrders.flatMap(
            order =>
                order.pokemons
        );

    const totalReceived =
        orders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                (
                    order.paidAmount || 0
                ),
            0
        );

    const totalPending =
        activeOrders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                Math.max(
                    order.total -
                    (
                        order.paidAmount ||
                        0
                    ),
                    0
                ),
            0
        );

    const activeOrdersValue =
        activeOrders.reduce(
            (
                sum,
                order
            ) =>
                sum +
                order.total,
            0
        );

    return {

        activeOrders:
            activeOrders.length,

        archivedOrders:
            archivedOrders.length,

        activePokemons:
            allActivePokemons.length,

        totalReceived,

        totalPending,

        activeOrdersValue,

        statusCounts:
            getPokemonStatusCounts(
                allActivePokemons
            )

    };
}

function renderDashboard() {

    const dashboardCards =
        document.getElementById(
            "dashboardCards"
        );

    const metrics =
        getDashboardMetrics();

    const statusCards =
        ORDER_STATUS.map(
            status => `
                <div
                    class="dashboard-card">

                    <strong
                        class="${status.cssClass}">

                        ${status.name}

                    </strong>

                    <span>

                        ${
                            metrics
                                .statusCounts[
                                    status.value
                                ]
                        }

                    </span>

                </div>
            `
        ).join("");

    dashboardCards.innerHTML =
        `
        <div
            class="dashboard-card">

            <strong>
                Encomendas Ativas
            </strong>

            <span>
                ${metrics.activeOrders}
            </span>

        </div>

        <div
            class="dashboard-card">

            <strong>
                Pokémons Ativos
            </strong>

            <span>
                ${metrics.activePokemons}
            </span>

        </div>

        <div
            class="dashboard-card">

            <strong>
                Valor em Encomendas
            </strong>

            <span>
                ${
                    formatMoney(
                        metrics.activeOrdersValue
                    )
                }
            </span>

        </div>

        <div
            class="dashboard-card">

            <strong>
                Total Recebido
            </strong>

            <span>
                ${
                    formatMoney(
                        metrics.totalReceived
                    )
                }
            </span>

        </div>

        <div
            class="dashboard-card">

            <strong>
                Total A Receber
            </strong>

            <span>
                ${
                    formatMoney(
                        metrics.totalPending
                    )
                }
            </span>

        </div>

        <div
            class="dashboard-card">

            <strong>
                Arquivadas
            </strong>

            <span>
                ${
                    metrics.archivedOrders
                }
            </span>

        </div>

        ${statusCards}
    `;
}

window.renderDashboard =renderDashboard;

renderDashboard();