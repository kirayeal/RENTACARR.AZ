import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
export const ADMIN_EMAIL = "rentacarr.az@gmail.com";
export const isAdminEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase() === ADMIN_EMAIL;
export function authConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.AUTH_SECRET?.length >= 32 &&
    process.env.DATABASE_URL,
  );
}
export function cookie(req, name) {
  const entry = String(req.headers.cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(name + "="));
  return entry?.slice(name.length + 1) || "";
}
function signature(text) {
  const key = process.env.AUTH_SECRET;
  if (!key || key.length < 32)
    throw new Error("Authentication is not configured");
  return createHmac("sha256", key).update(text).digest("base64url");
}
export function sign(value) {
  const text = Buffer.from(JSON.stringify(value)).toString("base64url");
  return text + "." + signature(text);
}
export function verify(token) {
  try {
    const [text, sig, ...extra] = String(token).split(".");
    if (extra.length || !sig) return null;
    const expected = Buffer.from(signature(text)),
      actual = Buffer.from(sig);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const value = JSON.parse(Buffer.from(text, "base64url").toString());
    if (!Number.isFinite(value.exp) || value.exp <= Date.now()) return null;
    return value;
  } catch {
    return null;
  }
}
export function session(req) {
  const value = verify(cookie(req, "rc_session"));
  if (
    value?.purpose !== "session" ||
    typeof value.sub !== "string" ||
    !value.email
  )
    return null;
  return {
    id: value.sub,
    email: value.email,
    name: value.name || "",
    isAdmin: isAdminEmail(value.email),
  };
}
export function setCookie(res, name, value, maxAge) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === "production";
  const next = `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
  const previous = res.getHeader("Set-Cookie");
  res.setHeader(
    "Set-Cookie",
    previous
      ? [...(Array.isArray(previous) ? previous : [previous]), next]
      : next,
  );
}
export function issueNonce(res) {
  const nonce = randomBytes(24).toString("hex");
  setCookie(
    res,
    "rc_nonce",
    sign({ purpose: "nonce", nonce, exp: Date.now() + 10 * 60 * 1000 }),
    600,
  );
  return nonce;
}
export function requireUser(req) {
  const user = session(req);
  if (!user)
    throw Object.assign(new Error("Daxil olmaq tələb olunur."), {
      status: 401,
    });
  return user;
}
export function requireAdmin(req) {
  const user = requireUser(req);
  if (!user.isAdmin)
    throw Object.assign(new Error("Bu əməliyyat yalnız admin üçündür."), {
      status: 403,
    });
  return user;
}
