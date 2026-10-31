import { test } from "node:test";
import assert from "node:assert/strict";
import { module } from "../server/node-runtime.mjs";
import { createCore } from "../server/core.mjs";
import { meta } from "../server/meta.mjs";
const run = createCore(module),
  base = {
    start: 0,
    end: 60,
    duration: 10,
    step: 5,
    participants: [{ id: "a", busy: [] }],
  };
test("all examples satisfy published expectations", () => {
  for (const e of meta.examples) {
    const r = run(e.input);
    for (const [k, v] of Object.entries(e.expected)) assert.equal(r[k], v);
  }
});
test("touching intervals are merged; half-open boundaries remain bookable", () => {
  const r = run({
    ...base,
    participants: [
      {
        id: "a",
        busy: [
          { start: 10, end: 20 },
          { start: 20, end: 30 },
        ],
      },
    ],
  });
  assert.deepEqual(r.windows, [
    { start: 0, end: 10 },
    { start: 30, end: 60 },
  ]);
  assert.deepEqual(r.slots[0], { start: 0, end: 10 });
});
test("grid stays anchored to journey start", () => {
  const r = run({
    ...base,
    start: 2,
    end: 40,
    participants: [{ id: "a", busy: [{ start: 2, end: 6 }] }],
  });
  assert.equal(r.slots[0].start, 7);
});
test("buffers clip at day edges and outside blocks can overlap after padding", () => {
  const r = run({
    ...base,
    start: 10,
    end: 50,
    buffer: 5,
    participants: [
      {
        id: "a",
        busy: [
          { start: 0, end: 8 },
          { start: 49, end: 60 },
        ],
      },
    ],
  });
  assert.deepEqual(r.windows, [{ start: 13, end: 44 }]);
});
test("maximal empty day produces bounded 288 slots", () => {
  assert.equal(run({ ...base, end: 1440, duration: 5 }).slot_count, 288);
});
test("empty participants, null, duplicates, malformed intervals and excess rejected", () => {
  for (const v of [
    { ...base, participants: [] },
    { ...base, step: null },
    { ...base, extra: 1 },
    { ...base, end: 0 },
    { ...base, participants: [{ id: "a", busy: [{ start: 5, end: 5 }] }] },
    { ...base, participants: [...base.participants, ...base.participants] },
    {
      ...base,
      participants: [
        {
          id: "a",
          busy: Array.from({ length: 201 }, () => ({ start: 1, end: 2 })),
        },
      ],
    },
  ])
    assert.throws(() => run(v));
});
test("300 seeded scenarios match independent minute/slot oracle", () => {
  let seed = 712;
  const rnd = (n) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  };
  for (let k = 0; k < 300; k++) {
    const end = 60 + rnd(180),
      start = rnd(30),
      duration = 5 + rnd(30),
      step = 5 + rnd(15),
      buffer = rnd(10),
      participants = Array.from({ length: 1 + rnd(3) }, (_, i) => ({
        id: "p" + i,
        busy: Array.from({ length: rnd(6) }, () => {
          const s = rnd(240);
          return { start: s, end: s + 1 + rnd(20) };
        }),
      })),
      v = { start, end, duration, step, buffer, participants },
      r = run(v),
      free = (m) =>
        !participants.some((p) =>
          p.busy.some((b) => m >= b.start - buffer && m < b.end + buffer),
        );
    let count = 0;
    for (let s = start; s + duration <= end; s += step)
      if (Array.from({ length: duration }, (_, i) => s + i).every(free))
        count++;
    assert.equal(r.slot_count, count);
    assert.equal(
      r.free_minutes,
      Array.from({ length: end - start }, (_, i) => start + i).filter(free)
        .length,
    );
  }
});
test("fresh instances do not leak previous agendas", () => {
  run({ ...base, participants: [{ id: "a", busy: [{ start: 0, end: 60 }] }] });
  assert.equal(run(base).free_minutes, 60);
});
