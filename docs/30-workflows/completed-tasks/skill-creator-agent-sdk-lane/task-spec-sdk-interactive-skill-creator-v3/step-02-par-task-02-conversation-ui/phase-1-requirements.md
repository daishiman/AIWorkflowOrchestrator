# Phase 1: 要件定義 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase番号  | 1                                                        |
| 機能名     | conversation-ui                                          |
| タスクID   | TASK-SDK-SC-02                                           |
| 作成日     | 2026-04-02                                               |
| 依存Phase  | なし（起点）                                             |
| 依存タスク | TASK-SDK-SC-01（QuestionPayload型・IPCチャネル定数確定） |

## 目的

Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装するための要件を定義する。  
`skill-creator:question-received` IPCイベントで質問を受信し、質問タイプに応じた入力UIを提供し、  
ユーザーの回答を `skill-creator:answer` IPCで送信するインタフェースを構築する。

## 実行タスク

### Task 1-1: 現状調査

- `packages/shared/src/types/skillCreator.ts` を読み込み、`QuestionPayload` の型定義（type・choices・context 等）を記録する
- `packages/shared/src/ipc/channels.ts` を読み込み、`skill-creator:question-received` / `skill-creator:answer` チャネル名を確認する
- `apps/desktop/src/renderer/components/skill-creator/` の既存ファイルを確認する
- Tailwind CSS の設定（`tailwind.config.*`）を確認し、利用可能なクラスを把握する

### Task 1-2: 要件定義

#### FR-001: 質問カード表示

| 要件項目     | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 概要         | `QuestionPayload` を受け取り、質問テキストとコンテキストを表示するカード   |
| 質問テキスト | `payload.question` を見出しとして目立つスタイルで表示する                  |
| コンテキスト | `payload.context` が存在する場合、補足説明として質問テキストの下に表示する |
| タイプ分岐   | `payload.type` に応じて入力UIを切り替える（FR-002〜FR-005参照）            |

#### FR-002: 選択式UI（single_select）

| 要件項目       | 内容                                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| 概要           | 選択肢ボタンを縦に並べて単一選択を提供する                                           |
| 選択肢表示     | `payload.choices` の各要素を `ChoiceButton` として表示する                           |
| 「その他」必須 | 選択肢の**最後**に必ず「その他（自由入力）」ボタンを追加する（常に表示・省略不可）   |
| 「その他」選択 | 「その他（自由入力）」を選択したとき、`FreeTextInput` を展開表示する                 |
| 選択即送信     | ChoiceButton クリック（「その他」除く）で即座に `skill-creator:answer` IPCを送信する |

#### FR-003: 複数選択UI（multi_select）

| 要件項目       | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| 概要           | チェックボックス的な挙動で複数選択を提供する                                       |
| 選択肢表示     | `payload.choices` の各要素を選択可能な `ChoiceButton` として表示する               |
| 複数選択       | 複数のボタンを同時に選択状態にできる（トグル動作）                                 |
| 「その他」必須 | 選択肢の**最後**に必ず「その他（自由入力）」ボタンを追加する（常に表示・省略不可） |
| 送信           | 「送信」ボタンで選択済みの全選択肢を配列として送信する                             |

#### FR-004: 自由入力UI（free_text / secret）

| 要件項目             | 内容                                                             |
| -------------------- | ---------------------------------------------------------------- |
| 概要                 | テキストエリアまたはパスワードフィールドで自由入力を提供する     |
| free_text            | 複数行テキストエリアを表示する                                   |
| secret               | `type="password"` のパスワードフィールドを表示する（マスク表示） |
| Enter 送信           | Enter キー（Shift なし）で `skill-creator:answer` IPCを送信する  |
| Shift+Enter          | Shift+Enter で改行を挿入する（free_text のみ・secret は対象外）  |
| 空文字バリデーション | 空文字列の場合は送信しない                                       |

#### FR-005: 確認UI（confirm）

| 要件項目 | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 概要     | はい / いいえ の2択ボタンを提供する                                              |
| 表示     | 「はい」「いいえ」の `ChoiceButton` を横並びで表示する                           |
| 送信     | クリック時に即座に `"yes"` または `"no"` を `skill-creator:answer` IPCで送信する |

#### FR-006: 回答送信後の2重送信防止

| 要件項目           | 内容                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| 概要               | 回答送信後はUI入力を無効化し、2重送信を防止する                                            |
| 単一選択           | `ChoiceButton` クリック直後に全ボタンを `disabled` にする                                  |
| 複数選択           | 「送信」ボタンクリック直後に全ボタンおよび「送信」ボタンを `disabled` にする               |
| 自由入力           | 送信直後にテキストエリア/入力フィールドおよび送信ボタンを `disabled` にする                |
| 確認（confirm）    | 「はい」「いいえ」クリック直後に両ボタンを `disabled` にする                               |
| 再有効化タイミング | `skill-creator:question-received` IPC を受信し状態が `awaiting-input` に戻った後に解除する |

#### FR-007: 進捗表示

| 要件項目 | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 概要     | 現在の質問番号と推定残り質問数を表示する                         |
| 表示形式 | 「質問 N / 推定合計」形式のテキストとプログレスバーを表示する    |
| 更新     | `skill-creator:question-received` 受信ごとにカウンターを更新する |

### Task 1-3: 受入基準定義

| ID    | 受入基準                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------- |
| AC-01 | `QuestionCard` が `payload.question` と `payload.context` を表示する                              |
| AC-02 | `single_select` / `multi_select` タイプで選択肢の**最後**に「その他（自由入力）」が常に表示される |
| AC-03 | 「その他（自由入力）」選択時に `FreeTextInput` が展開される                                       |
| AC-04 | `ChoiceButton` クリック（「その他」除く）で `skill-creator:answer` IPCが呼び出される              |
| AC-05 | `FreeTextInput` で Enter キー（Shift なし）押下時に `skill-creator:answer` IPCが呼び出される      |
| AC-06 | `secret` タイプでパスワードマスク表示が適用される                                                 |
| AC-07 | `confirm` タイプで「はい」「いいえ」ボタンが表示される                                            |
| AC-08 | `ConversationProgress` が「質問 N / 推定合計」形式を表示する                                      |
| AC-09 | `SkillCreatorConversationPanel` がアンマウント時に IPCリスナーをクリーンアップする                |
| AC-10 | 回答送信直後に全ボタン・入力フィールドが `disabled` 状態になる                                    |
| AC-11 | 次の `skill-creator:question-received` 受信後にボタン・入力フィールドが再び操作可能になる         |

### Task 1-4: スコープ外事項の明記

以下は本タスクのスコープ外とする:

- SDK Session Bridge の実装（TASK-SDK-SC-01 で対応）
- 質問生成ロジック・回答処理ロジック（Main プロセス側）
- スキル実行ページ・スキル一覧ページの変更
- Storybook の実装（将来対応）
- アニメーション・トランジション効果（将来対応）

## 参照資料

| 資料名                 | パス                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| QuestionPayload 型定義 | `packages/shared/src/types/skillCreator.ts`                         |
| IPC チャネル定数       | `packages/shared/src/ipc/channels.ts`                               |
| TASK-SDK-SC-01 概要    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md` |

## 成果物

| 成果物                   | パス                      | 形式     |
| ------------------------ | ------------------------- | -------- |
| 要件定義書（本ファイル） | `phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] `QuestionPayload` 型の全フィールドを確認した
- [ ] IPCチャネル定数（`skill-creator:question-received` / `skill-creator:answer`）を確認した
- [ ] FR-001 から FR-007 を定義した
- [ ] 受入基準 AC-01 から AC-11 を定義した
- [ ] スコープ外事項を明記した

## 次の Phase: Phase 2 (phase-2-design.md)
