/**
 * GESTION DE REGISTRO DE USUARIOS
 * 
 * Este script gestiona la interacción del usuario con el formulario de registro.
 * Se encarga de:
 * 1. Capturar los datos ingresados por el usuario
 * 2. Validar la información proporcionada
 * 3. Enviar la solicitud al servidor mediante fetch API
 * 4. Procesar la respuesta del servidor
 * 5. Mostrar mensajes informativos al usuario
 * 6. Redirigir al usuario en caso de registro exitoso
 */

document.addEventListener('DOMContentLoaded', function() {
    // Log para verificar que el DOM ha sido cargado completamente
    console.log('DOM loaded');
    
    // Obtener referencias a elementos clave del DOM
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');
    
    // Logs de depuración para verificar que los elementos fueron encontrados correctamente
    console.log('registerForm:', registerForm);
    console.log('messageDiv:', messageDiv);

    // Asignar un event listener al formulario para manejar el evento submit
    registerForm.addEventListener('submit', function(e) {
        // Prevenir el comportamiento predeterminado del formulario (evitar recarga de página)
        e.preventDefault();
        
        // Logs de depuración para verificar que el evento submit fue capturado
        console.log('Form submitted');
        console.log('username element:', document.getElementById('username'));
        console.log('email element:', document.getElementById('email'));
        console.log('password element:', document.getElementById('password'));
        console.log('confirm_password element:', document.getElementById('confirm_password'));
        
        // Obtener los valores ingresados por el usuario
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        // Validación del lado del cliente: verificar que las contraseñas coincidan
        if(password !== confirmPassword) {
            // Mostrar mensaje de error si las contraseñas no coinciden
            messageDiv.textContent = 'Las contraseñas no coinciden';
            messageDiv.className = 'error';
            return; // Detener la ejecución si hay error de validación
        }
        
        // Preparar los datos para enviar al servidor en formato FormData
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        
        // Realizar petición para registrar usuario usando Fetch API
        fetch('http://roadguard.infinityfreeapp.com/backend/register.php', {
            method: 'POST', // Método HTTP utilizado para la petición
            body: formData  // Datos del formulario a enviar
        })
        .then(response => response.json()) // Convertir la respuesta a formato JSON
        .then(data => {
            if(data.success) {
                // Caso de registro exitoso
                // Mostrar mensaje de éxito al usuario
                messageDiv.textContent = data.message;
                messageDiv.className = 'success';
                
                // Limpiar el formulario
                registerForm.reset();
                
                // Redireccionar a la página de login después de un breve retardo
                // para que el usuario pueda ver el mensaje de éxito
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000); // 2 segundos de espera
            } else {
                // Caso de error en el registro (ej: nombre de usuario ya existe)
                // Mostrar mensaje de error al usuario
                messageDiv.textContent = data.message;
                messageDiv.className = 'error';
            }
        })
        .catch(error => {
            // Manejo de errores en la comunicación con el servidor
            messageDiv.textContent = 'Error en el servidor. Por favor, inténtalo más tarde.';
            messageDiv.className = 'error';
            console.error('Error:', error); // Log del error para depuración
        });
    });
});