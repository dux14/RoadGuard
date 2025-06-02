/**
 * MANEJADOR DE CAMBIO DE CONTRASEÑA
 * 
 * Este script gestiona la interacción del usuario con el formulario de cambio de contraseña.
 * Se encarga de:
 * 1. Capturar los datos ingresados por el usuario
 * 2. Validar la información proporcionada (coincidencia y longitud mínima de contraseña)
 * 3. Enviar la solicitud al servidor mediante fetch API
 * 4. Procesar la respuesta del servidor
 * 5. Mostrar mensajes informativos al usuario
 * 6. Redirigir al usuario en caso de cambio exitoso
 */

// Se ejecuta cuando el DOM ha sido completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos clave del DOM
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const messageDiv = document.getElementById('message');

    // Asignar manejador de eventos al formulario para procesar el envío
    forgotPasswordForm.addEventListener('submit', function(e) {
        // Prevenir comportamiento predeterminado del formulario (evitar recarga de página)
        e.preventDefault();
        
        // Obtener los datos ingresados en el formulario
        const email = document.getElementById('email').value;
        const newPassword = document.getElementById('new_password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        // Verificar que las contraseñas coincidan
        if(newPassword !== confirmPassword) {
            // Mostrar mensaje de error si las contraseñas no coinciden
            messageDiv.textContent = 'Las contraseñas no coinciden';
            messageDiv.className = 'error';
            return; 
        }
        
        // Verificar que la contraseña tenga al menos 6 caracteres
        if(newPassword.length < 6) {
            // Mostrar mensaje de error si la contraseña es muy corta
            messageDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
            messageDiv.className = 'error';
            return;
        }
        
        // Preparar los datos para enviar al servidor
        const formData = new FormData();
        formData.append('email', email);
        formData.append('new_password', newPassword);
        
        // Enviar solicitud al servidor
        fetch('http://roadguard.infinityfreeapp.com/backend/reset-password.php', {
            method: 'POST', // Método HTTP utilizado para la petición
            body: formData  // Datos del formulario a enviar
        })
        .then(response => response.json()) // Convertir la respuesta a formato JSON
        .then(data => {
            if(data.success) {
                // Caso de actualización exitosa
                // Mostrar mensaje de éxito al usuario
                messageDiv.textContent = data.message;
                messageDiv.className = 'success';
                
                // Redireccionar a la página de inicio de sesión después de un breve retardo
                // para que el usuario pueda ver el mensaje de éxito
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000); // 2 segundos de espera
            } else {
                // Caso de error en la actualización (ej: correo no existe)
                // Mostrar mensaje de error al usuario
                messageDiv.textContent = data.message;
                messageDiv.className = 'error';
            }
        })
        .catch(error => {
            // Manejo de errores en la comunicación con el servidor
            messageDiv.textContent = 'Error en el servidor. Por favor, inténtalo más tarde.';
            messageDiv.className = 'error';
            console.error('Error:', error);
        });
    });
}); 

