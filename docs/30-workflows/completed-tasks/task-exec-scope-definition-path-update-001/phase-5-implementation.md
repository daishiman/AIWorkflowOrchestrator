# Phase 5: 実装

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 5                                          |
| 機能名   | task-exec-scope-definition-path-update-001 |
| 作成日   | 2026-03-27                                 |
| タスクID | UT-EXEC-01                                 |

## 目的

1 ファイル 1 行追記の docs-only patch を、誤編集を起こさない順序で固定する。

## 実行タスク

- target file の D. Implementation Anchor 節を開く
- `execution-capability.ts` 行を既存フォーマットで追加する
- 既存 2 行の表記不変を確認する
- source unassigned 文書と wider docs は no-op として残す

## 参照資料

| 資料名  | パス                       | 説明           |
| ------- | -------------------------- | -------------- |
| Phase 2 | `phase-2-design.md`        | patch topology |
| Phase 4 | `phase-4-test-creation.md` | command suite  |

## 成果物

| 成果物                   | パス                                          | 説明               |
| ------------------------ | --------------------------------------------- | ------------------ |
| file change plan         | `outputs/phase-5/file-change-plan.md`         | 変更対象一覧       |
| execution sequence       | `outputs/phase-5/execution-sequence.md`       | patch 順序         |
| update surface checklist | `outputs/phase-5/update-surface-checklist.md` | no-op 含む確認項目 |

## 統合テスト連携

- 実装順は `existence check -> target row insertion -> preservation check -> diff review` とする。

## 完了条件

- [ ] target file のみを変更する方針が明記されている
- [ ] no-op surface が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
