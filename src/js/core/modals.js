// HAS VISIBLE MODAL
function hasVisibleModal() {
    return Boolean(document.querySelector(".modal:not(.hidden)"));
}

// OPEN MODAL
function openModal(modalElement) {
    if (!modalElement) {
        console.error("Modal não encontrado.");
        return;
    }

    modalElement.classList.remove("hidden");

    document.body.classList.add("modal-open");
}

// CLOSE MODAL
function closeModal(modalElement) {
    if (!modalElement) {
        console.error("Modal não encontrado.");
        return;
    }

    modalElement.classList.add("hidden");

    if (!hasVisibleModal()) {
        document.body.classList.remove("modal-open");
    }
}

// CLOSE ALL MODALS
function closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
        modal.classList.add("hidden");
    });

    document.body.classList.remove("modal-open");
}

// SETUP MODAL CLOSE BUTTONS
function setupModalCloseButtons() {
    document.querySelectorAll("[data-close-modal]").forEach((button) => {
        button.addEventListener("click", () => {
            const modal = button.closest(".modal");

            closeModal(modal);
        });
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
        return;
    }

    const visibleModals = Array.from(document.querySelectorAll(".modal:not(.hidden)"));

    const lastVisibleModal = visibleModals.at(-1);

    if (lastVisibleModal) {
        closeModal(lastVisibleModal);
    }
});
