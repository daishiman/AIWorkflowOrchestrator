# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| Phase名    | 要件定義                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | なし                                    |
| 後続Phase  | Phase 2（設計）                         |
| ステータス | not_started                             |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent の現状 integrated runtime / terminal handoff 経路を把握し、reverse-sync / watcher / guidance の要件を定義する。

## 実行タスク

- 経路棚卸し: slide skill-executor、slide agent-client、modifier-skill、sync-manager、SlideWorkspace の認証と runtime 経路を整理する
- 既存保証抽出: reverse-sync、watch-start/stop、sync status/progress/error、streaming feedback 契約として維持すべきものを抽出する
- role 対応付け: watcher、modifier、reverse-sync の internal role と既存 API を対応付ける

## 参照資料

| 参照資料             | パス                                                 | 内容                                                  |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| modifier-skill       | `apps/desktop/src/main/slide/modifier-skill.ts`      | reverse-sync modifier の current path を確認する      |
| slide IPC handlers   | `apps/desktop/src/main/slide/ipc-handlers.ts`        | reverse-sync / watch IPC の current path を確認する   |
| sync-manager         | `apps/desktop/src/main/slide/sync-manager.ts`        | watcher と sync status の authority を確認する        |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

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

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

要件定義 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watch-start/stop、sync status/progress/error、legacy agent client、guidance の接続要件を要件として明文化する。

## 成果物

| 成果物       | パス                                         | 内容                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | 要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する   |

## 完了条件

- [ ] runtime と auth-mode の現状経路が slide reverse-sync / modifier / legacy agent まで整理されている
- [ ] 維持すべき reverse-sync / watcher / guidance 契約が抜き出されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
