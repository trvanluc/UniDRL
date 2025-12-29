// js/components/modal/modal-manager.component.js
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

// Setup listeners cho close (reuse)
export function setupModalListeners(modalId, closeBtnId, overlayId) {
  const closeBtn = document.getElementById(closeBtnId);
  const overlay = document.getElementById(overlayId);

  closeBtn?.addEventListener("click", () => closeModal(modalId));
  overlay?.addEventListener("click", () => closeModal(modalId));
}