// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const profileSelect = document.getElementById('profile-select');
const newProfileBtn = document.getElementById('new-profile');
const prevStepBtn = document.getElementById('prev-step');
const nextStepBtn = document.getElementById('next-step');
const currentStepEl = document.getElementById('current-step');
const stepContent = document.getElementById('step-content');
const exportJsonBtn = document.getElementById('export-json');
const exportPdfBtn = document.getElementById('export-pdf');
const deleteProfileBtn = document.createElement('button');

// App State
let currentStep = 1;
let profiles = [];
let currentProfile = createNewProfile();

// Initialize delete button
deleteProfileBtn.id = 'delete-profile';
deleteProfileBtn.className = 'btn btn-danger';
deleteProfileBtn.innerHTML = '<i class="fas fa-trash"></i> Apagar';
deleteProfileBtn.style.display = 'none';

// Add delete button to profile selector
document.querySelector('.profile-selector').appendChild(deleteProfileBtn);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();
    loadThemePreference();
    renderStep(currentStep);
    setupEventListeners();
});

// Create a new profile with default values
function createNewProfile() {
    return {
        id: Date.now(),
        name: 'Novo Perfil ' + (profiles.length + 1),
        measurements: {
            // General
            profileName: '',
            // Body - Upper
            neck: 0,
            shoulder: 0,
            chest: 0,
            backWidth: 0,
            armscyeDepth: 0,
            neckToBustApex: 0,
            bust: 0,
            ribCage: 0,
            bustSpan: 0,
            // Body - Waist/Hip
            waist: 0,
            frontNeckToWaist: 0,
            backNeckToWaist: 0,
            hip: 0,
            topHip: 0,
            waistToHip: 0,
            // Arms
            topArm: 0,
            wrist: 0,
            sleeveLength: 0
        },
        ease: {
            armholeDepthEase: 0,
            bustEase: 0,
            waistEase: 0,
            hipEase: 0,
            topArmEase: 0,
            sleeveCapEase: 0,
            wristEase: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// Load saved profiles from localStorage
function loadProfiles() {
    const savedProfiles = localStorage.getItem('sulaProfiles');
    if (savedProfiles) {
        try {
            profiles = JSON.parse(savedProfiles);
            renderProfileSelect();
            if (profiles.length > 0) {
                // Load the first profile by default
                currentProfile = JSON.parse(JSON.stringify(profiles[0]));
                profileSelect.value = currentProfile.id;
                deleteProfileBtn.style.display = 'inline-flex';
                renderStep(1);
            }
        } catch (e) {
            console.error('Error loading profiles:', e);
            alert('Erro ao carregar os perfis. Os dados podem estar corrompidos.');
            profiles = [];
            localStorage.removeItem('sulaProfiles');
        }
    }
}

// Save profiles to localStorage
function saveProfiles() {
    try {
        localStorage.setItem('sulaProfiles', JSON.stringify(profiles));
        return true;
    } catch (e) {
        console.error('Error saving profiles:', e);
        alert('Erro ao salvar os perfis. O armazenamento pode estar cheio.');
        return false;
    }
}

// Delete current profile
function deleteCurrentProfile() {
    if (!currentProfile || !currentProfile.id) return false;
    
    if (confirm('Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.')) {
        const index = profiles.findIndex(p => p.id === currentProfile.id);
        if (index !== -1) {
            profiles.splice(index, 1);
            if (saveProfiles()) {
                if (profiles.length > 0) {
                    // Load another profile if available
                    currentProfile = JSON.parse(JSON.stringify(profiles[0]));
                    profileSelect.value = currentProfile.id;
                    renderStep(1);
                } else {
                    // No profiles left, create a new one
                    currentProfile = createNewProfile();
                    profileSelect.value = '';
                    deleteProfileBtn.style.display = 'none';
                    renderStep(1);
                }
                renderProfileSelect();
                return true;
            }
        }
    }
    return false;
}

// Render the profile select dropdown
function renderProfileSelect() {
    const currentValue = profileSelect.value;
    profileSelect.innerHTML = '<option value="">Selecionar Perfil</option>';
    
    // Sort profiles by name
    const sortedProfiles = [...profiles].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedProfiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        if (currentProfile && profile.id === currentProfile.id) {
            option.selected = true;
        }
        profileSelect.appendChild(option);
    });
    
    // Show/hide delete button based on whether a profile is selected
    deleteProfileBtn.style.display = profileSelect.value ? 'inline-flex' : 'none';
}

// Load user's theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle between light and dark theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

// Update the theme toggle icon
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Render the current step
function renderStep(step) {
    currentStep = step;
    currentStepEl.textContent = step;
    
    // Update navigation buttons
    prevStepBtn.disabled = step === 1;
    nextStepBtn.textContent = step === 3 ? 'Salvar' : 'Próximo';
    
    // Update active step in navigation
    document.querySelectorAll('.step-item').forEach((item, index) => {
        if (index + 1 === step) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Render step content
    let content = '';
    switch (step) {
        case 1:
            content = renderStep1();
            break;
        case 2:
            content = renderStep2();
            break;
        case 3:
            content = renderStep3();
            break;
    }
    
    stepContent.innerHTML = content;
    
    // Add event listeners to the new inputs
    if (step === 1) {
        document.getElementById('profile-name').addEventListener('input', (e) => {
            currentProfile.measurements.profileName = e.target.value;
            currentProfile.name = e.target.value || `Perfil ${profiles.length + 1}`;
        });
    }
    
    // Add measurement input event listeners for step 2
    if (step === 2) {
        const measurementInputs = stepContent.querySelectorAll('input[type="number"]');
        measurementInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.name;
                const value = parseFloat(e.target.value) || 0;
                
                if (field.startsWith('ease_')) {
                    const easeField = field.replace('ease_', '');
                    currentProfile.ease[easeField] = value;
                } else {
                    currentProfile.measurements[field] = value;
                }
                
                // Update visualization if needed
                updateVisualization(field, value);
            });
        });
    }
}

// Render Step 1: Basic Information
function renderStep1() {
    return `
        <div class="step-content-inner">
            <h2>Informações Básicas</h2>
            <div class="form-group">
                <label for="profile-name" class="form-label">Nome do Perfil</label>
                <input type="text" id="profile-name" name="profileName" 
                       value="${currentProfile.measurements.profileName}" 
                       placeholder="Ex: Vestido Básico">
            </div>
            <div class="form-group">
                <label class="form-label">Data de Criação</label>
                <p>${new Date(currentProfile.createdAt).toLocaleDateString()}</p>
            </div>
            ${currentProfile.updatedAt ? `
            <div class="form-group">
                <label class="form-label">Última Atualização</label>
                <p>${new Date(currentProfile.updatedAt).toLocaleString()}</p>
            </div>` : ''}
        </div>
    `;
}

// Render Step 2: Body Measurements
function renderStep2() {
    return `
        <div class="step-content-inner">
            <h2>Medidas do Corpo</h2>
            
            <h3>Parte Superior</h3>
            <div class="measurement-grid">
                ${createMeasurementInput('Pescoço', 'neck', 'cm', currentProfile.measurements.neck)}
                ${createMeasurementInput('Ombro', 'shoulder', 'cm', currentProfile.measurements.shoulder)}
                ${createMeasurementInput('Peito (Busto)', 'chest', 'cm', currentProfile.measurements.chest)}
                ${createMeasurementInput('Largura das Costas', 'backWidth', 'cm', currentProfile.measurements.backWidth)}
                ${createMeasurementInput('Profundidade da Cava', 'armscyeDepth', 'cm', currentProfile.measurements.armscyeDepth)}
                ${createMeasurementInput('Pescoço ao Ápice do Busto', 'neckToBustApex', 'cm', currentProfile.measurements.neckToBustApex)}
                ${createMeasurementInput('Busto', 'bust', 'cm', currentProfile.measurements.bust)}
                ${createMeasurementInput('Caixa Torácica', 'ribCage', 'cm', currentProfile.measurements.ribCage)}
                ${createMeasurementInput('Envergadura do Busto', 'bustSpan', 'cm', currentProfile.measurements.bustSpan)}
            </div>
            
            <h3>Cintura/Quadril</h3>
            <div class="measurement-grid">
                ${createMeasurementInput('Cintura', 'waist', 'cm', currentProfile.measurements.waist)}
                ${createMeasurementInput('Pescoço Frontal à Cintura', 'frontNeckToWaist', 'cm', currentProfile.measurements.frontNeckToWaist)}
                ${createMeasurementInput('Pescoço Traseiro à Cintura', 'backNeckToWaist', 'cm', currentProfile.measurements.backNeckToWaist)}
                ${createMeasurementInput('Quadril', 'hip', 'cm', currentProfile.measurements.hip)}
                ${createMeasurementInput('Quadril Superior', 'topHip', 'cm', currentProfile.measurements.topHip)}
                ${createMeasurementInput('Cintura ao Quadril', 'waistToHip', 'cm', currentProfile.measurements.waistToHip)}
            </div>
            
            <h3>Braços</h3>
            <div class="measurement-grid">
                ${createMeasurementInput('Braço Superior', 'topArm', 'cm', currentProfile.measurements.topArm)}
                ${createMeasurementInput('Pulso', 'wrist', 'cm', currentProfile.measurements.wrist)}
                ${createMeasurementInput('Comprimento da Manga', 'sleeveLength', 'cm', currentProfile.measurements.sleeveLength)}
            </div>
        </div>
    `;
}

// Render Step 3: Ease
function renderStep3() {
    return `
        <div class="step-content-inner">
            <h2>Folgas (Ease)</h2>
            <p>Defina as folgas adicionais para cada medida.</p>
            
            <div class="measurement-grid">
                ${createMeasurementInput('Folga de Profundidade da Cava', 'ease_armholeDepthEase', 'cm', currentProfile.ease.armholeDepthEase)}
                ${createMeasurementInput('Folga de Busto', 'ease_bustEase', 'cm', currentProfile.ease.bustEase)}
                ${createMeasurementInput('Folga de Cintura', 'ease_waistEase', 'cm', currentProfile.ease.waistEase)}
                ${createMeasurementInput('Folga de Quadril', 'ease_hipEase', 'cm', currentProfile.ease.hipEase)}
                ${createMeasurementInput('Folga de Braço Superior', 'ease_topArmEase', 'cm', currentProfile.ease.topArmEase)}
                ${createMeasurementInput('Folga da Copa da Manga', 'ease_sleeveCapEase', 'cm', currentProfile.ease.sleeveCapEase)}
                ${createMeasurementInput('Folga de Pulso', 'ease_wristEase', 'cm', currentProfile.ease.wristEase)}
            </div>
            
            <div class="form-actions">
                <button id="save-profile" class="btn btn-primary">
                    <i class="fas fa-save"></i> Salvar Perfil
                </button>
            </div>
        </div>
    `;
}

// Create a measurement input field
function createMeasurementInput(label, name, unit, value) {
    return `
        <div class="form-group">
            <label for="${name}" class="form-label">${label}</label>
            <div class="input-group">
                <input type="number" 
                       id="${name}" 
                       name="${name}" 
                       value="${value}" 
                       min="0" 
                       step="0.1"
                       class="measurement-input">
                <span class="unit">${unit}</span>
            </div>
        </div>
    `;
}

// Update the visualization based on the selected measurement
function updateVisualization(field, value) {
    // This is a placeholder. In a real app, you would update the visualization
    // based on the selected measurement and its value.
    const visualization = document.getElementById('model-visualization');
    visualization.innerHTML = `
        <div class="model-placeholder">
            <i class="fas fa-ruler-vertical"></i>
            <h3>${field}</h3>
            <p>${value} cm</p>
        </div>
    `;
}

// Save the current profile
function saveCurrentProfile() {
    currentProfile.updatedAt = new Date().toISOString();
    
    // Check if this is an existing profile
    const existingIndex = profiles.findIndex(p => p.id === currentProfile.id);
    
    if (existingIndex >= 0) {
        // Update existing profile
        profiles[existingIndex] = { ...currentProfile };
    } else {
        // Add new profile
        profiles.push({ ...currentProfile });
    }
    
    saveProfiles();
    renderProfileSelect();
    
    // Select the current profile in the dropdown
    profileSelect.value = currentProfile.id;
    
    // Show success message
    alert('Perfil salvo com sucesso!');
}

// Export profile as JSON
function exportAsJson() {
    if (!currentProfile) return;
    
    const dataStr = JSON.stringify(currentProfile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = `perfil-${currentProfile.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Profile selection
    profileSelect.addEventListener('change', (e) => {
        const profileId = e.target.value ? parseInt(e.target.value) : null;
        if (profileId) {
            const selectedProfile = profiles.find(p => p.id === profileId);
            if (selectedProfile) {
                currentProfile = JSON.parse(JSON.stringify(selectedProfile));
                deleteProfileBtn.style.display = 'inline-flex';
                renderStep(1);
            }
        } else {
            deleteProfileBtn.style.display = 'none';
        }
    });
    
    // New profile
    newProfileBtn.addEventListener('click', () => {
        if (confirm('Deseja salvar as alterações no perfil atual antes de criar um novo?')) {
            saveCurrentProfile();
        }
        currentProfile = createNewProfile();
        profileSelect.value = '';
        deleteProfileBtn.style.display = 'none';
        renderStep(1);
    });
    
    // Delete profile
    deleteProfileBtn.addEventListener('click', () => {
        deleteCurrentProfile();
    });
    
    // Navigation
    prevStepBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            renderStep(currentStep - 1);
        }
    });
    
    nextStepBtn.addEventListener('click', () => {
        if (currentStep < 3) {
            if (validateCurrentStep()) {
                renderStep(currentStep + 1);
            }
        } else {
            if (saveCurrentProfile()) {
                // After saving, update the select to show the saved profile
                profileSelect.value = currentProfile.id;
                deleteProfileBtn.style.display = 'inline-flex';
            }
        }
    });
    
    // Step navigation
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', () => {
            const step = parseInt(item.dataset.step);
            if (step !== currentStep) {
                if (validateCurrentStep()) {
                    renderStep(step);
                }
            }
        });
    });
    
    // Export buttons
    exportJsonBtn.addEventListener('click', exportAsJson);
    exportPdfBtn.addEventListener('click', () => {
        alert('Exportar para PDF será implementado em breve!');
    });
    
    // Save button in step 3
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'save-profile' || e.target.closest('#save-profile'))) {
            if (saveCurrentProfile()) {
                // After saving, update the select to show the saved profile
                profileSelect.value = currentProfile.id;
                deleteProfileBtn.style.display = 'inline-flex';
                alert('Perfil salvo com sucesso!');
            }
        }
    });
    
    // Warn before leaving page with unsaved changes
    window.addEventListener('beforeunload', (e) => {
        // Check if there are unsaved changes
        if (hasUnsavedChanges()) {
            e.preventDefault();
            e.returnValue = 'Tem certeza que deseja sair? As alterações não salvas serão perdidas.';
            return e.returnValue;
        }
    });
}

// Check if there are unsaved changes
function hasUnsavedChanges() {
    if (!currentProfile || !currentProfile.id) return false;
    
    const savedProfile = profiles.find(p => p.id === currentProfile.id);
    if (!savedProfile) return true; // New profile not saved yet
    
    // Simple deep comparison (for our use case)
    return JSON.stringify(savedProfile) !== JSON.stringify(currentProfile);
}

// Validate current step before proceeding
function validateCurrentStep() {
    if (currentStep === 1) {
        const profileName = document.getElementById('profile-name');
        if (profileName && !profileName.value.trim()) {
            alert('Por favor, insira um nome para o perfil.');
            profileName.focus();
            return false;
        }
    }
    return true;
}

// Add some basic styles for the measurement grid
const style = document.createElement('style');
style.textContent = `
    .measurement-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }
    
    .form-actions {
        margin-top: 2rem;
        display: flex;
        justify-content: flex-end;
    }
    
    .measurement-input {
        width: 100%;
    }
    
    h3 {
        color: var(--color-primary);
        margin: 1.5rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--color-border);
    }
`;
document.head.appendChild(style);
