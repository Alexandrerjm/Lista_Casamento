import { useApp } from "../../context/AppContext";
import { Field } from "../../components/Field";
import { useCopyLink } from "../../hooks/utils";

// Senhas são gerenciadas pelo Supabase Auth — não aparecem aqui.
// Para trocar senha: Authentication → Users no painel do Supabase.
export function ConfigTab() {
  const { settingsForm, setSettingsForm, submitSettings } = useApp();
  const { copied, copy } = useCopyLink();
  const siteUrl = window.location.origin;

  if (!settingsForm) return null;

  return (
    <>
      <h3 className="section-title">Configurações Gerais</h3>
      <div className="settings-form">
        <div className="form-row">
          <Field label="Nome do Noivo">
            <input className="input" value={settingsForm.groomName}
              onChange={(e) => setSettingsForm((f) => ({ ...f, groomName: e.target.value }))} />
          </Field>
          <Field label="Nome da Noiva">
            <input className="input" value={settingsForm.brideName}
              onChange={(e) => setSettingsForm((f) => ({ ...f, brideName: e.target.value }))} />
          </Field>
        </div>

        <Field label="Data do Casamento">
          <input className="input" value={settingsForm.weddingDate} placeholder="Ex: 14 de Junho de 2025"
            onChange={(e) => setSettingsForm((f) => ({ ...f, weddingDate: e.target.value }))} />
        </Field>

        <Field label="Mensagem de agradecimento (enviada por WhatsApp)">
          <textarea
            className="input textarea"
            rows={3}
            placeholder="Ex: Agradecemos o carinho por nós e por querer participar dessa nova fase de vida."
            value={settingsForm.thankYouMessage ?? ""}
            onChange={(e) => setSettingsForm((f) => ({ ...f, thankYouMessage: e.target.value }))}
          />
        </Field>

        <Field label="Endereço para entrega dos presentes">
          <input
            className="input"
            placeholder="Ex: Rua das Flores, 123 — Bairro, Cidade - SP, CEP 00000-000"
            value={settingsForm.deliveryAddress ?? ""}
            onChange={(e) => setSettingsForm((f) => ({ ...f, deliveryAddress: e.target.value }))}
          />
        </Field>

        <p className="settings-note">
          📱 Após cada reserva confirmada, o WhatsApp do convidado abrirá automaticamente com a mensagem acima. Se o endereço estiver preenchido, ele será incluído na mensagem.
        </p>

        <p className="settings-note">
          🔒 Para alterar e-mail ou senha de acesso, use o painel do Supabase em <strong>Authentication → Users</strong>.
        </p>

        <button className="btn-primary" style={{ maxWidth: 240 }} onClick={submitSettings}>
          Salvar Configurações ✅
        </button>

        <div className="share-section">
          <p className="settings-note" style={{ marginTop: 24 }}>
            🔗 <strong>Link da lista para convidados</strong>
          </p>
          <div className="share-row">
            <input className="input share-url" readOnly value={siteUrl} />
            <button className="btn-share-copy" onClick={() => copy(siteUrl)}>
              {copied ? "✅ Copiado!" : "🔗 Copiar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
