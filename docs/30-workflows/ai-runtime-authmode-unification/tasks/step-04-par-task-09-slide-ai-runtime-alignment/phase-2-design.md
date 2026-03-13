# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| Phase名    | 設計                                    |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 1（要件定義）                     |
| 後続Phase  | Phase 3（設計レビュー）                 |
| ステータス | not_started                             |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent が同じ runtime 契約を使いながら責務分離を保つ設計を作る。

## 実行タスク

- policy 設計: access capability 解決と engine 選択を分離した shared runtime policy を定義する
- role 設計: watcher、modifier、reverse-sync を internal orchestration として定義する
- authority 設計: reverse-sync、watch-start/stop、sync status/progress/error の authority をどこに置くか決める
- direct SDK 排除設計: slide agent-client の direct SDK / store key read をどこで遮断するか決める

## 設計方針

- access capability 解決は execute 入口で行い local 判定を増やさない
- internal role は UI の mode 切替にしない
- direct SDK read や simulated 実行は production 経路に残さない
- reverse-sync / watch IPC は shared runtime resolver と guidance を通す

## Atent Team / SubAgent 分担

| 役割                          | 主担当                                                                   |
| ----------------------------- | ------------------------------------------------------------------------ |
| Runtime Routing Agent         | slide skill-executor、legacy agent client、modifier の解決契約を整理する |
| Lifecycle Orchestration Agent | watcher、modifier、reverse-sync の役割を整理する                         |
| IPC Agent                     | reverse-sync / watch / sync status の維持設計を行う                      |

## 参照資料

| 参照資料             | パス                                                                       | 内容                                                  |
| -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                                                  | 依存する前提成果物を確認する                          |
| pack parent index    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | 実行順序、依存グラフ、共通方針の正本を確認する        |
| pack design audit    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 多角的監査の結論、禁止事項、依存整合を確認する        |
| pack UI/UX 図解      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`      | 5図セットの画面構成、状態遷移、CTA 導線を確認する     |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`                            | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`                              | legacy agent client の current path を確認する        |
| modifier-skill       | `apps/desktop/src/main/slide/modifier-skill.ts`                            | reverse-sync modifier の current path を確認する      |
| slide IPC handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`                              | reverse-sync / watch IPC の current path を確認する   |
| sync-manager         | `apps/desktop/src/main/slide/sync-manager.ts`                              | watcher と sync status の authority を確認する        |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                       | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| api-ipc-system                   | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                   | slide reverse-sync / watch IPC の正本                        |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`       | slide sync / modifier 契約正本                               |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | execute 契約と error code 正本                               |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| ui-ux-settings                   | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                   | slide settings / directory / auth surface の正本             |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | slide IPC / preload security の正本                          |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |
| pack UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                | slide sync card、progress row、manual fallback を確認する    |

## UI/UX リアライズ

| 観点           | 内容                                                                                |
| -------------- | ----------------------------------------------------------------------------------- |
| 画面構成       | sync card、progress row、watch status、manual fallback guidance の 4 領域で構成する |
| Primary CTA    | `reverse-sync を実行`                                                               |
| Secondary CTA  | `manual fallback を開く` `watch status を確認`                                      |
| 状態           | `synced` `running` `degraded` `guidance` を扱う                                     |
| マイクロコピー | degraded 状態では「いま何が失敗しているか」と「次に手動で何をするか」を同時に示す   |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watch-start/stop、sync status/progress/error、legacy agent client、guidance の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                             |
| ------------ | -------------------------------------- | ------------------------------------------------ |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する           |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する             |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | sync card、progress、guidance の見せ方を整理する |

## 完了条件

- [ ] shared runtime policy が slide reverse-sync / modifier / legacy agent まで定義されている
- [ ] direct SDK read 排除と UI surface の責務分離が明文化されている
- [ ] slide sync / degraded / manual fallback の UI 状態が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
