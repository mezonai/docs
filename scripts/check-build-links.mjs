// Checks internal links and images in a Docusaurus build: every href/src under /docs/ must exist in build/.
// usage: node scripts/check-build-links.mjs build
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const root = resolve(process.argv[2] || "build");
const BASE = "/docs/";
const files = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p) : p.endsWith(".html") && files.push(p);
  }
};
walk(root);

const exists = (urlPath) => {
  const rel = decodeURIComponent(urlPath.slice(BASE.length));
  const p = join(root, rel);
  if (existsSync(p) && statSync(p).isFile()) return true;
  if (existsSync(join(p, "index.html"))) return true;
  return existsSync(p + ".html");
};

const bad = new Map();
const fragile = new Map();
const add = (map, u, f) =>
  (map.get(u) || map.set(u, new Set()).get(u)).add(f.slice(root.length));
let checked = 0;

for (const f of files) {
  const html = readFileSync(f, "utf8");
  const relDir = dirname(f).slice(root.length).replace(/\\/g, "/");
  const pageUrl = BASE + relDir.replace(/^\/+/, "");
  const noSlashBase = new URL(pageUrl, "http://x");
  const slashBase = new URL(pageUrl.replace(/\/?$/, "/"), "http://x");

  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const raw = m[1];
    if (!raw || /^(https?:|mailto:|data:|javascript:|#)/.test(raw)) continue;
    const abs = (base) => new URL(raw, base).pathname;
    const u = abs(noSlashBase);
    if (!u.startsWith(BASE)) {
      add(bad, u, f);
      continue;
    }
    checked++;
    if (!exists(u)) {
      add(bad, u, f);
      continue;
    }
    if (!raw.startsWith("/") && !exists(abs(slashBase))) {
      add(fragile, raw, f);
    }
  }
}

console.log(
  `html files: ${files.length}, internal refs checked: ${checked}, broken targets: ${bad.size}, fragile relative links: ${fragile.size}`
);
for (const [u, from] of bad) {
  console.log(
    `BROKEN ${u}  <- ${[...from].slice(0, 3).join(", ")}${
      from.size > 3 ? ` (+${from.size - 3})` : ""
    }`
  );
}
for (const [u, from] of fragile) {
  console.log(
    `FRAGILE ${u}  <- ${[...from].slice(0, 3).join(", ")}${
      from.size > 3 ? ` (+${from.size - 3})` : ""
    }`
  );
}
process.exit(bad.size || fragile.size ? 1 : 0);
