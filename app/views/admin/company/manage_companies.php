<?php
$title = "Gestionar Empresas";
$head = '<link rel="stylesheet" href="/assets/styles/admin/manage_companies.css">';
$headerVariant = "admin";
require_once __DIR__ . "/../../layout/header.php";
?>

<section class="manage-companies" aria-label="Gestión de empresas">
  <header class="manage-companies__hero">
    <div class="manage-companies__hero-copy">
      <p class="manage-companies__kicker">Administración</p>
      <h1 class="manage-companies__title">Gestión de Empresas</h1>
      <p class="manage-companies__lead">
        Panel visual para revisar empresas, validar datos de contacto y priorizar acciones administrativas.
      </p>
      <div class="manage-companies__hero-actions">
        <button class="mc-btn mc-btn--primary" type="button">Nueva empresa</button>
        <a class="mc-btn" href="/admin">Volver al panel</a>
      </div>
    </div>

    <aside class="manage-companies__hero-card" aria-label="Estado general">
      <h2 class="manage-companies__hero-card-title">Estado general</h2>
      <ul class="manage-companies__hero-list">
        <li>Empresas con perfil completo: 82%</li>
        <li>Registros pendientes de revisión: 6</li>
        <li>Última sincronización: hoy, 08:42</li>
      </ul>
    </aside>
  </header>

  <section class="manage-companies__stats" aria-label="Métricas rápidas">
    <article class="mc-stat">
      <p class="mc-stat__label">Empresas activas</p>
      <p class="mc-stat__value">128</p>
      <p class="mc-stat__meta">+8 en los últimos 30 días</p>
    </article>

    <article class="mc-stat">
      <p class="mc-stat__label">Pendientes</p>
      <p class="mc-stat__value">14</p>
      <p class="mc-stat__meta">Requieren validación de datos</p>
    </article>

    <article class="mc-stat">
      <p class="mc-stat__label">Eventos vinculados</p>
      <p class="mc-stat__value">346</p>
      <p class="mc-stat__meta">12 publicados esta semana</p>
    </article>
  </section>

  <section class="manage-companies__content" aria-label="Contenido principal">
    <article class="mc-panel">
      <header class="mc-panel__header">
        <div>
          <h2 class="mc-panel__title">Listado de empresas</h2>
          <p class="mc-panel__subtitle">Vista previa de registros más recientes</p>
        </div>
        <button class="mc-btn" type="button">Exportar</button>
      </header>

      <div class="mc-table" role="table" aria-label="Tabla de empresas">
        <div class="mc-table__head" role="row">
          <span>Empresa</span>
          <span>Ciudad</span>
          <span>Contacto</span>
          <span>Estado</span>
        </div>

        <div class="mc-table__row" role="row">
          <span>Nova Audio Labs</span>
          <span>Madrid</span>
          <span>hola@novalabs.es</span>
          <span class="mc-badge mc-badge--ok">Activa</span>
        </div>

        <div class="mc-table__row" role="row">
          <span>Ritmo Factory</span>
          <span>Valencia</span>
          <span>contacto@ritmofactory.com</span>
          <span class="mc-badge mc-badge--warn">Pendiente</span>
        </div>

        <div class="mc-table__row" role="row">
          <span>Pulse Community</span>
          <span>Bilbao</span>
          <span>equipo@pulse.org</span>
          <span class="mc-badge mc-badge--ok">Activa</span>
        </div>

        <div class="mc-table__row" role="row">
          <span>Sónica Distrito</span>
          <span>Sevilla</span>
          <span>gestion@sonicadistrito.es</span>
          <span class="mc-badge mc-badge--block">Incompleta</span>
        </div>
      </div>
    </article>

    <aside class="mc-sidebar">
      <article class="mc-panel">
        <h2 class="mc-panel__title">Filtros visuales</h2>
        <form class="mc-form" aria-label="Filtros de empresas">
          <label class="mc-field">
            <span>Nombre o ciudad</span>
            <input type="text" placeholder="Buscar empresa..." />
          </label>

          <label class="mc-field">
            <span>Estado</span>
            <select>
              <option>Todas</option>
              <option>Activas</option>
              <option>Pendientes</option>
              <option>Incompletas</option>
            </select>
          </label>

          <label class="mc-field">
            <span>Orden</span>
            <select>
              <option>Más recientes</option>
              <option>Nombre (A-Z)</option>
              <option>Ciudad</option>
            </select>
          </label>

          <div class="mc-form__actions">
            <button class="mc-btn mc-btn--primary" type="button">Aplicar</button>
            <button class="mc-btn" type="button">Limpiar</button>
          </div>
        </form>
      </article>

      <article class="mc-panel">
        <h2 class="mc-panel__title">Acciones rápidas</h2>
        <ul class="mc-quick-list">
          <li>Revisar empresas sin email de contacto.</li>
          <li>Actualizar empresas sin ciudad definida.</li>
          <li>Detectar perfiles sin eventos vinculados.</li>
        </ul>
      </article>
    </aside>
  </section>
</section>

<?php require_once __DIR__ . "/../../layout/footer.php"; ?>
