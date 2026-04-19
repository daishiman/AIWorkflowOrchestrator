# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 9                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 8                           |
| 後続Phase  | Phase 10                          |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

targeted test、`typecheck`、`lint` を実行し、Main 層 cancel 実装の品質を確定する。

## 背景

cancel 系では「実装があること」より「状態遷移が破綻しないこと」が重要である。品質保証では、事実と異なる楽観記述を避け、未解決リスクは未タスクまたは Phase 12 へ明示的に送る。

## 実行タスク

### タスク0: 静的検証

**目的**: 型と lint の基本品質を確認する。

**実行手順**:

1. `pnpm --filter @repo/desktop typecheck` を実行する。
2. `pnpm --filter @repo/desktop lint` を実行する。
3. relevant file に限定した format/lint 確認を行う。

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

### タスク1: targeted regression

**目的**: cancel 系の regression がないことを確認する。

**実行手順**:

1. service test と handler test を再実行する。
2. 関連既存テストを実行する。
3. コマンド、対象、結果を記録する。

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

### タスク2: リスク評価

**目的**: CANCEL-003 単体で閉じないリスクを明示する。

**実行手順**:

1. `AbortSignal` consumer が Renderer で未接続ならそのまま記録する。
2. E2E 完了が CANCEL-004 依存であることを明記する。
3. 未解決事項は Phase 12 の未タスク検出へ渡す。

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

## 参照資料

| 参照資料                         | パス                                                          | 内容               |
| -------------------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 5 差分確認                 | `outputs/phase-5/implementation-summary.md`                   | 実施コマンドの基礎 |
| Phase 6 テスト拡充記録           | `outputs/phase-6/test-expansion-record.md`                    | edge case          |
| Phase 8 リファクタリング記録     | `outputs/phase-8/refactoring-log.md`                          | 再確認対象         |
| SkillCreatorService実装確認対象  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Phase 5 成果物     |
| skillCreatorHandlers実装確認対象 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | Phase 5 成果物     |

## 成果物

| 成果物           | パス                                | 内容                                 |
| ---------------- | ----------------------------------- | ------------------------------------ |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | static check、regression、残存リスク |

## 統合テスト連携【必須】

| 判定項目                                 | 基準 | 結果    |
| ---------------------------------------- | ---- | ------- |
| `typecheck` 結果が記録されている         | 完了 | pending |
| targeted regression 結果が記録されている | 完了 | pending |
| 残存リスクが明記されている               | 完了 | pending |

## 完了条件

- [ ] 静的検証結果を記録している
- [ ] targeted regression 結果を記録している
- [ ] 残存リスクを記録している
- [ ] Phase 10 へ渡す判断材料を揃えている
