import test from 'node:test'
import assert from 'node:assert/strict'
import { parseOpenApiDocument } from '../lib/services/openapi.js'

test('inventories OpenAPI operations and risk signals', () => {
  const result = parseOpenApiDocument({
    openapi: '3.0.3',
    info: { title: 'Demo API', version: '1.0.0' },
    servers: [{ url: 'https://demo.example.test/api' }],
    security: [{ bearerAuth: [] }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    paths: {
      '/users/{id}': {
        get: {
          operationId: 'getUser',
          parameters: [{ name: 'id', in: 'path', required: true }],
          responses: { '200': { description: 'ok' } },
        },
      },
      '/admin/export': {
        post: {
          requestBody: { required: true },
          responses: { '202': { description: 'queued' } },
        },
      },
    },
  })

  assert.equal(result.title, 'Demo API')
  assert.equal(result.operations.length, 2)
  assert.deepEqual(result.securitySchemes, ['bearerAuth'])
  assert.deepEqual(result.operations[1].riskSignals, ['sensitive-path', 'state-changing-success'])
})

test('rejects non-OpenAPI input', () => {
  assert.throws(() => parseOpenApiDocument({ swagger: '2.0', paths: {} }), /OpenAPI 3/)
})
