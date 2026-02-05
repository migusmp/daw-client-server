<?php
require_once __DIR__ . "/BaseRepository.php";
require_once __DIR__ . "/../models/User.php";
require_once __DIR__ . "/../utils/UserRole.php";

class UserRepository extends BaseRepository
{
    protected $table = "users";

    private function fromRow(array $row): User
    {
        $u = new User($row["name"], $row["email"], "");
        $u->setId((int)$row["id"]);
        $u->setPasswordHashedFromDB($row["password_hash"]);
        $u->setRole(UserRole::from($row["role"]));
        return $u;
    }

    public function findById(int $id): ?User
    {
        $this->db->query("SELECT * FROM users WHERE id = :id LIMIT 1");
        $this->db->bind(":id", $id);
        $row = $this->db->result();
        return $row ? $this->fromRow($row) : null;
    }

    public function findByEmail(string $email): ?User
    {
        $this->db->query("SELECT * FROM users WHERE email = :email LIMIT 1");
        $this->db->bind(":email", $email);
        $row = $this->db->result();
        return $row ? $this->fromRow($row) : null;
    }

    public function existsEmail(string $email): bool
    {
        $this->db->query("SELECT id FROM users WHERE email = :email LIMIT 1");
        $this->db->bind(":email", $email);
        $row = $this->db->result();
        return $row ? true : false;
    }

    public function getAll(): array
    {
        $this->db->query("SELECT * FROM users ORDER BY id DESC");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function count(): int
    {
        $this->db->query("SELECT COUNT(*) AS total FROM users");
        $row = $this->db->result();
        return (int)($row["total"] ?? 0);
    }

    public function save(User $user): bool
    {
        $this->db->query("
            INSERT INTO {$this->table} (name, email, password_hash, role)
            VALUES (:name, :email, :password_hash, :role)    
        ");
        $this->db->bind(":name", $user->getName());
        $this->db->bind(":email", $user->getEmail());
        $this->db->bind(":password_hash", $user->getPasswordHash());
        $this->db->bind(":role", $user->getRole()->value);

        $this->db->execute();

        $user->setId((int)$this->db->lastInsertId());
        return true;
    }

    public function update(User $user): bool
    {
        if ($user->getId() === null) return false;

        $this->db->query("
        UPDATE {$this->table}
        SET name = :name, email = :email, password_hash = :password_hash, role = :role
        WHERE id = :id
    ");
        $this->db->bind(":name", $user->getName());
        $this->db->bind(":email", $user->getEmail());
        $this->db->bind(":password_hash", $user->getPasswordHash());
        $this->db->bind(":role", $user->getRole()->value);
        $this->db->bind(":id", $user->getId());

        $this->db->execute();
        return true;
    }

    public function delete(User $user): bool
    {
        if ($user->getId() == null) return false;
        $this->db->query("
            DELETE FROM {$this->table} WHERE id = :id 
        ");
        $this->db->bind(":id", $user->getId());
        $this->db->execute();

        $user->setId(null);
        return true;
    }
}
