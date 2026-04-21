# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

fail path、境界条件、回帰ガードを追加し、`improve-prompt` モードが壊れやすい箇所を補強する。

## 実行タスク

### Task 1: fail path 追加

- SKILL.md 読み込み失敗
- 書き戻し失敗
- LLM 実行失敗
- fallback 実行失敗

### Task 2: 回帰ガード追加

- `update` を含む既存モードへの影響なし確認
- progress emission の順序崩れ検知
- abort タイミング差の確認

## 参照資料

- [Phase 4: テスト作成](phase-4-test-creation.md)
- [Phase 5: 実装](phase-5-implementation.md)

## 実行手順

1. fail path を列挙する
2. 既存モード回帰観点を追加する
3. 拡充後のテスト実行方針を固定する

## 統合テスト連携

Phase 6 は unit test の守備範囲を広げ、Phase 11 で見るのは手動でしか観測できないフローだけに絞る。

## 成果物

- `outputs/phase-6/fail-path-matrix.md`
- `outputs/phase-6/regression-guard.md`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`

## 完了条件

- [ ] fail path の主要ケースが整理されていること
- [ ] 既存モード回帰ケースが含まれていること
- [ ] テスト拡充の理由が説明されていること
- [ ] Phase 7 に渡す coverage 観点が整理されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-6/` に出力されていること
- [ ] Phase 7 に渡す concern 一覧が固定されていること

## 次 Phase

[Phase 7: カバレッジ確認](phase-7-coverage.md) へ進む。
