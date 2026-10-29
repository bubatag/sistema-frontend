import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider, useAuth } from "@/lib/AuthContext";
import PageNotFound from "./lib/PageNotFound";
import AppLayout from "./components/layout/AppLayout";
import Logo from "./components/brand/Logo";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Bubalinos from "./pages/Bubalinos";
import Coleiras from "./pages/Coleiras";
import Localizacao from "./pages/Localizacao";
import Perfil from "./pages/Perfil";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

function AuthenticatedApp() {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background">
        <Logo size={64} showText={false} className="animate-pulse" />
        <div className="h-1 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-brand-gradient" />
        </div>
      </div>
    );
  }

  // Sem usuário autenticado: permite login e cadastro.
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Com usuário autenticado: libera as páginas do sistema.
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bubalinos" element={<Bubalinos />} />
        <Route path="/coleiras" element={<Coleiras />} />
        <Route path="/localizacao" element={<Localizacao />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/cadastro" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>

        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;