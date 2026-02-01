# Phase 6: テスト拡充

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 6          |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

Phase 5で実装したフィクスチャとテストに対して追加のエッジケーステストを作成し、カバレッジを向上させる。

## 実行タスク

- 追加エッジケーステスト: 境界値の「境界+1」「境界-1」テスト追加
- エラーメッセージ詳細検証: エラー出力の構造化検証テスト追加
- run-all-validations.js の全パス検証: 正常・異常の全組み合わせテスト追加

## 参照資料

| 資料名             | パス                                         | 説明     |
| ------------------ | -------------------------------------------- | -------- |
| Phase 4 テスト仕様 | `outputs/phase-04/test-specification.md`     | TC一覧   |
| Phase 5 実装サマリ | `outputs/phase-05/implementation-summary.md` | 実装内容 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |

## 実行手順

### 1. 追加エッジケーステスト

| テスト分類      | 追加テスト内容                                                                        |
| --------------- | ------------------------------------------------------------------------------------- |
| name境界超過    | name が 65 文字の場合のvalidate-skill-md.js動作検証（現状の検証スクリプトの動作確認） |
| description境界 | description が 9 文字（最小未満）、1025 文字（最大超過）のケース                      |
| allowed-tools空 | allowed-tools が空配列 `[]` の場合の検証                                              |
| 複合エラー      | missing-fields-skill に対する run-all-validations.js の複合エラー出力                 |

### 2. エラーメッセージ構造化検証

検証スクリプトのJSON出力を `parseValidationOutput` でパースし、以下を検証する。

| 検証対象                 | 検証内容                                                   |
| ------------------------ | ---------------------------------------------------------- |
| `valid` プロパティ       | boolean型であること                                        |
| `errors` プロパティ      | 配列型であること                                           |
| `errors[].message`       | 具体的なエラーメッセージが含まれること                     |
| `structure` プロパティ   | validate-skill-structure.js出力のディレクトリ/ファイル情報 |
| `frontmatter` プロパティ | validate-skill-md.js出力のパース済みFrontmatter            |

### 3. run-all-validations.js 全パス検証

| 入力パターン                             | 期待動作                                    |
| ---------------------------------------- | ------------------------------------------- |
| complete-skill（全サブディレクトリあり） | 4スクリプト全て実行、overall: valid         |
| minimal-skill（agents/schemas/なし）     | structure + skill-md のみ実行、スキップログ |
| invalid-skill（不正YAML）                | skill-md で失敗、overall: invalid           |
| boundary-skill（全サブディレクトリあり） | 4スクリプト全て実行、overall: valid         |

### 4. テスト実行

```bash
pnpm vitest run apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts
```

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**注意**: 本タスクではテストフィクスチャのテストであるため、カバレッジは検証スクリプト実行の出力に対する検証カバレッジを指す。

## 統合テスト連携

| テストカテゴリ | 検証項目                                    | 目標 |
| -------------- | ------------------------------------------- | ---- |
| スクリプト実行 | 全5スクリプトに対するフィクスチャ入力の網羅 | 100% |
| エラーパターン | 各スクリプトのエラー出力パターン            | 80%+ |
| 条件付き実行   | run-all-validations.jsのスキップパス        | 100% |

## 成果物

| 成果物         | パス                                                                | 説明             |
| -------------- | ------------------------------------------------------------------- | ---------------- |
| テスト拡充結果 | `outputs/phase-06/test-expansion-result.md`                         | テスト拡充記録   |
| テストファイル | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` | 拡充テストコード |

## 完了条件

- [ ] 追加エッジケーステストが作成されている
- [ ] エラーメッセージの構造化検証テストが作成されている
- [ ] run-all-validations.jsの全パス検証テストが作成されている
- [ ] 全テストがPASSしている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
