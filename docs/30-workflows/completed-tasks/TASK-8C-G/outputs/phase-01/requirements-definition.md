# Phase 1: 要件定義書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 1          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 機能要件（FR）

### カテゴリA: 検証スクリプト境界条件（10件）

| ID     | 要件                                                                                                                         | 対応フィクスチャ       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| FR-A1  | FORBIDDEN_FILES（README.md等）を含むフィクスチャを作成し、validate-skill-structure.jsがエラーを返すことを検証する            | forbidden-files-skill/ |
| FR-A2  | name/descriptionフィールドが欠落したSKILL.mdフィクスチャを作成し、validate-skill-md.jsがエラーを返すことを検証する           | missing-fields-skill/  |
| FR-A3  | kebab-case違反のname（大文字、アンダースコア）を持つフィクスチャを作成し、validate-skill-md.jsがエラーを返すことを検証する   | invalid-name-skill/    |
| FR-A4  | agents/ディレクトリは存在するが.mdファイルがないフィクスチャを作成し、validate-agents.jsがエラーを返すことを検証する         | empty-agents-skill/    |
| FR-A5  | $schemaまたはtypeプロパティが欠落したJSONスキーマを持つフィクスチャを作成し、validate-schemas.jsがエラーを返すことを検証する | invalid-schema-skill/  |
| FR-A6  | --target引数なしで各検証スクリプトを実行し、EXIT_CODE=2（ARGS_ERROR）が返されることを検証する                                | テストケースで直接検証 |
| FR-A7  | KNOWN_DIRS外のディレクトリ（unknown-dir/）を含むフィクスチャに対するvalidate-skill-structure.jsの動作を検証する              | boundary-skill/        |
| FR-A8  | REQUIRED_SECTIONS（TASK_TITLE, STEPS, INPUTS, OUTPUTS）が部分的に欠落したエージェント仕様書の検証                            | boundary-skill/agents/ |
| FR-A9  | run-all-validations.jsの条件付き実行パス（agents/なし・schemas/なしの場合のスキップ動作）を検証する                          | テストケースで直接検証 |
| FR-A10 | 存在しないパスを--targetに指定し、EXIT_CODE=3（FILE_NOT_FOUND）が返されることを検証する                                      | テストケースで直接検証 |

### カテゴリB: skill-creator仕様境界（9件）

| ID    | 要件                                                                                   | 対応フィクスチャ       |
| ----- | -------------------------------------------------------------------------------------- | ---------------------- |
| FR-B1 | nameフィールドが64文字ちょうどのSKILL.mdフィクスチャで正常検証をパスすることを確認する | boundary-skill/        |
| FR-B2 | descriptionが10文字（最小）のフィクスチャで正常検証をパスすることを確認する            | boundary-skill/        |
| FR-B3 | SKILL.mdが適切な行数のフィクスチャを作成し、行数の範囲を検証する                       | boundary-skill/        |
| FR-B4 | 山括弧（`<>`）を含むSKILL.mdフィクスチャの動作を確認する                               | テストケースで直接検証 |
| FR-B5 | Anchors/Triggerセクションを含むSKILL.mdフィクスチャで正常検証をパスすることを確認する  | boundary-skill/        |
| FR-B6 | chain設定のstepsが2（最小値）のYAML設定で正常であることを確認する                      | boundary-skill/assets/ |
| FR-B7 | parallel設定のtasksが2（最小値）のYAML設定で正常であることを確認する                   | boundary-skill/assets/ |
| FR-B8 | allowed-toolsが空配列`[]`の場合のvalidate-skill-md.jsの動作を検証する                  | テストケースで直接検証 |
| FR-B9 | versionフィールドがsemver形式（例: `1.0.0`）であることの検証                           | boundary-skill/        |

### カテゴリC: invalid-skill拡充（1件）

| ID    | 要件                                                                      | 対応                             |
| ----- | ------------------------------------------------------------------------- | -------------------------------- |
| FR-C1 | 複数のエラーパターンを持つ不正フィクスチャを追加する（現状1パターンのみ） | 新規6フィクスチャで5パターン追加 |

### カテゴリD: テスト実装品質改善（3件）

| ID    | 要件                                                                                |
| ----- | ----------------------------------------------------------------------------------- |
| FR-D1 | テストファイル内でパース済みオブジェクトによるYAMLフロントマター検証に統一する      |
| FR-D2 | `toContain`による弱いassertionを構造化検証（JSON parse + プロパティ検証）に置換する |
| FR-D3 | 文字列ベースのYAMLチェックをパース済みオブジェクトの検証に統一する                  |

## 非機能要件（NFR）

| ID    | 要件                                                 |
| ----- | ---------------------------------------------------- |
| NFR-1 | テスト実行時間が既存62件含め合計5秒以内であること    |
| NFR-2 | 新規フィクスチャが既存フィクスチャと独立していること |
| NFR-3 | ESLintエラー0件・TypeScriptエラー0件を維持すること   |

## 要件サマリー

- **機能要件（FR）**: FR-A1~A10, FR-B1~B9, FR-C1, FR-D1~D3（合計23件）
- **非機能要件（NFR）**: NFR-1~NFR-3（合計3件）
- **合計**: 26件
