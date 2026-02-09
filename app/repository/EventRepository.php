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

    public function getAll(): array
    {
        $this->db->query("SELECT * FROM {$this->table} ORDER BY id_evento DESC");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findById(int $id): ?Event
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_evento = :id
            LIMIT 1
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

    public function count(): int
    {
        $this->db->query("SELECT COUNT(*) AS total FROM {$this->table}");
        $row = $this->db->result();
        return (int)($row["total"] ?? 0);
    }

    public function save(Event $event): bool
    {
        $this->db->query("
        INSERT INTO {$this->table}
        (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
        VALUES
        (:nombre, :id_tipo, :id_empresa, :lugar, :fecha, :hora, :precio, :aforo_maximo, :imagen_cartel)
    ");

        $this->db->bind(":nombre", $event->getName());
        $this->db->bind(":id_tipo", $event->getEventType());
        $this->db->bind(":id_empresa", $event->getIdCompany());
        $this->db->bind(":lugar", $event->getPlace());
        $this->db->bind(":fecha", $event->getDate()); // "YYYY-MM-DD"
        $this->db->bind(":hora", $event->getHour());  // "HH:MM:SS"
        $this->db->bind(":precio", $event->getPrice());
        $this->db->bind(":aforo_maximo", $event->getMaximunCapacity());
        $this->db->bind(":imagen_cartel", $event->getPosterImage());

        $this->db->execute();

        $event->setId((int)$this->db->lastInsertId());
        return true;
    }

    public function update(Event $event): bool
    {
        $this->db->query("
        UPDATE {$this->table}
        SET
            nombre = :nombre,
            id_tipo = :id_tipo,
            id_empresa = :id_empresa,
            lugar = :lugar,
            fecha = :fecha,
            hora = :hora,
            precio = :precio,
            aforo_maximo = :aforo_maximo,
            imagen_cartel = :imagen_cartel
        WHERE id_evento = :id_evento
        LIMIT 1
    ");

        $this->db->bind(":nombre", $event->getName());
        $this->db->bind(":id_tipo", $event->getEventType());
        $this->db->bind(":id_empresa", $event->getIdCompany());
        $this->db->bind(":lugar", $event->getPlace());
        $this->db->bind(":fecha", $event->getDate());
        $this->db->bind(":hora", $event->getHour());
        $this->db->bind(":precio", $event->getPrice());
        $this->db->bind(":aforo_maximo", $event->getMaximunCapacity());
        $this->db->bind(":imagen_cartel", $event->getPosterImage());
        $this->db->bind(":id_evento", $event->getId());

        $this->db->execute();
        return true;
    }

    public function delete(int $id): bool
    {
        $this->db->query("
        DELETE FROM {$this->table}
        WHERE id_evento = :id
        LIMIT 1
    ");
        $this->db->bind(":id", $id);

        $this->db->execute();
        return true;
    }

    public function saveOrUpdate(Event $event): bool
    {
        if ($event->getId() > 0) {
            return $this->update($event);
        }

        return $this->save($event);
    }

    public function deleteByCompany(int $idEmpresa): bool
    {
        $this->db->query("
        DELETE FROM {$this->table}
        WHERE id_empresa = :id_empresa
    ");
        $this->db->bind(":id_empresa", $idEmpresa);

        $this->db->execute();
        return true;
    }

    public function deleteByEventType(int $idTipo): bool
    {
        $this->db->query("
        DELETE FROM {$this->table}
        WHERE id_tipo = :id_tipo
    ");
        $this->db->bind(":id_tipo", $idTipo);

        $this->db->execute();
        return true;
    }

    /**
     * Busca eventos aplicando filtros opcionales (tipo, empresa, rango de fechas y nombre),
     * y permite ordenar los resultados de forma segura mediante una whitelist.
     *
     * - Si un parámetro es null (o nombre vacío), ese filtro NO se aplica.
     * - El nombre se busca con coincidencia parcial (LIKE %texto%).
     * - orderBy y dir se validan para evitar SQL injection.
     *
     * @param ?int    $idTipo      ID del tipo de evento (tabla tipo_evento.id_tipo).
     * @param ?int    $idEmpresa   ID de la empresa organizadora (tabla empresa.id_empresa).
     * @param ?string $fechaDesde  Fecha mínima incluida (formato "YYYY-MM-DD").
     * @param ?string $fechaHasta  Fecha máxima incluida (formato "YYYY-MM-DD").
     * @param ?string $nombre      Texto a buscar dentro del nombre del evento (coincidencia parcial).
     * @param string  $orderBy     Campo por el que ordenar. Permitidos: fecha, hora, precio, nombre, aforo_maximo, id_evento.
     * @param string  $dir         Dirección de ordenación: "ASC" o "DESC".
     *
     * @return Event[] Array de eventos (objetos Event).
     */
    public function findByFilters(
        ?int $idTipo = null,
        ?int $idEmpresa = null,
        ?string $fechaDesde = null,
        ?string $fechaHasta = null,
        ?string $nombre = null,
        string $orderBy = "fecha",
        string $dir = "ASC"
    ): array {
        // Columnas permitidas
        $allowedOrderBy = ["fecha", "hora", "precio", "nombre", "aforo_maximo", "id_evento"];
        if (!in_array($orderBy, $allowedOrderBy, true)) {
            $orderBy = "fecha";
        }

        $dir = strtoupper($dir);
        if ($dir !== "ASC" && $dir !== "DESC") {
            $dir = "ASC";
        }

        $sql = "SELECT * FROM {$this->table} WHERE 1=1";

        if ($idTipo !== null) {
            $sql .= " AND id_tipo = :id_tipo";
        }

        if ($idEmpresa !== null) {
            $sql .= " AND id_empresa = :id_empresa";
        }

        if ($fechaDesde !== null) {
            $sql .= " AND fecha >= :fecha_desde";
        }

        if ($fechaHasta !== null) {
            $sql .= " AND fecha <= :fecha_hasta";
        }

        if ($nombre !== null && trim($nombre) !== "") {
            $sql .= " AND nombre LIKE :nombre";
        }

        $sql .= " ORDER BY {$orderBy} {$dir}";

        if ($orderBy === "fecha") {
            $sql .= ", hora {$dir}";
        }

        $this->db->query($sql);

        if ($idTipo !== null) {
            $this->db->bind(":id_tipo", $idTipo);
        }
        if ($idEmpresa !== null) {
            $this->db->bind(":id_empresa", $idEmpresa);
        }
        if ($fechaDesde !== null) {
            $this->db->bind(":fecha_desde", $fechaDesde);
        }
        if ($fechaHasta !== null) {
            $this->db->bind(":fecha_hasta", $fechaHasta);
        }
        if ($nombre !== null && trim($nombre) !== "") {
            $this->db->bind(":nombre", "%" . trim($nombre) . "%");
        }

        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }
}
