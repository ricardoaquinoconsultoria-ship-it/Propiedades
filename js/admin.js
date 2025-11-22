class AdminManager {
    constructor() {
        this.currentUser = null;
        this.properties = [];
        this.uploadedImages = [];
        this.ADMIN_PASSWORD = "Admin4050"; // Contraseña administrador
        this.FOUNDER_PASSWORD = "Di2080Funda"; // Contraseña fundador
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.showLogin(); // Mostrar login directamente
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Config access button
        document.getElementById('configAccessBtn').addEventListener('click', () => {
            this.handleConfigAccess();
        });

        // Founder modal
        this.setupFounderModal();

        // Property form
        document.getElementById('propertyForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProperty();
        });

        // Image upload
        document.getElementById('propertyImages').addEventListener('change', (e) => {
            this.handleImagePreview(e);
        });
    }

    setupFounderModal() {
        const modal = document.getElementById('founderModal');
        const closeBtn = document.getElementById('closeFounderModal');
        const cancelBtn = document.getElementById('cancelFounderBtn');
        const form = document.getElementById('founderPasswordForm');

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

    handleLogin() {
        const password = document.getElementById('adminPassword').value;
        
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
            document.getElementById('adminPassword').value = '';
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
        document.getElementById('founderModal').classList.remove('hidden');
        document.getElementById('founderPassword').focus();
    }

    hideFounderModal() {
        document.getElementById('founderModal').classList.add('hidden');
        document.getElementById('founderPassword').value = '';
    }

    verifyFounderPassword() {
        const password = document.getElementById('founderPassword').value;
        
        if (password === this.FOUNDER_PASSWORD) {
            // Redirigir a configuración
            window.location.href = 'config.html';
        } else {
            this.showMessage('❌ Contraseña de fundador incorrecta', 'error');
            document.getElementById('founderPassword').value = '';
            document.getElementById('founderPassword').focus();
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLogin();
        this.showMessage('Sesión cerrada', 'success');
    }

    showLogin() {
        document.getElementById('login-section').classList.remove('hidden');
        document.querySelectorAll('.admin-section:not(#login-section)').forEach(section => {
            section.classList.add('hidden');
        });
    }

    async showAdminPanel() {
        document.getElementById('login-section').classList.add('hidden');
        document.querySelectorAll('.admin-section:not(#login-section)').forEach(section => {
            section.classList.remove('hidden');
        });
        
        this.loadDashboardStats();
        this.loadPropertiesList();
    }

    // ... (el resto de los métodos loadDashboardStats, loadPropertiesList, 
    // handleAddProperty, etc. se mantienen igual)
}

document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});
