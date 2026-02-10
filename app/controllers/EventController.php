<?php
require_once __DIR__ . "/../services/EventService.php";
require_once __DIR__ . "/../models/Event.php";
require_once __DIR__ . "/../helpers/Request.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class EventController
{
    private ?EventService $eventService = null;

    private function events(): EventService
    {
        if ($this->eventService === null) {
            $this->eventService = new EventService();
        }

        return $this->eventService;
    }

    private function checkIfIsAdmin(): bool
    {
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            return false;
        }

        return true;
    }

    private function normalizeEventPayload(array $data): array
    {
        $hour = trim((string)($data["hour"] ?? ""));
        if ($hour !== "" && strlen($hour) === 5) {
            $hour .= ":00";
        }

        return [
            "name" => trim((string)($data["name"] ?? "")),
            "id_event_type" => (int)($data["id_event_type"] ?? 0),
            "id_company" => (int)($data["id_company"] ?? 0),
            "place" => trim((string)($data["place"] ?? "")),
            "date" => trim((string)($data["date"] ?? "")),
            "hour" => $hour,
            "price" => isset($data["price"]) ? (float)$data["price"] : 0,
            "maximun_capacity" => (int)($data["maximun_capacity"] ?? 0),
            "poster_image" => trim((string)($data["poster_image"] ?? "")),
        ];
    }

    private function validateEventData(array $payload): void
    {
        if ($payload["name"] === "") {
            JsonResponse::error("Event name is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["id_event_type"] <= 0) {
            JsonResponse::error("Event type is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["id_company"] <= 0) {
            JsonResponse::error("Company is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["place"] === "") {
            JsonResponse::error("Event place is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["date"] === "") {
            JsonResponse::error("Event date is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["hour"] === "") {
            JsonResponse::error("Event hour is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["price"] < 0) {
            JsonResponse::error("Event price must be >= 0", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["maximun_capacity"] <= 0) {
            JsonResponse::error("Maximum capacity must be > 0", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }
    }

    private function buildEvent(array $payload, int $id = 0): Event
    {
        $event = new Event();

        if ($id > 0) {
            $event->setId($id);
        }

        return $event
            ->setName($payload["name"])
            ->setEventType($payload["id_event_type"])
            ->setIdCompany($payload["id_company"])
            ->setPlace($payload["place"])
            ->setDate($payload["date"])
            ->setHour($payload["hour"])
            ->setPrice($payload["price"])
            ->setMaximunCapacity($payload["maximun_capacity"])
            ->setPosterImage($payload["poster_image"]);
    }

    public function manageEvent()
    {
        if (!$this->checkIfIsAdmin()) {
            header("Location: /login");
            exit;
        }

        require_once __DIR__ . "/../views/admin/events/manage_events.php";
    }

    public function getAll()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $events = $this->events()->getAllEventsWithMeta();
        if ($events === null) {
            JsonResponse::error("Could not load events", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Events", JsonCode::SUCCESSFULL, HttpStatus::OK, $events);
    }

    public function getEventTypes()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $eventTypes = $this->events()->getEventTypes();
        if ($eventTypes === null) {
            JsonResponse::error("Could not load event types", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Event types", JsonCode::SUCCESSFULL, HttpStatus::OK, $eventTypes);
    }

    public function create()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $payload = $this->normalizeEventPayload(Request::json());
        $this->validateEventData($payload);

        $event = $this->buildEvent($payload);
        $ok = $this->events()->saveEvent($event);

        if (!$ok) {
            JsonResponse::error("Could not create event", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Event created", JsonCode::SUCCESSFULL, HttpStatus::CREATED);
    }

    public function update()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $data = Request::json();
        $id = (int)($data["id"] ?? 0);
        if ($id <= 0) {
            JsonResponse::error("Invalid event id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->events()->getEventById($id);
        if (!$current) {
            JsonResponse::error("Event not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        $payload = $this->normalizeEventPayload($data);
        $this->validateEventData($payload);

        $event = $this->buildEvent($payload, $id);
        $ok = $this->events()->updateEvent($event);

        if (!$ok) {
            JsonResponse::error("Could not update event", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Event updated", JsonCode::SUCCESSFULL, HttpStatus::OK);
    }

    public function delete()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        if ($id <= 0) {
            JsonResponse::error("Invalid event id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->events()->getEventById($id);
        if (!$current) {
            JsonResponse::error("Event not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        $ok = $this->events()->deleteEvent($id);
        if (!$ok) {
            JsonResponse::error(
                "Could not delete event. Remove related tickets first.",
                JsonCode::BAD_REQUEST,
                HttpStatus::CONFLICT
            );
        }

        JsonResponse::success("Event deleted", JsonCode::SUCCESSFULL, HttpStatus::OK);
    }
}
