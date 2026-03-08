<?php

class QrService
{
    private ?string $lastError = null;

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Devuelve un data URI base64 listo para usar en <img src="...">.
     *
     * Uso:
     *   $qr = new QrService();
     *   $src = $qr->getBase64('https://ejemplo.com');
     *   echo "<img src=\"{$src}\" />";
     *
     * @param string $data      Contenido a codificar en el QR
     * @param int    $pixelSize Tamaño en píxeles de cada celda del QR (por defecto 10)
     */
    public function getBase64(string $data, int $pixelSize = 10): ?string
    {
        $png = $this->getPngBinary($data, $pixelSize);
        if ($png === null) {
            return null;
        }

        return "data:image/png;base64," . base64_encode($png);
    }

    /**
     * Guarda el QR como archivo PNG y devuelve true si tuvo éxito.
     *
     * Uso:
     *   $qr = new QrService();
     *   $qr->savePng('contenido', '/tmp/mi_qr.png');
     *
     * @param string $data      Contenido a codificar
     * @param string $filePath  Ruta absoluta donde guardar el PNG
     * @param int    $pixelSize Tamaño de celda en píxeles
     */
    public function savePng(string $data, string $filePath, int $pixelSize = 10): bool
    {
        $png = $this->getPngBinary($data, $pixelSize);
        if ($png === null) {
            return false;
        }

        return file_put_contents($filePath, $png) !== false;
    }

    /**
     * Devuelve los bytes binarios del PNG del QR.
     *
     * @param string $data      Contenido a codificar
     * @param int    $pixelSize Tamaño de celda en píxeles
     */
    public function getPngBinary(string $data, int $pixelSize = 10): ?string
    {
        $this->lastError = null;

        $this->loadLibrary();

        if (!class_exists("TCPDF2DBarcode")) {
            $this->lastError = "QR_LIBRARY_NOT_FOUND";
            return null;
        }

        try {
            $barcode = new \TCPDF2DBarcode($data, "QRCODE,H");
            $png = $barcode->getBarcodePngData($pixelSize, $pixelSize, [0, 0, 0]);

            if (!$png) {
                $this->lastError = "QR_GENERATION_FAILED";
                return null;
            }

            return $png;
        } catch (\Throwable $e) {
            error_log("[QrService] " . $e->getMessage());
            $this->lastError = "QR_GENERATION_FAILED";
            return null;
        }
    }

    private function loadLibrary(): void
    {
        if (class_exists("TCPDF2DBarcode")) {
            return;
        }

        $direct = dirname(__DIR__, 2) . "/vendor/tecnickcom/tcpdf/tcpdf_barcodes_2d.php";
        if (is_readable($direct)) {
            require_once $direct;
            return;
        }

        $autoload = dirname(__DIR__, 2) . "/vendor/autoload.php";
        if (is_readable($autoload)) {
            require_once $autoload;
        }
    }
}
