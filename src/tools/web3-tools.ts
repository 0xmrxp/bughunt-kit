import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-util-values'
import { recordRun } from '../assessment-store.js'
import {
  contractReviewChecklist,
  decodeCalldata,
  explainApprovalRisk,
} from '../services/web3.js'

function asJson(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue
}

/**
 * `bughunt.decode-calldata` decodes local EVM calldata text against a small safe
 * signature table. It never connects to an RPC endpoint or broadcasts anything.
 */
export const decodeCalldataTool = defineTool({
  name: 'bughunt.decode-calldata',
  description: 'Decode supplied EVM calldata locally: selector, arguments, and safe warnings.',
  parameters: {
    calldata: { type: 'string', required: true, description: '0x-prefixed calldata text' },
    to: { type: 'string', description: 'Optional destination 0x contract address' },
    value: { type: 'string', description: 'Optional decimal or hex ETH value label' },
    chainId: { type: 'integer', description: 'Optional chain ID for labeling only' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    const decoded = decodeCalldata({
      calldata: args.calldata,
      to: args.to ?? null,
      value: args.value ?? null,
      chainId: args.chainId ?? null,
    })
    recordRun({
      tool: 'bughunt.decode-calldata',
      at: new Date().toISOString(),
      summary: `${decoded.selector}: ${decoded.signature ?? 'unknown selector'}`,
    })
    return asJson(decoded)
  },
})

/**
 * `bughunt.approval-risk` explains ERC-20/721 approval exposure for supplied
 * spender and amount values. It is educational and does not sign anything.
 */
export const approvalRiskTool = defineTool({
  name: 'bughunt.approval-risk',
  description: 'Explain token approval risk from a supplied spender, amount, and function name.',
  parameters: {
    spender: { type: 'string', required: true, description: 'Spender 0x contract address' },
    amount: { type: 'string', required: true, description: 'Decimal integer allowance amount' },
    functionName: { type: 'string', description: 'Optional function name, for example approve' },
  },
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    const risk = explainApprovalRisk({
      spender: args.spender,
      amount: args.amount,
      functionName: args.functionName ?? null,
    })
    recordRun({
      tool: 'bughunt.approval-risk',
      at: new Date().toISOString(),
      summary: `${risk.riskLevel}: ${risk.isUnlimited ? 'unlimited allowance' : 'bounded allowance'}`,
    })
    return asJson(risk)
  },
})

/**
 * `bughunt.contract-review` returns the static defensive smart-contract review
 * checklist. It never reads contracts from an RPC endpoint automatically.
 */
export const contractReviewTool = defineTool({
  name: 'bughunt.contract-review',
  description: 'Return a static defensive smart-contract review checklist.',
  parameters: {},
  output: {
    schema: { type: 'json' },
    render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
  },
  async execute(_args, exec) {
    if (exec.signal.aborted) throw exec.signal.reason
    const checklist = contractReviewChecklist()
    recordRun({
      tool: 'bughunt.contract-review',
      at: new Date().toISOString(),
      summary: `${checklist.items.length} checklist item(s) returned`,
    })
    return asJson(checklist)
  },
})
