import { createHmac } from "node:crypto";
import { db } from "../server/db.js";
import { sign, verify, cookie, setCookie, session } from "../server/auth.js";
import {
  endpoint,
  json,
  body,
  assertOrigin,
  httpError,
} from "../server/http.js";
import { normalizePhone } from "../src/ownership.js";
export function phoneConfigured() {
  return Boolean(
    process.env.AUTH_SECRET?.length >= 32 &&
    process.env.DATABASE_URL &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID,
  );
}
async function twilio(path, data) {
  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${encodeURIComponent(process.env.TWILIO_VERIFY_SERVICE_SID)}/${path}`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.TWILIO_ACCOUNT_SID +
              ":" +
              process.env.TWILIO_AUTH_TOKEN,
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
      signal: AbortSignal.timeout(15000),
    },
  );
  const value = await response.json();
  if (!response.ok)
    throw httpError(
      response.status === 429 ? 429 : 400,
      "SMS əməliyyatı alınmadı. Bir az sonra yenidən cəhd edin.",
    );
  return value;
}
export function createHandler({ getDb = db, sendVerification = twilio } = {}) {
  return endpoint(async (req, res) => {
    const action =
      new URL(req.url, "http://local").searchParams.get("action") || "config";
    if (req.method === "GET" && action === "config")
      return json(res, 200, { enabled: phoneConfigured() });
    if (req.method !== "POST") throw httpError(405, "Əməliyyat dəstəklənmir.");
    assertOrigin(req);
    if (!phoneConfigured())
      throw httpError(
        503,
        "SMS xidməti hələ qoşulmayıb. Nömrə ilə giriş hazırda aktiv deyil.",
      );
    const input = await body(req),
      sql = await getDb();
    let phone;
    try {
      phone = normalizePhone(input.phone);
    } catch {
      throw httpError(400, "Telefon nömrəsini düzgün daxil edin.");
    }
    if (action === "start") {
      const ip = String(
        req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "local",
      ).split(",")[0];
      for (const key of ["phone:" + phone, "ip:" + ip]) {
        const hash = createHmac("sha256", process.env.AUTH_SECRET)
          .update(key)
          .digest("hex");
        const result =
          await sql`INSERT INTO rc_sms_limits(key,count,started_at) VALUES(${hash},1,NOW()) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rc_sms_limits.started_at<NOW()-INTERVAL '15 minutes' THEN 1 ELSE rc_sms_limits.count+1 END,started_at=CASE WHEN rc_sms_limits.started_at<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE rc_sms_limits.started_at END RETURNING count`;
        if (result[0].count > 5)
          throw httpError(
            429,
            "Çox sayda cəhd edildi. 15 dəqiqə sonra yenidən yoxlayın.",
          );
      }
      await sendVerification("Verifications", { To: phone, Channel: "sms" });
      setCookie(
        res,
        "rc_phone",
        sign({ purpose: "phone", phone, exp: Date.now() + 600000 }),
        600,
      );
      return json(res, 200, { sent: true });
    }
    if (action !== "verify") throw httpError(404, "Əməliyyat tapılmadı.");
    const challenge = verify(cookie(req, "rc_phone"));
    if (
      challenge?.purpose !== "phone" ||
      challenge.phone !== phone ||
      !/^\d{6}$/.test(String(input.code))
    )
      throw httpError(401, "Təsdiq kodunu yoxlayın və yenidən cəhd edin.");
    const result = await sendVerification("VerificationCheck", {
      To: phone,
      Code: String(input.code),
    });
    if (result.status !== "approved")
      throw httpError(401, "Təsdiq kodu düzgün deyil.");
    const rows =
      await sql`SELECT u.* FROM rc_registrations r JOIN rc_users u ON u.id=r.user_id WHERE r.phone=${phone}`;
    let user = rows[0];
    if (!user) {
      const id = "phone:" + phone,
        email = phone.slice(1) + "@phone.invalid";
      const users =
        await sql`INSERT INTO rc_users(id,email,name) VALUES(${id},${email},'İstifadəçi') ON CONFLICT(id) DO UPDATE SET id=EXCLUDED.id RETURNING *`;
      user = users[0];
    }
    setCookie(
      res,
      "rc_session",
      sign({
        purpose: "session",
        method: "phone",
        sub: user.id,
        email: user.email,
        name: user.name,
        phone,
        exp: Date.now() + 86400000,
      }),
      86400,
    );
    setCookie(res, "rc_phone", "", 0);
    return json(res, 200, {
      user: session({
        headers: {
          cookie:
            "rc_session=" +
            sign({
              purpose: "session",
              method: "phone",
              sub: user.id,
              email: user.email,
              name: user.name,
              phone,
              exp: Date.now() + 86400000,
            }),
        },
      }),
    });
  });
}
export default createHandler();
