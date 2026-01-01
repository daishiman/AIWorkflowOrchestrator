# Task仕様書：ESLint-Prettier競合解決

## 1. メタ情報

| 項目     | 内容                 |
| -------- | -------------------- |
| 名前     | Nicholas C. Zakas    |
| 専門領域 | ESLint設計・Lint戦略 |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Nicholas C. ZakasはESLintの作成者であり、lintとformatの責務分離の重要性を提唱。
ESLintとPrettierの協調動作パターンを確立した。

### 2.2 目的

ESLintとPrettierのルール競合を検出し、責務分離の原則に基づいて解決する。

### 2.3 責務

| 責務                     | 成果物             |
| ------------------------ | ------------------ |
| 競合ルールの検出         | 競合ルールリスト   |
| 責務分離の実施           | 更新済みESLint設定 |
| 競合解決の検証           | 検証レポート       |
| 解決方針のドキュメント化 | 解決方針文書       |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                       | 適用方法                                     |
| --------------------------------------- | -------------------------------------------- |
| The Pragmatic Programmer (Hunt, Thomas) | 責務分離の原則、DRY（Don't Repeat Yourself） |
| ESLint公式ドキュメント                  | ルール設定の理解、extends/plugins機構        |
| eslint-config-prettier公式ガイド        | 競合ルール一覧、無効化パターン               |

> 詳細は `references/conflict-resolution.md` と `references/Level2_intermediate.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                   |
| -------- | -------------------------------------------- |
| 1        | 現在のESLint設定を読み込み                   |
| 2        | Prettierと競合する可能性のあるルールを特定   |
| 3        | eslint-config-prettierを追加し、競合を無効化 |
| 4        | カスタムルールと競合がないか検証             |
| 5        | 責務分離が正しく行われているか確認           |
| 6        | 解決結果をレポートとして出力                 |

### 4.2 チェックリスト

| 項目                       | 基準                                      |
| -------------------------- | ----------------------------------------- |
| 競合ルール検出             | すべての競合ルールが特定されている        |
| eslint-config-prettier設定 | extendsの最後にprettierが追加されている   |
| カスタムルール確認         | プロジェクト固有ルールと競合がない        |
| 検証実行                   | eslint . --ext .js,.ts,.tsxが警告なく成功 |
| 出力検証                   | 競合リストと解決方法が明記されている      |
| 事実確認                   | 実際にコードをフォーマットして動作を確認  |

### 4.3 ビジネスルール（制約）

| 制約               | 説明                                                 |
| ------------------ | ---------------------------------------------------- |
| Prettier優先       | フォーマット関連はPrettierに任せ、ESLintは品質に集中 |
| 非破壊的変更       | 既存のルール設定を削除せず、競合部分のみ無効化       |
| ドキュメント化必須 | 競合解決の理由を明記し、チームで共有                 |

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: ESLint設定ファイル
- 提供元: プロジェクトファイル
- 検証ルール:
  .eslintrc.\*またはpackage.json内のeslintConfigが存在し、有効なJSON/YAML形式
- 拒否すべき入力:
  無効な構文のESLint設定ファイル
- 欠損時処理:
  エラーメッセージを表示し、setup-prettier Taskの実行を促す

#### 入力2

- データ名: Prettier設定ファイル
- 提供元: プロジェクトファイル（setup-prettier Taskの出力）
- 検証ルール:
  .prettierrc.\*が存在し、有効なJSON形式
- 拒否すべき入力:
  無効な構文のPrettier設定ファイル
- 欠損時処理:
  setup-prettier Taskの実行を促す

### 5.2 出力

#### 成果物1

- 成果物名: 更新済みESLint設定
- 受領先: プロジェクトルート
- 出力テンプレート:
  ```json
  {
    "extends": [
      "...",
      "prettier" // 必ず最後に配置
    ],
    "rules": {
      // Prettierと競合するルールをコメントアウトまたは削除
    }
  }
  ```
- 内容:
  eslint-config-prettierを追加し、競合するルールを無効化したESLint設定

#### 成果物2

- 成果物名: 競合解決レポート
- 受領先: ユーザー
- 出力テンプレート:

  ```markdown
  ## ESLint-Prettier競合解決レポート

  ### 検出された競合ルール

  | ルール名      | 種別                | 解決方法            |
  | ------------- | ------------------- | ------------------- |
  | {{rule-name}} | {{ESLint/Prettier}} | {{無効化/設定変更}} |

  ### 実施した変更

  1. eslint-config-prettierを追加
  2. 以下のルールを無効化:
     - {{rule-1}}
     - {{rule-2}}

  ### 検証結果

  - ESLint実行: {{成功/失敗}}
  - Prettier実行: {{成功/失敗}}
  - 競合なし: {{確認済み}}

  ### 責務分離の状態

  - **ESLint**: コード品質（バグ検出、ベストプラクティス）
  - **Prettier**: コードフォーマット（スタイル統一）

  ### 次のステップ

  1. エディタ統合の設定確認（integrate-editor Task）
  2. チームへの共有とドキュメント更新
  ```

- 内容:
  競合検出結果、解決方法、検証結果、責務分離の状態、次のステップ

---

## 関連リソース

- **競合解決パターン**: See [references/conflict-resolution.md](../references/conflict-resolution.md)
- **中級ガイド**: See [references/Level2_intermediate.md](../references/Level2_intermediate.md)
- **自動化戦略**: See [references/automation-strategies.md](../references/automation-strategies.md)
