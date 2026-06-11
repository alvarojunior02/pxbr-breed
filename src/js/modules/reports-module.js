const reportsContent = document.getElementById("reportsContent");
const reportTabs = document.querySelectorAll(".reports-tab");

let currentReport = "top-pokemon";

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
                    registered: { count: 0, revenue: 0 },
                    breedable: { count: 0, revenue: 0 },
                    haRegistered: { count: 0, revenue: 0 },
                    haBreedable: { count: 0, revenue: 0 }
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
                            <img src="${item.sprite}" alt="${item.pokemonName}">
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
            <div class="reports-section-header">
                <div>
                    <h3>🏆 Pokémon Mais Vendidos</h3>
                    <p>Ranking baseado nas encomendas cadastradas no sistema.</p>
                </div>
            </div>

            <div class="report-pokemon-list">
                ${cards}
            </div>
        </section>
    `;
}

function renderReportsModule() {
    reportTabs.forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.report === currentReport);
    });

    if (currentReport === "top-pokemon") {
        reportsContent.innerHTML = renderTopSellingPokemonReport();
        return;
    }

    if (currentReport === "top-ha") {
        reportsContent.innerHTML = renderComingSoonReport(
            "🧬 HAs mais vendidas",
            "Este relatório será implementado na próxima etapa."
        );
        return;
    }

    if (currentReport === "top-buyers") {
        reportsContent.innerHTML = renderComingSoonReport(
            "👑 Players que mais compraram",
            "Este relatório mostrará os clientes com maior valor comprado."
        );
        return;
    }

    if (currentReport === "top-debtors") {
        reportsContent.innerHTML = renderComingSoonReport(
            "⚠️ Players que mais devem",
            "Este relatório mostrará os clientes com maior valor pendente."
        );
        return;
    }
}

reportTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        currentReport = tab.dataset.report;
        renderReportsModule();
    });
});

renderReportsModule();

window.renderReportsModule = renderReportsModule;
