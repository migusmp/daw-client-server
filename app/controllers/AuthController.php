<?php
require_once __DIR__ . "/../services/UserService.php";
require_once __DIR__ . "/../helpers/Request.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class AuthController
{
    private ?UserService $userService = null;

    private function users(): UserService
    {
        if ($this->userService === null) {
            $this->userService = new UserService();
        }

        return $this->userService;
    }
    public function register()
    {
        $data = Request::json();
        $name = trim($data['name']) ?? '';
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Validation of register form fields
        if (!$name || $name === '') {
            JsonResponse::error("Name field is empty", JsonCode::EMPTY_NAME, HttpStatus::BAD_REQUEST);
        }

        if (!$email || $email === '') {
            JsonResponse::error("Email field is empty", JsonCode::EMPTY_MAIL, HttpStatus::BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            JsonResponse::error("Invalid email format", JsonCode::INVALID_MAIL_FORMAT, HttpStatus::BAD_REQUEST);
        }

        if (!$password || $password === '') {
            JsonResponse::error("Password field is empty", JsonCode::EMPTY_PASS, HttpStatus::BAD_REQUEST);
        }

        if (strlen($password) < 4) {
            JsonResponse::error("Password must be have 4 characters", JsonCode::PASSWORD_LENGTH_ERROR, HttpStatus::BAD_REQUEST);
        }

        // Verify if user does already exists on the database
        if ($this->users()->verifyUserAlreadyExists($email))
            JsonResponse::error("Email already in use", JsonCode::ALREADY_EXISTS_EMAIL, HttpStatus::CONFLICT);

        // If user doesn't exists then save on the bbdd
        $u = $this->users()->saveUserOnDB($name, $email, $password);
        if (!$u) {
            JsonResponse::error("Internal server error", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        // GENERATE SESSION USER KEYS
        session_regenerate_id(true);
        $_SESSION['user_id'] = $u->getId();
        $_SESSION['user_role'] = $u->getRole()->value;
        $_SESSION['user_name'] = $u->getName();
        $_SESSION['user_email'] = $u->getEmail();

        // Return the success response to client
        JsonResponse::success("User registered successfully", JsonCode::USER_REGISTERED_SUCCESS, HttpStatus::CREATED);
    }
    public function me()
    {
        if (empty($_SESSION['user_id'])) {
            JsonResponse::error("Not authenticated", JsonCode::NOT_AUTHENTICATED, HttpStatus::UNAUTHORIZED);
        }

        $data = [
            "id" => $_SESSION['user_id'],
            "name" => $_SESSION['user_name'] ?? null,
            "email" => $_SESSION['user_email'] ?? null,
            "role" => $_SESSION['user_role'] ?? null,
        ];

        JsonResponse::success("Authenticated", JsonCode::AUTHENTICATED, HttpStatus::OK, $data);
    }
    public function login()
    {
        $data = Request::json();
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || $email === '') {
            JsonResponse::error("Email field is empty", JsonCode::EMPTY_MAIL, HttpStatus::BAD_REQUEST);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            JsonResponse::error("Invalid email format", JsonCode::INVALID_MAIL_FORMAT, HttpStatus::BAD_REQUEST);
        }
        
        if (!$password || $password === '') {
            JsonResponse::error("Password field is empty", JsonCode::EMPTY_PASS, HttpStatus::BAD_REQUEST);
        }


        $u = $this->users()->verifyUserLogin($email, $password);
        if (!$u)
            JsonResponse::error("Email or password are incorrect", JsonCode::BAD_CREDENTIALS, HttpStatus::BAD_REQUEST);

        session_regenerate_id(true);
        $_SESSION['user_id'] = $u->getId();
        $_SESSION['user_role'] = $u->getRole()->value;
        $_SESSION['user_name'] = $u->getName();
        $_SESSION['user_email'] = $u->getEmail();

        JsonResponse::success("Successfull login", JsonCode::USER_LOGGED_SUCCESS, HttpStatus::OK);
    }

    public function logout(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'] ?? '/',
                $params['domain'] ?? '',
                (bool) ($params['secure'] ?? false),
                (bool) ($params['httponly'] ?? false),
            );
        }

        session_destroy();

        header("Location: /");
        exit;
    }
}
