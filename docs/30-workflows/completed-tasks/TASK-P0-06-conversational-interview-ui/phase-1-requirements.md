# Phase 1: 要件定義 - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | なし                                   |
| 後続Phase  | Phase 2（設計）                        |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

TASK-P0-06「会話型インタビュー UI」の機能要件・非機能要件を明文化し、検証可能な受け入れ基準を定義する。P0是正ギャップ分析で判明した5つの未完成課題を要件として正式に定義し、実装スコープとP0-08（セッション復元）との責務境界を確定する。

## 背景

TASK-SDK-SC-02（Conversation UI）にてUIコンポーネントの基礎実装が完了済み。しかし、P0是正ギャップ分析の結果、以下が未完成であることが判明している：

1. 全 UserInputKind 統合のエンドツーエンドフロー接続が未完
2. チャット形式 UX が WorkflowEngine との実際のIPC接続なしに完結していない
3. 一時状態管理と永続状態（P0-08）の境界が未整備
4. InterviewProgressBar と WorkflowEngine のステップ情報の接続が未確認
5. APIキー未設定時のガイダンスフローが不在

---

## 実行タスク

### タスク1: P50チェック — 既実装状態の調査

**目的**: 対象ファイルの現在の実装状態を確認し、既実装コードとの重複を防止する。

**実行手順**:

1. 対象コンポーネントの実装状態を確認する

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# 対象関数/機能が既に実装されているか確認
grep -n "buildSubmission\|restoreAnswerInputs\|addAssistantMessage\|rollbackLastUserMessage" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# interview-widgets の実装確認
ls apps/desktop/src/renderer/components/skill/interview-widgets/
```

2. 型定義の現状を確認する

```bash
# UserInputKind の定義確認（5種類すべて存在するか）
grep -n "SkillCreatorUserInputKind\|selectedOptionIds\|selectedValues" \
  packages/shared/src/types/skillCreator.ts

# Session Bridge型（IPC契約）の確認
grep -n "UserInputQuestion\|UserInputAnswer" \
  packages/shared/src/types/skillCreatorSession.ts
```

3. IPCチャンネルの現状を確認する

```bash
# セッション系IPCチャンネルの確認
grep -n "SKILL_CREATOR_SESSION_CHANNELS\|skill-creator:" \
  packages/shared/src/ipc/channels.ts
```

4. 既存テストの確認

```bash
ls apps/desktop/src/renderer/components/skill/__tests__/ | grep -i "interview\|conversation"
```

**期待される成果物**:

- 既実装コードのインベントリ（ファイル一覧・行数・主要関数）
- 実装済みの機能と未実装の機能の差分マップ

#### P50チェック結果（事前調査結果）

| ファイル                            | 状態     | 行数      | 主要機能                                                                                  |
| ----------------------------------- | -------- | --------- | ----------------------------------------------------------------------------------------- |
| `ConversationalInterview.tsx`       | 実装済み | 506行     | 全5InputKind対応、undo/rollback、proficiency切替                                          |
| `useInterviewState.ts`              | 実装済み | 201行     | メッセージ履歴、ステップ管理、submission構築                                              |
| `InterviewProgressBar.tsx`          | 実装済み | 37行      | 進捗表示（current/total）                                                                 |
| `interview-widgets/`                | 実装済み | 6ファイル | SingleSelectChips, MultiSelectCheckbox, FreeTextInput, SecretInput, ConfirmButtons, index |
| `SkillCreatorConversationPanel.tsx` | 実装済み | 315行     | Session API↔ConversationalInterviewブリッジ                                               |
| `SkillLifecyclePanel.tsx`           | 実装済み | -         | ワークフローガバナンス・承認フロー                                                        |

**型定義の現状**:

| 型名                              | 定義箇所                  | 状態                     |
| --------------------------------- | ------------------------- | ------------------------ | ----------- |
| `SkillCreatorUserInputKind`       | `skillCreator.ts:427`     | 5種類すべて定義済み      |
| `InterviewUserAnswer`             | `skillCreator.ts:555-563` | `selectedOptionIds` 含む |
| `SkillCreatorUserInputSubmission` | `skillCreator.ts:538-547` | IPC送信用型、完備        |
| `InterviewMessage`                | `skillCreator.ts:565-573` | UI内部型、完備           |
| `InterviewProficiency`            | `skillCreator.ts:553`     | `"beginner"              | "engineer"` |

**IPCチャンネルの現状**（セッションベースパターン）:

| チャンネル                                   | 目的               |
| -------------------------------------------- | ------------------ |
| `skill-creator:start-session`                | セッション開始     |
| `skill-creator:question-received`            | 質問受信（Push型） |
| `skill-creator:answer`                       | 回答送信           |
| `skill-creator:session-complete`             | セッション完了     |
| `skill-creator:session-error`                | エラー通知         |
| `skill-creator:external-api-config-required` | APIキー設定要求    |
| `skill-creator:configure-api`                | API設定画面遷移    |
| `skill-creator:api-configured`               | API設定完了通知    |
| `skill-creator:api-test-result`              | APIテスト結果      |

> **重要な発見**: Issue #1889では `workflowSnapshot` ベースのPull型を前提としているが、実際の実装は **セッションベースのIPC（Push型）** を採用している。`SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` によるPush型で質問が配信される。設計時にこの差異を考慮すること。

---

### タスク2: 機能要件の抽出

**目的**: Issue #1889のギャップ分析から機能要件を抽出し、番号付きで定義する。

**実行手順**:

1. Issue #1889の5つの課題を機能要件に変換する
2. 各要件に検証可能な受け入れ基準を定義する
3. 既実装コードとの差分を明確にする

#### 機能要件一覧（FR）

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

#### 受け入れ基準

| AC-ID | FR-ID | 受け入れ基準                                                                                                                                                                                                 | 検証方法                    |
| ----- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- |
| AC-1  | FR-01 | 5種類のInputKindそれぞれで、質問表示→回答入力→送信→次の質問表示のサイクルが動作する                                                                                                                          | ユニットテスト + 手動テスト |
| AC-2  | FR-02 | `skill-creator:question-received` IPCイベントでassistantメッセージが追加され、`skill-creator:answer` で回答が送信される                                                                                      | 統合テスト                  |
| AC-3  | FR-03 | `useInterviewState.ts` にP0-06/P0-08スコープ境界コメントが存在し、永続化ロジックが混入していない                                                                                                             | コードレビュー + grep検証   |
| AC-4  | FR-04 | インタビュー進行に伴い `InterviewProgressBar` の `current`/`total` が正しく更新される                                                                                                                        | ユニットテスト              |
| AC-5  | FR-05 | `secret` 種別 + APIキー未設定時に `data-testid="api-key-guidance-banner"` が表示され、「外部API設定を開く」ボタンが `handleOpenApiKeySettings` を呼び出し、必要に応じて `ExternalApiConfigForm` が表示される | ユニットテスト              |
| AC-6  | FR-06 | 各InputKindでundo実行後、直前の回答値が正しく復元される。`secret` のみ空文字で復元される                                                                                                                     | ユニットテスト              |
| AC-7  | FR-07 | 未入力状態で送信試行時にバリデーションエラーが `role="alert"` 属性で表示される                                                                                                                               | ユニットテスト              |
| AC-8  | FR-08 | 送信中に送信ボタンの `disabled` 属性が `true` になる                                                                                                                                                         | ユニットテスト              |
| AC-9  | FR-09 | メッセージ追加後にチャットエリアの `scrollTop` が最下部に移動する                                                                                                                                            | ユニットテスト              |

---

### タスク3: 非機能要件の定義

**目的**: 品質属性に関する非機能要件を定義する。

#### 非機能要件一覧（NFR）

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

### タスク4: スコープ定義 — P0-06 vs P0-08 の責務境界

**目的**: P0-06（本タスク）とP0-08（セッション復元）の責務境界を明確化する。

#### P0-06の責任範囲（レンダラーに閉じた一時状態）

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

#### P0-06が触れてはいけない永続状態（P0-08の領域）

| 状態                                                   | 理由                            |
| ------------------------------------------------------ | ------------------------------- |
| `SkillCreatorPersistedWorkflowCheckpoint` への書き込み | セッション復元はP0-08の責務     |
| SQLiteを介したセッション保存                           | 永続化レイヤーはP0-08の責務     |
| `checkpointId` / `revision` / `lease` の管理           | ワークフロー永続化はP0-08の責務 |
| アプリ再起動後のresume処理                             | セッション復元はP0-08の責務     |

---

### タスク5: 依存タスクの確認

**目的**: 依存タスクの完了状態を確認し、暫定対応方針を決定する。

#### 依存タスク一覧

| 依存タスク                     | 依存内容                                       | 完了確認方法                                                                                                     | 未完了時の暫定対応                                                                              |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TASK-RT-04（APIキー管理UI）    | `secret` 種別でのAPIキー未設定時ガイダンス表示 | `ApiKeySettingsPanel.tsx` / `ExternalApiConfigForm` の存在、および `configureApi` / `onApiConfigured` 連携の確認 | 「外部API設定を開く」ボタンとフォーム表示は P0-06 で対応し、画面遷移や検証 UI は RT-04 側で実装 |
| TASK-RT-05（multi_select追加） | `selectedOptionIds` のcanonical化              | `skillCreator.ts` に `multi_select` の `selectedOptionIds` がcanonical定義                                       | `selectedOptionIds ?? selectedValues` フォールバックを維持し、TODOコメントで明記                |

#### RT-05暫定対応方針

`ConversationalInterview.tsx` の `restoreAnswerInputs` 内で以下のフォールバック処理を維持する：

```typescript
// TODO(RT-05): RT-05完了後に selectedOptionIds canonical化
// selectedValues は後方互換フォールバック
answer.selectedOptionIds ?? answer.selectedValues;
```

---

### タスク6: タスク分類の記録

**目的**: タスク分類を明示的に記録し、Phase 2以降の設計方針を確定する。

| 項目             | 値                                                        |
| ---------------- | --------------------------------------------------------- |
| タスク分類       | UI task（Reactコンポーネント拡張 + フック拡張 + IPC接続） |
| 主要変更レイヤー | Renderer層（`apps/desktop/src/renderer/`）                |
| IPC変更          | なし（既存チャンネルを使用）                              |
| 型定義変更       | なし（`packages/shared/` は参照のみ）                     |
| 新規ファイル作成 | なし（既存ファイルの拡張のみ）                            |

---

## 参照資料

| 資料名                        | パス                                                                                   | 説明                                         |
| ----------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------- |
| Issue #1889                   | GitHub Issue                                                                           | TASK-P0-06の詳細仕様                         |
| 型定義                        | `packages/shared/src/types/skillCreator.ts`                                            | InterviewMessage, UserInputKind等            |
| Session型定義                 | `packages/shared/src/types/skillCreatorSession.ts`                                     | Session Bridge型（UserInputQuestion/Answer） |
| IPCチャンネル定義             | `packages/shared/src/ipc/channels.ts`                                                  | SKILL_CREATOR_SESSION_CHANNELS               |
| ConversationalInterview       | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`               | メインコンポーネント                         |
| useInterviewState             | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts`                | 状態管理フック                               |
| SkillCreatorConversationPanel | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | Session↔UIブリッジ                           |
| aiworkflow-requirements       | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                    | Skill Creator Conversation UIセクション      |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記:

| 接続ポイント                          | 接続先                                       | データフロー                                              | 確認状態           |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | ------------------ |
| Session API → ConversationalInterview | `SkillCreatorConversationPanel`              | `UserInputQuestion` → `SkillCreatorUserInputRequest` 変換 | 実装済み           |
| ConversationalInterview → Session API | `SkillCreatorConversationPanel`              | `InterviewUserAnswer` → `UserInputAnswer` 変換            | 実装済み           |
| 質問受信IPC                           | `skill-creator:question-received`            | main→renderer Push型                                      | チャンネル定義済み |
| 回答送信IPC                           | `skill-creator:answer`                       | renderer→main                                             | チャンネル定義済み |
| APIキー設定要求IPC                    | `skill-creator:external-api-config-required` | main→renderer                                             | チャンネル定義済み |

---

## 成果物

| 成果物     | パス                              | 説明                                                  |
| ---------- | --------------------------------- | ----------------------------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本文書（機能要件9件・非機能要件9件・受け入れ基準9件） |

---

## 完了条件

- [x] P50チェック: 既実装状態の調査が完了し、インベントリが作成されている
- [x] 機能要件が全て抽出されている（FR-01〜FR-09）
- [x] 受け入れ基準が検証可能な形で定義されている（AC-1〜AC-9）
- [x] FR/NFR分類と優先度が設定されている
- [x] P0-06 vs P0-08 の責務境界が明確に定義されている
- [x] 依存タスク（RT-04, RT-05）の暫定対応方針が決定されている
- [x] タスク分類が記録されている
- [x] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計 → `phase-2-design.md`
