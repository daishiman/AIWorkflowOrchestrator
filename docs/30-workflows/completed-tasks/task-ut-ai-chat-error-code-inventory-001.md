# ChatView ai.chat エラーコード一覧整備 - タスク指示書

## メタ情報

```yaml
issue_number: 1397
task_id: UT-CHATVIEW-ERROR-CODE-INVENTORY-001
task_name: ChatView ai.chat エラーコード一覧整備
category: 改善
target_feature: ChatView / ai.chat error handling
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12（ChatView silent failure fix）
created_date: 2026-03-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-ai-chat-error-code-inventory-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

今回の ChatView 修正では、`AI_UNAVAILABLE`、`API_CALL_FAILED`、`UNKNOWN_ERROR` などのコードを使ってエラー表示を改善した。だが、`window.electronAPI.ai.chat` が返しうるコードの一覧が仕様としてまとまっていないと、今後の拡張時に漏れが出る。

### 1.2 問題点

1. 実装コードと仕様書の間でコード名がぶれる。
2. 新しい失敗理由を追加したとき、表示文言の追加漏れが起きやすい。
3. Phase 12 の `unassigned-task-detection` から仕様改善へ接続しにくい。

### 1.3 放置した場合の影響

- エラーハンドリングの分岐が増えるたびに、文言側が追従できなくなる。
- ChatView 以外の LLM 連携画面でも同じ漏れが再発しやすい。
- 仕様書の「何を返すか」が曖昧なまま残る。

## 2. 何を達成するか（What）

### 2.1 目的

ai.chat のエラーコード一覧を整理し、表示文言・発生条件・責務の境界を明文化する。

### 2.2 最終ゴール

1. エラーコードの正式一覧が 1 つの表で読める。
2. 各コードの意味と UI の対応が追える。
3. ChatView の実装と system spec を同じ語彙で照合できる。

### 2.3 スコープ

#### 含むもの

- ai.chat のエラーコード棚卸し
- 既存コードの意味付けと命名整理
- 表示メッセージとの対応表作成

#### 含まないもの

- ai.chat の新しい失敗パターン実装
- IPC 契約の再設計
- Workspace / Agent 系の UI 変更

### 2.4 成果物

| 成果物                   | 説明                                                  |
| ------------------------ | ----------------------------------------------------- |
| エラーコード一覧         | コード / 意味 / 表示文言 / 発生条件の表               |
| 仕様同期記録             | Phase 12 の summary / changelog / compliance への反映 |
| フォーマル化済み未タスク | `docs/30-workflows/unassigned-task/` 配下の正式タスク |

## 3. どのように実行するか（How）

### 3.1 前提条件

- `callLLMAPI` の戻り値仕様が把握できていること
- ChatView の `getErrorMessage` のマッピングがあること

### 3.2 推奨アプローチ

1. 実装コードから実際のエラーコードを抽出する。
2. コードごとの責務を分類する。
3. UI 表示との対応表にして、Phase 12 の記録へ接続する。

### 3.3 実装時の注意点

| 注意点                             | 理由                       | 対策                             |
| ---------------------------------- | -------------------------- | -------------------------------- |
| 実装コードのコード名だけを羅列する | 意味が見えない             | 発生条件と UI 表示をセットで書く |
| unknown 系の扱いが曖昧になる       | フォールバック漏れが起きる | `UNKNOWN_ERROR` を最後に明記する |
| 別画面のコードまで混ぜる           | 範囲が広がりすぎる         | ChatView 起点の一覧に限定する    |

## 4. 実行手順

1. `callLLMAPI` と `ChatView` 周辺から実際に使っている error code を抽出する。
2. code ごとの意味、発生条件、表示文言、責務境界を表にまとめる。
3. raw message fallback をどの条件で使うかを仕様に明記する。
4. system spec、workflow-local 文書、未タスク記述の語彙を統一する。
5. 差分があれば backlog または follow-up task へ切り出す。

## 5. 完了条件チェックリスト

- [ ] ai.chat の error code 一覧が 1 つの表で読める
- [ ] 各 code の意味、発生条件、表示文言が追える
- [ ] raw message fallback の条件が明文化されている
- [ ] system spec と実装の用語が一致している
- [ ] Phase 12 の記録と follow-up task の記述が current state と一致している

## 6. 検証方法

### 6.1 実装照合

- `manual-test-result.md` の TC-ID と code 一覧の対応が取れることを確認する。
- `ChatView` の `getErrorMessage` 相当ロジックと system spec の語彙が一致することを確認する。
- raw message fallback が code inventory と矛盾しないことを確認する。

### 6.2 ドキュメント照合

- Phase 12 の未タスク化対象が 0 件ではなく、formalize できていることを確認する。
- `docs/30-workflows/unassigned-task/` 配下の本指示書が current task format を満たすことを確認する。

## 7. リスクと対策

| リスク                             | 影響                       | 対策                                                     |
| ---------------------------------- | -------------------------- | -------------------------------------------------------- |
| code 一覧が実装追従できない        | 表だけ古くなる             | 実装抽出を先に行い、仕様は後追いではなく同一更新で閉じる |
| raw message と code の責務が混ざる | UI 側の分岐が不安定になる  | canonical code と raw message fallback を別列で管理する  |
| 別画面の code を混在させる         | 範囲が膨らみ管理不能になる | ChatView 起点の ai.chat に限定して棚卸しする             |

## 8. 参照情報

- `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`
- `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix.md`
- `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`

## 9. 備考

- 本タスクは実装の追加よりも、code inventory の明文化と drift 防止が主目的である。
- `task-ut-chatview-error-banner-i18n-001.md` と合わせて実施すると、文言と code の責務分離を同時に閉じやすい。

### 9.1 今回実装で苦戦した箇所

| 苦戦箇所                                           | 症状                                                                                     | 今回の対処                                                                                 | 次回の簡潔ルール                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `AIChatResponse.error` を code-only と誤読しやすい | Main 側の user-facing message string を Renderer が受ける current runtime を説明できない | `llm-ipc-types.md` と `error-handling-core.md` に code or raw message transport を追記した | `error: string` を見たら code と raw message の両経路を先に洗い出す            |
| `chatError` state の責務が spec と UI でずれやすい | state を code 専用と書くと raw message fallback の説明が消える                           | `arch-state-management-core.md` に code または raw message string を保持すると明記した     | store transport と UI 変換規則を同一 wave で同期する                           |
| root canonical path と legacy path が混在しやすい  | Task 01 root が `tasks/01-*` と root 直下で揺れ、follow-up 参照先もずれやすい            | artifact inventory と legacy register を追加して current canonical set を固定した          | code inventory 参照先は legacy note ではなく canonical path を唯一の入口にする |
