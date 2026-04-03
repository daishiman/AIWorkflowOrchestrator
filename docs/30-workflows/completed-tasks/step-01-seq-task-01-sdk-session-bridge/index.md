# Task01: SDK Session Bridge 実装

## メタ情報

| 項目         | 値                        |
| ------------ | ------------------------- |
| タスクID     | TASK-SDK-SC-01            |
| 責務         | SDK Session Bridge lane   |
| 実行順序     | step-01-seq（最初に実行） |
| 依存先       | なし（起点タスク）        |
| ブロック対象 | step-02 以降の全タスク    |
| ステータス   | Phase12完了（PR未作成）   |
| 作成日       | 2026-04-02                |

## 目的

`@anthropic-ai/claude-agent-sdk` の `query()` API を使って既存の `.claude/skills/skill-creator/SKILL.md` スキルを呼び出し、スキルが発行する `UserInput` ツールコール（単選択/複数選択/自由入力/パスワード/確認）を Electron の Main→Renderer IPC 経由で UI に転送するブリッジを実装する。

新しいインタビューエンジンは作らない。`skill-creator` が `AskUserQuestion` で対話するのを IPC ブリッジで中継するだけ。UI で回答 → IPC 経由で Main → SDK セッションに注入するフローを実現する。

## 対象ファイル

| ファイル                                                           | 変更内容                              |
| ------------------------------------------------------------------ | ------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts` | 新規: SDKセッション管理クラス         |
| `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`  | 新規: IPCブリッジクラス               |
| `packages/shared/src/ipc/channels.ts`                              | 5チャネル追加                         |
| `packages/shared/src/types/skillCreatorSession.ts`                 | 新規: セッション状態・UserInput型定義 |

## 実行タスク

### Task 1-1: 型定義・IPCチャネル定義

`packages/shared/src/types/skillCreatorSession.ts` に `ISkillCreatorSessionState` インターフェースと `SessionStatus` / `UserInputType` / `UserInputQuestion` / `UserInputAnswer` 型を定義する。`packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_SESSION_CHANNELS` 定数（5チャネル）を追加する。

### Task 1-2: SkillCreatorSdkSession 実装

`@anthropic-ai/claude-agent-sdk` の `query()` API を呼び出して `/skill-creator` スキルを起動し、`UserInput` ツールコールを検出して IpcBridge に転送するクラスを実装する。`sendAnswer()` メソッドで SDK セッションへの回答注入を行う。

### Task 1-3: SkillCreatorIpcBridge 実装

Electron の IPC ハンドラーを登録・解除し、Renderer → Main のメッセージを `SkillCreatorSdkSession` にルーティングするクラスを実装する。Main → Renderer へのイベント送出も担当する。

## 参照資料

| 資料名                          | パス                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| skill-creator スキル定義        | `.claude/skills/skill-creator/SKILL.md`                                            |
| 既存 SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`             |
| SDK メッセージ正規化            | `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`                   |
| 共有型定義                      | `packages/shared/src/types/skillCreator.ts`                                        |
| IPCチャネル定義                 | `packages/shared/src/ipc/channels.ts`                                              |
| Phase 1 要件定義                | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-1-requirements.md` |

## 成果物

| 成果物                   | パス                                                                | 形式       |
| ------------------------ | ------------------------------------------------------------------- | ---------- |
| タスク概要（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md` | Markdown   |
| SDKセッション管理クラス  | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`  | TypeScript |
| IPCブリッジクラス        | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`   | TypeScript |
| IPCチャネル追加          | `packages/shared/src/ipc/channels.ts`                               | TypeScript |
| セッション状態型定義     | `packages/shared/src/types/skillCreatorSession.ts`                  | TypeScript |

## 完了条件

- [ ] `SkillCreatorSdkSession.ts` が存在し、`startSession()` / `sendAnswer()` を実装している
- [ ] `SkillCreatorIpcBridge.ts` が存在し、IPCハンドラーの登録・解除を実装している
- [ ] `channels.ts` に `SKILL_CREATOR_SESSION_CHANNELS` が追加されている
- [ ] `skillCreatorSession.ts` に `ISkillCreatorSessionState` / `SessionStatus` / `UserInputType` / `UserInputQuestion` / `UserInputAnswer` 型が定義されている
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] 単体テストが全て PASS する

## 次のフェーズ

Phase 13: 完了（PR作成はユーザー制約により未実施）
