<?php
require_once __DIR__ . "/../services/UserService.php";
require_once __DIR__ . "/../helpers/Request.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class AuthController
{
    private UserService $userService;

    public function __construct()
    {
        $this->userService = new UserService();
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
        if ($this->userService->verifyUserAlreadyExists($email))
            JsonResponse::error("Email already in use", JsonCode::ALREADY_EXISTS_EMAIL, HttpStatus::CONFLICT);

        // If user doesn't exists then save on the bbdd
        $u = $this->userService->saveUserOnDB($name, $email, $password);
        if (!$u) {
            JsonResponse::error("Internal server error", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        // GENERATE SESSION USER KEYS
        session_regenerate_id(true);
        $_SESSION['user_id'] = $u->getId();
        $_SESSION['user_role'] = $u->getRole()->value;
        $_SESSION['user_name'] = $u->getName();

        // Return the success response to client
        JsonResponse::success("User registered successfully", JsonCode::USER_REGISTERED_SUCCESS, HttpStatus::CREATED);
    }
    public function login() {}
}
