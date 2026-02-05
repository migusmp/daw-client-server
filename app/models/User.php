<?php
class User extends Model {
    protected $table = "users";

    private $id;
    private $name;
    private $email;
    private $passwordHash;

    public function __construct($name, $email, $password)
    {
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
    }
}