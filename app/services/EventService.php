<?php

require_once __DIR__ . "/../repository/EventRepository.php";
require_once __DIR__ . "/../repository/CompanyRepository.php";
require_once __DIR__ . "/../exceptions/EmpresaSinRegistrarExcepcion.php";

class EventService
{
    private ?EventRepository $eventRepository = null;
    private ?CompanyRepository $companyRepository = null;

    public function __construct()
    {
        $this->eventRepository = new EventRepository();
        $this->companyRepository = new CompanyRepository();
    }

    public function getEventsByCompanyId(int $id): ?array
    {
        try {
            return $this->eventRepository->findByCompanyId($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getAllEventsWithMeta(): ?array
    {
        try {
            return $this->eventRepository->getAllWithMeta();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getEventById(int $id): ?Event
    {
        try {
            return $this->eventRepository->findById($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function saveEvent(Event $event): bool
    {
        try {
            $company = $this->companyRepository->findById($event->getIdCompany());
            if ($company === null) {
                throw new EmpresaSinRegistrarExcepcion();
            }

            return $this->eventRepository->save($event);
        } catch (EmpresaSinRegistrarExcepcion $e) {
            throw $e;
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function updateEvent(Event $event): bool
    {
        try {
            return $this->eventRepository->update($event);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function deleteEvent(int $id): bool
    {
        try {
            return $this->eventRepository->delete($id);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getEventTypes(): ?array
    {
        try {
            return $this->eventRepository->getEventTypes();
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }

    public function getPublicCatalog(
        ?int $idTipo = null,
        ?int $idEmpresa = null,
        ?string $fechaDesde = null,
        ?string $fechaHasta = null,
        ?string $q = null
    ): ?array {
        try {
            return $this->eventRepository->getPublicCatalog($idTipo, $idEmpresa, $fechaDesde, $fechaHasta, $q);
        } catch (PDOException $e) {
            error_log($e->getMessage());
            return null;
        }
    }
}
