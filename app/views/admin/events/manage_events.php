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
        <button class="me-btn me-btn--primary" type="button">Crear evento</button>
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
      <p class="me-stat__value">57</p>
      <p class="me-stat__meta">+11 frente al mes anterior</p>
    </article>

    <article class="me-stat">
      <p class="me-stat__label">Borradores</p>
      <p class="me-stat__value">9</p>
      <p class="me-stat__meta">Pendientes de revisión</p>
    </article>

    <article class="me-stat">
      <p class="me-stat__label">Cancelados</p>
      <p class="me-stat__value">2</p>
      <p class="me-stat__meta">Requieren comunicación al público</p>
    </article>
  </section>

  <section class="manage-events__content" aria-label="Contenido de eventos">
    <article class="me-panel">
      <header class="me-panel__header">
        <div>
          <h2 class="me-panel__title">Agenda próxima</h2>
          <p class="me-panel__subtitle">Vista editorial de próximos eventos</p>
        </div>
        <button class="me-btn" type="button">Ver calendario</button>
      </header>

      <div class="me-cards">
        <article class="me-event-card">
          <p class="me-event-card__date">14 MAY · 20:30</p>
          <h3 class="me-event-card__title">Noche Electrónica Distrito Norte</h3>
          <p class="me-event-card__meta">Sala Prisma · Madrid</p>
          <p class="me-event-card__status me-event-card__status--live">Publicado</p>
        </article>

        <article class="me-event-card">
          <p class="me-event-card__date">18 MAY · 19:00</p>
          <h3 class="me-event-card__title">Encuentro de Productores Locales</h3>
          <p class="me-event-card__meta">Centro Cívico Sur · Sevilla</p>
          <p class="me-event-card__status me-event-card__status--draft">Borrador</p>
        </article>

        <article class="me-event-card">
          <p class="me-event-card__date">21 MAY · 22:00</p>
          <h3 class="me-event-card__title">Festival Open Air Sonora</h3>
          <p class="me-event-card__meta">Recinto Exterior · Valencia</p>
          <p class="me-event-card__status me-event-card__status--full">Aforo alto</p>
        </article>
      </div>
    </article>

    <aside class="me-sidebar">
      <article class="me-panel">
        <h2 class="me-panel__title">Filtros de agenda</h2>
        <form class="me-form" aria-label="Filtros de eventos">
          <label class="me-field">
            <span>Buscar por título</span>
            <input type="text" placeholder="Título del evento..." />
          </label>

          <label class="me-field">
            <span>Estado</span>
            <select>
              <option>Todos</option>
              <option>Publicados</option>
              <option>Borradores</option>
              <option>Cancelados</option>
            </select>
          </label>

          <label class="me-field">
            <span>Mes</span>
            <select>
              <option>Mayo</option>
              <option>Junio</option>
              <option>Julio</option>
            </select>
          </label>

          <div class="me-form__actions">
            <button class="me-btn me-btn--primary" type="button">Aplicar</button>
            <button class="me-btn" type="button">Restablecer</button>
          </div>
        </form>
      </article>

      <article class="me-panel">
        <h2 class="me-panel__title">Checklist editorial</h2>
        <ul class="me-checklist">
          <li>Completar imagen de portada para todos los borradores.</li>
          <li>Revisar aforo y precios antes de publicar.</li>
          <li>Confirmar hora de apertura y cierre de puertas.</li>
        </ul>
      </article>
    </aside>
  </section>
</section>

<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
