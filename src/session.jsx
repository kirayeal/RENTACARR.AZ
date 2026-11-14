import { t } from "./i18n";
import React, { useState, useEffect, useCallback } from "react";
import { LogIn, Info } from "lucide-react";
export async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "same-origin",
    signal:
      typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(15000)
        : undefined,
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Xidmətə qoşulmaq alınmadı. Səhifəni yeniləyin.");
  }
  if (!res.ok) throw new Error(data.error || "Sorğu yerinə yetirilmədi.");
  return data;
}
let googleScript;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!googleScript)
    googleScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        googleScript = null;
        reject(new Error("Google giriş xidməti açılmadı. Yenidən cəhd edin."));
      };
      document.head.appendChild(script);
    });
  return googleScript;
}
export function GoogleLogin({ onAuthenticated }) {
  const [status, setStatus] = useState("loading"),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    request("/api/auth?action=config")
      .then(async (config) => {
        if (!active) return;
        if (!config.enabled) {
          setStatus("disabled");
          return;
        }
        await loadGoogle();
        if (!active) return;
        window.google.accounts.id.initialize({
          client_id: config.clientId,
          nonce: config.nonce,
          callback: async ({ credential }) => {
            setError("");
            try {
              const result = await request("/api/auth?action=login", {
                method: "POST",
                body: {
                  credential,
                },
              });
              if (active) await onAuthenticated(result.user);
            } catch (e) {
              if (active) setError(e.message);
            }
          },
        });
        const node = document.getElementById("google-signin");
        if (node)
          window.google.accounts.id.renderButton(node, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: Math.min(node.parentElement.clientWidth, 350),
          });
        setStatus("ready");
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, [onAuthenticated]);
  return (
    <div className="google-access">
      <div id="google-signin" />
      {t(status === "loading" && <p>{t("Giriş xidməti yoxlanır…")}</p>)}
      {t(
        error && (
          <p role="alert" className="auth-error">
            {t(error)}
          </p>
        ),
      )}
    </div>
  );
}
export function SessionBoundary({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const finishLogin = useCallback(async (account) => {
    if (!account) {
      setUser(null);
      return;
    }
    const result = await request("/api/profile");
    setUser({
      ...account,
      profile: result.profile,
    });
  }, []);
  useEffect(() => {
    request("/api/auth?action=session")
      .then((data) => finishLogin(data.user))
      .catch(() => setError("Giriş xidməti açılmadı. Səhifəni yeniləyin."))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="session-loading">
        <div className="loading-brand">rentacarr<span>.az</span></div>
        <p>{t("Günlük, həftəlik və aylıq avtomobil kirayəsi")}</p>
        <div className="loading-progress" role="status" aria-label={t("Yüklənir")} />
      </div>
    );
  return children({
    user,
    onAuthenticated: finishLogin,
    authError: error,
    onLogout: async () => {
      await request("/api/auth?action=logout", {
        method: "POST",
      });
      setUser(null);
    },
  });
}
