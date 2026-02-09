<?php
require_once __DIR__ . "/../services/UserService.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class AdminController
{
    private ?UserService $userService = null;

    private function users()
    {
        if ($this->userService == null) {
            $this->userService = new UserService();
        }
        return $this->userService;
    }

    public function verifyIsAdmin()
    {
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            header('Location: /');
            exit;
        }
    }

    public function checkIfIsAdmin(): bool
    {
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            return false;
        }

        return true;
    }

    public function index()
    {
        $this->verifyIsAdmin();
        require_once __DIR__ . "/../views/admin/index.php";
    }

    public function getUsers()
    {
        if (!$this->checkIfIsAdmin()) { // Si el usuario no es admin no puede entrar a este endpoint
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $users = $this->users()->getAllUsers();
        if (is_array($users) && count($users) === 0) {
            echo "The array is empty.";
        }

        JsonResponse::success("Users on " . APP_NAME, JsonCode::SUCCESSFULL, HttpStatus::OK, $users);
    }
}
