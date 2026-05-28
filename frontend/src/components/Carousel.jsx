import { useState, useEffect, useCallback } from "react";
import imgBatman from "../assets/img/batman.jpg";
import imgJunto from "../assets/img/todomundojunto.jpg";
import imgFut from "../assets/img/criancasnofut.jpg";

// quer adicionar ou remover fotos do carrossel? só mexe aqui nesse array!
// não precisa ir lá embaixo no JSX, deixei centralizado de propósito
const SLIDES = [
  { src: imgBatman, alt: "Evento com fantasia de Batman" },
  { src: imgJunto,  alt: "Todo mundo junto" },
  { src: imgFut,    alt: "Crianças no futuro" },
];

// quantos milissegundos entre cada troca automática (4000 = 4 segundos)
const AUTO_INTERVAL = 4000;

function Carousel() {
  // index guarda qual slide tá aparecendo agora (começa no 0)
  const [index, setIndex] = useState(0);

  // useCallback evita que prev() e next() sejam recriados a cada render
  // isso é IMPORTANTE porque o next() é dependência do useEffect do autoplay
  // sem useCallback, o efeito reiniciaria o setInterval a cada render = bug
  const prev = useCallback(() => {
    // se tiver no primeiro, volta pro último (lógica circular)
    setIndex((i) => (i === 0 ? SLIDES.length - 1 : i - 1));
  }, []);

  const next = useCallback(() => {
    // % SLIDES.length faz o "loop": depois do último volta pro 0
    setIndex((i) => (i + 1) % SLIDES.length);
  }, []);

  // autoplay: chama next() a cada AUTO_INTERVAL ms
  // o clearInterval no return é o "cleanup" — para o timer quando o componente some
  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  // navegação pelo teclado quando o carrossel tá focado
  // seta pra esquerda = slide anterior, seta pra direita = próximo
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft")  prev();
    if (e.key === "ArrowRight") next();
  };

  return (
    <div
      className="carousel"
      role="region"
      aria-label="Carrossel de imagens"
      onKeyDown={handleKeyDown}
      tabIndex={0}  // tabIndex={0} deixa o div focável pelo Tab do teclado
    >
      {/* key={index} força o React a recriar a tag img quando o slide muda */}
      <img
        src={SLIDES[index].src}
        alt={SLIDES[index].alt}
        key={index}
      />

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

      {/* os pontinhos de navegação embaixo do carrossel */}
      <div className="carousel__dots" role="tablist" aria-label="Slides">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === index}  // o ponto ativo fica destacado via CSS
            aria-label={`Slide ${i + 1}`}
            className={`carousel__dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}  // clicar no ponto vai direto pra aquele slide
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
