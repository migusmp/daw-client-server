<?php
class User extends Model
{
    protected $table = "users";

    private int|null $id;
    private string $name;
    private string $email;
    private string $passwordHash;
    private UserRole $role;

    public function __construct($name, $email, $password)
    {
        parent::__construct();

        $this->name = $name;
        $this->email = $email;
        $this->role = UserRole::USER;

        if ($password !== "") {
            $this->passwordHash = password_hash($password, PASSWORD_BCRYPT);
        }
    }

    private static function fromRow(array $row): User
    {
        $u = new User($row["name"], $row["email"], "");
        $u->id = (int)$row["id"];
        $u->passwordHash = $row["password_hash"];
        $u->role = UserRole::from($row["role"]);
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

    public static function existsEmail(string $email): bool
    {
        $db = new Database();
        $db->query("SELECT id FROM users WHERE email = :email LIMIT 1");
        $db->bind(":email", $email);
        $row = $db->result();
        return $row ? true : false;
    }

    public static function getAll(): array
    {
        $db = new Database();
        $db->query("SELECT * FROM users ORDER BY id DESC");
        $db->execute();
        $rows = $db->results();

        return array_map(fn($r) => self::fromRow($r), $rows);
    }

    public static function count(): int
    {
        $db = new Database();
        $db->query("SELECT COUNT(*) AS total FROM users");
        $row = $db->result();
        return (int)($row["total"] ?? 0);
    }

    public function verifyPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->passwordHash);
    }

    public function save(): bool
    {
        $this->db->query("
            INSERT INTO {$this->table} (name, email, password_hash, role)
            VALUES (:name, :email, :password_hash, :role)    
        ");
        $this->db->bind(":name", $this->name);
        $this->db->bind(":email", $this->email);
        $this->db->bind(":password_hash", $this->passwordHash);
        $this->db->bind(":role", $this->role->value);

        $this->db->execute();

        $this->id = (int)$this->db->lastInsertId();
        return true;
    }

    public function update(): bool
    {
        if ($this->id === null) return false;

        $this->db->query("
        UPDATE {$this->table}
        SET name = :name, email = :email, password_hash = :password_hash, role = :role
        WHERE id = :id
    ");
        $this->db->bind(":name", $this->name);
        $this->db->bind(":email", $this->email);
        $this->db->bind(":password_hash", $this->passwordHash);
        $this->db->bind(":role", $this->role->value);
        $this->db->bind(":id", $this->id);

        $this->db->execute();
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
}