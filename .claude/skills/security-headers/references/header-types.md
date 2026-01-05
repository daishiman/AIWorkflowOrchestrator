# HTTPセキュリティヘッダー種類と機能

> **責務**: 各セキュリティヘッダーの機能・設定方法・推奨値のリファレンス
> **相対パス**: `references/header-types.md`

---

## 目次

1. [必須ヘッダー](#必須ヘッダー)
2. [推奨ヘッダー](#推奨ヘッダー)
3. [オプションヘッダー](#オプションヘッダー)
4. [ヘッダー対応表](#ヘッダー対応表)

---

## 必須ヘッダー

### Content-Security-Policy (CSP)

**目的**: XSS攻撃・データインジェクション攻撃の防止

**推奨値**:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
```

**設定ポイント**:

| ディレクティブ    | 説明                 | 推奨設定                 |
| ----------------- | -------------------- | ------------------------ |
| `default-src`     | デフォルトポリシー   | `'self'`                 |
| `script-src`      | JavaScript読み込み元 | `'self'`（unsafe避ける） |
| `style-src`       | CSS読み込み元        | `'self'`                 |
| `frame-ancestors` | iframe埋め込み制限   | `'none'`                 |

> 詳細は `references/csp-configuration.md` を参照

---

### Strict-Transport-Security (HSTS)

**目的**: HTTPS強制によるMITM攻撃防止

**推奨値**:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**設定ポイント**:

| 属性                | 説明                     | 推奨設定             |
| ------------------- | ------------------------ | -------------------- |
| `max-age`           | HTTPS強制期間（秒）      | 31536000（1年）      |
| `includeSubDomains` | サブドメイン適用         | 有効                 |
| `preload`           | ブラウザプリロードリスト | 十分なテスト後に有効 |

**注意**: preloadは一度設定すると取り消しが困難。テスト環境では使用しない。

---

### X-Frame-Options

**目的**: クリックジャッキング攻撃の防止

**推奨値**:

```
X-Frame-Options: DENY
```

**設定オプション**:

| 値           | 説明                   |
| ------------ | ---------------------- |
| `DENY`       | iframe埋め込み完全禁止 |
| `SAMEORIGIN` | 同一オリジンのみ許可   |

**注記**: CSPの`frame-ancestors`が優先されるが、レガシーブラウザ対応で併用推奨。

---

### X-Content-Type-Options

**目的**: MIMEタイプスニッフィングの防止

**推奨値**:

```
X-Content-Type-Options: nosniff
```

**効果**: ブラウザがContent-Typeを無視してMIMEタイプを推測することを防止。

---

## 推奨ヘッダー

### Referrer-Policy

**目的**: リファラー情報の漏洩防止

**推奨値**:

```
Referrer-Policy: strict-origin-when-cross-origin
```

**設定オプション**:

| 値                                | 説明                                                 |
| --------------------------------- | ---------------------------------------------------- |
| `no-referrer`                     | リファラー送信なし                                   |
| `strict-origin`                   | オリジンのみ送信（HTTPS→HTTPは送信なし）             |
| `strict-origin-when-cross-origin` | 同一オリジンはフルパス、クロスオリジンはオリジンのみ |

---

### Permissions-Policy

**目的**: ブラウザ機能（カメラ、マイク等）の使用制限

**推奨値**:

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**設定例**:

| 機能          | 設定例               | 説明                 |
| ------------- | -------------------- | -------------------- |
| `camera`      | `camera=()`          | カメラ使用禁止       |
| `microphone`  | `microphone=()`      | マイク使用禁止       |
| `geolocation` | `geolocation=(self)` | 同一オリジンのみ許可 |

---

## オプションヘッダー

### X-XSS-Protection

**目的**: ブラウザ内蔵XSSフィルター制御

**推奨値**:

```
X-XSS-Protection: 0
```

**注記**: 最新ブラウザでは非推奨。CSPで代替。`1; mode=block`は脆弱性の原因となりうる。

---

### Cross-Origin-Opener-Policy (COOP)

**目的**: クロスオリジンウィンドウからの参照防止

**推奨値**:

```
Cross-Origin-Opener-Policy: same-origin
```

---

### Cross-Origin-Resource-Policy (CORP)

**目的**: クロスオリジンリソース読み込み制限

**推奨値**:

```
Cross-Origin-Resource-Policy: same-origin
```

---

### Cross-Origin-Embedder-Policy (COEP)

**目的**: クロスオリジンリソース埋め込み制限

**推奨値**:

```
Cross-Origin-Embedder-Policy: require-corp
```

---

## ヘッダー対応表

### 脅威とヘッダーのマッピング

| 脅威                 | 対応ヘッダー                | 優先度 |
| -------------------- | --------------------------- | ------ |
| XSS攻撃              | CSP, X-Content-Type-Options | High   |
| クリックジャッキング | X-Frame-Options, CSP        | High   |
| MITM攻撃             | HSTS                        | High   |
| MIMEスニッフィング   | X-Content-Type-Options      | High   |
| 情報漏洩             | Referrer-Policy             | Medium |
| 機能乱用             | Permissions-Policy          | Medium |

### 環境別設定例

| 環境         | HSTS preload | CSP report-only | 推奨スコア目標 |
| ------------ | ------------ | --------------- | -------------- |
| 開発         | 無効         | 有効            | -              |
| ステージング | 無効         | 有効            | B以上          |
| 本番         | 有効         | 無効            | A以上          |

---

## 関連リソース

- **CSP詳細**: See [csp-configuration.md](csp-configuration.md)
- **CSRF対策**: See [csrf-prevention.md](csrf-prevention.md)
- **検証スクリプト**: `scripts/validate-security-headers.mjs`
