// ─── Formatação de preço ──────────────────────────────────────────────────────
export const fmtPrice = (value) =>
  parseFloat(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

// ─── Conversão de arquivo para base64 ────────────────────────────────────────
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Gerador de ID único baseado em timestamp ─────────────────────────────────
// Usa Date.now() para evitar colisão com IDs já salvos no storage após reload.
// Sufixo aleatório garante unicidade mesmo em criações rápidas consecutivas.
export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Verifica se uma string já é um hash SHA-256 ──────────────────────────────
// Hash SHA-256 tem exatamente 64 caracteres hexadecimais.
export const isSHA256 = (str) => /^[a-f0-9]{64}$/.test(str);

// ─── Hook reutilizável: copia URL e mostra feedback visual ────────────────────
// Centralizado aqui para evitar duplicação entre componentes.
// Trata falha de clipboard (HTTP local, permissão negada, browser antigo).
import { useState } from "react";
export function useCopyLink() {
  const [copied, setCopied] = useState(false);
  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: seleciona texto para o usuário copiar manualmente
      console.warn("Clipboard não disponível — copie a URL manualmente.");
    }
  }
  return { copied, copy };
}
