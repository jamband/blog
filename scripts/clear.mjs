import { rm } from "node:fs/promises";

await rm(".astro", { recursive: true, force: true });
await rm("dist", { recursive: true, force: true });
