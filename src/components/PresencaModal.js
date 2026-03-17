import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { fmtPhone } from "../hooks/utils";
import { Field } from "./Field";

export function PresencaModal() {
  const {
    settings,
    presencaName, setPresencaName,
    nomeCompletoGuest, lastGuestInfo,
    presencaPhone, setPresencaPhone,
    presencaError, setPresencaError,
    presencaConfirm, setPresencaConfirm,
    confirmarPresenca, registrarAusencia,
    minhaPresenca, cancelarMinhaPresenca,
    showPresencaStatus, setShowPresencaStatus,
  } = useApp();

  const [cancelConfirm, setCancelConfirm] = useState(false);

  // Se já respondeu, fecha o modal automático que abre no login
  useEffect(() => {
    if (minhaPresenca && presencaConfirm) setPresencaConfirm(false);
  }, [minhaPresenca, presencaConfirm, setPresencaConfirm]);

  // Reseta confirmação de cancelamento sempre que o modal de status fechar
  useEffect(() => {
    if (!showPresencaStatus) setCancelConfirm(false);
  }, [showPresencaStatus]);

  function fecharConfirm() {
    setPresencaConfirm(false);
    setPresencaName(nomeCompletoGuest);
    setPresencaPhone(fmtPhone(lastGuestInfo.current.phone));
    setPresencaError("");
  }

  // ── Modal principal — pergunta se vai ou não ──────────────────────────────────
  if (presencaConfirm && !minhaPresenca) {
    return (
      <div className="overlay">
        <div className="modal">
          <div className="modal-header">
            <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>💍</span>
            <h2 className="modal-title">Você vai ao casamento?</h2>
            <p className="modal-item">{settings.groomName} & {settings.brideName}</p>
            <p style={{ fontSize: 13, color: "#9a8070", marginTop: 4 }}>{settings.weddingDate}</p>
          </div>
          <div className="modal-body">
            <Field label="Seu nome completo *">
              <input className="input" placeholder="João da Silva"
                value={presencaName} onChange={(e) => setPresencaName(e.target.value)} />
            </Field>
            <Field label="WhatsApp / Telefone *">
              <input className="input" placeholder="(11) 99999-9999"
                value={presencaPhone} onChange={(e) => setPresencaPhone(e.target.value)} />
            </Field>
            {presencaError && <p className="error-msg">{presencaError}</p>}
            <div className="presenca-modal-buttons">
              <button className="btn-presenca-modal-yes" onClick={confirmarPresenca}>
                ✅ Vou comparecer!
              </button>
              <button className="btn-presenca-modal-no" onClick={registrarAusencia}>
                ❌ Não poderei ir
              </button>
              <button className="btn-presenca-modal-skip" onClick={fecharConfirm}>
                Responder depois
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }


  // ── Modal de status — ver e cancelar resposta já dada ────────────────────────
  if (showPresencaStatus && minhaPresenca) {
    const confirmado = minhaPresenca.status === "confirmado";
    return (
      <div className="overlay">
        <div className="modal">
          <div className="modal-header">
            <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>
              {confirmado ? "✅" : "💙"}
            </span>
            <h2 className="modal-title">
              {confirmado ? "Presença Confirmada" : "Não vai comparecer"}
            </h2>
            <p className="modal-item">{minhaPresenca.name}</p>
            <p style={{ fontSize: 13, color: "#9a8070", marginTop: 4 }}>{minhaPresenca.date}</p>
          </div>
          <div className="modal-body">
            {!cancelConfirm ? (
              <>
                <p className="modal-desc">
                  {confirmado
                    ? "Sua presença está confirmada! Até lá 🎉"
                    : "Você registrou que não poderá comparecer."}
                </p>
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => { setShowPresencaStatus(false); setCancelConfirm(false); }}>Fechar</button>
                  <button className="btn-delete" onClick={() => setCancelConfirm(true)}>
                    🗑️ Cancelar resposta
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="modal-desc" style={{ color: "#c0392b", fontWeight: 600 }}>
                  Tem certeza? Sua resposta será removida e você poderá responder novamente.
                </p>
                <div className="modal-buttons">
                  <button className="btn-cancel" onClick={() => setCancelConfirm(false)}>Não</button>
                  <button className="btn-delete" onClick={() => {
                    cancelarMinhaPresenca();
                    setShowPresencaStatus(false);
                    setCancelConfirm(false);
                  }}>
                    Sim, cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
