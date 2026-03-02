<?php

require_once __DIR__ . "/../repository/TicketOrderRepository.php";
require_once __DIR__ . "/../repository/EntradaRepository.php";
require_once __DIR__ . "/../repository/EventRepository.php";
require_once __DIR__ . "/../repository/UserRepository.php";

class TicketDeliveryService
{
    private TicketOrderRepository $ticketRepository;
    private EntradaRepository $entradaRepository;
    private EventRepository $eventRepository;
    private UserRepository $userRepository;
    private ?string $lastError = null;

    public function __construct()
    {
        $this->ticketRepository = new TicketOrderRepository();
        $this->entradaRepository = new EntradaRepository();
        $this->eventRepository = new EventRepository();
        $this->userRepository = new UserRepository();
    }

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    private function setError(string $error): void
    {
        $this->lastError = $error;
    }

    public function deliverTicket(int $ticketId): bool
    {
        $this->lastError = null;

        if (!$this->loadDependencies()) {
            return false;
        }

        $ticket = $this->ticketRepository->findById($ticketId);
        if (!$ticket) {
            $this->setError("TICKET_NOT_FOUND");
            return false;
        }

        $event = $this->eventRepository->findById($ticket->getIdEvento());
        if (!$event) {
            $this->setError("EVENT_NOT_FOUND");
            return false;
        }

        $user = $this->userRepository->findById($ticket->getIdUser());
        if (!$user) {
            $this->setError("USER_NOT_FOUND");
            return false;
        }

        $entradas = $this->entradaRepository->findByFilters($ticketId, null, null, null);
        if (empty($entradas)) {
            $this->setError("ENTRADAS_NOT_FOUND");
            return false;
        }

        $generatedFiles = [];
        foreach ($entradas as $entrada) {
            $filePath = $this->generateEntradaPdf($ticket, $event, $user, $entrada);
            if (!$filePath) {
                $this->cleanupFiles($generatedFiles);
                return false;
            }
            $generatedFiles[] = $filePath;
        }

        $sendOk = $this->sendMailWithAttachments($user->getEmail(), $user->getName(), $ticketId, $generatedFiles);
        $this->cleanupFiles($generatedFiles);

        if (!$sendOk) {
            return false;
        }

        return true;
    }

    private function loadDependencies(): bool
    {
        $autoload = dirname(__DIR__, 2) . "/vendor/autoload.php";
        if (!is_readable($autoload)) {
            $this->setError("DEPENDENCIES_NOT_INSTALLED");
            return false;
        }

        require_once $autoload;

        if (!class_exists("\\PHPMailer\\PHPMailer\\PHPMailer") || !class_exists("\\TCPDF")) {
            $this->setError("DEPENDENCIES_MISSING");
            return false;
        }

        return true;
    }

    private function generateEntradaPdf($ticket, $event, $user, $entrada): ?string
    {
        try {
            $tmpDir = sys_get_temp_dir() . "/cityhall_tickets";
            if (!is_dir($tmpDir) && !mkdir($tmpDir, 0775, true) && !is_dir($tmpDir)) {
                $this->setError("TMP_DIR_NOT_WRITABLE");
                return null;
            }

            $filePath = $tmpDir . "/ticket_" . $ticket->getIdTicket() . "_entrada_" . $entrada->getIdEntrada() . ".pdf";

            $pdf = new \TCPDF("P", "mm", "A4", true, "UTF-8", false);
            $pdf->SetCreator(APP_NAME);
            $pdf->SetAuthor(APP_NAME);
            $pdf->SetTitle("Entrada #" . $entrada->getIdEntrada());
            $pdf->SetPrintHeader(false);
            $pdf->SetPrintFooter(false);
            $pdf->SetMargins(12, 12, 12);
            $pdf->SetAutoPageBreak(true, 12);
            $pdf->AddPage();

            $pdf->SetFont("helvetica", "B", 16);
            $pdf->Cell(0, 8, "Entrada de evento", 0, 1, "L");

            $pdf->SetFont("helvetica", "", 10);
            $pdf->Cell(0, 6, "Ticket #" . $ticket->getIdTicket(), 0, 1, "L");
            $pdf->Cell(0, 6, "Entrada #" . $entrada->getIdEntrada(), 0, 1, "L");

            $yStart = 34;
            $poster = $this->loadPosterBinaryFromPath($event->getPosterImage());
            if ($poster !== null) {
                try {
                    $pdf->Image(
                        "@" . $poster["data"],
                        12,
                        $yStart,
                        50,
                        68,
                        $poster["type"],
                        "",
                        "",
                        false,
                        300,
                        "",
                        false,
                        false,
                        0,
                        false,
                        false,
                        false
                    );
                } catch (Throwable $e) {
                    error_log("[TicketDelivery] Error renderizando imagen en PDF: " . $e->getMessage());
                    $this->drawPosterPlaceholder($pdf, $yStart);
                }
            } else {
                $this->drawPosterPlaceholder($pdf, $yStart);
            }

            $pdf->SetXY(68, $yStart);
            $pdf->SetFont("helvetica", "B", 13);
            $pdf->MultiCell(78, 7, $event->getName(), 0, "L", false, 1);

            $pdf->SetFont("helvetica", "", 10);
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Fecha: " . $event->getDate() . "  Hora: " . substr($event->getHour(), 0, 5), 0, 1, "L");
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Lugar: " . $event->getPlace(), 0, 1, "L");
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Precio: " . number_format($entrada->getPrecioPagado(), 2) . " EUR", 0, 1, "L");
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Titular: " . $user->getName(), 0, 1, "L");
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Email: " . $user->getEmail(), 0, 1, "L");
            $pdf->SetX(68);
            $pdf->Cell(78, 6, "Estado: " . $entrada->getEstado()->value, 0, 1, "L");

            $style = [
                "border" => 0,
                "padding" => 1,
                "fgcolor" => [0, 0, 0],
                "bgcolor" => false,
            ];

            $qrPayload = $this->buildEntradaQrPayload($entrada);
            $pdf->write2DBarcode($qrPayload, "QRCODE,H", 150, $yStart, 42, 42, $style, "N");
            $pdf->SetXY(150, $yStart + 44);
            $pdf->SetFont("helvetica", "", 8);
            $pdf->MultiCell(42, 8, $entrada->getQrToken(), 0, "C", false, 1);

            $pdf->SetXY(12, 108);
            $pdf->SetFont("helvetica", "", 9);
            $pdf->MultiCell(
                0,
                6,
                "Condiciones: esta entrada es personal e intransferible. Conserva este documento hasta la finalizacion del evento.",
                0,
                "L",
                false,
                1
            );

            $pdf->Output($filePath, "F");
            return $filePath;
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->setError("PDF_GENERATION_FAILED");
            return null;
        }
    }

    private function sendMailWithAttachments(string $toEmail, string $toName, int $ticketId, array $files): bool
    {
        if (trim((string)SMTP_HOST) === "" || trim((string)SMTP_USER) === "" || trim((string)SMTP_PASS) === "") {
            $this->setError("SMTP_NOT_CONFIGURED");
            return false;
        }

        $fromEmail = trim((string)SMTP_FROM_EMAIL) !== "" ? SMTP_FROM_EMAIL : SMTP_USER;
        $fromName = trim((string)SMTP_FROM_NAME) !== "" ? SMTP_FROM_NAME : APP_NAME;

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->Port = (int)SMTP_PORT;

            $secure = strtolower((string)SMTP_SECURE);
            if ($secure === "ssl") {
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } else {
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }

            $mail->CharSet = "UTF-8";
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail, $toName);
            $mail->isHTML(true);
            $mail->Subject = "Tus entradas - Ticket #" . $ticketId;
            $mail->Body = "
                <h2>Compra completada</h2>
                <p>Adjuntamos tus entradas en PDF con su codigo QR.</p>
                <p><strong>Ticket:</strong> #" . $ticketId . "</p>
                <p>Gracias por tu compra.</p>
            ";
            $mail->AltBody = "Compra completada. Adjuntamos tus entradas PDF con codigo QR. Ticket #" . $ticketId;

            foreach ($files as $filePath) {
                $mail->addAttachment($filePath);
            }

            $mail->send();
            return true;
        } catch (Throwable $e) {
            error_log($e->getMessage());
            $this->setError("MAIL_SEND_FAILED");
            return false;
        }
    }

    private function buildEntradaQrPayload($entrada): string
    {
        $payload = [
            "id_entrada" => $entrada->getIdEntrada(),
            "id_evento" => $entrada->getIdEvento(),
            "id_user" => $entrada->getIdUser(),
            "id_ticket" => $entrada->getIdTicket(),
            "qr_token" => $entrada->getQrToken(),
            "precio_pagado" => $entrada->getPrecioPagado(),
            "estado" => $entrada->getEstado()->value,
            "comprada_at" => $entrada->getCompradaAt(),
        ];

        $json = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false || trim($json) === "") {
            return (string)$entrada->getQrToken();
        }

        return $json;
    }

    private function loadPosterBinaryFromPath(string $posterImage): ?array
    {
        $path = $this->resolvePosterPath($posterImage);
        if ($path === null) {
            return null;
        }

        $bytes = @file_get_contents($path);
        if ($bytes === false || $bytes === "") {
            error_log("[TicketDelivery] Poster no legible: " . $path);
            return null;
        }

        $imgInfo = @getimagesize($path);
        if ($imgInfo === false || !isset($imgInfo[2])) {
            error_log("[TicketDelivery] Poster con formato inválido: " . $path);
            return null;
        }

        $type = match ((int)$imgInfo[2]) {
            IMAGETYPE_PNG => "PNG",
            IMAGETYPE_GIF => "GIF",
            default => "JPG",
        };

        return [
            "data" => $bytes,
            "type" => $type,
        ];
    }

    private function drawPosterPlaceholder($pdf, float $yStart): void
    {
        $pdf->Rect(12, $yStart, 50, 68);
        $pdf->SetXY(17, $yStart + 32);
        $pdf->Cell(40, 5, "Sin cartel", 0, 0, "C");
    }

    private function resolvePosterPath(string $posterImage): ?string
    {
        $posterImage = trim($posterImage);
        if ($posterImage === "") {
            error_log("[TicketDelivery] Poster path vacío en BBDD.");
            return null;
        }

        if (preg_match("/^https?:\\/\\//i", $posterImage)) {
            error_log("[TicketDelivery] Poster remoto no permitido: " . $posterImage);
            return null;
        }

        $root = dirname(__DIR__, 2);
        $relative = ltrim($posterImage, "/");
        $absolute = $root . "/public/" . $relative;
        if (is_readable($absolute)) {
            return $absolute;
        }

        error_log("[TicketDelivery] Poster no encontrado. imagen_cartel='" . $posterImage . "' esperado='" . $absolute . "'");
        return null;
    }

    private function cleanupFiles(array $files): void
    {
        foreach ($files as $filePath) {
            if (is_readable($filePath)) {
                @unlink($filePath);
            }
        }
    }
}
