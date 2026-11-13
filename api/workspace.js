import { requireUser } from "../server/auth.js";
import { endpoint, json, httpError } from "../server/http.js";
import { db, listingRow, ownerRow } from "../server/db.js";
export function createHandler({ getDb = db } = {}) {
  return endpoint(async (req, res) => {
    if (req.method !== "GET") throw httpError(405, "Əməliyyat dəstəklənmir.");
    const user = requireUser(req);
    const sql = await getDb();
    const owners = user.isAdmin
      ? await sql`SELECT * FROM rc_owners ORDER BY created_at DESC`
      : await sql`SELECT * FROM rc_owners WHERE account_user_id=${user.id} ORDER BY created_at DESC`;
    const listings = user.isAdmin
      ? await sql`SELECT l.*,o.name AS owner_name,o.phone,o.kind FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id ORDER BY l.created_at DESC`
      : await sql`SELECT l.*,o.name AS owner_name,o.phone,o.kind FROM rc_listings l JOIN rc_owners o ON o.id=l.owner_id WHERE o.account_user_id=${user.id} ORDER BY l.created_at DESC`;
    return json(res, 200, {
      owners: owners.map(ownerRow),
      cars: listings.filter((l) => l.status !== "pending").map(listingRow),
      pending: listings.filter((l) => l.status === "pending").map(listingRow),
    });
  });
}
export default createHandler();
