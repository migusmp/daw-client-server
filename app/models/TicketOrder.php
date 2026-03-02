<?php

require_once __DIR__ . "/../utils/TicketOrderState.php";

class TicketOrder implements JsonSerializable
{
    private int $id_ticket = 0;              // id_ticket
    private int $id_evento = 0;              // id_evento
    private int $id_user = 0;                // id_user
    private float $total_pagado = 0.0;       // total_pagado
    private TicketOrderState $estado;        // estado
    private string $creado_at = '';          // creado_at
    private ?string $pagado_at = null;       // pagado_at

    public function __construct()
    {
        $this->estado = TicketOrderState::PENDING;
    }

    public function getIdTicket(): int
    {
        return $this->id_ticket;
    }

    public function setIdTicket(int $id_ticket): self
    {
        $this->id_ticket = $id_ticket;
        return $this;
    }

    public function getIdEvento(): int
    {
        return $this->id_evento;
    }

    public function setIdEvento(int $id_evento): self
    {
        $this->id_evento = $id_evento;
        return $this;
    }

    public function getIdUser(): int
    {
        return $this->id_user;
    }

    public function setIdUser(int $id_user): self
    {
        $this->id_user = $id_user;
        return $this;
    }

    public function getTotalPagado(): float
    {
        return $this->total_pagado;
    }

    public function setTotalPagado(float $total_pagado): self
    {
        $this->total_pagado = $total_pagado;
        return $this;
    }

    public function getEstado(): TicketOrderState
    {
        return $this->estado;
    }

    public function setEstado(TicketOrderState $estado): self
    {
        $this->estado = $estado;
        return $this;
    }

    public function getCreadoAt(): string
    {
        return $this->creado_at;
    }

    public function setCreadoAt(string $creado_at): self
    {
        $this->creado_at = $creado_at;
        return $this;
    }

    public function getPagadoAt(): ?string
    {
        return $this->pagado_at;
    }

    public function setPagadoAt(?string $pagado_at): self
    {
        $this->pagado_at = $pagado_at;
        return $this;
    }

    public function toArray(): array
    {
        return [
            "id_ticket" => $this->id_ticket,
            "id_evento" => $this->id_evento,
            "id_user" => $this->id_user,
            "total_pagado" => $this->total_pagado,
            "estado" => $this->estado->value,
            "creado_at" => $this->creado_at,
            "pagado_at" => $this->pagado_at,
        ];
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
