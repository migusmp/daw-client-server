<?php
$title = "Gestionar Eventos";
$head = '<link rel="stylesheet" href="/assets/styles/admin/manage_events.css">';
$headerVariant = "admin";
require_once __DIR__ . "/../../layout/header.php";
?>

<section class="manage-events" aria-label="Gestión de eventos">
  <header class="manage-events__hero">
    <div class="manage-events__hero-copy">
      <p class="manage-events__kicker">Administración</p>
      <h1 class="manage-events__title">Gestión de Eventos</h1>
      <p class="manage-events__lead">
        Diseña la agenda, controla publicación y visualiza prioridades operativas en un único panel.
      </p>
      <div class="manage-events__hero-actions">
        <button class="me-btn me-btn--primary" type="button" data-event-new>Crear evento</button>
        <a class="me-btn" href="/admin">Volver al panel</a>
      </div>
    </div>

    <aside class="manage-events__hero-card" aria-label="Resumen rápido">
      <h2 class="manage-events__hero-card-title">Resumen rápido</h2>
      <ul class="manage-events__hero-list">
        <li>Eventos activos este mes: 24</li>
        <li>Eventos con aforo al 80%: 5</li>
        <li>Próxima publicación programada: 11:30</li>
      </ul>
    </aside>
  </header>

  <section class="manage-events__stats" aria-label="Métricas de eventos">
    <article class="me-stat">
      <p class="me-stat__label">Publicados</p>
      <p class="me-stat__value" data-events-total>0</p>
      <p class="me-stat__meta">Eventos registrados actualmente</p>
    </article>

    <article class="me-stat">
      <p class="me-stat__label">Precio medio</p>
      <p class="me-stat__value" data-events-price-average>0 €</p>
      <p class="me-stat__meta">Promedio en el catálogo</p>
    </article>

    <article class="me-stat">
      <p class="me-stat__label">Aforo total</p>
      <p class="me-stat__value" data-events-capacity-total>0</p>
      <p class="me-stat__meta">Suma de capacidades máximas</p>
    </article>
  </section>

  <section class="manage-events__content" aria-label="Contenido de eventos">
    <article class="me-panel">
      <header class="me-panel__header">
        <div>
          <h2 class="me-panel__title">Agenda próxima</h2>
          <p class="me-panel__subtitle" data-events-hint>Cargando eventos...</p>
        </div>
        <button class="me-btn" type="button" data-events-reload>Recargar</button>
      </header>

      <div class="me-cards" data-events-list>
        <article class="me-event-card">
          <p class="me-event-card__date">—</p>
          <h3 class="me-event-card__title">Cargando...</h3>
          <p class="me-event-card__meta">—</p>
          <div class="me-event-card__actions">
            <button class="me-row-btn" type="button" disabled>Editar</button>
            <button class="me-row-btn me-row-btn--danger" type="button" disabled>Eliminar</button>
          </div>
        </article>
      </div>
    </article>

    <aside class="me-sidebar">
      <article class="me-panel">
        <h2 class="me-panel__title" data-event-form-title>Registrar evento</h2>
        <form class="me-form" data-event-crud-form aria-label="Formulario de eventos">
          <input type="hidden" name="id" />

          <label class="me-field">
            <span>Nombre</span>
            <input type="text" name="name" placeholder="Título del evento" required />
          </label>

          <label class="me-field">
            <span>Empresa</span>
            <select name="id_company" data-event-company-select required>
              <option value="">Selecciona empresa</option>
            </select>
          </label>

          <label class="me-field">
            <span>Tipo de evento</span>
            <select name="id_event_type" data-event-type-select required>
              <option value="">Selecciona tipo</option>
            </select>
          </label>

          <label class="me-field">
            <span>Lugar</span>
            <input type="text" name="place" placeholder="Recinto, sala..." required />
          </label>

          <label class="me-field">
            <span>Fecha</span>
            <input type="date" name="date" required />
          </label>

          <label class="me-field">
            <span>Hora</span>
            <input type="time" name="hour" required />
          </label>

          <label class="me-field">
            <span>Precio (€)</span>
            <input type="number" name="price" min="0" step="0.01" placeholder="0.00" required />
          </label>

          <label class="me-field">
            <span>Aforo máximo</span>
            <input type="number" name="maximun_capacity" min="1" placeholder="100" required />
          </label>

          <label class="me-field">
            <span>Ruta cartel (opcional)</span>
            <input type="text" name="poster_image" placeholder="carteles/mi-evento.jpg" />
          </label>

          <div class="me-form__actions">
            <button class="me-btn me-btn--primary" type="submit" data-event-submit-btn>Guardar</button>
            <button class="me-btn" type="button" data-event-form-reset>Limpiar</button>
            <button class="me-btn" type="button" data-event-form-cancel hidden>Cancelar edición</button>
          </div>

          <p class="me-form__status" data-event-form-status></p>
        </form>
      </article>

      <article class="me-panel">
        <h2 class="me-panel__title">Ayuda rápida</h2>
        <ul class="me-checklist">
          <li>Crear: completa el formulario y pulsa Guardar.</li>
          <li>Editar: pulsa Editar en una tarjeta para cargar datos.</li>
          <li>Eliminar: usa Eliminar en la tarjeta del evento.</li>
        </ul>
      </article>
    </aside>
  </section>
</section>

<script type="module" src="/assets/js/admin/events/manage_events.js"></script>
<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
