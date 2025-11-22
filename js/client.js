class ClientManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentFilter = 'all';
        this.map = null;
        this.markers = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initializeMap();
        await this.loadProperties();
    }

    setupEventListeners() {
        // Botón administrador
        document.getElementById('adminAccessBtn')?.addEventListener('click', () => {
            this.showAdminModal();
        });

        // Modal administrador
        this.setupAdminModal();
        
        // Filtros
        this.setupFilters();
    }

    setupAdminModal() {
        const modal = document.getElementById('adminModal');
        const closeBtn = document.getElementById('closeAdminModal');
        const cancelBtn = document.getElementById('cancelAdminBtn');
        const form = document.getElementById('adminPasswordForm');

        closeBtn?.addEventListener('click', () => this.hideAdminModal());
        cancelBtn?.addEventListener('click', () => this.hideAdminModal());
        
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminLogin();
        });
    }

    showAdminModal() {
        document.getElementById('adminModal')?.classList.remove('hidden');
    }

    hideAdminModal() {
        document.getElementById('adminModal')?.classList.add('hidden');
    }

    handleAdminLogin() {
        // Redirigir a admin (sin validación por simplicidad)
        window.location.href = 'admin.html';
    }

    setupFilters() {
        const filterOptions = document.querySelectorAll('.filter-option');
        
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
            });
        });
    }

    async initializeMap() {
        try {
            this.map = L.map('map').setView([18.7357, -70.1627], 8);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        } catch (error) {
            console.error('Error inicializando mapa:', error);
        }
    }

    async loadProperties() {
        try {
            // Simular carga de propiedades
            this.properties = [
                {
                    id: 1,
                    title: "Casa moderna en zona residencial",
                    type: "casa",
                    price: 150000,
                    location: {
                        address: "Calle Principal #123",
                        lat: 18.7357,
                        lng: -70.1627
                    },
                    characteristics: {
                        bedrooms: 3,
                        bathrooms: 2,
                        area: 120
                    },
                    images: []
                }
            ];
            
            this.filteredProperties = [...this.properties];
            this.renderProperties();
            this.updatePropertiesCount();
            
        } catch (error) {
            console.error('Error cargando propiedades:', error);
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
    }

    updatePropertiesCount() {
        const countElement = document.getElementById('propertiesCount');
        if (countElement) {
            countElement.textContent = this.filteredProperties.length;
        }
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        if (!container) return;

        if (this.filteredProperties.length === 0) {
            container.innerHTML = '<div class="no-properties">No hay propiedades disponibles</div>';
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card">
                <div class="property-image" style="background: #3498db; color: white; display: flex; align-items: center; justify-content: center;">
                    🏠 Imagen de ${property.type}
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-price">$${property.price.toLocaleString()}</div>
                    <div class="property-address">📍 ${property.location.address}</div>
                    <button class="btn-primary view-map-btn">📍 Ver en mapa</button>
                </div>
            </div>
        `).join('');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.clientManager = new ClientManager();
});