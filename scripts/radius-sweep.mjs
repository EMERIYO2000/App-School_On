import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const root = fileURLToPath(new URL("../src", import.meta.url));

const RADII = new Set([
  "rounded",
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
  "rounded-full",
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(name)) out.push(p);
  }
  return out;
}

function processClass(cls) {
  if (/\brounded-full\b|\brounded-pill\b/.test(cls)) return cls;
  const hasSquare =
    /(^|[\s"])h-([6-9]|1[0-9]|2[0-4])(?=[\s"])/.test(cls) &&
    /(^|[\s"])w-([6-9]|1[0-9]|2[0-4])(?=[\s"])/.test(cls);
  if (!hasSquare) return cls;
  const re = /((?:hover:|focus:|group-hover:|group-[\w-]*:)?rounded)(-[a-z0-9]+)?/;
  const m = cls.match(re);
  if (!m) return cls;
  const plain = m[1] + (m[2] || "");
  if (!RADII.has(plain)) return cls;
  const suffix = plain.replace("rounded", "");
  if (suffix.includes("-t-") || suffix.includes("-b-") || suffix.includes("-l-") || suffix.includes("-r-")) return cls;
  const roundedIdx = m[1].lastIndexOf("rounded");
  const prefix = m[1].slice(0, roundedIdx);
  return cls.replace(re, prefix + "rounded-full");
}

let changed = 0;
for (const file of walk(root)) {
  let content = readFileSync(file, "utf8");
  let hit = false;

  const n1 = content.replace(/rounded(?![a-z-])/g, "rounded-lg");
  if (n1 !== content) {
    content = n1;
    hit = true;
  }
  const n2 = content.replace(/rounded-sm\b/g, "rounded-lg");
  if (n2 !== content) {
    content = n2;
    hit = true;
  }
  const n3 = content.replace(/className="([^"]*)"/g, (_m, cls) => {
    const out = processClass(cls);
    if (out !== cls) hit = true;
    return `className="${out}"`;
  });

  if (n3 !== content || hit) {
    writeFileSync(file, n3);
    changed++;
    console.log("updated", file);
  }
}
console.log("done. files changed:", changed);