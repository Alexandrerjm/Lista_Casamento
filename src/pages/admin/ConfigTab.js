import { useApp } from "../../context/AppContext";
import { Field } from "../../components/Field";

// Senhas são gerenciadas pelo Supabase Auth — não aparecem aqui.
// Para trocar senha: Authentication → Users no painel do Supabase.
export function ConfigTab() {
  const { settingsForm, setSettingsForm, submitSettings } = useApp();

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

        <p className="settings-note">
          🔒 Para alterar e-mail ou senha de acesso, use o painel do Supabase em <strong>Authentication → Users</strong>.
        </p>

        <button className="btn-primary" style={{ maxWidth: 240 }} onClick={submitSettings}>
          Salvar Configurações ✅
        </button>
      </div>
    </>
  );
}
