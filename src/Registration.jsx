import { t } from "./i18n";
import React, { useState } from "react";
import { Building2, UserRound, Phone, ArrowRight } from "lucide-react";
import { request } from "./session";
export default function Registration({ user, onComplete }) {
  const [kind, setKind] = useState("company"),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  return (
    <>
      <span className="eyebrow">{t("QEYDİYYAT")}</span>
      <h2>{t("Hesabını tamamlayaq.")}</h2>
      <p>{t("Hər telefon nömrəsi yalnız bir hesaba bağlanır.")}</p>
      <form
        className="registration-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          setSaving(true);
          setError("");
          try {
            await request("/api/profile", {
              method: "POST",
              body: {
                ...data,
                kind,
              },
            });
            await onComplete(user);
          } catch (e) {
            setError(e.message);
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="registration-types">
          <button
            type="button"
            aria-pressed={kind === "company"}
            onClick={() => setKind("company")}
          >
            <Building2 size={22} />
            {t("Rentakar şirkəti")}
          </button>
          <button
            type="button"
            aria-pressed={kind === "person"}
            onClick={() => setKind("person")}
          >
            <UserRound size={22} />
            {t("Şəxsi sahib")}
          </button>
        </div>
        <label>
          {t(kind === "company" ? "Firma adı" : "Ad və soyad")}
          <input
            name="name"
            required
            maxLength="100"
            autoComplete="organization"
            placeholder={t(
              kind === "company" ? "Firmanızın adı" : "Adınız və soyadınız",
            )}
          />
        </label>
        <label>
          {t("Telefon nömrəsi")}
          <input
            name="phone"
            defaultValue={user.phone || ""}
            readOnly={Boolean(user.phone)}
            type="tel"
            required
            autoComplete="tel"
            placeholder={t("050 123 45 67")}
          />
        </label>
        <div className="registration-email">
          {t("Hesab:")}
          {t(user.email || user.phone)}
        </div>
        {t(
          error && (
            <p role="alert" className="auth-error">
              {t(error)}
            </p>
          ),
        )}
        <button className="primary" disabled={saving}>
          {t(saving ? "Saxlanılır…" : "Qeydiyyatı tamamla")}
          <ArrowRight size={17} />
        </button>
      </form>
    </>
  );
}
