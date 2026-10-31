import { exact, invalid } from "./http.mjs";
function integer(v, min, max, name) {
  if (!Number.isInteger(v) || v < min || v > max)
    invalid("invalid_input", name + " fora do limite.");
  return v;
}
export function validate(v) {
  exact(
    v,
    ["start", "end", "duration", "step", "buffer", "participants"],
    "request",
  );
  const start = integer(v.start, 0, 1439, "start"),
    end = integer(v.end, start + 1, 1440, "end");
  const duration = integer(v.duration, 5, 480, "duration"),
    step = integer(v.step ?? 5, 5, 120, "step"),
    buffer = integer(v.buffer ?? 0, 0, 120, "buffer");
  if (v.step === null || v.buffer === null)
    invalid("invalid_input", "Opcionais não aceitam null.");
  if (
    !Array.isArray(v.participants) ||
    v.participants.length < 1 ||
    v.participants.length > 10
  )
    invalid("invalid_input", "Use 1–10 participantes.");
  const ids = new Set();
  let total = 0;
  const intervals = v.participants.flatMap((p) => {
    exact(p, ["id", "busy"], "participant");
    if (
      typeof p.id !== "string" ||
      !/^[-a-zA-Z0-9_]{1,24}$/.test(p.id) ||
      ids.has(p.id)
    )
      invalid("invalid_input", "ID inválido ou repetido.");
    ids.add(p.id);
    if (!Array.isArray(p.busy))
      invalid("invalid_input", "busy deve ser array.");
    return p.busy.map((b) => {
      exact(b, ["start", "end"], "busy");
      const s = integer(b.start, 0, 1439, "busy.start");
      return { start: s, end: integer(b.end, s + 1, 1440, "busy.end") };
    });
  });
  total = intervals.length;
  if (total > 200) invalid("invalid_input", "Até 200 intervalos.");
  return {
    start,
    end,
    duration,
    step,
    buffer,
    intervals,
    participants: ids.size,
  };
}
export function createCore(module) {
  return function analyze(input) {
    const v = validate(input);
    const e = new WebAssembly.Instance(module, {
      env: {
        abort() {
          throw new Error("WASM trap");
        },
      },
    }).exports;
    e.reset(v.start, v.end, v.duration, v.step, v.buffer);
    for (const b of v.intervals) e.block(b.start, b.end);
    const count = e.solve();
    return {
      engine: "assemblyscript-wasm",
      interval: "[start,end)",
      grid_origin: v.start,
      participants: v.participants,
      free_minutes: e.freeMinutes(),
      windows: Array.from({ length: e.windowCount() }, (_, i) => ({
        start: e.windowStart(i),
        end: e.windowEnd(i),
      })),
      slots: Array.from({ length: count }, (_, i) => ({
        start: e.slotStart(i),
        end: e.slotEnd(i),
      })),
      slot_count: count,
    };
  };
}
