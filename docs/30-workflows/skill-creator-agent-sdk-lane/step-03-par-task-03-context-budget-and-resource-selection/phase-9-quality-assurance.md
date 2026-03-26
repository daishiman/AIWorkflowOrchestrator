# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | context-budget-and-resource-selection |
| 作成日 | 2026-03-26                            |

## 目的

全読み込み回避と必要十分読み込みが両立し、かつ固定 path 前提や silent fallback が残っていないことを確認する。

## 実行タスク

- selective loading 基準の再点検
- phase ごとの resource selection 妥当性確認
- degrade 条件と fallback 条件の区別確認
- fixed path / silent fallback の有無を確認

## 参照資料

| 資料名              | パス                                    | 説明                |
| ------------------- | --------------------------------------- | ------------------- |
| Phase 5 実装        | `phase-5-implementation.md`             | 実装範囲の確認      |
| Phase 7 coverage    | `phase-7-coverage-check.md`             | coverage 観点       |
| Phase 8 refactoring | `phase-8-refactoring.md`                | naming 整理後の状態 |
| design review gate  | `outputs/phase-3/design-review-gate.md` | gate の再確認       |

## 実行手順

### ステップ1: no fixed path を監査する

- `DEFAULT_SKILL_CREATOR_PATH` が唯一の source of truth として残っていないか確認する。
- repo root の silent fallback がないか確認する。

### ステップ2: degrade を監査する

- `budget_overflow`、`required_resource_missing`、`source_conflict`、`structure_mismatch`、`provenance_incomplete` の区別を確認する。

## 品質観点

- `skill-creator` 全文常時読み込みを前提にしていない
- phase ごとに必要 resource を選ぶ設計になっている
- budget 超過時に品質を壊さない degrade ルールがある
- repo 同梱固定や単一 home path 固定を唯一の正本にしていない
- source provenance が downstream へ渡せる

## 公式照合観点

- TypeScript / Node SDK の streaming / retry 前提と context loading 設計を混同していない
- token budget の都合で SDK 契約や tool approval 仕様を削っていない
- custom / external source root を読む場合の trust boundary を Task07 へ委譲している

## 統合テスト連携

- Phase 4 / 6 / 7 の suite と trigger 名が一致しているか確認する。
- Phase 10 の最終レビューに QA 結果を引き渡す。

## 成果物

| 成果物  | パス                           | 説明                |
| ------- | ------------------------------ | ------------------- |
| QA 本文 | `phase-9-quality-assurance.md` | quality gate の本文 |

## 完了条件

- [ ] 全読み込み回避方針が維持されている
- [ ] 必要十分読み込みの判断基準がある
- [ ] budget 超過時の degrade 条件が読める
- [ ] fixed path 前提と silent fallback が残っていない
- [ ] **本Phase内の全タスクを100%実行完了**
