import { meta } from "./meta.mjs";
import { createCore } from "./core.mjs";
const interval = {
  type: "object",
  additionalProperties: false,
  required: ["start", "end"],
  properties: {
    start: { type: "integer", minimum: 0, maximum: 1439 },
    end: { type: "integer", minimum: 1, maximum: 1440 },
  },
};
const input = {
  type: "object",
  additionalProperties: false,
  required: ["start", "end", "duration", "participants"],
  properties: {
    ...interval.properties,
    duration: { type: "integer", minimum: 5, maximum: 480 },
    step: { type: "integer", minimum: 5, maximum: 120, default: 5 },
    buffer: { type: "integer", minimum: 0, maximum: 120, default: 0 },
    participants: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "busy"],
        properties: {
          id: { type: "string", pattern: "^[-a-zA-Z0-9_]{1,24}$" },
          busy: { type: "array", maxItems: 200, items: interval },
        },
      },
    },
  },
};
const base = {
  engine: { type: "string" },
  interval: { type: "string" },
  grid_origin: { type: "integer" },
  participants: { type: "integer" },
  free_minutes: { type: "integer" },
  windows: { type: "array", items: interval },
};
const output = {
  type: "object",
  properties: {
    ...base,
    slots: { type: "array", items: interval },
    slot_count: { type: "integer" },
  },
};
export function createService(module) {
  const run = createCore(module);
  return {
    meta,
    health: () => run(meta.examples[0].input).slot_count === 10,
    actions: {
      [meta.primary]: {
        label: "Calcular horários comuns",
        description: meta.behavior,
        input,
        output,
        run,
      },
      [meta.secondary]: {
        label: "Obter janelas contínuas livres",
        description: "Mesmo cálculo e validação; omite slots e slot_count.",
        input,
        output: { type: "object", properties: base },
        run: (v) => {
          const { slots, slot_count, ...rest } = run(v);
          return rest;
        },
      },
    },
  };
}
