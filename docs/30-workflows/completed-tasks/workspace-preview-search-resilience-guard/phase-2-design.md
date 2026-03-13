# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 |
| Phase      | 2                                                    |
| Phase名    | 設計                                                 |
| ステータス | completed                                            |
| 前提Phase  | Phase 1                                              |
| 後続Phase  | Phase 3                                              |

## 目的

search resilience、preview resilience、error taxonomy、Phase 12 sync guard を future implementation へ安全に引き渡せる設計へ分解する。

## 実行タスク

- タスク1: search / preview / taxonomy / docs sync の設計責務を定義する
- タスク2: SubAgent ごとの並列化可能範囲と依存順序を定義する
- タスク3: Codex lane で実行する制約、対象ファイル、検証ゲートを定義する

### タスク1: 責務別設計

| concern            | 設計方針                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------- |
| search resilience  | `score=0` 除外、stable sort、top 10 制御を pure utility / hook rule に分離する            |
| preview resilience | timeout / retry / loading release を renderer local helper または hook contract に閉じる  |
| error taxonomy     | transport / parse / crash / no-match の UI 応答を同じ fatal surface に混ぜない            |
| docs sync          | 04C 完了 workflow、unassigned-task、system spec、Phase 12 outputs の exact count を揃える |

### タスク2: 並列化設計

| Lane   | 目的                        | 並列条件                                     |
| ------ | --------------------------- | -------------------------------------------- |
| Lane A | search resilience design    | Phase 1 完了後に開始                         |
| Lane B | preview resilience design   | Phase 1 完了後に開始、Lane A と並列可        |
| Lane C | error taxonomy design       | Lane A/B の契約を受けて定義                  |
| Lane D | docs / Phase 12 sync design | Lane C と並行しつつ、Phase 3 gate で統合判定 |

### タスク3: Codex 実装 lane handoff

- 新規 IPC は原則追加しない。
- `file:read` / `file:changed` / `window.electronAPI.file.read()` の再利用前提を崩さない。
- 実装時も commit / PR はユーザー承認まで禁止とする。

## 参照資料

| 参照資料         | パス                                                                                                         | 説明                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | -------------------- |
| Phase 1 成果物   | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-1/`               | 要件 / AC / spec map |
| 04C 設計         | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/phase-2-design.md`         | 親 workflow の設計   |
| 04C ドキュメント | `docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch/phase-12-documentation.md` | Phase 12 同期前提    |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | local state / global state の境界                    |
| api-ipc-system                       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | preview read 契約                                    |
| security-electron-ipc                | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | security boundary                                    |
| security-input-validation            | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`            | sanitize / dangerous URL / content safety の下限     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | renderer local resilience の設計パターン             |
| ui-ux-components                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | UI catalog と語彙の整合                              |
| ui-ux-search-panel                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                   | QuickFileSearch UI 契約                              |
| ui-ux-navigation                     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | shortcut / focus trap / preview auto-open の UI 契約 |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | 04C の再利用境界                                     |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | preview error taxonomy                               |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | future test / coverage gate                          |
| testing-component-patterns           | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | component test plan                                  |
| testing-accessibility                | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | dialog / focus / fallback review                     |

## 実行手順

### ステップ1: concern 単位の設計化

- search utility、preview helper、taxonomy table、Phase 12 sync checklist を পৃথ立させる。
- 04C の局所実装をそのまま横展開するのではなく、pure rule と workflow ルールへ分離する。

### ステップ2: Lane と依存の確定

- Lane A/B は Phase 2 のみ並列可とし、Lane C/D はその出力を受けて統合する。
- Phase 3 で PASS しない限り Phase 4 へ進めない。

### ステップ3: future implementation gate の明文化

- Codex lane へ渡す対象ファイル、テスト、system spec 更新先、禁止事項を `codex-handoff.md` に固定する。

## 統合テスト連携

| 観点            | 連携内容                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| unit / hook     | search utility と preview helper を pure test しやすい粒度へ分ける                                    |
| component       | `PreviewPanel` / `QuickFileSearch` / `PreviewErrorBoundary` の UI 応答を Phase 4 の testcase に落とす |
| docs validation | Phase 12 sync concern を `verify-unassigned-links` / `audit-unassigned-tasks` へ接続する              |

## 多角的チェック観点

- 共通観点は `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/phase-common-governance.md` を正本とし、設計時は Renderer / Main / IPC / Preload / data / a11y を 1 回ずつ横断確認する。

## サブタスク管理

- SubAgent-A/B を並列、SubAgent-C/D を依存後に統合する。3ファイル超の一括委譲は避け、lane ごとに責務を閉じる。

## タスク100%実行確認

- `outputs/phase-2/`、`phase-2-design.md`、`artifacts.json`、`outputs/artifacts.json`、Phase 3 gate 前提が一致していることを完了条件に含める。

## 成果物

| 成果物                  | パス                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| resilience-guard-design | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-2/resilience-guard-design.md` |
| subagent-lane-plan      | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-2/subagent-lane-plan.md`      |
| codex-handoff           | `docs/30-workflows/completed-tasks/workspace-preview-search-resilience-guard/outputs/phase-2/codex-handoff.md`           |

## 完了条件

- [x] 4 concern の設計責務と境界が定義されている
- [x] 直列 / 並列条件が明記されている
- [x] future implementation の禁止事項と handoff 条件がある
- [x] Phase 3 gate を通す前提が明記されている

## 次Phase

Phase 3: 設計レビューゲート
