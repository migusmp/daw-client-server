<?php
class User extends Model
{
    protected $table = "users";

    private int|null $id;
    private string $name;
    private string $email;
    private string $passwordHash;

    public function __construct($name, $email, $password)
    {
        parent::__construct();

        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
    }

    private static function fromRow(array $row): User
    {
        $u = new User($row["name"], $row["email"], "");
        $u->id = (int)$row["id"];
        $u->passwordHash = $row["password_hash"];
        return $u;
    }

    public static function findById(int $id): ?User
    {
        $db = new Database();
        $db->query("SELECT * FROM users WHERE id = :id LIMIT 1");
        $db->bind(":id", $id);
        $row = $db->result();
        return $row ? self::fromRow($row) : null;
    }

    public static function findByEmail(string $email): ?User
    {
        $db = new Database();
        $db->query("SELECT * FROM users WHERE email = :email LIMIT 1");
        $db->bind(":email", $email);
        $row = $db->result();
        return $row ? self::fromRow($row) : null;
    }

    public function save(): bool
    {
        $this->db->query("
            INSERT INTO {$this->table} (name, email, password_hash)
            VALUES (:name, :email, :password_hash)    
        ");
        $this->db->bind(":name", $this->name);
        $this->db->bind(":email", $this->email);
        $this->db->bind(":password_hash", $this->passwordHash);

        $this->db->execute();

        $this->id = (int)$this->db->lastInsertId();
        return true;
    }

    public function delete(): bool
    {
        if ($this->id == null) return false;
        $this->db->query("
            DELETE FROM {$this->table} WHERE id = :id 
        ");
        $this->db->bind(":id", $this->id);
        $this->db->execute();

        $this->id = null;
        return true;
    }

    // SETTERS AND GETTERS
    public function setName(string $name)
    {
        $this->name = $name;
    }
    public function setEmail(string $email)
    {
        $this->email = $email;
    }
    public function setPasswordHash(string $password)
    {
        $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
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
}
