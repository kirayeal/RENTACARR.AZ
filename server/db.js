import { neon } from "@neondatabase/serverless";
import { httpError } from "./http.js";
let connection, prepared;
export async function db() {
  if (!process.env.DATABASE_URL)
    throw httpError(503, "Verilənlər bazası hələ qoşulmayıb.");
  if (!connection) connection = neon(process.env.DATABASE_URL);
  if (!prepared)
    prepared = (async () => {
      await prepareSchema(connection);
    })().catch((e) => {
      prepared = null;
      throw e;
    });
  await prepared;
  return connection;
}
export function listingRow(row) {
  return {
    ...row.data,
    id: row.id,
    ownerId: row.owner_id,
    owner: row.owner_name,
    phone: row.phone,
    company: row.kind === "company",
    vip: row.promotion !== "standard",
    promotion: row.promotion,
    paused: row.status === "paused",
    status: row.status,
    demo: false,
  };
}
export function ownerRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    kind: row.kind,
    expectedEmail: row.expected_email,
    accountId: row.account_user_id,
  };
}

export async function prepareSchema(connection) {
  await connection.transaction([
    connection`SELECT pg_advisory_xact_lock(621340881)`,
    connection`CREATE TABLE IF NOT EXISTS rc_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    connection`CREATE TABLE IF NOT EXISTS rc_owners (id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, kind TEXT NOT NULL CHECK (kind IN ('company','person')), expected_email TEXT, account_user_id TEXT REFERENCES rc_users(id), created_by TEXT NOT NULL REFERENCES rc_users(id), admin_managed BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    connection`CREATE TABLE IF NOT EXISTS rc_listings (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES rc_owners(id), created_by TEXT NOT NULL REFERENCES rc_users(id), status TEXT NOT NULL CHECK (status IN ('pending','active','paused')), promotion TEXT NOT NULL DEFAULT 'standard' CHECK (promotion IN ('standard','vip','premium')), data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
    connection`CREATE INDEX IF NOT EXISTS rc_listings_owner_idx ON rc_listings(owner_id)`,
  ]);
}
