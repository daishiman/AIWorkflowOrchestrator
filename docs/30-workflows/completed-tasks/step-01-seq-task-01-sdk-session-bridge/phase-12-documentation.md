# Phase 12: ドキュメント -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                     |
| ---------- | ---------------------- |
| Phase番号  | 12                     |
| 機能名     | sdk-session-bridge     |
| タスクID   | TASK-SDK-SC-01         |
| 作成日     | 2026-04-02             |
| 依存 Phase | Phase 11（手動テスト） |

## 目的

実装した SDK Session Bridge のアーキテクチャ・IPC チャネル仕様・利用方法を記録し、後続タスクの開発者が参照できるドキュメントを作成する。

## 実行タスク

### Task 12-1: アーキテクチャ図の作成

以下のアーキテクチャ図を成果物ドキュメントに記録する:

```
┌─────────────────────────────────────────────────────────────────┐
│ Electron Renderer Process                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ UI Component                                             │   │
│  │  - startSession(request) を呼び出す                      │   │
│  │  - question-received を受信して質問UIを表示              │   │
│  │  - answer を送信する                                     │   │
│  │  - session-complete / session-error を受信する           │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ IPC (contextBridge)
┌────────────────────────────▼────────────────────────────────────┐
│ Electron Main Process                                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ SkillCreatorIpcBridge                                    │   │
│  │  - IPC ハンドラーの登録・解除                            │   │
│  │  - Renderer ↔ SdkSession のメッセージ転送               │   │
│  └───────────────────────┬──────────────────────────────────┘   │
│                          │ コールバック DI                        │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │ SkillCreatorSdkSession                                   │   │
│  │  - SDK query() の呼び出し                                │   │
│  │  - UserInput ツールコールの検出                          │   │
│  │  - 回答注入（pendingResolve）                            │   │
│  │  - タイムアウト管理（30秒）                              │   │
│  └───────────────────────┬──────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │ @anthropic-ai/claude-agent-sdk
┌────────────────────────────▼────────────────────────────────────┐
│ Claude Agent SDK                                                 │
│  - query() API                                                   │
│  - skill-creator スキル（.claude/skills/skill-creator/SKILL.md）│
└─────────────────────────────────────────────────────────────────┘
```

### Task 12-2: 新規 IPC チャネル仕様の記録

`SKILL_CREATOR_SESSION_CHANNELS` の全チャネル仕様を記録する:

#### `skill-creator:start-session`

- **方向**: Renderer → Main
- **ペイロード**: `{ request: string; sessionId?: string }` — skill-creator に渡すリクエスト文字列（`sessionId` は任意）
- **レスポンス**: `Promise<void>` — セッション開始の確認
- **呼び出し元**: UI コンポーネント（スキル作成ダイアログ等）

#### `skill-creator:question-received`

- **方向**: Main → Renderer
- **ペイロード**: `UserInputQuestion` — 質問の種別・内容・選択肢
- **トリガー**: SDK が `AskUserQuestion` ツールコール（`tool_use`）を発行したとき
- **受信側処理**: UI に質問フォームを表示する

#### `skill-creator:answer`

- **方向**: Renderer → Main
- **ペイロード**: `UserInputAnswer` — `{ toolCallId: string; value: string | string[] | boolean }`
- **トリガー**: ユーザーが質問フォームに回答したとき
- **Main 側処理**: `SkillCreatorSdkSession.sendAnswer()` を呼び出す

#### `skill-creator:session-complete`

- **方向**: Main → Renderer
- **ペイロード**: `{ result: string }` — 生成されたスキル仕様またはサマリー
- **トリガー**: SDK セッションが正常終了したとき

#### `skill-creator:session-error`

- **方向**: Main → Renderer
- **ペイロード**: `{ error: string }` — エラーメッセージ
- **トリガー**: SDK エラーまたはタイムアウト（30秒）発生時

### Task 12-3: シーケンス図の記録

Phase 2 で設計したシーケンス図をドキュメントに転記・更新する（実装との差分があれば修正する）。

### Task 12-4: 利用方法ガイドの作成

後続タスクの開発者向けに、Renderer 側から SDK Session Bridge を利用する方法を記録する:

```typescript
// Renderer 側の利用例（preload 経由）

// 1. セッション開始
await window.electronAPI.skillCreatorSession.startSession(
  "RESTful API クライアントスキルを作りたい",
);

// 2. 質問受信リスナーの登録
window.electronAPI.skillCreatorSession.onQuestion(
  (question: UserInputQuestion) => {
    // question.type に応じて UI を切り替える
    // 'single_select' → ラジオボタン
    // 'multi_select'  → チェックボックス
    // 'free_text'     → テキストフィールド
    // 'secret'        → パスワードフィールド
    // 'confirm'       → はい/いいえボタン
    renderQuestionForm(question);
  },
);

// 3. 回答送信
function onUserAnswer(toolCallId: string, value: string | string[] | boolean) {
  void window.electronAPI.skillCreatorSession.sendAnswer({ toolCallId, value });
}

// 4. 完了・エラー受信
window.electronAPI.skillCreatorSession.onComplete(
  ({ result }: { result: string }) => {
    showResult(result);
  },
);
window.electronAPI.skillCreatorSession.onError(
  ({ error }: { error: string }) => {
    showError(error);
  },
);
```

### Task 12-5: 成果物ドキュメントの作成

`outputs/phase-12/` ディレクトリに以下のファイルを作成する:

- `implementation-guide.md`: アーキテクチャ図・シーケンス図・利用方法ガイド
- `ipc-channel-spec.md`: IPC チャネル仕様（全5チャネルの詳細）

## 参照資料

| 資料名          | パス                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| Phase 2 設計    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-2-design.md` |
| IpcBridge 実装  | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`            |
| SdkSession 実装 | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`           |
| チャネル定義    | `packages/shared/src/ipc/channels.ts`                                        |

## 成果物

| 成果物                           | パス                                                                                                | 形式     |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| 実装ガイド                       | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/outputs/phase-12/implementation-guide.md` | Markdown |
| IPC チャネル仕様                 | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/outputs/phase-12/ipc-channel-spec.md`     | Markdown |
| ドキュメント Phase（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-12-documentation.md`                | Markdown |

## 完了条件

- [ ] アーキテクチャ図（Renderer / Main / SDK の3層構造）を作成した
- [ ] 新規 IPC チャネル仕様（全5チャネル）を記録した
- [ ] シーケンス図を実装との差分を反映して更新した
- [ ] Renderer 側からの利用方法ガイドを作成した
- [ ] `outputs/phase-12/implementation-guide.md` を作成した
- [ ] `outputs/phase-12/ipc-channel-spec.md` を作成した

## 次の Phase

Phase 13: 完了（`phase-13-completion.md`）
