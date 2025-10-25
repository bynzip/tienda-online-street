document.addEventListener('DOMContentLoaded', function() {
  const productForm = document.getElementById('product-form');
  const btnAgregar = document.getElementById('btn-agregar');
  const btnEditar = document.getElementById('btn-editar');
  const btnEliminar = document.getElementById('btn-eliminar');
  const checkboxOferta = document.getElementById('en-oferta');
  const inputDescuento = document.getElementById('porcentaje-descuento');
  const inputPrecioFinal = document.getElementById('precio-final');
  const excelInput = document.getElementById('excel-input');
  const btnImportar = document.getElementById('btn-importar');
  const archivoDisplayExcel = excelInput.nextElementSibling;
  const imagenInput = document.getElementById('imagen_producto');
  const imagenDisplayDiv = imagenInput.parentElement.querySelector('.archivo-input-display'); // El div contenedor
  const imagenDisplaySpan = imagenDisplayDiv.querySelector('span:last-child'); // El span que muestra el texto

  const buscadorProducto = document.getElementById('buscador-producto');
  const resultadosBusqueda = document.getElementById('resultados-busqueda');

  let estadoEditar = false;
  let productoActual = null;
  let debounceTimer;

  // Función para actualizar el estado del botón Importar
  function actualizarEstadoBotonImportar() {
    const hayArchivo = excelInput.files && excelInput.files.length === 1;
    toggleElemento(btnImportar, hayArchivo);
    if (hayArchivo) {
        archivoDisplayExcel.querySelector('span:last-child').textContent = excelInput.files[0].name;
    } else {
        archivoDisplayExcel.querySelector('span:last-child').textContent = 'Seleccionar archivo Excel...';
    }
  }
  // Añadir el listener al input de archivo
  if (excelInput && btnImportar) {
    excelInput.addEventListener('change', actualizarEstadoBotonImportar);
    actualizarEstadoBotonImportar();
  }

  // Función para habilitar/deshabilitar elementos
  function toggleElemento(elemento, habilitar) {
    elemento.disabled = !habilitar;
    elemento.classList.toggle('disabled', !habilitar);
  }

  function seleccionarProducto(productoId) {
    if (!productoId) {
      imagenDisplaySpan.textContent = 'Seleccionar imágenes...';
      imagenInput.value = '';
      estadoEditar = false;
      productoActual = null;
      productForm.reset();
      buscadorProducto.value = ''; // Limpiar el input de búsqueda
      checkboxOferta.checked = false;
      inputDescuento.value = '';
      toggleElemento(btnAgregar, true);
    } else {
      // Estado: Un producto ha sido seleccionado
      estadoEditar = true;
      toggleElemento(btnAgregar, false);
      
      // Hacemos la llamada a la API para obtener los detalles completos
      fetch(`/api/productos/${productoId}/`, {
        headers: { 'Accept': 'application/json' }
      })
      .then(res => res.json())
      .then(data => {
        productoActual = data; // Guarda el producto completo recibido

        // Rellenar campos básicos (estos probablemente siguen igual)
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('sku').value = data.sku || '';
        document.getElementById('descripcion').value = data.descripcion || '';
        document.getElementById('precio_base').value = data.precio_base || '';

        // --- AJUSTES NECESARIOS ---

        // 1. Procesar Tallas y Stocks desde data.talla_stock
        if (data.talla_stock && Array.isArray(data.talla_stock)) {
            const tallasArray = data.talla_stock.map(ts => ts.talla); // Extrae solo los nombres de talla
            const stocksArray = data.talla_stock.map(ts => ts.stock); // Extrae solo los stocks
            document.getElementById('tallas').value = tallasArray.join(', ') || ''; // Une los nombres con coma
            document.getElementById('stocks').value = stocksArray.join(', ') || ''; // Une los stocks con coma
        } else {
            document.getElementById('tallas').value = ''; // Limpiar si no hay datos
            document.getElementById('stocks').value = '';
        }

        // 2. Seleccionar las opciones correctas en los <select> usando el NOMBRE
        // Función auxiliar para seleccionar opción por texto
        const seleccionarOpcionPorTexto = (selectId, texto) => {
            const selectElement = document.getElementById(selectId);
            if (!selectElement || !texto) return; // Salir si no hay elemento o texto

            // Recorre las opciones del select
            for (let i = 0; i < selectElement.options.length; i++) {
                // Compara el texto de la opción (ignorando mayúsculas/minúsculas y espacios extra)
                if (selectElement.options[i].text.trim().toLowerCase() === texto.trim().toLowerCase()) {
                    selectElement.value = selectElement.options[i].value; // Establece el VALOR (ID) de la opción encontrada
                    break; // Termina el bucle una vez encontrada
                }
            }
        };

        const numImagenesExistentes = (data.imagenes && Array.isArray(data.imagenes)) ? data.imagenes.length : 0;

        if (numImagenesExistentes > 0) {
            imagenDisplaySpan.textContent = `${numImagenesExistentes} imágen${numImagenesExistentes > 1 ? 'es' : ''} asignada${numImagenesExistentes > 1 ? 's' : ''}.`;
        } else {
            imagenDisplaySpan.textContent = 'Seleccionar imágenes...'; // Mensaje por defecto
        }
        imagenInput.value = '';

        // Usa la función auxiliar para cada select
        seleccionarOpcionPorTexto('categoria', data.categoria);
        seleccionarOpcionPorTexto('genero', data.genero);
        seleccionarOpcionPorTexto('temporada', data.temporada);
        seleccionarOpcionPorTexto('marca', data.marca);

        // --- FIN DE AJUSTES ---

        // Rellenar el formulario de edición (esto debería seguir funcionando)

        checkboxOferta.checked = data.en_oferta || false;
        inputDescuento.value = data.descuento_porcentaje || '';

        // Finalmente, actualizamos toda la interfaz
        actualizarEstados(); // Llama a tu función existente para habilitar/deshabilitar campos
        console.log("Producto cargado:", data);
      })
      .catch(err => {
        console.error("Error cargando producto:", err);
        alert("Error al cargar los detalles del producto. Revisa la consola.");
        // Considera resetear el estado si falla la carga
        seleccionarProducto(null); // Llama a la misma función con null para limpiar
      });
    }
    actualizarEstados();
  }

  // Función para actualizar estados de la interfaz
  function actualizarEstados() {
    if (!estadoEditar) {
      toggleElemento(checkboxOferta, false);
      toggleElemento(inputDescuento, false);
      toggleElemento(inputPrecioFinal, false);
      toggleElemento(btnEditar, false);
      toggleElemento(btnEliminar, false);
      inputPrecioFinal.value = '$0.00';
    } else {
      toggleElemento(checkboxOferta, true);
      toggleElemento(btnEditar, true);
      toggleElemento(btnEliminar, true);
      
      if (checkboxOferta.checked) {
        toggleElemento(inputDescuento, true);
        toggleElemento(inputPrecioFinal, true);
        calcularPrecioFinal();
      } else {
        toggleElemento(inputDescuento, false);
        toggleElemento(inputPrecioFinal, false);
        inputDescuento.value = '';
        inputPrecioFinal.value = "$" + (productoActual ? productoActual.precio_base : '0.00');
      }
    }
  }

  // Función para calcular precio final
  function calcularPrecioFinal() {
    if (productoActual && checkboxOferta.checked) {
      const precioBase = parseFloat(productoActual.precio_base);
      const descuento = parseFloat(inputDescuento.value) || 0;
      const precioFinal = precioBase - (precioBase * (descuento / 100));
      inputPrecioFinal.value = `$${precioFinal.toFixed(2)}`;
    }
  }

  function mostrarResultados(productos) {
    resultadosBusqueda.innerHTML = ''; // Limpiar resultados anteriores
    
    if (productos.length === 0) {
      resultadosBusqueda.innerHTML = `<div class="resultado-item no-results">No se encontraron productos</div>`;
    } else {
      productos.forEach(producto => {
        const item = document.createElement('div');
        item.classList.add('resultado-item');
        item.textContent = `${producto.nombre} (${producto.sku})`;
        item.dataset.id = producto.id; // Guardamos el ID en el elemento

        // Evento clave: al hacer clic en un resultado
        item.addEventListener('click', () => {
          seleccionarProducto(producto.id);
          buscadorProducto.value = producto.nombre; // Pone el nombre en el input
          resultadosBusqueda.classList.remove('activo'); // Oculta el desplegable
        });

        resultadosBusqueda.appendChild(item);
      });
    }

    resultadosBusqueda.classList.add('activo'); // Muestra el desplegable
  }

  // --- EVENT LISTENERS ---

  checkboxOferta.addEventListener('change', actualizarEstados);
  inputDescuento.addEventListener('input', () => {
    if (parseInt(inputDescuento.value, 10) > 100) {
      inputDescuento.value = 100;
    } else if (parseInt(inputDescuento.value, 10) < 0) {
      inputDescuento.value = 0;
    }
    calcularPrecioFinal();
  });

  buscadorProducto.addEventListener('keyup', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (query.length < 2) { // No buscar si hay menos de 2 caracteres
      resultadosBusqueda.classList.remove('activo');
      if (productoActual && query.length === 0) { // Si borra todo, reseteamos
          seleccionarProducto(null);
      }
      return;
    }

    // Debounce: Espera 300ms después de que el usuario deja de teclear
    debounceTimer = setTimeout(() => {
      fetch(`/api/productos/?search=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          mostrarResultados(data);
        })
        .catch(error => console.error('Error en la búsqueda:', error));
    }, 300);
  });
  
  document.addEventListener('click', (e) => {
    if (!buscadorProducto.contains(e.target) && !resultadosBusqueda.contains(e.target)) {
      resultadosBusqueda.classList.remove('activo');
    }
  });


  // Envío del formulario para agregar producto
  productForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(productForm);

    const precioBase = parseFloat(formData.get('precio_base'));
    if (isNaN(precioBase) || precioBase <= 0) {
      alert("El precio base debe ser un número decimal positivo.");
      window.scrollTo(0, 0);
      return;
    }

    if (!document.getElementById("imagen_producto").value){
      formData.delete('imagenes');
    }

    fetch('/api/productos/', {
      method: 'POST',
      headers: { 'X-CSRFToken': formData.get('csrfmiddlewaretoken') },
      body: formData
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.json()))
    .then(newProduct => {
      console.log('Producto creado:', newProduct);
      productForm.reset();
      alert(`¡Producto "${newProduct.nombre}" agregado con éxito!`);
    })
    .catch(errorPromise => {
      errorPromise.then(error => {
        console.error('Error:', error);
        alert(`Error al agregar el producto: ${JSON.stringify(error)}`);
      });
    });
  });

  // Botón Editar - Envía petición PUT
  btnEditar.addEventListener('click', function(e) {
    e.preventDefault();
    if (!productoActual) return alert("No hay producto seleccionado para editar");

    const formData = new FormData(productForm);
    formData.set('en_oferta', checkboxOferta.checked);
    formData.set('descuento_porcentaje', inputDescuento.value || '0');
    if (!document.getElementById("imagen_producto").value){
      formData.delete('imagenes');
    }

    fetch(`/api/productos/${productoActual.id}/`, {
      method: 'PUT',
      headers: { 'X-CSRFToken': formData.get('csrfmiddlewaretoken') },
      body: formData
    })
    .then(response => response.ok ? response.json() : Promise.reject(response.json()))
    .then(updatedProduct => {
      console.log('Producto actualizado:', updatedProduct);
      alert(`¡Producto "${updatedProduct.nombre}" actualizado con éxito!`);
      // Actualizamos el nombre en el buscador por si cambió
      buscadorProducto.value = updatedProduct.nombre;
    })
    .catch(errorPromise => {
      errorPromise.then(error => {
        console.error('Error:', error);
        alert(`Error al actualizar el producto: ${JSON.stringify(error)}`);
      });
    });
  });

  // Botón Eliminar - Envía petición DELETE
  btnEliminar.addEventListener('click', function(e) {
    e.preventDefault();
    if (!productoActual) return alert("No hay producto seleccionado para eliminar");
    if (!confirm(`¿Estás seguro de que quieres eliminar "${productoActual.nombre}"?`)) return;

    fetch(`/api/productos/${productoActual.id}/`, {
      method: 'DELETE',
      headers: { 'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value }
    })
    .then(response => {
      if (response.ok) {
        alert(`¡Producto "${productoActual.nombre}" eliminado con éxito!`);
        // Reseteamos el estado completamente
        seleccionarProducto(null);
      } else {
        throw new Error('Error al eliminar el producto');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    });
  });

  if (imagenInput && imagenDisplaySpan) {
    imagenInput.addEventListener('change', function() {
      const numArchivosSeleccionados = imagenInput.files ? imagenInput.files.length : 0;

      if (numArchivosSeleccionados > 1) {
        imagenDisplaySpan.textContent = `${numArchivosSeleccionados} archivos seleccionados`;
      } else if (numArchivosSeleccionados === 1) {
        imagenDisplaySpan.textContent = imagenInput.files[0].name; // Mostrar nombre del único archivo
      } else {
        // Si no se selecciona nada (o se cancela), mostrar info del producto actual si existe
        if (productoActual && productoActual.imagenes && productoActual.imagenes.length > 0) {
             const numExistentes = productoActual.imagenes.length;
             imagenDisplaySpan.textContent = `${numExistentes} imágen${numExistentes > 1 ? 'es' : ''} asignada${numExistentes > 1 ? 's' : ''}. Selecciona nuevas para reemplazar.`;
        } else {
            imagenDisplaySpan.textContent = 'Seleccionar imágenes...'; // Mensaje por defecto
        }
      }
    });
  }

  // Inicializar estados al cargar la página
  actualizarEstados();
});
