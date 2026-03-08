<?php

class ListaEspera implements JsonSerializable
{
    private int $id_lista_espera = 0;   // id
    private int $id_user = 0;           // id_user
    private int $id_evento = 0;         // id_evento
    private string $email = '';         // email
    private string $listada_at = '';    // listada_at

    public function __construct()
    {
        
    }

    public function getListaEsperaId() {
        return $this->id_lista_espera;
    }

    public function getUserIdDeListaDeEspera() {
        return $this->id_user;
    }

    public function getUserEmail() {
        return $this->email;
    }

    public function getEventoIdDeListaDeEspera() {
        return $this->id_evento;
    }

    public function getListadaAt() {
        return $this->listada_at;
    }

    public function setListaEsperaId(int $newId) {
        $this->id_lista_espera = $newId;
    }

    public function setEmailListaEspera(string $email) {
        $this->email = $email;
    }

    public function setUserIdListaEspera(int $newId) {
        $this->id_user = $newId;
    }

    public function setEventoListaEspera(int $newId) {
        $this->id_evento = $newId;
    }

    public function toArray(): array {
        return [
            "id" => $this->id_lista_espera,
            "id_user" => $this->id_user,
            "id_evento" => $this->id_evento,
            "listada_at" => $this->listada_at,
        ];
    }

    public function jsonSerialize(): mixed
    {
        return $this->toArray();
    }
}