// Fold Azerbaijani diacritics for keyboard-friendly searching while keeping saved values unchanged.
export function foldCatalogText(value) {
  return String(value)
    .toLocaleLowerCase("az")
    .replace(/ı/g, "i")
    .replace(/ə/g, "e")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
const aliases = {
  "Mercedes-Benz": ["Mercedes", "Mersedes"],
  Lada: ["VAZ", "LADA VAZ"],
  "Great Wall": ["GWM"],
  Škoda: ["Skoda", "Shkoda"],
  Citroën: ["Citroen"],
  SsangYong: ["Ssang Yong"],
};
export function catalogOptionMatches(value, label, query) {
  const needles = foldCatalogText(query).split(" ").filter(Boolean);
  const haystack = foldCatalogText(
    [value, label, ...(aliases[value] || [])].join(" "),
  );
  return needles.every((word) => haystack.includes(word));
}
