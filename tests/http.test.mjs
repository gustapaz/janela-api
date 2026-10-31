import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../server/node-runtime.mjs";
import { meta } from "../server/meta.mjs";
const req = (body, headers = {}) =>
  handle(
    new Request("https://janela.test/api/v1/availability", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
test("real HTTP request invokes WASM and emits expected slots", async () => {
  const r = await req(meta.examples[0].input);
  assert.equal(r.status, 200);
  assert.equal((await r.json()).slot_count, 10);
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("malformed JSON, UTF8, media type, size and origin guarded", async () => {
  assert.equal((await req("{")).status, 400);
  assert.equal((await req("a".repeat(33000))).status, 413);
  assert.equal((await req({}, { "content-type": "text/plain" })).status, 415);
  assert.equal((await req({}, { origin: "https://evil.test" })).status, 403);
  const r = await handle(
    new Request("https://janela.test/api/v1/availability", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: new Uint8Array([255]),
    }),
  );
  assert.equal(r.status, 400);
});
test("health executes engine and OpenAPI describes the two operations", async () => {
  const r = await handle(new Request("https://janela.test/api/health"));
  assert.equal((await r.json()).engine_check, true);
  const spec = await (
    await handle(new Request("https://janela.test/api/openapi.json"))
  ).json();
  assert.ok(spec.paths[meta.primary]);
  assert.ok(spec.paths[meta.secondary]);
});
