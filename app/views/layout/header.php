<?php
$appName = defined('APP_NAME') ? APP_NAME : 'App';
$title = $title ?? '';
$head = $head ?? '';
$containerClass = $containerClass ?? '';
$showHeader = $showHeader ?? true;
$path = $_SERVER['REQUEST_URI'] ?? '/';
$path = explode('?', $path, 2)[0];
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?><?= $title ? ' - ' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') : '' ?></title>
    <script>
        (() => {
            try {
                const saved = localStorage.getItem('theme');
                if (saved === 'dark' || saved === 'light') {
                    document.documentElement.dataset.theme = saved;
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.dataset.theme = 'dark';
                }
            } catch {}
        })();
    </script>
    <link rel="stylesheet" href="/assets/styles/global.css">
    <link rel="stylesheet" href="/assets/styles/layout/header.css">
    <link rel="stylesheet" href="/assets/styles/layout/footer.css">
    <?= $head ?>
</head>
<body class="site">
    <?php if ($showHeader): ?>
        <header class="site-header">
            <div class="site-container">
                <a class="site-brand" href="/"><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></a>
                <nav class="site-nav" aria-label="Navegación">
                    <a class="site-nav__link <?= $path === '/' ? 'is-active' : '' ?>" href="/">Inicio</a>
                    <a class="login-nav__link" href="/login">Iniciar sesión</a>
                    <a class="register-nav__link" href="/register">Registro</a>
                    <button class="theme-switch" type="button" data-theme-toggle role="switch" aria-checked="false" aria-label="Cambiar tema">
                        <span class="sr-only">Cambiar tema</span>
                        <span class="theme-switch__track" aria-hidden="true">
                            <span class="theme-switch__icon theme-switch__icon--sun">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                                </svg>
                            </span>
                            <span class="theme-switch__icon theme-switch__icon--moon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
                                </svg>
                            </span>
                            <span class="theme-switch__thumb" aria-hidden="true">
                                <span class="theme-switch__thumb-icon theme-switch__thumb-icon--sun">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high-fill" viewBox="0 0 16 16" aria-hidden="true">
                                        <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                                    </svg>
                                </span>
                                <span class="theme-switch__thumb-icon theme-switch__thumb-icon--moon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-fill" viewBox="0 0 16 16" aria-hidden="true">
                                        <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278"/>
                                    </svg>
                                </span>
                            </span>
                        </span>
                    </button>
                </nav>
            </div>
        </header>
    <?php endif; ?>

    <main id="container" class="<?= htmlspecialchars($containerClass, ENT_QUOTES, 'UTF-8') ?>">
