class AdminManager {
    constructor() {
        this.properties = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadProperties();
    }

    setupEventListeners() {
        // Navegación
        this.setupNavigation();
        
        // Formulario de propiedad
        document.getElementById('propertyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
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
                
                menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
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

    async loadProperties() {
        try {
            // Simular propiedades
            this.properties = [
                {
                    id: 1,
                    title: "Casa de ejemplo",
                    type: "casa",
                    price: 150000,
                    status: "disponible"
                }
            ];
            
            this.updateDashboard();
            this.renderPropertiesList();
            
        } catch (error) {
            console.error('Error cargando propiedades:', error);
        }
    }

    updateDashboard() {
        document.getElementById('totalProperties').textContent = this.properties.length;
        document.getElementById('availableProperties').textContent = 
            this.properties.filter(p => p.status === 'disponible').length;
    }

    renderPropertiesList() {
        const container = document.getElementById('propertiesList');
        if (!container) return;

        container.innerHTML = this.properties.map(property => `
            <div class="property-item">
                <div class="property-info">
                    <h3>${property.title}</h3>
                    <div>$${property.price.toLocaleString()} - ${property.type}</div>
                </div>
                <div class="property-actions">
                    <button class="btn-primary">Editar</button>
                    <button class="btn-danger">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    async handleAddProperty() {
        const formData = {
            title: document.getElementById('propertyTitle').value,
            type: document.getElementById('propertyType').value,
            price: parseFloat(document.getElementById('propertyPrice').value),
            location: {
                address: document.getElementById('propertyAddress').value,
                lat: parseFloat(document.getElementById('propertyLat').value),
                lng: parseFloat(document.getElementById('propertyLng').value)
            },
            status: 'disponible'
        };

        alert('Propiedad agregada: ' + formData.title);
        
        // Limpiar formulario
        document.getElementById('propertyForm').reset();
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});