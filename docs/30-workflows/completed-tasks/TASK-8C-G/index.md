# TASK-8C-G: Skill-Creator フィクスチャ境界値テスト拡充

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスクID   | TASK-8C-G                                           |
| タスク名   | Skill-Creator フィクスチャ境界値テスト拡充          |
| ブランチ名 | task/TASK-8C-G-fixture-boundary-tests               |
| 前提タスク | TASK-8C-F（Skill-Creator テスト用フィクスチャ作成） |
| 作成日     | 2026-02-01                                          |

## 概要

TASK-8C-Fで作成したskill-creatorテスト用フィクスチャ（5種類）と検証スクリプト（5本）に対して、境界値テスト・エラーパターン・エッジケースを拡充する。ギャップ分析で検出された4カテゴリ（A: 検証スクリプト境界条件、B: skill-creator仕様境界、C: invalid-skill制限、D: テスト実装技術問題）の網羅的カバーを目的とする。

## スコープ

### 対象

- 新規フィクスチャ追加: `boundary-skill/`、`missing-fields-skill/`、`forbidden-files-skill/`、`invalid-name-skill/`、`empty-agents-skill/`、`invalid-schema-skill/`
- 既存テストファイル拡張: `skill-creator.fixture.test.ts` への境界値テストケース追加
- 検証スクリプトエッジケーステスト追加
- テスト実装品質改善（D カテゴリ対応）

### 対象外

- 検証スクリプト本体のロジック変更（テスト追加のみ）
- skill-creator スキル本体の変更
- E2Eテストフィクスチャ（`__fixtures__/skills/`）の変更
- TASK-8C-Fで作成済みの5種類のフィクスチャの変更

## ギャップ分析結果（TASK-8C-Fからの引き継ぎ）

### カテゴリA: 検証スクリプト境界条件（未テスト）

| ID  | 内容                                          | 対応フィクスチャ       |
| --- | --------------------------------------------- | ---------------------- |
| A1  | FORBIDDEN_FILES（README.md等）を含むスキル    | forbidden-files-skill/ |
| A2  | name/description 必須フィールド欠落           | missing-fields-skill/  |
| A3  | name が kebab-case でない（大文字・特殊文字） | invalid-name-skill/    |
| A4  | agents/ ディレクトリが空（.md ファイルなし）  | empty-agents-skill/    |
| A5  | JSON スキーマに $schema/type プロパティなし   | invalid-schema-skill/  |
| A6  | --target 引数なしでのスクリプト実行           | テストケースで直接検証 |
| A7  | validate-skill-structure.js の KNOWN_DIRS 外  | boundary-skill/        |
| A8  | validate-agents.js の REQUIRED_SECTIONS 欠落  | boundary-skill/agents/ |
| A9  | run-all-validations.js の条件付き実行パス     | テストケースで直接検証 |
| A10 | EXIT_CODES の使い分け（2:ARGS, 3:NOT_FOUND）  | テストケースで直接検証 |

### カテゴリB: skill-creator 仕様境界（未テスト）

| ID  | 内容                                     | 対応フィクスチャ       |
| --- | ---------------------------------------- | ---------------------- |
| B1  | name 最大長 64 文字                      | boundary-skill/        |
| B2  | description 最小 10 文字・最大 1024 文字 | boundary-skill/        |
| B3  | SKILL.md 最大行数 500 行                 | boundary-skill/        |
| B4  | 山括弧（`<>`）禁止                       | boundary-skill/        |
| B5  | Anchors/Trigger セクション必須           | boundary-skill/        |
| B6  | chain 設定の最小ステップ数 2             | boundary-skill/assets/ |
| B7  | parallel 設定の最小タスク数 2            | boundary-skill/assets/ |
| B8  | allowed-tools が配列であること（型検証） | invalid-skill（既存）  |
| B9  | version フィールドの semver 形式検証     | boundary-skill/        |

### カテゴリC: invalid-skill フィクスチャ制限

| ID  | 内容                                                 |
| --- | ---------------------------------------------------- |
| C1  | 現状は `allowed-tools: not-an-array` の1パターンのみ |

### カテゴリD: テスト実装技術問題

| ID  | 内容                                                  |
| --- | ----------------------------------------------------- |
| D1  | validate-skill-md.js と Vitest で異なる YAML パーサー |
| D2  | 弱い assertion（`toContain` のみ）                    |
| D3  | 文字列ベースの YAML チェック                          |

## Phase一覧

| Phase | 名称                 | 仕様書                           |
| ----- | -------------------- | -------------------------------- |
| 1     | 要件定義             | phase-1-requirements.md          |
| 2     | 設計                 | phase-2-design.md                |
| 3     | 設計レビューゲート   | phase-3-design-review.md         |
| 4     | テスト作成           | phase-4-test-creation.md         |
| 5     | 実装                 | phase-5-implementation.md        |
| 6     | テスト拡充           | phase-6-test-expansion.md        |
| 7     | テストカバレッジ確認 | phase-7-coverage-verification.md |
| 8     | リファクタリング     | phase-8-refactoring.md           |
| 9     | 品質保証             | phase-9-quality-assurance.md     |
| 10    | 最終レビューゲート   | phase-10-final-review.md         |
| 11    | 手動テスト検証       | phase-11-manual-testing.md       |
| 12    | ドキュメント更新     | phase-12-documentation.md        |
| 13    | PR作成               | phase-13-pr-creation.md          |

## 成果物概要

### ドキュメント成果物

`docs/30-workflows/TASK-8C-G/outputs/` 配下に各Phase成果物を格納。

### コード成果物

| 成果物                    | 配置先                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| 新規フィクスチャ（6種類） | `apps/desktop/src/__tests__/__fixtures__/skill-creator/`            |
| テストケース拡張          | `apps/desktop/src/__tests__/fixtures/skill-creator.fixture.test.ts` |

## 品質基準

| 指標              | 基準                               |
| ----------------- | ---------------------------------- |
| テスト全件PASS    | 既存62件 + 新規全件                |
| ESLint エラー     | 0件                                |
| TypeScript エラー | 0件                                |
| TODO/FIXME        | 0件                                |
| ギャップカバー率  | A: 100%, B: 100%, C: 改善, D: 100% |
