# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 8                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

重複、命名ドリフト、条件分岐の散在を整理し、外部契約を変えずに実装を最小複雑性へ近づける。

## 実行タスク

### Task 1: refactor 対象の選定

- duplicate logic
- progress emission の散在
- 変数 / 関数命名の揺れ

### Task 2: refactor 実施

- 外部契約を変えない
- テストと quality gate を壊さない

### Task 3: before / after 記録

- 対象
- Before
- After
- 理由

## 参照資料

- [Phase 5: 実装](phase-5-implementation.md)
- [Phase 6: テスト拡充](phase-6-test-expansion.md)
- [Phase 7: カバレッジ確認](phase-7-coverage.md)

## 実行手順

1. refactor 対象を選ぶ
2. 外部契約非変更を前提に整理する
3. before / after / reason を残す

## 統合テスト連携

Phase 8 では外部契約を変えないため、Phase 4-7 のテストはそのまま再利用できる状態を保つ。

## 成果物

- `outputs/phase-8/refactoring-plan.md`
- `outputs/phase-8/refactoring-checks.md`

## 完了条件

- [ ] 対象 / Before / After / 理由 が記録されていること
- [ ] 外部契約を変えていないことが確認されていること
- [ ] duplicate / naming drift / branching のいずれかが削減されていること
- [ ] Phase 9 に渡す品質確認項目が整理されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-8/` に出力されていること
- [ ] Phase 9 で確認すべき品質観点が固定されていること

## 次 Phase

[Phase 9: 品質保証](phase-9-quality.md) へ進む。
