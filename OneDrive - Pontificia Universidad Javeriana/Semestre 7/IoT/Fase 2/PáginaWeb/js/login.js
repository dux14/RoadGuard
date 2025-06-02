/**
 * GESTION DE INICIO DE SESIÓN
 * 
 * Este script gestiona la interacción del usuario con el formulario de inicio de sesión.
 * Se encarga de:
 * 1. Capturar los datos ingresados por el usuario
 * 2. Enviar la solicitud al servidor mediante fetch API
 * 3. Procesar la respuesta del servidor
 * 4. Mostrar mensajes al usuario
 * 5. Redirigir al usuario en caso de autenticación exitosa
 */

document.addEventListener('DOMContentLoaded', function() {
    // Obtener referencias a elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    // Asignar manejador de eventos al formulario
    loginForm.addEventListener('submit', function(e) {
        // Prevenir envío tradicional del formulario
        e.preventDefault();
        
        // Obtener los datos ingresados por el usuario
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Crear objeto FormData para enviar datos al servidor
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        // Enviar solicitud de inicio de sesión al servidor
        fetch('http://roadguard.infinityfreeapp.com/backend/login.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())  // Convertir respuesta a JSON
        .then(data => {
            if(data.success) {
                // Autenticación exitosa
                // Mostrar mensaje de éxito
                messageDiv.textContent = data.message;
                messageDiv.className = 'success';

                // Guardar datos del usuario en sessionStorage para uso en toda la aplicación
                sessionStorage.setItem('userData', JSON.stringify(data.user));
                
                // Redirigir al dashboard después de un breve retraso
                setTimeout(() => {
                    alert('Inicio de sesión exitoso. ¡Bienvenido, ' + username + '!');
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Autenticación fallida - Mostrar mensaje de error
                messageDiv.textContent = data.message;
                messageDiv.className = 'error';
            }
        })
        .catch(error => {
            // Error en la comunicación con el servidor
            messageDiv.textContent = 'Error en el servidor. Por favor, inténtalo más tarde.';
            messageDiv.className = 'error';
            console.error('Error:', error);
        });
    });
});