# UT-P0-05-IMPROVE-VERIFY-PERSIST-001

## メタ情報

| 項目       | 値                                                         |
| ---------- | ---------------------------------------------------------- |
| ステータス | 未着手                                                     |
| 優先度     | Medium                                                     |
| 起票日     | 2026-03-30                                                 |
| 起票元     | TASK-P0-05 Phase 12 / unassigned-task-detection.md (UT-01) |
| 関連タスク | TASK-P0-05 (execute-skill-file-writer-integration)         |
| Issue番号  | #1766                                                      |

## 1. なぜこのタスクが必要か（Why）

TASK-P0-05 では `execute()` に対して `SkillFileWriter.persist()` 連携を実装した。
しかし `improve()` と `verify()` は同様のフローを持つにもかかわらず、今回のスコープ外として persist 統合が見送られた。

現状では、ユーザーが "Improve" や "Verify" を実行した場合、生成されたスキルコードがファイルとして保存されず、ユーザー体験に一貫性がない。
`execute()` と同様に persist を統合することで、全ての生成フローでファイル保存が保証される。

## 2. 何を達成するか（What）

以下を実装する：

- `improve()` フローに `SkillFileWriter.persist()` 呼び出しを追加する
- `verify()` フローに `SkillFileWriter.persist()` 呼び出しを追加する
- persist 結果（成功/失敗）を `RuntimeSkillCreatorExecuteResult` 相当の型で返す
- persist 失敗時も LLM 実行結果は保持する（安全設計を維持）
- `persistResult` / `persistError` フィールドを `improve()` / `verify()` の戻り値に追加

## 3. どのように実行するか（How）

1. `execute()` の persist 統合実装（TASK-P0-05）を参照し、同パターンを特定する
2. `improve()` / `verify()` の呼び出しフローで LLM レスポンスを parse する箇所を特定する
3. `parseLlmResponseToContent()` 呼び出し後に `SkillFileWriter.persist()` を追加する
4. 戻り値の型定義を拡張（`persistResult?` / `persistError?` フィールド）
5. ユニットテストを追加：persist 成功・失敗・スキップの各パターン
6. `execute()` との共通ロジックがあれば共通関数への抽出を検討する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                                 | 原因                                                                           | 解決策                                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `improve()` / `verify()` のフローが `execute()` と非対称 | improve/verify は verify-result を優先して返すため、persist タイミングが異なる | LLM レスポンスパース後・結果オブジェクト構築前に persist を挟む設計にする |
| 型定義の拡張と後方互換性                                 | 既存の戻り値型を破壊すると他箇所が壊れる                                       | オプショナルフィールド (`?`) として追加し、未対応コードは null を受け取る |

## 受入基準

| ID   | 基準                                                                      |
| ---- | ------------------------------------------------------------------------- |
| AC-1 | `improve()` 実行後、生成スキルがファイルシステムに保存される              |
| AC-2 | `verify()` 実行後、生成スキルがファイルシステムに保存される               |
| AC-3 | persist 失敗時も LLM の実行結果（verify スコア等）は返却される            |
| AC-4 | `execute()` と共通の persist ロジックはヘルパーに集約されている           |
| AC-5 | 新規ユニットテストが persist 成功・失敗・スキップの全パターンをカバーする |
