import { Link } from 'react-router-dom';
import { useFetch } from '../api/useFetch';
import type { ICategoria, IGenero } from '../interfaces/productos';

export function ClothesCategorySection() {
    const { data: categorias } = useFetch<ICategoria[]>('/api/categorias/');
    const { data: generos } = useFetch<IGenero[]>('/api/generos/');

    const idRopa = categorias?.find((c) => c.nombre.toLowerCase().includes('ropa'))?.id;
    const idAccesorios = categorias?.find((c) => c.nombre.toLowerCase().includes('acces'))?.id;
    const idHombre = generos?.find((g) => g.nombre.toLowerCase() === 'hombre')?.id;
    const idMujer = generos?.find((g) => g.nombre.toLowerCase() === 'mujer')?.id;

    const linkRopaHombre = idRopa && idHombre ? `/productos?categoria=${idRopa}&genero=${idHombre}` : '/productos?search=ropa%20hombre';
    const linkRopaMujer = idRopa && idMujer ? `/productos?categoria=${idRopa}&genero=${idMujer}` : '/productos?search=ropa%20mujer';
    const linkAccesorios = idAccesorios ? `/productos?categoria=${idAccesorios}` : '/productos?search=accesorios';

    return (
      <section className="flex flex-col md:flex-row p-4 md:gap-6 md:p-8 max-w-7xl mx-auto lg:px-10">
          <Link to={linkRopaHombre} className="group relative flex-1 h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden no-underline">
              <img loading="lazy" decoding="async" src="/imagenes/ropa.png" alt="Ropa Hombre" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-gradient-t from-black/80 via-black/20 to-transparent z-10 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-20 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ROPA DE HOMBRE</h2>
                  <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
          <Link to={linkRopaMujer} className="group relative flex-1 h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden no-underline">
              <img loading="lazy" decoding="async" src="/imagenes/Gemini_Generated_Image_vbzj6tvbzj6tvbzj.png" alt="Ropa Mujer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-gradient from-black/80 via-black/20 to-transparent z-10 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-20 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ROPA DE MUJER</h2>
                   <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
           <Link to={linkAccesorios} className="group relative flex-1 md:flex-[0.5] h-[300px] md:h-[450px] flex flex-col justify-end items-start p-6 md:p-10 text-white overflow-hidden no-underline">
              <img loading="lazy" decoding="async" src="/imagenes/accesorios.png" alt="Accesorios" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-gradient from-black/80 via-black/20 to-transparent z-10 transition-all duration-300 group-hover:from-black/90"></div>
              <div className="relative z-20 w-full">
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase">ACCESORIOS</h2>
                   <span className="text-3xl font-black text-white inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
              </div>
          </Link>
      </section>
    );
}
