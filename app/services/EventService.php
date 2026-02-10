<?php

require_once __DIR__ . "/../repository/EventRepository.php";

class EventService
{
    private ?EventRepository $eventRepository = null;

    public function __construct()
    {
        $this->eventRepository = new EventRepository();
    }

    public function getEventsByCompanyId(int $id): ?array {
        try {
            return $this->eventRepository->findByCompanyId($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }
}
