/*
 * SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS ROADGUARD
 * 
 * Este script crea la estructura completa de la base de datos para el sistema RoadGuard,
 * incluyendo tablas, relaciones y datos iniciales para pruebas.
 * 
 * La base de datos gestiona:
 * - Usuarios del sistema (administradores)
 * - Conductores monitoreados
 * - Ciudades para rutas
 * - Rutas y sus métricas asociadas
 */

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS if0_38794891_prueba;

-- Seleccionar la base de datos para su uso
USE if0_38794891_prueba;

/*
 * TABLA DE USUARIOS
 * 
 * Almacena la información de los usuarios que pueden acceder al sistema.
 * Estos usuarios son principalmente administradores y supervisores.
 */
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificador único de usuario
    username VARCHAR(50) NOT NULL UNIQUE,         -- Nombre de usuario para login (único)
    password VARCHAR(255) NOT NULL,               -- Contraseña (debería estar hasheada en producción)
    email VARCHAR(100) NOT NULL UNIQUE,           -- Correo electrónico (único)
    first_name VARCHAR(50),                       -- Nombre
    last_name VARCHAR(50),                        -- Apellido
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   -- Fecha y hora de creación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha y hora de última actualización
    is_active BOOLEAN DEFAULT TRUE,               -- Indica si el usuario está activo (puede iniciar sesión)
    license_active BOOLEAN DEFAULT FALSE          -- Indica si la licencia del usuario está activa
);

/*
 * TABLA DE CIUDADES
 * 
 * Catálogo de ciudades que pueden ser origen o destino de rutas.
 * Se utiliza como referencia para las rutas de los conductores.
 */
CREATE TABLE IF NOT EXISTS ciudades (
    ciudad_id INT AUTO_INCREMENT PRIMARY KEY,     -- Identificador único de ciudad
    nombre VARCHAR(100) NOT NULL UNIQUE           -- Nombre de la ciudad (único)
);

/*
 * TABLA DE CONDUCTORES
 * 
 * Almacena la información de los conductores monitoreados por el sistema.
 * Cada conductor puede tener asignado un bus y tendrá un historial de rutas.
 */
CREATE TABLE IF NOT EXISTS conductores (
    conductor_id INT AUTO_INCREMENT PRIMARY KEY,  -- Identificador único del conductor
    first_name VARCHAR(50) NOT NULL,              -- Nombre del conductor
    last_name VARCHAR(50) NOT NULL,               -- Apellido del conductor
    age INT NOT NULL,                             -- Edad del conductor
    bus_asignado ENUM('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20') NOT NULL, -- Número de bus asignado
    placa VARCHAR(7) NOT NULL,                    -- Placa del vehículo
    estado ENUM('Inactivo', 'En Ruta') NOT NULL DEFAULT 'Inactivo', -- Estado actual del conductor
    estilo_conduccion ENUM('Normal', 'Peligrosa') NOT NULL DEFAULT 'Normal', -- Evaluación del estilo de conducción
    imagen_url VARCHAR(255),                      -- URL a la imagen del conductor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   -- Fecha y hora de registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Fecha y hora de última actualización
);

/*
 * TABLA DE RUTAS
 * 
 * Registra las rutas asignadas a los conductores, con métricas
 * como distancia, tiempo estimado, consumo de combustible y velocidad.
 * Se relaciona con las tablas de conductores y ciudades.
 */
CREATE TABLE IF NOT EXISTS rutas (
    ruta_id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificador único de la ruta
    origen_id INT NOT NULL,                       -- ID de la ciudad de origen (clave foránea)
    destino_id INT NOT NULL,                      -- ID de la ciudad de destino (clave foránea)
    conductor_id INT NOT NULL,                    -- ID del conductor asignado (clave foránea)
    distancia_km DECIMAL(10,2) NOT NULL,          -- Distancia de la ruta en kilómetros
    tiempo_estimado INT NOT NULL,                 -- Tiempo estimado en minutos
    consumo_combustible DECIMAL(10,2) NOT NULL,   -- Consumo de combustible estimado en litros
    velocidad_promedio INT NOT NULL,              -- Velocidad promedio en km/h
    fecha_inicio DATETIME NOT NULL,               -- Fecha y hora de inicio de la ruta
    fecha_fin DATETIME,                           -- Fecha y hora de finalización (NULL si está en curso)
    estado ENUM('Programada', 'En Curso', 'Completada', 'Cancelada') NOT NULL DEFAULT 'Programada', -- Estado actual de la ruta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                   -- Fecha y hora de creación del registro
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha y hora de última actualización
    FOREIGN KEY (origen_id) REFERENCES ciudades(ciudad_id),           -- Relación con tabla ciudades (origen)
    FOREIGN KEY (destino_id) REFERENCES ciudades(ciudad_id),          -- Relación con tabla ciudades (destino)
    FOREIGN KEY (conductor_id) REFERENCES conductores(conductor_id)   -- Relación con tabla conductores
);

/*
 * DATOS INICIALES
 * 
 * A continuación se insertan datos de ejemplo para permitir
 * probar el sistema sin necesidad de crear registros manualmente.
 */

-- Insertar datos de ciudades principales de Colombia
INSERT INTO ciudades (nombre) VALUES 
('Bogotá'), ('Medellín'), ('Cali'), ('Barranquilla'), ('Cartagena'), 
('Bucaramanga'), ('Pereira'), ('Manizales'), ('Girardot'), ('Santa Marta'),
('Pasto'), ('Villavicencio'), ('Ibagué'), ('Neiva'), ('Valledupar');

-- Insertar datos de conductores de ejemplo con diferentes estados y estilos de conducción
INSERT INTO conductores (first_name, last_name, age, bus_asignado, placa, estado, estilo_conduccion, imagen_url) VALUES
('Enrique', 'Justo', 53, '11', 'WFL957', 'En Ruta', 'Normal', 'img/img.jpg'),
('Carlos', 'Rodríguez', 45, '5', 'THX123', 'Inactivo', 'Normal', 'img/img.jpg'),
('María', 'Gómez', 38, '7', 'YFG456', 'En Ruta', 'Normal', 'img/img.jpg'),
('Pedro', 'Martínez', 51, '3', 'ZKL789', 'Inactivo', 'Peligrosa', 'img/img.jpg'),
('Ana', 'Sánchez', 42, '9', 'WMP654', 'En Ruta', 'Normal', 'img/img.jpg');

-- Insertar datos de rutas activas para los conductores en estado "En Ruta"
-- NOW() representa la fecha y hora actual del servidor
INSERT INTO rutas (origen_id, destino_id, conductor_id, distancia_km, tiempo_estimado, consumo_combustible, velocidad_promedio, fecha_inicio, estado) VALUES
(1, 9, 1, 134.0, 180, 45.5, 65, NOW(), 'En Curso'),     -- Ruta Bogotá - Girardot para Enrique Justo
(2, 3, 3, 421.0, 360, 120.8, 70, NOW(), 'En Curso'),    -- Ruta Medellín - Cali para María Gómez
(5, 10, 5, 220.0, 240, 80.0, 60, NOW(), 'En Curso');    -- Ruta Cartagena - Santa Marta para Ana Sánchez