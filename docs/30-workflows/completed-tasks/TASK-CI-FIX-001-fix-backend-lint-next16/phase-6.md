# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

Phase 5 の実装結果に対して追加検証を行い、lint 設定の信頼性を高める。

## 実行タスク

- 追加テスト実行: Phase 4 で定義した残りのテストケース（TC-002, TC-005, TC-006, TC-007）を実行
- CI シミュレーション: CI 環境と同等の条件でのテスト実行
- エッジケース検証: 設定の境界条件を検証

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装成果物   | `apps/backend/eslint.config.mjs`        | Phase 5成果物 |
| 実装成果物   | `apps/backend/package.json`             | Phase 5成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                    | 内容       |
| ---------- | ----------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト方針 |

## 実行手順

### ステップ1: TC-002 エラー検出テスト

意図的に lint エラーを含む一時ファイルを作成し、エラーが正しく検出されるか確認する。

```bash
# 1. lint エラーを含む一時ファイルを作成（unused variable）
echo 'const unusedVar = "test";' > apps/backend/src/temp-lint-test.ts

# 2. lint 実行（エラーが検出されるべき）
pnpm --filter @repo/backend lint
# → 期待: exit code 1、未使用変数エラーが報告される

# 3. 一時ファイルを削除
rm apps/backend/src/temp-lint-test.ts
```

### ステップ2: TC-005 Next.js 推奨ルール適用確認

```bash
# ESLint 設定ダンプで Next.js ルールの存在を確認
cd apps/backend && npx eslint --print-config src/app/page.tsx | grep -c "@next/next"
# → 期待: 1以上の値（Next.js ルールが含まれている）
```

### ステップ3: TC-006 キャッシュ動作確認

```bash
# 1. キャッシュクリア
rm -rf apps/backend/.next/cache/eslint/

# 2. 1回目の実行（キャッシュなし）
time pnpm --filter @repo/backend lint

# 3. 2回目の実行（キャッシュあり）
time pnpm --filter @repo/backend lint
# → 期待: 2回目が1回目より高速
```

### ステップ4: TC-007 ignores 設定の動作確認

```bash
# テストファイルが lint 対象外であることを確認
cd apps/backend && npx eslint --debug src/ 2>&1 | grep -i "ignored"
# → 期待: __tests__ ディレクトリのファイルが ignored として表示される
```

### ステップ5: CI シミュレーション

CI と同等の条件で lint を実行する:

```bash
# CI の lint ステップを再現
pnpm lint
# → 期待: ルートレベルの lint も正常動作する
```

## 統合テスト連携【必須】

| 検証項目           | 内容                                          |
| ------------------ | --------------------------------------------- |
| エラー検出機能     | lint エラーが正しく報告されるか               |
| Next.js ルール統合 | eslint-config-next のルールが適用されているか |
| CI 環境再現        | ローカルで CI と同等の lint 実行が成功するか  |

## 成果物

| 成果物           | パス                                         | 説明             |
| ---------------- | -------------------------------------------- | ---------------- |
| 追加検証レポート | `outputs/phase-6/additional-verification.md` | テスト結果の記録 |

## 完了条件

- [ ] TC-002: lint エラーが正しく検出される
- [ ] TC-005: Next.js 推奨ルールが適用されている
- [ ] TC-006: キャッシュが正常に動作する
- [ ] TC-007: ignores 設定が正しく機能する
- [ ] CI シミュレーションが成功する
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. TC-002 エラー検出テストの実施
3. TC-005 Next.js ルール確認の実施
4. TC-006 キャッシュ動作確認の実施
5. TC-007 ignores 設定確認の実施
6. CI シミュレーションの実施
7. 成果物の作成・配置
8. 完了条件の検証

## 次のPhase

Phase 7: テストカバレッジ確認
