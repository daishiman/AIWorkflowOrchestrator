# Phase 6: テスト拡充 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 6 - テスト拡充                              |
| 前提Phase | Phase 5（実装）                             |
| 関連Issue | #1434                                       |

## 目的

happy path だけでなく、auth fallback・terminal handoff・sanitize・registration drift を捕捉できる状態にする。

## 実行タスク

- authMode 省略時の既定値テストを追加する
- `apiKey=null` 時の `resolveWithService()` 経路テストを追加する
- service 未注入時の degraded response テストを維持する
- terminal_handoff と sanitize の構造テストを追加する
- unregister / mock export drift の回帰を防ぐ

## 参照資料

| 資料名               | パス                                                                                 | 説明                    |
| -------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| Phase 4 テスト作成   | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-04-test-creation.md`       | 初期テスト観点          |
| Phase 5 実装         | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md`      | 現行実装                |
| Runtime facade test  | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | auth fallback / handoff |
| creatorHandlers test | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                        | IPC contract            |

## 実行手順

### Step 1: handler edge case を追加する

対象:

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`
- `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`

追加観点:

- authMode 未指定時の既定値 `api-key`
- `Runtime Skill Creator は現在利用できません`
- sanitize 後の path / token 非露出
- `unregisterRuntimeSkillCreatorHandlers()` の 3 件解除

### Step 2: facade fallback を追加する

対象:

- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

追加観点:

- `apiKey=null` + `authMode="api-key"` で `resolveWithService()` が呼ばれる
- stored key がある場合は integrated path を返す
- stored key がない場合は terminal_handoff へ落ちる

### Step 3: preload surface の異常系を補う

対象:

- `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`

追加観点:

- 省略引数での invoke payload
- `null` apiKey の明示渡し
- allowlist 契約の維持

## 統合テスト連携

- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/creatorHandlers.test.ts src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/preload/__tests__/skill-creator-api.runtime.test.ts`

## 成果物

| 成果物                      | パス                                                                                 | 説明                       |
| --------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| 拡充済み Main tests         | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`                        | runtime handler edge cases |
| 拡充済み registration tests | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts`           | entrypoint wiring          |
| 拡充済み facade tests       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | auth fallback              |
| 拡充済み preload tests      | `apps/desktop/src/preload/__tests__/skill-creator-api.runtime.test.ts`               | renderer surface           |

## 完了条件

- [ ] authMode 省略時の既定値テストがある
- [ ] `resolveWithService()` fallback テストがある
- [ ] degraded response と terminal_handoff のテストがある
- [ ] unregister / allowlist / sanitize の回帰テストがある
- [ ] **本Phase内の全タスクを100%実行完了**
