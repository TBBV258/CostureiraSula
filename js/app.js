document.addEventListener('DOMContentLoaded', () => {
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const profileNameInput = document.getElementById('profileName');
    const measurementInputs = document.querySelectorAll('input[type="number"]');

    // Function to save measurements to localStorage
    const saveMeasurements = () => {
        const profileName = profileNameInput.value.trim();
        if (!profileName) {
            alert('Por favor, insira um nome para o perfil.');
            return;
        }

        const measurements = {};
        measurementInputs.forEach(input => {
            measurements[input.id] = input.value;
        });

        let profiles = JSON.parse(localStorage.getItem('sewingProfiles')) || {};
        profiles[profileName] = measurements;
        localStorage.setItem('sewingProfiles', JSON.stringify(profiles));

        alert(`Perfil "${profileName}" salvo com sucesso!`);
        loadProfiles(); // Refresh profiles list
    };

    // Function to load profiles into a dropdown/list (to be created in HTML)
    const loadProfiles = () => {
        const profiles = JSON.parse(localStorage.getItem('sewingProfiles')) || {};
        const profileSelector = document.getElementById('profileSelector'); // Assuming a selector element exists

        if (profileSelector) {
            profileSelector.innerHTML = '<option>Selecione um perfil</option>';
            for (const profileName in profiles) {
                const option = document.createElement('option');
                option.value = profileName;
                option.textContent = profileName;
                profileSelector.appendChild(option);
            }
        }
    };

    // Function to populate form with selected profile's measurements
    const populateForm = (profileName) => {
        const profiles = JSON.parse(localStorage.getItem('sewingProfiles')) || {};
        const measurements = profiles[profileName];
        if (measurements) {
            measurementInputs.forEach(input => {
                if (measurements[input.id]) {
                    input.value = measurements[input.id];
                }
            });
            profileNameInput.value = profileName;
        }
    };

    // Function to delete a profile
    const deleteProfile = (profileName) => {
        let profiles = JSON.parse(localStorage.getItem('sewingProfiles')) || {};
        if (profiles[profileName]) {
            delete profiles[profileName];
            localStorage.setItem('sewingProfiles', JSON.stringify(profiles));
            alert(`Perfil "${profileName}" deletado!`);
            loadProfiles(); // Refresh profiles list
        }
    };


    // Event Listeners
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveMeasurements);
    }

    const profileSelector = document.getElementById('profileSelector');
    if (profileSelector) {
        profileSelector.addEventListener('change', (e) => {
            if (e.target.value && e.target.value !== 'Selecione um perfil') {
                populateForm(e.target.value);
            }
        });
    }

    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', () => {
            const selectedProfile = profileSelector.value;
            if (selectedProfile && selectedProfile !== 'Selecione um perfil') {
                if (confirm(`Tem certeza que deseja deletar o perfil "${selectedProfile}"?`)) {
                    deleteProfile(selectedProfile);
                }
            } else {
                alert('Por favor, selecione um perfil para deletar.');
            }
        });
    }

    // Initial load of profiles
    loadProfiles();

    // Generate pattern on save/continue
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            console.log('Save button clicked');
            generateAndDisplayPattern();
        });
    }
});

function generateAndDisplayPattern() {
    console.log('generateAndDisplayPattern called');
    const measurements = {};
    document.querySelectorAll('input[type="number"]').forEach(input => {
        // FreeSewing expects measurements in mm, but let's keep it simple for now and assume cm = mm for the API
        measurements[input.id] = parseFloat(input.value);
    });

    // Basic validation
    if (!measurements.bust || !measurements.waist || !measurements.hip) {
        alert('Por favor, preencha pelo menos as medidas de busto, cintura e quadril.');
        return;
    }

    try {
        console.log('Generating pattern with measurements:', measurements);
        // Using a default pattern for now, e.g., 'breanna' body block
        // Note: FreeSewing patterns often require specific measurements.
        // This is a simplified example.
        const pattern = new window.patterns.breanna({
            measurements: {
                chest: measurements.bust,
                waist: measurements.waist,
                hips: measurements.hip
            }
        });

        const svg = pattern.draft().render();
        console.log('Pattern generated, SVG length:', svg.length);
        const patternPreview = document.getElementById('patternPreview');
        if (patternPreview) {
            patternPreview.innerHTML = svg;
            console.log('SVG injected into patternPreview');
        }
    } catch (error) {
        console.error("Erro ao gerar o molde:", error);
        alert("Não foi possível gerar o molde. Verifique as medidas inseridas.");
    }
}
