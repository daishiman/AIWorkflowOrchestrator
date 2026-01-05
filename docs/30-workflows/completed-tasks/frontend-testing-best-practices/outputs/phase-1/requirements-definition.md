# 要件定義書 - フロントエンドテストベストプラクティス

## 現状分析

### テスト構成

| 項目           | 現状        | 目標    |
| -------------- | ----------- | ------- |
| テストファイル | 206ファイル | 維持    |
| E2Eテスト      | 7本         | 10-15本 |
| カバレッジ     | 未設定      | 80%以上 |
| MSW            | 未導入      | 導入    |
| Vitest UI      | 未導入      | 導入    |

### 既存E2Eテスト

1. auth.spec.ts - 認証フロー
2. chat-history-export.spec.ts - チャット履歴エクスポート
3. chat-history-navigation.spec.ts - チャット履歴ナビゲーション
4. file-selection.spec.ts - ファイル選択
5. system-prompt.spec.ts - システムプロンプト
6. workspace.spec.ts - ワークスペース

---

## 機能要件（FR）

### FR-1: MSW導入

- MSWパッケージのインストール
- Supabase Auth APIモック実装
- Anthropic Messages APIモック実装
- 既存テストのMSW環境対応

### FR-2: Vitest UI導入

- @vitest/uiパッケージのインストール
- package.jsonへのtest:uiスクリプト追加
- カバレッジマップ表示対応

### FR-3: E2Eテスト拡充

- 新規E2Eテスト3-8本の追加
- クリティカルフローのカバー
- flaky test対策

### FR-4: カバレッジ閾値設定

- desktop: 行80%, 関数80%, 分岐60%
- shared: 行80%, 関数80%, 分岐60%
- CI/CDでの自動チェック

### FR-5: テストユーティリティ整備

- カスタムレンダー関数
- Zustandストアモックヘルパー
- テストデータファクトリー

### FR-6: CI/CD統合

- GitHub Actionsワークフロー更新
- カバレッジレポート生成
- E2Eテスト自動実行

---

## 非機能要件（NFR）

### NFR-1: パフォーマンス

- テスト実行時間: 10秒以下（MSW導入後）
- CI/CD全体: 5分以内

### NFR-2: 信頼性

- E2E flaky rate: 0%
- 全テスト成功率: 100%

### NFR-3: 保守性

- 新規開発者がドキュメントだけでテスト実行可能
- テストコードの重複最小化

### NFR-4: セキュリティ

- モックにAPIキー等の機密情報を含まない
- テストコードに本番APIキーを含まない

---

## スコープ

### 含むもの

- MSW (Mock Service Worker) のセットアップ
- API mocks/handlers の実装
- Vitest UI の導入と設定
- E2Eテストシナリオ設計と実装（3-8本追加）
- カバレッジ閾値設定（80%目標）
- テストユーティリティヘルパー関数
- CI/CD統合設定
- テストドキュメント作成

### 含まないもの

- Storybook導入
- Visual Regression Testing
- パフォーマンステスト
- セキュリティテスト
