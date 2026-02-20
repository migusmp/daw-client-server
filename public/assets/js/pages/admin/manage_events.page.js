import { appState } from "../../state.js";
import { fetchJson, redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes } from "./company/company.helpers.js";
import { eventMatchFilters } from "./manage_events/manage_events.filters.js";
import { fillCompaniesSelect, fillTypeEventSelect } from "./manage_events/manage_events.select.js";
import { renderSidePanel } from "./manage_events/manage_events.side_panel.js";
import { updateStats } from "./manage_events/manage_events.stats.js";
import { renderEventsOnTable } from "./manage_events/manage_events.table.js";
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