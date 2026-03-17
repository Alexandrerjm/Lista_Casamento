import { useApp } from "../context/AppContext";
import { NavBar } from "../components/NavBar";
import { fmtPrice } from "../hooks/utils";
import { ReservasTab } from "./admin/ReservasTab";
import { ItensTab } from "./admin/ItensTab";
import { ConfigTab } from "./admin/ConfigTab";
import { PresencaTab } from "./admin/PresencaTab";
import { PixTab } from "./admin/PixTab";
import { ConvidadosTab } from "./admin/ConvidadosTab";
import { ItemFormModal } from "./admin/ItemFormModal";
import { ProgressBar } from "../components/ProgressBar";

export function AdminPage() {
  const { settings, items, allReservations, totalReservedValue, totalSlots, adminTab, presencas, contribuicoes, convidados } = useApp();

  const summaryCards = [
    { value: items.length,                         label: "Total de Itens",  color: "#f0c060" },
    { value: allReservations.length,               label: "Reservas",        color: "#5dade2" },
    { value: totalSlots - allReservations.length,  label: "Disponíveis",     color: "#58d68d" },
    { value: `R$ ${fmtPrice(totalReservedValue)}`, label: "Valor Reservado", color: "#e59866" },
    { value: presencas.length,                     label: "Presenças",       color: "#a29bfe" },
    { value: contribuicoes.length,                  label: "Pix",             color: "#00b894" },
    { value: convidados.length,                     label: "Convidados",      color: "#74b9ff" },
  ];

  return (
    <>
      <header className="header admin-header">
        <div className="header-inner">
          <div className="header-brand">
            <span>👑</span>
            <div>
              <h1 className="header-title">Painel Admin</h1>
              <p className="header-sub">{settings.groomName} & {settings.brideName} · {settings.weddingDate}</p>
            </div>
          </div>
          <NavBar />
        </div>
      </header>

      <ProgressBar />

      <div className="admin-summary">
        {summaryCards.map(({ value, label, color }) => (
          <div key={label} className="summary-card">
            <span className="summary-num" style={{ color }}>{value}</span>
            <span className="summary-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="admin-content">
        {adminTab === "reservas"      && <ReservasTab />}
        {adminTab === "itens"         && <ItensTab />}
        {adminTab === "presenca"       && <PresencaTab />}
        {adminTab === "pix"            && <PixTab />}
        {adminTab === "convidados"     && <ConvidadosTab />}
        {adminTab === "configuracoes" && <ConfigTab />}
      </div>

      <ItemFormModal />
    </>
  );
}
