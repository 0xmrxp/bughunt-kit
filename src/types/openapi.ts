export interface OpenApiOperation {
  method: string
  path: string
  operationId: string | null
  summary: string | null
  security: string[]
  parameters: string[]
  requestBody: boolean
  responses: string[]
  riskSignals: string[]
}

export interface OpenApiInventory {
  version: string
  title: string
  serverUrls: string[]
  schemes: string[]
  operations: OpenApiOperation[]
  securitySchemes: string[]
  warnings: string[]
}
