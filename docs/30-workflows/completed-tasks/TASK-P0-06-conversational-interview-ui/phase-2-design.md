# Phase 2: 設計 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1（要件定義）                    |
| 後続Phase  | Phase 3（設計レビューゲート）          |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |

---

## 目的

Phase 1で定義した機能要件（FR-01〜FR-09）・非機能要件（NFR-01〜NFR-09）に基づき、既存コンポーネントの拡張設計を行う。本タスクは新規ファイル作成ではなく、既存実装の**拡張・接続・境界明確化**が中心であるため、変更箇所を最小限に抑えた設計を行う。

## 背景

P50チェック（Phase 1）の結果、コアコンポーネントは全て実装済みであることが確認された。設計の焦点は以下の3つのconcernに絞られる：

1. **エンドツーエンドフロー接続**（FR-01, FR-02）: Session API↔ConversationalInterviewの完全接続
2. **状態境界の明確化**（FR-03）: P0-06一時状態とP0-08永続状態の分離
3. **UIガイダンス拡張**（FR-04, FR-05）: 進捗表示接続 + APIキーガイダンス

---

## 実行タスク

### タスク1: アーキテクチャ設計 — コンポーネント階層と責務分離

**目的**: 既存コンポーネント階層を整理し、各コンポーネントの責務を明確化する。

#### コンポーネント階層図

```
SkillCreatorConversationPanel (Organism / Bridge層)
├── 責務: Session API ↔ ConversationalInterview の型変換・IPC接続
├── 入力: UserInputQuestion (Session Bridge型)
├── 出力: UserInputAnswer (Session Bridge型)
│
└── ConversationalInterview (Organism / Presentation層)
    ├── 責務: 会話UIの描画・入力管理・型変換（内部型↔IPC型）
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

#### 型変換の局所化設計

```
[Session API]                    [ConversationalInterview]
UserInputQuestion ──┐
                    │  SkillCreatorConversationPanel
                    ├─ mapToRequest() ──→ SkillCreatorUserInputRequest
                    │                            │
                    │                    addAssistantMessage()
                    │                            │
                    │                            ↓
                    │                    InterviewMessage (内部型)
                    │                            │
                    │                     user answers
                    │                            │
                    │                    InterviewUserAnswer (内部型)
                    │                            │
                    │                    buildSubmission()
                    │                            │
                    ├─ mapToAnswer() ←── SkillCreatorUserInputSubmission
                    │
UserInputAnswer  ←──┘
```

**設計判断**: 型変換はすべて `SkillCreatorConversationPanel`（ブリッジ層）に局所化する。`ConversationalInterview` は `SkillCreatorUserInputRequest` を受け取り `SkillCreatorUserInputSubmission` を返す純粋なPresentation層として維持する。

---

### タスク2: Concern別設計 — エンドツーエンドフロー接続（FR-01, FR-02）

**目的**: Session APIとConversationalInterviewのエンドツーエンド接続を設計する。

#### IPC接続フロー

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
    ├──recv──← skill-creator:answer ←──────────────────────┘
    │
    ├──push──→ skill-creator:question-received ──→ [次の質問...]
    │
    └──push──→ skill-creator:session-complete ──→ [セッション終了処理]
```

#### 既存IPCチャンネルの活用（新規チャンネル追加なし）

| チャンネル                                   | 方向          | 用途               | 既存/新規 |
| -------------------------------------------- | ------------- | ------------------ | --------- |
| `skill-creator:start-session`                | renderer→main | セッション開始     | 既存      |
| `skill-creator:question-received`            | main→renderer | 質問配信（Push型） | 既存      |
| `skill-creator:answer`                       | renderer→main | 回答送信           | 既存      |
| `skill-creator:session-complete`             | main→renderer | セッション完了通知 | 既存      |
| `skill-creator:session-error`                | main→renderer | エラー通知         | 既存      |
| `skill-creator:external-api-config-required` | main→renderer | APIキー設定要求    | 既存      |

**設計判断**: 既存のセッションベースIPCチャンネルで全要件を満たせるため、新規チャンネルの追加は不要。Issue #1889で言及されている `workflowSnapshot` ベースのPull型ではなく、既に実装されているPush型（`question-received`）を活用する。

#### 各InputKindのフロー仕様

| InputKind       | 送信トリガー                  | バリデーション                  | undo時の復元                 | submission構築                          |
| --------------- | ----------------------------- | ------------------------------- | ---------------------------- | --------------------------------------- |
| `single_select` | 選択 + 送信ボタン             | `selectedOptionId` が非null     | 選択状態を復元               | `{ selectedOptionId }`                  |
| `multi_select`  | チェックボックス + 送信ボタン | `selectedOptionIds.length >= 1` | 選択状態を復元               | `{ selectedOptionIds, selectedValues }` |
| `free_text`     | Enter / 送信ボタン            | `textAnswer.trim() !== ""`      | テキスト内容を復元           | `{ textValue }`                         |
| `secret`        | 送信ボタン（Enter無効化推奨） | `secretAnswer.trim() !== ""`    | 空文字で復元（セキュリティ） | `{ secretValue }`                       |
| `confirm`       | はい/いいえボタン（即時送信） | N/A（ボタン押下で確定）         | 選択状態を復元               | `{ confirmed }`                         |

---

### タスク3: Concern別設計 — 状態境界の明確化（FR-03）

**目的**: P0-06一時状態とP0-08永続状態の実装レベルでの分離を設計する。

#### 状態管理トポロジー

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
          ↑ 読み取りのみ（書き込み禁止）
          │
┌─────────────────────────────────────────────┐
│ [Main Process — P0-08の領域（永続性）]       │
│ ├── SkillCreatorPersistedWorkflowCheckpoint  │
│ ├── SQLite session store                     │
│ ├── checkpointId / revision / lease          │
│ └── resume token                             │
└─────────────────────────────────────────────┘
```

#### 境界コメント設計

`useInterviewState.ts` のファイル先頭に以下のJSDocコメントを追加する：

```typescript
/**
 * @scope TASK-P0-06: レンダラー内の一時状態のみを管理する。
 * アプリ再起動をまたぐセッション復元はTASK-P0-08（SkillCreatorPersistedWorkflowCheckpoint）が担う。
 * このフックへの永続化ロジック（localStorage / SQLite / IPC経由の保存）の追加は禁止。
 */
```

#### 状態の初期化タイミング

| トリガー                              | アクション              | 対象状態                               |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| セッション終了（`session-complete`）  | `reset()`               | messages, currentStepIndex, totalSteps |
| 新しい質問受信（`question-received`） | `resetInputValues()`    | selectedOptionId, textAnswer等の入力値 |
| undo操作                              | `restoreAnswerInputs()` | 直前の回答値を復元                     |
| セッションエラー（`session-error`）   | エラー表示 + 入力値保持 | validationErrorのみ更新                |

---

### タスク4: Concern別設計 — UIガイダンス拡張（FR-04, FR-05）

**目的**: インタビュー進捗表示とAPIキーガイダンスの設計を行う。

#### 進捗表示の接続設計（FR-04）

**現状**: `InterviewProgressBar` は `current` と `total` のPropsを受け取る。`useInterviewState` が `currentStepIndex` と `totalSteps` を管理。

**設計**: Session APIから取得する質問情報に含まれるステップ番号を `useInterviewState` 経由で `InterviewProgressBar` へ伝播する。

```
[Session API] → question.stepIndex / question.totalSteps
    ↓
[SkillCreatorConversationPanel] → interview.syncTotalSteps(totalSteps)
    ↓
[useInterviewState] → currentStepIndex / totalSteps 更新
    ↓
[InterviewProgressBar] → current={currentStepIndex} total={totalSteps}
```

**変更箇所**:

- `useInterviewState.ts`: `syncTotalSteps(estimatedSteps: number)` メソッドの追加（存在しない場合）
- `SkillCreatorConversationPanel.tsx`: Session APIから取得したステップ情報を `syncTotalSteps` へ渡すロジック追加

#### APIキーガイダンス設計（FR-05）

**トリガー条件**: `pendingRequest.kind === "secret"` かつ APIキーが未設定

**UIレイアウト**:

```
┌─────────────────────────────────────────────┐
│ [!] 外部APIキーが設定されていません           │
│                                              │
│ [外部API設定を開く]                           │
└─────────────────────────────────────────────┘
```

**実装方針**:

1. `ConversationalInterview` の Props に以下を追加：

```typescript
interface ConversationalInterviewProps {
  // 既存Props（変更なし）
  // ...

  // RT-04連携用（TASK-P0-06追加）
  apiKeyStatus?: "configured" | "not_set" | "unknown";
  onOpenApiKeySettings?: () => void;
}
```

2. APIキー状態の取得はIPCチャンネル `skill-creator:external-api-config-required` の受信をトリガーとする
3. ガイダンスバナーの表示条件: `pendingRequest?.kind === "secret" && apiKeyStatus === "not_set"`
4. `data-testid="api-key-guidance-banner"` を付与

**IPC連携フロー（APIキー設定）**:

```
[WorkflowEngine] → skill-creator:external-api-config-required → [ガイダンスバナー表示]
                                                                        │
                                                              ユーザーが「外部API設定を開く」クリック
                                                                        │
                                                              skill-creator:configure-api → [設定画面遷移]
                                                                        │
                                                              ユーザーがAPIキー設定完了
                                                                        │
[WorkflowEngine] ← skill-creator:api-configured ←──────────────────────┘
```

---

### タスク5: data-testid 一覧

**目的**: テスタビリティ確保のために必要な `data-testid` 属性の一覧を定義する。

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

### タスク6: 変更対象ファイル一覧と変更概要

**目的**: 実装Phase（Phase 5）での変更スコープを明確化する。

| ファイル                                                                                | 変更種別 | 変更概要                                                                                  |
| --------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`                 | 拡張     | P0-06/P0-08境界コメント追加、`syncTotalSteps` メソッド追加（必要な場合）                  |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                | 拡張     | `apiKeyStatus`/`onOpenApiKeySettings` Props追加、ガイダンスバナー追加、`data-testid` 追加 |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`  | 拡張     | APIキー状態取得の接続、進捗情報の接続                                                     |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | 更新     | 新規Props・ガイダンスバナー・バリデーションのテスト追加                                   |
| `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`        | 更新     | 境界コメント確認・syncTotalStepsテスト追加                                                |

**変更しないファイル（参照のみ）**:

| ファイル                                                              | 理由                                                      |
| --------------------------------------------------------------------- | --------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | 型定義は既に完備。変更は型のcanonical性を崩すリスクがある |
| `packages/shared/src/ipc/channels.ts`                                 | IPCチャンネルは既に定義済み。新規追加不要                 |
| `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx` | Props変更なし。接続は親コンポーネントで行う               |
| `apps/desktop/src/renderer/components/skill/interview-widgets/*`      | 各ウィジェットは完成済み。変更不要                        |

---

## 参照資料

| 資料名                  | パス                                                                | 説明                                     |
| ----------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| Phase 1 要件定義        | `phase-1-requirements.md`                                           | FR-01〜FR-09, NFR-01〜NFR-09, AC-1〜AC-9 |
| Issue #1889             | GitHub Issue                                                        | TASK-P0-06の詳細仕様                     |
| 型定義                  | `packages/shared/src/types/skillCreator.ts`                         | InterviewMessage, UserInputKind等        |
| Session型定義           | `packages/shared/src/types/skillCreatorSession.ts`                  | Session Bridge型                         |
| IPCチャンネル定義       | `packages/shared/src/ipc/channels.ts`                               | SKILL_CREATOR_SESSION_CHANNELS           |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | 正本仕様参照                             |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映:

| 統合ポイント                          | 契約                                                 | 設計への反映                   |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------ |
| Session API → ConversationalInterview | `UserInputQuestion` → `SkillCreatorUserInputRequest` | タスク1: 型変換の局所化設計    |
| ConversationalInterview → Session API | `InterviewUserAnswer` → `UserInputAnswer`            | タスク1: 型変換の局所化設計    |
| 質問受信（Push型）                    | `skill-creator:question-received`                    | タスク2: IPC接続フロー設計     |
| APIキー設定要求                       | `skill-creator:external-api-config-required`         | タスク4: APIキーガイダンス設計 |

---

## 成果物

| 成果物 | パス                        | 説明                                                         |
| ------ | --------------------------- | ------------------------------------------------------------ |
| 設計書 | `outputs/phase-2/design.md` | 本文書（アーキテクチャ設計、Concern別設計3件、変更対象一覧） |

---

## 完了条件

- [x] コンポーネント階層と責務分離が図示されている
- [x] 型変換の局所化設計が完了している
- [x] エンドツーエンドフロー接続のIPC設計が完了している
- [x] 各InputKindのフロー仕様（送信トリガー/バリデーション/undo/submission構築）が定義されている
- [x] P0-06/P0-08状態境界の実装レベル設計が完了している
- [x] 進捗表示接続の設計が完了している
- [x] APIキーガイダンスの設計が完了している
- [x] data-testid一覧が定義されている
- [x] 変更対象ファイル一覧と変更概要が明確化されている
- [x] 新規IPCチャンネルの追加が不要であることが確認されている
- [x] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート → `phase-3-design-review.md`
