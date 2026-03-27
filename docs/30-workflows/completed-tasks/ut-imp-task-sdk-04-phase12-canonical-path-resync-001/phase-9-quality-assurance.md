# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 9                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Phase 5 の実更新が docs-only remediation の品質条件を満たすかを validator、grep、artifact parity で確認する。

## 実行タスク

- artifact parity を確認する
- validator を確認する
- stale path grep を確認する
- close-out wording を確認する

## 参照資料

| 資料名       | パス                        | 説明          |
| ------------ | --------------------------- | ------------- |
| Phase 5 実装 | `phase-5-implementation.md` | 実更新対象    |
| Phase 7 監査 | `phase-7-coverage-check.md` | coverage 条件 |
| Phase 8 整理 | `phase-8-refactoring.md`    | 語彙整理      |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                             |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| completed ledger | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | close-out の品質基準             |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | artifact parity と wording guard |

## 実行手順

1. `artifacts.json` と `outputs/artifacts.json` の一致を確認する
2. `validate-phase-output.js` と `verify-all-specs.js` の通過条件を確認する
3. old path grep が 0 hit になることを確認する
4. close-out wording が current facts と矛盾しないことを確認する

## 成果物

| 成果物  | パス                           | 説明                               |
| ------- | ------------------------------ | ---------------------------------- |
| QA 基準 | `phase-9-quality-assurance.md` | validator、grep、parity の確認観点 |

## 統合テスト連携

- Phase 10 は Phase 9 の QA 結果を最終 gate の根拠に使う。
- Phase 11 は Phase 9 の機械検証結果を人手読み合わせの前提に使う。

## 完了条件

- [ ] artifact parity が確認されている
- [ ] validator の通過条件が確認されている
- [ ] old path grep 0 hit 条件が確認されている
- [ ] close-out wording の current fact 整合が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
