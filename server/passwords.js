import {
  scrypt,
  randomBytes,
  timingSafeEqual,
  createHmac,
  randomInt,
} from "node:crypto";
import { promisify } from "node:util";
const derive = promisify(scrypt);
export function validPassword(value) {
  return typeof value === "string" && value.length >= 8 && value.length <= 128;
}
export async function hashPassword(value) {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(value, salt, 64);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}
export async function checkPassword(value, encoded) {
  try {
    const [method, salt, hex] = encoded.split(":");
    if (method !== "scrypt" || !validPassword(value)) return false;
    const expected = Buffer.from(hex, "hex"),
      actual = await derive(value, salt, 64);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  } catch {
    return false;
  }
}
export const newCode = () => String(randomInt(100000, 1000000));
export const codeHash = (email, purpose, code) =>
  createHmac("sha256", process.env.AUTH_SECRET)
    .update(`${email}:${purpose}:${code}`)
    .digest("hex");
