# セキュリティ要件定義書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| タスクID   | T-00-3                 |
| 参照元     | NFR-UA-001, NFR-UA-002 |
| 作成日     | 2025-12-09             |
| ステータス | 完了                   |

---

## 1. 概要

### 1.1 目的

OAuth認証におけるトークン管理・暗号化に関するセキュリティ要件を定義する。デスクトップアプリケーション特有のセキュリティリスクに対応した設計を行う。

### 1.2 スコープ

| 含む                          | 含まない                 |
| ----------------------------- | ------------------------ |
| PKCE認証フロー                | 二要素認証（将来機能）   |
| トークン暗号化（safeStorage） | 生体認証（将来機能）     |
| CSRF対策（state パラメータ）  | E2E暗号化                |
| セッション管理                | サーバーサイドセッション |
| 最小権限スコープ              | 管理者権限機能           |

---

## 2. セキュリティ要件

### 2.1 PKCE実装要件（NFR-SEC-001）

#### 説明

デスクトップアプリではclient_secretを安全に保存できないため、PKCE (Proof Key for Code Exchange) を使用する。

#### 優先度

**Must Have（必須）**

#### 要件詳細

| 項目                  | 要件                                                  |
| --------------------- | ----------------------------------------------------- |
| code_verifier         | 43-128文字の暗号学的にランダムな文字列                |
| 使用文字              | [A-Z], [a-z], [0-9], "-", ".", "\_", "~"              |
| code_challenge        | code_verifierのSHA256ハッシュ（Base64URL エンコード） |
| code_challenge_method | S256（SHA256）を使用                                  |

#### 受け入れ基準

```gherkin
Feature: PKCE認証
  開発者として
  PKCEを使用した安全なOAuth認証を実装したい
  認可コード横取り攻撃を防止できることを期待する

  Scenario: PKCE認証フローを実行する
    Given OAuth認証フローを開始する
    When code_verifierを生成する
    Then 長さが43-128文字である
    And 使用可能な文字のみで構成されている
    And 暗号学的に安全なランダム値である

  Scenario: code_challengeを生成する
    Given code_verifierが「dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk」である
    When code_challengeを計算する
    Then Base64URLエンコードされたSHA256ハッシュが生成される
    And code_challenge_methodは「S256」である

  Scenario: トークン交換時にcode_verifierを送信する
    Given 認可コードを取得済みである
    When トークンエンドポイントにリクエストする
    Then リクエストにcode_verifierが含まれる
    And code_verifierが認可時のcode_challengeと一致する場合のみトークンが発行される
```

#### 実装ガイドライン

```typescript
// code_verifier生成例
import { randomBytes, createHash } from "crypto";

function generateCodeVerifier(): string {
  // 32バイト = 43文字のBase64URL
  return randomBytes(32).toString("base64url").slice(0, 128);
}

function generateCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}
```

---

### 2.2 トークン暗号化要件（NFR-SEC-002）

#### 説明

アクセストークン・リフレッシュトークンはElectronのsafeStorageを使用して暗号化保存する。

#### 優先度

**Must Have（必須）**

#### 要件詳細

| 項目       | 要件                                       |
| ---------- | ------------------------------------------ |
| 暗号化方式 | OS提供のセキュアストレージ（safeStorage）  |
| macOS      | Keychain                                   |
| Windows    | DPAPI（Data Protection API）               |
| Linux      | libsecret                                  |
| 保存対象   | access_token, refresh_token, client_secret |

#### 受け入れ基準

```gherkin
Feature: トークン暗号化
  開発者として
  トークンを安全に保存したい
  平文でトークンが保存されないことを期待する

  Scenario: トークンを暗号化して保存する
    Given OAuthトークンを取得した
    When トークンを保存する
    Then safeStorage.encryptStringを使用して暗号化される
    And 暗号化されたデータがelectron-storeに保存される
    And 平文のトークンはメモリからクリアされる

  Scenario: 暗号化されたトークンを読み取る
    Given 暗号化されたトークンが保存されている
    When トークンを読み取る
    Then safeStorage.decryptStringで復号される
    And 復号されたトークンが返される

  Scenario: safeStorageが利用不可の場合
    Given OSがsafeStorageをサポートしていない
    When トークンを保存しようとする
    Then エラーがログに記録される
    And ユーザーに警告「セキュアストレージが利用できません」が表示される
    And トークンは保存されない
```

#### 実装ガイドライン

```typescript
import { safeStorage } from "electron";
import Store from "electron-store";

const store = new Store();

function saveToken(key: string, token: string): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure storage is not available");
  }
  const encrypted = safeStorage.encryptString(token);
  store.set(key, encrypted.toString("base64"));
}

function loadToken(key: string): string | null {
  const encrypted = store.get(key) as string | undefined;
  if (!encrypted) return null;
  const buffer = Buffer.from(encrypted, "base64");
  return safeStorage.decryptString(buffer);
}

function deleteToken(key: string): void {
  store.delete(key);
}
```

---

### 2.3 CSRF対策要件（NFR-SEC-003）

#### 説明

state パラメータを使用してクロスサイトリクエストフォージェリ攻撃を防止する。

#### 優先度

**Must Have（必須）**

#### 要件詳細

| 項目          | 要件                                  |
| ------------- | ------------------------------------- |
| state生成     | 32バイト以上の暗号学的にランダムな値  |
| state保存     | メモリ内（認証フロー完了まで）        |
| state検証     | コールバック受信時に完全一致を確認    |
| state有効期限 | 5分（認証フローのタイムアウトと同期） |

#### 受け入れ基準

```gherkin
Feature: CSRF対策
  開発者として
  stateパラメータでCSRF攻撃を防止したい
  不正なコールバックを拒否できることを期待する

  Scenario: 有効なstateでコールバックを処理する
    Given 認証フローが開始されている
    And state「abc123...」が生成・保存されている
    When コールバックでstate「abc123...」を受信する
    Then stateの一致を確認する
    And 認証フローを継続する
    And 使用済みstateを削除する

  Scenario: 無効なstateでコールバックを受信する
    Given 認証フローが開始されている
    And state「abc123...」が生成・保存されている
    When コールバックでstate「xyz789...」を受信する
    Then エラー「Invalid state parameter」をログに記録する
    And 認証フローを中断する
    And セキュリティイベントをログに記録する

  Scenario: stateなしでコールバックを受信する
    Given 認証フローが開始されている
    When stateパラメータなしでコールバックを受信する
    Then エラー「Missing state parameter」をログに記録する
    And 認証フローを中断する
```

---

### 2.4 トークンライフサイクル管理（NFR-SEC-004）

#### 説明

トークンの有効期限管理と自動リフレッシュを実装する。

#### 優先度

**Must Have（必須）**

#### 要件詳細

| トークン種別  | 有効期限                          | 更新方法                           |
| ------------- | --------------------------------- | ---------------------------------- |
| access_token  | 1時間（Google）/ 無期限（GitHub） | リフレッシュトークンで更新         |
| refresh_token | 長期（Google: 6ヶ月）             | 再認証が必要                       |
| id_token      | 1時間（Google）                   | 使用しない（プロフィール取得のみ） |

#### 受け入れ基準

```gherkin
Feature: トークンライフサイクル管理
  開発者として
  トークンの有効期限を適切に管理したい
  シームレスな認証体験を提供できることを期待する

  Scenario: アクセストークンの自動リフレッシュ（Google）
    Given Googleアクセストークンの有効期限が切れている
    And リフレッシュトークンが有効である
    When API呼び出しを行う
    Then 自動的にトークンリフレッシュが実行される
    And 新しいアクセストークンが保存される
    And 元のAPI呼び出しが成功する

  Scenario: リフレッシュトークンの失効
    Given リフレッシュトークンが失効している
    When トークンリフレッシュを試みる
    Then エラー「invalid_grant」が返される
    And 連携ステータスが「要再認証」に更新される
    And ユーザーに再認証を促す通知が表示される

  Scenario: 連携解除時のトークン削除
    Given OAuth連携が解除される
    When 連携解除処理を実行する
    Then access_tokenが削除される
    And refresh_tokenが削除される
    And 関連するすべての認証情報がクリアされる
```

---

### 2.5 最小権限スコープ（NFR-SEC-005）

#### 説明

OAuth連携時に必要最小限のスコープのみを要求する。

#### 優先度

**Must Have（必須）**

#### 要件詳細

| プロバイダー | スコープ   | 用途                         |
| ------------ | ---------- | ---------------------------- |
| Google       | openid     | OpenID Connect認証           |
| Google       | profile    | 表示名、アバター取得         |
| Google       | email      | メールアドレス取得           |
| GitHub       | read:user  | ユーザープロフィール読み取り |
| GitHub       | user:email | メールアドレス取得           |

#### 受け入れ基準

```gherkin
Feature: 最小権限スコープ
  ユーザーとして
  必要最小限の権限のみを許可したい
  過剰な権限を要求されないことを期待する

  Scenario: Google連携で最小スコープを要求する
    Given ユーザーがGoogle連携を開始する
    When 認可URLが生成される
    Then スコープは「openid profile email」のみである
    And 追加のスコープ（contacts, calendar等）は含まれない

  Scenario: GitHub連携で最小スコープを要求する
    Given ユーザーがGitHub連携を開始する
    When 認可URLが生成される
    Then スコープは「read:user user:email」のみである
    And 書き込み権限（write:user, repo等）は含まれない
```

---

## 3. プライバシー要件

### 3.1 データ収集の最小化（NFR-PRIV-001）

#### 説明

ユーザーの明示的な同意なしにデータを外部に送信しない。

#### 優先度

**Must Have（必須）**

#### 受け入れ基準

```gherkin
Feature: データ収集の最小化
  ユーザーとして
  プライバシーが保護されることを期待する
  同意なしにデータが送信されないことを確認したい

  Scenario: プロフィールデータの取り扱い
    Given ユーザーがプロフィールを編集する
    When データを保存する
    Then データはローカルにのみ保存される
    And 外部サーバーへの送信は行われない

  Scenario: OAuth連携時のデータ取得
    Given ユーザーがOAuth連携を行う
    When プロバイダーからデータを取得する
    Then 取得されるデータは「名前、メール、アバターURL」のみである
    And 連絡先、カレンダー等の追加データは取得されない
```

### 3.2 連携解除時のデータ削除（NFR-PRIV-002）

#### 説明

連携解除時にすべての関連データを完全に削除する。

#### 優先度

**Must Have（必須）**

#### 受け入れ基準

```gherkin
Feature: データ削除
  ユーザーとして
  連携解除時に全データが削除されることを期待する
  残留データがないことを確認したい

  Scenario: 連携解除時のデータ削除
    Given ユーザーがGoogle連携を解除する
    When 連携解除処理が完了する
    Then 以下のデータが削除される
      | データ種別 | 削除対象 |
      | アクセストークン | 暗号化保存されたトークン |
      | リフレッシュトークン | 暗号化保存されたトークン |
      | プロバイダーID | AuthProvider.id |
      | プロバイダーメール | AuthProvider.email |
    And プロバイダーから取得したアバターURLは削除される
    And ユーザーがアップロードしたローカルアバターは維持される
```

---

## 4. セキュリティ監査要件

### 4.1 ログ記録要件（NFR-AUDIT-001）

#### 説明

セキュリティ関連イベントを適切にログ記録する。

#### 優先度

**Should Have**

#### 記録対象イベント

| イベント                 | ログレベル | 記録内容                                  |
| ------------------------ | ---------- | ----------------------------------------- |
| OAuth連携開始            | INFO       | provider, timestamp                       |
| OAuth連携成功            | INFO       | provider, userId (ハッシュ), timestamp    |
| OAuth連携失敗            | WARN       | provider, errorCode, timestamp            |
| 無効なstate検出          | ERROR      | provider, timestamp, clientIP (localhost) |
| トークンリフレッシュ成功 | DEBUG      | provider, timestamp                       |
| トークンリフレッシュ失敗 | WARN       | provider, errorCode, timestamp            |
| 連携解除                 | INFO       | provider, timestamp                       |

#### ログに含めないデータ（機密情報）

- access_token
- refresh_token
- code_verifier
- 平文のユーザーメールアドレス

---

## 5. 脅威モデル

### 5.1 想定される脅威と対策

| 脅威                             | リスク | 対策                             |
| -------------------------------- | ------ | -------------------------------- |
| 認可コード横取り                 | 高     | PKCE使用                         |
| CSRF攻撃                         | 中     | stateパラメータ検証              |
| トークン漏洩                     | 高     | safeStorage暗号化                |
| リプレイ攻撃                     | 中     | ワンタイムcode使用、state削除    |
| 中間者攻撃                       | 中     | HTTPS必須（localhost除く）       |
| ローカルサーバーへの不正アクセス | 低     | 短命サーバー、ポート競合チェック |

### 5.2 セキュリティチェックリスト

- [ ] PKCEがGoogle認証で使用されている
- [ ] stateパラメータが全認証フローで使用されている
- [ ] トークンがsafeStorageで暗号化保存されている
- [ ] ローカルサーバーが認証完了後に即シャットダウンされる
- [ ] 最小権限スコープのみが要求されている
- [ ] セキュリティイベントがログに記録されている

---

## 6. 依存関係

### 6.1 Electron API依存

- `safeStorage` - トークン暗号化
- `shell.openExternal` - システムブラウザ起動

### 6.2 Node.js依存

- `crypto` - PKCE code_verifier/code_challenge生成
- `http` - ローカルコールバックサーバー

### 6.3 後続タスク

- T-01-1: データモデル設計
- T-01-3: OAuthフロー設計
- T-05-3: セキュリティ検証

---

## 7. 完了チェックリスト

- [x] safeStorage暗号化要件が定義されている
- [x] PKCE実装要件が定義されている
- [x] CSRFトークン（state）要件が定義されている
- [x] トークンライフサイクル要件が定義されている
