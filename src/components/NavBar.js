import { useApp } from "../context/AppContext";

export function NavBar() {
  const { page, adminTab, isAdmin, allReservations, totalSlots, navigate, logout, adminLogout } = useApp();

  const handleLogout = isAdmin ? adminLogout : logout;

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

      <button className="btn-header danger" onClick={handleLogout}>Sair</button>
    </div>
  );
}
