# Task仕様書:コード署名

## 1. メタ情報

- 名前: コード署名タスク

> 注記: この名前はタスクの役割を示すラベル。思考様式の参照として使用する。

---

## 2. プロフィール

### 2.1 背景

Electronアプリケーションにデジタル署名を適用し、配布時のセキュリティとユーザー信頼性を確保する専門タスク。macOSのNotarization、WindowsのAuthenticodeに精通している。

### 2.2 目的

ビルド済みバイナリに対してプラットフォーム固有のデジタル署名を適用し、OSのセキュリティ機構による警告を回避する。

### 2.3 責務

- 証明書の検証
- macOSバイナリへのコード署名とNotarization
- Windowsバイナリへのコード署名
- 署名検証
- 署名結果のレポート生成

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Electron公式セキュリティガイド
- 適用方法:
  コード署名のベストプラクティスとセキュリティ要件を参照し、適切な署名プロセスを実施。

#### 書籍2

- 書籍: Apple Developer Documentation - Code Signing
- 適用方法:
  macOS向けの署名とNotarization手順を正確に実行し、Gatekeeperの要件を満たす。

#### 書籍3

- 書籍: Microsoft Authenticode Documentation
- 適用方法:
  Windows向けのAuthenticode署名を適用し、SmartScreen警告を回避する。

> ルール: 詳細な署名手順は references/code-signing.md を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: ビルド済みバイナリの存在を確認
2. ステップ2: プラットフォームごとに署名用証明書・キーの有効性を検証
3. ステップ3: macOS: codesignコマンドで署名、xcrun notarytoolでNotarization
4. ステップ4: Windows: signtoolコマンドまたはelectron-builderの自動署名機能を使用
5. ステップ5: 署名結果を検証（codesign --verify、signtool verify）
6. ステップ6: 署名結果レポートを生成

### 4.2 チェックリスト

- 項目: 証明書の有効性
  - 基準: 証明書が期限内であり、正しい形式で読み込める
- 項目: macOS署名
  - 基準: codesign --verifyが成功し、Notarization ticketが添付される
- 項目: Windows署名
  - 基準: signtool verifyが成功し、タイムスタンプが付与される
- 項目: 署名の一貫性
  - 基準: すべてのバイナリファイルと依存ライブラリが署名される
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 署名結果にplatform, signed_files, signature_status, notarization_statusが含まれる
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 署名エラーの診断には「可能性」などの限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: 署名は必ず本番用証明書で実施（開発用証明書は使用しない）
- 内容: 署名エラー時は即座に処理を停止し、詳細を報告
- 内容: macOSのNotarizationは非同期処理のため、完了を待機

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: ビルド済みバイナリパス
- 提供元: execute-build タスク
- 検証ルール:
  ファイルが存在し、実行可能な形式であること
- 拒否すべき入力:
  存在しないパス、破損したバイナリ
- 欠損時処理:
  エラーを返し、ビルドタスクの再実行を促す

#### 入力2

- データ名: 署名用証明書
- 提供元: 外部（ファイルパスまたは環境変数）
- 検証ルール:
  macOS: .p12形式、Windows: .pfx形式
- 拒否すべき入力:
  無効な形式、期限切れ証明書
- 欠損時処理:
  エラーを返し、証明書の設定を促す

#### 入力3

- データ名: プライベートキーパスワード
- 提供元: 外部（環境変数）
- 検証ルール:
  空文字列でないこと
- 拒否すべき入力:
  不正なパスワード
- 欠損時処理:
  エラーを返し、環境変数の設定を促す

### 5.2 出力

#### 成果物1

- 成果物名: 署名済みバイナリ
- 受領先: generate-installers タスク
- 出力テンプレート:
  ```
  dist/
    mac/
      AppName.app (署名+Notarization済み)
    win/
      AppName.exe (Authenticode署名済み)
  ```
- 内容:
  デジタル署名が適用されたバイナリファイル

#### 成果物2

- 成果物名: 署名結果レポート
- 受領先: 後続タスク全般
- 出力テンプレート:
  ```json
  {
    "status": "success|failure",
    "platforms": {
      "mac": {
        "signed": true,
        "notarized": true,
        "signature_status": "valid",
        "notarization_uuid": "xxx-yyy-zzz"
      },
      "win": {
        "signed": true,
        "signature_status": "valid",
        "timestamp_server": "http://timestamp.server.com"
      }
    },
    "signed_files": [],
    "errors": []
  }
  ```
- 内容:
  署名プロセスの結果と検証ステータス
