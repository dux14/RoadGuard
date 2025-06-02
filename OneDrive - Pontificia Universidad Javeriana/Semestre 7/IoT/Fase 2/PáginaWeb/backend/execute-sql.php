<?php
/**
 * EJECUCIÓN DE SCRIPT SQL PARA INICIALIZACIÓN DE LA BASE DE DATOS
 * 
 * Este script permite ejecutar el archivo script.sql que contiene las instrucciones
 * para crear la base de datos, tablas y datos iniciales del sistema RoadGuard.
 * 
 * El proceso incluye:
 * 1. Conectar a la base de datos sin seleccionar esquema específico
 * 2. Leer el contenido del archivo script.sql para crear la base de datos
 * 3. Dividir el script en consultas individuales
 * 4. Ejecutar cada consulta y registrar su resultado
 * 5. Devolver respuesta JSON con el resultado de la ejecución
 */

// Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Parámetros de conexión
$host = 'sql308.infinityfree.com';
$username = 'if0_38794891';
$password = 'dYeMaF8WgnXGVc';

try {
    // Conectar sin seleccionar una base de datos
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Leer el script de SQL para crear la base de datos
    $sql_file = file_get_contents('../sql/script.sql');
    
    // Dividir en sentencias SQL individuales (eliminar comentarios y dividir por punto y coma)
    $queries = preg_replace('/--.*\n/', '', $sql_file);
    $queries = explode(';', $queries);
    
    $results = [];
    
    // Ejecutar cada consulta
    foreach ($queries as $query) {
        $query = trim($query);
        if (!empty($query)) {
            try {
                $stmt = $conn->prepare($query);
                $stmt->execute();
                $results[] = [
                    'query' => substr($query, 0, 50) . (strlen($query) > 50 ? '...' : ''),
                    'status' => 'success'
                ];
            } catch (PDOException $e) {
                $results[] = [
                    'query' => substr($query, 0, 50) . (strlen($query) > 50 ? '...' : ''),
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }
    }
    // Mostrar mensaje de éxito para cada consulta
    echo json_encode([
        'success' => true,
        'message' => 'Script SQL ejecutado.',
        'results' => $results
    ]);
    
} catch(PDOException $e) {
    // Mostrar mensaje de error para cada consulta
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]);
}
?> 

