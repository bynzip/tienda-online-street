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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="mb-6 inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <svg
              className="w-16 h-16 text-gray-400"
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
          <h1 className="text-4xl font-black text-gray-900 mb-3">Tu Carrito está Vacío</h1>
          <p className="text-gray-600 text-lg mb-10 leading-relaxed">Explora nuestra colección de streetwear y encuentra los productos que te encanten.</p>
          <Link
            to="/"
            className="inline-block bg-gradient-to-r from-gray-900 to-black text-white px-10 py-4 rounded-xl font-bold uppercase hover:shadow-lg transform hover:-translate-y-1"
          >
            Descubre Nuestros Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-black text-gray-900 mb-2">Tu Carrito</h1>
          <p className="text-gray-600 text-lg">{items.length} producto{items.length !== 1 ? 's' : ''} en tu carrito</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all"
                >
                  {/* Imagen */}
                  {item.imagen && (
                    <div className="flex-shrink-0">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={item.imagen}
                        alt={item.nombre}
                        className="w-32 h-32 object-cover rounded-xl shadow-sm border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Detalles del producto */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.nombre}</h3>
                      <p className="text-sm text-gray-500 font-medium mt-1">{item.marca}</p>
                    </div>

                    {item.talla && (
                      <div className="mb-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs uppercase tracking-widest text-gray-600 font-semibold min-w-fit">Talla:</label>
                          {item.tallaStockInfo && item.tallaStockInfo.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={item.talla}
                                onChange={(e) => updateTalla(item.id, e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white font-medium"
                              >
                                {item.tallaStockInfo.map((ts) => (
                                  <option key={ts.id} value={ts.talla}>
                                    {ts.talla}
                                  </option>
                                ))}
                              </select>
                              <span className="text-xs text-gray-500 whitespace-nowrap">({item.tallaStockInfo.find((ts) => ts.talla === item.talla)?.stock || 0} disponibles)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.talla}
                                onChange={(e) => updateTalla(item.id, e.target.value)}
                                className="border border-gray-300 rounded-lg px-2 py-2 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-gray-900"
                                placeholder="Talla"
                              />
                              <span className="text-xs text-gray-500">(Sin info)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xl font-black text-gray-900">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </div>
                  </div>

                  {/* Cantidad y acciones */}
                  <div className="flex flex-col items-end justify-between gap-4">
                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="px-4 py-2 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="px-5 py-2 font-bold min-w-[3rem] text-center text-gray-900">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        disabled={
                          item.tallaStockInfo && item.tallaStockInfo.length > 0
                            ? item.cantidad >= (item.tallaStockInfo.find((ts) => ts.talla === item.talla)?.stock || 0)
                            : false
                        }
                        className="px-4 py-2 hover:bg-gray-200 font-bold text-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {item.tallaStockInfo && item.tallaStockInfo.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Máx: <span className="font-semibold">{item.tallaStockInfo.find((ts) => ts.talla === item.talla)?.stock || 0}</span>
                      </div>
                    )}

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 font-semibold text-sm px-3 py-2 rounded-lg transition-colors"
                    >
                      ✕ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 p-8 rounded-2xl sticky top-24 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-8">Resumen del Pedido</h2>

              <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Subtotal ({items.length} artículos)</span>
                  <span className="text-lg font-bold text-gray-900">S/ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Envío</span>
                  <span className="text-sm font-semibold text-gray-500">Por confirmar</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Descuentos</span>
                  <span className="text-sm font-semibold text-gray-500">—</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-200">
                <span className="text-2xl font-black text-gray-900">Total</span>
                <span className="text-3xl font-black text-gray-900">S/ {totalPrice.toFixed(2)}</span>
              </div>

              <div className="space-y-3 mb-8">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 px-4 rounded-xl font-bold uppercase text-center hover:shadow-lg transform hover:-translate-y-1 transition-all"
                >
                  ✓ Hacer Pedido por WhatsApp
                </a>

                <button
                  onClick={clearCart}
                  className="block w-full bg-gray-100 hover:bg-red-50 text-gray-900 hover:text-red-600 py-4 px-4 rounded-xl font-bold uppercase text-center transition-colors"
                >
                  ✕ Vaciar Carrito
                </button>
              </div>

              <Link
                to="/"
                className="block w-full text-center text-gray-600 hover:text-gray-900 font-semibold py-3 transition-colors"
              >
                ← Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
