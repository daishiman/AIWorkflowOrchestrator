# 未タスク検出レポート - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## 検出ソース

| ソース                       | 確認結果                          |
| ---------------------------- | --------------------------------- |
| 元タスク仕様書（スコープ外） | IMP-002チャネル本体実装は別タスク |
| Phase 3 レビュー結果         | M-01, M-02 は IMP-002未実装起因   |
| Phase 10 レビュー結果        | M-01, M-02 同上                   |
| Phase 11 手動テスト結果      | 追加発見事項なし                  |
| コードコメント (TODO/FIXME)  | なし                              |

## 未タスク候補: 2件

### 候補1: task-imp-ipc-imp002-channels-001

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| カテゴリ | imp (実装)                                                               |
| 優先度   | medium                                                                   |
| 背景     | IMP-002で定義されたsettings/permissions/cacheチャネルが未実装            |
| 問題     | TC-13〜TC-22のテストはhandler未登録パスのみ実行されている                |
| 目的     | skill:settings:_, skill:permissions:_, skill:cache:\* の本体実装         |
| スコープ | skillHandlers.ts に9チャネルのハンドラー追加、SkillServiceに対応メソッド |
| 関連     | TASK-8C-A (テスト側は準備済み)                                           |

### 候補2: task-imp-ipc-permission-response-001

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| カテゴリ | imp (実装)                                             |
| 優先度   | low                                                    |
| 背景     | skill:permission:response チャネルのハンドラーが未実装 |
| 問題     | TC-11はplaceholder assertionのみ                       |
| 目的     | 権限応答チャネルの実装（SkillExecutor連携）            |
| スコープ | skillHandlers.ts に permission:response ハンドラー追加 |
| 関連     | TASK-8C-A (テストフレームワーク準備済み)               |
