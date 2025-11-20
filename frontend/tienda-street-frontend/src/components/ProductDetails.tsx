import { useState } from 'react';
import type { IProducto } from '../interfaces/productos';
import { useCart } from '../hooks/useCart';
import { ChevronDown } from 'lucide-react';

interface ProductDetailsProps {
  producto: IProducto;
}

function ProductDetails({ producto }: ProductDetailsProps) {
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>('');
  const [cantidad, setCantidad] = useState(1);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const { addToCart } = useCart();

  // Lógica interna de stock (oculta al usuario visualmente)
  const stockDisponible = tallaSeleccionada
    ? producto.talla_stock.find((ts) => ts.talla === tallaSeleccionada)?.stock || 0
    : 0;

  const handleAgregarCarrito = () => {
    if (!tallaSeleccionada) {
      // Pequeña animación o alerta visual si no hay talla
      const selectElement = document.getElementById('talla-select');
      selectElement?.focus();
      selectElement?.classList.add('ring-2', 'ring-red-500');
      setTimeout(() => selectElement?.classList.remove('ring-2', 'ring-red-500'), 1000);
      return;
    }

    addToCart({
      id: `${producto.id}-${tallaSeleccionada}`,
      productId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_final,
      imagen: producto.imagenes[0]?.imagen || null,
      cantidad,
      talla: tallaSeleccionada,
      marca: producto.marca,
      tallaStockInfo: producto.talla_stock,
    });

    setMostrarMensaje(true);
    setCantidad(1); // Resetear cantidad tras añadir
    setTimeout(() => setMostrarMensaje(false), 3000);
  };

  // Cadena de atributos formateada
  const atributosHeader = [producto.temporada, producto.marca, producto.categoria, producto.genero]
    .filter(Boolean)
    .join(' / ');

  return (
    <div className="flex flex-col space-y-6 p-5 lg:py-4 lg:px-0 h-full">
      {/* 1. Atributos (Breadcrumb style) */}
      <div>
        <p className="text-xs md:text-[12px] text-gray-400 tracking-wide mb-2.5">
          {atributosHeader}
        </p>

        {/* 2. Título */}
        <h1 className="text-3xl md:text-3xl font-bold text-gray-900 tracking-tight leading-none mb-3">
          {producto.nombre}
        </h1>

        {/* 3. Precio */}
        <div className="flex items-center gap-4">
          {producto.en_oferta ? (
            <>
              <span className="text-2xl font-bold text-gray-900">S/ {producto.precio_final}</span>
              <span className="text-lg text-gray-400 line-through font-medium">
                S/ {producto.precio_base}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">S/ {producto.precio_final}</span>
          )}
        </div>
      </div>

      {/* 4. Descripción */}
      {producto.descripcion && (
        <div className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          <p>{producto.descripcion}</p>
        </div>
      )}

      <div className="pt-4 space-y-6">
        {/* 5. Selector de Talla */}
        <div className="space-y-2">
          <label
            htmlFor="talla-select"
            className="text-xs font-bold text-gray-900 uppercase tracking-wide"
          >
            Talla
          </label>
          <div className="relative">
            <select
              id="talla-select"
              value={tallaSeleccionada}
              onChange={(e) => {
                setTallaSeleccionada(e.target.value);
                setCantidad(1); // Reset cantidad al cambiar talla
              }}
              className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-none focus:outline-none focus:border-black focus:ring-0 transition-colors text-sm font-medium cursor-pointer uppercase"
            >
              <option value="" disabled>
                Elige una opción
              </option>
              {producto.talla_stock.map((ts) => (
                <option key={ts.id} value={ts.talla} disabled={ts.stock === 0}>
                  {ts.talla} {ts.stock === 0 ? '(Agotado)' : ''}
                </option>
              ))}
            </select>
            {/* Icono custom para el select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* 6. Fila de Cantidad y Botón de Compra */}
        <div className="flex gap-4 h-12">
          {/* Input Cantidad */}
          <div className="flex items-center border border-gray-300 w-24 shrink-0 ">
            <button
              onClick={() => setCantidad(Math.max(1, cantidad - 1))}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
              disabled={!tallaSeleccionada}
            >
              -
            </button>
            <div className="flex-1 h-full flex items-center justify-center text-sm font-bold text-gray-900 border-x border-gray-100">
              {cantidad}
            </div>
            <button
              onClick={() => setCantidad(Math.min(stockDisponible, cantidad + 1))}
              disabled={!tallaSeleccionada || cantidad >= stockDisponible}
              className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Botón Añadir */}
          <button
            onClick={handleAgregarCarrito}
            disabled={!tallaSeleccionada || stockDisponible === 0}
            className="flex-1 bg-gray-900 text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {stockDisponible === 0 && tallaSeleccionada ? 'Agotado' : 'Añadir al Carrito'}
          </button>
        </div>

        {/* Mensaje Feedback */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${mostrarMensaje ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="text-gray-900 text-[12px] uppercase py-1 px-4 text-center tracking-wide">
            ✓ Producto añadido al carrito correctamente
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
