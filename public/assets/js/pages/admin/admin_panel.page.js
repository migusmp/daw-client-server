import { fetchAllUsers } from "../../fetch/admin.fetch.js";
import { fetchAllCompanies } from "../../fetch/companies.fetch.js";
import { appState } from "../../state.js";
import { redirectTo, renderHeaderLinks } from "../../utils.js";

export async function renderAdminPanel({ app, headerNav }) {
  const { user } = appState.getState();

  if (user?.role !== "ADMIN" || user === null) {
    return redirectTo("/");
  }

  const routes =
    user?.role === "ADMIN"
      ? [
          { path: "/", aName: "Inicio" },
          { path: "/admin", aName: "Administración" },
        ]
      : [{ path: "/", aName: "Inicio" }];

  renderHeaderLinks(headerNav, routes);

  app.innerHTML = `
    <section class="home-page">
      <article class="home-hero reveal">
        <p class="home-kicker">Administración</p>
        <h1 class="home-title">Panel de administración</h1>
        <p class="home-subtitle">Gestiona recursos y configuración del portal desde este panel.</p>
      </article>
    </section>
    
    <section class="users-resume">
      <div class="stat-users-registered" data-stat-users-registered>
        <strong>Usuarios registrados</strong>
        <span data-users-registered>-</span>
      </div>
      <div class="stat-admin-users-registered" data-stat-admin-users-registered>
        <strong>Administradores registrados</strong>
        <span data-admin-users-registered>-</span>
      </div>
    </section>

    <section class="companies-section" data-companies-section>
      <div class="companies-section__head">
        <div class="companies-section__titles">
          <p class="companies-section__kicker">Directorio</p>
          <h2 class="companies-section__title">Empresas registradas</h2>
          <p class="companies-section__subtitle">Accede al detalle de cada empresa y continúa su gestión.</p>
        </div>
        <span class="companies-section__count" data-companies-count>0 empresas</span>
      </div>

      <div class="companies-grid" data-companies-grid>
        <p class="companies-empty">Cargando empresas...</p>
      </div>
    </section>
  `;
  const usersRegistered = document.querySelector("[data-users-registered]");
  const adminUsersRegistered = document.querySelector(
    "[data-admin-users-registered]",
  );

  const companiesCount = document.querySelector("[data-companies-count]");
  const companiesGrid = document.querySelector("[data-companies-grid]");

  // Obtenemos los usuarios de la bbdd
  const users = await fetchAllUsers();
  const companies = await fetchAllCompanies();
  const usersList = Array.isArray(users) ? users : [];
  const companiesList = Array.isArray(companies) ? companies : [];

  if (usersRegistered) usersRegistered.textContent = usersList.length;
  if (adminUsersRegistered)
    adminUsersRegistered.textContent = usersList.filter(
      (u) => u.role === "ADMIN",
    ).length;

  if (companiesCount) {
    const total = companiesList.length;
    companiesCount.textContent = `${total} empresa${total === 1 ? "" : "s"}`;
  }

  if (!companiesGrid) return;
  companiesGrid.innerHTML = "";

  if (companiesList.length === 0) {
    const empty = document.createElement("p");
    empty.className = "companies-empty";
    empty.textContent = "No hay empresas registradas todavía.";
    companiesGrid.append(empty);
    return;
  }

  companiesList.forEach((company) => {
    renderCompanyCard(companiesGrid, company);
  });
}

function renderCompanyCard(renderDiv, company) {
  if (!company) return;

  const link = document.createElement("a");
  link.className = "company-card";
  link.href = `/admin/company?id=${encodeURIComponent(company.id)}`;
  link.setAttribute("data-link", "");
  link.setAttribute("aria-label", `Abrir detalle de ${company.name}`);

  const cardHead = document.createElement("div");
  cardHead.className = "company-card__head";

  const cta = document.createElement("span");
  cta.className = "company-card__cta";
  cta.textContent = "Abrir";

  const h3 = document.createElement("h3");
  h3.className = "company-card__name";
  h3.textContent = company.name;

  const meta = document.createElement("dl");
  meta.className = "company-card__meta";

  const cityItem = document.createElement("div");
  cityItem.className = "company-card__meta-item";
  const cityLabel = document.createElement("dt");
  cityLabel.textContent = "Ciudad";
  const cityValue = document.createElement("dd");
  cityValue.textContent = company.city;
  cityItem.append(cityLabel, cityValue);

  const yearItem = document.createElement("div");
  yearItem.className = "company-card__meta-item";
  const yearLabel = document.createElement("dt");
  yearLabel.textContent = "Fundación";
  const yearValue = document.createElement("dd");
  yearValue.textContent = String(company.creation_year);
  yearItem.append(yearLabel, yearValue);

  meta.append(cityItem, yearItem);
  cardHead.append(h3, cta);
  link.append(cardHead, meta);
  renderDiv.append(link);
}
