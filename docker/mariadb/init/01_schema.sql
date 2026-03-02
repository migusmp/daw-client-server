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
-- Incluye roles (USER/ADMIN) y timestamps de auditoría.
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
-- TABLA EMPRESAS_EVENTO
-- Relación entre empresa y tipo de evento permitido.
-- Define qué tipos puede gestionar cada empresa.
-- =========================================================
CREATE TABLE IF NOT EXISTS empresas_evento (
  id_empresa INT UNSIGNED NOT NULL,
  id_tipo INT UNSIGNED NOT NULL,

  PRIMARY KEY (id_empresa, id_tipo),
  KEY idx_empresas_evento_tipo_empresa (id_tipo, id_empresa),

  CONSTRAINT fk_empresas_evento_empresa
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
    ON UPDATE CASCADE ON DELETE CASCADE,

  CONSTRAINT fk_empresas_evento_tipo
    FOREIGN KEY (id_tipo) REFERENCES tipo_evento(id_tipo)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA EVENTO
-- Eventos del ayuntamiento: nombre, tipo, empresa organizadora, lugar, fecha/hora,
-- precio, aforo máximo y cartel (ruta o URL).
-- La combinación empresa+tipo se valida contra empresas_evento.
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
  aforo_actual INT UNSIGNED NOT NULL DEFAULT 0,
  imagen_cartel VARCHAR(255) NULL,

  KEY idx_evento_tipo (id_tipo),
  KEY idx_evento_empresa (id_empresa),
  KEY idx_evento_fecha (fecha),
  KEY idx_evento_filtros (id_tipo, fecha, id_empresa),

  CONSTRAINT fk_evento_empresa_tipo
    FOREIGN KEY (id_empresa, id_tipo) REFERENCES empresas_evento(id_empresa, id_tipo)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  UNIQUE KEY uq_evento (id_empresa, nombre, fecha, hora, lugar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA TICKETS
-- Un ticket agrupa la compra de una o varias entradas para un mismo evento y usuario.
-- Permite controlar estado de pago y total de la operación.
-- =========================================================
CREATE TABLE IF NOT EXISTS tickets (
  id_ticket BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_evento INT UNSIGNED NOT NULL,
  id_user INT UNSIGNED NOT NULL,
  total_pagado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estado ENUM('PENDIENTE','PAGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
  creado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  pagado_at TIMESTAMP NULL,

  CONSTRAINT fk_tickets_evento
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_tickets_user
    FOREIGN KEY (id_user) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  KEY idx_tickets_consistencia (id_ticket, id_evento, id_user),
  KEY idx_tickets_evento_estado (id_evento, estado),
  KEY idx_tickets_user_estado (id_user, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- TABLA ENTRADA
-- Entradas individuales emitidas para un evento y usuario.
-- Pueden agruparse opcionalmente bajo un ticket de compra.
-- Se usa ON DELETE RESTRICT para preservar coherencia e histórico de compra.
-- =========================================================
CREATE TABLE IF NOT EXISTS entrada (
  id_entrada BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_evento INT UNSIGNED NOT NULL,
  id_user INT UNSIGNED NOT NULL,
  id_ticket BIGINT UNSIGNED NULL,
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

  CONSTRAINT fk_entrada_ticket
    FOREIGN KEY (id_ticket) REFERENCES tickets(id_ticket)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  CONSTRAINT fk_entrada_ticket_consistencia
    FOREIGN KEY (id_ticket, id_evento, id_user) REFERENCES tickets(id_ticket, id_evento, id_user)
    ON UPDATE CASCADE ON DELETE RESTRICT,

  KEY idx_entrada_ticket_evento (id_ticket, id_evento),
  UNIQUE KEY uq_entrada_qr (qr_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
