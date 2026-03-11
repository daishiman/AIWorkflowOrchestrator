# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| ステータス | completed                                 |
| 前提Phase  | Phase 4                                   |
| 後続Phase  | Phase 6                                   |

## 目的

Codex 実装 lane が `tokens.css` と token 参照境界のみを変更できるようにする。

## 実行タスク

- タスク1: light theme surface/text/border/accent token を実装する
- タスク2: 未定義 token の正式定義または参照廃止を行う
- タスク3: component 側へ色直書きで逃げない

## 参照資料

| 参照資料               | パス                                                                                                  | 説明                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 4 テスト仕様     | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-4-test-creation.md`             | 守るべきテスト観点    |
| Token role matrix      | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-role-matrix.md` | 実装対象              |
| Frontend technology    | `.claude/skills/aiworkflow-requirements/references/technology-frontend.md`                            | CSS/Tailwind 実装前提 |
| Development guidelines | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`                         | 実装境界の一般方針    |

## Atent Team / Codex 指示

- Lane D（Codex）は `apps/desktop/src/renderer/styles/tokens.css` と token 参照箇所に限定して変更する
- view/component のハードコード色除去は後続タスクへ委譲する

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                       | 内容                 |
| ------------------- | -------------------------------------------------------------------------- | -------------------- |
| ui-ux-design-system | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | token 実装修正の正本 |

## 統合テスト連携

| 観点                        | 連携内容                                                        |
| --------------------------- | --------------------------------------------------------------- |
| Test-driven implementation  | Phase 4 の token test matrix を崩さない実装順序で進める         |
| Shared migration dependency | component 置換で代用せず token contract だけを更新する          |
| Evidence                    | 実装差分を `implementation-summary.md` に集約し、Phase 6 へ渡す |

## 成果物

| 成果物                 | パス                                                                                                       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| implementation-summary | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/implementation-summary.md` |

## 完了条件

- [x] token 変更が `tokens.css` 中心で閉じている
- [x] missing token 問題の扱いが一貫している
- [x] 後続タスクに responsibility leak がない

## 次Phase

Phase 6: テスト拡充
