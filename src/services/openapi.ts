import type { OpenApiInventory, OpenApiOperation } from '../types/openapi.js'

const SENSITIVE_PATH = /(password|secret|token|session|admin|internal|debug|private|export|reset|invite|webhook)/i
const SENSITIVE_PARAM = /(token|secret|password|key|otp|ssn|card|account)/i
const SENSITIVE_HEADER = /(authorization|cookie|x-api-key|token|secret)/i

function asObject(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function namesOf(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'object' && item !== null && 'name' in item ? String((item as { name: unknown }).name) : undefined))
    .filter((name): name is string => typeof name === 'string')
}

function riskFor(method: string, path: string, parameterNames: string[], responseCodes: string[]): string[] {
  const signals: string[] = []
  if (SENSITIVE_PATH.test(path)) signals.push('sensitive-path')
  if (parameterNames.some((name) => SENSITIVE_PARAM.test(name))) signals.push('sensitive-parameter')
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && responseCodes.some((code) => code.startsWith('2'))) {
    signals.push('state-changing-success')
  }
  return signals
}

/**
 * Parse a user-supplied OpenAPI 3 document without network access.
 *
 * Large real-world documents are supported until a bounded 2MB document limit;
 * larger documents must be trimmed to the target's paths before submission.
 */
export function parseOpenApiDocument(document: unknown): OpenApiInventory {
  const root = asObject(document)
  if (!root || typeof root['openapi'] !== 'string' || !root['openapi'].startsWith('3.') || typeof root['info'] !== 'object') {
    throw new Error('document must be an OpenAPI 3 object with info and paths')
  }

  const text = JSON.stringify(document)
  if (text.length > 2_000_000) {
    throw new Error('document is too large; trim it to the scoped paths first')
  }

  const info = asObject(root['info']) ?? {}
  const servers = Array.isArray(root['servers'])
    ? root['servers'].map((server) => asObject(server)?.['url']).filter((url): url is string => typeof url === 'string')
    : []
  const paths = asObject(root['paths'])
  if (!paths) throw new Error('document must contain a paths object')

  const operations: OpenApiOperation[] = []
  const warnings: string[] = []
  const components = asObject(root['components']) ?? {}
  const securitySchemes = Object.keys(asObject(components['securitySchemes']) ?? {})
  const declaredSecurity = Array.isArray(root['security']) ? root['security'] : []

  for (const [path, item] of Object.entries(paths)) {
    const methods = asObject(item)
    if (!methods) {
      warnings.push(`skipped non-object path entry: ${path}`)
      continue
    }
    for (const [rawMethod, operationValue] of Object.entries(methods)) {
      const method = rawMethod.toUpperCase()
      if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) continue
      const operation = asObject(operationValue) ?? {}
      const security = Array.isArray(operation['security']) && operation['security'].length > 0
        ? operation['security']
        : declaredSecurity
      const operationSecurity = security
        .map((entry) => Object.keys(asObject(entry) ?? {}))
        .flat()
        .filter((name, index, list) => name.length > 0 && list.indexOf(name) === index)

      const parameters = [
        ...namesOf(operation['parameters']),
        ...namesOf(methods['parameters']),
      ].filter((name, index, list) => list.indexOf(name) === index)
      const requestBody = typeof operation['requestBody'] === 'object' && operation['requestBody'] !== null
      const responses = Object.keys(asObject(operation['responses']) ?? {})

      operations.push({
        method,
        path,
        operationId: typeof operation['operationId'] === 'string' ? operation['operationId'] : null,
        summary: typeof operation['summary'] === 'string' ? operation['summary'] : null,
        security: operationSecurity,
        parameters,
        requestBody,
        responses,
        riskSignals: riskFor(method, path, parameters, responses),
      })
    }
  }

  if (operations.length > 500) {
    warnings.push('inventory capped at 500 operations; split the document by path prefix for full coverage')
    operations.length = 500
  }
  if (operations.some((operation) => operation.responses.some((code) => SENSITIVE_HEADER.test(code)))) {
    warnings.push('response names contain credential-shaped headers; verify that no secret responses were pasted')
  }

  return {
    version: String(root['openapi']),
    title: typeof info['title'] === 'string' ? info['title'] : 'Untitled API',
    serverUrls: servers,
    schemes: securitySchemes,
    operations,
    securitySchemes,
    warnings,
  }
}
