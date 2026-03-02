<?php

require_once __DIR__ . "/../models/TicketOrder.php";
require_once __DIR__ . "/../repository/TicketOrderRepository.php";
require_once __DIR__ . "/../repository/EventRepository.php";
require_once __DIR__ . "/../repository/UserRepository.php";
require_once __DIR__ . "/../utils/TicketOrderState.php";

class TicketOrderService
{
    private TicketOrderRepository $ticketRepository;
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private ?string $lastError = null;

    public function __construct()
    {
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

    public function createTicket(int $userId, int $eventId): ?TicketOrder
    {
        $this->clearError();

        if ($userId <= 0 || $eventId <= 0) {
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

            $ticket = new TicketOrder();
            $ticket
                ->setIdUser($userId)
                ->setIdEvento($eventId)
                ->setTotalPagado(0.00)
                ->setEstado(TicketOrderState::PENDING);

            $this->ticketRepository->save($ticket);
            return $this->ticketRepository->findById($ticket->getIdTicket()) ?? $ticket;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function markAsPaid(int $ticketId, float $totalPagado): ?TicketOrder
    {
        $this->clearError();

        if ($ticketId <= 0 || $totalPagado < 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $ticket = $this->ticketRepository->findById($ticketId);
            if (!$ticket) {
                $this->setError("TICKET_NOT_FOUND");
                return null;
            }

            if ($ticket->getEstado() === TicketOrderState::CANCELED) {
                $this->setError("TICKET_CANCELED");
                return null;
            }

            $this->ticketRepository->markAsPaid($ticketId, $totalPagado);
            return $this->ticketRepository->findById($ticketId);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function cancel(int $ticketId): ?TicketOrder
    {
        $this->clearError();

        if ($ticketId <= 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $ticket = $this->ticketRepository->findById($ticketId);
            if (!$ticket) {
                $this->setError("TICKET_NOT_FOUND");
                return null;
            }

            if ($ticket->getEstado() === TicketOrderState::CANCELED) {
                $this->setError("ALREADY_CANCELED");
                return null;
            }

            $this->ticketRepository->updateState($ticketId, TicketOrderState::CANCELED);
            return $this->ticketRepository->findById($ticketId);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function getById(int $ticketId): ?TicketOrder
    {
        $this->clearError();

        if ($ticketId <= 0) {
            $this->setError("INVALID_INPUT");
            return null;
        }

        try {
            $ticket = $this->ticketRepository->findById($ticketId);
            if (!$ticket) {
                $this->setError("TICKET_NOT_FOUND");
                return null;
            }

            return $ticket;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }

    public function list(?int $userId = null, ?int $eventId = null, ?TicketOrderState $state = null): ?array
    {
        $this->clearError();

        try {
            return $this->ticketRepository->findByFilters($userId, $eventId, $state);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->setError("INTERNAL_ERROR");
            return null;
        }
    }
}
