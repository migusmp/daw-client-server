import {
  fetchPublicCompanies,
  fetchPublicEventTypes,
  fetchPublicEvents,
} from "../fetch/catalog.fetch.js";
import {
  cancelTicketOrder,
  createEntradaForTicket,
  createTicketOrder,
  payTicketOrder,
} from "../fetch/purchase.fetch.js";
import { appState } from "../state.js";
import { redirectTo, renderHeaderLinks } from "../utils.js";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizePosterUrl(posterValue = "") {
  const value = String(posterValue).trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `/${value.replace(/^\/+/, "")}`;
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";

  return numeric.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(date, hour) {
  if (!date) return "—";

  const dateObj = new Date(`${date}T${hour || "00:00:00"}`);
  if (Number.isNaN(dateObj.getTime())) {
    return `${date} ${String(hour || "").slice(0, 5)}`.trim();
  }

  return dateObj.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function debounce(fn, delay = 250) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function buildHomeRoutes(user) {
  if (!user) {
    return [
      { path: "/", aName: "Inicio" },
      { path: "/login", aName: "Login", className: "btn-login" },
      { path: "/register", aName: "Register", className: "btn-register" },
    ];
  }

  if (user.role === "ADMIN") {
    return [
      { path: "/", aName: "Inicio" },
      { path: "/admin", aName: "Administración" },
    ];
  }

  return [{ path: "/", aName: "Inicio" }];
}

export function renderHome({ app, headerNav }) {
  const { user } = appState.getState();
  renderHeaderLinks(headerNav, buildHomeRoutes(user));

  app.innerHTML = `
    <section class="home-page">
      <article class="home-hero reveal">
        <p class="home-kicker">Cartelera municipal</p>
        <h1 class="home-title">Eventos disponibles</h1>
        <p class="home-subtitle">
          Busca eventos por tipo, fechas o empresa organizadora y compra una o varias entradas en un solo ticket.
        </p>
        <p class="home-session">
          ${
            user
              ? `Sesión activa: <strong>${escapeHtml(user.name)}</strong> (${escapeHtml(user.role)})`
              : `No has iniciado sesión. Al comprar se te redirigirá a <strong>Login</strong>.`
          }
        </p>
      </article>

      <section class="catalog-layout reveal reveal-delay-1">
        <aside class="catalog-sidebar">
          <article class="panel-card">
            <h2 class="panel-title">Filtrar eventos</h2>
            <form class="catalog-filters" data-home-filters>
              <label class="field-label" for="event-query">Buscar por nombre</label>
              <input id="event-query" class="field-input" type="search" placeholder="Ej: Rock, verbena..." data-filter-q />

              <label class="field-label" for="event-type">Tipo de evento</label>
              <select id="event-type" class="field-select" data-filter-type>
                <option value="">Todos</option>
              </select>

              <label class="field-label" for="event-company">Empresa organizadora</label>
              <select id="event-company" class="field-select" data-filter-company>
                <option value="">Todas</option>
              </select>

              <div class="field-grid">
                <div>
                  <label class="field-label" for="event-date-from">Fecha desde</label>
                  <input id="event-date-from" class="field-input" type="date" data-filter-date-from />
                </div>
                <div>
                  <label class="field-label" for="event-date-to">Fecha hasta</label>
                  <input id="event-date-to" class="field-input" type="date" data-filter-date-to />
                </div>
              </div>

              <button class="field-button field-button--secondary" type="button" data-filter-reset>
                Limpiar filtros
              </button>
            </form>
          </article>

          <article class="panel-card">
            <h2 class="panel-title">Empresas por tipo</h2>
            <label class="field-label" for="company-type-search">Tipo de evento</label>
            <select id="company-type-search" class="field-select" data-company-type>
              <option value="">Todos</option>
            </select>

            <label class="field-label" for="company-query">Buscar empresa</label>
            <input id="company-query" class="field-input" type="search" placeholder="Ej: Sonido, Teatro..." data-company-query />

            <div class="company-results" data-company-results>
              <p class="empty-message">Cargando empresas...</p>
            </div>
          </article>
        </aside>

        <section class="catalog-content">
          <div class="catalog-toolbar">
            <p class="catalog-summary" data-events-summary>Cargando eventos...</p>
          </div>
          <div class="events-grid" data-events-grid>
            <p class="empty-message">Cargando eventos...</p>
          </div>
        </section>
      </section>
    </section>

    <div class="purchase-modal" data-purchase-modal aria-hidden="true">
      <div class="purchase-modal__overlay" data-purchase-close></div>
      <article class="purchase-modal__card">
        <button class="purchase-modal__close" type="button" data-purchase-close aria-label="Cerrar formulario">×</button>
        <h2 class="purchase-modal__title">Comprar entradas</h2>
        <p class="purchase-modal__event" data-purchase-event>Evento</p>

        <form class="purchase-form" data-purchase-form>
          <label class="field-label" for="purchase-quantity">Cantidad de entradas</label>
          <input id="purchase-quantity" class="field-input" type="number" min="1" step="1" value="1" data-purchase-quantity required />

          <div class="purchase-form__resume">
            <p><span>Precio unitario</span><strong data-purchase-unit>0,00 €</strong></p>
            <p><span>Total</span><strong data-purchase-total>0,00 €</strong></p>
          </div>

          <p class="purchase-form__hint" data-purchase-capacity></p>
          <p class="purchase-form__message" data-purchase-message></p>

          <button class="field-button" type="submit" data-purchase-submit>Confirmar compra</button>
        </form>
      </article>
    </div>
  `;

  const filtersForm = app.querySelector("[data-home-filters]");
  const qInput = app.querySelector("[data-filter-q]");
  const typeSelect = app.querySelector("[data-filter-type]");
  const companySelect = app.querySelector("[data-filter-company]");
  const dateFromInput = app.querySelector("[data-filter-date-from]");
  const dateToInput = app.querySelector("[data-filter-date-to]");
  const resetFiltersButton = app.querySelector("[data-filter-reset]");
  const companyTypeSelect = app.querySelector("[data-company-type]");
  const companyQueryInput = app.querySelector("[data-company-query]");
  const companyResults = app.querySelector("[data-company-results]");
  const eventsSummary = app.querySelector("[data-events-summary]");
  const eventsGrid = app.querySelector("[data-events-grid]");

  const purchaseModal = app.querySelector("[data-purchase-modal]");
  const purchaseForm = app.querySelector("[data-purchase-form]");
  const purchaseEventLabel = app.querySelector("[data-purchase-event]");
  const purchaseQuantityInput = app.querySelector("[data-purchase-quantity]");
  const purchaseUnitLabel = app.querySelector("[data-purchase-unit]");
  const purchaseTotalLabel = app.querySelector("[data-purchase-total]");
  const purchaseCapacityHint = app.querySelector("[data-purchase-capacity]");
  const purchaseMessage = app.querySelector("[data-purchase-message]");
  const purchaseSubmitButton = app.querySelector("[data-purchase-submit]");

  const state = {
    user,
    types: [],
    filterCompanies: [],
    menuCompanies: [],
    events: [],
    selectedEvent: null,
    filters: {
      q: "",
      id_tipo: "",
      id_empresa: "",
      fecha_desde: "",
      fecha_hasta: "",
    },
    companyMenu: {
      id_tipo: "",
      q: "",
    },
  };

  function setEventsLoading() {
    eventsGrid.innerHTML = `<p class="empty-message">Cargando eventos...</p>`;
    eventsSummary.textContent = "Cargando eventos...";
  }

  function renderTypeOptions() {
    const options = state.types
      .map((type) => `<option value="${type.id}">${escapeHtml(type.nombre)}</option>`)
      .join("");

    typeSelect.innerHTML = `<option value="">Todos</option>${options}`;
    companyTypeSelect.innerHTML = `<option value="">Todos</option>${options}`;

    typeSelect.value = state.filters.id_tipo;
    companyTypeSelect.value = state.companyMenu.id_tipo;
  }

  function renderCompanySelect() {
    const options = state.filterCompanies
      .map((company) => `<option value="${company.id}">${escapeHtml(company.name)}</option>`)
      .join("");

    companySelect.innerHTML = `<option value="">Todas</option>${options}`;

    if (!state.filters.id_empresa) {
      companySelect.value = "";
      return;
    }

    const exists = state.filterCompanies.some((company) => String(company.id) === String(state.filters.id_empresa));
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
          ? company.event_type.map((type) => `<span class="type-chip">${escapeHtml(type.name)}</span>`).join("")
          : "";

        return `
          <article class="company-item">
            <p class="company-item__name">${escapeHtml(company.name)}</p>
            <p class="company-item__city">${escapeHtml(company.city)}</p>
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
        const posterUrl = normalizePosterUrl(event.poster_image);
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
                  ? `<img src="${escapeHtml(posterUrl)}" alt="Cartel ${escapeHtml(event.name)}" loading="lazy" />`
                  : `<div class="event-card__placeholder">Sin cartel</div>`
              }
            </div>

            <div class="event-card__content">
              <p class="event-card__meta">
                <span>${escapeHtml(event.event_type_name)}</span>
                <span>${escapeHtml(event.company_name)}</span>
              </p>
              <h3 class="event-card__title">${escapeHtml(event.name)}</h3>
              <p class="event-card__place">${escapeHtml(event.place)}</p>
              <p class="event-card__date">${escapeHtml(formatDate(event.date, event.hour))}</p>
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
    purchaseQuantityInput.max = String(Math.max(1, Number(event.remaining_capacity || 1)));
    purchaseCapacityHint.textContent = `Disponibles: ${event.remaining_capacity} entrada(s).`;
    purchaseSubmitButton.disabled = false;
    setPurchaseMessage("");
    updatePurchaseTotals();

    purchaseModal.classList.add("is-open");
    purchaseModal.setAttribute("aria-hidden", "false");
  }

  async function loadFilterCompanies() {
    const companies = await fetchPublicCompanies({
      idTipo: state.filters.id_tipo || null,
      q: null,
    });

    state.filterCompanies = Array.isArray(companies) ? companies : [];
    renderCompanySelect();
  }

  async function loadCompanyMenu() {
    companyResults.innerHTML = `<p class="empty-message">Buscando empresas...</p>`;

    const companies = await fetchPublicCompanies({
      idTipo: state.companyMenu.id_tipo || null,
      q: state.companyMenu.q || null,
    });

    state.menuCompanies = Array.isArray(companies) ? companies : [];
    renderCompanyMenu();
  }

  async function loadEvents() {
    setEventsLoading();

    const events = await fetchPublicEvents({
      q: state.filters.q || null,
      idTipo: state.filters.id_tipo || null,
      idEmpresa: state.filters.id_empresa || null,
      fechaDesde: state.filters.fecha_desde || null,
      fechaHasta: state.filters.fecha_hasta || null,
    });

    state.events = Array.isArray(events) ? events : [];
    renderEvents();
  }

  async function purchaseSelectedEvent() {
    if (!state.selectedEvent) return;
    if (!state.user) {
      closePurchaseModal();
      redirectTo("/login");
      return;
    }

    const quantity = Number(purchaseQuantityInput.value || 0);
    const available = Number(state.selectedEvent.remaining_capacity || 0);
    const unitPrice = Number(state.selectedEvent.price || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setPurchaseMessage("La cantidad debe ser mayor que 0.", "error");
      return;
    }

    if (quantity > available) {
      setPurchaseMessage(`Solo hay ${available} entrada(s) disponible(s).`, "error");
      return;
    }

    purchaseSubmitButton.disabled = true;
    setPurchaseMessage("Procesando compra...", "");

    const createTicketResult = await createTicketOrder(state.selectedEvent.id);
    if (!createTicketResult.ok) {
      purchaseSubmitButton.disabled = false;

      if (createTicketResult.status === 401) {
        closePurchaseModal();
        redirectTo("/login");
        return;
      }

      setPurchaseMessage(createTicketResult.message || "No se pudo crear el ticket.", "error");
      return;
    }

    const ticketId = Number(createTicketResult.data?.id_ticket || 0);
    if (ticketId <= 0) {
      purchaseSubmitButton.disabled = false;
      setPurchaseMessage("Ticket inválido devuelto por servidor.", "error");
      return;
    }

    let createdCount = 0;
    for (let i = 0; i < quantity; i += 1) {
      const entradaResult = await createEntradaForTicket({
        idEvento: state.selectedEvent.id,
        idTicket: ticketId,
        precioPagado: unitPrice,
      });

      if (!entradaResult.ok) {
        break;
      }

      createdCount += 1;
    }

    if (createdCount === 0) {
      await cancelTicketOrder(ticketId);
      purchaseSubmitButton.disabled = false;
      setPurchaseMessage("No se pudo generar ninguna entrada.", "error");
      return;
    }

    const totalPagado = Number((createdCount * unitPrice).toFixed(2));
    const payResult = await payTicketOrder(ticketId, totalPagado);

    if (!payResult.ok) {
      purchaseSubmitButton.disabled = false;
      setPurchaseMessage(
        `Se generaron ${createdCount} entrada(s), pero no se pudo cerrar el pago del ticket.`,
        "error",
      );
      await loadEvents();
      return;
    }

    const deliveryWarning = payResult.data?.delivery_warning;
    if (deliveryWarning) {
      setPurchaseMessage(
        `Compra completada: ${createdCount} entrada(s) en ticket #${ticketId}. No se pudo enviar el email (${deliveryWarning}).`,
        "error",
      );
    } else {
      setPurchaseMessage(
        `Compra completada: ${createdCount} entrada(s) en ticket #${ticketId}. PDF enviado por email.`,
        "success",
      );
    }

    await loadEvents();
    purchaseSubmitButton.disabled = false;

    setTimeout(() => {
      closePurchaseModal();
    }, 900);
  }

  const onQueryInput = debounce(async () => {
    state.filters.q = qInput.value.trim();
    await loadEvents();
  }, 260);

  const onCompanyQueryInput = debounce(async () => {
    state.companyMenu.q = companyQueryInput.value.trim();
    await loadCompanyMenu();
  }, 260);

  filtersForm.addEventListener("submit", (e) => e.preventDefault());

  qInput.addEventListener("input", onQueryInput);

  typeSelect.addEventListener("change", async () => {
    state.filters.id_tipo = typeSelect.value;
    await loadFilterCompanies();
    await loadEvents();
  });

  companySelect.addEventListener("change", async () => {
    state.filters.id_empresa = companySelect.value;
    await loadEvents();
  });

  dateFromInput.addEventListener("change", async () => {
    state.filters.fecha_desde = dateFromInput.value;
    await loadEvents();
  });

  dateToInput.addEventListener("change", async () => {
    state.filters.fecha_hasta = dateToInput.value;
    await loadEvents();
  });

  resetFiltersButton.addEventListener("click", async () => {
    state.filters = {
      q: "",
      id_tipo: "",
      id_empresa: "",
      fecha_desde: "",
      fecha_hasta: "",
    };

    qInput.value = "";
    typeSelect.value = "";
    companySelect.value = "";
    dateFromInput.value = "";
    dateToInput.value = "";

    await loadFilterCompanies();
    await loadEvents();
  });

  companyTypeSelect.addEventListener("change", async () => {
    state.companyMenu.id_tipo = companyTypeSelect.value;
    await loadCompanyMenu();
  });

  companyQueryInput.addEventListener("input", onCompanyQueryInput);

  eventsGrid.addEventListener("click", (e) => {
    const button = e.target.closest("[data-buy-event]");
    if (!button) return;

    const id = Number(button.getAttribute("data-buy-event"));
    const event = state.events.find((item) => Number(item.id) === id);
    if (!event) return;

    if (!state.user) {
      redirectTo("/login");
      return;
    }

    openPurchaseModal(event);
  });

  purchaseModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-purchase-close]")) {
      closePurchaseModal();
    }
  });

  purchaseQuantityInput.addEventListener("input", updatePurchaseTotals);

  purchaseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await purchaseSelectedEvent();
  });

  (async () => {
    const [types] = await Promise.all([fetchPublicEventTypes()]);
    state.types = Array.isArray(types) ? types : [];

    renderTypeOptions();
    await loadFilterCompanies();
    await loadCompanyMenu();
    await loadEvents();
  })();
}
