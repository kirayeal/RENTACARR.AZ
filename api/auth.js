import { OAuth2Client } from "google-auth-library";
import {
  authConfigured,
  cookie,
  issueNonce,
  verify,
  sign,
  setCookie,
  session,
  isAdminEmail,
  requireUser,
} from "../server/auth.js";
import {
  endpoint,
  json,
  body,
  assertOrigin,
  httpError,
} from "../server/http.js";
import { db } from "../server/db.js";
let googleClient;
async function verifyGoogle(credential) {
  const client = (googleClient ||= new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
  ));
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
export function createHandler({
  getDb = db,
  verifyCredential = verifyGoogle,
} = {}) {
  return endpoint(async (req, res) => {
    const action =
      new URL(req.url, "http://local").searchParams.get("action") || "session";
    if (req.method === "GET" && action === "config") {
      const enabled = authConfigured();
      return json(res, 200, {
        enabled,
        clientId: enabled ? process.env.GOOGLE_CLIENT_ID : null,
        nonce: enabled ? issueNonce(res) : null,
      });
    }
    if (req.method === "GET" && action === "session") {
      if (!session(req)) return json(res, 200, { user: null });
      try {
        return json(res, 200, { user: await requireUser(req, getDb) });
      } catch (e) {
        if (e.status === 401) return json(res, 200, { user: null });
        throw e;
      }
    }
    if (req.method !== "POST") throw httpError(405, "Əməliyyat dəstəklənmir.");
    assertOrigin(req);
    if (action === "logout") {
      setCookie(res, "rc_session", "", 0);
      setCookie(res, "rc_nonce", "", 0);
      setCookie(res, "rc_phone", "", 0);
      return json(res, 200, { user: null });
    }
    if (action !== "login") throw httpError(404, "Səhifə tapılmadı.");
    if (!authConfigured())
      throw httpError(503, "Google girişi hələ aktivləşdirilməyib.");
    const input = await body(req);
    if (typeof input.credential !== "string" || input.credential.length > 12000)
      throw httpError(400, "Google təsdiqi çatışmır.");
    const nonce = verify(cookie(req, "rc_nonce"));
    if (nonce?.purpose !== "nonce")
      throw httpError(401, "Giriş sorğusunun vaxtı bitib. Yenidən cəhd edin.");
    let payload;
    try {
      payload = await verifyCredential(input.credential);
    } catch {
      throw httpError(401, "Google hesabı təsdiqlənmədi.");
    }
    if (
      payload?.email_verified !== true ||
      !payload.sub ||
      payload.nonce !== nonce.nonce ||
      !payload.email
    )
      throw httpError(401, "Google hesabı təsdiqlənmədi.");
    const email = payload.email.toLowerCase(),
      name = String(payload.name || email).slice(0, 100);
    const sql = await getDb();
    const existing = await sql`SELECT * FROM rc_users WHERE email=${email}`;
    const accountId = existing[0]?.id || payload.sub;
    if (!existing[0])
      await sql`INSERT INTO rc_users(id,email,name) VALUES(${accountId},${email},${name})`;
    await sql`UPDATE rc_credentials SET email_verified=TRUE WHERE user_id=${accountId}`;
    await sql`UPDATE rc_owners SET account_user_id=${accountId} WHERE account_user_id IS NULL AND admin_managed=TRUE AND LOWER(expected_email)=${email}`;
    setCookie(
      res,
      "rc_session",
      sign({
        purpose: "session",
        method: "google",
        sub: accountId,
        sessionVersion: existing[0]?.session_version || 0,
        email,
        name,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }),
      86400,
    );
    setCookie(res, "rc_nonce", "", 0);
    return json(res, 200, {
      user: { id: accountId, email, name, isAdmin: isAdminEmail(email) },
    });
  });
}
export default createHandler();
