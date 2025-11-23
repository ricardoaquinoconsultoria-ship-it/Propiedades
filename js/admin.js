class AdminManager {
    constructor() {
        this.properties = [];
        this.locationMap = null;
        this.locationMarker = null;
        this.selectedImages = [];
        this.maxImages = 5;
        this.editingProperty = null;
        this.init();
    }

    async init() {
        console.log('🔄 Inicializando AdminManager...');
        await this.verifySupabase();
        this.setupEventListeners();
        await this.initializeLocationMap();
        await this.loadPropertiesFromSupabase();
        this.setupImageUpload();
    }

    async verifySupabase() {
        console.log('🔍 Verificando Supabase...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.error('❌ Supabase no disponible');
            if (window.initializeSupabase) {
                window.supabase = window.initializeSupabase();
                console.log('🔄 Supabase re-inicializado');
            } else {
                throw new Error('No se puede inicializar Supabase');
            }
        }
        
        console.log('✅ Supabase verificado correctamente');
    }

    async loadPropertiesFromSupabase() {
        try {
            console.log('📡 Cargando propiedades desde Supabase...');
            
            if (!window.supabase || typeof window.supabase.from !== 'function') {
                throw new Error('Supabase no está disponible');
            }
            
            const { data: properties, error } = await window.supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error cargando propiedades:', error);
                this.showError(`Error cargando propiedades: ${error.message}`);
                return;
            }

            console.log('✅ Propiedades cargadas:', properties);
            this.properties = properties || [];
            this.updateDashboard();
            this.renderPropertiesList();
            
        } catch (error) {
            console.error('Error crítico:', error);
            this.showError(`Error crítico: ${error.message}`);
        }
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners del admin...');
        
        this.setupNavigation();
        
        // Formulario de propiedad
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        // Botón cerrar sesión
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.location.href = './';
            }
        });

        // Validación de área
        document.getElementById('propertyArea').addEventListener('input', (e) => {
            this.validateAreaField(e.target);
        });

        console.log('✅ Event listeners del admin configurados');
    }

    setupNavigation() {
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        console.log('🔗 Enlaces de navegación encontrados:', menuLinks.length);
        
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                console.log('📱 Navegando a:', target);
                this.showSection(target);
                this.updateActiveNav(target);
            });
        });
    }

    showSection(sectionId) {
        console.log('🎯 Mostrando sección:', sectionId);
        
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log('✅ Sección mostrada:', sectionId);
        } else {
            console.log('❌ Sección no encontrada:', sectionId);
        }
    }

    updateActiveNav(section) {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${section}`) {
                link.classList.add('active');
            }
        });
    }

    async handleAddProperty() {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Guardando...';
            submitBtn.disabled = true;

            if (!window.supabase || typeof window.supabase.from !== 'function') {
                throw new Error('Supabase no está disponible. Recarga la página.');
            }

            const formData = {
                title: document.getElementById('propertyTitle').value.trim(),
                type: document.getElementById('propertyType').value,
                price: parseFloat(document.getElementById('propertyPrice').value) || 0,
                description: document.getElementById('propertyDescription').value.trim(),
                location: {
                    address: document.getElementById('propertyAddress').value.trim(),
                    lat: parseFloat(document.getElementById('propertyLat').value) || 18.7357,
                    lng: parseFloat(document.getElementById('propertyLng').value) || -70.1627
                },
                characteristics: {
                    bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
                    bathrooms: parseInt(document.getElementById('propertyBathrooms').value) || 0,
                    area: parseInt(document.getElementById('propertyArea').value) || 100,
                    parking: document.getElementById('propertyParking').checked || false,
                    pool: document.getElementById('propertyPool').checked || false,
                    garden: document.getElementById('propertyGarden').checked || false
                },
                status: 'disponible',
                images: this.selectedImages.map(img => img.src),
                created_at: new Date().toISOString()
            };

            console.log('📋 Datos del formulario:', formData);

            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Enviando propiedad a Supabase...');

            const { data, error } = await window.supabase
                .from('properties')
                .insert([formData])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Propiedad agregada:', data);

            alert('✅ Propiedad agregada exitosamente!');
            await this.loadPropertiesFromSupabase();
            this.resetForm();
            
            this.showSection('properties');
            this.updateActiveNav('properties');

        } catch (error) {
            console.error('Error agregando propiedad:', error);
            alert('❌ Error al agregar la propiedad: ' + error.message);
        } finally {
            submitBtn.innerHTML = '🏠 Agregar Propiedad';
            submitBtn.disabled = false;
        }
    }

    validateForm(formData) {
        if (!formData.title || formData.title.trim() === '') {
            alert('❌ El título de la propiedad es requerido');
            document.getElementById('propertyTitle').focus();
            return false;
        }
        
        if (!formData.type) {
            alert('❌ Debes seleccionar un tipo de propiedad');
            document.getElementById('propertyType').focus();
            return false;
        }
        
        if (!formData.price || formData.price <= 0) {
            alert('❌ El precio debe ser un número mayor a 0');
            document.getElementById('propertyPrice').focus();
            return false;
        }
        
        if (!formData.description || formData.description.trim() === '') {
            alert('❌ La descripción de la propiedad es requerida');
            document.getElementById('propertyDescription').focus();
            return false;
        }
        
        if (!formData.location.address || formData.location.address.trim() === '') {
            alert('❌ La dirección de la propiedad es requerida');
            document.getElementById('propertyAddress').focus();
            return false;
        }
        
        const areaValue = document.getElementById('propertyArea').value;
        if (!areaValue || areaValue.trim() === '' || parseInt(areaValue) <= 0) {
            alert('❌ El área en metros cuadrados es requerida\n\nEjemplo: 120 (para 120 m²)');
            document.getElementById('propertyArea').focus();
            return false;
        }
        
        console.log('✅ Validación completada exitosamente');
        return true;
    }

    validateAreaField(field) {
        const value = field.value;
        if (value && parseInt(value) > 0) {
            field.style.borderColor = '#16a34a';
        } else {
            field.style.borderColor = '#dc2626';
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

        uploadArea.addEventListener('click', () => {
            if (this.selectedImages.length >= this.maxImages) {
                this.showMaxImagesMessage();
                return;
            }
            fileInput.click();
        });

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
        if (this.selectedImages.length + files.length > this.maxImages) {
            this.showMaxImagesMessage();
            return;
        }

        const remainingSlots = this.maxImages - this.selectedImages.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`⚠️ Solo se procesarán ${remainingSlots} de ${files.length} imágenes (límite: ${this.maxImages})`);
        }

        filesToProcess.forEach(file => {
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
                    this.updateImageCounter();
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    showMaxImagesMessage() {
        alert(`❌ Límite alcanzado\n\nSolo puedes subir máximo ${this.maxImages} imágenes.\n\nElimina alguna imagen existente para agregar nuevas.`);
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

    updateImageCounter() {
        const uploadArea = document.getElementById('imageUploadArea');
        const placeholder = uploadArea.querySelector('p');
        
        if (this.selectedImages.length > 0) {
            const remaining = this.maxImages - this.selectedImages.length;
            if (placeholder) {
                placeholder.innerHTML = `${this.selectedImages.length}/${this.maxImages} imágenes seleccionadas<br><small>Puedes agregar ${remaining} más</small>`;
            }
        } else {
            if (placeholder) {
                placeholder.innerHTML = 'Arrastra imágenes aquí o haz clic para seleccionar<br><small>Máximo 5 imágenes</small>';
            }
        }
    }

    removeImage(id) {
        this.selectedImages = this.selectedImages.filter(img => img.id != id);
        this.updateImagePreview();
        this.updateImageCounter();
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
        if (!container) {
            console.log('❌ Contenedor de propiedades no encontrado');
            return;
        }

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
                    <div class="property-area">
                        <small>Área: ${property.characteristics?.area || '0'} m²</small>
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

    // FUNCIÓN EDITAR PROPIEDAD - CORREGIDA
    editProperty(propertyId) {
        console.log('✏️ Editando propiedad:', propertyId);
        const property = this.properties.find(p => p.id === propertyId);
        
        if (!property) {
            alert('❌ Propiedad no encontrada');
            return;
        }

        // Guardar propiedad que estamos editando
        this.editingProperty = property;

        // Llenar el formulario con los datos de la propiedad
        document.getElementById('propertyTitle').value = property.title || '';
        document.getElementById('propertyType').value = property.type || '';
        document.getElementById('propertyPrice').value = property.price || 0;
        document.getElementById('propertyDescription').value = property.description || '';
        document.getElementById('propertyAddress').value = property.location?.address || '';
        document.getElementById('propertyLat').value = property.location?.lat || 18.7357;
        document.getElementById('propertyLng').value = property.location?.lng || -70.1627;
        document.getElementById('selectedCoordinates').textContent = 
            `Lat: ${property.location?.lat || 18.7357}, Lng: ${property.location?.lng || -70.1627}`;
        
        // Características
        document.getElementById('propertyBedrooms').value = property.characteristics?.bedrooms || 0;
        document.getElementById('propertyBathrooms').value = property.characteristics?.bathrooms || 0;
        document.getElementById('propertyArea').value = property.characteristics?.area || 100;
        document.getElementById('propertyParking').checked = property.characteristics?.parking || false;
        document.getElementById('propertyPool').checked = property.characteristics?.pool || false;
        document.getElementById('propertyGarden').checked = property.characteristics?.garden || false;

        // Imágenes
        this.selectedImages = property.images ? property.images.map((src, index) => ({
            id: Date.now() + index,
            src: src,
            file: null
        })) : [];
        this.updateImagePreview();
        this.updateImageCounter();

        // Cambiar a la sección de agregar propiedad
        this.showSection('add-property');
        this.updateActiveNav('add-property');

        // Cambiar el texto del botón a "Actualizar"
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.innerHTML = '🔄 Actualizar Propiedad';
        submitBtn.onclick = (e) => {
            e.preventDefault();
            this.handleUpdateProperty(propertyId);
        };

        alert('✏️ Modo edición activado. Modifica la propiedad y haz clic en "Actualizar Propiedad"');
    }

    // FUNCIÓN ACTUALIZAR PROPIEDAD
    async handleUpdateProperty(propertyId) {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Actualizando...';
            submitBtn.disabled = true;

            const formData = {
                title: document.getElementById('propertyTitle').value.trim(),
                type: document.getElementById('propertyType').value,
                price: parseFloat(document.getElementById('propertyPrice').value) || 0,
                description: document.getElementById('propertyDescription').value.trim(),
                location: {
                    address: document.getElementById('propertyAddress').value.trim(),
                    lat: parseFloat(document.getElementById('propertyLat').value) || 18.7357,
                    lng: parseFloat(document.getElementById('propertyLng').value) || -70.1627
                },
                characteristics: {
                    bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
                    bathrooms: parseInt(document.getElementById('propertyBathrooms').value) || 0,
                    area: parseInt(document.getElementById('propertyArea').value) || 100,
                    parking: document.getElementById('propertyParking').checked || false,
                    pool: document.getElementById('propertyPool').checked || false,
                    garden: document.getElementById('propertyGarden').checked || false
                },
                images: this.selectedImages.map(img => img.src),
                updated_at: new Date().toISOString()
            };

            if (!this.validateForm(formData)) {
                return;
            }

            const { error } = await window.supabase
                .from('properties')
                .update(formData)
                .eq('id', propertyId);

            if (error) {
                throw new Error(error.message);
            }

            alert('✅ Propiedad actualizada exitosamente!');
            await this.loadPropertiesFromSupabase();
            this.resetForm();
            
            this.showSection('properties');
            this.updateActiveNav('properties');

        } catch (error) {
            console.error('Error actualizando propiedad:', error);
            alert('❌ Error al actualizar la propiedad: ' + error.message);
        } finally {
            submitBtn.innerHTML = '🏠 Agregar Propiedad';
            submitBtn.disabled = false;
            // Restaurar el evento original
            submitBtn.onclick = (e) => {
                e.preventDefault();
                this.handleAddProperty();
            };
            this.editingProperty = null;
        }
    }

    async deleteProperty(propertyId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            try {
                const { error } = await window.supabase
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
        this.updateImageCounter();
        this.editingProperty = null;
        
        document.getElementById('propertyArea').style.borderColor = '';
        
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

        // Restaurar el botón a "Agregar Propiedad"
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.innerHTML = '🏠 Agregar Propiedad';
        submitBtn.onclick = (e) => {
            e.preventDefault();
            this.handleAddProperty();
        };
    }

    showError(message) {
        const container = document.getElementById('propertiesList');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                    <div style="margin-top: 1rem;">
                        <button onclick="adminManager.loadPropertiesFromSupabase()" class="btn-primary">
                            🔄 Reintentar
                        </button>
                        <button onclick="adminManager.showSection('add-property'); adminManager.updateActiveNav('add-property')" 
                                class="btn-secondary" style="margin-left: 0.5rem;">
                            ➕ Agregar Propiedad Manualmente
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación Admin...');
    window.adminManager = new AdminManager();
});