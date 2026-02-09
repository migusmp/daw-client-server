<?php
$title = 'Administración';
$head = '<link rel="stylesheet" href="/assets/styles/pages/admin.css">';
$headerVariant = 'admin';
require_once __DIR__ . "/../layout/header.php";
?>

<section class="admin-hero">
    <div class="admin-hero__inner">
        <div>
            <p class="admin-kicker">Panel de administración</p>
            <h1 class="admin-title" data-admin-greeting>Hola, Administrador</h1>
            <p class="admin-lead">Gestiona usuarios, roles y accesos del portal municipal desde un único panel.</p>
            <div class="admin-actions">
                <button class="admin-btn admin-btn--primary" type="button" data-admin-export>Exportar usuarios</button>
                <a class="admin-btn" href="/">Volver al portal</a>
            </div>
        </div>
        <aside class="admin-panel">
            <h2>Accesos rápidos</h2>
            <ul>
                <li>Revisar permisos y roles</li>
                <li>Validar nuevas cuentas</li>
                <li>Auditar actividad reciente</li>
            </ul>
        </aside>
    </div>
</section>

<section class="admin-section" aria-label="Resumen general">
    <h2 class="admin-section__title">Resumen</h2>
    <div class="admin-stats">
        <article class="admin-card">
            <span class="admin-card__label">Usuarios</span>
            <strong class="admin-card__value" data-admin-total>0</strong>
            <span class="admin-card__meta">Registrados en total</span>
        </article>
        <article class="admin-card">
            <span class="admin-card__label">Admins</span>
            <strong class="admin-card__value" data-admin-admins>0</strong>
            <span class="admin-card__meta">Con permisos elevados</span>
        </article>
        <article class="admin-card">
            <span class="admin-card__label">Últimos</span>
            <strong class="admin-card__value" data-admin-recent>0</strong>
            <span class="admin-card__meta">Altas recientes</span>
        </article>
    </div>
</section>

<section class="admin-section" aria-label="Usuarios recientes">
    <div class="admin-section__header">
        <h2 class="admin-section__title">Usuarios recientes</h2>
        <span class="admin-section__hint" data-admin-hint>Mostrando los últimos 0 registros</span>
    </div>
    <div class="admin-list" data-admin-list>
        <p class="admin-empty">Cargando usuarios...</p>
    </div>
</section>

<script type="module" src="/assets/js/pages/admin.js"></script>
<?php require_once __DIR__ . "/../layout/footer.php"; ?>
