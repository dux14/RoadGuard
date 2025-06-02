/**
 * CONTROLADOR DE LA PÁGINA DE INFORME DE CONDUCTOR
 * 
 * Este script gestiona la visualización de datos detallados para un conductor específico:
 * 1. Recupera el ID del conductor desde los parámetros de la URL
 * 2. Obtiene los datos del conductor y sus alertas desde el servidor
 * 3. Prepara y renderiza los gráficos de alertas y estadísticas
 * 4. Muestra toda la información relevante del conductor y su historial
 */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar la autenticación del usuario antes de mostrar los datos
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    if (!userData) {
        window.location.href = 'login.html';
        return;
    }

    // Extraer el ID del conductor desde los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const driverId = params.get('id');
    
    if (!driverId) {
        // Si no hay ID de conductor, mostrar error y redirigir al dashboard
        alert('Error: No se especificó un conductor');
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Configurar los elementos de la interfaz
    setupUIElements(userData);
    
    // Cargar los datos del conductor seleccionado
    loadDriverData(driverId);
    
    // Configurar los botones de navegación
    setupNavigation();
});

/**
 * Configura los elementos básicos de la interfaz de usuario
 * @param {Object} userData - Datos del usuario logueado
 */
function setupUIElements(userData) {
    // Mostrar información del usuario en la cabecera
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) {
        const empresaElement = headerInfo.querySelector('p:last-child');
        if (empresaElement) {
            empresaElement.innerHTML = `<p>Bienvenido ${userData.username}</p>`;
        }
    }
    
    // Configurar el botón de volver al dashboard
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
}

/**
 * Configura los eventos de navegación y botones adicionales
 */
function setupNavigation() {
    // Configurar el botón de exportar a Excel (si existe)
    const exportButton = document.querySelector('.export-button');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            alert('Exportando informe a Excel... Función en desarrollo');
        });
    }
}

/**
 * Carga los datos del conductor desde el servidor
 * @param {string} driverId - ID del conductor a consultar
 */
function loadDriverData(driverId) {
    // Mostrar mensaje de carga mientras se obtienen los datos
    const reportContainer = document.querySelector('.driver-report-container');
    if (reportContainer) {
        reportContainer.innerHTML = '<div class="loading">Cargando datos del conductor...</div>';
    }
    
    // Realizar la petición al servidor para obtener los datos del conductor
    fetch(`http://roadguard.infinityfreeapp.com/backend/get_driver.php?id=${driverId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar la información del conductor
                displayDriverInfo(data.driver);
                
                // Cargar las alertas del conductor
                loadDriverAlerts(driverId);
            } else {
                // Mostrar mensaje de error
                console.error('Error al cargar los datos del conductor:', data.message);
                reportContainer.innerHTML = `<div class="error">Error al cargar los datos: ${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error en la petición:', error);
            if (reportContainer) {
                reportContainer.innerHTML = `<div class="error">Error de conexión: ${error.message}</div>`;
            }
        });
}

/**
 * Muestra la información básica del conductor en la interfaz
 * @param {Object} driver - Datos del conductor
 */
function displayDriverInfo(driver) {
    const reportContainer = document.querySelector('.driver-report-container');
    if (!reportContainer) return;
    
    // Crear el encabezado del informe con los datos del conductor
    reportContainer.innerHTML = `
        <div class="driver-header">
            <div class="driver-avatar">
                <img src="${driver.imagen_url || 'img/img.jpg'}" alt="${driver.first_name} ${driver.last_name}">
            </div>
            <div class="driver-header-info">
                <h1>${driver.first_name} ${driver.last_name}</h1>
                <div class="driver-details">
                    <div class="detail-item">
                        <span class="detail-label">Edad:</span>
                        <span class="detail-value">${driver.age}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Bus Asignado:</span>
                        <span class="detail-value">${driver.bus_asignado}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Placa:</span>
                        <span class="detail-value">${driver.placa}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-value status-badge ${driver.estado === 'En Ruta' ? 'status-active' : 'status-inactive'}">${driver.estado}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Estilo de Conducción:</span>
                        <span class="detail-value style-badge ${driver.estilo_conduccion === 'Normal' ? 'style-normal' : 'style-dangerous'}">${driver.estilo_conduccion}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="alert-chart-container">
            <h2>Alertas en el Tiempo</h2>
            <canvas id="alertChart"></canvas>
        </div>
        <div class="alerts-container">
            <h2>Historial de Alertas</h2>
            <div class="alert-list" id="alertList">
                <div class="loading">Cargando alertas...</div>
            </div>
        </div>
    `;
}

/**
 * Carga las alertas del conductor desde el servidor
 * @param {string} driverId - ID del conductor
 */
function loadDriverAlerts(driverId) {
    fetch(`http://roadguard.infinityfreeapp.com/backend/get_driver_alerts.php?id=${driverId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar las alertas en la interfaz
                displayAlerts(data.alerts);
                
                // Crear el gráfico de alertas
                createAlertChart(data.alerts);
            } else {
                console.error('Error al cargar las alertas:', data.message);
                document.getElementById('alertList').innerHTML = `<div class="error">Error al cargar las alertas: ${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error en la petición de alertas:', error);
            document.getElementById('alertList').innerHTML = `<div class="error">Error de conexión: ${error.message}</div>`;
        });
}

/**
 * Muestra las alertas en la lista de alertas
 * @param {Array} alerts - Lista de alertas del conductor
 */
function displayAlerts(alerts) {
    const alertList = document.getElementById('alertList');
    if (!alertList) return;
    
    if (alerts.length === 0) {
        alertList.innerHTML = '<div class="no-alerts">No hay alertas registradas para este conductor</div>';
        return;
    }
    
    // Ordenar las alertas por fecha (más recientes primero)
    alerts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Crear el HTML para cada alerta
    alertList.innerHTML = alerts.map(alert => {
        const alertClass = alert.tipo === 'Maniobra Peligrosa' ? 'alert-dangerous' : 'alert-warning';
        const date = new Date(alert.fecha);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="alert-item ${alertClass}">
                <div class="alert-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.tipo}</div>
                    <div class="alert-description">${alert.descripcion}</div>
                    <div class="alert-date">${formattedDate}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Crea un gráfico para visualizar las alertas en el tiempo
 * @param {Array} alerts - Lista de alertas del conductor
 */
function createAlertChart(alerts) {
    if (alerts.length === 0) return;
    
    const ctx = document.getElementById('alertChart');
    if (!ctx) return;
    
    // Organizar los datos por fecha para el gráfico
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    // Filtrar alertas del último mes
    const recentAlerts = alerts.filter(alert => new Date(alert.fecha) > lastMonthDate);
    
    // Agrupar alertas por día
    const alertsByDate = {};
    recentAlerts.forEach(alert => {
        const date = new Date(alert.fecha).toLocaleDateString('es-ES');
        if (!alertsByDate[date]) {
            alertsByDate[date] = { maniobras: 0, proximidad: 0 };
        }
        
        if (alert.tipo === 'Maniobra Peligrosa') {
            alertsByDate[date].maniobras++;
        } else {
            alertsByDate[date].proximidad++;
        }
    });
    
    // Preparar datos para Chart.js
    const dates = Object.keys(alertsByDate).sort((a, b) => new Date(a) - new Date(b));
    const maniobraData = dates.map(date => alertsByDate[date].maniobras);
    const proximidadData = dates.map(date => alertsByDate[date].proximidad);
    
    // Crear el gráfico
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Maniobras Peligrosas',
                    data: maniobraData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    tension: 0.1,
                    fill: true
                },
                {
                    label: 'Alertas de Proximidad',
                    data: proximidadData,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Alertas en el último mes'
                }
            }
        }
    });
}

