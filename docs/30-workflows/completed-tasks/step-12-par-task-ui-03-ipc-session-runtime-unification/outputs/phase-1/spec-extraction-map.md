# 仕様抽出マップ（TASK-UI-03）

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 1                              |
| 作成日     | 2026-04-06                     |
| ステータス | complete                       |
| 対象       | Session IPC / Runtime IPC 分析 |

---

## P50チェック結果

### 対象ファイルの実装状態

| ファイル                                                | 状態               | 主な内容                                                                         |
| ------------------------------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-creator-api.ts`         | 実装済み（677行）  | Runtime IPC + Session Resume 全メソッドを `skillCreatorAPI` として公開           |
| `apps/desktop/src/preload/skill-creator-session-api.ts` | 実装済み（85行）   | 会話フロー Session IPC を `skillCreatorSessionAPI` として公開                    |
| `apps/desktop/src/preload/channels.ts`                  | 実装済み（785行）  | 全チャネルのホワイトリスト定義。`@repo/shared/src/ipc/channels` からインポート   |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`          | 実装済み（768行）  | Runtime IPC + Session Resume ハンドラー（`registerRuntimeSkillCreatorHandlers`） |
| `apps/desktop/src/preload/index.ts`                     | 実装済み（675行）  | 4つの API オブジェクトを公開                                                     |
| `packages/shared/src/types/skillCreator.ts`             | 実装済み（1258行） | Session/Runtime 両方の型定義が混在                                               |

**判定**: 二重経路が実装済みで両方存在 → 統合/明確な分離契約の設計に進行

---

## IPC 二重経路の現状分析

### Session IPC（会話フロー）

```
Renderer ──(invoke)──► Main
  START_SESSION
  ANSWER
  CONFIGURE_API

Main ──(on/push)──► Renderer
  QUESTION_RECEIVED
  SESSION_COMPLETE
  SESSION_ERROR
  EXTERNAL_API_CONFIG_REQUIRED
  API_CONFIGURED
  API_TEST_RESULT
```

**責務**: ユーザーとの対話型スキル作成フロー。質問→回答の逐次的な会話パターン。
**使用元コンポーネント**: `SkillCreatorConversationPanel`

### Runtime IPC（ワークフロー状態）

```
Renderer ──(invoke)──► Main
  SKILL_CREATOR_PLAN
  SKILL_CREATOR_EXECUTE_PLAN (fire-and-forget)
  SKILL_CREATOR_GET_WORKFLOW_STATE
  SKILL_CREATOR_SUBMIT_USER_INPUT
  SKILL_CREATOR_GET_ADAPTER_STATUS
  SKILL_CREATOR_IMPROVE_SKILL
  SKILL_CREATOR_APPLY_IMPROVEMENT
  SKILL_CREATOR_GET_VERIFY_DETAIL
  SKILL_CREATOR_REVERIFY_WORKFLOW

Main ──(on/push)──► Renderer
  SKILL_CREATOR_WORKFLOW_STATE_CHANGED
  SKILL_CREATOR_ADAPTER_STATUS_CHANGED
```

**責務**: ワークフロー状態スナップショット型の実行管理。バックグラウンド処理 + 状態通知パターン。
**使用元コンポーネント**: `SkillLifecyclePanel` / `ConversationalInterview`

---

## 重複・差分分析

### 機能的重複

| 機能             | Session IPC                                      | Runtime IPC                                                         | 重複度 |
| ---------------- | ------------------------------------------------ | ------------------------------------------------------------------- | ------ |
| ユーザー入力受付 | `ANSWER` (UserInputAnswer)                       | `SKILL_CREATOR_SUBMIT_USER_INPUT` (SkillCreatorUserInputSubmission) | **高** |
| エラー通知       | `SESSION_ERROR` (on イベント)                    | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` (errorMessage 引数)          | **中** |
| 完了通知         | `SESSION_COMPLETE` (on イベント)                 | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` (phase="handoff")            | **中** |
| 外部API設定      | `EXTERNAL_API_CONFIG_REQUIRED` + `CONFIGURE_API` | `configureExternalApi` (CONFIGURE_API 共用)                         | **中** |

### 状態モデルの差分

| 観点                | Session IPC                           | Runtime IPC                                           |
| ------------------- | ------------------------------------- | ----------------------------------------------------- |
| 状態表現            | イベント駆動（質問が来たら→回答する） | スナップショット型（ワークフロー全体の状態を取得）    |
| planId/セッションID | なし（セッションは Main 側で管理）    | `planId` で全操作を紐付け                             |
| ユーザー入力型      | `UserInputAnswer`                     | `SkillCreatorUserInputSubmission`（`requestId` 必須） |
| フロー制御          | Main がフロー全体を制御               | Renderer がポーリング or 通知受信で状態を把握         |

### エラーハンドリングの差分

| 観点               | Session IPC                      | Runtime IPC                                                 |
| ------------------ | -------------------------------- | ----------------------------------------------------------- |
| エラー通知方式     | `SESSION_ERROR` イベント（push） | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` の errorMessage 引数 |
| IpcResult ラッパー | なし（void/throw）               | `{ success, data?, error? }` の統一 DTO                     |
| sender 検証        | **なし**（ホワイトリストのみ）   | `validateSender` による `webContents.id` 検証               |

### 通信パターンの差分

| 観点                 | Session IPC                       | Runtime IPC                                    |
| -------------------- | --------------------------------- | ---------------------------------------------- |
| invoke/handle        | `safeInvoke` のみ                 | `safeInvoke` + `ipcMain.handle`                |
| push 通知            | `on` リスナー（複数イベント種別） | `on` リスナー（統一 `WORKFLOW_STATE_CHANGED`） |
| バックグラウンド実行 | なし                              | `executePlan` が fire-and-forget               |

---

## セキュリティ要件確認

### security-skill-ipc-core.md 対照表

| セキュリティ要件                                      | Session IPC                                          | Runtime IPC                               | ギャップ         |
| ----------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------- | ---------------- |
| チャネルホワイトリスト                                | ✅ `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` | ✅ 同上                                   | なし             |
| sender 検証（`event.senderFrame` / `webContents.id`） | ❌ **未適用**                                        | ✅ `validateSender` + `validateIpcSender` | **ギャップあり** |
| パストラバーサル防止                                  | N/A（パス入力なし）                                  | N/A（パス入力なし）                       | なし             |
| コマンドインジェクション防止                          | N/A                                                  | N/A                                       | なし             |
| 入力バリデーション                                    | △ 暗黙（型のみ）                                     | ✅ `isBlank` チェック + 型検証            | **中ギャップ**   |

### 重要な発見

**ギャップ 1**: Session IPC ハンドラー（`skill-creator-session-api.ts` 側の Main ハンドラー）に `validateSender` が未適用。Runtime IPC は全ハンドラーに `validateSender` を実装済み。

**ギャップ 2**: Session IPC の `sendAnswer` はユーザー入力をそのまま渡す構造で、Runtime IPC の `submitUserInput` は `requestId` + `planId` による二重バリデーション構造。

---

## Preload API 公開の冗長性

### 現在の公開状態（4経路）

```
window
├── skillCreatorAPI          ← skill-creator-api.ts の直接公開
├── skillCreatorSessionAPI   ← skill-creator-session-api.ts の直接公開
└── electronAPI
    ├── skillCreator         ← 上と同じ skillCreatorAPI オブジェクト
    └── skillCreatorSession  ← 上と同じ skillCreatorSessionAPI オブジェクト
```

**問題**: 同一オブジェクトが 2 経路ずつ露出。新機能開発時にどちらの参照を使うべきか判断基準がない。

---

## 受入条件（AC-1〜AC-7）検証可能性確認

| AC   | 検証可能か | 確認内容                                                                |
| ---- | ---------- | ----------------------------------------------------------------------- |
| AC-1 | ✅         | 設計方針ドキュメントが存在し、IPC 経路の統一方針が明文化されているか    |
| AC-2 | ✅         | 開発者ガイドに「どの IPC を使うか」の判断フローが記載されているか       |
| AC-3 | ✅         | preload の `contextBridge.exposeInMainWorld` 呼び出しが整理されているか |
| AC-4 | ✅         | `creatorHandlers.ts` のハンドラー登録が一貫したパターンを持つか         |
| AC-5 | ✅         | IPC 契約チェックリスト（Main/Preload/型定義の同時更新）に準拠するか     |
| AC-6 | ✅         | Session IPC ハンドラーに `validateSender` が適用されているか            |
| AC-7 | ✅         | 既存テストが pass するか（`pnpm test` で確認）                          |

---

## 改善優先順位（Phase 2 設計への input）

1. **最優先（セキュリティ）**: Session IPC ハンドラーへの `validateSender` 適用
2. **高優先（アーキテクチャ）**: 4経路露出を 1〜2 経路に整理
3. **中優先（一貫性）**: ユーザー入力型の統一（`UserInputAnswer` vs `SkillCreatorUserInputSubmission`）
4. **中優先（可読性）**: エラーハンドリングパターンの統一（`SESSION_ERROR` イベント vs errorMessage 引数）
5. **低優先（命名）**: チャネル命名規則の統一（`skill-creator:xxx` プレフィックスは統一済み）

---

## スコープ境界確認

| 項目                            | 含む/含まない | 根拠                       |
| ------------------------------- | ------------- | -------------------------- |
| IPC 経路の設計方針策定          | **含む**      | TASK-UI-03 の主要目的      |
| preload API surface 整理        | **含む**      | AC-3                       |
| creatorHandlers 構成統合        | **含む**      | AC-4                       |
| Session IPC sender 検証適用     | **含む**      | AC-6（セキュリティ均一化） |
| UI コンポーネントの全面リライト | **含まない**  | スコープ外                 |
| WorkflowEngine の状態遷移変更   | **含まない**  | TASK-P0-02 の範囲          |
| 新規 IPC チャネルの追加         | **含まない**  | 統合/整理のみ              |
