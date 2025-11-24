/*
==========================================================
 	SCRIPT COMPLETO: DB E-COMMERCE - COMPONENTES ELECTRÓNICOS
 	Base: db_smart_point
 	Contiene: tablas, procedimientos, triggers, datos de ejemplo,
 	y pruebas funcionales.
==========================================================
*/

-- =========================================
-- 1. CREACIÓN DE BASE DE DATOS
-- =========================================
-- CREATE DATABASE IF NOT EXISTS db_smart_point; (Comentado, sqlx ya lo hizo)
-- USE db_smart_point; (Comentado, sqlx ya lo hizo)

-- =========================================
-- 2. TABLAS DEL SISTEMA
-- =========================================

-- Detalle de productos
CREATE TABLE IF NOT EXISTS detalle_productos (
                                               id_detalle_producto INT AUTO_INCREMENT PRIMARY KEY,
                                               descripcion VARCHAR(45) NOT NULL,
  unidades INT NOT NULL
  );

-- Productos electrónicos
CREATE TABLE IF NOT EXISTS productos (
                                       codigo_producto INT AUTO_INCREMENT PRIMARY KEY,
                                       fldNombre VARCHAR(100) NOT NULL,
  fldPrecio DECIMAL(10,2) NOT NULL,
  fldMarca VARCHAR(45),
  id_detalle_producto INT NOT NULL,
  FOREIGN KEY (id_detalle_producto) REFERENCES detalle_productos(id_detalle_producto)
  );

-- Clientes registrados
CREATE TABLE IF NOT EXISTS cliente (
                                     telefono VARCHAR(10) PRIMARY KEY,
  fldNombres VARCHAR(45) NOT NULL,
  fldApellidos VARCHAR(45) NOT NULL,
  fldCorreoElectronico VARCHAR(100)
  );

-- Tipo de consultas de soporte
CREATE TABLE IF NOT EXISTS tipo_consulta (
                                           id_tipo INT AUTO_INCREMENT PRIMARY KEY,
                                           fldOpciones VARCHAR(45) NOT NULL
  );

-- Consultas realizadas por clientes
CREATE TABLE IF NOT EXISTS consulta (
                                      id_consulta INT AUTO_INCREMENT PRIMARY KEY,
                                      telefono VARCHAR(10) NOT NULL,
  id_tipo INT NOT NULL,
  fldAsunto VARCHAR(45) NOT NULL,
  fldMensaje VARCHAR(200) NOT NULL,
  FOREIGN KEY (telefono) REFERENCES cliente(telefono),
  FOREIGN KEY (id_tipo) REFERENCES tipo_consulta(id_tipo)
  );

-- Categorías de componentes electrónicos
CREATE TABLE IF NOT EXISTS categorias (
                                        id_categorias INT AUTO_INCREMENT PRIMARY KEY,
                                        fldNombre VARCHAR(45) NOT NULL,
  fldDescripcion VARCHAR(100) NOT NULL,
  visible TINYINT DEFAULT 1
  );

-- Relación categorías → productos
CREATE TABLE IF NOT EXISTS categorias_x_productos (
                                                    id_categorias INT NOT NULL,
                                                    codigo_producto INT NOT NULL,
                                                    PRIMARY KEY (id_categorias, codigo_producto),
  FOREIGN KEY (id_categorias) REFERENCES categorias(id_categorias),
  FOREIGN KEY (codigo_producto) REFERENCES productos(codigo_producto)
  );

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS usuario (
                                     id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                                     fldTelefono VARCHAR(10) NOT NULL,
  fldNombre VARCHAR(45) NOT NULL,
  fldContrasena VARCHAR(200) NOT NULL,
  fldCorreoElectronico VARCHAR(100) NOT NULL
  );

-- Métodos de pago
CREATE TABLE IF NOT EXISTS tipo_pago (
                                       id_tipo_pago INT AUTO_INCREMENT PRIMARY KEY,
                                       tipo VARCHAR(45) NOT NULL
  );

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
                                    idventas INT AUTO_INCREMENT PRIMARY KEY,
                                    fldFecha DATETIME NOT NULL,
                                    telefono VARCHAR(10) NOT NULL,
  id_usuario INT NOT NULL,
  estado ENUM('pendiente','pagado','cancelado') DEFAULT 'pendiente',
  FOREIGN KEY (telefono) REFERENCES cliente(telefono),
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  );

-- Comprobante de pago
CREATE TABLE IF NOT EXISTS comprobante (
                                         id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
                                         id_tipo_pago INT NOT NULL,
                                         idventas INT NOT NULL,
                                         FOREIGN KEY (id_tipo_pago) REFERENCES tipo_pago(id_tipo_pago),
  FOREIGN KEY (idventas) REFERENCES ventas(idventas)
  );

-- Detalles de venta (carrito / líneas de venta)
CREATE TABLE IF NOT EXISTS detalle_ventas (
                                            idventas INT NOT NULL,
                                            codigo_producto INT NOT NULL,
                                            cantidad INT NOT NULL,
                                            subtotal DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (idventas, codigo_producto),
  FOREIGN KEY (idventas) REFERENCES ventas(idventas),
  FOREIGN KEY (codigo_producto) REFERENCES productos(codigo_producto)
  );

-- =========================================
-- 3. PROCEDIMIENTOS ALMACENADOS
-- =========================================
-- (NOTA: NO HAY 'DELIMITER' AQUÍ)

-- Registrar cliente
CREATE PROCEDURE sp_registrar_cliente(
  IN p_telefono VARCHAR(10),
  IN p_nombres VARCHAR(45),
  IN p_apellidos VARCHAR(45),
  IN p_correo VARCHAR(100)
)
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cliente WHERE telefono = p_telefono) THEN
        INSERT INTO cliente (telefono, fldNombres, fldApellidos, fldCorreoElectronico)
        VALUES (p_telefono, p_nombres, p_apellidos, p_correo);
END IF;
END; -- <-- CORREGIDO

-- Registrar consulta
CREATE PROCEDURE sp_registrar_consulta(
  IN p_telefono VARCHAR(10),
  IN p_id_tipo INT,
  IN p_asunto VARCHAR(45),
  IN p_mensaje VARCHAR(200)
)
BEGIN
    IF EXISTS (SELECT 1 FROM cliente WHERE telefono = p_telefono) THEN
        INSERT INTO consulta (telefono, id_tipo, fldAsunto, fldMensaje)
        VALUES (p_telefono, p_id_tipo, p_asunto, p_mensaje);
END IF;
END; -- <-- CORREGIDO

-- Agregar producto al carrito
CREATE PROCEDURE sp_agregar_producto_carrito(
  IN p_idventas INT,
  IN p_codigo_producto INT,
  IN p_cantidad INT
)
BEGIN
    IF EXISTS (SELECT 1 FROM ventas WHERE idventas = p_idventas AND estado = 'pendiente') THEN
        IF EXISTS (SELECT 1 FROM detalle_ventas WHERE idventas = p_idventas AND codigo_producto = p_codigo_producto) THEN
UPDATE detalle_ventas
SET cantidad = cantidad + p_cantidad,
    subtotal = (cantidad + p_cantidad) *
               (SELECT fldPrecio FROM productos WHERE codigo_producto = p_codigo_producto)
WHERE idventas = p_idventas AND codigo_producto = p_codigo_producto;
ELSE
            INSERT INTO detalle_ventas (idventas, codigo_producto, cantidad, subtotal)
SELECT p_idventas, p_codigo_producto, p_cantidad, (fldPrecio * p_cantidad)
FROM productos
WHERE codigo_producto = p_codigo_producto;
END IF;
END IF;
END; -- <-- CORREGIDO

-- Eliminar producto del carrito
CREATE PROCEDURE sp_eliminar_producto_carrito(
  IN p_idventas INT,
  IN p_codigo_producto INT
)
BEGIN
DELETE FROM detalle_ventas
WHERE idventas = p_idventas AND codigo_producto = p_codigo_producto;
END; -- <-- CORREGIDO

-- Actualizar cantidad en carrito
CREATE PROCEDURE sp_actualizar_producto_carrito(
  IN p_idventas INT,
  IN p_codigo_producto INT,
  IN p_nueva_cantidad INT
)
BEGIN
    IF p_nueva_cantidad > 0 THEN
UPDATE detalle_ventas dv
  JOIN productos p ON p.codigo_producto = dv.codigo_producto
  SET dv.cantidad = p_nueva_cantidad,
    dv.subtotal = p.fldPrecio * p_nueva_cantidad
WHERE dv.idventas = p_idventas AND dv.codigo_producto = p_codigo_producto;
ELSE
DELETE FROM detalle_ventas
WHERE idventas = p_idventas AND codigo_producto = p_codigo_producto;
END IF;
END; -- <-- CORREGIDO

-- Listado completo del carrito
CREATE PROCEDURE sp_listar_carrito_completo(IN p_idventas INT)
BEGIN
SELECT
  dv.idventas,
  dv.codigo_producto,
  p.fldNombre AS Producto,
  p.fldMarca AS Marca,
  dp.descripcion AS DetalleDescripcion,
  dp.unidades AS DetalleUnidades,
  p.fldPrecio AS PrecioUnitario,
  dv.cantidad,
  dv.subtotal
FROM detalle_ventas dv
       INNER JOIN productos p ON dv.codigo_producto = p.codigo_producto
       INNER JOIN detalle_productos dp ON p.id_detalle_producto = dp.id_detalle_producto
WHERE dv.idventas = p_idventas
ORDER BY p.fldNombre;
END; -- <-- CORREGIDO

-- Finalizar compra
CREATE PROCEDURE sp_finalizar_compra(
  IN p_idventas INT,
  IN p_id_tipo_pago INT
)
BEGIN
INSERT INTO comprobante (id_tipo_pago, idventas)
VALUES (p_id_tipo_pago, p_idventas);

SELECT SUM(subtotal) AS total_pagado
FROM detalle_ventas
WHERE idventas = p_idventas;
END; -- <-- CORREGIDO

-- Cancelar venta
CREATE PROCEDURE sp_cancelar_venta(IN p_idventas INT)
BEGIN
UPDATE ventas
SET estado = 'cancelado'
WHERE idventas = p_idventas;
END; -- <-- CORREGIDO

-- Productos por categoría
CREATE PROCEDURE sp_listar_productos_por_categoria(IN p_id_categoria INT)
BEGIN
SELECT
  c.fldNombre AS Categoria,
  p.codigo_producto,
  p.fldNombre AS Producto,
  p.fldPrecio,
  p.fldMarca
FROM categorias c
       INNER JOIN categorias_x_productos cp ON c.id_categorias = cp.id_categorias
       INNER JOIN productos p ON cp.codigo_producto = p.codigo_producto
WHERE c.id_categorias = p_id_categoria AND c.visible = 1
ORDER BY p.fldNombre;
END; -- <-- CORREGIDO

-- Producto por ID
CREATE PROCEDURE sp_obtener_producto_por_id(IN p_codigo_producto INT)
BEGIN
SELECT
  p.codigo_producto,
  p.fldNombre,
  p.fldPrecio,
  p.fldMarca,
  dp.descripcion,
  dp.unidades
FROM productos p
       INNER JOIN detalle_productos dp ON p.id_detalle_producto = dp.id_detalle_producto
WHERE p.codigo_producto = p_codigo_producto;
END; -- <-- CORREGIDO

-- =========================================
-- 4. DATOS DE EJEMPLO COMPLETOS
-- =========================================

-- detalle_productos ampliado
INSERT INTO detalle_productos (descripcion, unidades) VALUES
                                                        ('Bolsa de 100 piezas', 100),
                                                        ('Bolsa de 50 piezas', 50),
                                                        ('Tira de 10 piezas', 10),
                                                        ('Pack 200 resistores 1/4W', 200),
                                                        ('Pack 100 condensadores 10µF', 100),
                                                        ('Pack 50 transistores NPN', 50),
                                                        ('Kit 5 integrados 555 Timer', 5),
                                                        ('Bolsa 100 diodos 1N4007', 100),
                                                        ('Pack 50 LED rojos 5mm', 50),
                                                        ('Pack 50 LED verdes 5mm', 50);

-- productos ampliados
INSERT INTO productos (fldNombre, fldPrecio, fldMarca, id_detalle_producto) VALUES
                                                                              ('Resistor 10kΩ 1/4W', 0.50, 'Vishay', 1),
                                                                              ('Condensador 10µF 16V', 1.20, 'Panasonic', 2),
                                                                              ('Transistor NPN BC547', 2.50, 'ON Semiconductor', 3),
                                                                              ('Circuito integrado 555 Timer', 12.00, 'STMicro', 4),
                                                                              ('Diodo rectificador 1N4007', 0.80, 'Diotec', 5),
                                                                              ('Resistor 1kΩ 1/4W', 0.45, 'Vishay', 6),
                                                                              ('Condensador 100µF 16V', 1.50, 'Panasonic', 7),
                                                                              ('LED rojo 5mm', 0.10, 'Kingbright', 8),
                                                                              ('LED verde 5mm', 0.10, 'Kingbright', 9),
                                                                              ('Transistor PNP BC558', 2.80, 'ON Semiconductor', 10);

-- clientes adicionales
INSERT INTO cliente (telefono, fldNombres, fldApellidos, fldCorreoElectronico) VALUES
                                                                                 ('9611234567', 'Juan', 'Pérez', 'juan@example.com'),
                                                                                 ('9619876543', 'Ana', 'López', 'ana@example.com'),
                                                                                 ('9611112222', 'Carlos', 'Ramírez', 'carlos@example.com'),
                                                                                 ('9613334444', 'María', 'González', 'maria@example.com');

-- tipo_consulta ampliado
INSERT INTO tipo_consulta (fldOpciones) VALUES
                                          ('Producto defectuoso'),
                                          ('Método de pago'),
                                          ('Envío'),
                                          ('Garantía'),
                                          ('Devolución');

-- categorias ampliadas
INSERT INTO categorias (fldNombre, fldDescripcion, visible) VALUES
                                                              ('Componentes pasivos', 'Resistencias y condensadores', 1),
                                                              ('Semiconductores', 'Transistores e integrados', 1),
                                                              ('Optoelectrónica', 'LED, fototransistores y sensores de luz', 1);

-- categorias_x_productos ampliadas
INSERT INTO categorias_x_productos (id_categorias, codigo_producto) VALUES
                                                                      (1,1),(1,2),(2,3),(2,4),(2,5),
                                                                      (1,6),(1,7),(3,8),(3,9),(2,10);

-- usuario
INSERT INTO usuario (fldTelefono, fldNombre, fldContrasena, fldCorreoElectronico) VALUES
                                                                                    ('9615555555', 'Admin', 'hashedpassword', 'admin@example.com'),
                                                                                    ('9616660001', 'Carlos', 'hashedpassword', 'carlos.user@example.com');

-- tipo_pago
INSERT INTO tipo_pago (tipo) VALUES
                               ('Tarjeta'),('Efectivo'),('Transferencia');

-- ventas iniciales
INSERT INTO ventas (fldFecha, telefono, id_usuario, estado)
VALUES
  (NOW(), '9611234567', 1, 'pendiente'),
  (NOW(), '9619876543', 2, 'pendiente');

-- detalle_ventas inicial
INSERT INTO detalle_ventas (idventas, codigo_producto, cantidad, subtotal) VALUES
                                                                             (1,1,10,5.00),
                                                                             (1,2,5,6.00),
                                                                             (2,3,3,7.50),
                                                                             (2,4,1,12.00);

-- =========================================
-- 5. TRIGGERS DEL SISTEMA
-- =========================================
-- (NOTA: NO HAY 'DELIMITER' AQUÍ)

-- Validar stock antes de agregar
CREATE TRIGGER trg_validar_stock_carrito
  BEFORE INSERT ON detalle_ventas
  FOR EACH ROW
BEGIN
  DECLARE v_stock INT;

  SELECT dp.unidades INTO v_stock
  FROM detalle_productos dp
         JOIN productos p ON p.id_detalle_producto = dp.id_detalle_producto
  WHERE p.codigo_producto = NEW.codigo_producto
    LIMIT 1;

  IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Componente no encontrado';
END IF;

IF v_stock < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para este componente electrónico';
END IF;
END; -- <-- CORREGIDO

-- Descontar stock después de insertar
CREATE TRIGGER trg_descontar_stock_carrito
  AFTER INSERT ON detalle_ventas
  FOR EACH ROW
BEGIN
  UPDATE detalle_productos dp
    JOIN productos p ON p.id_detalle_producto = dp.id_detalle_producto
    SET dp.unidades = dp.unidades - NEW.cantidad
  WHERE p.codigo_producto = NEW.codigo_producto;
END; -- <-- CORREGIDO

-- Restaurar stock al eliminar línea del carrito
CREATE TRIGGER trg_restaurar_stock_carrito
  AFTER DELETE ON detalle_ventas
  FOR EACH ROW
BEGIN
  UPDATE detalle_productos dp
    JOIN productos p ON p.id_detalle_producto = dp.id_detalle_producto
    SET dp.unidades = dp.unidades + OLD.cantidad
  WHERE p.codigo_producto = OLD.codigo_producto;
END; -- <-- CORREGIDO

-- Ajustar stock antes de actualizar cantidad
CREATE TRIGGER trg_ajustar_stock_al_actualizar
  BEFORE UPDATE ON detalle_ventas
  FOR EACH ROW
BEGIN
  DECLARE v_stock INT;
    DECLARE v_diferencia INT;

  SELECT dp.unidades INTO v_stock
  FROM detalle_productos dp
         JOIN productos p ON p.id_detalle_producto = dp.id_detalle_producto
  WHERE p.codigo_producto = NEW.codigo_producto
    LIMIT 1;

  SET v_diferencia = NEW.cantidad - OLD.cantidad;

    IF v_diferencia > 0 AND v_stock < v_diferencia THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente para aumentar cantidad';
END IF;
END; -- <-- CORREGIDO

-- Ajustar unidades después de UPDATE
CREATE TRIGGER trg_aplicar_ajuste_stock_post_update
  AFTER UPDATE ON detalle_ventas
  FOR EACH ROW
BEGIN
  DECLARE v_diferencia INT;
    SET v_diferencia = NEW.cantidad - OLD.cantidad;

    IF v_diferencia <> 0 THEN
  UPDATE detalle_productos dp
    JOIN productos p ON p.id_detalle_producto = dp.id_detalle_producto
    SET dp.unidades = dp.unidades - v_diferencia
  WHERE p.codigo_producto = NEW.codigo_producto;
END IF;
END; -- <-- CORREGIDO

-- Marcar venta como pagada al generar comprobante
CREATE TRIGGER trg_venta_pagada
  AFTER INSERT ON comprobante
  FOR EACH ROW
BEGIN
  UPDATE ventas
  SET estado = 'pagado'
  WHERE idventas = NEW.idventas;
END; -- <-- CORREGIDO

-- =========================================
-- 6. PRUEBAS FUNCIONALES
-- =========================================

-- Registrar clientes nuevos
CALL sp_registrar_cliente('9610001111', 'Luis', 'Méndez', 'luis@example.com');
CALL sp_registrar_cliente('9610002222', 'Elena', 'Ruiz', 'elena@example.com');

-- Consultas de soporte
CALL sp_registrar_consulta('9611234567', 1, 'Problema con resistor', 'No coincide el valor recibido.');
CALL sp_registrar_consulta('9619876543', 3, 'Duda sobre envío', 'El paquete tardó mucho.');

-- Mostrar stock inicial
SELECT id_detalle_producto, descripcion, unidades FROM detalle_productos;

-- Carrito para venta #1
CALL sp_agregar_producto_carrito(1, 1, 20);
CALL sp_agregar_producto_carrito(1, 2, 10);
CALL sp_agregar_producto_carrito(1, 3, 5);

-- Mostrar carrito
CALL sp_listar_carrito_completo(1);

-- Mostrar stock después de inserciones
SELECT id_detalle_producto, descripcion, unidades FROM detalle_productos;

-- Eliminar línea del carrito
CALL sp_eliminar_producto_carrito(1, 3);

-- Mostrar carrito tras eliminación
CALL sp_listar_carrito_completo(1);

-- Mostrar stock tras eliminación
SELECT id_detalle_producto, descripcion, unidades FROM detalle_productos;

-- Actualizar cantidad
CALL sp_actualizar_producto_carrito(1, 1, 8);

-- Mostrar carrito tras actualización
CALL sp_listar_carrito_completo(1);

-- Consultas de producto y categorías
CALL sp_obtener_producto_por_id(3);
CALL sp_obtener_producto_por_id(4);
CALL sp_listar_productos_por_categoria(1);
CALL sp_listar_productos_por_categoria(2);

-- Finalizar compra
CALL sp_finalizar_compra(1, 1);

-- Verificar comprobante generado
SELECT * FROM comprobante WHERE idventas = 1;

-- Verificar estado de la venta
SELECT idventas, fldFecha, telefono, id_usuario, estado FROM ventas WHERE idventas = 1;

-- =========================================
-- FIN DEL SCRIPT
-- =========================================