# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 9                                         |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 機能名   | skillexecutor-type-cleanup                |
| 分類     | リファクタリング                          |
| 作成日   | 2026-02-07                                |

## 目的

Phase 8でリファクタリングしたコードが定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

| ゲート項目     | 基準                            | 検証方法                   |
| -------------- | ------------------------------- | -------------------------- |
| 機能検証       | 全自動テスト成功                | `pnpm test`                |
| コード品質     | ESLint/Prettier 通過            | `pnpm lint && pnpm format` |
| 型安全性       | TypeScript strict mode 通過     | `pnpm typecheck`           |
| 型アサーション | `as any`, `as unknown` 増加なし | diff 確認                  |
| テスト網羅性   | カバレッジ基準達成（維持）      | `pnpm test:coverage`       |
| セキュリティ   | 重大な脆弱性の不在              | 静的解析                   |

## 実行タスク

- 全テスト実行: ユニット/統合/E2E テストの完全実行
- 静的解析実行: ESLint/TypeScript型チェックの実行
- カバレッジ確認: テストカバレッジの維持確認
- セキュリティ確認: 型安全性の確保確認

## 参照資料

| 資料名               | パス                                 | 説明                          |
| -------------------- | ------------------------------------ | ----------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Phase 8成果物                 |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` | Phase 7成果物（ベースライン） |
| 品質基準             | `.claude/rules/02-code-quality.md`   | プロジェクト品質基準          |

## 実行手順

### ステップ1: 全テスト実行

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test

# 統合テスト実行（存在する場合）
pnpm --filter @repo/desktop test:integration

# 共有パッケージのテスト
pnpm --filter @repo/shared test
```

### ステップ2: 静的解析実行

```bash
# ESLint実行
pnpm --filter @repo/desktop lint

# Prettier確認
pnpm --filter @repo/desktop format:check

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck
```

### ステップ3: カバレッジ確認

```bash
# カバレッジ測定
pnpm --filter @repo/desktop test:coverage

# カバレッジレポート確認
# Line Coverage: 80%以上
# Branch Coverage: 60%以上
# Function Coverage: 80%以上
```

### ステップ4: 型安全性確認

```bash
# 型アサーションの変化を確認
git diff HEAD~1 -- '*.ts' | grep -E "as any|as unknown" || echo "No new type assertions"

# strictモードでのコンパイル確認
pnpm --filter @repo/desktop build
```

### ステップ5: セキュリティ確認

- 型安全性が維持されていることを確認
- 新たな `any` 型の導入がないことを確認
- ESLint セキュリティルールを通過していることを確認

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目     | 確認内容              | 結果     |
| ------------ | --------------------- | -------- |
| 機能検証     | 全自動テスト成功      | [ ] PASS |
| 統合テスト   | 全統合テスト成功      | [ ] PASS |
| 型チェック   | TypeScript strict通過 | [ ] PASS |
| Lint         | ESLint エラーなし     | [ ] PASS |
| フォーマット | Prettier 差分なし     | [ ] PASS |

## 品質基準（本タスク固有）

### 型安全性チェック

| チェック項目              | 基準                  | 結果     |
| ------------------------- | --------------------- | -------- |
| `as any` の増加           | 0件                   | [ ] PASS |
| `as unknown` の増加       | 0件                   | [ ] PASS |
| `@ts-ignore` の増加       | 0件                   | [ ] PASS |
| `@ts-expect-error` の増加 | 0件（理由付きを除く） | [ ] PASS |

### コード品質チェック

| チェック項目  | 基準     | 結果     |
| ------------- | -------- | -------- |
| ESLint エラー | 0件      | [ ] PASS |
| ESLint 警告   | 増加なし | [ ] PASS |
| Prettier 差分 | 0件      | [ ] PASS |
| 未使用 import | 0件      | [ ] PASS |

### テストカバレッジチェック

| 指標              | ベースライン | 現在値 | 基準    | 結果     |
| ----------------- | ------------ | ------ | ------- | -------- |
| Line Coverage     | -            | -      | 80%以上 | [ ] PASS |
| Branch Coverage   | -            | -      | 60%以上 | [ ] PASS |
| Function Coverage | -            | -      | 80%以上 | [ ] PASS |

## 成果物

| 成果物         | パス                                 | 説明                |
| -------------- | ------------------------------------ | ------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`  | 品質検証結果一覧    |
| テスト実行結果 | `outputs/phase-9/test-results.md`    | 全テスト実行結果    |
| 静的解析結果   | `outputs/phase-9/static-analysis.md` | Lint/型チェック結果 |

## 完了条件

- [ ] 全ユニットテストが成功している
- [ ] 統合テストが成功している（存在する場合）
- [ ] ESLint エラーが0件である
- [ ] Prettier による差分がない
- [ ] TypeScript 型チェックが通過している
- [ ] `as any`, `as unknown` の増加がない
- [ ] テストカバレッジ基準を達成している（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 品質レポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを順次実行すること:

1. 参照資料の確認
2. 全テスト実行
3. 静的解析実行（ESLint/Prettier/TypeScript）
4. カバレッジ確認
5. 型安全性確認
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了を記録すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup --phase 9
```

## 次のPhase

Phase 10: 最終レビューゲート
