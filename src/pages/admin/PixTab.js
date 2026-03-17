import { useApp } from "../../context/AppContext";
import { ConfirmAction } from "../../components/ConfirmAction";
import { fmtPrice } from "../../hooks/utils";

function exportPixCSV(contribuicoes, settings) {
  const headers = ["Nome", "E-mail", "Valor (R$)", "Data"];
  const rows = contribuicoes.map((c) => [
    c.name,
    c.email || "",
    Number(c.valor).toFixed(2).replace(".", ","),
    new Date(c.created_at).toLocaleString("pt-BR"),
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `pix_${settings.groomName}_${settings.brideName}.csv`.replace(/\s+/g, "_");
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PixTab() {
  const { contribuicoes, pixDelete, setPixDelete, deletarContribuicao, settings } = useApp();

  const total = contribuicoes.reduce((acc, c) => acc + Number(c.valor), 0);

  return (
    <>
      <div className="tab-header">
        <h3 className="section-title">
          Contribuições Pix — {contribuicoes.length} registro(s) · Total: R$ {fmtPrice(total)}
        </h3>
        {contribuicoes.length > 0 && (
          <button className="btn-export" onClick={() => exportPixCSV(contribuicoes, settings)}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {contribuicoes.length === 0 ? (
        <p className="empty-msg">Nenhuma contribuição via Pix ainda. 💚</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {["#", "Nome", "E-mail", "Valor", "Data", "Ação"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contribuicoes.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: "#aaa", fontSize: 13 }}>{idx + 1}</td>
                  <td><strong>{c.name}</strong></td>
                  <td>
                    {c.email
                      ? <a className="table-link" href={`mailto:${c.email}`}>{c.email}</a>
                      : <span style={{ color: "#aaa" }}>—</span>}
                  </td>
                  <td>
                    <span className="pix-valor-badge">R$ {fmtPrice(c.valor)}</span>
                  </td>
                  <td>{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                  <td>
                    <ConfirmAction
                      id={c.id}
                      activeId={pixDelete}
                      onConfirm={() => deletarContribuicao(c.id)}
                      onCancel={() => setPixDelete(null)}
                      onRequest={() => setPixDelete(c.id)}
                      label="🗑️"
                      buttonClass="btn-delete"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
