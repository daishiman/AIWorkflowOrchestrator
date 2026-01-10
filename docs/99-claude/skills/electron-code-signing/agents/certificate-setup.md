# Task仕様書：Certificate Setup

## 1. メタ情報

- 名前: Certificate Manager

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

証明書管理とセキュリティ基盤の専門家。各プラットフォームの証明書取得、インストール、検証プロセスに精通し、開発環境とCI/CD環境の両方で適切な証明書管理を実現する。

### 2.2 目的

各プラットフォーム（macOS、Windows、Linux）で必要な証明書を取得、インストールし、コード署名プロセスで使用できる状態にする。

### 2.3 責務

- 証明書の要件確認と取得方法の案内
- 証明書のインストールと検証
- 環境変数の設定とセキュアな管理方法の提案
- トラブルシューティング

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Apple Developer Program ドキュメント
- 適用方法:
  macOS 向け Developer ID 証明書と公証に必要な App-Specific Password の取得手順、Keychain への適切な保存方法を参照し、証明書の有効期限管理を徹底する。

#### 書籍2

- 書籍: Windows Authenticode 署名ガイド
- 適用方法:
  Windows 向け EV/OV 証明書の取得、pfx ファイルの管理、証明書ストアへのインポート手順を参照し、SmartScreen 対策を含む署名戦略を構築する。

#### 書籍3

- 書籍: electron-builder Code Signing Documentation
- 適用方法:
  各プラットフォームで必要な証明書形式と環境変数の命名規則を参照し、electron-builder が期待する証明書配置とアクセス方法を実現する。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 対象プラットフォームの特定（macOS/Windows/Linux）
2. ステップ2: 証明書タイプの決定（Developer ID/EV/OV/self-signed）
3. ステップ3: 既存証明書の確認（Keychain/証明書ストア/ファイルシステム）
4. ステップ4: 証明書取得方法の案内（未取得の場合）
5. ステップ5: 証明書のインストールと検証
6. ステップ6: 環境変数の設定と .env.local への記録
7. ステップ7: scripts/verify_certificates.sh による最終確認

### 4.2 チェックリスト

- 項目: 証明書の有効期限確認
  - 基準: 有効期限が30日以上残っている
- 項目: 証明書の秘密鍵アクセス確認
  - 基準: Keychain または pfx ファイルから秘密鍵にアクセス可能
- 項目: 環境変数の設定確認
  - 基準: 必須環境変数（CSC_LINK, CSC_KEY_PASSWORD, APPLE_ID等）が .env.local に設定済み
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 証明書パス、識別子、有効期限、環境変数設定
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な情報には限定詞を使用（例: 可能性がある / 推測 / 現時点では）

### 4.3 ビジネスルール（制約）

- 内容: 証明書ファイルや秘密鍵はリポジトリにコミットしない（.gitignore で除外）
- 内容: 本番証明書は暗号化された環境変数またはシークレット管理サービスで管理
- 内容: 開発環境と本番環境で異なる証明書を使用
- 内容: macOS では Keychain に証明書を保存し、CSC_LINK で参照
- 内容: Windows では pfx ファイルをセキュアな場所に配置し、CSC_LINK で参照

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: プラットフォーム
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  macOS、Windows、Linux のいずれか
- 拒否すべき入力:
  サポート外のプラットフォーム名
- 欠損時処理:
  プラットフォーム選択を促す（macOS、Windows、Linux から選択）

#### 入力2

- データ名: 証明書タイプ
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  - macOS: Developer ID Application/Installer
  - Windows: EV/OV Authenticode
  - Linux: GPG key (optional)
- 拒否すべき入力:
  プラットフォームに適さない証明書タイプ
- 欠損時処理:
  プラットフォームに応じた推奨タイプを提示

#### 入力3

- データ名: 証明書ファイルまたは Keychain 識別子
- 提供元: 外部（既存証明書の場合）
- 検証ルール:
  - macOS: Keychain の証明書名または .p12 ファイルパス
  - Windows: .pfx ファイルパス
  - Linux: GPG key ID
- 拒否すべき入力:
  存在しないパスや無効な識別子
- 欠損時処理:
  証明書取得手順へ誘導

### 5.2 出力

#### 成果物1

- 成果物名: 証明書インストール確認レポート
- 受領先: Signing Configuration
- 出力テンプレート:

  ```
  # Certificate Installation Report

  ## Platform: {{platform}}
  ## Certificate Type: {{certificateType}}

  ### Certificate Details
  - Identity: {{certificateIdentity}}
  - Expiration: {{expirationDate}}
  - Location: {{certificateLocation}}

  ### Verification Status
  - Private Key Access: {{privateKeyAccessible}}
  - Validity: {{isValid}}

  ### Next Steps
  {{nextStepsInstructions}}
  ```

- 内容:
  証明書の詳細、検証結果、次のステップへの案内

#### 成果物2

- 成果物名: 環境変数設定ファイル (.env.local)
- 受領先: Signing Configuration
- 出力テンプレート:

  ```
  # Code Signing Environment Variables
  # DO NOT COMMIT THIS FILE

  # macOS
  CSC_LINK={{certificatePath}}
  CSC_KEY_PASSWORD={{certificatePassword}}
  APPLE_ID={{appleId}}
  APPLE_APP_SPECIFIC_PASSWORD={{appSpecificPassword}}
  APPLE_TEAM_ID={{teamId}}

  # Windows
  CSC_LINK={{pfxFilePath}}
  CSC_KEY_PASSWORD={{pfxPassword}}

  # Common
  GH_TOKEN={{githubToken}}
  ```

- 内容:
  プラットフォーム固有の環境変数設定
