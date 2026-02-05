<?php
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class JsonResponse {
    private static function send(string $status, string $msg, JsonCode $json_code, HttpStatus $httpStatus, ?array $data = null): void
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($httpStatus->value);

        $payload = [
            "status" => $status,
            "message" => $msg,
            "code" => $json_code->value
        ];
        if ($data !== null) {
            $payload["data"] = $data;
        }

        echo json_encode($payload);
        exit;
    }
    
    public static function error(string $msg, JsonCode $json_code, HttpStatus $httpStatus, ?array $data = null): void
    {
        self::send("error", $msg, $json_code, $httpStatus, $data);
    }

    public static function success(string $msg, JsonCode $json_code, HttpStatus $httpStatus, ?array $data = null): void
    {
        self::send("success", $msg, $json_code, $httpStatus, $data);
    }
}
