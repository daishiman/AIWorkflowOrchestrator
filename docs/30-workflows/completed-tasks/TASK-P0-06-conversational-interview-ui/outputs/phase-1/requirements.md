# TASK-P0-06 Phase 1: 要件定義書 - 会話型インタビュー UI

## メタ情報

| 項目    | 内容                                   |
| ------- | -------------------------------------- |
| Phase   | 1                                      |
| Phase名 | 要件定義                               |
| 作成日  | 2026-04-04                             |
| 機能名  | TASK-P0-06-conversational-interview-ui |
| Issue   | #1889                                  |

---

## 1. 目的

TASK-P0-06「会話型インタビュー UI」の機能要件・非機能要件を明文化し、検証可能な受け入れ基準を定義する。P0是正ギャップ分析で判明した5つの未完成課題を要件として正式に定義し、実装スコープとP0-08（セッション復元）との責務境界を確定する。

---

## 2. 機能要件（FR）

| ID    | 要件名                     | 説明                                                                                                                                    | 優先度 |
| ----- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | 全UserInputKind統合フロー  | `single_select`/`multi_select`/`free_text`/`confirm`/`secret` の5種類を統合した会話型インタビューフローがエンドツーエンドで動作すること | 高     |
| FR-02 | チャット形式UXのIPC接続    | `SkillCreatorConversationPanel` が Session API経由で WorkflowEngine と接続し、質問→回答→次の質問のサイクルが完結すること                | 高     |
| FR-03 | 一時状態管理とP0-08境界    | `useInterviewState` が管理する一時状態（揮発性）と P0-08（永続状態）の責務境界が実装コードレベルで明確であること                        | 高     |
| FR-04 | インタビュー進捗表示の接続 | `InterviewProgressBar` が Session API から取得するステップ情報と正確に接続され、リアルタイムで更新されること                            | 中     |
| FR-05 | APIキー未設定時ガイダンス  | `secret` 種別の質問で APIキーが未設定の場合、ユーザーをRT-04の設定画面へ誘導するガイダンスバナーを表示すること                          | 中     |
| FR-06 | undo操作の全InputKind対応  | 全5種類のInputKindでundo（前の質問へ戻る）操作が正しく機能し、以前の回答値が復元されること（`secret` は空文字で復元）                   | 高     |
| FR-07 | バリデーション             | 各InputKindに対して適切なバリデーション（空文字チェック、選択必須チェック等）が実行され、エラーが `role="alert"` で表示されること       | 中     |
| FR-08 | 送信中状態制御             | `isSubmitting === true` 中は送信ボタンが無効化され、二重送信が防止されること                                                            | 中     |
| FR-09 | 自動スクロール             | チャット履歴エリアに新しいメッセージが追加されると、最新メッセージへ自動スクロールすること                                              | 低     |

---

## 3. 非機能要件（NFR）

| ID     | カテゴリ         | 要件                                                                                          | 基準                                         |
| ------ | ---------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| NFR-01 | 型安全性         | TypeScript strict modeでコンパイルエラーがないこと                                            | `pnpm --filter @repo/desktop typecheck` PASS |
| NFR-02 | コード品質       | ESLintエラーがないこと                                                                        | `pnpm --filter @repo/desktop lint` PASS      |
| NFR-03 | テストカバレッジ | ユニットテスト Line Coverage 80%以上                                                          | Vitest coverage レポート                     |
| NFR-04 | テストカバレッジ | ユニットテスト Branch Coverage 60%以上                                                        | Vitest coverage レポート                     |
| NFR-05 | アクセシビリティ | バリデーションエラーが `role="alert"` で表示されること                                        | テスト検証                                   |
| NFR-06 | テスタビリティ   | 主要要素に `data-testid` 属性が付与されていること                                             | grep検証                                     |
| NFR-07 | セキュリティ     | `secret` 種別のundo時に値が空文字で復元されること                                             | ユニットテスト                               |
| NFR-08 | 保守性           | Session Bridge型とWorkflow型の変換が `ConversationalInterview.tsx` 内に閉じ込められていること | コードレビュー                               |
| NFR-09 | 責務分離         | `useInterviewState.ts` に永続化ロジック（localStorage/SQLite/IPC経由の保存）が混入しないこと  | コードレビュー                               |

---

## 4. 受け入れ基準（AC）

| AC-ID | FR-ID | 受け入れ基準                                                                                                                                          | 検証方法                    |
| ----- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| AC-1  | FR-01 | 5種類のInputKindそれぞれで、質問表示→回答入力→送信→次の質問表示のサイクルが動作する                                                                   | ユニットテスト + 手動テスト |
| AC-2  | FR-02 | `skill-creator:question-received` IPCイベントでassistantメッセージが追加され、`skill-creator:answer` で回答が送信される                               | 統合テスト                  |
| AC-3  | FR-03 | `useInterviewState.ts` にP0-06/P0-08スコープ境界コメントが存在し、永続化ロジックが混入していない                                                      | コードレビュー + grep検証   |
| AC-4  | FR-04 | インタビュー進行に伴い `InterviewProgressBar` の `current`/`total` が正しく更新される                                                                 | ユニットテスト              |
| AC-5  | FR-05 | `secret` 種別 + APIキー未設定時に `data-testid="api-key-guidance-banner"` が表示され、「外部API設定を開く」ボタンが `onOpenApiKeySettings` を呼び出す | ユニットテスト              |
| AC-6  | FR-06 | 各InputKindでundo実行後、直前の回答値が正しく復元される。`secret` のみ空文字で復元される                                                              | ユニットテスト              |
| AC-7  | FR-07 | 未入力状態で送信試行時にバリデーションエラーが `role="alert"` 属性で表示される                                                                        | ユニットテスト              |
| AC-8  | FR-08 | 送信中に送信ボタンの `disabled` 属性が `true` になる                                                                                                  | ユニットテスト              |
| AC-9  | FR-09 | メッセージ追加後にチャットエリアの `scrollTop` が最下部に移動する                                                                                     | ユニットテスト              |

---

## 5. P0-06 vs P0-08 責務境界定義

### P0-06の責任範囲（レンダラーに閉じた一時状態）

| 状態                                            | 管理場所                  | 保持期間                     |
| ----------------------------------------------- | ------------------------- | ---------------------------- |
| `messages: InterviewMessage[]`                  | `useInterviewState`       | ページリロードまで（揮発性） |
| `proficiency: InterviewProficiency`             | `useInterviewState`       | ページリロードまで           |
| `currentStepIndex: number`                      | `useInterviewState`       | ページリロードまで           |
| `totalSteps: number`                            | `useInterviewState`       | ページリロードまで           |
| `selectedOptionId` / `selectedOptionIds`        | `ConversationalInterview` | 質問切替まで                 |
| `textAnswer` / `secretAnswer` / `confirmAnswer` | `ConversationalInterview` | 質問切替まで                 |
| `validationError`                               | `ConversationalInterview` | 次の入力操作まで             |
| `isSubmitting`                                  | `ConversationalInterview` | 送信完了まで                 |

### P0-06が触れてはいけない永続状態（P0-08の領域）

| 状態                                                   | 理由                            |
| ------------------------------------------------------ | ------------------------------- |
| `SkillCreatorPersistedWorkflowCheckpoint` への書き込み | セッション復元はP0-08の責務     |
| SQLiteを介したセッション保存                           | 永続化レイヤーはP0-08の責務     |
| `checkpointId` / `revision` / `lease` の管理           | ワークフロー永続化はP0-08の責務 |
| アプリ再起動後のresume処理                             | セッション復元はP0-08の責務     |

### 境界原則

- P0-06はRenderer Process内の**揮発性状態のみ**を管理する
- P0-06からP0-08の領域への書き込みは一切行わない
- P0-08の永続化層はP0-06の状態を**読み取ることは可能**（将来のスナップショット保存のため）
- undo操作はメッセージ配列の操作のみであり、永続状態には影響しない

---

## 6. 依存タスクの暫定対応方針

### TASK-RT-04（APIキー管理UI）

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 依存内容 | `secret` 種別でのAPIキー未設定時ガイダンス表示                                              |
| 完了確認 | `ApiKeySettingsPanel.tsx` が存在し動作確認済みであること                                    |
| 暫定対応 | 「外部API設定を開く」ボタンのみ表示し、実際のナビゲーションはRT-04完了後に接続              |
| 暫定実装 | `onOpenApiKeySettings` コールバックをProps経由で受け取り、RT-04未完了時はconsole.warnで代替 |

### TASK-RT-05（multi_select追加）

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| 依存内容 | `selectedOptionIds` のcanonical化                                                        |
| 完了確認 | `skillCreator.ts` に `multi_select` の `selectedOptionIds` がcanonical定義されていること |
| 暫定対応 | `selectedOptionIds ?? selectedValues` フォールバックを維持し、TODOコメントで明記         |

**RT-05暫定対応コード方針**:

```typescript
// TODO(RT-05): RT-05完了後に selectedOptionIds canonical化
// selectedValues は後方互換フォールバック
answer.selectedOptionIds ?? answer.selectedValues;
```

---

## 7. 既実装状態インベントリ（P50チェック結果）

| ファイル                            | 状態     | 行数      | 主要機能                                                                                  |
| ----------------------------------- | -------- | --------- | ----------------------------------------------------------------------------------------- |
| `ConversationalInterview.tsx`       | 実装済み | 506行     | 全5InputKind対応、undo/rollback、proficiency切替                                          |
| `useInterviewState.ts`              | 実装済み | 201行     | メッセージ履歴、ステップ管理、submission構築                                              |
| `InterviewProgressBar.tsx`          | 実装済み | 37行      | 進捗表示（current/total）                                                                 |
| `interview-widgets/`                | 実装済み | 6ファイル | SingleSelectChips, MultiSelectCheckbox, FreeTextInput, SecretInput, ConfirmButtons, index |
| `SkillCreatorConversationPanel.tsx` | 実装済み | 315行     | Session API <-> ConversationalInterview ブリッジ                                          |

---

## 8. タスク分類

| 項目             | 値                                                        |
| ---------------- | --------------------------------------------------------- |
| タスク分類       | UI task（Reactコンポーネント拡張 + フック拡張 + IPC接続） |
| 主要変更レイヤー | Renderer層（`apps/desktop/src/renderer/`）                |
| IPC変更          | なし（既存チャンネルを使用）                              |
| 型定義変更       | なし（`packages/shared/` は参照のみ）                     |
| 新規ファイル作成 | なし（既存ファイルの拡張のみ）                            |
