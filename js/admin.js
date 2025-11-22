class AdminManager {
    constructor() {
        this.currentUser = null;
        this.properties = [];
        this.uploadedImages = [];
        this.ADMIN_PASSWORD = "Admin4050";
        this.FOUNDER_PASSWORD = "Di2080Funda";
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.showLogin();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Config access button
        document.getElementById('configAccessBtn')?.addEventListener('click', () => {
            this.handleConfigAccess();
        });

        // Founder modal
        this.setupFounderModal();

        // Property form
        document.getElementById('propertyForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        // Image upload
        document.getElementById('propertyImages')?.addEventListener('change', (e) => {
            this.handleImagePreview(e);
        });
    }

    setupFounderModal() {
        const modal = document.getElementById('founderModal');
        const closeBtn = document.getElementById('closeFounderModal');
        const cancelBtn = document.getElementById('cancelFounderBtn');
        const form = document.getElementById('founderPasswordForm');

        if (!modal || !closeBtn || !cancelBtn || !form) return;

        closeBtn.addEventListener('click', () => this.hideFounderModal());
        cancelBtn.addEventListener('click', () => this.hideFounderModal());
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyFounderPassword();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.hideFounderModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.hideFounderModal();
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
                
                // Actualizar estado activo
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

    handleLogin() {
        const passwordInput = document.getElementById('adminPassword');
        if (!passwordInput) return;

        const password = passwordInput.value;
        
        if (password === this.ADMIN_PASSWORD) {
            this.currentUser = { 
                id: 'admin', 
                name: 'Administrador',
                role: 'admin'
            };
            this.showAdminPanel();
            this.showMessage('✅ Acceso concedido como administrador', 'success');
        } else {
            this.showMessage('❌ Contraseña incorrecta', 'error');
            passwordInput.value = '';
        }
    }

    handleConfigAccess() {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión primero', 'error');
            return;
        }
        this.showFounderModal();
    }

    showFounderModal() {
        const modal = document.getElementById('founderModal');
        const passwordInput = document.getElementById('founderPassword');
        if (modal && passwordInput) {
            modal.classList.remove('hidden');
            passwordInput.focus();
        }
    }

    hideFounderModal() {
        const modal = document.getElementById('founderModal');
        const passwordInput = document.getElementById('founderPassword');
        if (modal && passwordInput) {
            modal.classList.add('hidden');
            passwordInput.value = '';
        }
    }

    verifyFounderPassword() {
        const passwordInput = document.getElementById('founderPassword');
        if (!passwordInput) return;

        const password = passwordInput.value;
        
        if (password === this.FOUNDER_PASSWORD) {
            // Redirigir a configuración
            window.location.href = 'config.html';
        } else {
            this.showMessage('❌ Contraseña de fundador incorrecta', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLogin();
        this.showMessage('Sesión cerrada', 'success');
    }

    showLogin() {
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.classList.remove('hidden');
        }
        
        document.querySelectorAll('.admin-section:not(#login-section)').forEach(section => {
            section.classList.add('hidden');
        });
    }

    async showAdminPanel() {
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.classList.add('hidden');
        }
        
        document.querySelectorAll('.admin-section:not(#login-section)').forEach(section => {
            section.classList.remove('hidden');
        });
        
        await this.loadDashboardStats();
        await this.loadPropertiesList();
    }

    async loadDashboardStats() {
        try {
            const { data: properties, error } = await supabase
                .from('properties')
                .select('*');

            if (error) throw error;

            this.properties = properties || [];

            // Actualizar estadísticas
            document.getElementById('totalProperties').textContent = this.properties.length;
            document.getElementById('availableProperties').textContent = 
                this.properties.filter(p => p.status === 'disponible').length;
            document.getElementById('houseCount').textContent = 
                this.properties.filter(p => p.type === 'casa').length;
            document.getElementById('apartmentCount').textContent = 
                this.properties.filter(p => p.type === 'apartamento').length;

        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            this.showMessage('Error al cargar las estadísticas', 'error');
        }
    }

    async loadPropertiesList() {
        try {
            const container = document.getElementById('propertiesList');
            if (!container) return;

            if (this.properties.length === 0) {
                container.innerHTML = '<p>No hay propiedades registradas.</p>';
                return;
            }

            container.innerHTML = this.properties.map(property => `
                <div class="property-item">
                    <div class="property-info">
                        <h3>${this.escapeHtml(property.title)}</h3>
                        <div class="property-meta">
                            <span>$${(property.price || 0).toLocaleString()}</span> • 
                            <span>${property.type}</span> • 
                            <span>${property.location?.address || 'Sin dirección'}</span>
                        </div>
                    </div>
                    <div class="property-actions">
                        <button class="btn-primary" onclick="adminManager.editProperty('${property.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn-danger" onclick="adminManager.deleteProperty('${property.id}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Error cargando propiedades:', error);
            this.showMessage('Error al cargar las propiedades', 'error');
        }
    }

    async handleAddProperty() {
        try {
            const formData = {
                title: document.getElementById('propertyTitle').value,
                type: document.getElementById('propertyType').value,
                price: parseFloat(document.getElementById('propertyPrice').value),
                location: {
                    address: document.getElementById('propertyAddress').value,
                    lat: parseFloat(document.getElementById('propertyLat').value),
                    lng: parseFloat(document.getElementById('propertyLng').value)
                },
                characteristics: {
                    bedrooms: parseInt(document.getElementById('propertyBedrooms').value) || 0,
                    bathrooms: parseFloat(document.getElementById('propertyBathrooms').value) || 0,
                    area: parseInt(document.getElementById('propertyArea').value) || 0
                },
                images: this.uploadedImages,
                status: 'disponible',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('properties')
                .insert([formData])
                .select();

            if (error) throw error;

            this.showMessage('✅ Propiedad agregada correctamente', 'success');
            this.resetPropertyForm();
            await this.loadDashboardStats();
            await this.loadPropertiesList();

        } catch (error) {
            console.error('Error agregando propiedad:', error);
            this.showMessage('Error al agregar la propiedad', 'error');
        }
    }

    resetPropertyForm() {
        document.getElementById('propertyForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        this.uploadedImages = [];
    }

    handleImagePreview(event) {
        const files = event.target.files;
        const preview = document.getElementById('imagePreview');
        this.uploadedImages = [];

        preview.innerHTML = '';

        for (let file of files) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                preview.appendChild(img);
                this.uploadedImages.push(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async editProperty(propertyId) {
        // Implementar edición de propiedad
        this.showMessage('Función de edición en desarrollo', 'success');
    }

    async deleteProperty(propertyId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return;

        try {
            const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            if (error) throw error;

            this.showMessage('✅ Propiedad eliminada correctamente', 'success');
            await this.loadDashboardStats();
            await this.loadPropertiesList();

        } catch (error) {
            console.error('Error eliminando propiedad:', error);
            this.showMessage('Error al eliminar la propiedad', 'error');
        }
    }

    showMessage(message, type) {
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `${type}-message`;
        messageEl.textContent = message;

        // Insertar al inicio del admin-main
        const adminMain = document.querySelector('.admin-main');
        if (adminMain) {
            adminMain.insertBefore(messageEl, adminMain.firstChild);
            
            // Remover después de 5 segundos
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 5000);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Inicializar cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});