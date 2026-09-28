import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')
const src = join(publicDir, 'logo-mark.png')

try {
  const bg = await sharp(Buffer.from(
    `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#2563eb"/></svg>`
  )).png().toBuffer()
  const logo = await sharp(src).resize(410, 410).png().toBuffer()
  await sharp(bg).composite([{ input: logo, top: 51, left: 51 }]).png().toFile(join(publicDir, 'pwa-maskable-512.png'))
  console.log('icon maskable OK')
} catch (e) {
  console.error('maskable error:', e.message)
}