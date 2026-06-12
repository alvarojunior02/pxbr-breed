const navLinks = document.querySelectorAll(".nav-link");

const appSections = document.querySelectorAll(".app-section");

const btnToggleSidebar = document.getElementById("btnToggleSidebar");
const appSidebar = document.querySelector(".sidebar");

// SHOW SECTIONS
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

    if (sectionId === "reportsSection" && typeof renderReportsModule === "function") {
        renderReportsModule();
    }

    document.getElementById(sectionId).classList.add("active-section");

    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        showSection(link.dataset.section);

        if (appSidebar && window.innerWidth <= 900) {
            appSidebar.classList.remove("menu-open");
            appSidebar.classList.remove("auto-collapsed");
            shouldRestoreMobileMenuOnTop = false;
        }
    });
});

if (btnToggleSidebar && appSidebar) {
    btnToggleSidebar.addEventListener("click", () => {
        if (!appSidebar) {
            return;
        }

        if (isMobileNavigation()) {
            appSidebar.classList.toggle("menu-open");
            return;
        }

        appSidebar.classList.toggle("collapsed");
    });
}

let shouldRestoreMobileMenuOnTop = false;

// IS MOBILE NAVIGATION
function isMobileNavigation() {
    return window.innerWidth <= 900;
}

// HANDLE MOBILE MENU SCROLL
function handleMobileMenuScroll() {
    if (!appSidebar || !isMobileNavigation()) {
        return;
    }

    const isMenuOpen = appSidebar.classList.contains("menu-open");
    const isAtTop = window.scrollY <= 10;

    if (!isAtTop && isMenuOpen) {
        appSidebar.classList.add("auto-collapsed");
        shouldRestoreMobileMenuOnTop = true;
        return;
    }

    if (isAtTop && shouldRestoreMobileMenuOnTop) {
        appSidebar.classList.remove("auto-collapsed");
        shouldRestoreMobileMenuOnTop = false;
    }
}

window.addEventListener("scroll", handleMobileMenuScroll);

window.addEventListener("resize", () => {
    if (!appSidebar) {
        return;
    }

    if (isMobileNavigation()) {
        appSidebar.classList.remove("collapsed");
        return;
    }

    appSidebar.classList.remove("menu-open");
    appSidebar.classList.remove("auto-collapsed");

    shouldRestoreMobileMenuOnTop = false;
});
