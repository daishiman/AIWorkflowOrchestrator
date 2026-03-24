# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 5                                         |
| Phase名    | 実装                                      |
| タスクID   | TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001 |
| 前提Phase  | Phase 1-4                                 |
| 後続Phase  | Phase 6（テスト拡充）                     |
| ステータス | completed                                 |
| 作成日     | 2026-03-23                                |
| 機能名     | session-dock-artifact-bridge              |

## 目的

Task02 に必要な state、store、preload consumer、UI surface の変更順と ownership を定義する。

## 実行タスク

- state / store 更新順定義
- preload consumer 実装方針定義
- dock / artifact / share UI 実装方針定義

## 参照資料

| 参照資料       | パス                                                                | 内容                    |
| -------------- | ------------------------------------------------------------------- | ----------------------- |
| Phase 4 成果物 | `phase-4-test-creation.md`                                          | テスト作成（依存Phase） |
| root pack      | `../../phase-5-implementation.md`                                   | 親パックの実装仕様      |
| upstream task  | `../step-01-seq-task-01-guided-execution-shell-foundation/index.md` | 前タスクの成果物        |

## 変更対象ファイル一覧

| ファイル                                                                   | 変更種別 | 目的                       |
| -------------------------------------------------------------------------- | -------- | -------------------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                     | 修正     | session / transcript state |
| `apps/desktop/src/preload/index.ts`                                        | 修正     | consumer 契約再確認        |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`           | 修正     | dock / summary 表示        |
| `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`               | 修正     | handoff 情報の統合         |
| `apps/desktop/src/renderer/components/chat/PersistentTerminalLauncher.tsx` | 修正     | dock 再入導線              |
| `apps/desktop/src/renderer/components/execution/ArtifactSummary.tsx`       | 新規     | artifact-first 結果表示    |
| `apps/desktop/src/renderer/components/execution/TranscriptShareRail.tsx`   | 新規     | manual share rail          |
| `apps/desktop/src/renderer/components/execution/ProvenanceChip.tsx`        | 新規     | provenance 表示            |

## 実行手順

### ステップ1: state を先に定義する

session ID、status、artifact summary、share payload を store 境界で定義する。

### ステップ2: restore と share を定義する

restore 可能な最小データと manual share payload を定義する。

### ステップ3: UI を後から接続する

dock / artifact / share の順で surface を繋ぐ。

## 統合テスト連携

restore と share は renderer-only に閉じず、preload 契約も確認する。

## 成果物

| 成果物   | パス                                     | 説明           |
| -------- | ---------------------------------------- | -------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序       |
| 変更範囲 | `outputs/phase-5/file-change-scope.md`   | file ownership |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                | 仕様参照先                                   |
| ------------------ | --------------------------------------- | -------------------------------------------- |
| UI/UX              | dock / artifact / share の surface 設計 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | session state / store 設計              | `aiworkflow-requirements: architecture-*.md` |
| セキュリティ       | transcript share / provenance           | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | aborted state / restore failure         | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 完了条件

- [ ] session / artifact / share の state 境界が定義されている
- [ ] restore の最小データ集合が定義されている
- [ ] file ownership が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
