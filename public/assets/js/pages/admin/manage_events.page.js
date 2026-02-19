import { appState } from "../../state.js";
import { fetchJson, redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes } from "./company/company.helpers.js";
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
  const allEvents = await fetchJson("/api/events", { method: "GET" });
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
    companyId: "",
    date: "",
    status: "",
    price: "",
    event_type: "",
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

  // SELECTORS DE 'SELECTS' E 'INPUTS' DE LA TABLA
  const searchInput = document.querySelector("[data-search-event]");
  const companiesSelect = document.querySelector("[data-company-select]");
  const dateInput = document.querySelector("[data-date-input]");
  const statusSelect = document.querySelector("[date-status-select]");
  const priceInput = document.querySelector("[date-status-select]");
  const eventTypeSelect = document.querySelector("[data-event-type-select]");

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
    console.log(eventRow.textContent);
    const id = Number(eventRow.getAttribute("data-event-id-row"));
    const event = allEvents.filter((e) => e.id === id);
    console.log(event);
    // Pongo el [0] porque el filtrado me devuelve un array de una sola posición
    // y para acceder directamente al evento debo seleccionar esa posición
    renderSidePanel(sideEl, event[0]);
  });

  page?.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    renderSidePanel(sideEl, null);
  });

  clearFiltersBtn?.addEventListener("click", () => {
    filterFields.forEach((field) => {
      if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
        return;
      }

      field.value = "";
    });
  });
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
  if (!Array.isArray(arrEvents)) return;

  tbody.innerHTML = "";

  arrEvents.forEach((e) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-event-id-row", e.id);

    const tdEventName = document.createElement("td");
    tdEventName.textContent = e.name;

    const tdCompanyName = document.createElement("td");
    tdCompanyName.textContent = e.company_name;

    const tdEventPlace = document.createElement("td");
    tdEventPlace.textContent = e.place;

    const tdDate = document.createElement("td");
    tdDate.textContent = e.date;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = e.price;

    const tdTimeStamp = document.createElement("td");
    tdTimeStamp.textContent = e.hour;

    const tdEventType = document.createElement("td");
    tdEventType.textContent = e.event_type_name;

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
    option.textContent = c.nombre;
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
