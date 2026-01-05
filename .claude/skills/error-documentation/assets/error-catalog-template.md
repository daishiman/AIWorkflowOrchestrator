# エラーカタログテンプレート

## {サービス名} エラーカタログ

### 概要

このドキュメントは{サービス名}で発生しうるすべてのエラーを網羅しています。

### エラーコード体系

```
ERR-{CATEGORY}-{SUBCATEGORY}-{NUMBER}
```

---

## 認証エラー (AUTH)

### ERR-AUTH-TOKEN-001: トークン有効期限切れ

**HTTP Status**: 401 Unauthorized

**概要**: 認証トークンの有効期限が切れました。

**原因**:

- トークン発行から{有効期限}以上経過
- サーバー時刻とクライアント時刻の大幅なずれ

**解決策**:

1. リフレッシュトークンを使用して新しいアクセストークンを取得
2. リフレッシュトークンも期限切れの場合は再ログイン

**コード例**:

```typescript
try {
  const response = await api.get("/users/me");
} catch (error) {
  if (error.code === "ERR-AUTH-TOKEN-001") {
    const newToken = await api.refreshToken();
    // リトライ
  }
}
```

**関連エラー**:

- ERR-AUTH-TOKEN-002: トークン形式不正
- ERR-AUTH-SESSION-001: セッション切れ

---

### ERR-AUTH-TOKEN-002: トークン形式不正

**HTTP Status**: 400 Bad Request

**概要**: 提供されたトークンの形式が不正です。

**原因**:

- トークンが改ざんされている
- Base64エンコードが壊れている
- ヘッダーにトークンが正しく設定されていない

**解決策**:

1. トークンの形式を確認（Bearer {token}）
2. トークンをローカルストレージから再取得
3. 問題が続く場合は再ログイン

---

## データベースエラー (DB)

### ERR-DB-CONN-001: データベース接続エラー

**HTTP Status**: 503 Service Unavailable

**概要**: データベースへの接続に失敗しました。

**原因**:

- データベースサーバーがダウン
- ネットワーク障害
- 接続プールの枯渇

**解決策**（運用者向け）:

1. データベースサーバーの状態確認
2. ネットワーク接続の確認
3. 接続プール設定の見直し

**ユーザー向けメッセージ**:

> 現在サービスに接続できません。しばらく時間をおいて再度お試しください。

---

## 入力検証エラー (VAL)

### ERR-VAL-FIELD-001: 必須フィールド欠落

**HTTP Status**: 400 Bad Request

**概要**: 必須入力フィールドが指定されていません。

**レスポンス例**:

```json
{
  "errorCode": "ERR-VAL-FIELD-001",
  "message": "Required field missing",
  "details": {
    "field": "email",
    "constraint": "required"
  }
}
```

**解決策**:

- `details.field` で指定されたフィールドを確認
- リクエストに必須フィールドを追加

---

## インデックス

| エラーコード       | 概要                   | HTTP Status |
| ------------------ | ---------------------- | ----------- |
| ERR-AUTH-TOKEN-001 | トークン有効期限切れ   | 401         |
| ERR-AUTH-TOKEN-002 | トークン形式不正       | 400         |
| ERR-DB-CONN-001    | データベース接続エラー | 503         |
| ERR-VAL-FIELD-001  | 必須フィールド欠落     | 400         |
