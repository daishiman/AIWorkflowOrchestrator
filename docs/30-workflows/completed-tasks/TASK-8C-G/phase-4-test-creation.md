# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 4          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

Phase 2設計に基づき、新規フィクスチャに対応するテストケースを先に作成する。フィクスチャファイルが未作成の状態でテストが失敗すること（Red状態）を確認する。

## 実行タスク

- テストケース作成: 新規34件のテストケースを `skill-creator.fixture.test.ts` に追加
- テストヘルパー追加: `parseValidationOutput`, `parseFrontmatter`, `getExitCode`, `fixtureDir` ヘルパー関数を追加
- テスト品質改善: D カテゴリ対応として既存テストの assertion を強化
- テスト仕様書作成: テストケース一覧ドキュメントを作成

## 参照資料

| 資料名                   | パス                                                                | 説明             |
| ------------------------ | ------------------------------------------------------------------- | ---------------- |
| Phase 1 要件定義書       | `outputs/phase-01/requirements-definition.md`                       | 機能要件一覧     |
| Phase 1 受け入れ基準     | `outputs/phase-01/acceptance-criteria.md`                           | AC一覧           |
| Phase 2 フィクスチャ設計 | `outputs/phase-02/fixture-design.md`                                | フィクスチャ構造 |
| Phase 2 テストケース設計 | `outputs/phase-02/test-case-design.md`                              | テスト設計       |
| Phase 3 設計レビュー     | `outputs/phase-03/design-review-result.md`                          | レビュー判定     |
| 既存テストファイル       | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | 現行テスト       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                 |
| -------- | --------------------------------------------------------------------------- | -------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略・パターン |

## 実行手順

### 1. テストヘルパー関数の追加

`skill-creator.fixture.test.ts` の冒頭にヘルパー関数を追加する。

| 関数名                  | 目的                                         | 実装概要                                                            |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `parseValidationOutput` | 検証スクリプトのJSON出力をパースする         | `JSON.parse(stdout)` で構造化オブジェクトを返す                     |
| `parseFrontmatter`      | SKILL.mdのFrontmatterをパースする            | `fs.readFileSync` + YAML部分抽出 + パース                           |
| `getExitCode`           | コマンド実行のEXIT_CODEを取得する            | `execSync` の例外から `status` を取得                               |
| `fixtureDir`            | フィクスチャディレクトリの絶対パスを解決する | `path.join(__dirname, '..', '__fixtures__', 'skill-creator', name)` |

### 2. 新規テストケース作成

#### describe: Boundary Value Fixtures（12件）

| TC     | テスト名                                                        | 検証内容                                            | 対応要件      |
| ------ | --------------------------------------------------------------- | --------------------------------------------------- | ------------- |
| TC-063 | boundary-skill/SKILL.mdのnameが64文字である                     | Frontmatterのname長が64文字ちょうど                 | FR-B1         |
| TC-064 | boundary-skill/SKILL.mdのdescriptionが10文字である              | Frontmatterのdescription長が10文字（最小）          | FR-B2         |
| TC-065 | boundary-skill/SKILL.mdにAnchorsセクションがある                | body内に `## Anchors` 見出しが存在する              | FR-B5         |
| TC-066 | boundary-skill/SKILL.mdにTriggerセクションがある                | body内に `## Trigger` 見出しが存在する              | FR-B5         |
| TC-067 | boundary-skill/SKILL.mdのversionがsemver形式である              | Frontmatterのversionが `/^\d+\.\d+\.\d+$/` にマッチ | FR-B9         |
| TC-068 | boundary-skill/agents/boundary-agent.mdが全必須セクションを持つ | ## 目的, ## 入力, ## 出力, ## 実行手順 が存在       | FR-A8         |
| TC-069 | boundary-skill/schemas/boundary-schema.jsonが$schemaを持つ      | JSON内に$schemaプロパティが存在                     | FR-A5(正常系) |
| TC-070 | boundary-skill/assets/chain-config.yamlのstepsが2である         | chain設定の最小ステップ数                           | FR-B6         |
| TC-071 | boundary-skill/assets/parallel-config.yamlのtasksが2である      | parallel設定の最小タスク数                          | FR-B7         |
| TC-072 | validate-skill-structure.jsがboundary-skillをvalidと判定する    | 全境界値が正常範囲内                                | FR-B1~B9      |
| TC-073 | validate-skill-md.jsがboundary-skillをvalidと判定する           | Frontmatter検証パス                                 | FR-B1~B9      |
| TC-074 | run-all-validations.jsがboundary-skillをoverall validと判定する | 全検証パス                                          | FR-B1~B9      |

#### describe: Error Pattern Fixtures（8件）

| TC     | テスト名                                                          | 検証内容                     | 対応要件 |
| ------ | ----------------------------------------------------------------- | ---------------------------- | -------- |
| TC-075 | missing-fields-skill/SKILL.mdのvalidate-skill-md.jsがエラーを返す | name/description欠落エラー   | FR-A2    |
| TC-076 | forbidden-files-skill/のvalidate-skill-structure.jsがエラーを返す | README.md検出エラー          | FR-A1    |
| TC-077 | invalid-name-skill/のvalidate-skill-structure.jsがエラーを返す    | kebab-case違反エラー         | FR-A3    |
| TC-078 | empty-agents-skill/のvalidate-agents.jsがエラーを返す             | .mdファイルなしエラー        | FR-A4    |
| TC-079 | invalid-schema-skill/のvalidate-schemas.jsがエラーを返す          | $schema/type欠落エラー       | FR-A5    |
| TC-080 | missing-fields-skill/のエラーメッセージにnameが含まれる           | エラー内容の具体性検証       | FR-A2    |
| TC-081 | forbidden-files-skill/のエラーメッセージにREADME.mdが含まれる     | 禁止ファイル名の具体性検証   | FR-A1    |
| TC-082 | invalid-name-skill/のエラーメッセージにkebab-caseが含まれる       | 命名規則違反メッセージの検証 | FR-A3    |

#### describe: Validation Script Edge Cases（8件）

| TC     | テスト名                                                        | 検証内容               | 対応要件 |
| ------ | --------------------------------------------------------------- | ---------------------- | -------- |
| TC-083 | validate-skill-structure.jsが--target未指定でEXIT_CODE=2を返す  | ARGS_ERRORの検証       | FR-A6    |
| TC-084 | validate-skill-md.jsが--target未指定でEXIT_CODE=2を返す         | ARGS_ERRORの検証       | FR-A6    |
| TC-085 | validate-agents.jsが--target未指定でEXIT_CODE=2を返す           | ARGS_ERRORの検証       | FR-A6    |
| TC-086 | validate-schemas.jsが--target未指定でEXIT_CODE=2を返す          | ARGS_ERRORの検証       | FR-A6    |
| TC-087 | validate-skill-structure.jsが存在しないパスでEXIT_CODE=3を返す  | FILE_NOT_FOUNDの検証   | FR-A10   |
| TC-088 | run-all-validations.jsがagents/なしでagents検証をスキップする   | 条件付き実行パスの検証 | FR-A9    |
| TC-089 | run-all-validations.jsがschemas/なしでschemas検証をスキップする | 条件付き実行パスの検証 | FR-A9    |
| TC-090 | run-all-validations.jsが--target未指定でEXIT_CODE=2を返す       | ARGS_ERRORの検証       | FR-A6    |

#### describe: Test Quality Improvements（6件）

| TC     | テスト名                                                                     | 検証内容                          | 対応要件 |
| ------ | ---------------------------------------------------------------------------- | --------------------------------- | -------- |
| TC-091 | complete-skillのSKILL.mdをFrontmatterパースでnameを検証できる                | 文字列チェックでなくパース検証    | FR-D1    |
| TC-092 | complete-skillのSKILL.mdをFrontmatterパースでdescriptionを検証できる         | パース済みオブジェクト検証        | FR-D1    |
| TC-093 | complete-skillのSKILL.mdをFrontmatterパースでallowed-toolsを配列検証できる   | 配列型としての検証                | FR-D3    |
| TC-094 | validate-skill-structure.jsのJSON出力をパースしてvalidプロパティを検証できる | JSON.parse + プロパティ検証       | FR-D2    |
| TC-095 | validate-skill-md.jsのJSON出力をパースしてfrontmatterプロパティを検証できる  | JSON.parse + ネストプロパティ検証 | FR-D2    |
| TC-096 | validate-agents.jsのJSON出力をパースしてagents配列を検証できる               | JSON.parse + 配列要素検証         | FR-D2    |

### 3. テスト仕様書の作成

全テストケース一覧（TC-001〜TC-096）を `outputs/phase-04/test-specification.md` に記載する。TC-001〜TC-062はTASK-8C-Fからの引き継ぎ、TC-063〜TC-096が新規追加分。

## 統合テスト連携

| シナリオカテゴリ       | 検証内容                                           | テストファイル                  |
| ---------------------- | -------------------------------------------------- | ------------------------------- |
| スクリプト実行テスト   | execSyncによる各検証スクリプトの呼び出しと出力検証 | `skill-creator.fixture.test.ts` |
| ファイルシステムテスト | フィクスチャファイルの存在・内容確認               | `skill-creator.fixture.test.ts` |
| パーサー統合テスト     | Frontmatterパースによる構造化検証                  | `skill-creator.fixture.test.ts` |

## 成果物

| 成果物         | パス                                                                | 説明               |
| -------------- | ------------------------------------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-04/test-specification.md`                            | TC-001〜TC-096一覧 |
| テストファイル | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | 拡張テストコード   |

## 完了条件

- [ ] 34件の新規テストケースが `skill-creator.fixture.test.ts` に追加されている
- [ ] テストヘルパー関数（4件）が追加されている
- [ ] D カテゴリ対応のテスト品質改善テスト（6件）が追加されている
- [ ] すべての新規テストが失敗状態（Red）である（フィクスチャ未作成のため）
- [ ] テスト仕様書が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド（新規テストのみ失敗を確認）
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts

# 確認項目
# - [ ] 既存62件のテストは成功状態を維持
# - [ ] 新規34件のテストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
