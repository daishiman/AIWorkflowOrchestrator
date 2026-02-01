# TASK-8C-F: Skill-Creator テスト用フィクスチャ & 実行スキル作成

## メタ情報

| 項目     | 内容                                                |
| -------- | --------------------------------------------------- |
| タスクID | TASK-8C-F                                           |
| タスク名 | Skill-Creator テスト用フィクスチャ & 実行スキル作成 |
| Tier     | 1（MVP）                                            |
| Phase    | 8（テスト）                                         |
| 優先度   | high                                                |
| 複雑度   | medium                                              |
| 依存元   | TASK-8C-E（E2Eフィクスチャ基盤）                    |
| 並行可能 | なし                                                |
| ブロック | なし                                                |
| 作成日   | 2026-02-01                                          |

## 概要

skill-creator スキル（`.claude/skills/skill-creator/`）が生成するスキル構造を検証するためのテスト用フィクスチャを作成する。skill-creator の出力物（SKILL.md、agents/、references/、scripts/、assets/、schemas/）の構造整合性・フォーマット準拠を自動検証するスクリプト群、およびそれらを統合実行するテスト実行スキルを構築する。

## 対象スキル分析

### skill-creator の出力構造（v8.1.0）

```
<generated-skill>/
├── SKILL.md               # メインスキル定義
├── EVALS.json             # 評価メトリクス
├── LOGS.md                # 使用ログ
├── package.json           # スクリプト定義
├── agents/                # タスク仕様（LLM実行）
│   └── *.md
├── references/            # 参照ガイド（知識圧縮）
│   └── *.md
├── scripts/               # 決定論的スクリプト（100%精度）
│   └── *.js
├── assets/                # テンプレート・スターター
│   └── *.{md,js,py,sh,ts,yaml,json}
└── schemas/               # JSONスキーマ定義
    └── *.json
```

## Phase構成

| Phase | 名称                 | ステータス | 仕様書                     |
| ----- | -------------------- | ---------- | -------------------------- |
| 1     | 要件定義             | 未実施     | phase-01-requirements.md   |
| 2     | 設計                 | 未実施     | phase-02-design.md         |
| 3     | 設計レビューゲート   | 未実施     | phase-03-design-review.md  |
| 4     | テスト作成           | 未実施     | phase-04-tests.md          |
| 5     | 実装                 | 未実施     | phase-05-implementation.md |
| 6     | テスト拡充           | 未実施     | phase-06-test-expansion.md |
| 7     | テストカバレッジ確認 | 未実施     | phase-07-coverage.md       |
| 8     | リファクタリング     | 未実施     | phase-08-refactoring.md    |
| 9     | 品質保証             | 未実施     | phase-09-quality.md        |
| 10    | 最終レビューゲート   | 未実施     | phase-10-final-review.md   |
| 11    | 手動テスト検証       | 未実施     | phase-11-manual-test.md    |
| 12    | ドキュメント更新     | 未実施     | phase-12-documentation.md  |
| 13    | PR作成               | 未実施     | phase-13-pr-creation.md    |

## 成果物概要

### コード成果物

| 種別             | パス                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------- |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/SKILL.md`           |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/agents/*.md`        |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/references/*.md`    |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/scripts/*.js`       |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/assets/*.md`        |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/schemas/*.json`     |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/minimal-skill/SKILL.md`            |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/partial-skill/SKILL.md`            |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/partial-skill/agents/*.md`         |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/invalid-skill/SKILL.md`            |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/orchestration-skill/SKILL.md`      |
| フィクスチャ     | `apps/desktop/src/__tests__/__fixtures__/skill-creator/orchestration-skill/assets/*.yaml` |
| 検証スクリプト   | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`                 |
| 検証スクリプト   | `.claude/skills/skill-fixture-runner/scripts/validate-skill-md.js`                        |
| 検証スクリプト   | `.claude/skills/skill-fixture-runner/scripts/validate-agents.js`                          |
| 検証スクリプト   | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`                         |
| 検証スクリプト   | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`                      |
| テスト実行スキル | `.claude/skills/skill-fixture-runner/SKILL.md`                                            |
| テストファイル   | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts`                       |

### ドキュメント成果物

| 種別                 | パス                                          |
| -------------------- | --------------------------------------------- |
| 要件定義書           | `outputs/phase-01/requirements-definition.md` |
| 受け入れ基準         | `outputs/phase-01/acceptance-criteria.md`     |
| 設計書               | `outputs/phase-02/fixture-design.md`          |
| 設計レビュー結果     | `outputs/phase-03/design-review-result.md`    |
| テスト仕様書         | `outputs/phase-04/test-specification.md`      |
| 実装サマリー         | `outputs/phase-05/implementation-summary.md`  |
| カバレッジレポート   | `outputs/phase-07/coverage-report.md`         |
| リファクタリングログ | `outputs/phase-08/refactoring-log.md`         |
| 品質レポート         | `outputs/phase-09/quality-report.md`          |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  |
| PR情報               | `outputs/phase-13/pr-info.md`                 |

## 依存関係

```
TASK-8C-E (E2Eフィクスチャ基盤) ─完了→ TASK-8C-F (本タスク)
                                              ├→ skill-creator 出力検証
                                              ├→ フィクスチャ検証スクリプト
                                              └→ skill-fixture-runner スキル
```

## skill-creator スキルとの関連

| 検証対象                       | skill-creator コンポーネント                           | フィクスチャ対応        |
| ------------------------------ | ------------------------------------------------------ | ----------------------- |
| SKILL.md フォーマット          | `assets/skill-template.md`                             | complete-skill/SKILL.md |
| エージェント仕様書フォーマット | `assets/agent-template.md`                             | complete-skill/agents/  |
| スクリプト構造                 | `scripts/validate_structure.js`                        | complete-skill/scripts/ |
| JSONスキーマ準拠               | `schemas/agent-definition.json`                        | complete-skill/schemas/ |
| Progressive Disclosure         | `references/resource-map.md`                           | 全フィクスチャ          |
| オーケストレーション設定       | `assets/chain-template.yaml`, `parallel-template.yaml` | orchestration-skill/    |
