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

// COMPANIES PAGES
$router->get("/admin/company", [CompanyController::class, "showPage"]);

// COMPANIES API
$router->get("/api/companies", [CompanyController::class, 'getAll']);
$router->get("/api/companies/show", [CompanyController::class, "getOne"]);
$router->get("/api/company/events", [CompanyController::class, 'getEventsByCompany']);

$router->resolve();
