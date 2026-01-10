# ワークフロー インターフェース仕様

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## IWorkflowExecutor インターフェース

すべての機能プラグインが実装すべきインターフェース。

### プロパティ

| プロパティ   | 型        | 必須 | 説明                                              |
| ------------ | --------- | ---- | ------------------------------------------------- |
| type         | string    | 必須 | ワークフロータイプ識別子（例: YOUTUBE_SUMMARIZE） |
| displayName  | string    | 必須 | 表示名（例: YouTube動画要約）                     |
| description  | string    | 必須 | 機能説明（ユーザー向け）                          |
| inputSchema  | ZodSchema | 必須 | 入力バリデーションスキーマ                        |
| outputSchema | ZodSchema | 必須 | 出力バリデーションスキーマ                        |

### メソッド

| メソッド | 戻り値  | 必須 | 説明                                                   |
| -------- | ------- | ---- | ------------------------------------------------------ |
| execute  | Promise | 必須 | メイン実行処理。入力を受け取り、処理結果を返す         |
| validate | Result  | 任意 | カスタム入力検証。スキーマ以上の検証が必要な場合に実装 |
| canRetry | boolean | 任意 | リトライ可否判定。エラーに応じてリトライすべきか判断   |
| onCancel | Promise | 任意 | キャンセル時のクリーンアップ処理                       |

### ExecutionContext

Executor実行時に渡されるコンテキスト情報。

| フィールド  | 型          | 説明                                           |
| ----------- | ----------- | ---------------------------------------------- |
| workflowId  | string      | 実行中のワークフローID                         |
| userId      | string      | 実行ユーザーID                                 |
| logger      | Logger      | 構造化ロガー（ワークフローIDが自動付与される） |
| abortSignal | AbortSignal | キャンセルシグナル                             |
| retryCount  | number      | 現在のリトライ回数（0から開始）                |
| startedAt   | Date        | 実行開始時刻                                   |

### execute メソッドの実装指針

**入力処理**:

- inputSchemaで定義したスキーマによる自動バリデーションが行われる
- 追加の検証が必要な場合はvalidateメソッドを実装する
- バリデーションエラーはValidationErrorとしてスローする

**メイン処理**:

- 長時間処理の場合はabortSignalを定期的にチェックする
- 進捗ログはloggerを通じて出力する
- 外部API呼び出しには適切なタイムアウトを設定する

**出力処理**:

- outputSchemaに準拠したオブジェクトを返す
- 部分的な結果を返す場合もスキーマに準拠させる

---
