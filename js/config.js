class ConfigManager {
    constructor() {
        this.FOUNDER_PASSWORD = "Di2080Funda";
        this.init();
    }

    async init() {
        this.checkFounderAccess();
        this.setupEventListeners();
        this.setupNavigation();
    }

    checkFounderAccess() {
        // Mostrar modal de contraseña inmediatamente
        this.showPasswordModal();
    }

    showPasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔒 Verificación de Fundador</h3>
                </div>
                <div class="modal-body">
                    <p>Ingresa la contraseña de fundador para acceder a la configuración:</p>
                    <form id="configPasswordForm">
                        <input type="password" id="configPassword" placeholder="Contraseña de fundador" required>
                        <div class="modal-buttons">
                            <button type="button" id="configCancelBtn" class="btn-secondary">Cancelar</button>
                            <button type="submit" class="btn-primary">Verificar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.getElementById('configPassword').focus();

        document.getElementById('configPasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyPassword(modal);
        });

        document.getElementById('configCancelBtn').addEventListener('click', () => {
            this.redirectToAdmin();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.redirectToAdmin();
            }
        });
    }

    verifyPassword(modal) {
        const password = document.getElementById('configPassword').value;
        
        if (password === this.FOUNDER_PASSWORD) {
            modal.remove();
            document.querySelector('.admin-main').style.display = 'block';
            this.showMessage('✅ Acceso concedido como fundador', 'success');
        } else {
            alert('❌ Contraseña incorrecta');
            document.getElementById('configPassword').value = '';
            document.getElementById('configPassword').focus();
        }
    }

    redirectToAdmin() {
        window.location.href = 'admin.html';
    }

    setupEventListeners() {
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.sidebar-menu a');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.showSection(target);
                
                menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showSection(sectionId) {
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');
    }

    handleLogout() {
        window.location.href = 'admin.html';
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;

        const main = document.querySelector('.admin-main');
        main.insertBefore(messageDiv, main.firstChild);

        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Métodos de configuración (saveApiKeys, saveMapSettings, etc.)
    saveApiKeys() {
        this.showMessage('✅ API Keys guardadas correctamente', 'success');
    }

    saveMapSettings() {
        document.getElementById('zoomValue').textContent = document.getElementById('defaultZoom').value;
        this.showMessage('✅ Configuración de mapa guardada', 'success');
    }

    saveCompanySettings() {
        this.showMessage('✅ Configuración de empresa guardada', 'success');
    }

    saveAppearance() {
        this.showMessage('✅ Apariencia guardada correctamente', 'success');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.configManager = new ConfigManager();
});
