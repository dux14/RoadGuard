<?php
// Permitir solicitudes desde cualquier origen (solo para desarrollo)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir archivo de configuración de la base de datos
require_once 'db_config.php';

try {
    // Query para obtener conductores ordenados por estado y nombre
    $stmt = $conn->prepare("SELECT * FROM conductores ORDER BY estado DESC, first_name ASC");
    $stmt->execute();
    $drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Para cada conductor, buscar si tiene una ruta activa
    foreach ($drivers as &$driver) {
        // Buscar ruta activa
        $stmtRoute = $conn->prepare(
            "SELECT r.*, 
                    origen.nombre as origen, 
                    destino.nombre as destino
             FROM rutas r
             JOIN ciudades origen ON r.origen_id = origen.ciudad_id
             JOIN ciudades destino ON r.destino_id = destino.ciudad_id
             WHERE r.conductor_id = :conductor_id 
             AND r.estado = 'En Curso'
             ORDER BY r.fecha_inicio DESC
             LIMIT 1"
        );
        $stmtRoute->bindParam(':conductor_id', $driver['conductor_id']);
        $stmtRoute->execute();
        
        if ($route = $stmtRoute->fetch(PDO::FETCH_ASSOC)) {
            // Calcular tiempo transcurrido de la ruta activa
            // Obtener la fecha y hora actual
            $fechaInicio = new DateTime($route['fecha_inicio']);
            $ahora = new DateTime();
            // Calcular el intervalo entre la fecha de inicio y la fecha actual
            $intervalo = $fechaInicio->diff($ahora);
            // Definir el tiempo transcurrido en formato de horas y minutos
            $tiempoTranscurrido = "";
            if ($intervalo->h > 0 || $intervalo->d > 0) {
                $horas = $intervalo->h + ($intervalo->d * 24);
                $tiempoTranscurrido = $horas . " hora(s) " . $intervalo->i . " minuto(s)";
            } else {
                $tiempoTranscurrido = $intervalo->i . " minuto(s)";
            }
            // Calcular tiempo restante de la ruta activa
            // Obtener el tiempo estimado de la ruta
            $tiempoEstimadoMinutos = $route['tiempo_estimado'];
            // Calcular el tiempo transcurrido en minutos
            $tiempoTranscurridoMinutos = ($intervalo->h * 60) + $intervalo->i + ($intervalo->d * 24 * 60);
            // Calcular el tiempo restante en minutos
            $tiempoRestanteMinutos = max(0, $tiempoEstimadoMinutos - $tiempoTranscurridoMinutos);
            // Definir el tiempo restante en formato de horas y minutos
            $horasRestantes = floor($tiempoRestanteMinutos / 60);
            $minutosRestantes = $tiempoRestanteMinutos % 60;
            $tiempoRestante = $horasRestantes . " hora(s) " . $minutosRestantes . " minuto(s)";

            // Asignar los tiempos transcurrido y restante a la ruta
            $route['tiempo_transcurrido'] = $tiempoTranscurrido;
            $route['tiempo_restante'] = $tiempoRestante;
            
            // Asignar la ruta al conductor
            $driver['route'] = $route;
        }
    }

    // Mostrar mensaje de éxito
    echo json_encode([
        'success' => true,
        'drivers' => $drivers
    ]);
    
} catch(PDOException $e) {
    // Mostrar mensaje de error
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los conductores: ' . $e->getMessage()
    ]);
}
?> 