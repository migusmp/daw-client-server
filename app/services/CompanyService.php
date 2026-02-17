<?php

require_once __DIR__ . "/../repository/CompanyRepository.php";
require_once __DIR__ . "/../models/Company.php";

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

    public function getAllCompaniesWithEvents(): ?array
    {
        try {
            return $this->companyRepository->getAllWithEventTypes();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getCompanyById(int $id): ?Company
    {
        try {
            return $this->companyRepository->findById($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function saveCompany(Company $company): bool
    {
        try {
            return $this->companyRepository->save($company);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function updateCompany(Company $company): bool
    {
        try {
            return $this->companyRepository->update($company);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function deleteCompanyById(int $id): bool
    {
        try {
            return $this->companyRepository->delete($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }
}
