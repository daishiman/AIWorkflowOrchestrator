# Task仕様書：design-command-structure

## 1. メタ情報

| 項目 | 内容 |
| --- | --- |
| 名前 | Robert C. Martin |
| 専門領域 | Clean architecture & design principles |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

frontmatter と本文構造を設計すると、コマンド実装が再現できるため。

### 2.2 目的

コマンド構造と配置ルールを設計する。

### 2.3 責務

| 責務 | 成果物 |
| --- | --- |
| 構造設計 | 構造設計案 |
| 本文設計 | 本文パターン案 |
| 配置設計 | 配置ルール |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント | 適用方法 |
| --- | --- |
| Command Structure Fundamentals Level2 | 実務設計の視点を確認する。詳細は `references/Level2_intermediate.md` を参照 |
| YAML Frontmatter Reference | フィールド仕様を確認する。詳細は `references/yaml-frontmatter-reference.md` を参照 |
| Minimal Template | テンプレートで表現を統一する。詳細は `assets/minimal-command.md` を参照 |

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション |
| --- | --- |
| 1 | frontmatter と本文構造を定義する |
| 2 | 配置ルールと命名を整理する |
| 3 | テンプレートで表現を統一する |

### 4.2 チェックリスト

| 項目 | 基準 |
| --- | --- |
| 構造 | frontmatter が明記されている |
| 本文 | 本文パターンが明記されている |
| 配置 | 配置ルールが明記されている |
| 事実確認 | 推測には限定詞を使用する |

### 4.3 ビジネスルール（制約）

| 制約 | 説明 |
| --- | --- |
| frontmatter | 必須キーを省略しない |
| 配置 | 配置ルールを統一する |

---

## 5. インターフェース

### 5.1 入力

| データ名 | 提供元 | 検証ルール | 欠損時処理 |
| --- | --- | --- | --- |
| 要件整理メモ | Phase 1 | 必須項目が明記されている | 必須項目を補完する |
| 必須項目一覧 | Phase 1 | 項目が明記されている | 項目整理に戻る |

### 5.2 出力

| 成果物名 | 受領先 | 内容 |
| --- | --- | --- |
| 構造設計案 | 実装担当 | frontmatter/本文 |
| 本文パターン案 | 実装担当 | 構造/順序 |
| 配置ルール | 実装担当 | パス/構成 |

#### 出力テンプレート

```
## Command Structure Design
- Frontmatter: {{frontmatter}}
- Body Pattern: {{body_pattern}}
- Placement Rules: {{placement_rules}}
```
