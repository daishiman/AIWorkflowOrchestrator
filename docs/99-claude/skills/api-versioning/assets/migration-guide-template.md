# API Migration Guide: v{{OLD_VERSION}} → v{{NEW_VERSION}}

> **移行期限**: {{SUNSET_DATE}}
> **サポート連絡先**: {{SUPPORT_EMAIL}}

## 概要

API v{{OLD_VERSION}} から v{{NEW_VERSION}} への移行ガイドです。
v{{OLD_VERSION}} は {{SUNSET_DATE}} に廃止されます。

## 変更サマリー

| カテゴリ   | 変更数                | 影響度 |
| ---------- | --------------------- | ------ |
| 破壊的変更 | {{BREAKING_COUNT}}    | 🔴 高  |
| 非推奨化   | {{DEPRECATED_COUNT}}  | 🟡 中  |
| 新機能     | {{NEW_FEATURE_COUNT}} | 🟢 低  |

---

## 破壊的変更

### 1. {{BREAKING_CHANGE_TITLE_1}}

**変更内容**:
{{BREAKING_CHANGE_DESCRIPTION_1}}

**変更前（v{{OLD_VERSION}}）**:

```json
{{OLD_REQUEST_RESPONSE_1}}
```

**変更後（v{{NEW_VERSION}}）**:

```json
{{NEW_REQUEST_RESPONSE_1}}
```

**移行方法**:

```typescript
// 変更前
{
  {
    OLD_CODE_1;
  }
}

// 変更後
{
  {
    NEW_CODE_1;
  }
}
```

---

### 2. {{BREAKING_CHANGE_TITLE_2}}

**変更内容**:
{{BREAKING_CHANGE_DESCRIPTION_2}}

**変更前**:

```
{{OLD_EXAMPLE_2}}
```

**変更後**:

```
{{NEW_EXAMPLE_2}}
```

**移行方法**:
{{MIGRATION_INSTRUCTIONS_2}}

---

## 非推奨化されたエンドポイント

| v{{OLD_VERSION}} エンドポイント | v{{NEW_VERSION}} 代替 | 廃止日          |
| ------------------------------- | --------------------- | --------------- |
| {{OLD_ENDPOINT_1}}              | {{NEW_ENDPOINT_1}}    | {{SUNSET_DATE}} |
| {{OLD_ENDPOINT_2}}              | {{NEW_ENDPOINT_2}}    | {{SUNSET_DATE}} |

---

## 新機能

### {{NEW_FEATURE_1}}

**説明**: {{NEW_FEATURE_1_DESCRIPTION}}

**エンドポイント**: `{{NEW_FEATURE_1_ENDPOINT}}`

**使用例**:

```bash
curl -X GET "{{API_BASE_URL}}/{{NEW_VERSION}}/{{NEW_FEATURE_1_PATH}}" \
  -H "Authorization: Bearer {{TOKEN}}"
```

---

## 移行チェックリスト

### 準備フェーズ

- [ ] 現在使用中のv{{OLD_VERSION}}エンドポイントを特定
- [ ] 影響を受けるコードベースを把握
- [ ] 移行スケジュールを策定
- [ ] テスト環境でv{{NEW_VERSION}}を検証

### 実装フェーズ

- [ ] APIクライアントのベースURLを更新
- [ ] リクエスト形式の変更を適用
- [ ] レスポンス処理の変更を適用
- [ ] エラーハンドリングを更新

### 検証フェーズ

- [ ] 全エンドポイントの動作確認
- [ ] エラーケースのテスト
- [ ] パフォーマンステスト
- [ ] 本番環境への段階的ロールアウト

### 完了フェーズ

- [ ] v{{OLD_VERSION}}への依存を完全に削除
- [ ] 監視設定を更新
- [ ] ドキュメントを更新
- [ ] 移行完了報告

---

## FAQ

### Q: 並行期間中に両バージョンを使用できますか？

はい、{{SUNSET_DATE}}まで両バージョンが利用可能です。
段階的な移行を推奨します。

### Q: 移行に失敗した場合はどうなりますか？

{{SUNSET_DATE}}以降、v{{OLD_VERSION}}へのリクエストは
`410 Gone` エラーを返します。
v{{NEW_VERSION}}への移行が必須です。

### Q: 移行サポートはありますか？

はい、{{SUPPORT_EMAIL}}までお問い合わせください。
技術サポートチームが対応いたします。

---

## サポート

| チャネル     | 連絡先            |
| ------------ | ----------------- |
| メール       | {{SUPPORT_EMAIL}} |
| Slack        | {{SLACK_CHANNEL}} |
| ドキュメント | {{DOCS_URL}}      |

---

## 変更履歴

| 日付                   | 変更内容 |
| ---------------------- | -------- |
| {{GUIDE_CREATED_DATE}} | 初版作成 |
