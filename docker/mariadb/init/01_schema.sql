-- Ejecutado solo en la primera inicialización del volumen de MariaDB.
-- Sustituye este schema por el real del proyecto.

CREATE DATABASE IF NOT EXISTS cityhalldb
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cityhalldb;

CREATE TABLE IF NOT EXISTS example_table (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
