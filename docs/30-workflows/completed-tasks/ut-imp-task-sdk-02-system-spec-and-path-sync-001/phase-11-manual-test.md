# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 11                                    |
| 機能名 | task-sdk-02-system-spec-and-path-sync |
| 作成日 | 2026-03-26                            |

## 目的

ドキュメント導線、相対リンク、artifact inventory の可読性を人手で確認する。

## 実行タスク

- parent workflow から辿れるかを確認する
- downstream link が壊れていないかを確認する
- Phase 12 成果物の入口が揃っているかを確認する

## 参照資料

| 資料名            | パス                                                                                    | 説明               |
| ----------------- | --------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物    | `outputs/phase-1/spec-extraction-map.md`                                                | 手動確認対象の起点 |
| Phase 2 成果物    | `outputs/phase-2/canonical-sync-target-matrix.md`                                       | 導線順             |
| Phase 5 成果物    | `outputs/phase-5/implementation-sequencing.md`                                          | 実更新箇所         |
| Phase 6 成果物    | `outputs/phase-6/test-expansion-summary.md`                                             | guard 観点         |
| Phase 7 成果物    | `outputs/phase-7/coverage-summary.md`                                                   | coverage 観点      |
| Phase 8 成果物    | `outputs/phase-8/refactoring-summary.md`                                                | 正規化済み観点     |
| Phase 9 成果物    | `outputs/phase-9/qa-summary.md`                                                         | QA 観点            |
| 親 workflow index | `../completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/index.md` | 実導線確認         |

## 実行手順

### ステップ1: 導線確認

- 親 workflow から対象 phase へ辿れるかを確認し、Phase 10 gate で確定した blocker 0 件前提が維持されているかを合わせて確認する。

### ステップ2: inventory 確認

- `artifacts.json` と `outputs/artifacts.json` が同じ成果物を指しているかを見る。

## 成果物

| 成果物                | パス                                        | 説明                       |
| --------------------- | ------------------------------------------- | -------------------------- |
| 手動テスト            | `phase-11-manual-test.md`                   | 人手確認観点               |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 人手確認リスト             |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | docs-only check の実測結果 |

## 統合テスト連携

- Phase 11 では docs-only task として NON_VISUAL manual check を実施し、`manual-test-checklist.md` と `manual-test-result.md` を Phase 12 の根拠に渡す。
- 画像キャプチャは要求しない。導線、相対 path、artifact parity の人手確認を統合テスト相当の evidence とする。

## 完了条件

- [ ] 親 workflow から辿れる
- [ ] downstream link の確認観点がある
- [ ] artifact inventory parity の確認観点がある
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認
2. docs-only manual check の実施
3. 統合テスト連携の記録
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が最新の成果物名と整合している
- [ ] Phase 12 へ渡す manual evidence が揃っている
