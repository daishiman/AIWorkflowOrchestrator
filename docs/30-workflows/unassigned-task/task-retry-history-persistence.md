# リトライ履歴永続化 - タスク指示書

## メタ情報

```yaml
issue_number: 612
```


## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | -                                          |
| タスク名     | リトライ履歴永続化                         |
| 分類         | 改善                                       |
| 対象機能     | SkillExecutor リトライ履歴                 |
| 優先度       | 低                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | TASK-SKILL-RETRY-001 Phase 12 未タスク検出 |
| 発見日       | 2026-01-31                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-RETRY-001にてSkillExecutorにリトライ機構を実装した。リトライ発生時には`retry`タイプのストリーミングイベントがRenderer Processに送信されるが、このイベントは一時的なものであり、永続化されない。リトライの発生回数、エラータイプ（network、rate_limit、server_error、timeout）、最終的な成功/失敗などの履歴データが蓄積されていない。

### 1.2 問題点・課題

- リトライの発生頻度やパターンを事後的に分析できない
- 特定のスキルやエンドポイントで頻繁にリトライが発生しているかを把握できない
- エラータイプごとの傾向分析（ネットワーク障害が多いのか、レート制限が多いのか）ができない
- リトライ機構の有効性を定量的に評価する手段がない

### 1.3 放置した場合の影響

- リトライ機構の改善指針が立てられない
- 慢性的なネットワーク問題やAPI制限問題の検知が遅れる
- ユーザーへの適切なフィードバック（例：「このスキルは頻繁にエラーが発生しています」）が提供できない

---

## 2. 何を達成するか（What）

### 2.1 目的

リトライ発生時のイベントデータをデータベースに永続化し、基本的な統計・分析機能を提供する。

### 2.2 最終ゴール

- リトライ発生時にイベントがDBに記録される
- 統計ダッシュボードでリトライの発生頻度、エラータイプ分布、成功率が確認できる
- 期間指定でのフィルタリングが可能
- スキル別のリトライ統計が表示される

### 2.3 スコープ

#### 含むもの

- リトライ履歴テーブル（SQLite）の追加
- リトライイベント記録ロジック（SkillExecutor内のフック）
- 基本的な統計表示UIコンポーネント（ダッシュボード）
- 期間指定フィルタリング
- スキル別集計

#### 含まないもの

- 高度なML分析・異常検知
- 外部エクスポート（CSV/JSON）
- リアルタイムアラート通知
- リトライ設定の自動最適化

### 2.4 成果物

- DBマイグレーションファイル（retry_history テーブル）
- `apps/desktop/src/main/services/skill/RetryHistoryRepository.ts` - 記録・クエリロジック
- `apps/desktop/src/renderer/components/Dashboard/RetryStatsDashboard.tsx` - 統計表示UI
- 対応するテストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-RETRY-001（SkillExecutorリトライ機構）が完了していること（完了済み）
- SQLiteデータベース接続が利用可能であること

### 3.2 依存タスク

| タスクID             | タスク名                       | ステータス |
| -------------------- | ------------------------------ | ---------- |
| TASK-SKILL-RETRY-001 | SkillExecutor リトライ機構実装 | 完了       |

### 3.3 必要な知識

- SQLite テーブル設計・マイグレーション
- TypeScript / React コンポーネント開発
- Electron IPC通信
- 集計クエリ（GROUP BY、COUNT、期間フィルタ）
- SkillExecutorのexecuteWithRetryメソッドの内部構造

### 3.4 推奨アプローチ

#### テーブル設計

```sql
CREATE TABLE retry_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  error_type TEXT NOT NULL,         -- 'network' | 'rate_limit' | 'server_error' | 'timeout'
  error_message TEXT,
  delay_ms INTEGER NOT NULL,        -- 実際の待機時間
  outcome TEXT NOT NULL,            -- 'retried' | 'succeeded' | 'exhausted'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_skill_id (skill_id),
  INDEX idx_created_at (created_at)
);
```

#### 記録フック

SkillExecutorの`executeWithRetry`メソッド内のリトライループに記録ロジックを追加する。リトライ発生時、最終成功時、最大リトライ回数到達時にそれぞれレコードを挿入する。

#### 統計クエリ

```typescript
// スキル別リトライ頻度
SELECT skill_id, COUNT(*) as retry_count,
       COUNT(CASE WHEN outcome = 'succeeded' THEN 1 END) as success_count
FROM retry_history
WHERE created_at >= ?
GROUP BY skill_id
ORDER BY retry_count DESC;
```

---

## 4. 実行手順

### Phase構成

4フェーズ構成（DB + ロジック + UI タスク）

### Phase 1: DBテーブル設計・マイグレーション

#### 目的

リトライ履歴を格納するテーブルを作成する

#### 手順

1. retry_historyテーブルのスキーマを設計
2. マイグレーションファイルを作成
3. インデックスを定義（skill_id、created_at）
4. マイグレーション実行を確認

#### 成果物

- マイグレーションファイル
- テーブルスキーマドキュメント

#### 完了条件

- マイグレーションが正常に実行される
- テーブルが作成される

### Phase 2: 記録ロジック実装

#### 目的

リトライ発生時にDBにイベントを記録する

#### 手順

1. `RetryHistoryRepository`クラスを作成
2. `recordRetryEvent`メソッドを実装（insert）
3. `getStatsBySkill`メソッドを実装（集計クエリ）
4. `getStatsByPeriod`メソッドを実装（期間フィルタ）
5. SkillExecutorの`executeWithRetry`にフックを追加
6. 単体テストを作成

#### 成果物

- `apps/desktop/src/main/services/skill/RetryHistoryRepository.ts`
- 対応するテストファイル

#### 完了条件

- リトライ発生時にレコードが挿入される
- 集計クエリが正しい結果を返す
- テストがすべてパスする

### Phase 3: 統計ダッシュボードUI

#### 目的

リトライ統計を可視化するUIを実装する

#### 手順

1. `RetryStatsDashboard`コンポーネントを作成
2. スキル別リトライ頻度の表示
3. エラータイプ分布の表示
4. 期間指定フィルタの実装
5. 成功率の表示
6. IPC経由でMain Processから統計データを取得

#### 成果物

- `apps/desktop/src/renderer/components/Dashboard/RetryStatsDashboard.tsx`
- 対応するテストファイル

#### 完了条件

- 統計データが画面に表示される
- 期間フィルタが動作する
- スキル別の集計が正しい

### Phase 4: 統合テスト・動作確認

#### 目的

全体の統合を確認する

#### 手順

1. スキル実行 → リトライ発生 → DB記録 → ダッシュボード表示の一連のフローを確認
2. 大量データ時のクエリパフォーマンスを確認
3. 古いデータのクリーンアップ方針を検討

#### 成果物

- 統合テスト結果レポート

#### 完了条件

- エンドツーエンドのフローが正常に動作する
- パフォーマンスが許容範囲内

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] retry_historyテーブルが作成されている
- [ ] リトライ発生時にDBにレコードが記録される
- [ ] スキル別リトライ統計が表示される
- [ ] エラータイプ別の分布が表示される
- [ ] 期間指定フィルタリングが動作する
- [ ] 成功率が表示される

### 品質要件

- [ ] Repository層のテストがすべてパスする
- [ ] UIコンポーネントのテストがすべてパスする
- [ ] TypeScript型エラーが発生しない
- [ ] 1000件以上のレコードでもクエリが1秒以内に完了する

### ドキュメント要件

- [ ] テーブルスキーマがコメントで説明されている
- [ ] コンポーネントにJSDocコメントが記載されている

---

## 6. 検証方法

### テストケース

| No. | テストケース                        | 期待結果                                  |
| --- | ----------------------------------- | ----------------------------------------- |
| 1   | リトライ発生後にDBを確認            | retry_historyにレコードが追加されている   |
| 2   | 同一スキルで3回リトライ発生         | スキル別統計で3回と表示される             |
| 3   | 期間を「過去24時間」に設定          | 24時間以内のレコードのみ表示される        |
| 4   | エラータイプがnetworkのリトライ発生 | エラータイプ分布でnetworkがカウントされる |
| 5   | リトライ後に成功したケース          | 成功率に反映される                        |

### 検証手順

1. テスト環境でスキルを実行しリトライが発生する状況を再現
2. DBに直接アクセスしレコードが正しく記録されていることを確認
3. ダッシュボードを開き統計データが表示されることを確認
4. 期間フィルタを変更し表示が更新されることを確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                           |
| ---------------------------- | ------ | -------- | ---------------------------------------------- |
| DB書き込みによる実行性能劣化 | 中     | 中       | 非同期書き込み、バッチインサートの検討         |
| 履歴データの肥大化           | 中     | 高       | TTL（保持期間）設定、定期クリーンアップ        |
| マイグレーション失敗         | 高     | 低       | ロールバック手順の準備、テスト環境での事前検証 |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` - executeWithRetry、retryストリーミングイベント
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - エラーハンドリング仕様

### 参考資料

- SQLite パフォーマンスチューニング（WALモード、インデックス戦略）
- 時系列データの保持・集計パターン

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-SKILL-RETRY-001 Phase 12 未タスク検出:
リトライの発生履歴（発生回数、エラータイプ、成功/失敗）が永続化されないため、
統計情報やトレンド分析ができない。
```

### 補足事項

- データ保持期間のデフォルトは30日を推奨（設定可能にする）
- 将来的にCSV/JSONエクスポート機能を追加する場合は別タスクとして切り出す
- 記録処理はスキル実行のクリティカルパスに影響を与えないよう非同期で行うこと
