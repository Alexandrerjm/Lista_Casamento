import { useApp } from "../context/AppContext";
import { fmtPrice } from "./utils";

export function useExportCSV() {
  const { allReservations, settings } = useApp();

  function exportCSV() {
    const headers = ["Presente", "Valor (R$)", "Convidado", "E-mail", "WhatsApp", "Data", "Mensagem"];

    const rows = allReservations.map(({ item, res }) => [
      item.name,
      fmtPrice(item.price),
      res.name,
      res.email,
      res.phone,
      res.date,
      res.message || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    // Adiciona BOM para Excel reconhecer UTF-8 corretamente
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href     = url;
    link.download = `reservas_${settings.groomName}_${settings.brideName}.csv`.replace(/\s+/g, "_");
    link.click();

    // Revoga após delay — download é assíncrono em alguns browsers
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return { exportCSV };
}
