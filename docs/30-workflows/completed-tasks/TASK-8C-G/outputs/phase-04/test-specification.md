# Phase 4: テスト仕様書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 4          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## テストケース一覧

### 既存テスト（TC-001~TC-062）: TASK-8C-Fから引き継ぎ

62件 - 全てPASS維持

### 新規テスト（TC-063~TC-096）: TASK-8C-G追加分

| TC     | describe                     | テスト名                                                 | 対応要件      | 状態 |
| ------ | ---------------------------- | -------------------------------------------------------- | ------------- | ---- |
| TC-063 | Boundary Value Fixtures      | boundary-skill/SKILL.md name = 64文字                    | FR-B1         | PASS |
| TC-064 | Boundary Value Fixtures      | boundary-skill/SKILL.md description = 10文字             | FR-B2         | PASS |
| TC-065 | Boundary Value Fixtures      | boundary-skill/SKILL.md Anchorsセクション存在            | FR-B5         | PASS |
| TC-066 | Boundary Value Fixtures      | boundary-skill/SKILL.md Triggerセクション存在            | FR-B5         | PASS |
| TC-067 | Boundary Value Fixtures      | boundary-skill/SKILL.md version = semver形式             | FR-B9         | PASS |
| TC-068 | Boundary Value Fixtures      | boundary-agent.md 全必須セクション                       | FR-A8         | PASS |
| TC-069 | Boundary Value Fixtures      | boundary-schema.json $schema存在                         | FR-A5(正常系) | PASS |
| TC-070 | Boundary Value Fixtures      | chain-config.yaml steps = 2                              | FR-B6         | PASS |
| TC-071 | Boundary Value Fixtures      | parallel-config.yaml tasks = 2                           | FR-B7         | PASS |
| TC-072 | Boundary Value Fixtures      | validate-skill-structure.js boundary-skill valid         | FR-B1~B9      | PASS |
| TC-073 | Boundary Value Fixtures      | validate-skill-md.js boundary-skill valid                | FR-B1~B9      | PASS |
| TC-074 | Boundary Value Fixtures      | run-all-validations.js boundary-skill overall valid      | FR-B1~B9      | PASS |
| TC-075 | Error Pattern Fixtures       | missing-fields-skill validate-skill-md.js エラー         | FR-A2         | PASS |
| TC-076 | Error Pattern Fixtures       | forbidden-files-skill validate-skill-structure.js エラー | FR-A1         | PASS |
| TC-077 | Error Pattern Fixtures       | invalid-name-skill validate-skill-md.js エラー           | FR-A3         | PASS |
| TC-078 | Error Pattern Fixtures       | empty-agents-skill validate-agents.js エラー             | FR-A4         | PASS |
| TC-079 | Error Pattern Fixtures       | invalid-schema-skill validate-schemas.js エラー          | FR-A5         | PASS |
| TC-080 | Error Pattern Fixtures       | missing-fields-skill エラーメッセージにname含む          | FR-A2         | PASS |
| TC-081 | Error Pattern Fixtures       | forbidden-files-skill エラーメッセージにREADME.md含む    | FR-A1         | PASS |
| TC-082 | Error Pattern Fixtures       | invalid-name-skill エラーメッセージにkebab-case含む      | FR-A3         | PASS |
| TC-083 | Validation Script Edge Cases | validate-skill-structure.js --target未指定 EXIT_CODE=2   | FR-A6         | PASS |
| TC-084 | Validation Script Edge Cases | validate-skill-md.js --target未指定 EXIT_CODE=2          | FR-A6         | PASS |
| TC-085 | Validation Script Edge Cases | validate-agents.js --target未指定 EXIT_CODE=2            | FR-A6         | PASS |
| TC-086 | Validation Script Edge Cases | validate-schemas.js --target未指定 EXIT_CODE=2           | FR-A6         | PASS |
| TC-087 | Validation Script Edge Cases | validate-skill-structure.js 存在しないパス EXIT_CODE=3   | FR-A10        | PASS |
| TC-088 | Validation Script Edge Cases | run-all-validations.js agents/なしスキップ               | FR-A9         | PASS |
| TC-089 | Validation Script Edge Cases | run-all-validations.js schemas/なしスキップ              | FR-A9         | PASS |
| TC-090 | Validation Script Edge Cases | run-all-validations.js --target未指定 EXIT_CODE=2        | FR-A6         | PASS |
| TC-091 | Test Quality Improvements    | complete-skill Frontmatterパースでname検証               | FR-D1         | PASS |
| TC-092 | Test Quality Improvements    | complete-skill Frontmatterパースでdescription検証        | FR-D1         | PASS |
| TC-093 | Test Quality Improvements    | complete-skill Frontmatterパースでallowed-tools配列検証  | FR-D3         | PASS |
| TC-094 | Test Quality Improvements    | validate-skill-structure.js JSON出力構造検証             | FR-D2         | PASS |
| TC-095 | Test Quality Improvements    | validate-skill-md.js JSON出力frontmatter検証             | FR-D2         | PASS |
| TC-096 | Test Quality Improvements    | validate-agents.js JSON出力agents配列検証                | FR-D2         | PASS |

## サマリー

- 既存テスト: 62件 PASS
- 新規テスト: 34件 PASS
- 合計: **96件 全PASS**
