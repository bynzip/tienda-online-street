import { useState, useRef, useEffect } from 'react';

const reelsData: { id: number; src: string }[] = [
  { id: 1, src: '/videos/Jordan Retro.mp4' },
  { id: 2, src: '/videos/Mochila.mp4' },
  { id: 3, src: '/videos/VOMERO.mp4' },
  { id: 4, src: '/videos/Jordan Spizike.mp4' },
];

export default function ReelsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Determinar cuántos videos mostrar según el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // tablet
      } else {
        setItemsPerView(4); // desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const openModal = (videoSrc: string) => {
    setCurrentVideo(videoSrc);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentVideo('');
    document.body.style.overflow = 'unset';
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, reelsData.length - itemsPerView);
    setCurrentIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
  };

  const handlePrev = () => {
    const maxIndex = Math.max(0, reelsData.length - itemsPerView);
    setCurrentIndex((prev) => (prev - 1 < 0 ? maxIndex : prev - 1));
  };

  const visibleReels = reelsData.slice(currentIndex, currentIndex + itemsPerView);
  const isLastPage = currentIndex + itemsPerView >= reelsData.length;
  const isFirstPage = currentIndex === 0;

  return (
    <section className="py-8 md:py-12 px-4 md:px-8 text-center max-w-7xl mx-auto lg:px-10">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-black uppercase flex items-center justify-center gap-2">
          Nuestro Contenido <i className="fab fa-instagram text-xl md:text-2xl"></i>
        </h2>
        <p className="text-sm md:text-base text-gray-600 mt-2">Síguenos en instagram @streetwear.peru</p>
      </div>

      {/* Carrusel container */}
      <div className="relative flex items-center gap-2 md:gap-4">
        {/* Botón anterior */}
        <button
          onClick={handlePrev}
          disabled={isFirstPage}
          className="absolute left-0 z-10 -ml-3 md:-ml-6 p-2 rounded-full bg-black text-white hover:bg-gray-800 active:bg-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Video anterior"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carrusel items */}
        <div
          ref={carouselRef}
          className="flex gap-3 md:gap-4 overflow-hidden flex-1"
        >
          {visibleReels.map((reel) => (
            <div
              key={reel.id}
              className="flex-shrink-0 group relative aspect-9/16 rounded-lg md:rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:shadow-lg w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
              onClick={() => openModal(reel.src)}
            >
              <video
                src={reel.src}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <i className="fas fa-play text-3xl md:text-4xl mb-2"></i>
                <span className="font-bold tracking-wider text-xs md:text-sm">VER VIDEO</span>
              </div>
            </div>
          ))}
        </div>

        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          disabled={isLastPage}
          className="absolute right-0 z-10 -mr-3 md:-mr-6 p-2 rounded-full bg-black text-white hover:bg-gray-800 active:bg-gray-900 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Siguiente video"
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores de página */}
      <div className="flex justify-center gap-1 mt-6">
        {Array.from({
          length: Math.ceil(reelsData.length / itemsPerView),
        }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * itemsPerView)}
            className={`h-2 ${
              index === Math.floor(currentIndex / itemsPerView)
                ? 'w-6 bg-black'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir a página ${index + 1}`}
          />
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex justify-center items-center p-4"
          onClick={closeModal}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white text-3xl md:text-4xl font-bold leading-none hover:text-gray-300"
              onClick={closeModal}
              aria-label="Cerrar modal"
            >
              &times;
            </button>
            <video
              src={currentVideo}
              controls
              autoPlay
              className="w-full rounded-xl max-h-[80vh] bg-black"
            />
            <a
              href="https://www.instagram.com/streetwear.peru/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#E1306C] text-white font-bold rounded-full transition-transform hover:scale-105"
            >
              <i className="fab fa-instagram text-xl"></i> SEGUIR EN INSTAGRAM
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
