import test from "node:test";
import assert from "node:assert/strict";
import { brands, cities, initial } from "../src/catalog.js";
import { catalogOptionMatches, foldCatalogText } from "../src/catalogSearch.js";
test("expanded directories preserve sample listing values and contain no duplicates or motorbike-only brands", () => {
  assert(brands.length >= 130);
  assert(cities.length >= 79);
  assert.equal(new Set(brands.map(foldCatalogText)).size, brands.length);
  assert.equal(new Set(cities.map(foldCatalogText)).size, cities.length);
  for (const car of initial) {
    assert(brands.includes(car.brand));
    assert(cities.includes(car.city));
  }
  for (const name of ["Avatr", "Denza", "Jaecoo", "Khazar", "Xiaomi", "Zotye"])
    assert(brands.includes(name));
  for (const name of [
    "İsmayıllı",
    "Mingəçevir",
    "Kəlbəcər",
    "Zəngilan",
    "Xırdalan",
  ])
    assert(cities.includes(name));
  for (const name of ["Yamaha", "Ducati", "Harley-Davidson"])
    assert(!brands.includes(name));
});
test("directory search accepts Azerbaijani letters, plain Latin input, translated names and familiar aliases", () => {
  for (const [value, label, query] of [
    ["Şəki", "Шеки", "seki"],
    ["İsmayıllı", "Исмаиллы", "ismayilli"],
    ["Qəbələ", "Gabala", "qebele"],
    ["Bakı", "Баку", "баку"],
    ["Mercedes-Benz", "Mercedes-Benz", "mersedes"],
    ["Lada", "Lada", "vaz"],
    ["Škoda", "Škoda", "skoda"],
  ])
    assert(catalogOptionMatches(value, label, query), query);
  assert(!catalogOptionMatches("Toyota", "Toyota", "bmw"));
  assert(
    catalogOptionMatches(
      "Mercedes-Maybach",
      "Mercedes-Maybach",
      "mercedes may",
    ),
  );
  assert(catalogOptionMatches("Bakı", "Baku", ""));
});
