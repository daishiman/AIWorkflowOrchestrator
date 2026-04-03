# [#1774] [UT] verificationEngine 未DI時のヘルスチェック検出機能追加

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-ut-p0-02-002-verification-engine-graceful-degradation   |
| タスク名     | verificationEngine 未DI時のヘルスチェック検出機能追加        |
| 分類         | 改善                                                         |
| 対象機能     | RuntimeSkillCreatorFacade.verifyAndImproveLoop() / DI設定    |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-P0-02 Phase 3 MR-02（Phase 5 で console.warn 追加済み） |
| 発見日       | 2026-03-30                                                   |

## Section 1: なぜこのタスクが必要か（Why）

`RuntimeSkillCreatorFacade.verifyAndImproveLoop()` において、`verificationEngine` が DI（依存性注入）されていない場合、現状では `console.warn` によって設定ミスを通知するのみである。しかし、この通知はランタイムエラーが発生した後に初めてログに現れるため、**事前に設定ミスを検出する手段がない**。

### 問題点

- ランタイムエラー（`verifySkill()` 呼び出し時のエラー）が発生して初めて設定ミスに気づく構造になっている
- ヘルスチェック機能がないため、アプリ起動時や統合テスト時に DI 設定の正当性を能動的に確認できない
- 開発時のデバッグコストが高く、問題の根本原因特定に時間がかかる

### 放置した場合の影響

- 開発環境での DI 設定ミスが、生産コードのランタイムエラーとしてのみ表面化する
- `console.warn` が出力される状況（ログ確認不足・ターミナル非表示時）では設定ミスに全く気づけない

## Section 2: 何を達成するか（What）

### 目的

`RuntimeSkillCreatorFacade` にヘルスチェックメソッドを追加し、`verificationEngine` の DI 状態をプログラムから事前検出できるようにする。

### 最終ゴール

- `checkHealth()` または同等のメソッドが `verificationEngine` の DI 状態（注入済み / 未注入）を返す
- 呼び出し元（アプリ起動処理・テスト・診断ツールなど）が DI 状態を検査できるようになる

### スコープ（含むもの）

- `checkHealth()` または `getDiStatus()` メソッドの定義・実装
- DI ステータスを表す型定義（例: `DiStatus`、`HealthStatus`）
- ユニットテストの追加（DI あり / DI なし の両ケース）

---

仕様書: docs/30-workflows/unassigned-task/task-ut-p0-02-002-verification-engine-graceful-degradation.md
