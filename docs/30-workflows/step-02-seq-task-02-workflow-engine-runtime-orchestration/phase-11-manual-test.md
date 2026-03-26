# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | workflow-engine-runtime-orchestration |
| 作成日 | 2026-03-26                            |

## 目的

実装者と reviewer が engine / facade の境界、route baseline、handoff 先を誤読しないかを人手で確認する。

## 実行タスク

- ownership matrix を読み、state owner を口頭で説明できるか確認する
- `phase-5-implementation.md` を読み、migration step を追えるか確認する
- `phase-10-final-review.md` を読み、downstream handoff を追えるか確認する
- 結果を `outputs/phase-11/manual-test-result.md` に記録する

## 参照資料

| 資料名                   | パス                           | 説明                          |
| ------------------------ | ------------------------------ | ----------------------------- |
| Phase 1 要件             | `phase-1-requirements.md`      | task scope と owner inventory |
| Phase 2 設計             | `phase-2-design.md`            | ownership matrix の元文書     |
| Phase 5 実装計画         | `phase-5-implementation.md`    | migration step                |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`    | fail path と regression       |
| Phase 7 カバレッジ       | `phase-7-coverage-check.md`    | owner / route coverage        |
| Phase 8 リファクタリング | `phase-8-refactoring.md`       | boundary hardening            |
| Phase 9 品質保証         | `phase-9-quality-assurance.md` | QA 観点                       |
| Phase 10 最終レビュー    | `phase-10-final-review.md`     | downstream handoff            |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Runtime public IPC 契約    | `.agents/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | public contract の正本 |
| RuntimePolicyResolver 契約 | `.agents/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | route baseline の正本  |

## 実行手順

### ステップ1: owner を追跡する

- reviewer は `outputs/phase-2/ownership-matrix.md` を見ながら state owner を説明する。

### ステップ2: migration step を追跡する

- reviewer は `phase-5-implementation.md` を見ながら facade から engine への移行段階を説明する。

### ステップ3: 記録を残す

- `outputs/phase-11/manual-test-checklist.md` に沿って確認し、結果を `outputs/phase-11/manual-test-result.md` に残す。

## 統合テスト連携

- Phase 10 の acceptance criteria と同じ観点を人手で再確認する。
- capture policy は補助成果物として別ファイルへ分離する。

## 成果物

| 成果物           | パス                                        | 説明                      |
| ---------------- | ------------------------------------------- | ------------------------- |
| 手動テスト仕様   | `phase-11-manual-test.md`                   | walkthrough の本文        |
| manual checklist | `outputs/phase-11/manual-test-checklist.md` | reviewer 用チェックリスト |
| manual result    | `outputs/phase-11/manual-test-result.md`    | reviewer 記録欄           |

## 完了条件

- [ ] phase owner と facade 入口が明快である
- [ ] migration step と downstream handoff を reviewer が追跡できる
- [ ] 手動テスト補助成果物が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
