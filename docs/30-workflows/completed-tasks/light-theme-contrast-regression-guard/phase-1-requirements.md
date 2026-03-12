# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | `TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001` |
| Phase      | 1                                                    |
| Phase名    | 要件定義                                             |
| ステータス | completed                                            |
| 前提Phase  | なし                                                 |
| 後続Phase  | Phase 2                                              |

## 目的

light theme の再発条件と guard の責務境界を requirements として固定し、token task / component migration task / regression guard task を明確に分離する。

> P50パターン該当: 検証・補完モード。既存 light theme 実装と既存 workflow を監査し、guard 仕様を補完する。

## 実行タスク

- タスク1: 現行 workflow と依存タスクの責務を棚卸しする
- タスク2: FR / NFR / AC と scope boundary を定義する
- タスク3: representative screen と drift 種別を確定する

### タスク1: workflow / 依存タスク棚卸し

1. token foundation、shared color migration、regression guard の 3 workflow を比較する
2. 「実装修正」と「再発検知」の境界を guard task 側へ固定する
3. 本 workflow は spec-only であり、future execution まで commit / PR しない前提を記録する

### タスク2: FR / NFR / AC 定義

| 区分  | 内容                                                                          |
| ----- | ----------------------------------------------------------------------------- |
| FR-1  | representative 4 画面の screenshot matrix を持つ                              |
| FR-2  | hardcoded color drift を検出する audit ルールを持つ                           |
| FR-3  | current/baseline を分離した evidence policy を持つ                            |
| NFR-1 | Phase 11 で current build static serve と selector-based capture を必須にする |
| NFR-2 | Phase 12 で task-workflow / lessons / feature spec の同期手順を持つ           |

### タスク3: representative screen / drift 種別定義

| 画面            | 主要理由                                                                |
| --------------- | ----------------------------------------------------------------------- |
| Settings        | theme selector、設定カード、補助テキスト、公開 shell を同時に確認できる |
| Dashboard       | panel / header / surface 階層を検証しやすい                             |
| Auth            | glass panel と primary action の light contrast を確認できる            |
| WorkspaceSearch | search panel、入力欄、結果行の色直書き drift を確認できる               |

| drift 種別            | 定義                                                                          |
| --------------------- | ----------------------------------------------------------------------------- |
| hardcoded color drift | `text-white`, `bg-slate-*`, `bg-zinc-*`, `border-white/10` と同系統の直書き色 |
| screenshot drift      | current build ではない asset / shell 全景のみ / selector 不在                 |
| evidence drift        | current と baseline backlog の混線、Phase 11/12 同期漏れ                      |

## 参照資料

| 参照資料               | パス                                                                      | 説明                            |
| ---------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| ユーザー要求           | 会話ログ                                                                  | pain point と作業制約の正本     |
| token foundation       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/index.md` | 依存元と責務境界                |
| shared color migration | `docs/30-workflows/light-theme-shared-color-migration/index.md`           | 依存先と representative file 群 |
| create workflow        | `.claude/skills/task-specification-creator/references/create-workflow.md` | create-mode の工程順序          |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                            | 内容                                      |
| --------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| UI components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | 共通 UI のレビュー観点                    |
| UI design principles  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | hierarchy / light theme contrast 判断基準 |
| Settings spec         | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | Settings shell の責務確認                 |
| Forms spec            | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`              | Auth 画面の readability 観点              |
| Search panel spec     | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`       | WorkspaceSearchPanel の責務確認           |
| Feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | representative feature 同期先             |
| Accessibility testing | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`    | contrast / keyboard / WCAG 観点           |
| UI atoms patterns     | `.claude/skills/aiworkflow-requirements/references/ui-ux-atoms-patterns.md`     | text / surface / contrast の基礎粒度      |
| State management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | settings shell / state ownership 境界     |
| Quality requirements  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | Phase 4-11 の品質基準                     |
| task-workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | baseline/current 台帳と未タスク連携       |
| lessons-learned       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | screenshot / light contrast 教訓          |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

1. light theme 自体は既存実装済みであり、本 task は新規実装ではなく drift guard の検証・補完であることを確認する
2. `WorkspaceSearchPanel.tsx` / `AuthView/index.tsx` / `ThemeSelector/index.tsx` の hardcoded color 実態と依存 workflow を照合する
3. Phase 5 以降は future execution であり、今ターンは spec-only で止めることを再確認する

### ステップ1: current workflow の前提を確認する

1. 本 workflow が spec-only であることを index / artifacts に反映する
2. 現在ブランチと `artifacts.json` の branch drift をなくす
3. Phase 1-3 完了前に実装しない制約を明文化する

### ステップ2: requirements を抽出する

1. user request から FR / NFR / AC を抽出する
2. resource-map から UI / accessibility / test / evidence 系の正本を選ぶ
3. token / component / guard の責務境界を requirements として固定する

### ステップ3: Phase 2 へ渡す入力を作る

1. representative screens を確定する
2. drift taxonomy を確定する
3. planned artifacts を outputs/phase-1 に定義する

## Atent Team / SubAgent 設計

- Lane A: dependency / responsibility audit
- Lane B: system spec extraction
- Phase 1 では Lane A の責務境界確定後に Lane B の引用先を固定する

## 統合テスト連携

| 観点                   | 連携内容                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Representative screens | Phase 4 / Phase 11 の test case と coverage matrix に引き継ぐ                         |
| Dependency contract    | token foundation / shared migration の出力を guard の入力契約として固定する           |
| Evidence contract      | Phase 11 / Phase 12 の screenshot / unassigned / spec sync へ requirements を引き継ぐ |

## 多角的チェック観点

| 観点             | 適用内容                                         | 仕様参照先                                                                                                                                   |
| ---------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX            | light theme の階層性、shell と panel の contrast | `ui-ux-components.md`, `ui-ux-design-principles.md`                                                                                          |
| アクセシビリティ | WCAG 2.1 AA の contrast と keyboard 観点         | `testing-accessibility.md`, `ui-ux-atoms-patterns.md`                                                                                        |
| アーキテクチャ   | token / component / guard の責務分離             | `arch-state-management.md`, dependency workflow                                                                                              |
| 運用証跡         | current / baseline / screenshot source pinning   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

## 成果物

| 成果物                       | パス                                                                                                                      | 説明                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| requirements-definition      | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/requirements-definition.md`      | FR / NFR / AC の整理   |
| acceptance-criteria          | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/acceptance-criteria.md`          | 検証可能な受入基準     |
| scope-definition             | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/scope-definition.md`             | guard の境界と routing |
| representative-screen-matrix | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/representative-screen-matrix.md` | 4 画面の選定根拠       |
| drift-definition             | `docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard/outputs/phase-1/drift-definition.md`             | drift taxonomy の定義  |

## 完了条件

- [x] representative 4 画面が確定している
- [x] hardcoded / screenshot / evidence drift が定義されている
- [x] token / component / guard の責務境界が文章化されている
- [x] Phase 1-3 完了前に実装しない制約が残っている

## サブタスク管理

1. 依存 workflow と既存 backlog を確認する
2. aiworkflow-requirements から必要仕様を抽出する
3. FR / NFR / AC / scope boundary を定義する
4. acceptance-criteria / scope-definition / representative-screen-matrix / drift-definition を outputs に割り当てる
5. artifacts と branch 情報を同期する

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物の planned path を確定
- [x] acceptance-criteria と scope-definition を独立成果物として配置
- [x] `artifacts.json` の Phase 1 登録を更新
- [x] Phase 2 に渡す前提を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/light-theme-contrast-regression-guard --phase 1
```

## 次Phase

Phase 2: 設計
