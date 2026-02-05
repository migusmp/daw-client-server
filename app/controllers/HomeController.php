<?php
class HomeController
{
    private function redirectIfAuthenticated(): void
    {
        if (!empty($_SESSION['user_id'])) {
            header("Location: /");
            exit;
        }
    }

    public function index()
    {
        require_once __DIR__ . "/../views/home.php";
    }

    public function loginPage()
    {
        $this->redirectIfAuthenticated();
        require_once __DIR__ . "/../views/auth/login.php";
    }

    public function registerPage()
    {
        $this->redirectIfAuthenticated();
        require_once __DIR__ . "/../views/auth/register.php";
    }
}
