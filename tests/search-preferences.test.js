import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSearch,
  preferenceKey,
  readSavedSearches,
  readRecentIds,
  rememberRecent,
} from "../src/searchPreferences.js";
test("saved search data is normalized, bounded and separated by account", () => {
  assert.notEqual(
    preferenceKey("a", "searches"),
    preferenceKey("b", "searches"),
  );
  assert.notEqual(
    preferenceKey(null, "searches"),
    preferenceKey("a", "searches"),
  );
  assert.equal(normalizeSearch(null), null);
  assert.equal(normalizeSearch([]), null);
  const search = normalizeSearch({
    brand: "Toyota",
    city: "Bakı",
    max: "100",
    criteria: { owner: "person", seats: "7", noDeposit: true },
  });
  assert.equal(search.brand, "Toyota");
  assert.equal(search.criteria.noDeposit, true);
  assert.equal(search.criteria.owner, "person");
  assert.equal(
    normalizeSearch({ criteria: { owner: "root" } }).criteria.owner,
    "all",
  );
  const storage = {
    getItem: () =>
      JSON.stringify(
        Array.from({ length: 8 }, (_, i) => ({
          id: String(i),
          title: "T".repeat(200),
          search,
        })),
      ),
  };
  const saved = readSavedSearches(storage, "key");
  assert.equal(saved.length, 5);
  assert.equal(saved[0].title.length, 100);
  assert.deepEqual(saved[0].search, search);
  for (const raw of ["{broken", "{}", '[null,{"id":"x","search":null}]'])
    assert.deepEqual(readSavedSearches({ getItem: () => raw }, "key"), []);
  assert.deepEqual(
    readSavedSearches(
      {
        getItem: () => {
          throw Error("denied");
        },
      },
      "key",
    ),
    [],
  );
});
test("recent views move to the front, deduplicate and keep at most twelve ids", () => {
  let ids = [];
  for (let i = 0; i < 20; i++) ids = rememberRecent(ids, i);
  assert.equal(ids.length, 12);
  assert.equal(ids[0], "19");
  ids = rememberRecent(ids, 14);
  assert.equal(ids[0], "14");
  assert.equal(ids.filter((id) => id === "14").length, 1);
  assert.deepEqual(
    readRecentIds({ getItem: () => '["1","1",null,2,"3"]' }, "key"),
    ["1", "3"],
  );
  assert.deepEqual(
    readRecentIds(
      {
        getItem: () => {
          throw Error("denied");
        },
      },
      "key",
    ),
    [],
  );
});
