import { useApp } from "../../context/AppContext";
import { fmtPhone } from "../../hooks/utils";

function exportConvidadosCSV(convidados) {
  const headers = ["Nome", "Sobrenome", "E-mail", "Telefone", "Data de Cadastro"];
  const rows = convidados.map((c) => [
    c.nome || "",
    c.sobrenome || "",
    c.email || "",
    c.phone ? fmtPhone(c.phone) : "",
    new Date(c.created_at).toLocaleString("pt-BR"),
  ]);
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = "convidados.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ConvidadosTab() {
  const { convidados } = useApp();

  return (
    <>
      <div className="tab-header">
        <h3 className="section-title">
          Convidados — {convidados.length} cadastrado(s)
        </h3>
        {convidados.length > 0 && (
          <button className="btn-export" onClick={() => exportConvidadosCSV(convidados)}>
            ⬇️ Exportar CSV
          </button>
        )}
      </div>

      {convidados.length === 0 ? (
        <p className="empty-msg">Nenhum convidado cadastrado ainda. 👥</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {["#", "Nome", "Sobrenome", "E-mail", "Telefone", "Cadastrado em"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {convidados.map((c, idx) => (
                <tr key={c.id}>
                  <td style={{ color: "#aaa", fontSize: 13 }}>{idx + 1}</td>
                  <td><strong>{c.nome}</strong></td>
                  <td>{c.sobrenome}</td>
                  <td>
                    <a className="table-link" href={`mailto:${c.email}`}>{c.email}</a>
                  </td>
                  <td>
                    {c.phone
                      ? <a className="table-link green" href={`https://wa.me/55${c.phone}`} target="_blank" rel="noopener noreferrer">📱 {fmtPhone(c.phone)}</a>
                      : <span style={{ color: "#aaa" }}>—</span>}
                  </td>
                  <td>{new Date(c.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
