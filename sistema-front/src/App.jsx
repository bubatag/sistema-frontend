
import { Toaster } from "@/components/ui/toaster";
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
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-lg font-bold text-primary animate-pulse">
              B
            </span>
          </div>

          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
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
      </Route>

      <Route
        path="/login"
        element={<Navigate to="/" replace />}
      />

      <Route
        path="/cadastro"
        element={<Navigate to="/" replace />}
      />

      <Route path="*" element={<PageNotFound />} />
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
