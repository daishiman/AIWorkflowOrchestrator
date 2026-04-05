# TASK-P0-06 Phase 12: 実装ガイド

## メタ情報

| 項目    | 内容                                   |
| ------- | -------------------------------------- |
| Phase   | 12                                     |
| Phase名 | ドキュメント更新                       |
| 作成日  | 2026-04-04                             |
| 機能名  | TASK-P0-06-conversational-interview-ui |
| Issue   | #1889                                  |

---

## 1. 変更概要

TASK-P0-06 は「会話型インタビュー UI」の既存コンポーネント拡張タスクである。P0 是正ギャップ分析で判明した 5 つの未完成課題（全 InputKind 統合フロー、IPC 接続、一時状態/永続状態の境界、進捗バー接続、APIキーガイダンス）を解消した。

### 変更ファイル一覧

| #   | ファイルパス                                                                                          | 変更種別 | 変更概要                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`                               | 拡張     | `@scope TASK-P0-06` JSDoc 追加、`syncTotalSteps` メソッド追加、`UseInterviewStateReturn` 型拡張                           |
| 2   | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                              | 拡張     | `apiKeyStatus`/`onOpenApiKeySettings` Props 追加、APIキーガイダンスバナー実装、secret undo 空文字復元、RT-05 暫定対応維持 |
| 3   | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx`                | 拡張     | `ExternalApiConfigForm` 表示、`configureApi`/`onApiConfigured` 連携、ガイダンスバナーの表示条件を更新                     |
| 4   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | 拡張     | `apiKeyStatus` の状態管理を調整                                                                                           |
| 5   | `apps/desktop/src/preload/skill-creator-session-api.ts`                                               | 拡張     | `configureApi`/`onApiConfigured` の session API を公開                                                                    |
| 6   | `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | 拡張     | APIキー設定フロー（`configureApi`）の結合テスト追加                                                                       |
| 7   | `apps/desktop/src/renderer/phase11-skill-creator-conversation-ui.tsx`                                 | 拡張     | `configureApi`/`onApiConfigured` のスタブ追加                                                                             |
| 8   | `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`                      | 拡張     | InputKind/undo/進捗のテスト強化                                                                                           |
| 9   | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx`               | 拡張     | APIキーガイダンス・undo などのテスト強化                                                                                  |

---

## 2. テスト結果

| 項目                  | 結果                   |
| --------------------- | ---------------------- |
| テスト数              | 未計測（再計測が必要） |
| TypeScript 型チェック | 未計測（再計測が必要） |
| ESLint                | 未計測（再計測が必要） |
| Line Coverage         | 未計測（再計測が必要） |
| Branch Coverage       | 未計測（再計測が必要） |
| Function Coverage     | 未計測（再計測が必要） |

---

## 3. アーキテクチャ概要

### コンポーネント階層

```
SkillCreatorConversationPanel（セッションUI）
  ├── ConversationProgress（進捗）
  ├── APIKeyGuidanceBanner（ガイダンスバナー）※条件付き表示
  ├── ExternalApiConfigForm（API設定フォーム）※条件付き表示
  └── QuestionCard（入力カード）
        ├── ChoiceButton
        └── FreeTextInput

SkillLifecyclePanel（ワークフローUI）
  └── ConversationalInterview（表示層）
        ├── InterviewProgressBar（進捗バー）
        ├── ChatMessageArea（メッセージ一覧）
        │     └── InterviewMessage（個別メッセージ）
        ├── APIKeyGuidanceBanner（ガイダンスバナー）※条件付き表示
        └── InputWidgetArea（入力ウィジェット）
              ├── SingleSelectChips
              ├── MultiSelectCheckbox
              ├── FreeTextInput
              ├── SecretInput
              └── ConfirmButtons
```

### 状態管理フロー

```
SkillCreatorConversationPanel（セッションUI）
  ├── currentRequest / currentToolCallId / questionIndex
  ├── isSubmitting / terminalState / errorMessage
  └── handleAnswer() → sendAnswer()

useInterviewState（ConversationalInterview内の一時状態 = P0-06 の責務）
  ├── messages: InterviewMessage[]      ← ページリロードまで保持
  ├── currentStepIndex: number          ← ページリロードまで保持
  ├── totalSteps: number                ← syncTotalSteps() で更新
  ├── proficiency: InterviewProficiency ← ページリロードまで保持
  └── メソッド群
        ├── addAssistantMessage()  ← 重複防止ガード付き
        ├── undo()                 ← メッセージペア削除 + step デクリメント
        ├── rollbackLastUserMessage()
        ├── buildSubmission()      ← 全 5 InputKind 対応
        ├── syncTotalSteps()       ← Math.max(0, ...) で負数防止
        └── reset()                ← 全状態初期化
```

---

## 4. InputKind 型マッピング表

| InputKind     | ウィジェットコンポーネント | 送信トリガー       | ユーザーメッセージ表示形式 | undo 復元値      |
| ------------- | -------------------------- | ------------------ | -------------------------- | ---------------- |
| single_select | SingleSelectChips          | 送信ボタン         | 選択ラベル                 | 以前の選択       |
| multi_select  | MultiSelectCheckbox        | 送信ボタン         | カンマ区切りラベル         | 以前の選択       |
| free_text     | FreeTextInput              | Enter / 送信ボタン | 入力テキスト               | 以前のテキスト   |
| secret        | SecretInput                | 送信ボタン         | ●●●●（マスク）             | 空文字（NFR-07） |
| confirm       | ConfirmButtons             | ボタンクリック即時 | はい / いいえ              | 以前の選択       |

---

## 5. IPC 接続フロー

### Renderer → Main（回答送信）

```
QuestionCard
  → SkillCreatorConversationPanel.handleAnswer()
  → window.skillCreatorSessionAPI.sendAnswer(submission)
  → [IPC: skill-creator:answer]
  → Main Process WorkflowEngine
```

### Main → Renderer（質問配信）

```
Main Process WorkflowEngine
  → [IPC: skill-creator:question-received]
  → SkillCreatorConversationPanel.onQuestion()
  → mapQuestionToRequest()
  → QuestionCard（再レンダリング）
```

### APIキーガイダンスフロー

```
Main Process
  → [IPC: skill-creator:external-api-config-required]
  → SkillCreatorConversationPanel: setApiKeyStatus("not_set") + setIsApiConfigOpen(true)
  → ガイダンスバナー/ExternalApiConfigForm 表示
  → ExternalApiConfigForm: 送信 → configureApi()
  → [IPC: skill-creator:configure-api]
  → Main Process: RT-04 側で画面遷移または検証処理
  → [IPC: skill-creator:api-configured]
  → SkillCreatorConversationPanel: setApiKeyStatus("configured")
  → ガイダンスバナー非表示 + フォームクローズ
```

---

## 6. P0-06/P0-08 責務境界

| 境界項目     | P0-06（本タスク）                   | P0-08（セッション復元）      |
| ------------ | ----------------------------------- | ---------------------------- |
| 状態保持期間 | ページリロードまで（揮発性）        | アプリ再起動をまたぐ（永続） |
| 保存先       | React state（メモリ）               | SQLite / localStorage        |
| secret 値    | メモリ上のみ。undo 時は空文字で復元 | 永続化禁止                   |
| 境界マーカー | `@scope TASK-P0-06` JSDoc           | P0-08 で追加予定             |

---

## 7. 注意事項

### RT-05 暫定対応

`ConversationalInterview.tsx` 内の `multi_select` 処理で以下のフォールバックを使用している:

```typescript
// TODO(RT-05): RT-05完了後に selectedOptionIds canonical化
const restoredIds = answer.selectedOptionIds ?? answer.selectedValues;
```

RT-05（SDK Message Contract Normalization）完了後に、`selectedOptionIds` を canonical な値として使用するよう更新が必要。

### RT-04 暫定対応

`SkillCreatorConversationPanel` は `window.skillCreatorSessionAPI.configureApi()` と `onApiConfigured` に接続済み。RT-04（APIキー管理 UI）の画面遷移や検証 UI は RT-04 側の実装/統合環境で確認が必要。

## 8. スクリーンショット参照

ローカルの Phase 11 ハーネスで以下の 14 枚のスクリーンショットを取得済み:

- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s01-initial-display.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s02-single-select-selected.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s02b-single-select-submitted.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s03-multi-select-checked.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s03b-multi-select-submitted.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s04-free-text-typing.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s05-secret-masked.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s06-confirm-buttons.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s07-undo-restored.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s08-api-key-guidance-banner.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s09-validation-error.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s10-progress-bar.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s11a-beginner-mode.png`
- `docs/30-workflows/TASK-P0-06-conversational-interview-ui/outputs/phase-11/screenshots/s11b-engineer-mode.png`

補足:

- これらは Electron 実機ではなく、Phase 11 用のローカル検証ハーネスで生成した
- 実機 UI の最終確認は Electron 起動環境での再確認を前提とする

---

## 9. 中学生レベル概念説明

### 会話型インタビュー UI とは

チャットアプリのように、AI が質問をしてきて、それに答えていく画面のことです。LINE や Discord のメッセージのように、AI の質問が左側に、自分の回答が右側に表示されます。

### InputKind とは

質問の種類ごとに、回答の仕方が変わります。例えば:

- **single_select**: 1 つだけ選ぶ（好きな色は？→ 赤・青・緑から 1 つ選ぶ）
- **multi_select**: 複数選べる（好きな食べ物は？→ ラーメン・カレー・寿司から好きなだけ選ぶ）
- **free_text**: 自由に文字を打つ（名前は？→ 自分で入力する）
- **secret**: パスワードのように隠して入力する（API キーは？→ ●●●● と表示される）
- **confirm**: はい/いいえで答える（この設定でいいですか？→ はい or いいえ）

### IPC とは

画面（見える部分）とアプリの裏側（見えない部分）が手紙をやり取りする仕組みです。画面で「送信」ボタンを押すと、裏側に「この回答を処理してね」という手紙が届き、裏側が処理を終えると「次の質問だよ」という手紙が画面に届きます。

### undo とは

前の質問に戻ってやり直せる機能です。間違った回答をしてしまったとき、「← 戻る」ボタンを押すと、1 つ前の質問に戻り、もう一度回答し直せます。パスワード（secret）の場合だけは、セキュリティのために前の値は表示されず、空っぽの状態で戻ります。

### バリデーションとは

入力内容が正しいかチェックする仕組みです。例えば、何も入力せずに送信ボタンを押すと、「入力してください」というエラーメッセージが表示されて、送信できないようになっています。
