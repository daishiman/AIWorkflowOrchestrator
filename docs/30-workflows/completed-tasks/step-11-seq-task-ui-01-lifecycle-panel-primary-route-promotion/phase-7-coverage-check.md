# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 7                                       |
| Phase名    | カバレッジ確認                          |
| 対象機能   | lifecycle-panel-primary-route-promotion |
| 前提Phase  | Phase 6: テスト拡充                     |
| 次Phase    | Phase 8: リファクタリング               |
| ステータス | pending                                 |
| 作成日     | 2026-04-06                              |

## 目的

Phase 6 までに作成・拡充したテストのカバレッジを計測し、Line 80%以上・Branch 60%以上の目標を達成していることを確認する。不足がある場合は追加テストを作成する。

## 実行タスク

### Task 1: カバレッジ計測

- 変更対象ファイルのカバレッジを個別計測:
  - `App.tsx`（ルート定義部分）
  - `normalizeSkillLifecycleView()` 関数
  - `skillLifecycleJourney.ts`
- Line / Branch / Function / Statement の4指標を記録

### Task 2: カバレッジ目標との照合

- Line coverage: 80% 以上を確認
- Branch coverage: 60% 以上を確認
- 未カバー行・分岐の一覧を作成
- 未カバー部分の理由を分析（テスト不足 vs テスト困難）

### Task 3: 不足テスト追加（必要に応じて）

- 目標未達の場合、追加テストを作成
- 追加後に再計測して目標達成を確認

### Task 4: カバレッジレポート作成

- 計測結果を `outputs/phase-7/coverage-report.md` にまとめる

## 参照資料

| 資料名                 | パス                                                            | 説明               |
| ---------------------- | --------------------------------------------------------------- | ------------------ |
| Phase 6 テスト拡充記録 | `outputs/phase-6/test-expansion.md`                             | テスト一覧         |
| App.tsx                | `apps/desktop/src/renderer/App.tsx`                             | カバレッジ計測対象 |
| skillLifecycleJourney  | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` | カバレッジ計測対象 |

## 成果物

| 成果物             | パス                                 | 説明                             |
| ------------------ | ------------------------------------ | -------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 計測結果、目標照合、未カバー分析 |

## 完了条件

- [ ] 変更対象ファイルのカバレッジが計測されている
- [ ] Line coverage 80% 以上を達成している
- [ ] Branch coverage 60% 以上を達成している
- [ ] 未カバー部分の分析が完了している
- [ ] カバレッジレポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
