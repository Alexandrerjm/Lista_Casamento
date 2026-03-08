// ─── Componente reutilizável de confirmação inline ────────────────────────────
// Uso: substitui o padrão repetido de "deleteConfirm === key ? <Sim/Não> : <botão>"
//
// Exemplo:
//   <ConfirmAction
//     id="reserva-abc"
//     activeId={deleteConfirm}
//     onConfirm={() => cancelReservation(key)}
//     onCancel={() => setDeleteConfirm(null)}
//     onRequest={() => setDeleteConfirm("reserva-abc")}
//     label="🗑️"
//     buttonClass="btn-delete"
//   />

export function ConfirmAction({ id, activeId, onConfirm, onCancel, onRequest, label, buttonClass }) {
  if (activeId === id) {
    return (
      <span style={{ display: "flex", gap: 5 }}>
        <button className="btn-del-yes" onClick={onConfirm}>Sim</button>
        <button className="btn-del-no"  onClick={onCancel}>Não</button>
      </span>
    );
  }

  return (
    <button className={buttonClass} onClick={onRequest}>
      {label}
    </button>
  );
}
