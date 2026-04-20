# Phase 11 Manual Test Checklist

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-004 |
| Phase    | 11                 |
| taskType | NON_VISUAL         |
| 作成日   | 2026-04-20         |
| 状態     | executed           |

## チェック項目

- [x] NON_VISUAL 判定を確認した
- [x] focused test の結果を主証跡として参照した
- [x] `manual-test-result.md` にスクリーンショット不要理由を記録した
- [x] `discovered-issues.md` に発見事項（0件）を記録した
- [x] 4層接続（shared / preload / main / renderer）を grep 証跡で確認した
- [x] IPC failure swallow の挙動を T-5（Phase 6 追加）で観測した
- [x] start 前 cancel の undefined guard を T-4 で観測した
- [x] stage 更新の順序が `setStage("cancelled")` → IPC await になっていることを L27/L37 で確認した
