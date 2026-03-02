export function getHomeTemplate(user) {
  return `
    <section class="home-page">
      <article class="home-hero reveal">
        <p class="home-kicker">Cartelera municipal</p>
        <h1 class="home-title">Eventos disponibles</h1>
        <p class="home-subtitle">
          Busca eventos por tipo, fechas o empresa organizadora y compra una o varias entradas en un solo ticket.
        </p>
        <p class="home-session">
          ${
            user
              ? `Sesión activa: <strong>${user.name || ""}</strong> (${user.role || ""})`
              : `No has iniciado sesión. Al comprar se te redirigirá a <strong>Login</strong>.`
          }
        </p>
      </article>

      <section class="catalog-layout reveal reveal-delay-1">
        <aside class="catalog-sidebar">
          <article class="panel-card">
            <h2 class="panel-title">Filtrar eventos</h2>
            <form class="catalog-filters" data-home-filters>
              <label class="field-label" for="event-query">Buscar por nombre</label>
              <input id="event-query" class="field-input" type="search" placeholder="Ej: Rock, verbena..." data-filter-q />

              <label class="field-label" for="event-type">Tipo de evento</label>
              <select id="event-type" class="field-select" data-filter-type>
                <option value="">Todos</option>
              </select>

              <label class="field-label" for="event-company">Empresa organizadora</label>
              <select id="event-company" class="field-select" data-filter-company>
                <option value="">Todas</option>
              </select>

              <div class="field-grid">
                <div>
                  <label class="field-label" for="event-date-from">Fecha desde</label>
                  <input id="event-date-from" class="field-input" type="date" data-filter-date-from />
                </div>
                <div>
                  <label class="field-label" for="event-date-to">Fecha hasta</label>
                  <input id="event-date-to" class="field-input" type="date" data-filter-date-to />
                </div>
              </div>

              <button class="field-button field-button--secondary" type="button" data-filter-reset>
                Limpiar filtros
              </button>
            </form>
          </article>

          <article class="panel-card">
            <h2 class="panel-title">Empresas por tipo</h2>
            <label class="field-label" for="company-type-search">Tipo de evento</label>
            <select id="company-type-search" class="field-select" data-company-type>
              <option value="">Todos</option>
            </select>

            <label class="field-label" for="company-query">Buscar empresa</label>
            <input id="company-query" class="field-input" type="search" placeholder="Ej: Sonido, Teatro..." data-company-query />

            <div class="company-results" data-company-results>
              <p class="empty-message">Cargando empresas...</p>
            </div>
          </article>
        </aside>

        <section class="catalog-content">
          <div class="catalog-toolbar">
            <p class="catalog-summary" data-events-summary>Cargando eventos...</p>
          </div>
          <div class="events-grid" data-events-grid>
            <p class="empty-message">Cargando eventos...</p>
          </div>
        </section>
      </section>
    </section>

    <div class="purchase-modal" data-purchase-modal aria-hidden="true">
      <div class="purchase-modal__overlay" data-purchase-close></div>
      <article class="purchase-modal__card">
        <button class="purchase-modal__close" type="button" data-purchase-close aria-label="Cerrar formulario">×</button>
        <h2 class="purchase-modal__title">Comprar entradas</h2>
        <p class="purchase-modal__event" data-purchase-event>Evento</p>

        <form class="purchase-form" data-purchase-form>
          <label class="field-label" for="purchase-quantity">Cantidad de entradas</label>
          <input id="purchase-quantity" class="field-input" type="number" min="1" step="1" value="1" data-purchase-quantity required />

          <div class="purchase-form__resume">
            <p><span>Precio unitario</span><strong data-purchase-unit>0,00 €</strong></p>
            <p><span>Total</span><strong data-purchase-total>0,00 €</strong></p>
          </div>

          <p class="purchase-form__hint" data-purchase-capacity></p>
          <p class="purchase-form__message" data-purchase-message></p>

          <button class="field-button" type="submit" data-purchase-submit>Confirmar compra</button>
        </form>
      </article>
    </div>
  `;
}
