import test from "node:test";
import assert from "node:assert/strict";
import { rentBikes, buyoutBikes, minRentWeek } from "./bikes.ts";

test("каталог аренды сохраняет все три модели, включая тарифы по запросу", () => {
  assert.deepEqual(rentBikes.map((bike) => bike.name), ["Wenbox U2", "Wenbox U2 Pro", "Strong 350Z"]);
  assert.equal(rentBikes.find((bike) => bike.slug === "wenbox-u2")?.rent.week, null);
  assert.equal(minRentWeek, 4900);
});

test("каталог выкупа содержит три модели без выдуманного тарифа U2 Pro", () => {
  assert.deepEqual(buyoutBikes.map((bike) => bike.name), ["Wenbox U2 Pro", "Strong 350Z", "Wenbox U7"]);
  assert.equal(buyoutBikes.find((bike) => bike.slug === "wenbox-u2-pro")?.buyout, undefined);
  assert.equal(buyoutBikes.find((bike) => bike.slug === "wenbox-u7")?.buyout?.week, 4900);
});
