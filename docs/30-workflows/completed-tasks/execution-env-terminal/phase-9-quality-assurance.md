# Phase 9: 品質保証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| タスクID | UT-EXECUTION-ENV-TERMINAL-001 |
| 機能名   | execution-env-terminal        |
| 作成日   | 2026-03-23                    |

## 目的

Lint・型チェック・全テスト実行による品質保証を行う。

## 実行タスク

### Task 1: ESLint

```bash
cd apps/desktop && pnpm lint
```

- 新規・変更ファイルに lint エラーがないこと
- 未使用 import がないこと

### Task 2: TypeScript 型チェック

```bash
pnpm typecheck
```

- `assertNoSilentFallback` の戻り値型が `SelectedLLMConfig` であること
- `LLMConfigNotSelectedError` が正しくエクスポートされていること
- `ExecutionEnvironmentProps.handoffGuidance` の型が `HandoffGuidance | null | undefined` であること
- `any` 型の使用がないこと

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run
```

- 全テスト PASS
- 回帰テスト失敗なし

### Task 4: Prettier フォーマット確認

```bash
cd apps/desktop && pnpm format:check
```

## 統合テスト連携

| 判定項目      | 基準     | 結果       |
| ------------- | -------- | ---------- |
| ESLint        | エラー 0 | {{RESULT}} |
| TypeCheck     | エラー 0 | {{RESULT}} |
| テスト全 PASS | 100%     | {{RESULT}} |
| Prettier      | 差分 0   | {{RESULT}} |

## 成果物

| 成果物           | パス                                                                         | 説明         |
| ---------------- | ---------------------------------------------------------------------------- | ------------ |
| 品質保証レポート | `docs/30-workflows/execution-env-terminal/outputs/phase-9/quality-report.md` | 検証結果記録 |

## 完了条件

- [ ] ESLint エラーが 0 件
- [ ] TypeScript 型チェックエラーが 0 件
- [ ] 全テストが PASS
- [ ] Prettier フォーマット差分が 0
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 10: 最終レビュー
