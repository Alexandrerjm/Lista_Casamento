import { useApp } from "../context/AppContext";
import { Field } from "../components/Field";

// ─── Splash ───────────────────────────────────────────────────────────────────
export function SplashPage() {
  const { settings, navigate } = useApp();
  return (
    <div className="full-bg">
      <div className="splash-card">
        <div className="splash-ring">💍</div>
        <h1 className="splash-title">{settings.groomName} & {settings.brideName}</h1>
        <p className="splash-date">{settings.weddingDate}</p>
        <div className="splash-divider">✦ ✦ ✦</div>
        <p className="splash-msg">
          Você foi convidado(a) para o nosso casamento!<br />
          Acesse a lista de presentes abaixo.
        </p>
        <button className="btn-primary" onClick={() => navigate("guest-login")}>Ver Lista de Presentes 🎁</button>
        <button className="btn-ghost"   onClick={() => navigate("admin-login")}>Acesso dos Noivos 🔐</button>
      </div>
    </div>
  );
}

// ─── Login do convidado ───────────────────────────────────────────────────────
export function GuestLoginPage() {
  const { guestEmail, setGuestEmail, guestLogin, navigate } = useApp();
  return (
    <div className="full-bg">
      <div className="login-card">
        <button className="btn-back" onClick={() => navigate("splash")}>← Voltar</button>
        <div className="login-icon">✉️</div>
        <h2 className="login-title">Identificação do Convidado</h2>
        <p className="login-desc">Informe seu e-mail para acessar a lista de presentes</p>
        <Field label="Seu e-mail *">
          <input
            className="input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guestLogin()}
          />
        </Field>
        <button className="btn-primary" onClick={guestLogin}>Entrar na Lista 🎉</button>
      </div>
    </div>
  );
}

// ─── Login do admin ───────────────────────────────────────────────────────────
export function AdminLoginPage() {
  const { adminEmail, setAdminEmail, adminPassword, setAdminPassword, adminError, adminLogin, navigate } = useApp();
  return (
    <div className="full-bg">
      <div className="login-card">
        <button className="btn-back" onClick={() => navigate("splash")}>← Voltar</button>
        <div className="login-icon">🔐</div>
        <h2 className="login-title">Área dos Noivos</h2>
        <p className="login-desc">Acesso restrito para gerenciar a lista</p>
        <Field label="E-mail">
          <input
            className="input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adminLogin()}
          />
        </Field>
        <Field label="Senha">
          <input
            className="input"
            type="password"
            placeholder="Digite a senha"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adminLogin()}
          />
        </Field>
        {adminError && <p className="error-msg">{adminError}</p>}
        <button className="btn-primary" onClick={adminLogin}>Entrar 👑</button>
      </div>
    </div>
  );
}
