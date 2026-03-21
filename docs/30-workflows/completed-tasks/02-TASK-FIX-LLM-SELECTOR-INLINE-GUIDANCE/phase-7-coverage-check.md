# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 7                                                 |
| 機能名     | LLMモデル選択インラインガイダンス追加             |
| タスクID   | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE             |
| 作成日     | 2026-03-20                                        |
| ステータス | 作成済み                                          |
| 依存       | [Phase 6 テスト拡充](./phase-6-test-expansion.md) |

## 目的

Phase 6 で追加したテストを含めた最終的なカバレッジを計測し、基準充足を確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

### Task 1: 最終カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/ChatView/__tests__/LLMGuidanceBanner.test.tsx \
  src/renderer/views/ChatView/__tests__/ChatView.guidance.test.tsx \
  src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.guidance.test.tsx \
  --coverage --reporter=verbose
```

### Task 2: 基準充足判定

| 指標              | 最低基準 | 推奨基準 | 計測結果 | 合否 |
| ----------------- | -------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -        | -    |
| Branch Coverage   | 60%      | 70%      | -        | -    |
| Function Coverage | 80%      | 90%      | -        | -    |

### Task 3: ゲート判定

| 判定 | 条件                           | 対応           |
| ---- | ------------------------------ | -------------- |
| PASS | 全指標が最低基準を満たしている | Phase 8 へ     |
| 未達 | いずれかの指標が基準未満       | Phase 6 へ戻る |

## 参照資料

| ファイル                                                                               | 用途                               |
| -------------------------------------------------------------------------------------- | ---------------------------------- |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-5-implementation.md` | 実装変更ファイルと分岐の洗い出し   |
| `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-6-test-expansion.md` | 追加テスト TC-6〜TC-8 と再計測条件 |
| `.claude/rules/02-code-quality.md`                                                     | カバレッジ基準                     |

## 実行手順

### Step 1: カバレッジ計測実行

### Step 2: 基準充足確認

Task 2 のテーブルに計測結果を記録する。

### Step 3: ゲート判定の記録

---

## カバレッジ計測結果（実施者が記入）

| ファイル              | Line  | Branch | Function |
| --------------------- | ----- | ------ | -------- |
| LLMGuidanceBanner.tsx | -     | -      | -        |
| ChatView/index.tsx    | -     | -      | -        |
| WorkspaceChatPanel    | -     | -      | -        |
| **総合判定**          | **-** | **-**  | **-**    |

---

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物         | パス                             |
| -------------- | -------------------------------- |
| カバレッジ記録 | 本ファイル「計測結果」セクション |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] 計測結果が本ファイルに記録されている

## 次Phase

- PASS の場合: [Phase 8: リファクタリング](./phase-8-refactoring.md)
- 未達の場合: [Phase 6: テスト拡充](./phase-6-test-expansion.md) へ戻る
