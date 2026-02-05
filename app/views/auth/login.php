<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles/auth/login.css">
</head>
<body>
    <main class="page">
        <div class="shell">
            <section class="card">
                <header class="card__head">
                    <p class="eyebrow">City Hall</p>
                    <h1>Bienvenido de nuevo</h1>
                    <p class="subtitle">Inicia sesión para continuar con tus trámites y servicios.</p>
                </header>

                <form id="form-login" class="form" novalidate>
                    <label class="field" for="email">
                        <span>Email</span>
                        <input type="email" name="email" id="email" placeholder="tu@email.com" autocomplete="email" required>
                    </label>

                    <label class="field" for="password">
                        <span>Contraseña</span>
                        <input type="password" name="password" id="password" placeholder="************" autocomplete="current-password" required>
                    </label>

                    <button type="submit" class="btn" id="btn-login">Entrar</button>
                    <p class="helper">¿No tienes cuenta? <a href="/register">Crea una</a></p>
                </form>

                <div id="error-msg" class="alert-area" role="alert" aria-live="polite"></div>
            </section>
        </div>
    </main>
    <script type="module" src="/assets/js/auth/login.js"></script>
</body>
</html>
