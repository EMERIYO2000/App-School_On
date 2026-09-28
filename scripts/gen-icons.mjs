import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')
const src = join(publicDir, 'logo-mark.png')

const sizes = [192, 512, 180]
let ok = true

for (const s of sizes) {
  try {
    await sharp(src).resize(s, s).png().toFile(join(publicDir, `pwa-${s === 180 ? '180' : s}.png`))
    console.log('icon pwa-', s, 'OK')
  } catch (e) {
    ok = false
    console.error('icon', s, e.message)
  }
}

try {
  await sharp(src)
    .resize(410, 410)
    .composite([{ input: Buffer.from(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#2563eb" rx="0"/></svg>`), top: 0, left: 0 }])
    .png()
    .toFile(join(publicDir, 'pwa-maskable-512.png'))
  console.log('icon maskable OK')
} catch (e) {
  ok = false
  console.error('maskable', e.message)
}

console.log(ok ? 'done' : 'with errors')