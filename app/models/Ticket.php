<?php

require_once __DIR__ . "/../utils/TicketState.php";

class Ticket
{
    private int $id_ticket;         // id_entrada
    private int $id_event;          // id_evento
    private int $id_user;           // id_user
    private string $qr_token;       // qr_token
    private float $price_paid;      // precio_pagado
    private TicketState $ticket_state; // estado
    private string $purchased_at;   // comprada_at

    public function __construct() {}

    public function getIdTicket(): int
    {
        return $this->id_ticket;
    }

    public function setIdTicket(int $id_ticket): self
    {
        $this->id_ticket = $id_ticket;
        return $this;
    }

    public function getIdEvent(): int
    {
        return $this->id_event;
    }

    public function setIdEvent(int $id_event): self
    {
        $this->id_event = $id_event;
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

    public function getQrToken(): string
    {
        return $this->qr_token;
    }

    public function setQrToken(string $qr_token): self
    {
        $this->qr_token = $qr_token;
        return $this;
    }

    public function getPricePaid(): float
    {
        return $this->price_paid;
    }

    public function setPricePaid(float $price_paid): self
    {
        $this->price_paid = $price_paid;
        return $this;
    }

    public function getTicketState(): TicketState
    {
        return $this->ticket_state;
    }

    public function setTicketState(TicketState $ticket_state): self
    {
        $this->ticket_state = $ticket_state;
        return $this;
    }

    public function getPurchasedAt(): string
    {
        return $this->purchased_at;
    }

    public function setPurchasedAt(string $purchased_at): self
    {
        $this->purchased_at = $purchased_at;
        return $this;
    }

    public function toArray(): array
    {
        return [
            "id_ticket" => $this->id_ticket,
            "id_event" => $this->id_event,
            "id_user" => $this->id_user,
            "qr_token" => $this->qr_token,
            "price_paid" => $this->price_paid,
            "ticket_state" => $this->ticket_state->value, // enum string: VALIDA/CANCELADA/USADA
            "purchased_at" => $this->purchased_at,
        ];
    }
}