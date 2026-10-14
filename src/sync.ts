// Snapshot an Obsidian .base into <out>/<name>.json for <ObsidianBase />.
// Snapshots are committed, so the site builds without access to the vault.
// Usage: astro-obsidian-base <vault-dir> <path/in/vault/name.base> [--out src/data/bases]
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { parseBaseYaml, queryBase } from "mdbasequery";
import type { Base, View } from "./types.ts";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { out: { type: "string", default: "src/data/bases" } },
});
const [vault, basePath] = positionals;
if (!vault || !basePath) {
  console.error(
    "usage: astro-obsidian-base <vault-dir> <path/in/vault/name.base> [--out src/data/bases]",
  );
  process.exit(1);
}

const spec = parseBaseYaml(fs.readFileSync(path.join(vault, basePath), "utf8"));

// Obsidian wikilinks mean nothing on the blog: keep the alias or target text.
const clean = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(clean)
    : typeof v === "string"
      ? v.replace(
          /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
          (_, target: string, alias?: string) => alias ?? target,
        )
      : v;

const views: View[] = [];
for (const v of (spec.views ?? []).filter((v) => v.type === "table")) {
  // strict: false so a column no note has yet renders empty instead of failing.
  const result = await queryBase({ dir: vault, spec, view: v.name, strict: false });
  views.push({
    name: v.name,
    headers: result.columns.map(
      (c) =>
        spec.propertyConfigs?.[c]?.displayName ??
        (c === "file.name" ? "name" : c.replace(/^(note|file)\./, "")),
    ),
    rows: result.rows.map((r) =>
      result.columns.map((c) => {
        const value = clean(r.projected[c]) ?? null;
        return c === "file.name" && typeof value === "string" ? value.replace(/\.md$/, "") : value;
      }),
    ),
  });
}

const name = path.basename(basePath, ".base");
const base: Base = { name, views };
fs.mkdirSync(values.out, { recursive: true });
const out = path.join(values.out, `${name}.json`);
fs.writeFileSync(out, JSON.stringify(base, null, "\t") + "\n");
console.log(`${name}: ${views.map((v) => `${v.name} (${v.rows.length})`).join(", ")} -> ${out}`);
