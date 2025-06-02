/**
 * CONTROLADOR DEL DASHBOARD PRINCIPAL
 * 
 * Este script gestiona las funcionalidades principales del dashboard:
 * 1. Verificación de autenticación del usuario mediante sessionStorage
 * 2. Mostrar información personalizada del usuario en la interfaz
 * 3. Carga y presentación de datos de conductores desde el servidor
 * 4. Manejo de eventos para navegación entre secciones (reportes, mapas)
 * 5. Creación dinámica de elementos UI para mostrar información de conductores
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay datos de usuario en sessionStorage
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    
    if (!userData) {
        // Si no hay datos de usuario, redirigir al login
        window.location.href = 'login.html';
        return;
    }
    
    // Mostrar el nombre de usuario en la cabecera
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) {
        const empresaElement = headerInfo.querySelector('p:last-child');
        if (empresaElement) {
            empresaElement.innerHTML = `<p>Bienvenido ${userData.username}</p>`;
        }
    }

    // Cargar los datos de los conductores desde la API
    loadDriversData();

    // Configurar los botones de ver informe
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-report-btn')) {
            const driverId = e.target.getAttribute('data-driver-id');
            if (driverId) {
                // Redirigir al usuario a la página de informe del conductor seleccionado
                window.location.href = `driver-report.html?id=${driverId}`;
            }
        }
    });

    // Configurar los botones de ubicación
    document.addEventListener('click', function(e) {
        if (e.target && e.target.closest('.location-icon')) {
            const driverId = e.target.closest('.driver-card').getAttribute('data-driver-id');
            if (driverId) {
                // Redirigir al usuario a la página de mapa con la ubicación del conductor
                window.location.href = `map.html?id=${driverId}`;
            }
        }
    });
});

/**
 * Carga los datos de conductores desde el servidor
 * y muestra sus tarjetas en el dashboard
 */
function loadDriversData() {
    const driversContainer = document.querySelector('.driver-cards');
    
    // Limpiar el contenedor antes de añadir nuevas tarjetas
    driversContainer.innerHTML = '';
    
    // Realizar petición para obtener los conductores desde el backend
    fetch('http://roadguard.infinityfreeapp.com/backend/get_drivers.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Para cada conductor, crear una tarjeta y añadirla al contenedor
                data.drivers.forEach(driver => {
                    const driverCard = createDriverCard(driver);
                    driversContainer.appendChild(driverCard);
                });
            } else {
                console.error('Error al cargar los conductores:', data.message);
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
        });
}

/**
 * Crea una tarjeta de conductor con todos sus detalles
 * @param {Object} driver - Datos del conductor recibidos del servidor
 * @returns {HTMLElement} - Elemento DOM con la tarjeta del conductor
 **/
function createDriverCard(driver) {
    // Buscar la ruta actual del conductor si existe
    let routeInfo = driver.route || {};

    // Crear elemento de tarjeta
    const card = document.createElement('div');
    card.className = 'driver-card';
    card.setAttribute('data-driver-id', driver.conductor_id);
    
    // Determinar clase CSS según estado del conductor (Activo/Inactivo)
    const statusClass = driver.estado === 'En Ruta' ? 'status-active' : 'status-inactive';
    
    // Determinar clases y elementos visuales según estilo de conducción
    const styleClass = driver.estilo_conduccion === 'Normal' ? 'style-normal' : 'style-dangerous';
    const statusIconClass = driver.estilo_conduccion === 'Normal' ? 'status-icon-good' : 'status-icon-bad';
    const statusIcon = driver.estilo_conduccion === 'Normal' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    
    // Construir el HTML de la tarjeta con toda la información del conductor
    card.innerHTML = `
        <!-- Driver Info -->
        <div class="driver-info">
            <div class="driver-avatar">
                <img src="${driver.imagen_url || 'img/img.jpg'}" alt="${driver.first_name} ${driver.last_name}">
            </div>
            <div class="driver-details">
                <h2 class="driver-name">${driver.first_name} ${driver.last_name}</h2>
                <p>Edad: ${driver.age}</p>
                <p>Bus Asignado: ${driver.bus_asignado}</p>
                <p>Placa: ${driver.placa}</p>
                <p>
                    Estado:
                    <span class="status-badge ${statusClass}">${driver.estado}</span>
                </p>
                <p>Origen: ${routeInfo.origen || 'No asignado'}</p>
                <p>Destino: ${routeInfo.destino || 'No asignado'}</p>
                <button class="view-report-btn" data-driver-id="${driver.conductor_id}">Ver Informe</button>
            </div>
        </div>
    
        <!-- Driving Style -->
        <div class="card-section">
            <h3 class="section-title">ESTILO DE CONDUCCIÓN</h3>
            <div class="driving-style-grid">
                <div>
                    <p>Número de maniobras: ${Math.floor(Math.random() * 30) + 5}</p>
                    <p>Número de alerta por maniobras: ${Math.floor(Math.random() * 10)}</p>
                    <p>Número de alertas por proximidad: ${Math.floor(Math.random() * 8)}</p>
                    <p>
                        Estilo de conducción:
                        <span class="style-badge ${styleClass}">${driver.estilo_conduccion}</span>
                    </p>
                    <p>
                        Estilo de conducción promedio:
                        <span class="style-badge style-normal">Normal</span>
                    </p>
                </div>
                <div style="display: flex; align-items: center; justify-content: center;">
                    <div class="status-icon ${statusIconClass}">
                        ${statusIcon}
                    </div>
                </div>
            </div>
        </div>

        <!-- Route Indicators -->
        <div class="card-section">
            <h3 class="section-title">INDICADORES DE RUTA</h3>
            <p class="route-indicator">Tiempo transcurrido:</p>
            <p class="route-value">${routeInfo.tiempo_transcurrido || 'No disponible'}</p>
            <p class="route-indicator">Tiempo estimado restante:</p>
            <p class="route-value">${routeInfo.tiempo_restante || 'No disponible'}</p>
            <p class="route-indicator">Distancia:</p>
            <p class="route-value">${routeInfo.distancia_km ? routeInfo.distancia_km + ' km' : 'No disponible'}</p>
        </div>

        <!-- Location -->
        <div class="card-section">
            <h3 class="section-title">UBICACIÓN</h3>
            <div class="location-container">
                <div class="location-icon" style="cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
            </div>
        </div>
    `;
    
    return card;
} 

