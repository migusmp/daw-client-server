import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";

const mockCompanies = [
  { id: 1, name: "AreaProject", city: "Albacete", email: "contacto@areaproject.es", phone: "+34 967 000 111", status: "COMPLETE" },
  { id: 2, name: "Concilia2", city: "Albacete", email: "info@concilia2.es", phone: "", status: "INCOMPLETE" },
  { id: 3, name: "Devaim", city: "Valencia", email: "rrhh@devaim.com", phone: "+34 960 222 333", status: "COMPLETE" },
  { id: 4, name: "NorteLabs", city: "Madrid", email: "hola@nortelabs.dev", phone: "+34 910 444 555", status: "INCOMPLETE" },
  { id: 5, name: "Feria Events", city: "Albacete", email: "eventos@feriaevents.es", phone: "+34 967 888 999", status: "COMPLETE" },
];

function normalize(s) {
  return String(s ?? "").trim().toLowerCase();
}

function companyMatchesFilters(company, { q, city, status }) {
  const qn = normalize(q);
  const cityN = normalize(city);
  const statusN = normalize(status);

  const haystack = normalize(`${company.name} ${company.city} ${company.email} ${company.phone}`);

  const matchQ = !qn || haystack.includes(qn);
  const matchCity = !cityN || cityN === "todas" || normalize(company.city) === cityN;
  const matchStatus =
    !statusN ||
    statusN === "todos" ||
    (statusN === "completos" && company.status === "COMPLETE") ||
    (statusN === "incompletos" && company.status === "INCOMPLETE");

  return matchQ && matchCity && matchStatus;
}

function uniqueCities(companies) {
  const set = new Set();
  for (const c of companies) set.add(c.city);
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}

function renderCitiesSelect(selectEl, companies) {
  const cities = uniqueCities(companies);

  selectEl.innerHTML = `
    <option value="Todas">Todas</option>
    ${cities.map((c) => `<option value="${c}">${c}</option>`).join("")}
  `;
}

function renderTableRows(tbody, companies, selectedId) {
  if (!companies.length) {
    tbody.innerHTML = `
      <tr>
        <td class="mc-table__status" colspan="3">No hay resultados con esos filtros.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = companies
    .map((c) => {
      const isComplete = c.status === "COMPLETE";
      const pillClass = isComplete ? "mc-pill mc-pill--ok" : "mc-pill mc-pill--warn";
      const pillText = isComplete ? "Completa" : "Incompleta";
      const isSelected = selectedId === c.id;

      return `
        <tr
          class="mc-row ${isSelected ? "is-selected" : ""}"
          data-mc-row
          data-id="${c.id}"
          tabindex="0"
          aria-selected="${isSelected ? "true" : "false"}"
          title="Click para ver detalle"
        >
          <td>
            <div class="mc-company">
              <span class="mc-dot ${isComplete ? "mc-dot--ok" : "mc-dot--warn"}"></span>
              <div class="mc-company__meta">
                <div class="mc-company__name">${c.name}</div>
                <div class="mc-company__sub">
                  <span class="${pillClass}">${pillText}</span>
                  <span class="mc-muted">ID: ${c.id}</span>
                </div>
              </div>
            </div>
          </td>

          <td>
            <span class="mc-city">${c.city}</span>
          </td>

          <td>
            <div class="mc-contact">
              <span class="mc-contact__email">${c.email}</span>
              <span class="mc-contact__phone">${c.phone || "—"}</span>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderSidePanel(sideEl, company) {
  if (!company) {
    sideEl.innerHTML = `
      <div class="mc-side-empty">
        <div class="mc-side-empty__icon">i</div>
        <div class="mc-side-empty__title">Sin empresa seleccionada</div>
        <div class="mc-side-empty__text">Selecciona una fila de la tabla para ver el detalle aquí.</div>
      </div>
    `;
    return;
  }

  const isComplete = company.status === "COMPLETE";
  const statusClass = isComplete ? "mc-pill--ok" : "mc-pill--warn";
  const statusText = isComplete ? "Completa" : "Incompleta";

  sideEl.innerHTML = `
    <div class="mc-side">

      <section class="mc-side__company">
        <div class="mc-side__company-left">
          <div class="mc-side__name">${company.name}</div>
          <div class="mc-side__meta">ID: ${company.id}</div>
        </div>
        <span class="mc-pill ${statusClass}">${statusText}</span>
      </section>

      <section class="mc-side__grid">
        <article class="mc-kv">
          <div class="mc-kv__label">Ciudad</div>
          <div class="mc-kv__value">${company.city}</div>
        </article>

        <article class="mc-kv">
          <div class="mc-kv__label">Email</div>
          <div class="mc-kv__value mc-kv__mono">${company.email}</div>
        </article>

        <article class="mc-kv">
          <div class="mc-kv__label">Teléfono</div>
          <div class="mc-kv__value">${company.phone || "—"}</div>
        </article>

        <article class="mc-kv">
          <div class="mc-kv__label">Estado</div>
          <div class="mc-kv__value">${statusText}</div>
        </article>
      </section>

      <div class="mc-side__divider"></div>

      <section class="mc-side__actions">
        <button class="mc-btn mc-btn--primary mc-btn--wide" type="button" data-side-action="edit" data-id="${company.id}">
          Editar
        </button>
        <button class="mc-btn mc-btn--danger mc-btn--wide" type="button" data-side-action="delete" data-id="${company.id}">
          Eliminar
        </button>
      </section>

      <div class="mc-side__note">
        <strong>Demo:</strong> más adelante aquí meterás el formulario real conectado al backend.
      </div>
    </div>
  `;
}

export async function renderManageCompaniesPage({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  renderHeaderLinks(headerNav, [
    { path: "/", aName: "Inicio" },
    { path: "/admin", aName: "Administración" },
    { path: "/admin/manage-companies", aName: "Gestión empresas" },
  ]);

  app.innerHTML = `
    <section class="mc-page">
      <article class="mc-hero reveal">
        <p class="mc-kicker">Administración</p>
        <h1 class="mc-title">Gestión de empresas</h1>
        <p class="mc-subtitle">Selecciona una empresa en la tabla para ver su detalle y gestionarla.</p>

        <div class="mc-hero-actions">
          <a class="mc-btn" href="/admin" data-link>Volver al panel</a>
          <button class="mc-btn mc-btn--primary" type="button" data-mc-new>Nueva empresa</button>
        </div>
      </article>

      <section class="mc-layout">
        <article class="mc-card mc-card--main">
          <header class="mc-card__head">
            <div>
              <h2 class="mc-card__title">Listado de empresas</h2>
              <p class="mc-card__subtitle">Tip: haz click en una fila (o Enter) para abrir el detalle.</p>
            </div>
            <button class="mc-btn" type="button" data-mc-reload>Recargar</button>
          </header>

          <div class="mc-filters">
            <label class="mc-field">
              <span>Buscar</span>
              <input class="mc-input" data-mc-search type="search" placeholder="Nombre, ciudad, email o teléfono" />
            </label>

            <label class="mc-field">
              <span>Ciudad</span>
              <select class="mc-select" data-mc-city></select>
            </label>

            <label class="mc-field">
              <span>Estado</span>
              <select class="mc-select" data-mc-status>
                <option value="Todos">Todos</option>
                <option value="Completos">Completos</option>
                <option value="Incompletos">Incompletos</option>
              </select>
            </label>
          </div>

          <div class="mc-table-wrap">
            <table class="mc-table" aria-label="Tabla de empresas">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Ciudad</th>
                  <th>Contacto</th>
                </tr>
              </thead>
              <tbody data-mc-tbody></tbody>
            </table>
          </div>
        </article>

        <aside class="mc-card mc-card--side">
          <h2 class="mc-card__title">Detalle</h2>
          <p class="mc-card__subtitle">Acciones disponibles para la empresa seleccionada.</p>
          <div data-mc-side></div>
        </aside>
      </section>
    </section>
  `;

  // Estado local
  const filters = { q: "", city: "Todas", status: "Todos" };
  let selectedId = null;

  // Selectores
  const searchInput = app.querySelector("[data-mc-search]");
  const citySelect = app.querySelector("[data-mc-city]");
  const statusSelect = app.querySelector("[data-mc-status]");
  const tbody = app.querySelector("[data-mc-tbody]");
  const side = app.querySelector("[data-mc-side]");
  const reloadBtn = app.querySelector("[data-mc-reload]");
  const newBtn = app.querySelector("[data-mc-new]");

  renderCitiesSelect(citySelect, mockCompanies);

  function getFilteredCompanies() {
    return mockCompanies.filter((c) => companyMatchesFilters(c, filters));
  }

  function repaint() {
    const filtered = getFilteredCompanies();
    renderTableRows(tbody, filtered, selectedId);

    const selected = mockCompanies.find((c) => c.id === selectedId) || null;
    renderSidePanel(side, selected);
  }

  repaint();

  // Filtros
  searchInput.addEventListener("input", (e) => {
    filters.q = e.target.value;
    repaint();
  });

  citySelect.addEventListener("change", (e) => {
    filters.city = e.target.value;
    repaint();
  });

  statusSelect.addEventListener("change", (e) => {
    filters.status = e.target.value;
    repaint();
  });

  // Recargar (reset)
  reloadBtn.addEventListener("click", () => {
    filters.q = "";
    filters.city = "Todas";
    filters.status = "Todos";
    selectedId = null;

    searchInput.value = "";
    citySelect.value = "Todas";
    statusSelect.value = "Todos";

    repaint();
  });

  // Nueva empresa (demo)
  newBtn.addEventListener("click", () => {
    alert("Demo: aquí abrirías el formulario para crear empresa.");
  });

  // Selección por click en la fila
  tbody.addEventListener("click", (e) => {
    const row = e.target.closest("[data-mc-row]");
    if (!row) return;
    selectedId = Number(row.dataset.id);
    repaint();
  });

  // Selección por teclado (Enter / Space)
  tbody.addEventListener("keydown", (e) => {
    const row = e.target.closest("[data-mc-row]");
    if (!row) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectedId = Number(row.dataset.id);
      repaint();
    }
  });

  // Acciones en panel lateral
  side.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-side-action]");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.sideAction;

    if (action === "edit") alert(`Demo: editar (panel) empresa ID ${id}`);
    if (action === "delete") {
      const ok = confirm(`¿Seguro que quieres eliminar la empresa ID ${id}? (demo)`);
      if (ok) alert(`Demo: eliminar (panel) empresa ID ${id}`);
    }
  });
}
