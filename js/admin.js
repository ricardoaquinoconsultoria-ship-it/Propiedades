class AdminManager {
    constructor() {
        this.properties = [];
        this.locationMap = null;
        this.locationMarker = null;
        this.selectedImages = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.initializeLocationMap();
        await this.loadProperties();
        this.setupImageUpload();
    }

    setupEventListeners() {
        // Navegación
        this.setupNavigation();
        
        // Formulario de propiedad
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    setupNavigation() {
        const menuLinks = document.querySelectorAll('.sidebar-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.showSection(target);
                
                // Actualizar clase activa
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar sección seleccionada
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

            // Agregar marcador inicial
            this.locationMarker = L.marker([18.7357, -70.1627])
                .addTo(this.locationMap)
                .bindPopup('Ubicación de la propiedad')
                .openPopup();

            // Evento para cambiar ubicación al hacer clic en el mapa
            this.locationMap.on('click', (e) => {
                const { lat, lng } = e.latlng;
                
                // Actualizar marcador
                this.locationMap.removeLayer(this.locationMarker);
                this.locationMarker = L.marker([lat, lng])
                    .addTo(this.locationMap)
                    .bindPopup('Ubicación seleccionada')
                    .openPopup();

                // Actualizar coordenadas en el formulario
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
        const previewContainer = document.getElementById('imagePreview');

        // Click en el área de upload
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop
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
            const files = e.dataTransfer.files;
            this.handleImageFiles(files);
        });

        // Cambio en el input de archivos
        fileInput.addEventListener('change', (e) => {
            this.handleImageFiles(e.target.files);
        });
    }

    handleImageFiles(files) {
        const maxImages = 5;
        
        // Verificar límite
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
        
        // Ocultar placeholder si hay imágenes
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

        // Event listeners para botones de eliminar
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

    async loadProperties() {
        try {
            // Cargar propiedades desde localStorage o usar datos de ejemplo
            const savedProperties = localStorage.getItem('adminProperties');
            
            if (savedProperties) {
                this.properties = JSON.parse(savedProperties);
            } else {
                // Datos de ejemplo
                this.properties = [
                    {
                        id: 1,
                        title: "Casa de ejemplo en zona residencial",
                        type: "casa",
                        price: 150000,
                        status: "disponible",
                        location: {
                            address: "Calle Principal #123, Santo Domingo",
                            lat: 18.7357,
                            lng: -70.1627
                        },
                        characteristics: {
                            bedrooms: 3,
                            bathrooms: 2,
                            area: 120,
                            parking: true,
                            pool: false,
                            garden: true
                        },
                        description: "Una casa espaciosa con jardín, perfecta para familias. Cuenta con amplios espacios y buena iluminación natural.",
                        images: [
                            "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400",
                            "https://images.unsplash.com/photo-1494526585095-c41746248156?w=400",
                            "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400"
                        ]
                    }
                ];
                this.saveProperties();
            }
            
            this.updateDashboard();
            this.renderPropertiesList();
            
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        }
    }

    saveProperties() {
        localStorage.setItem('adminProperties', JSON.stringify(this.properties));
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
            container.innerHTML = '<p class="no-properties">No hay propiedades registradas</p>';
            return;
        }

        container.innerHTML = this.properties.map(property => `
            <div class="property-item" data-id="${property.id}">
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div class="property-meta">
                        <span class="price">$${property.price.toLocaleString()}</span>
                        <span class="type">${this.getTypeLabel(property.type)}</span>
                        <span class="status ${property.status}">${property.status}</span>
                    </div>
                    <div class="property-address">
                        <span>📍</span>
                        <span>${property.location.address}</span>
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

    async handleAddProperty() {
        try {
            const formData = {
                title: document.getElementById('propertyTitle').value,
                type: document.getElementById('propertyType').value,
                price: parseFloat(document.getElementById('propertyPrice').value),
                description: document.getElementById('propertyDescription').value,
                location: {
                    address: document.getElementById('propertyAddress').value,
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
                images: this.selectedImages.map(img => img.src)
            };

            // Validaciones básicas
            if (!formData.title || !formData.type || !formData.price || !formData.location.address) {
                alert('❌ Por favor completa todos los campos requeridos');
                return;
            }

            if (formData.price <= 0) {
                alert('❌ El precio debe ser mayor a 0');
                return;
            }

            // Crear nueva propiedad
            const newProperty = {
                id: Date.now(), // ID único
                ...formData
            };

            // Agregar a la lista
            this.properties.push(newProperty);
            this.saveProperties();

            // Actualizar UI
            this.updateDashboard();
            this.renderPropertiesList();

            // Mostrar mensaje de éxito
            alert('✅ Propiedad agregada exitosamente!');

            // Limpiar formulario
            this.resetForm();

            // Cambiar a la sección de propiedades
            this.showSection('properties');
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#properties') {
                    link.classList.add('active');
                }
            });

        } catch (error) {
            console.error('Error agregando propiedad:', error);
            alert('❌ Error al agregar la propiedad');
        }
    }

    resetForm() {
        document.getElementById('propertyForm').reset();
        this.selectedImages = [];
        this.updateImagePreview();
        
        // Restablecer mapa a posición inicial
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

    editProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (property) {
            // Llenar formulario con datos de la propiedad
            document.getElementById('propertyTitle').value = property.title;
            document.getElementById('propertyType').value = property.type;
            document.getElementById('propertyPrice').value = property.price;
            document.getElementById('propertyDescription').value = property.description;
            document.getElementById('propertyAddress').value = property.location.address;
            document.getElementById('propertyBedrooms').value = property.characteristics.bedrooms;
            document.getElementById('propertyBathrooms').value = property.characteristics.bathrooms;
            document.getElementById('propertyArea').value = property.characteristics.area;
            document.getElementById('propertyParking').checked = property.characteristics.parking;
            document.getElementById('propertyPool').checked = property.characteristics.pool;
            document.getElementById('propertyGarden').checked = property.characteristics.garden;

            // Actualizar mapa
            if (this.locationMarker) {
                this.locationMap.removeLayer(this.locationMarker);
                this.locationMarker = L.marker([property.location.lat, property.location.lng])
                    .addTo(this.locationMap)
                    .bindPopup('Ubicación de la propiedad');
                
                this.locationMap.setView([property.location.lat, property.location.lng], 15);
                
                document.getElementById('propertyLat').value = property.location.lat;
                document.getElementById('propertyLng').value = property.location.lng;
                document.getElementById('selectedCoordinates').textContent = 
                    `Lat: ${property.location.lat.toFixed(4)}, Lng: ${property.location.lng.toFixed(4)}`;
            }

            // Cargar imágenes
            this.selectedImages = property.images.map((src, index) => ({
                id: index,
                src: src,
                file: null
            }));
            this.updateImagePreview();

            // Cambiar a sección de agregar propiedad
            this.showSection('add-property');
            document.querySelectorAll('.sidebar-menu a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#add-property') {
                    link.classList.add('active');
                }
            });

            alert('✏️ Modo edición activado para: ' + property.title);
        }
    }

    deleteProperty(propertyId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            this.properties = this.properties.filter(p => p.id !== propertyId);
            this.saveProperties();
            this.updateDashboard();
            this.renderPropertiesList();
            alert('🗑️ Propiedad eliminada exitosamente');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Configuración de Supabase
const SUPABASE_URL = 'https://vbimfwzxdafuqexsnvso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZiaW1md3p4ZGFmdXFleHNudnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NTY4NDksImV4cCI6MjA3OTMzMjg0OX0.8ergS1';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);