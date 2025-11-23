// CLIENT MANAGER COMPLETO
class ModernClientManager {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.currentFilter = 'all';
        this.map = null;
        this.markers = [];
    }

    init() {
        this.setupEventListeners();
        this.initializeMap();
        this.loadProperties();
    }

    setupEventListeners() {
        // BOTÓN ADMIN
        const adminBtn = document.getElementById('adminAccessBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminModal();
            });
        }

        // MODAL ADMIN
        const closeAdmin = document.getElementById('closeAdminModal');
        const cancelAdmin = document.getElementById('cancelAdminBtn');
        const submitAdmin = document.getElementById('submitAdminBtn');

        if (closeAdmin) closeAdmin.addEventListener('click', () => this.hideAdminModal());
        if (cancelAdmin) cancelAdmin.addEventListener('click', () => this.hideAdminModal());
        if (submitAdmin) submitAdmin.addEventListener('click', () => this.handleAdminLogin());

        // MODAL PROPIEDAD
        const closePropertyModal = document.getElementById('closePropertyModal');
        if (closePropertyModal) {
            closePropertyModal.addEventListener('click', () => {
                this.hidePropertyModal();
            });
        }

        // Cerrar modal propiedad al tocar fuera
        const propertyModal = document.getElementById('propertyModal');
        if (propertyModal) {
            propertyModal.addEventListener('click', (e) => {
                if (e.target === propertyModal) {
                    this.hidePropertyModal();
                }
            });
        }

        // BOTÓN CONTACTAR
        const contactBtn = document.querySelector('.btn-contact');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                alert('📞 Un agente se pondrá en contacto contigo pronto.');
            });
        }

        // FILTROS
        const mainFilterBtn = document.getElementById('mainFilterBtn');
        if (mainFilterBtn) {
            mainFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const filterOptions = document.getElementById('filterOptions');
                if (filterOptions) filterOptions.classList.toggle('hidden');
            });
        }

        const filterOptions = document.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
                
                // Actualizar UI del filtro activo
                filterOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Actualizar texto del botón principal
                const optionText = option.querySelector('.option-text').textContent;
                document.querySelector('.filter-text').textContent = optionText;
                
                // Ocultar dropdown
                document.getElementById('filterOptions').classList.add('hidden');
            });
        });

        // Cerrar dropdown al tocar fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-section')) {
                const filterOptions = document.getElementById('filterOptions');
                if (filterOptions) filterOptions.classList.add('hidden');
            }
        });
    }

    showAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) modal.classList.add('hidden');
    }

    showPropertyModal() {
        const modal = document.getElementById('propertyModal');
        if (modal) {
            modal.classList.remove('hidden');
        console.log('🔓 Modal propiedad abierto');
        }
    }

    hidePropertyModal() {
        const modal = document.getElementById('propertyModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('🔒 Modal propiedad cerrado');
        }
    }

    handleAdminLogin() {
        const password = document.getElementById('adminPassword').value;
        // Contraseña simple para demo
        if (password === 'admin123') {
            window.location.href = 'admin.html';
        } else {
            alert('Contraseña incorrecta. Usa "admin123" para demo.');
        }
    }

    initializeMap() {
        try {
            this.map = L.map('map').setView([18.7357, -70.1627], 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            console.log('✅ Mapa inicializado');
        } catch (error) {
            console.error('❌ Error con mapa:', error);
        }
    }

    async loadProperties() {
        try {
            // Intentar cargar de Supabase
            const { data: properties, error } = await window.supabase
                .from('properties')
                .select('*')
                .eq('status', 'disponible')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (properties && properties.length > 0) {
                this.properties = properties;
                console.log(`✅ ${properties.length} propiedades cargadas de Supabase`);
            } else {
                // Cargar propiedades de ejemplo
                this.loadExampleProperties();
            }
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            this.loadExampleProperties();
        }

        this.filteredProperties = [...this.properties];
        this.renderProperties();
        this.updatePropertiesCount();
        this.renderMapMarkers();
    }

    loadExampleProperties() {
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
                description: "Impresionante casa familiar ubicada en una zona residencial exclusiva. Cuenta con amplios espacios, diseño moderno y áreas verdes.",
                images: [
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600",
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"
                ],
                status: "disponible",
                created_at: new Date().toISOString()
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
                description: "Elegante apartamento en torre de lujo con vista al mar. Incluye amenities premium: gimnasio, piscina infinity y seguridad 24/7.",
                images: [
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
                    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600"
                ],
                status: "disponible",
                created_at: new Date().toISOString()
            }
        ];
        console.log('✅ Propiedades de ejemplo cargadas');
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
            titleElement.textContent = filterLabels[this.currentFilter] || 'Propiedades';
        }
    }

    renderProperties() {
        const container = document.getElementById('propertiesGrid');
        if (!container) return;

        if (this.filteredProperties.length === 0) {
            container.innerHTML = `
                <div class="no-properties" style="grid-column: 1/-1; text-align: center; padding: 60px; color: #64748b;">
                    <h3>🏠 No hay propiedades disponibles</h3>
                    <p>Intenta con otros filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredProperties.map(property => `
            <div class="property-card" onclick="clientManager.showPropertyDetails(${property.id})">
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
                const customIcon = L.divIcon({
                    html: `<div style="background: #2563eb; color: white; padding: 8px; border-radius: 50%; font-size: 16px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🏠</div>`,
                    className: 'property-marker',
                    iconSize: [40, 40]
                });

                const marker = L.marker([property.location.lat, property.location.lng], { icon: customIcon })
                    .addTo(this.map)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <img src="${property.images[0]}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                            <h4 style="margin: 8px 0; font-size: 14px;">${property.title}</h4>
                            <p style="margin: 4px 0; font-weight: bold; color: #2563eb;">$${property.price.toLocaleString()}</p>
                            <button onclick="clientManager.showPropertyDetails(${property.id})" 
                                    style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 8px;">
                                Ver Detalles
                            </button>
                        </div>
                    `);
                
                this.markers.push(marker);
            }
        });

        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    showPropertyDetails(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            this.updatePropertyModal(property);
            this.showPropertyModal();
        }
    }

    updatePropertyModal(property) {
        document.getElementById('modalPropertyTitle').textContent = property.title;
        document.getElementById('modalPropertyPrice').textContent = `$${property.price.toLocaleString()}`;
        document.getElementById('modalPropertyType').textContent = this.getTypeLabel(property.type);
        document.getElementById('modalPropertyAddress').querySelector('span:last-child').textContent = property.location.address;
        document.getElementById('modalPropertyDescription').textContent = property.description;
        document.getElementById('modalBedrooms').textContent = property.characteristics.bedrooms;
        document.getElementById('modalBathrooms').textContent = property.characteristics.bathrooms;
        document.getElementById('modalArea').textContent = property.characteristics.area;

        // Galería de imágenes
        const mainImage = document.getElementById('mainPropertyImage');
        const thumbnailsContainer = document.getElementById('propertyThumbnails');

        if (property.images && property.images.length > 0) {
            mainImage.src = property.images[0];
            
            thumbnailsContainer.innerHTML = property.images.map((image, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" data-image="${image}">
                    <img src="${image}" alt="Miniatura ${index + 1}">
                </div>
            `).join('');

            thumbnailsContainer.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const imageSrc = thumb.getAttribute('data-image');
                    mainImage.src = imageSrc;
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
}

// INICIALIZAR APLICACIÓN
document.addEventListener('DOMContentLoaded', function() {
    window.clientManager = new ModernClientManager();
    window.clientManager.init();
});