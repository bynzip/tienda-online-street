import { useState } from 'react';
import type { IProducto } from '../interfaces/productos';
import { ShoppingCart, MessageCircle } from 'lucide-react';

interface ProductDetailsProps {
  producto: IProducto;
}

function ProductDetails({ producto }: ProductDetailsProps) {
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);

  // Obtener el stock de la talla seleccionada
  const stockDisponible = tallaSeleccionada
    ? producto.talla_stock.find((ts) => ts.talla === tallaSeleccionada)?.stock || 0
    : 0;

  // Generar mensaje de WhatsApp
  const generarMensajeWhatsApp = () => {
    if (!tallaSeleccionada) {
      alert('Por favor selecciona una talla');
      return;
    }

    const total = (parseFloat(producto.precio_final) * cantidad).toFixed(2);
    const mensaje = `Hola, quiero comprar:
- Producto: ${producto.nombre}
- Marca: ${producto.marca}
- Talla: ${tallaSeleccionada}
- Cantidad: ${cantidad}
- Precio unitario: S/ ${producto.precio_final}
- Total: S/ ${total}`;

    const numeroWhatsApp = '51999999999'; // Cambiar por tu número
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
  };

  const handleAgregarCarrito = () => {
    if (!tallaSeleccionada) {
      alert('Por favor selecciona una talla');
      return;
    }
    // TODO: Implementar lógica del carrito
    alert(`Añadido al carrito: ${producto.nombre} - Talla ${tallaSeleccionada} - Cantidad ${cantidad}`);
  };

  return (
    <div className="flex flex-col space-y-6 p-5 lg:py-2 lg:px-3">
      {/* Marca */}
      <div>
        <p className="text-sm text-gray-500 uppercase tracking-wide">{producto.marca}</p>
      </div>

      {/* Nombre */}
      <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>

      {/* Precio */}
      <div className="space-y-2">
        {producto.en_oferta ? (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">S/ {producto.precio_final}</span>
            <span className="text-xl text-gray-500 line-through">S/ {producto.precio_base}</span>
            <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
              {producto.descuento_porcentaje}% OFF
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-gray-900">S/ {producto.precio_final}</span>
        )}
      </div>

      {/* Descripción */}
      {producto.descripcion && (
        <div className="border-t border-b border-gray-200 py-4">
          <p className="text-gray-700 leading-relaxed">{producto.descripcion}</p>
        </div>
      )}

      {/* Info adicional */}
      <div className="flex justify-between items-center text-sm">
        <div>
          <span className="text-gray-500">Categoría:</span>
          <p className="font-medium text-gray-900">{producto.categoria}</p>
        </div>
        <div>
          <span className="text-gray-500">Género:</span>
          <p className="font-medium text-gray-900">{producto.genero}</p>
        </div>
        <div>
          <span className="text-gray-500">Temporada:</span>
          <p className="font-medium text-gray-900">{producto.temporada}</p>
        </div>
        <div>
        </div>
      </div>

      {/* Selector de tallas */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          Selecciona tu talla
          {tallaSeleccionada && (
            <span className="ml-2 text-gray-500">
              (Stock disponible: {stockDisponible})
            </span>
          )}
        </label>
        <div className="grid grid-cols-6 gap-2">
          {producto.talla_stock.map((ts) => (
            <button
              key={ts.id}
              onClick={() => {
                setTallaSeleccionada(ts.talla);
                setCantidad(1); // Reset cantidad al cambiar talla
              }}
              disabled={ts.stock === 0}
              className={`
                py-2 px-4 text-sm font-medium rounded-lg border-2 transition-all
                ${ts.stock === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : ''}
                ${
                  tallaSeleccionada === ts.talla
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 hover:border-black'
                }
              `}
            >
              {ts.talla}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de cantidad */}
      {tallaSeleccionada && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">Cantidad</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-black transition-colors"
            >
              -
            </button>
            <span className="w-12 text-center font-medium text-lg">{cantidad}</span>
            <button
              onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))}
              disabled={cantidad >= stockDisponible}
              className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-black transition-colors disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="space-y-3 pt-4 flex gap-5 max-h-17">
        <button
          onClick={handleAgregarCarrito}
          disabled={!tallaSeleccionada}
          className="w-full h-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          Añadir al Carrito
        </button>

        <button
          onClick={generarMensajeWhatsApp}
          disabled={!tallaSeleccionada}
          className="w-full h-full flex items-center justify-center gap-2 bg-gray-600 text-white py-4 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <MessageCircle className="w-5 h-5" />
          Realizar Pedido
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;