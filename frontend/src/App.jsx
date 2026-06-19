// App.jsx é tipo o "mapa" do site inteiro
// aqui eu digo qual componente aparece em cada URL
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RotaProtegida from "./components/RotaProtegida";
import Home from "./pages/Home";
import Contato from "./pages/Contato";
import ComoAjudar from "./pages/ComoAjudar";
import Login from "./pages/Login";
import AdminTela from "./pages/AdminTela";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/"            element={<Home />} />
        <Route path="/contato"     element={<Contato />} />
        <Route path="/como-ajudar" element={<ComoAjudar />} />
        <Route path="/login"       element={<Login />} />

        {/* /admin só abre se tiver logado — RotaProtegida verifica isso */}
        {/* se não tiver logado vai redirecionar pro /login automático */}
        <Route path="/admin" element={
          <RotaProtegida>
            <AdminTela />
          </RotaProtegida>
        } />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
