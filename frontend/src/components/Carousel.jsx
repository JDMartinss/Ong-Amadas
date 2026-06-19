import { useState, useEffect, useCallback } from "react";
import imgBatman from "../assets/img/batman.jpg";
import imgJunto from "../assets/img/todomundojunto.jpg";
import imgFut from "../assets/img/criancasnofut.jpg";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// imagens padrão: aparecem quando o backend está vazio ou offline
const DEFAULT_SLIDES = [
  { src: imgBatman, alt: "Evento com fantasia de Batman" },
  { src: imgJunto, alt: "Todo mundo junto" },
  { src: imgFut, alt: "Crianças no futuro" },
];

// quantos milissegundos entre cada troca automática (4000 = 4 segundos)
const AUTO_INTERVAL = 4000;

function Carousel() {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    let ignorarResposta = false;

    const carregarImagens = async () => {
      try {
        const res = await fetch(`${API_URL}/carrossel`);
        const data = await res.json();

        if (!ignorarResposta && data.ok && data.imagens?.length > 0) {
          setSlides(data.imagens.map((img) => ({ src: img.url, alt: img.alt })));
          setIndex(0);
        }
      } catch {
        // se o backend estiver offline, o site continua usando as imagens padrão
      }
    };

    carregarImagens();
    return () => {
      ignorarResposta = true;
    };
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  }, [slides.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-label="Carrossel de imagens"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <img src={slides[index].src} alt={slides[index].alt} key={slides[index].src} />

      {slides.length > 1 && (
        <>
          <button
            className="carousel__btn carousel__btn--prev"
            onClick={prev}
            aria-label="Imagem anterior"
          >
            ←
          </button>

          <button
            className="carousel__btn carousel__btn--next"
            onClick={next}
            aria-label="Próxima imagem"
          >
            →
          </button>

          <div className="carousel__dots" role="tablist" aria-label="Slides">
            {slides.map((slide, i) => (
              <button
                key={`${slide.src}-${i}`}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                className={`carousel__dot ${i === index ? "active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Carousel;
