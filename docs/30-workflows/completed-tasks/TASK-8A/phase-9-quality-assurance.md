# Phase 9: 品質保証

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 9                  |
| Phase名    | 品質保証           |
| 前提Phase  | Phase 8            |
| 後続Phase  | Phase 10           |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

テストコードの品質（Lint、型安全性、テスト実行パフォーマンス）を検証し、品質基準への準拠を確認する。

## 背景

テストコード自体もプロダクションコードと同等の品質基準を満たす必要がある。ESLintルール違反、TypeScript型エラー、テスト実行時間の超過は品質上の問題となる。

## 実行タスク

### Task 1: ESLint検証

**目的**: テストファイルがESLintルールに準拠していることを検証する。

**実行手順**:

1. 以下のコマンドで対象テストファイルのLintを実行する：
   ```bash
   pnpm --filter @repo/desktop eslint \
     src/main/services/skill/__tests__/SkillScanner.test.ts \
     src/main/services/skill/__tests__/SkillImportManager.test.ts \
     src/main/services/skill/__tests__/SkillExecutor.test.ts \
     src/main/services/skill/__tests__/PermissionResolver.test.ts \
     src/renderer/store/slices/__tests__/skillSlice.test.ts
   ```
2. エラー・警告を記録する
3. エラーがある場合は修正する（`--fix` で自動修正可能なものは自動修正）
4. 修正後に再度Lintを実行し、エラー0件を確認する
5. 結果を `outputs/phase-9/quality-report.md` に記録する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

### Task 2: TypeScript型チェック

**目的**: テストファイルにTypeScript型エラーがないことを検証する。

**実行手順**:

1. 以下のコマンドで型チェックを実行する：
   ```bash
   pnpm --filter @repo/desktop tsc --noEmit
   ```
2. テストファイルに関連する型エラーを抽出する
3. 以下の観点を確認する：
   - `any` 型の使用がないこと
   - モック関数の戻り値型が正しいこと（`vi.mocked()` の型推論が正しいこと）
   - テストデータのオブジェクト型が実装の型定義と一致していること
4. 型エラーがある場合は修正する
5. 結果を `outputs/phase-9/quality-report.md` に追記する

### Task 3: テスト実行パフォーマンス検証

**目的**: テスト実行時間が受け入れ基準（10秒以内）を満たしていることを確認する。

**実行手順**:

1. 以下のコマンドでテストを実行し、実行時間を計測する：
   ```bash
   time pnpm --filter @repo/desktop vitest run \
     src/main/services/skill/__tests__/SkillScanner.test.ts \
     src/main/services/skill/__tests__/SkillImportManager.test.ts \
     src/main/services/skill/__tests__/SkillExecutor.test.ts \
     src/main/services/skill/__tests__/PermissionResolver.test.ts \
     src/renderer/store/slices/__tests__/skillSlice.test.ts
   ```
2. 各テストファイルの実行時間を記録する
3. 10秒を超えるテストファイルがある場合、原因を分析する：
   - タイマー系テスト（`vi.useFakeTimers`）の最適化
   - 非同期テストのawait漏れ
   - モック初期化のオーバーヘッド
4. 結果を `outputs/phase-9/quality-report.md` に追記する

### Task 4: テスト品質チェック

**目的**: テストコード自体の品質を定性的に検証する。

**実行手順**:

1. 以下の品質チェック項目を確認する：

| チェック項目                           | 基準                                 |
| -------------------------------------- | ------------------------------------ |
| テスト名が振る舞いを正確に表現している | `should + 動詞 + 条件` の形式        |
| 1つのitブロックに1つのアサーション概念 | 関連するexpectは許容                 |
| モックのリセットが漏れなく行われている | `beforeEach` で `vi.clearAllMocks()` |
| テストの独立性                         | 実行順序に依存しない                 |
| マジックナンバーが定数化されている     | テストデータの意味が明確             |
| エラーメッセージのアサーションが正確   | 部分一致ではなく完全一致を推奨       |

2. 問題があれば修正する
3. 結果を `outputs/phase-9/quality-report.md` に追記する

**期待される成果物**:

- `outputs/phase-9/quality-report.md`

## 参照資料

| 参照資料             | パス                                                | 説明            |
| -------------------- | --------------------------------------------------- | --------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                | 前Phase改善内容 |
| 品質要件             | aiworkflow-requirements `quality-requirements.md`   | 品質基準        |
| ESLint設定           | `apps/desktop/.eslintrc.*` または `eslint.config.*` | Lintルール      |
| TypeScript設定       | `apps/desktop/tsconfig.json`                        | 型チェック設定  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`         | Phase 5 成果物  |

## 成果物

| 成果物       | パス                                | 説明                                 |
| ------------ | ----------------------------------- | ------------------------------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | Lint・型チェック・パフォーマンス結果 |

## 統合テスト連携

- Lint・型チェック結果は単体テストと統合テストで共通のルールが適用されることを確認する
- テスト実行パフォーマンスは単体テスト単独と、統合テスト込みの両方で計測する

## 完了条件

- [ ] ESLintエラーが0件である
- [ ] TypeScript型エラーが0件である
- [ ] `any` 型の使用がテストファイル内にない
- [ ] テスト実行時間が10秒以内である
- [ ] テスト品質チェック項目をすべて確認している
- [ ] 品質レポートが `outputs/phase-9/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 9 \
  --artifacts "outputs/phase-9/quality-report.md:品質レポート"
```

## 依存関係

| 項目      | 内容     |
| --------- | -------- |
| 前提Phase | Phase 8  |
| 後続Phase | Phase 10 |

## 次のPhase

→ [phase-10-final-review.md](phase-10-final-review.md)
