// DOM Elements
const modelsGrid = document.getElementById('models-grid');
const noModelsMessage = document.getElementById('no-models');
const modelForm = document.getElementById('model-form');
const modelSearch = document.getElementById('model-search');
const addModelBtn = document.getElementById('add-model-btn');
const modal = document.getElementById('model-form-modal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelModelBtn = document.getElementById('cancel-model');
const modalTitle = document.getElementById('modal-title');
const imagePreview = document.getElementById('image-preview');
const modelImageInput = document.getElementById('model-image');

// Form fields
const modelIdInput = document.getElementById('model-id');
const modelNameInput = document.getElementById('model-name');
const modelCategoryInput = document.getElementById('model-category');
const modelDifficultyInput = document.getElementById('model-difficulty');
const modelStatusInput = document.getElementById('model-status');
const modelDescriptionInput = document.getElementById('model-description');
const modelNotesInput = document.getElementById('model-notes');

// Filter elements
const categoryFilter = document.getElementById('category-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const statusFilter = document.getElementById('status-filter');
const sortSelect = document.getElementById('sort-models');

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');

// App State
let models = [];
let isEditing = false;
let currentImageFile = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadModels();
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
    const icon = themeToggle?.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Load models from localStorage
function loadModels() {
    const savedModels = localStorage.getItem('sulaModels');
    if (savedModels) {
        try {
            models = JSON.parse(savedModels);
            renderModels(models);
        } catch (e) {
            console.error('Error loading models:', e);
            alert('Erro ao carregar os modelos. Os dados podem estar corrompidos.');
            models = [];
            localStorage.removeItem('sulaModels');
        }
    }
}

// Save models to localStorage
function saveModels() {
    try {
        localStorage.setItem('sulaModels', JSON.stringify(models));
        return true;
    } catch (e) {
        console.error('Error saving models:', e);
        alert('Erro ao salvar os modelos. O armazenamento pode estar cheio.');
        return false;
    }
}

// Render models in the grid
function renderModels(modelsToRender) {
    if (!modelsToRender || modelsToRender.length === 0) {
        noModelsMessage.style.display = 'block';
        modelsGrid.innerHTML = '';
        modelsGrid.appendChild(noModelsMessage);
        return;
    }
    
    noModelsMessage.style.display = 'none';
    
    // Clear the grid
    modelsGrid.innerHTML = '';
    
    // Create and append model cards
    modelsToRender.forEach(model => {
        const modelCard = document.createElement('div');
        modelCard.className = 'model-card';
        modelCard.dataset.id = model.id;
        
        // Format date
        const formattedDate = new Date(model.createdAt).toLocaleDateString('pt-BR');
        
        // Get status color
        const statusColors = {
            'rascunho': '#95a5a6',
            'testado': '#3498db',
            'finalizado': '#2ecc71'
        };
        
        // Get difficulty text
        const difficultyText = {
            'facil': 'Fácil',
            'medio': 'Médio',
            'dificil': 'Difícil',
            'expert': 'Especialista'
        };
        
        modelCard.innerHTML = `
            <img src="${model.imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}" alt="${model.name}" class="model-image">
            <div class="model-details">
                <span class="model-category" style="background-color: ${statusColors[model.status] || '#95a5a6'}">
                    ${model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                </span>
                <h3 class="model-name">${model.name}</h3>
                <p class="model-description">${model.description || 'Sem descrição'}</p>
                <div class="model-stats">
                    <span class="stat"><i class="fas fa-layer-group"></i> ${model.category}</span>
                    <span class="stat"><i class="fas fa-tachometer-alt"></i> ${difficultyText[model.difficulty] || model.difficulty}</span>
                </div>
            </div>
            <div class="model-actions">
                <span class="model-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <div class="action-buttons">
                    <button class="btn-edit edit-model" data-id="${model.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete delete-model" data-id="${model.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        modelsGrid.appendChild(modelCard);
    });
    
    // Add event listeners to the new buttons
    addModelEventListeners();
}

// Add event listeners to model cards
function addModelEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-model').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modelId = parseInt(btn.dataset.id);
            editModel(modelId);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-model').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modelId = parseInt(btn.dataset.id);
            deleteModel(modelId);
        });
    });
    
    // Click on card to view details
    document.querySelectorAll('.model-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Only navigate if the click wasn't on a button
            if (!e.target.closest('button')) {
                const modelId = parseInt(card.dataset.id);
                // In a real app, you might want to show a detailed view
                console.log('View model details:', modelId);
            }
        });
    });
}

// Filter and sort models based on current filters
function filterAndSortModels() {
    const searchTerm = modelSearch.value.toLowerCase();
    const category = categoryFilter.value;
    const difficulty = difficultyFilter.value;
    const status = statusFilter.value;
    const sortBy = sortSelect.value;
    
    let filteredModels = [...models];
    
    // Apply filters
    if (searchTerm) {
        filteredModels = filteredModels.filter(model => 
            model.name.toLowerCase().includes(searchTerm) ||
            (model.description && model.description.toLowerCase().includes(searchTerm)) ||
            (model.notes && model.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    if (category) {
        filteredModels = filteredModels.filter(model => model.category === category);
    }
    
    if (difficulty) {
        filteredModels = filteredModels.filter(model => model.difficulty === difficulty);
    }
    
    if (status) {
        filteredModels = filteredModels.filter(model => model.status === status);
    }
    
    // Apply sorting
    filteredModels.sort((a, b) => {
        switch (sortBy) {
            case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            default:
                return 0;
        }
    });
    
    renderModels(filteredModels);
}

// Open modal for adding a new model
function openAddModelModal() {
    isEditing = false;
    modelForm.reset();
    modelIdInput.value = '';
    modalTitle.textContent = 'Novo Modelo';
    imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Arraste uma imagem ou clique para selecionar</span>';
    currentImageFile = null;
    modal.style.display = 'flex';
    modelNameInput.focus();
}

// Open modal for editing a model
function editModel(modelId) {
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    isEditing = true;
    modelIdInput.value = model.id;
    modelNameInput.value = model.name;
    modelCategoryInput.value = model.category;
    modelDifficultyInput.value = model.difficulty;
    modelStatusInput.value = model.status;
    modelDescriptionInput.value = model.description || '';
    modelNotesInput.value = model.notes || '';
    
    // Set image preview if exists
    if (model.imageUrl) {
        imagePreview.innerHTML = `<img src="${model.imageUrl}" alt="${model.name}" style="max-width: 100%; max-height: 200px;">`;
    } else {
        imagePreview.innerHTML = '<i class="fas fa-cloud-upload-alt"></i><span>Arraste uma imagem ou clique para selecionar</span>';
    }
    
    modalTitle.textContent = 'Editar Modelo';
    modal.style.display = 'flex';
    modelNameInput.focus();
}

// Save model (add new or update existing)
function saveModel(modelData) {
    // Handle image (in a real app, you would upload this to a server)
    if (currentImageFile) {
        // For demo purposes, we'll just create a data URL
        // In a real app, you would upload the file to a server
        const reader = new FileReader();
        reader.onload = function(e) {
            modelData.imageUrl = e.target.result;
            saveModelData(modelData);
        };
        reader.readAsDataURL(currentImageFile);
    } else if (isEditing && !modelData.imageUrl) {
        // Keep existing image if editing and no new image was selected
        const existingModel = models.find(m => m.id === modelData.id);
        if (existingModel && existingModel.imageUrl) {
            modelData.imageUrl = existingModel.imageUrl;
        }
        saveModelData(modelData);
    } else {
        saveModelData(modelData);
    }
}

// Save model data after image handling
function saveModelData(modelData) {
    if (isEditing) {
        // Update existing model
        const index = models.findIndex(m => m.id === modelData.id);
        if (index !== -1) {
            models[index] = { ...models[index], ...modelData, updatedAt: new Date().toISOString() };
        }
    } else {
        // Add new model
        modelData.id = Date.now();
        modelData.createdAt = new Date().toISOString();
        modelData.updatedAt = new Date().toISOString();
        models.push(modelData);
    }
    
    if (saveModels()) {
        filterAndSortModels();
        closeModal();
        return true;
    }
    return false;
}

// Delete a model
function deleteModel(modelId) {
    if (confirm('Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.')) {
        const index = models.findIndex(m => m.id === modelId);
        if (index !== -1) {
            models.splice(index, 1);
            if (saveModels()) {
                filterAndSortModels();
            }
        }
    }
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
    modelForm.reset();
    currentImageFile = null;
}

// Handle image selection
function handleImageSelect(file) {
    if (file) {
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione um arquivo de imagem válido.');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem não pode ter mais de 5MB.');
            return;
        }
        
        currentImageFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Add model button
    if (addModelBtn) {
        addModelBtn.addEventListener('click', openAddModelModal);
    }
    
    // Close modal buttons
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    if (cancelModelBtn) {
        cancelModelBtn.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside the modal content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Form submission
    if (modelForm) {
        modelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const modelData = {
                id: isEditing ? parseInt(modelIdInput.value) : null,
                name: modelNameInput.value.trim(),
                category: modelCategoryInput.value,
                difficulty: modelDifficultyInput.value,
                status: modelStatusInput.value,
                description: modelDescriptionInput.value.trim(),
                notes: modelNotesInput.value.trim(),
                updatedAt: new Date().toISOString()
            };
            
            if (!modelData.name) {
                alert('Por favor, insira o nome do modelo.');
                return;
            }
            
            if (!modelData.category) {
                alert('Por favor, selecione uma categoria.');
                return;
            }
            
            saveModel(modelData);
        });
    }
    
    // Search functionality
    if (modelSearch) {
        modelSearch.addEventListener('input', filterAndSortModels);
    }
    
    // Filter changes
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndSortModels);
    }
    
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', filterAndSortModels);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAndSortModels);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', filterAndSortModels);
    }
    
    // Image upload handling
    if (imagePreview && modelImageInput) {
        // Click on preview to open file dialog
        imagePreview.addEventListener('click', () => {
            modelImageInput.click();
        });
        
        // Handle file selection
        modelImageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleImageSelect(e.target.files[0]);
            }
        });
        
        // Handle drag and drop
        imagePreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            imagePreview.classList.add('drag-over');
        });
        
        imagePreview.addEventListener('dragleave', () => {
            imagePreview.classList.remove('drag-over');
        });
        
        imagePreview.addEventListener('drop', (e) => {
            e.preventDefault();
            imagePreview.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleImageSelect(e.dataTransfer.files[0]);
            }
        });
    }
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Close modal with Escape key
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
        
        // Focus search input with Ctrl+F or Cmd+F
        if ((e.ctrlKey || e.metaKey) && e.key === 'f' && modelSearch) {
            e.preventDefault();
            modelSearch.focus();
        }
        
        // Add new model with Ctrl+N or Cmd+N
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && addModelBtn) {
            e.preventDefault();
            openAddModelModal();
        }
    });
}

// Add some basic styles for the modal and other UI elements
const styles = document.createElement('style');
styles.textContent = `
    /* Modal styles */
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
        overflow-y: auto;
    }
    
    .modal-content {
        background-color: var(--color-background);
        border-radius: var(--border-radius-md);
        width: 100%;
        max-width: 600px;
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
        position: sticky;
        top: 0;
        background-color: var(--color-background);
        z-index: 10;
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
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-row {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: var(--color-text);
    }
    
    .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--color-border);
        border-radius: var(--border-radius-sm);
        font-size: 1rem;
        background-color: var(--color-background);
        color: var(--color-text);
    }
    
    textarea.form-control {
        min-height: 100px;
        resize: vertical;
    }
    
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid var(--color-border);
    }
    
    /* Image upload */
    .image-upload {
        margin-top: 10px;
    }
    
    .image-preview {
        width: 100%;
        height: 200px;
        border: 2px dashed var(--color-border);
        border-radius: var(--border-radius-sm);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 20px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .image-preview:hover, .image-preview.drag-over {
        border-color: var(--color-primary);
        background-color: rgba(74, 144, 226, 0.05);
    }
    
    .image-preview i {
        font-size: 2.5rem;
        color: var(--color-text-secondary);
        margin-bottom: 10px;
    }
    
    .image-preview span {
        color: var(--color-text-secondary);
        font-size: 0.9rem;
    }
    
    .file-input {
        display: none;
    }
    
    /* Buttons */
    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
    
    .btn-edit {
        background: none;
        border: none;
        color: var(--color-primary);
        cursor: pointer;
        padding: 5px;
        font-size: 1rem;
    }
    
    .btn-delete {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        padding: 5px;
        font-size: 1rem;
    }
    
    /* Action buttons in model cards */
    .action-buttons {
        display: flex;
        gap: 5px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .form-row {
            flex-direction: column;
            gap: 15px;
        }
        
        .form-actions {
            flex-direction: column-reverse;
        }
        
        .btn {
            width: 100%;
            justify-content: center;
        }
    }
`;

document.head.appendChild(styles);
