<?php
require_once __DIR__ . "/../core/Database.php";
require_once __DIR__ . "/../models/Company.php";

class CompanyRepository extends BaseRepository
{
    protected $table = "empresa";

    public function fromRow(array $row): Company
    {
        $c = new Company();
        $c->setId((int)$row["id_empresa"]);
        $c->setName($row["nombre"]);
        $c->setCity($row["ciudad"]);
        $c->setCreationYear((string)$row["anio_creacion"]);
        $c->setEmailPersonInCharge($row["email_responsable"]);
        $c->setNumberPersonInCharge($row["telefono_responsable"]);
        return $c;
    }

    public function getAll(): array
    {
        $this->db->query("SELECT * FROM {$this->table} ORDER BY id_empresa DESC");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findById(int $id): ?Company
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_empresa = :id
            LIMIT 1
        ");
        $this->db->bind(":id", $id);
        $this->db->execute();
        $row = $this->db->result();

        return $row ? $this->fromRow($row) : null;
    }

    public function findByName(string $name): array
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE nombre LIKE :name
            ORDER BY nombre ASC
        ");
        $this->db->bind(":name", "%" . trim($name) . "%");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findByCity(string $city): array
    {
        $this->db->query("
        SELECT * FROM {$this->table}
        WHERE ciudad LIKE :city
        ORDER BY nombre ASC
    ");
        $this->db->bind(":city", "%" . trim($city) . "%");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function existsByName(string $name): bool
    {
        $this->db->query("
        SELECT 1
        FROM {$this->table}
        WHERE nombre = :name
        LIMIT 1
    ");
        $this->db->bind(":name", trim($name));
        $this->db->execute();
        $row = $this->db->result();

        return $row !== null;
    }

    public function count(): int
    {
        $this->db->query("SELECT COUNT(*) AS total FROM {$this->table}");
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function save(Company $company): bool
    {
        $this->db->query("
            INSERT INTO {$this->table}
            (nombre, ciudad, anio_creacion, email_responsable, telefono_responsable)
            VALUES
            (:nombre, :ciudad, :anio_creacion, :email_responsable, :telefono_responsable)
        ");

        $this->db->bind(":nombre", $company->getName());
        $this->db->bind(":ciudad", $company->getCity());
        $this->db->bind(":anio_creacion", $company->getCreationYear());
        $this->db->bind(":email_responsable", $company->getEmailPersonInCharge());
        $this->db->bind(":telefono_responsable", $company->getNumberPersonInCharge());

        $this->db->execute();
        return true;
    }

    public function update(Company $company): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET
                nombre = :nombre,
                ciudad = :ciudad,
                anio_creacion = :anio_creacion,
                email_responsable = :email_responsable,
                telefono_responsable = :telefono_responsable
            WHERE id_empresa = :id_empresa
            LIMIT 1
        ");

        $this->db->bind(":nombre", $company->getName());
        $this->db->bind(":ciudad", $company->getCity());
        $this->db->bind(":anio_creacion", $company->getCreationYear());
        $this->db->bind(":email_responsable", $company->getEmailPersonInCharge());
        $this->db->bind(":telefono_responsable", $company->getNumberPersonInCharge());
        $this->db->bind(":id_empresa", $company->getId());

        $this->db->execute();
        return true;
    }

    public function delete(int $id): bool
    {
        $this->db->query("
            DELETE FROM {$this->table}
            WHERE id_empresa = :id
            LIMIT 1
        ");
        $this->db->bind(":id", $id);

        $this->db->execute();
        return true;
    }

    public function deleteWithEvents(int $idEmpresa): bool
    {
        $this->db->query("DELETE FROM evento WHERE id_empresa = :id_empresa");
        $this->db->bind(":id_empresa", $idEmpresa);
        $ok1 = $this->db->execute();

        if (!$ok1) {
            return false;
        }

        $this->db->query("DELETE FROM {$this->table} WHERE id_empresa = :id_empresa LIMIT 1");
        $this->db->bind(":id_empresa", $idEmpresa);

        $this->db->execute();
        return true;
    }


    public function saveOrUpdate(Company $company): bool
    {
        if ($company->getId() > 0) {
            return $this->update($company);
        }

        return $this->save($company);
    }
}
