# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase番号  | 9                                                    |
| 機能名     | LLMモデル選択インラインガイダンス追加                |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE                |
| 作成日     | 2026-03-20                                           |
| ステータス | 作成済み                                             |
| 依存       | [Phase 8 リファクタリング](./phase-8-refactoring.md) |

## 目的

Lint・型チェック・全テストを実行し、コードが品質基準を満たしていることを確認する。Phase 10 最終レビューに進むための前提条件を満たす。

## 実行タスク

### Task 1: ESLint 実行

```bash
# 変更ファイルの Lint チェック
pnpm --filter @repo/desktop lint

# 自動修正（修正可能な問題のみ）
pnpm --filter @repo/desktop lint --fix
```

**確認事項**: エラーが 0 件であること（警告は許容するが記録する）。

### Task 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**確認事項**:

- エラーが 0 件であること
- `any` 型・`@ts-ignore` の新規追加がないこと
- Props 型衝突（P46）が発生していないこと

### Task 3: 全テスト実行

```bash
# 変更ファイル関連のテスト
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/
cd apps/desktop && pnpm vitest run src/renderer/store/slices/llmSlice.test.ts 2>/dev/null || true

# 関連するストアテストも実行
cd apps/desktop && pnpm vitest run src/renderer/store/
```

**確認事項**: 全テストが PASS すること（新規テスト・既存テスト共）。

### Task 4: Prettier フォーマット確認

```bash
# フォーマット確認
pnpm --filter @repo/desktop format:check

# 必要に応じてフォーマット実行
pnpm --filter @repo/desktop format
```

### Task 5: 品質検証結果記録

---

## 品質検証結果（実施者が記入）

| チェック項目        | 結果  | 備考  |
| ------------------- | ----- | ----- |
| ESLint エラー数     | -     | -     |
| TypeScript エラー数 | -     | -     |
| テスト PASS 率      | -     | -     |
| Prettier チェック   | -     | -     |
| **総合判定**        | **-** | **-** |

---

## 参照資料

| ファイル                              | 用途                         |
| ------------------------------------- | ---------------------------- |
| `.claude/rules/02-code-quality.md`    | コーディング規約・テスト基準 |
| `.claude/rules/07-git-and-tooling.md` | コミット前チェックリスト     |

## 実行手順

### Step 1: Lint 実行（Task 1）

### Step 2: 型チェック（Task 2）

### Step 3: テスト実行（Task 3）

### Step 4: フォーマット確認（Task 4）

### Step 5: 結果記録（Task 5）

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物       | パス                                 |
| ------------ | ------------------------------------ |
| 品質検証記録 | 本ファイル「品質検証結果」セクション |

## 完了条件

- [ ] ESLint エラーが 0 件
- [ ] TypeScript 型チェックエラーが 0 件
- [ ] 全テストが PASS
- [ ] Prettier フォーマットが適用されている
- [ ] 品質検証結果が記録されている

## 次Phase

[Phase 10: 最終レビュー](./phase-10-final-review.md)
