<?php
class Router
{
    private $routes = [];

    public function get(string $path, callable|array $callback): void
    {
        $this->routes['GET'][$path] = $callback;
    }

    public function post(string $path, callable|array $callback): void
    {
        $this->routes['POST'][$path] = $callback;
    }

    public function put(string $path, callable|array $callback): void
    {
        $this->routes['PUT'][$path] = $callback;
    }

    public function delete(string $path, callable|array $callback): void
    {
        $this->routes['DELETE'][$path] = $callback;
    }

    public function resolve(): mixed
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_SERVER['REQUEST_URI'] ?? '/';
        $path = explode('?', $path)[0];

        $callback = $this->routes[$method][$path] ?? null;

        // If this route does't exists on router array, return error page 404
        if (!$callback) {
            require_once __DIR__ . "/../views/error/404.php";
        }

        if (is_array($callback)) {
            [$class, $methodName] = $callback;
            $controller = new $class();
            return $controller->$methodName();
        }

        return $callback;
    }

}