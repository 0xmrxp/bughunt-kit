/**
 * Shared assessment domain types for bughunt-kit.
 *
 * Every finding in this package stays read-only and reproducible: tools collect
 * evidence from authorized targets, the report layer formats it, and secrets are
 * redacted before anything is persisted or shown to the model.
 *
 * @module bughunt-kit/types
 */

export type AssessmentMode = 'passive' | 'active'

export interface AssessmentScope {
  target: string
  authorization: 'owned' | 'written-permission' | 'bug-bounty-program'
  allowedPaths: string[]
  mode: AssessmentMode
  maxRequestsPerMinute: number
}

export interface HttpHeaderEvidence {
  name: string
  value: string
}

export interface ReconEvidence {
  target: string
  finalUrl: string
  status: number
  headers: HttpHeaderEvidence[]
  securityHeaders: Record<string, string | null>
  technologies: string[]
  robotsTxt: string | null
  sitemapUrls: string[]
  openApiUrls: string[]
  collectedAt: string
}

export interface JsEndpointEvidence {
  file: string
  endpoints: string[]
  sourceMaps: string[]
  redactedSecretPatterns: number
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface AssessmentFinding {
  id: string
  title: string
  severity: Severity
  asset: string
  evidence: string
  reproduction: string[]
  impact: string
  remediation: string
  references: string[]
}

export interface AssessmentReport {
  target: string
  mode: AssessmentMode
  generatedAt: string
  executiveSummary: string
  findings: AssessmentFinding[]
}
