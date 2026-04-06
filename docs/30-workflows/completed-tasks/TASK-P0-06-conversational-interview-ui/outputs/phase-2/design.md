# TASK-P0-06 Phase 2: 設計書 - 会話型インタビュー UI

## メタ情報

| 項目      | 内容                                   |
| --------- | -------------------------------------- |
| Phase     | 2                                      |
| Phase名   | 設計                                   |
| 前提Phase | Phase 1（要件定義）                    |
| 後続Phase | Phase 3（設計レビューゲート）          |
| 作成日    | 2026-04-04                             |
| 機能名    | TASK-P0-06-conversational-interview-ui |

---

## 1. 設計方針

Phase 1で定義した機能要件（FR-01〜FR-09）・非機能要件（NFR-01〜NFR-09）に基づき、既存コンポーネントの拡張設計を行う。本タスクは新規ファイル作成ではなく、既存実装の**拡張・接続・境界明確化**が中心であるため、変更箇所を最小限に抑える。

設計の焦点は以下の3つのconcernに絞る:

1. **エンドツーエンドフロー接続**（FR-01, FR-02）: Session API <-> ConversationalInterview の完全接続
2. **状態境界の明確化**（FR-03）: P0-06一時状態とP0-08永続状態の分離
3. **UIガイダンス拡張**（FR-04, FR-05）: 進捗表示接続 + APIキーガイダンス

---

## 2. コンポーネント階層図

```
SkillCreatorConversationPanel (Organism / Bridge層)
├── 責務: Session API <-> ConversationalInterview の型変換・IPC接続
├── 入力: UserInputQuestion (Session Bridge型)
├── 出力: UserInputAnswer (Session Bridge型)
│
└── ConversationalInterview (Organism / Presentation層)
    ├── 責務: 会話UIの描画・入力管理・型変換（内部型 <-> IPC型）
    ├── Props: workflowSnapshot相当のデータ + コールバック
    │
    ├── InterviewProgressBar (Atom)
    │   └── 責務: 進捗バー表示（current/total）
    │
    ├── Chat Message Area (Molecule)
    │   └── 責務: メッセージ履歴表示 + 自動スクロール
    │
    └── renderInputWidget() → Interview Widgets (Molecule)
        ├── SingleSelectChips — チップ選択UI
        ├── MultiSelectCheckbox — チェックボックス選択UI
        ├── FreeTextInput — テキスト入力UI
        ├── SecretInput — パスワード入力UI
        └── ConfirmButtons — はい/いいえボタンUI
```

---

## 3. 型変換の局所化設計

型変換はすべて `SkillCreatorConversationPanel`（ブリッジ層）に局所化する。`ConversationalInterview` は `SkillCreatorUserInputRequest` を受け取り `SkillCreatorUserInputSubmission` を返す純粋なPresentation層として維持する。

```
[Session API]                    [ConversationalInterview]
UserInputQuestion ──┐
                    │  SkillCreatorConversationPanel
                    ├─ mapToRequest() ──→ SkillCreatorUserInputRequest
                    │                            │
                    │                    addAssistantMessage()
                    │                            │
                    │                            v
                    │                    InterviewMessage (内部型)
                    │                            │
                    │                     user answers
                    │                            │
                    │                    InterviewUserAnswer (内部型)
                    │                            │
                    │                    buildSubmission()
                    │                            │
                    ├─ mapToAnswer() <── SkillCreatorUserInputSubmission
                    │
UserInputAnswer  <──┘
```

**設計判断**: `ConversationalInterview` は Session Bridge型を直接扱わず、内部型（`SkillCreatorUserInputRequest` / `InterviewMessage` / `InterviewUserAnswer`）のみで動作する。これにより、Session APIの仕様変更がPresentation層に波及しない。

---

## 4. IPC接続フロー（セッションベースPush型）

### フロー全体像

```
[WorkflowEngine (main)]
    │
    ├──push──→ skill-creator:question-received ──→ [SkillCreatorConversationPanel]
    │                                                      │
    │                                               mapToRequest()
    │                                                      │
    │                                               pendingRequest更新
    │                                                      │
    │                                               ConversationalInterview
    │                                               addAssistantMessage()
    │                                                      │
    │                                               [ユーザー回答入力]
    │                                                      │
    │                                               buildSubmission()
    │                                                      │
    │                                               mapToAnswer()
    │                                                      │
    ├──recv──← skill-creator:answer <──────────────────────┘
    │
    ├──push──→ skill-creator:question-received ──→ [次の質問...]
    │
    └──push──→ skill-creator:session-complete ──→ [セッション終了処理]
```

### 使用IPCチャンネル一覧（全て既存、新規追加なし）

| チャンネル                                   | 方向          | 用途               | 既存/新規 |
| -------------------------------------------- | ------------- | ------------------ | --------- |
| `skill-creator:start-session`                | renderer→main | セッション開始     | 既存      |
| `skill-creator:question-received`            | main→renderer | 質問配信（Push型） | 既存      |
| `skill-creator:answer`                       | renderer→main | 回答送信           | 既存      |
| `skill-creator:session-complete`             | main→renderer | セッション完了通知 | 既存      |
| `skill-creator:session-error`                | main→renderer | エラー通知         | 既存      |
| `skill-creator:external-api-config-required` | main→renderer | APIキー設定要求    | 既存      |

**設計判断**: Issue #1889で言及されている `workflowSnapshot` ベースのPull型ではなく、既に実装されているPush型（`question-received`）を活用する。既存のセッションベースIPCチャンネルで全要件を満たせるため、新規チャンネルの追加は不要。

---

## 5. 各InputKindのフロー仕様テーブル

| InputKind       | 送信トリガー                  | バリデーション                  | undo時の復元                 | submission構築                          |
| --------------- | ----------------------------- | ------------------------------- | ---------------------------- | --------------------------------------- |
| `single_select` | 選択 + 送信ボタン             | `selectedOptionId` が非null     | 選択状態を復元               | `{ selectedOptionId }`                  |
| `multi_select`  | チェックボックス + 送信ボタン | `selectedOptionIds.length >= 1` | 選択状態を復元               | `{ selectedOptionIds, selectedValues }` |
| `free_text`     | Enter / 送信ボタン            | `textAnswer.trim() !== ""`      | テキスト内容を復元           | `{ textValue }`                         |
| `secret`        | 送信ボタン（Enter無効化推奨） | `secretAnswer.trim() !== ""`    | 空文字で復元（セキュリティ） | `{ secretValue }`                       |
| `confirm`       | はい/いいえボタン（即時送信） | N/A（ボタン押下で確定）         | 選択状態を復元               | `{ confirmed }`                         |

---

## 6. P0-06/P0-08 状態境界トポロジー

```
[Renderer Process — P0-06の領域（揮発性）]
┌─────────────────────────────────────────────┐
│ useInterviewState()                          │
│ ├── messages: InterviewMessage[]             │
│ ├── proficiency: InterviewProficiency        │
│ ├── currentStepIndex: number                 │
│ ├── totalSteps: number                       │
│ └── canUndo: boolean                         │
│                                              │
│ ConversationalInterview (useState)           │
│ ├── selectedOptionId: string | null          │
│ ├── selectedOptionIds: string[]              │
│ ├── textAnswer: string                       │
│ ├── secretAnswer: string                     │
│ ├── confirmAnswer: boolean | null            │
│ ├── validationError: string | null           │
│ └── isSubmitting: boolean                    │
└─────────────────────────────────────────────┘
          ^ 読み取りのみ（書き込み禁止）
          │
┌─────────────────────────────────────────────┐
│ [Main Process — P0-08の領域（永続性）]       │
│ ├── SkillCreatorPersistedWorkflowCheckpoint  │
│ ├── SQLite session store                     │
│ ├── checkpointId / revision / lease          │
│ └── resume token                             │
└─────────────────────────────────────────────┘
```

### 境界コメント設計

`useInterviewState.ts` のファイル先頭に以下のJSDocコメントを追加する:

```typescript
/**
 * @scope TASK-P0-06: レンダラー内の一時状態のみを管理する。
 * アプリ再起動をまたぐセッション復元はTASK-P0-08（SkillCreatorPersistedWorkflowCheckpoint）が担う。
 * このフックへの永続化ロジック（localStorage / SQLite / IPC経由の保存）の追加は禁止。
 */
```

### 状態の初期化タイミング

| トリガー                              | アクション              | 対象状態                               |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| セッション終了（`session-complete`）  | `reset()`               | messages, currentStepIndex, totalSteps |
| 新しい質問受信（`question-received`） | `resetInputValues()`    | selectedOptionId, textAnswer等の入力値 |
| undo操作                              | `restoreAnswerInputs()` | 直前の回答値を復元                     |
| セッションエラー（`session-error`）   | エラー表示 + 入力値保持 | validationErrorのみ更新                |

---

## 7. 進捗表示接続設計（FR-04: syncTotalSteps）

**現状**: `InterviewProgressBar` は `current` と `total` のPropsを受け取る。`useInterviewState` が `currentStepIndex` と `totalSteps` を管理。

**設計**: Session APIから取得する質問情報に含まれるステップ番号を `useInterviewState` 経由で `InterviewProgressBar` へ伝播する。

```
[Session API] → question.stepIndex / question.totalSteps
    v
[SkillCreatorConversationPanel] → interview.syncTotalSteps(totalSteps)
    v
[useInterviewState] → currentStepIndex / totalSteps 更新
    v
[InterviewProgressBar] → current={currentStepIndex} total={totalSteps}
```

**変更箇所**:

- `useInterviewState.ts`: `syncTotalSteps(estimatedSteps: number)` メソッドの追加（存在しない場合）
- `SkillCreatorConversationPanel.tsx`: Session APIから取得したステップ情報を `syncTotalSteps` へ渡すロジック追加

---

## 8. APIキーガイダンス設計（FR-05）

### トリガー条件

`pendingRequest.kind === "secret"` かつ APIキーが未設定

### UIレイアウト

```
┌─────────────────────────────────────────────┐
│ [!] 外部APIキーが設定されていません           │
│                                              │
│ [外部API設定を開く]                           │
└─────────────────────────────────────────────┘
```

### Props拡張

```typescript
interface ConversationalInterviewProps {
  // 既存Props（変更なし）
  // ...

  // RT-04連携用（TASK-P0-06追加）
  apiKeyStatus?: "configured" | "not_set" | "unknown";
  onOpenApiKeySettings?: () => void;
}
```

### 表示条件

- ガイダンスバナー表示: `pendingRequest?.kind === "secret" && apiKeyStatus === "not_set"`
- `data-testid="api-key-guidance-banner"` を付与

### IPC連携フロー（APIキー設定）

```
[WorkflowEngine] → skill-creator:external-api-config-required → [ガイダンスバナー表示]
                                                                        │
                                                              ユーザーが「外部API設定を開く」クリック
                                                                        │
                                                              skill-creator:configure-api → [設定画面遷移]
                                                                        │
                                                              ユーザーがAPIキー設定完了
                                                                        │
[WorkflowEngine] <- skill-creator:api-configured <──────────────────────┘
```

---

## 9. data-testid一覧

| data-testid                | コンポーネント            | 目的                         |
| -------------------------- | ------------------------- | ---------------------------- |
| `conversational-interview` | `ConversationalInterview` | ルートコンテナ               |
| `interview-chat-area`      | Chat Message Area         | チャットメッセージ表示エリア |
| `interview-input-area`     | Input Widget Area         | 入力ウィジェットエリア       |
| `interview-submit`         | 送信ボタン                | 送信アクション               |
| `interview-undo`           | undoボタン                | undo操作                     |
| `validation-error`         | バリデーションエラー      | エラー表示（`role="alert"`） |
| `api-key-guidance-banner`  | APIキーガイダンス         | APIキー未設定時バナー        |
| `interview-progress-bar`   | `InterviewProgressBar`    | 進捗バー                     |
| `interview-message-{id}`   | 各メッセージ              | 個別メッセージ要素           |

---

## 10. 変更対象ファイル一覧

### 変更対象

| ファイル                                                                                | 変更種別 | 変更概要                                                                                  |
| --------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`                 | 拡張     | P0-06/P0-08境界コメント追加、`syncTotalSteps` メソッド追加（必要な場合）                  |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                | 拡張     | `apiKeyStatus`/`onOpenApiKeySettings` Props追加、ガイダンスバナー追加、`data-testid` 追加 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`  | 拡張     | APIキー状態取得の接続、進捗情報の接続                                                     |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | 更新     | 新規Props・ガイダンスバナー・バリデーションのテスト追加                                   |
| `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`        | 更新     | 境界コメント確認・syncTotalStepsテスト追加                                                |

### 変更しないファイル（参照のみ）

| ファイル                                                              | 理由                                                      |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | 型定義は既に完備。変更は型のcanonical性を崩すリスクがある |
| `packages/shared/src/ipc/channels.ts`                                 | IPCチャンネルは既に定義済み。新規追加不要                 |
| `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx` | Props変更なし。接続は親コンポーネントで行う               |
| `apps/desktop/src/renderer/components/skill/interview-widgets/*`      | 各ウィジェットは完成済み。変更不要                        |
