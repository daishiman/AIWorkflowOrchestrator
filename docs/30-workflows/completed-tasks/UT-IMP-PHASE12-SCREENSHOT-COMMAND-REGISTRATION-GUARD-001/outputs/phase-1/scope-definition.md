# Phase 1 スコープ定義

## 対象

- `apps/desktop/package.json`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/spec-update-summary.md`
- 同workflowの screenshot証跡更新（Phase 11）

## 非対象

- Playwrightテストケースの新規追加/削除
- workflow02以外への一括置換
- アプリ本体機能の仕様追加

## リスク境界

| リスク       | 境界ルール                                          |
| ------------ | --------------------------------------------------- |
| 命名ドリフト | `screenshot:<feature>` のみ許可                     |
| 文書残存     | 旧コマンド `rg` で0件確認                           |
| 監査誤読     | `currentViolations` を合否基準、`baseline` は監視値 |

## 完了判定

- [x] 対象/非対象を明示
- [x] リスク境界を定義
