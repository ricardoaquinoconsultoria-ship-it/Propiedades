class ModernClientManager {
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
        // Botón admin
        document.getElementById('adminAccessBtn')?.addEventListener('click', () => {
            this.showAdminModal();
        });

        // Modal admin
        this.setupAdminModal();
        
        // Modal propiedad
        this.setupPropertyModal();
        
        // Filtros
        this.setupFilters();
    }

    setupAdminModal() {
        const modal = document.getElementById('adminModal');
        const closeBtn = document.getElementById('closeAdminModal');
        const cancelBtn = document.getElementById('cancelAdminBtn');
        const submitBtn = document.getElementById('submitAdminBtn');

        closeBtn?.addEventListener('click', () => this.hideAdminModal());
        cancelBtn?.addEventListener('click', () => this.hideAdminModal());
        submitBtn?.addEventListener('click', () => this.handleAdminLogin());
        
        // Cerrar modal al hacer clic fuera
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAdminModal();
            }
        });
    }

    setupPropertyModal() {
        const closeBtn = document.getElementById('closePropertyModal');
        closeBtn?.addEventListener('click', () => this.hidePropertyModal());

        const modal = document.getElementById('propertyModal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hidePropertyModal();
            }
        });

        // Botón de contacto
        document.querySelector('.btn-contact')?.addEventListener('click', () => {
            alert('📞 Un agente se pondrá en contacto contigo pronto.');
        });
    }

    setupFilters() {
        const mainFilterBtn = document.getElementById('mainFilterBtn');
        const filterOptions = document.getElementById('filterOptions');
        const options = document.querySelectorAll('.filter-option');

        // Toggle del dropdown
        mainFilterBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            filterOptions.classList.toggle('hidden');
        });

        // Selección de filtro
        options.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Actualizar UI
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Actualizar texto del botón principal
                const optionText = option.querySelector('.option-text').textContent;
                document.querySelector('.filter-text').textContent = optionText;
                
                // Ocultar dropdown
                filterOptions.classList.add('hidden');
            });
        });

        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', () => {
            filterOptions.classList.add('hidden');
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
        // Información básica
        document.getElementById('modalPropertyTitle').textContent = property.title;
        document.getElementById('modalPropertyPrice').textContent = `$${property.price.toLocaleString()}`;
        document.getElementById('modalPropertyType').textContent = this.getTypeLabel(property.type);
        document.getElementById('modalPropertyAddress').querySelector('span:last-child').textContent = property.location.address;
        document.getElementById('modalPropertyDescription').textContent = property.description;

        // Características
        document.getElementById('modalBedrooms').textContent = property.characteristics.bedrooms;
        document.getElementById('modalBathrooms').textContent = property.characteristics.bathrooms;
        document.getElementById('modalArea').textContent = property.characteristics.area;

        // Galería de imágenes
        this.updatePropertyGallery(property.images);
    }

    updatePropertyGallery(images) {
        const mainImage = document.getElementById('mainPropertyImage');
        const thumbnailsContainer = document.getElementById('propertyThumbnails');

        if (images && images.length > 0) {
            mainImage.src = images[0];
            mainImage.alt = 'Imagen principal de la propiedad';

            thumbnailsContainer.innerHTML = images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
                    <img src="${image}" alt="Miniatura ${index + 1}">
                </div>
            `).join('');

            // Event listeners para miniaturas
            thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const imageSrc = thumb.getAttribute('data-image');
                    mainImage.src = imageSrc;
                    
                    // Actualizar estado activo
                    thumbnailsContainer.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
        }
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
        const password = document.getElementById('adminPassword').value;
        // Por simplicidad, cualquier contraseña funciona
        if (password) {
            window.location.href = 'admin.html';
        } else {
            alert('Por favor ingresa una contraseña');
        }
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
            // Propiedades de ejemplo con datos realistas
            this.properties = [
                {
                    id: 1,
                    title: "Hermosa Casa Familiar con Piscina",
                    type: "casa",
                    price: 350000,
                    location: {
                        address: "Calle Principal #123, Santo Domingo Este",
                        lat: 18.4855,
                        lng: -69.8731
                    },
                    characteristics: {
                        bedrooms: 4,
                        bathrooms: 3,
                        area: 220,
                        parking: true,
                        pool: true,
                        garden: true
                    },
                    description: "Impresionante casa familiar ubicada en una zona residencial exclusiva. Cuenta con amplios espacios, diseño moderno y áreas verdes. Perfecta para familias que buscan comodidad y seguridad.",
                    images: [
                        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600",
                        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
                        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600",
                        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600",
                        "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=600"
                    ]
                },
                {
                    id: 2,
                    title: "Apartamento de Lujo en Torre Moderna",
                    type: "apartamento",
                    price: 185000,
                    location: {
                        address: "Av. George Washington #456, Malecón",
                        lat: 18.4735,
                        lng: -69.8904
                    },
                    characteristics: {
                        bedrooms: 2,
                        bathrooms: 2,
                        area: 95,
                        parking: true,
                        pool: true,
                        garden: false
                    },
                    description: "Elegante apartamento en torre de lujo con vista al mar. Incluye amenities premium: gimnasio, piscina infinity y seguridad 24/7. Ideal para ejecutivos o inversión.",
                    images: [
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
                        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600",
                        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600",
                        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=600",
                        "https://images.unsplash.com/photo-1600607688966-a7a83a5c6cda?w=600"
                    ]
                },
                {
                    id: 3,
                    title: "Solar Comercial en Avenida Principal",
                    type: "solar",
                    price: 120000,
                    location: {
                        address: "Av. 27 de Febrero #789, Santo Domingo",
                        lat: 18.4555,
                        lng: -69.9394
                    },
                    characteristics: {
                        bedrooms: 0,
                        bathrooms: 0,
                        area: 650,
                        parking: false,
                        pool: false,
                        garden: false
                    },
                    description: "Excelente oportunidad de inversión. Solar comercial en una de las avenidas más transitadas de la ciudad. Perfecto para construcción de negocio o desarrollo comercial.",
                    images: [
                        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
                        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600",
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
                        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
                        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"
                    ]
                },
                {
                    id: 4,
                    title: "Oficina Ejecutiva en Centro Financiero",
                    type: "oficina",
                    price: 220000,
                    location: {
                        address: "Plaza Central, Piantini",
                        lat: 18.4834,
                        lng: -69.9526
                    },
                    characteristics: {
                        bedrooms: 0,
                        bathrooms: 2,
                        area: 150,
                        parking: true,
                        pool: false,
                        garden: false
                    },
                    description: "Oficina ejecutiva completamente equipada en el corazón del distrito financiero. Espacios modernos, recepción y áreas comunes de primera calidad.",
                    images: [
                        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600",
                        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
                        "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600",
                        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600"
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
        // Limpiar marcadores anteriores
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        this.filteredProperties.forEach(property => {
            const customIcon = L.divIcon({
                html: `<div class="custom-marker">🏠</div>`,
                className: 'property-marker',
                iconSize: [40, 40]
            });

            const marker = L.marker([property.location.lat, property.location.lng], { icon: customIcon })
                .addTo(this.map)
                .bindPopup(`
                    <div class="map-popup">
                        <img src="${property.images[0]}" alt="${property.title}" style="width: 200px; height: 120px; object-fit: cover; border-radius: 8px;">
                        <h4>${property.title}</h4>
                        <p><strong>$${property.price.toLocaleString()}</strong></p>
                        <button onclick="clientManager.showPropertyModal(${property.id})" 
                                style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%;">
                            Ver Detalles
                        </button>
                    </div>
                `);
            
            this.markers.push(marker);
        });

        // Ajustar vista del mapa
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
        const titleElement = document.getElementById('propertiesTitle');
        
        if (countElement) {
            countElement.textContent = this.filteredProperties.length;
        }
        
        if (titleElement) {
            const filterLabels = {
                'all': 'Todas las Propiedades',
                'casa': 'Casas',
                'apartamento': 'Apartamentos',
                'oficina': 'Oficinas',
                'solar': 'Solares'
            };
            titleElement.textContent = filterLabels[this.currentFilter];
        }
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        if (!container) return;

        if (this.filteredProperties.length === 0) {
            container.innerHTML = `
                <div class="no-properties" style="grid-column: 1/-1; text-align: center; padding: 60px; color: #64748b;">
                    <h3>No hay propiedades disponibles</h3>
                    <p>Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card" onclick="clientManager.showPropertyModal(${property.id})">
                <div class="property-image">
                    <img src="${property.images[0]}" alt="${property.title}">
                    <div class="property-badge">${this.getTypeLabel(property.type)}</div>
                </div>
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-price">$${property.price.toLocaleString()}</div>
                    <div class="property-address">
                        <span>📍</span>
                        <span>${property.location.address}</span>
                    </div>
                    <div class="property-features-preview">
                        ${property.characteristics.bedrooms > 0 ? `<span>🛏️ ${property.characteristics.bedrooms} hab.</span>` : ''}
                        ${property.characteristics.bathrooms > 0 ? `<span>🚿 ${property.characteristics.bathrooms} baños</span>` : ''}
                        <span>📐 ${property.characteristics.area} m²</span>
                    </div>
                    <button class="view-details-btn">Ver Detalles Completos</button>
                </div>
            </div>
        `).join('');
    }

    // Método para mostrar propiedad por ID
    showPropertyModal(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            this.showPropertyModal(property);
        }
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    window.clientManager = new ModernClientManager();
});

// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);