<?php

require_once __DIR__ . "/../services/CompanyService.php";
require_once __DIR__ . "/../helpers/JsonResponse.php";
require_once __DIR__ . "/../utils/JsonCode.php";
require_once __DIR__ . "/../utils/HttpStatus.php";

class CompanyController
{

    private ?CompanyService $companyService = null;

    private function companies()
    {
        if ($this->companyService == null) {
            $this->companyService = new CompanyService();
        }
        return $this->companyService;
    }

    private function checkIfIsAdmin(): bool
    {
        if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'ADMIN') {
            return false;
        }

        return true;
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
