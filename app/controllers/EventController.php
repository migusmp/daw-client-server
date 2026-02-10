<?php
class EventController
{

    private function checkIfIsAdmin(): bool
    {
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            return false;
        }

        return true;
    }

    public function manageEvent() {
        if (!$this->checkIfIsAdmin()) {
            header("Location: /login");
            exit;
        }

        require_once __DIR__ . "/../views/admin/events/manage_events.php";
    }
}
