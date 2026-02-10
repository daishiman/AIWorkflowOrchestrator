# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 9                                    |
| 機能名 | auth-mode-store-fix                  |
| 作成日 | 2026-02-10                           |
| タスク | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

| ゲート項目 | 確認内容             | 基準          | 結果     |
| ---------- | -------------------- | ------------- | -------- |
| 機能検証   | 全自動テスト成功     | 全テストGreen | {{結果}} |
| 型チェック | TypeScriptエラーなし | エラーゼロ    | {{結果}} |
| コード品質 | ESLintチェック       | エラーゼロ    | {{結果}} |

## 参照資料

| 資料名         | パス                                             | 説明          |
| -------------- | ------------------------------------------------ | ------------- |
| タスク仕様書   | `task-ut-fix-store-hooks-infinite-loop.md`       | タスク定義    |
| リファクタ記録 | `outputs/phase-8-refactoring/refactoring-log.md` | Phase 8成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料      | パス                                  | 内容                  |
| ------------- | ------------------------------------- | --------------------- |
| コード品質    | `.claude/rules/02-code-quality.md`    | TypeScript型安全、TDD |
| Gitツーリング | `.claude/rules/07-git-and-tooling.md` | コミット前チェック    |

## 実行手順

### ステップ1: 型チェック

```bash
pnpm typecheck
```

**期待結果**: エラーなし

### ステップ2: Lintチェック

```bash
pnpm lint
```

**期待結果**: エラーなし（既存警告は許容）

### ステップ3: 全テスト実行

```bash
pnpm test -- --run
```

**期待結果**: 全テストGreen

### ステップ4: 関連テスト重点確認

```bash
# 修正対象コンポーネントの関連テスト
pnpm --filter @repo/desktop test -- --run SettingsView
pnpm --filter @repo/desktop test -- --run LLMSelectorPanel
pnpm --filter @repo/desktop test -- --run SkillSelector
pnpm --filter @repo/desktop test -- --run authModeSlice
```

**期待結果**: 関連テスト全てGreen

## 品質チェックリスト

| チェック項目                                     | 結果     |
| ------------------------------------------------ | -------- |
| `pnpm typecheck` がエラーなしで完了              | {{結果}} |
| `pnpm lint` がエラーなしで完了                   | {{結果}} |
| `pnpm test -- --run` が全テストGreen             | {{結果}} |
| useRefパターンでの修正が正しく動作している       | {{結果}} |
| 依存配列からの関数削除がESLint警告を出していない | {{結果}} |

## 成果物

| 成果物       | パス                                        | 説明         |
| ------------ | ------------------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9-quality/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] `pnpm test -- --run` が全テストGreen
- [ ] 関連テストが全てGreen
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 参照資料の確認（Phase 8成果物）
2. 型チェック実行
3. Lintチェック実行
4. 全テスト実行
5. 関連テスト重点確認
6. 品質レポート作成
7. 完了条件の検証

## タスク100%実行確認

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビューゲート
