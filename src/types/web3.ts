export interface CalldataArgument {
  name: string
  type: string
  value: string
}

export interface DecodedCalldata {
  calldata: string
  selector: string
  signature: string | null
  chainId: number | null
  to: string | null
  value: string | null
  functionName: string | null
  arguments: CalldataArgument[]
  warnings: string[]
}

export type TokenApprovalRiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export interface TokenApprovalRisk {
  spender: string
  amount: string
  isUnlimited: boolean
  functionName: string | null
  riskLevel: TokenApprovalRiskLevel
  explanation: string
  mitigations: string[]
}

export interface ContractReviewItem {
  id: string
  category: string
  check: string
  guidance: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
}

export interface ContractReviewChecklist {
  generatedAt: string
  items: ContractReviewItem[]
}
