# TASK-UI-04: 仕様書ステータス乖離修正 - タスク指示書

## メタ情報

```yaml
issue_number: 1941
task_id: TASK-UI-04
task_name: spec-status-drift-correction
category: メンテナンス / 品質管理
target_feature: タスク仕様書群の artifacts.json / index.md ステータスフィールド
priority: P0
scale: 中規模
status: 未実施
source: 実装状態監査（P0タスク群の実装完了後レビュー）
created_date: 2026-04-06
step: 13（TASK-UI-01/02/03 完了後に直列実行）
dependencies:
  - TASK-UI-01
  - TASK-UI-02
  - TASK-UI-03
blocking: []
```

| 項目         | 値                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-04                                                                                                    |
| タスク名     | 仕様書ステータス乖離修正                                                                                      |
| 分類         | メンテナンス / 品質管理                                                                                       |
| 対象機能     | タスク仕様書群の artifacts.json / index.md ステータスフィールド                                               |
| 優先度       | P0（最高）                                                                                                    |
| 見積もり規模 | 中規模                                                                                                        |
| ステータス   | 未実施                                                                                                        |
| 発見元       | 実装状態監査（P0タスク群の実装完了後レビュー）                                                                |
| 発見日       | 2026-04-06                                                                                                    |
| Step         | 13（TASK-UI-01/02/03 完了後に直列実行）                                                                       |
| 依存タスク   | TASK-UI-01, TASK-UI-02, TASK-UI-03                                                                            |
| 後続タスク   | なし                                                                                                          |
| 仕様書       | `docs/30-workflows/skill-creator-agent-sdk-lane/step-13-seq-task-ui-04-spec-status-drift-correction/index.md` |

---

## 1. Why

### 1.1 背景

P0 タスク群（TASK-P0-01 〜 TASK-P0-09）の実装が進行する中で、仕様書のステータスフィールドが更新されずに取り残された。以下の 7〜8 件が乖離している:

1. **TASK-P0-01** — artifacts.json が `in_progress` だがコードは完全実装済み・マージ済み
2. **TASK-P0-02** — spec が `spec_created` だが `recordVerifyPass()`, `requestReverify()` は実装済み
3. **TASK-P0-04** — spec が `spec_created` だが `hasDynamicResourcePipeline()` は動作済み
4. **TASK-P0-05** — `spec_created` だが `_executeInternal()` に完全パイプライン実装済み
5. **TASK-P0-06** — `spec_created` だが `ConversationalInterview.tsx` は機能済み
6. **TASK-P0-07** — `spec_created` だが動的解決ステータスの検証が必要
7. **TASK-P0-08** — `spec_created` だが session IPC handlers が `creatorHandlers.ts` に存在
8. **TASK-P0-09** — `in_progress` だが `governance/` ディレクトリに完全実装済み

### 1.2 問題点・課題

- 残作業を正確に把握できない
- 開発者が completed-tasks に移動すべきタスクを判断できない
- executor-guide.md の実行ステータスが古い情報を示し続ける

### 1.3 放置した場合の影響

- 重複実装リスク（既に実装済みの機能を再実装しようとする）
- 開発プランニングの精度低下

---

## 2. What

### 2.1 達成目標

1. 全タスク仕様書の artifacts.json status が実装状態と一致する
2. 完了済みタスクは `completed-tasks/` ディレクトリへ移動される（該当する場合）
3. 部分完了タスクに残作業の明確な記録がある
4. 親 `index.md` のタスク一覧が最新の状態を反映する
5. `executor-guide.md` の実行ステータスが更新されている

### 2.2 スコープ

**含む:**

- `artifacts.json` の status フィールド更新
- `index.md` のステータス更新
- `completed-tasks` ディレクトリへの移動
- 残作業の記録
- `executor-guide.md` の更新

**含まない:**

- コード変更
- テスト追加
- 機能実装
- 新規タスク仕様書の作成

---

## 3. 苦戦箇所（予想される）

- **実装状態の正確な把握**: 「実装済みかどうか」の判断には実際のコードを読む必要があり、対象ファイルが多い場合に見落としが発生しやすい
- **ステータス更新の原子性**: 複数ファイルを更新するため、途中で中断すると inconsistent state になる。完了条件を明確にしてから着手する
- **completed-tasks 移動基準**: Phase-12 まで完了しているかどうかの判定が一部のタスクで曖昧になる可能性がある

**P0-07 からの学び（直接適用可能）:**

- 本タスクで TASK-P0-07 の artifacts.json status を `completed` に更新する際、Phase 13 が blocked であることを明示的に記録すること
- completed-tasks への移動は Phase-12 までの完了を条件とする（Phase-13 は PR 作成なのでユーザー作業）

---

## 4. Phase 構成

詳細仕様: `docs/30-workflows/skill-creator-agent-sdk-lane/step-13-seq-task-ui-04-spec-status-drift-correction/index.md`

| Phase | 概要                               |
| ----- | ---------------------------------- |
| 1     | 全タスク仕様書の現行ステータス抽出 |
| 2     | コード実装状態との突合設計         |
| 3     | 設計レビュー                       |
| 4     | 確認スクリプト/手順の作成          |
| 5     | artifacts.json / index.md 更新実装 |
| 6     | completed-tasks への移動           |
| 7     | カバレッジ確認（更新漏れチェック） |
| 8     | リファクタリング（記述整理）       |
| 9     | 品質確認                           |
| 10    | 最終レビュー                       |
| 11    | 手動テスト（ステータス一致確認）   |
| 12    | ドキュメント                       |
| 13    | PR 作成                            |
