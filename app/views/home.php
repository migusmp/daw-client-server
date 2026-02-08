<?php
$title = 'Inicio';
$head = '<link rel="stylesheet" href="/assets/styles/pages/home.css">';
require_once __DIR__ . "/layout/header.php";
$isAuthenticated = !empty($_SESSION['user_id']);
$userName = $_SESSION['user_name'] ?? '';
?>

<section class="civic-hero">
    <div class="civic-hero__inner">
        <div>
            <p class="civic-kicker">Portal municipal</p>
            <?php if ($isAuthenticated): ?>
                <h1 class="civic-title">Bienvenido<?= $userName ? ', ' . htmlspecialchars($userName, ENT_QUOTES, 'UTF-8') : '' ?></h1>
                <p class="civic-lead">Tu sesión está activa. Gestiona tus trámites, solicitudes y avisos desde un único lugar.</p>
            <?php else: ?>
                <h1 class="civic-title">Ayuntamiento Digital</h1>
                <p class="civic-lead">Accede a tus trámites, solicitudes y avisos desde un único lugar, con seguimiento y notificaciones.</p>
                <div class="civic-actions">
                    <a class="civic-btn civic-btn--primary" href="/login">Iniciar sesión</a>
                    <a class="civic-btn" href="/register">Crear cuenta</a>
                </div>
            <?php endif; ?>
        </div>

        <aside class="civic-panel">
            <h2>Accesos rápidos</h2>
            <ul>
                <li>Estado de solicitudes</li>
                <li>Cita previa</li>
                <li>Avisos y bandos</li>
            </ul>
        </aside>
    </div>
</section>

<section class="civic-section" aria-label="Servicios destacados">
    <h2 class="civic-section__title">Servicios destacados</h2>
    <div class="civic-grid">
        <article class="civic-card">
            <h3>Trámites online</h3>
            <p>Presenta solicitudes y documentación sin desplazarte.</p>
        </article>
        <article class="civic-card">
            <h3>Notificaciones</h3>
            <p>Recibe avisos sobre el estado de tus gestiones.</p>
        </article>
        <article class="civic-card">
            <h3>Perfil ciudadano</h3>
            <p>Gestiona tus datos y accesos desde tu cuenta.</p>
        </article>
    </div>
</section>
<script type="module" src="/assets/js/pages/home.js"></script>

<?php require_once __DIR__ . "/layout/footer.php"; ?>
