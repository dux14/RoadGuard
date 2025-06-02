<?php
/**
 * PROCESAMIENTO DE REGISTRO DE USUARIOS
 * 
 * Este script maneja las solicitudes de registro de nuevos usuarios.
 * Valida los datos proporcionados, verifica que no existan duplicados,
 * y almacena la información en la base de datos.
 * 
 * El proceso incluye:
 * 1. Recibir y validar datos del formulario
 * 2. Verificar que el nombre de usuario y email no existan previamente
 * 3. Insertar el nuevo usuario en la base de datos
 * 4. Devolver respuesta con resultado del proceso
 */

// Permitir solicitudes desde cualquier origen (solo para desarrollo)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir archivo de configuración de la base de datos
require_once 'db_config.php';

// Verificar que la solicitud sea mediante método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del formulario
    $username = htmlspecialchars(trim($_POST['username']));
    $email = htmlspecialchars(trim($_POST['email']));
    $password = $_POST['password'];

    
    // Validación básica: verificar que los campos obligatorios no estén vacíos, si lo están se devuelve un mensaje de error
    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos obligatorios.']);
        exit();
    }
    
    try {
        // Verificar si el nombre de usuario ya existe en la base de datos
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        if ($stmt->fetchColumn() > 0) {
            // El nombre de usuario ya existe, se devuelve mensaje de error
            echo json_encode(['success' => false, 'message' => 'El nombre de usuario ya está en uso.']);
            exit();
        }
        
        // Verificar si el correo electrónico ya existe en la base de datos
        $stmt = $conn->prepare("SELECT COUNT(*) FROM users WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->fetchColumn() > 0) {
            // El correo electrónico ya existe, se devuelve mensaje de error
            echo json_encode(['success' => false, 'message' => 'El correo electrónico ya está registrado.']);
            exit();
        }
        
        // Preparar la consulta SQL para insertar el nuevo usuario en la base de datos
        $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (:username, :password, :email)");
        
        // Vincular parámetros con los valores recopilados
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':email', $email);
        
        // Ejecutar la consulta de inserción
        if ($stmt->execute()) {
            // Registro exitoso, se devuelve mensaje de éxito
            echo json_encode(['success' => true, 'message' => '¡Registro exitoso! Redirigiendo al inicio de sesión...']);
        } else {
            // Error en la inserción, se devuelve mensaje de error
            echo json_encode(['success' => false, 'message' => 'Error al registrar el usuario.']);
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

