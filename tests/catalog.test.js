import test from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  demoOwners,
  brands,
  upgradeDemoWorkspace,
  promotionRank,
} from "../src/catalog.js";
test("ten complete demo listings belong to the same demo owner without real contacts", () => {
  assert.equal(initial.length, 10);
  assert.equal(new Set(initial.map((c) => c.id)).size, 10);
  for (const car of initial) {
    assert.equal(car.ownerId, demoOwners[0].id);
    assert.equal(car.phone, "");
    assert.ok(brands.includes(car.brand));
    assert.ok(car.deposit >= 0 && car.mileage > 0);
    assert.ok(car.image.startsWith("/photos/"));
  }
  assert.deepEqual(
    new Set(initial.map((c) => c.promotion)),
    new Set(["standard", "vip", "premium"]),
  );
});
test("premium sorts before VIP and standard", () => {
  assert.ok(
    promotionRank({ promotion: "premium" }) >
      promotionRank({ promotion: "vip" }),
  );
  assert.ok(
    promotionRank({ promotion: "vip" }) >
      promotionRank({ promotion: "standard" }),
  );
});
test("migration adds missing examples once and preserves user data", () => {
  const custom = { id: "custom", name: "My car", price: 999 };
  const saved = {
    version: 1,
    cars: [{ ...initial[0], price: 123 }, custom],
    pending: [custom],
    owners: [{ id: "my-owner" }],
  };
  const upgraded = upgradeDemoWorkspace(saved);
  assert.equal(upgraded.cars.length, 11);
  assert.equal(upgraded.cars[0].price, 123);
  assert.ok(upgraded.owners.some((o) => o.id === "my-owner"));
  assert.deepEqual(upgraded.pending, [custom]);
  const removed = {
    ...upgraded,
    cars: upgraded.cars.filter((c) => c.id !== 1),
  };
  assert.equal(upgradeDemoWorkspace(removed).cars.length, 10);
});

test("photo migration replaces only built-in illustrations and preserves custom data", async () => {
  const { upgradeDemoPhotos } = await import("../src/catalog.js");
  const saved = {
    cars: [
      { id: 1, image: "/cars/demo-1.svg", price: 432, paused: true },
      { id: 2, image: "https://example.com/custom.jpg", name: "Custom name" },
      { id: "custom", image: "/cars/demo-3.svg" },
    ],
  };
  const next = upgradeDemoPhotos(saved);
  assert.equal(next.cars[0].image, initial[0].image);
  assert.equal(next.cars[0].price, 432);
  assert.equal(next.cars[0].paused, true);
  assert.equal(next.cars[1].name, "Custom name");
  assert.equal(next.cars[1].image, "https://example.com/custom.jpg");
  assert.deepEqual(next.cars[2], saved.cars[2]);
});
