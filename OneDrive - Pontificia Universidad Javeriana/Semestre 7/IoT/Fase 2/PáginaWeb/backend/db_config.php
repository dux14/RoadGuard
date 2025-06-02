<?php
/**
 * ARCHIVO DE CONFIGURACIÓN DE LA BASE DE DATOS
 * 
 * Este archivo establece la conexión con la base de datos MySQL en el servidor
 * y configura los parámetros necesarios para la conexión.
 * 
 */

// Parámetros de conexión al servidor de base de datos
$host = 'sql308.infinityfree.com';      // Servidor de hospedaje de la base de datos
$db_name = 'if0_38794891_prueba';       // Nombre de la base de datos
$username = 'if0_38794891';             // Usuario con permisos sobre la base de datos
$password = 'dYeMaF8WgnXGVc';           // Contraseña del usuario

// Crear conexión a la base de datos
try {
    // Establecer la conexión Handshake con la base de datos
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    
    // Configurar Handshake para que lance excepciones en caso de errores SQL
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // En caso de error, mostrar mensaje formateado como JSON y terminar la ejecución
    echo json_encode(['success' => false, 'message' => 'Error de conexión: ' . $e->getMessage()]);
    exit();
}
?>

