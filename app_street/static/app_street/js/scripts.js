document.addEventListener('DOMContentLoaded', function() {
  const productForm = document.getElementById('product-form');
  const producto = document.getElementById('producto-editar');
  const btnAgregar = document.getElementById('btn-agregar');
  const btnEditar = document.getElementById('btn-editar');
  const btnEliminar = document.getElementById('btn-eliminar');
  const checkboxOferta = document.getElementById('en-oferta');
  const inputDescuento = document.getElementById('porcentaje-descuento');
  const inputPrecioFinal = document.getElementById('precio-final');

  // Variable de estado
  let estadoEditar = false;
  let productoActual = null;

  // Función para habilitar/deshabilitar elementos
  function toggleElemento(elemento, habilitar) {
    if (habilitar) {
      elemento.disabled = false;
      elemento.classList.remove('disabled');
    } else {
      elemento.disabled = true;
      elemento.classList.add('disabled');
    }
    return elemento;
  }

  // Función para actualizar estados de la interfaz
  function actualizarEstados() {
    if (!estadoEditar) {
      // Estado: Agregar
      toggleElemento(checkboxOferta, false);
      toggleElemento(inputDescuento, false);
      toggleElemento(inputPrecioFinal, false);
      toggleElemento(btnEditar, false);
      toggleElemento(btnEliminar, false);
      inputPrecioFinal.value = '$0.00';
    } else {
      // Estado: Editar (con o sin oferta)
      toggleElemento(checkboxOferta, true);
      toggleElemento(btnEditar, true);
      toggleElemento(btnEliminar, true);
      
      if (checkboxOferta.checked) {
        // Estado: Editar con oferta
        toggleElemento(inputDescuento, true);
        toggleElemento(inputPrecioFinal, true);
        calcularPrecioFinal();
      } else {
        // Estado: Editar sin oferta
        toggleElemento(inputDescuento, false);
        toggleElemento(inputPrecioFinal, false);
        inputDescuento.value = '';
        inputPrecioFinal.value = "$" + productoActual.precio_base;
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

  // Event listeners
  checkboxOferta.addEventListener('change', actualizarEstados);
  inputDescuento.addEventListener('input', calcularPrecioFinal);

  // Envío del formulario para agregar producto
  productForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(productForm);

    console.log('Datos enviados (sin archivos):', Object.fromEntries(formData));

    // Validar precio_base
    const precioBase = parseFloat(formData.get('precio_base'));
    if (isNaN(precioBase) || precioBase <= 0) {
      alert("El precio base debe ser un número decimal positivo.");
      window.scrollTo(0, 0);
      return;
    }

    fetch('/api/productos/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': formData.get('csrfmiddlewaretoken')
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(errorData => {
          console.log('Error del servidor:', errorData);
          throw errorData;
        });
      }
    })
    .then(newProduct => {
      console.log('Producto creado:', newProduct);
      productForm.reset();
      alert(`¡Producto "${newProduct.nombre}" agregado con éxito!`);
      
      // Agregar el nuevo producto al select
      const option = document.createElement('option');
      option.value = newProduct.id;
      option.textContent = `${newProduct.nombre} --- ${newProduct.precio_base}`;
      producto.appendChild(option);
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Error al agregar el producto: ${JSON.stringify(error)}`);
    });
  });

  // Evento change del selector de productos
  producto.addEventListener('change', function(e) {
    const id = producto.value;
    
    if (!id) {
      // No hay producto seleccionado
      estadoEditar = false;
      productoActual = null;
      productForm.reset();
      checkboxOferta.checked = false;
      inputDescuento.value = '';
      toggleElemento(btnAgregar, true);
    } else {
      // Hay producto seleccionado
      estadoEditar = true;
      toggleElemento(btnAgregar, false);
      
      fetch(`/api/productos/${id}/`, {
        headers: { 'Accept': 'application/json' }
      })
      .then(res => res.json())
      .then(data => {
        productoActual = data;
        
        // Llenar formulario principal
        document.getElementById('nombre').value = data.nombre || '';
        document.getElementById('sku').value = data.sku || '';
        document.getElementById('descripcion').value = data.descripcion || '';
        document.getElementById('tallas').value = data.tallas || '';
        document.getElementById('stocks').value = data.stocks || '';
        document.getElementById('precio_base').value = data.precio_base || '';
        document.getElementById('categoria').value = data.categoria || '';
        document.getElementById('genero').value = data.genero || '';
        document.getElementById('temporada').value = data.temporada || '';
        document.getElementById('marca').value = data.marca || '';        
        
        // Llenar formulario de edición
        checkboxOferta.checked = data.en_oferta || false;
        inputDescuento.value = data.descuento_porcentaje || '';
        actualizarEstados()
        
        console.log("Producto cargado:", data);
      })
      .catch(err => {
        console.error("Error cargando producto:", err);
        alert("Error al cargar el producto");
      });
    }
    
    actualizarEstados();
  });

  // Botón Editar - Envía petición PUT
  btnEditar.addEventListener('click', function(e) {ñ
    e.preventDefault();
    
    if (!productoActual) {
      alert("No hay producto seleccionado para editar");
      return;
    }

    // Crear FormData con datos de ambos formularios
    const formData = new FormData(productForm);
    
    // Agregar datos del formulario de edición
    formData.set('en_oferta', checkboxOferta.checked);
    formData.set('descuento_porcentaje', inputDescuento.value || '0');
    if (!document.getElementById("imagen_producto").value){
      formData.delete('imagenes');
    }

    console.log('Datos para editar:', Object.fromEntries(formData));

    fetch(`/api/productos/${productoActual.id}/`, {
      method: 'PUT',
      headers: {
        'X-CSRFToken': formData.get('csrfmiddlewaretoken')
      },
      body: formData
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then(errorData => {
          console.log('Error del servidor:', errorData);
          throw errorData;
        });
      }
    })
    .then(updatedProduct => {
      console.log('Producto actualizado:', updatedProduct);
      alert(`¡Producto "${updatedProduct.nombre}" actualizado con éxito!`);
      
      // Actualizar el texto del option en el select
      const selectedOption = producto.querySelector(`option[value="${updatedProduct.id}"]`);
      if (selectedOption) {
        selectedOption.textContent = `${updatedProduct.nombre} --- ${updatedProduct.precio_base}`;
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Error al actualizar el producto: ${JSON.stringify(error)}`);
    });
  });

  // Botón Eliminar - Envía petición DELETE
  btnEliminar.addEventListener('click', function(e) {
    e.preventDefault();
    
    if (!productoActual) {
      alert("No hay producto seleccionado para eliminar");
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar el producto "${productoActual.nombre}"?`)) {
      return;
    }

    fetch(`/api/productos/${productoActual.id}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        console.log('Producto eliminado');
        alert(`¡Producto "${productoActual.nombre}" eliminado con éxito!`);
        
        // Remover option del select
        const selectedOption = producto.querySelector(`option[value="${productoActual.id}"]`);
        if (selectedOption) {
          selectedOption.remove();
        }
        
        // Resetear estado
        producto.value = '';
        estadoEditar = false;
        productoActual = null;
        productForm.reset();
        checkboxOferta.checked = false;
        inputDescuento.value = '';
        toggleElemento(btnAgregar, true);
        actualizarEstados();
      } else {
        throw new Error('Error al eliminar el producto');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    });
  });

  // Inicializar estados
  actualizarEstados();
});