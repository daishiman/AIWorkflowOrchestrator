# UT-06-005-A: PreToolUse Hook フォールバック統合

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| タスクID | UT-06-005-A                              |
| 優先度   | 高                                       |
| 検出元   | UT-06-005 Phase 12 レビュー（GAP-02/03） |
| 関連     | UT-06-005                                |
| 作成日   | 2026-03-16                               |

## 概要

UT-06-005 で実装した processPermissionFallback/executeAbortFlow/executeSkipFlow を、SkillExecutor の PreToolUse Hook に統合する。現状これらのメソッドはテストからのみ呼ばれており、実行時フローに接続されていない。

## 目的

- abort/skip/retry フローを実際のスキル実行パスに組み込み、PermissionResolver のレスポンスに応じて適切な分岐を実現する
- sendPermissionRequest の timeout エラーを abort フローに自動接続し、ユーザー操作なしで安全に中止できるようにする

## 要件

1. PreToolUse Hook 内で `sendPermissionRequest` → `processPermissionFallback` の連携を実装する
2. `sendPermissionRequest` の timeout エラーを catch して `executeAbortFlow("timeout")` を呼び出す
3. retry フロー時の再 Permission 要求ループを実装する（最大 PERMISSION_MAX_RETRIES=3 回）
4. 既存テスト（275 ケース）が全 PASS を維持すること

## 対象ファイル

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - L1126-1184: PreToolUse Hook
  - L1480-1516: sendPermissionRequest

## 依存タスク

- UT-06-005（完了済み: processPermissionFallback/executeAbortFlow/executeSkipFlow 実装）

## 完了条件

- [ ] PreToolUse Hook で `processPermissionFallback` が実行時フローから呼ばれること
- [ ] timeout 時に `executeAbortFlow("timeout")` が呼ばれること
- [ ] retry フロー時に Permission 要求が再発行されること
- [ ] 既存テスト 275 ケースが全 PASS であること
- [ ] 新規テストで PreToolUse Hook 統合シナリオを検証すること

## 参照資料

- `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/` （本タスクの完了成果物）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts`
