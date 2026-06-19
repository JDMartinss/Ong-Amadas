import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

// pega a URL da API do .env — se não tiver o arquivo .env, usa o localhost padrão
// em produção o .env vai ter: VITE_API_URL=https://meu-servidor.com
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

// !!!!! isso daqui não é ideal em produção mas funciona para o projeto da ONG por enquanto
const ADMIN_EMAIL = "adminONG2026@gmail.com";
const ADMIN_SENHA = "ongAmAdAs2026";

function Login() {
  // controla qual formulário tá visível: "signin" = login, "signup" = cadastro
  const [panel, setPanel] = useState("signin");
  const isActive = panel === "signup";  // atalho pra não repetir a comparação
  const navigate = useNavigate();  // pra redirecionar depois do login

  // estados dos campos do formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // estados dos campos do formulário de cadastro
  const [cadNome,  setCadNome]  = useState("");
  const [cadEmail, setCadEmail] = useState("");
  const [cadSenha, setCadSenha] = useState("");

  // estado do feedback visual (mensagem de sucesso ou erro)
  const [msg,     setMsg]     = useState("");    // texto da mensagem
  const [msgTipo, setMsgTipo] = useState("");    // "ok" ou "erro" (muda a cor)
  const [loading, setLoading] = useState(false); // desabilita o botão enquanto aguarda resposta

  // mostra uma mensagem e some depois de 4 segundos
  const exibirMsg = (texto, tipo) => {
    setMsg(texto);
    setMsgTipo(tipo);
    setTimeout(() => setMsg(""), 4000);
  };

  // função chamada quando o form de login é submetido
  const handleLogin = async (e) => {
    e.preventDefault(); 
    setLoading(true);

    if (loginEmail === ADMIN_EMAIL && loginSenha === ADMIN_SENHA) {
      sessionStorage.setItem("usuario", JSON.stringify({ nome: "Admin", email: ADMIN_EMAIL, admin: true }));
      exibirMsg("Bem-vindo, Admin! ✅", "ok");
      setTimeout(() => navigate("/admin"), 1000);  // espera 1s pra mostrar a mensagem antes de redirecionar
      setLoading(false);
      return;
    }

    // login normal: manda email e senha pro backend e aguarda resposta
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const data = await res.json();

      if (data.ok) {
        // login deu certo! salva o usuário na sessão e vai pra home
        sessionStorage.setItem("usuario", JSON.stringify(data.usuario));
        exibirMsg(`Bem-vindo, ${data.usuario.nome}! ✅`, "ok");
        setTimeout(() => navigate("/"), 1000);
      } else {
        // servidor respondeu mas deu erro (ex: senha errada)
        exibirMsg(data.msg || "Erro ao entrar.", "erro");
      }
    } catch {
      // catch sem variável = não preciso do erro em si, só sei que falhou
      // provavelmente o servidor tá offline ou sem internet
      exibirMsg("Não foi possível conectar ao servidor.", "erro");
    } finally {
      // finally sempre roda, independente de ter dado certo ou não
      setLoading(false);
    }
  };

  // função chamada quando o form de cadastro é submetido
  const handleCadastro = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: cadNome, email: cadEmail, senha: cadSenha }),
      });
      const data = await res.json();

      if (data.ok) {
        exibirMsg("Cadastro realizado! Agora faça login. ✅", "ok");
        // limpa os campos e volta pro painel de login
        setCadNome(""); setCadEmail(""); setCadSenha("");
        setPanel("signin");
      } else {
        exibirMsg(data.msg || "Erro no cadastro.", "erro");
      }
    } catch {
      exibirMsg("Não foi possível conectar ao servidor.", "erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* login-box fica com classe "active" quando tá no painel de cadastro */}
      <div className={`login-box ${isActive ? "active" : ""}`}>

        {/* mensagem de feedback — só aparece quando tem algo no state "msg" */}
        {msg && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",  // centraliza horizontalmente
              zIndex: 9999,
              background: msgTipo === "ok" ? "#d4edda" : "#f8d7da",  // verde ou vermelho
              color:      msgTipo === "ok" ? "#155724" : "#721c24",
              border:     `1px solid ${msgTipo === "ok" ? "#c3e6cb" : "#f5c6cb"}`,
              padding: "10px 22px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
            role="alert"  // aria: anuncia pra leitores de tela automaticamente
          >
            {msg}
          </div>
        )}

        {/* abas de mobile — só aparece em telas pequenas via CSS */}
        <div className="login-tabs" role="tablist" aria-label="Tipo de acesso">
          <button
            role="tab"
            aria-selected={panel === "signin"}
            className={`login-tab-btn ${panel === "signin" ? "active" : ""}`}
            onClick={() => setPanel("signin")}
          >
            Entrar
          </button>
          <button
            role="tab"
            aria-selected={panel === "signup"}
            className={`login-tab-btn ${panel === "signup" ? "active" : ""}`}
            onClick={() => setPanel("signup")}
          >
            Cadastrar
          </button>
        </div>

        {/* formulário de cadastro — visível quando panel === "signup" */}
        <div
          className={`form-container sign-up ${panel === "signup" ? "visible" : ""}`}
          role="tabpanel"
          aria-label="Criar conta"
        >
          <form onSubmit={handleCadastro} noValidate>
            <h1>Criar Conta</h1>
            <span>use seu e-mail para se cadastrar</span>

            <input
              type="text"
              placeholder="Nome"
              required
              autoComplete="name"
              value={cadNome}
              onChange={(e) => setCadNome(e.target.value)}
            />
            <input
              type="email"
              placeholder="E-mail"
              required
              autoComplete="email"
              value={cadEmail}
              onChange={(e) => setCadEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              required
              autoComplete="new-password"
              value={cadSenha}
              onChange={(e) => setCadSenha(e.target.value)}
            />

            {/* disabled enquanto loading evita duplo clique e requisições duplicadas */}
            <button type="submit" disabled={loading}>
              {loading ? "Aguarde..." : "Cadastrar"}
            </button>
          </form>
        </div>

        {/* formulário de login — visível quando panel === "signin" */}
        <div
          className={`form-container sign-in ${panel === "signin" ? "visible" : ""}`}
          role="tabpanel"
          aria-label="Entrar"
        >
          <form onSubmit={handleLogin} noValidate>
            <h1>Entrar</h1>
            <span>use seu e-mail e senha</span>

            <input
              type="email"
              placeholder="E-mail"
              required
              autoComplete="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              required
              autoComplete="current-password"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Aguarde..." : "Entrar"}
            </button>
          </form>
        </div>

        {/* painel deslizante que aparece só no desktop — aria-hidden pq é decorativo */}
        <div className="toggle-container" aria-hidden="true">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Bem-vindo de volta!</h1>
              <p>Insira seus dados para acessar o site da Amadas!</p>
              <button className="hidden" onClick={() => setPanel("signin")}>
                Entrar
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Olá, Amigo!</h1>
              <p>Cadastre-se para usar todos os recursos do site!</p>
              <button className="hidden" onClick={() => setPanel("signup")}>
                Cadastrar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
