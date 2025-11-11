import { useState } from 'react';

const reelsData = [
  { id: 1, src: '/videos/Jordan Retro.mp4' },
  { id: 2, src: '/videos/Mochila.mp4' },
  { id: 3, src: '/videos/VOMERO.mp4' },
  { id: 4, src: '/videos/Jordan Spizike.mp4' },
];

export default function ReelsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');

  const openModal = (videoSrc) => {
    setCurrentVideo(videoSrc);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentVideo('');
    document.body.style.overflow = 'unset';
  };

  return (
    <section className="py-12 px-4 md:px-12 text-center bg-[#f9f9f9]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-black uppercase flex items-center justify-center gap-2">
          Nuestro Contenido <i className="fab fa-instagram text-2xl"></i>
        </h2>
         <p className="text-gray-600 mt-2">Síguenos en instagram @streetwear.peru</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reelsData.map((reel) => (
          <div
            key={reel.id}
            className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:-translate-y-1"
            onClick={() => openModal(reel.src)}
          >
            <video src={reel.src} className="w-full h-full object-cover" muted loop playsInline />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <i className="fas fa-play text-4xl mb-2"></i>
              <span className="font-bold tracking-wider text-sm">VER VIDEO</span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex justify-center items-center p-4" onClick={closeModal}>
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white text-4xl font-bold leading-none hover:text-gray-300"
              onClick={closeModal}
            >
              &times;
            </button>
            <video src={currentVideo} controls autoPlay className="w-full rounded-xl max-h-[80vh] bg-black" />
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