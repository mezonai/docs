// Verifies EN/VI parity, frontmatter validity, sidebar_position uniqueness,
// image format integrity (no AVIF misnamed as .png), and content safety.
// usage: node scripts/check-docs-health.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, dirname, extname } from "node:path";

const EN_ROOT = join(process.cwd(), "docs");
const VI_ROOT = join(
  process.cwd(),
  "i18n",
  "vi",
  "docusaurus-plugin-content-docs",
  "current"
);

function walk(dir, filter) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full, filter));
    } else if (!filter || filter(full)) {
      out.push(full);
    }
  }
  return out;
}

const errors = [];
const warnings = [];

const isDoc = (p) => p.endsWith(".md") || p.endsWith(".mdx");
const enDocs = walk(EN_ROOT, isDoc).map((p) => relative(EN_ROOT, p).replace(/\\/g, "/"));
const viDocs = walk(VI_ROOT, isDoc).map((p) => relative(VI_ROOT, p).replace(/\\/g, "/"));
const enSet = new Set(enDocs);
const viSet = new Set(viDocs);

for (const d of enDocs) if (!viSet.has(d)) errors.push(`Missing VI mirror: ${d}`);
for (const d of viDocs) if (!enSet.has(d)) errors.push(`Missing EN source: ${d}`);

const FORBIDDEN_PATTERNS = [
  { name: "internal nccsoft host", re: /\bnccsoft\.vn\b/i },
  { name: "dev-stresser handle", re: /dev-stresser/i },
  { name: "private LAN IP", re: /\b(?:10\.10\.\d+\.\d+|172\.16\.\d+\.\d+|192\.168\.\d+\.\d+)\b/ },
];

function checkDocsTree(root, label) {
  const positionsByDir = new Map();
  for (const rel of walk(root, isDoc).map((p) => relative(root, p).replace(/\\/g, "/"))) {
    const full = join(root, rel);
    const text = readFileSync(full, "utf8");
    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      if (/^\s*showTOC\s*:/m.test(fm)) {
        errors.push(`[${label}] Invalid frontmatter key showTOC in ${rel} (use hide_table_of_contents)`);
      }
      const posMatch = fm.match(/^\s*sidebar_position\s*:\s*(\d+(?:\.\d+)?)/m);
      if (posMatch) {
        const dir = dirname(rel);
        const pos = Number(posMatch[1]);
        const map = positionsByDir.get(dir) || new Map();
        if (map.has(pos)) {
          errors.push(`[${label}] Duplicate sidebar_position ${pos} in ${dir}: ${map.get(pos)} & ${rel}`);
        } else {
          map.set(pos, rel);
          positionsByDir.set(dir, map);
        }
      }
    }
    for (const pat of FORBIDDEN_PATTERNS) {
      if (pat.re.test(text)) {
        errors.push(`[${label}] Forbidden pattern (${pat.name}) in ${rel}`);
      }
    }
    for (const m of text.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)) {
      const body = m[1];
      if (/^\s*sequenceDiagram\b/.test(body) && /<-->/.test(body)) {
        errors.push(`[${label}] Invalid sequenceDiagram arrow "<-->" in ${rel} (use "<<->>")`);
      }
    }
  }
  // Check _category_.json collisions in EN tree
  if (label === "en") {
    for (const full of walk(root, (p) => p.endsWith("_category_.json"))) {
      const rel = relative(root, full).replace(/\\/g, "/");
      const data = JSON.parse(readFileSync(full, "utf8"));
      if (typeof data.position === "number") {
        const parentDir = dirname(dirname(rel));
        const map = positionsByDir.get(parentDir) || new Map();
        if (map.has(data.position)) {
          errors.push(`[en] Duplicate sidebar position ${data.position} in ${parentDir}: ${map.get(data.position)} & ${rel}`);
        } else {
          map.set(data.position, rel);
          positionsByDir.set(parentDir, map);
        }
      }
    }
  }
}

checkDocsTree(EN_ROOT, "en");
checkDocsTree(VI_ROOT, "vi");

// Check images for real magic bytes and size cap
const isImg = (p) => /\.(png|jpe?g|webp|gif)$/i.test(p);
for (const [root, label] of [
  [EN_ROOT, "en"],
  [VI_ROOT, "vi"],
]) {
  for (const full of walk(root, isImg)) {
    const rel = relative(root, full).replace(/\\/g, "/");
    const buf = readFileSync(full);
    const ext = extname(full).toLowerCase();
    if (ext === ".png") {
      const isPng =
        buf.length >= 8 &&
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47;
      if (!isPng) {
        const isAvif = buf.slice(4, 8).toString("ascii") === "ftyp";
        warnings.push(
          `[${label}] Non-PNG content in .png file: ${rel} (${isAvif ? "ISOBMFF/AVIF" : "unknown"}, ${(buf.length / 1024).toFixed(1)} KB)`
        );
      }
    }
    if (buf.length > 350 * 1024) {
      warnings.push(`[${label}] Large image > 350 KB: ${rel} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  }
}

console.log(
  `docs-health: EN=${enDocs.length}, VI=${viDocs.length}, errors=${errors.length}, warnings=${warnings.length}`
);
for (const e of errors) console.log(`ERROR: ${e}`);
for (const w of warnings) console.log(`WARN:  ${w}`);
process.exit(errors.length ? 1 : 0);
