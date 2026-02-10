<?php
class Event implements JsonSerializable
{                       // <------------ NOMBRES DE LAS COLUMNAS EN LA TABLA ------------>
    private int $id;                // id_evento
    private string $name;           // nombre
    private int $id_event_type;     // id_tipo
    private int $id_company;        // id_empresa
    private string $place;          // lugar
    private string $date;           // fecha
    private string $hour;           // hora
    private float $price;           // precio
    private int $maximun_capacity;  // aforo_maximo
    private string $poster_image;   // imagen_cartel

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

    public function getEventType(): int
    {
        return $this->id_event_type;
    }

    public function setEventType(int $event_type): self
    {
        $this->id_event_type = $event_type;
        return $this;
    }

    public function getIdCompany(): int
    {
        return $this->id_company;
    }

    public function setIdCompany(int $id_company): self
    {
        $this->id_company = $id_company;
        return $this;
    }

    public function getPlace(): string
    {
        return $this->place;
    }

    public function setPlace(string $place): self
    {
        $this->place = $place;
        return $this;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function setDate(string $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function getHour(): string
    {
        return $this->hour;
    }

    public function setHour(string $hour): self
    {
        $this->hour = $hour;
        return $this;
    }

    public function getPrice(): float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;
        return $this;
    }

    public function getMaximunCapacity(): int
    {
        return $this->maximun_capacity;
    }

    public function setMaximunCapacity(int $maximun_capacity): self
    {
        $this->maximun_capacity = $maximun_capacity;
        return $this;
    }

    public function getPosterImage(): string
    {
        return $this->poster_image;
    }

    public function setPosterImage(string $poster_image): self
    {
        $this->poster_image = $poster_image;
        return $this;
    }

    public function toArray(): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "id_event_type" => $this->id_event_type,
            "id_company" => $this->id_company,
            "place" => $this->place,
            "date" => $this->date,
            "hour" => $this->hour,
            "price" => $this->price,
            "maximun_capacity" => $this->maximun_capacity,
            "poster_image" => $this->poster_image,
        ];
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}
