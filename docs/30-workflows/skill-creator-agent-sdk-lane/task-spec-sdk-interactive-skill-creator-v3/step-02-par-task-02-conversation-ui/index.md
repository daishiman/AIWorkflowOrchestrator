# Task02: Conversation UI — 質問受信・回答送信UIコンポーネント実装

## メタ情報

| 項目         | 値                                                       |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-SDK-SC-02                                           |
| 機能名       | conversation-ui                                          |
| 責務         | Conversation UI（質問受信・回答送信インタフェース）      |
| 実行順序     | step-02-par（Task-01完了後、並列実行可能）               |
| 依存タスク   | TASK-SDK-SC-01（IPCチャネル定義・QuestionPayload型確定） |
| ブロック対象 | なし                                                     |
| ステータス   | 未着手                                                   |
| 作成日       | 2026-04-02                                               |

## 目的

Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装する。  
`skill-creator:question-received` IPCイベントで質問を受信し、質問タイプ（single_select / multi_select / free_text / secret / confirm）に応じた入力UIを表示する。  
ユーザーの回答を `skill-creator:answer` IPCで送信し、スキル生成インタビューを完結させる。

## 対象ファイル（全て新規）

| ファイル                                                                               | 変更内容                                     |
| -------------------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | 新規: パネル統合（IPC受信・送信・状態管理）  |
| `apps/desktop/src/renderer/components/skill-creator/QuestionCard.tsx`                  | 新規: 質問カード（タイプ別UI分岐）           |
| `apps/desktop/src/renderer/components/skill-creator/ChoiceButton.tsx`                  | 新規: 選択ボタン（選択状態・その他区別）     |
| `apps/desktop/src/renderer/components/skill-creator/FreeTextInput.tsx`                 | 新規: 自由入力（Enter送信・Shift+Enter改行） |
| `apps/desktop/src/renderer/components/skill-creator/ConversationProgress.tsx`          | 新規: 進捗表示（現在質問番号/推定残り）      |

## コンポーネント構成（Atomic Design）

| コンポーネント                  | Atomic Design 階層 | 役割                                                  |
| ------------------------------- | ------------------ | ----------------------------------------------------- |
| `ChoiceButton`                  | Atom               | 選択/未選択状態の単一選択ボタン                       |
| `FreeTextInput`                 | Atom               | 自由入力テキストエリア（free_text / secret / その他） |
| `ConversationProgress`          | Atom               | 「質問 N / 推定合計」形式の進捗表示                   |
| `QuestionCard`                  | Molecule           | QuestionPayload.type に応じた質問表示・入力UI統合     |
| `SkillCreatorConversationPanel` | Organism           | IPC listen・回答送信・全コンポーネント統合            |

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

| チャネル                          | 方向            | ペイロード                       |
| --------------------------------- | --------------- | -------------------------------- |
| `skill-creator:question-received` | Main → Renderer | `QuestionPayload`                |
| `skill-creator:answer`            | Renderer → Main | `{ answer: string \| string[] }` |

## 前提（依存タスク）

- TASK-SDK-SC-01（SDK Session Bridge）が完了していること
- `QuestionPayload` 型定義が確定していること（`packages/shared/src/types/skillCreator.ts`）
- IPC チャネル定数が確定していること（`packages/shared/src/ipc/channels.ts`）

## 並列実行の関係

- TASK-SDK-SC-01 との並列実行は不可（Task-01完了後に着手）
- step-02-par 内の他タスクとは並列実行可能

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
| 13    | 完了・PR作成                              |

## 参照資料

| 資料名                 | パス                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| QuestionPayload 型定義 | `packages/shared/src/types/skillCreator.ts`                         |
| IPC チャネル定数       | `packages/shared/src/ipc/channels.ts`                               |
| TASK-SDK-SC-01 概要    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md` |

## 完了条件

- [ ] 全5コンポーネントが新規作成されている
- [ ] TypeScript コンパイルエラーが 0 件
- [ ] Vitest テストが全件 PASS
- [ ] Atomic Design 原則に準拠していること
- [ ] IPCチャネル定数（channels.ts）のエクスポートを正しく使用していること
- [ ] `single_select` / `multi_select` の選択肢末尾に必ず「その他（自由入力）」が表示されること
- [ ] `secret` タイプでパスワードマスク表示が機能すること
- [ ] IPCリスナーが unmount 時にクリーンアップされること
