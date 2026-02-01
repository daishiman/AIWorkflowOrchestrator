# Phase 2: 設計

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 2          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

ギャップ分析に基づく新規フィクスチャ6種類のディレクトリ構造・ファイル内容、テストケース設計、テスト実装品質改善の具体的な設計を行う。

## 実行タスク

- フィクスチャ設計: 6種類の新規フィクスチャのディレクトリ構造とファイル内容を設計
- テストケース設計: 各フィクスチャに対応するテストケースの構造と検証ロジックを設計
- テスト品質改善設計: D カテゴリ（YAMLパーサー統一、assertion強化）の改善方針を設計

## 参照資料

| 資料名                      | パス                                                                             | 説明                       |
| --------------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件定義書          | `outputs/phase-01/requirements-definition.md`                                    | Phase 1成果物              |
| Phase 1 受け入れ基準        | `outputs/phase-01/acceptance-criteria.md`                                        | Phase 1成果物              |
| TASK-8C-F フィクスチャ設計  | `docs/30-workflows/completed-tasks/TASK-8C-F/outputs/phase-02/fixture-design.md` | 既存フィクスチャ設計       |
| 既存テストファイル          | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`              | 現行テストコード           |
| validate-skill-structure.js | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`        | 構造検証スクリプト         |
| validate-skill-md.js        | `.claude/skills/skill-fixture-runner/scripts/validate-skill-md.js`               | SKILL.md検証スクリプト     |
| validate-agents.js          | `.claude/skills/skill-fixture-runner/scripts/validate-agents.js`                 | エージェント検証スクリプト |
| validate-schemas.js         | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`                | スキーマ検証スクリプト     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料      | パス                                                                        | 内容                 |
| ------------- | --------------------------------------------------------------------------- | -------------------- |
| E2Eテスト仕様 | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`  | フィクスチャ設計原則 |
| 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略           |

## 実行手順

### 1. 新規フィクスチャディレクトリ設計

以下の6種類のフィクスチャを `apps/desktop/src/__tests__/__fixtures__/skill-creator/` 配下に設計する。

#### 1.1 boundary-skill/（境界値テスト用）

| ファイル                     | 内容                                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| SKILL.md                     | name: 64文字ちょうど、description: 10文字（最小境界）、Anchors/Triggerセクション含む、version: semver形式 |
| agents/boundary-agent.md     | REQUIRED_SECTIONS（## 目的, ## 入力, ## 出力, ## 実行手順）を全て含む                                     |
| assets/chain-config.yaml     | steps: 2（最小値）のchain設定                                                                             |
| assets/parallel-config.yaml  | tasks: 2（最小値）のparallel設定                                                                          |
| schemas/boundary-schema.json | $schema と type を含む有効なJSONスキーマ                                                                  |

#### 1.2 missing-fields-skill/（必須フィールド欠落用）

| ファイル | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| SKILL.md | nameフィールドなし、descriptionフィールドなし（Frontmatterが空またはフィールド欠落） |

#### 1.3 forbidden-files-skill/（禁止ファイル検出用）

| ファイル  | 内容                                    |
| --------- | --------------------------------------- |
| SKILL.md  | 有効なFrontmatter（検証パス可能な内容） |
| README.md | FORBIDDEN_FILESに該当するファイル       |

#### 1.4 invalid-name-skill/（名前フォーマット違反用）

| ファイル | 内容                                               |
| -------- | -------------------------------------------------- |
| SKILL.md | name: `Invalid_Name`（アンダースコア、大文字含む） |

**注意**: ディレクトリ名自体は `invalid-name-skill`（kebab-case）だが、SKILL.md内のnameフィールドが非kebab-case。

#### 1.5 empty-agents-skill/（空agentsディレクトリ用）

| ファイル        | 内容                                      |
| --------------- | ----------------------------------------- |
| SKILL.md        | 有効なFrontmatter                         |
| agents/         | ディレクトリのみ存在、.mdファイルなし     |
| agents/.gitkeep | 空ディレクトリをgit追跡するためのファイル |

#### 1.6 invalid-schema-skill/（不正スキーマ用）

| ファイル                    | 内容                                        |
| --------------------------- | ------------------------------------------- |
| SKILL.md                    | 有効なFrontmatter                           |
| schemas/invalid-schema.json | $schema プロパティなし、type プロパティなし |

### 2. テストケース設計

既存の `skill-creator.fixture.test.ts` に以下の describe ブロックを追加する。

| describe ブロック            | テストケース数 | 検証内容                                                                                 |
| ---------------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| Boundary Value Fixtures      | 12             | boundary-skill の各境界値検証                                                            |
| Error Pattern Fixtures       | 8              | missing-fields, forbidden-files, invalid-name, empty-agents, invalid-schema のエラー検証 |
| Validation Script Edge Cases | 8              | --target未指定、存在しないパス、条件付き実行パス                                         |
| Test Quality Improvements    | 6              | D カテゴリ改善後の構造化検証                                                             |

**合計新規テストケース: 34件**（既存62件 + 新規34件 = 合計96件目標）

### 3. テスト品質改善設計

#### D1: YAMLパーサー統一

- テストファイル内で `gray-matter` または同等のFrontmatterパーサーを使用する
- 文字列の `includes()` による検証を `parseFrontmatter().data.name` のようなプロパティアクセスに変更する

#### D2: assertion強化

- `toContain('name:')` → `expect(parsed.name).toBe('expected-name')` に変更
- JSON出力の検証では `JSON.parse(output)` でオブジェクト化してからプロパティを検証する

#### D3: YAML文字列チェック改善

- `content.includes('allowed-tools:')` → パース結果の `data['allowed-tools']` 配列検証に変更
- Frontmatterパーサーのインポートをテストファイルに追加する

### 4. テストヘルパー設計

既存の `runValidationScript` ヘルパーに加え、以下のヘルパー関数を追加する。

| ヘルパー関数            | 引数               | 戻り値                   | 用途                             |
| ----------------------- | ------------------ | ------------------------ | -------------------------------- |
| `parseValidationOutput` | `stdout: string`   | `{ valid, errors, ... }` | JSON出力のパース                 |
| `parseFrontmatter`      | `filePath: string` | `{ data, content }`      | SKILL.md Frontmatterパース       |
| `getExitCode`           | `command: string`  | `number`                 | EXIT_CODEの取得                  |
| `fixtureDir`            | `name: string`     | `string`                 | フィクスチャディレクトリパス解決 |

## 統合テスト連携

| 統合ポイント              | 契約定義                             |
| ------------------------- | ------------------------------------ |
| Vitest → execSync         | 検証スクリプトの実行と出力JSON取得   |
| テスト → ファイルシステム | フィクスチャファイルの存在・内容確認 |
| gray-matter → SKILL.md    | Frontmatterパースによる構造化検証    |

## 成果物

| 成果物             | パス                                   | 説明             |
| ------------------ | -------------------------------------- | ---------------- |
| フィクスチャ設計書 | `outputs/phase-02/fixture-design.md`   | 新規6種類の設計  |
| テストケース設計書 | `outputs/phase-02/test-case-design.md` | 34件のテスト設計 |

## 完了条件

- [ ] 6種類の新規フィクスチャのディレクトリ構造とファイル内容が設計されている
- [ ] 各フィクスチャに対応するテストケースが設計されている（34件以上）
- [ ] テスト品質改善（D カテゴリ）の方針が設計されている
- [ ] テストヘルパー関数が設計されている
- [ ] 要件定義（Phase 1）との整合性が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
