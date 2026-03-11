# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 |
| Phase      | 1                                                  |
| Phase名    | 要件定義                                           |
| ステータス | not_started                                        |
| 前提Phase  | なし                                               |
| 後続Phase  | Phase 2                                            |

## 目的

light theme の回帰をどう検出し、どの証跡を残すかを requirements として定義する。

## 実行タスク

- タスク1: representative screen を定義する
- タスク2: audit で検出すべき drift を定義する
- タスク3: Phase 11 / Phase 12 の必須更新点を定義する

### タスク1: representative screen 定義

| 画面            | 理由                                    |
| --------------- | --------------------------------------- |
| Settings        | 白文字直書きが多く再発確率が高い        |
| Dashboard       | header / panel contrast の典型          |
| Auth            | glass panel 上の light theme 可読性確認 |
| WorkspaceSearch | `slate` 固定色 panel の典型             |

### タスク2: drift 定義

- hardcoded color drift: `text-white`, `bg-slate-*`, `bg-zinc-*`, `border-white/10`
- missing token drift: 未定義 token 参照
- screenshot drift: current build でない古い build を撮る問題

### タスク3: 文書更新点定義

- Phase 11 manual checklist
- Phase 12 documentation-changelog
- task-workflow / lessons-learned / ui-ux-feature-components

## 参照資料

| 参照資料               | パス                          | 説明                          |
| ---------------------- | ----------------------------- | ----------------------------- |
| ライトテーマ調査メモ   | 会話ログ                      | representative targets        |
| Workspace capture 教訓 | `references/task-workflow.md` | current build screenshot 教訓 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容               |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------ |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | Phase 11/12 更新先 |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 再発防止知見       |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature 記録先     |

## Atent Team / SubAgent 設計

- 直列: Task 1 / Task 2 の Phase 3 が通るまでは guard 実装方針を fix しない
- Phase 1 では検出対象と証跡対象を直列で確定する

## 統合テスト連携

| 観点                   | 連携内容                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------- |
| Representative screens | Settings / Dashboard / Auth / WorkspaceSearch を Phase 4 の test matrix へ引き継ぐ     |
| Downstream dependency  | token foundation / shared migration の representative file を current scope に固定する |
| Evidence contract      | current/baseline と screenshot source pinning を Phase 11 記録様式へ接続する           |

## 成果物

| 成果物                       | パス                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| requirements-definition      | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/requirements-definition.md`      |
| representative-screen-matrix | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/representative-screen-matrix.md` |
| drift-definition             | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-1/drift-definition.md`             |

## 完了条件

- [ ] representative screen が確定している
- [ ] drift 種別が定義されている
- [ ] Phase 11/12 更新対象が列挙されている
- [ ] Phase 1-3 完了前に実装へ進まない条件がある

## 次Phase

Phase 2: 設計
