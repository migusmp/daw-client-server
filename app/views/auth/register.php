<?php
$title = 'Registro';
$head = '
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles/auth/register.css">
';
$containerClass = 'container--full';
$showHeader = false;

require_once __DIR__ . "/../layout/header.php";
?>

<div class="page">
    <div class="shell">
        <section class="card">
            <header class="card__head">
                <p class="eyebrow">Ayuntamiento</p>
                <h1>Crear cuenta</h1>
                <p class="subtitle">Gestiona tus trámites y avisos desde un solo lugar con un perfil seguro.</p>
            </header>

            <form id="form-register" class="form" novalidate>
                <label class="field" for="name">
                    <span>Nombre</span>
                    <input type="text" name="name" id="name" placeholder="Juan Pérez" autocomplete="name" required>
                </label>

                <label class="field" for="email">
                    <span>Email</span>
                    <input type="email" name="email" id="email" placeholder="juan@example.com" autocomplete="email" required>
                </label>

                <label class="field" for="password">
                    <span>Contraseña</span>
                    <input type="password" name="password" id="password" placeholder="************" autocomplete="new-password" required>
                </label>

                <button type="submit" class="btn" id="btn-register">Crear cuenta</button>
                <p class="helper">¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
            </form>

            <div id="error-msg" class="alert-area" role="alert" aria-live="polite"></div>
        </section>
    </div>
</div>

<script type="module" src="/assets/js/auth/register.js"></script>
<?php require_once __DIR__ . "/../layout/footer.php"; ?>

