<?php

require_once __DIR__ . "/../repository/CompanyRepository.php";

class CompanyService
{
    private ?CompanyRepository $companyRepository;

    public function __construct()
    {
        $this->companyRepository = new CompanyRepository();
    }

    public function getAllCompanies(): ?array
    {
        try {
            return $this->companyRepository->getAll();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }
}
