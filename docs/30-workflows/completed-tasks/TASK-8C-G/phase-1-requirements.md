# Phase 1: 要件定義

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 1          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

TASK-8C-Fギャップ分析結果に基づき、skill-creatorフィクスチャの境界値テスト拡充に必要な機能要件・非機能要件を明文化する。

## 実行タスク

- 要件抽出: ギャップ分析4カテゴリ（A/B/C/D）から検証可能な要件を抽出
- 受け入れ基準作成: 各ギャップIDに対応する受け入れ基準（AC）を定義
- FR/NFR分類: 機能要件（新規フィクスチャ、テストケース）と非機能要件（テスト品質、実行速度）を分類

## 参照資料

| 資料名                      | パス                                                                                  | 説明                                        |
| --------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- |
| TASK-8C-F テスト仕様書      | `docs/30-workflows/completed-tasks/TASK-8C-F/outputs/phase-04/test-specification.md`  | 既存62テストケース仕様                      |
| TASK-8C-F 受け入れ基準      | `docs/30-workflows/completed-tasks/TASK-8C-F/outputs/phase-01/acceptance-criteria.md` | 既存11件のAC                                |
| 既存テストファイル          | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                   | 現行テストコード（831行）                   |
| validate-skill-structure.js | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`             | FORBIDDEN_FILES, KNOWN_DIRS, kebab-case検証 |
| validate-skill-md.js        | `.claude/skills/skill-fixture-runner/scripts/validate-skill-md.js`                    | name/description/allowed-tools検証          |
| validate-agents.js          | `.claude/skills/skill-fixture-runner/scripts/validate-agents.js`                      | REQUIRED_SECTIONS検証                       |
| validate-schemas.js         | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`                     | $schema/type検証                            |
| run-all-validations.js      | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`                  | 全検証統合スクリプト                        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                               | 内容                         |
| -------------- | ---------------------------------------------------------------------------------- | ---------------------------- |
| E2Eテスト仕様  | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`         | テストフィクスチャ設計原則   |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`        | テスト戦略・カバレッジ基準   |
| スキル管理仕様 | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-overview.md` | skill-fixture-runner登録情報 |

## 実行手順

### 1. 要件抽出

ギャップ分析4カテゴリからテスト要件を抽出する。

**カテゴリA（検証スクリプト境界条件）要件:**

| ID     | 要件                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-A1  | FORBIDDEN_FILES（README.md, .gitignore, node_modules）を含むフィクスチャを作成し、validate-skill-structure.jsがエラーを返すことを検証する       |
| FR-A2  | name/descriptionフィールドが欠落したSKILL.mdフィクスチャを作成し、validate-skill-md.jsがエラーを返すことを検証する                              |
| FR-A3  | kebab-case違反のname（大文字、アンダースコア、スペース含む）を持つフィクスチャを作成し、validate-skill-structure.jsがエラーを返すことを検証する |
| FR-A4  | agents/ディレクトリは存在するが.mdファイルがないフィクスチャを作成し、validate-agents.jsがエラーを返すことを検証する                            |
| FR-A5  | $schemaまたはtypeプロパティが欠落したJSONスキーマを持つフィクスチャを作成し、validate-schemas.jsがエラーを返すことを検証する                    |
| FR-A6  | --target引数なしで各検証スクリプトを実行し、EXIT_CODE=2（ARGS_ERROR）が返されることを検証する                                                   |
| FR-A7  | KNOWN_DIRS外のディレクトリ（例: `unknown-dir/`）を含むフィクスチャに対するvalidate-skill-structure.jsの動作を検証する                           |
| FR-A8  | REQUIRED_SECTIONS（## 目的, ## 入力, ## 出力, ## 実行手順）が部分的に欠落したエージェント仕様書の検証                                           |
| FR-A9  | run-all-validations.jsの条件付き実行パス（agents/なし・schemas/なしの場合のスキップ動作）を検証する                                             |
| FR-A10 | 存在しないパスを--targetに指定し、EXIT_CODE=3（FILE_NOT_FOUND）が返されることを検証する                                                         |

**カテゴリB（skill-creator仕様境界）要件:**

| ID    | 要件                                                                                          |
| ----- | --------------------------------------------------------------------------------------------- |
| FR-B1 | nameフィールドが64文字ちょうどのSKILL.mdフィクスチャで正常検証をパスすることを確認する        |
| FR-B2 | descriptionが10文字（最小）と1024文字（最大）のフィクスチャで正常検証をパスすることを確認する |
| FR-B3 | SKILL.mdが500行ちょうどのフィクスチャを作成し、行数制限の境界を検証する                       |
| FR-B4 | 山括弧（`<>`）を含むSKILL.mdフィクスチャを作成し、検証エラーとなることを確認する              |
| FR-B5 | Anchors/Triggerセクションを含むSKILL.mdフィクスチャで正常検証をパスすることを確認する         |
| FR-B6 | chain設定のstepsが2（最小値）のYAML設定で正常であることを確認する                             |
| FR-B7 | parallel設定のtasksが2（最小値）のYAML設定で正常であることを確認する                          |
| FR-B8 | allowed-toolsが空配列`[]`の場合のvalidate-skill-md.jsの動作を検証する                         |
| FR-B9 | versionフィールドがsemver形式（例: `1.0.0`）であることの検証                                  |

**カテゴリC（invalid-skill拡充）要件:**

| ID    | 要件                                                                      |
| ----- | ------------------------------------------------------------------------- |
| FR-C1 | 複数のエラーパターンを持つ不正フィクスチャを追加する（現状1パターンのみ） |

**カテゴリD（テスト実装品質改善）要件:**

| ID    | 要件                                                                                |
| ----- | ----------------------------------------------------------------------------------- |
| FR-D1 | テストファイル内でJSONパースによるYAMLフロントマター検証に統一する                  |
| FR-D2 | `toContain`による弱いassertionを構造化検証（JSON parse + プロパティ検証）に置換する |
| FR-D3 | 文字列ベースのYAMLチェックをパース済みオブジェクトの検証に統一する                  |

**非機能要件:**

| ID    | 要件                                                 |
| ----- | ---------------------------------------------------- |
| NFR-1 | テスト実行時間が既存62件含め合計5秒以内であること    |
| NFR-2 | 新規フィクスチャが既存フィクスチャと独立していること |
| NFR-3 | ESLintエラー0件・TypeScriptエラー0件を維持すること   |

### 2. 受け入れ基準作成

| AC    | 検証基準                                                                    | 対応要件           |
| ----- | --------------------------------------------------------------------------- | ------------------ |
| AC-01 | 6種類の新規フィクスチャディレクトリが作成されている                         | FR-A1~A5, FR-B1~B9 |
| AC-02 | 各新規フィクスチャに対応するテストケースが存在する                          | 全FR               |
| AC-03 | 全テスト（既存62件+新規）がPASSする                                         | 全FR               |
| AC-04 | --target引数なし・存在しないパスのエラーハンドリングテストが存在する        | FR-A6, FR-A10      |
| AC-05 | boundary-skillがname 64文字、description 10/1024文字の境界値を含む          | FR-B1, FR-B2       |
| AC-06 | toContainベースの弱いassertionがJSON parse + プロパティ検証に改善されている | FR-D1~D3           |
| AC-07 | ESLintエラー0件・TypeScriptエラー0件                                        | NFR-3              |
| AC-08 | 新規テストを含む全テスト実行時間が5秒以内                                   | NFR-1              |
| AC-09 | run-all-validations.jsの条件付きスキップ動作のテストが存在する              | FR-A9              |
| AC-10 | invalid-skillフィクスチャが複数エラーパターンをカバーしている               | FR-C1              |

### 3. FR/NFR分類

**機能要件（FR）**: FR-A1~A10, FR-B1~B9, FR-C1, FR-D1~D3（合計23件）
**非機能要件（NFR）**: NFR-1~NFR-3（合計3件）
**受け入れ基準（AC）**: AC-01~AC-10（合計10件）

## 統合テスト連携

本タスクは純粋なテストフィクスチャ追加であり、API接続・認証・データフロー等の統合テスト要件はない。検証スクリプトとVitestの統合が主な接続ポイント。

| 接続要件カテゴリ | 記載内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| Vitest統合       | `skill-creator.fixture.test.ts` からの検証スクリプト呼び出し |
| スクリプト実行   | `execSync` による Node.js スクリプト実行                     |
| ファイルシステム | フィクスチャディレクトリの読み取り                           |

## 成果物

| 成果物       | パス                                          | 説明             |
| ------------ | --------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-01/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-01/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件（FR 23件 + NFR 3件）が抽出されている
- [ ] 各要件に受け入れ基準がある（AC 10件）
- [ ] FR/NFRが分類されている
- [ ] ギャップ分析4カテゴリの全IDに対応する要件が存在する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
