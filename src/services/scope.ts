import type { AssessmentScope } from '../types/assessment.js'

const ABSOLUTE_HTTP_URL = /^https?:\/\/[A-Za-z0-9.-]+(?::\d{1,5})?(?:\/.*)?$/

export function validateScope(input: AssessmentScope): AssessmentScope {
  if (!ABSOLUTE_HTTP_URL.test(input.target)) {
    throw new Error('target must be an absolute http(s) URL')
  }
  if (input.allowedPaths.length === 0) {
    throw new Error('allowedPaths must contain at least one path')
  }
  if (input.allowedPaths.some((path) => !path.startsWith('/'))) {
    throw new Error('every allowed path must start with /')
  }
  if (!Number.isInteger(input.maxRequestsPerMinute) || input.maxRequestsPerMinute < 1 || input.maxRequestsPerMinute > 600) {
    throw new Error('maxRequestsPerMinute must be an integer from 1 to 600')
  }
  return { ...input, target: input.target.replace(/\/$/, '') }
}
