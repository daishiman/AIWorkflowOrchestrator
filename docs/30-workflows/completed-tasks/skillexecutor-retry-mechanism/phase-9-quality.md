# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 9                              |
| Phase名   | 品質保証                       |
| カテゴリ  | 品質                           |
| 機能名    | skillexecutor-retry-mechanism  |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 8（リファクタリング）    |
| 後続Phase | Phase 10（最終レビューゲート） |

## 目的

TypeScript strict、ESLint、Prettierの品質基準を満たしていることを確認する。

---

## 実行タスク

### Task 1: TypeScript strictモード確認

**目的**: 変更ファイルがTypeScript strictモードでエラーなしであることを確認する。

**手順**:

1. 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/shared typecheck
   ```
2. エラーがある場合は修正する
3. 特にany型の使用がないことを確認する
4. RetryConfig、RetryableErrorResult等の新規型が正しくexportされていることを確認する

**期待される成果物**:

- 型チェック結果記録（`outputs/phase-9/typecheck-results.md`）

### Task 2: ESLint確認

**目的**: ESLintルールに準拠していることを確認する。

**手順**:

1. ESLintを実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/shared lint
   ```
2. エラー・警告がある場合は修正する
3. 自動修正可能なものは`--fix`で修正する

**期待される成果物**:

- ESLint結果記録（`outputs/phase-9/eslint-results.md`）

### Task 3: Prettierフォーマット確認

**目的**: コードフォーマットが統一されていることを確認する。

**手順**:

1. Prettierを実行する:
   ```bash
   pnpm prettier --check "apps/desktop/src/main/services/skill/SkillExecutor.ts"
   pnpm prettier --check "packages/shared/src/types/skill.ts"
   pnpm prettier --check "apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts"
   ```
2. フォーマットが崩れている場合は`--write`で修正する

**期待される成果物**:

- フォーマット確認記録（`outputs/phase-9/prettier-results.md`）

### Task 4: 全テスト最終実行

**目的**: 品質修正後も全テストがパスすることを確認する。

**手順**:

1. 全テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/
   ```
2. 全テストGreenを確認する

**期待される成果物**:

- テスト最終結果（`outputs/phase-9/final-test-results.md`）

---

## 参照資料

| 参照資料       | パス                                                                         | 用途         |
| -------------- | ---------------------------------------------------------------------------- | ------------ |
| SkillExecutor  | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                      | 対象ファイル |
| skill型定義    | `packages/shared/src/types/skill.ts`                                         | 対象ファイル |
| リトライテスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | テスト確認   |

---

## 統合テスト連携

TypeScript strict + ESLint + 既存テストとの整合性確認:

- strict型チェックで新規型と既存型の整合性を検証
- ESLintルールで一貫したコードスタイルを確認

---

## 成果物

| 成果物           | パス                                    | 種別     |
| ---------------- | --------------------------------------- | -------- |
| 型チェック結果   | `outputs/phase-9/typecheck-results.md`  | document |
| ESLint結果       | `outputs/phase-9/eslint-results.md`     | document |
| フォーマット確認 | `outputs/phase-9/prettier-results.md`   | document |
| テスト最終結果   | `outputs/phase-9/final-test-results.md` | document |

---

## 品質ゲートチェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功（SkillExecutor.integration.test.ts）
- [ ] E2Eテスト成功（該当する場合）

### コード品質

- [ ] Lintエラーなし（ESLint）
- [ ] 型エラーなし（TypeScript strict）
- [ ] コードフォーマット適用済み（Prettier）

### テスト網羅性

- [ ] 総合カバレッジ指数180%+達成（Line + Branch + Function の合計）

### セキュリティ

- [ ] 脆弱性スキャン完了（リトライログにsensitive情報が含まれないこと確認）
- [ ] 重大な脆弱性なし

---

## 完了条件

- [ ] TypeScript strictモードでエラーなし（@repo/desktop, @repo/shared）
- [ ] ESLintエラーなし
- [ ] Prettierフォーマット済み
- [ ] 全テストGreen（ユニット + 統合）
- [ ] 総合カバレッジ指数180%+達成
- [ ] セキュリティ観点の確認完了
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 9 \
  --artifacts "outputs/phase-9/final-test-results.md:品質保証テスト結果"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 9
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
