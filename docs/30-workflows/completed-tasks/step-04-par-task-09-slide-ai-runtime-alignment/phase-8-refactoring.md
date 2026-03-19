# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                       |
| Phase名    | リファクタリング                                                                                        |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                                                 |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                                                                     |
| ステータス | completed                                                                                               |
| 作成日     | 2026-03-13                                                                                              |
| 機能名     | slide-ai-runtime-alignment                                                                              |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の責務境界を整理する。agent-client.ts 廃止後の credential 解決、watcher/streaming 分離、sync orchestration、IPC handler の薄層化を検証し、単一責務原則に沿った構成を確保する。

## 実行タスク

- T-8-1 credential 解決分離: credential 解決責務を RuntimeResolver 側へ閉じ込める
- T-8-2 watcher/streaming 分離: file watch と streaming feedback の責務分離を検証する
- T-8-3 sync orchestration 整理: reverse-sync / manualSync の責務と helper 抽出を検証する
- T-8-4 IPC handler 整理: handler を薄い登録レイヤーへ保つ

| T-ID  | 対象                    | 内容                                                                                                                                                                                           | 判定基準                                                                       |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| T-8-1 | credential 解決分離     | agent-client.ts 廃止後、skill-executor.ts 内の credential 解決ロジックが SkillExecutor の責務に収まっているか検証する。RuntimeResolver 経由の credential 取得に統一されていることを確認する    | 単一責務原則に違反する分散がない。credential 解決は RuntimeResolver に委譲済み |
| T-8-2 | watcher/streaming 分離  | FileWatcher と streaming feedback の責務が sync-manager.ts に混在していないか検証する。FileWatcher はファイル変更検知のみ、SyncManager は orchestration のみに分離されていることを確認する     | FileWatcher = ファイル検知のみ、SyncManager = orchestration のみ。混在行が 0   |
| T-8-3 | sync orchestration 整理 | SyncManager の reverseSync / manualSync が明確に分離されているか検証する。各メソッドが 30 行以下であること、共通ロジックが private helper メソッドに抽出されていることを確認する               | 各メソッドが 30 行以下。共通ロジックは private helper に抽出済み               |
| T-8-4 | IPC handler 整理        | ipc-handlers.ts が handler 登録のみの薄いレイヤーになっているか検証する。ビジネスロジックが handler 内に残っていないこと、全 handler が SyncManager/SkillExecutor に委譲していることを確認する | ビジネスロジックが handler 内に残っていない。全 handler が service 層に委譲    |

## 多角的チェック観点

| 観点           | チェック内容                                                                  | 関連 Pitfall           |
| -------------- | ----------------------------------------------------------------------------- | ---------------------- |
| セキュリティ   | credential 解決が Main Process 内で完結し、Renderer に漏洩しないこと          | P44, P45               |
| アーキテクチャ | レイヤー依存方向が Renderer -> Preload -> Main -> External の一方向であること | 01-architecture.md     |
| 状態管理       | slideSlice の SyncStatus/SyncDirection が SyncManager のみから更新されること  | 03-state-management.md |
| テスタビリティ | IPC handler が service 層への委譲のみで、モック差し替えが容易であること       | P34, P61               |
| DIP 準拠       | handler 登録関数の引数型がインターフェース（Port）であること                  | P61                    |

## 参照資料

| 参照資料                  | パス                                                 | 内容                                                  |
| ------------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| Phase 1（要件定義）       | `phase-1-requirements.md`                            | 依存する前提成果物を確認する                          |
| Phase 2（設計）           | `phase-2-design.md`                                  | 依存する前提成果物を確認する                          |
| Phase 5（実装）           | `phase-5-implementation.md`                          | 依存する前提成果物を確認する                          |
| Phase 6（テスト拡充）     | `phase-6-test-expansion.md`                          | 依存する前提成果物を確認する                          |
| Phase 7（カバレッジ確認） | `phase-7-coverage-check.md`                          | 依存する前提成果物を確認する                          |
| slide skill-executor      | `apps/desktop/src/main/slide/skill-executor.ts`      | slide skill execute の current path を確認する        |
| slide agent-client        | `apps/desktop/src/main/slide/agent-client.ts`        | legacy agent client の current path を確認する        |
| SlideWorkspace            | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx` | slide renderer surface と reverse-sync 導線を確認する |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「責務分離を再確認する根拠」だけを重点確認する。

| 参照資料                             | パス                                                                                        | 内容                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| llm-workspace-chat-edit              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`              | RuntimeResolver / handoff 分離の再利用元 |
| security-electron-ipc-core           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`           | sender / auth-mode / secret 境界の正本   |
| arch-state-management-reference      | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`      | state / handoff stale 防止の正本         |
| arch-electron-services-details-part2 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md` | RuntimeResolver / DI 境界の正本          |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Slide / Modifier / Legacy Agent 経路の runtime 整流 の対象範囲を固定する。

### ステップ2: T-8-1 credential 解決分離を検証する

agent-client.ts 廃止後の credential 解決ロジックが RuntimeResolver に統一されているか確認する。`grep -rn "getApiKey\|getCredential\|electron-store" apps/desktop/src/main/slide/` で分散箇所を検出する。

### ステップ3: T-8-2 watcher/streaming 分離を検証する

FileWatcher と streaming feedback の責務が分離されているか確認する。sync-manager.ts 内で `fs.watch` / `chokidar` と streaming callback が混在していないか検証する。

### ステップ4: T-8-3 sync orchestration 整理を検証する

SyncManager の reverseSync / manualSync の行数を計測し、30 行以下であることを確認する。共通ロジックの抽出状況を検証する。

### ステップ5: T-8-4 IPC handler 整理を検証する

ipc-handlers.ts 内にビジネスロジックが残っていないか確認する。全 handler が SyncManager / SkillExecutor への委譲のみであることを検証する。

### ステップ6: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ7: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## サブタスク管理

1. T-8-1: credential 解決分離の検証と記録
2. T-8-2: watcher/streaming 分離の検証と記録
3. T-8-3: sync orchestration メソッド行数検証と記録
4. T-8-4: IPC handler 薄層化の検証と記録
5. refactor-plan.md の作成と全 T-ID の結果統合

## 統合テスト連携

reverse-sync、watcher、guidance、streaming feedback、sync status の責務分離が維持されるよう整理する。

## 成果物

| 成果物       | パス                               | 内容                           |
| ------------ | ---------------------------------- | ------------------------------ |
| 責務整理計画 | `outputs/phase-8/refactor-plan.md` | 重複責務と再配置方針を整理する |

## 完了条件

- [ ] T-8-1: credential 解決が RuntimeResolver に統一されている
- [ ] T-8-2: FileWatcher と streaming feedback の責務が分離されている
- [ ] T-8-3: reverseSync / manualSync が各 30 行以下である
- [ ] T-8-4: IPC handler にビジネスロジックが残っていない
- [ ] refactor-plan.md が作成されている

## タスク100%実行確認【必須】

- [ ] 全 T-ID（T-8-1 から T-8-4）の検証結果が refactor-plan.md に記録されている
- [ ] credential 解決で `@anthropic-ai/sdk` 直接 import が slide 配下に存在しない
- [ ] electron-store 直読みが slide 配下に存在しない
- [ ] IPC handler の引数型がインターフェース（Port）である（P61 準拠）
- [ ] system spec との整合確認が完了している
- [ ] 成果物パスにファイルが存在する

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
