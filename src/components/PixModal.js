import { useApp } from "../context/AppContext";
import { Field } from "./Field";

export function PixModal() {
  const {
    settings,
    pixModal, setPixModal,
    pixName,  setPixName,
    pixError, setPixError,
    registrarContribuicao,
  } = useApp();

  if (!pixModal) return null;

  const valorFmt = `R$ ${Number(pixModal).toFixed(2).replace(".", ",")}`;

  function fechar() {
    setPixModal(null);
    setPixName("");
    setPixError("");
  }

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>💚</span>
          <h2 className="modal-title">Contribuição via Pix</h2>
          <p className="modal-item">{valorFmt}</p>
        </div>
        <div className="modal-body">

          {/* Chave Pix */}
          <div className="pix-key-box">
            <p className="pix-key-label">Chave Pix ({settings.groomName} & {settings.brideName})</p>
            <div className="pix-key-value">
              <span>{settings.pixKey || "—"}</span>
              {settings.pixKey && (
                <button
                  className="btn-pix-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(settings.pixKey).catch(() => {
                      const el = document.createElement("input");
                      el.value = settings.pixKey;
                      document.body.appendChild(el);
                      el.select();
                      document.execCommand("copy");
                      document.body.removeChild(el);
                    });
                  }}
                >
                  📋 Copiar
                </button>
              )}
            </div>
            <p className="pix-key-hint">
              Abra seu banco, vá em Pix → Pagar, cole a chave acima e insira o valor <strong>{valorFmt}</strong>.
            </p>
          </div>

          <Field label="Seu nome completo *">
            <input
              className="input"
              placeholder="João da Silva"
              value={pixName}
              onChange={(e) => setPixName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && registrarContribuicao()}
              autoFocus
            />
          </Field>

          {pixError && <p className="error-msg">{pixError}</p>}

          <div className="modal-buttons">
            <button className="btn-cancel" onClick={fechar}>Cancelar</button>
            <button
              className="btn-confirm"
              style={{ background: "#27ae60" }}
              onClick={registrarContribuicao}
            >
              ✅ Já fiz o Pix!
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#9a8070", textAlign: "center", marginTop: 12 }}>
            Ao confirmar, seu nome será registrado como contribuinte. O pagamento será verificado pelos noivos.
          </p>
        </div>
      </div>
    </div>
  );
}
