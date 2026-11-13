import React, { useState, useEffect } from "react";
import { Phone, ArrowRight } from "lucide-react";
import { request } from "./session";
import { t } from "./i18n";
export default function PhoneLogin({ onAuthenticated }) {
  const [mode, setMode] = useState("signup"),
    [phone, setPhone] = useState(""),
    [code, setCode] = useState(""),
    [sent, setSent] = useState(false),
    [enabled, setEnabled] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    request("/api/phone?action=config")
      .then((data) => setEnabled(data.enabled))
      .catch(() => setEnabled(false));
  }, []);
  return (
    <>
      <div className="auth-mode-tabs">
        <button
          className={mode === "signup" ? "active" : ""}
          onClick={() => setMode("signup")}
        >
          {t("Qeydiyyat")}
        </button>
        <button
          className={mode === "login" ? "active" : ""}
          onClick={() => setMode("login")}
        >
          {t("Daxil ol")}
        </button>
      </div>
      <form
        className="phone-signin"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setBusy(true);
          try {
            if (!sent) {
              await request("/api/phone?action=start", {
                method: "POST",
                body: { phone },
              });
              setSent(true);
            } else {
              const result = await request("/api/phone?action=verify", {
                method: "POST",
                body: { phone, code },
              });
              await onAuthenticated(result.user);
            }
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          {t("Telefon nömrəsi")}
          <input
            type="tel"
            autoComplete="tel"
            required
            placeholder="050 123 45 67"
            value={phone}
            readOnly={sent}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        {sent && (
          <>
            <p className="sms-status">
              {t("Kod göndərildi. Telefonuna gələn 6 rəqəmli kodu yaz.")}
            </p>
            <label>
              {t("Təsdiq kodu")}
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength="6"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="outline"
              onClick={() => {
                setSent(false);
                setCode("");
              }}
            >
              {t("Nömrəni dəyiş")}
            </button>
          </>
        )}
        {enabled === false && (
          <p className="sms-status">
            {t(
              "SMS xidməti hələ qoşulmayıb. Nömrə ilə giriş hazırda aktiv deyil.",
            )}
          </p>
        )}
        {error && (
          <p role="alert" className="auth-error">
            {t(error)}
          </p>
        )}
        <button className="primary" disabled={busy || !enabled}>
          <Phone size={16} />
          {t(sent ? "Kodu təsdiqlə" : "SMS kodu göndər")}
          <ArrowRight size={16} />
        </button>
      </form>
    </>
  );
}
