const API_URL = './';

async function obtenerTableros() {
    const response = await fetch(API_URL + 'get_tableros.php');
    const result = await response.json();
    return result.success ? result.tableros : [];
}

async function guardarTablero(tablero) {
    try {
        const response = await fetch(API_URL + 'crear_tablero.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tablero)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            console.error('Error del servidor:', result.message);
            alert('Error: ' + result.message);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error en guardarTablero:', error);
        alert('Error de conexión: ' + error.message);
        return false;
    }
}

async function eliminarTableroAPI(id) {
    const response = await fetch(API_URL + 'eliminar_tablero.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const result = await response.json();
    return result.success;
}

async function renderizarTableros() {
    const contenedor = document.getElementById('lista-tableros');
    if (!contenedor) return;

    const tableros = await obtenerTableros();
    contenedor.innerHTML = '';

    if (tableros.length === 0) {
        contenedor.innerHTML = '<p>No hay tableros creados. ¡Crea uno!</p>';
        return;
    }

    tableros.forEach(t => {
        const card = document.createElement('div');
        card.className = 'tablero-card';
        card.dataset.id = t.id;

        const titulo = document.createElement('h3');
        titulo.textContent = t.nombre;
        
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn-eliminar-tablero';
        btnEliminar.innerHTML = '✖';
        btnEliminar.addEventListener('click', (e) => {
            e.stopPropagation();
            mostrarModalEliminar(t.id, t.nombre);
        });

        card.appendChild(titulo);
        card.appendChild(btnEliminar);

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-eliminar-tablero')) return;
            window.location.href = `board.html?id=${t.id}`;
        });

        contenedor.appendChild(card);
    });
}

let tableroAEliminar = null;

function mostrarModalEliminar(id, nombre) {
    tableroAEliminar = id;
    const mensajeElem = document.getElementById('mensajeEliminar');
    if (mensajeElem) mensajeElem.textContent = `¿Estás seguro de eliminar el tablero "${nombre}"?`;
    document.getElementById('modalEliminar').style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', function() {
    const modalCrear = document.getElementById('modalCrear');
    const btnAbrir = document.getElementById('btnAbrirModal');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnCrear = document.getElementById('btnCrearTablero');
    const tituloInput = document.getElementById('titulo');
    const errorTitulo = document.getElementById('error-titulo');

    btnAbrir.addEventListener('click', () => modalCrear.style.display = 'flex');
    btnCancelar.addEventListener('click', () => {
        modalCrear.style.display = 'none';
        tituloInput.value = '';
        errorTitulo.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === modalCrear) {
            modalCrear.style.display = 'none';
            tituloInput.value = '';
            errorTitulo.style.display = 'none';
        }
    });

    btnCrear.addEventListener('click', async () => {
        const titulo = tituloInput.value.trim();
        if (!titulo) {
            errorTitulo.style.display = 'block';
            return;
        }
        errorTitulo.style.display = 'none';

        const nuevoTablero = {
            id: Date.now().toString(),
            nombre: titulo,
            fondo: '#0079bf',
            visibilidad: 'workspace'
        };

        console.log('Enviando tablero:', nuevoTablero);
        const ok = await guardarTablero(nuevoTablero);
        
        if (ok) {
            console.log('Redirigiendo a board.html con id:', nuevoTablero.id);
            window.location.href = `board.html?id=${nuevoTablero.id}`;
        }
    });

    const modalEliminar = document.getElementById('modalEliminar');
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');

    btnConfirmarEliminar.addEventListener('click', async () => {
        if (tableroAEliminar) {
            await eliminarTableroAPI(tableroAEliminar);
            await renderizarTableros();
            modalEliminar.style.display = 'none';
            tableroAEliminar = null;
        }
    });

    btnCancelarEliminar.addEventListener('click', () => {
        modalEliminar.style.display = 'none';
        tableroAEliminar = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modalEliminar) {
            modalEliminar.style.display = 'none';
            tableroAEliminar = null;
        }
    });

    renderizarTableros();
});