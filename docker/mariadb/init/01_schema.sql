-- =========================================================
-- BASE DE DATOS: cityhalldb
-- Crea la BD si no existe y define charset/collation para soportar tildes/ñ/emojis.
-- =========================================================
CREATE DATABASE IF NOT EXISTS cityhalldb
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cityhalldb;

-- =========================================================
-- TABLA USERS
-- Guarda usuarios registrados para iniciar sesión y comprar entradas.
-- Incluye roles (por ejemplo USER/ADMIN) y timestamps de auditoría.
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA EMPRESA
-- Empresas organizadoras: nombre, ciudad, año de creación y contacto del responsable.
-- Se usa en la gestión de eventos (una empresa puede organizar muchos eventos).
-- =========================================================
CREATE TABLE IF NOT EXISTS empresa (
  id_empresa INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  ciudad VARCHAR(120) NOT NULL,
  anio_creacion YEAR NOT NULL,
  email_responsable VARCHAR(150) NOT NULL,
  telefono_responsable VARCHAR(25) NOT NULL,
  UNIQUE KEY uq_empresa_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA TIPO_EVENTO
-- Catálogo de tipos de eventos (concierto, festival, teatro, etc.).
-- Sirve para filtrar listados y clasificar eventos.
-- =========================================================
CREATE TABLE IF NOT EXISTS tipo_evento (
  id_tipo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA EVENTO
-- Eventos del ayuntamiento: nombre, tipo, empresa organizadora, lugar, fecha/hora,
-- precio, aforo máximo y cartel (ruta o URL).
-- Incluye claves foráneas y una unicidad para evitar duplicados "idénticos".
-- =========================================================
CREATE TABLE IF NOT EXISTS evento (
  id_evento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  id_tipo INT UNSIGNED NOT NULL,
  id_empresa INT UNSIGNED NOT NULL,
  lugar VARCHAR(180) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  aforo_maximo INT UNSIGNED NOT NULL,
  imagen_cartel VARCHAR(255) NULL,

  CONSTRAINT fk_evento_tipo
    FOREIGN KEY (id_tipo) REFERENCES tipo_evento(id_tipo)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_evento_empresa
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  UNIQUE KEY uq_evento (id_empresa, nombre, fecha, hora, lugar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS entrada (
  id_entrada BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_evento INT UNSIGNED NOT NULL,
  id_user INT UNSIGNED NOT NULL,
  qr_token CHAR(36) NOT NULL,
  precio_pagado DECIMAL(10,2) NOT NULL,
  estado ENUM('VALIDA','CANCELADA','USADA') NOT NULL DEFAULT 'VALIDA',
  comprada_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_entrada_evento
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_entrada_user
    FOREIGN KEY (id_user) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  UNIQUE KEY uq_entrada_qr (qr_token),
  INDEX idx_entrada_evento (id_evento),
  INDEX idx_entrada_user (id_user)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- ÍNDICES
-- Optimizan filtros típicos en listados (por tipo, empresa, fecha y combinados).
-- =========================================================
CREATE INDEX idx_evento_tipo ON evento(id_tipo);
CREATE INDEX idx_evento_empresa ON evento(id_empresa);
CREATE INDEX idx_evento_fecha ON evento(fecha);
CREATE INDEX idx_evento_filtros ON evento(id_tipo, fecha, id_empresa);