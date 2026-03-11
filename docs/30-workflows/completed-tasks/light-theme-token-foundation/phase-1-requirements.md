# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| ステータス | completed                                 |
| 前提Phase  | なし                                      |
| 後続Phase  | Phase 2                                   |

## 目的

ライトテーマ共通不具合のうち token 基盤起因の問題を要求として確定し、後続タスクと責務分離する。

## 実行タスク

- タスク1: 現行 token 問題を分類する
- タスク2: 受入基準と対象 token を確定する
- タスク3: 後続タスクへ分離する境界を定義する

### タスク1: 現行 token 問題の分類

1. `tokens.css` の light theme 定義を調査する
2. `#ffffff` の純白 surface、`rgba(60, 60, 67, 0.6)` 系 text、未定義 token 参照を分類する
3. 「token 問題」と「component 側の色直書き問題」を分離する

### タスク2: 受入基準の確定

| ID    | 要件                                                                     |
| ----- | ------------------------------------------------------------------------ |
| FR-1  | light surface 階層にまぶしさ軽減の段差を持たせる                         |
| FR-2  | `--text-tertiary` / `--border-primary` / `--accent-primary` を一貫化する |
| NFR-1 | semantic token の責務を component へ漏らさない                           |
| NFR-2 | 後続タスクが token 契約を参照して作業できる                              |

### タスク3: 責務境界の定義

- 本タスク: token 定義、役割表、contrast 目標
- 後続タスク1: shared view / component のハードコード色移行
- 後続タスク2: visual regression / audit guard

## 参照資料

| 参照資料             | パス                                                                                                                                     | 説明                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| ライトテーマ調査メモ | 会話ログ                                                                                                                                 | 2026-03-11 調査結果  |
| 既存 backlog         | `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md` | token 観点の既知課題 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                           | 内容                               |
| -------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| UI design system     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`     | token 契約の正本                   |
| UI design principles | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | light theme / contrast 判断基準    |
| task-workflow        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 既存 light contrast backlog の扱い |
| lessons-learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | light theme review の教訓          |

## Atent Team / SubAgent 設計

- 直列: Lane A が system spec 参照と要求整理を完了するまで他 lane を開始しない
- 並列禁止理由: token 契約未確定のまま他 lane が走ると責務が崩れる

## 統合テスト連携

| 観点                | 連携内容                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| Renderer theme 契約 | `tokens.css` の semantic token 一覧を Phase 4 の test specification へ引き継ぐ |
| 依存タスク連携      | shared color migration / regression guard が参照する token 契約IDを固定する    |
| IPC/Preload         | 本タスクでは新規 IPC 追加なし。renderer style 契約のみを対象にする             |

## 成果物

| 成果物                  | パス                                                                                                        |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| requirements-definition | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/requirements-definition.md` |
| scope-boundary          | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/scope-boundary.md`          |
| acceptance-criteria     | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-1/acceptance-criteria.md`     |

## 完了条件

- [x] token 起因の課題一覧が作成されている
- [x] 受入基準 AC-1〜AC-5 の素案が定義されている
- [x] 後続タスクとの境界が文章化されている
- [x] Phase 1-3 完了前に実装へ進まない方針が記録されている

## 次Phase

Phase 2: 設計
