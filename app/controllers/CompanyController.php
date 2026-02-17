<?php

require_once __DIR__ . "/../services/CompanyService.php";
require_once __DIR__ . "/../services/EventService.php";
require_once __DIR__ . "/../models/Company.php";
require_once __DIR__ . "/../helpers/Request.php";
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

    private function normalizeCompanyPayload(array $data): array
    {
        return [
            "name" => trim((string)($data["name"] ?? "")),
            "city" => trim((string)($data["city"] ?? "")),
            "creation_year" => (int)($data["creation_year"] ?? 0),
            "contact_email" => trim((string)($data["contact_email"] ?? "")),
            "contact_number" => trim((string)($data["contact_number"] ?? "")),
        ];
    }

    private function validateCompanyData(array $payload): void
    {
        if ($payload["name"] === "") {
            JsonResponse::error("Company name is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["city"] === "") {
            JsonResponse::error("Company city is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["creation_year"] < 1800 || $payload["creation_year"] > 2100) {
            JsonResponse::error("Creation year is invalid", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if (!filter_var($payload["contact_email"], FILTER_VALIDATE_EMAIL)) {
            JsonResponse::error("Contact email is invalid", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        if ($payload["contact_number"] === "") {
            JsonResponse::error("Contact phone is required", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }
    }

    private function buildCompany(array $payload, int $id = 0): Company
    {
        $company = new Company();

        if ($id > 0) {
            $company->setId($id);
        }

        return $company
            ->setName($payload["name"])
            ->setCity($payload["city"])
            ->setCreationYear((string)$payload["creation_year"])
            ->setEmailPersonInCharge($payload["contact_email"])
            ->setNumberPersonInCharge($payload["contact_number"]);
    }

    public function index()
    {
        if (!$this->checkIfIsAdmin()) {
            header("Location: /login");
            exit;
        }

        require_once __DIR__ . "/../views/home.php";
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

    public function manageCompanies()
    {
        if (!$this->checkIfIsAdmin()) {
            header("Location: /login");
            exit;
        }

        require_once __DIR__ . "/../views/admin/company/manage_companies.php";
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

        $companyModel = $this->companies()->getCompanyById($id);
        $company = $companyModel ? $companyModel->toArray() : null;
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

        $c = $this->companies()->getAllCompaniesWithEvents();
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

    public function create()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $payload = $this->normalizeCompanyPayload(Request::json());
        $this->validateCompanyData($payload);

        $company = $this->buildCompany($payload);
        $ok = $this->companies()->saveCompany($company);

        if (!$ok) {
            JsonResponse::error("Could not create company", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Company created", JsonCode::SUCCESSFULL, HttpStatus::CREATED);
    }

    public function update()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $data = Request::json();
        $id = (int)($data["id"] ?? 0);
        if ($id <= 0) {
            JsonResponse::error("Invalid id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->companies()->getCompanyById($id);
        if (!$current) {
            JsonResponse::error("Company not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        $payload = $this->normalizeCompanyPayload($data);
        $this->validateCompanyData($payload);

        $company = $this->buildCompany($payload, $id);
        $ok = $this->companies()->updateCompany($company);

        if (!$ok) {
            JsonResponse::error("Could not update company", JsonCode::INTERNAL_SERVER_ERROR, HttpStatus::INTERNAL_SERVER_ERROR);
        }

        JsonResponse::success("Company updated", JsonCode::SUCCESSFULL, HttpStatus::OK);
    }

    public function delete()
    {
        if (!$this->checkIfIsAdmin()) {
            JsonResponse::error("Permission denied", JsonCode::UNAUTHORIZED, HttpStatus::UNAUTHORIZED);
        }

        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        if ($id <= 0) {
            JsonResponse::error("Invalid id", JsonCode::BAD_REQUEST, HttpStatus::BAD_REQUEST);
        }

        $current = $this->companies()->getCompanyById($id);
        if (!$current) {
            JsonResponse::error("Company not found", JsonCode::NOT_FOUND, HttpStatus::NOT_FOUND);
        }

        $ok = $this->companies()->deleteCompanyById($id);

        if (!$ok) {
            JsonResponse::error(
                "Could not delete company. Remove related events first.",
                JsonCode::BAD_REQUEST,
                HttpStatus::CONFLICT
            );
        }

        JsonResponse::success("Company deleted", JsonCode::SUCCESSFULL, HttpStatus::OK);
    }
}
