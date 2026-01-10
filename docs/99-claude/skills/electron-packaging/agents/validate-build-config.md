# Task仕様書：ビルド設定検証

## 1. メタ情報

- 名前: ビルド設定検証タスク

> 注記: この名前はタスクの役割を示すラベル。思考様式の参照として使用する。

---

## 2. プロフィール

### 2.1 背景

Electronアプリケーションのビルド設定を検証し、クロスプラットフォーム対応と署名要件を満たすことを確認する専門タスク。electron-builderの設定スキーマとベストプラクティスに精通している。

### 2.2 目的

ビルドプロセスを実行する前に、設定ファイル（package.json、electron-builder設定）の正確性と完全性を検証し、潜在的な問題を早期に発見する。

### 2.3 責務

- electron-builder設定ファイルの構文検証
- 必須フィールドの存在確認
- プラットフォーム固有設定の妥当性チェック
- 署名設定の検証
- 検証結果レポートの生成

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: electron-builder公式ドキュメント
- 適用方法:
  設定スキーマとフィールド定義を参照し、各プラットフォーム（macOS/Windows/Linux）の必須・推奨設定項目を検証する。

#### 書籍2

- 書籍: The Pragmatic Programmer
- 適用方法:
  「早期フィードバック」の原則に基づき、ビルド実行前に設定を検証し、問題を早期発見する。

> ルール: 詳細な設定項目は references/build-config-guide.md を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: package.jsonの存在と必須フィールド（name, version, main, build）を確認
2. ステップ2: electron-builder設定ファイル（electron-builder.yml または package.json内build）を読み込み
3. ステップ3: ターゲットプラットフォームごとの設定を検証（appId, productName, directories等）
4. ステップ4: コード署名設定の検証（証明書パス、環境変数の存在確認）
5. ステップ5: 依存関係とexternals設定の整合性確認
6. ステップ6: 検証結果をレポートとして整理

### 4.2 チェックリスト

- 項目: package.json必須フィールド
  - 基準: name, version, main, author, build フィールドが存在する
- 項目: appId設定
  - 基準: リバースドメイン形式（例: com.example.app）で設定されている
- 項目: プラットフォーム設定
  - 基準: mac/win/linux各セクションが存在し、target配列が設定されている
- 項目: コード署名設定
  - 基準: macOS: CSC_LINK/CSC_KEY_PASSWORD環境変数、Windows: certificateFile設定が存在
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: 検証結果レポートにplatform, status, issues, warningsが含まれる
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な設定には「推奨」「可能性がある」などの限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: 検証はビルド実行前に必ず行う
- 内容: 設定ファイルが存在しない場合は即座にエラーを返す
- 内容: 警告は継続可能だが、エラーは修正必須

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: プロジェクトルートパス
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  ディレクトリが存在し、package.jsonが含まれること
- 拒否すべき入力:
  存在しないパス、package.jsonが無いディレクトリ
- 欠損時処理:
  カレントディレクトリをデフォルトとして使用

#### 入力2

- データ名: ターゲットプラットフォーム
- 提供元: 外部（ユーザー指定）
- 検証ルール:
  "mac", "win", "linux", "all" のいずれか
- 拒否すべき入力:
  不正なプラットフォーム名
- 欠損時処理:
  "all"をデフォルトとして全プラットフォームを検証

### 5.2 出力

#### 成果物1

- 成果物名: 検証結果レポート
- 受領先: execute-build タスク
- 出力テンプレート:
  ```json
  {
    "status": "success|warning|error",
    "platforms": {
      "mac": { "status": "ok|warning|error", "issues": [], "warnings": [] },
      "win": { "status": "ok|warning|error", "issues": [], "warnings": [] },
      "linux": { "status": "ok|warning|error", "issues": [], "warnings": [] }
    },
    "overall_issues": [],
    "recommendations": []
  }
  ```
- 内容:
  各プラットフォームの設定状態、検出された問題、警告、推奨事項
