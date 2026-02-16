<?php
$title = '404';
$head = '<link rel="stylesheet" href="/assets/styles/pages/404.css">';
$containerClass = 'error404-page';
require_once __DIR__ . "/../layout/header.php";

$requestedPath = $_SERVER['REQUEST_URI'] ?? '/';
$requestedPath = explode('?', $requestedPath, 2)[0];
$isAuthenticated = isset($_SESSION) && !empty($_SESSION['user_id']);
$isAdminUser = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'ADMIN';

$secondaryHref = null;
$secondaryLabel = null;

if ($isAdminUser) {
    $secondaryHref = '/admin';
    $secondaryLabel = 'Ir al panel';
} elseif (!$isAuthenticated) {
    $secondaryHref = '/login';
    $secondaryLabel = 'Iniciar sesión';
}
?>

<section class="error404" aria-labelledby="error404-title">
    <article class="error404__card">
        <p class="error404__kicker">Error 404</p>
        <h1 id="error404-title" class="error404__title">No encontramos la página solicitada</h1>
        <p class="error404__lead">
            La ruta
            <code class="error404__path"><?= htmlspecialchars($requestedPath, ENT_QUOTES, 'UTF-8') ?></code>
            no existe o fue movida.
        </p>

        <div class="error404__actions">
            <a class="error404__btn error404__btn--primary" href="/">Volver al inicio</a>
            <?php if ($secondaryHref !== null && $secondaryLabel !== null): ?>
                <a class="error404__btn" href="<?= htmlspecialchars($secondaryHref, ENT_QUOTES, 'UTF-8') ?>">
                    <?= htmlspecialchars($secondaryLabel, ENT_QUOTES, 'UTF-8') ?>
                </a>
            <?php endif; ?>
        </div>
    </article>
</section>

<?php require_once __DIR__ . "/../layout/footer.php"; ?>
