import { fetchPublicCompanies, fetchPublicEvents } from "../../fetch/catalog.fetch.js";

export function createHomeLoaders({ state, elements, renderers }) {
  const { companyResults } = elements;

  async function loadFilterCompanies() {
    const companies = await fetchPublicCompanies({
      idTipo: state.filters.id_tipo || null,
      q: null,
    });

    state.filterCompanies = Array.isArray(companies) ? companies : [];
    renderers.renderCompanySelect();
  }

  async function loadCompanyMenu() {
    companyResults.innerHTML = `<p class="empty-message">Buscando empresas...</p>`;

    const companies = await fetchPublicCompanies({
      idTipo: state.companyMenu.id_tipo || null,
      q: state.companyMenu.q || null,
    });

    state.menuCompanies = Array.isArray(companies) ? companies : [];
    renderers.renderCompanyMenu();
  }

  async function loadEvents() {
    renderers.setEventsLoading();

    const events = await fetchPublicEvents({
      q: state.filters.q || null,
      idTipo: state.filters.id_tipo || null,
      idEmpresa: state.filters.id_empresa || null,
      fechaDesde: state.filters.fecha_desde || null,
      fechaHasta: state.filters.fecha_hasta || null,
    });

    state.events = Array.isArray(events) ? events : [];
    renderers.renderEvents();
  }

  return {
    loadFilterCompanies,
    loadCompanyMenu,
    loadEvents,
  };
}
