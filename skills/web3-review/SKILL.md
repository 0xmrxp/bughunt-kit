---
name: bughunt-web3-review
description: "Use for authorized, read-only Web3 review: decode supplied EVM calldata, explain token approval risk, and apply a static Solidity review checklist without signing, broadcasting, or exploiting transactions."
whenToUse: "Prefer when a user supplies calldata, token approval details, contract source, a local audit result, or asks for a defensive smart-contract review."
---

# Defensive Web3 Review

## Guardrails

- Work only on contracts and transaction data the user owns or is authorized to review.
- `bughunt.decode-calldata` is local-only and uses a bounded safe signature table.
- `bughunt.approval-risk` explains exposure; it never signs, submits, revokes, or changes an approval.
- `bughunt.contract-review` returns a checklist; it does not fetch bytecode, call an RPC, or generate an exploit.
- Never request seed phrases, private keys, wallet cookies, or signing approvals.

## Workflow

1. Confirm chain ID, destination, source of calldata, and authorization boundary.
2. Decode selector and arguments locally. Treat unknown selectors as raw words, not proof of function semantics.
3. For approvals, identify spender, amount, unlimited allowance, operator-wide NFT approval, expiry, nonce, and domain separation.
4. Run the static checklist across access control, reentrancy, oracles, approvals, upgradeability, validation, errors, and evidence.
5. Report confirmed evidence separately from review leads and include safe mitigations.
