# Phase 4: テスト仕様書 - TASK-8C-F

## テストファイル

`apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`

## テストケース一覧

### complete-skill フィクスチャ（TC-001〜TC-012）

| TC     | テスト概要                                                                      | カテゴリ |
| ------ | ------------------------------------------------------------------------------- | -------- |
| TC-001 | complete-skill/SKILL.mdが存在する                                               | 存在確認 |
| TC-002 | complete-skill/SKILL.mdのYAML Frontmatterにname,description,allowed-toolsが存在 | 構造確認 |
| TC-003 | complete-skill/package.jsonが存在し、valid JSONである                           | 存在確認 |
| TC-004 | complete-skill/EVALS.jsonが存在し、skill_nameフィールドを持つ                   | 存在確認 |
| TC-005 | complete-skill/agents/ディレクトリが存在し、.mdファイルを含む                   | 存在確認 |
| TC-006 | analyze-request.mdにTASK_TITLEセクションが存在する                              | 構造確認 |
| TC-007 | complete-skill/references/ディレクトリが存在し、.mdファイルを含む               | 存在確認 |
| TC-008 | complete-skill/scripts/ディレクトリが存在し、.jsファイルを含む                  | 存在確認 |
| TC-009 | scripts/utils.jsにEXIT_CODESが定義されている                                    | 構造確認 |
| TC-010 | complete-skill/assets/ディレクトリが存在する                                    | 存在確認 |
| TC-011 | complete-skill/schemas/ディレクトリが存在し、.jsonファイルを含む                | 存在確認 |
| TC-012 | schemas/agent-definition.jsonがvalid JSON Schemaである                          | 構造確認 |

### minimal-skill フィクスチャ（TC-013〜TC-015）

| TC     | テスト概要                                               | カテゴリ |
| ------ | -------------------------------------------------------- | -------- |
| TC-013 | minimal-skill/SKILL.mdが存在する                         | 存在確認 |
| TC-014 | minimal-skill/SKILL.mdのYAML Frontmatterが正しい         | 構造確認 |
| TC-015 | minimal-skill/にagents/,references/,scripts/が存在しない | 不在確認 |

### partial-skill フィクスチャ（TC-016〜TC-019）

| TC     | テスト概要                                                        | カテゴリ |
| ------ | ----------------------------------------------------------------- | -------- |
| TC-016 | partial-skill/SKILL.mdが存在する                                  | 存在確認 |
| TC-017 | partial-skill/agents/ディレクトリが存在する                       | 存在確認 |
| TC-018 | partial-skill/agents/single-agent.mdが存在する                    | 存在確認 |
| TC-019 | partial-skill/にreferences/,scripts/,assets/,schemas/が存在しない | 不在確認 |

### invalid-skill フィクスチャ（TC-020〜TC-021）

| TC     | テスト概要                                                     | カテゴリ   |
| ------ | -------------------------------------------------------------- | ---------- |
| TC-020 | invalid-skill/SKILL.mdが存在する                               | 存在確認   |
| TC-021 | invalid-skill/SKILL.mdのYAML Frontmatterがパース時に問題を検出 | エラー検証 |

### orchestration-skill フィクスチャ（TC-022〜TC-024）

| TC     | テスト概要                                     | カテゴリ |
| ------ | ---------------------------------------------- | -------- |
| TC-022 | orchestration-skill/SKILL.mdが存在する         | 存在確認 |
| TC-023 | chain-config.yamlが存在し、パース可能である    | 構造確認 |
| TC-024 | parallel-config.yamlが存在し、パース可能である | 構造確認 |

### 検証スクリプト（TC-025〜TC-032）

| TC     | テスト概要                                                    | カテゴリ   |
| ------ | ------------------------------------------------------------- | ---------- |
| TC-025 | validate-skill-structure.jsがcomplete-skillをvalidと判定      | 統合テスト |
| TC-026 | validate-skill-structure.jsがinvalid-skillの構造をvalidと判定 | 統合テスト |
| TC-027 | validate-skill-md.jsがcomplete-skill/SKILL.mdをvalidと判定    | 統合テスト |
| TC-028 | validate-skill-md.jsがinvalid-skill/SKILL.mdでエラーを返す    | 統合テスト |
| TC-029 | validate-agents.jsがcomplete-skill/agents/をvalidと判定       | 統合テスト |
| TC-030 | validate-schemas.jsがcomplete-skill/schemas/をvalidと判定     | 統合テスト |
| TC-031 | run-all-validations.jsがcomplete-skillに対して全検証をパス    | 統合テスト |
| TC-032 | run-all-validations.jsがinvalid-skillに対してエラーを含む結果 | 統合テスト |

### skill-fixture-runner スキル（TC-033〜TC-037）

| TC     | テスト概要                                                    | カテゴリ |
| ------ | ------------------------------------------------------------- | -------- |
| TC-033 | skill-fixture-runner/SKILL.mdが存在する                       | 存在確認 |
| TC-034 | skill-fixture-runner/SKILL.mdのYAML Frontmatterが正しい       | 構造確認 |
| TC-035 | skill-fixture-runner/scripts/ディレクトリが存在する           | 存在確認 |
| TC-036 | skill-fixture-runner/scripts/run-all-validations.jsが存在する | 存在確認 |
| TC-037 | skill-fixture-runner/EVALS.jsonが存在する                     | 存在確認 |

### YAML Frontmatter 詳細検証（TC-038〜TC-042）

| TC     | テスト概要                                                         | カテゴリ   |
| ------ | ------------------------------------------------------------------ | ---------- |
| TC-038 | complete-skill/SKILL.mdのversionフィールドがsemver形式である       | 詳細検証   |
| TC-039 | complete-skill/SKILL.mdのallowed-toolsが配列である                 | 詳細検証   |
| TC-040 | complete-skill/SKILL.mdのallowed-toolsの各要素が文字列である       | 詳細検証   |
| TC-041 | minimal-skill/SKILL.mdのnameフィールドがkebab-caseである           | 詳細検証   |
| TC-042 | invalid-skill/SKILL.mdのパースで具体的なエラーメッセージが返される | エラー検証 |

### エージェント仕様書フォーマット詳細（TC-043〜TC-047）

| TC     | テスト概要                                                               | カテゴリ |
| ------ | ------------------------------------------------------------------------ | -------- |
| TC-043 | analyze-request.mdのPERSONA_NAMEが存在する                               | 詳細検証 |
| TC-044 | analyze-request.mdのSTEPSが番号付きリストである                          | 詳細検証 |
| TC-045 | analyze-request.mdのINPUTS,OUTPUTSセクションが存在する                   | 詳細検証 |
| TC-046 | generate-code.mdがanalyze-request.mdと同じフォーマットである             | 詳細検証 |
| TC-047 | partial-skill/agents/single-agent.mdが最小エージェントフォーマットに準拠 | 詳細検証 |

### 検証スクリプト出力フォーマット（TC-048〜TC-053）

| TC     | テスト概要                                                      | カテゴリ   |
| ------ | --------------------------------------------------------------- | ---------- |
| TC-048 | validate-skill-structure.jsの出力が{valid,errors,structure}形式 | 統合テスト |
| TC-049 | validate-skill-md.jsの出力が{valid,errors,frontmatter,body}形式 | 統合テスト |
| TC-050 | validate-agents.jsの出力が{valid,errors,agents}形式             | 統合テスト |
| TC-051 | validate-schemas.jsの出力が{valid,errors,schemas}形式           | 統合テスト |
| TC-052 | run-all-validations.jsの出力が{overall,results}形式             | 統合テスト |
| TC-053 | 存在しないディレクトリを指定した場合、適切なエラーが返される    | エラー検証 |

### オーケストレーション設定（TC-054〜TC-058）

| TC     | テスト概要                                             | カテゴリ |
| ------ | ------------------------------------------------------ | -------- |
| TC-054 | chain-config.yamlにsteps配列が存在する                 | 詳細検証 |
| TC-055 | chain-config.yamlのstepsが最低2つのスキルを含む        | 詳細検証 |
| TC-056 | chain-config.yamlにerror_handlingが定義されている      | 詳細検証 |
| TC-057 | parallel-config.yamlにtasks配列が存在する              | 詳細検証 |
| TC-058 | parallel-config.yamlにresult_aggregation設定が存在する | 詳細検証 |

### クロスバリデーション（TC-059〜TC-062）

| TC     | テスト概要                                                                    | カテゴリ   |
| ------ | ----------------------------------------------------------------------------- | ---------- |
| TC-059 | complete-skillのagents/\*.mdがschemas/agent-definition.jsonのrequiredを満たす | クロス検証 |
| TC-060 | complete-skillのscripts/utils.jsのEXIT_CODESがスクリプトパターンに準拠する    | クロス検証 |
| TC-061 | 全フィクスチャのSKILL.mdのnameフィールドが一意である                          | クロス検証 |
| TC-062 | complete-skillの全ディレクトリがskill-creatorの出力ディレクトリと一致する     | クロス検証 |

## 完了ステータス

- [x] TC-001〜TC-037の37テストケースが実装されている
- [x] TC-038〜TC-062の25テストケースが追加されている（Phase 6）
- [x] テスト仕様書がoutputs/phase-04/に配置されている
