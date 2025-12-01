# セキュリティ設定チェックリスト

## HTTPセキュリティヘッダー

### Helmet.js導入

- [ ] Helmet.jsミドルウェアが導入されているか
- [ ] 本番環境ですべてのヘッダーが有効か

### Content-Security-Policy (CSP)

- [ ] CSP設定が存在するか
- [ ] 'unsafe-inline'を本番環境で避けているか
- [ ] 'unsafe-eval'を使用していないか
- [ ] nonceまたはhashを使用しているか
- [ ] default-srcが設定されているか

### Strict-Transport-Security (HSTS)

- [ ] HSTS ヘッダーが設定されているか
- [ ] max-age は1年以上（31536000秒）か
- [ ] includeSubDomains が設定されているか
- [ ] preload オプション検討（該当する場合）

### その他ヘッダー

- [ ] X-Frame-Options: DENY または SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: no-referrer または strict-origin-when-cross-origin
- [ ] Permissions-Policy: 不要な機能を無効化

---

## CORS設定

### オリジン制限

- [ ] 許可オリジンがホワイトリストで制限されているか
- [ ] origin: '*' と credentials: true の組み合わせを避けているか
- [ ] 動的オリジン許可時に検証があるか

### メソッドとヘッダー

- [ ] 必要最小限のHTTPメソッドのみ許可
- [ ] 必要最小限のヘッダーのみ許可
- [ ] 不要なメソッド（TRACE、CONNECT等）は許可していないか

### その他

- [ ] プリフライトキャッシュ（maxAge）が設定されているか
- [ ] credentials設定が適切か

---

## 環境変数管理

### .envファイル

- [ ] .env ファイルが .gitignore に含まれているか
- [ ] .env.example でテンプレートを提供しているか
- [ ] 本番と開発で異なる.envファイルを使用しているか

### シークレット

- [ ] APIキー、パスワードがハードコードされていないか
- [ ] 環境変数から取得しているか
- [ ] 起動時に必須環境変数をチェックしているか

### .gitignore

- [ ] .env、.env.local、.env.*.local が含まれているか
- [ ] *.key、*.pem、*.p12、*.pfx が含まれているか
- [ ] credentials.json、auth.json等が含まれているか

---

## ロギングとモニタリング

### セキュリティロギング

- [ ] 認証成功/失敗が記録されているか
- [ ] 認可失敗（403エラー）が記録されているか
- [ ] セキュリティ例外が記録されているか
- [ ] ログは構造化されているか（JSON形式推奨）

### センシティブデータ保護

- [ ] パスワードがログに出力されていないか
- [ ] トークン、セッションIDがログに出力されていないか
- [ ] クレジットカード情報がログに出力されていないか

---

## Rate Limiting

### 実装確認

- [ ] 認証エンドポイントにRate Limitingがあるか
- [ ] グローバルRate Limitingがあるか
- [ ] レート超過時に429ステータスコードが返されるか
- [ ] Retry-Afterヘッダーが設定されているか

### 設定妥当性

- [ ] 認証: 5リクエスト/15分程度
- [ ] API全体: 100リクエスト/1時間程度
- [ ] 識別子は適切か（IP、ユーザー、セッション）

---

## HTTPS/TLS

### HTTPS強制

- [ ] 本番環境でHTTPSが強制されているか
- [ ] HTTPリクエストがHTTPSにリダイレクトされるか
- [ ] HSTS ヘッダーが設定されているか

### TLS設定

- [ ] TLS 1.2以上を使用しているか
- [ ] SSL 2.0、SSL 3.0、TLS 1.0、TLS 1.1が無効化されているか
- [ ] 前方秘匿性のある暗号スイートを使用しているか
- [ ] 証明書検証が有効か

---

## エラーハンドリング

### 情報漏洩防止

- [ ] 本番環境でスタックトレースを返していないか
- [ ] エラーメッセージは一般的か（詳細を隠す）
- [ ] 内部パス、DB情報が漏洩していないか
- [ ] デバッグ情報が本番環境で無効化されているか

### ログ記録

- [ ] すべてのエラーがサーバーサイドでログ記録されているか
- [ ] エラーログにコンテキスト情報があるか
- [ ] エラーログからスタックトレースを取得できるか（サーバー側）

---

## セッションセキュリティ

### Cookie属性

- [ ] HttpOnly: true
- [ ] Secure: true（本番環境）
- [ ] SameSite: 'strict' または 'lax'
- [ ] 適切な有効期限設定

### セッションストア

- [ ] 本番環境でRedis/DB使用（メモリストアは不可）
- [ ] セッション有効期限が設定されているか
- [ ] 期限切れセッションの自動削除があるか

---

## ファイルアップロード

### 検証

- [ ] ファイルタイプ検証があるか
- [ ] ファイルサイズ制限があるか
- [ ] ファイル内容検証があるか（Magic Numberチェック）
- [ ] パストラバーサル対策があるか

### 保存

- [ ] ファイル名サニタイズがあるか
- [ ] ランダムファイル名生成（UUID等）
- [ ] 専用ディレクトリに保存（/uploads、/tmp等）
- [ ] 実行権限を付与していないか

---

## データベースセキュリティ

### 接続セキュリティ

- [ ] DB接続文字列が環境変数で管理されているか
- [ ] SSL/TLS接続を使用しているか（本番環境）
- [ ] 最小権限のDBユーザーを使用しているか

### クエリセキュリティ

- [ ] パラメータ化クエリを使用しているか
- [ ] ORMを使用しているか（Drizzle、Prisma等）
- [ ] 文字列連結クエリを避けているか

---

## 依存関係セキュリティ

### スキャン

- [ ] pnpm audit または同等のツールを定期実行しているか
- [ ] CI/CDで依存関係スキャンがあるか
- [ ] Critical/High脆弱性は修正されているか

### 更新

- [ ] 依存関係は定期的に更新されているか
- [ ] セキュリティパッチは速やかに適用されているか
- [ ] Dependabot等の自動更新ツールを使用しているか

---

## CI/CD セキュリティ

### シークレット管理

- [ ] GitHub Secrets / Environment Secretsを使用しているか
- [ ] シークレットがワークフローファイルにハードコードされていないか
- [ ] 最小権限のトークンを使用しているか

### セキュリティスキャン

- [ ] 依存関係スキャンがCI/CDに統合されているか
- [ ] コード静的解析（SAST）があるか
- [ ] Dockerイメージスキャンがあるか（該当する場合）

---

## 最終チェック（本番デプロイ前）

### Critical（必須）

- [ ] HTTPS強制
- [ ] HSTS ヘッダー設定
- [ ] セキュリティヘッダー（Helmet.js）設定
- [ ] CORS適切に設定
- [ ] 環境変数で機密情報管理
- [ ] エラー時の情報漏洩なし

### Important（強く推奨）

- [ ] Rate Limiting実装
- [ ] CSP設定
- [ ] セキュリティログ記録
- [ ] 依存関係脆弱性なし（Critical/High）
- [ ] セッション設定適切（HttpOnly、Secure、SameSite）

### Recommended（推奨）

- [ ] セキュリティスキャンCI/CD統合
- [ ] Permissions-Policy設定
- [ ] ファイルアップロード検証
- [ ] DB接続SSL/TLS使用

---

## 参考文献

- **OWASP Secure Headers Project**: https://owasp.org/www-project-secure-headers/
- **MDN HTTP Headers**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
- **Helmet.js Documentation**: https://helmetjs.github.io/
- **CORS Documentation**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
