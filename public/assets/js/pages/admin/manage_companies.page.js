import { fetchAllCompanies } from "../../fetch/companies.fetch.js";
import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";
import { fetchEventTypes } from "./company/company.helpers.js";

const COMPANY_LINK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#000" class="bi bi-link-45deg" viewBox="0 0 16 16">
  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
  <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
</svg>`;

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

  const typeOfEvents = await fetchEventTypes();
  let allCompanies = await fetchAllCompanies();
  console.log(allCompanies);

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

            <!-- ✅ dos botones -->
            <div class="mc-head-actions">
              <button class="mc-btn" type="button" data-mc-reload>Recargar</button>
              <button class="mc-btn" type="button" data-mc-clear>Limpiar filtros</button>
            </div>
          </header>

          <div class="mc-filters">
            <label class="mc-field">
              <span>Buscar</span>
              <input class="mc-input" data-mc-search type="search" placeholder="Nombre, ciudad, email o teléfono" />
            </label>

            <label class="mc-field">
              <span>Ciudad</span>
              <select class="mc-select" data-mc-city>
                <option value="all">Todas</option>
                <option value="Albacete">Albacete</option>
                <option value="Madrid">Madrid</option>
                <option value="Valencia">Valencia</option>
              </select>
            </label>

            <label class="mc-field">
              <span>Tipo de evento</span>
              <select class="mc-select" data-mc-event-type>
                <option value="all">Todos</option>
              </select>
            </label>

            <label class="mc-field">
              <span>Estado</span>
              <select class="mc-select" data-mc-status>
                <option value="all">Todos</option>
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
                  <th>Enlace</th>
                </tr>
              </thead>

              <tbody data-mc-tbody>
                <!-- Fila 1 -->
                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="1"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">AreaProject</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 1</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">contacto@areaproject.es</span>
                      <span class="mc-contact__phone">+34 967 000 111</span>
                    </div>
                  </td>
                </tr>

                <!-- Fila 2 (seleccionada de ejemplo) -->
                <tr
                  class="mc-row is-selected"
                  data-mc-row
                  data-id="2"
                  tabindex="0"
                  aria-selected="true"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--warn"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Concilia2</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--warn">Incompleta</span>
                          <span class="mc-muted">ID: 2</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">info@concilia2.es</span>
                      <span class="mc-contact__phone">—</span>
                    </div>
                  </td>
                </tr>

                <!-- Fila 3 -->
                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="3"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Devaim</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 3</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Valencia</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">rrhh@devaim.com</span>
                      <span class="mc-contact__phone">+34 960 222 333</span>
                    </div>
                  </td>
                </tr>

                <!-- Fila 4 -->
                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="4"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--warn"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">NorteLabs</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--warn">Incompleta</span>
                          <span class="mc-muted">ID: 4</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Madrid</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">hola@nortelabs.dev</span>
                      <span class="mc-contact__phone">+34 910 444 555</span>
                    </div>
                  </td>
                </tr>

                <!-- Fila 5 -->
                <tr
                  class="mc-row"
                  data-mc-row
                  data-id="5"
                  tabindex="0"
                  aria-selected="false"
                  title="Click para ver detalle"
                >
                  <td>
                    <div class="mc-company">
                      <span class="mc-dot mc-dot--ok"></span>
                      <div class="mc-company__meta">
                        <div class="mc-company__name">Feria Events</div>
                        <div class="mc-company__sub">
                          <span class="mc-pill mc-pill--ok">Completa</span>
                          <span class="mc-muted">ID: 5</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span class="mc-city">Albacete</span></td>
                  <td>
                    <div class="mc-contact">
                      <span class="mc-contact__email">eventos@feriaevents.es</span>
                      <span class="mc-contact__phone">+34 967 888 999</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <aside class="mc-card mc-card--side">
          <header>
            <h2 class="mc-card__title">Detalle</h2>
            <p class="mc-card__subtitle">Acciones disponibles para la empresa seleccionada.</p>
          </header>

          <div data-mc-side>
            <!-- Panel lateral de ejemplo (Concilia2 seleccionada) -->
            <div class="mc-side">
              <section class="mc-side__company">
                <div class="mc-side__company-left">
                  <div class="mc-side__name">Concilia2</div>
                  <div class="mc-side__meta">ID: 2</div>
                </div>
                <span class="mc-pill mc-pill--warn">Incompleta</span>
              </section>

              <section class="mc-side__grid">
                <article class="mc-kv">
                  <div class="mc-kv__label">Ciudad</div>
                  <div class="mc-kv__value">Albacete</div>
                </article>

                <article class="mc-kv">
                  <div class="mc-kv__label">Email</div>
                  <div class="mc-kv__value mc-kv__mono">info@concilia2.es</div>
                </article>

                <article class="mc-kv">
                  <div class="mc-kv__label">Teléfono</div>
                  <div class="mc-kv__value">—</div>
                </article>

                <article class="mc-kv">
                  <div class="mc-kv__label">Estado</div>
                  <div class="mc-kv__value">Incompleta</div>
                </article>
              </section>

              <div class="mc-side__divider"></div>

              <section class="mc-side__actions">
                <button class="mc-btn mc-btn--primary mc-btn--wide" type="button" data-side-action="edit" data-id="2">
                  Editar
                </button>
                <button class="mc-btn mc-btn--danger mc-btn--wide" type="button" data-side-action="delete" data-id="2">
                  Eliminar
                </button>
              </section>

              <div class="mc-side__note">
                <strong>Demo:</strong> más adelante aquí meterás el formulario real conectado al backend.
              </div>
            </div>
          </div>
        </aside>
      </section>
    </section>
  `;

  const filters = {
    q: "",
    city: "all",
    eventType: "all",
    status: "all",
  };

  const reloadBtn = document.querySelector("[data-mc-reload]");
  const clearBtn = document.querySelector("[data-mc-clear]");
  const searchInput = document.querySelector("[data-mc-search]");
  // Rellenamos los select de los filtros
  const eventTypeSelect = document.querySelector("[data-mc-event-type]");
  fillEventTypesSelect(typeOfEvents, eventTypeSelect);

  const tbody = document.querySelector("[data-mc-tbody]");
  fillCompaniesTable(tbody, allCompanies);

  const citySelect = document.querySelector("[data-mc-city]");
  fillCitySelect(citySelect, allCompanies);

  const statusSelect = document.querySelector("[data-mc-status]");

  function companyMatchesFilters(c) {
    // 1) Buscar
    const q = normalize(filters.q);
    if (q) {
      const haystack = normalize(
        `${c.name} ${c.city} ${c.email_person_in_charge} ${c.number_person_in_charge}`,
      );
      if (!haystack.includes(q)) return false;
    }

    // 2) Ciudad
    if (filters.city !== "all") {
      if (normalize(c.city) !== normalize(filters.city)) return false;
    }

    // 3) Tipo de evento ✅
    if (filters.eventType !== "all") {
      if (!companyHasEventType(c, filters.eventType)) return false;
    }

    // 4) Estado
    if (filters.status !== "all") {
      const complete = isCompanyComplete(c);
      if (filters.status === "Completos" && !complete) return false;
      if (filters.status === "Incompletos" && complete) return false;
    }

    return true;
  }

  function getFilteredCompanies() {
    return allCompanies.filter(companyMatchesFilters);
  }

  function repaint() {
    const filtered = getFilteredCompanies();
    fillCompaniesTable(tbody, filtered);
  }

  repaint();

  // Listeners
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

  // Limpiar filtros
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

  // Recargar
  reloadBtn?.addEventListener("click", async () => {
    allCompanies = await fetchAllCompanies();
    fillCitySelect(citySelect, allCompanies);
    repaint();
  });
}

function companyHasEventType(c, eventTypeId) {
  if (eventTypeId === "all") return true;

  const list = c?.event_type;
  if (!Array.isArray(list) || list.length === 0) return false;

  return list.some((t) => String(t.id) === String(eventTypeId));
}

function normalize(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

function fillCitySelect(citySelect, companies) {
  if (!Array.isArray(companies)) return;

  citySelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Todas";
  citySelect.append(allOption);

  const cities = [
    ...new Set(
      companies
        .map((c) => {
          return c.city;
        })
        .join(" ")
        .split(" "),
    ),
  ];

  cities.forEach((c) => {
    const option = document.createElement("option");
    option.value = c;
    option.textContent = c;
    citySelect.append(option);
  });
}

function isCompanyComplete(c) {
  const hasId = c?.id != null;

  const hasName = (c?.name ?? "").trim() !== "";
  const hasCity = (c?.city ?? "").trim() !== "";
  const hasYear = String(c?.creation_year ?? "").trim() !== "";
  const hasEmail = (c?.email_person_in_charge ?? "").trim() !== "";
  const hasPhone = (c?.number_person_in_charge ?? "").trim() !== "";

  return hasId && hasName && hasCity && hasYear && hasEmail && hasPhone;
}

function fillCompaniesTable(tbody, companies) {
  if (!Array.isArray(companies)) return;

  // Limpia antes de pintar (si repintas)
  tbody.innerHTML = "";

  companies.forEach((c) => {
    const tr = document.createElement("tr");
    tr.className = "mc-row";
    tr.setAttribute("data-mc-row", "");
    tr.dataset.id = String(c.id);
    tr.tabIndex = 0;
    tr.setAttribute("aria-selected", "false");
    tr.title = "Click para ver detalle";

    /* --- COMPLETO / INCOMPLETO (ajústalo a tu criterio real) --- */
    const complete = isCompanyComplete(c);

    const dotClass = complete ? "mc-dot--ok" : "mc-dot--warn";
    const pillClass = complete ? "mc-pill--ok" : "mc-pill--warn";
    const pillText = complete ? "Completa" : "Incompleta";

    /* --- TD: Empresa --- */
    const tdCompany = document.createElement("td");

    const companyDiv = document.createElement("div");
    companyDiv.className = "mc-company";

    const dot = document.createElement("span");
    dot.className = `mc-dot ${dotClass}`;

    const meta = document.createElement("div");
    meta.className = "mc-company__meta";

    const name = document.createElement("div");
    name.className = "mc-company__name";
    name.textContent = c.name;

    const sub = document.createElement("div");
    sub.className = "mc-company__sub";

    const pill = document.createElement("span");
    pill.className = `mc-pill ${pillClass}`;
    pill.textContent = pillText;

    const muted = document.createElement("span");
    muted.className = "mc-muted";
    muted.textContent = `ID: ${c.id}`;

    sub.append(pill, muted);
    meta.append(name, sub);
    companyDiv.append(dot, meta);
    tdCompany.append(companyDiv);

    /* --- TD: Ciudad --- */
    const tdCity = document.createElement("td");
    const spanCity = document.createElement("span");
    spanCity.className = "mc-city";
    spanCity.textContent = c.city ?? "—";
    tdCity.append(spanCity);

    /* --- TD: Contacto --- */
    const tdContact = document.createElement("td");
    const contact = document.createElement("div");
    contact.className = "mc-contact";

    const email = document.createElement("span");
    email.className = "mc-contact__email";
    email.textContent = c.email_person_in_charge ?? c.email ?? "—";

    const phone = document.createElement("span");
    phone.className = "mc-contact__phone";
    phone.textContent = c.number_person_in_charge || c.phone || "—";

    contact.append(email, phone);
    tdContact.append(contact);

    /* --- TD: Perfil --- */
    const tdProfile = document.createElement("td");
    const linkProfile = document.createElement("a");
    linkProfile.href = `/admin/company?id=${c.id}`;
    linkProfile.dataset.link = "";
    linkProfile.innerHTML = COMPANY_LINK_SVG;
    
    tdProfile.append(linkProfile);

    tr.append(tdCompany, tdCity, tdContact, tdProfile);

    // ✅ IMPORTANTE: al tbody
    tbody.append(tr);
  });
}

function fillEventTypesSelect(eventsType, select) {
  if (!Array.isArray(eventsType)) return;

  eventsType.forEach((e) => {
    const option = document.createElement("option");
    option.value = e.id;
    e.nombre = e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1);
    option.textContent = e.nombre;

    select.append(option);
  });
}
