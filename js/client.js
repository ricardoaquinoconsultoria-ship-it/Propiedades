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

        // Modales
        this.setupAdminModal();
        this.setupPropertyModal();
        
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

    setupPropertyModal() {
        const closeBtn = document.getElementById('closePropertyModal');
        closeBtn?.addEventListener('click', () => this.hidePropertyModal());

        // Cerrar modal al hacer clic fuera
        document.getElementById('propertyModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'propertyModal') {
                this.hidePropertyModal();
            }
        });

        // Botón de contacto
        document.querySelector('.contact-btn')?.addEventListener('click', () => {
            alert('¡Pronto nos pondremos en contacto contigo! 📞');
        });
    }

    showAdminModal() {
        document.getElementById('adminModal')?.classList.remove('hidden');
    }

    hideAdminModal() {
        document.getElementById('adminModal')?.classList.add('hidden');
    }

    showPropertyModal(property) {
        this.updatePropertyModal(property);
        document.getElementById('propertyModal')?.classList.remove('hidden');
    }

    hidePropertyModal() {
        document.getElementById('propertyModal')?.classList.add('hidden');
    }

    updatePropertyModal(property) {
        // Actualizar información básica
        document.getElementById('propertyModalTitle').textContent = property.title;
        document.getElementById('propertyModalPrice').textContent = `$${property.price.toLocaleString()}`;
        document.getElementById('propertyModalType').textContent = this.getTypeLabel(property.type);
        document.getElementById('propertyModalAddress').textContent = property.location.address;
        document.getElementById('propertyDescription').textContent = property.description;

        // Actualizar galería de imágenes
        this.updatePropertyGallery(property.images);

        // Actualizar características
        this.updatePropertyFeatures(property.characteristics);
    }

    updatePropertyGallery(images) {
        const mainImage = document.getElementById('propertyMainImage');
        const thumbnailsContainer = document.getElementById('propertyThumbnails');

        if (images && images.length > 0) {
            mainImage.src = images[0];
            mainImage.alt = 'Imagen de la propiedad';

            thumbnailsContainer.innerHTML = images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
                    <img src="${image}" alt="Miniatura ${index + 1}">
                </div>
            `).join('');

            // Agregar event listeners a las miniaturas
            thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const imageSrc = thumb.getAttribute('data-image');
                    mainImage.src = imageSrc;
                    
                    // Actualizar miniaturas activas
                    thumbnailsContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }
    }

    updatePropertyFeatures(characteristics) {
        const featuresContainer = document.getElementById('propertyFeatures');
        
        const features = [
            { icon: '🛏️', label: 'Habitaciones', value: characteristics.bedrooms },
            { icon: '🚿', label: 'Baños', value: characteristics.bathrooms },
            { icon: '📐', label: 'Área (m²)', value: characteristics.area },
            { icon: '🚗', label: 'Estacionamiento', value: characteristics.parking ? 'Sí' : 'No' },
            { icon: '🏊', label: 'Piscina', value: characteristics.pool ? 'Sí' : 'No' },
            { icon: '🌳', label: 'Jardín', value: characteristics.garden ? 'Sí' : 'No' }
        ];

        featuresContainer.innerHTML = features.map(feature => `
            <div class="feature-item">
                <span class="feature-icon">${feature.icon}</span>
                <span class="feature-label">${feature.label}:</span>
                <span class="feature-value">${feature.value}</span>
            </div>
        `).join('');
    }

    getTypeLabel(type) {
        const types = {
            'casa': 'Casa',
            'apartamento': 'Apartamento',
            'oficina': 'Oficina',
            'solar': 'Solar'
        };
        return types[type] || type;
    }

    handleAdminLogin() {
        window.location.href = 'admin.html';
    }

    setupFilters() {
        const filterBtn = document.getElementById('filterBtn');
        const filterDropdown = document.getElementById('filterDropdown');
        const filterOptions = document.querySelectorAll('.filter-option');
        
        // Toggle dropdown
        filterBtn?.addEventListener('click', () => {
            filterDropdown.classList.toggle('hidden');
        });

        // Selección de filtro
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Actualizar UI
                filterOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Actualizar texto del botón
                const filterText = option.querySelector('.filter-label').textContent;
                document.querySelector('.filter-text').textContent = filterText;
                
                // Ocultar dropdown
                filterDropdown.classList.add('hidden');
            });
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!filterBtn?.contains(e.target) && !filterDropdown?.contains(e.target)) {
                filterDropdown.classList.add('hidden');
            }
        });
    }

    async initializeMap() {
        try {
            this.map = L.map('map').setView([18.7357, -70.1627], 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
        } catch (error) {
            console.error('Error inicializando mapa:', error);
        }
    }

    async loadProperties() {
        try {
            // Propiedades de ejemplo con imágenes
            this.properties = [
                {
                    id: 1,
                    title: "Hermosa Casa Familiar en Jardines del Norte",
                    type: "casa",
                    price: 250000,
                    location: {
                        address: "Calle Principal #123, Jardines del Norte",
                        lat: 18.4855,
                        lng: -69.8731
                    },
                    characteristics: {
                        bedrooms: 4,
                        bathrooms: 3,
                        area: 180,
                        parking: true,
                        pool: true,
                        garden: true
                    },
                    description: "Hermosa casa familiar con amplios espacios, perfecta para familias que buscan comodidad y seguridad. Cuenta con jardín frontal y trasero, piscina y área de parrilla.",
                    images: [
                        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500",
                        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=500",
                        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=500"
                    ]
                },
                {
                    id: 2,
                    title: "Moderno Apartamento en Zona Colonial",
                    type: "apartamento",
                    price: 150000,
                    location: {
                        address: "Av. Independencia #456, Zona Colonial",
                        lat: 18.4735,
                        lng: -69.8904
                    },
                    characteristics: {
                        bedrooms: 2,
                        bathrooms: 2,
                        area: 85,
                        parking: true,
                        pool: false,
                        garden: false
                    },
                    description: "Apartamento completamente renovado en el corazón de la Zona Colonial. Ideal para profesionales o parejas jóvenes. Incluye amenities modernos y seguridad 24/7.",
                    images: [
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500",
                        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=500"
                    ]
                },
                {
                    id: 3,
                    title: "Solar Comercial en Avenida Principal",
                    type: "solar",
                    price: 80000,
                    location: {
                        address: "Av. 27 de Febrero #789",
                        lat: 18.4555,
                        lng: -69.9394
                    },
                    characteristics: {
                        bedrooms: 0,
                        bathrooms: 0,
                        area: 500,
                        parking: false,
                        pool: false,
                        garden: false
                    },
                    description: "Excelente solar comercial en una de las avenidas más transitadas de la ciudad. Perfecto para construcción de negocio o desarrollo comercial.",
                    images: [
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500",
                        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500",
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500"
                    ]
                }
            ];
            
            this.filteredProperties = [...this.properties];
            this.renderProperties();
            this.updatePropertiesCount();
            this.renderMapMarkers();
            
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        }
    }

    renderMapMarkers() {
        // Limpiar marcadores existentes
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.filteredProperties.forEach(property => {
            const marker = L.marker([property.location.lat, property.location.lng])
                .addTo(this.map)
                .bindPopup(`
                    <div class="property-popup">
                        <div class="popup-content">
                            <div class="popup-image">
                                <img src="${property.images[0]}" alt="${property.title}">
                            </div>
                            <h4>${property.title}</h4>
                            <div class="popup-price">$${property.price.toLocaleString()}</div>
                            <button class="popup-btn" onclick="clientManager.showPropertyModal(${property.id})">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                `);
            
            this.markers.push(marker);
        });

        // Ajustar vista del mapa para mostrar todos los marcadores
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
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
        if (!container) return;

        if (this.filteredProperties.length === 0) {
            container.innerHTML = '<div class="no-properties">No hay propiedades disponibles con los filtros seleccionados</div>';
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-image">
                    <img src="${property.images[0]}" alt="${property.title}">
                    <div class="property-badge">${this.getTypeLabel(property.type)}</div>
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-price">$${property.price.toLocaleString()}</div>
                    <div class="property-address">📍 ${property.location.address}</div>
                    <div class="property-features-preview">
                        <span>🛏️ ${property.characteristics.bedrooms} hab.</span>
                        <span>🚿 ${property.characteristics.bathrooms} baños</span>
                        <span>📐 ${property.characteristics.area} m²</span>
                    </div>
                    <button class="btn-primary view-details-btn" onclick="clientManager.showPropertyModal(${property.id})">
                        📋 Ver Detalles Completos
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Método para mostrar modal por ID de propiedad
    showPropertyModal(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            this.showPropertyModal(property);
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.clientManager = new ClientManager();
});

// Configuración de Supabase (mantén tu configuración actual)
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);