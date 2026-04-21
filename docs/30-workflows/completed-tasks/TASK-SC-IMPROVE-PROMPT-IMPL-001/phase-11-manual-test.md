# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | completed                       |
| 作成日     | 2026-04-21                      |
| taskType   | NON_VISUAL                      |

## 目的

`improve-prompt` モードの実運用フローを確認し、Phase 12 で使う primary evidence を作る。UI変更はないためスクリーンショットは不要とし、headless CLI セッションでは task 固有の代替証跡を正本として扱う。

## 実行タスク

### Task 1: 基本動作確認

1. `runImprovePromptWorkflow()` が `improve-prompt` 分岐から呼ばれること
2. `loading-skill -> analyzing -> improving -> validating -> done` の順序が維持されること
3. SKILL.md の本文のみが改善され、frontmatter は保持されること

### Task 2: fallback 確認

1. LLM 不在時に `improveSkill()` 経路へ落ちること
2. `readFile` / `generate` 失敗時も `improveSkill()` で継続すること

### Task 3: abort 確認

1. loading-skill 境界で中断できること
2. analyzing 境界で中断できること
3. improving 直前で中断できること

### Task 4: NON_VISUAL 証跡整理

- `outputs/phase-9/quality-gate-results.md`
- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`

## 参照資料

- [Phase 10: 最終レビュー](phase-10-final-review.md)
- `outputs/phase-10/final-review-result.md`
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 実行手順

1. task 固有の `vitest` / `eslint` / `tsc` を実行する
2. コード差分と書き戻し内容を確認する
3. manual test 結果を primary evidence として記録する

## 統合テスト連携

GUI 操作は headless セッションでは完全再現しにくいため、NON_VISUAL の代替証跡として task 固有テスト、lint、typecheck、差分確認を採用する。

## 成果物

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`

## 完了条件

- [x] 基本動作、fallback、abort の3観点が確認されていること
- [x] NON_VISUAL のためスクリーンショット不要であることが記録されていること
- [x] `manual-test-result.md` に PASS / FAIL / BLOCKED のいずれかが記録されていること
- [x] HIGH 問題があれば Phase 12 の未タスク候補へ渡されていること

## タスク 100% 実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物が `outputs/phase-11/` に出力されていること
- [x] Phase 12 に渡す primary evidence が固定されていること

## 次 Phase

[Phase 12: ドキュメント更新](phase-12-documentation.md) へ進む。
