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
        console.log('🚀 Inicializando ModernClientManager...');
        this.setupEventListeners();
        await this.initializeMap();
        await this.loadProperties();
    }

    async loadProperties() {
        try {
            console.log('📡 Cargando propiedades...');
            
            // Siempre cargar desde el almacenamiento actual
            const loadedProperties = await this.loadPropertiesData();
            
            if (loadedProperties && loadedProperties.length > 0) {
                console.log(`✅ ${loadedProperties.length} propiedades cargadas`);
                this.properties = loadedProperties;
            } else {
                console.log('📝 No hay propiedades, cargando ejemplos');
                await this.loadExampleProperties();
            }

            this.applyFilter('all');
            this.renderMapMarkers();
            
        } catch (error) {
            console.error('❌ Error cargando propiedades:', error);
            await this.loadExampleProperties();
        }
    }

    async loadPropertiesData() {
        try {
            console.log('🔍 Cargando datos de propiedades...');
            
            if (!window.supabase) {
                console.log('❌ Supabase no disponible');
                return null;
            }

            // Usar el método then() que funciona en ambos modos
            const { data: properties, error } = await new Promise((resolve) => {
                window.supabase
                    .from('properties')
                    .select('*')
                    .eq('status', 'disponible')
                    .order('created_at', { ascending: false })
                    .then(resolve);
            });

            if (error) {
                console.error('Error cargando propiedades:', error);
                return null;
            }

            console.log('📊 Propiedades cargadas:', properties);
            return properties;

        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    async loadExampleProperties() {
        console.log('🔄 Cargando propiedades de ejemplo...');
        
        // Propiedades de ejemplo básicas
        this.properties = [
            {
                id: 1,
                title: "Casa Familiar con Piscina",
                type: "casa",
                price: 350000,
                location: {
                    address: "Calle Principal #123",
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
                description: "Hermosa casa familiar en zona residencial.",
                images: [
                    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600"
                ],
                status: "disponible",
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                title: "Apartamento Moderno",
                type: "apartamento",
                price: 185000,
                location: {
                    address: "Av. Principal #456",
                    lat: 18.4735,
                    lng: -69.8904
                },
                characteristics: {
                    bedrooms: 2,
                    bathrooms: 2,
                    area: 95,
                    parking: true,
                    pool: false,
                    garden: false
                },
                description: "Apartamento moderno en zona céntrica.",
                images: [
                    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"
                ],
                status: "disponible",
                created_at: new Date().toISOString()
            }
        ];
        
        console.log(`✅ ${this.properties.length} propiedades de ejemplo cargadas`);
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Botón admin
        const adminBtn = document.getElementById('adminAccessBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminModal();
            });
        }

        // Modal admin
        this.setupAdminModal();
        
        // Modal propiedad
        this.setupPropertyModal();
        
        // Filtros
        this.setupFilters();
        
        // Botón para recargar propiedades
        this.addReloadButton();
    }

    addReloadButton() {
        const reloadBtn = document.createElement('button');
        reloadBtn.innerHTML = '🔄 Actualizar';
        reloadBtn.style.position = 'fixed';
        reloadBtn.style.bottom = '20px';
        reloadBtn.style.right = '20px';
        reloadBtn.style.zIndex = '1000';
        reloadBtn.style.background = '#2563eb';
        reloadBtn.style.color = 'white';
        reloadBtn.style.border = 'none';
        reloadBtn.style.padding = '10px 15px';
        reloadBtn.style.borderRadius = '8px';
        reloadBtn.style.cursor = 'pointer';
        reloadBtn.style.fontSize = '14px';
        reloadBtn.addEventListener('click', () => {
            this.loadProperties();
        });
        document.body.appendChild(reloadBtn);
    }

    setupAdminModal() {
        const modal = document.getElementById('adminModal');
        if (!modal) return;

        const closeBtn = document.getElementById('closeAdminModal');
        const cancelBtn = document.getElementById('cancelAdminBtn');
        const submitBtn = document.getElementById('submitAdminBtn');

        if (closeBtn) closeBtn.addEventListener('click', () => this.hideAdminModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAdminModal());
        if (submitBtn) submitBtn.addEventListener('click', () => this.handleAdminLogin());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAdminModal();
            }
        });
    }

    setupPropertyModal() {
        const closeBtn = document.getElementById('closePropertyModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePropertyModal());
        }

        const modal = document.getElementById('propertyModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hidePropertyModal();
                }
            });
        }

        const contactBtn = document.querySelector('.btn-contact');
        if (contactBtn) {
            contactBtn.addEventListener('click', () => {
                alert('📞 Un agente se pondrá en contacto contigo pronto.');
            });
        }
    }

    setupFilters() {
        const mainFilterBtn = document.getElementById('mainFilterBtn');
        const filterOptions = document.getElementById('filterOptions');
        const options = document.querySelectorAll('.filter-option');

        if (!mainFilterBtn || !filterOptions) return;

        mainFilterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterOptions.classList.toggle('hidden');
        });

        options.forEach(option => {
            option.addEventListener('click', () => {
                const filter = option.getAttribute('data-filter');
                this.applyFilter(filter);
                
                options.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const optionText = option.querySelector('.option-text').textContent;
                document.querySelector('.filter-text').textContent = optionText;
                
                filterOptions.classList.add('hidden');
            });
        });

        document.addEventListener('click', () => {
            if (filterOptions) filterOptions.classList.add('hidden');
        });
    }

    showAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) modal.classList.remove('hidden');
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) modal.classList.add('hidden');
    }

    showPropertyModal(property) {
        this.updatePropertyModal(property);
        const modal = document.getElementById('propertyModal');
        if (modal) modal.classList.remove('hidden');
    }

    hidePropertyModal() {
        const modal = document.getElementById('propertyModal');
        if (modal) modal.classList.add('hidden');
    }

    updatePropertyModal(property) {
        if (!property) return;

        const setText = (id, text) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        };

        setText('modalPropertyTitle', property.title || 'Sin título');
        setText('modalPropertyPrice', `$${(property.price || 0).toLocaleString()}`);
        setText('modalPropertyType', this.getTypeLabel(property.type) || 'Sin tipo');
        
        const addressElement = document.getElementById('modalPropertyAddress');
        if (addressElement) {
            const span = addressElement.querySelector('span:last-child');
            if (span) span.textContent = property.location?.address || 'Dirección no disponible';
        }
        
        setText('modalPropertyDescription', property.description || 'Sin descripción');

        setText('modalBedrooms', property.characteristics?.bedrooms || 0);
        setText('modalBathrooms', property.characteristics?.bathrooms || 0);
        setText('modalArea', property.characteristics?.area || 0);

        this.updatePropertyGallery(property.images || []);
    }

    updatePropertyGallery(images) {
        const mainImage = document.getElementById('mainPropertyImage');
        const thumbnailsContainer = document.getElementById('propertyThumbnails');

        if (!mainImage || !thumbnailsContainer) return;

        if (images && images.length > 0) {
            mainImage.src = images[0];
            mainImage.alt = 'Imagen principal';

            thumbnailsContainer.innerHTML = images.map((image, index) => `
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
        } else {
            mainImage.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600';
            thumbnailsContainer.innerHTML = '';
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
        const passwordInput = document.getElementById('adminPassword');
        const password = passwordInput ? passwordInput.value : '';
        
        if (password) {
            window.location.href = 'admin.html';
        } else {
            alert('Por favor ingresa una contraseña');
        }
    }

    async initializeMap() {
        try {
            console.log('🗺️ Inicializando mapa...');
            this.map = L.map('map').setView([18.7357, -70.1627], 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
            
            console.log('✅ Mapa inicializado');
        } catch (error) {
            console.error('❌ Error inicializando mapa:', error);
        }
    }

    renderMapMarkers() {
        console.log('📍 Renderizando marcadores...');
        
        this.markers.forEach(marker => {
            if (this.map && marker) {
                this.map.removeLayer(marker);
            }
        });
        this.markers = [];

        if (!this.map) return;

        this.filteredProperties.forEach(property => {
            if (!property.location || !property.location.lat || !property.location.lng) {
                return;
            }

            try {
                const customIcon = L.divIcon({
                    html: `<div style="background: #2563eb; color: white; padding: 8px; border-radius: 50%; font-size: 16px; border: 2px solid white;">🏠</div>`,
                    className: 'property-marker',
                    iconSize: [40, 40]
                });

                const marker = L.marker([property.location.lat, property.location.lng], { icon: customIcon })
                    .addTo(this.map)
                    .bindPopup(`
                        <div style="min-width: 200px;">
                            <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'}" 
                                 style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">
                            <h4 style="margin: 8px 0; font-size: 14px;">${property.title}</h4>
                            <p style="margin: 4px 0; font-weight: bold; color: #2563eb;">$${(property.price || 0).toLocaleString()}</p>
                            <button onclick="clientManager.showPropertyDetails(${property.id})" 
                                    style="background: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; margin-top: 8px;">
                                Ver Detalles
                            </button>
                        </div>
                    `);
                
                this.markers.push(marker);
                
            } catch (error) {
                console.error('Error creando marcador:', error);
            }
        });

        if (this.markers.length > 0) {
            try {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            } catch (error) {
                console.error('Error ajustando mapa:', error);
            }
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
                    <img src="${property.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600'}" 
                         alt="${property.title}">
                    <div class="property-badge">${this.getTypeLabel(property.type)}</div>
                </div>
                <div class="property-info">
                    <h3>${property.title || 'Sin título'}</h3>
                    <div class="property-price">$${(property.price || 0).toLocaleString()}</div>
                    <div class="property-address">
                        <span>📍</span>
                        <span>${property.location?.address || 'Dirección no disponible'}</span>
                    </div>
                    <div class="property-features-preview">
                        ${property.characteristics?.bedrooms > 0 ? `<span>🛏️ ${property.characteristics.bedrooms} hab.</span>` : ''}
                        ${property.characteristics?.bathrooms > 0 ? `<span>🚿 ${property.characteristics.bathrooms} baños</span>` : ''}
                        <span>📐 ${property.characteristics?.area || 0} m²</span>
                    </div>
                    <button class="view-details-btn">Ver Detalles</button>
                </div>
            </div>
        `).join('');
    }

    showPropertyDetails(propertyId) {
        const property = this.properties.find(p => p.id == propertyId);
        if (property) {
            this.showPropertyModal(property);
        } else {
            alert('Propiedad no encontrada');
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Client Manager...');
    window.clientManager = new ModernClientManager();
});