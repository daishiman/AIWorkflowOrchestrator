# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 8          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

テストの動作を維持しながらテストコードの品質を改善する。特にD カテゴリ（テスト実装技術問題）の改善をこのPhaseで完了する。

## 実行タスク

- テストコードリファクタリング: 重複排除、ヘルパー関数の共通化
- D カテゴリ完全対応: 既存テストの assertion 改善を完了
- テスト構造整理: describe ブロックの論理的整理

## 参照資料

| 資料名               | パス                                                                | 説明                 |
| -------------------- | ------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義     | `outputs/phase-01/requirements-definition.md`                       | 要件一覧             |
| Phase 2 品質改善設計 | `outputs/phase-02/test-case-design.md`                              | D カテゴリ方針       |
| Phase 5 実装サマリ   | `outputs/phase-05/implementation-summary.md`                        | 実装済みフィクスチャ |
| Phase 6 テスト拡充   | `outputs/phase-06/test-expansion-result.md`                         | 追加テスト一覧       |
| Phase 7 カバレッジ   | `outputs/phase-07/coverage-report.md`                               | カバレッジ結果       |
| 既存テストファイル   | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | テストソース         |

## 実行手順

### 1. テストヘルパーの共通化

| リファクタリング項目       | 内容                                                      |
| -------------------------- | --------------------------------------------------------- |
| `runValidationScript` 改善 | エラー時のJSON出力も `parseValidationOutput` でパースする |
| パス解決の共通化           | `fixtureDir` ヘルパーを全テストで使用する                 |
| スクリプトパスの定数化     | 5スクリプトのパスを定数として定義する                     |

### 2. D カテゴリ完全対応

#### D1: YAMLパーサー統一

既存テストの中で `content.includes('name:')` のような文字列チェックを行っている箇所を特定し、`parseFrontmatter` ヘルパーを使用した構造化検証に置換する。

| 対象テスト | 変更前                             | 変更後                                    |
| ---------- | ---------------------------------- | ----------------------------------------- |
| TC-007相当 | `content.includes('name:')`        | `parseFrontmatter(path).data.name`        |
| TC-008相当 | `content.includes('description:')` | `parseFrontmatter(path).data.description` |

#### D2: assertion強化

| 対象テスト     | 変更前                                | 変更後                                                           |
| -------------- | ------------------------------------- | ---------------------------------------------------------------- |
| スクリプト出力 | `expect(output).toContain('"valid"')` | `expect(parseValidationOutput(output).valid).toBe(true)`         |
| エラー検証     | `expect(output).toContain('error')`   | `expect(parseValidationOutput(output).errors).toHaveLength(...)` |

#### D3: YAML文字列チェック改善

| 対象テスト    | 変更前                               | 変更後                                                  |
| ------------- | ------------------------------------ | ------------------------------------------------------- |
| allowed-tools | `content.includes('allowed-tools:')` | `expect(parsed['allowed-tools']).toBeInstanceOf(Array)` |

### 3. describe ブロック構造整理

| ブロック名                    | 内容                             |
| ----------------------------- | -------------------------------- |
| Complete Skill Fixtures       | 完全スキル検証（既存）           |
| Minimal Skill Fixtures        | 最小スキル検証（既存）           |
| Partial Skill Fixtures        | 部分スキル検証（既存）           |
| Invalid Skill Fixtures        | 不正スキル検証（既存）           |
| Orchestration Skill Fixtures  | オーケストレーション検証（既存） |
| Boundary Value Fixtures       | 境界値検証（新規）               |
| Error Pattern Fixtures        | エラーパターン検証（新規）       |
| Validation Script Edge Cases  | スクリプトエッジケース（新規）   |
| Test Quality Improvements     | 品質改善検証（新規）             |
| Validation Script Integration | スクリプト統合検証（既存）       |
| Cross-Fixture Consistency     | フィクスチャ間整合性（既存）     |

## 統合テスト連携

```bash
# リファクタリング後のテスト実行
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
```

全テストが継続してPASSすることを確認する。

## 成果物

| 成果物               | パス                                  | 説明           |
| -------------------- | ------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-08/refactoring-log.md` | リファクタ内容 |

## 完了条件

- [ ] テストが継続成功
- [ ] D カテゴリ（D1, D2, D3）の改善が完了している
- [ ] テストヘルパーが共通化されている
- [ ] 重複コードが排除されている
- [ ] describe ブロックが論理的に整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts

# 確認項目
# - [ ] リファクタリング後も全テストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証
