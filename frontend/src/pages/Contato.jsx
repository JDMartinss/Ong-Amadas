import ScrollToTop from "../components/ScrollToTop";
import "../styles/contato.css";

function Contato() {
  return (
    <>
      <div className="contato-wrapper">
        <div className="container">
          <h1>Contato — ONG Amadas</h1>

          <section className="card" aria-label="Dúvidas e Informações">
            <h2>Dúvidas e Informações</h2>
            <div className="contact-item">
              <strong>WhatsApp:</strong>{" "}
              <a
                href="https://wa.me/5511959356835"
                target="_blank"
                rel="noopener noreferrer"
              >
                (11) 95935-6835
              </a>
            </div>
            <div className="contact-item">
              <strong>Instagram:</strong>{" "}
              <a
                href="https://www.instagram.com/amadasassociacao/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @amadasassociacao
              </a>
            </div>
          </section>

          <section className="card" aria-label="Associe-se">
            <h2>Associe-se</h2>
            <div className="contact-item">
              <strong>E-mail:</strong>{" "}
              <a href="mailto:amadasong@gmail.com">amadasong@gmail.com</a>
            </div>
          </section>

          <section className="card" aria-label="Localização">
            <h2>Localização</h2>
            <p>
              Av. Francisco Samuel Luchesi Filho, 770 — Penha,
              Bragança Paulista — SP
            </p>
            <div className="map-box">
              <iframe
                src="https://www.google.com/maps?q=Amadas+associação+mães+e+Pais+de+Autistas,+Bragança+Paulista+SP&output=embed"
                title="Localização ONG Amadas no Google Maps"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        </div>
      </div>

      <ScrollToTop />
    </>
  );
}

export default Contato;
