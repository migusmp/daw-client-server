<?php

require_once __DIR__ . "/core/Router.php";
require_once __DIR__ . "/controller/HomeController.php";

$router = new Router();
$router->get("/", [HomeController::class, 'index']);


$router->resolve();