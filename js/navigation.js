const navLinks = document.querySelectorAll(".nav-link");

const appSections = document.querySelectorAll(".app-section");

function showSection(sectionId) {
    appSections.forEach((section) => {
        section.classList.remove("active-section");
    });

    navLinks.forEach((link) => {
        link.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active-section");

    document.querySelector(`[data-section="${sectionId}"]`).classList.add("active");
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        showSection(link.dataset.section);
    });
});
