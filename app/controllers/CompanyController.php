<?php

require_once __DIR__ . "/../services/CompanyService.php";
require_once __DIR__ . "/../services/EventService.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class CompanyController
{

    private ?CompanyService $companyService = null;
    private ?EventService $eventService = null;

    private function companies()
    {
        if ($this->companyService == null) {
            $this->companyService = new CompanyService();
        }
        return $this->companyService;
    }

    private function events()
    {
        if ($this->eventService == null) {
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

    public function showPage()
    {
        if (!$this->checkIfIsAdmin()) {
            header("Location: /login");
            exit;
        }

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0; // $id lo usa company_show, lo utilizará el JS

        require_once __DIR__ . "/../views/admin/company/company_show.php";
    }

    public function getOne()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
            return;
        }

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        if ($id <= 0) {
            JsonResponse::error("Invalid id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
            return;
        }

        $company = $this->companies()->getCompanyById($id)->toArray();
        if (!$company) {
            JsonResponse::error("Company not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
            return;
        }

        JsonResponse::success("Company", JsonCode::SUCCESSFULL, HttpStatus::OK, $company);
    }

    public function getEventsByCompany()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
            return;
        }

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        if ($id <= 0) {
            JsonResponse::error("Invalid company id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
            return;
        }

        $events = $this->events()->getEventsByCompanyId($id);
        JsonResponse::success("Company events", JsonCode::SUCCESSFULL, HttpStatus::OK, $events);
    }

    public function getAll()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error(
                "Permission denied",
                JsonCode::UNAUTHORIZED,
                HttpStatus::UNAUTHORIZED
            );
        }

        $c = $this->companies()->getAllCompanies();
        if (!$c) {
            JsonResponse::error(
                "Error obtaining the companies",
                JsonCode::ERROR_OBTAINING_COMPANIES_FROM_DB,
                HttpStatus::INTERNAL_SERVER_ERROR,
                []
            );
        }

        JsonResponse::success("Registered companies:", JsonCode::SUCCESSFULL, HttpStatus::OK, $c);
    }
}
