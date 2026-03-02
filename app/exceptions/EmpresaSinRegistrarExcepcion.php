<?php

class EmpresaSinRegistrarExcepcion extends Exception
{
    public function __construct(
        string $message = "La empresa organizadora no está registrada.",
        int $code = 0,
        ?Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}
