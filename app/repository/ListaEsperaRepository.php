<?php
require_once __DIR__ . "/../core/Database.php";
require_once __DIR__ . "/../models/ListaEspera.php";

class ListaEsperaRepository extends BaseRepository {
    protected $table = "lista_espera";

    public function fromRow(array $row): ListaEspera
    {
        $c = new ListaEspera();
        $c->setListaEsperaId((int)$row["id"]);
        $c->setUserIdListaEspera($row["id_user"]);
        $c->setEmailListaEspera($row["email"]);
        $c->setEventoListaEspera((string)$row["id_evento"]);
        return $c;
    }

    public function getAllListaDeEsperaFromEventId(int $id_event): array {
        $this->db->query("SELECT * FROM {$this->table} WHERE id_evento= :id_evento ORDER BY id DESC");
        $this->db->bind(":id_evento", $id_event);
        $this->db->execute();
        $rows = $this->db->results();

        return array_map(fn($r) => $this->fromRow($r), $rows);
    }
}