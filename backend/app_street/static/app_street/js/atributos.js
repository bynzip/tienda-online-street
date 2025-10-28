// Función para obtener el token CSRF de las cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');
const API_URL = '/api/';

// --- MANEJO PARA AÑADIR NUEVOS ATRIBUTOS ---
document.querySelectorAll('.add-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const endpoint = e.target.dataset.endpoint;
        const input = e.target.querySelector('.entrada');
        const nombre = input.value;
        const button = e.target.querySelector('button');
        button.disabled = true; 

        try {
            const response = await fetch(`${API_URL}${endpoint}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify({ nombre: nombre })
            });
            if (response.ok) { 
                location.reload(); 
            } else { 
                alert('Error al crear. ¿Ya iniciaste sesión?'); 
                button.disabled = false; 
            }
        } catch (err) { 
            alert('Error de conexión.'); 
            button.disabled = false; 
        }
    });
});

// --- MANEJO PARA EDITAR Y ELIMINAR ATRIBUTOS ---
document.querySelectorAll('.attribute-list').forEach(list => {
    list.addEventListener('click', async (e) => {
        
        const button = e.target;
        const endpoint = list.dataset.endpoint;
        const id = button.dataset.id;

        // --- Lógica de EDICIÓN ---
        if (button.classList.contains('edit-btn')) {
            const nombreActual = button.dataset.nombre;
            const nuevoNombre = prompt('Editar nombre:', nombreActual);

            // Si el usuario cancela (null) o no cambia el nombre, no hacer nada
            if (!nuevoNombre || nuevoNombre === nombreActual) {
                return;
            }

            button.disabled = true; // Deshabilitar botón
            try {
                const response = await fetch(`${API_URL}${endpoint}/${id}/`, {
                    method: 'PUT', // o 'PATCH'
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                    body: JSON.stringify({ nombre: nuevoNombre })
                });
                if (response.ok) { 
                    location.reload(); 
                } else { 
                    alert('Error al editar.'); 
                    button.disabled = false; 
                }
            } catch (err) { 
                alert('Error de conexión.'); 
                button.disabled = false; 
            }
        }

        // --- Lógica de ELIMINACIÓN ---
        if (button.classList.contains('delete-btn')) {
            if (!confirm('¿Seguro que quieres eliminar?')) return;

            button.disabled = true; // Deshabilitar botón
            try {
                const response = await fetch(`${API_URL}${endpoint}/${id}/`, {
                    method: 'DELETE',
                    headers: { 'X-CSRFToken': csrftoken }
                });
                if (response.ok) { 
                    location.reload(); 
                } else { 
                    alert('Error al eliminar. ¿Ya iniciaste sesión?'); 
                    button.disabled = false; 
                }
            } catch (err) { 
                alert('Error de conexión.'); 
                button.disabled = false; 
            }
        }
    });
});