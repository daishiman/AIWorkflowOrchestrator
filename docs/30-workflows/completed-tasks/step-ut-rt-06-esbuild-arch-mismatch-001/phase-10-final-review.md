# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 10                                      |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

全 Phase の成果物を総合レビューし、環境 blocker が残る場合でも PASS 偽装せず条件付き判定に分離する。

## 実行タスク

- 機能完全性レビュー
- 環境品質レビュー
- ドキュメントレビュー
- 条件付き判定または未タスク化の決定

## 参照資料

| 資料名           | パス                                                                      | 説明           |
| ---------------- | ------------------------------------------------------------------------- | -------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                 | FR/NFR/AC 定義 |
| Phase 2 設計     | `phase-2-design.md`                                                       | 設計前提       |
| Phase 5 実装     | `phase-5-implementation.md`                                               | 復旧手順       |
| Phase 9 品質     | `outputs/phase-9/quality-report.md`                                       | 品質検証結果   |
| 未タスク指示書   | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` | blocker 記録先 |

## 実行手順

### Step 1: 機能完全性レビュー

| 観点   | 判定基準                                              |
| ------ | ----------------------------------------------------- |
| FR-01  | target test が完走する                                |
| FR-02  | `node_modules/@esbuild/$EXPECTED_PLATFORM` が存在する |
| FR-03  | guide が `docs/40-guides/` に存在する                 |
| NFR-01 | worktree preflight がガイド化されている               |
| NFR-02 | blocker 記録方法が明示されている                      |

### Step 2: 環境品質レビュー

| 観点         | 判定基準                                                          |
| ------------ | ----------------------------------------------------------------- |
| arch 整合    | `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` が解決できる |
| esbuild 整合 | `node_modules/@esbuild/$EXPECTED_PLATFORM` が存在する             |
| target test  | target test が起動し完走する                                      |
| blocker 分類 | 失敗時に環境起因かコード起因か分類済み                            |

### Step 3: 判定ルール

| 判定     | 条件                        | 対応                         |
| -------- | --------------------------- | ---------------------------- |
| PASS     | 全観点で問題なし            | Phase 11 へ進む              |
| MINOR    | docs や記録の軽微な不足のみ | Phase 12 で補完              |
| MAJOR    | 環境 blocker が残る         | 同一未タスク ID で formalize |
| CRITICAL | 要件前提が崩れている        | Phase 1 へ戻る               |

## 統合テスト連携

- target test の current facts を基準に判定する
- blocker が残る場合は `UT-RT-06-ESBUILD-ARCH-MISMATCH-001` に統合する

## 成果物

| 成果物           | パス                                      | 説明     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

## 完了条件

- [ ] FR/NFR をレビューした
- [ ] environment quality をレビューした
- [ ] blocker の有無を分類した
- [ ] PASS/MINOR/MAJOR/CRITICAL を記録した
- [ ] blocker が残る場合は同一未タスク ID に統合した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト
