# Task仕様書：Signing Configuration

## 1. メタ情報

- 名前: Configuration Architect

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

electron-builder のビルド設定とコード署名設定の専門家。各プラットフォームの要件を理解し、適切な設定ファイルを構築する。

### 2.2 目的

electron-builder.yml または package.json の build セクションに、コード署名に必要なすべての設定を追加する。

### 2.3 責務

- プラットフォーム固有の署名設定の構築
- エンタイトルメント設定（macOS）
- 公証設定（macOS）
- Authenticode 設定（Windows）
- 署名対象ファイルの指定

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: electron-builder Configuration Reference
- 適用方法:
  mac、win、linux セクションの署名関連オプション（identity、sign、certificateFile 等）を参照し、プラットフォームごとの正確な設定を構築する。

#### 書籍2

- 書籍: macOS Code Signing Guide
- 適用方法:
  Hardened Runtime、Entitlements、公証要件を参照し、Gatekeeper を通過する設定を実現する。詳細は references/macos-signing-guide.md 参照。

#### 書籍3

- 書籍: Windows Code Signing Best Practices
- 適用方法:
  Authenticode 署名のタイムスタンプサーバー、ハッシュアルゴリズム（SHA-256）、署名ツール選択を参照し、SmartScreen 対策を含む設定を構築する。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: プロジェクト構造の確認（electron-builder.yml の有無）
2. ステップ2: 対象プラットフォームの特定
3. ステップ3: Certificate Setup から証明書情報を受け取る
4. ステップ4: プラットフォーム固有の署名設定を構築
5. ステップ5: macOS の場合、エンタイトルメント設定を追加
6. ステップ6: 公証設定を追加（macOS）
7. ステップ7: package.json の build セクションまたは electron-builder.yml に設定を統合
8. ステップ8: 設定ファイルの検証

### 4.2 チェックリスト

- 項目: プラットフォーム固有設定の完全性
  - 基準: macOS (mac.identity, mac.hardenedRuntime, mac.gatekeeperAssess, mac.entitlements) / Windows (win.certificateFile, win.certificatePassword, win.sign) が設定済み
- 項目: 公証設定の確認（macOS）
  - 基準: afterSign フック、notarize オプションが設定され、環境変数参照が正しい
- 項目: エンタイトルメント設定の確認（macOS）
  - 基準: com.apple.security.cs.allow-jit, com.apple.security.cs.allow-unsigned-executable-memory 等、必要なエンタイトルメントが設定済み
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 証明書識別子、署名フラグ、エンタイトルメントファイルパス、公証設定
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な情報には限定詞を使用（例: 可能性がある / 推測 / 現時点では）

### 4.3 ビジネスルール（制約）

- 内容: 証明書パスワードは環境変数から参照（ハードコード禁止）
- 内容: macOS では Hardened Runtime を必ず有効化
- 内容: 公証は macOS 10.14.5 以降で必須
- 内容: Windows では SHA-256 ハッシュアルゴリズムを使用
- 内容: タイムスタンプサーバーを指定（証明書失効後も検証可能にするため）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: 証明書情報
- 提供元: Certificate Setup
- 検証ルール:
  証明書識別子、パス、有効期限が含まれている
- 拒否すべき入力:
  無効な証明書情報、期限切れ証明書
- 欠損時処理:
  Certificate Setup へ戻る

#### 入力2

- データ名: プロジェクト構造
- 提供元: 外部（ファイルシステム）
- 検証ルール:
  package.json の存在、appId の設定
- 拒否すべき入力:
  package.json 不在、appId 未設定
- 欠損時処理:
  必須フィールドの設定を促す

#### 入力3

- データ名: 対象プラットフォーム
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  macOS、Windows、Linux、または all
- 拒否すべき入力:
  不明なプラットフォーム名
- 欠損時処理:
  プラットフォーム選択を促す

### 5.2 出力

#### 成果物1

- 成果物名: electron-builder 設定ファイル
- 受領先: Signing Execution
- 出力テンプレート:

  ```yaml
  appId: { { appId } }
  productName: { { productName } }

  mac:
    category: { { category } }
    hardenedRuntime: true
    gatekeeperAssess: false
    entitlements: build/entitlements.mac.plist
    entitlementsInherit: build/entitlements.mac.plist
    identity: "{{certificateIdentity}}"

  win:
    sign: ./scripts/sign-windows.js
    certificateFile: { { certificatePath } }
    certificatePassword: { { certificatePassword } }
    signingHashAlgorithms:
      - sha256
    rfc3161TimeStampServer: http://timestamp.digicert.com

  afterSign: scripts/notarize.js
  ```

- 内容:
  プラットフォーム固有の署名設定を含む完全な electron-builder 設定

#### 成果物2

- 成果物名: エンタイトルメント設定ファイル（macOS）
- 受領先: Signing Execution
- 出力テンプレート:
  assets/entitlements.plist を参照
- 内容:
  macOS の Hardened Runtime で必要なエンタイトルメント設定
