import { fetchAllCompanies } from "../../fetch/companies.fetch.js";
import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes } from "./company/company.helpers.js";
import { companyMatchesFilters } from "./manage_companies/manage_companies.filters.js";
import { renderSidePanel } from "./manage_companies/manage_companies.side_panel.js";
import { fillCitySelect, fillEventTypesSelect } from "./manage_companies/manage_companies.selects.js";
import { fillCompaniesTable, setSelectedRow } from "./manage_companies/manage_companies.table.js";
import { getManageCompaniesTemplate } from "./manage_companies/manage_companies.template.js";

export async function renderManageCompaniesPage({ app, headerNav }) {
  // Obtenemos el estado del usuario
  const { user } = appState.getState();

  // Si el usuario no es administrador e intenta entrar en "/admin"
  // Lo redireccionamos
  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  // Renderiza los links del header en la pagina con la url: "/admin/manage-companies"
  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
    { path: "/admin/manage-companies", aName: "Gestión empresas" },
  ]);

  // Fetch para solicitar los tipos de eventos disponibles al backend
  const typeOfEvents = await fetchEventTypes();
  let allCompanies = await fetchAllCompanies(); // Fetch para obtener todas las empresas registradas

  // Obtenemos el contenido html de la página mediante la función "getManageCompaniesTemplate()"
  app.innerHTML = getManageCompaniesTemplate();

  // Inicializamos el estado de los filtros, cada vez que cambie un valor en los 'select' o en
  // el 'input' de búsqueda los valores que contiene 'filters' se irán actualizando.
  const filters = {
    q: "",
    city: "all",
    eventType: "all",
    status: "all",
  };

  const sideContentEl = document.querySelector("[data-mc-side]"); // Panel lateral derecho
  
  // Variable para crear contenido por defecto en el 'Panel lateral derecho'
  // y pasarlelo a la función 'renderSidePanel()' como tercer parámetro
  const defaultSidePanelContent = sideContentEl?.innerHTML ?? "";

  // Variable para guardar el id de la empresa seleccionada
  // se utiliza principalmente para aplicar o eliminar los estilos de la empresa
  // que se seleccione o se deje de seleccionar.
  let selectedCompanyId = null;

  // Seleccionamos la 'section' que tiene todo el contenido de la página
  // Para lo unico que se usa es pará manejar el evento 'keydown' de la tecla escape
  // para des-seleccionar una determinada empresa
  const pageEl = app.querySelector(".mc-page");

  // Botón para pedir al backend de nuevo las empresas creadas y actualizarlas
  // en el frontend
  const reloadBtn = document.querySelector("[data-mc-reload]");
  
  // Botón para limpiar los filtros de la tabla de las empresas
  const clearBtn = document.querySelector("[data-mc-clear]");
  
  // Caja de texto que escucha el evento 'change' y actualiza la tabla con las empresas
  // que contengan los valores buscados (nombre, ciudad, teléfono o email).
  const searchInput = document.querySelector("[data-mc-search]");

  // Cuerpo de la tabla donde se insertan las empresas
  const tbody = document.querySelector("[data-mc-tbody]");

  // Selects de la tabla de las empresas
  const citySelect = document.querySelector("[data-mc-city]");
  const eventTypeSelect = document.querySelector("[data-mc-event-type]");
  const statusSelect = document.querySelector("[data-mc-status]");

  // Rellenamos los select con los datos llegados del backend
  fillEventTypesSelect(typeOfEvents, eventTypeSelect);
  fillCompaniesTable(tbody, allCompanies);
  fillCitySelect(citySelect, allCompanies);

  // Función que 'desmarca' la empresa seleccionada y actualiza el estilo y el
  // contenido del panel lateral
  function clearSelectedCompany() {
    selectedCompanyId = null;
    setSelectedRow(tbody, null);
    renderSidePanel(sideContentEl, null, defaultSidePanelContent);
  }

  // Función que renderiza/re-renderiza la tabla de las empresas
  // y el panel lateral derecho.
  function repaint() {
    // Obtiene las empresas que contengan los filtros configurados
    // En el primer render no hay filtros por lo que cargan todas las empresas
    const filtered = allCompanies.filter((company) =>
      companyMatchesFilters(company, filters),
    );

    fillCompaniesTable(tbody, filtered); // Rellena la tabla con las empresas filtradas

    // Si no hay ninguna empresa seleccionada
    // renderiza el panel lateral derecho por defecto.
    // Si no tiene empresa seleccionada retorna la función, porque
    // lo siguiente que hace la función es que si hay una empresa seleccionada
    // le cambia el estilo a la fila seleccionada y renderiza el panel con la información
    // de dicha empresa.
    if (selectedCompanyId == null) {
      renderSidePanel(sideContentEl, null, defaultSidePanelContent);
      return;
    }

    // 
    const selectedCompany = filtered.find((company) => company.id === selectedCompanyId);

    if (!selectedCompany) {
      clearSelectedCompany();
      return;
    }

    setSelectedRow(tbody, selectedCompanyId);
    renderSidePanel(sideContentEl, selectedCompany);
  }

  repaint();

  // Listeners que escuchan los eventos que les han sido configurados
  // En cada evento se re-renderiza el contenido de la tabla y del panel lateral
  // con la función 'repaint()'
  searchInput?.addEventListener("input", (e) => {
    filters.q = e.target.value;
    repaint();
  });

  citySelect?.addEventListener("change", (e) => {
    filters.city = e.target.value;
    repaint();
  });

  eventTypeSelect?.addEventListener("change", (e) => {
    filters.eventType = e.target.value;
    repaint();
  });

  statusSelect?.addEventListener("change", (e) => {
    filters.status = e.target.value;
    repaint();
  });

  clearBtn?.addEventListener("click", () => {
    filters.q = "";
    filters.city = "all";
    filters.eventType = "all";
    filters.status = "all";

    if (searchInput) searchInput.value = "";
    if (citySelect) citySelect.value = "all";
    if (eventTypeSelect) eventTypeSelect.value = "all";
    if (statusSelect) statusSelect.value = "all";

    repaint();
  });

  reloadBtn?.addEventListener("click", async () => {
    allCompanies = await fetchAllCompanies();
    fillCitySelect(citySelect, allCompanies);
    repaint();
  });

  pageEl?.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || selectedCompanyId == null) return;
    e.preventDefault();
    clearSelectedCompany();
  });

  tbody.addEventListener("click", (e) => {
    if (e.target.closest("a[data-link]")) return;

    const row = e.target.closest("tr[data-mc-row]");
    if (!row) return;

    const id = Number(row.dataset.id);
    if (!Number.isFinite(id)) return;

    if (selectedCompanyId === id) {
      clearSelectedCompany();
      return;
    }

    selectedCompanyId = id;
    setSelectedRow(tbody, id);

    const company = allCompanies.find((item) => item.id === id);
    renderSidePanel(sideContentEl, company);
  });

  tbody.addEventListener("keydown", (e) => {
    const row = e.target.closest("tr[data-mc-row]");
    if (!row) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      const id = Number(row.dataset.id);
      if (!Number.isFinite(id)) return;

      if (selectedCompanyId === id) {
        clearSelectedCompany();
        return;
      }

      selectedCompanyId = id;
      setSelectedRow(tbody, id);

      const company = allCompanies.find((item) => item.id === id);
      renderSidePanel(sideContentEl, company);
    }
  });
}
