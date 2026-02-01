# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 5                                                          |
| Phase名    | 実装                                                       |
| 前提Phase  | Phase 4（テスト作成）                                      |
| 後続Phase  | Phase 6（テスト拡充）                                      |
| ステータス | 未実施                                                     |
| 作成日     | 2026-02-01                                                 |
| 機能名     | TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル |

---

## 目的

Phase 4 で作成したテストを全件パスさせるために、テスト用フィクスチャファイル、検証スクリプト、テスト実行スキルを作成する（Green 状態にする）。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: complete-skill フィクスチャの作成

**目的**: 全ディレクトリを含む完全なスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/SKILL.md` を作成する：
   - YAML Frontmatter: name, description, version, allowed-tools
   - body: Anchors セクション、Operating Modes セクション、Workflow セクション

2. `complete-skill/package.json` を作成する：
   - name: `@skills/fixture-complete-skill`
   - scripts: validate コマンド

3. `complete-skill/EVALS.json` を作成する：
   - skill_name, current_level, metrics フィールド

4. `complete-skill/agents/analyze-request.md` を作成する：
   - TASK_TITLE, PERSONA_NAME, RESPONSIBILITIES, STEPS, INPUTS, OUTPUTS セクション
   - skill-creator の agent-definition.json スキーマに準拠

5. `complete-skill/agents/generate-code.md` を作成する：
   - 同上フォーマットで別のエージェント仕様

6. `complete-skill/references/overview.md` を作成する：
   - `# Overview` 見出し + 概要説明

7. `complete-skill/references/quality-standards.md` を作成する：
   - 品質基準ガイドフォーマット

8. `complete-skill/scripts/utils.js` を作成する：
   - EXIT_CODES オブジェクト定義
   - getArg(), resolvePath() ユーティリティ関数のエクスポート

9. `complete-skill/scripts/validate_all.js` を作成する：
   - utils.js をインポート
   - 基本的な検証ロジックのスタブ

10. `complete-skill/assets/skill-template.md` を作成する：
    - テンプレート変数 `{{skill_name}}`, `{{description}}` を含む

11. `complete-skill/schemas/agent-definition.json` を作成する：
    - `$schema`: JSON Schema Draft-07
    - required: TASK_TITLE, STEPS
    - properties 定義

**期待される成果物**:

- complete-skill/ 配下の全11ファイル

---

### タスク2: minimal-skill フィクスチャの作成

**目的**: SKILL.md のみの最小構成スキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/minimal-skill/SKILL.md` を作成する：
   - YAML Frontmatter: name (`fixture-minimal-skill`), description, allowed-tools
   - body: `# Minimal Skill` + 最小限の説明

**期待される成果物**:

- `minimal-skill/SKILL.md`

---

### タスク3: partial-skill フィクスチャの作成

**目的**: 部分的なリソースを持つスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/partial-skill/SKILL.md` を作成する：
   - YAML Frontmatter: name (`fixture-partial-skill`), description, allowed-tools
   - body: `# Partial Skill` + 説明

2. `partial-skill/agents/single-agent.md` を作成する：
   - 最小限のエージェント仕様書（TASK_TITLE, STEPS のみ）

**期待される成果物**:

- `partial-skill/SKILL.md`
- `partial-skill/agents/single-agent.md`

---

### タスク4: invalid-skill フィクスチャの作成

**目的**: 検証でエラーとなる不正なスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-skill/SKILL.md` を作成する：
   - 意図的に不正な YAML Frontmatter を含む
   - `description: ` の値にクォートされていないコロンを含む
   - `allowed-tools` の値が配列でなく文字列

**期待される成果物**:

- `invalid-skill/SKILL.md`

---

### タスク5: orchestration-skill フィクスチャの作成

**目的**: オーケストレーション設定を持つスキルフィクスチャを作成する

**実行手順**:

1. `apps/desktop/src/__tests__/__fixtures__/skill-creator/orchestration-skill/SKILL.md` を作成する：
   - YAML Frontmatter: name (`fixture-orchestration-skill`), description, allowed-tools

2. `orchestration-skill/assets/chain-config.yaml` を作成する：
   - skills 配列（順次実行リスト）
   - on_error ハンドリング設定

3. `orchestration-skill/assets/parallel-config.yaml` を作成する：
   - skills 配列（並列実行リスト）
   - result_aggregation 設定

**期待される成果物**:

- `orchestration-skill/SKILL.md`
- `orchestration-skill/assets/chain-config.yaml`
- `orchestration-skill/assets/parallel-config.yaml`

---

### タスク6: 検証スクリプトの作成

**目的**: フィクスチャを検証する5つのスクリプトを作成する

**実行手順**:

1. `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` を作成する：
   - 入力: `--target <dir>`
   - SKILL.md 存在チェック、既知ディレクトリ検出、命名規則チェック
   - JSON 出力

2. `.claude/skills/skill-fixture-runner/scripts/validate-skill-md.js` を作成する：
   - 入力: `--target <skill.md-path>`
   - YAML Frontmatter パース、必須フィールド確認、body 構造検証
   - JSON 出力

3. `.claude/skills/skill-fixture-runner/scripts/validate-agents.js` を作成する：
   - 入力: `--target <agents-dir>`
   - 各 .md ファイルの必須セクション確認
   - JSON 出力

4. `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js` を作成する：
   - 入力: `--target <schemas-dir>`
   - JSON パース、$schema 存在、type 存在チェック
   - JSON 出力

5. `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js` を作成する：
   - 入力: `--target <dir> [--verbose]`
   - 4スクリプトの順次実行
   - 統合結果の JSON 出力

**期待される成果物**:

- `.claude/skills/skill-fixture-runner/scripts/` 配下の5ファイル

---

### タスク7: skill-fixture-runner スキルの作成

**目的**: テスト実行スキルの SKILL.md と設定ファイルを作成する

**実行手順**:

1. `.claude/skills/skill-fixture-runner/SKILL.md` を作成する：
   - YAML Frontmatter: name, description, allowed-tools
   - body: スキルの目的、使い方、検証スクリプト一覧

2. `.claude/skills/skill-fixture-runner/EVALS.json` を作成する：
   - 初期メトリクス（Level 1、使用回数 0）

3. `.claude/skills/skill-fixture-runner/package.json` を作成する：
   - scripts: validate コマンド

**期待される成果物**:

- `.claude/skills/skill-fixture-runner/` 配下の3ファイル

---

### タスク8: テスト実行確認（Green 状態）

**目的**: Phase 4 で作成したテストが全件パスすることを確認する

**実行手順**:

1. テストを実行する：
   ```bash
   pnpm --filter @repo/desktop vitest run src/__tests__/fixtures/skill-creator.fixture.test.ts
   ```
2. 全テストケース（TC-001〜TC-037）がパスすることを確認する
3. 実装サマリーを `outputs/phase-05/implementation-summary.md` に出力する

**期待される成果物**:

- テスト実行結果（全件 PASS）
- `outputs/phase-05/implementation-summary.md`

---

## 参照資料

| 参照資料                   | パス                                                                | 内容               |
| -------------------------- | ------------------------------------------------------------------- | ------------------ |
| Phase 2 設計書             | `outputs/phase-02/fixture-design.md`                                | フィクスチャ設計   |
| Phase 4 テスト             | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | テストケース       |
| skill-creator テンプレート | `.claude/skills/skill-creator/assets/`                              | 出力テンプレート   |
| skill-creator スキーマ     | `.claude/skills/skill-creator/schemas/`                             | 出力スキーマ       |
| skill-creator スクリプト   | `.claude/skills/skill-creator/scripts/`                             | スクリプトパターン |

---

## 成果物

| 成果物              | パス                                                                         | 内容                 |
| ------------------- | ---------------------------------------------------------------------------- | -------------------- |
| complete-skill      | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/`      | 完全スキル           |
| minimal-skill       | `apps/desktop/src/__tests__/__fixtures__/skill-creator/minimal-skill/`       | 最小スキル           |
| partial-skill       | `apps/desktop/src/__tests__/__fixtures__/skill-creator/partial-skill/`       | 部分スキル           |
| invalid-skill       | `apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-skill/`       | 無効スキル           |
| orchestration-skill | `apps/desktop/src/__tests__/__fixtures__/skill-creator/orchestration-skill/` | オーケストレーション |
| 検証スクリプト      | `.claude/skills/skill-fixture-runner/scripts/`                               | 5スクリプト          |
| テスト実行スキル    | `.claude/skills/skill-fixture-runner/`                                       | スキル定義           |
| 実装サマリー        | `outputs/phase-05/implementation-summary.md`                                 | 実装記録             |

---

## Electronデスクトップアプリ観点

| 層                 | 確認内容                                             |
| ------------------ | ---------------------------------------------------- |
| ファイルシステム   | フィクスチャのパスがプラットフォーム非依存であること |
| Node.js ランタイム | 検証スクリプトが Node.js 18+ で動作すること          |

---

## 多角的チェック観点

| 観点                   | 確認内容                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| skill-creator 互換性   | フィクスチャが skill-creator v8.1.0 の出力仕様と完全に一致しているか     |
| テスト通過             | Phase 4 のテスト（TC-001〜TC-037）が全件 Green になっているか            |
| ファイルシステム互換性 | フィクスチャのパスがプラットフォーム非依存であること                     |
| スクリプト品質         | 検証スクリプトが EXIT_CODES パターンに準拠し JSON 出力が統一されているか |

---

## 完了条件

- [ ] complete-skill/ 配下の全11ファイルが作成されている
- [ ] minimal-skill/SKILL.md が作成されている
- [ ] partial-skill/ 配下の2ファイルが作成されている
- [ ] invalid-skill/SKILL.md が作成されている
- [ ] orchestration-skill/ 配下の3ファイルが作成されている
- [ ] 検証スクリプト5ファイルが作成されている
- [ ] skill-fixture-runner スキル3ファイルが作成されている
- [ ] Phase 4 のテスト（TC-001〜TC-037）が全件パスしている
- [ ] 実装サマリーが outputs/phase-05/ に配置されている

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

`phase-06-test-expansion.md`
