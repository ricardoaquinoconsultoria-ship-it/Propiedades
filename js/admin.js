class AdminManager {
    constructor() {
        this.properties = [];
        this.locationMap = null;
        this.locationMarker = null;
        this.selectedImages = [];
        this.maxImages = 5;
        this.editingProperty = null;
    }

    async init() {
        console.log('🔄 Inicializando AdminManager...');
        
        // Verificar que Supabase esté disponible
        if (!window.supabase) {
            alert('❌ Error: No se pudo conectar a la base de datos. Recarga la página.');
            return;
        }
        
        await this.setupEventListeners();
        await this.initializeLocationMap();
        await this.loadPropertiesFromSupabase();
        this.setupImageUpload();
        console.log('✅ AdminManager inicializado');
    }

    async loadPropertiesFromSupabase() {
        try {
            console.log('📡 Cargando propiedades desde Supabase...');
            
            const { data: properties, error } = await window.supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error Supabase:', error);
                throw error;
            }

            this.properties = properties || [];
            console.log(`✅ ${this.properties.length} propiedades cargadas de Supabase`);
            
            this.updateDashboard();
            this.renderPropertiesList();
            
        } catch (error) {
            console.error('Error cargando propiedades:', error);
            alert('❌ Error cargando propiedades: ' + error.message);
        }
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Navegación
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showSection(target);
                this.updateActiveNav(link);
            });
        });

        // Formulario
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingProperty) {
                this.handleUpdateProperty(this.editingProperty.id);
            } else {
                this.handleAddProperty();
            }
        });

        // Cerrar sesión
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.location.href = './index.html';
            }
        });

        // Validación de área
        document.getElementById('propertyArea').addEventListener('input', (e) => {
            this.validateAreaField(e.target);
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

    updateActiveNav(activeLink) {
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    async handleAddProperty() {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Guardando...';
            submitBtn.disabled = true;

            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Enviando propiedad a Supabase...', formData);

            const { data, error } = await window.supabase
                .from('properties')
                .insert([formData])
                .select();

            if (error) throw error;

            console.log('✅ Propiedad agregada a Supabase:', data);
            alert('✅ Propiedad agregada exitosamente!');
            
            await this.loadPropertiesFromSupabase();
            this.resetForm();
            this.showSection('properties');
            
        } catch (error) {
            console.error('Error agregando propiedad:', error);
            alert('❌ Error al agregar la propiedad: ' + error.message);
        } finally {
            submitBtn.innerHTML = '🏠 Agregar Propiedad';
            submitBtn.disabled = false;
        }
    }

    getFormData() {
        return {
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
    }

    validateForm(formData) {
        const requiredFields = [
            { field: formData.title, name: 'título', element: 'propertyTitle' },
            { field: formData.type, name: 'tipo de propiedad', element: 'propertyType' },
            { field: formData.price > 0, name: 'precio válido', element: 'propertyPrice' },
            { field: formData.description, name: 'descripción', element: 'propertyDescription' },
            { field: formData.location.address, name: 'dirección', element: 'propertyAddress' },
            { field: formData.characteristics.area > 0, name: 'área válida', element: 'propertyArea' }
        ];

        for (let required of requiredFields) {
            if (!required.field) {
                alert(`❌ El campo "${required.name}" es requerido`);
                document.getElementById(required.element).focus();
                return false;
            }
        }

        if (this.selectedImages.length === 0) {
            alert('❌ Debes agregar al menos una imagen de la propiedad');
            return false;
        }

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
        
        alert('✏️ Modo edición activado. Modifica la propiedad y haz clic en "Actualizar Propiedad"');
    }

    async handleUpdateProperty(propertyId) {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Actualizando...';
            submitBtn.disabled = true;

            const formData = this.getFormData();

            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Actualizando propiedad en Supabase...', formData);

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

                alert('🗑️ Propiedad eliminada exitosamente');
                await this.loadPropertiesFromSupabase();

            } catch (error) {
                console.error('Error eliminando propiedad:', error);
                alert('❌ Error al eliminar la propiedad: ' + error.message);
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
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando aplicación Admin...');
    window.adminManager = new AdminManager();
});