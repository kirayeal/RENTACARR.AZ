import { requireUser } from "../server/auth.js";
import {
  endpoint,
  json,
  body,
  assertOrigin,
  httpError,
} from "../server/http.js";
import { db } from "../server/db.js";
import { normalizePhone } from "../src/ownership.js";
export function createHandler({ getDb = db } = {}) {
  return endpoint(async (req, res) => {
    const user = requireUser(req),
      sql = await getDb();
    if (req.method === "GET") {
      const rows =
        await sql`SELECT name,phone,kind FROM rc_registrations WHERE user_id=${user.id}`;
      return json(res, 200, {
        profile: rows[0] ? { ...rows[0], complete: true } : null,
      });
    }
    if (req.method !== "POST") throw httpError(405, "Əməliyyat dəstəklənmir.");
    assertOrigin(req);
    const input = await body(req);
    let phone;
    try {
      phone = normalizePhone(input.phone);
    } catch {
      throw httpError(400, "Mobil nömrəni düzgün daxil edin.");
    }
    const name = String(input.name || "").trim();
    if (!name || name.length > 100)
      throw httpError(400, "Ad və ya firma adını daxil edin.");
    const kind = input.kind === "company" ? "company" : "person";
    try {
      await sql`INSERT INTO rc_registrations(user_id,name,phone,kind) VALUES(${user.id},${name},${phone},${kind}) ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,kind=EXCLUDED.kind`;
    } catch (e) {
      if (e.code === "23505")
        throw httpError(
          409,
          "Bu nömrə artıq başqa hesabda qeydiyyatdan keçib.",
        );
      throw e;
    }
    return json(res, 200, { profile: { name, phone, kind, complete: true } });
  });
}
export default createHandler();
