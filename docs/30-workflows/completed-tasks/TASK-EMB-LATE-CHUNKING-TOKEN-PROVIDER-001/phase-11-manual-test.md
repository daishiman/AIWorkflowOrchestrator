# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目                | 内容                                                 |
| ------------------- | ---------------------------------------------------- |
| Phase               | 11                                                   |
| タスクID            | TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001            |
| タスク名            | Late Chunking トークンレベル隠れ状態プロバイダー実装 |
| タスク種別          | NON_VISUAL                                           |
| implementation_mode | new                                                  |
| ステータス          | pending                                              |
| 作成日              | 2026-04-20                                           |
| 前Phase             | 10: 最終レビュー                                     |
| 次Phase             | 12: ドキュメント更新                                 |

---

## 目的

NON_VISUAL code task として、UI スクリーンショットではなくテスト実行ログと再現コマンド記録を primary evidence として残す。

---

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

---

## 実行タスク

### Step 1: 統合テストの実行

```bash
pnpm --filter @repo/shared test -- chunking-service.integration --reporter=verbose
```

### Step 2: `metadata.lateChunking.embeddingDimension` の確認

- lateChunking 有効時に 0 でないことを記録する
- フォールバック系の期待値も併記する

### Step 3: 全テストスイートの PASS 確認

```bash
pnpm --filter @repo/shared test
```

### Step 4: parity / link / artifact の walkthrough

- `SKILL.md` / family file / reference の参照整合
- `.claude` と `.agents` の mirror 関係
- `artifacts.json` と `outputs/artifacts.json` の parity

---

## 参照資料

| 参照資料                 | パス                                                                   | 内容                            |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------- |
| Phase 10 結果            | `outputs/phase-10/final-review-result.md`                              | 最終判定                        |
| workflow index           | `docs/30-workflows/TASK-EMB-LATE-CHUNKING-TOKEN-PROVIDER-001/index.md` | canonical artifacts と後続 task |
| Late Chunking 仕様       | `docs/30-workflows/UNASSIGNED-EMB-005-late-chunking/index.md`          | 背景仕様                        |
| Phase 2 設計             | `outputs/phase-2/design.md`                                            | 契約要約                        |
| Phase 5 実装             | `outputs/phase-5/implementation-notes.md`                              | 実装差分                        |
| Phase 6 テスト拡充       | `outputs/phase-6/test-expansion-result.md`                             | 追加検証                        |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`                                   | 分岐網羅                        |
| Phase 8 リファクタリング | `outputs/phase-8/refactoring-summary.md`                               | 整理結果                        |
| Phase 9 品質保証         | `outputs/phase-9/quality-gate-report.md`                               | quality gate                    |

## 成果物

| 成果物                   | パス                                        | 内容                  |
| ------------------------ | ------------------------------------------- | --------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | primary evidence      |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 補助記録              |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`     | blocker / note / info |

## 統合テスト連携【必須】

- `pnpm --filter @repo/shared test -- chunking-service.integration --reporter=verbose` の結果を primary evidence に記録する
- `pnpm --filter @repo/shared test` の結果を回帰確認として記録する

## 完了条件

- [ ] `manual-test-result.md` を primary evidence として定義している
- [ ] `manual-test-checklist.md` と `discovered-issues.md` が揃っている
- [ ] NON_VISUAL 代替証跡方針が明記されている
- [ ] コマンド / 前提条件 / 期待結果 / 実結果の記録形式が定義されている
