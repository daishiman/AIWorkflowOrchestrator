# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 9                                |
| Phase名    | 品質保証                         |
| 前提Phase  | Phase 8                          |
| 後続Phase  | Phase 10                         |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

Lint・型チェック・全テスト実行により、コード品質が基準を満たしていることを確認する。

---

## 実行タスク

### タスク1: Lint検証

```bash
pnpm --filter @repo/desktop lint
```

- [ ] ESLintエラーが0件
- [ ] ESLint警告が許容範囲内

### タスク2: 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

- [ ] TypeScript型エラーが0件

### タスク3: 全テスト実行

```bash
pnpm --filter @repo/desktop test -- --run
```

- [ ] 全テストがPASS
- [ ] 既存テスト（agentSlice以外）にリグレッションなし

### テスト数記録（Phase実行時に記入）

| 項目                  | 値                                          |
| --------------------- | ------------------------------------------- |
| 全テスト数（desktop） | （実測値を記入）                            |
| PASSテスト数          | （実測値を記入）                            |
| FAILテスト数          | 0（期待値）                                 |
| SKIPテスト数          | （実測値を記入）                            |
| 実行コマンド          | `pnpm --filter @repo/desktop test -- --run` |
| 実行日時              | （タイムスタンプを記入）                    |

### タスク4: カバレッジ最終確認

```bash
pnpm --filter @repo/desktop test -- --run --coverage agentSlice.selectors authModeSlice.selectors llmSlice.selectors
```

---

## 品質ゲートチェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 関連テストにリグレッションなし

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] Line Coverage ≥ 80%
- [ ] Branch Coverage ≥ 60%
- [ ] Function Coverage ≥ 80%
- [ ] テスト数が実測値で記録されている（推定値不使用）

---

## 参照資料

| 参照資料         | パス                               | 内容               |
| ---------------- | ---------------------------------- | ------------------ |
| Phase 8成果物    | リファクタリング済みテストコード   | 品質改善済みコード |
| コード品質ルール | `.claude/rules/02-code-quality.md` | 品質基準           |

---

## 統合テスト連携

- 品質保証で全テスト結果を確認

---

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

---

## 完了条件

- [ ] ESLintエラー0件
- [ ] TypeScript型エラー0件
- [ ] 全テストPASS
- [ ] カバレッジ基準達成
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-10-final-review.md`
