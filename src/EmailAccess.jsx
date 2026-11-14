import React, { useState, useEffect } from "react";
import {
  Mail,
  LockKeyhole,
  ArrowRight,
  UserRound,
  Phone,
  Building2,
  ChevronLeft,
} from "lucide-react";
import { request } from "./session";
import { t } from "./i18n";
export default function EmailAccess({ onAuthenticated }) {
  const [mode, setMode] = useState("signup"),
    [email, setEmail] = useState(""),
    [kind, setKind] = useState("person"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(null);
  useEffect(() => {
    request("/api/account?action=config")
      .then(setReady)
      .catch(() => setReady({ enabled: false, recoveryEnabled: false }));
  }, []);
  return (
    <div className="email-access">
      {["signup", "login"].includes(mode) ? (
        <div className="auth-mode-tabs">
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setError("");
            }}
          >
            {t("Qeydiyyat")}
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            {t("Daxil ol")}
          </button>
        </div>
      ) : (
        <button
          className="auth-back"
          onClick={() => {
            setMode("login");
            setError("");
          }}
        >
          <ChevronLeft size={16} />
          {t("Girişə qayıt")}
        </button>
      )}
      {mode === "forgot" && (
        <p>
          {t(
            "E-poçtunu yaz. Şifrəni yeniləmək üçün 6 rəqəmli kod göndərəcəyik.",
          )}
        </p>
      )}
      {["reset", "verify"].includes(mode) && (
        <p>{t("E-poçtuna göndərilən 6 rəqəmli kodu daxil et.")}</p>
      )}
      <form
        className="email-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          const data = Object.fromEntries(new FormData(e.target));
          try {
            const result = await request("/api/account?action=" + mode, {
              method: "POST",
              body: { ...data, email, kind },
            });
            if (mode === "forgot") {
              setMode("reset");
            } else if (result.verifyRequired) {
              setMode("verify");
            } else await onAuthenticated(result.user);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {mode === "signup" && (
          <>
            <label>
              <span>
                <UserRound size={16} />
                {t("Ad və soyad")}
              </span>
              <input
                name="name"
                autoComplete="name"
                required
                maxLength="100"
                placeholder={t("Adınız və soyadınız")}
              />
            </label>
            <label>
              <span>
                <Phone size={16} />
                {t("Telefon nömrəsi")}
              </span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                placeholder="050 123 45 67"
              />
            </label>
          </>
        )}
        <label>
          <span>
            <Mail size={16} />
            {t("E-poçt ünvanı")}
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            readOnly={mode === "reset" || mode === "verify"}
            maxLength="254"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@gmail.com"
          />
        </label>
        {["signup", "login", "reset"].includes(mode) && (
          <label>
            <span>
              <LockKeyhole size={16} />
              {t(mode === "reset" ? "Yeni şifrə" : "Şifrə")}
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder={t("Ən az 8 simvol")}
            />
          </label>
        )}
        {mode === "signup" && (
          <>
            <div className="account-type">
              <button
                type="button"
                aria-pressed={kind === "person"}
                onClick={() => setKind("person")}
              >
                <UserRound size={17} />
                {t("Şəxsi sahib")}
              </button>
              <button
                type="button"
                aria-pressed={kind === "company"}
                onClick={() => setKind("company")}
              >
                <Building2 size={17} />
                {t("Rentakar şirkəti")}
              </button>
            </div>
            {kind === "company" && (
              <label>
                <span>
                  <Building2 size={16} />
                  {t("Firma adı")}
                </span>
                <input
                  name="company"
                  required
                  maxLength="100"
                  autoComplete="organization"
                  placeholder={t("Firmanızın adı")}
                />
              </label>
            )}
          </>
        )}
        {["verify", "reset"].includes(mode) && (
          <label>
            <span>
              <Mail size={16} />
              {t("6 rəqəmli kod")}
            </span>
            <input
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength="6"
              placeholder="000000"
            />
          </label>
        )}
        {error && (
          <p className="auth-error" role="alert">
            {t(error)}
          </p>
        )}
        {email.trim().toLowerCase() === "rentacarr.az@gmail.com" && ready?.enabled && <p className="admin-access-note" role="status">{t(ready.recoveryEnabled ? "Bu hesab idarəetmə üçündür. E-poçt təsdiqindən sonra admin paneli açılır." : "Admin hesabı tanındı. Poçt xidməti qoşulmadığı üçün e-poçt təsdiqi tamamlanmır. Vercel-də SMTP_USER və SMTP_PASSWORD və ya Resend bağlantısını tamamlayın.")}</p>}
        {ready?.enabled === false && (
          <p className="service-note">
            {t("Qeydiyyat üçün server bağlantısı hələ tamamlanmayıb.")}
          </p>
        )}
        <button className="primary" disabled={busy || !ready?.enabled}>
          {t(
            busy
              ? "Saxlanılır…"
              : mode === "signup"
                ? "Qeydiyyatdan keç"
                : mode === "login"
                  ? "Daxil ol"
                  : mode === "forgot"
                    ? "Bərpa kodunu göndər"
                    : mode === "reset"
                      ? "Şifrəni yenilə"
                      : "E-poçtu təsdiqlə",
          )}
          <ArrowRight size={17} />
        </button>
        {mode === "login" && (
          <button
            type="button"
            className="forgot-link"
            onClick={() => {
              setMode("forgot");
              setError("");
            }}
          >
            {t("Şifrəni unutmusunuz?")}
          </button>
        )}
      </form>
      <p className="auth-footnote">
        {t("Telefon əlaqə üçündür. Giriş e-poçt və şifrə ilədir.")}
      </p>
    </div>
  );
}
