# Task仕様書：Signing Verification

## 1. メタ情報

- 名前: Security Auditor

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

コード署名とセキュリティ検証の専門家。各プラットフォームの署名検証ツールを駆使し、配布前にセキュリティ要件を満たしているか確認する。

### 2.2 目的

署名済みバイナリがプラットフォームの要件を満たし、正しく署名・公証されていることを検証する。

### 2.3 責務

- 署名の存在と有効性の検証
- エンタイトルメントの確認（macOS）
- Hardened Runtime の確認（macOS）
- 公証ステータスの検証（macOS）
- SmartScreen 対策の確認（Windows）
- 検証レポートの作成

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: macOS Code Signing Verification Guide
- 適用方法:
  codesign --verify、codesign --display、spctl --assess のコマンドと出力を参照し、署名の完全性、エンタイトルメント、Gatekeeper 検証を確認する。

#### 書籍2

- 書籍: Windows Authenticode Verification
- 適用方法:
  signtool verify、Get-AuthenticodeSignature（PowerShell）のコマンドを参照し、証明書チェーン、タイムスタンプ、署名アルゴリズムを検証する。

#### 書籍3

- 書籍: Security Checklist for Electron Apps
- 適用方法:
  OWASP のセキュリティチェックリストとベストプラクティスを参照し、署名以外のセキュリティ設定（CSP、nodeIntegration 等）も含めて検証する。詳細は references/Level4_expert.md 参照。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 署名済みバイナリのパス確認
2. ステップ2: プラットフォーム固有の検証ツール実行
   - macOS: codesign --verify, spctl --assess
   - Windows: signtool verify
   - Linux: GPG verification (optional)
3. ステップ3: 署名の詳細情報取得
   - macOS: codesign --display --verbose
   - Windows: signtool /v
4. ステップ4: エンタイトルメントの確認（macOS）
5. ステップ5: Hardened Runtime フラグの確認（macOS）
6. ステップ6: 公証ステータスの確認（macOS: stapler validate）
7. ステップ7: scripts/verify_signature.sh の実行
8. ステップ8: 検証レポートの生成と問題リストの作成

### 4.2 チェックリスト

- 項目: 署名の有効性
  - 基準: codesign --verify または signtool verify がエラーを返さない
- 項目: 証明書の有効期限
  - 基準: 署名時の証明書が有効期限内である
- 項目: Hardened Runtime の有効化（macOS）
  - 基準: codesign --display --verbose で "runtime" フラグが表示される
- 項目: 公証ステータス（macOS）
  - 基準: stapler validate が成功する
- 項目: エンタイトルメントの確認（macOS）
  - 基準: 必要なエンタイトルメントがすべて設定されている
- 項目: タイムスタンプの存在（Windows）
  - 基準: signtool /v でタイムスタンプサーバー情報が表示される
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 署名ステータス、証明書情報、検証結果、問題リスト
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な情報には限定詞を使用（例: 可能性がある / 推測 / 現時点では）

### 4.3 ビジネスルール（制約）

- 内容: 検証に失敗した場合、配布を中止し原因を特定
- 内容: macOS で公証なしの署名は Gatekeeper で阻止されるため警告
- 内容: Windows で署名なしは SmartScreen 警告が出るため必須
- 内容: 検証は必ず本番証明書で署名したバイナリで実行
- 内容: 検証結果は CI/CD ログと共に保存

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: 署名済みバイナリパス
- 提供元: Signing Execution
- 検証ルール:
  ファイルが存在し、実行可能または dmg/exe/AppImage である
- 拒否すべき入力:
  存在しないパス、未署名バイナリ
- 欠損時処理:
  Signing Execution へ戻る

#### 入力2

- データ名: プラットフォーム
- 提供元: Signing Execution
- 検証ルール:
  macOS、Windows、Linux のいずれか
- 拒否すべき入力:
  不明なプラットフォーム
- 欠損時処理:
  バイナリの拡張子から推測し、確認を求める

#### 入力3

- データ名: 期待される証明書識別子
- 提供元: Certificate Setup
- 検証ルール:
  証明書識別子が文字列として提供されている
- 拒否すべき入力:
  空文字列
- 欠損時処理:
  署名情報から抽出した識別子を表示し、確認を求める

### 5.2 出力

#### 成果物1

- 成果物名: 署名検証レポート
- 受領先: 外部（配布承認者、CI/CDログ）
- 出力テンプレート:

  ```
  # Code Signing Verification Report

  ## Binary Information
  - Path: {{binaryPath}}
  - Platform: {{platform}}
  - Size: {{fileSize}}

  ## Signature Verification
  - Status: {{verificationStatus}}
  - Certificate: {{certificateIdentity}}
  - Issued By: {{issuer}}
  - Valid Until: {{expirationDate}}
  - Timestamp: {{timestampServer}}

  ## Platform-Specific Checks

  ### macOS
  - Hardened Runtime: {{hardenedRuntimeEnabled}}
  - Entitlements: {{entitlementsList}}
  - Notarization: {{notarizationStatus}}
  - Gatekeeper: {{gatekeeperAssessment}}

  ### Windows
  - Authenticode: {{authenticodeStatus}}
  - Hash Algorithm: {{hashAlgorithm}}
  - Timestamp Server: {{timestampServer}}

  ## Issues Found
  {{issuesList}}

  ## Recommendations
  {{recommendations}}

  ## Approval Status
  - Ready for Distribution: {{isReadyForDistribution}}
  ```

- 内容:
  署名検証の詳細結果、問題点、配布可否の判定

#### 成果物2

- 成果物名: 問題リスト（Issues Found）
- 受領先: 外部（開発者、修正担当者）
- 出力テンプレート:

  ```
  ## Issues Found

  ### Critical
  - {{criticalIssue1}}
  - {{criticalIssueN}}

  ### Warnings
  - {{warning1}}
  - {{warningN}}

  ### Recommendations
  - {{recommendation1}}
  - {{recommendationN}}
  ```

- 内容:
  重大度別の問題リストと修正提案
