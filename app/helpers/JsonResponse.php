<?php
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class JsonResponse {
    private static function send(string $status, string $msg, JsonCode $json_code, HttpStatus $httpStatus): void
    {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($httpStatus->value);

        echo json_encode([
            "status" => $status,
            "message" => $msg,
            "code" => $json_code->value
        ]);
        exit;
    }
    
    public static function error(string $msg, JsonCode $json_code, HttpStatus $httpStatus): void
    {
        self::send("error", $msg, $json_code, $httpStatus);
    }

    public static function success(string $msg, JsonCode $json_code, HttpStatus $httpStatus): void
    {
        self::send("success", $msg, $json_code, $httpStatus);
    }
}
