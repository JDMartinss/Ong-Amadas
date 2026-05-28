import Carousel from "../components/Carousel";
import ScrollToTop from "../components/ScrollToTop";
import "../styles/home.css";

// defini o array aqui fora do componente pra ele não ser recriado a cada render
const MVV = [
  {
    titulo: "Missão",
    texto: "Promover a inclusão e o bem-estar das famílias de autistas através do suporte mútuo.",
  },
  {
    titulo: "Visão",
    texto: "Ser referência em acolhimento e suporte familiar na região de Bragança Paulista.",
  },
  {
    titulo: "Valores",
    texto: "Empatia, transparência, respeito e solidariedade.",
  },
];

function Home() {
  return (
    <>
      <main className="home-main">
        {/* carrossel de imagens no topo */}
        <Carousel />

        {/* seção Sobre Nós */}
        <section className="sobre-nos">
          <div className="container">
            <h2>Sobre Nós</h2>
            <p>
              A ONG Amadas é uma associação dedicada ao acolhimento e suporte de mães
              e pais de autistas. Nosso objetivo é criar uma rede de apoio sólida,
              oferecendo orientação, troca de experiências e auxílio para as famílias
              que convivem com o autismo diariamente.
            </p>
          </div>
        </section>

        {/* seção Missão, Visão e Valores — gerada pelo .map() no array acima */}
        {/* se precisar mudar o texto, só editar o array MVV lá em cima! */}
        <section className="mvv" aria-label="Missão, Visão e Valores">
          <div className="mvv__grid">
            {MVV.map(({ titulo, texto }) => (
              // key={titulo} é obrigatório em listas no React pra ele identificar cada item
              <div key={titulo} className="mvv__box">
                <h2>{titulo}</h2>
                <p>{texto}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* botão flutuante de voltar ao topo — só aparece quando rolar pra baixo */}
      <ScrollToTop />
    </>
  );
}

export default Home;
