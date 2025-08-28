document.addEventListener('DOMContentLoaded', function() {
  const productForm = document.getElementById('product-form');

  if (!productForm) {
    return;
  }

  productForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(productForm);

    // Depuración: Mostrar datos enviados
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
      window.scrollTo(0, 0);
    })
    .catch(error => {
      console.error('Error:', error);
      alert(`Error al agregar el producto: ${JSON.stringify(error)}`);
      window.scrollTo(0, 0);
    });
  });
});