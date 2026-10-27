/**
 * Bundled bughunt-kit skill provider.
 *
 * Walks this package's `skills/` directory recursively so each SKILL.md folder
 * registers through the DSH skill seam without a manual candidate list.
 *
 * @module bughunt-kit/skills
 */

import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import type {
  SkillCandidate,
  SkillDefinition,
  SkillLookupOptions,
  SkillProvider,
  SkillProviderControl,
} from '@deepseek-ai/dsh-skill'

export const PROVIDER_NAME = 'bughunt-kit'

function resolveBundledRoot(relative: string): string | undefined {
  try {
    return fileURLToPath(new URL(relative, import.meta.url))
  } catch {
    return undefined
  }
}

const SKILLS_ROOT = resolveBundledRoot('../skills')

function parseFrontmatter(text: string): { fm: Record<string, string>; body: string } {
  const src = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  if (!src.startsWith('---')) return { fm: {}, body: text }
  const end = src.indexOf('\n---', 3)
  if (end === -1) return { fm: {}, body: text }
  const fm: Record<string, string> = {}
  for (const line of src.slice(3, end).split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):[ \t]*(.*)$/)
    const key = match?.[1]
    const value = match?.[2]
    if (key && value !== undefined) fm[key] = value.trim().replace(/^["']|["']$/g, '')
  }
  return { fm, body: src.slice(end + 4) }
}

export function createBughuntSkillsProvider() {
  let cache: readonly SkillCandidate[] | null = null

  async function collect(root: string, registration: AbortSignal, options: SkillLookupOptions) {
    const items: SkillCandidate[] = []
    async function walk(dir: string) {
      if (registration.aborted) throw registration.reason
      if (options.signal?.aborted) throw options.signal.reason
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (registration.aborted) throw registration.reason
        const path = join(dir, entry.name)
        if (entry.isDirectory()) await walk(path)
        else if (entry.name === 'SKILL.md') {
          const text = await readFile(path, 'utf8')
          const { fm } = parseFrontmatter(text)
          const name = fm['name']
          if (name) {
            items.push({
              name,
              description: fm['description'] ?? '',
              invocation: { modelInvocable: true, userInvocable: true },
              provider: PROVIDER_NAME,
              source: 'bundled',
              resourceBase: { kind: 'directory', path: dirname(path) },
              path,
              rank: 0,
              locator: pathToFileURL(path),
            } as SkillCandidate)
          }
        }
      }
    }
    await walk(root)
    return items
  }

  const provider: SkillProvider = {
    name: PROVIDER_NAME,
    async list(options: SkillLookupOptions = {}) {
      if (SKILLS_ROOT === undefined) return { candidates: [], complete: false }
      if (cache === null) cache = await collect(SKILLS_ROOT, options.signal ?? new AbortController().signal, options)
      return { candidates: cache, complete: true }
    },
    async get(candidate: SkillCandidate, options: SkillLookupOptions = {}) {
      if (options.signal?.aborted) throw options.signal.reason
      const source = (candidate.path ?? candidate.locator) as string | URL
      const { body } = parseFrontmatter(await readFile(source, 'utf8'))
      return {
        name: candidate.name,
        description: candidate.description,
        invocation: candidate.invocation,
        provider: candidate.provider,
        source: candidate.source,
        resourceBase: candidate.resourceBase,
        path: candidate.path,
        content: body,
      } as SkillDefinition
    },
  }
  return provider
}

/** Register the provider once per plugin mount. */
export function registerSkills(control: SkillProviderControl): SkillProvider {
  return createBughuntSkillsProvider()
}
