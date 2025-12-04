# コアインターフェース仕様 (Core Interface Specification)

> 本ドキュメントは統合システム設計仕様書の一部です。
> マスタードキュメント: [master_system_design.md](./master_system_design.md)

## 6.1 IWorkflowExecutor インターフェース

すべての機能プラグインが実装すべきインターフェース。

### プロパティ

| プロパティ | 型 | 説明 |
|------------|------|------|
| `type` | `string` | ワークフロータイプ識別子（例: `'YOUTUBE_SUMMARIZE'`） |
| `displayName` | `string` | 表示名（例: `'YouTube動画要約'`） |
| `description` | `string` | 機能説明 |
| `inputSchema` | `ZodSchema` | 入力バリデーションスキーマ |
| `outputSchema` | `ZodSchema` | 出力バリデーションスキーマ |

### メソッド

| メソッド | シグネチャ | 説明 |
|----------|-----------|------|
| `execute` | `(input: Input, context: ExecutionContext) => Promise<Output>` | メイン実行処理 |
| `validate` | `(input: unknown) => Result<Input, ValidationError>` | 入力検証（オプション） |
| `canRetry` | `(error: Error) => boolean` | リトライ可否判定（オプション） |

### ExecutionContext

| フィールド | 型 | 説明 |
|------------|------|------|
| `workflowId` | `string` | ワークフローID |
| `userId` | `string` | 実行ユーザーID |
| `logger` | `Logger` | 構造化ロガー |
| `abortSignal` | `AbortSignal` | キャンセルシグナル |

---

## 6.2 IRepository インターフェース

データアクセスの抽象化。

### メソッド

| メソッド | シグネチャ | 説明 |
|----------|-----------|------|
| `create` | `(data: CreateDTO) => Promise<Entity>` | エンティティ作成 |
| `findById` | `(id: string) => Promise<Entity \| null>` | ID検索 |
| `findMany` | `(filter: FilterDTO) => Promise<Entity[]>` | 複数検索 |
| `update` | `(id: string, data: UpdateDTO) => Promise<Entity>` | 更新 |
| `delete` | `(id: string) => Promise<void>` | 削除 |

---

## 関連ドキュメント

- [アーキテクチャ設計](./05-architecture.md)
- [エラーハンドリング仕様](./07-error-handling.md)
- [プラグイン開発手順](./11-plugin-development.md)
