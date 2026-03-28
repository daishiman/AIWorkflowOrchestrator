# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 8                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

transition semantics 実装を読みやすくし、責務境界が再び混ざらない形へ整える。

## 実行タスク

- helper 分離の妥当性確認
- duplicate 条件分岐の除去
- artifact payload 形式の整理

## 参照資料

| 資料名                 | パス                                | 説明          |
| ---------------------- | ----------------------------------- | ------------- |
| phase 1 requirements   | `outputs/phase-1/requirements.md`   | 原要件        |
| phase 2 design         | `outputs/phase-2/design.md`         | 設計意図      |
| phase 5 implementation | `outputs/phase-5/implementation.md` | 実装内容      |
| phase 6 test expansion | `outputs/phase-6/test-expansion.md` | edge case     |
| phase 7 coverage       | `outputs/phase-7/coverage-check.md` | coverage 監査 |
| refactoring output     | `outputs/phase-8/refactoring.md`    | 改善候補      |

## 実行手順

### ステップ1: engine 内の責務を整理する

transition、artifact、fallback の責務が helper 単位で読み取れるか確認する。

### ステップ2: transport 境界が侵食されていないか見る

facade / IPC 側に condition が増えていないことを確認する。

## 統合テスト連携

- リファクタ後も Phase 6 までのテストがそのまま通ることを前提にする

## 成果物

| 成果物         | パス                             | 説明     |
| -------------- | -------------------------------- | -------- |
| リファクタ記録 | `outputs/phase-8/refactoring.md` | 整理方針 |

## 完了条件

- [ ] duplicate 分岐が整理されている
- [ ] owner / transport 境界が保たれている
- [ ] 本Phase内の全タスクを100%実行完了
