// HAS VISIBLE MODAL
function hasVisibleModal() {
    return Boolean(document.querySelector(".modal:not(.hidden)"));
}

// OPEN MODAL
function openModal(modalElement) {
    if (!modalElement) {
        return;
    }

    modalElement.classList.remove("hidden");
    document.body.classList.add("modal-open");
}

// UNLOCK PAGE SCROLL
function unlockPageScroll() {
    document.body.classList.remove("modal-open");
    document.body.classList.remove("no-scroll");
    document.body.classList.remove("overflow-hidden");
    document.body.style.overflow = "";
}

// CLOSE MODAL
function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    const hasOpenModal = Array.from(document.querySelectorAll(".modal")).some((item) => {
        return !item.classList.contains("hidden");
    });

    if (!hasOpenModal) {
        unlockPageScroll();
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

window.unlockPageScroll = unlockPageScroll;
