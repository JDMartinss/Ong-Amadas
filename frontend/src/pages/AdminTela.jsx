import { useNavigate } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import "../styles/adminTela.css";

function AdminTela() {
  const navigate = useNavigate();

  // quando clica em "Sair": remove o usuário da sessão e manda pro login
  // sessionStorage.removeItem é mais seguro que só navegar — garante que limpou de verdade
  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="admin-container">
      <ScrollToTop />

      <header className="admin-header">
        <div className="admin-header__top">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie o conteúdo do site ONG Amadas.</p>
          </div>
          <button type="button" className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </header>

      <section className="admin-section">
        <h2>Gerenciar Carrossel</h2>

        {/* TODO: essa parte tá só visual ainda, sem funcionalidade real */}
        {/* pra implementar de verdade precisaria: upload pro servidor, salvar URL no banco, */}
        {/* e o Carousel.jsx buscar as imagens do backend em vez de ter elas fixas */}
        <div className="admin-card">
          <h3>Adicionar Nova Foto</h3>
          <div className="admin-form">
            <div className="form-group">
              <label htmlFor="carousel-img">Escolha uma imagem do seu computador:</label>
              <input type="file" id="carousel-img" accept="image/*" />
            </div>

            <div className="form-group">
              {/* htmlFor tem que bater com o id do input acima — é assim que vincula o label ao campo */}
              <label htmlFor="img-alt">Descrição da Imagem (Texto Alternativo):</label>
              <input
                type="text"
                id="img-alt"
                placeholder="Ex: Crianças jogando futebol na quadra"
              />
            </div>

            {/* button type="button" pra não submeter form por acidente */}
            <button type="button" className="btn-primary">Fazer Upload para o Carrossel</button>
          </div>
        </div>

        {/* TODO: aqui deveria listar as fotos que já estão no carrossel */}
        {/* mas como as imagens tão hardcoded no Carousel.jsx, ainda não puxa dinamicamente */}
        <div className="admin-card">
          <h3>Fotos Atuais no Carrossel</h3>

          <div className="photos-grid">
            <div className="photo-item">
              <div className="photo-preview">
                <span>Preview da Imagem 1</span>
              </div>
              <div className="photo-actions">
                <button type="button" className="btn-secondary">Trocar</button>
                <button type="button" className="btn-danger">Remover</button>
              </div>
            </div>

            <div className="photo-item">
              <div className="photo-preview">
                <span>Preview da Imagem 2</span>
              </div>
              <div className="photo-actions">
                <button type="button" className="btn-secondary">Trocar</button>
                <button type="button" className="btn-danger">Remover</button>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}

export default AdminTela;
