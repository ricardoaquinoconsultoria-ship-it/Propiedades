console.log('🔧 Cargando client.js...');

class ModernClientManager {
    constructor() {
        console.log('🚀 Creando ModernClientManager...');
        this.properties = [];
        this.filteredProperties = [];
        this.currentFilter = 'all';
        this.map = null;
        this.markers = [];
    }

    async init() {
        console.log('🔧 Inicializando...');
        try {
            this.setupBasicEventListeners();
            await this.initializeMap();
            await this.loadProperties();
            console.log('✅ Inicialización completada');
        } catch (error) {
            console.error('❌ Error en init:', error);
        }
    }

    setupBasicEventListeners() {
        console.log('🔧 Configurando eventos básicos...');
        
        // Botón admin
        const adminBtn = document.getElementById('adminAccessBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                console.log('👆 Botón admin clickeado');
                this.showAdminModal();
            });
        } else {
            console.log('❌ Botón admin no encontrado');
        }

        // Modal admin
        this.setupAdminModal();
        
        // Filtros básicos
        this.setupBasicFilters();
    }

    setupAdminModal() {
        const modal = document.getElementById('adminModal');
        if (!modal) {
            console.log('❌ Modal admin no encontrado');
            return;
        }

        const closeBtn = document.getElementById('closeAdminModal');
        const cancelBtn = document.getElementById('cancelAdminBtn');
        const submitBtn = document.getElementById('submitAdminBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('❌ Cerrando modal admin');
                this.hideAdminModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                console.log('❌ Cancelando modal admin');
                this.hideAdminModal();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                console.log('✅ Enviando formulario admin');
                this.handleAdminLogin();
            });
        }

        // Cerrar al hacer clic fuera
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAdminModal();
            }
        });
    }

    setupBasicFilters() {
        const mainFilterBtn = document.getElementById('mainFilterBtn');
        if (mainFilterBtn) {
            mainFilterBtn.addEventListener('click', () => {
                console.log('👆 Filtro clickeado');
                const filterOptions = document.getElementById('filterOptions');
                if (filterOptions) {
                    filterOptions.classList.toggle('hidden');
                }
            });
        }

        // Opciones de filtro
        const options = document.querySelectorAll('.filter-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                console.log(`🔍 Filtro seleccionado: ${filter}`);
                this.applyFilter(filter);
            });
        });
    }

    showAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('🔓 Modal admin abierto');
        }
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('🔒 Modal admin cerrado');
        }
    }

    handleAdminLogin() {
        console.log('🔐 Intentando login admin');
        const passwordInput = document.getElementById('adminPassword');
        if (passwordInput) {
            const password = passwordInput.value;
            if (password) {
                console.log('✅ Contraseña ingresada, redirigiendo...');
                window.location.href = 'admin.html';
            } else {
                alert('Por favor ingresa una contraseña');
            }
        }
    }

    async initializeMap() {
        try {
            console.log('🗺️ Intentando inicializar mapa...');
            const mapElement = document.getElementById('map');
            if (!mapElement) {
                console.log('❌ Elemento del mapa no encontrado');
                return;
            }

            this.map = L.map('map').setView([18.7357, -70.1627], 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            console.log('✅ Mapa inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando mapa:', error);
        }
    }

    async loadProperties() {
        console.log('📡 Cargando propiedades...');
        
        // Propiedades de ejemplo simples
        this.properties = [
            {
                id: 1,
                title: "Casa de Ejemplo",
                type: "casa",
                price: 250000,
                location: {
                    address: "Calle Ejemplo 123",
                    lat: 18.4855,
                    lng: -69.8731
                },
                characteristics: {
                    bedrooms: 3,
                    bathrooms: 2,
                    area: 150
                },
                description: "Esta es una propiedad de ejemplo",
                images: ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600"],
                status: "disponible"
            }
        ];

        this.filteredProperties = [...this.properties];
        this.renderProperties();
        this.renderMapMarkers();
    }

    applyFilter(filter) {
        console.log(`🔍 Aplicando filtro: ${filter}`);
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredProperties = [...this.properties];
        } else {
            this.filteredProperties = this.properties.filter(property => 
                property.type === filter
            );
        }
        
        this.renderProperties();
        this.updatePropertiesCount();
        this.renderMapMarkers();
    }

    updatePropertiesCount() {
        const countElement = document.getElementById('propertiesCount');
        if (countElement) {
            countElement.textContent = this.filteredProperties.length;
        }
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        if (!container) {
            console.log('❌ Contenedor de propiedades no encontrado');
            return;
        }

        if (this.filteredProperties.length === 0) {
            container.innerHTML = '<div class="no-properties">No hay propiedades</div>';
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card">
                <div class="property-image">
                    <img src="${property.images[0]}" alt="${property.title}">
                    <div class="property-badge">${property.type}</div>
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-price">$${property.price.toLocaleString()}</div>
                    <div class="property-address">
                        <span>📍</span>
                        <span>${property.location.address}</span>
                    </div>
                    <button class="view-details-btn">Ver Detalles</button>
                </div>
            </div>
        `).join('');
    }

    renderMapMarkers() {
        if (!this.map) return;

        // Limpiar marcadores anteriores
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.filteredProperties.forEach(property => {
            if (property.location && property.location.lat && property.location.lng) {
                const marker = L.marker([property.location.lat, property.location.lng])
                    .addTo(this.map)
                    .bindPopup(`<b>${property.title}</b><br>$${property.price.toLocaleString()}`);
                
                this.markers.push(marker);
            }
        });

        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Inicialización segura
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM completamente cargado');
    
    // Pequeño delay para asegurar que todo esté listo
    setTimeout(() => {
        console.log('🚀 Iniciando aplicación...');
        window.clientManager = new ModernClientManager();
        window.clientManager.init();
    }, 100);
});

console.log('📄 client.js cargado (esperando DOM)...');