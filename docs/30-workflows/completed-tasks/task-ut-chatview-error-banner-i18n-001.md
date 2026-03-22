# ChatView エラーメッセージ i18n 対応 - タスク指示書

## メタ情報

```yaml
issue_number: 1398
task_id: UT-CHATVIEW-ERROR-BANNER-I18N-001
task_name: ChatView エラーメッセージ i18n 対応
category: 改善
target_feature: ChatView / エラーバナー
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12（ChatView silent failure fix）
created_date: 2026-03-20
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-chatview-error-banner-i18n-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ChatView のエラーバナーは、現時点で日本語メッセージを直接返している。今回の silent failure 修正では、まず「見える化」を優先したが、将来の多言語展開を考えると文言の直書きは再利用性が低い。

### 1.2 問題点

1. 日本語以外の UI に切り替えたときにメッセージを差し替えられない。
2. メッセージ変更のたびに renderer 実装を修正する必要がある。
3. `ERROR_MESSAGES` と system spec の対応関係が分散しやすい。

### 1.3 放置した場合の影響

- 国際化が必要になったときに ChatView だけ後追い実装になる。
- 文言修正がコード変更とセットになり、レビュー負荷が上がる。
- エラーコードと表示文言の対応が仕様と実装でずれやすい。

## 2. 何を達成するか（What）

### 2.1 目的

ChatView のエラーメッセージを i18n 対応の形へ整理し、文言を差し替え可能にする。

### 2.2 最終ゴール

1. エラーメッセージの辞書を 1 箇所に集約する。
2. 言語キーに応じた表示切り替えができる。
3. `ERROR_MESSAGES` の管理責務を renderer 内で閉じない。

### 2.3 スコープ

#### 含むもの

- ChatView のエラー文言の辞書化
- エラーコードから文言を引く層の分離
- 既存の日本語メッセージの i18n 化

#### 含まないもの

- アプリ全体の UI 国際化
- すべての画面の文言切り替え
- 設定画面への言語切り替え UI 追加

### 2.4 成果物

| 成果物              | 説明                                       |
| ------------------- | ------------------------------------------ |
| i18n メッセージ定義 | ChatView エラー用の message map            |
| 参照ユーティリティ  | エラーコードから表示文言を返す関数         |
| 更新済み UI         | ChatView のエラーバナー                    |
| 仕様同期記録        | Phase 12 の summary / changelog / feedback |

## 3. どのように実行するか（How）

### 3.1 前提条件

- ChatView の silent failure 修正が完了していること
- 現在の `chatError` / `clearChatError` の流れが理解できていること

### 3.2 推奨アプローチ

1. まずエラーコード一覧を整理する。
2. 次に文言辞書を作る。
3. 最後に ChatView から直接文言を持たないように切り替える。

### 3.3 実装時の注意点

| 注意点                 | 理由                                     | 対策                                 |
| ---------------------- | ---------------------------------------- | ------------------------------------ |
| 文言の直書きが残る     | 一部だけ i18n 化しても保守性が上がらない | `ERROR_MESSAGES` を 1 箇所に閉じる   |
| 翻訳キーが増えすぎる   | エラーコードと文言の対応が見えにくくなる | エラー種別ごとに namespace を分ける  |
| 既存 UI の文脈が壊れる | バナーの位置や消去挙動は維持したい       | 表示ロジックと文言ロジックを分離する |

## 4. 実行手順

1. ChatView で使っているエラーコードと表示文言の対応を洗い出す。
2. renderer 直書きの日本語文言を message map へ寄せる。
3. エラーコードから表示文言を返す関数を切り出す。
4. 未知コード時の fallback 文言を決める。
5. 既存バナーの表示位置、dismiss、auto clear を壊していないか確認する。

## 5. 完了条件チェックリスト

- [ ] ChatView エラー文言が 1 箇所の辞書で管理されている
- [ ] renderer 直書きの日本語文言が削減されている
- [ ] 既知コードと未知コードの両方で表示文言が決まる
- [ ] バナー UI の表示位置、dismiss、auto clear の挙動が維持されている
- [ ] system spec と実装でエラー文言責務の説明が一致している

## 6. 検証方法

### 6.1 画面確認

- 英語 locale 相当でも同じエラーコードから表示文言が引けることを確認する。
- 未知コードは fallback 文言に落ちることを確認する。
- 文言差し替え後も UI 構造が変わらないことを確認する。

### 6.2 文書確認

- system spec のエラーコード一覧と message map の責務が一致していることを確認する。
- `docs/30-workflows/unassigned-task/` 配下の本指示書が current task format を維持していることを確認する。

## 7. リスクと対策

| リスク                           | 影響                                | 対策                                                 |
| -------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| i18n 化が ChatView だけで閉じる  | 他画面へ再利用しにくい              | message map と resolver を画面外へ出せる形で整理する |
| 未知コード fallback が消える     | silent failure に近い印象が再発する | unknown 系の表示文言を必ず残す                       |
| 文言差し替えで既存テストが壊れる | 画面回帰の見落とし                  | 表示文言と UI 構造の責務を分離して検証する           |

## 8. 参照情報

- `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`
- `docs/30-workflows/completed-tasks/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-chat-llm-integration-fix.md`
- `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`

## 9. 備考

- 本タスクは今回の silent failure 修正のスコープ外として formalize した follow-up である。
- 実装着手時は `task-ut-ai-chat-error-code-inventory-001.md` と合わせて進めると責務分離しやすい。

### 9.1 今回実装で苦戦した箇所

| 苦戦箇所                                                  | 症状                                                               | 今回の対処                                                                        | 次回の簡潔ルール                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| error code と表示文言の責務が 1 箇所に閉じていない        | `ChatView` に直書き日本語文言が残り、system spec と 1:1 で追えない | まず visible error 化を優先し、i18n 化は follow-up へ切り出した                   | 先に code inventory を固定し、その後に message map を分離する                  |
| raw message fallback と code message の扱いが混ざりやすい | code 変換用の辞書だけを作ると、非 code 文字列の表示規則が落ちる    | `llm-ipc-types` / `error-handling-core` 側で code or raw message を先に明文化した | 文言辞書化の前に「canonical code」と「raw message fallback」を別責務で定義する |
| UI 挙動と文言差し替えを同時に変えると回帰点が増える       | dismiss / auto clear / banner position の regressions を拾いにくい | 今回は UI 挙動を固定し、文言改善だけを未タスクへ分離した                          | 表示ロジック変更と文言変更は別タスクに分ける                                   |
