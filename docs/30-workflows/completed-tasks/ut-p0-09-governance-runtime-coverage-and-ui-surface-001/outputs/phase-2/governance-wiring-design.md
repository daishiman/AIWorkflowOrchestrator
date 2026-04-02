# Phase 2: 全フェーズ governance 配線設計書

作成日: 2026-04-02

## 設計結論

Phase 1 調査の結果、全フェーズへの `createGovernanceHooks()` 配線はコード上で完了済み。
本 Phase での設計は「文言修正の対象特定」に留まる。

## 配線確認済みフェーズ一覧

| フェーズ | 状態     | 根拠                     |
| -------- | -------- | ------------------------ |
| plan     | 配線済み | `plan()` line 785        |
| execute  | 配線済み | `execute()` line 917     |
| verify   | 配線済み | `verifySkill()` line 264 |
| improve  | 配線済み | `improve()` line 1133    |

## execute-only 文言修正対象

**ファイル**: `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md`

修正方針:

- line 16: 「execute phase のみ」→ 「全フェーズ（plan/verify/improve/execute）」
- line 61: 「execute-only wiring の警告パターン」→ 「全フェーズ governance wiring のパターン」
- 該当セクション全体を「lessons-learned として記録」しつつ、現状との差分を明記する
