# Phase 2: テストケース設計書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 2          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 新規テストケース設計（34件）

### describe: Boundary Value Fixtures（12件）

| TC     | テスト名                                                        | 検証内容                           | 対応要件      |
| ------ | --------------------------------------------------------------- | ---------------------------------- | ------------- |
| TC-063 | boundary-skill/SKILL.mdのnameが64文字である                     | Frontmatter name長 = 64            | FR-B1         |
| TC-064 | boundary-skill/SKILL.mdのdescriptionが10文字である              | Frontmatter description長 = 10     | FR-B2         |
| TC-065 | boundary-skill/SKILL.mdにAnchorsセクションがある                | body内に `## Anchors` 存在         | FR-B5         |
| TC-066 | boundary-skill/SKILL.mdにTriggerセクションがある                | body内に `## Trigger` 存在         | FR-B5         |
| TC-067 | boundary-skill/SKILL.mdのversionがsemver形式である              | version が `/^\d+\.\d+\.\d+$/`     | FR-B9         |
| TC-068 | boundary-skill/agents/boundary-agent.mdが全必須セクションを持つ | TASK_TITLE, STEPS, INPUTS, OUTPUTS | FR-A8         |
| TC-069 | boundary-skill/schemas/boundary-schema.jsonが$schemaを持つ      | JSON内に$schemaプロパティ存在      | FR-A5(正常系) |
| TC-070 | boundary-skill/assets/chain-config.yamlのstepsが2である         | chain steps配列長 = 2              | FR-B6         |
| TC-071 | boundary-skill/assets/parallel-config.yamlのtasksが2である      | parallel tasks配列長 = 2           | FR-B7         |
| TC-072 | validate-skill-structure.jsがboundary-skillをvalidと判定        | スクリプト出力 valid = true        | FR-B1~B9      |
| TC-073 | validate-skill-md.jsがboundary-skillをvalidと判定               | スクリプト出力 valid = true        | FR-B1~B9      |
| TC-074 | run-all-validations.jsがboundary-skillをoverall validと判定     | スクリプト出力 overall = true      | FR-B1~B9      |

### describe: Error Pattern Fixtures（8件）

| TC     | テスト名                                                          | 検証内容                   | 対応要件 |
| ------ | ----------------------------------------------------------------- | -------------------------- | -------- |
| TC-075 | missing-fields-skill/SKILL.mdのvalidate-skill-md.jsがエラーを返す | name/description欠落エラー | FR-A2    |
| TC-076 | forbidden-files-skill/のvalidate-skill-structure.jsがエラーを返す | README.md検出エラー        | FR-A1    |
| TC-077 | invalid-name-skill/のvalidate-skill-md.jsがエラーを返す           | kebab-case違反エラー       | FR-A3    |
| TC-078 | empty-agents-skill/のvalidate-agents.jsがエラーを返す             | .mdファイルなしエラー      | FR-A4    |
| TC-079 | invalid-schema-skill/のvalidate-schemas.jsがエラーを返す          | $schema/type欠落エラー     | FR-A5    |
| TC-080 | missing-fields-skill/のエラーメッセージにnameが含まれる           | エラー内容の具体性         | FR-A2    |
| TC-081 | forbidden-files-skill/のエラーメッセージにREADME.mdが含まれる     | 禁止ファイル名の具体性     | FR-A1    |
| TC-082 | invalid-name-skill/のエラーメッセージにkebab-caseが含まれる       | 命名規則違反メッセージ     | FR-A3    |

### describe: Validation Script Edge Cases（8件）

| TC     | テスト名                                                        | 検証内容         | 対応要件 |
| ------ | --------------------------------------------------------------- | ---------------- | -------- |
| TC-083 | validate-skill-structure.jsが--target未指定でEXIT_CODE=2を返す  | ARGS_ERROR       | FR-A6    |
| TC-084 | validate-skill-md.jsが--target未指定でEXIT_CODE=2を返す         | ARGS_ERROR       | FR-A6    |
| TC-085 | validate-agents.jsが--target未指定でEXIT_CODE=2を返す           | ARGS_ERROR       | FR-A6    |
| TC-086 | validate-schemas.jsが--target未指定でEXIT_CODE=2を返す          | ARGS_ERROR       | FR-A6    |
| TC-087 | validate-skill-structure.jsが存在しないパスでEXIT_CODE=3を返す  | FILE_NOT_FOUND   | FR-A10   |
| TC-088 | run-all-validations.jsがagents/なしでagents検証をスキップする   | 条件付き実行パス | FR-A9    |
| TC-089 | run-all-validations.jsがschemas/なしでschemas検証をスキップする | 条件付き実行パス | FR-A9    |
| TC-090 | run-all-validations.jsが--target未指定でEXIT_CODE=2を返す       | ARGS_ERROR       | FR-A6    |

### describe: Test Quality Improvements（6件）

| TC     | テスト名                                                                     | 検証内容                    | 対応要件 |
| ------ | ---------------------------------------------------------------------------- | --------------------------- | -------- |
| TC-091 | complete-skillのSKILL.mdをFrontmatterパースでnameを検証できる                | パース済みオブジェクト検証  | FR-D1    |
| TC-092 | complete-skillのSKILL.mdをFrontmatterパースでdescriptionを検証できる         | パース済みオブジェクト検証  | FR-D1    |
| TC-093 | complete-skillのSKILL.mdをFrontmatterパースでallowed-toolsを配列検証できる   | 配列型検証                  | FR-D3    |
| TC-094 | validate-skill-structure.jsのJSON出力をパースしてvalidプロパティを検証できる | JSON.parse + プロパティ検証 | FR-D2    |
| TC-095 | validate-skill-md.jsのJSON出力をパースしてfrontmatterプロパティを検証できる  | ネストプロパティ検証        | FR-D2    |
| TC-096 | validate-agents.jsのJSON出力をパースしてagents配列を検証できる               | 配列要素検証                | FR-D2    |

## テスト品質改善設計（Dカテゴリ）

### D1: YAMLパーサー統一

- 既存 `parseFrontmatter` ヘルパーを活用
- `content.includes('name:')` → `parseFrontmatter(content).name` に統一

### D2: assertion強化

- `expect(output).toContain('"valid"')` → `expect(JSON.parse(output).valid).toBe(true)` に変更
- JSON出力は `parseValidationOutput` でパースしてからプロパティ検証

### D3: YAML文字列チェック改善

- `content.includes('allowed-tools:')` → `parseFrontmatter(content)['allowed-tools']` 配列検証に変更

## テストケースサマリー

| カテゴリ                     | 件数   | TC範囲        |
| ---------------------------- | ------ | ------------- |
| 既存テスト                   | 62     | TC-001~TC-062 |
| Boundary Value Fixtures      | 12     | TC-063~TC-074 |
| Error Pattern Fixtures       | 8      | TC-075~TC-082 |
| Validation Script Edge Cases | 8      | TC-083~TC-090 |
| Test Quality Improvements    | 6      | TC-091~TC-096 |
| **合計**                     | **96** |               |
