export const preferenceKey = (userId, kind) =>
  `rentacarr.${kind}.${userId || "guest"}`;
const str = (value, fallback = "") =>
  typeof value === "string" ? value.slice(0, 100) : fallback;
export function normalizeSearch(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return {
    city: str(value.city, "Bütün şəhərlər"),
    brand: str(value.brand, "Bütün markalar"),
    max: str(value.max),
    model: str(value.model),
    category: str(value.category, "Hamısı"),
    sort: str(value.sort, "Seçilmiş elanlar"),
    criteria: {
      owner: ["all", "company", "person"].includes(value.criteria?.owner)
        ? value.criteria.owner
        : "all",
      fuel: str(value.criteria?.fuel),
      transmission: str(value.criteria?.transmission),
      seats: str(value.criteria?.seats),
      noDeposit: value.criteria?.noDeposit === true,
    },
  };
}
export function readSavedSearches(storage, key) {
  try {
    const items = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(items)
      ? items
          .filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              normalizeSearch(item.search),
          )
          .slice(0, 5)
          .map((item) => ({
            id: item.id.slice(0, 100),
            title: str(item.title),
            search: normalizeSearch(item.search),
          }))
      : [];
  } catch {
    return [];
  }
}
export function readRecentIds(storage, key) {
  try {
    const ids = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(ids)
      ? [...new Set(ids.filter((id) => typeof id === "string"))].slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export function rememberRecent(ids, id) {
  return [String(id), ...ids.filter((value) => value !== String(id))].slice(
    0,
    12,
  );
}
