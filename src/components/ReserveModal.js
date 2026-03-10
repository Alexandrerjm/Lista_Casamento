import { useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Field } from "./Field";
import { fmtPrice } from "../hooks/utils";

export function ReserveModal() {
  const {
    reserveItem, closeReserveModal, confirmReservation,
    reserveQty, setReserveQty,
    reserveName,  setReserveName,
    reservePhone, setReservePhone,
    reserveMsg,   setReserveMsg,
    reserveError,
    getSlots,
  } = useApp();

  if (!reserveItem) return null;

  const freeCount = getSlots(reserveItem).filter((s) => !s.res).length;
  const showQtySelector = reserveItem.qty > 1 && freeCount > 1;

  // Ajusta qty se Realtime reduzir os slots disponíveis enquanto o modal está aberto
  useEffect(() => {
    if (reserveQty > freeCount && freeCount > 0) setReserveQty(freeCount);
  }, [freeCount, reserveQty, setReserveQty]);

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          {reserveItem.imageUrl
            ? <img src={reserveItem.imageUrl} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover", marginBottom: 8 }} />
            : <span style={{ fontSize: 48, display: "block", marginBottom: 8 }}>{reserveItem.emoji || "🎁"}</span>}
          <h2 className="modal-title">Reservar Presente</h2>
          <p className="modal-item">{reserveItem.name}</p>
          <p className="modal-price">
            R$ {fmtPrice(reserveItem.price * reserveQty)}
            {reserveQty > 1 && <span className="modal-price-detail"> ({reserveQty}× R$ {fmtPrice(reserveItem.price)})</span>}
          </p>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Preencha seus dados para confirmar. Entraremos em contato para combinar a entrega. 💌
          </p>
          {showQtySelector && (
            <Field label={`Quantidade (${freeCount} disponível(is))`}>
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setReserveQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="qty-value">{reserveQty}</span>
                <button className="qty-btn" onClick={() => setReserveQty((q) => Math.min(freeCount, q + 1))}>+</button>
              </div>
            </Field>
          )}

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
