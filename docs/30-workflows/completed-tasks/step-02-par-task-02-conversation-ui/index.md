# Task02: Conversation UI — 質問受信・回答送信UIコンポーネント実装

## メタ情報

| 項目         | 値                                                                               |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | TASK-SDK-SC-02                                                                   |
| 機能名       | conversation-ui                                                                  |
| 責務         | Conversation UI（質問受信・回答送信インタフェース）                              |
| 実行順序     | step-02-par（Task-01完了後、並列実行可能）                                       |
| 依存タスク   | TASK-SDK-SC-01（IPCチャネル定義・UserInputQuestion/UserInputAnswerブリッジ確定） |
| ブロック対象 | なし                                                                             |
| ステータス   | 未着手                                                                           |
| 作成日       | 2026-04-02                                                                       |

## 目的

Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装する。  
`skill-creator:question-received` IPCイベントで `UserInputQuestion` を受信し、レンダラ内部で `SkillCreatorUserInputRequest` に変換して `kind`（single_select / multi_select / free_text / secret / confirm）に応じた入力UIを表示する。  
ユーザーの回答は `InterviewUserAnswer` として受け取り、`UserInputAnswer` に正規化して `skill-creator:answer` IPC で送信し、`skill-creator:session-complete` / `skill-creator:session-error` で終端状態まで扱う。

## 参照する正本（aiworkflow-requirements）

| 観点          | 参照資料                                                    | 用途                               |
| ------------- | ----------------------------------------------------------- | ---------------------------------- |
| UI/UX         | `ui-ux-components.md`, `ui-ux-design-principles.md`         | Atomic Design と画面構成の正本     |
| IPC 契約      | `api-ipc-system.md`, `api-ipc-system-core.md`               | Main / Renderer 間のチャネル契約   |
| セキュリティ  | `security-electron-ipc.md`, `security-electron-ipc-core.md` | preload 境界・購読解除・直書き抑止 |
| 品質 / テスト | `quality-requirements.md`, `testing-component-patterns.md`  | しきい値・テスト設計・a11y         |

## 対象ファイル（全て新規）

| ファイル                                                                               | 変更内容                                     |
| -------------------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 新規: パネル統合（IPC受信・送信・状態管理）  |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 新規: 質問カード（タイプ別UI分岐）           |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | 新規: 選択ボタン（選択状態・その他区別）     |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | 新規: 自由入力（Enter送信・Shift+Enter改行） |
| `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | 新規: 進捗表示（現在質問番号/推定残り）      |

## テスト成果物

| ファイル                                                                                              | 変更内容                          |
| ----------------------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/QuestionCard.test.tsx`                  | 質問表示・選択肢・確認UIのテスト  |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ChoiceButton.test.tsx`                  | 選択状態・破線・disabled のテスト |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/FreeTextInput.test.tsx`                 | 入力・送信・マスクのテスト        |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/ConversationProgress.test.tsx`          | 進捗表示・バー幅のテスト          |
| `apps/desktop/src/renderer/components/skill-creator/__tests__/SkillCreatorConversationPanel.test.tsx` | IPC リスナー・結合テスト          |

## コンポーネント構成（Atomic Design）

| コンポーネント                  | Atomic Design 階層 | 役割                                                           |
| ------------------------------- | ------------------ | -------------------------------------------------------------- |
| `ChoiceButton`                  | Atom               | 選択/未選択状態の単一選択ボタン                                |
| `FreeTextInput`                 | Atom               | 自由入力テキストエリア（free_text / secret / その他）          |
| `ConversationProgress`          | Atom               | 「質問 N / 推定合計」形式の進捗表示                            |
| `QuestionCard`                  | Molecule           | SkillCreatorUserInputRequest.kind に応じた質問表示・入力UI統合 |
| `SkillCreatorConversationPanel` | Organism           | IPC listen・回答送信・全コンポーネント統合                     |

## 質問タイプ一覧

| タイプ          | UI表示                                                      |
| --------------- | ----------------------------------------------------------- |
| `single_select` | 選択肢ボタン（単一選択） + 末尾に「その他（自由入力）」必須 |
| `multi_select`  | 選択肢ボタン（複数選択） + 末尾に「その他（自由入力）」必須 |
| `free_text`     | テキストエリア（自由入力のみ）                              |
| `secret`        | パスワードフィールド（マスク表示）                          |
| `confirm`       | 「はい」「いいえ」ChoiceButton                              |

## 「その他（自由入力）」必須化ルール

- `single_select` / `multi_select` タイプでは、選択肢の**最後**に常に「その他（自由入力）」を表示する
- ユーザーが「その他（自由入力）」を選択したとき、テキストエリアが展開される
- テキストエリアに入力して送信すると、自由入力値が回答として送信される

## IPCチャネル（TASK-SDK-SC-01 成果物）

| チャネル                          | 方向            | ペイロード                   |
| --------------------------------- | --------------- | ---------------------------- |
| `skill-creator:question-received` | Main → Renderer | `UserInputQuestion`          |
| `skill-creator:answer`            | Renderer → Main | `UserInputAnswer`            |
| `skill-creator:session-complete`  | Main → Renderer | 終端通知（完了状態へ遷移）   |
| `skill-creator:session-error`     | Main → Renderer | 終端通知（エラー状態へ遷移） |

## 前提（依存タスク）

- TASK-SDK-SC-01（SDK Session Bridge）が完了していること
- `UserInputQuestion` / `UserInputAnswer` の session bridge と、UI 用の `SkillCreatorUserInputRequest` / `InterviewUserAnswer` 型が確定していること
- IPC チャネル定数が確定していること（`packages/shared/src/ipc/channels.ts`）

## 並列実行の関係

- TASK-SDK-SC-01 との並列実行は不可（Task-01完了後に着手）
- step-02-par 内の他タスクとは並列実行可能

## スコープ外

- `git commit`
- `gh pr create` を含む PR 作成
- ブランチの push

## 実行タスク概要

| Phase | 内容                                      |
| ----- | ----------------------------------------- |
| 1     | 要件定義                                  |
| 2     | 設計（Propsインターフェース・ツリー構造） |
| 3     | 設計レビュー（4条件）                     |
| 4     | テスト作成（TDD: Red）                    |
| 5     | 実装（TDD: Green）                        |
| 6     | テスト拡充（エッジケース）                |
| 7     | カバレッジチェック（≥80%）                |
| 8     | リファクタリング                          |
| 9     | 品質保証（typecheck/lint/a11y）           |
| 10    | 最終レビュー（4条件）                     |
| 11    | 手動テスト                                |
| 12    | ドキュメント                              |
| 13    | 完了・引き継ぎ                            |

## 参照資料

| 資料名                                                                                      | パス                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| UserInputQuestion / UserInputAnswer / SkillCreatorUserInputRequest / InterviewUserAnswer 型 | `packages/shared/src/types/index.ts`                                |
| WorkflowUiSnapshot 型                                                                       | `packages/shared/src/types/skillCreator.ts`                         |
| IPC チャネル定数                                                                            | `packages/shared/src/ipc/channels.ts`                               |
| TASK-SDK-SC-01 概要                                                                         | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md` |

## 完了条件

- [ ] 全5コンポーネントが新規作成されている
- [ ] 全5テストファイルが新規作成されている
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] Vitest テストが全件 PASS
- [ ] Atomic Design 原則に準拠していること
- [ ] IPCチャネル定数（channels.ts）のエクスポートを正しく使用していること
- [ ] `single_select` / `multi_select` の選択肢末尾に必ず「その他（自由入力）」が表示されること
- [ ] `secret` タイプでパスワードマスク表示が機能すること
- [ ] IPCリスナーが unmount 時にクリーンアップされること
