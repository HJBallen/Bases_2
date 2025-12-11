-- QUERIES SQL PARA SUPABASE - PROYECTO BOGOGO
-- Este archivo contiene todas las queries principales del proyecto
-- convertidas a SQL puro para ejecutarlas directamente en el SQL Editor de Supabase.

------------------------------------------------------------
-- 1. AUTENTICACIÓN Y USUARIOS
------------------------------------------------------------

-- 1.1. Obtener rol del usuario por UUID
SELECT role_id
FROM "user"
WHERE uuid = 'UUID_DEL_USUARIO'
LIMIT 1;

-- 1.2. Verificar si el perfil está completo
SELECT id
FROM "user"
WHERE uuid = 'UUID_DEL_USUARIO'
LIMIT 1;

-- 1.3. Obtener ID numérico del usuario por UUID
SELECT id
FROM "user"
WHERE uuid = 'UUID_DEL_USUARIO'
LIMIT 1;

-- 1.4. Listar todos los usuarios (Admin)
SELECT *
FROM "user"
ORDER BY id DESC;

-- 1.5. Obtener información de clientes por IDs
SELECT id, name, lastname, email
FROM "user"
WHERE id IN (1, 2, 3, 4, 5); -- Reemplazar con los IDs reales

-- 1.6. Insertar nuevo usuario
INSERT INTO "user" (uuid, name, lastname, email, cell, role_id)
VALUES (
  'UUID_DEL_USUARIO',
  'Nombre',
  'Apellido',
  'email@ejemplo.com',
  '3001234567',
  2 -- 2=Comprador, 3=Vendedor
);

------------------------------------------------------------
-- 2. PRODUCTOS
------------------------------------------------------------

-- 2.1. Obtener todos los productos con categoría e imágenes
SELECT 
  p.id,
  p.name,
  p.price,
  p.created_at,
  p.stock,
  p.id_vendor,
  p.features,
  p.id_category,
  json_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description
  ) AS category,
  COALESCE(
    json_agg(
      json_build_object(
        'id', m.id,
        'alt', m.alt,
        'src', m.src,
        'id_product', m.id_product
      )
    ) FILTER (WHERE m.id IS NOT NULL),
    '[]'::json
  ) AS multimedia
FROM product p
LEFT JOIN category c ON p.id_category = c.id
LEFT JOIN multimedia m ON p.id = m.id_product
GROUP BY p.id, c.id, c.name, c.description
ORDER BY p.created_at DESC;

-- 2.2. Obtener un producto por ID
SELECT 
  p.id,
  p.name,
  p.price,
  p.created_at,
  p.stock,
  p.id_vendor,
  p.features,
  p.id_category,
  json_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description
  ) AS category,
  COALESCE(
    json_agg(
      json_build_object(
        'id', m.id,
        'alt', m.alt,
        'src', m.src,
        'id_product', m.id_product
      )
    ) FILTER (WHERE m.id IS NOT NULL),
    '[]'::json
  ) AS multimedia
FROM product p
LEFT JOIN category c ON p.id_category = c.id
LEFT JOIN multimedia m ON p.id = m.id_product
WHERE p.id = 'ID_DEL_PRODUCTO'
GROUP BY p.id, c.id, c.name, c.description
LIMIT 1;

-- 2.3. Obtener productos de un vendedor específico
SELECT 
  p.id,
  p.name,
  p.price,
  p.created_at,
  p.stock,
  p.id_vendor,
  p.features,
  p.id_category,
  json_build_object(
    'id', c.id,
    'name', c.name,
    'description', c.description
  ) AS category
FROM product p
LEFT JOIN category c ON p.id_category = c.id
WHERE p.id_vendor = 1 -- ID del vendedor
ORDER BY p.created_at DESC;

-- 2.4. Crear nuevo producto
INSERT INTO product (id, name, price, stock, id_category, id_vendor, features)
VALUES (
  gen_random_uuid()::text, -- o un UUID específico
  'Nombre del Producto',
  99.99,
  50,
  1, -- ID de categoría
  1, -- ID del vendedor
  'Características del producto'
);

-- 2.5. Actualizar producto existente
UPDATE product
SET 
  name = 'Nuevo Nombre',
  price = 129.99,
  stock = 75,
  id_category = 2,
  features = 'Nuevas características'
WHERE id = 'ID_DEL_PRODUCTO'
  AND id_vendor = 1; -- Verificar que pertenece al vendedor

-- 2.6. Verificar permisos antes de eliminar
SELECT id_vendor
FROM product
WHERE id = 'ID_DEL_PRODUCTO'
  AND id_vendor = 1 -- ID del vendedor
LIMIT 1;

-- 2.7. Eliminar producto
DELETE FROM product
WHERE id = 'ID_DEL_PRODUCTO';

------------------------------------------------------------
-- 3. CATEGORÍAS
------------------------------------------------------------

-- 3.1. Obtener todas las categorías
SELECT *
FROM category
ORDER BY name ASC;

------------------------------------------------------------
-- 4. MULTIMEDIA
------------------------------------------------------------

-- 4.1. Obtener imágenes de un producto
SELECT *
FROM multimedia
WHERE id_product = 'ID_DEL_PRODUCTO'
ORDER BY id ASC;

-- 4.2. Insertar registros de multimedia
INSERT INTO multimedia (id, alt, src, id_product)
VALUES 
  (gen_random_uuid()::text, 'Descripción imagen 1', 'https://url-imagen-1.jpg', 'ID_PRODUCTO'),
  (gen_random_uuid()::text, 'Descripción imagen 2', 'https://url-imagen-2.jpg', 'ID_PRODUCTO');

-- 4.3. Eliminar imagen
DELETE FROM multimedia
WHERE id = 'ID_DE_LA_IMAGEN';

------------------------------------------------------------
-- 5. ÓRDENES
------------------------------------------------------------

-- 5.1. Obtener todas las órdenes con relaciones (Admin)
SELECT 
  o.id,
  o.id_customer,
  o.id_payment,
  o.state,
  o.created_at,
  json_build_object(
    'id', p.id,
    'created_at', p.created_at,
    'status', p.status,
    'id_payment_method', p.id_payment_method,
    'payment_method', json_build_object(
      'id', pm.id,
      'name', pm.name
    )
  ) AS payment
FROM "order" o
LEFT JOIN payment p ON o.id_payment = p.id
LEFT JOIN payment_method pm ON p.id_payment_method = pm.id
ORDER BY o.created_at DESC;

-- 5.2. Obtener órdenes de un cliente
SELECT 
  o.id,
  o.id_customer,
  o.id_payment,
  o.state,
  o.created_at,
  json_build_object(
    'id', p.id,
    'created_at', p.created_at,
    'status', p.status,
    'id_payment_method', p.id_payment_method
  ) AS payment
FROM "order" o
LEFT JOIN payment p ON o.id_payment = p.id
WHERE o.id_customer = 1 -- ID del cliente
ORDER BY o.created_at DESC;

------------------------------------------------------------
-- 6. ORDER_ITEM
------------------------------------------------------------

-- 6.1. Obtener items de órdenes por IDs
SELECT *
FROM order_item
WHERE id_order IN (1, 2, 3, 4, 5); -- IDs de las órdenes

-- 6.2. Obtener items de órdenes con información del producto
SELECT 
  oi.*,
  json_build_object(
    'id', p.id,
    'name', p.name,
    'price', p.price
  ) AS product
FROM order_item oi
LEFT JOIN product p ON oi.id_product = p.id
WHERE oi.id_order IN (1, 2, 3);

------------------------------------------------------------
-- 7. VISTAS DEL DASHBOARD
------------------------------------------------------------

-- 7.1. Resumen de ventas por vendedor (v_vendor_sales_summary)
-- Si la vista existe:
SELECT *
FROM v_vendor_sales_summary;

-- Query equivalente (por si no existe la vista):
SELECT 
  v.id AS vendor_id,
  v.name AS vendor_name,
  v.lastname AS vendor_lastname,
  COUNT(DISTINCT o.id) AS orders_count,
  COALESCE(SUM(oi.total_price), 0) AS gross_sales,
  COALESCE(SUM(oi.quantity), 0) AS total_items_sold
FROM "user" v
LEFT JOIN product p ON v.id = p.id_vendor
LEFT JOIN order_item oi ON p.id = oi.id_product
LEFT JOIN "order" o ON oi.id_order = o.id
WHERE v.role_id = 3 -- Vendedores
GROUP BY v.id, v.name, v.lastname;

-- 7.2. Ventas por categoría (v_category_sales)
-- Si la vista existe:
SELECT *
FROM v_category_sales;

-- Query equivalente:
SELECT 
  c.id AS category_id,
  c.name AS category_name,
  COALESCE(SUM(oi.quantity), 0) AS total_items_sold,
  COALESCE(SUM(oi.total_price), 0) AS total_revenue
FROM category c
LEFT JOIN product p ON c.id = p.id_category
LEFT JOIN order_item oi ON p.id = oi.id_product
GROUP BY c.id, c.name;

-- 7.3. Resumen de órdenes (v_order_summary)
-- Si la vista existe:
SELECT *
FROM v_order_summary
ORDER BY order_date DESC;

-- Query equivalente (simplificada):
SELECT 
  o.id AS order_id,
  o.created_at AS order_date,
  o.state AS order_state,
  o.id_customer,
  u.name AS customer_name,
  u.lastname AS customer_lastname,
  o.id_payment,
  p.status AS payment_status,
  pm.name AS payment_method_name,
  COALESCE(SUM(oi.quantity), 0) AS total_items,
  COALESCE(SUM(oi.total_price), 0) AS order_total
FROM "order" o
LEFT JOIN "user" u ON o.id_customer = u.id
LEFT JOIN payment p ON o.id_payment = p.id
LEFT JOIN payment_method pm ON p.id_payment_method = pm.id
LEFT JOIN order_item oi ON o.id = oi.id_order
GROUP BY o.id, o.created_at, o.state, o.id_customer, u.name, u.lastname, 
         o.id_payment, p.status, pm.name
ORDER BY o.created_at DESC;

-- 7.4. Estado de inventario (v_inventory_status)
-- Si la vista existe:
SELECT *
FROM v_inventory_status;

-- Query equivalente:
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  c.name AS category_name,
  p.id_vendor AS vendor_id,
  u.name AS vendor_name,
  p.stock,
  CASE 
    WHEN p.stock = 0 THEN 'SIN STOCK'
    WHEN p.stock < 10 THEN 'BAJO'
    WHEN p.stock < 50 THEN 'MEDIO'
    ELSE 'ALTO'
  END AS stock_status
FROM product p
LEFT JOIN category c ON p.id_category = c.id
LEFT JOIN "user" u ON p.id_vendor = u.id
ORDER BY p.stock ASC;

-- 7.5. Calificaciones de vendedores (v_vendor_ratings)
-- Si la vista existe:
SELECT *
FROM v_vendor_ratings;

-- Query equivalente:
SELECT 
  v.id AS vendor_id,
  v.name AS vendor_name,
  v.lastname AS vendor_lastname,
  COUNT(r.id) AS ratings_count,
  COALESCE(AVG(CAST(r.value AS DECIMAL)), 0) AS avg_rating
FROM "user" v
LEFT JOIN rating r ON v.id = r.id_vendor
WHERE v.role_id = 3 -- Vendedores
GROUP BY v.id, v.name, v.lastname;

-- 7.6. Items de órdenes detallados (v_order_items_detailed)
-- Si la vista existe:
SELECT *
FROM v_order_items_detailed
WHERE vendor_id = 1 -- ID del vendedor
ORDER BY order_date DESC
LIMIT 50;

-- Query equivalente:
SELECT 
  oi.id AS order_item_id,
  oi.id_order AS order_id,
  o.created_at AS order_date,
  o.state AS order_state,
  oi.quantity,
  oi.total_price,
  p.id AS product_id,
  p.name AS product_name,
  p.id_vendor AS vendor_id,
  c.id AS category_id,
  c.name AS category_name,
  u.id AS customer_id,
  u.name AS customer_name,
  u.lastname AS customer_lastname,
  p.id AS payment_id,
  pay.status AS payment_status,
  pm.id AS payment_method_id,
  pm.name AS payment_method_name
FROM order_item oi
LEFT JOIN "order" o ON oi.id_order = o.id
LEFT JOIN product p ON oi.id_product = p.id
LEFT JOIN category c ON p.id_category = c.id
LEFT JOIN "user" u ON o.id_customer = u.id
LEFT JOIN payment pay ON o.id_payment = pay.id
LEFT JOIN payment_method pm ON pay.id_payment_method = pm.id
WHERE p.id_vendor = 1 -- ID del vendedor
ORDER BY o.created_at DESC
LIMIT 50;

-- 7.7. Catálogo de productos del vendedor (v_product_catalog)
-- Si la vista existe:
SELECT *
FROM v_product_catalog
WHERE vendor_id = 1
ORDER BY created_at DESC;

-- Query equivalente:
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  p.price,
  p.stock,
  p.created_at,
  c.id AS category_id,
  c.name AS category_name,
  u.id AS vendor_id,
  u.name AS vendor_name,
  u.lastname AS vendor_lastname,
  (SELECT src FROM multimedia WHERE id_product = p.id LIMIT 1) AS main_image_url
FROM product p
LEFT JOIN category c ON p.id_category = c.id
LEFT JOIN "user" u ON p.id_vendor = u.id
WHERE p.id_vendor = 1 -- ID del vendedor
ORDER BY p.created_at DESC;

------------------------------------------------------------
-- 8. QUERIES ESPECÍFICAS DEL DASHBOARD VENDEDOR
------------------------------------------------------------

-- 8.1. Resumen de ventas del vendedor
SELECT 
  v.id AS vendor_id,
  v.name AS vendor_name,
  v.lastname AS vendor_lastname,
  COUNT(DISTINCT o.id) AS orders_count,
  COALESCE(SUM(oi.total_price), 0) AS gross_sales,
  COALESCE(SUM(oi.quantity), 0) AS total_items_sold
FROM "user" v
LEFT JOIN product p ON v.id = p.id_vendor
LEFT JOIN order_item oi ON p.id = oi.id_product
LEFT JOIN "order" o ON oi.id_order = o.id
WHERE v.id = 1 -- ID del vendedor
GROUP BY v.id, v.name, v.lastname;

-- 8.2. Items de órdenes con filtro por estado
SELECT 
  oi.*,
  o.state AS order_state,
  p.name AS product_name,
  u.name AS customer_name,
  u.lastname AS customer_lastname
FROM order_item oi
LEFT JOIN "order" o ON oi.id_order = o.id
LEFT JOIN product p ON oi.id_product = p.id
LEFT JOIN "user" u ON o.id_customer = u.id
WHERE p.id_vendor = 1 -- ID del vendedor
  AND o.state = 'PEN' -- 'PEN', 'PAG', 'CAN', o 'all'
ORDER BY o.created_at DESC;

-- 8.3. Productos con bajo stock del vendedor
SELECT 
  p.id,
  p.name,
  c.name AS category_name,
  p.stock,
  CASE 
    WHEN p.stock = 0 THEN 'SIN STOCK'
    WHEN p.stock < 10 THEN 'BAJO'
    ELSE 'OK'
  END AS stock_status
FROM product p
LEFT JOIN category c ON p.id_category = c.id
WHERE p.id_vendor = 1 -- ID del vendedor
  AND (p.stock = 0 OR p.stock < 10)
ORDER BY p.stock ASC;

------------------------------------------------------------
-- 9. QUERIES DE ESTADÍSTICAS Y KPIs
------------------------------------------------------------

-- 9.1. Ventas totales (Admin)
SELECT 
  COALESCE(SUM(oi.total_price), 0) AS total_sales
FROM order_item oi
LEFT JOIN "order" o ON oi.id_order = o.id
WHERE o.state != 'CAN'; -- Excluir canceladas

-- 9.2. Total de pedidos
SELECT COUNT(*) AS total_orders
FROM "order";

-- 9.3. Total de productos
SELECT COUNT(*) AS total_products
FROM product;

-- 9.4. Productos con bajo stock
SELECT COUNT(*) AS low_stock_products
FROM product
WHERE stock = 0 OR stock < 10;

-- 9.5. Pedidos pendientes del vendedor
SELECT COUNT(DISTINCT o.id) AS pending_orders
FROM order_item oi
LEFT JOIN "order" o ON oi.id_order = o.id
LEFT JOIN product p ON oi.id_product = p.id
WHERE p.id_vendor = 1 -- ID del vendedor
  AND (o.state = 'pendiente' OR o.state = 'PENDIENTE');

------------------------------------------------------------
-- 10. QUERIES DE BÚSQUEDA Y FILTROS
------------------------------------------------------------

-- 10.1. Buscar productos por nombre
SELECT 
  p.*,
  c.name AS category_name
FROM product p
LEFT JOIN category c ON p.id_category = c.id
WHERE p.name ILIKE '%término_búsqueda%'
ORDER BY p.created_at DESC;

-- 10.2. Filtrar productos por categoría
SELECT 
  p.*,
  c.name AS category_name
FROM product p
LEFT JOIN category c ON p.id_category = c.id
WHERE p.id_category = 1 -- ID de la categoría
ORDER BY p.created_at DESC;

-- 10.3. Filtrar productos por rango de precio
SELECT *
FROM product
WHERE price BETWEEN 50 AND 200
ORDER BY price ASC;

------------------------------------------------------------
-- 11. QUERIES DE ANÁLISIS AVANZADO
------------------------------------------------------------

-- 11.1. Top 10 productos más vendidos
SELECT 
  p.id,
  p.name,
  SUM(oi.quantity) AS total_sold,
  SUM(oi.total_price) AS total_revenue
FROM product p
LEFT JOIN order_item oi ON p.id = oi.id_product
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;

-- 11.2. Ventas por mes
SELECT 
  DATE_TRUNC('month', o.created_at) AS month,
  COUNT(DISTINCT o.id) AS orders_count,
  SUM(oi.total_price) AS total_revenue
FROM "order" o
LEFT JOIN order_item oi ON o.id = oi.id_order
WHERE o.state != 'CAN'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- 11.3. Vendedores con mejor rendimiento
SELECT 
  u.id,
  u.name,
  u.lastname,
  COUNT(DISTINCT o.id) AS orders_count,
  SUM(oi.total_price) AS total_sales,
  AVG(oi.total_price) AS avg_order_value
FROM "user" u
LEFT JOIN product p ON u.id = p.id_vendor
LEFT JOIN order_item oi ON p.id = oi.id_product
LEFT JOIN "order" o ON oi.id_order = o.id
WHERE u.role_id = 3 -- Vendedores
  AND o.state != 'CAN'
GROUP BY u.id, u.name, u.lastname
ORDER BY total_sales DESC;

