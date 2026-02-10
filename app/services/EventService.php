<?php

require_once __DIR__ . "/../repository/EventRepository.php";

class EventService
{
    private ?EventRepository $eventRepository = null;

    public function __construct()
    {
        $this->eventRepository = new EventRepository();
    }

    public function getEventsByCompanyId(int $id): ?array
    {
        try {
            return $this->eventRepository->findByCompanyId($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getAllEventsWithMeta(): ?array
    {
        try {
            return $this->eventRepository->getAllWithMeta();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getEventById(int $id): ?Event
    {
        try {
            return $this->eventRepository->findById($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function saveEvent(Event $event): bool
    {
        try {
            return $this->eventRepository->save($event);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function updateEvent(Event $event): bool
    {
        try {
            return $this->eventRepository->update($event);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function deleteEvent(int $id): bool
    {
        try {
            return $this->eventRepository->delete($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getEventTypes(): ?array
    {
        try {
            return $this->eventRepository->getEventTypes();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }
}
