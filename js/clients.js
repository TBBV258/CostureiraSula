// DOM Elements
const clientsGrid = document.getElementById('clients-grid');
const noClientsMessage = document.getElementById('no-clients');
const clientForm = document.getElementById('client-form');
const clientSearch = document.getElementById('client-search');
const addClientBtn = document.getElementById('add-client-btn');
const modal = document.getElementById('client-form-modal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelClientBtn = document.getElementById('cancel-client');
const modalTitle = document.getElementById('modal-title');

// Form fields
const clientIdInput = document.getElementById('client-id');
const clientNameInput = document.getElementById('client-name');
const clientPhoneInput = document.getElementById('client-phone');
const clientEmailInput = document.getElementById('client-email');
const clientNotesInput = document.getElementById('client-notes');

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');

// App State
let clients = [];
let isEditing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadClients();
    setupEventListeners();
});

// Load theme preference from localStorage
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Update theme icon based on current theme
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Load clients from localStorage
function loadClients() {
    const savedClients = localStorage.getItem('sulaClients');
    if (savedClients) {
        try {
            clients = JSON.parse(savedClients);
            renderClients(clients);
        } catch (e) {
            console.error('Error loading clients:', e);
            alert('Erro ao carregar os clientes. Os dados podem estar corrompidos.');
            clients = [];
            localStorage.removeItem('sulaClients');
        }
    }
}

// Save clients to localStorage
function saveClients() {
    try {
        localStorage.setItem('sulaClients', JSON.stringify(clients));
        return true;
    } catch (e) {
        console.error('Error saving clients:', e);
        alert('Erro ao salvar os clientes. O armazenamento pode estar cheio.');
        return false;
    }
}

// Render clients in the grid
function renderClients(clientsToRender) {
    if (clientsToRender.length === 0) {
        noClientsMessage.style.display = 'block';
        clientsGrid.innerHTML = '';
        clientsGrid.appendChild(noClientsMessage);
        return;
    }
    
    noClientsMessage.style.display = 'none';
    
    clientsGrid.innerHTML = clientsToRender.map(client => `
        <div class="client-card" data-id="${client.id}">
            <h3 class="client-name">${client.name}</h3>
            <div class="client-detail">
                <span class="client-detail-label">Telefone:</span>
                <span class="client-detail-value">${client.phone || 'Não informado'}</span>
            </div>
            <div class="client-detail">
                <span class="client-detail-label">E-mail:</span>
                <span class="client-detail-value">${client.email || 'Não informado'}</span>
            </div>
            <div class="client-actions">
                <button class="btn btn-edit edit-client" data-id="${client.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete delete-client" data-id="${client.id}">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to the new buttons
    document.querySelectorAll('.edit-client').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clientId = parseInt(btn.dataset.id);
            editClient(clientId);
        });
    });
    
    document.querySelectorAll('.delete-client').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clientId = parseInt(btn.dataset.id);
            deleteClient(clientId);
        });
    });
    
    // Add click event to the entire card
    document.querySelectorAll('.client-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Only navigate if the click wasn't on a button
            if (!e.target.closest('button')) {
                const clientId = parseInt(card.dataset.id);
                window.location.href = `index.html?clientId=${clientId}`;
            }
        });
    });
}

// Filter clients based on search input
function filterClients(searchTerm) {
    if (!searchTerm) {
        renderClients(clients);
        return;
    }
    
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm)) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    renderClients(filteredClients);
}

// Open modal for adding a new client
function openAddClientModal() {
    isEditing = false;
    clientForm.reset();
    clientIdInput.value = '';
    modalTitle.textContent = 'Novo Cliente';
    modal.style.display = 'flex';
    clientNameInput.focus();
}

// Open modal for editing a client
function editClient(clientId) {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    isEditing = true;
    clientIdInput.value = client.id;
    clientNameInput.value = client.name;
    clientPhoneInput.value = client.phone || '';
    clientEmailInput.value = client.email || '';
    clientNotesInput.value = client.notes || '';
    
    modalTitle.textContent = 'Editar Cliente';
    modal.style.display = 'flex';
    clientNameInput.focus();
}

// Save client (add new or update existing)
function saveClient(clientData) {
    if (isEditing) {
        // Update existing client
        const index = clients.findIndex(c => c.id === clientData.id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...clientData };
        }
    } else {
        // Add new client
        clientData.id = Date.now();
        clientData.createdAt = new Date().toISOString();
        clients.push(clientData);
    }
    
    clientData.updatedAt = new Date().toISOString();
    
    if (saveClients()) {
        renderClients(clients);
        closeModal();
        return true;
    }
    return false;
}

// Delete a client
function deleteClient(clientId) {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
        const index = clients.findIndex(c => c.id === clientId);
        if (index !== -1) {
            // Check if this client has any associated profiles
            const profiles = JSON.parse(localStorage.getItem('sulaProfiles') || '[]');
            const hasProfiles = profiles.some(profile => profile.clientId === clientId);
            
            if (hasProfiles && !confirm('Este cliente possui perfis de medição associados. Deseja excluí-lo mesmo assim? Os perfis não serão removidos, mas ficarão sem vínculo com o cliente.')) {
                return;
            }
            
            clients.splice(index, 1);
            if (saveClients()) {
                renderClients(clients);
            }
        }
    }
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
    clientForm.reset();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Add client button
    addClientBtn.addEventListener('click', openAddClientModal);
    
    // Close modal buttons
    closeModalBtn.addEventListener('click', closeModal);
    cancelClientBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form submission
    clientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const clientData = {
            id: isEditing ? parseInt(clientIdInput.value) : null,
            name: clientNameInput.value.trim(),
            phone: clientPhoneInput.value.trim(),
            email: clientEmailInput.value.trim(),
            notes: clientNotesInput.value.trim(),
            updatedAt: new Date().toISOString()
        };
        
        if (!clientData.name) {
            alert('Por favor, insira o nome do cliente.');
            return;
        }
        
        saveClient(clientData);
    });
    
    // Search functionality
    clientSearch.addEventListener('input', (e) => {
        filterClients(e.target.value);
    });
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Close modal with Escape key
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
        
        // Focus search input with Ctrl+F or Cmd+F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            clientSearch.focus();
        }
    });
}

// Add some basic styles for the modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }
    
    .modal-content {
        background-color: var(--color-background);
        border-radius: var(--border-radius-md);
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid var(--color-border);
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--color-text);
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--color-text);
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .form-control {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        font-size: 1rem;
        background-color: var(--color-background);
        color: var(--color-text);
    }
    
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 0.9rem;
        transition: background-color 0.2s;
    }
    
    .btn-primary {
        background-color: var(--color-primary);
        color: white;
    }
    
    .btn-primary:hover {
        background-color: var(--color-primary-dark);
    }
    
    .btn-outline {
        background: none;
        border: 1px solid var(--color-border);
        color: var(--color-text);
    }
    
    .btn-outline:hover {
        background-color: var(--color-surface);
    }
`;

document.head.appendChild(modalStyles);
