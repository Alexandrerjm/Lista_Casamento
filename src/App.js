import "./App.css";
import { AppProvider, useApp } from "./context/AppContext";
import { SplashPage, GuestLoginPage, AdminLoginPage } from "./pages/AuthPages";
import { ListPage } from "./pages/ListPage";
import { AdminPage } from "./pages/AdminPage";

// ─── Roteador de páginas ──────────────────────────────────────────────────────
function AppRouter() {
  const { page, settings, loading, error, retry, toast, isAdmin } = useApp();

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="loading-text">Carregando...</p>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="error-icon">⚠️</div>
      <p className="error-title">Erro ao carregar</p>
      <p className="error-body">{error}</p>
      <button className="btn-primary" onClick={retry}>Tentar novamente</button>
    </div>
  );

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      {page === "splash"       && <SplashPage />}
      {page === "guest-login"  && <GuestLoginPage />}
      {page === "admin-login"  && <AdminLoginPage />}
      {page === "list"         && <ListPage />}
      {page === "admin"        && isAdmin && <AdminPage />}

      {(page === "list" || page === "admin") && (
        <footer className="footer">
          💍 {settings.groomName} & {settings.brideName} · {settings.weddingDate} · Com amor ✨
        </footer>
      )}
    </div>
  );
}

// ─── Raiz da aplicação ────────────────────────────────────────────────────────
export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
