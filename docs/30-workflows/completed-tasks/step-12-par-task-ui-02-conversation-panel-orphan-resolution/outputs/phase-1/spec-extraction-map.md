# TASK-UI-02 Phase 1: 仕様抽出マップ

作成日: 2026-04-06  
担当フェーズ: Phase 1（要件定義）

---

## 1. P50チェック結果（現行コードの状態確認）

### 調査対象ファイルの存在確認

| ファイル                                                                               | 状態           |
| -------------------------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 存在・実装済み |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 存在・実装済み |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | 存在・実装済み |
| `apps/desktop/src/renderer/App.tsx`                                                    | 存在・実装済み |
| `apps/desktop/src/preload/skill-creator-api.ts`                                        | 存在・実装済み |
| `apps/desktop/src/preload/skill-creator-session-api.ts`                                | 存在・実装済み |
| `packages/shared/src/types/skillCreator.ts`                                            | 存在・実装済み |

### マウントポイントの確認

- `SkillCreatorConversationPanel` は `App.tsx` に**一切インポートされていない**
  - マウントされているのは `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx`（ハーネスファイル）のみ
  - `phase11-skill-creator-conversation-ui.tsx` は E2E/視覚確認用の独立エントリポイントであり、本番アプリのルーティングには含まれない
- `ConversationalInterview` は `SkillLifecyclePanel.tsx`（line 1738）にマウントされており、本番アプリに接続済み

### 孤立状態の判定

| コンポーネント                  | App.tsx からのルーティング     | 本番利用状態             |
| ------------------------------- | ------------------------------ | ------------------------ |
| `SkillCreatorConversationPanel` | なし                           | **孤立**（ハーネスのみ） |
| `ConversationalInterview`       | SkillLifecyclePanel 経由で接続 | **正常接続**             |

---

## 2. Session IPC / Runtime IPC の差分分析

### 2-1. Session IPC（旧方式）

`SkillCreatorConversationPanel` が依存するAPIセット。

**公開インターフェース**: `window.skillCreatorSessionAPI`（`SkillCreatorSessionAPI`型）

| チャンネル定数                 | 文字列値                                       | 方向                  | 引数型                                    | 戻り値型                       |
| ------------------------------ | ---------------------------------------------- | --------------------- | ----------------------------------------- | ------------------------------ |
| `START_SESSION`                | `"skill-creator:start-session"`                | Renderer → Main       | `{ request: string, sessionId?: string }` | `Promise<void>`                |
| `ANSWER`                       | `"skill-creator:answer"`                       | Renderer → Main       | `UserInputAnswer`                         | `Promise<void>`                |
| `QUESTION_RECEIVED`            | `"skill-creator:question-received"`            | Main → Renderer（on） | `UserInputQuestion`                       | `() => void`（クリーンアップ） |
| `SESSION_COMPLETE`             | `"skill-creator:session-complete"`             | Main → Renderer（on） | `SkillCreatorSessionCompleteEvent`        | `() => void`                   |
| `SESSION_ERROR`                | `"skill-creator:session-error"`                | Main → Renderer（on） | `SkillCreatorSessionErrorEvent`           | `() => void`                   |
| `EXTERNAL_API_CONFIG_REQUIRED` | `"skill-creator:external-api-config-required"` | Main → Renderer（on） | `{ apiName?, description? }`              | `() => void`                   |

**追加 Output API**（`getSkillCreatorOutputApi()` 経由）:

`window.electronAPI?.skillCreator` または `window.skillCreatorAPI` から取得。

| メソッド           | 引数型                                       | 戻り値型                                        |
| ------------------ | -------------------------------------------- | ----------------------------------------------- |
| `onOutputReady`    | `(payload: SkillOutputReadyPayload) => void` | `() => void`                                    |
| `confirmOverwrite` | `SkillOutputReadyPayload`                    | `Promise<{ success: boolean; error?: string }>` |
| `openSkill`        | `string（savedPath）`                        | `Promise<{ success: boolean; error?: string }>` |

**型変換レイヤー**:  
Session IPC は `UserInputQuestion`（shared/types）を受信後、コンポーネント内の `mapQuestionToRequest()` で `SkillCreatorUserInputRequest` へ変換する。  
回答は `mapAnswerToUserInputAnswer()` で `InterviewUserAnswer` から `UserInputAnswer` に変換する。

### 2-2. Runtime IPC（新方式）

`ConversationalInterview` が依存するAPIセット。

**公開インターフェース**: `window.electronAPI.skillCreator`（`SkillCreatorAPI`型）または `getSkillCreatorApi()` ヘルパー経由

| チャンネル定数                            | 文字列値                                    | 方向                      | 引数型                                                  | 戻り値型                                             |
| ----------------------------------------- | ------------------------------------------- | ------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `SKILL_CREATOR_SUBMIT_USER_INPUT`         | `"skill-creator:submit-user-input"`         | Renderer → Main（invoke） | `SkillCreatorUserInputSubmission`                       | `Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>` |
| `SKILL_CREATOR_WORKFLOW_STATE_CHANGED`    | `"skill-creator:workflow-state-changed"`    | Main → Renderer（on）     | `SkillCreatorWorkflowUiSnapshot \| null, errorMessage?` | `() => void`                                         |
| `SKILL_CREATOR_OUTPUT_READY`              | `"skill-creator:output-ready"`              | Main → Renderer（on）     | `SkillOutputReadyPayload`                               | `() => void`                                         |
| `SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED` | `"skill-creator:output-overwrite-approved"` | Renderer → Main（invoke） | `SkillOutputReadyPayload`                               | `Promise<IpcResult<unknown>>`                        |
| `SKILL_CREATOR_OPEN_SKILL`                | `"skill-creator:open-skill"`                | Renderer → Main（invoke） | `{ savedPath: string }`                                 | `Promise<IpcResult<unknown>>`                        |

**データフロー**:  
Renderer は `workflowSnapshot: SkillCreatorWorkflowUiSnapshot` を props として受け取り、  
`submission = useInterviewState().buildSubmission(workflowSnapshot, answer)` で `SkillCreatorUserInputSubmission` を構築し、  
`onSubmit(submission)` コールバックを通じて親（SkillLifecyclePanel）が `skillCreatorApi.submitUserInput()` を呼ぶ。

### 2-3. 主要な差分の整理

| 観点           | Session IPC（旧）                                            | Runtime IPC（新）                                                                 |
| -------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 起動フロー     | セッション開始コマンド（`START_SESSION`）が必要              | `planId` を持つ `workflowSnapshot` が既存の前提                                   |
| 質問受信       | Push型（Mainからイベント受信）                               | Pull型（`workflowSnapshot.awaitingUserInput` をpropsで受取）                      |
| 回答送信       | `sendAnswer(UserInputAnswer)` → void                         | `submitUserInput(SkillCreatorUserInputSubmission)` → 新しいスナップショットを返す |
| 戻り値         | なし（void）                                                 | 更新済み `SkillCreatorWorkflowUiSnapshot`（状態を完全に置換）                     |
| 状態管理       | コンポーネント内 `useReducer` で独自管理                     | 親コンポーネントが `workflowSnapshot` 状態を所有                                  |
| 型変換         | 必要（`UserInputQuestion` → `SkillCreatorUserInputRequest`） | 不要（`SkillCreatorUserInputRequest` が直接利用可能）                             |
| セッション終了 | `SESSION_COMPLETE` / `SESSION_ERROR` イベント                | `workflowSnapshot.currentPhase` の変化で判断                                      |
| undo機能       | なし                                                         | あり（`useInterviewState().undo()`）                                              |
| 熟練度フィルタ | なし                                                         | あり（beginner / engineer）                                                       |

### 2-4. どちらが正本仕様に近いか

**Runtime IPC（新方式）が正本仕様**。

判断根拠:

1. `packages/shared/src/types/skillCreator.ts` に定義された `SkillCreatorWorkflowUiSnapshot`、`SkillCreatorUserInputSubmission`、`SkillCreatorUserInputRequest` は全て Runtime IPC 側が直接利用する型であり、Session IPC 側はこれらの型への変換レイヤーを介している
2. Session IPC が使う `UserInputQuestion` / `UserInputAnswer` は `@repo/shared/types` から別途インポートされており、型変換が必要な旧型
3. `ConversationalInterview` は `SkillLifecyclePanel`（本番UI）に接続されており、テスト・動作確認も本番フローで行われている
4. `SKILL_CREATOR_SUBMIT_USER_INPUT` は invoke 型（双方向・レスポンスあり）であり、Session IPC の `ANSWER`（fire-and-forget）より信頼性が高い
5. `SkillCreatorAPI`（`skill-creator-api.ts`）は非常に多機能なAPIで、セッション管理・セッション復元・Governance等を含む完全なAPI体系として設計されている

---

## 3. 統合か分離かの方針決定

### 方針: **統合（SkillCreatorConversationPanel を ConversationalInterview に統合）**

具体的には以下のいずれかを実施する:

- `SkillCreatorConversationPanel` の参照箇所を `ConversationalInterview` に置き換え、廃止する
- `SkillCreatorConversationPanel` にある固有機能（`SkillCreatorResultPanel`のレンダリング等）を `ConversationalInterview` または `SkillLifecyclePanel` に移植する

### 判断根拠

#### 機能的重複

両コンポーネントは同一の会話型インタビューUI（質問提示→ユーザー回答→次の質問）を実装しており、根本的な目的が同じである。

#### IPC冗長性

現状、2種類の IPC 経路（Session IPC / Runtime IPC）が並存しており、Main プロセス側のハンドラを二重に保守する必要がある。統合により保守コストを削減できる。

#### 孤立コンポーネントの本番接続不可

`SkillCreatorConversationPanel` は本番 `App.tsx` に接続されていないため、ユーザーが実際に利用できる状態にない。Phase 11 ハーネスは視覚確認専用であり、機能的な価値を持たない。

#### Runtime IPC の優位性

Runtime IPC はスナップショットベースの双方向通信を採用しており、状態の整合性保証・undo機能・セッション復元などの高度な機能を提供している。Session IPC（void戻り値・Push型）はこれらの機能を持たない。

#### 統合候補コンポーネント

- `QuestionCard`（単一質問レンダリング）は `ConversationalInterview` が `interview-widgets`（SingleSelectChips等）を使うため、コンセプトが重複している。Phase 2 で共有可否を再評価する。
- `ConversationProgress` は `InterviewProgressBar` と機能が重複している。統合時に `InterviewProgressBar` を採用する。
- `SkillCreatorResultPanel` は `SkillLifecyclePanel` の結果表示セクションに統合するか、`ConversationalInterview` の完了状態に組み込む。

---

## 補足: Session IPC のチャンネル定義元

`apps/desktop/src/preload/channels.ts` は `packages/shared/src/ipc/channels.ts` からインポートして再エクスポートしている。  
`SKILL_CREATOR_SESSION_CHANNELS` の実体は shared 側で定義されており、preload/channels.ts はそれをスプレッドで展開している。
