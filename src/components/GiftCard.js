import { useApp } from "../context/AppContext";
import { fmtPrice } from "../hooks/utils";

export function GiftCard({ item }) {
  const {
    currentGuest, isAdmin, getSlots, isFull,
    cancelConfirm, setCancelConfirm,
    openReserveModal, cancelOwnReservation,
  } = useApp();

  const slots = getSlots(item);
  const full  = isFull(item);

  // Identifica o e-mail do usuário atual:
  // - convidado logado → usa o e-mail dele
  // - admin sem login de convidado → usa "admin" (mesmo valor gravado em confirmReservation)
  const currentEmail = currentGuest?.email ?? (isAdmin ? "admin" : null);
  const myRes        = currentEmail ? slots.find((s) => s.res?.email === currentEmail) : null;
  const resCount     = slots.filter((s) => s.res).length;

  return (
    <div className={`gift-card${full ? " reserved" : ""}`}>
      <div className="card-image">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.name} />
          : <span className="card-emoji">{item.emoji || "🎁"}</span>}
        {full && (
          <div className="card-overlay">
            <span className="lock-icon">🔒</span>
            <span className="reserved-label">RESERVADO</span>
          </div>
        )}
        {item.qty > 1 && <div className="qty-badge">{resCount}/{item.qty}</div>}
      </div>

      <div className="card-body">
        {item.category && <span className="card-category">{item.category}</span>}
        <h3 className="card-name">{item.name}</h3>
        {item.description && <p className="card-desc">{item.description}</p>}
        <div className="card-footer">
          <span className="card-price">R$ {fmtPrice(item.price)}</span>
          {myRes
            ? cancelConfirm === myRes.key
              ? <span style={{ display: "flex", gap: 5 }}>
                  <button className="btn-cancel-yes" onClick={() => { cancelOwnReservation(myRes.key); setCancelConfirm(null); }}>Sim</button>
                  <button className="btn-cancel-no"  onClick={() => setCancelConfirm(null)}>Não</button>
                </span>
              : <button className="btn-unreserve" onClick={() => setCancelConfirm(myRes.key)}>Cancelar reserva</button>
            : full
              ? <span className="full-badge">Indisponível</span>
              : <button className="btn-reserve" onClick={() => openReserveModal(item)}>Escolher 🎁</button>}
        </div>
      </div>
    </div>
  );
}
