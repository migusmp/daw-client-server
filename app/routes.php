<?php
require_once __DIR__ . "/core/Router.php";
require_once __DIR__ . "/controllers/HomeController.php";
require_once __DIR__ . "/controllers/AuthController.php";
require_once __DIR__ . "/controllers/AdminController.php";
require_once __DIR__ . "/controllers/CompanyController.php";
require_once __DIR__ . "/controllers/EventController.php";

$router = new Router();

$router->get("/", [HomeController::class, 'index']);
$router->get("/login", [HomeController::class, 'index']);
$router->get("/register", [HomeController::class, 'index']);

$router->post("/api/register", [AuthController::class, 'register']);
$router->get("/api/me", [AuthController::class, 'me']);
$router->post("/api/login", [AuthController::class, 'login']);
$router->post("/logout", [AuthController::class, 'logout']);

// ADMIN ROUTES
$router->get("/admin", [AdminController::class, 'index']);
$router->get("/api/admin/users", [AdminController::class, 'getUsers']);

// COMPANIES PAGES
$router->get("/admin/company", [CompanyController::class, 'showPage']);
$router->get("/admin/manage-companies", [CompanyController::class, 'manageCompanies']);

// COMPANIES API
$router->get("/api/companies", [CompanyController::class, 'getAll']);
$router->post("/api/companies", [CompanyController::class, 'create']);
$router->put("/api/companies", [CompanyController::class, 'update']);
$router->delete("/api/companies", [CompanyController::class, 'delete']);
$router->get("/api/companies/show", [CompanyController::class, "getOne"]);
$router->get("/api/company/events", [CompanyController::class, 'getEventsByCompany']);

// EVENTS PAGES
$router->get("/admin/manage-events", [EventController::class, 'manageEvent']);

// EVENTS API
$router->get("/api/events", [EventController::class, 'getAll']);
$router->post("/api/events", [EventController::class, 'create']);
$router->put("/api/events", [EventController::class, 'update']);
$router->delete("/api/events", [EventController::class, 'delete']);
$router->get("/api/event-types", [EventController::class, 'getEventTypes']);

$router->resolve();
