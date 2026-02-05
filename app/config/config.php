<?php
function load_env_file(string $path): void
{
    if (!is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!is_array($lines)) {
        return;
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        if (!str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '' || getenv($key) !== false) {
            continue;
        }

        $value = trim($value, " \t\n\r\0\x0B\"'");
        putenv($key . '=' . $value);
    }
}

function env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return (string)$value;
}

// Útil fuera de Docker: si existe `.env`, lo cargamos (sin sobrescribir variables ya definidas).
load_env_file(dirname(__DIR__, 2) . '/.env');

define('DB_HOST', env_value('DB_HOST', 'localhost'));
define('DB_PORT', env_value('DB_PORT', '3306'));
define('DB_NAME', env_value('DB_NAME', 'cityhalldb'));
define('DB_USER', env_value('DB_USER', ''));
define('DB_PASS', env_value('DB_PASS', ''));

define('BASE_URL', env_value('BASE_URL', 'http://localhost/city_hall/public/'));

?>
