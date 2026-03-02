<?php

require_once __DIR__ . "/../utils/EntradaState.php";

class Entrada implements JsonSerializable
{
    private int $id_entrada = 0;             // id_entrada
    private int $id_evento = 0;              // id_evento
    private int $id_user = 0;                // id_user
    private ?int $id_ticket = null;          // id_ticket
    private string $qr_token = '';           // qr_token
    private float $precio_pagado = 0.0;      // precio_pagado
    private EntradaState $estado;            // estado
    private string $comprada_at = '';        // comprada_at

    public function __construct()
    {
        $this->estado = EntradaState::VALID;
    }

    public function getIdEntrada(): int
    {
        return $this->id_entrada;
    }

    public function setIdEntrada(int $id_entrada): self
    {
        $this->id_entrada = $id_entrada;
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

    public function getIdTicket(): ?int
    {
        return $this->id_ticket;
    }

    public function setIdTicket(?int $id_ticket): self
    {
        $this->id_ticket = $id_ticket;
        return $this;
    }

    public function getQrToken(): string
    {
        return $this->qr_token;
    }

    public function setQrToken(string $qr_token): self
    {
        $this->qr_token = $qr_token;
        return $this;
    }

    public function getPrecioPagado(): float
    {
        return $this->precio_pagado;
    }

    public function setPrecioPagado(float $precio_pagado): self
    {
        $this->precio_pagado = $precio_pagado;
        return $this;
    }

    public function getEstado(): EntradaState
    {
        return $this->estado;
    }

    public function setEstado(EntradaState $estado): self
    {
        $this->estado = $estado;
        return $this;
    }

    public function getCompradaAt(): string
    {
        return $this->comprada_at;
    }

    public function setCompradaAt(string $comprada_at): self
    {
        $this->comprada_at = $comprada_at;
        return $this;
    }

    public function toArray(): array
    {
        return [
            "id_entrada" => $this->id_entrada,
            "id_evento" => $this->id_evento,
            "id_user" => $this->id_user,
            "id_ticket" => $this->id_ticket,
            "qr_token" => $this->qr_token,
            "precio_pagado" => $this->precio_pagado,
            "estado" => $this->estado->value,
            "comprada_at" => $this->comprada_at,
        ];
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
