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
    if (req.method !== "PATCH") throw httpError(405, "Əməliyyat dəstəklənmir.");
    const user = await requireUser(req, getDb);
    assertOrigin(req);
    const input = await body(req),
      sql = await getDb();
    const rows =
      await sql`SELECT * FROM rc_owners WHERE id=${String(input.id || "")}`;
    const owner = rows[0];
    if (!owner) throw httpError(404, "Sahib tapılmadı.");
    if (!user.isAdmin && owner.account_user_id !== user.id)
      throw httpError(403, "Bu profili idarə edə bilməzsiniz.");
    let phone;
    try {
      phone = normalizePhone(input.phone);
    } catch {
      throw httpError(400, "Telefon nömrəsini düzgün daxil edin.");
    }
    const name = String(input.owner || "")
      .trim()
      .slice(0, 80);
    if (!name) throw httpError(400, "Sahib adı tələb olunur.");
    const expected = user.isAdmin
      ? String(input.ownerEmail || "")
          .trim()
          .toLowerCase()
      : user.email;
    if (expected && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expected))
      throw httpError(400, "E-poçt düzgün deyil.");
    let account = user.id;
    if (user.isAdmin) {
      const found = expected
        ? await sql`SELECT id FROM rc_users WHERE email=${expected}`
        : [];
      account = found[0]?.id || null;
    }
    await sql`UPDATE rc_owners SET name=${name},phone=${phone},kind=${input.ownerKind === "company" ? "company" : "person"},expected_email=${expected || null},account_user_id=${account} WHERE id=${owner.id}`;
    return json(res, 200, { ok: true });
  });
}
export default createHandler();
