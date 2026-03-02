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
-- 1.1) USUARIO DEMO (comprador de ejemplo)
-- =========================================
INSERT INTO users (name, email, password_hash, role)
SELECT 'Comprador Demo', 'cliente@example.com',
       '$2y$12$DVptx0ZVLXaXv/OFwI/xP.SR3Vn5nbNZk5ziMESvcDVf4BEEGfolK',
       'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cliente@example.com'
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
-- 4) RELACIÓN EMPRESA <-> TIPO_EVENTO PERMITIDO
-- =========================================
INSERT INTO empresas_evento (id_empresa, id_tipo)
SELECT
  (SELECT id_empresa FROM empresa WHERE nombre = 'Sonido La Mancha' LIMIT 1),
  (SELECT id_tipo FROM tipo_evento WHERE nombre = 'concierto' LIMIT 1)
UNION ALL
SELECT
  (SELECT id_empresa FROM empresa WHERE nombre = 'Sonido La Mancha' LIMIT 1),
  (SELECT id_tipo FROM tipo_evento WHERE nombre = 'espectáculo pirotécnico' LIMIT 1)
UNION ALL
SELECT
  (SELECT id_empresa FROM empresa WHERE nombre = 'Eventos Levante' LIMIT 1),
  (SELECT id_tipo FROM tipo_evento WHERE nombre = 'festival' LIMIT 1)
UNION ALL
SELECT
  (SELECT id_empresa FROM empresa WHERE nombre = 'Teatro Aurora' LIMIT 1),
  (SELECT id_tipo FROM tipo_evento WHERE nombre = 'teatro' LIMIT 1)
UNION ALL
SELECT
  (SELECT id_empresa FROM empresa WHERE nombre = 'Feria & Tradición' LIMIT 1),
  (SELECT id_tipo FROM tipo_evento WHERE nombre = 'verbena' LIMIT 1)
ON DUPLICATE KEY UPDATE id_empresa = id_empresa;

-- =========================================
-- 5) EVENTOS (ejemplos)
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

-- =========================================
-- 6) TICKETS (ejemplos)
-- =========================================

-- Ticket PAGADO de admin para el concierto
INSERT INTO tickets (id_evento, id_user, total_pagado, estado, creado_at, pagado_at)
SELECT
  ev.id_evento,
  u.id,
  37.00,
  'PAGADO',
  '2026-03-01 10:00:00',
  '2026-03-01 10:05:00'
FROM evento ev
JOIN users u ON u.email = 'admin@example.com'
WHERE ev.nombre = 'Noche Rock Albacete'
  AND NOT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.id_evento = ev.id_evento
      AND t.id_user = u.id
      AND t.creado_at = '2026-03-01 10:00:00'
  );

-- Ticket PENDIENTE de cliente para el festival
INSERT INTO tickets (id_evento, id_user, total_pagado, estado, creado_at, pagado_at)
SELECT
  ev.id_evento,
  u.id,
  0.00,
  'PENDIENTE',
  '2026-03-02 12:00:00',
  NULL
FROM evento ev
JOIN users u ON u.email = 'cliente@example.com'
WHERE ev.nombre = 'Festival Verano 2026'
  AND NOT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.id_evento = ev.id_evento
      AND t.id_user = u.id
      AND t.creado_at = '2026-03-02 12:00:00'
  );

-- Ticket CANCELADO de cliente para teatro
INSERT INTO tickets (id_evento, id_user, total_pagado, estado, creado_at, pagado_at)
SELECT
  ev.id_evento,
  u.id,
  0.00,
  'CANCELADO',
  '2026-03-03 15:00:00',
  NULL
FROM evento ev
JOIN users u ON u.email = 'cliente@example.com'
WHERE ev.nombre = 'Comedia en el Teatro Circo'
  AND NOT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.id_evento = ev.id_evento
      AND t.id_user = u.id
      AND t.creado_at = '2026-03-03 15:00:00'
  );

-- =========================================
-- 7) ENTRADAS (ejemplos)
-- =========================================

-- Entrada 1 (ticket pagado)
INSERT INTO entrada (id_evento, id_user, id_ticket, qr_token, precio_pagado, estado, comprada_at)
SELECT
  t.id_evento,
  t.id_user,
  t.id_ticket,
  '11111111-1111-4111-8111-111111111111',
  18.50,
  'VALIDA',
  '2026-03-01 10:06:00'
FROM tickets t
JOIN users u ON u.id = t.id_user
JOIN evento ev ON ev.id_evento = t.id_evento
WHERE u.email = 'admin@example.com'
  AND ev.nombre = 'Noche Rock Albacete'
  AND t.creado_at = '2026-03-01 10:00:00'
  AND NOT EXISTS (
    SELECT 1 FROM entrada en WHERE en.qr_token = '11111111-1111-4111-8111-111111111111'
  );

-- Entrada 2 (mismo ticket pagado, ya usada)
INSERT INTO entrada (id_evento, id_user, id_ticket, qr_token, precio_pagado, estado, comprada_at)
SELECT
  t.id_evento,
  t.id_user,
  t.id_ticket,
  '22222222-2222-4222-8222-222222222222',
  18.50,
  'USADA',
  '2026-03-01 10:06:30'
FROM tickets t
JOIN users u ON u.id = t.id_user
JOIN evento ev ON ev.id_evento = t.id_evento
WHERE u.email = 'admin@example.com'
  AND ev.nombre = 'Noche Rock Albacete'
  AND t.creado_at = '2026-03-01 10:00:00'
  AND NOT EXISTS (
    SELECT 1 FROM entrada en WHERE en.qr_token = '22222222-2222-4222-8222-222222222222'
  );

-- Entrada suelta sin ticket (cliente)
INSERT INTO entrada (id_evento, id_user, id_ticket, qr_token, precio_pagado, estado, comprada_at)
SELECT
  ev.id_evento,
  u.id,
  NULL,
  '33333333-3333-4333-8333-333333333333',
  12.00,
  'VALIDA',
  '2026-03-04 11:00:00'
FROM evento ev
JOIN users u ON u.email = 'cliente@example.com'
WHERE ev.nombre = 'Comedia en el Teatro Circo'
  AND NOT EXISTS (
    SELECT 1 FROM entrada en WHERE en.qr_token = '33333333-3333-4333-8333-333333333333'
  );

-- =========================================
-- 8) SINCRONIZAR AFORO ACTUAL (VALIDA + USADA)
-- =========================================
UPDATE evento e
SET e.aforo_actual = (
  SELECT COUNT(*)
  FROM entrada en
  WHERE en.id_evento = e.id_evento
    AND en.estado IN ('VALIDA', 'USADA')
);
