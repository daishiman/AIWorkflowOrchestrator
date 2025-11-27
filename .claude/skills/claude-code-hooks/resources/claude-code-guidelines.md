# Claude Code ガイドライン

## Claude Code 統合の特性

### 1. マルチターン編集
- 複数のファイルに対する連続編集
- 状態の一貫性を維持する必要あり
- ロールバック機能のサポート必須

### 2. 自動コード生成
- 完全な実装の提供
- テストコードの同時生成
- ドキュメント更新の自動化

### 3. コンテキスト保持
- プロジェクト全体の理解
- 既存パターンへの準拠
- 命名規則の統一

## 品質基準

### コード品質
- TypeScript: strict mode必須
- ESLint: すべてのルール準拠
- Prettier: 一貫したフォーマット
- テスト: 80%以上のカバレッジ

### セキュリティ
- 機密情報のハードコード禁止
- SQL Injection対策
- XSS対策
- CSRF対策

### パフォーマンス
- O(n²) 以上のアルゴリズム禁止
- 無限ループの排除
- メモリリーク対策

### 保守性
- 関数の複雑度 < 10
- ネストレベル < 4
- 単一責任原則準拠
- DRYの原則

## エラーハンドリング

### 必須の検証
```javascript
// パラメータ検証
if (!input || typeof input !== 'string') {
  throw new Error('Invalid input');
}

// エラーログ
console.error('Operation failed:', error);

// グレースフルデグラデーション
try {
  // 操作
} catch (error) {
  // フォールバック
}
```

### 許容されないパターン
- `console.log` デバッグ
- `any` 型の使用
- `!` non-null assertion
- 例外の無視

## ドキュメント基準

### 必須ドキュメント
- JSDoc コメント (公開API)
- README.md (プロジェクト全体)
- CHANGELOG.md (変更履歴)

### コメント基準
- Why: なぜこの実装か
- What: 何をしているか
- How: どのように動作するか

## テスト基準

### テストケース
- Happy path (正常系)
- Error path (エラー系)
- Edge cases (境界値)

### テスト数
- 関数ごと: 最小3テスト
- コンポーネントごと: 最小5テスト
- 統合テスト: すべての主要フロー

## Git Hooksとの連携

### pre-commit フック
```bash
# 1. 型チェック
tsc --noEmit

# 2. Lint
eslint src/

# 3. Format確認
prettier --check src/

# 4. テスト
jest --coverage
```

### commit-msg フック
```bash
# Conventional Commits確認
# feat(scope): description
```

### pre-push フック
```bash
# 最終確認
# - ビルド成功
# - テスト成功
# - カバレッジ基準達成
```

## Claude Code チェックリスト

### コード生成時
- [ ] すべての型定義完了
- [ ] エラーハンドリング実装
- [ ] テストコード生成
- [ ] JSDocコメント追加

### レビュー時
- [ ] 既存パターン準拠確認
- [ ] セキュリティリスク確認
- [ ] パフォーマンス確認
- [ ] テストカバレッジ確認

### マージ前
- [ ] すべてのテスト合格
- [ ] ビルド成功確認
- [ ] リント確認
- [ ] Prettier確認
