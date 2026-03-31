# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 8                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

policy 判定と hook 監査の重複ロジックを整理し、phase ごとの差分を明確にする。

## 実行タスク

- duplicate policy 分岐削減
- hook payload 共通化

## 参照資料

| 資料名  | パス                        | 説明     |
| ------- | --------------------------- | -------- |
| Phase 5 | `phase-5-implementation.md` | 実装結果 |

## 実行手順

### ステップ1: duplicate を特定する

- policy 判定の重複
- hook payload の重複

### ステップ2: 共通化の境界を決める

- shared type に寄せるもの
- local module に残すもの

### ステップ3: Before / After / Reason を記録する

- 何を減らしたか
- 何を維持したか
- なぜそれがエレガントか

| 対象         | Before       | After                  | Reason     |
| ------------ | ------------ | ---------------------- | ---------- |
| policy 分岐  | 分散した条件 | phase 別 policy に集約 | 重複削減   |
| hook payload | 個別組み立て | 共通イベント型へ集約   | 監査一貫性 |

### ステップ4: 再検証する

- refactor 後も policy / hook / audit が壊れていないか確認する

## 成果物

| 成果物             | パス                                    | 説明     |
| ------------------ | --------------------------------------- | -------- |
| refactoring record | `outputs/phase-8/refactoring-record.md` | 整理結果 |

## 完了条件

- [x] duplicate が削減されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- Phase 7 の coverage 結果を維持できているか確認する
- refactor 後に Phase 9 の quality gate へ引き継げる状態を保つ

## 多角的チェック観点（AIが判断）

- 重複排除が過剰に一般化されていないか
- 命名改善で責務境界が見えやすくなったか
- navigation drift や conditional drift が増えていないか

## サブタスク管理

| SubAgent   | 責務                     |
| ---------- | ------------------------ |
| SubAgent-A | duplicate 検出           |
| SubAgent-B | 共通化境界整理           |
| SubAgent-C | Before/After/Reason 記録 |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 9: 品質保証
