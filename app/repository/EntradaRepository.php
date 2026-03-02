<?php

require_once __DIR__ . "/BaseRepository.php";
require_once __DIR__ . "/../models/Entrada.php";
require_once __DIR__ . "/../utils/EntradaState.php";

class EntradaRepository extends BaseRepository
{
    protected $table = "entrada";

    public function fromRow(array $row): Entrada
    {
        $entrada = new Entrada();
        $entrada->setIdEntrada((int)$row["id_entrada"]);
        $entrada->setIdEvento((int)$row["id_evento"]);
        $entrada->setIdUser((int)$row["id_user"]);
        $entrada->setIdTicket($row["id_ticket"] !== null ? (int)$row["id_ticket"] : null);
        $entrada->setQrToken((string)$row["qr_token"]);
        $entrada->setPrecioPagado((float)$row["precio_pagado"]);
        $entrada->setEstado(EntradaState::from($row["estado"]));
        $entrada->setCompradaAt((string)$row["comprada_at"]);
        return $entrada;
    }

    public function findById(int $id): ?Entrada
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_entrada = :id_entrada
            LIMIT 1
        ");
        $this->db->bind(":id_entrada", $id);
        $row = $this->db->result();

        return $row ? $this->fromRow($row) : null;
    }

    public function findByFilters(
        ?int $ticketId = null,
        ?int $userId = null,
        ?int $eventId = null,
        ?EntradaState $state = null
    ): array {
        $sql = "SELECT * FROM {$this->table} WHERE 1=1";

        if ($ticketId !== null) {
            $sql .= " AND id_ticket = :id_ticket";
        }
        if ($userId !== null) {
            $sql .= " AND id_user = :id_user";
        }
        if ($eventId !== null) {
            $sql .= " AND id_evento = :id_evento";
        }
        if ($state !== null) {
            $sql .= " AND estado = :estado";
        }

        $sql .= " ORDER BY comprada_at DESC, id_entrada DESC";

        $this->db->query($sql);

        if ($ticketId !== null) {
            $this->db->bind(":id_ticket", $ticketId);
        }
        if ($userId !== null) {
            $this->db->bind(":id_user", $userId);
        }
        if ($eventId !== null) {
            $this->db->bind(":id_evento", $eventId);
        }
        if ($state !== null) {
            $this->db->bind(":estado", $state->value);
        }

        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($row) => $this->fromRow($row), $rows);
    }

    public function existsByQrToken(string $qrToken): bool
    {
        $this->db->query("
            SELECT id_entrada
            FROM {$this->table}
            WHERE qr_token = :qr_token
            LIMIT 1
        ");
        $this->db->bind(":qr_token", trim($qrToken));
        $row = $this->db->result();

        return $row ? true : false;
    }

    public function save(Entrada $entrada): bool
    {
        $this->db->query("
            INSERT INTO {$this->table}
            (id_evento, id_user, id_ticket, qr_token, precio_pagado, estado)
            VALUES
            (:id_evento, :id_user, :id_ticket, :qr_token, :precio_pagado, :estado)
        ");
        $this->db->bind(":id_evento", $entrada->getIdEvento());
        $this->db->bind(":id_user", $entrada->getIdUser());
        $this->db->bind(":id_ticket", $entrada->getIdTicket());
        $this->db->bind(":qr_token", $entrada->getQrToken());
        $this->db->bind(":precio_pagado", $entrada->getPrecioPagado());
        $this->db->bind(":estado", $entrada->getEstado()->value);

        $this->db->execute();
        $entrada->setIdEntrada((int)$this->db->lastInsertId());
        return true;
    }

    public function updateState(int $idEntrada, EntradaState $state): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET estado = :estado
            WHERE id_entrada = :id_entrada
            LIMIT 1
        ");
        $this->db->bind(":estado", $state->value);
        $this->db->bind(":id_entrada", $idEntrada);

        $this->db->execute();
        return true;
    }

    public function getEventCapacity(int $idEvento): ?array
    {
        $this->db->query("
            SELECT aforo_maximo, aforo_actual
            FROM evento
            WHERE id_evento = :id_evento
            LIMIT 1
        ");
        $this->db->bind(":id_evento", $idEvento);
        $row = $this->db->result();

        if (!$row) {
            return null;
        }

        return [
            "aforo_maximo" => (int)$row["aforo_maximo"],
            "aforo_actual" => (int)$row["aforo_actual"],
        ];
    }

    public function incrementEventCapacity(int $idEvento): bool
    {
        $this->db->query("
            UPDATE evento
            SET aforo_actual = aforo_actual + 1
            WHERE id_evento = :id_evento
              AND aforo_actual < aforo_maximo
            LIMIT 1
        ");
        $this->db->bind(":id_evento", $idEvento);
        $this->db->execute();
        return true;
    }

    public function decrementEventCapacity(int $idEvento): bool
    {
        $this->db->query("
            UPDATE evento
            SET aforo_actual = IF(aforo_actual > 0, aforo_actual - 1, 0)
            WHERE id_evento = :id_evento
            LIMIT 1
        ");
        $this->db->bind(":id_evento", $idEvento);
        $this->db->execute();
        return true;
    }
}
