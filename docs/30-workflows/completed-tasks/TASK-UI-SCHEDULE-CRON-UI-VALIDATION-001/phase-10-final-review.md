# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 10                                      |
| タスクID   | TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001 |
| タスク名   | VisualCronPicker UIバリデーション整理   |
| 前提Phase  | Phase 9（品質保証完了）                 |
| 後続Phase  | Phase 11                                |
| 作成日     | 2026-04-13                              |
| ステータス | 完了                                    |

## 目的

AC-1〜AC-10 の全件充足を最終確認し、MAJOR / MINOR 問題を判定したうえで
Phase 11（手動テスト）へ進めるかどうかのマージ可否を判断する。

## 実行タスク

- AC-1〜AC-10 の最終照合を行う
- コードレビュー観点のチェック（後方互換性・バリデーションロジック正確性）を行う
- PASS / MINOR / MAJOR を判定する
- 最終レビュー結果と AC 検証結果を記録する

## 統合テスト連携

Phase 9 の品質ゲート結果と AC 照合結果を突き合わせ、回帰と未達がないことを確認する。
Phase 11 への引き渡し条件として、MAJOR ブロッカーが 0 件であることを必須とする。

## AC 検証テーブル

| AC番号 | 基準                                                                      | 判定   | 証跡                                                                                     |
| ------ | ------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| AC-1   | weekly + 空曜日でエラーメッセージが表示される                             | ✓ PASS | `pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"` でテスト PASS |
| AC-2   | `onValidationChange(false)` が weekly + 空曜日で呼び出される              | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-3   | `onValidationChange(true)` が weekly + 曜日選択済みで呼び出される         | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-4   | monthly + `dayOfMonth < 1` でエラーメッセージが表示される                 | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-5   | monthly + `dayOfMonth > 31` でエラーメッセージが表示される                | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-6   | `onValidationChange(false)` が monthly + 無効日付で呼び出される           | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-7   | `onValidationChange(true)` が monthly + 有効な日付（1〜31）で呼び出される | ✓ PASS | コールバック呼び出しテストが PASS                                                        |
| AC-8   | `onValidationChange` が未指定の場合でもエラーが発生しない                 | ✓ PASS | コールバック未指定テストが PASS（クラッシュなし）                                        |
| AC-9   | 全テスト PASS                                                             | ✓ PASS | `pnpm --filter @repo/desktop test` 全件 PASS                                             |
| AC-10  | 型チェック PASS                                                           | ✓ PASS | `pnpm --filter @repo/desktop typecheck` エラーなし                                       |

## 実行手順

### Step 1: AC 検証コマンド実行

```bash
# AC-1〜AC-8 対応テスト
pnpm --filter @repo/desktop test -- --testPathPattern="VisualCronPicker"

# AC-9: 全テスト
pnpm --filter @repo/desktop test

# AC-10: 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint（補足確認）
pnpm --filter @repo/desktop lint
```

### Step 2: MAJOR / MINOR 判定フロー

```
AC-1〜AC-10 の全件確認
        |
        v
   MAJOR 条件に該当するか？
   ├── YES → Phase 2 以前に差し戻す（以下 MAJOR 判定基準参照）
   └── NO
        |
        v
   MINOR 条件に該当するか？
   ├── YES → その場で修正し再確認（以下 MINOR 判定基準参照）
   └── NO
        |
        v
   PASS → Phase 11 開始条件確認へ
```

### Step 3: MAJOR 判定（Phase 2 以前に差し戻す）

以下のいずれかに該当する場合、Phase 11（手動テスト）への進行をブロックする。

| MAJOR ID | 判定基準                                                                            | 差し戻し先            |
| -------- | ----------------------------------------------------------------------------------- | --------------------- |
| MAJ-01   | バリデーションロジックが要件と一致しない（AC-1〜AC-8 のいずれかが未達）             | Phase 2〜5 に差し戻す |
| MAJ-02   | 後方互換性が破れている（既存テストが FAIL・props インターフェースが変更されている） | Phase 2〜5 に差し戻す |
| MAJ-03   | TypeScript 型エラーが発生している（AC-10 未達）                                     | Phase 5 に差し戻す    |
| MAJ-04   | 全テストが FAIL している（AC-9 未達・リグレッション発生）                           | Phase 5〜6 に差し戻す |

### Step 4: MINOR 判定（その場で修正可能）

以下の場合は MINOR として記録し、その場で修正するか Phase 12 の未タスクとして追跡する。

| MINOR ID | 判定基準                                         | 対処方針                    |
| -------- | ------------------------------------------------ | --------------------------- |
| M-01     | コードスタイルの軽微な問題（命名・インデント等） | その場で修正                |
| M-02     | JSDoc の記述が不完全（型・タイミング説明が簡易） | その場で修正または Phase 12 |
| M-03     | ESLint 警告が残存（エラーではない）              | Phase 12 未タスクとして記録 |

### Step 5: マージ可否判定

| 条件                                               | 判定   |
| -------------------------------------------------- | ------ |
| AC-1〜AC-10 が全て PASS                            | ✓ PASS |
| MAJOR ブロッカーが 0 件                            | ✓ PASS |
| ESLint PASS                                        | ✓ PASS |
| `outputs/phase-10/final-review-result.md` 作成済み | ✓ PASS |
| `outputs/phase-10/ac-verification.md` 作成済み     | ✓ PASS |

## MINOR 追跡テーブル

| MINOR ID | 指摘内容 | 解決 Phase | 解決状態 |
| -------- | -------- | ---------- | -------- |
| -        | なし     | -          | -        |

## ブロッカー確認

| ID   | 内容                                            | 状態 |
| ---- | ----------------------------------------------- | ---- |
| B-01 | バリデーションロジック不一致（AC-1〜AC-8 未達） | なし |
| B-02 | 後方互換性破壊（既存テスト FAIL）               | なし |
| B-03 | TypeScript 型エラー（AC-10 未達）               | なし |
| B-04 | 全テスト FAIL（AC-9 未達）                      | なし |

## Phase 11 開始条件

Phase 11 を開始するためには以下が全て満たされている必要がある。

- [x] AC-1〜AC-10 の検証が全て PASS
- [x] MAJOR ブロッカーが 0 件
- [x] `outputs/phase-10/final-review-result.md` が作成済み
- [x] `outputs/phase-10/ac-verification.md` が作成済み

## 多角的チェック観点

| 観点                 | 確認内容                                                                            |
| -------------------- | ----------------------------------------------------------------------------------- |
| バリデーション正確性 | weekly + 空曜日 / monthly + 範囲外エラー表示・`onValidationChange` 動作が要件通りか |
| 後方互換性           | 既存の props インターフェースが変更されていないこと。既存テストが PASS していること |
| 型安全               | TypeScript strict モードでエラーがないこと                                          |
| コードスタイル       | ESLint・Prettier の規約に準拠していること                                           |
| ドキュメント         | `onValidationChange` の JSDoc が追加・整備されていること                            |

## 参照資料

| 資料名           | パス                           | 用途                    |
| ---------------- | ------------------------------ | ----------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`      | AC 一覧・前提確認       |
| Phase 2 設計     | `phase-2-design.md`            | バリデーション設計前提  |
| 品質保証結果     | `outputs/phase-9/qa-result.md` | Phase 9 成果物          |
| テスト設計書     | `phase-4-test-creation.md`     | AC 対応テストケース確認 |

## サブタスク管理

| サブタスクID | 内容                                           | 担当   | 状態 |
| ------------ | ---------------------------------------------- | ------ | ---- |
| FR-01        | AC-1〜AC-10 検証コマンド実行・結果記録         | 実装者 | 完了 |
| FR-02        | MAJOR / MINOR 判定実施・記録                   | 実装者 | 完了 |
| FR-03        | マージ可否判定・記録                           | 実装者 | 完了 |
| FR-04        | `outputs/phase-10/final-review-result.md` 作成 | 実装者 | 完了 |
| FR-05        | `outputs/phase-10/ac-verification.md` 作成     | 実装者 | 完了 |

## 成果物

| 成果物           | パス                                      | 説明                                          |
| ---------------- | ----------------------------------------- | --------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | AC 最終確認・MAJOR/MINOR 判定・マージ可否判定 |
| AC 検証詳細      | `outputs/phase-10/ac-verification.md`     | AC-1〜AC-10 の証跡コマンド出力を記録          |

## 完了条件

- [x] AC-1〜AC-10 の最終判定が完了していること
- [x] PASS / MINOR / MAJOR の分類が記録されていること
- [x] MAJOR ブロッカーが 0 件（または全て解消済み）であること
- [x] `outputs/phase-10/final-review-result.md` が作成されていること
- [x] `outputs/phase-10/ac-verification.md` が作成されていること
- [x] Phase 11 開始条件が全て PASS していること

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001
```

## 次Phase

Phase 11: 手動テスト
