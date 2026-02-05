<?php
class HomeController
{

    public function index()
    {
        require_once __DIR__ . "/../views/home.php";
    }

    public function loginPage()
    {
        require_once __DIR__ . "/../views/auth/login.php";
    }

    public function registerPage()
    {
        require_once __DIR__ . "/../views/auth/register.php";
    }
}
