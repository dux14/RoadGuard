<?php
/**
 * PROCESAMIENTO DE CAMBIO DE CONTRASEÑA
 * 
 * Este script maneja las solicitudes de restablecimiento de contraseña de los usuarios.
 * Verifica la existencia del correo electrónico en la base de datos y
 * actualiza la contraseña del usuario correspondiente.
 * 
 * El proceso incluye:
 * 1. Recibir y validar datos del formulario
 * 2. Verificar la existencia del correo electrónico
 * 3. Actualizar la contraseña en la base de datos
 * 4. Devolver respuesta con resultado del proceso
 */

// Permitir solicitudes desde cualquier origen (solo para desarrollo)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir archivo de configuración para acceder a la base de datos
require_once 'db_config.php';

// Verificar que la solicitud sea mediante método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del formulario
    $email = htmlspecialchars(trim($_POST['email']));
    $newPassword = $_POST['new_password'];
    
    // Verificar que los campos no estén vacíos
    if (empty($email) || empty($newPassword)) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos.']);
        exit();
    }
    
    try {
        // Verificar si el correo electrónico existe en la base de datos
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            // El correo electrónico no existe, se devuelve mensaje de error
            echo json_encode(['success' => false, 'message' => 'No existe ninguna cuenta asociada a este correo electrónico.']);
            exit();
        }
        
        // Preparar la consulta SQL para actualizar la contraseña
        $stmt = $conn->prepare("UPDATE users SET password = :password WHERE email = :email");
        $stmt->bindParam(':password', $newPassword);
        $stmt->bindParam(':email', $email);
        
        // Ejecutar la consulta de actualización
        if ($stmt->execute()) {
            // Actualización exitosa, se devuelve mensaje de éxito
            echo json_encode(['success' => true, 'message' => '¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...']);
        } else {
            // Error en la actualización, se devuelve mensaje de error
            echo json_encode(['success' => false, 'message' => 'Error al actualizar la contraseña.']);
        }
    } catch(PDOException $e) {
        // Error en la base de datos, se devuelve mensaje con detalles
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
} else {
    // Si la solicitud no es POST, se rechaza con mensaje de error
    echo json_encode(['success' => false, 'message' => 'Método de solicitud inválido']);
}
?> 