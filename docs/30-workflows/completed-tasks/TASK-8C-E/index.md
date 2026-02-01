# TASK-8C-E: E2Eテストフィクスチャ作成

## メタ情報

| 項目     | 内容                            |
| -------- | ------------------------------- |
| タスクID | TASK-8C-E                       |
| タスク名 | E2Eテストフィクスチャ作成       |
| Tier     | 1（MVP）                        |
| Phase    | 8（テスト）                     |
| 優先度   | high                            |
| 複雑度   | small                           |
| 依存元   | TASK-2A（SkillScanner）         |
| 並行可能 | TASK-8C-A（IPC結合テスト）      |
| ブロック | TASK-8C-B, TASK-8C-C, TASK-8C-D |
| 作成日   | 2026-01-31                      |

## 概要

E2Eテスト（TASK-8C-B/C/D）で使用するスキルフィクスチャディレクトリ構造を作成する。SkillScanner が正しくパースできる有効なスキル、最小構成のスキル、SKILL.md が存在しない無効なスキルの3種類を用意する。

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

| 種別         | パス                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`               |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/agents/test-agent.md`   |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/references/test-ref.md` |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md`            |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/invalid-skill/README.md`           |

### ドキュメント成果物

| 種別                 | パス                                          |
| -------------------- | --------------------------------------------- |
| 要件定義書           | `outputs/phase-01/requirements-definition.md` |
| 設計書               | `outputs/phase-02/fixture-design.md`          |
| テスト仕様書         | `outputs/phase-04/test-specification.md`      |
| 実装サマリー         | `outputs/phase-05/implementation-summary.md`  |
| カバレッジレポート   | `outputs/phase-07/coverage-report.md`         |
| 品質レポート         | `outputs/phase-09/quality-report.md`          |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新記録 | `outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  |

## 依存関係

```
TASK-2A (SkillScanner) ─完了→ TASK-8C-E (本タスク)
                                    ├→ TASK-8C-B (E2E: スキル選択)
                                    ├→ TASK-8C-C (E2E: インポート実行)
                                    └→ TASK-8C-D (E2E: パーミッション)
```
