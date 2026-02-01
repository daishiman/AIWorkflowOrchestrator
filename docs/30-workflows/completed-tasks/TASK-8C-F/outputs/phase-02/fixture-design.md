# Phase 2: フィクスチャ設計書 - TASK-8C-F

## 1. フィクスチャディレクトリ構造設計

```
apps/desktop/src/__tests__/__fixtures__/skill-creator/
├── complete-skill/
│   ├── SKILL.md
│   ├── package.json
│   ├── EVALS.json
│   ├── agents/
│   │   ├── analyze-request.md
│   │   └── generate-code.md
│   ├── references/
│   │   ├── overview.md
│   │   └── quality-standards.md
│   ├── scripts/
│   │   ├── utils.js
│   │   └── validate_all.js
│   ├── assets/
│   │   └── skill-template.md
│   └── schemas/
│       └── agent-definition.json
├── minimal-skill/
│   └── SKILL.md
├── partial-skill/
│   ├── SKILL.md
│   └── agents/
│       └── single-agent.md
├── invalid-skill/
│   └── SKILL.md
└── orchestration-skill/
    ├── SKILL.md
    └── assets/
        ├── chain-config.yaml
        └── parallel-config.yaml
```

### ディレクトリ役割マッピング

| ディレクトリ         | 役割                         | 対応モード     | 検証ポイント                     |
| -------------------- | ---------------------------- | -------------- | -------------------------------- |
| complete-skill/      | 全リソースを持つ完全スキル   | create         | 全ディレクトリ存在、ファイル数   |
| minimal-skill/       | SKILL.mdのみの最小スキル     | improve-prompt | SKILL.md単体での妥当性           |
| partial-skill/       | 部分的なリソースを持つスキル | update         | 一部ディレクトリのみの場合の検証 |
| invalid-skill/       | 不正なSKILL.mdを持つスキル   | エラーケース   | 適切なエラーメッセージ           |
| orchestration-skill/ | オーケストレーション設定付き | orchestrate    | YAML設定のパース可能性           |

---

## 2. complete-skill フィクスチャ詳細設計

### 2.1 complete-skill/SKILL.md

```yaml
---
name: fixture-complete-skill
description: |
  テスト用完全構成スキル - skill-creator出力検証用フィクスチャ。
  全ディレクトリ（agents/, references/, scripts/, assets/, schemas/）を含む完全な構造。

  Anchors:
  * Clean Code (Robert C. Martin) / 適用: コード品質 / 目的: テスト可能な構造設計
  * Test-Driven Development (Kent Beck) / 適用: テスト駆動 / 目的: フィクスチャ検証

  Trigger:
  fixture validation, complete skill test, skill-creator output verification
version: 1.0.0
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
```

body:

- `# Fixture Complete Skill` 見出し
- 概要セクション
- ワークフローセクション（Sequential パターン）
- Task仕様ナビ（agents/ 参照）
- ベストプラクティステーブル
- リソース参照（scripts/, references/, assets/）

### 2.2 complete-skill/package.json

```json
{
  "name": "@skills/fixture-complete-skill",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "validate": "node scripts/validate_all.js"
  }
}
```

### 2.3 complete-skill/EVALS.json

```json
{
  "skill_name": "fixture-complete-skill",
  "current_level": 1,
  "metrics": {
    "total_usage_count": 0,
    "success_count": 0,
    "failure_count": 0
  }
}
```

### 2.4 complete-skill/agents/analyze-request.md

- TASK_TITLE: Analyze Request
- FILE_NAME: analyze-request
- LOAD_CONDITION: ユーザーリクエストの分析が必要な場合
- PERSONA_NAME: Request Analyzer
- EXPERTISE: リクエスト解析と要件抽出
- BACKGROUND: ユーザーの入力を分析し、実行可能な要件に変換する
- PURPOSE: 入力リクエストから明確な要件を抽出する
- RESPONSIBILITIES: リクエスト解析、要件整理
- REFERENCES: skill-creator SKILL.md
- STEPS: 3ステップ（入力受付→解析→要件出力）
- CHECKLIST: 要件の完全性確認
- CONSTRAINTS: 入力フォーマットの制約
- INPUTS: ユーザーリクエスト文字列
- OUTPUTS: 構造化された要件オブジェクト

### 2.5 complete-skill/agents/generate-code.md

- TASK_TITLE: Generate Code
- FILE_NAME: generate-code
- LOAD_CONDITION: コード生成が必要な場合
- PERSONA_NAME: Code Generator
- 同上フォーマットで別のエージェント仕様

### 2.6 complete-skill/references/overview.md

- `# Overview` 見出し
- スキルの全体像説明
- 各コンポーネントへのリンク
- Progressive Disclosure Level 1 フォーマット

### 2.7 complete-skill/references/quality-standards.md

- `# Quality Standards` 見出し
- コード品質基準
- テスト基準

### 2.8 complete-skill/scripts/utils.js

- EXIT_CODES: { SUCCESS: 0, ERROR: 1, ARGS_ERROR: 2, FILE_NOT_FOUND: 3, VALIDATION_FAILED: 4 }
- getArg(name): process.argv からCLI引数取得
- resolvePath(relativePath): パス解決

### 2.9 complete-skill/scripts/validate_all.js

- utils.js をインポート
- SKILL.md 存在チェック
- 基本構造検証のスタブ

### 2.10 complete-skill/assets/skill-template.md

- テンプレート変数: `{{skill_name}}`, `{{description}}`
- SKILL.md の雛形フォーマット

### 2.11 complete-skill/schemas/agent-definition.json

- $schema: "http://json-schema.org/draft-07/schema#"
- type: "object"
- required: ["TASK_TITLE", "STEPS"]
- properties: TASK_TITLE(string), STEPS(array) 等

---

## 3. その他フィクスチャ詳細設計

### 3.1 minimal-skill/SKILL.md

```yaml
---
name: fixture-minimal-skill
description: テスト用最小構成スキル
allowed-tools:
  - Read
---
```

body: `# Minimal Skill` + 最小限の説明（1段落）

### 3.2 partial-skill/SKILL.md

```yaml
---
name: fixture-partial-skill
description: テスト用部分構成スキル
allowed-tools:
  - Read
  - Write
---
```

body: `# Partial Skill` + agents/ ディレクトリの説明

### 3.3 partial-skill/agents/single-agent.md

- TASK_TITLE: Single Agent Task
- STEPS: 最小限の2ステップ
- INPUTS: 単一入力
- OUTPUTS: 単一出力

### 3.4 invalid-skill/SKILL.md

```yaml
---
name: fixture-invalid-skill
description: This is invalid: because of unquoted colon
allowed-tools: not-an-array
---
```

意図的にYAMLパースエラーを発生させる設計:

- description値にクォートされていないコロンを含む
- allowed-toolsが配列でなく文字列

### 3.5 orchestration-skill/SKILL.md

```yaml
---
name: fixture-orchestration-skill
description: テスト用オーケストレーションスキル
allowed-tools:
  - Bash
  - Read
---
```

body: オーケストレーション設定の説明

### 3.6 orchestration-skill/assets/chain-config.yaml

```yaml
name: fixture-chain
version: "1.0.0"
description: テスト用チェーン設定
steps:
  - id: step-1
    skill: analyze-request
    args: {}
    depends_on: []
    timeout: 30
  - id: step-2
    skill: generate-code
    args: {}
    depends_on: [step-1]
    timeout: 60
error_handling:
  on_step_error: abort
  max_retries: 1
```

### 3.7 orchestration-skill/assets/parallel-config.yaml

```yaml
name: fixture-parallel
version: "1.0.0"
description: テスト用パラレル設定
tasks:
  - id: task-1
    skill: analyze-request
    args: {}
    priority: 1
    timeout: 30
    required: true
  - id: task-2
    skill: generate-code
    args: {}
    priority: 1
    timeout: 30
    required: false
execution:
  max_concurrency: 2
  fail_fast: false
  timeout: 120
result_aggregation:
  strategy: merge
  merge_strategy: shallow
  include_failed: false
```

---

## 4. 検証スクリプト詳細設計

### 4.1 validate-skill-structure.js

- 入力: `--target <skill-directory-path>`
- 出力: `{ valid: boolean, errors: string[], structure: { directories: string[], files: string[] } }`
- ロジック:
  1. SKILL.md の存在チェック
  2. 既知ディレクトリ検出（agents/, references/, scripts/, assets/, schemas/）
  3. ファイル命名規則チェック（kebab-case）
  4. 禁止ファイルチェック（README.md等）

### 4.2 validate-skill-md.js

- 入力: `--target <skill.md-path>`
- 出力: `{ valid: boolean, errors: string[], frontmatter: object, body: { headings: string[] } }`
- ロジック:
  1. YAML Frontmatterパース
  2. 必須フィールド確認（name, description）
  3. name形式検証（ハイフンケース）
  4. bodyのMarkdown見出し抽出

### 4.3 validate-agents.js

- 入力: `--target <agents-directory-path>`
- 出力: `{ valid: boolean, errors: string[], agents: { name: string, hasRequiredSections: boolean }[] }`
- ロジック:
  1. \*.md ファイル列挙
  2. 各ファイルの必須セクション確認（TASK_TITLE, STEPS, INPUTS, OUTPUTS）
  3. Markdown見出しレベル検証

### 4.4 validate-schemas.js

- 入力: `--target <schemas-directory-path>`
- 出力: `{ valid: boolean, errors: string[], schemas: { name: string, isValidJsonSchema: boolean }[] }`
- ロジック:
  1. \*.json ファイル列挙
  2. JSON パース可能性
  3. $schema プロパティ存在
  4. type プロパティ存在

### 4.5 run-all-validations.js

- 入力: `--target <skill-directory-path> [--verbose]`
- 出力: `{ overall: boolean, results: { script: string, valid: boolean, errors: string[] }[] }`
- ロジック:
  1. validate-skill-structure.js 実行
  2. validate-skill-md.js 実行
  3. validate-agents.js 実行（agents/ 存在時のみ）
  4. validate-schemas.js 実行（schemas/ 存在時のみ）
  5. 結果集約

---

## 5. skill-fixture-runner スキル設計

### 5.1 ディレクトリ構造

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

### 5.2 SKILL.md 設計

```yaml
---
name: skill-fixture-runner
description: |
  skill-creator出力フィクスチャの自動検証スキル。
  フィクスチャのディレクトリ構造、SKILL.mdフォーマット、エージェント仕様書、JSONスキーマを検証する。

  Anchors:
  * skill-creator / 適用: 出力仕様参照 / 目的: 検証基準の源泉

  Trigger:
  fixture validation, skill validation, スキルテスト, フィクスチャ検証
allowed-tools:
  - Bash
  - Read
  - Glob
---
```

body:

- 概要（検証スクリプト群の説明）
- 使い方（コマンド例）
- スクリプト一覧テーブル

---

## 完了ステータス

- [x] 5種類のフィクスチャのディレクトリ構造が確定している
- [x] complete-skillの全ファイル内容が設計されている
- [x] minimal/partial/invalid/orchestrationの内容が設計されている
- [x] 5つの検証スクリプトの入力/出力/ロジックが設計されている
- [x] skill-fixture-runnerスキルの構造が設計されている
