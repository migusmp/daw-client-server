<?php
$appName = defined('APP_NAME') ? APP_NAME : 'App';
$title = $title ?? '';
$head = $head ?? '';
$containerClass = $containerClass ?? '';
$showHeader = $showHeader ?? true;
$headerVariant = $headerVariant ?? '';
$path = $_SERVER['REQUEST_URI'] ?? '/';
$path = explode('?', $path, 2)[0];
$isAdminHeader = $headerVariant === 'admin' || strpos($path, '/admin') === 0;
$isAuthenticated = isset($_SESSION) && !empty($_SESSION['user_id']);
$isAdminUser = isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'ADMIN';
$profileTitle = $isAuthenticated ? ($_SESSION['user_name'] ?? 'Perfil') : 'Perfil';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?><?= $title ? ' - ' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') : '' ?></title>
    <script>
        (() => {
            document.documentElement.classList.add('js');
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
        <header class="site-header<?= $isAdminHeader ? ' site-header--admin' : '' ?>">
            <div class="site-container">
                <div class="site-brand-group">
                    <a class="site-brand" href="/"><?= htmlspecialchars($appName, ENT_QUOTES, 'UTF-8') ?></a>
                    <?php if ($isAdminHeader): ?>
                        <span class="site-header__badge">Panel de Administración</span>
                    <?php endif; ?>
                </div>
                <nav class="site-nav site-nav--desktop" aria-label="Navegación">
                    <?php if ($isAdminHeader): ?>
                        <a class="site-nav__link <?= $path === '/admin' ? 'is-active' : '' ?>" href="/admin">Panel</a>
                        <a class="site-nav__link <?= $path === '/admin/manage-companies' ? 'is-active' : '' ?>" href="/admin/manage-companies">Empresas</a>
                        <a class="site-nav__link <?= $path === '/admin/manage-events' ? 'is-active' : '' ?>" href="/admin/manage-events">Eventos</a>
                        <a class="site-nav__link" href="/">Volver al Portal</a>
                    <?php else: ?>
                        <a class="site-nav__link <?= $path === '/' ? 'is-active' : '' ?>" href="/">Inicio</a>
                        <?php if ($isAdminUser): ?>
                            <a class="site-nav__link <?= $path === '/admin' ? 'is-active' : '' ?>" href="/admin">Panel de Administración</a>
                        <?php endif; ?>
                        <?php if (!$isAuthenticated): ?>
                            <a class="login-nav__link" href="/login">Iniciar sesión</a>
                            <a class="register-nav__link" href="/register">Crear cuenta</a>
                        <?php endif; ?>
                    <?php endif; ?>
                </nav>
                <div class="site-actions">
                    <?php if (!$isAuthenticated): ?>
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
                    <?php endif; ?>
                    <?php if ($isAuthenticated): ?>
                        <div class="profile-menu" data-profile-menu>
                            <button class="profile-button" type="button" data-profile-menu-button aria-haspopup="dialog" aria-expanded="false" aria-controls="profileMenu" aria-label="Abrir menú de perfil" title="<?= htmlspecialchars($profileTitle, ENT_QUOTES, 'UTF-8') ?>">
                                <span class="sr-only">Abrir menú de perfil</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16" aria-hidden="true">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                </svg>
                            </button>
                            <div id="profileMenu" class="profile-menu__panel" data-profile-menu-panel role="dialog" aria-label="Perfil" aria-hidden="true">
                                <div class="profile-menu__row">
                                    <span class="profile-menu__label">Tema</span>
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
                                </div>
                                <div class="profile-menu__divider" aria-hidden="true"></div>
                                <form class="profile-menu__form" action="/logout" method="post">
                                    <button class="profile-menu__item profile-menu__item--danger" type="submit">Logout</button>
                                </form>
                            </div>
                        </div>
                    <?php endif; ?>
                    <button class="site-menu-button" type="button" data-mobile-menu-button aria-controls="mobileMenu" aria-expanded="false" aria-label="Abrir menú">
                        <span class="sr-only">Abrir menú</span>
                        <span class="site-menu-button__icon" aria-hidden="true">
                            <span class="site-menu-button__bar"></span>
                        </span>
                    </button>
                </div>
            </div>

	            <div id="mobileMenu" class="mobile-menu" data-mobile-menu aria-hidden="true">
	                <aside class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menú">
                        <div class="mobile-menu__row">
                            <span class="mobile-menu__label">Tema</span>
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
                                                <path d="M12 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 0 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
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
                        </div>
                        <div class="mobile-menu__divider" aria-hidden="true"></div>

	                    <nav class="mobile-menu__nav" aria-label="Navegación móvil">
                            <?php if ($isAdminHeader): ?>
                                <a class="mobile-menu__link <?= $path === '/admin' ? 'is-active' : '' ?>" href="/admin">Panel</a>
                                <a class="mobile-menu__link" href="/">Portal</a>
                            <?php else: ?>
	                            <a class="mobile-menu__link <?= $path === '/' ? 'is-active' : '' ?>" href="/">Inicio</a>
                                <?php if ($isAdminUser): ?>
                                    <a class="mobile-menu__link <?= $path === '/admin' ? 'is-active' : '' ?>" href="/admin">Administración</a>
                                <?php endif; ?>
                            <?php endif; ?>
	                    </nav>

                        <div class="mobile-menu__divider" aria-hidden="true"></div>

                        <div class="mobile-menu__actions" aria-label="Acciones">
                            <?php if ($isAuthenticated): ?>
                                <form class="mobile-menu__form" action="/logout" method="post">
                                    <button class="mobile-menu__button mobile-menu__button--danger" type="submit">Logout</button>
                                </form>
                            <?php else: ?>
                                <a class="mobile-menu__link mobile-menu__link--primary <?= $path === '/login' ? 'is-active' : '' ?>" href="/login">Iniciar sesión</a>
                                <a class="mobile-menu__link <?= $path === '/register' ? 'is-active' : '' ?>" href="/register">Crear cuenta</a>
                            <?php endif; ?>
                        </div>
	                </aside>
	            </div>
	        </header>
    <?php endif; ?>

    <main id="container" class="<?= htmlspecialchars($containerClass, ENT_QUOTES, 'UTF-8') ?>">
