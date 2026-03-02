<?php

require_once __DIR__ . "/../services/TicketOrderService.php";
require_once __DIR__ . "/../helpers/Request.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";
require_once __DIR__ . "/../utils/TicketOrderState.php";

class TicketController
{
    private ?TicketOrderService $ticketService = null;

    private function tickets(): TicketOrderService
    {
        if ($this->ticketService === null) {
            $this->ticketService = new TicketOrderService();
        }

        return $this->ticketService;
    }

    private function isAdmin(): bool
    {
        return isset($_SESSION["user_role"]) && $_SESSION["user_role"] === "ADMIN";
    }

    private function requireAuthenticatedUserId(): int
    {
        $userId = isset($_SESSION["user_id"]) ? (int)$_SESSION["user_id"] : 0;
        if ($userId <= 0) {
            JsonResponse::error("Not authenticated", JsonCode::NOT_AUTHENTICATED, HttpStatus::UNAUTHORIZED);
        }

        return $userId;
    }

    private function respondTicketServiceError(string $defaultMessage): void
    {
        $error = $this->tickets()->getLastError();

        if ($error === "INVALID_INPUT") {
            JsonResponse::error("Invalid ticket data", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($error === "USER_NOT_FOUND" || $error === "EVENT_NOT_FOUND" || $error === "TICKET_NOT_FOUND") {
            JsonResponse::error("Ticket resource not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        if ($error === "TICKET_CANCELED" || $error === "ALREADY_CANCELED") {
            JsonResponse::error("Ticket state does not allow this operation", JsonCode::BAD_REQUEST, HttpStatus::CONFLICT);
        }

        JsonResponse::error($defaultMessage, JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
    }

    public function create(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();

        $idEvento = (int)($data["id_evento"] ?? 0);
        $idUser = isset($data["id_user"]) ? (int)$data["id_user"] : $sessionUserId;

        if ($idEvento <= 0 || $idUser <= 0) {
            JsonResponse::error("id_evento and id_user are required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if (!$this->isAdmin() && $idUser !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $ticket = $this->tickets()->createTicket($idUser, $idEvento);
        if (!$ticket) {
            $this->respondTicketServiceError("Could not create ticket");
        }

        JsonResponse::success("Ticket created", JsonCode::SUCCESSFULL, HttpStatus::CREATED, $ticket->toArray());
    }

    public function pay(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();

        $idTicket = (int)($data["id_ticket"] ?? 0);
        $totalPagado = isset($data["total_pagado"]) ? (float)$data["total_pagado"] : -1;

        if ($idTicket <= 0 || $totalPagado < 0) {
            JsonResponse::error("id_ticket and total_pagado are required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->tickets()->getById($idTicket);
        if (!$current) {
            $this->respondTicketServiceError("Ticket not found");
        }

        if (!$this->isAdmin() && $current->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $updated = $this->tickets()->markAsPaid($idTicket, $totalPagado);
        if (!$updated) {
            $this->respondTicketServiceError("Could not mark ticket as paid");
        }

        $data = $updated->toArray();
        $warning = $this->tickets()->getLastWarning();
        if ($warning !== null) {
            $data["delivery_warning"] = $warning;
        }

        JsonResponse::success("Ticket paid", JsonCode::SUCCESSFULL, HttpStatus::OK, $data);
    }

    public function cancel(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();
        $idTicket = (int)($data["id_ticket"] ?? 0);

        if ($idTicket <= 0) {
            JsonResponse::error("id_ticket is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->tickets()->getById($idTicket);
        if (!$current) {
            $this->respondTicketServiceError("Ticket not found");
        }

        if (!$this->isAdmin() && $current->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $updated = $this->tickets()->cancel($idTicket);
        if (!$updated) {
            $this->respondTicketServiceError("Could not cancel ticket");
        }

        JsonResponse::success("Ticket canceled", JsonCode::SUCCESSFULL, HttpStatus::OK, $updated->toArray());
    }

    public function getOne(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $idTicket = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($idTicket <= 0) {
            JsonResponse::error("Invalid ticket id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $ticket = $this->tickets()->getById($idTicket);
        if (!$ticket) {
            $this->respondTicketServiceError("Ticket not found");
        }

        if (!$this->isAdmin() && $ticket->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        JsonResponse::success("Ticket", JsonCode::SUCCESSFULL, HttpStatus::OK, $ticket->toArray());
    }

    public function getAll(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();

        $idUser = isset($_GET["id_user"]) ? (int)$_GET["id_user"] : null;
        $idEvento = isset($_GET["id_evento"]) ? (int)$_GET["id_evento"] : null;
        $estadoRaw = trim((string)($_GET["estado"] ?? ""));

        if ($idUser !== null && $idUser <= 0) {
            JsonResponse::error("Invalid id_user", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($idEvento !== null && $idEvento <= 0) {
            JsonResponse::error("Invalid id_evento", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if (!$this->isAdmin()) {
            if ($idUser !== null && $idUser !== $sessionUserId) {
                JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
            }
            $idUser = $sessionUserId;
        }

        $estado = null;
        if ($estadoRaw !== "") {
            try {
                $estado = TicketOrderState::from(strtoupper($estadoRaw));
            } catch (ValueError $e) {
                JsonResponse::error("Invalid estado value", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
            }
        }

        $tickets = $this->tickets()->list($idUser, $idEvento, $estado);
        if ($tickets === null) {
            $this->respondTicketServiceError("Could not load tickets");
        }

        $data = array_map(fn($ticket) => $ticket->toArray(), $tickets);
        JsonResponse::success("Tickets", JsonCode::SUCCESSFULL, HttpStatus::OK, $data);
    }
}
