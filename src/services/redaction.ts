const SECRET_PATTERNS: readonly RegExp[] = [
  /(?:api[_-]?key|token|secret|password|private[_-]?key)\s*[:=]\s*["']?[^\s"']+/gi,
  /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
  /\b0x[a-f0-9]{64}\b/gi,
]

/** Redact credential-shaped values before evidence reaches storage or reports. */
export function redactSensitive(text: string): { value: string; matches: number } {
  let value = text
  let matches = 0
  for (const pattern of SECRET_PATTERNS) {
    value = value.replace(pattern, (match) => {
      matches += 1
      const separator = match.match(/[:=]/)?.[0] ?? ':'
      return `${match.split(separator)[0]}${separator} [REDACTED]`
    })
  }
  return { value, matches }
}
