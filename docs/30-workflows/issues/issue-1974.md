# [#1974] "[TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001] verifyAndImproveLoop() での adapter error 通知整理"

## メタ情報

```yaml
task_id: TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001
task_name: verifyAndImproveLoop() での adapter error 通知整理
category: 実装改善
target_feature: RuntimeSkillCreatorFacade verifyAndImproveLoop
priority: Low
scale: 小規模
status: open
source_phase: TASK-UT-RT-01 Phase 10 MINOR 指摘（carry-over）
created_date: 2026-04-06
dependencies: []
spec_path: docs/30-workflows/unassigned-task/TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | Low    |
| 規模       | 小規模 |
| ステータス | open   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-RT-01 の実装で `verifyAndImproveLoop()` 内の `improve()` 呼び出し時に adapter error が発生した場合、エラー通知の文言が `execute()` 単体ガードおよび `improve()` 単体ガードと統一されていない可能性がある。

Phase 10 レビューで MINOR 指摘として記録されたが、変更範囲最小化のため carry-over となった。

### 1.2 問題点・課題

- `verifyAndImproveLoop()` 内の `improve()` adapter error 時の通知文言が未整理
- `execute()` 単体ガードの通知パターン（`notify("スキル作成失敗", errorMessage)`）との一貫性が不明
- review loop の feedback 文言が runtime guard とずれる可能性がある

### 1.3 放置した場合の影響

- `verifyAndImproveLoop()` でのエラー時にユーザーが不明確なフィードバックを受ける
- 通知文言の不一致がデバッグ困難を引き起こす可能性
- 影響度: Low（エラー通知文言の不統一であり、機能自体は動作する）

---

## 2. 何を達成するか（What）

### 2.1 目的

`verifyAndImproveLoop()` 内の adapter error 通知を `execute()` / `improve()` 単体ガードと同水準に統一する。

### 2.2 最終ゴール

1. `verifyAndImproveLoop()` 内の adapter error 発生時に適切な通知が呼ばれる
2. エラー文言が `execute()` 単体ガードと同等水準である
3. 通知ヘルパー統合タスク（TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001）との整合が取れている

### 2.3 スコープ

#### 含むもの

- `verifyAndImproveLoop()` 内の adapter error 通知パターン調査・修正
- 通知文言の統一
- 既存テストのリグレッション確認

#### 含まないもの

- `notificationService` インターフェースの変更
- Renderer 側の表示変更
- 他メソッドへの波及対応

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01 が完了済み（Phase 12 close-out 済み）
- `TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001` (#1936) と協調して実施

### 3.2 関連タスク

| タスクID                                          | 関係     | 説明                                       |
| ------------------------------------------------- | -------- | ------------------------------------------ |
| TASK-UT-RT-01                                     | 親タスク | executeAsync() エラーメッセージ伝搬統一    |
| TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001     | 子タスク | notifySkillCreationFailure() 抽出 (#1936)  |
| TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001 | 子タスク | executeAsync() snapshot error 伝搬 (#1937) |

### 3.3 推奨アプローチ

1. `verifyAndImproveLoop()` の adapter error 分岐を調査し、現在の通知有無を確認
2. `execute()` 単体ガードの通知パターンと比較
3. NOTIFY-HELPER-CONSOLIDATION-001 (#1936) の `notifySkillCreationFailure()` ヘルパーを活用して修正
4. 既存テストのリグレッション確認

### 3.4 苦戦箇所

| ID  | 内容                                                                                    | 解決策                                                                     |
| --- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| S-1 | `verifyAndImproveLoop()` はループ処理のため、どのタイミングで通知すべきかの判断が難しい | ループ終了後に通知するか、各ループ反復で通知するかの設計方針を先に決定する |
| S-2 | NOTIFY-HELPER-CONSOLIDATION-001 との実施順序の調整が必要                                | #1936 が完了してから本タスクを実施すると、ヘルパー関数を活用できる         |

---

## 完了条件

- [ ] `verifyAndImproveLoop()` 内の adapter error 時に適切な通知が発火する
- [ ] エラー通知文言が `execute()` 単体ガードと同等水準
- [ ] 既存テスト全件 PASS
- [ ] TypeScript 型チェック PASS

---

## 参照情報

| 資料名                       | パス                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               |
| notify ヘルパー統合タスク    | `docs/30-workflows/unassigned-task/TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001.md`                |
| snapshot error 伝搬タスク    | `docs/30-workflows/unassigned-task/TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001.md`            |
| execute() 単体ガード実装参照 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` |

---

> **注記**: このタスクは MINOR carry-over です。子タスク #1936（NOTIFY-HELPER-CONSOLIDATION）と #1937（EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION）が完了した後に、残った通知整理を本タスクで確認・クローズする想定です。
