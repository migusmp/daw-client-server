<?php
require_once __DIR__ . "/../config/config.php";
require_once __DIR__ . "/../core/Database.php";

class BaseRepository {
    protected $db;
    protected $table;

    public function __construct()
    {
        $this->db = new Database();

        if (empty($this->table)) {
            die("ERROR: You must define \$table on the children repository");
        }
    }

    public function all() {
        $this->db->query("SELECT * FROM {$this->table}");
        $this->db->execute();
        return $this->db->results();
    }

    public function find($id) {
        $this->db->query("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $this->db->bind(":id", $id);
        return $this->db->result();
    }

    public function where($field, $value) {
        $this->db->query("SELECT * FROM {$this->table} WHERE {$field} = :value");
        $this->db->bind(":value", $value);
        $this->db->execute();
        return $this->db->results();
    }
}
