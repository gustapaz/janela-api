import { readFileSync } from "node:fs";
import { createHandler } from "./http.mjs";
import { createService } from "./service.mjs";
export const module = new WebAssembly.Module(
  readFileSync(new URL("../engine/pkg/janela.wasm", import.meta.url)),
);
export const service = createService(module);
export const handle = createHandler(service);
