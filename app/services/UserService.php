<?php
require_once __DIR__ . "/../repository/UserRepository.php";
require_once __DIR__ . "/../models/User.php";

class UserService
{
    private UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function verifyUserAlreadyExists(string $email): bool
    {
        return $this->userRepository->existsEmail($email);
    }

    public function saveUserOnDB(string $name, string $email, string $password): ?User
    {
        try {
            $u = new User($name, $email, $password);
            $this->userRepository->save($u);
            return $u;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }
}
