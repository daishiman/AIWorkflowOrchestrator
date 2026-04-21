# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

受入基準、4条件、依存関係の整合を確認し、Phase 11 へ進めるかを GO / MINOR / STOP で判定する。

## 実行タスク

### Task 1: AC 最終確認

- AC-001: prompt section が実際に改善される
- AC-002: LLM 利用時に LLM 経路が動く
- AC-003: LLM なしで fallback が動く
- AC-004: abort が動く
- AC-005: 新規テストが PASS
- AC-006: 既存テストが PASS
- AC-007: typecheck / lint が PASS

### Task 2: 4条件評価

- 矛盾なし
- 漏れなし
- 整合性あり
- 依存関係整合

### Task 3: Gate 判定

- GO
- MINOR
- STOP

## 参照資料

- [Phase 4: テスト作成](phase-4-test-creation.md)
- [Phase 5: 実装](phase-5-implementation.md)
- [Phase 6: テスト拡充](phase-6-test-expansion.md)
- [Phase 9: 品質保証](phase-9-quality.md)

## 実行手順

1. AC を確認する
2. 4条件を評価する
3. GO / MINOR / STOP を決める

## 統合テスト連携

自動検証で確認済みの項目はここで確定し、手動でしか見えない項目だけを Phase 11 に残す。

## 成果物

- `outputs/phase-10/final-review-result.md`

## 完了条件

- [ ] AC-001〜AC-007 の確認結果が記録されていること
- [ ] 4条件の評価が埋まっていること
- [ ] GO / MINOR / STOP が明示されていること
- [ ] STOP の場合に差し戻し先 Phase が明記されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-10/` に出力されていること
- [ ] Phase 11 の開始可否が明記されていること

## 次 Phase

GO または MINOR の場合、[Phase 11: 手動テスト](phase-11-manual-test.md) へ進む。
