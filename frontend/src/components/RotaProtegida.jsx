import { Navigate } from "react-router-dom";

// RotaProtegida é um "wrapper" — envolve qualquer página que precisa de login
// se não tiver logado, redireciona pro /login antes de renderizar qualquer coisa
//
// como usar no App.jsx:
//   <Route path="/admin" element={<RotaProtegida><AdminTela /></RotaProtegida>} />
function RotaProtegida({ children }) {
  // pega o usuário do sessionStorage (fica salvo enquanto a aba tiver aberta)
  const usuario = sessionStorage.getItem("usuario");

  // se não tiver ninguém logado, manda pro login
  // replace={true} evita que o /admin fique no histórico do navegador
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // se tiver logado, renderiza o componente filho normalmente
  return children;
}

export default RotaProtegida;
