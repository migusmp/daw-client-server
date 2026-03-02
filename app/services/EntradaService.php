<?php

require_once __DIR__ . "/../models/Entrada.php";
require_once __DIR__ . "/../repository/EntradaRepository.php";
require_once __DIR__ . "/../repository/TicketOrderRepository.php";
require_once __DIR__ . "/../repository/EventRepository.php";
require_once __DIR__ . "/../repository/UserRepository.php";
require_once __DIR__ . "/../utils/EntradaState.php";
require_once __DIR__ . "/../utils/TicketOrderState.php";

class EntradaService
{
    private EntradaRepository $entradaRepository;
    private TicketOrderRepository $ticketRepository;
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private ?string $lastError = null;

    public function __construct()
    {
        $this->entradaRepository = new EntradaRepository();
        $this->ticketRepository = new TicketOrderRepository();
        $this->eventRepository = new EventRepository();
        $this->userRepository = new UserRepository();
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    private function clearError(): void
    {
        $this->lastError = null;
    }

    private function setError(string $error): void
    {
        $this->lastError = $error;
    }

    public function createEntrada(int $userId, int $eventId, ?int $ticketId, float $precioPagado): ?Entrada
    {
        $this->clearError();

        if ($userId <= 0 || $eventId <= 0 || $precioPagado < 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            if (!$this->userRepository->findById($userId)) {
                $this->setError("USER_NOT_FOUND");
                return null;
            }

            if (!$this->eventRepository->findById($eventId)) {
                $this->setError("EVENT_NOT_FOUND");
                return null;
            }

            if ($ticketId !== null) {
                $ticket = $this->ticketRepository->findById($ticketId);
                if (!$ticket) {
                    $this->setError("TICKET_NOT_FOUND");
                    return null;
                }

                if ($ticket->getEstado() === TicketOrderState::CANCELED) {
                    $this->setError("TICKET_CANCELED");
                    return null;
                }

                if ($ticket->getIdEvento() !== $eventId || $ticket->getIdUser() !== $userId) {
                    $this->setError("TICKET_MISMATCH");
                    return null;
                }
            }

            $capacity = $this->entradaRepository->getEventCapacity($eventId);
            if (!$capacity) {
                $this->setError("EVENT_NOT_FOUND");
                return null;
            }

            if ($capacity["aforo_actual"] >= $capacity["aforo_maximo"]) {
                $this->setError("EVENT_FULL");
                return null;
            }

            $qrToken = $this->generateUniqueQrToken();
            if ($qrToken === null) {
                $this->setError("QR_TOKEN_GENERATION_FAILED");
                return null;
            }

            $entrada = new Entrada();
            $entrada
                ->setIdUser($userId)
                ->setIdEvento($eventId)
                ->setIdTicket($ticketId)
                ->setQrToken($qrToken)
                ->setPrecioPagado($precioPagado)
                ->setEstado(EntradaState::VALID);

            $this->entradaRepository->save($entrada);
            $this->entradaRepository->incrementEventCapacity($eventId);

            return $this->entradaRepository->findById($entrada->getIdEntrada()) ?? $entrada;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function useEntrada(int $idEntrada): ?Entrada
    {
        $this->clearError();

        if ($idEntrada <= 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $entrada = $this->entradaRepository->findById($idEntrada);
            if (!$entrada) {
                $this->setError("ENTRADA_NOT_FOUND");
                return null;
            }

            if ($entrada->getEstado() !== EntradaState::VALID) {
                $this->setError("ENTRADA_NOT_VALID");
                return null;
            }

            $this->entradaRepository->updateState($idEntrada, EntradaState::USED);
            return $this->entradaRepository->findById($idEntrada);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function cancelEntrada(int $idEntrada): ?Entrada
    {
        $this->clearError();

        if ($idEntrada <= 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $entrada = $this->entradaRepository->findById($idEntrada);
            if (!$entrada) {
                $this->setError("ENTRADA_NOT_FOUND");
                return null;
            }

            if ($entrada->getEstado() === EntradaState::USED) {
                $this->setError("CANNOT_CANCEL_USED");
                return null;
            }

            if ($entrada->getEstado() === EntradaState::CANCELED) {
                $this->setError("ALREADY_CANCELED");
                return null;
            }

            $wasValid = $entrada->getEstado() === EntradaState::VALID;

            $this->entradaRepository->updateState($idEntrada, EntradaState::CANCELED);
            if ($wasValid) {
                $this->entradaRepository->decrementEventCapacity($entrada->getIdEvento());
            }

            return $this->entradaRepository->findById($idEntrada);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function getById(int $idEntrada): ?Entrada
    {
        $this->clearError();

        if ($idEntrada <= 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $entrada = $this->entradaRepository->findById($idEntrada);
            if (!$entrada) {
                $this->setError("ENTRADA_NOT_FOUND");
                return null;
            }

            return $entrada;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function list(
        ?int $ticketId = null,
        ?int $userId = null,
        ?int $eventId = null,
        ?EntradaState $state = null
    ): ?array {
        $this->clearError();

        try {
            return $this->entradaRepository->findByFilters($ticketId, $userId, $eventId, $state);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    private function generateUniqueQrToken(int $maxAttempts = 10): ?string
    {
        for ($i = 0; $i < $maxAttempts; $i++) {
            $token = $this->generateUuidV4();
            if (!$this->entradaRepository->existsByQrToken($token)) {
                return $token;
            }
        }

        return null;
    }

    private function generateUuidV4(): string
    {
        $bytes = random_bytes(16);
        $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
        $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
    }
}
