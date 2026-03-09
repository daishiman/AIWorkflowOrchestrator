# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 7                                              |
| Phase名    | カバレッジ確認                                 |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 6                                        |
| 後続Phase  | Phase 8                                        |

## 目的

テストカバレッジが基準値を満たしていることを確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

- タスク1: 変更対象ファイルごとのカバレッジを計測して基準達成を確認する
- タスク2: 基準未達の箇所を Phase 6 に戻すか例外許容するか判定する

### タスク1: カバレッジ基準確認

**目的**: 変更対象ファイルのカバレッジが基準を満たしているか確認する

**手順**:

1. カバレッジ計測コマンド実行:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/components/AuthGuard/
   ```
2. 以下のファイルごとにカバレッジを確認:

| ファイル                  | Line | Branch | Function | 基準達成 |
| ------------------------- | ---- | ------ | -------- | -------- |
| `types.ts`                | -%   | -%     | -%       | □        |
| `utils/getAuthState.ts`   | -%   | -%     | -%       | □        |
| `hooks/useAuthState.ts`   | -%   | -%     | -%       | □        |
| `AuthTimeoutFallback.tsx` | -%   | -%     | -%       | □        |
| `index.tsx`               | -%   | -%     | -%       | □        |

**基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### タスク2: 未達箇所の対処判定

**目的**: カバレッジ未達の場合、Phase 6 に戻るか例外として許容するか判定する

**判定基準**:

- 最低基準未達 → Phase 6 に戻りテスト追加
- 最低基準達成、推奨基準未達 → 原因を分析し、テスト追加が合理的であれば Phase 6 に戻る
- インライン関数カバレッジ（P41 参照）は v8 プロバイダの特性として許容可能

## 参照資料

| 参照資料           | パス                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md` |
| Phase 6 テスト拡充 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-6-test-expansion.md` |
| カバレッジ基準     | `.claude/rules/02-code-quality.md`                                                                           |
| P41: v8カバレッジ  | `.claude/rules/06-known-pitfalls.md`                                                                         |

### システム仕様（aiworkflow-requirements）

> カバレッジ確認時に以下を参照してください。

| 参照資料 | パス                                                                   | 内容                                                    |
| -------- | ---------------------------------------------------------------------- | ------------------------------------------------------- |
| 教訓集   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | P41(v8カバレッジプロバイダのインライン関数カウント問題) |

## 統合テスト連携

- カバレッジ未達 → Phase 6 に戻る
- カバレッジ達成 → Phase 8 へ進む

## 成果物

| 成果物             | パス                                 |
| ------------------ | ------------------------------------ |
| カバレッジ確認結果 | `outputs/phase-7/coverage-result.md` |

## 完了条件

- [ ] 全変更対象ファイルのカバレッジが最低基準を満たしていること
- [ ] カバレッジレポートが作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

- カバレッジ基準達成 → Phase 8: リファクタリングへ進む
- カバレッジ基準未達 → Phase 6: テスト拡充に戻る
