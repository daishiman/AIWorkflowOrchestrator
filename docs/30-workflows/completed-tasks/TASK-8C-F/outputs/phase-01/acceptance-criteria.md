# Phase 1: 受け入れ基準 - TASK-8C-F

## 受け入れ基準一覧

| 基準ID | カテゴリ     | 基準                                                              | 検証方法                               |
| ------ | ------------ | ----------------------------------------------------------------- | -------------------------------------- |
| AC-001 | フィクスチャ | complete-skillがskill-creatorのvalidate_structure.jsで検証可能    | validate-skill-structure.js実行        |
| AC-002 | フィクスチャ | complete-skill/SKILL.mdがYAML Frontmatterパース可能               | validate-skill-md.js実行               |
| AC-003 | フィクスチャ | complete-skill/agents/\*.mdがエージェント仕様書フォーマットに準拠 | validate-agents.js実行                 |
| AC-004 | フィクスチャ | complete-skill/schemas/\*.jsonがJSON Schema Draft-07に準拠        | validate-schemas.js実行                |
| AC-005 | フィクスチャ | minimal-skillがSKILL.mdのみで検証をパスする                       | validate-skill-structure.js実行        |
| AC-006 | フィクスチャ | invalid-skillが検証で適切にエラーを返す                           | validate-skill-md.js実行（エラー期待） |
| AC-007 | フィクスチャ | orchestration-skillのYAML設定がパース可能                         | YAMLパーステスト                       |
| AC-008 | スクリプト   | run-all-validations.jsが全検証を統合実行できる                    | コマンドライン実行                     |
| AC-009 | スクリプト   | 検証結果がJSON形式で出力される                                    | 出力フォーマット確認                   |
| AC-010 | スキル       | skill-fixture-runner/SKILL.mdが正しいフォーマットである           | フォーマット検証                       |
| AC-011 | 統合         | Vitestテスト（skill-creator.fixture.test.ts）が全件パスする       | pnpm vitest run実行                    |

## 各基準の詳細

### AC-001: complete-skill 構造検証

- complete-skill/ディレクトリにSKILL.md, agents/, references/, scripts/, assets/, schemas/が存在すること
- validate-skill-structure.jsの出力で`valid: true`が返ること

### AC-002: SKILL.md YAML Frontmatter

- complete-skill/SKILL.mdのYAML Frontmatterが正しくパースできること
- name, description, allowed-toolsフィールドが存在すること

### AC-003: エージェント仕様書準拠

- complete-skill/agents/\*.mdにTASK_TITLE, STEPS, INPUTS, OUTPUTSセクションが存在すること

### AC-004: JSON Schema準拠

- complete-skill/schemas/\*.jsonが有効なJSONであること
- $schema, typeプロパティが存在すること

### AC-005: minimal-skill 最小検証

- SKILL.mdのみで構造検証がパスすること
- agents/等の不在がエラーにならないこと

### AC-006: invalid-skill エラー検出

- YAML Frontmatterパースでエラーが発生すること
- エラーメッセージが具体的であること

### AC-007: orchestration-skill YAML

- chain-config.yaml, parallel-config.yamlがパース可能であること
- skills配列、設定キーが存在すること

### AC-008: 統合検証実行

- run-all-validations.jsが4つの検証スクリプトを順次実行できること
- 結果が集約されること

### AC-009: JSON出力形式

- 全検証スクリプトの出力がJSON形式であること
- valid, errorsキーが含まれること

### AC-010: skill-fixture-runner フォーマット

- SKILL.mdのYAML Frontmatterにname, description, allowed-toolsが存在すること
- nameがハイフンケースであること

### AC-011: Vitest全件パス

- skill-creator.fixture.test.tsの全テストケースがパスすること

## 完了ステータス

- [x] AC-001〜AC-011の受け入れ基準が定義されている
- [x] 各基準の検証方法が明確に記載されている
