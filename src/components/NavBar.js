import { useApp } from "../context/AppContext";

export function NavBar() {
  const { page, adminTab, isAdmin, allReservations, totalSlots, navigate, logout, adminLogout, showToast } = useApp();

  const handleLogout = isAdmin ? adminLogout : logout;

  async function copyShareLink() {
    const url = window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      showToast("🔗 Link copiado! Compartilhe com os convidados.", "ok");
    } catch {
      // Fallback para browsers sem clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("🔗 Link copiado! Compartilhe com os convidados.", "ok");
    }
  }

  return (
    <div className="navbar">
      <div className="pill-info">
        {allReservations.length} de {totalSlots} reservados
      </div>

      <button
        className={`btn-header${page === "list" ? " active" : ""}`}
        onClick={() => navigate("list")}>
        🎁 Lista
      </button>

      {isAdmin && [
        ["reservas",      "📋 Reservas"],
        ["itens",         "🎁 Itens"],
        ["configuracoes", "⚙️ Config"],
      ].map(([key, label]) => (
        <button
          key={key}
          className={`btn-header${page === "admin" && adminTab === key ? " active" : ""}`}
          onClick={() => navigate("admin", key)}>
          {label}
        </button>
      ))}

      {isAdmin && (
        <button className="btn-header share" onClick={copyShareLink}>🔗 Compartilhar</button>
      )}

      <button className="btn-header danger" onClick={handleLogout}>Sair</button>
    </div>
  );
}
