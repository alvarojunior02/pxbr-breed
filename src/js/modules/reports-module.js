const reportsContent = document.getElementById("reportsContent");

// GET POKEMON SALES REPORT
function getPokemonSalesReport() {
    const orders = loadOrders();

    const reportMap = {};

    orders.forEach((order) => {
        order.pokemons.forEach((pokemon) => {
            if (!reportMap[pokemon.pokemonId]) {
                reportMap[pokemon.pokemonId] = {
                    pokemonId: pokemon.pokemonId,
                    pokemonName: pokemon.pokemonName,
                    sprite: pokemon.sprite,
                    totalCount: 0,
                    totalRevenue: 0,
                    registered: {
                        count: 0,
                        revenue: 0
                    },
                    breedable: {
                        count: 0,
                        revenue: 0
                    },
                    haRegistered: {
                        count: 0,
                        revenue: 0
                    },
                    haBreedable: {
                        count: 0,
                        revenue: 0
                    }
                };
            }

            const item = reportMap[pokemon.pokemonId];

            item.totalCount += 1;
            item.totalRevenue += pokemon.value;

            const isHA = pokemon.ability?.isHA;
            const isBreedable = pokemon.breedable;

            if (isHA && isBreedable) {
                item.haBreedable.count += 1;
                item.haBreedable.revenue += pokemon.value;
                return;
            }

            if (isHA && !isBreedable) {
                item.haRegistered.count += 1;
                item.haRegistered.revenue += pokemon.value;
                return;
            }

            if (!isHA && isBreedable) {
                item.breedable.count += 1;
                item.breedable.revenue += pokemon.value;
                return;
            }

            item.registered.count += 1;
            item.registered.revenue += pokemon.value;
        });
    });

    return Object.values(reportMap).sort((a, b) => {
        return b.totalCount - a.totalCount || b.totalRevenue - a.totalRevenue;
    });
}

// RENDER REPORT CATEGORY
function renderReportCategory(label, data) {
    if (data.count === 0) {
        return "";
    }

    return `
        <li>
            <span>
                ${data.count} ${label}
            </span>

            <strong>
                ${formatMoney(data.revenue)}
            </strong>
        </li>
    `;
}

// RENDER TOP SELLING POKEMON REPORT
function renderTopSellingPokemonReport() {
    const report = getPokemonSalesReport().slice(0, 10);

    if (report.length === 0) {
        return `
            <div class="dashboard-card">
                <strong>
                    Nenhum dado encontrado
                </strong>

                <span>
                    Cadastre encomendas para visualizar relatórios.
                </span>
            </div>
        `;
    }

    const cards = report
        .map((item, index) => {
            return `
                <div class="report-pokemon-card">
                    <div class="report-pokemon-header">
                        <span class="report-position">
                            ${index + 1}º
                        </span>

                        <img
                            src="${item.sprite}"
                            alt="${item.pokemonName}">

                        <div>
                            <h3>
                                ${item.pokemonName}
                            </h3>

                            <p>
                                ${item.totalCount} vendido${item.totalCount === 1 ? "" : "s"}
                            </p>
                        </div>

                        <strong class="report-total-revenue">
                            ${formatMoney(item.totalRevenue)}
                        </strong>
                    </div>

                    <ul class="report-category-list">
                        ${renderReportCategory("Cadastrado", item.registered)}
                        ${renderReportCategory("Breedável", item.breedable)}
                        ${renderReportCategory("HA Castrado", item.haRegistered)}
                        ${renderReportCategory("HA Breedável", item.haBreedable)}
                    </ul>
                </div>
            `;
        })
        .join("");

    return `
        <section class="reports-section-card">
            <div class="reports-section-header">
                <div>
                    <h3>
                        🏆 Pokémon Mais Vendidos
                    </h3>

                    <p>
                        Ranking baseado nas encomendas cadastradas no sistema.
                    </p>
                </div>
            </div>

            <div class="report-pokemon-list">
                ${cards}
            </div>
        </section>
    `;
}

// RENDER REPORTS MODULE
function renderReportsModule() {
    reportsContent.innerHTML = renderTopSellingPokemonReport();
}

renderReportsModule();

window.renderReportsModule = renderReportsModule;
