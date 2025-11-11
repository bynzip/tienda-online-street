import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden text-white lg:mb-12">
      {/* Video de Fondo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto z-0 -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/videos/ad.mp4" type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Contenido */}
      <div className="relative z-20 flex flex-col items-center">
        <span className="text-white tracking-[5px] text-sm mb-2 block uppercase font-semibold">
          EXCLUSIVO - 2025
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none my-2 drop-shadow-lg">
          AIR MAX DN
        </h1>
        <p className="text-lg md:text-xl mb-8 text-white drop-shadow-md font-medium">
          LA NUEVA COLECCIÓN DE NIKE
        </p>
        <Link
          to="/catalogo"
          className="bg-[#111] text-white border-none py-4 px-10 text-base font-bold uppercase cursor-pointer transition-colors duration-300 hover:bg-[#333]"
        >
          COMPRAR AHORA
        </Link>
      </div>
    </section>
  );
}
