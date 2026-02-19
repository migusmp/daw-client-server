import { appState } from "../../state.js";
import { fetchJson, redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes } from "./company/company.helpers.js";
import { normalize } from "./manage_companies/manage_companies.filters.js";
import { getManageEventsTemplate } from "./manage_events/manage_events.template.js";

export async function renderManageEventsPage({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
    { path: "/admin/manage-events", aName: "Gestión eventos" },
  ]);

  // Obtener todos los eventos
  let allEvents = await fetchJson("/api/events", { method: "GET" });
  if (!allEvents) {
    console.error("Error al requerir los eventos:", allEvents);
    return;
  }

  console.log(allEvents);
  const allCompanies = await fetchJson("/api/companies", { method: "GET" });
  if (!allCompanies) {
    console.error("Error al requerir las empresas:", allEvents);
    return;
  }

  const allEventTypes = await fetchEventTypes();
  if (!allEventTypes) {
    console.error("Error al requerir los tipos de evento:", allEventTypes);
    return;
  }

  app.innerHTML = getManageEventsTemplate();

  const filters = {
    q: "",
    company: "all",
    status: "all",
    price: null,
    event_type: "all",
  };

  const page = document.querySelector(".me-page");

  // SELECTORS DE ESTADÍSTICAS GLOBALES
  const totalEventsStat = document.querySelector("[data-events-total]");
  const mediumPrice = document.querySelector("[data-events-price-average]");
  const totalCapacityEvents = document.querySelector(
    "[data-events-capacity-total]",
  );

  // Actualizar las estadísticas globales de los eventos creados
  updateStats(totalEventsStat, mediumPrice, totalCapacityEvents, allEvents);

  const reloadEventsBtn = document.querySelector("[data-reload-btn]");
  // SELECTORS DE 'SELECTS' E 'INPUTS' DE LA TABLA
  const searchInput = document.querySelector("[data-search-event]");
  const companiesSelect = document.querySelector("[data-company-select]");
  const eventTypeSelect = document.querySelector("[data-event-type-select]");
  const priceInput = document.querySelector("[data-price-input]");

  // Cargar información en el select de las empresas
  fillCompaniesSelect(companiesSelect, allCompanies);
  fillTypeEventSelect(eventTypeSelect, allEventTypes);

  // Recogemos el body de la tabla
  const tbody = document.querySelector(".tbody");
  renderEventsOnTable(tbody, allEvents);

  // Recogemos el panel lateral derecho
  const sideEl = document.querySelector(".me-card--side");

  const clearFiltersBtn = app.querySelector("[data-events-clear-filters]");
  const filterFields = app.querySelectorAll(
    ".me-filters .me-input, .me-filters .me-select",
  );

  tbody?.addEventListener("click", (e) => {
    const eventRow = e.target.closest("[data-event-id-row]");
    if (!eventRow) return;
    const id = Number(eventRow.getAttribute("data-event-id-row"));
    const event = allEvents.filter((e) => e.id === id);
    // Pongo el [0] porque el filtrado me devuelve un array de una sola posición
    // y para acceder directamente al evento debo seleccionar esa posición
    renderSidePanel(sideEl, event[0]);
  });

  page?.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    renderSidePanel(sideEl, null);
  });

  reloadEventsBtn?.addEventListener("click", async () => {
    allEvents = await fetchJson("/api/events", { method: "GET" });
    repaint();
  })

  searchInput?.addEventListener("input", (e) => {
    filters.q = e.target.value;
    repaint();
  });

  companiesSelect?.addEventListener("change", (e) => {
    filters.company = e.target.value;
    repaint();
  });

  eventTypeSelect?.addEventListener("change", (e) => {
    filters.event_type = Number(e.target.value);
    console.log(filters.event_type);
    repaint();
  });

  priceInput?.addEventListener("input", (e) => {
    filters.price = e.target.value === "" ? null : Number(e.target.value);
    repaint();
  });

  function repaint() {
    const filterEvents = getFilteredEvents();
    renderEventsOnTable(tbody, filterEvents);
  }

  function getFilteredEvents() {
    return allEvents.filter((e) => eventMatchFilters(e, filters));
  }

  clearFiltersBtn?.addEventListener("click", () => {
    filterFields.forEach((field) => {
      if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
        return;
      }

      field.value = "";
    });
    filters.company = "all";
    filters.event_type = "all";
    filters.price = null;
    filters.q = "";
    filters.status = "all";

    repaint();
  });
}

function eventMatchFilters(e, filters) {
  if (!e) return;
  if (!filters) return;

  const query = normalize(filters.q);
  // TODO
  if (query) {
    const heystack = normalize(
      `${e.name} ${e.company_name} ${e.place} ${e.event_type_name}`,
    );
    if (!heystack.includes(query)) return false;
  }

  if (filters.company !== "all" && e.id_company !== Number(filters.company)) {
    return false;
  }

  if (filters.price !== null) {
    const eventPrice = Number(e.price);
    if (eventPrice === null || eventPrice > filters.price) return false;
  }

  if (filters.event_type !== "all" && e.id_event_type !== filters.event_type) {
    return false;
  }

  return true;
}

function renderSidePanel(sideEl, event) {
  if (!sideEl) return;
  if (!event) {
    sideEl.innerHTML = `
      <h2 class="me-card__title">Panel lateral</h2>
      <div class="me-side-placeholder">Sin evento seleccionado</div>
    `;

    return;
  }

  sideEl.innerHTML = `
    <h1 class="me-card__title">Panel lateral</h1>
    <div class="data-event">
      <span>Nombre</span>
      <p>${event.name}</p>
    </div>
    <div class="data-event">
      <span>Lugar</span>
      <p>${event.place}</p>
    </div>
    <div class="data-event">
      <span>Capacidad</span>
      <p>${event.maximun_capacity}</p>
    </div>
    <div class="data-event">
      <span>Hora</span>
      <p>${event.hour}</p>
    </div>
    <div class="data-event">
      <span>Fecha</span>
      <p>${event.date}</p>
    </div>
    <div class="data-event">
      <span>Tipo de evento</span>
      <p>${event.event_type_name}</p>
    </div>
    <div class="data-event">
      <span>Empresa organizadora</span>
      <p>${event.company_name}</p>
    </div>
    <div class="data-event">
      <span>Precio</span>
      <p>${event.price}€</p>
    </div>

    <div class="side-btns">
      <button type="button" data-side-action="edit" data-edit-id="${event.id}">Editar</button>
      <button type="button" data-side-action="delete" data-delete-id="${event.id}">Eliminar</button>
    </div>
  `;
}

function renderEventsOnTable(tbody, arrEvents) {
  if (!Array.isArray(arrEvents) || !tbody) return;

  tbody.innerHTML = "";
  if (arrEvents.length === 0) {
    const tr = document.createElement("tr");
    const tdStatus = document.createElement("td");
    tdStatus.className = "me-table__status";
    tdStatus.colSpan = 7;
    tdStatus.textContent = "No hay eventos para mostrar con estos filtros.";
    tr.append(tdStatus);
    tbody.append(tr);
    return;
  }

  arrEvents.forEach((e) => {
    const tr = document.createElement("tr");
    tr.className = "me-row";
    tr.setAttribute("data-event-id-row", e.id);

    const tdEventName = document.createElement("td");
    const eventName = document.createElement("p");
    eventName.className = "me-event-name";
    eventName.textContent = e.name ?? "Sin nombre";

    const eventMeta = document.createElement("span");
    eventMeta.className = "me-event-meta";
    eventMeta.textContent = `ID ${e.id}`;
    tdEventName.append(eventName, eventMeta);

    const tdCompanyName = document.createElement("td");
    const companyPill = document.createElement("span");
    companyPill.className = "me-company-pill";
    companyPill.textContent = e.company_name ?? "Sin empresa";
    tdCompanyName.append(companyPill);

    const tdEventPlace = document.createElement("td");
    tdEventPlace.className = "me-cell-place";
    tdEventPlace.textContent = e.place ?? "Sin lugar";

    const tdDate = document.createElement("td");
    const dateChip = document.createElement("span");
    dateChip.className = "me-date-chip";
    dateChip.textContent = e.date ?? "-";
    tdDate.append(dateChip);

    const tdPrice = document.createElement("td");
    const rawPrice = e.price ?? "";
    const priceWithCurrency =
      rawPrice === "" || rawPrice === null
        ? "-"
        : typeof rawPrice === "string" && rawPrice.includes("€")
          ? rawPrice
          : `${rawPrice} €`;
    const priceValue = document.createElement("span");
    priceValue.className = "me-price-value";
    priceValue.textContent = priceWithCurrency;
    tdPrice.append(priceValue);

    const tdTimeStamp = document.createElement("td");
    const timeChip = document.createElement("span");
    timeChip.className = "me-time-chip";
    timeChip.textContent = e.hour ?? "-";
    tdTimeStamp.append(timeChip);

    const tdEventType = document.createElement("td");
    const typePill = document.createElement("span");
    typePill.className = "me-type-pill";
    typePill.textContent = e.event_type_name ?? "Sin tipo";
    tdEventType.append(typePill);

    tr.append(
      tdEventName,
      tdCompanyName,
      tdEventPlace,
      tdDate,
      tdPrice,
      tdTimeStamp,
      tdEventType,
    );
    tbody.append(tr);
  });
}

function fillCompaniesSelect(select, arrCompanies) {
  if (!Array.isArray(arrCompanies)) return;

  arrCompanies.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.name;
    select.append(option);
  });
}

function fillTypeEventSelect(select, arrEventTypes) {
  if (!Array.isArray(arrEventTypes)) return;

  arrEventTypes.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1);
    select.append(option);
  });
}

function updateStats(
  totalEventsStat,
  mediumPrice,
  totalCapacityEvents,
  allEvents,
) {
  if (!Array.isArray(allEvents)) return;
  let totalCapacity = 0;
  let totalPrice = 0;
  const eventsSize = allEvents.length;
  totalEventsStat.textContent = eventsSize;

  allEvents.forEach((e) => {
    totalCapacity += e.maximun_capacity;
    totalPrice += e.price;
  });

  totalCapacityEvents.textContent = totalCapacity;

  mediumPrice.textContent = totalPrice / eventsSize + "€";
}
