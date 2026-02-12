# TASK-9B-H-SKILL-CREATOR-IPC ワークフロー

## メタ情報

| 項目      | 値                                    |
| --------- | ------------------------------------- |
| タスクID  | TASK-9B-H-SKILL-CREATOR-IPC           |
| タスク名  | SkillCreatorService IPCハンドラー登録 |
| ブランチ  | feature/task-9b-h-skill-creator-ipc   |
| 作成日    | 2026-02-12                            |
| 対象機能  | スキル作成（skill-creatorメタスキル） |
| 関連Issue | #692                                  |

## 概要

SkillCreatorService（5パブリックメソッド: detectMode, createSkill, executeTasks, validateSkill, validateWithSchema）をIPC経由でRendererから利用可能にする。6チャンネル（5 invoke + 1 on）を追加し、Preload APIブリッジを実装する。

## IPCチャンネル

| チャンネル                    | 方向 | 対応メソッド       | 説明           |
| ----------------------------- | ---- | ------------------ | -------------- |
| skill-creator:detect-mode     | R→M  | detectMode         | モード検出     |
| skill-creator:create          | R→M  | createSkill        | スキル作成     |
| skill-creator:execute-tasks   | R→M  | executeTasks       | タスク実行     |
| skill-creator:validate        | R→M  | validateSkill      | バリデーション |
| skill-creator:validate-schema | R→M  | validateWithSchema | スキーマ検証   |
| skill-creator:progress        | M→R  | -                  | 進捗通知       |

## 影響ファイル

| ファイル                                          | 変更種別 | 説明                       |
| ------------------------------------------------- | -------- | -------------------------- |
| apps/desktop/src/preload/channels.ts              | 変更     | チャンネル定数追加         |
| apps/desktop/src/main/ipc/skillCreatorHandlers.ts | 新規     | IPCハンドラー              |
| apps/desktop/src/main/ipc/index.ts                | 変更     | registerAllIpcHandlers連携 |
| apps/desktop/src/preload/skill-creator-api.ts     | 新規     | Preload API                |
| apps/desktop/src/preload/types.ts                 | 変更     | 型定義追加                 |
| packages/shared/src/types/skillCreator.ts         | 新規     | 共有型定義                 |

## Phase一覧

| Phase | ファイル                         | 説明                              |
| ----- | -------------------------------- | --------------------------------- |
| 1     | phase-1-requirements.md          | 要件定義                          |
| 2     | phase-2-design.md                | 設計                              |
| 3     | phase-3-design-review.md         | 設計レビューゲート                |
| 4     | phase-4-test-creation.md         | テスト作成（TDD: Red）            |
| 5     | phase-5-implementation.md        | 実装（TDD: Green）                |
| 6     | phase-6-test-expansion.md        | テスト拡充                        |
| 7     | phase-7-coverage-verification.md | カバレッジ確認                    |
| 8     | phase-8-refactoring.md           | リファクタリング（TDD: Refactor） |
| 9     | phase-9-quality-assurance.md     | 品質保証                          |
| 10    | phase-10-final-review.md         | 最終レビューゲート                |
| 11    | phase-11-manual-testing.md       | 手動テスト検証                    |
| 12    | phase-12-documentation.md        | ドキュメント更新                  |
| 13    | phase-13-pr-creation.md          | PR作成                            |

## 参照仕様書

| 仕様書                   | パス                                                                            | 主要参照内容                                     |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| スキルIPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-skill-ipc.md         | validatePath、safeInvoke/safeOn、3層セキュリティ |
| SkillCreatorService仕様  | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | API仕様、型定義、SkillCreatorMode                |
| IPC・永続化パターン      | .claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md       | Pattern 3、registerAllIpcHandlers                |
| Electron IPCセキュリティ | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | sender検証、CSP、BrowserWindow設定               |
| Agent Dashboard IPC      | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | 既存チャンネル命名一貫性                         |
