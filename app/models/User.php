<?php
require_once __DIR__ . "/../utils/UserRole.php";

class User implements JsonSerializable
{

    private ?int $id = null;
    private string $name;
    private string $email;
    private string $passwordHash;
    private UserRole $role;

    public function __construct($name, $email, $password)
    {
        $this->name = $name;
        $this->email = $email;
        $this->role = UserRole::USER;

        if ($password !== "") {
            $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
        } else {
            $this->passwordHash = "";
        }
    }

    public function verifyPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->passwordHash);
    }

    // SETTERS AND GETTERS
    public function setId(int|null $id)
    {
        $this->id = $id;
    }
    public function setName(string $name)
    {
        $this->name = $name;
    }
    public function setEmail(string $email)
    {
        $this->email = $email;
    }
    public function setPasswordFromPlain(string $password)
    {
        $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
    }
    public function setPasswordHashedFromDB(string $passwordHashedFromDB)
    {
        $this->passwordHash = $passwordHashedFromDB;
    }

    public function getId()
    {
        return $this->id;
    }
    public function getName(): string
    {
        return $this->name;
    }
    public function getEmail(): string
    {
        return $this->email;
    }
    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }
    public function setRole(UserRole $role)
    {
        $this->role = $role;
    }
    public function getRole(): UserRole
    {
        return $this->role;
    }

    // Convert the object into an array to JSON Responses
    public function toArray(): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "role" => $this->role->value,
        ];
    }

    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
