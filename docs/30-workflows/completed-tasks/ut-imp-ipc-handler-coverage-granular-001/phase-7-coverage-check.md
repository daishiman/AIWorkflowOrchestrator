# Phase 7: テストカバレッジ確認 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目               | 値                                                                          |
| ------------------ | --------------------------------------------------------------------------- |
| タスクID           | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                                    |
| Phase              | 7（テストカバレッジ確認）                                                   |
| 機能名             | IPCハンドラ単位カバレッジ測定基盤構築                                       |
| 作成日             | 2026-02-28                                                                  |
| Issue              | #854                                                                        |
| 前提Phase          | phase-6-test-expansion.md                                                   |
| 目的               | Phase 6で拡充したテスト結果を検証しカバレッジ基準を満たすことを確認する     |
| 成果物ディレクトリ | docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/outputs/phase-7/ |

## 目的

Phase 6 で拡充したテストの結果を検証し、`coverage-by-handler.ts` のカバレッジが基準を満たすことを最終確認する。カバレッジが基準未達の場合は Phase 6 へ差し戻す。

本タスクは「ハンドラ単位カバレッジ測定基盤」を構築するタスクであるため、Phase 7 自体がこの基盤の検証を兼ねる。Phase 5 で文書化した判定ルール（Rule-1〜Rule-4）の適用も検証する。

## 実行タスク

- カバレッジ再測定: `coverage-by-handler.ts` の最終カバレッジを取得して記録する
- 基準照合とゲート判定: 最低基準/推奨基準に照らしてPASS/FAILを確定する
- ハンドラ単位レポート検証: `--target` 実行を含むレポート整合性を確認する

### Task 7-1: カバレッジ再測定

`coverage-by-handler.ts` のカバレッジを再測定し、最終的な数値を記録する。

**実行コマンド:**

```bash
cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'
```

**記録対象:**

- Line Coverage（%）
- Branch Coverage（%）
- Function Coverage（%）
- テストケース総数
- テスト実行時間

### Task 7-2: カバレッジ基準との照合

Phase 6 で計測したカバレッジ数値をカバレッジ基準と照合する。

**照合テーブル:**

| 指標              | 最低基準 | 推奨基準 | 実測値         | 判定 |
| ----------------- | -------- | -------- | -------------- | ---- |
| Line Coverage     | 80%      | 90%      | （計測時記入） | —    |
| Branch Coverage   | 60%      | 70%      | （計測時記入） | —    |
| Function Coverage | 80%      | 90%      | （計測時記入） | —    |

### Task 7-3: ゲート判定

カバレッジ基準に基づいてゲート判定を行う。

| 判定結果         | 条件                                             | 次アクション             |
| ---------------- | ------------------------------------------------ | ------------------------ |
| PASS（推奨達成） | 全指標が推奨基準を満たす                         | Phase 8 へ進む           |
| PASS（最低達成） | 全指標が最低基準を満たす（推奨未達の指標がある） | Phase 8 へ進む（注記付） |
| FAIL             | いずれかの指標が最低基準を満たさない             | Phase 6 へ差し戻す       |

**差し戻し時の対応:**

- 未達指標と未カバー箇所を `outputs/phase-7/coverage-report.md` に記録する
- Phase 6 で追加すべきテストケースの方針を記載する
- Phase 6 → Phase 7 のサイクルを繰り返す

## 参照資料

### タスク固有参照

| 参照資料           | パス                                                                                   | 内容                             |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義   | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-1-requirements.md`   | FR/NFR/受け入れ基準              |
| Phase 5 実装       | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-5-implementation.md` | 実装サマリー・判定ルール         |
| Phase 6 テスト拡充 | `docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001/phase-6-test-expansion.md` | テスト拡充結果                   |
| テストコード       | `apps/desktop/scripts/coverage-by-handler.test.ts`                                     | Phase 4/6 で作成・拡充したテスト |
| 集計スクリプト     | `apps/desktop/scripts/coverage-by-handler.ts`                                          | Phase 5 で作成した実装           |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                           | ハンドラ単位レポートの対象       |
| カバレッジ基準     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | カバレッジ閾値の定義             |
| P41 記録           | `.claude/rules/06-known-pitfalls.md#P41`                                               | v8 インライン関数カウント問題    |
| P40 記録           | `.claude/rules/06-known-pitfalls.md#P40`                                               | テスト実行ディレクトリ依存       |

## ハンドラ単位カバレッジレポート

本タスクの成果物として、`coverage-by-handler.ts` を使ったハンドラ単位レポートの生成を検証する。

### 検証手順

1. `skillHandlers.ts` のテストを実行しカバレッジ JSON を生成する
2. `coverage-by-handler.ts` でハンドラ単位レポートを生成する
3. レポートの正確性を確認する

**実行コマンド:**

```bash
# Step 1: カバレッジJSON生成
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage --coverage.reporter=json

# Step 2: ハンドラ単位レポート生成
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts

# Step 3: 修正対象ハンドラの判定
npx tsx scripts/coverage-by-handler.ts --file src/main/ipc/skillHandlers.ts --target skill:remove
```

### レポート検証項目

| 検証項目                               | 期待結果                                              |
| -------------------------------------- | ----------------------------------------------------- |
| 全ハンドラが検出される                 | 23個のハンドラがリストされる                          |
| `skill:remove` のカバレッジが高い      | Line Coverage 90%以上（テストが充実しているため）     |
| 未テストハンドラのカバレッジが低い     | Line Coverage 10%以下                                 |
| Markdown テーブルが正しい              | ヘッダ・行・セパレータが正しくフォーマットされている  |
| JSON 出力が正しい                      | `handlers`, `summary` キーが存在し、値が正確          |
| Phase 7 判定（Rule-1〜Rule-4）が正しい | `skill:remove` に対して PASS 判定が出力される         |
| P41 影響関数が注記される               | `inlineFunctions` フィールドに `getAllowedWindows` 等 |

## 統合テスト連携

### ゲート判定テーブル

| ゲート項目                     | 基準                                      | 判定方法                            |
| ------------------------------ | ----------------------------------------- | ----------------------------------- |
| 集計スクリプトのカバレッジ基準 | Lines 80%+, Branches 60%+, Functions 80%+ | `vitest --coverage` の出力値        |
| ハンドラ検出の正確性           | 23ハンドラ全検出                          | `extractHandlers` の戻り値の長さ    |
| レポート出力の正確性           | Markdown/JSON 両形式で有効な出力          | 出力文字列のパース検証              |
| Phase 7 判定ルールの動作       | Rule-1〜Rule-4 が正しく適用される         | `--target` オプション付きの実行結果 |

## 成果物

| 成果物             | パス                                 | 説明                               |
| ------------------ | ------------------------------------ | ---------------------------------- |
| カバレッジ検証結果 | `outputs/phase-7/coverage-report.md` | 最終カバレッジ数値とゲート判定結果 |

## 完了条件

- [ ] `coverage-by-handler.ts` の全カバレッジ指標が最低基準を満たしている（Lines 80%+, Branches 60%+, Functions 80%+）
- [ ] ハンドラ単位カバレッジレポートが正しく生成される（23ハンドラ全検出）
- [ ] `skill:remove` ハンドラに対して PASS 判定が出力される
- [ ] Phase 7 判定ルール（Rule-1〜Rule-4）が正しく動作する
- [ ] P41 影響関数が `inlineFunctions` に正しく記録される
- [ ] カバレッジ検証結果が成果物ディレクトリに作成されている
- [ ] カバレッジ未達の場合は Phase 6 への差し戻し判断が記録されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（Task 7-1〜7-3）を100%実行完了
- [ ] ハンドラ単位カバレッジレポート検証を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了状態を明記している

## 次のPhase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)

ただし、カバレッジが最低基準を満たさない場合:
→ [Phase 6: テスト拡充](./phase-6-test-expansion.md) へ差し戻す
