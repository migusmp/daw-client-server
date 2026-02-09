<?php

require_once __DIR__ . "/../core/Database.php";
require_once __DIR__ . "/../models/Ticket.php";
require_once __DIR__ . "/../utils/TicketState.php";

class TicketRepository extends BaseRepository
{
    protected $table = "entrada";

    public function fromRow(array $row): Ticket
    {
        $t = new Ticket();
        $t->setIdTicket((int)$row["id_entrada"]);
        $t->setIdEvent((int)$row["id_evento"]);
        $t->setIdUser((int)$row["id_user"]);
        $t->setQrToken($row["qr_token"]);
        $t->setPricePaid((float)$row["precio_pagado"]);
        $t->setTicketState(TicketState::from($row["estado"]));
        $t->setPurchasedAt($row["comprada_at"]);
        return $t;
    }

    public function getAll(): array
    {
        $this->db->query("SELECT * FROM {$this->table} ORDER BY id_entrada DESC");
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findById(int $id): ?Ticket
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_entrada = :id
            LIMIT 1
        ");
        $this->db->bind(":id", $id);
        $this->db->execute();
        $row = $this->db->result();

        return $row ? $this->fromRow($row) : null;
    }

    public function findByQrToken(string $qrToken): ?Ticket
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE qr_token = :qr_token
            LIMIT 1
        ");
        $this->db->bind(":qr_token", trim($qrToken));
        $this->db->execute();
        $row = $this->db->result();

        return $row ? $this->fromRow($row) : null;
    }

    public function findByUserId(int $userId): array
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_user = :id_user
            ORDER BY comprada_at DESC
        ");
        $this->db->bind(":id_user", $userId);
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findByEventId(int $eventId): array
    {
        $this->db->query("
            SELECT * FROM {$this->table}
            WHERE id_evento = :id_evento
            ORDER BY comprada_at DESC
        ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function findByUserAndState(int $userId, TicketState $state): array
    {
        $this->db->query("
        SELECT * FROM {$this->table}
        WHERE id_user = :id_user AND estado = :estado
        ORDER BY comprada_at DESC
    ");
        $this->db->bind(":id_user", $userId);
        $this->db->bind(":estado", $state->value);
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }

    public function countUsedByEvent(int $eventId): int
    {
        $this->db->query("
        SELECT COUNT(*) AS total
        FROM {$this->table}
        WHERE id_evento = :id_evento AND estado = :estado
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->bind(":estado", TicketState::USED->value);
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function countValidByEvent(int $eventId): int
    {
        $this->db->query("
        SELECT COUNT(*) AS total
        FROM {$this->table}
        WHERE id_evento = :id_evento AND estado = :estado
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->bind(":estado", TicketState::VALID->value);
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function countCanceledByEvent(int $eventId): int
    {
        $this->db->query("
        SELECT COUNT(*) AS total
        FROM {$this->table}
        WHERE id_evento = :id_evento AND estado = :estado
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->bind(":estado", TicketState::CANCELED->value);
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function countSoldByEvent(int $eventId): int
    {
        $this->db->query("
        SELECT COUNT(*) AS total
        FROM {$this->table}
        WHERE id_evento = :id_evento
          AND estado IN (:valid, :used)
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->bind(":valid", TicketState::VALID->value);
        $this->db->bind(":used", TicketState::USED->value);
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function canBuyTicket(int $eventId): bool
    {
        $this->db->query("
        SELECT aforo_maximo
        FROM evento
        WHERE id_evento = :id_evento
        LIMIT 1
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->execute();
        $row = $this->db->result();

        if (!$row) {
            return false;
        }

        $capacity = (int)$row["aforo_maximo"];

        $sold = $this->countSoldByEvent($eventId);

        return $sold < $capacity;
    }

    public function remainingCapacity(int $eventId): int
    {
        $this->db->query("
        SELECT aforo_maximo
        FROM evento
        WHERE id_evento = :id_evento
        LIMIT 1
    ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->execute();
        $row = $this->db->result();

        if (!$row) {
            return 0;
        }

        $capacity = (int)$row["aforo_maximo"];
        $sold = $this->countSoldByEvent($eventId);

        $remaining = $capacity - $sold;
        return $remaining > 0 ? $remaining : 0;
    }


    public function count(): int
    {
        $this->db->query("SELECT COUNT(*) AS total FROM {$this->table}");
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function countByEventId(int $eventId): int
    {
        $this->db->query("
            SELECT COUNT(*) AS total
            FROM {$this->table}
            WHERE id_evento = :id_evento
        ");
        $this->db->bind(":id_evento", $eventId);
        $this->db->execute();
        $row = $this->db->result();

        return (int)($row["total"] ?? 0);
    }

    public function save(Ticket $ticket): bool
    {
        $this->db->query("
            INSERT INTO {$this->table}
            (id_evento, id_user, qr_token, precio_pagado, estado)
            VALUES
            (:id_evento, :id_user, :qr_token, :precio_pagado, :estado)
        ");

        $this->db->bind(":id_evento", $ticket->getIdEvent());
        $this->db->bind(":id_user", $ticket->getIdUser());
        $this->db->bind(":qr_token", $ticket->getQrToken());
        $this->db->bind(":precio_pagado", $ticket->getPricePaid());
        $this->db->bind(":estado", $ticket->getTicketState()->value);

        $this->db->execute();
        return true;
    }

    public function updateState(int $ticketId, TicketState $state): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET estado = :estado
            WHERE id_entrada = :id_entrada
            LIMIT 1
        ");
        $this->db->bind(":estado", $state->value);
        $this->db->bind(":id_entrada", $ticketId);

        $this->db->execute();
        return true;
    }

    public function update(Ticket $ticket): bool
    {
        $this->db->query("
            UPDATE {$this->table}
            SET
                id_evento = :id_evento,
                id_user = :id_user,
                qr_token = :qr_token,
                precio_pagado = :precio_pagado,
                estado = :estado
            WHERE id_entrada = :id_entrada
            LIMIT 1
        ");

        $this->db->bind(":id_evento", $ticket->getIdEvent());
        $this->db->bind(":id_user", $ticket->getIdUser());
        $this->db->bind(":qr_token", $ticket->getQrToken());
        $this->db->bind(":precio_pagado", $ticket->getPricePaid());
        $this->db->bind(":estado", $ticket->getTicketState()->value);
        $this->db->bind(":id_entrada", $ticket->getIdTicket());

        $this->db->execute();
        return true;
    }

    public function delete(int $id): bool
    {
        $this->db->query("
            DELETE FROM {$this->table}
            WHERE id_entrada = :id
            LIMIT 1
        ");
        $this->db->bind(":id", $id);

        $this->db->execute();
        return true;
    }

    public function deleteByEvent(int $eventId): bool
    {
        $this->db->query("
            DELETE FROM {$this->table}
            WHERE id_evento = :id_evento
        ");
        $this->db->bind(":id_evento", $eventId);

        $this->db->execute();
        return true;
    }

    public function deleteByUser(int $userId): bool
    {
        $this->db->query("
            DELETE FROM {$this->table}
            WHERE id_user = :id_user
        ");
        $this->db->bind(":id_user", $userId);

        $this->db->execute();
        return true;
    }

    public function saveOrUpdate(Ticket $ticket): bool
    {
        if ($ticket->getIdTicket() > 0) {
            return $this->update($ticket);
        }

        return $this->save($ticket);
    }
}