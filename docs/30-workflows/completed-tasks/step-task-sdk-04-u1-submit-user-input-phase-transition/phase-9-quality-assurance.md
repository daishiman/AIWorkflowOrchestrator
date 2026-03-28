# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                  |
| ------ | --------------------------------------------------- |
| Phase  | 9                                                   |
| 機能名 | `task-sdk-04-u1-submit-user-input-phase-transition` |
| 作成日 | 2026-03-28                                          |

## 目的

lint、typecheck、test を通じて実装の品質を確認する。

## 実行タスク

- lint 実行
- typecheck 実行
- vitest 実行

## 参照資料

| 資料名                 | パス                                   | 説明                 |
| ---------------------- | -------------------------------------- | -------------------- |
| phase 5 implementation | `outputs/phase-5/implementation.md`    | 対象変更             |
| QA output              | `outputs/phase-9/quality-assurance.md` | 検証コマンドと結果欄 |
| phase 8 refactoring    | `outputs/phase-8/refactoring.md`       | 直前変更             |

## 実行手順

### ステップ1: 静的検証を通す

`pnpm lint` と `pnpm typecheck` を実行する。

### ステップ2: 動的検証を通す

`pnpm exec vitest run` と AC 個別 grep 実行結果を確認する。

## 統合テスト連携

- lint / typecheck / vitest を同一 wave で確認する

## 成果物

| 成果物       | パス                                   | 説明         |
| ------------ | -------------------------------------- | ------------ |
| 品質保証記録 | `outputs/phase-9/quality-assurance.md` | 実行結果記録 |

## 完了条件

- [ ] lint が通っている
- [ ] typecheck が通っている
- [ ] vitest が通っている
- [ ] 本Phase内の全タスクを100%実行完了
