import { randomUUID } from "node:crypto";
import { requireUser } from "../server/auth.js";
import {
  endpoint,
  json,
  body,
  assertOrigin,
  httpError,
} from "../server/http.js";
import { db, listingRow } from "../server/db.js";
import { cleanListing } from "../server/validation.js";
import { normalizePhone } from "../src/ownership.js";
export function createHandler({ getDb = db } = {}) {
  return endpoint(async (req, res) => {
    if (req.method === "GET") {
      if (!process.env.DATABASE_URL)
        return json(res, 200, { configured: false, listings: [] });
      const sql = await getDb();
      const rows =
        await sql`SELECT l.*,o.name AS owner_name,o.phone,o.kind FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id WHERE l.status='active' ORDER BY CASE l.promotion WHEN 'premium' THEN 2 WHEN 'vip' THEN 1 ELSE 0 END DESC,l.created_at DESC`;
      return json(res, 200, {
        configured: true,
        listings: rows.map(listingRow),
      });
    }
    const user = await requireUser(req, getDb);
    assertOrigin(req);
    const input = await body(req);
    const sql = await getDb();
    if (req.method === "POST") {
      const registration =
        await sql`SELECT user_id FROM rc_registrations WHERE user_id=${user.id}`;
      if (!registration[0])
        throw httpError(409, "Əvvəlcə qeydiyyat məlumatlarını tamamlayın.");
      if (!user.isAdmin) {
        const count =
          await sql`SELECT COUNT(*)::INT AS n FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id WHERE o.account_user_id=${user.id}`;
        if (count[0].n >= 1)
          throw httpError(
            409,
            "Pulsuz hesab üçün 1 elan limiti var. Əlavə elan üçün adminlə əlaqə saxlayın.",
          );
      }
      const data = cleanListing(input);
      let owner;
      if (input.ownerId) {
        const rows =
          await sql`SELECT * FROM rc_owners WHERE id=${String(input.ownerId)}`;
        owner = rows[0];
        if (!owner || (!user.isAdmin && owner.account_user_id !== user.id))
          throw httpError(
            403,
            "Bu sahibin adından elan yerləşdirə bilməzsiniz.",
          );
      } else {
        let phone;
        try {
          phone = normalizePhone(input.phone);
        } catch {
          throw httpError(400, "Telefon nömrəsini düzgün daxil edin.");
        }
        const name = String(input.owner || "")
          .trim()
          .slice(0, 80);
        if (!name) throw httpError(400, "Sahibin adını daxil edin.");
        const expected = user.isAdmin
          ? String(input.ownerEmail || "")
              .trim()
              .toLowerCase()
          : user.email;
        if (expected && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(expected))
          throw httpError(400, "E-poçt ünvanını düzgün daxil edin.");
        let account = user.isAdmin ? null : user.id;
        if (user.isAdmin && expected) {
          const found =
            await sql`SELECT id FROM rc_users WHERE email=${expected}`;
          account = found[0]?.id || null;
        }
        const rows =
          await sql`INSERT INTO rc_owners(id,name,phone,kind,expected_email,account_user_id,created_by,admin_managed) VALUES(${randomUUID()},${name},${phone},${input.ownerKind === "company" ? "company" : "person"},${expected || null},${account},${user.id},${user.isAdmin}) RETURNING *`;
        owner = rows[0];
      }

      const promotion =
        user.isAdmin && ["standard", "vip", "premium"].includes(input.promotion)
          ? input.promotion
          : "standard";
      const id = randomUUID();
      if (user.isAdmin) {
        await sql`INSERT INTO rc_listings(id,owner_id,created_by,status,promotion,data) VALUES(${id},${owner.id},${user.id},'active',${promotion},${JSON.stringify(data)}::jsonb)`;
      } else {
        const results = await sql.transaction([
          sql`SELECT id FROM rc_users WHERE id=${user.id} FOR UPDATE`,
          sql`INSERT INTO rc_listings(id,owner_id,created_by,status,promotion,data) SELECT ${id},${owner.id},${user.id},'pending','standard',${JSON.stringify(data)}::jsonb WHERE (SELECT COUNT(*) FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id WHERE o.account_user_id=${user.id})<1 RETURNING id`,
        ]);
        if (!results[1].length)
          throw httpError(409, "Pulsuz hesab üçün 1 elan limiti var.");
      }
      return json(res, 201, { id });
    }
    if (!["PATCH", "DELETE"].includes(req.method))
      throw httpError(405, "Əməliyyat dəstəklənmir.");
    const rows =
      await sql`SELECT l.*,o.account_user_id FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id WHERE l.id=${String(input.id || "")}`;
    const listing = rows[0];
    if (!listing) throw httpError(404, "Elan tapılmadı.");
    if (!user.isAdmin && listing.account_user_id !== user.id)
      throw httpError(403, "Bu elanı idarə edə bilməzsiniz.");
    if (req.method === "DELETE") {
      await sql`DELETE FROM rc_listings WHERE id=${listing.id}`;
      return json(res, 200, { ok: true });
    }
    let status = listing.status,
      promotion = listing.promotion,
      data = listing.data,
      ownerId = listing.owner_id;
    if (input.ownerId && input.ownerId !== ownerId) {
      if (!user.isAdmin)
        throw httpError(403, "Sahibi yalnız admin dəyişə bilər.");
      const target =
        await sql`SELECT id FROM rc_owners WHERE id=${String(input.ownerId)}`;
      if (!target[0]) throw httpError(400, "Sahib tapılmadı.");
      ownerId = target[0].id;
    }
    if (input.details) {
      data = cleanListing(input.details);
      if (!user.isAdmin) status = "pending";
    }
    if (input.status !== undefined) {
      if (!user.isAdmin && input.status === "active")
        throw httpError(403, "Elanı yalnız admin təsdiqləyə bilər.");
      if (!["active", "paused", "pending"].includes(input.status))
        throw httpError(400, "Status düzgün deyil.");
      status = input.status;
    }
    if (input.promotion !== undefined) {
      if (!user.isAdmin)
        throw httpError(403, "Təqdimatı yalnız admin dəyişə bilər.");
      if (!["standard", "vip", "premium"].includes(input.promotion))
        throw httpError(400, "Təqdimat düzgün deyil.");
      promotion = input.promotion;
    }
    await sql`UPDATE rc_listings SET owner_id=${ownerId},status=${status},promotion=${promotion},data=${JSON.stringify(data)}::jsonb WHERE id=${listing.id}`;
    return json(res, 200, { ok: true });
  });
}
export default createHandler();
