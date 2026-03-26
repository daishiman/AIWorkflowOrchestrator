# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 8                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

phase 表示、next action、質問入力、provenance summary、handoff guidance の混同をなくし、命名と責務を整理する。

## 実行タスク

- phase / action / guidance の命名を分離する
- canonical state と local draft state の責務を整理する
- handoff UI の重複を抑える方針を整理する

## 参照資料

| 資料名             | パス                                    | 説明                  |
| ------------------ | --------------------------------------- | --------------------- |
| Phase 1 要件       | `phase-1-requirements.md`               | owner / non-goal 基準 |
| Phase 2 設計       | `phase-2-design.md`                     | 命名と境界            |
| Phase 5 実装       | `phase-5-implementation.md`             | 実装対象              |
| Phase 6 拡充       | `phase-6-test-expansion.md`             | edge case             |
| Phase 7 coverage   | `phase-7-coverage-check.md`             | coverage 観点         |
| phase UI mapping   | `outputs/phase-2/phase-ui-mapping.md`   | block 分離            |
| design review gate | `outputs/phase-3/design-review-gate.md` | review 結果           |

## リファクタリング観点

- `phase` と `action` を UI 文言で混同しない
- `awaitingUserInput` canonical state と component local draft を分離する
- `TerminalHandoffCard` 再利用を優先し、局所 UI の重複を抑える
- provenance warning と approval / disclosure 文言を混ぜない

## 成果物

| 成果物           | パス                     | 説明             |
| ---------------- | ------------------------ | ---------------- |
| refactoring note | `phase-8-refactoring.md` | 命名と責務の整理 |

## 統合テスト連携

- renderer snapshot 表示と local draft の境界を回帰観点に残す
- handoff UI 重複が増えていないか visual regression 観点へ渡す
- provenance warning が approval copy と混ざらないことを QA 観点に渡す

## 完了条件

- [ ] phase-driven backend / explanation-oriented UI が維持されている
- [ ] 命名と責務の混同が整理されている
- [ ] duplicate handoff UI を増やさない方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
