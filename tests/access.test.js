import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { PGlite } from "@electric-sql/pglite";
import { prepareSchema } from "../server/db.js";
import { sign, verify, session, isAdminEmail } from "../server/auth.js";
import { createHandler as createAuth } from "../api/auth.js";
import { createHandler as createListings } from "../api/listings.js";
import { createHandler as createWorkspace } from "../api/workspace.js";
import { createHandler as createOwners } from "../api/owners.js";
import { createHandler as createAccount } from "../api/account.js";
import { createHandler as createProfile } from "../api/profile.js";
process.env.AUTH_SECRET = "test-only-secret-for-isolated-tests-1234567890";
process.env.GOOGLE_LOGIN_ENABLED = "true";
process.env.GOOGLE_CLIENT_ID = "test-only-google-client";
process.env.DATABASE_URL = "test-only-in-memory-database";
let pg, sql, listings, workspace, owners;
function tag(strings, ...values) {
  const text = strings.reduce(
    (s, part, i) => s + part + (i < values.length ? "$" + (i + 1) : ""),
    "",
  );
  return {
    text,
    values,
    then(resolve, reject) {
      return pg
        .query(text, values)
        .then((result) => result.rows)
        .then(resolve, reject);
    },
  };
}
const actor = (id, email) => ({
  sub: id,
  email,
  name: id,
  purpose: "session",
  method: "google",
  exp: Date.now() + 3600000,
});
const admin = actor("admin", "rentacarr.az@gmail.com"),
  alice = actor("alice", "alice@example.test"),
  bob = actor("bob", "bob@example.test");
function cookieFor(user) {
  return user ? "rc_session=" + sign(user) : "";
}
async function call(
  handler,
  {
    method = "GET",
    url = "/",
    user,
    input = {},
    cookie,
    origin = "http://local.test",
  } = {},
) {
  const req = Readable.from(
    method === "GET" ? [] : [Buffer.from(JSON.stringify(input))],
  );
  req.method = method;
  req.url = url;
  req.headers = {
    host: "local.test",
    origin,
    cookie: cookie ?? cookieFor(user),
  };
  const headers = {};
  let output = "";
  const res = {
    statusCode: 200,
    setHeader(k, v) {
      headers[k.toLowerCase()] = v;
    },
    getHeader(k) {
      return headers[k.toLowerCase()];
    },
    end(value) {
      output = String(value);
    },
  };
  await handler(req, res);
  return { status: res.statusCode, data: JSON.parse(output), headers };
}
const form = (name, email) => ({
  owner: name,
  ownerEmail: email,
  ownerKind: "company",
  phone: "+994501234567",
  brand: "Toyota",
  model: "Camry",
  year: 2023,
  price: 80,
  city: "Bakı",
  type: "Sedan",
  fuel: "Benzin",
  transmission: "Avtomat",
  seats: 5,
  deposit: 200,
  mileage: 250,
  minAge: 23,
  experience: 2,
  description: "Test listing",
  image: "https://example.test/car.jpg",
  promotion: "vip",
});
before(async () => {
  pg = new PGlite();
  sql = tag;
  sql.transaction = (queries) =>
    pg.transaction(async (tx) => {
      const results = [];
      for (const q of queries)
        results.push((await tx.query(q.text, q.values)).rows);
      return results;
    });
  await prepareSchema(sql);
  for (const u of [admin, alice, bob])
    await sql`INSERT INTO rc_users(id,email,name) VALUES(${u.sub},${u.email},${u.name})`;
  for (const [i, u] of [admin, alice, bob].entries())
    await sql`INSERT INTO rc_registrations(user_id,name,phone,kind) VALUES(${u.sub},${u.name},${"+99450123456" + i},'person')`;
  const getDb = async () => sql;
  listings = createListings({ getDb });
  workspace = createWorkspace({ getDb });
  owners = createOwners({ getDb });
});
after(async () => {
  await pg?.close();
});
test("signed sessions reject tampering, expiry, nonce cookies and client role claims", () => {
  const token = sign({ ...alice, isAdmin: true });
  assert.equal(
    session({ headers: { cookie: "rc_session=" + token } }).isAdmin,
    false,
  );
  assert.equal(verify(token + "x"), null);
  assert.equal(verify(sign({ ...alice, exp: 1 })), null);
  assert.equal(
    session({
      headers: {
        cookie:
          "rc_session=" +
          sign({ purpose: "nonce", nonce: "x", exp: Date.now() + 10000 }),
      },
    }),
    null,
  );
  assert.equal(isAdminEmail("rentacarr.az@gmail.com.evil.test"), false);
  assert.equal(isAdminEmail("RENTACARR.AZ@GMAIL.COM"), true);
});
test("anonymous and forged sessions cannot read private records or write", async () => {
  for (const handler of [workspace, listings, owners]) {
    const result = await call(handler, {
      method: handler === workspace ? "GET" : "POST",
      cookie: "rc_session=forged",
      input: { email: admin.email, isAdmin: true },
    });
    assert.ok([401, 405].includes(result.status));
    assert.equal(result.data.owners, undefined);
  }
});
test("private workspaces are isolated and public catalog excludes private emails and pending listings", async () => {
  const a = await call(listings, {
    method: "POST",
    user: admin,
    input: form("Alice fleet", alice.email),
  });
  assert.equal(a.status, 201);
  const b = await call(listings, {
    method: "POST",
    user: bob,
    input: form("Bob fleet", bob.email),
  });
  assert.equal(b.status, 201);
  const wa = await call(workspace, { user: alice });
  assert.equal(wa.status, 200);
  assert.equal(wa.data.owners.length, 1);
  assert.equal(wa.data.cars.length, 1);
  assert.equal(wa.data.pending.length, 0);
  assert.equal(wa.data.owners[0].expectedEmail, alice.email);
  const wb = await call(workspace, { user: bob });
  assert.equal(wb.data.cars.length, 0);
  assert.equal(wb.data.pending.length, 1);
  assert.ok(!JSON.stringify(wb.data).includes(alice.email));
  const all = await call(workspace, { user: admin });
  assert.equal(all.data.owners.length, 2);
  assert.equal(all.data.pending.length, 1);
  const catalog = await call(listings);
  assert.equal(catalog.data.listings.length, 1);
  assert.ok(!JSON.stringify(catalog.data).includes(alice.email));
  assert.equal(catalog.data.listings[0].status, "active");
  const attack = await call(listings, {
    method: "PATCH",
    user: bob,
    input: { id: a.data.id, details: form("Hacked", bob.email) },
  });
  assert.equal(attack.status, 403);
  const promotion = await call(listings, {
    method: "PATCH",
    user: alice,
    input: { id: a.data.id, promotion: "premium" },
  });
  assert.equal(promotion.status, 403);
  const selfApprove = await call(listings, {
    method: "PATCH",
    user: bob,
    input: { id: b.data.id, status: "active" },
  });
  assert.equal(selfApprove.status, 403);
  const foreignOwner = await call(owners, {
    method: "PATCH",
    user: bob,
    input: { id: wa.data.owners[0].id, ...form("Hacked", bob.email) },
  });
  assert.equal(foreignOwner.status, 403);
  const second = await call(listings, {
    method: "POST",
    user: bob,
    input: form("Bob second", bob.email),
  });
  assert.equal(second.status, 409);
  const crossOrigin = await call(listings, {
    method: "DELETE",
    user: admin,
    origin: "https://evil.test",
    input: { id: a.data.id },
  });
  assert.equal(crossOrigin.status, 403);
  const edit = await call(listings, {
    method: "PATCH",
    user: alice,
    input: { id: a.data.id, details: form("Alice fleet", alice.email) },
  });
  assert.equal(edit.status, 200);
  const afterEdit = await call(workspace, { user: alice });
  assert.equal(afterEdit.data.pending.length, 1);
});
test("only verified Google login attaches admin-preauthorized profiles to the owner account", async () => {
  const futureEmail = "future@example.test";
  const created = await call(listings, {
    method: "POST",
    user: admin,
    input: form("Future fleet", futureEmail),
  });
  assert.equal(created.status, 201);
  const config = await call(createAuth(), { url: "/?action=config" });
  assert.equal(config.data.enabled, true);
  const nonceCookie = [].concat(config.headers["set-cookie"])[0].split(";")[0];
  const payload = {
    sub: "future",
    email: futureEmail,
    name: "Future owner",
    email_verified: true,
    nonce: config.data.nonce,
  };
  const auth = createAuth({
    getDb: async () => sql,
    verifyCredential: async () => payload,
  });
  const login = await call(auth, {
    method: "POST",
    url: "/?action=login",
    cookie: nonceCookie,
    input: { credential: "test-google-proof", isAdmin: true },
  });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.isAdmin, false);
  const userCookie = []
    .concat(login.headers["set-cookie"])
    .find((x) => x.startsWith("rc_session="))
    .split(";")[0];
  const personal = await call(workspace, { cookie: userCookie });
  assert.equal(personal.data.owners.length, 1);
  assert.equal(personal.data.cars[0].id, created.data.id);
  assert.equal(personal.data.owners[0].accountId, "future");
  const invalid = createAuth({
    getDb: async () => sql,
    verifyCredential: async () => ({
      ...payload,
      email: admin.email,
      email_verified: false,
    }),
  });
  assert.equal(
    (
      await call(invalid, {
        method: "POST",
        url: "/?action=login",
        cookie: nonceCookie,
        input: { credential: "bad-proof" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await call(createAuth(), {
        method: "POST",
        url: "/?action=login",
        cookie: nonceCookie,
        input: { credential: "not-a-jwt" },
      })
    ).status,
    401,
  );
});

test("registration requires identity and reserves each normalized phone for one account", async () => {
  const profile = createProfile({ getDb: async () => sql });
  assert.equal(
    (
      await call(profile, {
        method: "POST",
        input: { name: "No identity", phone: "0501234567" },
      })
    ).status,
    401,
  );
  const u = actor("new-registration", "new-registration@example.test");
  await sql`INSERT INTO rc_users(id,email,name) VALUES(${u.sub},${u.email},${u.name})`;
  const duplicate = await call(profile, {
    method: "POST",
    user: u,
    input: { name: "New firm", kind: "company", phone: "0501234560" },
  });
  assert.equal(duplicate.status, 409);
  const success = await call(profile, {
    method: "POST",
    user: u,
    input: { name: "New firm", kind: "company", phone: "055 987 65 43" },
  });
  assert.equal(success.status, 200);
  assert.equal(success.data.profile.phone, "+994559876543");
  const read = await call(profile, { user: u });
  assert.equal(read.data.profile.name, "New firm");
  assert.equal(read.data.profile.complete, true);
});

test("email/password registration, unique phone and private password storage", async () => {
  const account = createAccount({
    getDb: async () => sql,
    canMail: () => true,
    deliver: async () => {},
  });
  const input = {
    name: "Password User",
    email: "password-user@example.test",
    phone: "070 111 22 33",
    password: "OriginalPass123",
    kind: "person",
  };
  const result = await call(account, {
    method: "POST",
    url: "/?action=signup",
    input,
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.user.isAdmin, false);
  const stored =
    await sql`SELECT c.password_hash FROM rc_credentials c JOIN rc_users u ON u.id=c.user_id WHERE u.email=${input.email}`;
  assert.ok(stored[0].password_hash.startsWith("scrypt:"));
  assert.notEqual(stored[0].password_hash, input.password);
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=signup",
        input: { ...input, email: "another-password@example.test" },
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=login",
        input: { email: input.email, password: "WrongPass123" },
      })
    ).status,
    401,
  );
  const login = await call(account, {
    method: "POST",
    url: "/?action=login",
    input: { email: input.email, password: input.password },
  });
  assert.equal(login.status, 200);
  const token = []
    .concat(login.headers["set-cookie"])
    .find((v) => v.startsWith("rc_session="))
    .split(";")[0];
  assert.equal((await call(workspace, { cookie: token })).status, 200);
});

test("six digit recovery codes expire, are single use, and revoke previous sessions", async () => {
  const sent = [];
  const account = createAccount({
    getDb: async () => sql,
    canMail: () => true,
    deliver: async (email, code, purpose) =>
      sent.push({ email, code, purpose }),
  });
  const email = "password-user@example.test";
  const before = await call(account, {
    method: "POST",
    url: "/?action=login",
    input: { email, password: "OriginalPass123" },
  });
  const oldCookie = [].concat(before.headers["set-cookie"])[0].split(";")[0];
  const known = await call(account, {
    method: "POST",
    url: "/?action=forgot",
    input: { email },
  });
  const unknown = await call(account, {
    method: "POST",
    url: "/?action=forgot",
    input: { email: "unknown@example.test" },
  });
  assert.deepEqual(known.data, unknown.data);
  assert.equal(sent.length, 1);
  assert.match(sent[0].code, /^\d{6}$/);
  const rows =
    await sql`SELECT code_hash FROM rc_email_codes WHERE email=${email} AND purpose='reset'`;
  assert.notEqual(rows[0].code_hash, sent[0].code);
  await sql`UPDATE rc_email_codes SET expires_at=NOW()-INTERVAL '1 minute' WHERE email=${email}`;
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=reset",
        input: { email, code: sent[0].code, password: "ChangedPass123" },
      })
    ).status,
    401,
  );
  await call(account, {
    method: "POST",
    url: "/?action=forgot",
    input: { email },
  });
  const code = sent.at(-1).code;
  const reset = await call(account, {
    method: "POST",
    url: "/?action=reset",
    input: { email, code, password: "ChangedPass123" },
  });
  assert.equal(reset.status, 200);
  assert.equal((await call(workspace, { cookie: oldCookie })).status, 401);
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=reset",
        input: { email, code, password: "AnotherPass123" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=login",
        input: { email, password: "OriginalPass123" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=login",
        input: { email, password: "ChangedPass123" },
      })
    ).status,
    200,
  );
});

test("admin email requires proof of ownership and recovery codes have a five-attempt limit", async () => {
  assert.equal(
    session({
      headers: {
        cookie:
          "rc_session=" +
          sign({ ...admin, method: "password", emailVerified: false }),
      },
    }).isAdmin,
    false,
  );
  const sent = [];
  const account = createAccount({
    getDb: async () => sql,
    canMail: () => true,
    deliver: async (email, code) => sent.push({ email, code }),
  });
  await call(account, {
    method: "POST",
    url: "/?action=forgot",
    input: { email: admin.email },
  });
  const code = sent.at(-1).code;
  const wrong = code === "111111" ? "222222" : "111111";
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await call(account, {
          method: "POST",
          url: "/?action=reset",
          input: {
            email: admin.email,
            code: wrong,
            password: "AdminSecure123",
          },
        })
      ).status,
      401,
    );
  assert.equal(
    (
      await call(account, {
        method: "POST",
        url: "/?action=reset",
        input: { email: admin.email, code, password: "AdminSecure123" },
      })
    ).status,
    401,
  );
  await call(account, {
    method: "POST",
    url: "/?action=forgot",
    input: { email: admin.email },
  });
  const result = await call(account, {
    method: "POST",
    url: "/?action=reset",
    input: {
      email: admin.email,
      code: sent.at(-1).code,
      password: "AdminSecure123",
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.data.user.isAdmin, true);
});
