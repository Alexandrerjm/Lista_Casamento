import { useApp } from "../../context/AppContext";
import { ConfirmAction } from "../../components/ConfirmAction";

function exportPresencaCSV(presencas, settings) {
  const headers = ["Status", "Nome", "Telefone", "E-mail", "Data de Confirmação"];
  const rows = presencas.map((p) => [
    p.status === "confirmado" ? "Confirmado" : "Não vai",
    p.name,
    p.phone || "",
    p.email || "",
    p.date,
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `presencas_${settings.groomName}_${settings.brideName}.csv`.replace(/\s+/g, "_");
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PresencaTable({ list, presencaDelete, setPresencaDelete, cancelarPresenca }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {["#", "Nome", "Telefone", "E-mail", "Data", "Ação"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((p, idx) => (
            <tr key={p.id}>
              <td style={{ color: "#aaa", fontSize: 13 }}>{idx + 1}</td>
              <td><strong>{p.name}</strong></td>
              <td>
                {p.phone
                  ? <a className="table-link green"
                      href={`https://wa.me/55${p.phone.replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer">
                      📱 {p.phone}
                    </a>
                  : <span style={{ color: "#aaa" }}>—</span>}
              </td>
              <td>{p.email
                ? <a className="table-link" href={`mailto:${p.email}`}>{p.email}</a>
                : <span style={{ color: "#aaa" }}>—</span>}
              </td>
              <td>{p.date}</td>
              <td>
                <ConfirmAction
                  id={p.id}
                  activeId={presencaDelete}
                  onConfirm={() => cancelarPresenca(p.id)}
                  onCancel={() => setPresencaDelete(null)}
                  onRequest={() => setPresencaDelete(p.id)}
                  label="🗑️"
                  buttonClass="btn-delete"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PresencaTab() {
  const { presencas, presencaDelete, setPresencaDelete, cancelarPresenca, settings } = useApp();

  const confirmados = presencas.filter((p) => p.status === "confirmado" || !p.status);
  const ausentes    = presencas.filter((p) => p.status === "ausente");

  return (
    <>
      <div className="tab-header">
        <h3 className="section-title">
          Lista de Presença — {confirmados.length} confirmado(s) · {ausentes.length} ausente(s)
        </h3>
        {presencas.length > 0 && (
          <button className="btn-export" onClick={() => exportPresencaCSV(presencas, settings)}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      <h4 className="presenca-section-title confirmed">✅ Confirmados ({confirmados.length})</h4>
      {confirmados.length === 0 ? (
        <p className="empty-msg" style={{ marginBottom: 24 }}>Nenhuma confirmação ainda.</p>
      ) : (
        <PresencaTable
          list={confirmados}
          presencaDelete={presencaDelete}
          setPresencaDelete={setPresencaDelete}
          cancelarPresenca={cancelarPresenca}
        />
      )}

      <h4 className="presenca-section-title absent" style={{ marginTop: 32 }}>❌ Não vão ({ausentes.length})</h4>
      {ausentes.length === 0 ? (
        <p className="empty-msg">Nenhum registro de ausência ainda.</p>
      ) : (
        <PresencaTable
          list={ausentes}
          presencaDelete={presencaDelete}
          setPresencaDelete={setPresencaDelete}
          cancelarPresenca={cancelarPresenca}
        />
      )}
    </>
  );
}
