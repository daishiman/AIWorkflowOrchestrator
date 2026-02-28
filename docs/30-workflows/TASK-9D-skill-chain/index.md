# TASK-9D: スキルチェーン機能実装

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-9D                                              |
| タイトル   | スキルチェーン機能実装                               |
| Tier       | 3                                                    |
| Phase      | 9                                                    |
| 依存先     | TASK-9B（skill-creator スキル）                      |
| 並列可能   | TASK-9E, TASK-9F, TASK-9G, TASK-9H, TASK-9I, TASK-9J |
| ステータス | spec_created                                         |
| 優先度     | low                                                  |
| 複雑度     | large                                                |
| 作成日     | 2026-02-28                                           |

## 概要

複数のスキルをパイプラインとして連携させ、1つのスキルの出力を次のスキルの入力として渡す「スキルチェーン」機能を実装する。チェーン定義の作成・保存・実行・管理を提供し、条件分岐・エラーハンドリング・テンプレート変数をサポートする。

## スコープ

### 対象範囲

- 型定義（`SkillChainDefinition`, `SkillChainStep`, `InputMapping`, `OutputMapping`, `SkillChainCondition`, `SkillChainResult`, `StepResult`）
- SkillChainExecutor サービス（チェーン実行エンジン）
- SkillChainStore サービス（チェーン永続化）
- IPC チャネル拡張（5チャネル: list/get/save/delete/execute）
- Preload API 拡張（skill-api.ts への chainAPI 追加）
- Renderer Store 拡張（skillSlice へのチェーン状態追加）

### 対象外

- UI コンポーネント（SkillChainBuilder/SkillChainStepEditor）は UI タスク（task-031b）で管理
- スキルフォーク機能（TASK-9E で別途実装）
- スキルスケジュール機能（TASK-9G で別途実装）

## 成果物概要

| 種別     | ファイル                                                     | 説明                 |
| -------- | ------------------------------------------------------------ | -------------------- |
| 新規作成 | `packages/shared/src/types/skill-chain.ts`                   | チェーン型定義       |
| 新規作成 | `apps/desktop/src/main/services/skill/SkillChainExecutor.ts` | チェーン実行エンジン |
| 新規作成 | `apps/desktop/src/main/services/skill/SkillChainStore.ts`    | チェーン永続化       |
| 修正     | `packages/shared/src/types/index.ts`                         | 型エクスポート追加   |
| 修正     | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | チェーンIPCハンドラ  |
| 修正     | `apps/desktop/src/preload/channels.ts`                       | チャネル定数追加     |
| 修正     | `apps/desktop/src/preload/skill-api.ts`                      | chainAPI 追加        |
| 修正     | `apps/desktop/src/preload/types.ts`                          | 型定義追加           |
| 修正     | `apps/desktop/src/renderer/store/slices/skillSlice.ts`       | チェーン状態追加     |

## Phase 一覧

| Phase | 名称               | 仕様書                         | ステータス |
| ----- | ------------------ | ------------------------------ | ---------- |
| 1     | 要件定義           | `phase-1-requirements.md`      | pending    |
| 2     | 設計               | `phase-2-design.md`            | pending    |
| 3     | 設計レビューゲート | `phase-3-design-review.md`     | pending    |
| 4     | テスト作成         | `phase-4-test-creation.md`     | pending    |
| 5     | 実装               | `phase-5-implementation.md`    | pending    |
| 6     | テスト拡充         | `phase-6-test-expansion.md`    | pending    |
| 7     | カバレッジ確認     | `phase-7-coverage-check.md`    | pending    |
| 8     | リファクタリング   | `phase-8-refactoring.md`       | pending    |
| 9     | 品質保証           | `phase-9-quality-assurance.md` | pending    |
| 10    | 最終レビューゲート | `phase-10-final-review.md`     | pending    |
| 11    | 手動テスト検証     | `phase-11-manual-test.md`      | pending    |
| 12    | ドキュメント更新   | `phase-12-documentation.md`    | pending    |
| 13    | PR作成             | `phase-13-pr-creation.md`      | pending    |

## 本ブランチ差分反映監査（2026-02-28）

| SubAgent | 担当関心ごと                           | 結果                                          |
| -------- | -------------------------------------- | --------------------------------------------- |
| A        | 本ブランチ差分抽出（Git）              | `authCallbackServer` 系2ファイルの変更を特定  |
| B        | task-specification-creator 準拠性検証  | `verify-all-specs` 13/13 PASS、警告要因を特定 |
| C        | aiworkflow-requirements 必要仕様の抽出 | 認証コールバック関連の正本仕様4件を抽出       |

| 変更ファイル                                                      | 差分要点                                                                                            | 反映先仕様                                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `apps/desktop/src/main/auth/authCallbackServer.ts`                | `waitForCallback()` タイムアウト時の自動 `stop()` を削除し、`stop()` を `server.listening` で安全化 | `phase-5-implementation.md`, `phase-11-manual-test.md`                             |
| `apps/desktop/src/main/auth/__tests__/authCallbackServer.test.ts` | タイムアウトテスト終了時に `await server.stop()` を追加                                             | `phase-4-test-creation.md`, `phase-6-test-expansion.md`, `phase-11-manual-test.md` |

## 参照資料

### タスク定義

| 資料名     | パス                                                                                                                         |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------- |
| タスク仕様 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023e-task-9d-skill-chain.md` |
| 機能仕様   | `docs/30-workflows/skill-import-agent-system/specification.md` §18                                                           |
| 技術判断   | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §19                                                     |

### システム仕様（aiworkflow-requirements）

| 資料名                | パス                                                                                        | 内容                                 |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| IPC契約               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPCチャネル契約定義                  |
| インターフェース定義  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキルAPI型定義                      |
| セキュリティIPC       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPCセキュリティ                      |
| Electronセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Electron IPC原則                     |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44/P45検証              |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 設計パターン集                       |
| 状態管理              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand設計原則                      |
| 教訓集                | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の教訓                           |
| 認証IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                         | OAuthコールバック系エラー契約        |
| 認証セキュリティ実装  | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`              | ローカルHTTPコールバックサーバー要件 |
| 認証実装パターン      | `.claude/skills/aiworkflow-requirements/references/patterns.md`                             | ローカルHTTP受信パターン             |
| 実装責務マップ        | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`                  | `authCallbackServer.ts` の責務配置   |

### スキルチェーン設計資産

| 資料名                   | パス                                                              | 内容                          |
| ------------------------ | ----------------------------------------------------------------- | ----------------------------- |
| チェーン設計エージェント | `.claude/skills/skill-creator/agents/design-skill-chain.md`       | 設計思考プロセス（8ステップ） |
| チェーンパターン集       | `.claude/skills/skill-creator/references/skill-chain-patterns.md` | 基本4+応用2パターン           |
| オーケストレーション     | `.claude/skills/skill-creator/references/orchestration-guide.md`  | 全体アーキテクチャ・変数構文  |

## クイックスタート

```bash
# Phase仕様書の検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-9D-skill-chain

# 特定Phaseの検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9D-skill-chain --phase 1

# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js --workflow docs/30-workflows/TASK-9D-skill-chain --phase 1 --artifacts "outputs/phase-1/requirements-definition.md:要件定義書"
```
