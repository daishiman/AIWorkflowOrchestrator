# TASK-UI-02 Phase 1: コンポーネント比較マトリクス

作成日: 2026-04-06  
担当フェーズ: Phase 1（要件定義）

---

## 1. 機能比較マトリクス

### 1-1. UI機能

| UI機能                                 | SkillCreatorConversationPanel                    | ConversationalInterview                                                                             |
| -------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| チャット形式メッセージ表示（会話履歴） | なし（質問カードを1枚ずつ差し替え）              | あり（`interview.messages` をスクロール可能リストで表示）                                           |
| 自動スクロール                         | なし                                             | あり（新メッセージ追加時に最下部へ自動スクロール）                                                  |
| ユーザー回答の会話履歴への追記         | なし                                             | あり（`interview.addUserMessage()` で記録）                                                         |
| 質問レンダリング（単一選択）           | QuestionCard / ChoiceButton                      | SingleSelectChips                                                                                   |
| 質問レンダリング（複数選択）           | QuestionCard / ChoiceButton                      | MultiSelectCheckbox                                                                                 |
| 質問レンダリング（自由入力）           | QuestionCard / FreeTextInput                     | FreeTextInput（interview-widgets版）                                                                |
| 質問レンダリング（シークレット）       | QuestionCard / FreeTextInput（isSecret=true）    | SecretInput                                                                                         |
| 質問レンダリング（確認）               | QuestionCard / ChoiceButton（はい/いいえ）       | ConfirmButtons                                                                                      |
| 「その他（自由入力）」オプション追加   | あり（`FREE_TEXT_ID` 追加）                      | なし                                                                                                |
| 進捗表示                               | あり（`ConversationProgress`）                   | あり（`InterviewProgressBar`）                                                                      |
| 熟練度切替（beginner / engineer）      | なし                                             | あり（ヘッダのトグルボタン）                                                                        |
| 回答のUndoボタン                       | なし                                             | あり（`interview.undo()` / 戻るボタン）                                                             |
| バリデーションエラー表示               | なし（暗黙）                                     | あり（`validationError` stateを inline 表示）                                                       |
| 送信中インジケータ                     | あり（`isSubmitting` → disabled）                | あり（`isSubmitting` → "送信中..." テキスト）                                                       |
| 完了状態の表示                         | あり（完了メッセージ + SkillCreatorResultPanel） | なし（`workflowSnapshot` の phase 変化で親が制御）                                                  |
| エラー状態の表示                       | あり（エラーメッセージを全面表示）               | なし（`onError` コールバックで親に委譲）                                                            |
| 待機中表示（質問なし）                 | あり（「質問を待機中...」）                      | あり（「質問を待っています...」）                                                                   |
| data-testid 属性                       | なし                                             | 全主要要素に付与（`conversational-interview`, `interview-chat-area`, `interview-input-area`, etc.） |
| アクセシビリティ（role/aria）          | なし                                             | あり（`role="log"`, `aria-live="polite"`, `role="alert"` 等）                                       |
| テーマCSS変数使用                      | 一部（固定色クラス混在）                         | 徹底（全て `var(--*)` 変数使用）                                                                    |

### 1-2. IPC 依存

| IPC依存              | SkillCreatorConversationPanel                                      | ConversationalInterview                                               |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 使用IPC系統          | Session IPC（`window.skillCreatorSessionAPI`） + Output API        | Runtime IPC（props経由で `onSubmit` コールバック受取）                |
| 質問イベント取得     | `api.onQuestion()` — Push型（Main→Renderer イベント）              | `workflowSnapshot.awaitingUserInput` — Pull型（props）                |
| 回答送信             | `window.skillCreatorSessionAPI.sendAnswer(UserInputAnswer)`        | `onSubmit(SkillCreatorUserInputSubmission)` コールバック経由          |
| セッション完了検知   | `api.onComplete()` イベント                                        | props（`workflowSnapshot`）の phase 変化を親が管理                    |
| セッションエラー検知 | `api.onError()` イベント                                           | `onError` コールバックで親に委譲                                      |
| 出力完了イベント     | `onOutputReady` — 独自 `getSkillCreatorOutputApi()` ヘルパーで取得 | なし（SkillLifecyclePanel が `skillCreatorApi.onOutputReady` を管理） |
| 上書き確認           | `outputApi.confirmOverwrite()` を直接呼出                          | なし                                                                  |
| スキルを開く         | `outputApi.openSkill()` を直接呼出                                 | なし                                                                  |
| IPCチャンネル所有者  | コンポーネント自身                                                 | 親コンポーネント（SkillLifecyclePanel）が所有                         |

### 1-3. 状態管理

| 状態                 | SkillCreatorConversationPanel                                | ConversationalInterview                                                             |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 状態管理方式         | `useReducer`（Action/State型定義）                           | `useState` 複数 + `useInterviewState` カスタムフック                                |
| 現在の質問リクエスト | `state.currentRequest: SkillCreatorUserInputRequest \| null` | `pendingRequest`（`restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput`） |
| 質問インデックス     | `state.questionIndex: number`                                | `interview.currentStepIndex`（useInterviewState内）                                 |
| 送信中フラグ         | `state.isSubmitting: boolean`                                | `isSubmitting: boolean`（useState）                                                 |
| ターミナル状態       | `state.terminalState: "idle" \| "complete" \| "error"`       | なし（親が管理）                                                                    |
| エラーメッセージ     | `state.errorMessage: string \| null`                         | `validationError: string \| null`（バリデーションのみ）                             |
| 会話履歴             | なし                                                         | `interview.messages: InterviewMessage[]`（useInterviewState）                       |
| 熟練度               | なし                                                         | `interview.proficiency: "beginner" \| "engineer"`                                   |
| undo履歴             | なし                                                         | `interview.canUndo`, `interview.undo()`                                             |
| 選択値（単一選択）   | QuestionCard内（ステートレス）                               | `selectedOptionId: string \| null`                                                  |
| 選択値（複数選択）   | QuestionCard内 `selectedOptionIds: string[]`                 | `selectedOptionIds: string[]`                                                       |
| テキスト入力値       | QuestionCard/FreeTextInput内（ステートレス）                 | `textAnswer: string`, `secretAnswer: string`                                        |
| 確認回答             | QuestionCard内（ステートレス）                               | `confirmAnswer: boolean \| null`                                                    |
| スキル出力ペイロード | `outputPayload: SkillOutputReadyPayload \| null`             | なし                                                                                |

### 1-4. コンポーネント構成

| コンポーネント                   | SkillCreatorConversationPanel                      | ConversationalInterview                                          |
| -------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| 自身のファイル                   | `skill-creator/SkillCreatorConversationPanel.tsx`  | `skill/ConversationalInterview.tsx`                              |
| 質問入力ウィジェット             | `QuestionCard`（種別switch含む複合コンポーネント） | `renderInputWidget()`（関数でswitch分岐、interview-widgets使用） |
| 単一選択                         | `ChoiceButton`（即時送信）                         | `SingleSelectChips`（選択後に送信ボタンを別途押す）              |
| 複数選択                         | `ChoiceButton` + 送信ボタン                        | `MultiSelectCheckbox` + 送信ボタン                               |
| 自由入力                         | `FreeTextInput`（skill-creator版）                 | `FreeTextInput`（interview-widgets版）                           |
| シークレット入力                 | `FreeTextInput`（isSecret=true）                   | `SecretInput`                                                    |
| 確認                             | `ChoiceButton`×2（はい/いいえ）                    | `ConfirmButtons`                                                 |
| 進捗バー                         | `ConversationProgress`                             | `InterviewProgressBar`                                           |
| 結果表示                         | `SkillCreatorResultPanel`                          | なし                                                             |
| カスタムフック                   | なし                                               | `useInterviewState`（会話履歴・undo管理）                        |
| 子コンポーネント保有ディレクトリ | `components/skill-creator/`                        | `components/skill/`（interview-widgets/ サブディレクトリ）       |

### 1-5. Props / API

| 項目            | SkillCreatorConversationPanel                                                                                     | ConversationalInterview                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Props型名       | `SkillCreatorConversationPanelProps`                                                                              | `ConversationalInterviewProps`                                                                        |
| 必須props       | なし                                                                                                              | `workflowSnapshot: SkillCreatorWorkflowUiSnapshot \| null`, `onSubmit: (submission) => Promise<void>` |
| オプションprops | `onComplete?: () => void`, `onError?: (message: string) => void`                                                  | `onError?: (message: string) => void`, `disabled?: boolean`                                           |
| IPC接続         | コンポーネント内で直接 `window.skillCreatorSessionAPI` 参照                                                       | なし（props経由）                                                                                     |
| 外部API状態     | `getSkillCreatorOutputApi()` ヘルパーで `window.electronAPI?.skillCreator` または `window.skillCreatorAPI` を取得 | なし                                                                                                  |

---

## 2. 重複・固有・欠損機能の分類

### 2-1. 重複機能（両方にある）

| 機能                    | 備考                                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- |
| 単一選択入力            | 実装方式が異なる（ChoiceButton vs SingleSelectChips）。統合時にどちらかに統一が必要 |
| 複数選択入力            | 同上                                                                                |
| 自由テキスト入力        | 同名の `FreeTextInput` が異なるディレクトリに存在                                   |
| シークレット入力        | `FreeTextInput(isSecret=true)` vs `SecretInput`（独立コンポーネント）               |
| 確認（はい/いいえ）入力 | `ChoiceButton×2` vs `ConfirmButtons`                                                |
| 進捗表示                | `ConversationProgress` vs `InterviewProgressBar`                                    |
| 送信中状態のUI無効化    | 両方に `isSubmitting` フラグを持つ                                                  |
| 待機中表示              | テキストが異なるが同じ意図                                                          |
| エラーコールバック      | `onError?: (message: string) => void`                                               |

### 2-2. SkillCreatorConversationPanel の固有機能

| 機能                             | 説明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| 「その他（自由入力）」オプション | 選択肢にフリーテキストエントリを動的追加（`FREE_TEXT_ID`）   |
| SkillCreatorResultPanel の表示   | セッション完了後にスキル出力のプレビューと上書き確認UIを表示 |
| 完了状態の自己管理               | `terminalState: "complete"` を自身で保持し完了UIを表示       |
| エラー状態の全面表示             | `terminalState: "error"` 時に画面全体をエラー表示に切り替え  |
| 出力API直接呼出し                | `confirmOverwrite()`, `openSkill()` を直接呼び出す           |

### 2-3. ConversationalInterview の固有機能

| 機能                             | 説明                                                             |
| -------------------------------- | ---------------------------------------------------------------- |
| 会話履歴表示                     | 過去のQ&Aをチャット形式でスクロール可能なリストに蓄積表示        |
| Undoボタン                       | 直前の回答を取り消して再回答可能                                 |
| 熟練度切替                       | beginner/engineer モードでヒント表示を切替                       |
| バリデーション                   | 回答送信前に空値チェックを行い、エラーメッセージをインライン表示 |
| data-testid/アクセシビリティ属性 | テスト・スクリーンリーダー対応が徹底                             |
| スナップショット復元対応         | `restoredPendingRequest` による Undo 後の入力値復元              |
| テーマCSS変数の完全対応          | ダーク/ライトモード対応                                          |

### 2-4. 欠損機能（どちらにもない、または不完全）

| 機能                             | 現状                                 | 統合後の要件                                                               |
| -------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- |
| 完了後のSkill結果表示            | `SkillCreatorConversationPanel` のみ | 統合後は `SkillLifecyclePanel` 側で担当（既存の結果表示エリアに委譲）      |
| セッション完了/エラーの自己表示  | `SkillCreatorConversationPanel` のみ | 統合後は親（SkillLifecyclePanel）が `workflowSnapshot.currentPhase` で判断 |
| 「その他（自由入力）」オプション | `SkillCreatorConversationPanel` のみ | `ConversationalInterview` へ移植するか要否判断が必要                       |

---

## 3. QuestionCard等の共有可能コンポーネントの洗い出し

### 3-1. コンポーネント別の共有可否判定

| コンポーネント                     | 現所在                     | 対応コンポーネント（別側）                 | 共有判定       | 推奨アクション                                                                                             |
| ---------------------------------- | -------------------------- | ------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `QuestionCard`                     | `skill-creator/`           | `renderInputWidget()`（インライン関数）    | 部分共有可     | `renderInputWidget` の構造に寄せて廃止を検討。ただし「その他」オプション機能は移植検討                     |
| `ChoiceButton`                     | `skill-creator/`           | `SingleSelectChips`, `MultiSelectCheckbox` | 代替候補あり   | `SingleSelectChips`/`MultiSelectCheckbox` に統一。`ChoiceButton` は廃止候補                                |
| `FreeTextInput`（skill-creator版） | `skill-creator/`           | `FreeTextInput`（interview-widgets版）     | 名前衝突       | interview-widgets版を正本とし、skill-creator版は廃止。API差分（`onSubmit` vs `onChange+onSubmit`）は要確認 |
| `ConversationProgress`             | `skill-creator/`           | `InterviewProgressBar`                     | 代替候補あり   | `InterviewProgressBar` を正本として採用。`ConversationProgress` は廃止候補                                 |
| `SkillCreatorResultPanel`          | `skill-creator/`           | なし                                       | 固有           | `SkillLifecyclePanel` に移植するか、独立コンポーネントとして保持                                           |
| `SingleSelectChips`                | `skill/interview-widgets/` | `ChoiceButton`（即時送信版）               | 採用候補       | `ConversationalInterview` の標準部品として維持                                                             |
| `MultiSelectCheckbox`              | `skill/interview-widgets/` | `ChoiceButton`（複数選択版）               | 採用候補       | 同上                                                                                                       |
| `SecretInput`                      | `skill/interview-widgets/` | `FreeTextInput`（isSecret=true）           | 採用候補       | 独立コンポーネントとして維持                                                                               |
| `ConfirmButtons`                   | `skill/interview-widgets/` | `ChoiceButton`×2                           | 採用候補       | 独立コンポーネントとして維持                                                                               |
| `InterviewProgressBar`             | `skill/`                   | `ConversationProgress`                     | 採用候補       | 正本として維持                                                                                             |
| `useInterviewState`                | `skill/hooks/`             | なし                                       | 固有（移植先） | 統合後の中核フックとして維持・拡張                                                                         |

### 3-2. 共有候補コンポーネントの API 差分（要確認事項）

**FreeTextInput 同名問題**:

| 項目        | skill-creator/FreeTextInput   | interview-widgets/FreeTextInput                 |
| ----------- | ----------------------------- | ----------------------------------------------- |
| `onSubmit`  | `(text: string) => void`      | `() => void`（Enter/ボタン押下）                |
| `onChange`  | なし（非制御）                | `(value: string) => void`（制御コンポーネント） |
| `value`     | なし（非制御）                | あり（制御コンポーネント）                      |
| `isSecret`  | `boolean`（パスワード入力化） | なし（SecretInput が別途存在）                  |
| `isVisible` | `boolean`（表示/非表示切替）  | なし                                            |

interview-widgets版は制御コンポーネント（controlled）、skill-creator版は非制御コンポーネント（uncontrolled）。  
統合時は interview-widgets版（制御コンポーネント）を採用し、`isVisible` と `isSecret` の機能は `SecretInput` または条件付きレンダリングで代替する。

---

## 4. まとめ

| 項目                     | 結論                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 孤立コンポーネント       | `SkillCreatorConversationPanel`（App.tsx未接続、Phase 11ハーネスのみ）                                                                                                                      |
| 正本コンポーネント       | `ConversationalInterview`（SkillLifecyclePanel経由で本番接続済み）                                                                                                                          |
| 統合方針                 | `ConversationalInterview` を正本とし、`SkillCreatorConversationPanel` を廃止                                                                                                                |
| 移植が必要な固有機能     | 「その他（自由入力）」オプション（要否判断）、完了後の結果表示（SkillLifecyclePanelへ移植）                                                                                                 |
| 廃止候補コンポーネント   | `QuestionCard`, `ChoiceButton`, `FreeTextInput`（skill-creator版）, `ConversationProgress`                                                                                                  |
| 採用・維持コンポーネント | `SingleSelectChips`, `MultiSelectCheckbox`, `FreeTextInput`（interview-widgets版）, `SecretInput`, `ConfirmButtons`, `InterviewProgressBar`, `useInterviewState`, `SkillCreatorResultPanel` |
