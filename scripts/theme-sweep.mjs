import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const root = fileURLToPath(new URL('../src', import.meta.url))

const rules = [
  [/text-neutral-950/g, 'text-ink'],
  [/text-neutral-900/g, 'text-ink'],
  [/text-neutral-800/g, 'text-ink'],
  [/text-neutral-700/g, 'text-ink-2'],
  [/text-neutral-600/g, 'text-ink-2'],
  [/text-neutral-500/g, 'text-ink-3'],
  [/text-neutral-400/g, 'text-ink-3'],
  [/bg-neutral-50/g, 'bg-body'],
  [/bg-neutral-100/g, 'bg-surface-2'],
  [/bg-neutral-200/g, 'bg-surface-3'],
  [/bg-neutral-300/g, 'bg-surface-3'],
  [/border-neutral-300/g, 'border-line'],
  [/border-neutral-200/g, 'border-line'],
  [/border-neutral-100/g, 'border-line'],
  [/border-neutral-400/g, 'border-line'],
  [/divide-neutral-100/g, 'divide-line'],
  [/divide-neutral-200/g, 'divide-line'],
  [/divide-neutral-300/g, 'divide-line'],
  [/hover:bg-neutral-100/g, 'hover:bg-surface-2'],
  [/hover:bg-neutral-50/g, 'hover:bg-body'],
  [/hover:bg-neutral-200/g, 'hover:bg-surface-2'],
  [/hover:border-neutral-400/g, 'hover:border-line'],
  [/focus:bg-white/g, 'focus:bg-surface'],
  [/placeholder:text-neutral-500/g, 'placeholder:text-ink-3'],
  [/from-neutral-50/g, 'from-body'],
  [/bg-white\/95/g, 'bg-surface/95'],
  [/bg-white\/85/g, 'bg-surface/85'],
  [/bg-white\/(?![\d])/g, 'bg-surface/'],
  [/bg-white(?![\w/])/g, 'bg-surface'],
]

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(jsx|js)$/.test(name)) out.push(p)
  }
  return out
}

let changed = 0
for (const file of walk(root)) {
  let content = readFileSync(file, 'utf8')
  let hit = false
  for (const [re, to] of rules) {
    if (re.test(content)) {
      content = content.replace(re, to)
      hit = true
    }
  }
  if (hit) {
    writeFileSync(file, content)
    changed++
    console.log('updated', file)
  }
}
console.log('done. files changed:', changed)