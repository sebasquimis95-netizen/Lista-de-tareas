const API_URL = './';

const urlParams = new URLSearchParams(window.location.search);
const boardId = urlParams.get('id');

if (!boardId) {
    window.location.href = 'index.html';
}

let tablero = { nombre: '', listas: [] };
let listaConFormulario = null;
const listsContainer = document.getElementById('lists-container');

async function cargarTablero() {
    try {
        const responseTablero = await fetch(API_URL + 'get_tableros.php');
        const resultTablero = await responseTablero.json();
        const tableros = resultTablero.tableros || [];
        const tableroInfo = tableros.find(t => t.id === boardId);
        
        if (!tableroInfo) {
            window.location.href = 'index.html';
            return;
        }
        
        document.getElementById('board-title').textContent = tableroInfo.nombre;
        tablero.nombre = tableroInfo.nombre;

        const responseListas = await fetch(`${API_URL}get_listas.php?tablero_id=${boardId}`);
        const resultListas = await responseListas.json();
        tablero.listas = resultListas.listas || [];
    } catch (error) {
        console.error('Error al cargar el tablero:', error);
    }
}

async function guardarTableroActualizado() {
    const listasParaEnviar = tablero.listas.map(lista => ({
        nombre: lista.nombre,
        tarjetas: lista.tarjetas.map(t => ({ texto: t.texto || t }))
    }));

    try {
        await fetch(API_URL + 'guardar_listas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tablero_id: boardId,
                listas: listasParaEnviar
            })
        });
    } catch (error) {
        console.error('Error al guardar:', error);
    }
}

function renderizarBoard() {
    if (!listsContainer) return;
    listsContainer.innerHTML = '';

    tablero.listas.forEach((lista, indexLista) => {
        const listDiv = document.createElement('div');
        listDiv.className = 'list';
        listDiv.dataset.index = indexLista;

        const header = document.createElement('div');
        header.className = 'list-header';
        header.innerHTML = `
            <h3>${lista.nombre}</h3>
            <button class="delete-list" data-index="${indexLista}" title="Eliminar lista">✖</button>
        `;
        listDiv.appendChild(header);

        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards-container';
        if (lista.tarjetas && lista.tarjetas.length > 0) {
            lista.tarjetas.forEach((tarjeta, indexTarjeta) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.lista = indexLista;
                card.dataset.tarjeta = indexTarjeta;

                const textSpan = document.createElement('span');
                textSpan.className = 'card-text';
                textSpan.textContent = tarjeta.texto || tarjeta;
                textSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    editarTarjeta(indexLista, indexTarjeta);
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-card';
                deleteBtn.innerHTML = '✖';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    eliminarTarjeta(indexLista, indexTarjeta);
                });

                card.appendChild(textSpan);
                card.appendChild(deleteBtn);
                cardsDiv.appendChild(card);
            });
        }
        listDiv.appendChild(cardsDiv);

        const addZone = document.createElement('div');
        addZone.className = 'add-zone';

        if (listaConFormulario === indexLista) {
            const form = document.createElement('div');
            form.className = 'new-card-form';
            form.innerHTML = `
                <textarea placeholder="Introduce un título o pega un enlace" id="new-card-text-${indexLista}"></textarea>
                <div class="form-buttons">
                    <button class="add-card-btn" data-lista="${indexLista}">Añadir tarjeta</button>
                    <button class="cancel-btn" data-lista="${indexLista}">Cancelar</button>
                </div>
            `;
            addZone.appendChild(form);
            setTimeout(() => {
                document.getElementById(`new-card-text-${indexLista}`)?.focus();
            }, 0);
        } else {
            const addBtn = document.createElement('button');
            addBtn.className = 'add-card';
            addBtn.textContent = '+ Añade una tarjeta';
            addBtn.addEventListener('click', () => {
                listaConFormulario = indexLista;
                renderizarBoard();
            });
            addZone.appendChild(addBtn);
        }

        listDiv.appendChild(addZone);
        listsContainer.appendChild(listDiv);
    });

    const addListDiv = document.createElement('div');
    addListDiv.className = 'add-list';
    const addListBtn = document.createElement('button');
    addListBtn.textContent = 'Añade otra lista';
    addListBtn.addEventListener('click', () => {
        openAddListModal();
    });
    addListDiv.appendChild(addListBtn);
    listsContainer.appendChild(addListDiv);
}

listsContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('add-card-btn')) {
        const listaIndex = e.target.dataset.lista;
        const textarea = document.getElementById(`new-card-text-${listaIndex}`);
        if (!textarea) return;
        const texto = textarea.value.trim();
        if (texto === '') {
            alert('La tarjeta no puede estar vacía.');
            return;
        }
        tablero.listas[listaIndex].tarjetas.push({ texto });
        await guardarTableroActualizado();
        listaConFormulario = null;
        renderizarBoard();
    }

    if (e.target.classList.contains('cancel-btn')) {
        listaConFormulario = null;
        renderizarBoard();
    }
});

async function editarTarjeta(indexLista, indexTarjeta) {
    const textoActual = tablero.listas[indexLista].tarjetas[indexTarjeta].texto || tablero.listas[indexLista].tarjetas[indexTarjeta];
    const nuevoTexto = prompt('Editar tarjeta:', textoActual);
    if (nuevoTexto !== null && nuevoTexto.trim() !== '') {
        tablero.listas[indexLista].tarjetas[indexTarjeta] = { texto: nuevoTexto.trim() };
        await guardarTableroActualizado();
        renderizarBoard();
    } else if (nuevoTexto !== null && nuevoTexto.trim() === '') {
        alert('La tarjeta no puede estar vacía.');
    }
}

async function eliminarTarjeta(indexLista, indexTarjeta) {
    tablero.listas[indexLista].tarjetas.splice(indexTarjeta, 1);
    await guardarTableroActualizado();
    renderizarBoard();
}

async function eliminarLista(indexLista) {
    tablero.listas.splice(indexLista, 1);
    await guardarTableroActualizado();
    if (listaConFormulario === indexLista) listaConFormulario = null;
    renderizarBoard();
}

let addListModal, addListInput, addListError, cancelAddList, confirmAddList;
let deleteListModal, modalMessage, cancelDelete, confirmDelete;

function openAddListModal() {
    if (!addListModal) return;
    addListInput.value = '';
    if (addListError) addListError.textContent = '';
    addListModal.style.display = 'flex';
    addListInput.focus();
}

function closeAddListModal() {
    if (addListModal) addListModal.style.display = 'none';
}

let listToDeleteIndex = null;

function openDeleteModal(index) {
    if (!deleteListModal) return;
    listToDeleteIndex = index;
    const listTitle = tablero.listas[index]?.nombre || 'esta lista';
    if (modalMessage) modalMessage.innerText = `¿Eliminar "${listTitle}" y todas sus tarjetas?`;
    deleteListModal.style.display = 'flex';
}

function closeDeleteModal() {
    if (deleteListModal) deleteListModal.style.display = 'none';
    listToDeleteIndex = null;
}

document.addEventListener('DOMContentLoaded', async function() {
    addListModal = document.getElementById('addListModal');
    addListInput = document.getElementById('new-list-name');
    addListError = document.getElementById('addListError');
    cancelAddList = document.getElementById('cancelAddList');
    confirmAddList = document.getElementById('confirmAddList');

    deleteListModal = document.getElementById('deleteListModal');
    modalMessage = document.getElementById('modalMessage');
    cancelDelete = document.getElementById('cancelDelete');
    confirmDelete = document.getElementById('confirmDelete');

    if (cancelAddList) {
        cancelAddList.addEventListener('click', closeAddListModal);
    }
    if (confirmAddList) {
        confirmAddList.addEventListener('click', async () => {
            const listName = addListInput.value.trim();
            if (listName === '') {
                if (addListError) {
                    addListError.textContent = 'El nombre no puede estar vacío';
                } else {
                    alert('El nombre no puede estar vacío');
                }
                addListInput.focus();
                return;
            }

            tablero.listas.push({ nombre: listName, tarjetas: [] });
            await guardarTableroActualizado();
            listaConFormulario = null;
            renderizarBoard();
            closeAddListModal();
        });
    }
    if (addListModal) {
        addListModal.addEventListener('click', (e) => {
            if (e.target === addListModal) {
                closeAddListModal();
            }
        });
    }

    document.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-list');
        if (deleteButton) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            const index = deleteButton.dataset.index;
            if (index !== undefined) {
                openDeleteModal(parseInt(index));
            }
        }
    }, { capture: true });

    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            if (listToDeleteIndex !== null) {
                await eliminarLista(listToDeleteIndex);
                closeDeleteModal();
            }
        });
    }
    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeDeleteModal);
    }
    if (deleteListModal) {
        deleteListModal.addEventListener('click', (e) => {
            if (e.target === deleteListModal) {
                closeDeleteModal();
            }
        });
    }

    await cargarTablero();
    renderizarBoard();
}); 