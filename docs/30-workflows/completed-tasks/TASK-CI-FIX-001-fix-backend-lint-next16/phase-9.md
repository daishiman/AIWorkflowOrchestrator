# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 9                                       |
| 機能名 | TASK-CI-FIX-001-fix-backend-lint-next16 |
| 作成日 | 2026-01-29                              |

## 目的

全品質ゲートをクリアし、実装の品質を保証する。

## 実行タスク

- 品質ゲート確認: lint、typecheck、test の全項目をクリア
- コード品質確認: ESLint 設定の品質を検証
- CI 品質確認: CI ワークフロー全体の成功を確認

## 参照資料

| 資料名                   | パス                                    | 説明          |
| ------------------------ | --------------------------------------- | ------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | Phase 8成果物 |
| カバレッジレポート       | `outputs/phase-7/coverage-report.md`    | Phase 7成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                       | 内容             |
| -------------- | -------------------------------------------------------------------------- | ---------------- |
| コード品質仕様 | `.claude/skills/aiworkflow-requirements/references/devops-code-quality.md` | 品質ゲート基準   |
| CI/CDインフラ  | `.claude/skills/aiworkflow-requirements/references/devops-ci-cd.md`        | CI品質ゲート定義 |

## 実行手順

### ステップ1: 品質ゲート全項目確認

以下の全品質ゲートをクリアすることを確認する:

```bash
# 1. Lint（Backend）
pnpm --filter @repo/backend lint

# 2. Lint（ルート）
pnpm lint

# 3. TypeScript 型チェック
pnpm typecheck

# 4. テスト実行
pnpm --filter @repo/backend test:run

# 5. ビルド確認
pnpm --filter @repo/backend build
```

**品質ゲートチェックリスト**:

| ゲート       | コマンド                               | 判定基準      |
| ------------ | -------------------------------------- | ------------- |
| Backend lint | `pnpm --filter @repo/backend lint`     | exit code 0   |
| ルート lint  | `pnpm lint`                            | exit code 0   |
| TypeScript   | `pnpm typecheck`                       | 型エラーなし  |
| テスト       | `pnpm --filter @repo/backend test:run` | 全テスト PASS |
| ビルド       | `pnpm --filter @repo/backend build`    | ビルド成功    |

### ステップ2: コード品質確認

| 品質項目                 | 確認方法               | 判定基準             |
| ------------------------ | ---------------------- | -------------------- |
| ESLint 設定の可読性      | 設定ファイルの目視確認 | コメントが適切       |
| 不要な依存パッケージなし | package.json 確認      | 未使用パッケージなし |
| 設定の最小性             | 設定が必要最小限か確認 | 冗長な設定なし       |

### ステップ3: CI 品質確認

CI ワークフロー（`.github/workflows/ci.yml`）で定義された以下のジョブが全て成功する見込みがあることを確認:

| CI ジョブ    | 確認内容                           |
| ------------ | ---------------------------------- |
| lint         | `pnpm lint` が正常終了する         |
| typecheck    | `pnpm typecheck` が正常終了する    |
| test-shared  | shared パッケージテストに影響なし  |
| test-desktop | desktop パッケージテストに影響なし |
| security     | セキュリティ監査に影響なし         |
| build        | ビルドが正常完了する               |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点           | 適用判断                   | 仕様参照先                                        |
| -------------- | -------------------------- | ------------------------------------------------- |
| コード品質     | ESLint設定の品質確認で適用 | `aiworkflow-requirements: devops-code-quality.md` |
| CI/CDインフラ  | CI全ジョブ確認で適用       | `aiworkflow-requirements: devops-ci-cd.md`        |
| セキュリティ   | 設定変更のみのため不要     | -                                                 |
| パフォーマンス | キャッシュ設定の妥当性確認 | -                                                 |

## 統合テスト連携【必須】

| 検証項目     | 内容                                      |
| ------------ | ----------------------------------------- |
| 全品質ゲート | lint/typecheck/test/build が全て成功する  |
| CI 整合性    | CI ワークフローの全ジョブが成功する見込み |

## 成果物

| 成果物           | パス                                | 説明           |
| ---------------- | ----------------------------------- | -------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

## 完了条件

- [ ] Backend lint が正常終了する
- [ ] ルート lint が正常終了する
- [ ] TypeScript 型チェックがエラーなし
- [ ] テストが全て PASS する
- [ ] ビルドが成功する
- [ ] コード品質が基準を満たしている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 品質ゲート全項目確認の実施
3. コード品質確認の実施
4. CI 品質確認の実施
5. 成果物の作成・配置
6. 完了条件の検証

## 次のPhase

Phase 10: 最終レビューゲート
