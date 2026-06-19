function Footer() {
  // pega o ano atual dinamicamente — assim o copyright nunca fica desatualizado
  // tipo, em 2027 vai mostrar "© 2027" sozinho sem precisar mudar nada no código
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "var(--color-primary)",  // usa a variável CSS definida no global.css
        color: "#fff",
        padding: "20px var(--space-md)",
        textAlign: "center",
        fontSize: "14px",
        lineHeight: 1.6,
      }}
    >
      <p>
        © {year} ONG Amadas — Associação de Mães e Pais de Autistas.
        <br />
        Todos os direitos reservados.
      </p>
    </footer>
  );
}

export default Footer;
