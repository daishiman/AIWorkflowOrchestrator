# Phase 7: テストカバレッジ確認 - Skill Creator Public IPC Wiring 統合

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 |
| Phase     | 7 - テストカバレッジ確認                    |
| 前提Phase | Phase 6（テスト拡充）                       |
| 関連Issue | #1434                                       |

## 目的

runtime public IPC wiring の主要分岐が測定対象に入り、未カバー箇所を明確化できる状態にする。

## 実行タスク

- Main handler の line / branch / function を確認する
- Preload runtime API の invoke wiring を確認する
- Runtime facade の fallback / handoff 分岐を確認する
- 未カバー分岐が残る場合は Phase 6 へ差し戻す

## 参照資料

| 資料名             | パス                                                                            | 説明            |
| ------------------ | ------------------------------------------------------------------------------- | --------------- |
| Phase 5 実装       | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-05-implementation.md` | 実装対象        |
| Phase 6 テスト拡充 | `docs/30-workflows/runtime-skill-creator-ipc-wiring/phase-06-test-expansion.md` | 補完観点        |
| Main handler       | `apps/desktop/src/main/ipc/creatorHandlers.ts`                                  | coverage 主対象 |
| Runtime facade     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`           | fallback 分岐   |
| Preload API        | `apps/desktop/src/preload/skill-creator-api.ts`                                 | renderer wiring |

## 実行手順

### Step 1: 対象 suite を実行する

```bash
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/ipc/__tests__/creatorHandlers.test.ts \
  src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/preload/__tests__/skill-creator-api.runtime.test.ts
```

### Step 2: 未カバー分岐を確認する

優先確認ポイント:

- sender reject
- blank validation
- degraded response
- terminal_handoff
- `resolveWithService()` fallback
- unregister 3 件

## 統合テスト連携

- 目標: Line 80% 以上 / Branch 60% 以上 / Function 80% 以上
- 未達時は Phase 6 に戻ってテストを追加する

## 成果物

| 成果物           | パス                                                                                     | 説明         |
| ---------------- | ---------------------------------------------------------------------------------------- | ------------ |
| coverage report  | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-7/coverage-report.md`  | 計測結果記録 |
| integration note | `docs/30-workflows/runtime-skill-creator-ipc-wiring/outputs/phase-7/integration-test.md` | 実行メモ     |

## 完了条件

- [ ] Main handler の coverage を確認した
- [ ] Runtime facade の coverage を確認した
- [ ] Preload runtime API の coverage を確認した
- [ ] 未達分岐の有無を判断した
- [ ] **本Phase内の全タスクを100%実行完了**
