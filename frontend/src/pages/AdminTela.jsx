import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import "../styles/adminTela.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function formatarData(valor) {
  if (!valor) return "-";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AdminTela() {
  const navigate = useNavigate();
  const [arquivo, setArquivo] = useState(null);
  const [alt, setAlt] = useState("");
  const [imagens, setImagens] = useState([]);
  const [dados, setDados] = useState({ usuarios: [], eventos: [], inscricoes: [], totais: {} });
  const [filtros, setFiltros] = useState({ usuario: "", evento: "" });
  const [novoEvento, setNovoEvento] = useState({
    nome_evento: "",
    data: "",
    local: "",
    descricao: "",
  });
  const [novaInscricao, setNovaInscricao] = useState({
    usuario_id: "",
    evento_id: "",
  });
  const [msg, setMsg] = useState("");
  const [msgTipo, setMsgTipo] = useState("ok");
  const [loading, setLoading] = useState(false);
  const [salvandoEvento, setSalvandoEvento] = useState(false);
  const [salvandoInscricao, setSalvandoInscricao] = useState(false);

  const exibirMsg = (texto, tipo = "ok") => {
    setMsg(texto);
    setMsgTipo(tipo);
    setTimeout(() => setMsg(""), 4000);
  };

  const carregarDados = async (filtrosAtuais = filtros) => {
    const params = new URLSearchParams();
    if (filtrosAtuais.usuario.trim()) params.set("usuario", filtrosAtuais.usuario.trim());
    if (filtrosAtuais.evento.trim()) params.set("evento", filtrosAtuais.evento.trim());

    const query = params.toString() ? `?${params.toString()}` : "";

    try {
      const res = await fetch(`${API_URL}/admin/dados${query}`);
      const data = await res.json();

      if (data.ok) {
        setImagens(data.imagens || []);
        setDados({
          usuarios: data.usuarios || [],
          eventos: data.eventos || [],
          inscricoes: data.inscricoes || [],
          totais: data.totais || {},
        });
      } else {
        exibirMsg(data.msg || "Não foi possível carregar os dados.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    }
  };

  useEffect(() => {
    carregarDados({ usuario: "", evento: "" });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!arquivo) {
      exibirMsg("Escolha uma imagem primeiro.", "erro");
      return;
    }

    const formData = new FormData();
    formData.append("imagem", arquivo);
    formData.append("alt", alt);

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/carrossel`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Imagem adicionada ao carrossel! ✅", "ok");
        setArquivo(null);
        setAlt("");
        e.target.reset();
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao fazer upload.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    } finally {
      setLoading(false);
    }
  };

  const handleRemover = async (id) => {
    const confirmar = window.confirm("Tem certeza que deseja remover esta imagem do carrossel?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/admin/carrossel/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Imagem removida do carrossel.", "ok");
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao remover imagem.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    }
  };

  const handleAltChange = async (id, novoAlt) => {
    try {
      const res = await fetch(`${API_URL}/admin/carrossel/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: novoAlt }),
      });
      const data = await res.json();

      if (!data.ok) {
        exibirMsg(data.msg || "Erro ao atualizar descrição.", "erro");
      } else {
        await carregarDados();
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    }
  };

  const handleFiltroChange = (campo, valor) => {
    const novosFiltros = { ...filtros, [campo]: valor };
    setFiltros(novosFiltros);
    carregarDados(novosFiltros);
  };

  const limparFiltros = () => {
    const novosFiltros = { usuario: "", evento: "" };
    setFiltros(novosFiltros);
    carregarDados(novosFiltros);
  };

  const atualizarEvento = (campo, valor) => {
    setNovoEvento((atual) => ({ ...atual, [campo]: valor }));
  };

  const cadastrarEvento = async (e) => {
    e.preventDefault();
    setSalvandoEvento(true);

    try {
      const res = await fetch(`${API_URL}/admin/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoEvento),
      });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Evento cadastrado com sucesso! ✅", "ok");
        setNovoEvento({ nome_evento: "", data: "", local: "", descricao: "" });
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao cadastrar evento.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    } finally {
      setSalvandoEvento(false);
    }
  };

  const removerEvento = async (idEvento) => {
    const confirmar = window.confirm("Tem certeza que deseja remover este evento?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/admin/eventos/${idEvento}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Evento removido.", "ok");
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao remover evento.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    }
  };

  const atualizarInscricao = (campo, valor) => {
    setNovaInscricao((atual) => ({ ...atual, [campo]: valor }));
  };

  const cadastrarInscricao = async (e) => {
    e.preventDefault();
    setSalvandoInscricao(true);

    try {
      const res = await fetch(`${API_URL}/admin/inscricoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaInscricao),
      });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Inscrição cadastrada com sucesso! ✅", "ok");
        setNovaInscricao({ usuario_id: "", evento_id: "" });
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao cadastrar inscrição.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    } finally {
      setSalvandoInscricao(false);
    }
  };

  const removerInscricao = async (idInscricao) => {
    const confirmar = window.confirm("Tem certeza que deseja remover esta inscrição?");
    if (!confirmar) return;

    try {
      const res = await fetch(`${API_URL}/admin/inscricoes/${idInscricao}`, { method: "DELETE" });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Inscrição removida.", "ok");
        await carregarDados();
      } else {
        exibirMsg(data.msg || "Erro ao remover inscrição.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao backend.", "erro");
    }
  };

  return (
    <div className="admin-container">
      <ScrollToTop />

      <header className="admin-header">
        <div className="admin-header__top">
          <div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie o carrossel, cadastre eventos, inscreva usuários e visualize as tabelas salvas no SQLite.</p>
          </div>
          <button type="button" className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {msg && <div className={`admin-alert admin-alert--${msgTipo}`} role="alert">{msg}</div>}

      <section className="admin-section">
        <h2>Resumo do Banco de Dados</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card"><strong>{dados.totais.usuarios ?? 0}</strong><span>Usuários</span></div>
          <div className="dashboard-card"><strong>{dados.totais.imagens ?? 0}</strong><span>Imagens</span></div>
          <div className="dashboard-card"><strong>{dados.totais.eventos ?? 0}</strong><span>Eventos</span></div>
          <div className="dashboard-card"><strong>{dados.totais.inscricoes ?? 0}</strong><span>Inscrições</span></div>
        </div>
      </section>

      <section className="admin-section">
        <h2>Adicionar Evento</h2>
        <div className="admin-card">
          <form className="admin-form" onSubmit={cadastrarEvento}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nome-evento">Nome do evento:</label>
                <input
                  type="text"
                  id="nome-evento"
                  placeholder="Ex: Palestra de conscientização"
                  value={novoEvento.nome_evento}
                  onChange={(e) => atualizarEvento("nome_evento", e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="data-evento">Data:</label>
                <input
                  type="date"
                  id="data-evento"
                  value={novoEvento.data}
                  onChange={(e) => atualizarEvento("data", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="local-evento">Local:</label>
              <input
                type="text"
                id="local-evento"
                placeholder="Ex: Sede da ONG Amadas"
                value={novoEvento.local}
                onChange={(e) => atualizarEvento("local", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao-evento">Descrição:</label>
              <textarea
                id="descricao-evento"
                placeholder="Descreva rapidamente o evento"
                value={novoEvento.descricao}
                onChange={(e) => atualizarEvento("descricao", e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={salvandoEvento}>
              {salvandoEvento ? "Salvando..." : "Salvar evento"}
            </button>
          </form>
        </div>
      </section>

      <section className="admin-section">
        <h2>Inscrever Usuário em Evento</h2>
        <div className="admin-card">
          <form className="admin-form" onSubmit={cadastrarInscricao}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="usuario-inscricao">Usuário:</label>
                <select
                  id="usuario-inscricao"
                  value={novaInscricao.usuario_id}
                  onChange={(e) => atualizarInscricao("usuario_id", e.target.value)}
                  required
                >
                  <option value="">Selecione um usuário</option>
                  {dados.usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome} - {usuario.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="evento-inscricao">Evento:</label>
                <select
                  id="evento-inscricao"
                  value={novaInscricao.evento_id}
                  onChange={(e) => atualizarInscricao("evento_id", e.target.value)}
                  required
                >
                  <option value="">Selecione um evento</option>
                  {dados.eventos.map((evento) => (
                    <option key={evento.id_evento} value={evento.id_evento}>
                      {evento.nome_evento} - {evento.data}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={salvandoInscricao}>
              {salvandoInscricao ? "Salvando..." : "Salvar inscrição"}
            </button>
          </form>
        </div>
      </section>

      <section className="admin-section">
        <h2>Gerenciar Carrossel</h2>

        <div className="admin-card">
          <h3>Adicionar Nova Foto</h3>
          <form className="admin-form" onSubmit={handleUpload}>
            <div className="form-group">
              <label htmlFor="carousel-img">Escolha uma imagem do seu computador:</label>
              <input
                type="file"
                id="carousel-img"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="img-alt">Descrição da Imagem:</label>
              <input
                type="text"
                id="img-alt"
                placeholder="Ex: Crianças jogando futebol na quadra"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Fazer Upload para o Carrossel"}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h3>Fotos Atuais no Carrossel</h3>

          {imagens.length === 0 ? (
            <p className="admin-empty">Ainda não existem fotos enviadas pelo painel.</p>
          ) : (
            <div className="photos-grid">
              {imagens.map((imagem) => (
                <div className="photo-item" key={imagem.id}>
                  <img className="photo-preview-img" src={imagem.url} alt={imagem.alt} />
                  <label className="photo-alt-label" htmlFor={`alt-${imagem.id}`}>Descrição:</label>
                  <input
                    id={`alt-${imagem.id}`}
                    className="photo-alt-input"
                    type="text"
                    defaultValue={imagem.alt}
                    onBlur={(e) => handleAltChange(imagem.id, e.target.value)}
                  />
                  <div className="photo-actions">
                    <button type="button" className="btn-danger" onClick={() => handleRemover(imagem.id)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="admin-section dados-section">
        <div className="dados-topbar">
          <h2>Dados das Tabelas do Sistema</h2>

          <div className="dados-filtros" aria-label="Filtros dos dados do sistema">
            <span className="dados-filtros__label">FILTRAR:</span>

            <div className="dados-filtro-item">
              <label htmlFor="filtro-usuario">Usuários</label>
              <input
                type="text"
                id="filtro-usuario"
                placeholder="Nome ou e-mail"
                value={filtros.usuario}
                onChange={(e) => handleFiltroChange("usuario", e.target.value)}
              />
            </div>

            <div className="dados-filtro-item">
              <label htmlFor="filtro-evento">Eventos</label>
              <input
                type="text"
                id="filtro-evento"
                placeholder="Nome, data, local..."
                value={filtros.evento}
                onChange={(e) => handleFiltroChange("evento", e.target.value)}
              />
            </div>

            <button type="button" className="btn-filter-clean" onClick={limparFiltros}>Limpar</button>
          </div>
        </div>

        <div className="admin-card dados-card">
          <div className="table-card-header">
            <h3>Usuários cadastrados</h3>
            <span>{dados.usuarios?.length ?? 0} registro(s)</span>
          </div>
          <Tabela dados={dados.usuarios} colunas={["id", "nome", "email", "criado_em"]} />
        </div>

        <div className="admin-card dados-card">
          <div className="table-card-header">
            <h3>Eventos cadastrados</h3>
            <span>{dados.eventos?.length ?? 0} registro(s)</span>
          </div>
          <TabelaEventos dados={dados.eventos} onRemover={removerEvento} />
        </div>

        <div className="admin-card dados-card">
          <div className="table-card-header">
            <h3>Imagens do carrossel</h3>
            <span>{imagens?.length ?? 0} registro(s)</span>
          </div>
          <Tabela dados={imagens} colunas={["id", "alt", "ordem", "ativa", "criado_em"]} />
        </div>

        <div className="admin-card dados-card">
          <div className="table-card-header">
            <h3>Inscrições em eventos</h3>
            <span>{dados.inscricoes?.length ?? 0} registro(s)</span>
          </div>
          <TabelaInscricoes dados={dados.inscricoes} onRemover={removerInscricao} />
        </div>
      </section>
    </div>
  );
}

function Tabela({ dados, colunas }) {
  if (!dados || dados.length === 0) {
    return <p className="admin-empty">Nenhum registro encontrado.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>{colunas.map((coluna) => <th key={coluna}>{coluna.replaceAll("_", " ")}</th>)}</tr>
        </thead>
        <tbody>
          {dados.map((item) => (
            <tr key={item.id}>
              {colunas.map((coluna) => {
                let valor = item[coluna];
                if (coluna === "criado_em") valor = formatarData(valor);
                return <td key={coluna}>{valor || "-"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabelaEventos({ dados, onRemover }) {
  if (!dados || dados.length === 0) {
    return <p className="admin-empty">Nenhum evento encontrado.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>id evento</th>
            <th>nome evento</th>
            <th>data</th>
            <th>local</th>
            <th>descrição</th>
            <th>ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((evento) => (
            <tr key={evento.id_evento}>
              <td>{evento.id_evento}</td>
              <td>{evento.nome_evento}</td>
              <td>{evento.data}</td>
              <td>{evento.local}</td>
              <td>{evento.descricao}</td>
              <td>
                <button type="button" className="btn-danger btn-small" onClick={() => onRemover(evento.id_evento)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function TabelaInscricoes({ dados, onRemover }) {
  if (!dados || dados.length === 0) {
    return <p className="admin-empty">Nenhuma inscrição encontrada.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>id inscrição</th>
            <th>usuário</th>
            <th>e-mail</th>
            <th>evento</th>
            <th>data evento</th>
            <th>local</th>
            <th>data inscrição</th>
            <th>ações</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((inscricao) => (
            <tr key={inscricao.id_inscricao}>
              <td>{inscricao.id_inscricao}</td>
              <td>{inscricao.usuario_nome}</td>
              <td>{inscricao.usuario_email}</td>
              <td>{inscricao.nome_evento}</td>
              <td>{inscricao.data_evento}</td>
              <td>{inscricao.local_evento}</td>
              <td>{formatarData(inscricao.data_inscricao)}</td>
              <td>
                <button type="button" className="btn-danger btn-small" onClick={() => onRemover(inscricao.id_inscricao)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTela;
