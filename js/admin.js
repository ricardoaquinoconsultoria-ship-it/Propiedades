class AdminManager {
    constructor() {
        this.properties = [];
        this.locationMap = null;
        this.locationMarker = null;
        this.selectedImages = [];
        this.maxImages = 5;
        this.editingProperty = null; // Para saber si estamos editando
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
        this.setupNavigation();
        
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingProperty) {
                this.handleUpdateProperty();
            } else {
                this.handleAddProperty();
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                window.location.href = './';
            }
        });

        // Agregar validación en tiempo real para el área
        document.getElementById('propertyArea').addEventListener('input', (e) => {
            this.validateAreaField(e.target);
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
                
                // Si vamos a agregar propiedad, resetear el formulario
                if (target === 'add-property') {
                    this.cancelEdit();
                }
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

            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Enviando propiedad a Supabase...', formData);

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

    async handleUpdateProperty() {
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '⏳ Actualizando...';
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
                images: this.selectedImages.map(img => img.src),
                updated_at: new Date().toISOString()
            };

            if (!this.validateForm(formData)) {
                return;
            }

            console.log('📤 Actualizando propiedad en Supabase...', formData);

            const { data, error } = await window.supabase
                .from('properties')
                .update(formData)
                .eq('id', this.editingProperty.id)
                .select();

            if (error) {
                throw new Error(error.message);
            }

            console.log('✅ Propiedad actualizada:', data);

            alert('✅ Propiedad actualizada exitosamente!');
            await this.loadPropertiesFromSupabase();
            this.cancelEdit();
            
            this.showSection('properties');
            this.updateActiveNav('properties');

        } catch (error) {
            console.error('Error actualizando propiedad:', error);
            alert('❌ Error al actualizar la propiedad: ' + error.message);
        } finally {
            submitBtn.innerHTML = '🏠 Agregar Propiedad';
            submitBtn.disabled = false;
        }
    }

    // FUNCIÓN EDITAR PROPIEDAD - IMPLEMENTADA
    editProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) {
            alert('❌ Propiedad no encontrada');
            return;
        }

        this.editingProperty = property;

        // Llenar el formulario con los datos de la propiedad
        document.getElementById('propertyTitle').value = property.title || '';
        document.getElementById('propertyType').value = property.type || '';
        document.getElementById('propertyPrice').value = property.price || 0;
        document.getElementById('propertyDescription').value = property.description || '';
        document.getElementById('propertyAddress').value = property.location?.address || '';
        document.getElementById('propertyLat').value = property.location?.lat || 18.7357;
        document.getElementById('propertyLng').value = property.location?.lng || -70.1627;
        document.getElementById('propertyBedrooms').value = property.characteristics?.bedrooms || 0;
        document.getElementById('propertyBathrooms').value = property.characteristics?.bathrooms || 0;
        document.getElementById('propertyArea').value = property.characteristics?.area || 100;
        document.getElementById('propertyParking').checked = property.characteristics?.parking || false;
        document.getElementById('propertyPool').checked = property.characteristics?.pool || false;
        document.getElementById('propertyGarden').checked = property.characteristics?.garden || false;

        // Actualizar coordenadas en el display
        document.getElementById('selectedCoordinates').textContent = 
            `Lat: ${property.location?.lat || 18.7357}, Lng: ${property.location?.lng || -70.1627}`;

        // Cargar imágenes
        this.selectedImages = property.images ? property.images.map((src, index) => ({
            id: Date.now() + index,
            src: src,
            file: null
        })) : [];
        this.updateImagePreview();
        this.updateImageCounter();

        // Actualizar el mapa
        if (this.locationMap && property.location?.lat && property.location?.lng) {
            this.locationMap.removeLayer(this.locationMarker);
            this.locationMarker = L.marker([property.location.lat, property.location.lng])
                .addTo(this.locationMap)
                .bindPopup('Ubicación de la propiedad')
                .openPopup();
            
            this.locationMap.setView([property.location.lat, property.location.lng], 12);
        }

        // Cambiar a la sección de agregar propiedad y actualizar el botón
        this.showSection('add-property');
        this.updateActiveNav('add-property');
        
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.innerHTML = '✏️ Actualizar Propiedad';
        submitBtn.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';

        // Agregar botón de cancelar edición
        this.addCancelEditButton();

        console.log('✏️ Editando propiedad:', property);
    }

    addCancelEditButton() {
        // Remover botón anterior si existe
        const existingBtn = document.getElementById('cancelEditBtn');
        if (existingBtn) {
            existingBtn.remove();
        }

        // Crear botón de cancelar
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancelEditBtn';
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-secondary';
        cancelBtn.innerHTML = '❌ Cancelar Edición';
        cancelBtn.style.marginTop = '10px';
        cancelBtn.style.width = '100%';
        
        cancelBtn.addEventListener('click', () => {
            this.cancelEdit();
        });

        // Insertar después del botón de submit
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
    }

    cancelEdit() {
        this.editingProperty = null;
        this.resetForm();
        
        // Remover botón de cancelar
        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.remove();
        }

        // Restaurar botón de submit
        const submitBtn = document.querySelector('.btn-submit');
        submitBtn.innerHTML = '🏠 Agregar Propiedad';
        submitBtn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';

        console.log('❌ Edición cancelada');
    }

    validateForm(formData) {
        if (!formData.title || formData.title.trim() === '') {
            alert('❌