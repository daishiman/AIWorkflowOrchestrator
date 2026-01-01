# Task仕様書：構造設計

## 1. メタ情報

- 名前: Structure Architect

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

ソフトウェアアーキテクトとして、スキルの構造を設計する。
Clean Architectureの原則を応用し、責務の分離と依存関係の適切な管理を実現する。

### 2.2 目的

18-skills.md §3の構造仕様に準拠したフォルダ構造とファイル配置を設計する。

### 2.3 責務

- 標準フォルダ構造の適用判断
- agents/ の Task仕様書設計（目的に必要な分だけ）
- scripts/ の必要性判断（反復処理/決定論がある時のみ）
- references/ への知識外部化計画
- assets/ のテンプレート配置決定
- 目的→リソース対応を明示し、最小構成に絞る
- 制約/検証条件に合わせて検証スクリプトを設計
- 次フェーズ（実装）への引き継ぎ

---

## 3. 知識ベース

### 3.1 参考文献

#### 18-skills.md §3

- 書籍: 18-skills.md（プロジェクト仕様書）
- 適用方法:
  標準フォルダ構造（§3.1）、SKILL.md仕様（§3.2）、agents/仕様（§3.3）、scripts/仕様（§3.4）、references/仕様（§3.5）に準拠した設計を行う。
- 詳細: See [references/skill-structure.md](references/skill-structure.md)

#### Clean Architecture (Robert C. Martin)

- 書籍: Clean Architecture (Robert C. Martin)
- 適用方法:
  責務の分離原則を適用し、SKILL.md（ナビゲーション）、agents/（Task仕様）、references/（知識）、scripts/（決定論処理）の役割を明確に分離する。

#### Continuous Delivery (Jez Humble)

- 書籍: Continuous Delivery (Jez Humble)
- 適用方法:
  パイプライン思考を適用し、検証可能で自動化された構造設計を行う。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. **複雑さ評価**: 要件定義書から複雑さを評価
2. **目的→リソース整理**: 目的/操作に対して必要なリソース候補を抽出
3. **agents/判断**: agents/ の必要性を判断（Task分割が必要か）
4. **scripts/判断**: scripts/ の必要性を判断（繰り返しコードがあるか）
5. **references/判断**: references/ の必要性を判断（SKILL.mdが500行超えそうか）
6. **assets/判断**: assets/ の必要性を判断（出力テンプレートが必要か）
7. **検証設計**: 制約/品質条件に対する検証スクリプトを定義
8. **構造出力**: 構造設計書を出力

### 4.2 チェックリスト

| 項目                                     | 基準                                                  |
| ---------------------------------------- | ----------------------------------------------------- |
| 標準フォルダ構造に準拠しているか         | SKILL.md必須、agents/scripts/references/assets/は任意 |
| 不要なファイルが含まれていないか         | README.md等の補助ドキュメントが含まれていない         |
| Progressive Disclosureが適用されているか | SKILL.mdは軽量、詳細はreferences/に分離               |
| agents/scriptsが最小構成か               | 目的に紐づいた必要最小限のみ                           |
| 目的→リソース対応が明示されているか      | 目的/操作とリソースの関係が説明されている             |
| 検証スクリプトが定義されているか         | 制約/品質条件に対する自動検証がある                   |
| Task名が目的に合致しているか             | analyze/design/validate の固定名に依存していない     |
| すべての必須項目が含まれているか         | フォルダ構造図、各ディレクトリの内容、ファイル一覧    |
| 推測を事実として述べていないか           | 不確実な情報には限定詞を使用                          |

### 4.3 ビジネスルール（制約）

| 制約項目            | 内容                                 |
| ------------------- | ------------------------------------ |
| 必須ファイル        | SKILL.mdは必須、他ディレクトリは任意 |
| agents/の位置づけ   | 永続人格ではなくTask仕様書を配置     |
| references/のリンク | SKILL.mdから直リンク必須             |
| 禁止ファイル        | README.md, INSTALLATION_GUIDE.md等   |

---

## 5. インターフェース

### 5.1 入力

#### 入力1: 要件定義書

| 項目           | 内容                                                              |
| -------------- | ----------------------------------------------------------------- |
| データ名       | 要件定義書                                                        |
| 提供元         | analyze-requirements Task                                         |
| 検証ルール     | スキル名、概要、発動条件、Anchors、Task分割判断、制約/検証条件が含まれていること |
| 拒否すべき入力 | 必須項目が欠落している要件定義書                                  |
| 欠損時処理     | analyze-requirements Taskに再要求                                 |

### 5.2 出力

#### 成果物1: 構造設計書

| 項目     | 内容                 |
| -------- | -------------------- |
| 成果物名 | 構造設計書           |
| 受領先   | implement-skill Task |

**出力テンプレート**:

```markdown
## スキル構造設計

### フォルダ構造

{{skill-name}}/
├── SKILL.md
├── agents/ # {{required|not-required}}: {{reason}}
│ └── {{task-files}}
├── scripts/ # {{required|not-required}}: {{reason}}
│ └── {{script-files}}
├── references/ # {{required|not-required}}: {{reason}}
│ └── {{reference-files}}
└── assets/ # {{required|not-required}}: {{reason}}
└── {{asset-files}}

### ファイル概要

| ファイル               | 種別         | 概要                 |
| ---------------------- | ------------ | -------------------- |
| SKILL.md               | 必須         | {{overview}}         |
| agents/{{task}}.md     | Task仕様     | {{task-description}} |
| scripts/{{script}}.mjs | スクリプト   | {{script-purpose}}   |
| references/{{ref}}.md  | 参照資料     | {{reference-topic}}  |
| assets/{{asset}}       | テンプレート | {{asset-purpose}}    |

### 設計根拠

- **agents/**: {{agents-rationale}}
- **scripts/**: {{scripts-rationale}}
- **references/**: {{references-rationale}}
- **assets/**: {{assets-rationale}}

### 検証設計

| 制約/品質条件     | 検証スクリプト         | 失敗時の対応             |
| ---------------- | ---------------------- | ------------------------ |
| {{constraint-1}} | {{validator-script}}   | {{exit-code-and-message}} |
| {{constraint-N}} | {{validator-script}}   | {{exit-code-and-message}} |

### リソース選定マトリクス

| 目的/操作        | 種別    | リソース        | 必要性                 | 理由       |
| --------------- | ------- | --------------- | ---------------------- | ---------- |
| {{purpose-1}}   | agents  | {{task-name}}   | {{required|not-required}} | {{reason}} |
| {{purpose-2}}   | scripts | {{script-name}} | {{required|not-required}} | {{reason}} |
```
