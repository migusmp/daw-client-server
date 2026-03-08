import { formatDate, formatPrice } from "./pages/home/home.helpers.js";

/**
 * Devuelve el HTML de una tarjeta de evento.
 *
 * Uso:
 *   import { eventCard, renderEventCards } from "/assets/js/cards.js";
 *
 *   // HTML de una sola tarjeta
 *   container.innerHTML = eventCard(evento);
 *
 *   // Renderizar un array entero
 *   renderEventCards(document.querySelector('#grid'), eventos);
 *
 * @param {Object} event - Objeto evento con los campos del API
 * @param {{ showBuyButton?: boolean }} options
 */
export function eventCard(event, { showBuyButton = true } = {}) {
  const posterUrl = String(event.poster_image || "").trim();
  const hasPoster = posterUrl !== "";
  const remaining = Number(event.remaining_capacity ?? 0);
  const maxCapacity = Number(event.maximun_capacity ?? 0);
  const currentCapacity = Number(event.current_capacity ?? 0);
  const soldOut = remaining <= 0;

  return `
    <article class="event-card" data-event-id="${event.id}">
      <div class="event-card__media">
        ${
          hasPoster
            ? `<img src="${posterUrl}" alt="Cartel ${event.name || ""}" loading="lazy" />`
            : `<div class="event-card__placeholder">Sin cartel</div>`
        }
      </div>

      <div class="event-card__content">
        <p class="event-card__meta">
          <span>${event.event_type_name || ""}</span>
          <span>${event.company_name || ""}</span>
        </p>
        <h3 class="event-card__title">${event.name || ""}</h3>
        <p class="event-card__place">${event.place || ""}</p>
        <p class="event-card__date">${formatDate(event.date, event.hour)}</p>
        <p class="event-card__capacity">
          Aforo: ${currentCapacity}/${maxCapacity} · Disponibles: ${remaining}
        </p>

        <div class="event-card__footer">
          <strong class="event-card__price">${formatPrice(event.price)}</strong>
          ${
            showBuyButton
              ? `<button
                  class="field-button"
                  type="button"
                  data-buy-event="${event.id}"
                  ${soldOut ? "disabled" : ""}
                >
                  ${soldOut ? "Agotado" : "Comprar"}
                </button>`
              : ""
          }
        </div>
      </div>
    </article>
  `;
}

/**
 * Devuelve el HTML de una tarjeta de empresa.
 *
 * Uso:
 *   import { companyCard, renderCompanyCards } from "/assets/js/cards.js";
 *
 *   container.innerHTML = companyCard(empresa);
 *   renderCompanyCards(document.querySelector('#lista'), empresas);
 *
 * @param {Object} company - Objeto empresa con los campos del API
 */
export function companyCard(company) {
  const typeChips = Array.isArray(company.event_type)
    ? company.event_type
        .map((t) => `<span class="type-chip">${t.name || ""}</span>`)
        .join("")
    : "";

  return `
    <article class="company-card" data-company-id="${company.id || ""}">
      <p class="company-card__name">${company.name || ""}</p>
      <p class="company-card__city">${company.city || ""}</p>
      <div class="company-card__types">
        ${typeChips || `<span class="type-chip">Sin tipos</span>`}
      </div>
    </article>
  `;
}

/**
 * Renderiza un array de eventos dentro de un contenedor.
 *
 * @param {HTMLElement} container
 * @param {Array}       events
 * @param {{ showBuyButton?: boolean }} options
 */
export function renderEventCards(container, events, options = {}) {
  if (!Array.isArray(events) || events.length === 0) {
    container.innerHTML = `<p class="empty-message">No hay eventos disponibles.</p>`;
    return;
  }

  container.innerHTML = events.map((e) => eventCard(e, options)).join("");
}

/**
 * Renderiza un array de empresas dentro de un contenedor.
 *
 * @param {HTMLElement} container
 * @param {Array}       companies
 */
export function renderCompanyCards(container, companies) {
  if (!Array.isArray(companies) || companies.length === 0) {
    container.innerHTML = `<p class="empty-message">No hay empresas disponibles.</p>`;
    return;
  }

  container.innerHTML = companies.map(companyCard).join("");
}
