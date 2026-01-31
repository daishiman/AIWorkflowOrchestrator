# サーキットブレーカーパターン導入 - タスク指示書

## メタ情報

```yaml
issue_number: 610
```


## メタ情報

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | -                                                                       |
| タスク名     | サーキットブレーカーパターン導入                                        |
| 分類         | 改善                                                                    |
| 対象機能     | SkillExecutor エラーハンドリング                                        |
| 優先度       | 中                                                                      |
| 見積もり規模 | 中規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-SKILL-RETRY-001 Phase 11 + error-handling.md「将来対応」セクション |
| 発見日       | 2026-01-31                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-RETRY-001にてSkillExecutorに指数バックオフ付きリトライ機構を実装した。リトライにより一時的なエラーからの自動回復が可能になったが、同一エンドポイントが長時間にわたり障害状態にある場合、毎回maxRetries回（デフォルト3回）の無駄なリクエストが発生する。error-handling.mdの「将来対応」セクションにもサーキットブレーカーパターンの導入が記載されている。

### 1.2 問題点・課題

- 同一エンドポイントの連続障害時に、毎回maxRetries分のリクエスト（+バックオフ待機）が発生し、ユーザー体験が悪化する
- 障害中のAPIへの不要なリクエストにより、レート制限をさらに悪化させる可能性がある
- 障害からの回復を即座に検知する仕組みがない
- 全スキル実行が同じ障害パスを通るため、1つのAPI障害が全体に波及する

### 1.3 放置した場合の影響

- API障害時にユーザーが長時間待たされる（maxRetries × バックオフ時間）
- 不要なAPIリクエストによるコスト増大
- ユーザーが手動でリトライを繰り返す悪循環の発生

---

## 2. 何を達成するか（What）

### 2.1 目的

CircuitBreakerクラスを導入し、連続失敗時にリクエスト自体を一時停止するパターンを実装する。

### 2.2 最終ゴール

- CircuitBreakerクラスが実装されている
- 3つの状態（Closed / Open / Half-Open）が正しく遷移する
- 連続失敗閾値を超えた場合にリクエストが即座に拒否される（Open状態）
- 一定時間後にHalf-Open状態で試行が行われる
- 成功すればClosed状態に復帰する
- SkillExecutorのexecuteWithRetryと統合されている

### 2.3 スコープ

#### 含むもの

- CircuitBreakerクラスの実装（Closed / Open / Half-Open状態遷移）
- 設定パラメータ（failureThreshold、resetTimeoutMs、halfOpenMaxAttempts）
- SkillExecutorへの統合（executeWithRetryの前段に配置）
- 状態遷移ログの出力
- 単体テスト・統合テスト

#### 含まないもの

- サーキットブレーカー状態の永続化（メモリ内のみ）
- ダッシュボードでの状態表示（別タスク）
- エンドポイント別の個別サーキットブレーカー（将来拡張）

### 2.4 成果物

- `apps/desktop/src/main/services/skill/CircuitBreaker.ts` - サーキットブレーカー実装
- `apps/desktop/src/main/services/skill/__tests__/CircuitBreaker.test.ts` - テスト
- SkillExecutor.tsへの統合差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-RETRY-001（SkillExecutorリトライ機構）が完了していること（完了済み）
- SkillExecutorのexecuteWithRetryメソッドの構造を理解していること

### 3.2 依存タスク

| タスクID             | タスク名                       | ステータス |
| -------------------- | ------------------------------ | ---------- |
| TASK-SKILL-RETRY-001 | SkillExecutor リトライ機構実装 | 完了       |

### 3.3 必要な知識

- サーキットブレーカーパターン（Martin Fowler）
- 状態マシン設計
- TypeScript クラス設計
- SkillExecutorのexecuteWithRetryメソッドの内部構造
- RetryableErrorType（network、rate_limit、server_error、timeout）

### 3.4 推奨アプローチ

#### CircuitBreakerクラス設計

```typescript
type CircuitState = "closed" | "open" | "half_open";

interface CircuitBreakerConfig {
  failureThreshold: number; // Open状態に遷移する連続失敗数（デフォルト: 5）
  resetTimeoutMs: number; // Open→Half-Openの待機時間（デフォルト: 60000ms）
  halfOpenMaxAttempts: number; // Half-Open状態での最大試行数（デフォルト: 1）
}

class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenAttempts: number = 0;

  canExecute(): boolean {
    /* ... */
  }
  recordSuccess(): void {
    /* ... */
  }
  recordFailure(): void {
    /* ... */
  }
  getState(): CircuitState {
    /* ... */
  }
}
```

#### 状態遷移ルール

1. **Closed → Open**: failureCount >= failureThreshold
2. **Open → Half-Open**: 現在時刻 - lastFailureTime >= resetTimeoutMs
3. **Half-Open → Closed**: 試行が成功
4. **Half-Open → Open**: 試行が失敗

#### SkillExecutorとの統合

```typescript
// executeWithRetry内の先頭で
if (!this.circuitBreaker.canExecute()) {
  throw new CircuitOpenError("Circuit breaker is open");
}

// リトライ成功時
this.circuitBreaker.recordSuccess();

// リトライ全失敗時
this.circuitBreaker.recordFailure();
```

---

## 4. 実行手順

### Phase構成

3フェーズ構成（設計・実装・統合タスク）

### Phase 1: CircuitBreakerクラス実装

#### 目的

独立したCircuitBreakerクラスを実装する

#### 手順

1. `CircuitBreaker`クラスを作成
2. 3つの状態（Closed / Open / Half-Open）を実装
3. `canExecute()`メソッドを実装（実行可否判定）
4. `recordSuccess()`メソッドを実装（成功記録）
5. `recordFailure()`メソッドを実装（失敗記録）
6. `getState()`メソッドを実装（現在状態取得）
7. `reset()`メソッドを実装（手動リセット）
8. 単体テストを作成（状態遷移の全パターンをカバー）

#### 成果物

- `apps/desktop/src/main/services/skill/CircuitBreaker.ts`
- `apps/desktop/src/main/services/skill/__tests__/CircuitBreaker.test.ts`

#### 完了条件

- 状態遷移が仕様通りに動作する
- テストがすべてパスする
- テストカバレッジが90%以上

### Phase 2: SkillExecutor統合

#### 目的

CircuitBreakerをSkillExecutorのexecuteWithRetryに統合する

#### 手順

1. SkillExecutorコンストラクタにCircuitBreakerインスタンスを追加
2. `executeWithRetry`メソッドの先頭に`canExecute()`チェックを追加
3. リトライ全成功時に`recordSuccess()`を呼び出す
4. リトライ全失敗時に`recordFailure()`を呼び出す
5. CircuitOpenError時のストリーミングメッセージを実装
6. 統合テストを作成

#### 成果物

- SkillExecutor.tsの変更差分
- 統合テスト

#### 完了条件

- CircuitBreakerがSkillExecutorと正しく連携する
- Open状態でリクエストが即座に拒否される
- 既存のリトライテストが壊れない

### Phase 3: 動作確認・ドキュメント

#### 目的

全体の統合動作を確認する

#### 手順

1. 連続失敗 → Open状態 → Half-Open状態 → 回復のシナリオテスト
2. 既存のリトライテストの回帰確認
3. error-handling.mdの「将来対応」セクションを更新

#### 成果物

- テスト結果レポート
- error-handling.mdの更新差分

#### 完了条件

- シナリオテストが成功する
- 既存テストが壊れていない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] CircuitBreakerクラスが実装されている
- [ ] Closed / Open / Half-Openの3状態が正しく遷移する
- [ ] 連続失敗閾値超過でOpen状態になる
- [ ] resetTimeout経過後にHalf-Open状態になる
- [ ] Half-Open状態での成功でClosed状態に復帰する
- [ ] SkillExecutorのexecuteWithRetryと統合されている
- [ ] Open状態ではリクエストが即座にエラーを返す

### 品質要件

- [ ] CircuitBreakerの単体テストがすべてパスする
- [ ] 統合テストがすべてパスする
- [ ] 既存のリトライテストが壊れていない
- [ ] TypeScript型エラーが発生しない
- [ ] テストカバレッジが90%以上

### ドキュメント要件

- [ ] CircuitBreakerクラスにJSDocコメントが記載されている
- [ ] 状態遷移図がコメントで説明されている
- [ ] error-handling.mdの関連セクションが更新されている

---

## 6. 検証方法

### テストケース

| No. | テストケース                     | 期待結果                                 |
| --- | -------------------------------- | ---------------------------------------- |
| 1   | 5回連続失敗                      | CircuitBreakerがOpen状態に遷移する       |
| 2   | Open状態でcanExecute()を呼び出し | falseが返る                              |
| 3   | Open状態でresetTimeoutMs経過後   | Half-Open状態に遷移する                  |
| 4   | Half-Open状態で実行成功          | Closed状態に復帰する                     |
| 5   | Half-Open状態で実行失敗          | Open状態に戻る                           |
| 6   | Closed状態で成功→失敗→成功       | failureCountがリセットされる             |
| 7   | Open状態でSkillExecutorを実行    | リトライせず即座にCircuitOpenErrorを返す |
| 8   | reset()を呼び出し                | Closed状態に戻り、failureCountが0になる  |

### 検証手順

1. CircuitBreakerの単体テストを実行し全パスを確認
2. SkillExecutor統合テストを実行し連携を確認
3. 既存のSkillExecutor.retry.test.tsが壊れていないことを確認
4. 手動でAPI障害を模擬しサーキットブレーカーの動作を確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                         |
| -------------------------------------- | ------ | -------- | -------------------------------------------- |
| 閾値設定が厳しすぎて正常時にOpenになる | 高     | 中       | 適切なデフォルト値設定、設定可能にする       |
| 既存リトライ機構との競合               | 高     | 低       | 明確な責務分離（CB→リトライの順序）          |
| メモリ内状態がアプリ再起動で消失       | 低     | 高       | 初期状態はClosedで問題なし、永続化は将来対応 |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` - executeWithRetry、RetryableErrorType
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - サーキットブレーカー（将来対応）セクション

### 参考資料

- Martin Fowler - Circuit Breaker Pattern: https://martinfowler.com/bliki/CircuitBreaker.html
- Microsoft - Circuit Breaker Pattern: https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
TASK-SKILL-RETRY-001 Phase 11 スコープ外発見事項 + error-handling.md「将来対応」セクション:
同一エンドポイント障害時にmaxRetries分の無駄なリクエストが毎回発生する。
連続失敗時にリクエスト自体を一時停止するサーキットブレーカーが未実装。
```

### 補足事項

- サーキットブレーカーはリトライの前段に配置する（CB判定 → リトライ実行の順序）
- 将来的にエンドポイント別（APIプロバイダ別）のサーキットブレーカーに拡張可能な設計にすること
- 状態の永続化は本タスクのスコープ外だが、インターフェースは拡張可能にしておくこと
