# Phase 1: 要件定義 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目       | 値                                                                               |
| ---------- | -------------------------------------------------------------------------------- |
| Phase番号  | 1                                                                                |
| 機能名     | conversation-ui                                                                  |
| タスクID   | TASK-SDK-SC-02                                                                   |
| 作成日     | 2026-04-02                                                                       |
| 依存Phase  | なし（起点）                                                                     |
| 依存タスク | TASK-SDK-SC-01（SkillCreatorUserInputRequest/Submission型・IPCチャネル定数確定） |

## 目的

Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装するための要件を定義する。  
`skill-creator:question-received` IPCイベントで `SkillCreatorUserInputRequest` を受信し、`kind` に応じた入力UIを提供し、  
ユーザーの回答を `SkillCreatorUserInputSubmission` に正規化して `skill-creator:answer` IPC で送信するインタフェースを構築する。

## 前提確認

1. `packages/shared/src/types/skillCreator.ts` と `packages/shared/src/ipc/channels.ts` を確認し、`SkillCreatorUserInputRequest` / `SkillCreatorUserInputSubmission` / `SkillCreatorWorkflowUiSnapshot` の current facts を固定する。
2. `task-specification-creator` の phase-template と `aiworkflow-requirements` の正本を確認し、UI / IPC / Security / Quality の観点を Phase 1 の要件へ反映する。
3. FR-001〜FR-008 と AC-01〜AC-13 を、Phase 2 でそのまま設計へ落とせる粒度に整える。

## 回答形式

| kind            | 正規化先            | 補足                                                |
| --------------- | ------------------- | --------------------------------------------------- |
| `single_select` | `selectedOptionId`  | `InterviewUserAnswer` 経由で単一選択を保持する      |
| `multi_select`  | `selectedOptionIds` | `selectedValues` は互換性維持用の別名としてのみ扱う |
| `free_text`     | `textValue`         | 余計な装飾を付けず、そのまま送る                    |
| `secret`        | `secretValue`       | 表示はマスク、送信値は平文                          |
| `confirm`       | `confirmed`         | 2択を boolean に正規化する                          |

- `allowSkip` は request 側メタデータとして保持し、今回の UI では false の場合に skip UI を表示しない

## 実行タスク

### Task 1-1: 現状調査

- `packages/shared/src/types/skillCreator.ts` を読み込み、`SkillCreatorUserInputRequest` の型定義（requestId・reason・title・prompt・kind・options・placeholder・allowSkip・requestedAt 等）を記録する
- `packages/shared/src/ipc/channels.ts` を読み込み、`SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` / `.ANSWER` の current facts を確認する
- `apps/desktop/src/renderer/components/skill-creator/` の既存ファイルを確認する
- Tailwind CSS の設定（`tailwind.config.*`）を確認し、利用可能なクラスを把握する

### Task 1-2: 要件定義

#### FR-001: 質問カード表示

| 要件項目     | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| 概要         | `SkillCreatorUserInputRequest` を受け取り、タイトル・説明・補足情報を表示するカード |
| 質問タイトル | `request.title` を見出しとして目立つスタイルで表示する                              |
| 説明         | `request.prompt` が存在する場合、補足説明としてタイトルの下に表示する               |
| 理由         | `request.reason` をバッジや注記として表示し、レビュー文脈を明示する                 |
| タイプ分岐   | `request.kind` に応じて入力UIを切り替える（FR-002〜FR-006参照）                     |

#### FR-002: 選択式UI（single_select）

| 要件項目       | 内容                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| 概要           | 選択肢ボタンを縦に並べて単一選択を提供する                                              |
| 選択肢表示     | `request.options` の各要素を `ChoiceButton` として表示する                              |
| 「その他」必須 | 選択肢の**最後**に必ず「その他（自由入力）」ボタンを追加する（常に表示・省略不可）      |
| 「その他」選択 | 「その他（自由入力）」を選択したとき、`FreeTextInput` を展開表示する                    |
| 選択即送信     | ChoiceButton クリック（「その他」除く）で即座に `selectedOptionId` を持つ回答を作成する |

#### FR-003: 複数選択UI（multi_select）

| 要件項目       | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| 概要           | チェックボックス的な挙動で複数選択を提供する                                       |
| 選択肢表示     | `request.options` の各要素を選択可能な `ChoiceButton` として表示する               |
| 複数選択       | 複数のボタンを同時に選択状態にできる（トグル動作）                                 |
| 「その他」必須 | 選択肢の**最後**に必ず「その他（自由入力）」ボタンを追加する（常に表示・省略不可） |
| 送信           | 「送信」ボタンで選択済みの全選択肢を `selectedOptionIds` として送信する            |

- `multi_select` で「その他（自由入力）」を選んだ場合は、通常選択をクリアして自由入力を優先する
- `selectedValues` は互換性維持用の補助フィールドとして扱い、UI の正規形は `selectedOptionIds` とする

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

| 要件項目 | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 概要     | はい / いいえ の2択ボタンを提供する                          |
| 表示     | 「はい」「いいえ」の `ChoiceButton` を横並びで表示する       |
| 送信     | クリック時に即座に `confirmed: boolean` を持つ回答を作成する |

#### FR-006: 回答送信後の2重送信防止

| 要件項目           | 内容                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| 概要               | 回答送信後はUI入力を無効化し、2重送信を防止する                                            |
| 単一選択           | `ChoiceButton` クリック直後に全ボタンを `disabled` にする                                  |
| 複数選択           | 「送信」ボタンクリック直後に全ボタンおよび「送信」ボタンを `disabled` にする               |
| 自由入力           | 送信直後にテキストエリア/入力フィールドおよび送信ボタンを `disabled` にする                |
| 確認（confirm）    | 「はい」「いいえ」クリック直後に両ボタンを `disabled` にする                               |
| 再有効化タイミング | `skill-creator:question-received` IPC を受信し状態が `awaiting-input` に戻った後に解除する |

#### FR-007: セッション終端表示

| 要件項目 | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| 概要     | `skill-creator:session-complete` / `skill-creator:session-error` を受信したら終端状態へ遷移する |
| 完了     | `skill-creator:session-complete` 受信時に完了メッセージを表示する                               |
| エラー   | `skill-creator:session-error` 受信時にエラーメッセージを表示する                                |
| 制御     | 終端状態では入力 UI を全て無効化する                                                            |

#### FR-008: 進捗表示

| 要件項目 | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 概要     | 現在の質問番号と推定残り質問数を表示する                         |
| 表示形式 | 「質問 N / 推定合計」形式のテキストとプログレスバーを表示する    |
| 更新     | `skill-creator:question-received` 受信ごとにカウンターを更新する |

### Task 1-3: 受入基準定義

| ID    | 受入基準                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------- |
| AC-01 | `QuestionCard` が `request.title` と `request.prompt` を表示する                                  |
| AC-02 | `single_select` / `multi_select` タイプで選択肢の**最後**に「その他（自由入力）」が常に表示される |
| AC-03 | 「その他（自由入力）」選択時に `FreeTextInput` が展開される                                       |
| AC-04 | `ChoiceButton` クリック（「その他」除く）で `selectedOptionId` を持つ回答が作成される             |
| AC-05 | `FreeTextInput` で Enter キー（Shift なし）押下時に `textValue` を持つ回答が作成される            |
| AC-06 | `secret` タイプでパスワードマスク表示が適用される                                                 |
| AC-07 | `confirm` タイプで「はい」「いいえ」ボタンが表示される                                            |
| AC-08 | `ConversationProgress` が「質問 N / 推定合計」形式を表示する                                      |
| AC-09 | `SkillCreatorConversationPanel` がアンマウント時に IPCリスナーをクリーンアップする                |
| AC-10 | 回答送信直後に全ボタン・入力フィールドが `disabled` 状態になる                                    |
| AC-11 | 次の `skill-creator:question-received` 受信後にボタン・入力フィールドが再び操作可能になる         |
| AC-12 | `skill-creator:session-complete` 受信時に完了状態へ遷移し、入力が無効化される                     |
| AC-13 | `skill-creator:session-error` 受信時にエラー状態へ遷移し、入力が無効化される                      |

### Task 1-4: スコープ外事項の明記

以下は本タスクのスコープ外とする:

- SDK Session Bridge の実装（TASK-SDK-SC-01 で対応）
- 質問生成ロジック・回答処理ロジック（Main プロセス側）
- スキル実行ページ・スキル一覧ページの変更
- Storybook の実装（将来対応）
- アニメーション・トランジション効果（将来対応）

## 参照資料

| 資料名                                       | パス                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| SkillCreatorUserInputRequest / Submission 型 | `packages/shared/src/types/skillCreator.ts`                                  |
| WorkflowUiSnapshot 型                        | `packages/shared/src/types/skillCreator.ts`                                  |
| IPC チャネル定数                             | `packages/shared/src/ipc/channels.ts`                                        |
| TASK-SDK-SC-01 概要                          | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md`          |
| UI/UX 親仕様                                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      |
| IPC 正本                                     | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`        |
| セキュリティ正本                             | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| 品質・テスト正本                             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

## 実行手順

1. TASK-SDK-SC-01 の成果物を前提として確認する
2. 要件と受入基準を FR / AC で固定する
3. スコープ外と依存関係を明文化する
4. Phase 2 へ渡す判断材料を整理する

## 統合テスト連携

- Phase 4 で作成する Red テストの対象を AC-01〜AC-13 に直接ひも付ける
- Phase 10 で 4 条件の最終レビューを再確認する
- Phase 13 の完了確認で、要件と受入基準の抜け漏れを最終点検する

## 多角的チェック観点（AIが判断）

| 観点     | 適用理由               | 主な確認点                           |
| -------- | ---------------------- | ------------------------------------ |
| UI/UX    | Renderer UI の要件定義 | 表示順、入力切替、disabled、進捗表示 |
| IPC/依存 | Main/Renderer 境界     | channels.ts と shared 型の参照整合   |
| 品質     | 検証可能な要件定義     | FR/AC の粒度、スコープ外の明確化     |
| 問題解決 | 要件漏れの検出         | 受入基準の抜け、例外ケース、依存漏れ |

## サブタスク管理

- 1-1〜1-4 は順次実行する
- 1-2 の要件定義結果を 1-3 の受入基準へ流用する
- 並列化は Phase 2 以降に切り出す

## 成果物

| 成果物                   | パス                      | 形式     |
| ------------------------ | ------------------------- | -------- |
| 要件定義書（本ファイル） | `phase-1-requirements.md` | Markdown |

## 完了条件

- [ ] `SkillCreatorUserInputRequest` 型の全フィールドを確認した
- [ ] IPCチャネル定数（`SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` / `SKILL_CREATOR_SESSION_CHANNELS.ANSWER`）を確認した
- [ ] FR-001 から FR-008 を定義した
- [ ] 受入基準 AC-01 から AC-13 を定義した
- [ ] スコープ外事項を明記した
- [ ] 回答形式をタイプ別に固定した

## タスク100%実行確認【必須】

- [ ] current facts と canonical refs を確認した
- [ ] 回答形式をタイプ別に固定した
- [ ] 次の Phase へ渡す受入基準を検証可能な粒度にした
- [ ] スコープ外を明文化した

## 次の Phase: Phase 2 (phase-2-design.md)
