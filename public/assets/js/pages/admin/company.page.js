import {
  fetchCompanyEvents,
  fetchCompanyWithId,
} from "../../fetch/companies.fetch.js";
import { redirectTo } from "../../utils.js";

export async function renderAdminCompanyPage({ app }) {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return redirectTo("/admin");

  const btnBack = `
    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
      <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
      <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
    </svg>
  `;

  // UI “loading”
  app.innerHTML = `
    <section class="company-page">
      <header class="company-header">
        <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${btnBack}</a>
        <div class="company-header__text">
          <p class="company-kicker">Admin · Empresas</p>
          <h1 class="company-title">Cargando empresa…</h1>
        </div>
      </header>

      <div class="company-grid">
        <article class="card">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line"></div>
        </article>

        <article class="card">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line"></div>
        </article>
      </div>
    </section>
  `;

  // Cargar datos
  const companyData = await fetchCompanyWithId(id);

  if (!companyData) {
    app.innerHTML = `
      <section class="company-page">
        <header class="company-header">
          <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${btnBack}</a>
          <div class="company-header__text">
            <p class="company-kicker">Admin · Empresas</p>
            <h1 class="company-title">No encontrada</h1>
            <p class="company-subtitle">No se pudieron cargar los datos de la empresa con id <strong>${id}</strong>.</p>
          </div>
        </header>

        <article class="card card--error">
          <h2 class="card-title">¿Qué puedes hacer?</h2>
          <ul class="list">
            <li>Volver al panel y recargar empresas.</li>
            <li>Revisar que el id exista y que la API responda.</li>
          </ul>

          <div class="actions">
            <a class="btn" href="/admin" data-link>Volver al panel</a>
          </div>
        </article>
      </section>
    `;
    return;
  }

  const companyEvents = await fetchCompanyEvents(id);

  // Render final
  const safe = (v) =>
    v === null || v === undefined || v === "" ? "—" : String(v);

  function renderEventsHtml(events) {
    if (!Array.isArray(events) || events.length === 0) {
      return `<p class="muted">Esta empresa no tiene eventos.</p>`;
    }

    return events
      .map(
        (ev) => `
    <div class="event-item">
      <div class="event-info">
        <p class="event-name">${safe(ev.name)}</p>
        <p class="event-meta">
          📍 ${safe(ev.place)} · 📅 ${safe(ev.date)} · 🕒 ${String(ev.hour ?? "—").slice(0, 5)}
        </p>
      </div>

      <div class="event-actions">
        <button class="btn btn--primary btn--small" data-event-edit="${safe(ev.id)}">Editar</button>
        <button class="btn btn--danger btn--small" data-event-delete="${safe(ev.id)}">Eliminar</button>
      </div>
    </div>
  `,
      )
      .join("");
  }

  app.innerHTML = `
    <section class="company-page">
      <div class="company-header">
        <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${btnBack}</a>

        <div class="company-header__text">
          <p class="company-kicker">Admin · Empresas</p>
          <h1 class="company-title">${safe(companyData.name)}</h1>
          <p class="company-subtitle">ID: <strong>${safe(companyData.id)}</strong> · Ciudad: <strong>${safe(companyData.city)}</strong></p>
        </div>

        <div class="company-header__right">
          <span class="badge">Activa</span>
        </div>
      </div>

      <div class="company-grid">
        <article class="card">
          <h2 class="card-title">Información</h2>

          <dl class="kv">
            <div class="kv-row">
              <dt>Nombre</dt>
              <dd>${safe(companyData.name)}</dd>
            </div>

            <div class="kv-row">
              <dt>Ciudad</dt>
              <dd>${safe(companyData.city)}</dd>
            </div>

            <div class="kv-row">
              <dt>Año de creación</dt>
              <dd>${safe(companyData.creation_year)}</dd>
            </div>
          </dl>
        </article>

        <article class="card">
          <h2 class="card-title">Contacto</h2>

          <dl class="kv">
            <div class="kv-row">
              <dt>Email responsable</dt>
              <dd>
                <a class="link" href="mailto:${encodeURIComponent(companyData.email_person_in_charge)}">
                  ${safe(companyData.email_person_in_charge)}
                </a>
              </dd>
            </div>

            <div class="kv-row">
              <dt>Teléfono responsable</dt>
              <dd>
                <a class="link" href="tel:${safe(companyData.number_person_in_charge)}">
                  ${safe(companyData.number_person_in_charge)}
                </a>
              </dd>
            </div>
          </dl>
        </article>

        <article class="card card--wide">
            <h2 class="card-title">Eventos</h2>

            <div class="events-list" id="events-list">
                ${renderEventsHtml(companyEvents)}
            </div>
        </article>

        <article class="card card--wide">
          <h2 class="card-title">Acciones</h2>
          <p>Botones para editar o eliminar esta empresa</p>
          <small>Si la empresa tiene algún evento, esta no puede ser eliminada</small>

          <div class="actions">
            <button class="btn btn--primary" id="btn-edit" type="button">Editar</button>
            <button class="btn btn--danger" id="btn-delete" type="button">Eliminar</button>
          </div>
        </article>
      </div>
    </section>
  `;

  // Navegación (tu SPA ya intercepta data-link, esto es extra por si acaso)
  const backLink = document.getElementById("back-link");
  backLink?.addEventListener("click", (e) => {
    e.preventDefault();
    redirectTo("/admin");
  });

  // Hooks para más adelante (modal)
  document.getElementById("btn-edit")?.addEventListener("click", () => {
    console.log("EDIT company", companyData.id);
  });

  document.getElementById("btn-delete")?.addEventListener("click", () => {
    console.log("DELETE company", companyData.id);
  });
}
