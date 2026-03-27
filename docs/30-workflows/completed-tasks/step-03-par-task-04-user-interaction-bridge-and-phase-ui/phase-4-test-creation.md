# Phase 4: テスト作成

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

workflow bridge、renderer phase UI、question kind、handoff visible 化の検証観点を定義する。

## 実行タスク

- Main IPC handler と preload API のテスト観点を定義する
- store / renderer の phase UI テスト観点を定義する
- question kind / edge case / stale submit / handoff を含む matrix を作る

## テスト対象カテゴリ

| カテゴリ   | 対象例                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Main / IPC | `get-workflow-state` / `submit-user-input` / sender validation         |
| Preload    | invoke wrapper、listener 登録解除、channel allowlist                   |
| Store      | snapshot cache 更新、local draft 非保持                                |
| Renderer   | phase badge、question host、provenance summary、handoff card           |
| Regression | 既存 `planSkill` / `executePlan` / `improveSkillWithFeedback` の互換性 |

## 参照資料

| 資料名                  | パス                                                      | 説明                         |
| ----------------------- | --------------------------------------------------------- | ---------------------------- |
| Phase 1 要件            | `phase-1-requirements.md`                                 | owner / question kind の基準 |
| Phase 2 設計            | `phase-2-design.md`                                       | bridge / UI 設計             |
| design review gate      | `outputs/phase-3/design-review-gate.md`                   | review 結果                  |
| skill compliance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | 過不足確認                   |

## 成果物

| 成果物      | パス                             | 説明                     |
| ----------- | -------------------------------- | ------------------------ |
| test matrix | `outputs/phase-4/test-matrix.md` | test case 一覧と期待結果 |

## 統合テスト連携

- Main / Preload / Store / Renderer の 4 層で test case を配分する
- Task05 / 06 が後続で UI detail を追加しても Task04 contract を壊さない回帰観点を持つ
- execute handoff visible 化は `SkillLifecyclePanel` regression の基礎ケースとする

## 完了条件

- [ ] interaction kind ごとの観点が定義されている
- [ ] getter / submit / event の観点が揃っている
- [ ] handoff visible 化の回帰観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
