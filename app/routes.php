<?php

require_once __DIR__ . "/core/Router.php";
require_once __DIR__ . "/controllers/HomeController.php";

$router = new Router();

$router->get("/", [HomeController::class, 'index']);
$router->get("/login", [HomeController::class, 'loginPage']);
$router->get("/register", [HomeController::class, 'registerPage']);

$router->resolve();