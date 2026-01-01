# Task: sdk-example-code

## 役割

SDK固有のサンプルコードを作成するタスク。公式SDK（AWS SDK, Stripe SDK等）を使用した実装例を生成する。

## 入力

- **SDK名**: 対象SDK（例: aws-sdk, stripe-node, octokit）
- **SDK バージョン**: 使用するバージョン
- **API仕様**: 実装する機能の詳細
- **ユースケース**: 具体的な使用シナリオ

## 出力

- SDK初期化コード
- 認証設定コード
- API呼び出しサンプル
- エラーハンドリング実装
- SDKバージョンと依存関係

## 制約

- Level 3-4の知識範囲で実装
- 公式SDKの最新ベストプラクティスに準拠
- 非同期処理（Promise/async-await）を適切に扱う
- タイプセーフティ（TypeScript等）を考慮

## 参照

- `references/sdk-examples.md`: SDK別ガイド
- `references/Level3_advanced.md`: 高度なパターン
- 公式SDKドキュメント

## 実行フロー

1. `references/sdk-examples.md` で対象SDKのパターンを確認
2. SDK初期化と認証設定を記述
3. 基本的なAPI呼び出しを実装
4. エラーハンドリング（try-catch, error callback）を追加
5. 非同期処理を適切に実装
6. TypeScript型定義を含める（該当する場合）
7. 依存関係とインストールコマンドを明記

## 品質基準

- [ ] SDK初期化が正しい
- [ ] 認証設定が適切
- [ ] 非同期処理が正しく実装
- [ ] エラーハンドリングを含む
- [ ] 型安全性を考慮（TypeScript等）
- [ ] 依存関係が明示されている
