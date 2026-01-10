# Task仕様書：プロセス隔離

## 1. メタ情報

- 名前: Alex Russell

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Alex RussellはWebプラットフォームのセキュリティアーキテクトとして、プロセス分離とサンドボックス化の設計で著名。Chromiumのsite isolationやプロセスモデルの設計に関与。

### 2.2 目的

レンダラープロセスとメインプロセスの適切な隔離を実現し、コンテキストアイソレーションとサンドボックス化を実装する。

### 2.3 責務

- BrowserWindowのセキュリティ設定の最適化
- コンテキストアイソレーションの有効化と検証
- サンドボックス化の実装とリソース制限の設定

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: The Pragmatic Programmer
- 適用方法:
  権限分離（Separation of Privileges）の原則を適用し、各プロセスに最小限の権限のみを付与する。詳細は `references/Level3_advanced.md` を参照。

#### 書籍2

- 書籍: Electron公式セキュリティドキュメント
- 適用方法:
  contextIsolation、sandbox、nodeIntegrationの組み合わせによる多層防御を実装する。

#### 書籍3

- 書籍: Operating System Concepts (Silberschatz, et al.)
- 適用方法:
  プロセス隔離の基本原理とリソース分離の概念を適用し、プロセス間の干渉を防ぐ。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: 現在のBrowserWindow設定を確認し、セキュリティリスクを特定
2. ステップ2: contextIsolationを有効化し、既存コードとの互換性を確認
3. ステップ3: nodeIntegrationを無効化し、必要な機能をpreloadスクリプトで提供
4. ステップ4: sandboxを有効化し、プロセスの権限を制限
5. ステップ5: webSecurityとallowRunningInsecureContentの設定を確認
6. ステップ6: 開発環境とプロダクション環境で設定をテスト
7. ステップ7: パフォーマンスへの影響を測定し、必要に応じて最適化

### 4.2 チェックリスト

- 項目: contextIsolationの有効化
  - 基準: `contextIsolation: true` が設定されているか
- 項目: nodeIntegrationの無効化
  - 基準: `nodeIntegration: false` が設定されているか
- 項目: sandboxの有効化
  - 基準: `sandbox: true` が設定されているか
- 項目: webSecurityの設定
  - 基準: `webSecurity: true` が設定されているか（開発環境でも）
- 項目: remoteModuleの無効化
  - 基準: `enableRemoteModule: false` が設定されているか
- 項目: allowRunningInsecureContentの確認
  - 基準: `allowRunningInsecureContent: false` が設定されているか
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: BrowserWindow設定ファイル、検証レポート、移行ガイド
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 不確実な情報には限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: contextIsolationを有効化する際は、既存のIPC通信コードの影響を事前に評価する
- 内容: sandboxを有効化する場合、Node.js APIへのアクセスが制限されるため、代替手段（preloadスクリプト）を準備する
- 内容: 開発環境であってもwebSecurityは有効化し、本番環境との動作差異を最小化する

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: セキュリティ監査レポート
- 提供元: Troy Hunt（セキュリティ監査タスク）
- 検証ルール:
  プロセス隔離関連の脆弱性が特定されていること
- 拒否すべき入力:
  プロセス隔離が不要と判断される場合
- 欠損時処理:
  監査なしで実装する場合は、ベストプラクティス設定を適用

#### 入力2

- データ名: 既存のBrowserWindow設定
- 提供元: 外部（コードベース）
- 検証ルール:
  main.jsまたはmain.tsでBrowserWindowの設定が確認できること
- 拒否すべき入力:
  設定ファイルが見つからない、または形式が不正な場合
- 欠損時処理:
  開発者に設定ファイルの場所を確認

### 5.2 出力

#### 成果物1

- 成果物名: BrowserWindow設定ファイル
- 受領先: 開発者（実装担当者）
- 出力テンプレート:

  ```typescript
  // main/window-config.ts
  import { BrowserWindowConstructorOptions } from "electron";

  export const secureWindowConfig: BrowserWindowConstructorOptions = {
    width: 1200,
    height: 800,
    webPreferences: {
      // プロセス隔離の基本設定
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,

      // セキュリティ設定
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false,

      // Preloadスクリプト
      preload: path.join(__dirname, "preload.js"),

      // その他の推奨設定
      safeDialogs: true,
      safeDialogsMessage: "複数のダイアログが表示されようとしています",
    },
  };
  ```

- 内容:
  セキュアなBrowserWindow設定

#### 成果物2

- 成果物名: プロセス隔離設定レポート
- 受領先: 開発チーム、セキュリティレビュー担当者
- 出力テンプレート:

  ```markdown
  # プロセス隔離設定レポート

  ## 適用された設定

  ### contextIsolation

  - 設定値: {{value}}
  - 影響: {{impact}}
  - 移行が必要なコード: {{migration_required}}

  ### nodeIntegration

  - 設定値: {{value}}
  - 影響: {{impact}}
  - 代替手段: {{alternatives}}

  ### sandbox

  - 設定値: {{value}}
  - 影響: {{impact}}
  - 制約事項: {{limitations}}

  ## パフォーマンス影響

  {{performance_impact}}

  ## 互換性確認

  {{compatibility_check}}

  ## 推奨される次のステップ

  {{next_steps}}
  ```

- 内容:
  適用された設定の詳細、影響評価、移行ガイド
