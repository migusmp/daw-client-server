<?php
class Request {
    public static function json(): array {
        $raw = file_get_contents('php://input');
        if ($raw === '' || $raw === false) return [];

        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}