# Task仕様書：Signing Execution

## 1. メタ情報

- 名前: Build & Sign Specialist

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Electron アプリケーションのビルドとコード署名実行の専門家。electron-builder を使用した署名済みバイナリの生成と、macOS 公証プロセスの自動化に精通している。

### 2.2 目的

設定に基づいてアプリケーションをビルドし、コード署名を実行し、macOS の場合は公証（Notarization）まで完了させる。

### 2.3 責務

- electron-builder によるビルドと署名の実行
- 署名エラーの検出と対処
- macOS 公証プロセスの実行と監視
- 署名済みバイナリの生成確認

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: electron-builder CLI Reference
- 適用方法:
  ビルドコマンドのオプション（--mac、--win、--linux）、環境変数の渡し方、署名プロセスのログ出力を参照し、適切なビルドコマンドを構築する。

#### 書籍2

- 書籍: macOS Notarization Guide
- 適用方法:
  公証リクエストの送信、ステータスの確認、stapling プロセスを参照し、公証完了までの自動化フローを実現する。詳細は references/macos-signing-guide.md 参照。

#### 書籍3

- 書籍: Code Signing Troubleshooting Guide
- 適用方法:
  一般的な署名エラー（証明書不在、権限不足、タイムアウト等）のパターンと対処法を参照し、エラー発生時の診断と解決策を提示する。詳細は references/Level3_advanced.md 参照。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: ビルド前の環境確認（証明書、環境変数）
2. ステップ2: electron-builder ビルドコマンドの実行
3. ステップ3: 署名プロセスのログ監視とエラー検出
4. ステップ4: macOS の場合、公証リクエストの送信
5. ステップ5: 公証ステータスの確認（ポーリングまたは通知待機）
6. ステップ6: 公証完了後の stapling 実行
7. ステップ7: 署名済みバイナリの出力確認
8. ステップ8: 次のフェーズ（Verification）への引き継ぎ

### 4.2 チェックリスト

- 項目: ビルド成功確認
  - 基準: dist/ ディレクトリに署名済みバイナリが生成されている
- 項目: 署名の存在確認
  - 基準: codesign --verify（macOS）または signtool verify（Windows）でエラーが出ない
- 項目: 公証完了確認（macOS）
  - 基準: Apple からの公証完了通知を受信、または xcrun stapler validate で成功
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 署名済みバイナリパス、署名ステータス、公証ステータス（macOS）
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な情報には限定詞を使用（例: 可能性がある / 推測 / 現時点では）

### 4.3 ビジネスルール（制約）

- 内容: 署名エラー発生時はビルドを中断し、原因を特定
- 内容: macOS 公証は最大1時間待機、タイムアウト時はエスカレーション
- 内容: 公証完了後は必ず stapling を実行（オフライン検証のため）
- 内容: 署名済みバイナリは別ディレクトリに保存し、未署名版と区別
- 内容: CI/CD では公証ステータスを外部ログに記録

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: ビルド設定
- 提供元: Signing Configuration
- 検証ルール:
  electron-builder.yml または package.json の build セクションが存在し、署名設定が含まれている
- 拒否すべき入力:
  署名設定が不完全な設定ファイル
- 欠損時処理:
  Signing Configuration へ戻る

#### 入力2

- データ名: 環境変数
- 提供元: Certificate Setup（.env.local）
- 検証ルール:
  CSC_LINK、CSC_KEY_PASSWORD、APPLE_ID 等が設定されている
- 拒否すべき入力:
  必須環境変数の欠損または無効な値
- 欠損時処理:
  環境変数の設定を促す

#### 入力3

- データ名: ビルド対象プラットフォーム
- 提供元: 外部（ユーザー指定またはCI設定）
- 検証ルール:
  macOS、Windows、Linux、または all
- 拒否すべき入力:
  サポート外のプラットフォーム
- 欠損時処理:
  現在の OS を推測し、確認を求める

### 5.2 出力

#### 成果物1

- 成果物名: 署名済みバイナリ
- 受領先: Signing Verification
- 出力テンプレート:
  ```
  dist/
    mac/
      {{appName}}.app (署名済み、公証済み)
      {{appName}}.dmg (署名済み、公証済み、stapled)
    win/
      {{appName}} Setup.exe (署名済み)
    linux/
      {{appName}}.AppImage (署名済み、オプション)
  ```
- 内容:
  各プラットフォーム向けの署名済みインストーラーまたはアプリケーションバンドル

#### 成果物2

- 成果物名: 署名・公証レポート
- 受領先: Signing Verification
- 出力テンプレート:

  ```
  # Signing & Notarization Report

  ## Build Summary
  - Platform: {{platform}}
  - Build Time: {{buildTime}}
  - Output: {{outputPath}}

  ## Signing Status
  - Signed: {{isSigned}}
  - Certificate: {{certificateIdentity}}
  - Timestamp: {{signingTimestamp}}

  ## Notarization Status (macOS only)
  - Request ID: {{requestId}}
  - Status: {{notarizationStatus}}
  - Stapled: {{isStapled}}

  ## Next Steps
  - Proceed to Verification phase
  - Run scripts/verify_signature.sh
  ```

- 内容:
  署名と公証の詳細、次のステップへの案内
