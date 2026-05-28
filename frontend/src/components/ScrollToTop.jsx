import { useEffect, useState } from "react";

// só aparece o botão depois de rolar mais de 300px pra baixo
const THRESHOLD = 300;

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // onScroll roda toda vez que o usuário rola a página
    const onScroll = () => setVisible(window.scrollY > THRESHOLD);

    // passive: true é uma dica pro navegador que esse listener não vai chamar preventDefault()
    // deixa a rolagem mais suave, principalmente no mobile
    window.addEventListener("scroll", onScroll, { passive: true });

    // cleanup: remove o listener quando o componente sair da tela
    return () => window.removeEventListener("scroll", onScroll);
  }, []); // array vazio = roda só uma vez quando o componente monta

  // se não tiver visível, não renderiza nada (null = componente invisível no React)
  if (!visible) return null;

  return (
    <button
      id="toTop"
      // behavior: "smooth" faz a animação de subir devagar, fica muito mais bonito
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Voltar ao topo"
      title="Voltar ao topo"
    >
      ↑
    </button>
  );
}

export default ScrollToTop;
