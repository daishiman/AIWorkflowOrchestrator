# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 7                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

Phase 4〜6 で作成したテスト群が、`submitUserInput()` 関連の実装コードに対して十分なカバレッジを達成しているか測定・確認する。基準を下回る場合は未カバーパスを特定し、Phase 6 への差し戻しを判定する。

## 実行タスク

### T-7-1: カバレッジ測定

`vitest run --coverage` で `submitUserInput` 関連メソッドのカバレッジを測定する。

**対象メソッド:**

| メソッド                              | ファイル                        |
| ------------------------------------- | ------------------------------- |
| `submitUserInput()`                   | `SkillCreatorWorkflowEngine.ts` |
| `applyPhaseTransition()`              | `SkillCreatorWorkflowEngine.ts` |
| `applyPlanReviewTransition()`         | `SkillCreatorWorkflowEngine.ts` |
| `applyVerificationReviewTransition()` | `SkillCreatorWorkflowEngine.ts` |

### T-7-2: カバレッジ基準との照合

測定結果を以下の基準テーブルと照合する。

#### カバレッジ基準テーブル

| メトリクス | 基準値 | 説明                                            |
| ---------- | ------ | ----------------------------------------------- |
| Line       | 80%+   | 実装行のうち 80% 以上が実行されている           |
| Branch     | 60%+   | switch-case 分岐の 60% 以上が実行されている     |
| Function   | 80%+   | 対象メソッドの 80% 以上がテストから呼ばれている |

#### 記録テンプレート

| メトリクス | 基準値 | 実測値 | 判定 |
| ---------- | ------ | ------ | ---- |
| Line       | 80%+   | —      | —    |
| Branch     | 60%+   | —      | —    |
| Function   | 80%+   | —      | —    |

> 実測値は Phase 7 実行時に記入する。

### T-7-3: 未カバーパスの特定と差し戻し判定

カバレッジ基準を下回る場合:

1. **未カバーパスを特定**: coverage レポートから未実行行・未実行分岐を列挙
2. **差し戻し判定**: 以下のフローに従う

```
カバレッジ基準を満たす？
  ├── YES → Phase 8 へ進む
  └── NO
        ├── 未カバーパスがテスト追加で解消可能？
        │     ├── YES → Phase 6 へ差し戻し（テスト拡充）
        │     └── NO → Phase 5 へ差し戻し（実装見直し）
        └── 判定結果を本ドキュメントに記録
```

## 検証コマンド

```bash
# カバレッジ付きテスト実行（engine テスト）
pnpm exec vitest run --coverage apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts

# カバレッジ付きテスト実行（IPC handler テスト含む全体）
pnpm exec vitest run --coverage apps/desktop/src/main/services/runtime/__tests__/ apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.runtime.test.ts
```

> カバレッジレポートは `coverage/` ディレクトリに出力される。HTML レポートで視覚的に未カバー行を確認できる。

## 参照資料

| 参照資料             | パス                                | 内容                 |
| -------------------- | ----------------------------------- | -------------------- |
| Phase 4 テスト計画書 | `outputs/phase-4/test-plan.md`      | テストケース一覧     |
| Phase 5 実装計画書   | `outputs/phase-5/implementation.md` | 実装メソッド一覧     |
| Phase 6 テスト拡充   | `outputs/phase-6/test-expansion.md` | 追加テストケース一覧 |

## 成果物

| 成果物             | パス                                | 説明                            |
| ------------------ | ----------------------------------- | ------------------------------- |
| カバレッジ確認     | `outputs/phase-7/coverage-check.md` | 本ドキュメント（実測値を追記）  |
| カバレッジレポート | `coverage/` ディレクトリ            | vitest が出力する HTML レポート |

## 完了条件

- [ ] T-7-1: `vitest run --coverage` でカバレッジ測定が完了している
- [ ] T-7-2: カバレッジ基準テーブルに実測値が記入されている
- [ ] T-7-3: 基準を下回る場合、未カバーパスが特定され差し戻し判定が記録されている
- [ ] Line 80%+, Branch 60%+, Function 80%+ を全て満たしている（または差し戻し判定済み）
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 8: リファクタリング
