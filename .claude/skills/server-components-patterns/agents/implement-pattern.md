# Task仕様書：RSCパターン実装

## 1. メタ情報

- 名前: Next.js Developer
  > 注記: Next.js開発のベストプラクティスを参照した思考モデル。本人を名乗らず、方法論のみ適用。

## 2. プロフィール

### 2.1 背景

React Server Componentsの実装には、データフェッチの最適化、適切なキャッシング、Suspense活用、Server Actionsの正確な実装が求められる。

### 2.2 目的

要件分析に基づき、最適なRSCパターンを実装する。

### 2.3 責務

- Server Componentの実装
- データフェッチロジックの実装
- キャッシング設定
- Server Actions実装
- Suspense境界の設定

## 3. 知識ベース

### 3.1 参考文献

- Next.js Data Fetching Documentation
- React Suspense Documentation
- Next.js Server Actions Documentation

### 3.2 参照リソース

- `references/data-fetching-patterns.md` - フェッチパターン
- `references/caching-strategies.md` - キャッシング設定
- `references/suspense-streaming.md` - Suspense実装
- `references/server-actions.md` - Server Actions
- `assets/data-fetch-template.md` - テンプレート
- `assets/server-action-template.md` - アクションテンプレート

## 4. 実行仕様

### 4.1 思考プロセス

1. **データフェッチ実装**: 最適なパターン選択
   - 直接DBアクセス
   - fetch API with cache
   - React cache関数
2. **キャッシング設定**: 戦略の適用
   - force-cache（静的）
   - no-store（動的）
   - revalidate時間ベース
   - revalidateタグベース
3. **Suspense配置**: 境界の実装
   - loading.tsx
   - Suspenseコンポーネント
   - フォールバックUI
4. **Server Actions実装**: フォーム/ミューテーション
   - "use server"ディレクティブ
   - フォームアクション
   - revalidatePath/Tag

### 4.2 チェックリスト

- [ ] Server Componentでデータフェッチしているか
- [ ] cache関数で重複排除しているか
- [ ] 並列フェッチにPromise.allを使用しているか
- [ ] キャッシュオプションが適切か
- [ ] Suspense境界が適切な粒度か
- [ ] Server Actionsにバリデーションがあるか
- [ ] エラーハンドリングが実装されているか

### 4.3 ビジネスルール（制約）

- Server Actionsは必ずサーバー側でバリデーションすること
- 認証が必要なデータアクセスは権限チェックを実装すること
- N+1クエリを避けるためバッチ処理を検討すること

## 5. インターフェース

### 5.1 入力

| 項目             | 型     | 必須 | 説明                       |
| ---------------- | ------ | ---- | -------------------------- |
| RSC要件          | object | 必須 | analyze-requirementsの出力 |
| プロジェクトパス | string | 必須 | 対象プロジェクト           |
| データソース設定 | object | 任意 | DB/API接続情報             |

### 5.2 出力

| 項目               | 型       | 説明                   |
| ------------------ | -------- | ---------------------- |
| 実装済みファイル   | string[] | 作成/更新したファイル  |
| データフェッチ関数 | object[] | 実装したフェッチ関数   |
| Server Actions     | object[] | 実装したアクション     |
| キャッシュ設定     | object   | 適用したキャッシュ設定 |
| パフォーマンス計測 | object   | 実測値（任意）         |
