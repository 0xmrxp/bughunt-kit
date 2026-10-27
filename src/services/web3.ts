import type {
  CalldataArgument,
  ContractReviewChecklist,
  TokenApprovalRisk,
} from '../types/web3.js'

const HEX_CALlDATA = /^0x[0-9a-fA-F]*$/
const ADDRESS_HEX = /^0x[0-9a-fA-F]{40}$/
const MAX_SAFE_CALlDATA_BYTES = 8_192
const KNOWN_SIGNATURES: Record<string, { name: string; params: ReadonlyArray<{ name: string; type: string }> }> = {
  '095ea7b3': {
    name: 'approve',
    params: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  a9059cbb: {
    name: 'transfer',
    params: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  '23b872dd': {
    name: 'transferFrom',
    params: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
  },
  '42842e0e': {
    name: 'safeTransferFrom',
    params: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },
  '641c3d79': {
    name: 'setApprovalForAll',
    params: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
  },
  d0def521: {
    name: 'permit',
    params: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
}

function ensureCalldata(calldata: string): string {
  const normalized = calldata.trim().toLowerCase()
  if (!HEX_CALlDATA.test(normalized)) {
    throw new Error('calldata must be 0x-prefixed hexadecimal text')
  }
  const bytes = (normalized.length - 2) / 2
  if (bytes > MAX_SAFE_CALlDATA_BYTES) {
    throw new Error('calldata is too large; supply the target transaction only')
  }
  return normalized
}

function decodeWord(word: string, type: string): string {
  if (type === 'address') return `0x${word.slice(-40)}`
  if (type === 'bool') return word.slice(-1) === '1' ? 'true' : 'false'
  if (type.startsWith('uint') || type.startsWith('int')) return BigInt(`0x${word}`).toString(10)
  if (type === 'bytes32') return `0x${word}`
  return `0x${word}`
}

function asChecksumOrLowercase(address: string): string {
  return address.toLowerCase()
}

export function decodeCalldata(input: {
  calldata: string
  chainId?: number | null
  to?: string | null
  value?: string | null
}): {
  calldata: string
  selector: string
  signature: string | null
  chainId: number | null
  to: string | null
  value: string | null
  functionName: string | null
  arguments: CalldataArgument[]
  warnings: string[]
} {
  const calldata = ensureCalldata(input.calldata)
  if (input.to !== undefined && input.to !== null && !ADDRESS_HEX.test(input.to)) {
    throw new Error('to must be a 0x address when provided')
  }

  const warnings: string[] = []
  if (calldata === '0x') {
    return {
      calldata,
      selector: '0x',
      signature: null,
      chainId: input.chainId ?? null,
      to: input.to ? asChecksumOrLowercase(input.to) : null,
      value: input.value ?? null,
      functionName: null,
      arguments: [],
      warnings: ['empty calldata represents a plain ETH transfer'],
    }
  }
  if (calldata.length < 10) {
    throw new Error('calldata must contain a 4-byte selector when non-empty')
  }

  const selector = calldata.slice(0, 10)
  const selectorKey = selector.slice(2)
  const known = KNOWN_SIGNATURES[selectorKey] ?? null
  const words: string[] = []
  for (let offset = 10; offset + 64 <= calldata.length; offset += 64) {
    words.push(calldata.slice(offset, offset + 64))
  }
  if ((calldata.length - 10) % 64 !== 0) {
    warnings.push('trailing calldata is not 32-byte aligned; only complete words were decoded')
  }

  const args: CalldataArgument[] = []
  if (known) {
    known.params.forEach((param, index) => {
      const word = words[index]
      if (!word) {
        warnings.push(`missing calldata word for parameter ${param.name}`)
        return
      }
      args.push({ name: param.name, type: param.type, value: decodeWord(word, param.type) })
    })
    if (words.length > known.params.length) {
      warnings.push('calldata contains more words than the known signature expects')
    }
  } else {
    warnings.push('selector is not in the local safe signature table; arguments were decoded as raw words')
    words.forEach((word, index) => {
      args.push({ name: `word${index}`, type: 'bytes32', value: decodeWord(word, 'bytes32') })
    })
  }

  return {
    calldata,
    selector,
    signature: known ? `${known.name}(${known.params.map((param) => param.type).join(',')})` : null,
    chainId: input.chainId ?? null,
    to: input.to ? asChecksumOrLowercase(input.to) : null,
    value: input.value ?? null,
    functionName: known?.name ?? null,
    arguments: args,
    warnings,
  }
}

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export function explainApprovalRisk(input: {
  spender: string
  amount: string
  functionName?: string | null
}): TokenApprovalRisk {
  const spender = input.spender.trim().toLowerCase()
  if (!ADDRESS_HEX.test(spender)) {
    throw new Error('spender must be a 0x token spender address')
  }
  const amount = input.amount.trim()
  if (!/^\d+$/.test(amount)) {
    throw new Error('amount must be a decimal integer string')
  }
  const functionName = input.functionName?.trim() || null
  const amountValue = BigInt(amount)
  const isUnlimited = amountValue === MAX_UINT256
  const isOperatorApproval = functionName === 'setApprovalForAll'

  let riskLevel: TokenApprovalRisk['riskLevel'] = 'low'
  if (amountValue === BigInt(0)) {
    riskLevel = 'none'
  } else if (isOperatorApproval || isUnlimited) {
    riskLevel = 'critical'
  } else if (amountValue > BigInt(10) ** BigInt(36)) {
    riskLevel = 'high'
  } else if (amountValue > 0) {
    riskLevel = 'medium'
  }

  return {
    spender,
    amount,
    isUnlimited,
    functionName,
    riskLevel,
    explanation: isOperatorApproval
      ? 'The calldata grants or revokes operator approval for every token in the collection. A malicious or compromised operator can move all approved NFTs.'
      : isUnlimited
        ? 'The amount equals the maximum uint256 allowance. The spender can transfer the full token balance until the allowance is reduced or revoked.'
        : amountValue === BigInt(0)
          ? 'A zero amount revokes or leaves no ERC-20 allowance for this spender.'
          : 'The allowance is bounded to the supplied decimal amount. It can still drain the approved balance, so prefer expiries, session scopes, or smaller allowances.',
    mitigations: [
      'Prefer the smallest allowance needed for the current transaction.',
      'Revoke unused approvals in the wallet or with the token contract.',
      'Verify the spender contract address and deployment history.',
      'Use transaction simulation before signing unfamiliar approvals.',
      'For NFTs, prefer single-token approval over operator-wide approval.',
    ],
  }
}

export function contractReviewChecklist(): ContractReviewChecklist {
  return {
    generatedAt: new Date().toISOString(),
    items: [
      { id: 'WEB3-AC-01', category: 'access-control', severity: 'critical', check: 'Owner and role initialization', guidance: 'Verify constructor or initializer assigns expected owners and roles. Confirm no unprotected ownership transfer, role grant, or self-destruct path.' },
      { id: 'WEB3-RE-01', category: 'reentrancy', severity: 'critical', check: 'External call ordering', guidance: 'Checks-effects-interactions should surround token or ETH transfers. Review callbacks, hooks, mint callbacks, and untrusted callee paths.' },
      { id: 'WEB3-OX-01', category: 'oracle', severity: 'high', check: 'Price and randomness sources', guidance: 'Identify price feeds, TWAP windows, sequencer behavior, staleness checks, and randomness assumptions. Mention accepted deviation and fallback behavior.' },
      { id: 'WEB3-AP-01', category: 'approvals', severity: 'high', check: 'Token allowance and permit handling', guidance: 'Review approve, permit, allowance, deadline, nonce, domain separator, signature replay, and spender validation.' },
      { id: 'WEB3-UP-01', category: 'upgradeability', severity: 'high', check: 'Proxy and initialization', guidance: 'Review proxy admin, implementation changes, storage layout, initializer versioning, and missing initializer protection.' },
      { id: 'WEB3-IN-01', category: 'input-validation', severity: 'medium', check: 'Calldata and parameter validation', guidance: 'Review zero address, amount bounds, array lengths, slippage, deadline enforcement, and replay or front-running concerns.' },
      { id: 'WEB3-ER-01', category: 'errors', severity: 'low', check: 'Error handling and events', guidance: 'Check custom errors, return values, approvals cleanup, and events needed for monitoring and incident response.' },
      { id: 'WEB3-OB-01', category: 'observability', severity: 'info', check: 'Audit evidence to retain', guidance: 'List deployed address, chain ID, compiler version, optimizer settings, verification source, tests, and manual review boundary.' },
    ],
  }
}
