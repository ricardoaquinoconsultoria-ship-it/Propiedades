class AdminManager {
    constructor() {
        this.properties = [];
        this.locationMap = null;
        this.locationMarker = null;
        this.selectedImages = [];
        this.init();
    }

    async init() {
        console.log('🔄 Inicializando AdminManager...');
        this.setupEventListeners();
        await this.initializeLocationMap();
        await this.loadPropertiesFromSupabase();
        this.setupImageUpload();
    }

    async loadPropertiesFromSupabase() {
        try {
            console.log('📡 Cargando propiedades desde Supabase...');
            
            const { data: properties, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error cargando propiedades:', error);
                this.showError('Error cargando propiedades: ' + error.message);
                return;
            }

            console.log('✅ Propiedades cargadas:', properties);
            this.properties = properties || [];
            this.updateDashboard();
            this.renderPropertiesList();
            
        } catch (error) {
            console.error('Error crítico:', error);
            this.showError('Error crítico al cargar propiedades');
        }
    }

    async handleAddProperty() {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Mostrar loading
            submitBtn.innerHTML = '⏳ Guardando...';
            submitBtn.disabled = true;

            // Obtener datos del formulario
            const formData = {
                title: document.getElementById('propertyTitle').value.trim(),
                type: document.getElementById('propertyType').value,
                price: parseFloat(document.getElementById('propertyPrice').value),
                description: document.getElementById('propertyDescription').value.trim(),
                location: {
                    address: document.getElementById('propertyAddress').value.trim(),
                    lat: parseFloat(document.getElementById('propertyLat').value),
                    lng: parseFloat(document.getElementById('propertyLng').value)
                },
                characteristics: {
                    bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
                    bathrooms: parseInt(document.getElementById('propertyBathrooms').value) || 0,
                    area: parseInt(document.getElementById('propertyArea').value),
                    parking: document.getElementById('propertyParking').checked,
                    pool: document.getElementById('propertyPool').checked,
                    garden: document.getElementById('propertyGarden').checked
                },
                status: 'disponible',
                images: this.selectedImages.map(img => img.src),
                created_at: new Date().toISOString()
            };

            // Validaciones
            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Enviando propiedad a Supabase...', formData);

            // Subir a Supabase
            const { data, error } = await supabase
                .from('properties')
                .insert([formData])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            // Éxito
            if (data && data.length > 0) {
                this.properties.unshift(data[0]);
                this.updateDashboard();
                this.renderPropertiesList();
                
                alert('✅ Propiedad agregada exitosamente!');
                this.resetForm();
                
                // Cambiar a la sección de propiedades
                this.showSection('properties');
                this.updateActiveNav('properties');
            }

        } catch (error) {
            console.error('Error agregando propiedad:', error);
            alert('❌ Error al agregar la propiedad: ' + error.message);
        } finally {
            // Restaurar botón
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(formData) {
        if (!formData.title) {
            alert('❌ El título es requerido');
            return false;
        }
        if (!formData.type) {
            alert('❌ El tipo de propiedad es requerido');
            return false;
        }
        if (!formData.price || formData.price <= 0) {
            alert('❌ El precio debe ser mayor a 0');
            return false;
        }
        if (!formData.description) {
            alert('❌ La descripción es requerida');
            return false;
        }
        if (!formData.location.address) {
            alert('❌ La dirección es requerida');
            return false;
        }
        if (!formData.area || formData.area <= 0) {
            alert('❌ El área es requerida');
            return false;
        }
        return true;
    }

    updateActiveNav(section) {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${section}`) {
                link.classList.add('active');
            }
        });
    }

    setupEventListeners() {
        this.setupNavigation();
        
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.location.href = 'index.html';
            }
        });
    }

    setupNavigation() {
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showSection(target);
                this.updateActiveNav(target);
            });
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }

    async initializeLocationMap() {
        try {
            this.locationMap = L.map('locationMap').setView([18.7357, -70.1627], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.locationMap);

            this.locationMarker = L.marker([18.7357, -70.1627])
                .addTo(this.locationMap)
                .bindPopup('Ubicación de la propiedad')
                .openPopup();

            this.locationMap.on('click', (e) => {
                const { lat, lng } = e.latlng;
                
                this.locationMap.removeLayer(this.locationMarker);
                this.locationMarker = L.marker([lat, lng])
                    .addTo(this.locationMap)
                    .bindPopup('Ubicación seleccionada')
                    .openPopup();

                document.getElementById('propertyLat').value = lat;
                document.getElementById('propertyLng').value = lng;
                document.getElementById('selectedCoordinates').textContent = 
                    `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            });

        } catch (error) {
            console.error('Error inicializando mapa:', error);
        }
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        const fileInput = document.getElementById('imageUpload');

        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            this.handleImageFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
        });
    }

    handleImageFiles(files) {
        const maxImages = 5;
        
        if (this.selectedImages.length + files.length > maxImages) {
            alert(`❌ Solo puedes subir máximo ${maxImages} imágenes`);
            return;
        }

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const imageData = {
                        id: Date.now() + Math.random(),
                        src: e.target.result,
                        file: file
                    };
                    
                    this.selectedImages.push(imageData);
                    this.updateImagePreview();
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    updateImagePreview() {
        const previewContainer = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('imageUploadArea');
        
        if (this.selectedImages.length > 0) {
            uploadArea.style.display = 'none';
        } else {
            uploadArea.style.display = 'flex';
        }

        previewContainer.innerHTML = this.selectedImages.map((image, index) => `
            <div class="preview-item">
                <img src="${image.src}" alt="Preview ${index + 1}">
                <button type="button" class="remove-image" data-id="${image.id}">×</button>
                <span class="image-number">${index + 1}</span>
            </div>
        `).join('');

        previewContainer.querySelectorAll('.remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.removeImage(id);
            });
        });
    }

    removeImage(id) {
        this.selectedImages = this.selectedImages.filter(img => img.id != id);
        this.updateImagePreview();
    }

    updateDashboard() {
        document.getElementById('totalProperties').textContent = this.properties.length;
        document.getElementById('availableProperties').textContent = 
            this.properties.filter(p => p.status === 'disponible').length;
        document.getElementById('houseCount').textContent = 
            this.properties.filter(p => p.type === 'casa').length;
        document.getElementById('apartmentCount').textContent = 
            this.properties.filter(p => p.type === 'apartamento').length;
    }

    renderPropertiesList() {
        const container = document.getElementById('propertiesList');
        if (!container) return;

        if (this.properties.length === 0) {
            container.innerHTML = `
                <div class="no-properties">
                    <h3>🏠 No hay propiedades registradas</h3>
                    <p>Agrega tu primera propiedad haciendo clic en "Agregar Propiedad"</p>
                    <button onclick="adminManager.showSection('add-property'); adminManager.updateActiveNav('add-property')" 
                            class="btn-primary">
                        ➕ Agregar Primera Propiedad
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.properties.map(property => `
            <div class="property-item">
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-meta">
                        <span class="price">$${property.price?.toLocaleString() || '0'}</span>
                        <span class="type">${this.getTypeLabel(property.type)}</span>
                        <span class="status ${property.status}">${property.status || 'disponible'}</span>
                    </div>
                    <div class="property-address">
                        <span>📍</span>
                        <span>${property.location?.address || 'Dirección no disponible'}</span>
                    </div>
                </div>
                <div class="property-actions">
                    <button class="btn-edit" onclick="adminManager.editProperty(${property.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="adminManager.deleteProperty(${property.id})">
                        🗑️ Eliminar
                    </button>
                </div>
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

    async deleteProperty(propertyId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            try {
                const { error } = await supabase
                    .from('properties')
                    .delete()
                    .eq('id', propertyId);

                if (error) {
                    alert('❌ Error eliminando propiedad: ' + error.message);
                    return;
                }

                this.properties = this.properties.filter(p => p.id !== propertyId);
                this.updateDashboard();
                this.renderPropertiesList();
                alert('🗑️ Propiedad eliminada exitosamente');

            } catch (error) {
                console.error('Error eliminando propiedad:', error);
                alert('❌ Error al eliminar la propiedad');
            }
        }
    }

    resetForm() {
        document.getElementById('propertyForm').reset();
        this.selectedImages = [];
        this.updateImagePreview();
        
        if (this.locationMarker) {
            this.locationMap.removeLayer(this.locationMarker);
            this.locationMarker = L.marker([18.7357, -70.1627])
                .addTo(this.locationMap)
                .bindPopup('Ubicación de la propiedad');
            
            document.getElementById('propertyLat').value = 18.7357;
            document.getElementById('propertyLng').value = -70.1627;
            document.getElementById('selectedCoordinates').textContent = 
                'Lat: 18.7357, Lng: -70.1627';
        }
    }

    showError(message) {
        const container = document.getElementById('propertiesList');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                    <button onclick="adminManager.loadPropertiesFromSupabase()" class="btn-primary">
                        Reintentar
                    </button>
                </div>
            `;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación...');
    window.adminManager = new AdminManager();
});