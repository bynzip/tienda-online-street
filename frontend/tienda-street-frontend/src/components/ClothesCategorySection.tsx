import { Link } from 'react-router-dom';

export function ClothesCategorySection() {
    return (
      <section className="flex flex-col md:flex-row gap-4 p-4 md:gap-6 md:p-8 bg-[#f9f9f9]">
          <Link to="/categoria/ropa-hombre" className="group relative flex-1 h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden rounded-2xl shadow-sm no-underline">
              <img src="/imagenes/ropa.png" alt="Ropa Hombre" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-1 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-2 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ROPA DE HOMBRE</h2>
                  <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
          <Link to="/categoria/ropa-mujer" className="group relative flex-1 h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden rounded-2xl shadow-sm no-underline">
              <img src="/imagenes/Gemini_Generated_Image_vbzj6tvbzj6tvbzj.png" alt="Ropa Mujer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-1 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-2 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ROPA DE MUJER</h2>
                   <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
           <Link to="/categoria/accesorios" className="group relative flex-1 md:flex-[0.5] h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden rounded-2xl shadow-sm no-underline">
              <img src="/imagenes/a.png" alt="Accesorios" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent z-1 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-2 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ACCESORIOS</h2>
                   <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
      </section>
    );
}