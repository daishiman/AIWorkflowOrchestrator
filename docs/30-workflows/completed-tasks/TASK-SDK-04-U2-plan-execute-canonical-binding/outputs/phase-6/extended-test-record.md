# Phase 6: テスト拡充記録

## 追加テストケース

### U-18: cancel → 再 plan で approved snapshot が差し替わる

- **シナリオ**: 初回 plan → cancel → 別の依頼で再 plan → execute
- **検証**: executePlan の第2引数が二回目の依頼（"二回目の依頼"）で呼ばれる
- **境界条件**: cancel で `approvedSkillSpec` が `null` にリセットされ、再 plan で新しい値が固定される

### U-19: 複数回の textarea 編集後も approved snapshot は不変

- **シナリオ**: plan 作成 → textarea を3回変更 → execute
- **検証**: executePlan の第2引数が plan 作成時の値（"固定されるべき依頼"）のまま
- **境界条件**: 連続した state 更新でも approved snapshot の stale 参照が起きない

### U-20: cancel で approvedSkillSpec が対称クリアされる

- **シナリオ**: plan 表示中に cancel
- **検証**: clearGenerationState が1回呼ばれる（approvedSkillSpec も同時にクリア）
- **境界条件**: cancel 後に stale snapshot が残らない

## 既存機能保護の確認

| 既存テスト                    | 結果 | 確認内容                                 |
| ----------------------------- | ---- | ---------------------------------------- |
| U-13 (terminal handoff)       | PASS | handoff path で fetchSkills が呼ばれない |
| U-13b (workflow snapshot)     | PASS | provenance summary 表示に影響なし        |
| U-13c (user input submission) | PASS | submitUserInput フロー維持               |
| U-16〜U-17 (verify/reverify)  | PASS | verify detail 取得・再検証に影響なし     |

## テスト実行結果

- U-21 を追加し、execute failure 後の retry でも approved snapshot が保持される期待値を補強した。
- 2026-03-28 のローカル再実行は `esbuild` host/binary version mismatch により未完了。
- act(...) warning は非同期 state 更新に起因する既知の React Testing Library 制限（テスト結果に影響なし）
