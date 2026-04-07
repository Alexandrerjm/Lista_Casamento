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

// Formata dígitos limpos para exibição somente-leitura (admin tables, CSV export)
// Para inputs de formulário, usar maskPhone() que formata em tempo real
export function fmtPhone(digits = "") {
  const d = String(digits).replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return digits; // retorna original se não reconhecer o formato
}

// Máscara de telefone em tempo real — aplica formatação enquanto o usuário digita
export function maskPhone(value = "") {
  const d = String(value).replace(/\D/g, "").slice(0, 11); // max 11 dígitos
  if (d.length === 0) return "";
  if (d.length === 1) return `(${d}`;
  if (d.length === 2) return `(${d})`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}
