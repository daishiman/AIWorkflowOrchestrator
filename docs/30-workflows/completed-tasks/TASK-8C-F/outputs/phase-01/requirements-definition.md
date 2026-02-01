# Phase 1: 要件定義書 - TASK-8C-F

## 1. skill-creator 出力構造分析

### 1.1 skill-creator 概要（v8.1.0）

skill-creator はスキルの作成・更新・プロンプト改善を行うメタスキル。以下のモードを持つ。

| モード         | 出力物                                            | 検証対象                 |
| -------------- | ------------------------------------------------- | ------------------------ |
| create         | SKILL.md + agents/ + references/ + scripts/ + etc | 全ディレクトリ構造       |
| update         | 既存スキルへの差分                                | 更新後の整合性           |
| improve-prompt | 最適化された SKILL.md                             | SKILL.md フォーマット    |
| collaborative  | ユーザー対話を経た完全スキル                      | 全出力物の品質           |
| orchestrate    | 実行エンジン選択結果                              | オーケストレーション設定 |

### 1.2 出力ディレクトリ構造

```
<generated-skill>/
├── SKILL.md               # メインスキル定義（必須・500行以内推奨）
├── package.json           # スクリプト定義
├── EVALS.json             # 評価メトリクス
├── agents/                # Task仕様書（推奨）
│   └── *.md
├── references/            # 参照ガイド（任意）
│   └── *.md
├── scripts/               # 決定論的スクリプト（任意）
│   └── *.js
├── assets/                # テンプレート・スターター（任意）
│   └── *.{md,js,yaml,json}
└── schemas/               # JSONスキーマ定義（任意）
    └── *.json
```

### 1.3 各ディレクトリの検証ポイント

| ディレクトリ | ファイル形式 | 主要な検証ポイント                                                     |
| ------------ | ------------ | ---------------------------------------------------------------------- |
| agents/      | \*.md        | TASK_TITLE, PERSONA_NAME, RESPONSIBILITIES, STEPS, INPUTS, OUTPUTS存在 |
| references/  | \*.md        | Markdown見出し構造、Progressive Disclosure レベル                      |
| scripts/     | \*.js        | EXIT_CODES定義、getArg/resolvePath使用パターン                         |
| assets/      | 各種         | テンプレート変数 `{{...}}` パターン                                    |
| schemas/     | \*.json      | JSON Schema Draft-07準拠                                               |

### 1.4 SKILL.md フォーマット仕様

| フィールド    | 型       | 必須 | 制約                       |
| ------------- | -------- | ---- | -------------------------- |
| name          | string   | 必須 | ハイフンケース、最大64文字 |
| description   | string   | 必須 | 最大1024文字、角括弧禁止   |
| allowed-tools | string[] | 任意 | 許可ツールの配列           |
| license       | string   | 任意 | ライセンス情報             |
| metadata      | object   | 任意 | 追加メタデータ             |

本文（body）推奨セクション: 概要、ワークフロー、Task仕様ナビ、ベストプラクティス、リソース参照

### 1.5 既存検証スクリプトのパターン

skill-creator の utils.js で定義される共通パターン:

| パターン           | 内容                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| EXIT_CODES         | SUCCESS=0, ERROR=1, ARGS_ERROR=2, FILE_NOT_FOUND=3, VALIDATION_FAILED=4 |
| getArg(name)       | CLI引数取得ヘルパー（エイリアス対応）                                   |
| resolvePath(path)  | パス解決ユーティリティ                                                  |
| parseFrontmatter() | YAML Frontmatterパース（マルチライン対応）                              |
| ValidationResult   | エラー/警告/情報トラッキングクラス                                      |

### 1.6 エージェント仕様書スキーマ（agent-definition.json）

必須フィールド: TASK_TITLE, FILE_NAME, LOAD_CONDITION, PERSONA_NAME, EXPERTISE, BACKGROUND, PURPOSE, RESPONSIBILITIES, REFERENCES, STEPS, CHECKLIST, CONSTRAINTS, INPUTS, OUTPUTS

---

## 2. フィクスチャ種別要件

### 2.1 フィクスチャ一覧

| フィクスチャ名      | 種別                 | 目的                                                                            | 対応モード     |
| ------------------- | -------------------- | ------------------------------------------------------------------------------- | -------------- |
| complete-skill      | 完全スキル           | 全ディレクトリ（agents/, references/, scripts/, assets/, schemas/）を持つスキル | create         |
| minimal-skill       | 最小スキル           | SKILL.mdのみの最小構成スキル                                                    | improve-prompt |
| partial-skill       | 部分スキル           | SKILL.md + agents/のみの部分構成スキル                                          | update         |
| invalid-skill       | 無効スキル           | YAML Frontmatterが不正なSKILL.md（検証失敗を確認）                              | エラーケース   |
| orchestration-skill | オーケストレーション | chain/parallel設定を持つスキル                                                  | orchestrate    |

### 2.2 complete-skill 要件

| ファイル                        | 要件                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------- |
| SKILL.md                        | YAML Frontmatter（name, description, version, allowed-tools）+ Anchors + Workflow |
| package.json                    | name, version, type, scripts定義                                                  |
| EVALS.json                      | skill_name, current_level, metrics                                                |
| agents/analyze-request.md       | agent-definition.json準拠、全必須セクション                                       |
| agents/generate-code.md         | 同上                                                                              |
| references/overview.md          | Markdown見出し構造                                                                |
| references/quality-standards.md | 品質基準ガイドフォーマット                                                        |
| scripts/utils.js                | EXIT_CODES, getArg(), resolvePath()                                               |
| scripts/validate_all.js         | 統合検証スタブ                                                                    |
| assets/skill-template.md        | テンプレート変数パターン                                                          |
| schemas/agent-definition.json   | JSON Schema Draft-07、required定義                                                |

### 2.3 minimal-skill 要件

- SKILL.md のみ（name: fixture-minimal-skill）
- agents/, references/, scripts/, assets/, schemas/ なし

### 2.4 partial-skill 要件

- SKILL.md + agents/single-agent.md
- references/, scripts/, assets/, schemas/ なし

### 2.5 invalid-skill 要件

- SKILL.md に意図的に不正なYAML（コロン含む値、allowed-toolsが非配列）

### 2.6 orchestration-skill 要件

- SKILL.md + assets/chain-config.yaml + assets/parallel-config.yaml
- chain-config.yaml: skills配列、on_error設定
- parallel-config.yaml: skills配列、result_aggregation設定

---

## 3. 検証スクリプト要件

### 3.1 スクリプト一覧

| スクリプト名                | 検証対象         | 入力                         | 出力形式                             |
| --------------------------- | ---------------- | ---------------------------- | ------------------------------------ |
| validate-skill-structure.js | ディレクトリ構造 | --target \<dir\>             | { valid, errors, structure }         |
| validate-skill-md.js        | SKILL.md         | --target \<skill.md-path\>   | { valid, errors, frontmatter, body } |
| validate-agents.js          | agents/\*.md     | --target \<agents-dir\>      | { valid, errors, agents }            |
| validate-schemas.js         | schemas/\*.json  | --target \<schemas-dir\>     | { valid, errors, schemas }           |
| run-all-validations.js      | 統合実行         | --target \<dir\> [--verbose] | { overall, results }                 |

### 3.2 各スクリプトの検証ロジック

**validate-skill-structure.js**:

- SKILL.mdの存在チェック
- 既知ディレクトリ（agents/, references/, scripts/, assets/, schemas/）の検出
- ファイル命名規則チェック（kebab-case）

**validate-skill-md.js**:

- YAML Frontmatterパース（name, description, allowed-tools必須）
- bodyのMarkdown構造検証
- Anchorsセクション存在確認（complete-skillのみ）

**validate-agents.js**:

- 各.mdファイルの必須セクション確認（TASK_TITLE, STEPS, INPUTS, OUTPUTS）
- Markdown見出しレベルの検証

**validate-schemas.js**:

- JSONパース可能性
- $schemaプロパティの存在
- typeプロパティの存在

**run-all-validations.js**:

- 上記4スクリプトの順次実行と結果集約
- overall: 全スクリプトがvalidの場合true

### 3.3 共通仕様

- 全スクリプトはNode.js ESM形式
- EXIT_CODESパターン準拠（0=成功, 1=エラー, 2=引数エラー, 3=ファイルなし, 4=検証失敗）
- JSON形式のstdout出力

---

## 4. テスト実行スキル要件（skill-fixture-runner）

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| スキル名     | skill-fixture-runner                                 |
| 目的         | skill-creator出力フィクスチャの自動検証              |
| 配置先       | .claude/skills/skill-fixture-runner/                 |
| 実行コマンド | node scripts/run-all-validations.js --target \<dir\> |
| 対応ツール   | Bash, Read, Glob                                     |
| トリガー     | フィクスチャ検証, skill validation, スキルテスト     |

### Progressive Disclosure設計

| レベル | ロード対象 | 内容                             |
| ------ | ---------- | -------------------------------- |
| 1      | SKILL.md   | メタデータ + 概要                |
| 2      | scripts/   | 検証スクリプト群                 |
| 3      | なし       | skill-creatorのreferences/を利用 |

### ディレクトリ構造

```
.claude/skills/skill-fixture-runner/
├── SKILL.md
├── EVALS.json
├── package.json
└── scripts/
    ├── validate-skill-structure.js
    ├── validate-skill-md.js
    ├── validate-agents.js
    ├── validate-schemas.js
    └── run-all-validations.js
```

---

## 5. aiworkflow-requirements 仕様整合性確認

| 仕様項目                 | 整合性確認結果                               |
| ------------------------ | -------------------------------------------- |
| SKILL.md 500行以内       | フィクスチャは全て500行以内で設計            |
| name ハイフンケース      | fixture-complete-skill等、ハイフンケース準拠 |
| description 最大1024文字 | 簡潔な説明文で収まる                         |
| 禁止ファイルなし         | README.md等は作成しない                      |
| agents/ Task仕様書形式   | agent-definition.jsonスキーマに準拠          |
| references/ 知識外部化   | Progressive Disclosureに従う                 |

---

## 完了ステータス

- [x] skill-creatorの出力構造パターンが分析・文書化されている
- [x] 5種類のフィクスチャ要件（complete/minimal/partial/invalid/orchestration）が定義されている
- [x] 5種類の検証スクリプト要件が定義されている
- [x] skill-fixture-runnerスキルの要件が定義されている
- [x] aiworkflow-requirementsのスキル構造仕様との整合性が確認されている
