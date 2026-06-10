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

        if (appSidebar && window.innerWidth <= 900) {
            appSidebar.classList.remove("menu-open");
            appSidebar.classList.remove("auto-collapsed");
            shouldRestoreMobileMenuOnTop = false;
        }
    });
});

if (btnToggleSidebar && appSidebar) {
    btnToggleSidebar.addEventListener("click", () => {
        if (window.innerWidth > 900) {
            appSidebar.classList.toggle("collapsed");
            return;
        }

        appSidebar.classList.toggle("menu-open");
        appSidebar.classList.remove("auto-collapsed");
        shouldRestoreMobileMenuOnTop = false;
    });
}

let shouldRestoreMobileMenuOnTop = false;

function isMobileNavigation() {
    return window.innerWidth <= 900;
}

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

    if (!isMobileNavigation()) {
        appSidebar.classList.remove("auto-collapsed");
        shouldRestoreMobileMenuOnTop = false;
    }
});
