# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 2                                                          |
| Phase名    | 設計                                                       |
| 前提Phase  | Phase 1（要件定義）                                        |
| 後続Phase  | Phase 3（設計レビューゲート）                              |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

5種類のテスト用フィクスチャのディレクトリ構造・ファイル内容、検証スクリプトの詳細設計、テスト実行スキルの構造を設計する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャディレクトリ構造設計

**目的**: 全フィクスチャのファイルシステム構造を確定する

**実行手順**:

1. Phase 1 の要件定義書（`outputs/phase-01/requirements-definition.md`）を読む
2. 以下のディレクトリ構造を設計する：

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
│   └── SKILL.md          # 不正な YAML Frontmatter
└── orchestration-skill/
    ├── SKILL.md
    └── assets/
        ├── chain-config.yaml
        └── parallel-config.yaml
```

3. 各ディレクトリの役割とskill-creator対応モードをテーブルで整理する：

| ディレクトリ         | 役割                         | 対応モード     | 検証ポイント                     |
| -------------------- | ---------------------------- | -------------- | -------------------------------- |
| complete-skill/      | 全リソースを持つ完全スキル   | create         | 全ディレクトリ存在、ファイル数   |
| minimal-skill/       | SKILL.md のみの最小スキル    | improve-prompt | SKILL.md 単体での妥当性          |
| partial-skill/       | 部分的なリソースを持つスキル | update         | 一部ディレクトリのみの場合の検証 |
| invalid-skill/       | 不正な SKILL.md を持つスキル | エラーケース   | 適切なエラーメッセージ           |
| orchestration-skill/ | オーケストレーション設定付き | orchestrate    | YAML 設定のパース可能性          |

4. `outputs/phase-02/fixture-design.md` に構造設計を記載する

**期待される成果物**:

- `outputs/phase-02/fixture-design.md`

---

### タスク2: complete-skill フィクスチャの詳細設計

**目的**: 完全なスキルフィクスチャの各ファイル内容を設計する

**実行手順**:

1. skill-creator の出力テンプレートを参照する：
   - `.claude/skills/skill-creator/assets/skill-template.md`（SKILL.md テンプレート）
   - `.claude/skills/skill-creator/assets/agent-template.md`（エージェント仕様テンプレート）
   - `.claude/skills/skill-creator/schemas/agent-definition.json`（エージェントスキーマ）

2. 以下のファイルを設計する：

**complete-skill/SKILL.md**:

```yaml
---
name: fixture-complete-skill
description: テスト用完全構成スキル - skill-creator出力検証用
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

- Anchors セクション（2つ以上）
- Operating Modes セクション
- Workflow セクション

**complete-skill/package.json**:

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

**complete-skill/EVALS.json**:

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

**complete-skill/agents/analyze-request.md**:

- TASK_TITLE, PERSONA_NAME, RESPONSIBILITIES, STEPS, INPUTS, OUTPUTS セクション
- skill-creator の `schemas/agent-definition.json` に準拠

**complete-skill/agents/generate-code.md**:

- 同上フォーマットで別のエージェント

**complete-skill/references/overview.md**:

- `#` 見出し + 概要説明
- Progressive Disclosure Level 1 のフォーマット

**complete-skill/references/quality-standards.md**:

- 品質基準の参照ガイドフォーマット

**complete-skill/scripts/utils.js**:

- EXIT_CODES 定義
- getArg(), resolvePath() ユーティリティ関数

**complete-skill/scripts/validate_all.js**:

- 統合検証スクリプトのスタブ

**complete-skill/assets/skill-template.md**:

- テンプレート変数 `{{skill_name}}`, `{{description}}` を含むテンプレート

**complete-skill/schemas/agent-definition.json**:

- JSON Schema Draft-07 フォーマット
- required プロパティ定義

3. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- complete-skill 詳細設計（`outputs/phase-02/fixture-design.md` に含む）

---

### タスク3: その他フィクスチャの詳細設計

**目的**: minimal/partial/invalid/orchestration フィクスチャの内容を設計する

**実行手順**:

1. **minimal-skill/SKILL.md** を設計する：

   ```yaml
   ---
   name: fixture-minimal-skill
   description: テスト用最小構成スキル
   allowed-tools:
     - Read
   ---
   ```

   - body: 最小限の `#` 見出し + 1段落の説明

2. **partial-skill/SKILL.md** を設計する：

   ```yaml
   ---
   name: fixture-partial-skill
   description: テスト用部分構成スキル
   allowed-tools:
     - Read
     - Write
   ---
   ```

   - agents/ ディレクトリのみ存在
   - **partial-skill/agents/single-agent.md**: 最小エージェント仕様

3. **invalid-skill/SKILL.md** を設計する：

   ```yaml
   ---
   name: fixture-invalid-skill
   description: # ← コロンを含む不正なYAML値
   allowed-tools: not-an-array
   ---
   ```

   - 不正な YAML を含み、パースエラーが発生する設計

4. **orchestration-skill/SKILL.md** を設計する：

   ```yaml
   ---
   name: fixture-orchestration-skill
   description: テスト用オーケストレーションスキル
   allowed-tools:
     - Bash
     - Read
   ---
   ```

   - **assets/chain-config.yaml**: 順次実行設定
   - **assets/parallel-config.yaml**: 並列実行設定

5. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- その他フィクスチャ設計（`outputs/phase-02/fixture-design.md` に含む）

---

### タスク4: 検証スクリプト詳細設計

**目的**: 各検証スクリプトの入力/出力/ロジックを設計する

**実行手順**:

1. 以下の検証スクリプトの詳細を設計する：

**validate-skill-structure.js**:

- 入力: `--target <skill-directory-path>`
- 出力: `{ valid: boolean, errors: string[], structure: { directories: string[], files: string[] } }`
- ロジック:
  - SKILL.md の存在チェック
  - 既知ディレクトリ（agents/, references/, scripts/, assets/, schemas/）の検出
  - ファイル命名規則チェック（kebab-case）

**validate-skill-md.js**:

- 入力: `--target <skill.md-path>`
- 出力: `{ valid: boolean, errors: string[], frontmatter: object, body: { headings: string[] } }`
- ロジック:
  - YAML Frontmatter パース（name, description, allowed-tools 必須）
  - body の Markdown 構造検証
  - Anchors セクションの存在確認（complete-skill のみ）

**validate-agents.js**:

- 入力: `--target <agents-directory-path>`
- 出力: `{ valid: boolean, errors: string[], agents: { name: string, hasRequiredSections: boolean }[] }`
- ロジック:
  - 各 .md ファイルの必須セクション確認（TASK_TITLE, STEPS, INPUTS, OUTPUTS）
  - Markdown 見出しレベルの検証

**validate-schemas.js**:

- 入力: `--target <schemas-directory-path>`
- 出力: `{ valid: boolean, errors: string[], schemas: { name: string, isValidJsonSchema: boolean }[] }`
- ロジック:
  - JSON パース可能性
  - `$schema` プロパティの存在
  - `type` プロパティの存在

**run-all-validations.js**:

- 入力: `--target <skill-directory-path> [--verbose]`
- 出力: `{ overall: boolean, results: { script: string, valid: boolean, errors: string[] }[] }`
- ロジック: 上記4スクリプトの順次実行と結果集約

2. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- 検証スクリプト設計（`outputs/phase-02/fixture-design.md` に含む）

---

### タスク5: skill-fixture-runner スキル設計

**目的**: テスト実行スキルの SKILL.md とディレクトリ構造を設計する

**実行手順**:

1. 以下のスキル構造を設計する：

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

2. SKILL.md の設計：

   ```yaml
   ---
   name: skill-fixture-runner
   description: skill-creator 出力フィクスチャの自動検証スキル
   allowed-tools:
     - Bash
     - Read
     - Glob
   ---
   ```

   - トリガー: フィクスチャ検証, skill validation, スキルテスト
   - Anchors: skill-creator（出力仕様参照）

3. `outputs/phase-02/fixture-design.md` に追記する

**期待される成果物**:

- skill-fixture-runner 設計（`outputs/phase-02/fixture-design.md` に含む）

---

## 参照資料

| 参照資料                   | パス                                                                                | 内容                 |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物             | `outputs/phase-01/requirements-definition.md`                                       | 要件定義             |
| skill-creator SKILL.md     | `.claude/skills/skill-creator/SKILL.md`                                             | メタスキル定義       |
| skill-creator テンプレート | `.claude/skills/skill-creator/assets/`                                              | 出力テンプレート     |
| skill-creator スキーマ     | `.claude/skills/skill-creator/schemas/`                                             | 出力スキーマ         |
| スキル構造仕様             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md 仕様        |
| TASK-8C-E 設計書           | `docs/30-workflows/completed-tasks/TASK-8C-E/outputs/phase-02/fixture-design.md`    | 参考フィクスチャ設計 |

---

## 成果物

| 成果物           | パス                                 | 内容                               |
| ---------------- | ------------------------------------ | ---------------------------------- |
| フィクスチャ設計 | `outputs/phase-02/fixture-design.md` | 構造・内容・スクリプト・スキル設計 |

---

## 統合テスト連携

**Phase 2 では統合テストの対象外**

設計フェーズのため、統合テストは Phase 4 以降で実施する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                                |
| -------------- | ----------------------------------------------------------------------- |
| テスタビリティ | フィクスチャが skill-creator の全出力パターンをカバーしているか         |
| 保守性         | skill-creator のバージョン更新時にフィクスチャの追従が容易か            |
| 拡張性         | 新しいフィクスチャ種別の追加が容易な構造か                              |
| スクリプト品質 | 検証スクリプトが skill-creator 既存スクリプトのパターンに準拠しているか |
| 仕様整合性     | aiworkflow-requirements のスキル構造仕様に一致しているか                |

---

## 完了条件

- [ ] 5種類のフィクスチャのディレクトリ構造が確定している
- [ ] complete-skill の全ファイル内容が設計されている
- [ ] minimal/partial/invalid/orchestration の内容が設計されている
- [ ] 5つの検証スクリプトの入力/出力/ロジックが設計されている
- [ ] skill-fixture-runner スキルの構造が設計されている
- [ ] 全設計が outputs/phase-02/ に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-03-design-review.md`
