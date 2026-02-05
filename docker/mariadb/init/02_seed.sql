-- Datos de ejemplo. Sustituye por seeds reales si aplica.

USE cityhalldb;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin', 'admin@example.com', '$2y$12$DVptx0ZVLXaXv/OFwI/xP.SR3Vn5nbNZk5ziMESvcDVf4BEEGfolK', 'ADMIN');
