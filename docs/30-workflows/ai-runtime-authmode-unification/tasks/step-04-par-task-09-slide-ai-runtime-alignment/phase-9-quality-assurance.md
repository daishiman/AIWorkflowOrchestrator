# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 9                                       |
| Phase名    | 品質検証                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| 前提Phase  | Phase 5（実装）                         |
| 後続Phase  | Phase 10（最終レビュー）                |
| ステータス | not_started                             |
| 作成日     | 2026-03-13                              |
| 機能名     | slide-ai-runtime-alignment              |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の品質を横断観点で確認する。

## 実行タスク

- trust 確認: guidance、error envelope、sync status 表示の整合を確認する
- UX 確認: integrated runtime、terminal handoff、guidance-only の message を確認する

## 参照資料

| 参照資料             | パス                                                 | 内容                                                  |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 5（実装）      | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| slide skill-executor | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client   | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace       | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| interfaces-agent-sdk-skill       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`       | skill lifecycle 契約正本                                     |
| interfaces-agent-sdk-executor    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`    | execute 契約と error code 正本                               |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | slide IPC / preload security の正本                          |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

品質検証 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の品質観点を横断確認する。

## 成果物

| 成果物             | パス                              | 内容                                           |
| ------------------ | --------------------------------- | ---------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md` | セキュリティ、UX、契約整合の確認項目をまとめる |

## 完了条件

- [ ] 品質 blocker 0 件

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
