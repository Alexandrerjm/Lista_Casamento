import { useApp } from "../../context/AppContext";
import { ConfirmAction } from "../../components/ConfirmAction";
import { useExportCSV } from "../../hooks/useExportCSV";
import { fmtPrice, fmtPhone } from "../../hooks/utils";

export function ReservasTab() {
  const { allReservations, deleteConfirm, setDeleteConfirm, cancelReservation } = useApp();
  const { exportCSV } = useExportCSV();

  if (allReservations.length === 0) {
    return <p className="empty-msg">Nenhuma reserva ainda. Compartilhe o link! 🎊</p>;
  }

  return (
    <>
      <div className="tab-header">
        <h3 className="section-title">Reservas Realizadas ({allReservations.length})</h3>
        <button className="btn-export" onClick={exportCSV}>⬇️ Exportar CSV</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {["Presente", "Valor", "Convidado", "E-mail", "WhatsApp", "Data", "Mensagem", "Ação"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allReservations.map(({ key, item, res }) => (
              <tr key={key}>
                <td>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: "cover", verticalAlign: "middle", marginRight: 6 }} />
                    : <span style={{ marginRight: 6 }}>{item.emoji || "🎁"}</span>}
                  {item.name}
                  {item.qty > 1 && <span className="slot-badge">{key.split(":")[1]}/{item.qty}</span>}
                </td>
                <td>R$ {fmtPrice(item.price)}</td>
                <td><strong>{res.name}</strong></td>
                <td><a className="table-link" href={`mailto:${res.email}`}>{res.email}</a></td>
                <td>
                  <a className="table-link green" href={`https://wa.me/55${res.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    📱 {fmtPhone(res.phone)}
                  </a>
                </td>
                <td>{res.date}</td>
                <td>{res.message || <span style={{ color: "#aaa" }}>—</span>}</td>
                <td>
                  <ConfirmAction
                    id={key}
                    activeId={deleteConfirm}
                    onConfirm={() => cancelReservation(key)}
                    onCancel={() => setDeleteConfirm(null)}
                    onRequest={() => setDeleteConfirm(key)}
                    label="🗑️"
                    buttonClass="btn-delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
