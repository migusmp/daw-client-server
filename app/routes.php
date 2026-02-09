<?php
require_once __DIR__ . "/core/Router.php";
require_once __DIR__ . "/controllers/HomeController.php";
require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/AdminController.php";
require_once __DIR__ . "/controllers/CompanyController.php";

$router = new Router();

$router->get("/", [HomeController::class, 'index']);
$router->get("/login", [HomeController::class, 'loginPage']);
$router->get("/register", [HomeController::class, 'registerPage']);

$router->post("/api/register", [AuthController::class, 'register']);
$router->get("/api/me", [AuthController::class, 'me']);
$router->post("/api/login", [AuthController::class, 'login']);
$router->post("/logout", [AuthController::class, 'logout']);

// ADMIN ROUTES
$router->get("/admin", [AdminController::class, 'index']);
$router->get("/api/admin/users", [AdminController::class, 'getUsers']);

// COMPANIES ROUTES
$router->get("/api/companies", [CompanyController::class, 'getAll']); // TODO: Probar endpoint

$router->resolve();
