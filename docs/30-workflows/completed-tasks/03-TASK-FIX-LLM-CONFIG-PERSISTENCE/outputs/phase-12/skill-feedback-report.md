# Phase 12: Skill Feedback Report

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-FIX-LLM-CONFIG-PERSISTENCE                         |
| 作成日     | 2026-03-21                                              |
| 対象 skill | `aiworkflow-requirements`, `task-specification-creator` |

## 提案1: persist 系 Phase 11 は storage key を仕様へ固定する

### 問題

Task03 の手動テスト文書が `electron-store` を前提にしており、実装の正本である Renderer localStorage `knowledge-studio-store` とずれていた。

### 改善

- Phase 11 仕様書に storage key を明記する
- harness / capture script / result file の 3 点を同時に作る
- localStorage / sessionStorage の補助キー名も `manual-test-result.md` に残す

## 提案2: completed ledger の shard 選択を family concern で固定する

### 問題

Task03 の完了記録が completed ledger に載っておらず、Phase 12 完了事実が search entrypoint から見えなかった。

### 改善

- Chat / LLM family は `task-workflow-completed-chat-lifecycle-tests.md` を正本 shard にする
- parent workflow / artifact inventory / completed shard を同一 wave で更新する

## 提案3: validator PASS と narrative completed を分離しない

### 問題

guide validator FAIL、Phase 12 必須成果物不足、未タスクリンク欠落があっても narrative だけ先に completed と読める状態が残っていた。

### 改善

- `implementation-guide.md` は validator 実測値で閉じる
- `unassigned-task-detection.md` は Markdown link を必須とする
- `phase12-task-spec-compliance-check.md` に validator / mirror parity / screenshot ブロッカーを同じ表で残す
