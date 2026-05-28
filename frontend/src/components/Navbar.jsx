import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logoAmadas from "../assets/img/amadaslogo.png";

function Navbar() {
  // controla se o menu hamburguer tá aberto ou fechado no mobile
  const [menuOpen, setMenuOpen] = useState(false);

  // verifica se tem alguém logado (!! converte o valor pra true/false)
  const [logado, setLogado] = useState(!!sessionStorage.getItem("usuario"));

  // useLocation devolve a rota atual — uso pra detectar quando a página muda
  const location = useLocation();

  // toda vez que o usuário navega pra outra página:
  // 1. atualiza se tá logado ou não (cobre o caso de login e logout)
  // 2. fecha o menu mobile (pra não ficar aberto depois de navegar)
  useEffect(() => {
    setLogado(!!sessionStorage.getItem("usuario"));
    setMenuOpen(false);
  }, [location]);

  // fecha o menu se clicar em qualquer lugar fora da <nav>
  // só ativa esse listener quando o menu tá aberto (otimização básica)
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest("nav")) setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    // cleanup: remove o listener quando o efeito rodar de novo ou o componente sumir
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  // quando o menu tá aberto no celular, trava o scroll da página de baixo
  // o return do useEffect desfaz quando o menu fechar
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // os links mudam dependendo se tá logado:
  // — não logado: aparece "Login"
  // — logado: aparece "Admin" (o spread condicional adiciona o objeto certo)
  const links = [
    { to: "/",            label: "Início" },
    { to: "/como-ajudar", label: "Como ajudar?" },
    { to: "/contato",     label: "Contato" },
    ...(!logado ? [{ to: "/login", label: "Login" }] : []),
    ...(logado  ? [{ to: "/admin", label: "Admin"  }] : []),
  ];

  return (
    <nav>
      {/* logo clicável que volta pra home */}
      <Link to="/" aria-label="Página inicial">
        <img src={logoAmadas} className="logo-img" alt="Logo Amadas" />
      </Link>

      {/* botão hamburguer — só aparece no mobile via CSS */}
      <button
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
      >
        {/* as três linhas do hamburguer — viram X quando .open tá ativo */}
        <span />
        <span />
        <span />
      </button>

      {/* lista de links — .active aparece quando menuOpen é true */}
      <ul className={`nav-list ${menuOpen ? "active" : ""}`} role="menubar">
        {links.map(({ to, label }) => (
          <li key={to} role="none">
            <Link
              to={to}
              role="menuitem"
              // aria-current="page" destaca visualmente o link da página atual
              aria-current={location.pathname === to ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
