import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./layouts/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { QRLoginPage } from "./pages/QRLoginPage";
import VotacionesPage from "./pages/VotacionesPage";
import ManhwasPage from "./pages/ManhwasPage";
import AportesPage from "./pages/AportesPage";
import PedidosPage from "./pages/PedidosPage";
import LogsPage from "./pages/LogsPage";
import GruposPage from "./pages/GruposPage";
import UsuariosPage from "./pages/UsuariosPage";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/whatsapp" element={<QRLoginPage />} />
                    <Route path="/votaciones" element={<VotacionesPage />} />
                    <Route path="/manhwas" element={<ManhwasPage />} />
                    <Route path="/aportes" element={<AportesPage />} />
                    <Route path="/pedidos" element={<PedidosPage />} />
                    <Route path="/logs" element={<LogsPage />} />
                    <Route path="/grupos" element={<GruposPage />} />
                    <Route path="/usuarios" element={<UsuariosPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
