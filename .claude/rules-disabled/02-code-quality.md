# コード品質ルール

> 正本: `aiworkflow-requirements/references/error-handling.md`, `development-guidelines.md`

## TypeScript 型安全

- DO: `strict: true` で厳密な型チェックを強制
- DO: ユニオン型の網羅には `Record<EnumType, Config>` を使用
- DON'T: `any` 型を使用しない
- DON'T: `@ts-ignore` / `@ts-expect-error` を安易に使わない（使う場合は理由コメント必須）
- DON'T: 型アサーション（`as`）でバリデーションを回避しない

## エラーハンドリング

### 原則

- DO: サービス層のエラーは `Result<T, E>` パターンで明示的に返す
- DON'T: try/catch で握りつぶさない — エラーを上位に伝播させる
- DON'T: パスワード・APIキー・PII をログに含めない
  → 詳細: [04-electron-security.md#IPC セキュリティ原則](./04-electron-security.md)

### エラーカテゴリ

| カテゴリ               | コード範囲 | リトライ |
| ---------------------- | ---------- | -------- |
| Validation Error       | 1000-1999  | 不可     |
| Business Error         | 2000-2999  | 不可     |
| External Service Error | 3000-3999  | **可能** |
| Infrastructure Error   | 4000-4999  | **可能** |
| Internal Error         | 5000-5999  | 不可     |

## テスト駆動開発（TDD）

### 原則

- DO: **テストファースト** — 実装前にテストケースを設計
- DO: Red → Green → Refactor のサイクルを守る
- DO: 新機能には必ず対応するテストを追加
- DO: 境界値・異常系・組合せを網羅的にテスト

### カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### テスト設計の注意

- DO: テスト間で状態を共有しない（`beforeEach` でリセット）
  → 失敗事例: [06-known-pitfalls.md#P9](./06-known-pitfalls.md)
- DON'T: テスト実行順序に依存する設計にしない

## コーディング規約

- DO: boolean 変数名は `is` / `has` / `can` / `should` プレフィックス
- DO: コンポーネントは Atomic Design（atoms / molecules / organisms）で構成
- DON'T: 未使用の `import` を残さない
- DON'T: 仕様書・コメントに曖昧表現（「適切に」「必要に応じて」「など」）を使わない — 条件・基準を明示する
