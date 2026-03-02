<?php

require_once __DIR__ . "/../services/EntradaService.php";
require_once __DIR__ . "/../helpers/Request.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";
require_once __DIR__ . "/../utils/EntradaState.php";

class EntradaController
{
    private ?EntradaService $entradaService = null;

    private function entradas(): EntradaService
    {
        if ($this->entradaService === null) {
            $this->entradaService = new EntradaService();
        }

        return $this->entradaService;
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

    private function respondEntradaServiceError(string $defaultMessage): void
    {
        $error = $this->entradas()->getLastError();

        if ($error === "INVALID_INPUT") {
            JsonResponse::error("Invalid entrada data", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if (
            $error === "USER_NOT_FOUND" ||
            $error === "EVENT_NOT_FOUND" ||
            $error === "TICKET_NOT_FOUND" ||
            $error === "ENTRADA_NOT_FOUND"
        ) {
            JsonResponse::error("Entrada resource not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        if ($error === "EVENT_FULL") {
            JsonResponse::error("Event has no remaining capacity", JsonCode::BAD_REQUEST, HttpStatus::CONFLICT);
        }

        if (
            $error === "TICKET_CANCELED" ||
            $error === "TICKET_MISMATCH" ||
            $error === "ENTRADA_NOT_VALID" ||
            $error === "CANNOT_CANCEL_USED" ||
            $error === "ALREADY_CANCELED"
        ) {
            JsonResponse::error("Entrada state does not allow this operation", JsonCode::BAD_REQUEST, HttpStatus::CONFLICT);
        }

        JsonResponse::error($defaultMessage, JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
    }

    public function create(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();

        $idEvento = (int)($data["id_evento"] ?? 0);
        $idUser = isset($data["id_user"]) ? (int)$data["id_user"] : $sessionUserId;
        $idTicket = isset($data["id_ticket"]) && $data["id_ticket"] !== "" ? (int)$data["id_ticket"] : null;
        $precioPagado = isset($data["precio_pagado"]) ? (float)$data["precio_pagado"] : -1;

        if ($idEvento <= 0 || $idUser <= 0 || $precioPagado < 0) {
            JsonResponse::error("id_evento, id_user and precio_pagado are required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($idTicket !== null && $idTicket <= 0) {
            JsonResponse::error("id_ticket must be > 0 when provided", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if (!$this->isAdmin() && $idUser !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $entrada = $this->entradas()->createEntrada($idUser, $idEvento, $idTicket, $precioPagado);
        if (!$entrada) {
            $this->respondEntradaServiceError("Could not create entrada");
        }

        JsonResponse::success("Entrada created", JsonCode::SUCCESSFULL, HttpStatus::CREATED, $entrada->toArray());
    }

    public function use(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();
        $idEntrada = (int)($data["id_entrada"] ?? 0);

        if ($idEntrada <= 0) {
            JsonResponse::error("id_entrada is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->entradas()->getById($idEntrada);
        if (!$current) {
            $this->respondEntradaServiceError("Entrada not found");
        }

        if (!$this->isAdmin() && $current->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $updated = $this->entradas()->useEntrada($idEntrada);
        if (!$updated) {
            $this->respondEntradaServiceError("Could not use entrada");
        }

        JsonResponse::success("Entrada used", JsonCode::SUCCESSFULL, HttpStatus::OK, $updated->toArray());
    }

    public function cancel(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $data = Request::json();
        $idEntrada = (int)($data["id_entrada"] ?? 0);

        if ($idEntrada <= 0) {
            JsonResponse::error("id_entrada is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->entradas()->getById($idEntrada);
        if (!$current) {
            $this->respondEntradaServiceError("Entrada not found");
        }

        if (!$this->isAdmin() && $current->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $updated = $this->entradas()->cancelEntrada($idEntrada);
        if (!$updated) {
            $this->respondEntradaServiceError("Could not cancel entrada");
        }

        JsonResponse::success("Entrada canceled", JsonCode::SUCCESSFULL, HttpStatus::OK, $updated->toArray());
    }

    public function getOne(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();
        $idEntrada = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

        if ($idEntrada <= 0) {
            JsonResponse::error("Invalid entrada id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $entrada = $this->entradas()->getById($idEntrada);
        if (!$entrada) {
            $this->respondEntradaServiceError("Entrada not found");
        }

        if (!$this->isAdmin() && $entrada->getIdUser() !== $sessionUserId) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        JsonResponse::success("Entrada", JsonCode::SUCCESSFULL, HttpStatus::OK, $entrada->toArray());
    }

    public function getAll(): void
    {
        $sessionUserId = $this->requireAuthenticatedUserId();

        $idTicket = isset($_GET["id_ticket"]) ? (int)$_GET["id_ticket"] : null;
        $idUser = isset($_GET["id_user"]) ? (int)$_GET["id_user"] : null;
        $idEvento = isset($_GET["id_evento"]) ? (int)$_GET["id_evento"] : null;
        $estadoRaw = trim((string)($_GET["estado"] ?? ""));

        if ($idTicket !== null && $idTicket <= 0) {
            JsonResponse::error("Invalid id_ticket", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

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
                $estado = EntradaState::from(strtoupper($estadoRaw));
            } catch (ValueError $e) {
                JsonResponse::error("Invalid estado value", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
            }
        }

        $entradas = $this->entradas()->list($idTicket, $idUser, $idEvento, $estado);
        if ($entradas === null) {
            $this->respondEntradaServiceError("Could not load entradas");
        }

        $data = array_map(fn($entrada) => $entrada->toArray(), $entradas);
        JsonResponse::success("Entradas", JsonCode::SUCCESSFULL, HttpStatus::OK, $data);
    }
}
