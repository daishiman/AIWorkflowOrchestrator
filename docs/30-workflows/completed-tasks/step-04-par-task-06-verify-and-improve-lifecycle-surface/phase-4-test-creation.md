# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | verify-and-improve-lifecycle-surface |
| 作成日 | 2026-03-26                           |

## 目的

verify detail surface、improve selection、apply result、re-verify 起点を unit / integration / docs QA の 3 系統で検証する test matrix を作成する。

## 実行タスク

- DTO mapping の unit test 観点を列挙する
- IPC / preload / renderer の integration 観点を列挙する
- sibling task boundary の docs QA 観点を列挙する

## 参照資料

| 資料名            | パス                                    | 説明             |
| ----------------- | --------------------------------------- | ---------------- |
| Phase 1 要件      | `phase-1-requirements.md`               | AC 一覧          |
| Phase 2 設計      | `phase-2-design.md`                     | topology と DTO  |
| Phase 3 gate      | `outputs/phase-3/design-review-gate.md` | Phase 4 focus    |
| validation matrix | `outputs/phase-2/validation-matrix.md`  | テスト観点の原本 |

## 実行手順

### ステップ1: unit 観点を定義する

- verify detail DTO の field mapping
- `ApplyImprovementResult` の success / skip / error 表示
- provenance summary の rendering 条件

### ステップ2: integration 観点を定義する

- `creatorHandlers.ts` と `skill-creator-api.ts` の payload parity
- panel から improve / apply を呼ぶ導線
- apply 後に re-verify 起点を表示する導線

### ステップ3: docs QA 観点を定義する

- Task05 と navigation ownership が衝突しない
- Task07 と governance wording が衝突しない
- Task08 と persistence wording が衝突しない

## 統合テスト連携

- `outputs/phase-4/test-matrix.md` を Phase 5 と Phase 6 の回帰観点の基準にする
- renderer panel のシナリオは main IPC / preload API の contract test と同じ ID で追跡する

## 成果物

| 成果物         | パス                             | 説明                         |
| -------------- | -------------------------------- | ---------------------------- |
| テスト作成仕様 | `phase-4-test-creation.md`       | Phase 4 指示                 |
| test matrix    | `outputs/phase-4/test-matrix.md` | unit / integration / docs QA |

## 完了条件

- [ ] AC-1 から AC-6 までに対応する test 観点が列挙されている
- [ ] unit / integration / docs QA の 3 系統が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
