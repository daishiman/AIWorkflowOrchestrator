# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

`runImprovePromptWorkflow()` 周辺の concern と dependency edge がテストで観測できているかを確認し、不足箇所を明示する。

## 実行タスク

### Task 1: カバレッジ計測

- line / branch / function coverage を確認する
- targeted test と既存回帰の coverage を区別して確認する

### Task 2: concern coverage 確認

- progress emission
- LLM / fallback 分岐
- abort
- file read / write
- 既存モード回帰

### Task 3: gap 整理

- 未カバー観点があれば Phase 6 か 8 へ差し戻し候補として記録する

## 参照資料

- [Phase 4: テスト作成](phase-4-test-creation.md)
- [Phase 6: テスト拡充](phase-6-test-expansion.md)

## 実行手順

1. coverage を測定する
2. concern coverage を観点表に落とす
3. gap と差し戻し先を記録する

## 統合テスト連携

Phase 7 では数値だけでなく、手動テストへ残す観測点が十分に絞られているかを確認する。自動で見られる項目はここで閉じる。

## 成果物

- `outputs/phase-7/coverage-summary.md`
- `outputs/phase-7/coverage-gap.md`

## 完了条件

- [ ] coverage 数値が記録されていること
- [ ] concern coverage の有無が整理されていること
- [ ] gap がある場合に差し戻し先が明記されていること
- [ ] Phase 8 へ渡す refactor 対象が整理されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-7/` に出力されていること
- [ ] 未カバー観点の扱いが決まっていること

## 次 Phase

[Phase 8: リファクタリング](phase-8-refactoring.md) へ進む。
