# Unassigned Task Detection: UT-06-003-PRELOAD-API-IMPL

## 検出日: 2026-03-23

## 検出結果: 1件

### 検出プロセス

1. 実装対象ファイル（`skill-api.ts`）の周辺コードを確認 — 新たな技術的負債なし
2. Phase 10 最終レビューで MINOR 判定なし
3. Phase 11 手動テストでウォークスルー発見事項なし
4. 既存テスト（`skill-api.contract.test.ts` 66件）の回帰なし
5. **6層レビュー 2回目検証**: `skill-api.unification.test.ts` の expectedMethods 配列と期待値 51 の不整合を検出

### 検出タスク

| ID                             | 概要                                                                                          | 優先度 | 指示書                                                                     |
| ------------------------------ | --------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| UT-06-003-UNIFICATION-TEST-GAP | `skill-api.unification.test.ts` expectedMethods 配列に `getDetail` / `update` が未含（49/51） | 低     | `docs/30-workflows/unassigned-task/task-ut-06-003-unification-test-gap.md` |

### 3ステップ完了状態

| ステップ                           | 状態 |
| ---------------------------------- | ---- |
| ① 指示書作成（`unassigned-task/`） | 完了 |
| ② task-workflow-backlog.md 登録    | 完了 |
| ③ GitHub Issue 追加                | 完了 |

### 結論

IPC 4層の Layer 4（Preload API）を追加する最小限の変更であり、周辺への影響はメソッド数カウントテストの更新のみでした。6層レビューの2回目検証で `expectedMethods` 配列と期待値のギャップ（49/51）を1件検出し、未タスク化しました。
