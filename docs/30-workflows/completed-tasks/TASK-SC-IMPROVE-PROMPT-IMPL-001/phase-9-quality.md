# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

lint、typecheck、test、coverage、依存整合を一括確認し、Phase 10 の最終レビューに渡す品質ゲート結果を固定する。

## 実行タスク

### Task 1: 品質ゲート実行

- 依存関係整合確認
- typecheck
- lint
- targeted test / 回帰 test
- coverage 確認

### Task 2: 品質チェック

- `improveSkill()` の戻り値型処理
- `no-floating-promises` 違反なし
- progress emission の整合
- 既存モード回帰なし

## 参照資料

- [Phase 6: テスト拡充](phase-6-test-expansion.md)
- [Phase 7: カバレッジ確認](phase-7-coverage.md)
- [Phase 8: リファクタリング](phase-8-refactoring.md)

## 実行手順

1. 品質ゲートコマンドを実行する
2. 品質観点をチェックリストで確認する
3. Phase 10 用の要約を作る

## 統合テスト連携

Phase 9 の CLI 結果は NON_VISUAL タスクの代替証跡の一部になる。Phase 11 ではここで確定した項目を重複確認しない。

## 成果物

- `outputs/phase-9/quality-gate-results.md`
- `outputs/phase-9/dependency-check.md`

## 完了条件

- [ ] 品質ゲート結果が記録されていること
- [ ] 失敗時の差し戻し先が明記されていること
- [ ] NON_VISUAL の代替証跡として再利用できる形式で整理されていること
- [ ] Phase 10 の AC 最終確認に必要な根拠が揃っていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-9/` に出力されていること
- [ ] Phase 10 に渡す品質根拠が固定されていること

## 次 Phase

[Phase 10: 最終レビュー](phase-10-final-review.md) へ進む。
