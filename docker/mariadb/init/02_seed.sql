USE cityhalldb;

-- =========================================
-- 1) USUARIO ADMIN (solo si no existe)
-- =========================================
INSERT INTO users (name, email, password_hash, role)
SELECT 'Admin', 'admin@example.com',
       '$2y$12$DVptx0ZVLXaXv/OFwI/xP.SR3Vn5nbNZk5ziMESvcDVf4BEEGfolK',
       'ADMIN'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@example.com'
);

-- =========================================
-- 2) TIPOS DE EVENTO (catálogo)
-- =========================================
INSERT INTO tipo_evento (nombre) VALUES
  ('concierto'),
  ('festival'),
  ('teatro'),
  ('verbena'),
  ('espectáculo pirotécnico')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- =========================================
-- 3) EMPRESAS (ejemplos)
-- =========================================
INSERT INTO empresa (nombre, ciudad, anio_creacion, email_responsable, telefono_responsable) VALUES
  ('Sonido La Mancha', 'Albacete', 2012, 'contacto@sonidolamancha.es', '+34 967 111 222'),
  ('Eventos Levante', 'Valencia', 2008, 'info@eventoslevante.com', '+34 963 333 444'),
  ('Teatro Aurora', 'Madrid', 1999, 'produccion@teatroaurora.es', '+34 915 555 666'),
  ('Feria & Tradición', 'Albacete', 2015, 'hola@feriatradicion.es', '+34 967 777 888')
ON DUPLICATE KEY UPDATE
  ciudad = VALUES(ciudad),
  anio_creacion = VALUES(anio_creacion),
  email_responsable = VALUES(email_responsable),
  telefono_responsable = VALUES(telefono_responsable);

-- =========================================
-- 4) EVENTOS (ejemplos)
--    - Usamos SELECT para obtener id_tipo / id_empresa por nombre
--    - Evita duplicados por uq_evento (id_empresa, nombre, fecha, hora, lugar)
-- =========================================

-- Concierto
INSERT INTO evento (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
SELECT
  'Noche Rock Albacete',
  (SELECT id_tipo FROM tipo_evento WHERE nombre='concierto' LIMIT 1),
  (SELECT id_empresa FROM empresa WHERE nombre='Sonido La Mancha' LIMIT 1),
  'Recinto Ferial',
  '2026-06-20',
  '21:30:00',
  18.50,
  2500,
  'carteles/noche-rock.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM evento e
  JOIN empresa emp ON emp.id_empresa = e.id_empresa
  WHERE emp.nombre='Sonido La Mancha'
    AND e.nombre='Noche Rock Albacete'
    AND e.fecha='2026-06-20'
    AND e.hora='21:30:00'
    AND e.lugar='Recinto Ferial'
);

-- Festival
INSERT INTO evento (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
SELECT
  'Festival Verano 2026',
  (SELECT id_tipo FROM tipo_evento WHERE nombre='festival' LIMIT 1),
  (SELECT id_empresa FROM empresa WHERE nombre='Eventos Levante' LIMIT 1),
  'Parque Abelardo Sánchez',
  '2026-07-10',
  '19:00:00',
  25.00,
  8000,
  'carteles/festival-verano-2026.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM evento e
  JOIN empresa emp ON emp.id_empresa = e.id_empresa
  WHERE emp.nombre='Eventos Levante'
    AND e.nombre='Festival Verano 2026'
    AND e.fecha='2026-07-10'
    AND e.hora='19:00:00'
    AND e.lugar='Parque Abelardo Sánchez'
);

-- Teatro
INSERT INTO evento (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
SELECT
  'Comedia en el Teatro Circo',
  (SELECT id_tipo FROM tipo_evento WHERE nombre='teatro' LIMIT 1),
  (SELECT id_empresa FROM empresa WHERE nombre='Teatro Aurora' LIMIT 1),
  'Teatro Circo de Albacete',
  '2026-06-05',
  '20:00:00',
  12.00,
  900,
  'carteles/comedia-teatro-circo.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM evento e
  JOIN empresa emp ON emp.id_empresa = e.id_empresa
  WHERE emp.nombre='Teatro Aurora'
    AND e.nombre='Comedia en el Teatro Circo'
    AND e.fecha='2026-06-05'
    AND e.hora='20:00:00'
    AND e.lugar='Teatro Circo de Albacete'
);

-- Verbena
INSERT INTO evento (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
SELECT
  'Verbena Barrio San Pablo',
  (SELECT id_tipo FROM tipo_evento WHERE nombre='verbena' LIMIT 1),
  (SELECT id_empresa FROM empresa WHERE nombre='Feria & Tradición' LIMIT 1),
  'Plaza San Pablo',
  '2026-08-01',
  '22:00:00',
  0.00,
  3000,
  'carteles/verbena-san-pablo.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM evento e
  JOIN empresa emp ON emp.id_empresa = e.id_empresa
  WHERE emp.nombre='Feria & Tradición'
    AND e.nombre='Verbena Barrio San Pablo'
    AND e.fecha='2026-08-01'
    AND e.hora='22:00:00'
    AND e.lugar='Plaza San Pablo'
);

-- Espectáculo pirotécnico
INSERT INTO evento (nombre, id_tipo, id_empresa, lugar, fecha, hora, precio, aforo_maximo, imagen_cartel)
SELECT
  'Fuegos Artificiales Feria',
  (SELECT id_tipo FROM tipo_evento WHERE nombre='espectáculo pirotécnico' LIMIT 1),
  (SELECT id_empresa FROM empresa WHERE nombre='Sonido La Mancha' LIMIT 1),
  'Recinto Ferial',
  '2026-09-07',
  '23:30:00',
  0.00,
  12000,
  'carteles/fuegos-feria.jpg'
WHERE NOT EXISTS (
  SELECT 1 FROM evento e
  JOIN empresa emp ON emp.id_empresa = e.id_empresa
  WHERE emp.nombre='Sonido La Mancha'
    AND e.nombre='Fuegos Artificiales Feria'
    AND e.fecha='2026-09-07'
    AND e.hora='23:30:00'
    AND e.lugar='Recinto Ferial'
);
