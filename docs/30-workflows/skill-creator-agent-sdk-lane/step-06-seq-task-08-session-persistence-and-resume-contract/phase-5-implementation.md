# Phase 5: 実装

## 目的

session store、resume token、checkpoint invalidation の実装対象を定義する。

## 想定変更ポイント

- `apps/desktop/src/main/services/session/SessionPersistenceService.ts`
- `apps/desktop/src/main/services/session/SessionStorage.ts`
- `apps/desktop/src/main/ipc/session-persistence-handler.ts`
- `packages/shared/src/types/agent.ts`
- `packages/shared/src/types/skillCreator.ts`

## 実装しないこと

- create / verify UI
- governance / approval rule
- manifest 契約そのもの
- chat history domain model の全面再設計

## 実装完了の判断

- save target / invalidation / resume 可否を別々に説明できる
- workflow session を既存 `PersistedSession` 系へ載せる方針または wrapper 方針を説明できる
- manifest 更新時の互換性境界を Task02 / 07 と矛盾なく言える

## 完了条件

- [ ] session 契約の実装対象が定義されている
- [ ] 想定変更ポイントと非対象が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
