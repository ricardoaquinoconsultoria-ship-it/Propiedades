class ClientManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentFilter = 'all';
        this.map = null;
        this.markers = [];
        this.ADMIN_PASSWORD = "Admin4050";
        this.init();
    }

    async init() {
        console.log('Inicializando ClientManager...');
        this.setupEventListeners();
        await this.initializeMap();
        await this.loadProperties();
    }

    setupEventListeners() {
        // Botón administrador - Modal de contraseña
        const adminBtn = document.getElementById('adminAccessBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminModal();
            });
        }

        // Modal de administrador
        this.setupAdminModalListeners();

        // Configurar filtros
        this.setupFilterListeners();
    }

    setupAdminModalListeners() {
        const modal = document.getElementById('adminModal');
        const closeBtn = document.getElementById('closeAdminModal');
        const cancelBtn = document.getElementById('cancelAdminBtn');
        const form = document.getElementById('adminPasswordForm');

        // Cerrar modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAdminModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideAdminModal();
            });
        }

        // Enviar formulario
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }

        // Cerrar modal al hacer clic fuera
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAdminModal();
                }
            });
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideAdminModal();
            }
        });
    }

    showAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.getElementById('adminPassword').focus();
        }
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('adminPassword').value = '';
        }
    }

    handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;
        
        if (password === this.ADMIN_PASSWORD) {
            // Contraseña correcta, redirigir a admin
            window.location.href = 'admin.html';
        } else {
            alert('❌ Contraseña incorrecta. Intenta nuevamente.');
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    setupFilterListeners() {
        const filterBtn = document.getElementById('filterBtn');
        const filterDropdown = document.getElementById('filterDropdown');
        const filterOptions = document.querySelectorAll('.filter-option');

        // Toggle dropdown
        if (filterBtn) {
            filterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                filterDropdown.classList.toggle('hidden');
                filterBtn.classList.toggle('active');
            });
        }

        // Seleccionar opción de filtro
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Actualizar UI
                filterOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Cerrar dropdown
                filterDropdown.classList.add('hidden');
                filterBtn.classList.remove('active');
                
                // Actualizar texto del botón
                const label = option.querySelector('.filter-label').textContent;
                const icon = option.querySelector('.filter-icon').textContent;
                this.updateFilterButtonText(icon + ' ' + label);
            });
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            filterDropdown.classList.add('hidden');
            filterBtn.classList.remove('active');
        });
    }

    async initializeMap() {
        try {
            // Coordenadas por defecto (República Dominicana)
            const defaultLocation = [18.7357, -70.1627];
            
            this.map = L.map('map').setView(defaultLocation, 8);

            // Capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            console.log('Mapa inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando mapa:', error);
        }
    }

    async loadProperties() {
        try {
            console.log('Cargando propiedades desde Supabase...');
            
            const { data: properties, error } = await supabase
                .from('properties')
                .select('*')
                .eq('status', 'disponible')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error de Supabase:', error);
                throw error;
            }

            console.log('Propiedades cargadas:', properties?.length || 0);
            this.properties = properties || [];
            this.filteredProperties = [...this.properties];
            
            this.renderProperties();
            this.updatePropertiesCount();
            this.addPropertiesToMap();

        } catch (error) {
            console.error('Error cargando propiedades:', error);
            this.showError('Error al cargar las propiedades');
        }
    }

    applyFilter(filter) {
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
        this.updatePropertiesTitle(filter);
        this.updateMapWithFilteredProperties();
    }

    updateFilterButtonText(text) {
        const filterBtn = document.getElementById('filterBtn');
        if (filterBtn) {
            const span = filterBtn.querySelector('.filter-text');
            if (span) {
                span.textContent = text;
            }
        }
    }

    updatePropertiesTitle(filter) {
        const titleElement = document.getElementById('propertiesTitle');
        if (!titleElement) return;

        const titles = {
            'all': '📋 Todas las Propiedades',
            'casa': '🏠 Casas Disponibles',
            'apartamento': '🏢 Apartamentos Disponibles', 
            'oficina': '🏛️ Oficinas Disponibles',
            'solar': '📐 Solares Disponibles'
        };

        titleElement.textContent = titles[filter] || titles.all;
    }

    updatePropertiesCount() {
        const countElement = document.getElementById('propertiesCount');
        if (countElement) {
            countElement.textContent = this.filteredProperties.length;
        }
    }

    addPropertiesToMap() {
        if (!this.map) return;

        this.clearMapMarkers();

        this.properties.forEach(property => {
            this.addPropertyToMap(property);
        });
    }

    updateMapWithFilteredProperties() {
        if (!this.map) return;

        this.clearMapMarkers();

        this.filteredProperties.forEach(property => {
            this.addPropertyToMap(property);
        });

        // Ajustar vista del mapa si hay propiedades
        if (this.markers.length > 0) {
            const group = L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    addPropertyToMap(property) {
        const lat = property.location?.lat;
        const lng = property.location?.lng;

        if (lat && lng) {
            try {
                const marker = L.marker([lat, lng]).addTo(this.map);
                
                const popupContent = `
                    <div style="min-width: 200px;">
                        <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${this.escapeHtml(property.title)}</h4>
                        <p style="margin: 0 0 5px 0; font-weight: bold; color: #27ae60;">$${(property.price || 0).toLocaleString()}</p>
                        <p style="margin: 0 0 5px 0; color: #7f8c8d;">${this.escapeHtml(property.type)}</p>
                        <p style="margin: 0; font-size: 12px; color: #95a5a6;">${this.escapeHtml(property.location?.address || '')}</p>
                    </div>
                `;
                
                marker.bindPopup(popupContent);
                this.markers.push(marker);
            } catch (error) {
                console.error('Error agregando marcador:', error);
            }
        }
    }

    clearMapMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        
        if (!container) {
            console.error('No se encontró el contenedor propertiesGrid');
            return;
        }

        if (this.filteredProperties.length === 0) {
            const noPropertiesText = {
                'all': 'No hay propiedades disponibles en este momento.',
                'casa': 'No hay casas disponibles en este momento.',
                'apartamento': 'No hay apartamentos disponibles en este momento.',
                'oficina': 'No hay oficinas disponibles en este momento.', 
                'solar': 'No hay solares disponibles en este momento.'
            };

            container.innerHTML = `
                <div class="no-properties">
                    <div class="no-properties-icon">🏠</div>
                    <h3>${noPropertiesText[this.currentFilter] || noPropertiesText.all}</h3>
                    ${this.currentFilter !== 'all' ? 
                        `<button onclick="clientManager.applyFilter('all')" class="btn-primary">
                            Ver todas las propiedades
                        </button>` : ''
                    }
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => {
            const mainImage = property.images && property.images.length > 0 
                ? property.images[0] 
                : 'https://via.placeholder.com/400x300/3498db/ffffff?text=Sin+Imagen';
            
            return `
            <div class="property-card">
                <img src="${mainImage}" 
                     alt="${property.title}" 
                     class="property-image"
                     onerror="this.src='https://via.placeholder.com/400x300/3498db/ffffff?text=Error+Imagen'">
                <div class="property-info">
                    <h3>${this.escapeHtml(property.title)}</h3>
                    <div class="property-price">$${(property.price || 0).toLocaleString()}</div>
                    <div class="property-features">
                        ${property.characteristics?.bedrooms ? `<span>🛏️ ${property.characteristics.bedrooms} hab.</span>` : ''}
                        ${property.characteristics?.bathrooms ? `<span>🚽 ${property.characteristics.bathrooms} baños</span>` : ''}
                        ${property.characteristics?.area ? `<span>📐 ${property.characteristics.area} m²</span>` : ''}
                    </div>
                    <div class="property-address">📍 ${this.escapeHtml(property.location?.address || 'Dirección no disponible')}</div>
                    <div class="property-type">
                        ${this.escapeHtml(this.getTypeDisplayName(property.type))}
                    </div>
                    ${property.location?.lat && property.location?.lng ? 
                        `<button onclick="clientManager.flyToProperty(${property.location.lat}, ${property.location.lng})" 
                                class="btn-primary view-map-btn">
                            📍 Ver en mapa
                        </button>` : ''
                    }
                </div>
            </div>
            `;
        }).join('');

        console.log('Propiedades renderizadas:', this.filteredProperties.length);
    }

    getTypeDisplayName(type) {
        const types = {
            'casa': 'CASA',
            'apartamento': 'APARTAMENTO',
            'oficina': 'OFICINA',
            'solar': 'SOLAR'
        };
        return types[type] || 'PROPIEDAD';
    }

    flyToProperty(lat, lng) {
        if (this.map) {
            this.map.setView([lat, lng], 15);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const container = document.getElementById('propertiesGrid');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div>❌</div>
                    <h3>${message}</h3>
                    <button onclick="clientManager.loadProperties()" class="btn-primary">Reintentar</button>
                </div>
            `;
        }
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.clientManager = new ClientManager();
});
