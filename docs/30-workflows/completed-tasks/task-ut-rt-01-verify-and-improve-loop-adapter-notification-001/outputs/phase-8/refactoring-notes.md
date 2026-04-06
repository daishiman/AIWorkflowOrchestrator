# Phase 8: リファクタリングノート

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| 作成日 | 2026-04-06 |

## Task 8-1: 通知パターンの一貫性確認

`RuntimeSkillCreatorFacade.ts` 内の全ての `notify()` 呼び出し箇所:

| 行    | 箇所                                                   | try/catch | 判定         |
| ----- | ------------------------------------------------------ | --------- | ------------ |
| L447  | `verifyAndImproveLoop()` 内 improve エラー（追加箇所） | あり ✓    | 統一         |
| L1168 | `_executeInternal()` adapter guard                     | あり ✓    | 基準パターン |
| L1297 | `_executeInternal()` execute 失敗                      | あり ✓    | 統一         |
| L1367 | `_executeInternal()` 完了通知                          | あり ✓    | 統一         |
| L1396 | `_executeInternal()` エラー通知                        | あり ✓    | 統一         |

全箇所で `try { notify() } catch {}` パターンが使用されている。

## Task 8-2: 共通ヘルパー化の検討

**判断**: 本タスクでは最小変更を方針とし、共通ヘルパー化は別タスクへ移管。

**理由**: notify() が3か所に分散しているが、各呼び出しコンテキスト（execute/improve/loop）が微妙に異なるため、現時点では YAGNI 原則に従いインライン維持。

**別タスク移管**: TECH-M-01（Phase 10 MINOR 指摘）として記録済み。

## Task 8-3: 最終整理確認

- `pnpm --filter @repo/desktop typecheck` → エラーなし ✓
- `pnpm lint` → エラーなし（warnings 10件は既存パターン）✓
- T-VL-01〜07 + T-REG-01 全て PASS ✓
