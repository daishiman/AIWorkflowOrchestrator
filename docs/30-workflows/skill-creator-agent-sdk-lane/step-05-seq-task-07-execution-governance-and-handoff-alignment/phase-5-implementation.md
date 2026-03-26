# Phase 5: 実装

## 目的

API / handoff route、approval gate、manual boundary の実装対象を確定する。

## 想定変更ポイント

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
- `apps/desktop/src/main/services/runtime/ApprovalGate.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/preload/channels.ts`

## 実装しないこと

- manifest 契約
- create / verify UI の主設計
- session store

## 実装完了の判断

- API primary / handoff secondary / manual boundary を 1 枚で説明できる
- Task08 が route state を前提に resume 契約へ進める

## 完了条件

- [ ] governance 実装対象が定義されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
