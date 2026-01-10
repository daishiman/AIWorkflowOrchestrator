# Task仕様書：リソースプロバイダー実装

## 1. メタ情報

- 名前: Martin Fowler
  > 注記: エンタープライズアプリケーションパターンの著者。実装パターンの方法論のみ適用。

## 2. プロフィール

### 2.1 背景

MCPリソースプロバイダーは、リソースモデル設計書に基づいて実装される。
良いプロバイダーは、明確なインターフェース、適切なエラーハンドリング、
キャッシュ対応を備える。

### 2.2 目的

リソースモデル設計書に基づいて、MCPリソースプロバイダーを実装し、
検証スクリプトで品質を担保する。

### 2.3 責務

- リソース定義JSONの作成
- プロバイダークラスの実装
- 検証スクリプトによる品質チェック
- キャッシュ戦略の適用

## 3. 知識ベース

### 3.1 参考文献

- MCP Resource Protocol - MCPリソース仕様
- `assets/resource-definition-template.json` - リソース定義テンプレート
- `assets/resource-provider-template.ts` - プロバイダーテンプレート
- `references/caching-strategies.md` - キャッシュ戦略ガイド

## 4. 実行仕様

### 4.1 思考プロセス

```
1. リソース定義作成
   - テンプレートを参照（assets/resource-definition-template.json）
   - 設計書のエンティティを定義に反映
   - validate-resource-definition.mjsで検証

2. プロバイダー実装
   - テンプレートを参照（assets/resource-provider-template.ts）
   - read/list/subscribeメソッドを実装
   - エラーハンドリングを追加

3. URI検証
   - validate-uri.mjsでURI形式を検証
   - パストラバーサル対策を確認
   - 許可スキームの制限を確認

4. キャッシュ適用
   - caching-strategies.mdを参照
   - キャッシュレイヤーを選定
   - 無効化戦略を決定
```

### 4.2 チェックリスト

- [ ] リソース定義JSONは`validate-resource-definition.mjs`で検証済みか
- [ ] プロバイダーはテンプレートに従って実装したか
- [ ] read/list/subscribeメソッドを実装したか
- [ ] エラーハンドリングは適切か
- [ ] URI形式は`validate-uri.mjs`で検証済みか
- [ ] キャッシュ戦略を検討・適用したか
- [ ] セキュリティ対策を実装したか

### 4.3 ビジネスルール（制約）

```yaml
リソース定義制約:
  必須フィールド:
    - uri: リソースURI
    - name: 表示名
    - mimeType: MIME-type
  オプション:
    - description: 説明
    - size: サイズ（バイト）

プロバイダー実装制約:
  必須メソッド:
    - list(): 利用可能リソース一覧
    - read(uri): リソース内容取得
  オプション:
    - subscribe(uri): リソース変更監視

エラーハンドリング:
  - ResourceNotFound: 404相当
  - InvalidUri: 400相当
  - Unauthorized: 401相当
  - InternalError: 500相当

キャッシュ:
  - TTL設定必須
  - 無効化戦略必須
  - キャッシュキー設計
```

## 5. インターフェース

### 5.1 入力

```yaml
必須:
  - resource_model: リソースモデル設計書（Phase 1の出力）

オプション:
  - existing_provider: 既存プロバイダー（拡張時）
  - cache_config: キャッシュ設定
```

### 5.2 出力

```yaml
プロバイダー実装:
  files:
    - path: "resource-definition.json"
      content: "リソース定義JSON"
    - path: "resource-provider.ts"
      content: "プロバイダー実装"

  validation:
    - script: "validate-resource-definition.mjs"
      result: "pass/fail"
    - script: "validate-uri.mjs"
      result: "pass/fail"

  cache_strategy:
    layer: "memory/file/distributed"
    ttl: "TTL設定"
    invalidation: "無効化戦略"
```
