import ScrollToTop from "../components/ScrollToTop";
import "../styles/comoAjudar.css";

function ComoAjudar() {
  return (
    <>
      <main className="page-content">
        <section className="container">
          <h1>Como ajudar?</h1>
          <h2>Participe desta causa!</h2>
          <p>
            A ONG Amadas depende de doações e da colaboração de voluntários para
            manter seus projetos. Não recebemos recursos públicos e contamos com
            quem acredita na nossa causa.
          </p>
          <p>
            Sua contribuição permite que continuemos acolhendo e orientando quem
            precisa de forma simples e humana.
          </p>
        </section>

        <section className="card donation-card" aria-label="Doações via PIX">
          <h2>Doações via PIX</h2>
          <p>Contribua para manter nossos projetos ativos:</p>

          <div className="contact-item">
            <strong>
              Chave PIX (CNPJ):{" "}
              <img src="/pix.png" alt="Logo Pix" />
            </strong>
            <br />
            <a
            >
              26.644.168/0001-23
            </a>
          </div>

          <div className="contact-item">
            <strong>Nome:</strong> <span>ONG Amadas</span>
          </div>

          <div className="contact-item">
            <strong>Banco:</strong> <span>000 - Banco do Brasil</span>
          </div>
        </section>
      </main>

      <ScrollToTop />
    </>
  );
}

export default ComoAjudar;
