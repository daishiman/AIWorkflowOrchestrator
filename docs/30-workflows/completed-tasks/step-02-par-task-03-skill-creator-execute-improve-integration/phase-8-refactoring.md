# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 8                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

実装後に残る state 分岐、重複した UI ロジック、wizard 依存、内部エンジン呼び出しの散在を整理し、保守性を高める。

## 実行タスク

- state 整理: session card の local state と store 依存を整理する
- UI 重複解消: create / execute / improve 表示ロジックの重複を解消する
- wizard 依存整理: 二次導線として残す責務だけを明確化する
- internal engine 呼び出し整理: `detectMode` / `validateSkill` の利用箇所を整理する

## 参照資料

| 参照資料           | パス                                         | 説明           |
| ------------------ | -------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物 |
| セッション状態設計 | `outputs/phase-2/session-state-design.md`    | Phase 2 成果物 |
| 実装記録           | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/modified-files.md`          | Phase 5 成果物 |
| 統合フロー記録     | `outputs/phase-5/integration-flow.md`        | Phase 5 成果物 |
| 失敗系テスト一覧   | `outputs/phase-6/failure-test-cases.md`      | Phase 6 成果物 |
| テスト拡充結果     | `outputs/phase-6/test-expansion-report.md`   | Phase 6 成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`         | Phase 7 成果物 |
| ギャップ一覧       | `outputs/phase-7/coverage-gap-list.md`       | Phase 7 成果物 |

## 実行手順

### ステップ1: 重複箇所を特定する

session card、wizard、analysis 表示の重複ロジックを洗い出す。

### ステップ2: 責務単位へ再配置する

state 更新、表示整形、API 呼び出し補助を責務ごとに関数または hook へ分離する。

### ステップ3: 既存テストで回帰を確認する

Phase 4 と Phase 6 のテストを再実行し、振る舞いが維持されていることを確認する。

## 統合テスト連携

| 観点             | 対応内容                  | 期待結果                      |
| ---------------- | ------------------------- | ----------------------------- |
| state 再配置     | 既存 UI テスト再実行      | セッション挙動が維持される    |
| API 呼び出し整理 | hook / store テスト再実行 | 経路が変わらず維持される      |
| wizard 縮退維持  | component テスト再実行    | secondary action が維持される |

## 成果物

| 成果物               | パス                                    | 説明             |
| -------------------- | --------------------------------------- | ---------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`    | 整理内容と理由   |
| 責務再配置マップ     | `outputs/phase-8/responsibility-map.md` | 変更後の責務配置 |

## 完了条件

- [ ] 重複ロジックの整理内容が記録されている
- [ ] 単一導線の責務配置が明確化されている
- [ ] 既存テストで回帰がないことを確認している
