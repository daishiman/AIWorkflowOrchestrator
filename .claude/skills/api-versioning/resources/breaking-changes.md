# 破壊的変更（Breaking Changes）ガイド

## 破壊的変更の定義

### 何が破壊的変更か？

クライアントコードの変更なしでは、既存の統合が**動作しなくなる**変更。

### 破壊的変更の分類

| カテゴリ         | 変更例                     | 影響度    |
| ---------------- | -------------------------- | --------- |
| エンドポイント   | 削除、URL変更              | 🔴 高     |
| HTTPメソッド     | 変更（GET→POST）           | 🔴 高     |
| 認証             | 方式変更、スコープ変更     | 🔴 高     |
| リクエスト       | 必須パラメータ追加、型変更 | 🟡 中     |
| レスポンス       | フィールド削除、型変更     | 🟡 中     |
| ステータスコード | コード変更                 | 🟠 中〜高 |
| 動作             | ビジネスロジック変更       | 🟡 中     |

---

## 詳細な破壊的変更リスト

### エンドポイント関連

| 変更                 | 破壊的？ | 理由                        |
| -------------------- | -------- | --------------------------- |
| エンドポイント削除   | ✅ Yes   | クライアントが404を受け取る |
| URL変更              | ✅ Yes   | クライアントが404を受け取る |
| HTTPメソッド変更     | ✅ Yes   | リクエストが405で拒否される |
| 新エンドポイント追加 | ❌ No    | 既存クライアントに影響なし  |

### リクエスト関連

| 変更                     | 破壊的？ | 理由                               |
| ------------------------ | -------- | ---------------------------------- |
| 必須パラメータ追加       | ✅ Yes   | 既存リクエストがバリデーション失敗 |
| パラメータ削除           | ✅ Yes   | クライアントが未知パラメータを送信 |
| パラメータ名変更         | ✅ Yes   | 既存リクエストがバリデーション失敗 |
| 型変更（string→number）  | ✅ Yes   | パースエラー                       |
| 列挙値の削除             | ✅ Yes   | 既存値が拒否される                 |
| オプションパラメータ追加 | ❌ No    | デフォルト値で処理される           |
| 列挙値の追加             | ❌ No    | 既存値は引き続き有効               |

### レスポンス関連

| 変更             | 破壊的？ | 理由                        |
| ---------------- | -------- | --------------------------- |
| フィールド削除   | ✅ Yes   | クライアントがundefined参照 |
| フィールド名変更 | ✅ Yes   | クライアントがundefined参照 |
| 型変更           | ✅ Yes   | パースエラー                |
| null許可の削除   | ✅ Yes   | null処理ロジックが破損      |
| フィールド追加   | ❌ No    | クライアントは無視すべき    |
| ネスト構造変更   | ✅ Yes   | パス参照が破損              |

### ステータスコード関連

| 変更                        | 破壊的？    | 理由                     |
| --------------------------- | ----------- | ------------------------ |
| 成功コード変更（200→201）   | ⚠️ 条件付き | 厳密なチェックで問題     |
| エラーコード変更（400→422） | ⚠️ 条件付き | エラーハンドリングに影響 |
| 新ステータスコード追加      | ❌ No       | クライアントは処理すべき |

### 認証関連

| 変更             | 破壊的？ | 理由         |
| ---------------- | -------- | ------------ |
| 認証方式変更     | ✅ Yes   | 認証失敗     |
| 必須スコープ追加 | ✅ Yes   | アクセス拒否 |
| トークン形式変更 | ✅ Yes   | 認証失敗     |
| スコープ名変更   | ✅ Yes   | アクセス拒否 |

---

## 非破壊的変更パターン

### 安全な変更

```yaml
# ✅ オプションフィールド追加
User:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
    # 新規追加（オプション）
    avatar_url:
      type: string
      nullable: true

# ✅ 列挙値追加
Status:
  type: string
  enum:
    - active
    - inactive
    - pending # 新規追加

# ✅ 新エンドポイント追加
paths:
  /users/{id}/activity: # 新規追加
    get:
      summary: ユーザーアクティビティ取得
```

### 安全な拡張パターン

**フィールド追加時のベストプラクティス**:

```typescript
// レスポンス v1
{
  "id": "123",
  "name": "John"
}

// レスポンス v1.1（後方互換）
{
  "id": "123",
  "name": "John",
  "avatar_url": null  // 新規追加、nullable
}
```

**クライアント側の推奨実装**:

```typescript
// 未知フィールドを無視する実装
interface User {
  id: string;
  name: string;
  // 将来のフィールドに対応
  [key: string]: unknown;
}
```

---

## 破壊的変更を避ける戦略

### 1. 追加専用設計（Additive Design）

```yaml
# ❌ フィールド名変更
properties:
  fullName:  # first_name + last_name を置き換え

# ✅ 新フィールド追加 + 旧フィールド維持
properties:
  first_name:
    deprecated: true
  last_name:
    deprecated: true
  full_name:
    description: "推奨。first_name + last_name"
```

### 2. バージョニング

```
/api/v1/users  # 旧構造
/api/v2/users  # 新構造（破壊的変更を含む）
```

### 3. 機能フラグ

```http
GET /api/v1/users?feature=new-response-format
```

### 4. コンテンツネゴシエーション

```http
Accept: application/vnd.myapi.v2+json
```

---

## 破壊的変更の導入手順

### ステップ1: 影響評価

```markdown
## 破壊的変更影響評価

### 変更内容

- `GET /users` のレスポンス構造変更
- `first_name` + `last_name` → `full_name`

### 影響を受けるクライアント

- モバイルアプリ v2.0 以下
- サードパーティ連携 3社
- 社内ツール 2つ

### 推定影響範囲

- 月間リクエスト: 100万件
- 影響ユーザー: 1万人
```

### ステップ2: 移行計画

```markdown
## 移行計画

### フェーズ1: 並行期間（4週間）

- v1: 旧構造 + full_name追加
- v2: 新構造

### フェーズ2: 非推奨期間（4週間）

- v1: 非推奨マーク
- v2: 推奨

### フェーズ3: 廃止

- v1: 410 Gone
- v2: 唯一のバージョン
```

### ステップ3: 移行サポート

```typescript
// 変換関数の提供
function migrateUserResponse(v1User: V1User): V2User {
  return {
    id: v1User.id,
    fullName: `${v1User.first_name} ${v1User.last_name}`,
    email: v1User.email,
    createdAt: v1User.created_at,
  };
}

// 移行スクリプトの提供
// scripts/migrate-to-v2.ts
```

---

## 破壊的変更の文書化

### Changelog形式

````markdown
# Changelog

## [2.0.0] - 2025-06-01

### ⚠️ BREAKING CHANGES

#### エンドポイント変更

- `GET /users` レスポンス構造変更
  - 削除: `first_name`, `last_name`
  - 追加: `full_name`

#### 移行方法

```diff
// 変更前
- const name = `${user.first_name} ${user.last_name}`;
// 変更後
+ const name = user.full_name;
```
````

#### 詳細

- 移行ガイド: /docs/migration/v1-to-v2
- サポート: api-support@example.com

````

### OpenAPI拡張

```yaml
x-breaking-changes:
  - version: "2.0.0"
    date: "2025-06-01"
    changes:
      - type: "response_field_removed"
        path: "/users"
        details: "first_name and last_name replaced by full_name"
        migration:
          before: "first_name + last_name"
          after: "full_name"
````

---

## チェックリスト

### 変更前

- [ ] 本当に破壊的変更が必要か？
- [ ] 非破壊的な代替案はないか？
- [ ] 影響評価を完了したか？
- [ ] 移行計画を策定したか？

### 変更中

- [ ] 十分な並行期間を設けたか？
- [ ] 移行ガイドを作成したか？
- [ ] 変換ツールを提供したか？
- [ ] サポート体制を整えたか？

### 変更後

- [ ] Changelogを更新したか？
- [ ] ドキュメントを更新したか？
- [ ] 旧バージョンを適切に廃止したか？
- [ ] 移行完了を確認したか？
