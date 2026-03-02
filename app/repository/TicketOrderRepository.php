<?php

require_once __DIR__ . "/BaseRepository.php";
require_once __DIR__ . "/../models/TicketOrder.php";
require_once __DIR__ . "/../utils/TicketOrderState.php";

class TicketOrderRepository extends BaseRepository
{
    protected $table = "tickets";

    public function fromRow(array $row): TicketOrder
    {
        $ticket = new TicketOrder();
        $ticket->setIdTicket((int)$row["id_ticket"]);
        $ticket->setIdEvento((int)$row["id_evento"]);
        $ticket->setIdUser((int)$row["id_user"]);
        $ticket->setTotalPagado((float)$row["total_pagado"]);
        $ticket->setEstado(TicketOrderState::from($row["estado"]));
        $ticket->setCreadoAt((string)$row["creado_at"]);
        $ticket->setPagadoAt($row["pagado_at"] !== null ? (string)$row["pagado_at"] : null);
        return $ticket;
    }

    public function findById(int $id): ?TicketOrder
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_ticket = :id_ticket
            LIMIT 1
        ");
        $this->db->bind(":id_ticket", $id);
        $row = $this->db->result();

        return $row ? $this->fromRow($row) : null;
    }

    public function findByFilters(?int $userId = null, ?int $eventId = null, ?TicketOrderState $state = null): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE 1=1";

        if ($userId !== null) {
            $sql .= " AND id_user = :id_user";
        }
        if ($eventId !== null) {
            $sql .= " AND id_evento = :id_evento";
        }
        if ($state !== null) {
            $sql .= " AND estado = :estado";
        }

        $sql .= " ORDER BY creado_at DESC, id_ticket DESC";

        $this->db->query($sql);

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

    public function save(TicketOrder $ticket): bool
    {
        $this->db->query("
            INSERT INTO {$this->table} (id_evento, id_user, total_pagado, estado)
            VALUES (:id_evento, :id_user, :total_pagado, :estado)
        ");
        $this->db->bind(":id_evento", $ticket->getIdEvento());
        $this->db->bind(":id_user", $ticket->getIdUser());
        $this->db->bind(":total_pagado", $ticket->getTotalPagado());
        $this->db->bind(":estado", $ticket->getEstado()->value);

        $this->db->execute();
        $ticket->setIdTicket((int)$this->db->lastInsertId());
        return true;
    }

    public function markAsPaid(int $ticketId, float $totalPagado): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET
                total_pagado = :total_pagado,
                estado = :estado,
                pagado_at = CURRENT_TIMESTAMP
            WHERE id_ticket = :id_ticket
            LIMIT 1
        ");
        $this->db->bind(":total_pagado", $totalPagado);
        $this->db->bind(":estado", TicketOrderState::PAID->value);
        $this->db->bind(":id_ticket", $ticketId);

        $this->db->execute();
        return true;
    }

    public function updateState(int $ticketId, TicketOrderState $state): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET estado = :estado
            WHERE id_ticket = :id_ticket
            LIMIT 1
        ");
        $this->db->bind(":estado", $state->value);
        $this->db->bind(":id_ticket", $ticketId);

        $this->db->execute();
        return true;
    }
}
