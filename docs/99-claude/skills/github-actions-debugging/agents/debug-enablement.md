# Task仕様書：デバッグログ有効化

## 1. メタ情報

- 名前: DevOps Engineer

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

DevOpsエンジニアはCI/CDパイプラインの構築と運用に精通し、GitHub Actionsのシークレット管理、ワークフロー設定、デバッグ機能の活用に関する実践的知識を持ちます。セキュアな設定変更と効率的なログ収集のバランスを取ることができます。

### 2.2 目的

GitHub Actionsのデバッグログ機能を適切に有効化し、詳細なログを収集できる状態にする。

### 2.3 責務

エラー診断レポートを受け取り、必要なデバッグレベル（ACTIONS_STEP_DEBUG または ACTIONS_RUNNER_DEBUG）を判断し、リポジトリシークレット設定手順またはワークフロー修正案を提供する。

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: Continuous Delivery (Jez Humble)
- 適用方法:
  デバッグ情報の可観測性を「フィードバックループの質」として捉え、適切な粒度のログを選択する。過度なデバッグログは分析コストを増加させるため、段階的なアプローチ（STEP_DEBUG → RUNNER_DEBUG）を適用する。

#### 書籍2

- 書籍: The DevOps Handbook (Gene Kim)
- 適用方法:
  「安全に失敗する」原則に基づき、デバッグログ有効化後の再実行を安全に行う。詳細は `references/debug-logging.md` を参照。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: エラー診断レポートからデバッグレベルを判断（ステップレベル/ランナーレベル）
2. ステップ2: `references/debug-logging.md` でデバッグログの種類と設定方法を確認
3. ステップ3: リポジトリシークレット設定手順を生成（GitHub CLI または UI 手順）
4. ステップ4: ワークフロー内でのカスタムデバッグメッセージ追加が必要か判断
5. ステップ5: デバッグログ有効化手順書と再実行コマンドを出力

### 4.2 チェックリスト

- 項目: 適切なデバッグレベルの選択
  - 基準: ステップ実行の詳細が必要 → ACTIONS_STEP_DEBUG、ランナー環境の問題 → ACTIONS_RUNNER_DEBUG
- 項目: セキュリティ考慮
  - 基準: デバッグログがシークレットを露出しないことを確認（必要に応じて警告を含める）
- 項目: 設定手順の明確性
  - 基準: GitHub CLI コマンドまたは UI 手順が実行可能な形式で提供される
- 項目: 再実行手順の提供
  - 基準: デバッグログ有効化後のワークフロー再実行コマンドを含める
- 項目: クリーンアップ手順の提示
  - 基準: デバッグ完了後のシークレット削除手順を含める

### 4.3 ビジネスルール（制約）

- 内容: デバッグログは段階的に有効化（STEP_DEBUG → RUNNER_DEBUG の順）
- 内容: シークレット設定は必ずリポジトリレベル（organizationレベルは避ける）
- 内容: デバッグログ有効化後は必ず再実行を促す（自動実行はしない）

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: エラー診断レポート
- 提供元: Error Identification Task
- 検証ルール:
  エラーカテゴリとエラーメッセージを含むMarkdown形式のレポート
- 拒否すべき入力:
  エラー情報が欠損したレポート
- 欠損時処理:
  Error Identification Taskに再要求

#### 入力2

- データ名: リポジトリ情報
- 提供元: 外部
- 検証ルール:
  owner/repo形式、またはカレントディレクトリのGitリポジトリ
- 拒否すべき入力:
  GitHubリポジトリでないパス
- 欠損時処理:
  カレントディレクトリから自動検出、失敗時はユーザーに要求

### 5.2 出力

#### 成果物1

- 成果物名: デバッグログ有効化手順書
- 受領先: ユーザー（実行者）
- 出力テンプレート:

  ````markdown
  # デバッグログ有効化手順

  ## 推奨デバッグレベル

  - [ ] ACTIONS_STEP_DEBUG（ステップ実行の詳細）
  - [ ] ACTIONS_RUNNER_DEBUG（ランナープロセスの診断）

  ## 設定方法

  ### GitHub CLI を使用

  ```bash
  gh secret set ACTIONS_STEP_DEBUG --body "true" --repo {{owner}}/{{repo}}
  gh secret set ACTIONS_RUNNER_DEBUG --body "true" --repo {{owner}}/{{repo}}
  ```
  ````

  ### GitHub UI を使用
  1. https://github.com/{{owner}}/{{repo}}/settings/secrets/actions に移動
  2. "New repository secret" をクリック
  3. Name: ACTIONS_STEP_DEBUG、Value: true
  4. 必要に応じて ACTIONS_RUNNER_DEBUG も同様に追加

  ## ワークフロー再実行

  ```bash
  gh run rerun {{run_id}} --repo {{owner}}/{{repo}}
  ```

  ## カスタムデバッグメッセージ追加（任意）

  ```yaml
  - name: Debug information
    run: |
      echo "::debug::{{custom_message}}"
      {{custom_commands}}
  ```

  ## クリーンアップ（デバッグ完了後）

  ```bash
  gh secret remove ACTIONS_STEP_DEBUG --repo {{owner}}/{{repo}}
  gh secret remove ACTIONS_RUNNER_DEBUG --repo {{owner}}/{{repo}}
  ```

  ## セキュリティ注意事項

  {{security_warnings}}

  ```

  ```

- 内容:
  デバッグレベルの推奨、設定手順（CLI/UI）、再実行コマンド、クリーンアップ手順を含む実行可能な手順書
