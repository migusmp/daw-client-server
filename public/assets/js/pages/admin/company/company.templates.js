import { safe, safeAttr } from "./company.helpers.js";

const BACK_BUTTON_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
    <path fill-rule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
    <path fill-rule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
  </svg>
`;

export function renderCompanyLoadingHtml() {
  return `
    <section class="company-page">
      <header class="company-header">
        <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${BACK_BUTTON_SVG}</a>
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
}

export function renderCompanyNotFoundHtml({ id }) {
  return `
    <section class="company-page">
      <header class="company-header">
        <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${BACK_BUTTON_SVG}</a>
        <div class="company-header__text">
          <p class="company-kicker">Admin · Empresas</p>
          <h1 class="company-title">No encontrada</h1>
          <p class="company-subtitle">No se pudieron cargar los datos de la empresa con id <strong>${safe(id)}</strong>.</p>
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
}

function formatPrice(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return safe(value);

  return numeric.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
  });
}

function renderEventsHtml(events, eventTypesById = new Map()) {
  if (!Array.isArray(events) || events.length === 0) {
    return `<p class="muted events-empty">Esta empresa no tiene eventos por ahora.</p>`;
  }

  return events
    .map((event) => {
      const eventTypeId = event.id_event_type ?? "—";
      const eventTypeName = eventTypesById.get(String(eventTypeId)) || "Sin tipo";
      const posterValue = String(event.poster_image ?? "").trim();
      const hasPoster = posterValue !== "";
      const posterUrl = hasPoster && /^https?:\/\//i.test(posterValue)
        ? posterValue
        : `/${posterValue.replace(/^\/+/, "")}`;

      return `
        <div class="event-item">
          <div class="event-media">
            ${
              hasPoster
                ? `
                  <a class="event-poster-link" href="${safeAttr(posterUrl)}" target="_blank" rel="noopener noreferrer">
                    <img class="event-poster-img" src="${safeAttr(posterUrl)}" alt="Póster de ${safeAttr(event.name)}" loading="lazy" />
                  </a>
                `
                : `
                  <div class="event-poster-placeholder" aria-hidden="true">
                    <span>Sin imagen</span>
                  </div>
                `
            }
          </div>

          <div class="event-content">
            <div class="event-head">
              <p class="event-name">${safe(event.name)}</p>
              <p class="event-meta">
                <span class="event-chip">Tipo: ${safe(eventTypeName)}</span>
                <span class="event-chip">Lugar: ${safe(event.place)}</span>
                <span class="event-chip">Fecha: ${safe(event.date)}</span>
                <span class="event-chip">Hora: ${String(event.hour ?? "—").slice(0, 5)}</span>
                <span class="event-chip">Precio: ${formatPrice(event.price)}</span>
                <span class="event-chip">Aforo: ${safe(event.maximun_capacity)}</span>
              </p>
            </div>

            <div class="event-footer">
              <p class="event-extra">
                <span class="event-extra__label">Imagen:</span>
                ${
                  hasPoster
                    ? `<a class="event-extra__link" href="${safeAttr(posterUrl)}" target="_blank" rel="noopener noreferrer">Ver imagen completa</a>`
                    : `<span class="event-extra__empty">Sin imagen</span>`
                }
              </p>

              <div class="event-actions">
                <button class="btn btn--primary btn--small" data-event-edit="${safe(event.id)}">Editar</button>
                <button class="btn btn--danger btn--small" data-event-delete="${safe(event.id)}">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderCompanyEditModalHtml(companyData) {
  return `
    <div class="company-modal" id="company-edit-modal" aria-hidden="true">
      <div class="company-modal__backdrop" data-company-modal-close></div>
      <div class="company-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="company-edit-title">
        <header class="company-modal__header">
          <div>
            <p class="company-modal__kicker">Empresa</p>
            <h3 class="company-modal__title" id="company-edit-title">Editar empresa</h3>
            <p class="company-modal__subtitle">Actualiza la información principal de esta empresa.</p>
          </div>

          <button class="company-modal__icon-btn" type="button" data-company-modal-close aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>
        </header>

        <form class="company-modal__form" id="company-edit-form" autocomplete="off">
          <input type="hidden" name="id" value="${safeAttr(companyData.id)}" />

          <div class="company-modal__grid">
            <label class="company-modal__field">
              <span>Nombre</span>
              <input type="text" name="name" value="${safeAttr(companyData.name)}" required />
            </label>

            <label class="company-modal__field">
              <span>Ciudad</span>
              <input type="text" name="city" value="${safeAttr(companyData.city)}" required />
            </label>

            <label class="company-modal__field">
              <span>Año de creación</span>
              <input type="number" name="creation_year" min="1800" max="2100" value="${safeAttr(companyData.creation_year)}" required />
            </label>

            <label class="company-modal__field">
              <span>Email responsable</span>
              <input type="email" name="contact_email" value="${safeAttr(companyData.email_person_in_charge)}" required />
            </label>

            <label class="company-modal__field company-modal__field--full">
              <span>Teléfono responsable</span>
              <input type="tel" name="contact_number" value="${safeAttr(companyData.number_person_in_charge)}" required />
            </label>
          </div>

          <p class="company-modal__status" id="company-edit-status" aria-live="polite"></p>

          <footer class="company-modal__footer">
            <button class="btn" type="button" data-company-modal-close>Cancelar</button>
            <button class="btn btn--primary" id="company-edit-submit" type="submit">Guardar cambios</button>
          </footer>
        </form>
      </div>
    </div>
  `;
}

function renderEventEditModalHtml(eventTypes) {
  const eventTypeOptionsHtml = eventTypes.length
    ? eventTypes
        .map((type) => `<option value="${safeAttr(type.id)}">${safe(type.nombre)}</option>`)
        .join("")
    : '<option value="">No hay tipos disponibles</option>';

  return `
    <div class="company-modal company-modal--event" id="event-edit-modal" aria-hidden="true">
      <div class="company-modal__backdrop" data-event-modal-close></div>
      <div class="company-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="event-edit-title">
        <header class="company-modal__header">
          <div>
            <p class="company-modal__kicker">Evento</p>
            <h3 class="company-modal__title" id="event-edit-title">Editar evento</h3>
            <p class="company-modal__subtitle" id="event-edit-subtitle">Actualiza los datos de este evento.</p>
          </div>

          <button class="company-modal__icon-btn" type="button" data-event-modal-close aria-label="Cerrar modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
            </svg>
          </button>
        </header>

        <form class="company-modal__form" id="event-edit-form" autocomplete="off">
          <input type="hidden" name="id" />

          <div class="company-modal__grid">
            <label class="company-modal__field">
              <span>Nombre</span>
              <input type="text" name="name" required />
            </label>

            <label class="company-modal__field">
              <span>Tipo de evento</span>
              <select name="id_event_type" required>
                ${eventTypeOptionsHtml}
              </select>
            </label>

            <label class="company-modal__field">
              <span>Lugar</span>
              <input type="text" name="place" required />
            </label>

            <label class="company-modal__field">
              <span>Fecha</span>
              <input type="date" name="date" required />
            </label>

            <label class="company-modal__field">
              <span>Hora</span>
              <input type="time" name="hour" required />
            </label>

            <label class="company-modal__field">
              <span>Precio</span>
              <input type="number" name="price" min="0" step="0.01" required />
            </label>

            <label class="company-modal__field">
              <span>Aforo máximo</span>
              <input type="number" name="maximun_capacity" min="1" required />
            </label>

            <label class="company-modal__field company-modal__field--full">
              <span>Poster (URL / ruta)</span>
              <input type="text" name="poster_image" />
            </label>
          </div>

          <p class="company-modal__status" id="event-edit-status" aria-live="polite"></p>

          <footer class="company-modal__footer">
            <button class="btn" type="button" data-event-modal-close>Cancelar</button>
            <button class="btn btn--primary" id="event-edit-submit" type="submit">Guardar cambios</button>
          </footer>
        </form>
      </div>
    </div>
  `;
}

export function renderCompanyPageHtml({
  companyData,
  companyEventsList,
  eventTypes,
  canDeleteCompany,
}) {
  const eventTypesById = new Map((eventTypes ?? []).map((type) => [String(type.id), String(type.nombre ?? "")]));
  const eventsCount = companyEventsList.length;
  const eventsCountLabel = `${eventsCount} evento${eventsCount === 1 ? "" : "s"}`;
  const deleteDisabledAttrs = canDeleteCompany
    ? ""
    : 'disabled aria-disabled="true" title="No puedes eliminar la empresa porque tiene eventos asociados"';

  return `
    <section class="company-page">
      <div class="company-header">
        <a href="/admin" id="back-link" data-link aria-label="Volver al panel">${BACK_BUTTON_SVG}</a>

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

        <article class="card card--wide card--events">
          <div class="section-head">
            <h2 class="card-title">Eventos</h2>
            <span class="section-chip section-chip--info">${eventsCountLabel}</span>
          </div>
          <p class="section-description">Administra el listado de eventos asociados a esta empresa.</p>

          <div class="events-list events-list--modern" id="events-list">
            ${renderEventsHtml(companyEventsList, eventTypesById)}
          </div>
        </article>

        <article class="card card--wide card--actions">
          <div class="section-head">
            <h2 class="card-title">Acciones</h2>
            <span class="section-chip">Empresa</span>
          </div>
          <p class="section-description">Gestiona esta empresa de forma segura desde aquí.</p>
          <p class="section-warning">Si la empresa tiene eventos asociados, no se puede eliminar.</p>

          <div class="actions company-actions">
            <button class="btn btn--primary" id="btn-edit" type="button">Editar empresa</button>
            <button class="btn btn--danger" id="btn-delete" type="button" ${deleteDisabledAttrs}>Eliminar empresa</button>
          </div>
        </article>
      </div>
    </section>
    ${renderCompanyEditModalHtml(companyData)}
    ${renderEventEditModalHtml(eventTypes)}
  `;
}
