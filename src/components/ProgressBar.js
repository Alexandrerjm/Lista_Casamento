import { useApp } from "../context/AppContext";

// Cores da barra por faixa de progresso
const COLOR_LOW      = "#b5804a"; // dourado  — 0 a 49%
const COLOR_MID      = "#e59866"; // laranja  — 50 a 99%
const COLOR_COMPLETE = "#58d68d"; // verde    — 100%

function getBarColor(percentage) {
  if (percentage === 100) return COLOR_COMPLETE;
  if (percentage >= 50)   return COLOR_MID;
  return COLOR_LOW;
}

export function ProgressBar() {
  const { allReservations, totalSlots } = useApp();

  const reserved   = allReservations.length;
  const percentage = totalSlots > 0 ? Math.round((reserved / totalSlots) * 100) : 0;
  const barColor   = getBarColor(percentage);

  return (
    <div className="progress-container">
    <div className="progress-wrap">
      <div className="progress-label">
        <span>Lista de presentes</span>
        <span>{reserved} de {totalSlots} reservados · {percentage}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, background: barColor }}
        />
      </div>
      {percentage === 100 && (
        <p className="progress-complete">🎉 Lista completa! Todos os presentes foram reservados.</p>
      )}
    </div>
    </div>
  );
}
