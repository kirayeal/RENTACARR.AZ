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
    if (req.method === "GET" && action === "session")
      return json(res, 200, { user: session(req) });
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
    await sql`INSERT INTO rc_users(id,email,name) VALUES(${payload.sub},${email},${name}) ON CONFLICT(id) DO UPDATE SET email=EXCLUDED.email,name=EXCLUDED.name`;
    // Only profiles explicitly pre-authorized by the admin can attach by verified email.
    await sql`UPDATE rc_owners SET account_user_id=${payload.sub} WHERE account_user_id IS NULL AND admin_managed=TRUE AND LOWER(expected_email)=${email}`;
    setCookie(
      res,
      "rc_session",
      sign({
        purpose: "session",
        method: "google",
        sub: payload.sub,
        email,
        name,
        exp: Date.now() + 24 * 60 * 60 * 1000,
      }),
      86400,
    );
    setCookie(res, "rc_nonce", "", 0);
    return json(res, 200, {
      user: { id: payload.sub, email, name, isAdmin: isAdminEmail(email) },
    });
  });
}
export default createHandler();
