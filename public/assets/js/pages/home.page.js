import { fetchPublicEventTypes } from "../fetch/catalog.fetch.js";
import { appState } from "../state.js";
import { redirectTo, renderHeaderLinks } from "../utils.js";
import {
  buildHomeRoutes,
  createHomeState,
  createInitialFilters,
} from "./home/home.helpers.js";
import { createHomeLoaders } from "./home/home.loaders.js";
import { createPurchaseController } from "./home/home.purchase.js";
import { createHomeRenderers } from "./home/home.renderers.js";
import { getHomeElements } from "./home/home.selectors.js";
import { getHomeTemplate } from "./home/home.template.js";

export function renderHome({ app, headerNav }) {
  const { user } = appState.getState();
  renderHeaderLinks(headerNav, buildHomeRoutes(user));

  app.innerHTML = getHomeTemplate(user);

  const elements = getHomeElements(app);
  const {
    filtersForm,
    qInput,
    typeSelect,
    companySelect,
    dateFromInput,
    dateToInput,
    resetFiltersButton,
    companyTypeSelect,
    companyQueryInput,
    eventsGrid,
    purchaseModal,
    purchaseForm,
    purchaseQuantityInput,
  } = elements;

  const state = createHomeState(user);
  const renderers = createHomeRenderers({ state, elements });
  const loaders = createHomeLoaders({ state, elements, renderers });
  const { purchaseSelectedEvent } = createPurchaseController({
    state,
    elements,
    renderers,
    loadEvents: loaders.loadEvents,
  });

  qInput.addEventListener("input", async () => {
    state.filters.q = qInput.value.trim();
    await loaders.loadEvents();
  });

  companyQueryInput.addEventListener("input", async () => {
    state.companyMenu.q = companyQueryInput.value.trim();
    await loaders.loadCompanyMenu();
  });

  filtersForm.addEventListener("submit", (e) => e.preventDefault());

  typeSelect.addEventListener("change", async () => {
    state.filters.id_tipo = typeSelect.value;
    await loaders.loadFilterCompanies();
    await loaders.loadEvents();
  });

  companySelect.addEventListener("change", async () => {
    state.filters.id_empresa = companySelect.value;
    await loaders.loadEvents();
  });

  dateFromInput.addEventListener("change", async () => {
    state.filters.fecha_desde = dateFromInput.value;
    await loaders.loadEvents();
  });

  dateToInput.addEventListener("change", async () => {
    state.filters.fecha_hasta = dateToInput.value;
    await loaders.loadEvents();
  });

  resetFiltersButton.addEventListener("click", async () => {
    state.filters = createInitialFilters();

    qInput.value = "";
    typeSelect.value = "";
    companySelect.value = "";
    dateFromInput.value = "";
    dateToInput.value = "";

    await loaders.loadFilterCompanies();
    await loaders.loadEvents();
  });

  companyTypeSelect.addEventListener("change", async () => {
    state.companyMenu.id_tipo = companyTypeSelect.value;
    await loaders.loadCompanyMenu();
  });

  eventsGrid.addEventListener("click", (e) => {
    const button = e.target.closest("[data-buy-event]");
    if (!button) return;

    const id = Number(button.getAttribute("data-buy-event"));
    const selectedEvent = state.events.find((item) => Number(item.id) === id);
    if (!selectedEvent) return;

    if (!state.user) {
      redirectTo("/login");
      return;
    }

    renderers.openPurchaseModal(selectedEvent);
  });

  purchaseModal.addEventListener("click", (e) => {
    if (e.target.closest("[data-purchase-close]")) {
      renderers.closePurchaseModal();
    }
  });

  purchaseQuantityInput.addEventListener("input", renderers.updatePurchaseTotals);

  purchaseForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await purchaseSelectedEvent();
  });

  (async () => {
    const types = await fetchPublicEventTypes();
    state.types = Array.isArray(types) ? types : [];

    renderers.renderTypeOptions();
    await loaders.loadFilterCompanies();
    await loaders.loadCompanyMenu();
    await loaders.loadEvents();
  })();
}
