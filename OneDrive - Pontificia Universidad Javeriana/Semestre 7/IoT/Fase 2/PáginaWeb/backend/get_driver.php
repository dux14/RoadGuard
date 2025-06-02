<?php
// Permitir solicitudes desde cualquier origen
header("Content-Type: application/json; charset=UTF-8");

// Incluir archivo de configuración de la base de datos
require_once 'db_config.php';

// Verificar si se proporcionó un ID
if (!isset($_GET['id']) || empty($_GET['id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de conductor no proporcionado'
    ]);
    exit();
}

$driverId = intval($_GET['id']);

try {
    // Consulta para obtener el conductor
    $stmt = $conn->prepare("SELECT * FROM conductores WHERE conductor_id = :id");
    $stmt->bindParam(':id', $driverId);
    $stmt->execute();
    
    $driver = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$driver) {
        // Si no se encuentra el conductor, mostrar mensaje de error
        echo json_encode([
            'success' => false,
            'message' => 'Conductor no encontrado'
        ]);
        exit();
    }
    
    // Query para obtener las rutas activas de los últimos 5 registros
    $stmtRoutes = $conn->prepare(
        "SELECT r.*, 
                origen.nombre as origen, 
                destino.nombre as destino
         FROM rutas r
         JOIN ciudades origen ON r.origen_id = origen.ciudad_id
         JOIN ciudades destino ON r.destino_id = destino.ciudad_id
         WHERE r.conductor_id = :conductor_id 
         ORDER BY r.fecha_inicio DESC
         LIMIT 5"
    );

    // Ejecutar la consulta para obtener los ID de las rutas asociadas al ID del conductor
    $stmtRoutes->bindParam(':conductor_id', $driverId);
    $stmtRoutes->execute();
    
    // Obtener las rutas activas
    $routes = $stmtRoutes->fetchAll(PDO::FETCH_ASSOC);
    
    // Añadir rutas al conductor
    $driver['routes'] = $routes;
    
    // Mostrar mensaje de éxito
    echo json_encode([
        'success' => true,
        'driver' => $driver
    ]);
    
} catch(PDOException $e) {
    // Mostrar mensaje de error
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener el conductor: ' . $e->getMessage()
    ]);
}
?> 

