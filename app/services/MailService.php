<?php

require_once __DIR__ . "/../config/config.php";

class MailService
{
    private ?string $lastError = null;

    public function getLastError(): ?string
    {
        return $this->lastError;
    }

    /**
     * Envía un email HTML.
     *
     * Uso:
     *   $mailer = new MailService();
     *   $mailer->send('cliente@email.com', 'Nombre', 'Asunto', '<p>Cuerpo HTML</p>');
     *   $mailer->send('cliente@email.com', 'Nombre', 'Asunto', '<p>Html</p>', ['/tmp/factura.pdf']);
     *
     * @param string   $toEmail      Email del destinatario
     * @param string   $toName       Nombre del destinatario
     * @param string   $subject      Asunto del email
     * @param string   $htmlBody     Cuerpo en HTML
     * @param string[] $attachments  Rutas absolutas de archivos adjuntos (opcional)
     */
    public function send(
        string $toEmail,
        string $toName,
        string $subject,
        string $htmlBody,
        array $attachments = []
    ): bool {
        $this->lastError = null;

        $autoload = dirname(__DIR__, 2) . "/vendor/autoload.php";
        if (!is_readable($autoload)) {
            $this->lastError = "DEPENDENCIES_NOT_INSTALLED";
            return false;
        }
        require_once $autoload;

        if (
            trim((string) SMTP_HOST) === "" ||
            trim((string) SMTP_USER) === "" ||
            trim((string) SMTP_PASS) === ""
        ) {
            $this->lastError = "SMTP_NOT_CONFIGURED";
            return false;
        }

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host     = SMTP_HOST;
            $mail->SMTPAuth = true;
            $mail->Username = SMTP_USER;
            $mail->Password = SMTP_PASS;
            $mail->Port     = (int) SMTP_PORT;

            $secure = strtolower((string) SMTP_SECURE);
            $mail->SMTPSecure = $secure === "ssl"
                ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
                : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;

            $mail->CharSet = "UTF-8";

            $fromEmail = trim((string) SMTP_FROM_EMAIL) !== "" ? SMTP_FROM_EMAIL : SMTP_USER;
            $fromName  = trim((string) SMTP_FROM_NAME)  !== "" ? SMTP_FROM_NAME  : APP_NAME;
            $mail->setFrom($fromEmail, $fromName);
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags($htmlBody);

            foreach ($attachments as $path) {
                if (is_readable($path)) {
                    $mail->addAttachment($path);
                }
            }

            $mail->send();
            return true;
        } catch (\Throwable $e) {
            error_log("[MailService] " . $e->getMessage());
            $this->lastError = "MAIL_SEND_FAILED";
            return false;
        }
    }
}
