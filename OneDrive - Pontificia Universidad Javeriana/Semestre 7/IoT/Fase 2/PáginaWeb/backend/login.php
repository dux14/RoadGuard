<?php
/**
 * PROCESAMIENTO DE INICIO DE SESIÓN
 * 
 * Este script maneja las solicitudes de inicio de sesión de los usuarios.
 * Verifica las credenciales proporcionadas contra la base de datos y 
 * devuelve una respuesta JSON con el resultado del proceso.
 * 
 * El proceso incluye:
 * 1. Recibir y validar datos del formulario
 * 2. Verificar la existencia del usuario
 * 3. Comprobar la contraseña
 * 4. Devolver respuesta con datos del usuario o mensaje de error
 */

// Permitir solicitudes desde cualquier origen
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Incluir archivo de configuración para acceder a la base de datos
require_once 'db_config.php';

// Verificar que la solicitud sea mediante método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener y sanitizar datos del formulario
    $username = htmlspecialchars(trim($_POST['username']));
    $password = $_POST['password']; // No se encripta la contraseña para evitar facilitar su visualización en la base de datos
    
    // Validación básica: verificar que los campos no estén vacíos
    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Por favor, completa todos los campos.']);
        exit();
    }
    
    try {
        // Preparar consulta para buscar al usuario por nombre de usuario
        $stmt = $conn->prepare("SELECT user_id, username, password, first_name, last_name FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        
        // Comprobar si se encontró el usuario
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Verificar la contraseña
            if ($password === $row['password']) {
                // Autenticación exitosa
                                
                // Se devuelve una respuesta exitosa con datos del usuario
                echo json_encode([
                    'success' => true, 
                    'message' => '¡Inicio de sesión exitoso!',
                    'user' => [
                        'id' => $row['user_id'],
                        'username' => $row['username'],
                        'firstName' => $row['first_name'],
                        'lastName' => $row['last_name']
                    ]
                ]);
            } else {
                // La contraseña no coincide, por lo que se devuelve un mensaje de error
                echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta']);
            }
        } else {
            // No existe un usuario con ese nombre de usuario, por lo que se devuelve un mensaje de error
            echo json_encode(['success' => false, 'message' => 'El usuario no existe']);
        }
    } catch(PDOException $e) {
        // Error en la base de datos, por lo que se devuelve un mensaje de error
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
} else {
    // Si la solicitud no es POST, se rechaza con un mensaje de error ya que necesito que esta genere retorno de datos
    echo json_encode(['success' => false, 'message' => 'Método de solicitud inválido']);
}
?>

