import test from 'node:test'
import assert from 'node:assert/strict'
import {
  contractReviewChecklist,
  decodeCalldata,
  explainApprovalRisk,
} from '../lib/services/web3.js'

const spender = '0x0000000000000000000000000000000000000001'
const user = `0x${'22'.repeat(20)}`

test('decodes a known ERC-20 approve call', () => {
  const amount = `0x${'f'.repeat(64)}`
  const selector = '0x095ea7b3'
  const result = decodeCalldata({
    calldata: `${selector}${spender.slice(2).padStart(64, '0')}${amount.slice(2)}`,
  })
  assert.equal(result.selector, selector)
  assert.equal(result.functionName, 'approve')
  assert.equal(result.arguments[0].value, spender)
  assert.equal(result.arguments[1].value, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
})

test('warns on unknown selectors instead of guessing', () => {
  const result = decodeCalldata({ calldata: `0xdeadbeef${'00'.repeat(32)}` })
  assert.equal(result.signature, null)
  assert.ok(result.warnings.some((warning) => warning.includes('not in the local safe signature table')))
})

test('marks unlimited allowances as critical', () => {
  const risk = explainApprovalRisk({
    spender,
    amount: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    functionName: 'approve',
  })
  assert.equal(risk.riskLevel, 'critical')
  assert.equal(risk.isUnlimited, true)
})

test('explains operator-wide NFT approval risk', () => {
  const risk = explainApprovalRisk({ spender: user, amount: '1', functionName: 'setApprovalForAll' })
  assert.equal(risk.riskLevel, 'critical')
})

test('returns a review checklist with all core categories', () => {
  const checklist = contractReviewChecklist()
  const categories = new Set(checklist.items.map((item) => item.category))
  for (const category of ['access-control', 'reentrancy', 'oracle', 'approvals', 'upgradeability']) {
    assert.ok(categories.has(category), `missing ${category}`)
  }
})
