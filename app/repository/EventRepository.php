<?php
require_once __DIR__ . "/../core/Database.php";
require_once __DIR__ . "/../models/Event.php";

class EventRepository extends BaseRepository
{
    protected $table = "evento";

    public function fromRow(array $row): Event
    {
        $e = new Event();
        $e->setId((int)$row['id_evento']);
        $e->setName($row['nombre']);
        $e->setEventType((int)$row['id_tipo']);
        $e->setIdCompany((int)$row['id_empresa']);
        $e->setPlace($row['lugar']);
        $e->setDate($row['fecha']);
        $e->setHour($row['hora']);
        $e->setPrice($row['precio']);
        $e->setMaximunCapacity($row['aforo_maximo']);
        $e->setPosterImage($row['imagen_cartel']);
        return $e;
    }

    public function findById(int $id): ?Event
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id = :id
        ");
        $this->db->bind(":id", $id);
        $row = $this->db->result();
        return $row ? $this->fromRow($row) : null;
    }

    public function findByEventType(string $eventType): array
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_tipo = :id_tipo
        ");
        $this->db->bind(":id_tipo", $eventType);
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findByCompanyName(string $companyName): array
    {
        $this->db->query("
        SELECT e.*
        FROM {$this->table} e
        INNER JOIN empresa em ON em.id_empresa = e.id_empresa
        WHERE em.nombre LIKE :companyName
    ");
        $this->db->bind(":companyName", "%" . $companyName . "%");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }
}
