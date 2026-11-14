import { randomUUID, createHmac } from "node:crypto";
import { db } from "../server/db.js";
import {
  endpoint,
  json,
  body,
  assertOrigin,
  httpError,
} from "../server/http.js";
import { sign, setCookie, session, isAdminEmail } from "../server/auth.js";
import {
  hashPassword,
  checkPassword,
  validPassword,
  newCode,
  codeHash,
} from "../server/passwords.js";
import { sendCode, mailConfigured } from "../server/mail.js";
import { normalizePhone } from "../src/ownership.js";
const configured = () =>
  Boolean(process.env.DATABASE_URL && process.env.AUTH_SECRET?.length >= 32);
let dummyHash;
export function createHandler({
  getDb = db,
  deliver = sendCode,
  canMail = mailConfigured,
} = {}) {
  return endpoint(async (req, res) => {
    const action =
      new URL(req.url, "http://local").searchParams.get("action") || "config";
    if (req.method === "GET" && action === "config")
      return json(res, 200, {
        enabled: configured(),
        recoveryEnabled: configured() && canMail(),
      });
    if (req.method !== "POST") throw httpError(405, "Əməliyyat dəstəklənmir.");
    assertOrigin(req);
    if (!configured())
      throw httpError(
        503,
        "Hesab xidməti üçün verilənlər bazası hələ qoşulmayıb.",
      );
    const input = await body(req),
      email = String(input.email || "")
        .trim()
        .toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      throw httpError(400, "E-poçt ünvanını düzgün daxil edin.");
    const sql = await getDb();
    const ip = String(
      req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local",
    ).split(",")[0];
    for (const subject of [email, ip]) {
      const key = createHmac("sha256", process.env.AUTH_SECRET)
        .update(action + ":" + subject)
        .digest("hex");
      const counts =
        await sql`INSERT INTO rc_account_limits(key,count,started_at) VALUES(${key},1,NOW()) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rc_account_limits.started_at<NOW()-INTERVAL '15 minutes' THEN 1 ELSE rc_account_limits.count+1 END,started_at=CASE WHEN rc_account_limits.started_at<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE rc_account_limits.started_at END RETURNING count`;
      if (counts[0].count > 10)
        throw httpError(
          429,
          "Çox sayda cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın.",
        );
    }
    async function issue(user, verified) {
      const token = sign({
        purpose: "session",
        method: "password",
        sub: user.id,
        email: user.email,
        name: user.name,
        emailVerified: verified,
        sessionVersion: user.session_version || 0,
        exp: Date.now() + 86400000,
      });
      setCookie(res, "rc_session", token, 86400);
      return json(res, 200, {
        user: session({ headers: { cookie: "rc_session=" + token } }),
      });
    }
    async function deliverCode(purpose) {
      if (!canMail())
        throw httpError(
          503,
          "Bərpa məktubu üçün e-poçt xidməti hələ qoşulmayıb.",
        );
      const code = newCode();
      await sql`INSERT INTO rc_email_codes(email,purpose,code_hash,expires_at,attempts) VALUES(${email},${purpose},${codeHash(email, purpose, code)},NOW()+INTERVAL '10 minutes',0) ON CONFLICT(email,purpose) DO UPDATE SET code_hash=EXCLUDED.code_hash,expires_at=EXCLUDED.expires_at,attempts=0`;
      try {
        await deliver(email, code, purpose);
      } catch {
        await sql`DELETE FROM rc_email_codes WHERE email=${email} AND purpose=${purpose}`;
        throw httpError(
          503,
          "E-poçt göndərilmədi. Bir az sonra yenidən cəhd edin.",
        );
      }
    }
    if (action === "signup") {
      if (!validPassword(input.password))
        throw httpError(400, "Şifrə 8–128 simvol olmalıdır.");
      const name = String(input.name || "").trim();
      if (!name || name.length > 100)
        throw httpError(400, "Adınızı daxil edin.");
      const kind = input.kind === "company" ? "company" : "person",
        company = String(input.company || "").trim();
      if (kind === "company" && (!company || company.length > 100))
        throw httpError(400, "Firma adını daxil edin.");
      let phone;
      try {
        phone = normalizePhone(input.phone);
      } catch {
        throw httpError(400, "Telefon nömrəsini düzgün daxil edin.");
      }
      if (isAdminEmail(email) && !canMail())
        throw httpError(
          503,
          "Admin hesabı üçün e-poçt təsdiqi lazımdır. Poçt xidmətini qoşun.",
        );
      const id = randomUUID(),
        hash = await hashPassword(input.password);
      try {
        await sql.transaction([
          sql`INSERT INTO rc_users(id,email,name) VALUES(${id},${email},${name})`,
          sql`INSERT INTO rc_registrations(user_id,name,phone,kind) VALUES(${id},${kind === "company" ? company : name},${phone},${kind})`,
          sql`INSERT INTO rc_credentials(user_id,password_hash,email_verified) VALUES(${id},${hash},FALSE)`,
        ]);
      } catch (e) {
        if (e.code === "23505")
          throw httpError(
            409,
            "Bu e-poçt və ya telefon artıq qeydiyyatdan keçib.",
          );
        throw e;
      }
      if (isAdminEmail(email)) {
        await deliverCode("verify");
        return json(res, 200, { verifyRequired: true, email });
      }
      return issue({ id, email, name }, false);
    }
    const users =
      await sql`SELECT u.*,c.password_hash,c.email_verified FROM rc_users u LEFT JOIN rc_credentials c ON c.user_id=u.id WHERE u.email=${email}`;
    const user = users[0];
    if (action === "login") {
      dummyHash ||= hashPassword("internal-dummy-password-not-a-user");
      const ok = await checkPassword(
        input.password,
        user?.password_hash || (await dummyHash),
      );
      if (!user?.password_hash || !ok)
        throw httpError(401, "E-poçt və ya şifrə düzgün deyil.");
      if (isAdminEmail(email) && !user.email_verified)
        throw httpError(
          403,
          "Admin e-poçtu təsdiqlənməlidir. Şifrə bərpasından istifadə edin.",
        );
      return issue(user, user.email_verified);
    }
    if (action === "forgot") {
      if (!canMail())
        throw httpError(
          503,
          "Bərpa məktubu üçün e-poçt xidməti hələ qoşulmayıb.",
        );
      if (user) await deliverCode("reset");
      return json(res, 200, { sent: true });
    }
    if (!["reset", "verify"].includes(action))
      throw httpError(404, "Əməliyyat tapılmadı.");
    if (action === "reset" && !validPassword(input.password))
      throw httpError(400, "Şifrə 8–128 simvol olmalıdır.");
    if (!/^\d{6}$/.test(String(input.code)))
      throw httpError(400, "6 rəqəmli kodu daxil edin.");
    const purpose = action === "reset" ? "reset" : "verify";
    const codes =
      await sql`UPDATE rc_email_codes SET attempts=attempts+1 WHERE email=${email} AND purpose=${purpose} AND expires_at>NOW() AND attempts<5 RETURNING code_hash`;
    if (
      !user ||
      !codes[0] ||
      codes[0].code_hash !== codeHash(email, purpose, String(input.code))
    )
      throw httpError(401, "Kod düzgün deyil və ya vaxtı bitib.");
    const consumed =
      await sql`DELETE FROM rc_email_codes WHERE email=${email} AND purpose=${purpose} AND code_hash=${codes[0].code_hash} RETURNING email`;
    if (!consumed[0]) throw httpError(401, "Kod artıq istifadə olunub.");
    if (action === "reset") {
      const hash = await hashPassword(input.password);
      await sql.transaction([
        sql`INSERT INTO rc_credentials(user_id,password_hash,email_verified) VALUES(${user.id},${hash},TRUE) ON CONFLICT(user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,email_verified=TRUE`,
        sql`UPDATE rc_users SET session_version=session_version+1 WHERE id=${user.id}`,
      ]);
      user.session_version = (user.session_version || 0) + 1;
    } else
      await sql`UPDATE rc_credentials SET email_verified=TRUE WHERE user_id=${user.id}`;
    await sql`UPDATE rc_owners SET account_user_id=${user.id} WHERE account_user_id IS NULL AND admin_managed=TRUE AND LOWER(expected_email)=${email}`;
    return issue(user, true);
  });
}
export default createHandler();
