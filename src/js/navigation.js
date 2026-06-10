const navLinks = document.querySelectorAll(".nav-link");

const appSections = document.querySelectorAll(".app-section");

const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const appSidebar = document.querySelector(".sidebar");

function showSection(sectionId) {
    appSections.forEach((section) => {
        section.classList.remove("active-section");
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
    });

    if (sectionId === "settingsSection" && typeof renderSettingsModule === "function") {
        renderSettingsModule();
    }

    document.getElementById(sectionId).classList.add("active-section");

    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        showSection(link.dataset.section);
    });
});

if (btnToggleSidebar && appSidebar) {
    btnToggleSidebar.addEventListener("click", () => {
        appSidebar.classList.toggle("menu-open");
    });
}
