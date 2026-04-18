# task-ut-rt-01-notify-helper-consolidation-001 - タスク実行仕様書

## ユーザーからの元の指示

```
GitHub Issue #1936: RuntimeSkillCreatorFacade notify 重複除去 - notifySkillCreationFailure() ヘルパー統合
```

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001                          |
| タスク名     | task-ut-rt-01-notify-helper-consolidation-001                          |
| 分類         | refactoring（コード変更タスク）                                        |
| 対象機能     | RuntimeSkillCreatorFacade.notifySkillCreationFailure()                 |
| 優先度       | Medium                                                                 |
| 見積もり規模 | 小規模（Small）                                                        |
| ステータス   | open（未着手）                                                         |
| 作成日       | 2026-04-18                                                             |
| 親タスク     | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 (#1959) |
| 関連Issue    | #1936                                                                  |

---

## タスク概要

### 目的

`RuntimeSkillCreatorFacade` 内の `notify("スキル作成失敗", ...)` 呼び出しパターンが `execute()` 単体ガード・`improve()` 単体ガード・`verifyAndImproveLoop()` 内の3箇所にインライン重複している。共通ヘルパー関数 `notifySkillCreationFailure()` を抽出して統一することで、将来の通知文言変更・ロギング追加・エラー追跡の一元管理を可能にする。

### 背景

- 親タスク TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 では「変更範囲最小化のためインライン維持」を選択
- 通知パターンが3箇所に固まったことで共通化の価値が生じた

### スコープ

#### 含む

- `RuntimeSkillCreatorFacade.ts` 内のプライベートヘルパー `notifySkillCreationFailure(message: string): void` の定義
- `_executeInternal()`、`improve()`、`verifyAndImproveLoop()` 内の既存 `try { notify() } catch {}` ブロックをヘルパー呼び出しへ置換
- ヘルパー関数のユニットテスト追加

#### 含まない

- `notificationService` インターフェース自体の変更
- 通知文言・タイトルの変更（`"スキル作成失敗"` のまま維持）
- 他クラスへの通知ヘルパー展開

## 受入基準

| ID   | 基準                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| AC-1 | `notifySkillCreationFailure(message)` が定義され、3箇所のインライン重複が除去される |
| AC-2 | 通知タイトル `"スキル作成失敗"` と `message` 引数の動作が変更前と同等である         |
| AC-3 | `notificationService` が `undefined` の場合、例外なく安全にスキップする             |
| AC-4 | `notificationService.notify()` が例外を投げた場合、ヘルパーが例外を吸収する         |
| AC-5 | 既存テスト（T-VL-01〜07、T-REG-01）がリグレッションなし                             |
| AC-6 | TypeScript 型チェックがエラーなしで通過する                                         |

## Phase 構成

| Phase | 名称             | ステータス | 仕様書ファイル               |
| ----- | ---------------- | ---------- | ---------------------------- |
| 1     | 要件定義         | open       | phase-1-requirements.md      |
| 2     | 設計             | open       | phase-2-design.md            |
| 3     | 設計レビュー     | open       | phase-3-design-review.md     |
| 4     | テスト作成       | open       | phase-4-test-creation.md     |
| 5     | 実装             | open       | phase-5-implementation.md    |
| 6     | テスト拡充       | open       | phase-6-test-expansion.md    |
| 7     | カバレッジ確認   | open       | phase-7-coverage-check.md    |
| 8     | リファクタリング | open       | phase-8-refactoring.md       |
| 9     | 品質検証         | open       | phase-9-quality-assurance.md |
| 10    | 最終レビュー     | open       | phase-10-final-review.md     |
| 11    | 手動テスト       | open       | phase-11-manual-test.md      |
| 12    | ドキュメント     | open       | phase-12-documentation.md    |
| 13    | PR作成           | open       | phase-13-pr-creation.md      |

## 参照資料

| 資料名               | パス                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| 対象実装ファイル     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                       |
| 通知テストファイル   | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`           |
| 旧未タスク仕様書     | `docs/30-workflows/unassigned-task/TASK-UT-RT-01-NOTIFY-HELPER-CONSOLIDATION-001.md`                        |
| 親タスクワークフロー | `docs/30-workflows/completed-tasks/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001/index.md` |
