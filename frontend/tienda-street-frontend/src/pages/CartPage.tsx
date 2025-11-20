import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, updateTalla, clearCart, totalPrice } = useCart();

  const whatsappNumber = '51975738709';
  const message = encodeURIComponent(
    `Hola, deseo hacer un pedido:\n\n${items
      .map(
        (item) =>
          `${item.nombre} - Talla: ${item.talla} - Cantidad: ${item.cantidad} - Precio: S/ ${(parseFloat(item.precio) * item.cantidad).toFixed(2)}`
      )
      .join('\n')}\n\nTotal: S/ ${totalPrice.toFixed(2)}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0h2m-2 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase">
            Tu Carrito está Vacío
          </h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Parece que aún no has añadido nada. Explora nuestra colección y encuentra tu estilo.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase hover:bg-gray-800 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    // Usamos bg-gray-50 para mantener coherencia con ProductDetail
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      {/* Contenedor alineado con Footer y Categorías (lg:px-10) */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-10">
        {/* Header más compacto */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-2 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
              Tu Carrito
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {items.length} producto{items.length !== 1 ? 's' : ''} agregado
              {items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Vaciar todo el carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm transition-all hover:border-gray-300"
              >
                {/* Imagen más pequeña y controlada */}
                <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                  {item.imagen ? (
                    <img
                      loading="lazy"
                      decoding="async"
                      src={item.imagen}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <span className="text-xs">Sin img</span>
                    </div>
                  )}
                </div>

                {/* Detalles */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                        {item.marca}
                      </p>
                      <h3 className="font-bold text-base md:text-lg text-gray-900 leading-tight line-clamp-2">
                        <Link to={`/producto/${item.productId}`} className="hover:underline">
                          {item.nombre}
                        </Link>
                      </h3>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      aria-label="Eliminar"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Controles de Talla y Precio */}
                  <div className="mt-auto pt-3 flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      {/* Selector de Talla compacto */}
                      {item.talla && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500 font-medium">Talla:</span>
                          {item.tallaStockInfo && item.tallaStockInfo.length > 0 ? (
                            <select
                              value={item.talla}
                              onChange={(e) => updateTalla(item.id, e.target.value)}
                              className="py-1 px-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:border-black cursor-pointer"
                            >
                              {item.tallaStockInfo.map((ts) => (
                                <option key={ts.id} value={ts.talla}>
                                  {ts.talla}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-semibold text-gray-900">{item.talla}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Control de Cantidad más sutil */}
                      <div className="flex items-center border border-gray-300 rounded-lg h-8">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="px-3 h-full hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-2 text-sm font-semibold text-gray-900 min-w-1.5rem text-center">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          disabled={
                            item.tallaStockInfo && item.tallaStockInfo.length > 0
                              ? item.cantidad >=
                                (item.tallaStockInfo.find((ts) => ts.talla === item.talla)?.stock ||
                                  0)
                              : false
                          }
                          className="px-3 h-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-20">
                        <span className="block text-sm md:text-lg font-bold text-gray-900">
                          S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-6 rounded-xl top-24 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wide">
                Resumen
              </h2>

              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>S/ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-gray-400 italic">Por coordinar</span>
                </div>
                <div className="border-t border-dashed border-gray-200 my-3 pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-gray-900">
                    S/ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-lg font-bold uppercase text-center text-sm tracking-wide shadow-sm hover:shadow-md transition-all transform active:scale-[0.98]"
              >
                <i className="fab fa-whatsapp mr-2"></i> Completar Pedido
              </a>

              <p className="text-xs text-gray-400 text-center mt-4 leading-tight">
                Al completar el pedido serás redirigido a WhatsApp para coordinar el pago y envío
                con un asesor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
