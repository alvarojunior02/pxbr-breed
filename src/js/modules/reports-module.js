const REPORT_LABELS = {
    "top-pokemon": "Pokémons mais vendidos",
    "top-ha": "HAs mais vendidas",
    "top-buyers": "Players que mais compraram",
    "top-debtors": "Players que mais devem"
};

const REPORT_FILE_NAMES = {
    "top-pokemon": "top-pokemon",
    "top-ha": "top-ha",
    "top-buyers": "top-buyers",
    "top-debtors": "top-debtors"
};

const REPORT_PERIOD_LABELS = {
    today: "Hoje",
    "7days": "Últimos 7 dias",
    "30days": "Últimos 30 dias",
    month: "Mês Atual",
    all: "Tudo"
};

const REPORT_CHART_COLORS = [
    "#3b82f6",
    "#22c55e",
    "#facc15",
    "#f97316",
    "#ef4444",
    "#a855f7",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#64748b"
];

const reportsContent = document.getElementById("reportsContent");
const reportTabs = document.querySelectorAll(".reports-tab");
const reportPeriodButtons = document.querySelectorAll(".reports-period-button");
const reportStartDate = document.getElementById("reportStartDate");
const reportEndDate = document.getElementById("reportEndDate");
const btnApplyReportDateRange = document.getElementById("btnApplyReportDateRange");
const btnClearReportDateRange = document.getElementById("btnClearReportDateRange");

const reportCsvExportConfirmModal = document.getElementById("reportCsvExportConfirmModal");
const reportCsvExportSummary = document.getElementById("reportCsvExportSummary");
const btnCloseReportCsvExportModal = document.getElementById("btnCloseReportCsvExportModal");
const btnConfirmReportCsvExport = document.getElementById("btnConfirmReportCsvExport");

let pendingReportCsvExport = null;

let currentReport = "top-pokemon";
let currentReportsPeriod = "7days";
let currentReportsCustomDateRange = {
    startDate: "",
    endDate: ""
};

let currentReportChart = null;

let reportsOrdersCache = [];
let reportsPlayersCache = [];

// LOAD REPORTS DATA CACHE
async function loadReportsDataCache() {
    if (window.shouldUseApiOrders?.()) {
        const [orders, players] = await Promise.all([
            window.PXBROrdersApiService.getOrders(),
            window.PXBRPlayersApiService.getPlayers()
        ]);

        reportsOrdersCache = orders || [];
        reportsPlayersCache = players || [];

        return;
    }

    reportsOrdersCache = loadOrders();
    reportsPlayersCache = loadPlayers();
}

// GET REPORTS ORDERS
function getReportsOrders() {
    return reportsOrdersCache.length ? reportsOrdersCache : loadOrders();
}

// GET REPORTS PLAYERS
function getReportsPlayers() {
    return reportsPlayersCache.length ? reportsPlayersCache : loadPlayers();
}

// IS REPORT POKEMON HA
function isReportPokemonHA(pokemon) {
    return Boolean(pokemon.ability?.isHA || pokemon.abilityIsHa);
}

// GET REPORT POKEMON ABILITY NAME
function getReportPokemonAbilityName(pokemon) {
    return pokemon.ability?.name || pokemon.abilityName || "Sem ability";
}

// RENDER REPORT ACTIVE PERIOD BADGE
function renderReportActivePeriodBadge() {
    return `
        <p class="report-active-period">
            Período:
            <strong>${getCurrentReportPeriodLabel()}</strong>
        </p>
    `;
}

// GET CURRENT REPORT PERIOD LABEL
function getCurrentReportPeriodLabel() {
    if (currentReportsPeriod !== "custom") {
        return REPORT_PERIOD_LABELS[currentReportsPeriod];
    }

    const { startDate, endDate } = currentReportsCustomDateRange;

    if (!startDate || !endDate) {
        return "Período customizado";
    }

    return `${formatDate(startDate)} até ${formatDate(endDate)}`;
}

// RENDER REPORT CHART SECTION
function renderReportChartSection(title, description) {
    return `
        <div class="report-chart-card">
            <div class="report-chart-header">
                <h4>${title}</h4>
                <span>${description}</span>
            </div>

            <div class="report-chart-wrapper">
                <canvas id="reportChart"></canvas>
            </div>
        </div>
    `;
}

// DESTROY CURRENT REPORT CHART
function destroyCurrentReportChart() {
    if (currentReportChart) {
        currentReportChart.destroy();
        currentReportChart = null;
    }
}

// GET REPORT CHART OPTIONS
function getReportChartOptions(formatAsMoney = false) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#cbd5e1",
                    font: {
                        weight: "700"
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label(context) {
                        const label = context.dataset.label || context.label || "";
                        const value = context.raw || 0;

                        return formatAsMoney
                            ? `${label}: ${formatMoney(value)}`
                            : `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: "#94a3b8"
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.12)"
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#94a3b8",
                    callback(value) {
                        return formatAsMoney ? formatMoney(value) : value;
                    }
                },
                grid: {
                    color: "rgba(148, 163, 184, 0.12)"
                }
            }
        }
    };
}

// GET CURRENT REPORT CHART CONFIG
function getCurrentReportChartConfig() {
    if (currentReport === "top-pokemon") {
        const report = getPokemonSalesReport().slice(0, 10);

        return {
            type: "bar",
            data: {
                labels: report.map((item) => item.pokemonName),
                datasets: [
                    {
                        label: "Vendas",
                        data: report.map((item) => item.totalCount),
                        backgroundColor: REPORT_CHART_COLORS[0],
                        borderRadius: 8
                    }
                ]
            },
            options: getReportChartOptions()
        };
    }

    if (currentReport === "top-ha") {
        const report = getTopSellingHAReport().slice(0, 10);

        return {
            type: "doughnut",
            data: {
                labels: report.map((item) => item.abilityName),
                datasets: [
                    {
                        label: "Vendas",
                        data: report.map((item) => item.totalCount),
                        backgroundColor: REPORT_CHART_COLORS,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#cbd5e1",
                            font: {
                                weight: "700"
                            }
                        }
                    }
                }
            }
        };
    }

    if (currentReport === "top-buyers") {
        const report = getPlayersFinancialReport()
            .sort((a, b) => b.totalPurchased - a.totalPurchased)
            .slice(0, 10);

        return {
            type: "bar",
            data: {
                labels: report.map((item) => item.player.nick),
                datasets: [
                    {
                        label: "Total comprado",
                        data: report.map((item) => item.totalPurchased),
                        backgroundColor: REPORT_CHART_COLORS[1],
                        borderRadius: 8
                    }
                ]
            },
            options: getReportChartOptions(true)
        };
    }

    if (currentReport === "top-debtors") {
        const report = getPlayersFinancialReport()
            .filter((item) => item.totalPending > 0)
            .sort((a, b) => b.totalPending - a.totalPending)
            .slice(0, 10);

        return {
            type: "bar",
            data: {
                labels: report.map((item) => item.player.nick),
                datasets: [
                    {
                        label: "Valor pendente",
                        data: report.map((item) => item.totalPending),
                        backgroundColor: REPORT_CHART_COLORS[4],
                        borderRadius: 8
                    }
                ]
            },
            options: getReportChartOptions(true)
        };
    }

    return null;
}

// RENDER CURRENT REPORT CHART
function renderCurrentReportChart() {
    destroyCurrentReportChart();

    const canvas = document.getElementById("reportChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const config = getCurrentReportChartConfig();

    if (!config || config.data.labels.length === 0) {
        return;
    }

    currentReportChart = new Chart(canvas, config);
}

// RENDER COMING SOON REPORT
function renderComingSoonReport(title, description) {
    return `
        <section class="reports-section-card">
            <div class="reports-empty-card">
                <strong>
                    ${title}
                </strong>

                <span>
                    ${description}
                </span>
            </div>
        </section>
    `;
}

// PARSE REPORT DATE
function parseReportDate(dateValue) {
    if (!dateValue) {
        return null;
    }

    if (dateValue instanceof Date) {
        return Number.isNaN(dateValue.getTime()) ? null : dateValue;
    }

    if (typeof dateValue === "number") {
        const date = new Date(dateValue);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof dateValue !== "string") {
        return null;
    }

    const trimmedDate = dateValue.trim();

    if (!trimmedDate) {
        return null;
    }

    const brDateMatch = trimmedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*(\d{2}):(\d{2}))?$/);

    if (brDateMatch) {
        const [, day, month, year, hour = "00", minute = "00"] = brDateMatch;
        const date = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            0,
            0
        );

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmedDate);

    return Number.isNaN(date.getTime()) ? null : date;
}

// GET ORDER REPORT DATE
function getOrderReportDate(order) {
    const reportDate =
        parseReportDate(order.createdAt) ||
        parseReportDate(order.date) ||
        parseReportDate(order.created_at) ||
        parseReportDate(order.updatedAt) ||
        parseReportDate(order.archivedAt);

    return reportDate || new Date(0);
}

// GET DATE AT START OF DAY
function getDateAtStartOfDay(dateValue) {
    const date = new Date(`${dateValue}T00:00:00`);

    return date;
}

// GET DATE AT END OF DAY
function getDateAtEndOfDay(dateValue) {
    const date = new Date(`${dateValue}T23:59:59`);

    return date;
}

// GET FILTERED ORDERS BY REPORT PERIOD
function getFilteredOrdersByReportPeriod() {
    const orders = getReportsOrders();

    const now = new Date();

    return orders.filter((order) => {
        const orderDate = getOrderReportDate(order);

        if (Number.isNaN(orderDate.getTime())) {
            return currentReportsPeriod === "all";
        }

        if (currentReportsPeriod === "custom") {
            const { startDate, endDate } = currentReportsCustomDateRange;

            if (!startDate || !endDate) {
                return true;
            }

            const start = getDateAtStartOfDay(startDate);
            const end = getDateAtEndOfDay(endDate);

            return orderDate >= start && orderDate <= end;
        }

        if (currentReportsPeriod === "today") {
            const start = new Date(now);
            start.setHours(0, 0, 0, 0);

            const end = new Date(now);
            end.setHours(23, 59, 59, 999);

            return orderDate >= start && orderDate <= end;
        }

        if (currentReportsPeriod === "7days") {
            const limitDate = new Date();

            limitDate.setDate(now.getDate() - 7);
            limitDate.setHours(0, 0, 0, 0);

            return orderDate >= limitDate;
        }

        if (currentReportsPeriod === "30days") {
            const limitDate = new Date();

            limitDate.setDate(now.getDate() - 30);
            limitDate.setHours(0, 0, 0, 0);

            return orderDate >= limitDate;
        }

        if (currentReportsPeriod === "month") {
            return (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });
}

// GET POKEMON SALES REPORT
function getPokemonSalesReport() {
    const orders = getFilteredOrdersByReportPeriod();

    const reportMap = {};

    orders.forEach((order) => {
        order.pokemons.forEach((pokemon) => {
            if (!reportMap[pokemon.pokemonId]) {
                reportMap[pokemon.pokemonId] = {
                    pokemonId: pokemon.pokemonId,
                    pokemonName: pokemon.pokemonName,
                    sprite: getPokemonReportSprite(pokemon),
                    totalCount: 0,
                    totalRevenue: 0,
                    registered: { count: 0, revenue: 0 },
                    breedable: { count: 0, revenue: 0 },
                    haRegistered: { count: 0, revenue: 0 },
                    haBreedable: { count: 0, revenue: 0 }
                };
            }

            const item = reportMap[pokemon.pokemonId];

            item.totalCount += 1;
            item.totalRevenue += pokemon.value;

            const isHA = isReportPokemonHA(pokemon);
            const isBreedable = pokemon.breedable;

            if (isHA && isBreedable) {
                item.haBreedable.count += 1;
                item.haBreedable.revenue += pokemon.value;
                return;
            }

            if (isHA) {
                item.haRegistered.count += 1;
                item.haRegistered.revenue += pokemon.value;
                return;
            }

            if (isBreedable) {
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

// GET POKEMON REPORT SPRITE
function getPokemonReportSprite(pokemon) {
    return getPokemonThumbnail(pokemon.pokemonId, pokemon.sprite);
}

// RENDER REPORT CATEGORY
function renderReportCategory(label, data) {
    if (data.count === 0) {
        return "";
    }

    return `
        <div class="report-category-item">
            <span>${data.count} ${label}</span>
            <strong>${formatMoney(data.revenue)}</strong>
        </div>
    `;
}

// RENDER TOP SELLING POKEMON REPORT
function renderTopSellingPokemonReport() {
    const report = getPokemonSalesReport().slice(0, 10);

    if (report.length === 0) {
        return `
            <div class="reports-empty-card">
                <strong>Nenhum dado encontrado</strong>
                <span>Cadastre encomendas para visualizar relatórios.</span>
            </div>
        `;
    }

    const cards = report
        .map((item, index) => {
            return `
                <article class="report-pokemon-card">
                    <div class="report-pokemon-header">
                        <span class="report-position">${index + 1}º</span>

                        <div class="report-pokemon-image-wrapper">
                            <img
                                src="${item.sprite}"
                                alt="${item.pokemonName}"
                                onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.pokemonId}.png'">
                        </div>

                        <div class="report-pokemon-info">
                            <h3>${item.pokemonName}</h3>
                            <span>${item.totalCount} vendido${item.totalCount === 1 ? "" : "s"}</span>
                        </div>

                        <div class="report-total-revenue">
                            <small>Receita total</small>
                            <strong>${formatMoney(item.totalRevenue)}</strong>
                        </div>
                    </div>

                    <div class="report-category-grid">
                        ${renderReportCategory("Cadastrado", item.registered)}
                        ${renderReportCategory("Breedável", item.breedable)}
                        ${renderReportCategory("HA Castrado", item.haRegistered)}
                        ${renderReportCategory("HA Breedável", item.haBreedable)}
                    </div>
                </article>
            `;
        })
        .join("");

    return `
        <section class="reports-section-card">
            <div class="reports-section-header report-list-header">
                <div>
                    <h3>🏆 Pokémon Mais Vendidos</h3>

                    <p>Ranking baseado nas encomendas cadastradas no sistema.</p>

                    ${renderReportActivePeriodBadge()}
                </div>

                <button
                    type="button"
                    class="button-primary report-export-button"
                    onclick="openReportCsvExportConfirmModal()">
                    Exportar CSV
                </button>
            </div>

            ${renderReportChartSection(
                "Top Pokémons por vendas",
                "Comparativo dos Pokémons mais vendidos no período selecionado."
            )}

            <div class="report-pokemon-list">
                ${cards}
            </div>
        </section>
    `;
}

// GET TOP SELLING HA REPORT
function getTopSellingHAReport() {
    const orders = getFilteredOrdersByReportPeriod();

    const reportMap = {};

    orders.forEach((order) => {
        order.pokemons.forEach((pokemon) => {
            const isHA = isReportPokemonHA(pokemon);

            if (!isHA) {
                return;
            }

            const abilityName = getReportPokemonAbilityName(pokemon);

            if (!reportMap[abilityName]) {
                reportMap[abilityName] = {
                    abilityName,
                    totalCount: 0,
                    totalRevenue: 0,
                    haRegistered: {
                        count: 0,
                        revenue: 0
                    },
                    haBreedable: {
                        count: 0,
                        revenue: 0
                    },
                    pokemons: {}
                };
            }

            const item = reportMap[abilityName];

            item.totalCount += 1;
            item.totalRevenue += pokemon.value;

            if (!item.pokemons[pokemon.pokemonId]) {
                item.pokemons[pokemon.pokemonId] = {
                    pokemonId: pokemon.pokemonId,
                    pokemonName: pokemon.pokemonName,
                    sprite: getPokemonReportSprite(pokemon),
                    count: 0,
                    revenue: 0
                };
            }

            item.pokemons[pokemon.pokemonId].count += 1;
            item.pokemons[pokemon.pokemonId].revenue += pokemon.value;

            if (pokemon.breedable) {
                item.haBreedable.count += 1;
                item.haBreedable.revenue += pokemon.value;
                return;
            }

            item.haRegistered.count += 1;
            item.haRegistered.revenue += pokemon.value;
        });
    });

    return Object.values(reportMap).sort((a, b) => {
        return b.totalCount - a.totalCount || b.totalRevenue - a.totalRevenue;
    });
}

// GET PLAYERS FINANCIAL REPORT
function getPlayersFinancialReport() {
    const players = getReportsPlayers();
    const orders = getFilteredOrdersByReportPeriod();

    return players
        .map((player) => {
            const playerOrders = orders.filter((order) => {
                return order.playerId === player.id;
            });

            const totalPurchased = playerOrders.reduce((sum, order) => {
                return sum + (order.total || 0);
            }, 0);

            const totalPaid = playerOrders.reduce((sum, order) => {
                return sum + (order.paidAmount || 0);
            }, 0);

            const totalPending = totalPurchased - totalPaid;

            const pokemonsCount = playerOrders.reduce((sum, order) => {
                return sum + (order.pokemons?.length || 0);
            }, 0);

            return {
                player,
                totalPurchased,
                totalPaid,
                totalPending,
                ordersCount: playerOrders.length,
                pokemonsCount,
                averageTicket: playerOrders.length > 0 ? totalPurchased / playerOrders.length : 0
            };
        })
        .filter((item) => item.ordersCount > 0);
}

// RENDER TOP SELLING HA REPORT
function renderTopSellingHAReport() {
    const report = getTopSellingHAReport().slice(0, 10);

    if (report.length === 0) {
        return `
            <div class="reports-empty-card">
                <strong>
                    Nenhum dado encontrado
                </strong>

                <span>
                    Cadastre encomendas com Hidden Ability para visualizar este relatório.
                </span>
            </div>
        `;
    }

    const cards = report
        .map((item, index) => {
            return `
                <article class="report-pokemon-card">
                    <div class="report-ha-header">
                        <span class="report-position">
                            ${index + 1}º
                        </span>

                        <div class="report-ha-icon">
                            🧬
                        </div>

                        <div class="report-pokemon-info">
                            <h3>
                                ${item.abilityName}
                                <small class="pokemon-ha-label">(HA)</small>
                            </h3>

                            <span>
                                ${item.totalCount} venda${item.totalCount === 1 ? "" : "s"}
                            </span>
                        </div>

                        <div class="report-total-revenue">
                            <small>
                                Receita total
                            </small>

                            <strong>
                                ${formatMoney(item.totalRevenue)}
                            </strong>
                        </div>
                    </div>

                    <div class="report-ha-pokemon-list">
                        ${renderHAPokemonList(item.pokemons)}
                    </div>

                    <div class="report-category-grid">
                        ${renderReportCategory("HA Castrado", item.haRegistered)}
                        ${renderReportCategory("HA Breedável", item.haBreedable)}
                    </div>
                </article>
            `;
        })
        .join("");

    return `
        <section class="reports-section-card">
            <div class="reports-section-header report-list-header">
                <div>
                    <h3>🧬 HAs Mais Vendidas</h3>

                    <p>Ranking baseado nas Hidden Abilities vendidas nas encomendas.</p>

                    ${renderReportActivePeriodBadge()}
                </div>

                <button
                    type="button"
                    class="button-primary report-export-button"
                    onclick="openReportCsvExportConfirmModal()">
                    Exportar CSV
                </button>
            </div>

            ${renderReportChartSection(
                "Participação das HAs nas vendas",
                "Distribuição das Hidden Abilities mais vendidas no período."
            )}

            <div class="report-ha-list">
                ${cards}
            </div>
        </section>
    `;
}

// RENDER HA POKEMON LIST
function renderHAPokemonList(pokemons) {
    return Object.values(pokemons)
        .sort((a, b) => b.count - a.count || b.revenue - a.revenue)
        .map((pokemon) => {
            return `
                <div class="report-ha-pokemon">
                    <img
                        src="${pokemon.sprite}"
                        alt="${pokemon.pokemonName}"
                        onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemonId}.png'">

                    <span>
                        ${pokemon.pokemonName}
                    </span>
                </div>
            `;
        })
        .join("");
}

// RENDER TOP BUYERS REPORT
function renderTopBuyersReport() {
    const report = getPlayersFinancialReport()
        .sort((a, b) => b.totalPurchased - a.totalPurchased)
        .slice(0, 20);

    if (!report.length) {
        return renderComingSoonReport("👑 Players que mais compraram", "Nenhum dado encontrado.");
    }

    const cards = report
        .map((item, index) => {
            return `
                <article class="report-player-card">
                    <div class="report-player-header">

                        <span class="report-position">
                            ${index + 1}º
                        </span>

                        ${renderPlayerInline(item.player, 48)}

                    </div>

                    <div class="report-player-metrics">

                        <div>
                            <span>Total Comprado</span>
                            <strong>${formatMoney(item.totalPurchased)}</strong>
                        </div>

                        <div>
                            <span>Pago</span>
                            <strong class="report-positive-value">
                                ${formatMoney(item.totalPaid)}
                            </strong>
                        </div>

                        <div>
                            <span>Pendente</span>
                            <strong class="report-danger-value">
                                ${formatMoney(item.totalPending)}
                            </strong>
                        </div>

                        <div>
                            <span>Encomendas</span>
                            <strong>${item.ordersCount}</strong>
                        </div>

                        <div>
                            <span>Pokémons</span>
                            <strong>${item.pokemonsCount}</strong>
                        </div>

                        <div>
                            <span>Ticket Médio</span>
                            <strong>${formatMoney(item.averageTicket)}</strong>
                        </div>

                    </div>
                </article>
            `;
        })
        .join("");

    return `
        <section class="reports-section-card">
            <div class="reports-section-header report-list-header">
                <div>
                    <h3>👑 Players que Mais Compraram</h3>

                    <p>Ranking baseado no valor total comprado.</p>

                    ${renderReportActivePeriodBadge()}
                </div>

                <button
                    type="button"
                    class="button-primary report-export-button"
                    onclick="openReportCsvExportConfirmModal()">
                    Exportar CSV
                </button>
            </div>

            ${renderReportChartSection(
                "Top compradores por valor",
                "Comparativo do total comprado por player no período."
            )}

            <div class="report-player-list">
                ${cards}
            </div>

        </section>
    `;
}

// RENDER TOP DEBTORS REPORT
function renderTopDebtorsReport() {
    const report = getPlayersFinancialReport()
        .filter((item) => item.totalPending > 0)
        .sort((a, b) => b.totalPending - a.totalPending)
        .slice(0, 20);

    if (!report.length) {
        return `
            <section class="reports-section-card">
                <div class="reports-empty-card">
                    <strong>
                        Nenhum player com pendência encontrado
                    </strong>

                    <span>
                        Todos os clientes estão sem valores pendentes.
                    </span>
                </div>
            </section>
        `;
    }

    const cards = report
        .map((item, index) => {
            return `
                <article class="report-player-card">
                    <div class="report-player-header">
                        <span class="report-position">
                            ${index + 1}º
                        </span>

                        ${renderPlayerInline(item.player, 48)}
                    </div>

                    <div class="report-player-metrics">
                        <div>
                            <span>Total Comprado</span>
                            <strong>${formatMoney(item.totalPurchased)}</strong>
                        </div>

                        <div>
                            <span>Pago</span>
                            <strong class="report-positive-value">
                                ${formatMoney(item.totalPaid)}
                            </strong>
                        </div>

                        <div>
                            <span>Pendente</span>
                            <strong class="report-danger-value">
                                ${formatMoney(item.totalPending)}
                            </strong>
                        </div>

                        <div>
                            <span>Encomendas</span>
                            <strong>${item.ordersCount}</strong>
                        </div>

                        <div>
                            <span>Pokémons</span>
                            <strong>${item.pokemonsCount}</strong>
                        </div>

                        <div>
                            <span>Ticket Médio</span>
                            <strong>${formatMoney(item.averageTicket)}</strong>
                        </div>
                    </div>
                </article>
            `;
        })
        .join("");

    return `
        <section class="reports-section-card">
            <div class="reports-section-header report-list-header">
                <div>
                    <h3>⚠️ Players que Mais Devem</h3>

                    <p>Ranking baseado nos maiores valores pendentes.</p>

                    ${renderReportActivePeriodBadge()}
                </div>

                <button
                    type="button"
                    class="button-primary report-export-button"
                    onclick="openReportCsvExportConfirmModal()">
                    Exportar CSV
                </button>
            </div>

            ${renderReportChartSection(
                "Maiores pendências por player",
                "Comparativo dos maiores valores pendentes no período."
            )}

            <div class="report-player-list">
                ${cards}
            </div>
        </section>
    `;
}

// RENDER REPORTS MODULE
async function renderReportsModule() {
    try {
        await loadReportsDataCache();

        reportPeriodButtons.forEach((button) => {
            button.classList.toggle(
                "active",
                currentReportsPeriod !== "custom" && button.dataset.period === currentReportsPeriod
            );
        });

        reportTabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.report === currentReport);
        });

        if (currentReport === "top-pokemon") {
            reportsContent.innerHTML = renderTopSellingPokemonReport();
            renderCurrentReportChart();
            return;
        }

        if (currentReport === "top-ha") {
            reportsContent.innerHTML = renderTopSellingHAReport();
            renderCurrentReportChart();
            return;
        }

        if (currentReport === "top-buyers") {
            reportsContent.innerHTML = renderTopBuyersReport();
            renderCurrentReportChart();
            return;
        }

        if (currentReport === "top-debtors") {
            reportsContent.innerHTML = renderTopDebtorsReport();
            renderCurrentReportChart();
            return;
        }

        destroyCurrentReportChart();
    } catch (error) {
        console.error(error);
        showErrorToast(error.message || "Erro ao carregar relatórios.");

        reportsContent.innerHTML = `
            <div class="reports-empty-card">
                <strong>Erro ao carregar relatórios</strong>
                <span>Tente novamente em alguns instantes.</span>
            </div>
        `;
    }
}

// GET REPORT CSV FILE NAME
function getReportCsvFileName(reportType) {
    const reportName = REPORT_FILE_NAMES[reportType] || "report";

    const periodName =
        currentReportsPeriod === "custom"
            ? `${currentReportsCustomDateRange.startDate}-to-${currentReportsCustomDateRange.endDate}`
            : currentReportsPeriod;

    return `pxbr-report-${reportName}-${periodName}-${getCsvTimestamp()}.csv`;
}

// GET TOP POKEMONS CSV ROWS
function getTopPokemonCsvRows() {
    const report = getPokemonSalesReport();

    const headers = [
        "posicao",
        "pokemon_id",
        "pokemon",
        "vendas",
        "receita_total",
        "cadastrado_qtd",
        "cadastrado_receita",
        "breedavel_qtd",
        "breedavel_receita",
        "ha_castrado_qtd",
        "ha_castrado_receita",
        "ha_breedavel_qtd",
        "ha_breedavel_receita"
    ];

    const rows = report.map((item, index) => [
        index + 1,
        item.pokemonId,
        item.pokemonName,
        item.totalCount,
        item.totalRevenue,
        item.registered.count,
        item.registered.revenue,
        item.breedable.count,
        item.breedable.revenue,
        item.haRegistered.count,
        item.haRegistered.revenue,
        item.haBreedable.count,
        item.haBreedable.revenue
    ]);

    return [headers, ...rows];
}

// GET TOP HA CSV ROWS
function getTopHACsvRows() {
    const report = getTopSellingHAReport();

    const headers = [
        "posicao",
        "hidden_ability",
        "vendas",
        "receita_total",
        "ha_castrado_qtd",
        "ha_castrado_receita",
        "ha_breedavel_qtd",
        "ha_breedavel_receita",
        "pokemons"
    ];

    const rows = report.map((item, index) => {
        const pokemonNames = Object.values(item.pokemons)
            .map((pokemon) => pokemon.pokemonName)
            .join(" / ");

        return [
            index + 1,
            item.abilityName,
            item.totalCount,
            item.totalRevenue,
            item.haRegistered.count,
            item.haRegistered.revenue,
            item.haBreedable.count,
            item.haBreedable.revenue,
            pokemonNames
        ];
    });

    return [headers, ...rows];
}

// GET TOP BUYERS CSV ROWS
function getTopBuyersCsvRows() {
    const report = getPlayersFinancialReport().sort((a, b) => b.totalPurchased - a.totalPurchased);

    const headers = [
        "posicao",
        "player",
        "total_comprado",
        "pago",
        "pendente",
        "encomendas",
        "pokemons",
        "ticket_medio"
    ];

    const rows = report.map((item, index) => [
        index + 1,
        item.player.nick,
        item.totalPurchased,
        item.totalPaid,
        item.totalPending,
        item.ordersCount,
        item.pokemonsCount,
        item.averageTicket
    ]);

    return [headers, ...rows];
}

// GET TOP DEBTORS CSV ROWS
function getTopDebtorsCsvRows() {
    const report = getPlayersFinancialReport()
        .filter((item) => item.totalPending > 0)
        .sort((a, b) => b.totalPending - a.totalPending);

    const headers = [
        "posicao",
        "player",
        "total_comprado",
        "pago",
        "pendente",
        "encomendas",
        "pokemons",
        "ticket_medio"
    ];

    const rows = report.map((item, index) => [
        index + 1,
        item.player.nick,
        item.totalPurchased,
        item.totalPaid,
        item.totalPending,
        item.ordersCount,
        item.pokemonsCount,
        item.averageTicket
    ]);

    return [headers, ...rows];
}

// GET CURRENT REPORT CSV ROWS
function getCurrentReportCsvRows() {
    if (currentReport === "top-pokemon") {
        return getTopPokemonCsvRows();
    }

    if (currentReport === "top-ha") {
        return getTopHACsvRows();
    }

    if (currentReport === "top-buyers") {
        return getTopBuyersCsvRows();
    }

    if (currentReport === "top-debtors") {
        return getTopDebtorsCsvRows();
    }

    return [];
}

// OPEN REPORT CSV EXPORT CONFIRM MODAL
function openReportCsvExportConfirmModal() {
    const rows = getCurrentReportCsvRows();

    const recordsCount = Math.max(rows.length - 1, 0);

    if (recordsCount === 0) {
        showWarningToast("Não há registros para exportar neste relatório.");
        return;
    }

    const fileName = getReportCsvFileName(currentReport);

    pendingReportCsvExport = {
        fileName,
        rows
    };

    reportCsvExportSummary.innerHTML = `
        <div class="backup-summary-grid">
            <div class="backup-summary-item">
                <strong>${REPORT_LABELS[currentReport]}</strong>
                <span>Relatório</span>
            </div>

            <div class="backup-summary-item">
                <strong>${getCurrentReportPeriodLabel()}</strong>
                <span>Período</span>
            </div>

            <div class="backup-summary-item">
                <strong>${recordsCount}</strong>
                <span>Registros</span>
            </div>

            <div class="backup-summary-item report-file-name-summary">
                <strong>${fileName}</strong>
                <span>Nome do Arquivo</span>
            </div>
        </div>
    `;

    openModal(reportCsvExportConfirmModal);
}

// CLORE REPORT CSV EXPORT CONFIRM MODAL
function closeReportCsvExportConfirmModal() {
    closeModal(reportCsvExportConfirmModal);
}

// CONFIRM REPORT CSV EXPORT
function confirmReportCsvExport() {
    if (!pendingReportCsvExport) {
        showWarningToast("Nenhum relatório selecionado para exportação.");
        return;
    }

    downloadCsv(pendingReportCsvExport.fileName, pendingReportCsvExport.rows);

    showSuccessToast("Relatório exportado com sucesso!");

    closeReportCsvExportConfirmModal();
}

// APPLY REPORT DATE RANGE
function applyReportDateRange() {
    const startDate = reportStartDate.value;
    const endDate = reportEndDate.value;

    if (!startDate || !endDate) {
        showWarningToast("Informe a data inicial e a data final.");
        return;
    }

    if (getDateAtStartOfDay(startDate) > getDateAtEndOfDay(endDate)) {
        showWarningToast("A data inicial não pode ser maior que a data final.");
        return;
    }

    currentReportsPeriod = "custom";
    currentReportsCustomDateRange = {
        startDate,
        endDate
    };

    renderReportsModule();
}

// CLEAR REPORT DATE RANGE
function clearReportDateRange() {
    reportStartDate.value = "";
    reportEndDate.value = "";

    currentReportsPeriod = "7days";
    currentReportsCustomDateRange = {
        startDate: "",
        endDate: ""
    };

    renderReportsModule();
}

reportPeriodButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
        event.preventDefault();

        currentReportsPeriod = button.dataset.period;
        currentReportsCustomDateRange = {
            startDate: "",
            endDate: ""
        };

        reportStartDate.value = "";
        reportEndDate.value = "";

        renderReportsModule();
    });
});

reportTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        currentReport = tab.dataset.report;
        renderReportsModule();
    });
});

btnApplyReportDateRange.addEventListener("click", applyReportDateRange);
btnClearReportDateRange.addEventListener("click", clearReportDateRange);

btnConfirmReportCsvExport.addEventListener("click", confirmReportCsvExport);

window.openReportCsvExportConfirmModal = openReportCsvExportConfirmModal;

renderReportsModule();

window.renderReportsModule = renderReportsModule;
