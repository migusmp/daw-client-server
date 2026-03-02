import {
  formatDate,
  formatPrice,
} from "./home.helpers.js";

export function createHomeRenderers({ state, elements }) {
  const {
    typeSelect,
    companyTypeSelect,
    companySelect,
    companyResults,
    eventsSummary,
    eventsGrid,
    purchaseModal,
    purchaseEventLabel,
    purchaseQuantityInput,
    purchaseUnitLabel,
    purchaseTotalLabel,
    purchaseCapacityHint,
    purchaseMessage,
    purchaseSubmitButton,
  } = elements;

  function setEventsLoading() {
    eventsGrid.innerHTML = `<p class="empty-message">Cargando eventos...</p>`;
    eventsSummary.textContent = "Cargando eventos...";
  }

  function renderTypeOptions() {
    const options = state.types
      .map((type) => `<option value="${type.id}">${type.nombre || ""}</option>`)
      .join("");

    typeSelect.innerHTML = `<option value="">Todos</option>${options}`;
    companyTypeSelect.innerHTML = `<option value="">Todos</option>${options}`;

    typeSelect.value = state.filters.id_tipo;
    companyTypeSelect.value = state.companyMenu.id_tipo;
  }

  function renderCompanySelect() {
    const options = state.filterCompanies
      .map((company) => `<option value="${company.id}">${company.name || ""}</option>`)
      .join("");

    companySelect.innerHTML = `<option value="">Todas</option>${options}`;

    if (!state.filters.id_empresa) {
      companySelect.value = "";
      return;
    }

    const exists = state.filterCompanies.some(
      (company) => String(company.id) === String(state.filters.id_empresa),
    );
    companySelect.value = exists ? state.filters.id_empresa : "";
    if (!exists) {
      state.filters.id_empresa = "";
    }
  }

  function renderCompanyMenu() {
    if (!Array.isArray(state.menuCompanies) || state.menuCompanies.length === 0) {
      companyResults.innerHTML = `<p class="empty-message">No hay empresas para ese filtro.</p>`;
      return;
    }

    companyResults.innerHTML = state.menuCompanies
      .map((company) => {
        const typeChips = Array.isArray(company.event_type)
          ? company.event_type
              .map((type) => `<span class="type-chip">${type.name || ""}</span>`)
              .join("")
          : "";

        return `
          <article class="company-item">
            <p class="company-item__name">${company.name || ""}</p>
            <p class="company-item__city">${company.city || ""}</p>
            <div class="company-item__types">${typeChips || `<span class="type-chip">Sin tipos</span>`}</div>
          </article>
        `;
      })
      .join("");
  }

  function renderEvents() {
    if (!Array.isArray(state.events) || state.events.length === 0) {
      eventsSummary.textContent = "No se encontraron eventos con los filtros seleccionados.";
      eventsGrid.innerHTML = `<p class="empty-message">No hay resultados.</p>`;
      return;
    }

    eventsSummary.textContent = `${state.events.length} evento(s) encontrado(s).`;

    eventsGrid.innerHTML = state.events
      .map((event) => {
        const posterUrl = String(event.poster_image || "").trim();
        const hasPoster = posterUrl !== "";
        const remaining = Number(event.remaining_capacity ?? 0);
        const maxCapacity = Number(event.maximun_capacity ?? 0);
        const currentCapacity = Number(event.current_capacity ?? 0);
        const soldOut = remaining <= 0;

        return `
          <article class="event-card">
            <div class="event-card__media">
              ${
                hasPoster
                  ? `<img src="${posterUrl}" alt="Cartel ${event.name || ""}" loading="lazy" />`
                  : `<div class="event-card__placeholder">Sin cartel</div>`
              }
            </div>

            <div class="event-card__content">
              <p class="event-card__meta">
                <span>${event.event_type_name || ""}</span>
                <span>${event.company_name || ""}</span>
              </p>
              <h3 class="event-card__title">${event.name || ""}</h3>
              <p class="event-card__place">${event.place || ""}</p>
              <p class="event-card__date">${formatDate(event.date, event.hour)}</p>
              <p class="event-card__capacity">
                Aforo: ${currentCapacity}/${maxCapacity} · Disponibles: ${remaining}
              </p>

              <div class="event-card__footer">
                <strong class="event-card__price">${formatPrice(event.price)}</strong>
                <button
                  class="field-button"
                  type="button"
                  data-buy-event="${event.id}"
                  ${soldOut ? "disabled" : ""}
                >
                  ${soldOut ? "Agotado" : "Comprar"}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  function setPurchaseMessage(message, kind = "") {
    purchaseMessage.textContent = message || "";
    purchaseMessage.classList.remove("is-error", "is-success");
    if (kind === "error") purchaseMessage.classList.add("is-error");
    if (kind === "success") purchaseMessage.classList.add("is-success");
  }

  function updatePurchaseTotals() {
    if (!state.selectedEvent) return;

    const qty = Math.max(1, Number(purchaseQuantityInput.value || 1));
    const unit = Number(state.selectedEvent.price || 0);
    const total = qty * unit;

    purchaseQuantityInput.value = String(qty);
    purchaseUnitLabel.textContent = formatPrice(unit);
    purchaseTotalLabel.textContent = formatPrice(total);
  }

  function closePurchaseModal() {
    purchaseModal.classList.remove("is-open");
    purchaseModal.setAttribute("aria-hidden", "true");
    state.selectedEvent = null;
    setPurchaseMessage("");
  }

  function openPurchaseModal(event) {
    state.selectedEvent = event;
    purchaseEventLabel.textContent = `${event.name} · ${event.company_name}`;
    purchaseQuantityInput.value = "1";
    purchaseQuantityInput.max = String(
      Math.max(1, Number(event.remaining_capacity || 1)),
    );
    purchaseCapacityHint.textContent = `Disponibles: ${event.remaining_capacity} entrada(s).`;
    purchaseSubmitButton.disabled = false;
    setPurchaseMessage("");
    updatePurchaseTotals();

    purchaseModal.classList.add("is-open");
    purchaseModal.setAttribute("aria-hidden", "false");
  }

  return {
    setEventsLoading,
    renderTypeOptions,
    renderCompanySelect,
    renderCompanyMenu,
    renderEvents,
    setPurchaseMessage,
    updatePurchaseTotals,
    closePurchaseModal,
    openPurchaseModal,
  };
}
