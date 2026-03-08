import { useApp } from "../context/AppContext";
import { Field } from "./Field";
import { fmtPrice } from "../hooks/utils";

export function ReserveModal() {
  const {
    reserveItem, closeReserveModal, confirmReservation,
    reserveName,  setReserveName,
    reservePhone, setReservePhone,
    reserveMsg,   setReserveMsg,
    reserveError,
  } = useApp();

  if (!reserveItem) return null;

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          {reserveItem.imageUrl
            ? <img src={reserveItem.imageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", marginBottom: 8 }} />
            : <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>{reserveItem.emoji || "🎁"}</span>}
          <h2 className="modal-title">Reservar Presente</h2>
          <p className="modal-item">{reserveItem.name}</p>
          <p className="modal-price">R$ {fmtPrice(reserveItem.price)}</p>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Preencha seus dados para confirmar. Entraremos em contato para combinar a entrega. 💌
          </p>
          <Field label="Seu nome completo *">
            <input
              className="input"
              placeholder="João da Silva"
              value={reserveName}
              onChange={(e) => setReserveName(e.target.value)}
            />
          </Field>
          <Field label="WhatsApp / Telefone *">
            <input
              className="input"
              placeholder="(11) 99999-9999"
              value={reservePhone}
              onChange={(e) => setReservePhone(e.target.value)}
            />
          </Field>
          <Field label="Mensagem para os noivos (opcional)">
            <textarea
              className="textarea"
              rows={3}
              placeholder="Uma mensagem especial... 💕"
              value={reserveMsg}
              onChange={(e) => setReserveMsg(e.target.value)}
            />
          </Field>
          {reserveError && <p className="error-msg">{reserveError}</p>}
          <div className="modal-buttons">
            <button className="btn-cancel"  onClick={closeReserveModal}>Cancelar</button>
            <button className="btn-confirm" onClick={confirmReservation}>Confirmar Reserva 🎉</button>
          </div>
        </div>
      </div>
    </div>
  );
}
