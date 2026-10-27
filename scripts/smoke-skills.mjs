import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../skills/', import.meta.url)
const names = []
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  const path = new URL(`${entry.name}/SKILL.md`, root)
  const text = await readFile(path, 'utf8')
  const match = text.match(/^---\n([\s\S]*?)\n---/)
  if (!match || !/^name:\s*\S+/m.test(match[1]) || !/^description:\s*\S+/m.test(match[1])) {
    throw new Error(`invalid skill frontmatter: ${entry.name}`)
  }
  names.push(entry.name)
}
if (names.length < 3) throw new Error('expected at least three bundled skills')
console.log(`validated ${names.length} skill frontmatter files`)
