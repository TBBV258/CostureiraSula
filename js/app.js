document.addEventListener('DOMContentLoaded', () => {
    const clientList = document.getElementById('client-list');
    const saveClientBtn = document.getElementById('saveClientBtn');
    const deleteClientBtn = document.getElementById('deleteClientBtn');
    const clientNameInput = document.getElementById('clientName');
    const formTitle = document.getElementById('form-title');
    const measurementsForm = document.getElementById('measurements-form');
    const themeToggle = document.getElementById('theme-toggle');

    // --- Lógica do Tema (Dark Mode) ---
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
            }
        });
    }

    // --- Lógica de Gestão de Clientes ---
    let clients = JSON.parse(localStorage.getItem('clients')) || {};
    let currentClientId = new URLSearchParams(window.location.search).get('id');

    const renderClientList = () => {
        if (!clientList) return;
        clientList.innerHTML = '';
        if (Object.keys(clients).length === 0) {
            clientList.innerHTML = '<p>Nenhum cliente salvo ainda.</p>';
            return;
        }
        for (const id in clients) {
            const client = clients[id];
            const clientCard = document.createElement('a');
            clientCard.href = `cliente.html?id=${id}`;
            clientCard.className = 'block bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition';
            clientCard.innerHTML = `
                <h3 class="font-bold text-lg">${client.name}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">Clique para ver/editar</p>
            `;
            clientList.appendChild(clientCard);
        }
    };

    const saveClient = () => {
        const name = clientNameInput.value.trim();
        if (!name) {
            alert('Por favor, insira o nome do cliente.');
            return;
        }
        const id = currentClientId || Date.now().toString();
        const measurements = {};
        measurementsForm.querySelectorAll('input').forEach(input => {
            measurements[input.id] = input.value;
        });
        clients[id] = { name, measurements };
        localStorage.setItem('clients', JSON.stringify(clients));
        alert('Cliente salvo com sucesso!');
        window.location.href = 'index.html';
    };

    const deleteClient = () => {
        if (currentClientId && clients[currentClientId]) {
            if (confirm(`Tem certeza que deseja apagar o cliente "${clients[currentClientId].name}"?`)) {
                delete clients[currentClientId];
                localStorage.setItem('clients', JSON.stringify(clients));
                alert('Cliente apagado com sucesso!');
                window.location.href = 'index.html';
            }
        }
    };

    const loadClientForEditing = () => {
        if (currentClientId && clients[currentClientId]) {
            const client = clients[currentClientId];
            formTitle.textContent = `Editar Cliente: ${client.name}`;
            clientNameInput.value = client.name;
            for (const key in client.measurements) {
                const input = document.getElementById(key);
                if (input) {
                    input.value = client.measurements[key];
                }
            }
            if (deleteClientBtn) deleteClientBtn.classList.remove('hidden');
        }
    };

    // --- Inicialização ---
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        renderClientList();
    }

    if (window.location.pathname.endsWith('cliente.html')) {
        if (saveClientBtn) saveClientBtn.addEventListener('click', saveClient);
        if (deleteClientBtn) deleteClientBtn.addEventListener('click', deleteClient);
        loadClientForEditing();
    }
});
