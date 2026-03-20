import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Field } from "../components/Field";
import { useCopyLink } from "../hooks/utils";

// ─── Splash ───────────────────────────────────────────────────────────────────
export function SplashPage() {
  const { settings, navigate, presencas } = useApp();
  const { copied, copy } = useCopyLink();
  const siteUrl = window.location.origin;
  const totalConfirmados = presencas.filter((p) => p.status === "confirmado").length;

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
        <button className="btn-ghost" onClick={() => navigate("admin-login")}>Acesso dos Noivos 🔐</button>
        <button className="btn-share" onClick={() => copy(siteUrl)}>
          {copied ? "✅ Link copiado!" : "🔗 Compartilhar Lista"}
        </button>

        {totalConfirmados > 0 && (
          <p className="presenca-counter">
            🎉 {totalConfirmados} pessoa(s) já confirmaram presença!
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Login do convidado ───────────────────────────────────────────────────────
export function GuestLoginPage() {
  const {
    guestEmail, setGuestEmail,
    guestNome, setGuestNome,
    guestSobrenome, setGuestSobrenome,
    guestNomeError, setGuestNomeError,
    convidados, guestLogin, navigate,
  } = useApp();
  const [loginLoading, setLoginLoading] = useState(false);

  async function handleLogin() {
    setLoginLoading(true);
    try {
      await guestLogin();
    } finally {
      setLoginLoading(false);
    }
  }

  function handleEmailBlur() {
    const email = guestEmail.trim().toLowerCase();
    if (!email.includes("@")) return;
    const encontrado = convidados.find((c) => c.email === email);
    if (encontrado) {
      setGuestNome(encontrado.nome || "");
      setGuestSobrenome(encontrado.sobrenome || "");
      setGuestNomeError("");
    }
  }

  return (
    <div className="full-bg">
      <div className="login-card">
        <button className="btn-back" onClick={() => navigate("splash")}>← Voltar</button>
        <div className="login-icon">✉️</div>
        <h2 className="login-title">Identificação do Convidado</h2>
        <p className="login-desc">Informe seus dados para acessar a lista de presentes</p>
        <Field label="Seu e-mail *">
          <input
            className="input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={guestEmail}
            onChange={(e) => { setGuestEmail(e.target.value); setGuestNome(""); setGuestSobrenome(""); setGuestNomeError(""); }}
            onBlur={handleEmailBlur}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </Field>
        <div className="form-row">
          <Field label="Nome *">
            <input
              className="input"
              placeholder="João"
              value={guestNome}
              onChange={(e) => setGuestNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </Field>
          <Field label="Sobrenome *">
            <input
              className="input"
              placeholder="Silva"
              value={guestSobrenome}
              onChange={(e) => setGuestSobrenome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </Field>
        </div>
        {guestNomeError && <p className="error-msg">{guestNomeError}</p>}
        <button className="btn-primary" onClick={handleLogin} disabled={loginLoading}>
          {loginLoading ? "Entrando..." : "Entrar na Lista 🎉"}
        </button>
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
