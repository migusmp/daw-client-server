<?php
class Company
{
    private int $id;                            // id_empresa
    private string $name;                       // nombre
    private string $city;                       // ciudad
    private string $creation_year;              // anio_creacion
    private string $email_person_in_charge;     // email_responsable
    private string $number_person_in_charge;    // telefono_responsable

    public function __construct() {}

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): self
    {
        $this->id = $id;
        return $this;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    public function getCity(): string
    {
        return $this->city;
    }

    public function setCity(string $city): self
    {
        $this->city = $city;
        return $this;
    }

    public function getCreationYear(): string
    {
        return $this->creation_year;
    }

    public function setCreationYear(string $creation_year): self
    {
        $this->creation_year = $creation_year;
        return $this;
    }

    public function getEmailPersonInCharge(): string
    {
        return $this->email_person_in_charge;
    }

    public function setEmailPersonInCharge(string $email_person_in_charge): self
    {
        $this->email_person_in_charge = $email_person_in_charge;
        return $this;
    }

    public function getNumberPersonInCharge(): string
    {
        return $this->number_person_in_charge;
    }

    public function setNumberPersonInCharge(string $number_person_in_charge): self
    {
        $this->number_person_in_charge = $number_person_in_charge;
        return $this;
    }

    public function toArray(): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "city" => $this->city,
            "creation_year" => $this->creation_year,
            "email_person_in_charge" => $this->email_person_in_charge,
            "number_person_in_charge" => $this->number_person_in_charge,
        ];
    }
}