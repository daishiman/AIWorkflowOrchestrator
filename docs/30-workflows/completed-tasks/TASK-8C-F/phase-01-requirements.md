# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 1                                                          |
| Phase名    | 要件定義                                                   |
| 前提Phase  | なし                                                       |
| 後続Phase  | Phase 2（設計）                                            |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

skill-creator スキルが生成するスキル構造を網羅的にカバーするテスト用フィクスチャの要件を定義する。フィクスチャが満たすべき構造・内容・検証基準、検証スクリプトの要件、テスト実行スキルの要件を明確にする。

## 背景

skill-creator（v8.1.0）は 125 以上のファイルを持つ複雑なメタスキルであり、その出力物（新規スキル）の構造整合性を自動検証する仕組みが必要。TASK-8C-E で確立したフィクスチャパターンを拡張し、skill-creator 固有の出力構造（agents/、references/、scripts/、assets/、schemas/）を含むフィクスチャセットを構築する。

aiworkflow-requirements スキル（`.claude/skills/aiworkflow-requirements/`）で定義されたスキル構造仕様（`references/claude-code-skills-structure.md`）との整合性も確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: skill-creator 出力構造の分析

**目的**: skill-creator が生成するスキルの構造パターンを網羅的に分析する

**実行手順**:

1. skill-creator のメインスキル定義（`.claude/skills/skill-creator/SKILL.md`）を読み、対応するモードと出力を確認する
2. 以下の出力パターンを分析する：

| モード         | 出力物                                            | 検証対象                 |
| -------------- | ------------------------------------------------- | ------------------------ |
| create         | SKILL.md + agents/ + references/ + scripts/ + etc | 全ディレクトリ構造       |
| update         | 既存スキルへの差分                                | 更新後の整合性           |
| improve-prompt | 最適化された SKILL.md                             | SKILL.md フォーマット    |
| collaborative  | ユーザー対話を経た完全スキル                      | 全出力物の品質           |
| orchestrate    | 実行エンジン選択結果                              | オーケストレーション設定 |

3. 各ディレクトリに含まれるファイルの仕様を整理する：

| ディレクトリ | ファイル形式 | 主要な検証ポイント                                     |
| ------------ | ------------ | ------------------------------------------------------ |
| agents/      | \*.md        | TASK_TITLE, PERSONA_NAME, RESPONSIBILITIES, STEPS 存在 |
| references/  | \*.md        | Markdown 見出し構造、Progressive Disclosure レベル     |
| scripts/     | \*.js        | EXIT_CODES 定義、getArg/resolvePath 使用パターン       |
| assets/      | 各種         | テンプレート変数 `{{...}}` パターン                    |
| schemas/     | \*.json      | JSON Schema Draft-07 準拠                              |

4. `outputs/phase-01/requirements-definition.md` に分析結果をまとめる

**期待される成果物**:

- `outputs/phase-01/requirements-definition.md`

---

### タスク2: フィクスチャ種別の要件定義

**目的**: テストに必要なフィクスチャの種類と各々の目的を定義する

**実行手順**:

1. 以下の5種類のフィクスチャ要件を文書化する：

| フィクスチャ名      | 種別                 | 目的                                                                            |
| ------------------- | -------------------- | ------------------------------------------------------------------------------- |
| complete-skill      | 完全スキル           | 全ディレクトリ（agents/, references/, scripts/, assets/, schemas/）を持つスキル |
| minimal-skill       | 最小スキル           | SKILL.md のみの最小構成スキル                                                   |
| partial-skill       | 部分スキル           | SKILL.md + agents/ のみの部分構成スキル                                         |
| invalid-skill       | 無効スキル           | YAML Frontmatter が不正な SKILL.md（検証失敗を確認）                            |
| orchestration-skill | オーケストレーション | chain/parallel 設定を持つスキル                                                 |

2. 各フィクスチャが skill-creator のどのモード出力に対応するかをマッピングする
3. `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- フィクスチャ種別定義（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク3: 検証スクリプトの要件定義

**目的**: フィクスチャを検証するスクリプトの要件を定義する

**実行手順**:

1. skill-creator の既存検証スクリプト群を参考にする：
   - `.claude/skills/skill-creator/scripts/validate_all.js`
   - `.claude/skills/skill-creator/scripts/validate_structure.js`
   - `.claude/skills/skill-creator/scripts/validate_schema.js`

2. 以下の検証スクリプト要件を定義する：

| スクリプト名                | 検証対象         | 検証内容                                           |
| --------------------------- | ---------------- | -------------------------------------------------- |
| validate-skill-structure.js | ディレクトリ構造 | 必須ディレクトリ/ファイル存在、命名規則            |
| validate-skill-md.js        | SKILL.md         | YAML Frontmatter パース、必須フィールド、body 構造 |
| validate-agents.js          | agents/\*.md     | エージェント仕様書フォーマット準拠                 |
| validate-schemas.js         | schemas/\*.json  | JSON Schema Draft-07 準拠、必須プロパティ          |
| run-all-validations.js      | 統合実行         | 全検証スクリプトの順次実行、結果集約               |

3. 各スクリプトの入力・出力仕様を定義する
4. `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- 検証スクリプト要件（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク4: テスト実行スキルの要件定義

**目的**: 検証スクリプトを統合実行する skill-fixture-runner スキルの要件を定義する

**実行手順**:

1. skill-fixture-runner スキルの基本要件を定義する：

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| スキル名     | skill-fixture-runner                                 |
| 目的         | skill-creator 出力フィクスチャの自動検証             |
| 配置先       | `.claude/skills/skill-fixture-runner/`               |
| 実行コマンド | `node scripts/run-all-validations.js --target <dir>` |
| 対応ツール   | Bash, Read, Glob                                     |
| トリガー     | フィクスチャ検証, skill validation, スキルテスト     |

2. スキルの Progressive Disclosure 設計：
   - Level 1: SKILL.md（メタデータ + 概要）
   - Level 2: scripts/（検証スクリプト群）
   - Level 3: なし（参照資料は skill-creator の references/ を利用）

3. `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- テスト実行スキル要件（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク5: 受け入れ基準の定義

**目的**: フィクスチャ・スクリプト・スキルの完成時に検証可能な基準を定義する

**実行手順**:

1. 以下の受け入れ基準を定義する：

| 基準ID | カテゴリ     | 基準                                                                | 検証方法                                |
| ------ | ------------ | ------------------------------------------------------------------- | --------------------------------------- |
| AC-001 | フィクスチャ | complete-skill が skill-creator の validate_structure.js で検証可能 | validate_structure.js 実行              |
| AC-002 | フィクスチャ | complete-skill/SKILL.md が YAML Frontmatter パース可能              | validate-skill-md.js 実行               |
| AC-003 | フィクスチャ | complete-skill/agents/\*.md がエージェント仕様書フォーマットに準拠  | validate-agents.js 実行                 |
| AC-004 | フィクスチャ | complete-skill/schemas/\*.json が JSON Schema Draft-07 に準拠       | validate-schemas.js 実行                |
| AC-005 | フィクスチャ | minimal-skill が SKILL.md のみで検証をパスする                      | validate-skill-structure.js 実行        |
| AC-006 | フィクスチャ | invalid-skill が検証で適切にエラーを返す                            | validate-skill-md.js 実行（エラー期待） |
| AC-007 | フィクスチャ | orchestration-skill の YAML 設定がパース可能                        | YAML パーステスト                       |
| AC-008 | スクリプト   | run-all-validations.js が全検証を統合実行できる                     | コマンドライン実行                      |
| AC-009 | スクリプト   | 検証結果が JSON 形式で出力される                                    | 出力フォーマット確認                    |
| AC-010 | スキル       | skill-fixture-runner/SKILL.md が正しいフォーマットである            | フォーマット検証                        |
| AC-011 | 統合         | Vitest テスト（skill-creator.fixture.test.ts）が全件パスする        | `pnpm vitest run` 実行                  |

2. `outputs/phase-01/acceptance-criteria.md` に基準をまとめる

**期待される成果物**:

- `outputs/phase-01/acceptance-criteria.md`

---

## 参照資料

| 参照資料                       | パス                                                                                | 内容                     |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| skill-creator スキル           | `.claude/skills/skill-creator/SKILL.md`                                             | メタスキル定義           |
| skill-creator 構造検証         | `.claude/skills/skill-creator/scripts/validate_structure.js`                        | 構造検証ロジック         |
| skill-creator エージェント定義 | `.claude/skills/skill-creator/schemas/agent-definition.json`                        | エージェント仕様スキーマ |
| skill-creator テンプレート     | `.claude/skills/skill-creator/assets/`                                              | 出力テンプレート集       |
| スキル構造仕様                 | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` | SKILL.md 仕様            |
| TASK-8C-E フィクスチャ         | `docs/30-workflows/completed-tasks/TASK-8C-E/`                                      | 既存フィクスチャパターン |
| 既存テストフィクスチャ         | `apps/desktop/src/__tests__/__fixtures__/skills/`                                   | E2E スキルフィクスチャ   |

---

## 成果物

| 成果物       | パス                                          | 内容                         |
| ------------ | --------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-01/requirements-definition.md` | フィクスチャ・スクリプト要件 |
| 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`     | AC-001〜AC-011               |

---

## 統合テスト連携

**Phase 1 では統合テストの対象外**

要件定義フェーズのため、統合テストは後続の Phase 4 以降で実施する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                            |
| -------------- | ------------------------------------------------------------------- |
| テスタビリティ | フィクスチャが skill-creator の全モード出力を十分にカバーしているか |
| 保守性         | skill-creator バージョンアップ時にフィクスチャの追従が容易か        |
| 再利用性       | 検証スクリプトが他のスキルの検証にも利用可能か                      |
| セキュリティ   | フィクスチャに機密情報やパストラバーサルパターンが含まれないか      |
| 仕様整合性     | aiworkflow-requirements のスキル構造仕様と一致しているか            |

---

## 完了条件

- [ ] skill-creator の出力構造パターンが分析・文書化されている
- [ ] 5種類のフィクスチャ要件（complete/minimal/partial/invalid/orchestration）が定義されている
- [ ] 5種類の検証スクリプト要件が定義されている
- [ ] skill-fixture-runner スキルの要件が定義されている
- [ ] 受け入れ基準（AC-001〜AC-011）が定義されている
- [ ] aiworkflow-requirements のスキル構造仕様との整合性が確認されている
- [ ] 全成果物が outputs/phase-01/ に配置されている

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

`phase-02-design.md`
