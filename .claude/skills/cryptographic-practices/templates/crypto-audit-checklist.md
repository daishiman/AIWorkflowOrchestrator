# 暗号監査チェックリスト

## ハッシング

- [ ] パスワードハッシングにbcrypt（cost=12）またはargon2idを使用
- [ ] MD5、SHA-1を使用していない
- [ ] データ整合性検証にSHA-256以上を使用
- [ ] ソルトは各エントリでユニーク（CSPRNGで生成）
- [ ] ハッシュアルゴリズムのcost factorは適切（bcrypt: 10-12、argon2: m=64MB）

## 対称鍵暗号化

- [ ] AES-256-GCMまたはChaCha20-Poly1305を使用
- [ ] AES-ECB、DES、3DES、RC4を使用していない
- [ ] IVは毎回ランダム生成（CSPRNG）
- [ ] 認証タグ（GCM）またはHMAC（CBC）で改ざん検出
- [ ] 鍵サイズは256ビット

## 非対称鍵暗号化

- [ ] RSA鍵は2048ビット以上（推奨: 4096ビット）
- [ ] OAEP/PSSパディング使用（PKCS#1 v1.5避ける）
- [ ] ECC使用時は推奨曲線（P-256以上、Ed25519、Curve25519）
- [ ] 秘密鍵は安全に保管（KMS、暗号化ファイル）

## 乱数生成

- [ ] トークン生成にCSPRNGを使用（crypto.randomBytes、secrets）
- [ ] セッションID生成にCSPRNGを使用
- [ ] Math.random()を暗号用途に使用していない
- [ ] Date.now()をランダム値生成に使用していない
- [ ] ノンス、IVは毎回ランダム生成

## デジタル署名

- [ ] 署名にSHA-256以上のハッシュを使用
- [ ] RSA署名鍵は2048ビット以上
- [ ] 署名検証が必ず実行される
- [ ] alg: noneを拒否

## JWT セキュリティ

- [ ] RS256/ES256アルゴリズム使用（HS256は慎重に）
- [ ] alg headerをホワイトリスト化
- [ ] expクレーム必須設定
- [ ] 署名検証（jwt.verify使用、jwt.decode禁止）
- [ ] センシティブデータをペイロードに含めない

## 鍵管理

- [ ] 鍵はソースコードにハードコードされていない
- [ ] 鍵は環境変数またはKMSで管理
- [ ] .envファイルが.gitignoreに含まれる
- [ ] 鍵ローテーション計画がある
- [ ] 秘密鍵がGitにコミットされていない

## TLS/SSL

- [ ] TLS 1.2以上使用（TLS 1.3推奨）
- [ ] 前方秘匿性のある暗号スイート（ECDHE）
- [ ] 証明書検証有効（NODE_TLS_REJECT_UNAUTHORIZED=1）
- [ ] SSL 2.0、SSL 3.0、TLS 1.0、TLS 1.1無効化

## データ暗号化

### Data-at-Rest

- [ ] センシティブフィールドは暗号化（PII、クレジットカード等）
- [ ] AES-256-GCM使用
- [ ] 鍵はKMSで管理
- [ ] 暗号化データとIV/認証タグを一緒に保存

### Data-in-Transit

- [ ] すべての通信でHTTPS使用
- [ ] HSTSヘッダー設定
- [ ] 証明書は信頼できるCAから取得
- [ ] 証明書の有効期限監視

## ライブラリとツール

- [ ] 信頼できる暗号ライブラリ使用（crypto、cryptography等）
- [ ] ライブラリは最新版（脆弱性修正）
- [ ] 独自暗号実装を避ける
- [ ] crypto-jsよりネイティブcryptoモジュール優先

## コンプライアンス

- [ ] FIPS 140-2準拠（該当する場合）
- [ ] PCI DSS要件準拠（決済情報を扱う場合）
- [ ] GDPR暗号化要件準拠（EU）
- [ ] HIPAA暗号化要件準拠（医療情報）

---

## 重大な脆弱性（即座に修正）

- ❌ MD5、SHA-1使用（パスワード、署名）
- ❌ DES、3DES、RC4使用
- ❌ AES-ECBモード使用
- ❌ Math.random()で暗号トークン生成
- ❌ 固定IV使用
- ❌ RSA 1024ビット以下
- ❌ alg: none許可
- ❌ シークレットのハードコード
- ❌ 秘密鍵のGitコミット

---

## 推奨アルゴリズム早見表

| 用途 | 推奨アルゴリズム | 鍵/出力サイズ |
|-----|---------------|-------------|
| パスワードハッシング | argon2id、bcrypt | - |
| データハッシング | SHA-256、BLAKE2b | 256ビット |
| 対称鍵暗号化 | AES-256-GCM | 256ビット |
| 非対称鍵暗号化 | RSA-4096、ECC P-256 | 4096ビット、256ビット |
| デジタル署名 | RSA-PSS、Ed25519 | 2048ビット以上 |
| 乱数生成 | crypto.randomBytes、secrets | 128-256ビット |
| JWT署名 | RS256、ES256 | 2048ビット以上 |

---

## 参考文献

- **OWASP Cryptographic Storage Cheat Sheet**
- **NIST FIPS 140-2**: Security Requirements for Cryptographic Modules
- **NIST SP 800-57**: Recommendation for Key Management
- **NIST SP 800-90A**: Random Number Generation
