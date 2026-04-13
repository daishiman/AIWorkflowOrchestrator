# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase番号  | 9                                 |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 機能名     | TASK-CRON-SEMANTIC-VALIDATION-001 |
| 前提Phase  | Phase 8: リファクタリング         |
| 後続Phase  | Phase 10: 最終レビューゲート      |
| ステータス | completed                         |
| 作成日     | 2026-04-12                        |

---

## 目的

意味論的バリデーション実装およびリファクタリング後のコードが、型安全性・Lint規約・パフォーマンス・バンドルサイズの全品質基準を満たすことを確認する。

---

## 実行タスク

### Task 9-1: 全ユニットテスト成功確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

全テストケースがグリーンであることを確認する。

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

型エラーが0件であることを確認する。

### Task 9-3: ESLint チェック

```bash
pnpm --filter @repo/desktop lint
```

Lint エラー・警告が0件であることを確認する。警告が残る場合は内容を記録し、許容可否を判断する。

### Task 9-4: パフォーマンス確認

`validateCronSemantics` の処理時間が 100ms 未満であることを確認する。

確認方法（テスト内ベンチマーク）:

```typescript
// パフォーマンス確認用スニペット（テストファイルに一時追加して計測）
const start = performance.now();
for (let i = 0; i < 1000; i++) {
  validateCronSemantics("0 9 31 2 *");
}
const elapsed = performance.now() - start;
console.log(`1000回実行: ${elapsed}ms (1回あたり: ${elapsed / 1000}ms)`);
```

目標: 1回あたり 0.1ms 未満（1000回で 100ms 未満）

### Task 9-5: バンドルサイズ確認

外部依存を追加していないため、バンドルサイズへの影響がないことを確認する。

```bash
pnpm --filter @repo/desktop build
# ビルド後のバンドルサイズレポートを確認
```

確認観点:

- 外部依存の追加がないこと
- 既存バンドルサイズが増加していないこと
- Tree-shaking に影響する新規 import がないこと

### Task 9-6: 関連コンポーネントへの影響確認

以下のコンポーネントへの破壊的変更がないか確認する。

| コンポーネント          | 確認内容                         |
| ----------------------- | -------------------------------- |
| `ScheduleDialog`        | バリデーション呼び出し方法の変化 |
| `ConversationRoundStep` | エラー表示の連動                 |

---

## 参照資料

| 参照資料               | パス                                                                          | 説明             |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------- |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`                                   | Phase 5 成果物   |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                                            | Phase 5 成果物   |
| 実装判断記録           | `outputs/phase-5/library-install-record.md`                                   | Phase 5 成果物   |
| リファクタリングサマリ | `outputs/phase-8/refactoring-summary.md`                                      | Phase 8 成果物   |
| 差分記録               | `outputs/phase-8/before-after-diff.md`                                        | Phase 8 成果物   |
| ConversationRoundStep  | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 既存 UI consumer |

- Phase 7 成果物: `outputs/phase-7/coverage-report.md`
- Phase 8 成果物: `outputs/phase-8/refactoring-summary.md`
- GitHub Issue: #2082

---

## 実行手順

### Step 1: テスト実行

```bash
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

### Step 2: 型チェック

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

### Step 3: Lint

```bash
pnpm --filter @repo/desktop lint
```

### Step 4: パフォーマンス計測

テストファイルに一時的なベンチマークを追加し、処理時間を計測後に削除する。

### Step 5: バンドルサイズ確認

```bash
pnpm --filter @repo/desktop build
```

### Step 6: 品質ゲートチェック

全項目を確認し、`outputs/phase-9/quality-gate-report.md` に結果を記録する。

---

## 統合テスト連携【必須】

- 品質保証の結果は Phase 10（最終レビューゲート）の受け入れ基準判定に直接連携する。
- 型チェック・Lint のエラーが存在する場合、Phase 10 は CRITICAL 判定となり Phase 9 に戻る。
- パフォーマンス問題が検出された場合、Phase 8 に差し戻してリファクタリングを再実施する。

---

## 成果物

| ファイル                                   | 説明                                       |
| ------------------------------------------ | ------------------------------------------ |
| `outputs/phase-9/quality-gate-report.md`   | 品質ゲートチェックリスト・全項目の判定結果 |
| `outputs/phase-9/performance-benchmark.md` | パフォーマンス計測結果                     |
| `outputs/phase-9/bundle-size-report.md`    | バンドルサイズ確認結果（外部依存追加なし） |

---

## 品質ゲートチェックリスト

| 項目                   | 基準           | 判定        |
| ---------------------- | -------------- | ----------- |
| 全ユニットテスト       | 全件 PASS      | PASS / FAIL |
| TypeScript 型チェック  | エラー 0件     | PASS / FAIL |
| ESLint                 | エラー 0件     | PASS / FAIL |
| パフォーマンス         | 1回 < 100ms    | PASS / FAIL |
| バンドルサイズ増加     | 許容範囲内     | PASS / FAIL |
| 関連コンポーネント影響 | 破壊的変更なし | PASS / FAIL |

---

## 完了条件

- [ ] 全ユニットテストが PASS
- [ ] TypeScript 型チェックエラーが 0件
- [ ] ESLint エラーが 0件
- [ ] バリデーション処理時間が 100ms 未満
- [ ] バンドルサイズ確認が完了（増加量を記録済み）
- [ ] 関連コンポーネントへの破壊的変更がないことを確認済み
- [ ] 品質ゲートレポートが `outputs/phase-9/quality-gate-report.md` に保存済み

---

## サブタスク管理

| サブタスクID | 内容                           | ステータス |
| ------------ | ------------------------------ | ---------- |
| 9-1          | 全ユニットテスト成功確認       | pending    |
| 9-2          | TypeScript 型チェック          | pending    |
| 9-3          | ESLint チェック                | pending    |
| 9-4          | パフォーマンス確認             | pending    |
| 9-5          | バンドルサイズ確認             | pending    |
| 9-6          | 関連コンポーネントへの影響確認 | pending    |

---

## タスク100%実行確認【必須】

Phase 9 完了前に以下を全て確認すること。

- [ ] 全サブタスク（9-1〜9-6）が完了またはスキップ理由が記録されている
- [ ] 品質ゲートチェックリストの全項目が PASS
- [ ] 成果物ファイルが全て `outputs/phase-9/` に保存されている
- [ ] Phase 10 への引き継ぎ情報（品質ゲート結果・残課題）が記録されている

---

## 次のPhase

**Phase 10: 最終レビューゲート**

- 品質保証の全結果をもとに、受け入れ基準 AC-1〜AC-5 の最終判定を行う。
